'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import api from '@/lib/api';
import {
    DollarSign,
    FileText,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Download,
    Upload,
    Truck,
    User,
    Wallet,
    Receipt
} from 'lucide-react';

export default function FinancePage() {
    const [loading, setLoading] = useState(true);
    const [financeData, setFinanceData] = useState<any>({ transactions: [], summary: {} });
    const [documents, setDocuments] = useState<any[]>([]);

    // Upload Form State
    const [uploadOpen, setUploadOpen] = useState(false);
    const [uploadForm, setUploadForm] = useState({ title: '', type: 'Vehicle', expiryDate: '' });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [financeRes, docRes] = await Promise.all([
                api.get('/finance'),
                api.get('/documents')
            ]);
            setFinanceData(financeRes.data.data);
            setDocuments(docRes.data.data);
        } catch (error) {
            console.error('Failed to fetch finance data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpload = async () => {
        if (!uploadForm.title || !uploadForm.expiryDate || !selectedFile) {
            toast.error("Please fill all fields and select a file");
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('title', uploadForm.title);
            formData.append('type', uploadForm.type);
            formData.append('expiryDate', uploadForm.expiryDate);
            formData.append('file', selectedFile);

            await api.post('/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success("Document uploaded successfully");
            setUploadOpen(false);
            setUploadForm({ title: '', type: 'Vehicle', expiryDate: '' });
            setSelectedFile(null);
            fetchData();
        } catch (error) {
            console.error('Upload failed', error);
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Finance & Compliance</h1>
                <p className="text-slate-500 font-medium">Monitor your fleet's financial health and manage regulatory documents.</p>
            </div>

            <Tabs defaultValue="finance" className="space-y-8">
                <TabsList className="bg-slate-100/80 backdrop-blur border border-slate-200 p-1.5 rounded-xl block sm:inline-flex w-full sm:w-auto h-auto">
                    <TabsTrigger value="finance" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg px-6 py-2.5 text-slate-600 font-medium w-full sm:w-auto">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Finance Overview
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg px-6 py-2.5 text-slate-600 font-medium w-full sm:w-auto mt-2 sm:mt-0">
                        <FileText className="w-4 h-4 mr-2" />
                        Document Vault
                    </TabsTrigger>
                </TabsList>

                {/* --- FINANCE TAB --- */}
                <TabsContent value="finance" className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="border-0 shadow-sm bg-white overflow-hidden relative group">
                            <div className="absolute -top-6 -right-6 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                                <Wallet className="w-32 h-32" />
                            </div>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
                                <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</CardTitle>
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                    <DollarSign className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="z-10 relative">
                                <div className="text-4xl font-extrabold text-slate-900 tracking-tight">₹{financeData.summary?.totalRevenue?.toLocaleString() || '0'}</div>
                                <p className="text-sm font-semibold text-emerald-600 flex items-center mt-3 bg-emerald-50 w-fit px-2 py-1 rounded-md border border-emerald-100/50">
                                    <TrendingUp className="h-3.5 w-3.5 mr-1" />
                                    +12.5% vs last month
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card className="border-0 shadow-sm bg-white overflow-hidden relative group">
                            <div className="absolute -top-6 -right-6 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                                <Receipt className="w-32 h-32" />
                            </div>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
                                <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Expenses</CardTitle>
                                <div className="p-2.5 bg-red-50 text-red-500 rounded-xl">
                                    <CreditCard className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="z-10 relative">
                                <div className="text-4xl font-extrabold text-slate-900 tracking-tight">₹{financeData.summary?.totalExpenses?.toLocaleString() || '0'}</div>
                                <p className="text-sm font-semibold text-amber-600 flex items-center mt-3 bg-amber-50 w-fit px-2 py-1 rounded-md border border-amber-100/50">
                                    <TrendingDown className="h-3.5 w-3.5 mr-1" />
                                    +5.2% (Fuel Costs)
                                </p>
                            </CardContent>
                        </Card>
                        
                        <Card className="border-0 shadow-md shadow-blue-600/10 bg-gradient-to-br from-blue-600 to-blue-700 overflow-hidden relative text-white hover:shadow-lg transition-shadow">
                            <div className="absolute -right-4 -bottom-4 bg-white/10 w-32 h-32 rounded-full blur-2xl pointer-events-none" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
                                <CardTitle className="text-sm font-semibold text-blue-100 uppercase tracking-wider">Net Profit</CardTitle>
                                <div className="p-2.5 bg-white/20 text-white rounded-xl backdrop-blur-sm">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="z-10 relative">
                                <div className="text-4xl font-extrabold tracking-tight">₹{financeData.summary?.netProfit?.toLocaleString() || '0'}</div>
                                <p className="text-sm font-semibold text-blue-100 mt-3 flex items-center bg-black/10 w-fit px-2 py-1 rounded-md">
                                    Margin: 67%
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Transactions List */}
                    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden rounded-2xl">
                        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-5 pt-6 px-6">
                            <CardTitle className="text-xl font-extrabold text-slate-900">Recent Transactions</CardTitle>
                            <CardDescription className="text-slate-500 font-medium mt-1">Latest financial activity from your fleet.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                {financeData.transactions?.map((tx: any) => (
                                    <div key={tx._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-slate-50/80 transition-colors gap-4">
                                        <div className="flex items-center gap-5">
                                            <div className={`p-4 rounded-2xl shadow-sm border ${tx.type === 'income' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-500'}`}>
                                                {tx.type === 'income' ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-lg">{tx.description}</p>
                                                <p className="text-sm font-semibold text-slate-500 mt-0.5">{new Date(tx.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right pl-16 sm:pl-0">
                                            <p className={`font-extrabold text-xl sm:text-2xl ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                {tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                                            </p>
                                            <Badge variant="outline" className="text-[11px] uppercase font-bold tracking-wider rounded-md mt-1.5 border-slate-200 text-slate-500 bg-slate-50">
                                                {tx.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                
                                {(!financeData.transactions || financeData.transactions.length === 0) && (
                                    <div className="flex flex-col items-center justify-center py-20 px-4 bg-slate-50/50">
                                        <div className="w-20 h-20 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-center shadow-sm mb-5 text-slate-300">
                                            <Receipt className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-xl font-extrabold text-slate-700 mb-2">No transactions yet</h3>
                                        <p className="text-slate-500 font-medium text-center max-w-md">When your fleet completes trips or incurs expenses, they will appear here automatically.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- DOCUMENTS TAB --- */}
                <TabsContent value="documents" className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex gap-2 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200 w-full sm:w-auto overflow-x-auto">
                            <Button variant="ghost" className="bg-white shadow-sm text-slate-800 rounded-lg hover:bg-white flex-shrink-0 font-semibold px-5">
                                All Documents
                            </Button>
                            <Button variant="ghost" className="text-slate-500 hover:text-slate-800 font-medium hover:bg-slate-200/50 rounded-lg flex-shrink-0 px-5">Vehicles</Button>
                            <Button variant="ghost" className="text-slate-500 hover:text-slate-800 font-medium hover:bg-slate-200/50 rounded-lg flex-shrink-0 px-5">Drivers</Button>
                        </div>

                        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 rounded-xl font-semibold w-full sm:w-auto h-12 px-6">
                                    <Upload className="h-5 w-5 mr-2" />
                                    Upload New Document
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white border-slate-200 text-slate-900 rounded-2xl shadow-xl sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-extrabold text-slate-900">Upload Document</DialogTitle>
                                    <DialogDescription className="text-slate-500 font-medium text-base">Add a new document to your secure vault.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-5 pt-4">
                                    <div className="space-y-2.5">
                                        <Label className="text-slate-800 font-bold">Document Title</Label>
                                        <Input
                                            placeholder="e.g. Vehicle Insurance"
                                            value={uploadForm.title}
                                            onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                                            className="bg-slate-50 border-slate-200 rounded-xl h-12 font-medium focus-visible:ring-blue-600"
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <Label className="text-slate-800 font-bold">Type</Label>
                                        <select
                                            className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                                            value={uploadForm.type}
                                            onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                                        >
                                            <option value="Vehicle">Vehicle Document</option>
                                            <option value="Driver">Driver Document</option>
                                            <option value="Permit">Permit / Compliance</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2.5">
                                        <Label className="text-slate-800 font-bold">Expiry Date</Label>
                                        <Input
                                            type="date"
                                            value={uploadForm.expiryDate}
                                            onChange={(e) => setUploadForm({ ...uploadForm, expiryDate: e.target.value })}
                                            className="bg-slate-50 border-slate-200 rounded-xl h-12 font-medium focus-visible:ring-blue-600"
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <Label className="text-slate-800 font-bold">Document File</Label>
                                        <div className="relative">
                                            <Input
                                                type="file"
                                                onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                                                className="bg-slate-50 border-slate-200 rounded-xl h-12 focus-visible:ring-blue-600 file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-lg file:px-4 file:py-1.5 file:mr-4 file:font-bold hover:file:bg-blue-100 cursor-pointer pt-2"
                                            />
                                        </div>
                                    </div>
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-12 font-bold text-base text-white shadow-md shadow-blue-600/20 mt-4" onClick={handleUpload} disabled={uploading}>
                                        {uploading ? 'Uploading...' : 'Save Document'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documents.map((doc: any) => (
                            <Card key={doc._id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow group rounded-2xl overflow-hidden">
                                <CardContent className="p-6 flex items-start justify-between">
                                    <div className="flex items-start gap-5">
                                        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors shadow-sm">
                                            {doc.type === 'Vehicle' ? <Truck className="h-6 w-6" /> : <User className="h-6 w-6" />}
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-slate-900 text-lg line-clamp-1">{doc.title}</h4>
                                            <p className="text-sm font-semibold text-slate-500 mt-0.5 mb-3">Expires: {new Date(doc.expiryDate).toLocaleDateString()}</p>
                                            <div className="flex items-center gap-2">
                                                {doc.status === 'valid' && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-sm">Valid</Badge>}
                                                {doc.status === 'expiring' && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-sm">Expiring Soon</Badge>}
                                                {doc.status === 'expired' && <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-sm">Expired</Badge>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                            <Button size="icon" variant="outline" className="rounded-xl h-12 w-12 border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 shadow-sm transition-colors">
                                                <Download className="h-5 w-5" />
                                            </Button>
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        
                        {documents.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center">
                                <div className="w-20 h-20 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-center shadow-sm mb-5 text-slate-300">
                                    <FileText className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-extrabold text-slate-700 mb-2">Your vault is empty</h3>
                                <p className="text-slate-500 font-medium max-w-sm mb-8 text-lg">Upload insurance, permits, and driver licenses here to keep your fleet compliant and organized.</p>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md h-12 px-6 font-bold text-base" onClick={() => setUploadOpen(true)}>
                                    <Upload className="h-5 w-5 mr-2" />
                                    Upload First Document
                                </Button>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
