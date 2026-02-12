'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@anandibi/ui';
import { useAuth } from '@/providers/auth-provider';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
    const { login, user } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (user) {
        router.replace('/');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 animate-fade-in">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 text-white text-xl font-bold mb-4">
                        A
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
                    <p className="text-slate-500 mt-1">Sign in to your Anandibi account</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200 animate-scale-in">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                            <Input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
                            {loading ? (
                                <span className="animate-pulse">Signing in...</span>
                            ) : (
                                <>
                                    <LogIn className="h-4 w-4" /> Sign In
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                <p className="text-center text-sm text-slate-500 mt-6">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="text-brand-600 font-medium hover:underline">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}
