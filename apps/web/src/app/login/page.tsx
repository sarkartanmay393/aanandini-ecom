'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import * as api from '@/lib/api';
import { ArrowLeft, Phone, MessageSquare, Loader2 } from 'lucide-react';
import { Button, Input } from '@aanandini/ui';

type Step = 'phone' | 'otp' | 'email';

export default function LoginPage() {
    const { loginWithOtp, login } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState<Step>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);

    const startCountdown = () => {
        setCountdown(30);
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length !== 10) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.sendOtp(phone);
            setStep('otp');
            startCountdown();
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('Please enter the 6-digit OTP');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await loginWithOtp(phone, otp);
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (countdown > 0) return;
        setLoading(true);
        setError('');
        try {
            await api.sendOtp(phone);
            startCountdown();
        } catch (err: any) {
            setError(err.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
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
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors mb-8"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to store
                </Link>

                <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <h1 className="font-serif text-3xl text-stone-900 mb-2">Aanandini</h1>
                        <p className="text-sm text-stone-500">Premium Saree Collection</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-100 mb-6">
                            {error}
                        </div>
                    )}

                    {/* Phone Step */}
                    {step === 'phone' && (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">
                                    Mobile Number
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 px-3 py-2.5 bg-stone-100 rounded-lg text-sm font-medium text-stone-600 shrink-0">
                                        🇮🇳 +91
                                    </div>
                                    <Input
                                        type="tel"
                                        placeholder="Enter 10-digit number"
                                        value={phone}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setPhone(val);
                                        }}
                                        className="flex-1"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || phone.length !== 10}
                                className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3 rounded-xl font-medium gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Phone className="h-4 w-4" />
                                )}
                                Send OTP
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-stone-200" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-4 text-xs text-stone-400 uppercase tracking-wider">or</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setStep('email')}
                                className="w-full py-3 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                            >
                                Login with Email & Password
                            </button>
                        </form>
                    )}

                    {/* OTP Step */}
                    {step === 'otp' && (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div className="text-center mb-4">
                                <div className="h-12 w-12 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-3">
                                    <MessageSquare className="h-6 w-6 text-brand-700" />
                                </div>
                                <p className="text-sm text-stone-600">
                                    We sent a 6-digit OTP to <br />
                                    <span className="font-semibold text-stone-900">+91 {phone}</span>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">
                                    Enter OTP
                                </label>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                        setOtp(val);
                                    }}
                                    className="text-center text-2xl tracking-[0.5em] font-mono"
                                    autoFocus
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3 rounded-xl font-medium gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    'Verify & Continue'
                                )}
                            </Button>

                            <div className="flex items-center justify-between text-sm">
                                <button
                                    type="button"
                                    onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                                    className="text-stone-500 hover:text-stone-900 transition-colors"
                                >
                                    ← Change Number
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={countdown > 0 || loading}
                                    className={`transition-colors ${countdown > 0 ? 'text-stone-400 cursor-not-allowed' : 'text-brand-700 hover:text-brand-900 font-medium'}`}
                                >
                                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Email Step (Fallback) */}
                    {step === 'email' && (
                        <form onSubmit={handleEmailLogin} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3 rounded-xl font-medium"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Login'}
                            </Button>

                            <button
                                type="button"
                                onClick={() => { setStep('phone'); setError(''); }}
                                className="w-full text-center text-sm text-stone-500 hover:text-stone-900 transition-colors"
                            >
                                ← Back to phone login
                            </button>
                        </form>
                    )}

                    {/* Register link */}
                    {step !== 'otp' && (
                        <p className="text-center text-sm text-stone-500 mt-6">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="text-brand-700 font-medium hover:underline">
                                Register
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
