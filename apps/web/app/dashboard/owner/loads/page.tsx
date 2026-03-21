'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    ArrowLeft, 
    MapPin, 
    Calendar, 
    Truck, 
    User, 
    Package, 
    Weight, 
    Map as MapIcon, 
    List, 
    Search, 
    Filter, 
    Star,
    Bell,
    CheckCircle2,
    Clock,
    ChevronRight,
    Bookmark,
    Plus
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useUX } from '@/lib/ux-context';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadPostForm } from '@/components/loads/LoadPostForm';
import { SavedFilters } from '@/components/loads/SavedFilters';
import { cn } from '@/lib/utils';

export default function OwnerLoadsPage() {
    const { demoDataEnabled } = useUX();
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [openLoads, setOpenLoads] = useState<any[]>([]);
    const [myLoads, setMyLoads] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [acceptingId, setAcceptingId] = useState<string | null>(null);
    const [assigning, setAssigning] = useState<string | null>(null);
    const [selectedDriver, setSelectedDriver] = useState<string>('');
    const [selectedLoad, setSelectedLoad] = useState<any>(null);
    const [assignMode, setAssignMode] = useState(false);
    const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

    useEffect(() => {
        fetchData();
        
        // UX Enhancement: Real-time notification simulation
        const timer = setTimeout(() => {
            toast.info("New Load Found!", {
                description: "Pune to Hyderabad • 12 tonnes • ₹ 32,000",
                action: {
                    label: "View",
                    onClick: () => setViewMode('list')
                }
            });
        }, 5000);
        
        return () => clearTimeout(timer);
    }, [demoDataEnabled]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Simulate network delay for skeletons
            await new Promise(r => setTimeout(r, 600));

            if (demoDataEnabled) {
                const mockOpen = [
                    { id: '1', source: 'Mumbai', destination: 'Delhi', price: 45000, weight: 15, goodsType: 'Electronics', vehicleType: 'Container', distance: 1400 },
                    { id: '2', source: 'Bangalore', destination: 'Chennai', price: 12000, weight: 8, goodsType: 'Furniture', vehicleType: 'Open Truck', distance: 350 },
                    { id: '3', source: 'Kolkata', destination: 'Patna', price: 18000, weight: 12, goodsType: 'Steel Rods', vehicleType: 'Trailer', distance: 580 },
                    { id: '4', source: 'Ahmedabad', destination: 'Jaipur', price: 21000, weight: 10, goodsType: 'Textiles', vehicleType: 'Container', distance: 670 }
                ];
                setOpenLoads(mockOpen);
                setMyLoads([]);
                setDrivers([{ id: 'd1', user: { name: 'Raj Kumar' }, rating: 4.8 }]);
            } else {
                const [openRes, myRes, driversRes] = await Promise.all([
                    api.get('/loads/open'),
                    api.get('/loads/owner-loads'),
                    api.get('/driver/my-drivers')
                ]);
                setOpenLoads(Array.isArray(openRes.data.data) ? openRes.data.data : []);
                setMyLoads(Array.isArray(myRes.data.data) ? myRes.data.data : []);
                setDrivers(Array.isArray(driversRes.data.data) ? driversRes.data.data : []);
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
            toast.error("Network error. Using offline data.");
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptLoad = async (loadId: string) => {
        if (acceptingId) return;
        setAcceptingId(loadId);
        try {
            await api.post(`/loads/${loadId}/accept`);
            toast.success('Load accepted!', {
                description: 'You can now assign a driver to this load.'
            });
            fetchData();
        } catch (error: any) {
             toast.error(error.response?.data?.message || 'Failed to accept load');
        } finally {
            setAcceptingId(null);
        }
    };

    const savedFilters = [
        { name: 'Mumbai Routes', count: 12 },
        { name: 'High Value (>₹40k)', count: 5 },
        { name: 'Container Only', count: 8 }
    ];

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-24 px-4 sm:px-0">
            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-[72px] z-20">
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-full lg:w-auto overflow-x-auto scrollbar-hide">
                    <Button 
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                        onClick={() => setViewMode('list')}
                        className={cn("flex-1 lg:flex-none h-10 px-4 rounded-lg font-bold gap-2 whitespace-nowrap", viewMode === 'list' && "bg-white shadow-sm")}
                    >
                        <List className="h-4 w-4" /> List
                    </Button>
                    <Button 
                        variant={viewMode === 'map' ? 'secondary' : 'ghost'} 
                        onClick={() => setViewMode('map')}
                        className={cn("flex-1 lg:flex-none h-10 px-4 rounded-lg font-bold gap-2 whitespace-nowrap", viewMode === 'map' && "bg-white shadow-sm")}
                    >
                        <MapIcon className="h-4 w-4" /> Map
                    </Button>
                </div>

                <div className="flex items-center gap-2 w-full lg:max-w-xl">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500" />
                        <input 
                            placeholder="Search by city, goods..." 
                            className="w-full bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-100 rounded-xl pl-10 pr-4 py-3 text-sm transition-all"
                        />
                    </div>
                    <Button variant="outline" className="h-12 w-12 rounded-xl p-0 border-slate-200 hover:bg-slate-50 shrink-0">
                        <Filter className="h-5 w-5 text-slate-500" />
                    </Button>
                </div>

                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => setIsPostDialogOpen(true)}
                        className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Post New Load
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Sidebar - Filters & Context */}
                <div className="hidden lg:block space-y-6">
                    <Card className="border-none shadow-sm bg-white p-6 rounded-[2rem]">
                        <SavedFilters />
                    </Card>

                    <Card className="border-none shadow-sm bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white overflow-hidden relative group">
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10">
                            <h4 className="font-bold mb-2">TruckNet Dost 🤖</h4>
                            <p className="text-xs text-blue-100 leading-relaxed mb-4">
                                "I see high demand in Nagpur today. You might want to reposition 2 trucks there for better margins."
                            </p>
                            <Button className="w-full bg-white text-blue-600 font-bold rounded-xl text-xs h-10 hover:bg-blue-50 transition-colors">
                                Chat with Dost
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Main View Area */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        {viewMode === 'map' ? (
                            <motion.div 
                                key="map"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.3 }}
                                className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white h-[400px] sm:h-[600px] lg:h-[700px] bg-slate-100"
                            >
                                <img 
                                    src="/logistics_map_view_1774026108992.png" 
                                    alt="Live Logistics Map" 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-6 left-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 space-y-3 w-64 animate-in slide-in-from-left-4">
                                    <h4 className="text-sm font-bold text-slate-900 border-b pb-2">Live Activity</h4>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500 font-medium">Active Loads</span>
                                        <span className="font-bold text-blue-600">42</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500 font-medium">Your Vehicles</span>
                                        <span className="font-bold text-emerald-600">8</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
                                        <div className="h-full bg-blue-500 w-1/3 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                    </div>
                                </div>
                                <div className="absolute bottom-6 right-6 flex gap-2">
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl h-12 px-6 font-bold flex items-center gap-2">
                                        <Truck className="h-4 w-4" /> Manage Fleet
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid gap-6 md:grid-cols-2"
                            >
                                {loading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <Card key={i} className="p-6 space-y-4 rounded-3xl border-none shadow-sm bg-white">
                                            <div className="flex justify-between">
                                                <Skeleton className="h-6 w-24 rounded-full" />
                                                <Skeleton className="h-6 w-16" />
                                            </div>
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-3/4" />
                                                <Skeleton className="h-4 w-1/2" />
                                            </div>
                                            <Skeleton className="h-12 w-full rounded-2xl" />
                                        </Card>
                                    ))
                                ) : openLoads.map((load) => (
                                    <Card key={load.id} className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-none shadow-sm bg-white rounded-3xl overflow-hidden flex flex-col">
                                        <div className="p-6 flex-1">
                                            <div className="flex justify-between items-start mb-6">
                                                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest">
                                                    {load.vehicleType}
                                                </Badge>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-slate-900 leading-none">₹ {load.price.toLocaleString()}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">Best Offer</p>
                                                </div>
                                            </div>
                                            
                                            <div className="relative pl-6 space-y-6 before:absolute before:left-[10px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 before:border-dashed before:border-l">
                                                <div className="relative">
                                                    <div className="absolute -left-[20px] top-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pickup</p>
                                                    <p className="font-bold text-slate-900 text-lg">{load.source}</p>
                                                </div>
                                                <div className="relative">
                                                    <div className="absolute -left-[20px] top-1 h-3 w-3 rounded-full bg-red-500 border-2 border-white shadow-sm" />
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Destination</p>
                                                    <p className="font-bold text-slate-900 text-lg">{load.destination}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-50">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                                                        <Package className="h-3.5 w-3.5 text-blue-500" /> Goods
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-900">{load.goodsType}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                                                        <Weight className="h-3.5 w-3.5 text-orange-500" /> Tonnage
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-900">{load.weight} Tonnes</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-slate-50 group-hover:bg-blue-600 transition-colors">
                                            <Button 
                                                className="w-full bg-white text-slate-800 hover:bg-slate-100 font-black h-14 rounded-2xl shadow-sm group-hover:shadow-none transition-all group-hover:scale-[0.98]"
                                                onClick={() => handleAcceptLoad(load.id)}
                                                disabled={!!acceptingId}
                                            >
                                                {acceptingId === load.id ? 'Securing Load...' : 'ACCEPT THIS LOAD'}
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Load Posting Wizard */}
            <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
                <DialogContent className="max-w-4xl p-0 border-none bg-transparent shadow-none overflow-visible">
                    <DialogTitle className="sr-only">Post a New Load</DialogTitle>
                    <DialogDescription className="sr-only">
                        Step-by-step wizard to register a new cargo shipment on the marketplace.
                    </DialogDescription>
                    <LoadPostForm onSuccess={() => {
                        setIsPostDialogOpen(false);
                        fetchData();
                    }} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
