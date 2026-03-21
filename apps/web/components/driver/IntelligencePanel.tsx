'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Brain, DollarSign, Activity, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function IntelligencePanel() {
    const [alertData, setAlertData] = useState<any>(null);
    const [fatigueData, setFatigueData] = useState<any>(null);
    const [earningsData, setEarningsData] = useState<any>(null);

    useEffect(() => {
        fetchIntelligenceData();
        // Setup polling every 30 seconds for alerts and fatigue
        const interval = setInterval(fetchIntelligenceData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchIntelligenceData = async () => {
        try {
            // Fetch AI Co-driver alerts
            // We pass mock 'decisions' payload as the engine
            const alertRes = await api.post('/intelligence/driver-alert', { 
                decisions: [
                    { type: 'WEATHER', urgency: 'CRITICAL', description: 'Heavy rain in next 10km' }
                ] 
            });
            setAlertData(alertRes.data);

            // Fetch Fatigue
            const fatigueRes = await api.get('/intelligence/fatigue');
            setFatigueData(fatigueRes.data);

            // Fetch Earnings
            const earningsRes = await api.get('/intelligence/earnings');
            setEarningsData(earningsRes.data);
            
        } catch (error) {
            console.error('Failed to fetch Driver Intelligence Data', error);
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right duration-500">
            <h2 className="font-semibold text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Driver Intelligence Layer
            </h2>

            {/* AI Co-Driver Alerts */}
            <Card className="border-l-4 border-l-blue-500 shadow-sm bg-blue-50/50">
                <CardHeader className="py-3 px-4 border-b bg-white/50">
                    <CardTitle className="text-sm flex justify-between items-center">
                        <span className="flex items-center gap-2 text-blue-700">
                            <Bell className="h-4 w-4" /> AI Co-Driver
                        </span>
                        {alertData?.alerts?.length > 0 && (
                            <Badge variant="destructive" className="animate-pulse">Active Alert</Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <p className="font-medium text-slate-800">
                        "{alertData?.instruction || 'Analyzing route telemetry...'}"
                    </p>
                </CardContent>
            </Card>

            {/* Fatigue & Stress Detection */}
            <Card className={`border-l-4 shadow-sm ${fatigueData?.isCritical ? 'border-l-red-500 bg-red-50/50' : 'border-l-green-500 bg-green-50/50'}`}>
                <CardHeader className="py-3 px-4 border-b bg-white/50">
                    <CardTitle className="text-sm flex justify-between items-center">
                        <span className={`flex items-center gap-2 ${fatigueData?.isCritical ? 'text-red-700' : 'text-green-700'}`}>
                            <Activity className="h-4 w-4" /> Fatigue Monitor
                        </span>
                        <Badge className={`${fatigueData?.isCritical ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                            Score: {fatigueData?.fatigueScore || 0}/100
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <p className="text-sm font-medium">
                        {fatigueData?.recommendation || 'Monitoring vitals...'}
                    </p>
                </CardContent>
            </Card>

            {/* Earnings Transparency */}
            <Card className="border-l-4 border-l-emerald-500 shadow-sm bg-emerald-50/50">
                <CardHeader className="py-3 px-4 border-b bg-white/50">
                    <CardTitle className="text-sm flex justify-between items-center text-emerald-700">
                        <span className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" /> Earnings Transparency
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Total Trip Value</span>
                        <span className="font-semibold text-slate-700">₹{earningsData?.tripValue || 0}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-emerald-100">
                        <span className="text-sm text-slate-500">Your Guaranteed Cut ({earningsData?.driverShare || 0}%)</span>
                        <span className="font-bold text-emerald-600 text-lg">₹{earningsData?.yourEarnings || 0}</span>
                    </div>
                    <p className="text-xs text-emerald-800 bg-emerald-100 p-2 rounded-md">
                        {earningsData?.insights || 'Transparency engine loading...'}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
