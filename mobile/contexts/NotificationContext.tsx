import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { brandNotificationAPI } from '../services/brandNotificationAPI';
import { influencerNotificationAPI } from '../services/influencerNotificationAPI';
import { useAuth } from './AuthContext';

interface NotificationContextData {
    unreadCount: number;
    refreshUnreadCount: (force?: boolean) => Promise<void>;
    isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const { user, isAuthenticated } = useAuth();
    const lastFetched = useRef<number>(0);
    const FETCH_COOLDOWN = 60000; // 60 seconds throttle
    const POLLING_INTERVAL = 120000; // 2 minutes auto-refresh

    const refreshUnreadCount = useCallback(async (force = false) => {
        if (!isAuthenticated || !user) {
            return;
        }

        const now = Date.now();
        // Don't fetch more than once per minute unless forced
        if (!force && now - lastFetched.current < FETCH_COOLDOWN) {
            if (__DEV__) console.log('🔔 Notifications: Throttled, using cached count');
            return;
        }

        try {
            setIsLoading(true);
            if (__DEV__) console.log(`🔔 Notifications: Fetching stats for ${user.role}...`);

            let count = 0;
            if (user.role === 'brand') {
                const stats = await brandNotificationAPI.getNotificationStats();
                count = stats.unread_count;
            } else if (user.role === 'influencer') {
                const stats = await influencerNotificationAPI.getNotificationStats();
                count = stats.unread_count;
            }

            setUnreadCount(count);
            lastFetched.current = Date.now();
        } catch (err) {
            console.log('Error fetching notification stats:', err);
        } finally {
            setIsLoading(false);
        }
    }, [user, isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated && user && (user.role === 'brand' || user.role === 'influencer')) {
            // Force individual fetch on login/mount
            refreshUnreadCount(true);

            // Set longer polling interval
            const interval = setInterval(() => {
                refreshUnreadCount();
            }, POLLING_INTERVAL);

            return () => clearInterval(interval);
        } else {
            setUnreadCount(0);
            lastFetched.current = 0;
        }
    }, [user, isAuthenticated, refreshUnreadCount]);

    return (
        <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount, isLoading }}>
            {children}
        </NotificationContext.Provider>
    );
};
