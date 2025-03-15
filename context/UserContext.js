"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import jwtDecode from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const router = useRouter();
    const { data: session } = useSession();

    // Decode token and set user data
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                console.log(decodedUser)
                setUser(decodedUser);
            } catch (error) {
                console.error('Invalid token:', error);
                logout();
            }
        }
    }, []);

    // Login function
    const login = (token) => {
        localStorage.setItem('token', token);
        const decodedUser = jwtDecode(token);
        console.log("decodedUser, login", decodedUser);
        setUser(decodedUser);
        // router.push('/dashboard');
    };

    const setSession = (session) => {
        if (session) {
            const decodedUser = jwtDecode(session.customToken);
            localStorage.setItem('token', session.customToken);
            console.log(decodedUser);
            setUser(decodedUser);
        }
    }

    // Logout function
    const logout = async () => {
        localStorage.removeItem('token');
        if (session){
            await signOut({ callbackUrl: '/signin' });
        }
        setUser(null);
        router.push('/signin');
    };

    return (
        <UserContext.Provider value={{ user, login, logout, setSession }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook for easy access
export const useUser = () => useContext(UserContext);
