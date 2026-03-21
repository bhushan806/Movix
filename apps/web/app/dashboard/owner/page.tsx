'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
    Truck, 
    Activity, 
    Wrench, 
    Plus, 
    ChevronRight, 
    Home, 
    Search, 
    Filter,
    MoreVertical,
    Calendar,
    MapPin,
    ArrowUpRight,
    ArrowRight,
    CheckCircle2,
    Clock,
    AlertCircle,
    Users,
    TrendingUp,
    ShieldCheck,
    RotateCcw,
    BarChart3,
    MessageSquare
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useUX } from '@/lib/ux-context';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertBanner } from '@/components/dashboard/AlertBanner';
import { InsightCard } from '@/components/dashboard/InsightCard';

export default function OwnerDashboard() {
    const { user } = useAuth();
    const { demoDataEnabled, setDemoDataEnabled } = useUX();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        onRoad: 0,
        available: 0,
        maintenance: 0
    });
    const [selectedStat, setSelectedStat] = useState<any>(null);

    const calculateStats = (data: any[]) => {
        setStats({
            total: data.length || 0,
            onRoad: data.filter((v: any) => v.status === 'ON_TRIP' || v.status === 'BUSY').length,
            available: data.filter((v: any) => v.status === 'AVAILABLE').length,
            maintenance: data.filter((v: any) => v.status === 'MAINTENANCE').length
        });
    };

    const fetchVehicles = async () => {
        try {
            setIsLoading(true);
            
            if (demoDataEnabled) {
                const mockData = [
                    { id: '1', name: 'MH 12 AB 1234', status: 'ON_TRIP' },
                    { id: '2', name: 'MH 12 CD 5678', status: 'AVAILABLE' },
                    { id: '3', name: 'KA 01 EF 9012', status: 'MAINTENANCE' },
                    { id: '4', name: 'DL 01 GH 3456', status: 'ON_TRIP' }
                ];
                setVehicles(mockData);
                calculateStats(mockData);
            } else {
                const res = await api.get('/vehicles');
                const data = res.data.data;
                setVehicles(data);
                calculateStats(data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load fleet data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, [demoDataEnabled]);

    const recentTrips = [
        { id: "TRP-8802", from: "Mumbai", to: "Bangalore", driver: "Rajesh Kumar", status: "In Transit", eta: "4h 20m", color: "blue" },
        { id: "TRP-8795", from: "Delhi", to: "Jaipur", driver: "Amit Singh", status: "Loading", eta: "1h 15m", color: "orange" },
        { id: "TRP-8790", from: "Pune", to: "Mumbai", driver: "Suresh P.", status: "Delivered", eta: "Completed", color: "green" },
        { id: "TRP-8788", from: "Chennai", to: "Hyderabad", driver: "Karthik R.", status: "Delayed", eta: "6h 45m", color: "red" },
    ];

    const alerts = [
        { id: 1, type: 'warning' as const, text: 'Vehicle MH 12 AB 1234 insurance expires in 4 days', action: 'Renew Now' },
        { id: 2, type: 'maintenance' as const, text: '2 vehicles are due for scheduled maintenance', action: 'Schedule' }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Intelligent Alerts Section */}
            <div className="space-y-4">
                {alerts.map((alert) => (
                    <AlertBanner 
                        key={alert.id}
                        type={alert.type as any}
                        message={alert.text}
                        actionLabel={alert.action}
                        onAction={() => toast.success(`Action: ${alert.action}`)}
                    />
                ))}
            </div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-1">
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest">
                            {user?.role || 'OWNER'} SESSIONS
                        </Badge>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                            <Clock className="h-3 w-3" />
                            Updated 2 mins ago
                        </div>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                        {user?.name ? `Namaste, ${user.name.split(' ')[0]}! 🚛` : 'Owner Dashboard'}
                    </h1>
                    <p className="text-lg text-slate-500 font-medium">
                        Your fleet is <span className="text-emerald-600 font-bold">85% active</span> today. You've earned <span className="text-slate-900 font-black">₹ 14.2k</span> so far.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm mr-2">
                        <Button 
                            variant={demoDataEnabled ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setDemoDataEnabled(true)}
                            className="rounded-lg text-[10px] font-bold h-8"
                        >
                            DEMO
                        </Button>
                        <Button 
                            variant={!demoDataEnabled ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setDemoDataEnabled(false)}
                            className="rounded-lg text-[10px] font-bold h-8"
                        >
                            REAL
                        </Button>
                    </div>
                    <Link href="/dashboard/owner/vehicles/add">
                        <Button className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 font-bold text-[15px] transition-all duration-200 group">
                            <Plus className="mr-2 h-5 w-5 stroke-[3px] group-hover:rotate-90 transition-transform" />
                            Add Vehicle
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
                ) : (
                    [
                        { title: "Total Fleet", value: stats.total, icon: Truck, color: "blue", label: "Vehicles", trend: { value: 12, isUp: true }, detail: "Your fleet has grown by 2 vehicles this month. Average utilization is at 82%." },
                        { title: "On Road", value: stats.onRoad, icon: Activity, color: "emerald", label: "Active Now", trend: { value: 8, isUp: true }, detail: "High demand in the North zone. 14 trucks currently on long-haul trips." },
                        { title: "Available", value: stats.available, icon: CheckCircle2, color: "indigo", label: "Ready", trend: { value: 5, isUp: false }, detail: "3 trucks have been idle for more than 12 hours. Consider re-routing." },
                        { title: "In Maintenance", value: stats.maintenance, icon: Wrench, color: "amber", label: "In Service", trend: { value: 2, isUp: true }, detail: "2 vehicles due for insurance renewal. 1 truck in major engine repair." },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                           <InsightCard 
                             {...stat} 
                             color={stat.color as any}
                             isPriority={stat.title === "In Maintenance"}
                             onClick={() => setSelectedStat(stat)}
                           />
                        </motion.div>
                    ))
                )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Recent Trips Table */}
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-8 py-6">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold text-slate-900">Active Shipments</CardTitle>
                                <CardDescription>Tracking {recentTrips.length} ongoing trips across India.</CardDescription>
                            </div>
                            <Button variant="outline" className="text-slate-600 border-slate-200 text-xs font-bold rounded-xl h-10 px-4">
                                View History
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <TableSkeleton />
                            ) : (
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="border-none">
                                            <TableHead className="pl-8 font-bold text-slate-500 uppercase text-[10px] tracking-widest h-12">Trip ID</TableHead>
                                            <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest h-12">Route</TableHead>
                                            <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest h-12">Driver</TableHead>
                                            <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest h-12 text-center">Status</TableHead>
                                            <TableHead className="pr-8 font-bold text-slate-500 uppercase text-[10px] tracking-widest h-12 text-right">ETA</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentTrips.map((trip) => (
                                            <TableRow key={trip.id} className="hover:bg-slate-50 group border-slate-50 transition-colors cursor-pointer">
                                                <TableCell className="pl-8 font-bold text-blue-600 group-hover:underline underline-offset-4">{trip.id}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-900">{trip.from}</span>
                                                        <ArrowRight className="h-3 w-3 text-slate-300" />
                                                        <span className="font-bold text-slate-900">{trip.to}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium text-slate-600">{trip.driver}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge 
                                                        className={cn(
                                                            "px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider shadow-none",
                                                            trip.color === 'blue' && "bg-blue-50 text-blue-700 border-blue-100/50",
                                                            trip.color === 'orange' && "bg-amber-50 text-amber-700 border-amber-100/50",
                                                            trip.color === 'green' && "bg-emerald-50 text-emerald-700 border-emerald-100/50",
                                                            trip.color === 'red' && "bg-red-50 text-red-700 border-red-100/50"
                                                        )}
                                                    >
                                                        {trip.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="pr-8 text-right font-medium text-slate-600">
                                                    <div className="flex items-center justify-end gap-2 text-slate-900 font-bold">
                                                        {trip.eta === "Completed" ? (
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                        ) : (
                                                            <Clock className="h-4 w-4 text-blue-500" />
                                                        )}
                                                        {trip.eta}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Progressive Disclosure Section */}
                    <div>
                        <Button 
                            variant="ghost" 
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="text-slate-400 hover:text-blue-600 text-xs font-bold uppercase tracking-widest mb-4 gap-2 px-2"
                        >
                            {showAdvanced ? 'Hide Advanced Insights' : 'Show Advanced Insights'}
                            <MoreVertical className={cn("h-4 w-4 transition-transform", showAdvanced && "rotate-90")} />
                        </Button>
                        
                        <AnimatePresence>
                            {showAdvanced && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    <Card className="p-6 bg-slate-50 border-dashed border-2 border-slate-200 shadow-none">
                                        <div className="flex items-center gap-3 mb-4">
                                            <BarChart3 className="h-5 w-5 text-blue-600" />
                                            <h4 className="font-bold text-slate-900 tracking-tight">Fuel Efficiency Alert</h4>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed mb-4">
                                            Vehicle MH 12 AB 1234 is showing <span className="text-red-600 font-bold">15% higher fuel consumption</span> than average on the Mumbai-Pune route.
                                        </p>
                                        <Button className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl py-5 shadow-sm">
                                            Run Diagnostics
                                        </Button>
                                    </Card>
                                    <Card className="p-6 bg-slate-50 border-dashed border-2 border-slate-200 shadow-none">
                                        <div className="flex items-center gap-3 mb-4">
                                            <ShieldCheck className="h-5 w-5 text-emerald-600" />
                                            <h4 className="font-bold text-slate-900 tracking-tight">Driver Performance</h4>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed mb-4">
                                            Top Performer: <span className="text-slate-900 font-bold">Rajesh Kumar</span> is currently your highest rated driver with 4.9/5 stars over 40 trips.
                                        </p>
                                        <Button className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl py-5 shadow-sm">
                                            View Leaderboard
                                        </Button>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Quick Actions Card */}
                    <Card className="border-none shadow-sm bg-white p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-slate-900">Quick Actions</h3>
                            <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">MOST USED</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Add Trip', icon: Plus, color: 'blue' },
                                { label: 'Live Map', icon: MapPin, color: 'emerald' },
                                { label: 'Bidding', icon: TrendingUp, color: 'purple' },
                                { label: 'Dost Help', icon: MessageSquare, color: 'amber' }
                            ].map((action, i) => (
                                <Button 
                                    key={i}
                                    variant="outline" 
                                    className="h-28 rounded-3xl border-slate-100 bg-slate-50 flex-col gap-3 hover:bg-slate-100 hover:border-slate-200 hover:scale-105 group transition-all duration-300"
                                    onClick={() => {
                                        if (action.label === 'Add Trip') {
                                           toast.success("New trip draft created!", {
                                               description: "MH 12 AB 1234 Mumbai to Delhi",
                                               action: {
                                                   label: "Undo",
                                                   onClick: () => toast("Action reverted")
                                               }
                                           })
                                        }
                                    }}
                                >
                                    <div className={cn("p-3 rounded-2xl bg-white shadow-sm transition-colors", `text-${action.color}-600 group-hover:bg-${action.color}-600 group-hover:text-white`)}>
                                        <action.icon className="h-6 w-6 stroke-[2.5px]" />
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">{action.label}</span>
                                </Button>
                            ))}
                        </div>
                    </Card>

                    {/* Revenue Card (Optimistic UI) */}
                    <Card className="border-none shadow-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revenue Growth</p>
                                    <p className="text-3xl font-black tabular-nums">₹ 142.5k</p>
                                </div>
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                    <TrendingUp className="h-6 w-6 text-emerald-400" />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-slate-400">Monthly Target (₹ 2.0M)</span>
                                    <span className="text-emerald-400">71%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: '71%' }}
                                        className="h-full bg-emerald-400" 
                                    />
                                </div>
                            </div>

                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl h-14 shadow-xl shadow-blue-900/40">
                                View Full Analytics
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Detail Dialog for Progressive Disclosure */}
            <Dialog open={!!selectedStat} onOpenChange={(open: boolean) => !open && setSelectedStat(null)}>
                <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    <DialogTitle className="sr-only">Stat Insight Details</DialogTitle>
                    <DialogDescription className="sr-only">
                        Detailed breakdown and analysis of the selected fleet statistic.
                    </DialogDescription>
                    {selectedStat && (
                        <div className="flex flex-col">
                            <div className={cn("p-10 text-white relative overflow-hidden", 
                                selectedStat.color === 'blue' ? "bg-blue-600" :
                                selectedStat.color === 'emerald' ? "bg-emerald-600" :
                                selectedStat.color === 'indigo' ? "bg-indigo-600" :
                                "bg-amber-600"
                            )}>
                                <div className="absolute top-0 right-0 p-12 opacity-10">
                                    <selectedStat.icon className="h-48 w-48 rotate-12" />
                                </div>
                                <div className="relative z-10 space-y-4">
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-[10px]">
                                        Deep Insight
                                    </Badge>
                                    <h2 className="text-4xl font-black tracking-tight">{selectedStat.title}</h2>
                                    <div className="flex items-center gap-4 pt-2">
                                        <div className="text-6xl font-black">{selectedStat.value}</div>
                                        <div className="text-xl font-bold opacity-80">{selectedStat.label}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-10 bg-white space-y-8">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Executive Summary</h4>
                                    <p className="text-lg text-slate-600 font-medium leading-relaxed">
                                        {selectedStat.detail}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Card className="p-6 bg-slate-50 border-none rounded-3xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Trend Accuracy</p>
                                        <p className="text-2xl font-black text-slate-900">94.2%</p>
                                    </Card>
                                    <Card className="p-6 bg-slate-50 border-none rounded-3xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Confidence</p>
                                        <p className="text-2xl font-black text-slate-900">High</p>
                                    </Card>
                                </div>

                                <DialogFooter className="pt-4">
                                    <Button 
                                        onClick={() => setSelectedStat(null)}
                                        className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black hover:bg-black active:scale-95 transition-all"
                                    >
                                        CLOSE INSIGHT
                                    </Button>
                                </DialogFooter>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
