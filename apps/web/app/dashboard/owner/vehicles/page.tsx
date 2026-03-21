'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    Truck, 
    Plus, 
    Settings2, 
    Wrench, 
    ShieldCheck, 
    ChevronRight, 
    MoreVertical, 
    FileText, 
    History,
    Search,
    Filter,
    CheckCircle2,
    AlertCircle,
    Info
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useUX } from '@/lib/ux-context';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/contextual-tooltip';
import { Archive } from 'lucide-react';

// --- Form & Input Excellence: Multi-step Add Vehicle Form ---

export default function VehicleManagementPage() {
    const { demoDataEnabled } = useUX();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [formStep, setFormStep] = useState(1);
    
    // Auto-save State
    const [formState, setFormState] = useState({
        number: '',
        type: '',
        capacity: '',
        make: '',
        model: ''
    });

    useEffect(() => {
        fetchVehicles();
        
        // Form & Input Excellence: Load auto-saved draft
        const draft = localStorage.getItem('vehicle_form_draft');
        if (draft) {
            try {
                const parsed = JSON.parse(draft);
                setFormState(prev => ({ ...prev, ...parsed }));
            } catch (e) {}
        }
    }, [demoDataEnabled]);

    // Auto-save effect
    useEffect(() => {
        if (isAddOpen) {
            localStorage.setItem('vehicle_form_draft', JSON.stringify(formState));
        }
    }, [formState, isAddOpen]);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            await new Promise(r => setTimeout(r, 800)); // Smooth aesthetic loading

            if (demoDataEnabled) {
                setVehicles([
                    { id: 'v1', number: 'MH 12 AB 1234', type: 'Container', capacity: 15, status: 'AVAILABLE', lastMaintenance: '2024-02-15' },
                    { id: 'v2', number: 'MH 12 XY 5678', type: 'Open Truck', capacity: 8, status: 'IN_TRANSIT', lastMaintenance: '2024-03-01' },
                    { id: 'v3', number: 'MH 14 PQ 9012', type: 'Trailer', capacity: 25, status: 'MAINTENANCE', lastMaintenance: '2024-01-20' }
                ]);
            } else {
                const res = await api.get('/vehicles');
                setVehicles(res.data.data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddVehicle = async () => {
        try {
            // Real-time validation would have caught issues before this
            if (demoDataEnabled) {
                toast.success("Demo: Vehicle Added Successfully");
            } else {
                await api.post('/vehicles', formState);
                toast.success("Vehicle Added Successfully");
            }
            setIsAddOpen(false);
            setFormState({ number: '', type: '', capacity: '', make: '', model: '' });
            localStorage.removeItem('vehicle_form_draft');
            fetchVehicles();
        } catch (e) {
            toast.error("Failed to add vehicle");
        }
    };

    const handleArchiveVehicle = (id: string, number: string) => {
        const originalVehicles = [...vehicles];
        setVehicles(prev => prev.filter(v => v.id !== id && v._id !== id));
        
        toast.message(`${number} Archived`, {
            description: "Vehicle has been moved to archives.",
            action: {
                label: "Undo",
                onClick: () => setVehicles(originalVehicles)
            },
            duration: 5000,
        });
    };

    const validateRegNumber = (num: string) => {
        const regex = /^[A-Z]{2}\s[0-9]{2}\s[A-Z]{2}\s[0-9]{4}$/;
        return regex.test(num);
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-700 pb-24 px-4 sm:px-0">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 sm:p-3 bg-blue-50 rounded-2xl text-blue-600 shadow-sm">
                            <Truck className="h-5 w-5 sm:h-6 sm:h-6" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Fleet Command</h1>
                    </div>
                    <p className="text-slate-500 font-medium text-sm sm:text-base">Manage your assets, track maintenance, and optimize performance.</p>
                </div>
                <Button 
                    id="fleet-command-btn"
                    onClick={() => setIsAddOpen(true)}
                    className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black px-8 h-16 sm:h-14 rounded-2xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95 text-lg gap-2"
                >
                    <Plus className="h-6 w-6" /> ADD VEHICLE
                </Button>
            </div>

            {/* Stats Overview */}
            <TooltipProvider>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    { label: 'Total Fleet', value: vehicles.length, icon: Truck, color: 'blue' },
                    { label: 'On Road', value: vehicles.filter(v => v.status === 'IN_TRANSIT').length, icon: CheckCircle2, color: 'emerald' },
                    { label: 'In Maintenance', value: vehicles.filter(v => v.status === 'MAINTENANCE').length, icon: Wrench, color: 'amber' },
                    { label: 'Compliance Rate', value: '98%', icon: ShieldCheck, color: 'indigo', tooltip: "Percentage of vehicles with valid permits and insurance." }
                ].map((stat) => (
                    <Tooltip key={stat.label}>
                        <TooltipTrigger asChild>
                            <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-3xl p-4 sm:p-6 bg-white cursor-help">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className={cn("p-3 sm:p-4 rounded-2xl shadow-sm", 
                                        stat.color === 'blue' ? "bg-blue-50 text-blue-600" :
                                        stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                                        stat.color === 'amber' ? "bg-amber-50 text-amber-600" :
                                        "bg-indigo-50 text-indigo-600"
                                    )}>
                                        <stat.icon className="h-5 w-5 sm:h-6 sm:h-6" />
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-[10px] sm:text-sm font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                        <p className="text-2xl sm:text-3xl font-black text-slate-900">{stat.value}</p>
                                    </div>
                                </div>
                            </Card>
                        </TooltipTrigger>
                        {stat.tooltip && <TooltipContent>{stat.tooltip}</TooltipContent>}
                    </Tooltip>
                ))}
            </div>
            </TooltipProvider>

            {/* Vehicle Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="p-8 space-y-6 rounded-3xl border-none shadow-sm bg-white overflow-hidden relative">
                             <Skeleton className="h-8 w-1/2" />
                             <Skeleton className="h-24 w-full rounded-2xl" />
                             <div className="flex gap-4">
                                <Skeleton className="h-12 flex-1" />
                                <Skeleton className="h-12 flex-1" />
                             </div>
                        </Card>
                    ))
                ) : vehicles.length === 0 ? (
                    <div className="col-span-full py-20 text-center space-y-4 bg-slate-50 rounded-4xl border-2 border-dashed border-slate-200">
                         <div className="p-6 bg-white rounded-full w-fit mx-auto shadow-sm">
                            <Truck className="h-12 w-12 text-slate-300" />
                         </div>
                         <h3 className="text-xl font-bold text-slate-900">No vehicles yet</h3>
                         <p className="text-slate-500 max-w-xs mx-auto">Click "Add New Vehicle" to start building your fleet command.</p>
                    </div>
                ) : vehicles.map((vehicle) => (
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={vehicle.id || vehicle._id}
                    >
                        <Card className="group border-none shadow-sm hover:shadow-2xl transition-all duration-300 rounded-3xl bg-white overflow-hidden">
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <Badge variant="secondary" className="bg-slate-50 text-slate-400 font-black px-3 py-1 mb-2 rounded-full border-none uppercase text-[10px] tracking-widest">
                                            {vehicle.type}
                                        </Badge>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{vehicle.number}</h3>
                                    </div>
                                    <div className={cn("p-2 rounded-xl flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest", 
                                        vehicle.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600' :
                                        vehicle.status === 'MAINTENANCE' ? 'bg-amber-50 text-amber-600' :
                                        'bg-blue-50 text-blue-600'
                                    )}>
                                        <div className={cn("h-1.5 w-1.5 rounded-full", 
                                            vehicle.status === 'AVAILABLE' ? 'bg-emerald-500' :
                                            vehicle.status === 'MAINTENANCE' ? 'bg-amber-500' :
                                            'bg-blue-500'
                                        )} />
                                        {vehicle.status.replace('_', ' ')}
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-3xl mb-8 border border-slate-100/50">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Capacity</p>
                                            <p className="font-black text-slate-900">{vehicle.capacity} Tonnes</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Next Service</p>
                                            <p className="font-black text-slate-900">12 June, 2024</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button 
                                        variant="outline" 
                                        className="h-14 w-14 rounded-2xl border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 p-0 shrink-0"
                                        onClick={() => handleArchiveVehicle(vehicle.id || vehicle._id, vehicle.number)}
                                    >
                                        <Archive className="h-5 w-5" />
                                    </Button>
                                    <Button variant="outline" className="flex-1 h-14 rounded-2xl border-slate-200 font-black text-slate-600 hover:bg-slate-50 uppercase text-xs tracking-widest">
                                        DOCS
                                    </Button>
                                    <Button className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black shadow-none uppercase text-xs tracking-widest">
                                        DETAILS
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Multi-step Add Vehicle Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-10 text-white">
                        <DialogHeader>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-white/20 rounded-2xl">
                                    <Truck className="h-6 w-6" />
                                </div>
                                <DialogTitle className="text-3xl font-black tracking-tight">Add New Transport</DialogTitle>
                            </div>
                            <DialogDescription className="text-blue-100 text-lg font-medium">
                                Step {formStep} of 2: {formStep === 1 ? 'Technical Specifications' : 'Ownership Details'}
                            </DialogDescription>
                        </DialogHeader>
                        
                        {/* Progress Bar */}
                        <div className="mt-8 flex gap-2">
                            <div className={cn("h-2 flex-1 rounded-full transition-all duration-500", formStep >= 1 ? 'bg-white' : 'bg-white/30')} />
                            <div className={cn("h-2 flex-1 rounded-full transition-all duration-500", formStep >= 2 ? 'bg-white' : 'bg-white/30')} />
                        </div>
                    </div>

                    <div className="p-10 space-y-8 bg-white min-h-[400px]">
                        <AnimatePresence mode="wait">
                            {formStep === 1 ? (
                                <motion.div 
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-sm font-black text-slate-400 uppercase tracking-widest">Registration Number</Label>
                                            <div className="relative group">
                                                <Input 
                                                    placeholder="MH 12 AB 1234" 
                                                    value={formState.number}
                                                    onChange={e => setFormState({...formState, number: e.target.value.toUpperCase()})}
                                                    className={cn("h-14 rounded-2xl bg-slate-50 border-none px-6 text-slate-900 font-bold focus:ring-4 focus:ring-blue-100 transition-all", 
                                                        formState.number && !validateRegNumber(formState.number) ? 'bg-red-50 ring-2 ring-red-100' : ''
                                                    )}
                                                />
                                                {formState.number && !validateRegNumber(formState.number) && (
                                                   <span className="text-[10px] text-red-500 font-bold uppercase mt-1 block">Format: MH 12 AB 1234</span>
                                                )}
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                                                    <div className="flex items-center gap-1.5 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Verified</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-sm font-black text-slate-400 uppercase tracking-widest">Vehicle Type</Label>
                                            <Select value={formState.type} onValueChange={t => setFormState({...formState, type: t})}>
                                                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold shadow-none ring-offset-0 focus:ring-4 focus:ring-blue-100">
                                                    <SelectValue placeholder="Select type..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                                    <SelectItem value="Container" className="rounded-xl py-3 cursor-pointer">Container Truck</SelectItem>
                                                    <SelectItem value="Trailer" className="rounded-xl py-3 cursor-pointer">Trailer</SelectItem>
                                                    <SelectItem value="Open Truck" className="rounded-xl py-3 cursor-pointer">Open Flatbed</SelectItem>
                                                    <SelectItem value="Refrigerated" className="rounded-xl py-3 cursor-pointer">Refrigerated (Reefer)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-sm font-black text-slate-400 uppercase tracking-widest">Maximum Capacity (Tons)</Label>
                                        <div className="relative">
                                            <Input 
                                                type="number" 
                                                placeholder="e.g. 15" 
                                                value={formState.capacity}
                                                onChange={e => setFormState({...formState, capacity: e.target.value})}
                                                className="h-14 rounded-2xl bg-slate-50 border-none px-6 text-slate-900 font-black focus:ring-4 focus:ring-blue-100 text-xl"
                                            />
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">TONNES</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-sm font-black text-slate-400 uppercase tracking-widest">Make / Manufacturer</Label>
                                            <Input 
                                                placeholder="e.g. Tata Motors" 
                                                value={formState.make}
                                                onChange={e => setFormState({...formState, make: e.target.value})}
                                                className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-sm font-black text-slate-400 uppercase tracking-widest">Model Year</Label>
                                            <Input 
                                                placeholder="2023" 
                                                value={formState.model}
                                                onChange={e => setFormState({...formState, model: e.target.value})}
                                                className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold"
                                            />
                                        </div>
                                    </div>
                                    
                                    <Card className="bg-blue-50 border-none p-6 rounded-3xl flex items-start gap-4">
                                        <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm">
                                            <Info className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-blue-900 text-sm mb-1 uppercase tracking-tight">Smart Suggestion</h4>
                                            <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                                Based on your current fleet, we recommend adding a "Container" type for better revenue matching with your existing Delhi-Mumbai routes.
                                            </p>
                                        </div>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <DialogFooter className="p-10 pt-0 bg-white">
                        <div className="flex w-full gap-4">
                            {formStep > 1 && (
                                <Button 
                                    variant="outline" 
                                    onClick={() => setFormStep(1)}
                                    className="h-16 flex-1 rounded-2xl border-slate-200 text-slate-500 font-black"
                                >
                                    BACK
                                </Button>
                            )}
                            <Button 
                                onClick={formStep === 1 ? () => setFormStep(2) : handleAddVehicle}
                                className="h-16 flex-[2] rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-100 text-lg"
                            >
                                {formStep === 1 ? 'NEXT STEP' : 'COMPLETE REGISTRATION'}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
