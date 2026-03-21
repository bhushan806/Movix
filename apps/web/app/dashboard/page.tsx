'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { CardSkeleton } from '@/components/ui/skeleton';

export default function DashboardRedirect() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/auth/login');
            } else {
                const rolePath = user.role.toLowerCase();
                router.push(`/dashboard/${rolePath}`);
            }
        }
    }, [user, loading, router]);

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-sm space-y-4">
                <CardSkeleton />
                <p className="text-center text-slate-400 font-medium animate-pulse">Loading your workspace...</p>
            </div>
        </div>
    );
}
