from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import math
import random
from datetime import datetime

app = FastAPI(title="TruckNet AI Engine", version="1.0.0")

# --- Data Models ---

class Location(BaseModel):
    lat: float
    lng: float

class LoadRequest(BaseModel):
    load_id: str
    origin: Location
    destination: Location
    weight: float
    goods_type: str

class Driver(BaseModel):
    driver_id: str
    location: Location
    rating: float
    vehicle_type: str
    is_available: bool

class MatchResponse(BaseModel):
    driver_id: str
    score: float
    distance_km: float

class PriceRequest(BaseModel):
    distance_km: float
    weight: float
    vehicle_type: str
    origin_city: str

class PriceResponse(BaseModel):
    total_price: float
    base_fare: float
    surge_multiplier: float
    breakdown: dict

# --- Core Logic ---

def calculate_distance(loc1: Location, loc2: Location) -> float:
    # Haversine formula for distance
    R = 6371  # Earth radius in km
    dlat = math.radians(loc2.lat - loc1.lat)
    dlon = math.radians(loc2.lng - loc1.lng)
    a = math.sin(dlat/2) * math.sin(dlat/2) + \
        math.cos(math.radians(loc1.lat)) * math.cos(math.radians(loc2.lat)) * \
        math.sin(dlon/2) * math.sin(dlon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

# --- Core Engines ---
from matching import MatchingEngine
from routing import RouteOptimizer

matching_engine = MatchingEngine()
route_optimizer = RouteOptimizer()

# --- Endpoints ---

# --- Endpoint Classes Update ---
class EtaRequest(BaseModel):
    base_time: float # in minutes
    weather_condition: str # Rain, Storm, Clear
    vehicle_type: str # Heavy Truck, etc.

class EtaResponse(BaseModel):
    adjusted_eta: float
    base_time: float
    adjustment_factor: float
    details: str

class SosRequest(BaseModel):
    lat: float
    lng: float

class SosResponse(BaseModel):
    alert: str
    nearest_hospital: dict
    nearest_police: dict

# --- Endpoints ---

@app.get("/")
def health_check():
    return {"status": "healthy", "service": "TruckNet AI Engine"}

@app.post("/match", response_model=List[MatchResponse])
def smart_matching(load: LoadRequest, available_drivers: List[Driver]):
    """
    Feature 2: Truck Owner AI (Smart Load Matching)
    """
    # Convert Pydantic models to dicts
    load_dict = load.model_dump()
    # Mock destination_city for backhaul logic if not in model
    # Ideally should be passed in LoadRequest
    load_dict["destination_city"] = "Pune" # Mocking for demo as "Pune" unless specified
    
    drivers_dict = [d.model_dump() for d in available_drivers]
    
    # Run Engine
    results = matching_engine.match_driver_to_load(load_dict, drivers_dict)
    
    # Convert back to Response Model
    response = []
    for r in results:
        response.append(MatchResponse(
            driver_id=r["driver_id"],
            score=r["total_score"],
            distance_km=r["details"]["distance_km"]
        ))
        
    return response

@app.post("/predict-eta", response_model=EtaResponse)
def calculate_smart_eta(req: EtaRequest):
    """
    Feature 1: Customer AI (Predictive ETA)
    Logic:
    - Rain: +15%
    - Storm: +40%
    - Heavy Truck: +10%
    """
    base = req.base_time
    multiplier = 1.0
    reason = []

    if req.weather_condition.lower() == "rain":
        multiplier += 0.15
        reason.append("Weather (Rain) +15%")
    elif req.weather_condition.lower() == "storm":
        multiplier += 0.40
        reason.append("Weather (Storm) +40%")
        
    if req.vehicle_type.lower() == "heavy truck":
        multiplier += 0.10
        reason.append("Vehicle (Heavy Truck) +10%")
        
    adjusted = base * multiplier
    
    return EtaResponse(
        adjusted_eta=round(adjusted, 0),
        base_time=base,
        adjustment_factor=multiplier,
        details=", ".join(reason) if reason else "Standard Conditions"
    )

@app.post("/trigger-sos", response_model=SosResponse)
def trigger_smart_sos(req: SosRequest):
    """
    Feature 3: Driver AI (Smart SOS & Safety)
    Logic: Mock search for hospital/police and return formatted alert.
    """
    # Mock nearest locations based on lat/lng (randomized for demo effect)
    hospital_dist = 2.0
    police_dist = 3.0
    
    hospital_name = "City General Hospital"
    police_station = "Central Police Station"
    
    alert_msg = f"SOS at [{req.lat}, {req.lng}]. Nearest Hospital: {hospital_name} ({hospital_dist}km away). Nearest Police: {police_station} ({police_dist}km away)."
    
    return SosResponse(
        alert=alert_msg,
        nearest_hospital={"name": hospital_name, "distance": hospital_dist},
        nearest_police={"name": police_station, "distance": police_dist}
    )

@app.post("/predict-price", response_model=PriceResponse)
def dynamic_pricing(req: PriceRequest):
    """
    Module 3: Dynamic Pricing Engine (Existing)
    """
    base_rates = {"Mumbai": 20, "Delhi": 18, "Bangalore": 22, "Pune": 19}
    base_rate_per_km = base_rates.get(req.origin_city, 20)
    base_fare = base_rate_per_km * req.distance_km
    
    current_hour = datetime.now().hour
    surge = 1.0
    if 8 <= current_hour <= 11 or 17 <= current_hour <= 21:
        surge += 0.5
    
    total_price = (base_fare * surge) * (1.2 if req.weight > 5 else 1.0)
    
    return PriceResponse(
        total_price=round(total_price, 2),
        base_fare=round(base_fare, 2),
        surge_multiplier=round(surge, 2),
        breakdown={"rate": base_rate_per_km, "dist": req.distance_km}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
