import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TableView } from './components/TableView';
import { SubcontractsView } from './components/SubcontractsView';
import { SettingsView } from './components/SettingsView';
import { FixedData, WeeklyReport, MergedADEItem, ViewMode, FilterState } from './types';
import { mergeDatasets, filterData, calculateMetrics, generateMockData } from './services/adeService';

const App: React.FC = () => {
  const [fixedData, setFixedData] = useState<FixedData[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyReport[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [filters, setFilters] = useState<FilterState>({
    semana: '',
    fecha: '',
    tematica: '',
    revisor: '',
    estado: '',
    subcontrato: ''
  });

  // Load from LocalStorage on mount
  useEffect(() => {
    const storedFixed = localStorage.getItem('ade_fixed');
    const storedWeekly = localStorage.getItem('ade_weekly');

    if (storedFixed && storedWeekly) {
      setFixedData(JSON.parse(storedFixed));
      setWeeklyData(JSON.parse(storedWeekly));
    } else {
      // Load mock data if empty for demo purposes
      handleResetMock();
    }
  }, []);

  // Save to LocalStorage whenever data changes
  useEffect(() => {
    if (fixedData.length > 0) localStorage.setItem('ade_fixed', JSON.stringify(fixedData));
    if (weeklyData.length > 0) localStorage.setItem('ade_weekly', JSON.stringify(weeklyData));
  }, [fixedData, weeklyData]);

  // Derived State
  const mergedData = useMemo(() => mergeDatasets(fixedData, weeklyData), [fixedData, weeklyData]);
  const filteredItems = useMemo(() => filterData(mergedData, filters), [mergedData, filters]);
  const metrics = useMemo(() => calculateMetrics(filteredItems), [filteredItems]);

  // Handlers
  const handleDataLoaded = (fixed: FixedData[], weekly: WeeklyReport[]) => {
    setFixedData(fixed);
    setWeeklyData(weekly);
    setCurrentView('dashboard');
  };

  const handleResetMock = () => {
    const { fixed, weekly } = generateMockData();
    setFixedData(fixed);
    setWeeklyData(weekly);
    setCurrentView('dashboard');
  };

  const uniqueValues = (key: keyof MergedADEItem) => {
    return Array.from(new Set(mergedData.map(item => String(item[key] || '')))).filter(Boolean).sort();
  };

  // Sidebar Filter Component
  const SidebarFilters = (
    <div className="space-y-3">
      <FilterSelect 
        label="Semana" 
        value={filters.semana} 
        onChange={(v) => setFilters(prev => ({ ...prev, semana: v }))}
        options={uniqueValues('semana')}
      />
      <FilterSelect 
        label="Temática" 
        value={filters.tematica} 
        onChange={(v) => setFilters(prev => ({ ...prev, tematica: v }))}
        options={uniqueValues('tematica')}
      />
      <FilterSelect 
        label="Estado" 
        value={filters.estado} 
        onChange={(v) => setFilters(prev => ({ ...prev, estado: v }))}
        options={uniqueValues('estado')}
      />
       <FilterSelect 
        label="Revisor" 
        value={filters.revisor} 
        onChange={(v) => setFilters(prev => ({ ...prev, revisor: v }))}
        options={uniqueValues('revisor')}
      />
      {Object.values(filters).some(Boolean) && (
        <button 
          onClick={() => setFilters({ semana: '', fecha: '', tematica: '', revisor: '', estado: '', subcontrato: '' })}
          className="w-full mt-2 text-xs text-red-400 hover:text-red-300 underline"
        >
          Limpiar Filtros
        </button>
      )}
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard metrics={metrics} />;
      case 'list':
        return <TableView data={filteredItems} title="Listado General de Cumplimiento" />;
      case 'delays':
        const delayedItems = filteredItems.filter(i => i.isOverdue);
        return <TableView data={delayedItems} title="Alertas de Atraso" isDelayView />;
      case 'subcontracts':
        return <SubcontractsView data={filteredItems} />;
      case 'settings':
        return <SettingsView onDataLoaded={handleDataLoaded} onReset={handleResetMock} />;
      default:
        return <Dashboard metrics={metrics} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onViewChange={setCurrentView}
      sidebarContent={SidebarFilters}
    >
      {renderContent()}
    </Layout>
  );
};

const FilterSelect = ({ label, value, onChange, options }: any) => (
  <div className="flex flex-col">
    <label className="text-xs text-slate-400 mb-1">{label}</label>
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-800 text-slate-200 text-sm rounded border border-slate-700 p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
    >
      <option value="">Todos</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export default App;
