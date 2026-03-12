
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { localStorageRepository, type Notification } from "@/services/localStorageRepository";

import { Check, Info, Bell, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export default function NotificationsPage() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

    const loadNotifications = () => {
        // Mock current user ID - in real app, get from auth context
        // For demo, we fetch ALL or use a placeholder ID like 'current_teacher_id' 
        // effectively showing everything for demo purposes if no ID match found in getForUser
        const all = localStorageRepository.notifications.getAll();

        // Sort by newest first
        const sorted = [...all].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotifications(sorted);
    };

    useEffect(() => {
        loadNotifications();
        // Poll for new notifications
        const interval = setInterval(loadNotifications, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        localStorageRepository.notifications.markAsRead(id);
        loadNotifications();
    };

    const handleNotificationClick = (notif: Notification) => {
        if (!notif.isRead) {
            localStorageRepository.notifications.markAsRead(notif.id);
        }
        if (notif.link) {
            navigate(notif.link);
        }
    };

    const filteredNotifications = filter === 'ALL'
        ? notifications
        : notifications.filter(n => !n.isRead);

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'APPROVAL': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'REQUEST': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
            case 'WARNING': return <AlertTriangle className="w-5 h-5 text-red-600" />;
            default: return <Info className="w-5 h-5 text-blue-600" />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-6">
            <PageHeader
                breadcrumb={[
                    { label: 'Dashboard', to: '/dashboard' as any }, // Generic back
                    { label: 'Notifications' }
                ]}
                title="Notifications"
                description="Stay updated with important alerts and updates."
            />

            <div className="flex gap-2">
                <button
                    onClick={() => setFilter('ALL')}
                    className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                        filter === 'ALL'
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('UNREAD')}
                    className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                        filter === 'UNREAD'
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                >
                    Unread Only
                </button>
            </div>

            <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <Bell className="w-8 h-8 mx-auto mb-3 text-slate-400" />
                        <p>No notifications found.</p>
                    </div>
                ) : (
                    filteredNotifications.map((notif) => (
                        <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={cn(
                                "flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md",
                                notif.isRead
                                    ? "bg-white border-slate-200"
                                    : "bg-blue-50/50 border-blue-200 shadow-sm"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-full flex-shrink-0",
                                notif.isRead ? "bg-slate-100" : "bg-white"
                            )}>
                                {getIcon(notif.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className={cn(
                                        "text-sm font-semibold truncate pr-4",
                                        notif.isRead ? "text-slate-700" : "text-slate-900"
                                    )}>
                                        {notif.title}
                                    </h4>
                                    <span className="text-xs text-slate-400 whitespace-nowrap">
                                        {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className={cn(
                                    "text-sm mt-1 line-clamp-2",
                                    notif.isRead ? "text-slate-500" : "text-slate-700"
                                )}>
                                    {notif.message}
                                </p>
                            </div>

                            {!notif.isRead && (
                                <button
                                    onClick={(e) => handleMarkAsRead(notif.id, e)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                    title="Mark as read"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
