'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Truck, 
    MapPin, 
    Package, 
    Zap, 
    ChevronRight, 
    ChevronLeft, 
    CheckCircle2,
    Calendar,
    Weight,
    IndianRupee,
    AlertCircle,
    Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STEPS = [
    { title: 'Route', icon: MapPin, description: 'Pickup & Delivery' },
    { title: 'Cargo', icon: Package, description: 'Material Details' },
    { title: 'Pricing', icon: IndianRupee, description: 'Budget & Bids' },
    { title: 'Review', icon: Zap, description: 'Platform Boost' }
];

export function LoadPostForm({ onSuccess }: { onSuccess: () => void }) {
    const [step, setStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        pickup: '',
        delivery: '',
        date: '',
        material: '',
        weight: '',
        truckType: 'Open Body',
        budget: '',
        notes: ''
    });

    // Auto-save & Restore
    useEffect(() => {
        const saved = localStorage.getItem('draft_load_post');
        if (saved) {
            setFormData(JSON.parse(saved));
            toast.info("Draft restored!", { description: "We found your previous progress and restored it." });
        }
    }, []);

    useEffect(() => {
        if (step > 1) {
            localStorage.setItem('draft_load_post', JSON.stringify(formData));
        }
    }, [formData, step]);

    const handleNext = () => setStep(s => Math.min(s + 1, 4));
    const handleBack = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1500));
        localStorage.removeItem('draft_load_post');
        toast.success("Load posted successfully!", {
            description: `${formData.pickup} to ${formData.delivery} • ${formData.material}`,
            icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        });
        setIsSaving(false);
        onSuccess();
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Progress Header */}
            <div className="mb-12">
                <div className="flex justify-between items-center mb-6">
                    {STEPS.map((s, i) => (
                        <div key={i} className="flex flex-col items-center gap-3 relative z-10">
                            <div className={cn(
                                "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm",
                                step > i + 1 ? "bg-emerald-500 text-white" : 
                                step === i + 1 ? "bg-blue-600 text-white scale-110 shadow-lg shadow-blue-200" : 
                                "bg-white border border-slate-100 text-slate-300"
                            )}>
                                {step > i + 1 ? <CheckCircle2 className="h-6 w-6" /> : <s.icon className="h-5 w-5" />}
                            </div>
                            <div className="text-center">
                                <p className={cn("text-[10px] font-black uppercase tracking-widest", step === i + 1 ? "text-blue-600" : "text-slate-400")}>{s.title}</p>
                            </div>
                        </div>
                    ))}
                    {/* Progress Bar Background */}
                    <div className="absolute top-[4.5rem] left-[15%] right-[15%] h-0.5 bg-slate-100 -z-0" />
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(step - 1) * 33}%` }}
                        className="absolute top-[4.5rem] left-[15%] h-0.5 bg-blue-600 -z-0" 
                    />
                </div>
            </div>

            {/* Form Content */}
            <Card className="p-8 border-none shadow-2xl bg-white/80 backdrop-blur-md rounded-[2.5rem] relative overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                    >
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Where is the cargo?</h3>
                                    <p className="text-slate-500 font-medium">Specify pickup and delivery zones.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Pickup Location</Label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                            <Input 
                                                className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all font-bold" 
                                                placeholder="e.g. Mumbai Port"
                                                value={formData.pickup}
                                                onChange={e => setFormData({...formData, pickup: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Delivery Location</Label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                            <Input 
                                                className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all font-bold" 
                                                placeholder="e.g. Delhi NCR"
                                                value={formData.delivery}
                                                onChange={e => setFormData({...formData, delivery: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Pickup Date</Label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <Input 
                                            type="date"
                                            className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all font-bold" 
                                            value={formData.date}
                                            onChange={e => setFormData({...formData, date: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">What are you moving?</h3>
                                    <p className="text-slate-500 font-medium">Details about the material and weight.</p>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Material Type</Label>
                                    <div className="relative group">
                                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <Input 
                                            className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all font-bold" 
                                            placeholder="e.g. Industrial Steel Coils"
                                            value={formData.material}
                                            onChange={e => setFormData({...formData, material: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Total Weight (Tons)</Label>
                                        <div className="relative group">
                                            <Weight className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                            <Input 
                                                type="number"
                                                className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all font-bold" 
                                                placeholder="e.g. 25"
                                                value={formData.weight}
                                                onChange={e => setFormData({...formData, weight: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Truck Required</Label>
                                        <div className="relative group">
                                            <Truck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                            <select 
                                                className="w-full pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all font-bold appearance-none outline-none"
                                                value={formData.truckType}
                                                onChange={e => setFormData({...formData, truckType: e.target.value})}
                                            >
                                                <option>Open Body</option>
                                                <option>Container (HQ)</option>
                                                <option>Flatbed</option>
                                                <option>Taurus 22FT</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Set your budget</h3>
                                    <p className="text-slate-500 font-medium">Bids will start around this price point.</p>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Target Freight (₹)</Label>
                                    <div className="relative group">
                                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <Input 
                                            type="number"
                                            className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all font-bold text-2xl" 
                                            placeholder="e.g. 45000"
                                            value={formData.budget}
                                            onChange={e => setFormData({...formData, budget: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3">
                                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                                    <p className="text-xs text-amber-900 leading-relaxed font-medium">
                                        Pro Tip: Setting a competitive price helps in getting verified transporters faster. Our suggested price for this route is <span className="font-bold">₹ 42,500</span>.
                                    </p>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Verification & Review</h3>
                                    <p className="text-slate-500 font-medium">Does everything look correct?</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Route', value: `${formData.pickup} → ${formData.delivery}` },
                                        { label: 'Material', value: formData.material },
                                        { label: 'Truck', value: formData.truckType },
                                        { label: 'Freight', value: `₹ ${formData.budget}` },
                                    ].map((item, i) => (
                                        <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                                            <p className="font-bold text-slate-900 truncate">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-6 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-200 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold opacity-80">Boost Visibility</p>
                                        <p className="text-sm font-black">Featured Listing (+ ₹ 250)</p>
                                    </div>
                                    <Badge className="bg-white/20 text-white border-none py-1.5 px-4 rounded-full font-black text-[10px] uppercase">Highly Recommended</Badge>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Footer Actions */}
                <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-100">
                    <Button 
                        variant="ghost" 
                        onClick={handleBack}
                        disabled={step === 1}
                        className="h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900"
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    
                    <div className="flex items-center gap-3">
                         <Button 
                            variant="outline" 
                            className="h-14 px-6 rounded-2xl font-black text-xs uppercase tracking-widest border-slate-100 text-slate-400 group"
                            onClick={() => {
                                localStorage.setItem('draft_load_post', JSON.stringify(formData));
                                toast.success("Draft Saved!", { icon: <Save className="h-4 w-4" /> });
                            }}
                         >
                            Save Draft
                        </Button>

                        {step < 4 ? (
                            <Button 
                                onClick={handleNext}
                                className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 transition-all hover:scale-105 active:scale-95"
                            >
                                Continue <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 transition-all hover:scale-105 active:scale-95"
                            >
                                {isSaving ? "Posting..." : "Confirm & Post"} <CheckCircle2 className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}
