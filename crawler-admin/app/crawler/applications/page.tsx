'use client';

import { useState, useEffect } from 'react';
import { graphql, GET_APPLICATIONS, CREATE_APPLICATION, Application, CreateApplicationInput } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DELETE_APPLICATION = `
    mutation DeleteApplication($appId: ID!) {
        deleteApplication(appId: $appId)
    }
`;

const START_CRAWL = `
  mutation StartCrawl($appId: String!, $url: String, $maxDepth: Int, $maxPages: Int) {
    startCrawl(appId: $appId, url: $url, maxDepth: $maxDepth, maxPages: $maxPages) {
      jobId
      status
      message
    }
  }
`;

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewAppForm, setShowNewAppForm] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [startingCrawlId, setStartingCrawlId] = useState<string | null>(null);

    // Form states
    const [newApp, setNewApp] = useState<CreateApplicationInput>({
        name: '',
        urlDocBase: '',
        description: '',
    });

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        try {
            const data = await graphql.request<{ applications: Application[] }>(GET_APPLICATIONS);
            setApplications(data.applications);
        } catch (error) {
            console.error('Failed to load applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateApp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await graphql.request(CREATE_APPLICATION, {
                input: newApp,
            });
            setNewApp({ name: '', urlDocBase: '', description: '' });
            setShowNewAppForm(false);
            loadApplications();
            alert('Application created successfully!');
        } catch (error) {
            console.error('Failed to create application:', error);
            alert('Failed to create application');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteApp = async (appId: string, appName: string) => {
        if (!confirm(`Are you sure you want to delete "${appName}"? This will also delete all related crawl jobs and documents.`)) {
            return;
        }

        setDeletingId(appId);
        try {
            await graphql.request(DELETE_APPLICATION, { appId });
            alert('Application deleted successfully!');
            loadApplications();
        } catch (error) {
            console.error('Failed to delete application:', error);
            alert('Failed to delete application');
        } finally {
            setDeletingId(null);
        }
    };

    const handleStartCrawl = async (appId: string, url: string) => {
        setStartingCrawlId(appId);
        try {
            await graphql.request(START_CRAWL, {
                appId,
                url,
                maxDepth: 50,
                maxPages: 100,
            });
            alert('Crawl started successfully!');
        } catch (error) {
            console.error('Failed to start crawl:', error);
            alert('Failed to start crawl');
        } finally {
            setStartingCrawlId(null);
        }
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex flex-col gap-6">
                {/* Page Header */}
                <div className="flex flex-wrap items-center gap-5 justify-between">
                    <div className="flex flex-col justify-center gap-2">
                        <h1 className="text-xl font-semibold leading-none text-gray-900">
                            Applications
                        </h1>
                        <div className="flex items-center flex-wrap gap-1.5 font-medium">
                            <span className="text-md text-gray-600">
                                Manage documentation sites and knowledge bases
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <Link href="/crawler">
                            <Button variant="outline" size="sm">
                                Back to Dashboard
                            </Button>
                        </Link>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setShowNewAppForm(!showNewAppForm)}
                        >
                            + New Application
                        </Button>
                    </div>
                </div>

                {/* New Application Form */}
                {showNewAppForm && (
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Add New Application</h3>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleCreateApp} className="flex flex-col gap-5">
                                <div className="flex flex-col gap-1">
                                    <label className="form-label">Name</label>
                                    <Input
                                        type="text"
                                        value={newApp.name}
                                        onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
                                        required
                                        placeholder="e.g., Zoho CRM Docs"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="form-label">Documentation URL</label>
                                    <Input
                                        type="url"
                                        value={newApp.urlDocBase}
                                        onChange={(e) => setNewApp({ ...newApp, urlDocBase: e.target.value })}
                                        required
                                        placeholder="https://docs.example.com"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="form-label">Description (Optional)</label>
                                    <Input
                                        type="text"
                                        value={newApp.description || ''}
                                        onChange={(e) => setNewApp({ ...newApp, description: e.target.value })}
                                        placeholder="Brief description of this knowledge base"
                                    />
                                </div>
                                <div className="flex gap-2.5">
                                    <Button type="submit" variant="primary" size="sm" disabled={loading}>
                                        {loading ? 'Creating...' : 'Create Application'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setShowNewAppForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Applications List */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">All Applications</h3>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center py-10 text-gray-500">
                                Loading applications...
                            </div>
                        ) : applications.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                No applications found. Create one to get started!
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {applications.map((app) => (
                                    <div key={app.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex flex-col gap-3">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{app.name}</h4>
                                                {app.description && (
                                                    <p className="text-sm text-gray-600 mt-1">{app.description}</p>
                                                )}
                                                <a
                                                    href={app.urlDocBase}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-600 hover:underline mt-1 block truncate"
                                                >
                                                    {app.urlDocBase}
                                                </a>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleStartCrawl(app.id, app.urlDocBase)}
                                                    disabled={startingCrawlId === app.id}
                                                    className="w-full"
                                                >
                                                    {startingCrawlId === app.id ? 'Starting...' : '▶ Start Crawl'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteApp(app.id, app.name)}
                                                    disabled={deletingId === app.id}
                                                    className="w-full text-red-600 hover:bg-red-50"
                                                >
                                                    {deletingId === app.id ? 'Deleting...' : '🗑️ Delete'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
