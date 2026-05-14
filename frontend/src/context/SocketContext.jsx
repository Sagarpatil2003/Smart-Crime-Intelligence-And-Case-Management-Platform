import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import useAuth from "../features/auth/hooks/useAuth";
import { toast } from "react-hot-toast";

export const SocketContext = createContext();
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const SocketProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Centralized handler to update state and show toasts
    const handleIncomingNotification = (data, customTitle, isError = false) => {
        const title = customTitle || data.title || "System Update";
        const message = data.message || "New activity detected.";
        
        if (isError) {
            toast.error(`${title}: ${message}`, { duration: 6000 });
        } else {
            toast.success(`${title}: ${message}`);
        }

        // Add to the list and increment badge
        setNotifications(prev => [data, ...prev]);
        setUnreadCount(prev => prev + 1);
    };

    useEffect(() => {
        let newSocket;

        if (isAuthenticated && user?._id) {
            newSocket = io(SOCKET_URL, {
                withCredentials: true,
                auth: { token: localStorage.getItem("accessToken") },
                transports: ["websocket"]
            });

            newSocket.emit("register", user._id);

            // 1. Standard Status Updates & Legal Comments
            newSocket.on("notification", (data) => {
                handleIncomingNotification(data);
            });

            // 2. New Case Assignments (From alertService.sendAssignmentNotification)
            newSocket.on("new_assignment", (data) => {
                handleIncomingNotification(data, "New Assignment 🚨");
            });

            // 3. Proximity Crime Alerts (From alertService.sendClusterAlert)
            newSocket.on("crime_alert", (data) => {
                handleIncomingNotification(data, "Safety Alert ⚠️", true);
            });

            // 4. Admin Alerts (From alertService.sendAdminAlert)
            newSocket.on("ADMIN_NOTIFICATION", (payload) => {
                // Admin payload usually contains { notification, caseId }
                handleIncomingNotification(payload.notification, "Admin Dispatch 🛡️");
            });

            // Geolocation Logic
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const location = {
                        coordinates: [position.coords.longitude, position.coords.latitude]
                    };
                    newSocket.emit("update_location", { userId: user._id, location });
                });
            }

            setSocket(newSocket);

            return () => {
                newSocket.off("notification");
                newSocket.off("new_assignment");
                newSocket.off("crime_alert");
                newSocket.off("ADMIN_NOTIFICATION");
                newSocket.close();
                setSocket(null);
            };
        }
    }, [isAuthenticated, user?._id]);

    const markAsRead = () => setUnreadCount(0);

    return (
        <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead }}>
            {children}
        </SocketContext.Provider>
    );
};