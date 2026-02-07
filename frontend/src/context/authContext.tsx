import React from 'react';

import { authAPI } from '../services/api.tsx';

export const AuthContext = React.createContext<any>(null);

export const AuthProvider = ({ children }: { children: any }) => {
    const [error, setError] = React.useState<string | null>(null);
    const [userToken, setUserToken] = React.useState<string | null>(() => localStorage.getItem('token'));
    const [user, setUser] = React.useState<any | null>(() => {
        const savedUser = localStorage.getItem('user');
        try {
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = React.useState<boolean>(!(userToken && user));

    React.useEffect(() => {
        const storedToken: string | null = localStorage.getItem('token');
        const storedUser: string | null = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setUserToken(storedToken);
            setUser(JSON.parse(storedUser));
        }

        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setError(null);

            const res = await authAPI.login(email, password);
            
            const { token, user } = res.data;

            if (!token || !user) {
                throw new Error('Invalid response structure: missing token or user');
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setUserToken(token);
            setUser(user);

            return { success: true, user }
        } catch (err: any) {
            console.error('Login Error:', err);
            const message: string | 'Login Failed' = err.response?.data?.message || err.message || 'Login Failed';
            setError(message);
            return { success: false, error: message }
        }
    }

    const logout = async () => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            setUserToken(null);
            setUser(null);
            setError(null);
        } catch (err: any) {
            console.error(err);
        }
    }

    const register = async (fullName: string, email: string, password: string, role: 'admin' | 'project-lead' | 'developer') => {
        try {
            setError(null);

            const res = await authAPI.register({fullName, email, password, role});
            
            const {token, user} = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setUserToken(token);
            setUser(user);

            return { success: true, user };
        } catch (err: any) {
            const message = err.response?.data?.message || 'Registration failed';
            setError(message);
            return { success: false, error: message };
        }
    }

    const isAuthenticated = !!(user && userToken);

    const value = {
        userToken, user, loading, error,
        setUser, setLoading, setError, setUserToken,
        login, logout, register,
        isAuthenticated
    }

    return (
        <AuthContext.Provider value={ value }>
            { children }
        </AuthContext.Provider>
    )
}