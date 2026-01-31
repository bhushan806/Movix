'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MapComponent from '@/components/map/Map';
import api from '@/lib/api';

export default function CustomerDashboard() {
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [estimate, setEstimate] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleGetEstimate = async () => {
        setLoading(true);
        try {
            // Geocode source
            const sourceRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(source)}`);
            const sourceData = await sourceRes.json();
            if (!sourceData || sourceData.length === 0) throw new Error('Source not found');
            const sourceLat = parseFloat(sourceData[0].lat);
            const sourceLon = parseFloat(sourceData[0].lon);

            // Geocode destination
            const destRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`);
            const destData = await destRes.json();
            if (!destData || destData.length === 0) throw new Error('Destination not found');
            const destLat = parseFloat(destData[0].lat);
            const destLon = parseFloat(destData[0].lon);

            // Get route from OSRM
            const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${sourceLon},${sourceLat};${destLon},${destLat}?overview=false`);
            const routeData = await routeRes.json();

            if (routeData.code !== 'Ok' || !routeData.routes || routeData.routes.length === 0) {
                throw new Error('Route not found');
            }

            const distanceMeters = routeData.routes[0].distance;
            const distanceKm = Math.round(distanceMeters / 1000);

            const res = await api.post('/rides/estimate', {
                distance: distanceKm,
                vehicleType: 'Truck'
            });

            setEstimate({
                ...res.data.data,
                sourceLat,
                sourceLon,
                destLat,
                destLon
            });
        } catch (error) {
            console.error(error);
            alert('Failed to get estimate. Please check locations.');
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async () => {
        if (!estimate) return;
        try {
            await api.post('/rides/book', {
                source,
                destination,
                distance: estimate.distance,
                price: estimate.price,
                pickupLat: estimate.sourceLat,
                pickupLng: estimate.sourceLon,
                dropLat: estimate.destLat,
                dropLng: estimate.destLon,
                vehicleType: 'Truck'
            });
            alert('Ride booked successfully! Waiting for driver...');
        } catch (error) {
            alert('Booking failed');
        }
    };

    return (
        <div className="container py-8 space-y-8">
            <h1 className="text-3xl font-bold">Customer Dashboard</h1>

            <div className="grid md:grid-cols-2 gap-8 h-[600px]">
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Book a Truck</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Pickup Location</label>
                            <Input
                                placeholder="Enter city or address"
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Drop Location</label>
                            <Input
                                placeholder="Enter city or address"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                            />
                        </div>

                        <Button onClick={handleGetEstimate} disabled={loading || !source || !destination} className="w-full">
                            {loading ? 'Calculating...' : 'Get Estimate'}
                        </Button>

                        {estimate && (
                            <div className="p-4 bg-muted rounded-lg space-y-2">
                                <div className="flex justify-between">
                                    <span>Distance:</span>
                                    <span className="font-bold">{estimate.distance} km</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Estimated Price:</span>
                                    <span className="font-bold text-green-600">₹{estimate.price}</span>
                                </div>
                                <Button onClick={handleBook} className="w-full mt-2" variant="default">
                                    Confirm Booking
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="h-full rounded-lg overflow-hidden border">
                    <MapComponent />
                </div>
            </div>


            {/* Active Shipments Tracking */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">My Active Shipments</h2>
                <ActiveRidesList />
            </div>
        </div >
    );
}

function ActiveRidesList() {
    const [rides, setRides] = useState<any[]>([]);

    useEffect(() => {
        const fetchRides = async () => {
            try {
                const res = await api.get('/rides/my-rides');
                setRides(res.data.data);
            } catch (error) {
                console.error('Failed to fetch rides', error);
            }
        };
        fetchRides();
    }, []);

    if (rides.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    No active shipments found. Book a ride to see it here.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rides.map((ride) => (
                <Card key={ride.id || ride._id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-base font-semibold">
                                {ride.source} ➝ {ride.destination}
                            </CardTitle>
                            <Badge variant={ride.status === 'COMPLETED' ? 'default' : 'secondary'}>
                                {ride.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Price:</span>
                            <span className="font-bold">₹{ride.price}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Distance:</span>
                            <span>{ride.distance} km</span>
                        </div>
                        {ride.driverId && (
                            <div className="pt-2 border-t mt-2">
                                <p className="font-semibold mb-1">Driver Details</p>
                                <p>{ride.driverId.user?.name || 'Assigned'}</p>
                                <p className="text-xs text-muted-foreground">{ride.vehicleId?.number}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
