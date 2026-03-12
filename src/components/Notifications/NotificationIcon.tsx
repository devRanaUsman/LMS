import { Bell } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { localStorageRepository, type Notification } from "@/services/localStorageRepository";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function NotificationIcon() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Helper to calculate time ago
    const timeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " mins ago";
        return Math.floor(seconds) + " seconds ago";
    };

    const loadNotifications = () => {
        // Sort by newest, take top 5 for dropdown
        const all = localStorageRepository.notifications.getAll();
        const sorted = [...all].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotifications(sorted.slice(0, 5));
    };

    useEffect(() => {
        loadNotifications();
        // Poll for updates
        const interval = setInterval(loadNotifications, 5000);
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleItemClick = (notif: Notification) => {
        if (!notif.isRead) {
            localStorageRepository.notifications.markAsRead(notif.id);
            loadNotifications();
        }
        if (notif.link) {
            navigate(notif.link);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="relative inline-block">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <Bell className="w-5 h-5 text-slate-600" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white box-content" />
                                    )}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Notifications</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">
                        No notifications
                    </div>
                ) : (
                    <div className="max-h-[300px] overflow-y-auto">
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className="cursor-pointer flex flex-col items-start gap-1 p-3 focus:bg-slate-50"
                                onClick={() => handleItemClick(notification)}
                            >
                                <div className="flex justify-between w-full items-start">
                                    <span className={`text-sm font-medium ${!notification.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                                        {notification.title}
                                    </span>
                                    {!notification.isRead && (
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-1 w-full">{notification.message}</p>
                                <span className="text-[10px] text-slate-400 mt-1">{timeAgo(notification.createdAt)}</span>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/notifications')} className="cursor-pointer justify-center text-blue-600 font-medium text-xs p-2">
                    <span className="w-full text-center block">
                        View All Notifications
                    </span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
