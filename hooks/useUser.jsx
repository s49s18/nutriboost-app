import {useContext } from 'react';
import { UserContext } from '../contexts/UserContexts';

export function useUser() {
    const context = useContext(UserContext); // grabs all the variables provided by the UserContext (user, login, register, logout)
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
