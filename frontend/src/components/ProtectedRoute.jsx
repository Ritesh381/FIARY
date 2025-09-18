import { Navigate } from 'react-router-dom';
import api from '../api/AuthCalls';
import { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';

const ProtectedRoute = ({ children }) => {
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const isMounted = useRef(true);
    const dispatch = useDispatch()

    useEffect(() => {
        isMounted.current = true;

        const checkAuthentication = async () => {
            try {
                const response = await api.checkAuth(dispatch);
                if (isMounted.current) {
                    // Check for a successful response status (axios handles 200-299)
                    if (response.status === 200) {
                        setAuthenticated(true);
                    } else {
                        // This case is unlikely with axios, as it would throw for other statuses
                        setAuthenticated(false);
                    }
                }
            } catch (error) {
                // If the request fails (e.g., 401 Unauthorized), the catch block runs.
                if (isMounted.current) {
                    console.error("Authentication check failed:", error);
                    setAuthenticated(false);
                }
            } finally {
                // Set loading to false once the check is complete, regardless of outcome.
                if (isMounted.current) {
                    setLoading(false);
                }
            }
        };

        checkAuthentication();

        // Cleanup function to prevent state updates on unmounted component
        return () => {
            isMounted.current = false;
        };
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-white">Loading...</div>;
    }

    if (!authenticated) {
        return <Navigate to="/signin" replace />;
    }

    return children;
};

export default ProtectedRoute;
