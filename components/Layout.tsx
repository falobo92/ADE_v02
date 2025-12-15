import React from 'react';
import { LayoutDashboard, List, AlertTriangle, Briefcase, Settings, Menu, X, Filter } from 'lucide-react';
import { ViewMode } from '../types';
import { cn } from '../utils';

interface LayoutProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onViewChange, children, sidebarContent }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'list', label: 'Listado General', icon: <List size={20} /> },
    { id: 'delays', label: 'Atrasos y Alertas', icon: <AlertTriangle size={20} /> },
    { id: 'subcontracts', label: 'Subcontratos', icon: <Briefcase size={20} /> },
    { id: 'settings', label: 'Carga de Datos', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 flex flex-col shadow-xl",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight text-emerald-400">ADE Manager</h1>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-150",
                currentView === item.id 
                  ? "bg-emerald-600 text-white shadow-md" 
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}

          {/* Filters Section (Only show if not settings) */}
          {currentView !== 'settings' && sidebarContent && (
            <div className="mt-8 pt-6 border-t border-slate-700">
              <div className="flex items-center space-x-2 text-slate-400 mb-4 px-2">
                <Filter size={16} />
                <span className="text-xs uppercase font-semibold tracking-wider">Filtros Activos</span>
              </div>
              <div className="space-y-4 px-2">
                {sidebarContent}
              </div>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-700 text-xs text-slate-500 text-center">
          v1.0.0 &copy; 2024 ADE Pro
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-sm z-40">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600">
            <Menu size={24} />
          </button>
          <span className="font-semibold text-slate-800">
            {navItems.find(i => i.id === currentView)?.label}
          </span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        {/* View Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
      
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};
