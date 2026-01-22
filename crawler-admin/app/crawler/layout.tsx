'use client';

import { SimpleLayout } from '@/components/layouts/simple-layout';
import { ReactNode, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/api';

export default function CrawlerLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/auth/login');
            } else {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-sm text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <SimpleLayout>
            {children}
        </SimpleLayout>
    );
}
