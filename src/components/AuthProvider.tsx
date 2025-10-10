// src/components/AuthProvider.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import apiClient from '../services/api';
import { jwtDecode } from 'jwt-decode'; // Installez jwt-decode: npm install jwt-decode
import type { User } from '../types';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');

            if (token) {
                try {
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    const response = await apiClient.get('/auth/profile');
                    const currentUser = response.data;

                    setUser(currentUser);

                } catch (error) {
                    console.error("Session invalide, déconnexion.");
                    localStorage.removeItem('token');
                    setUser(null);
                    delete apiClient.defaults.headers.common['Authorization'];
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const login = useCallback((token: string) => {
        localStorage.setItem('token', token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const decodedToken: any = jwtDecode(token);
        const loggedInUser: User = {
            id: decodedToken.id,
            email: decodedToken.sub,
            firstName: decodedToken.firstName,
            lastName: decodedToken.lastName,
            role: decodedToken.role,
            bio: decodedToken.bio
        };
        setUser(loggedInUser);
    }, []);


    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
        delete apiClient.defaults.headers.common['Authorization'];
        // Rediriger vers la page de connexion pour une déconnexion propre
        window.location.href = '/login';
    }, []);

    const updateUser = (updatedUserData: Partial<User>) => {
        setUser(currentUser => {
            if (!currentUser) return null;
            return { ...currentUser, ...updatedUserData };
        });
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}
