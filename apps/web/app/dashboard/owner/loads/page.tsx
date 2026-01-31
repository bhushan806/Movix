'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MapPin, Calendar, Truck, User, Package } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function FindLoadsPage() {
    const [rides, setRides] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState<string | null>(null);
    const [selectedDriver, setSelectedDriver] = useState<string>('');
    const [selectedRide, setSelectedRide] = useState<any>(null);
    const [scoredDrivers, setScoredDrivers] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ridesRes, driversRes] = await Promise.all([
                api.get('/rides/available'),
                api.get('/driver/all')
            ]);
            setRides(ridesRes.data.data);
            setDrivers(driversRes.data.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAssign = async (ride: any) => {
        setSelectedRide(ride);
        setScoredDrivers([]); // Reset
        setSelectedDriver(''); // Reset selection

        try {
            // Feature 2: Call AI to get scored drivers
            const res = await api.post('/ai/match', {
                load: {
                    origin: { lat: 18.5204, lng: 73.8567 }, // Mock origin if not in ride
                    destination: { lat: 19.0760, lng: 72.8777 }, // Mock dest if not in ride
                    weight: ride.weight || 10,
                    destination_city: ride.destination // Passing city name for backhaul logic
                },
                drivers: drivers.map(d => ({
                    ...d,
                    driver_id: d.id,
                    currentLat: d.currentLat || 18.5200,
                    currentLng: d.currentLng || 73.8500,
                    // Ensure lat/lng structure matches what python expects
                    location: { lat: d.currentLat || 18.5200, lng: d.currentLng || 73.8500 },
                    capacity: d.vehicle?.capacity || 10,
                    rating: d.rating || 4.5,
                    home_city: d.address?.city || 'Pune' // Mock home city
                }))
            });

            if (res.data.status === 'success') {
                setScoredDrivers(res.data.data);
            } else {
                // Fallback to unsorted
                setScoredDrivers(drivers.map(d => ({ driver_data: d, total_score: 0 })));
            }
        } catch (error) {
            console.error("AI Match Failed", error);
            // Fallback
            setScoredDrivers(drivers.map(d => ({ driver_data: d, total_score: 0 })));
        }
    };

    const handleAssign = async () => {
        if (!selectedDriver || !selectedRide) return;
        setAssigning(selectedRide.id || selectedRide._id);
        try {
            await api.post(`/rides/${selectedRide.id || selectedRide._id}/assign`, { driverId: selectedDriver });
            alert('Driver assigned successfully!');
            fetchData();
            setSelectedRide(null);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to assign driver');
        } finally {
            setAssigning(null);
        }
    };

    return (
        <div className="container py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-1">
                <Link href="/dashboard/owner" className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold">Find Loads</h1>
                <p className="text-muted-foreground">Browse and accept available shipments from customers.</p>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading available loads...</div>
            ) : rides.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No Available Loads</h3>
                    <p className="text-muted-foreground">There are no pending shipments at the moment.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {rides.map((ride) => (
                        <Card key={ride.id || ride._id} className="hover:shadow-lg transition-all border-l-4 border-l-blue-500">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <Truck className="h-3 w-3" />
                                        {ride.vehicleType || 'Truck'}
                                    </Badge>
                                    <span className="font-bold text-lg text-green-600">₹{ride.price}</span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-green-500 mt-1" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Pickup</p>
                                            <p className="font-medium">{ride.source}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-red-500 mt-1" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Drop</p>
                                            <p className="font-medium">{ride.destination}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Today
                                    </span>
                                    <span>{ride.distance} km</span>
                                </div>

                                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleOpenAssign(ride)}>
                                    Accept & Assign Driver
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* AI Smart Matching Dialog */}
            <Dialog open={!!selectedRide} onOpenChange={(open) => !open && setSelectedRide(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Assign Driver (AI Powered)</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Best Match Driver</label>
                            <Select onValueChange={setSelectedDriver}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a driver..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {scoredDrivers.map((item) => {
                                        const driver = item.driver_data || item;
                                        const score = item.score || item.total_score || 0;
                                        return (
                                            <SelectItem key={driver.id} value={driver.id}>
                                                <div className="flex items-center justify-between w-full min-w-[300px]">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4" />
                                                        <span>{driver.user?.name || 'Unknown Driver'}</span>
                                                    </div>
                                                    {score > 0 && (
                                                        <Badge variant={score > 80 ? "default" : "secondary"} className={score > 80 ? "bg-green-600 ml-2" : "ml-2"}>
                                                            {score}% Match
                                                        </Badge>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            className="w-full"
                            onClick={handleAssign}
                            disabled={!selectedDriver || assigning === (selectedRide?.id || selectedRide?._id)}
                        >
                            {assigning ? 'Assigning...' : 'Confirm Assignment'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
