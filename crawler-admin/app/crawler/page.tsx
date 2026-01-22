'use client';

import { useState, useEffect } from 'react';
import { graphql, GET_APPLICATIONS, GET_CRAWL_JOBS, Application, CrawlJob } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CrawlerDashboard() {
    const [stats, setStats] = useState({
        totalApplications: 0,
        totalJobs: 0,
        runningJobs: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [appsData, jobsData] = await Promise.all([
                graphql.request<{ applications: Application[] }>(GET_APPLICATIONS),
                graphql.request<{ crawlJobs: CrawlJob[] }>(GET_CRAWL_JOBS, { limit: 100 }),
            ]);

            setStats({
                totalApplications: appsData.applications.length,
                totalJobs: jobsData.crawlJobs.length,
                runningJobs: jobsData.crawlJobs.filter(j => j.status === 'running').length,
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const navigationCards = [
        {
            title: 'Applications',
            description: 'Manage documentation sites and knowledge bases',
            icon: '📚',
            href: '/crawler/applications',
            stat: `${stats.totalApplications} apps`,
        },
        {
            title: 'Crawl Jobs',
            description: 'Monitor crawl job status and history',
            icon: '🔄',
            href: '/crawler/jobs',
            stat: `${stats.runningJobs} running`,
        },
        {
            title: 'Users',
            description: 'Manage system users and permissions',
            icon: '👥',
            href: '/crawler/users',
            stat: 'User management',
        },
        {
            title: 'Settings',
            description: 'Configure crawler behavior and limits',
            icon: '⚙️',
            href: '/crawler/settings',
            stat: 'Configuration',
        },
    ];

    return (
        <div className="container mx-auto py-6">
            <div className="flex flex-col gap-6">
                {/* Page Header */}
                <div className="flex flex-col justify-center gap-2">
                    <h1 className="text-2xl font-semibold leading-none text-gray-900">
                        Crawler Management
                    </h1>
                    <p className="text-md text-gray-600">
                        Manage documentation crawling and knowledge base indexing
                    </p>
                </div>

                {/* Stats Cards */}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="card">
                            <div className="card-body">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Applications</p>
                                        <p className="text-2xl font-semibold text-gray-900">{stats.totalApplications}</p>
                                    </div>
                                    <div className="text-3xl">📚</div>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-body">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Crawl Jobs</p>
                                        <p className="text-2xl font-semibold text-gray-900">{stats.totalJobs}</p>
                                    </div>
                                    <div className="text-3xl">🔄</div>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-body">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Running Jobs</p>
                                        <p className="text-2xl font-semibold text-gray-900">{stats.runningJobs}</p>
                                    </div>
                                    <div className="text-3xl">▶️</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {navigationCards.map((card) => (
                        <Link key={card.href} href={card.href}>
                            <div className="card hover:shadow-lg transition-shadow cursor-pointer h-full">
                                <div className="card-body">
                                    <div className="flex items-start gap-4">
                                        <div className="text-4xl">{card.icon}</div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                {card.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {card.description}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {card.stat}
                                            </p>
                                        </div>
                                        <div className="text-gray-400">→</div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
