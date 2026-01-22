'use client';

import { useState, useEffect } from 'react';
import { graphql, GET_CRAWL_JOBS, CrawlJob } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CrawlJobsPage() {
    const [crawlJobs, setCrawlJobs] = useState<CrawlJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAppId, setSelectedAppId] = useState<string>('');

    useEffect(() => {
        loadCrawlJobs();
    }, [selectedAppId]);

    const loadCrawlJobs = async () => {
        try {
            const variables: any = { limit: 50 };
            if (selectedAppId) {
                variables.appId = selectedAppId;
            }
            const data = await graphql.request<{ crawlJobs: CrawlJob[] }>(GET_CRAWL_JOBS, variables);
            setCrawlJobs(data.crawlJobs);
        } catch (error) {
            console.error('Failed to load crawl jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusColors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            running: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                {status.toUpperCase()}
            </span>
        );
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex flex-col gap-6">
                {/* Page Header */}
                <div className="flex flex-wrap items-center gap-5 justify-between">
                    <div className="flex flex-col justify-center gap-2">
                        <h1 className="text-xl font-semibold leading-none text-gray-900">
                            Crawl Jobs
                        </h1>
                        <div className="flex items-center flex-wrap gap-1.5 font-medium">
                            <span className="text-md text-gray-600">
                                Monitor crawl job status and history
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <Link href="/crawler">
                            <Button variant="outline" size="sm">
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Crawl Jobs Table */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">All Crawl Jobs</h3>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-auto">
                                <thead>
                                    <tr>
                                        <th className="min-w-[150px]">Job ID</th>
                                        <th className="min-w-[100px]">Status</th>
                                        <th className="min-w-[150px]">Start Time</th>
                                        <th className="min-w-[150px]">End Time</th>
                                        <th className="min-w-[100px]">Pages</th>
                                        <th className="min-w-[100px]">Errors</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-10 text-gray-500">
                                                Loading crawl jobs...
                                            </td>
                                        </tr>
                                    ) : crawlJobs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-10 text-gray-500">
                                                No crawl jobs found
                                            </td>
                                        </tr>
                                    ) : (
                                        crawlJobs.map((job) => (
                                            <tr key={job.id}>
                                                <td className="font-mono text-xs text-gray-600">
                                                    {job.id.substring(0, 8)}...
                                                </td>
                                                <td>{getStatusBadge(job.status)}</td>
                                                <td className="text-gray-600">
                                                    {job.startTime ? new Date(job.startTime).toLocaleString() : '-'}
                                                </td>
                                                <td className="text-gray-600">
                                                    {job.endTime ? new Date(job.endTime).toLocaleString() : '-'}
                                                </td>
                                                <td className="text-gray-900 font-medium">
                                                    {job.pagesProcessed || 0}
                                                </td>
                                                <td>
                                                    {job.errors && job.errors.length > 0 ? (
                                                        <span className="text-red-600 font-medium">
                                                            {job.errors.length}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">0</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
