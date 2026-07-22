import React from 'react';
import { Home, BookOpen, Sparkles, Award, User } from 'lucide-react';
import { useLocation } from 'wouter';

export function MobileNav() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/training', label: 'Learn', icon: BookOpen },
    { path: '/assistant', label: 'Ask AVA', icon: Sparkles, isCenter: true },
    { path: '/achievements', label: 'Awards', icon: Award },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <footer className="fixed bottom-0 w-full bg-[var(--color-surface)] border-t border-[var(--color-border)] flex justify-between items-center px-2 pb-5 pt-2 z-50">
      {navItems.map((item) => {
        const isActive = location === item.path;
        const Icon = item.icon;

        if (item.isCenter) {
          return (
            <button 
              key={item.path}
              onClick={() => setLocation(item.path)} 
              className="flex flex-col items-center justify-center -mt-6"
            >
              <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg border-4 border-background hover:scale-105 transition-transform">
                <Icon size={24} />
              </div>
              <span className={`text-[10px] font-semibold mt-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </button>
          );
        }

        return (
          <button 
            key={item.path}
            onClick={() => setLocation(item.path)} 
            className={`flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-xl transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:bg-muted'}`}
          >
            <Icon size={22} className={isActive ? 'stroke-2' : ''} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </footer>
  );
}
