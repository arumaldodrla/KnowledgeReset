'use client';

import { useState, useEffect } from 'react';
import { graphql } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CrawlerSetting {
    id: string;
    settingKey: string;
    settingValue: string;
    description: string;
}

const GET_SETTINGS = `
    query GetCrawlerSettings {
        crawlerSettings {
            id
            settingKey
            settingValue
            description
        }
    }
`;

const UPDATE_SETTING = `
    mutation UpdateSetting($input: UpdateSettingInput!) {
        updateCrawlerSetting(input: $input) {
            id
            settingKey
            settingValue
        }
    }
`;

export default function SettingsPage() {
    const [settings, setSettings] = useState<Record<string, CrawlerSetting>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formValues, setFormValues] = useState({
        max_depth: '50',
        max_pages: '100',
        timeout: '30',
        concurrent_requests: '5',
        respect_robots_txt: 'true',
        user_agent: 'KnowledgeReset Crawler/1.0',
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await graphql.request<{ crawlerSettings: CrawlerSetting[] }>(GET_SETTINGS);
            const settingsMap: Record<string, CrawlerSetting> = {};
            const values: Record<string, string> = {};

            data.crawlerSettings.forEach(setting => {
                settingsMap[setting.settingKey] = setting;
                values[setting.settingKey] = setting.settingValue;
            });

            setSettings(settingsMap);
            setFormValues(prev => ({ ...prev, ...values }));
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Update each setting
            for (const [key, value] of Object.entries(formValues)) {
                await graphql.request(UPDATE_SETTING, {
                    input: { key, value }
                });
            }

            alert('Settings saved successfully!');
            loadSettings();
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex flex-col gap-6">
                {/* Page Header */}
                <div className="flex flex-wrap items-center gap-5 justify-between">
                    <div className="flex flex-col justify-center gap-2">
                        <h1 className="text-xl font-semibold leading-none text-gray-900">
                            Crawler Settings
                        </h1>
                        <div className="flex items-center flex-wrap gap-1.5 font-medium">
                            <span className="text-md text-gray-600">
                                Configure crawler behavior and limits
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

                {/* Settings Form */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Crawler Configuration</h3>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center py-10 text-gray-500">
                                Loading settings...
                            </div>
                        ) : (
                            <form onSubmit={handleSave} className="flex flex-col gap-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Max Depth */}
                                    <div className="flex flex-col gap-1">
                                        <label className="form-label">Max Crawl Depth</label>
                                        <Input
                                            type="number"
                                            value={formValues.max_depth}
                                            onChange={(e) => setFormValues({ ...formValues, max_depth: e.target.value })}
                                            min="1"
                                            max="100"
                                        />
                                        <span className="text-xs text-gray-500">
                                            {settings.max_depth?.description || 'Maximum depth to follow links'}
                                        </span>
                                    </div>

                                    {/* Max Pages */}
                                    <div className="flex flex-col gap-1">
                                        <label className="form-label">Max Pages Per Crawl</label>
                                        <Input
                                            type="number"
                                            value={formValues.max_pages}
                                            onChange={(e) => setFormValues({ ...formValues, max_pages: e.target.value })}
                                            min="1"
                                            max="10000"
                                        />
                                        <span className="text-xs text-gray-500">
                                            {settings.max_pages?.description || 'Maximum pages to crawl per job'}
                                        </span>
                                    </div>

                                    {/* Timeout */}
                                    <div className="flex flex-col gap-1">
                                        <label className="form-label">Request Timeout (seconds)</label>
                                        <Input
                                            type="number"
                                            value={formValues.timeout}
                                            onChange={(e) => setFormValues({ ...formValues, timeout: e.target.value })}
                                            min="5"
                                            max="120"
                                        />
                                        <span className="text-xs text-gray-500">
                                            {settings.timeout?.description || 'Request timeout in seconds'}
                                        </span>
                                    </div>

                                    {/* Concurrent Requests */}
                                    <div className="flex flex-col gap-1">
                                        <label className="form-label">Concurrent Requests</label>
                                        <Input
                                            type="number"
                                            value={formValues.concurrent_requests}
                                            onChange={(e) => setFormValues({ ...formValues, concurrent_requests: e.target.value })}
                                            min="1"
                                            max="20"
                                        />
                                        <span className="text-xs text-gray-500">
                                            {settings.concurrent_requests?.description || 'Number of parallel requests'}
                                        </span>
                                    </div>

                                    {/* Respect Robots.txt */}
                                    <div className="flex flex-col gap-1">
                                        <label className="form-label">Respect Robots.txt</label>
                                        <select
                                            className="input"
                                            value={formValues.respect_robots_txt}
                                            onChange={(e) => setFormValues({ ...formValues, respect_robots_txt: e.target.value })}
                                        >
                                            <option value="true">Yes</option>
                                            <option value="false">No</option>
                                        </select>
                                        <span className="text-xs text-gray-500">
                                            {settings.respect_robots_txt?.description || 'Follow robots.txt rules'}
                                        </span>
                                    </div>

                                    {/* User Agent */}
                                    <div className="flex flex-col gap-1">
                                        <label className="form-label">User Agent</label>
                                        <Input
                                            type="text"
                                            value={formValues.user_agent}
                                            onChange={(e) => setFormValues({ ...formValues, user_agent: e.target.value })}
                                        />
                                        <span className="text-xs text-gray-500">
                                            {settings.user_agent?.description || 'Custom user agent string'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2.5 pt-4 border-t">
                                    <Button type="submit" variant="primary" size="sm" disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Settings'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={loadSettings}
                                        disabled={saving}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
