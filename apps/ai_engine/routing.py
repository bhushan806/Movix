import networkx as nx
import math
from typing import List, Dict, Tuple

class RouteOptimizer:
    def __init__(self):
        self.graph = nx.Graph()
        # In a real scenario, we would load the roadmap from OpenStreetMap (OSM) or a database
        self._build_mock_graph()

    def _build_mock_graph(self):
        """Builds a sample graph for demonstration."""
        # Nodes: Cities/Junctions (lat, lng)
        nodes = {
            "Mumbai": (19.0760, 72.8777),
            "Pune": (18.5204, 73.8567),
            "Nasik": (19.9975, 73.7898),
            "Surat": (21.1702, 72.8311),
            "Thane": (19.2183, 72.9781)
        }
        
        for name, coords in nodes.items():
            self.graph.add_node(name, pos=coords)

        # Edges: Roads with attributes
        # distance (km), road_quality (1=Bad, 10=Highway), traffic_index (1=Clear, 10=Jam)
        edges = [
            ("Mumbai", "Thane", {"distance": 25, "road_quality": 8, "traffic": 9}),
            ("Thane", "Nasik", {"distance": 150, "road_quality": 7, "traffic": 5}),
            ("Thane", "Pune", {"distance": 140, "road_quality": 9, "traffic": 6}), # Expressway
            ("Mumbai", "Pune", {"distance": 150, "road_quality": 4, "traffic": 8}), # Old Ghat Road (Bad quality)
            ("Nasik", "Surat", {"distance": 200, "road_quality": 6, "traffic": 4})
        ]

        for u, v, data in edges:
            self.graph.add_edge(u, v, **data)

    def _cost_function(self, u, v, edge_attr):
        """
        Custom Cost Function for A*
        Optimize for: Time (Primary) + Fuel Efficiency (Secondary) + Road Safety (Tertiary)
        """
        distance = edge_attr.get("distance", 1)
        quality = edge_attr.get("road_quality", 5) # 1-10
        traffic = edge_attr.get("traffic", 5) # 1-10

        # Calculate Estimated Time (Distance / Avg Speed)
        # Avg speed affected by traffic and quality
        base_speed = 60 # km/h
        speed_factor = (quality / 10) * (1 - (traffic / 20)) # simple modifier
        estimated_speed = base_speed * max(0.2, speed_factor)
        
        time_hours = distance / estimated_speed

        # Fuel Penalty (Hilly/Bad roads consume more)
        # Low quality = High fuel cost
        fuel_penalty = (10 - quality) * 0.5 

        # Final Weight = Time + 20% of Distance (Fuel) + Penalty
        weight = time_hours + (distance * 0.05) + fuel_penalty
        return weight

    def _heuristic(self, u, v):
        """Heuristic for A*: Straight line distance (Haversine) / Max Speed"""
        pos_u = self.graph.nodes[u]['pos']
        pos_v = self.graph.nodes[v]['pos']
        
        # Simple Euclidean for demo (approx sufficient for A* heuristic on small scale)
        d = math.sqrt((pos_u[0]-pos_v[0])**2 + (pos_u[1]-pos_v[1])**2) * 111 # ~111km per degree
        
        max_speed = 100 # km/h
        return d / max_speed

    def calculate_optimal_route(self, start_node: str, end_node: str) -> Dict[str, Any]:
        """
        Returns the best path using A* Algorithm with Multi-Objective Cost Function.
        """
        try:
            path = nx.astar_path(
                self.graph, 
                start_node, 
                end_node, 
                heuristic=self._heuristic, 
                weight=self._cost_function
            )
            
            # Calculate total metrics for the path
            total_dist = 0
            total_expected_time = 0
            
            for i in range(len(path)-1):
                u, v = path[i], path[i+1]
                edge = self.graph[u][v]
                total_dist += edge['distance']
                # Re-calculate partial time for summary
                cost = self._cost_function(u, v, edge)
                total_expected_time += cost # Approximation from weight
            
            return {
                "route": path,
                "total_distance_km": total_dist,
                "optimization_score": round(total_expected_time, 2),
                "steps": len(path)
            }
            
        except nx.NetworkXNoPath:
            return {"error": "No path found"}
        except Exception as e:
            return {"error": str(e)}

# Example Usage
if __name__ == "__main__":
    optimizer = RouteOptimizer()
    
    # Example: Mumbai to Pune
    # Should choose Thane -> Pune (Expressway) over Mumbai -> Pune (Old Road) due to quality
    route = optimizer.calculate_optimal_route("Mumbai", "Pune")
    print("Optimal Route:", route)
