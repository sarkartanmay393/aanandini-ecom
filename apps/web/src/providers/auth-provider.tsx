'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '@/lib/api';

interface AuthState {
    user: api.User | null;
    token: string | null;
    isLoading: boolean;
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    loginWithOtp: (phone: string, code: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isLoading: true,
    });

    useEffect(() => {
        const token = localStorage.getItem('aanandini_token');
        const userStr = localStorage.getItem('aanandini_user');
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                setState({ user, token, isLoading: false });
            } catch {
                localStorage.removeItem('aanandini_token');
                localStorage.removeItem('aanandini_user');
                setState({ user: null, token: null, isLoading: false });
            }
        } else {
            setState((s) => ({ ...s, isLoading: false }));
        }
    }, []);

    const setAuth = useCallback((res: any) => {
        localStorage.setItem('aanandini_token', res.accessToken);
        localStorage.setItem('aanandini_user', JSON.stringify(res.user));
        setState({ user: res.user, token: res.accessToken, isLoading: false });
    }, []);

    const loginFn = useCallback(async (email: string, password: string) => {
        const res = await api.login(email, password);
        setAuth(res);
    }, [setAuth]);

    const registerFn = useCallback(async (name: string, email: string, password: string) => {
        const res = await api.register(name, email, password);
        setAuth(res);
    }, [setAuth]);

    const loginWithOtpFn = useCallback(async (phone: string, code: string) => {
        const res = await api.verifyOtp(phone, code);
        setAuth(res);
    }, [setAuth]);

    const logout = useCallback(() => {
        localStorage.removeItem('aanandini_token');
        localStorage.removeItem('aanandini_user');
        setState({ user: null, token: null, isLoading: false });
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, login: loginFn, register: registerFn, loginWithOtp: loginWithOtpFn, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
