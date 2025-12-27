import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Configuración de Axios para incluir cookies
    axios.defaults.withCredentials = true;

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const res = await axios.get(`${apiBaseUrl}/api/auth/me`);
            if (res.data.success) {
                setUser(res.data.user);
            }
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        console.log('🔵 LOGIN ATTEMPT - API URL:', apiBaseUrl);
        console.log('🔵 LOGIN DATA:', { email, password: '***' });
        try {
            const res = await axios.post(`${apiBaseUrl}/api/auth/login`, { email, password });
            console.log('✅ LOGIN SUCCESS:', res.data);
            if (res.data.success) {
                setUser(res.data.user);
            }
        } catch (error: any) {
            console.error('❌ LOGIN ERROR:', error);
            console.error('❌ ERROR RESPONSE:', error.response?.data);
            throw error;
        }
    };


    const register = async (email: string, password: string, name: string) => {
        const res = await axios.post(`${apiBaseUrl}/api/auth/register`, { email, password, name });
        if (res.data.success) {
            setUser(res.data.user);
        }
    };

    const logout = async () => {
        await axios.post(`${apiBaseUrl}/api/auth/logout`);
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};
