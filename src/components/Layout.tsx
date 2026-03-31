import { ReactNode } from 'react';
import { Navbar } from './Navbar';
 
interface LayoutProps { children: ReactNode; }
 
export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
 