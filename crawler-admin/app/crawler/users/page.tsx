'use client';

import { useState, useEffect } from 'react';
import { graphql, GET_USERS, CREATE_USER, User, CreateUserInput } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newUser, setNewUser] = useState<CreateUserInput>({ email: '', password: '', fullName: '' });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await graphql.request<{ users: User[] }>(GET_USERS);
            setUsers(data.users);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            await graphql.request(CREATE_USER, {
                input: newUser
            });
            setShowCreateForm(false);
            setNewUser({ email: '', password: '', fullName: '' });
            loadUsers();
            alert('User created successfully');
        } catch (error) {
            console.error('Failed to create user:', error);
            alert('Failed to create user');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex flex-col gap-6">
                {/* Page Header */}
                <div className="flex flex-wrap items-center gap-5 justify-between">
                    <div className="flex flex-col justify-center gap-2">
                        <h1 className="text-xl font-semibold leading-none text-gray-900">
                            User Management
                        </h1>
                        <div className="flex items-center flex-wrap gap-1.5 font-medium">
                            <span className="text-md text-gray-600">
                                View and manage system users
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setShowCreateForm(!showCreateForm)}
                        >
                            + New User
                        </Button>
                        <Link href="/crawler">
                            <Button variant="outline" size="sm">
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Create User Form */}
                {showCreateForm && (
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Create New User</h3>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleCreateUser} className="flex flex-col gap-5">
                                <div className="flex flex-col gap-1">
                                    <label className="form-label">Email</label>
                                    <Input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        required
                                        placeholder="user@example.com"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="form-label">Full Name</label>
                                    <Input
                                        type="text"
                                        value={newUser.fullName}
                                        onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="form-label">Password</label>
                                    <Input
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        required
                                        minLength={6}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="flex gap-2.5">
                                    <Button type="submit" variant="primary" size="sm" disabled={creating}>
                                        {creating ? 'Creating...' : 'Create User'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setShowCreateForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Users Table */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">All Users</h3>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-auto">
                                <thead>
                                    <tr>
                                        <th className="min-w-[200px]">Email</th>
                                        <th className="min-w-[150px]">Created At</th>
                                        <th className="min-w-[150px]">Last Sign In</th>
                                        <th className="min-w-[100px]">ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="font-medium text-gray-900">{user.email}</td>
                                            <td className="text-gray-600">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="text-gray-600">
                                                {user.lastSignInAt
                                                    ? new Date(user.lastSignInAt).toLocaleString()
                                                    : 'Never'}
                                            </td>
                                            <td className="text-gray-400 text-xs font-mono">{user.id}</td>
                                        </tr>
                                    ))}
                                    {!loading && users.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center py-10 text-gray-500">
                                                No users found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            {loading && (
                                <div className="text-center py-10 text-gray-500">
                                    Loading users...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
