import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        try {
            return stored ? JSON.parse(stored) : null;
        } catch {
            localStorage.removeItem('user');
            return null;
        }
    });

    const login = (userData) => {
        const enhancedUser = {
            ...userData,
            loginTime: new Date().toISOString(),
            isAuthenticated: true
        };
        setUser(enhancedUser);
        localStorage.setItem('user', JSON.stringify(enhancedUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const checkSession = () => {
        if (user?.loginTime) {
            const loginTime = new Date(user.loginTime).getTime();
            const now = new Date().getTime();
            const hoursPassed = (now - loginTime) / (1000 * 60 * 60);

            if (hoursPassed > 24) {
                logout();
                return false;
            }
            return true;
        }
        return false;
    };

    useEffect(() => {
        const interval = setInterval(checkSession, 1000 * 60 * 5); // Check every 5 minutes
        return () => clearInterval(interval);
    }, [user]);

    const updateUser = (updates) => {
        if (user && checkSession()) {
            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    const value = {
        user,
        isAuthenticated: !!user && checkSession(),
        login,
        logout,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;