"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import jwtDecode from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);

    // Decode token and set user data
    useEffect(() => {
        const fetchUser = async () => {
            
            const token = localStorage.getItem('token');
            if (token) {
                setLoading(true);
                try {
                    const decodedUser = jwtDecode(token);
                    console.log("decodedUser", decodedUser);
                    const res = await axios.get(`/api/${decodedUser.userId || decodedUser._id}`);
                    console.log("context uerer by id", res.data);
                    if (res.data.user) {
                        // const decodedUser = jwtDecode(res.data.token);
                        setUser(res.data.user); // Set user data from the API
                    } else {
                        setUser(decodedUser); // Fallback to decoded token data
                    }
                } catch (error) {
                    console.error('Invalid token or API error:', error);
                    logout(); // Logout if token is invalid or API fails
                }finally{
                    setLoading(false);
                }
            }
        };

        fetchUser();
    }, [router]);

    // Login function
    const login = (token) => {
        console.log("token", jwtDecode(token));
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
            console.log("session user", decodedUser);
            setUser(decodedUser);
        }
    }

    // Logout function
    const logout = async () => {
        localStorage.removeItem('token');
        setUser(null);
        
            await signOut({ callbackUrl: '/signin', redirect: false });
            await fetch('/api/auth/session?update'); 
            router.push('/signin');
        
    };

    return (
        <UserContext.Provider value={{ user, login, logout, setSession, loading }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook for easy access
export const useUser = () => useContext(UserContext);


// "use client";
// import React, { createContext, useContext, useEffect, useState } from 'react';
// import jwtDecode from 'jwt-decode';
// import { useRouter } from 'next/navigation';
// import { signOut, useSession } from 'next-auth/react';
// import axios from 'axios';

// const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true); // Add loading state
//     const router = useRouter();
//     const { data: session, status } = useSession();

//     // Decode token and set user data
//     useEffect(() => {
//         const fetchUser = async () => {
//             try {
//                 const token = localStorage.getItem('token');
//                 if (token) {
//                     const decodedUser = jwtDecode(token);
//                     try {
//                         const res = await axios.get(`/api/users/${decodedUser.userId || decodedUser._id}`);
//                         if (res.data.user) {
//                             setUser(res.data.user);
//                         } else {
//                             setUser(decodedUser);
//                         }
//                     } catch (apiError) {
//                         console.error('API error:', apiError);
//                         setUser(decodedUser);
//                     }
//                 } else if (session?.customToken) {
//                     // Handle NextAuth session with custom token
//                     const decodedUser = jwtDecode(session.customToken);
//                     localStorage.setItem('token', session.customToken);
//                     setUser(decodedUser);
//                 }
//             } catch (error) {
//                 console.error('Authentication error:', error);
//                 logout();
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchUser();
//     }, [session, status]);

//     const login = (token) => {
//         localStorage.setItem('token', token);
//         const decodedUser = jwtDecode(token);
//         setUser(decodedUser);
//     };

//     const logout = async () => {
//         localStorage.removeItem('token');
//         setUser(null);
//         if (session) {
//             await signOut({ callbackUrl: '/signin' });
//         } else {
//             router.push('/signin');
//         }
//     };

//     return (
//         <UserContext.Provider value={{ user, login, logout, loading }}>
//             {children}
//         </UserContext.Provider>
//     );
// };

// export const useUser = () => useContext(UserContext);