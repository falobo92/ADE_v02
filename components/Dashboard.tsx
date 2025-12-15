import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { DashboardMetrics } from '../types';
import { CheckCircle, AlertOctagon, Clock, Activity } from 'lucide-react';

interface DashboardProps {
  metrics: DashboardMetrics;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#64748b'];

export const Dashboard: React.FC<DashboardProps> = ({ metrics }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Cumplimiento Total" 
          value={`${metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0}%`}
          subtitle={`${metrics.completed}/${metrics.total} Items`}
          icon={<Activity className="text-blue-500" />}
          trend="vs semana anterior"
        />
        <KpiCard 
          title="Incorporadas" 
          value={metrics.completed} 
          subtitle="Aprobadas OK"
          icon={<CheckCircle className="text-emerald-500" />}
          className="border-l-4 border-l-emerald-500"
        />
        <KpiCard 
          title="En Proceso/Pendiente" 
          value={metrics.pending} 
          subtitle="Gestión activa"
          icon={<Clock className="text-amber-500" />}
          className="border-l-4 border-l-amber-500"
        />
        <KpiCard 
          title="Atrasadas / Críticas" 
          value={metrics.overdue} 
          subtitle="Atención requerida"
          icon={<AlertOctagon className="text-red-500" />}
          className="bg-red-50 border-l-4 border-l-red-500"
          valueClass="text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
        {/* Status Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribución por Estado</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.byStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {metrics.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Avance por Temática</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.byTopic}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" name="Completadas" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
                <Bar dataKey="total" name="Total Items" stackId="b" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
       {/* Revisor Load Chart */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Carga por Responsable (Top 10)</h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.byRevisor}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} angle={-15} textAnchor="end" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" name="Items Asignados" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
    </div>
  );
};

const KpiCard = ({ title, value, subtitle, icon, trend, className, valueClass }: any) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between ${className}`}>
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className={`text-2xl font-bold text-slate-900 ${valueClass}`}>{value}</h3>
      <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
      {trend && <p className="text-xs text-emerald-600 font-medium mt-2">{trend}</p>}
    </div>
    <div className="p-3 bg-slate-50 rounded-lg">
      {icon}
    </div>
  </div>
);
