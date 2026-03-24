import { Link, useLocation } from 'react-router-dom';
import { Home, Search, MessageSquare, User, Wrench } from 'lucide-react';

const navItems = [
    { path: '/dashboard', icon: Home, label: 'Domov' },
    { path: '/jobs', icon: Search, label: 'Hľadať' },
    { path: '/messages', icon: MessageSquare, label: 'Správy' },
    { path: '/profile', icon: User, label: 'Profil' },
];

export function BottomNav() {
    const location = useLocation();

    return (
        <div className="bottom-nav md:hidden">
            <div className="flex justify-around items-center">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path === '/dashboard' && location.pathname === '/');
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon className="nav-icon" />
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}