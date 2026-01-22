'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SimpleLayoutProps {
    children: React.ReactNode;
}

export function SimpleLayout({ children }: SimpleLayoutProps) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        {
            title: 'Applications',
            href: '/crawler',
            icon: LayoutDashboard
        },
        {
            title: 'User Management',
            href: '/crawler/users',
            icon: Users
        }
    ];

    const isActive = (href: string) => {
        if (href === '/crawler' && pathname === '/crawler') return true;
        if (href !== '/crawler' && pathname.startsWith(href)) return true;
        return false;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-white border-b p-4 flex items-center justify-between">
                <span className="font-bold text-lg">Crawler Admin</span>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    <Menu className="h-6 w-6" />
                </Button>
            </div>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-full flex flex-col p-4">
                    <div className="h-16 flex items-center px-2 mb-6 hidden md:flex">
                        <span className="font-bold text-xl tracking-tight">Crawler Admin</span>
                    </div>

                    <nav className="space-y-1 flex-1">
                        {navItems.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                        flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                                        ${active
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                                    `}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="pt-4 border-t mt-auto">
                        <Link href="/auth/login">
                            <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50">
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </Button>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
