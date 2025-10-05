// src/contexts/AuthContext.ts
import { createContext } from 'react';
import type { User } from '../types';

export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
    updateUser: (updatedUserData: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
