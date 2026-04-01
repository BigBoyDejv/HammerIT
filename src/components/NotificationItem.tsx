import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { sk } from 'date-fns/locale';
import { 
    MessageCircle, FileText, CheckCircle, 
    Briefcase, Info, Clock, ArrowRight, Star
} from 'lucide-react';
import { Notification, NotificationType } from '../services/notificationService';
import { useNotifications } from '../contexts/NotificationContext';

const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case 'message': return <MessageCircle className="w-5 h-5 text-blue-500" />;
        case 'offer': return <Briefcase className="w-5 h-5 text-coral-500" />;
        case 'contract': return <FileText className="w-5 h-5 text-emerald-500" />;
        case 'verification': return <CheckCircle className="w-5 h-5 text-blue-500" />;
        case 'review': return <Star className="w-5 h-5 text-amber-500" />;
        default: return <Info className="w-5 h-5 text-gray-500" />;
    }
};

interface NotificationItemProps {
    notification: Notification;
    onClose?: () => void;
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
    const navigate = useNavigate();
    const { markAsRead } = useNotifications();

    const handleClick = () => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
        if (onClose) {
            onClose();
        }
    };

    return (
        <div 
            onClick={handleClick}
            className={`p-5 flex gap-4 cursor-pointer transition-all border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800 ${
                !notification.read ? 'bg-coral-500/5' : ''
            }`}
        >
            <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center shadow-lg shadow-navy-900/5 ${
                !notification.read ? 'bg-white dark:bg-slate-800' : 'bg-gray-50 dark:bg-slate-900'
            }`}>
                {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start gap-2">
                    <h4 className={`text-sm tracking-tight ${notification.read ? 'font-bold text-gray-700 dark:text-gray-300' : 'font-black text-gray-900 dark:text-white'}`}>
                        {notification.title}
                    </h4>
                    {!notification.read && (
                        <div className="w-2 h-2 bg-coral-500 rounded-full mt-1.5 shrink-0" />
                    )}
                </div>
                <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 leading-snug line-clamp-2">
                    {notification.message}
                </p>
                <div className="flex items-center gap-1.5 pt-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: sk })}
                    </span>
                </div>
            </div>

            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
        </div>
    );
}
