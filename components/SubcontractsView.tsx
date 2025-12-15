import React from 'react';
import { MergedADEItem } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SubcontractsProps {
  data: MergedADEItem[];
}

export const SubcontractsView: React.FC<SubcontractsProps> = ({ data }) => {
  // Aggregate data
  const aggData = data.reduce((acc, curr) => {
    if (!acc[curr.subcontrato]) {
      acc[curr.subcontrato] = {
        name: curr.subcontrato,
        total: 0,
        completed: 0,
        delayed: 0,
        pending: 0
      };
    }
    acc[curr.subcontrato].total++;
    if (curr.estado === 'Incorporada') acc[curr.subcontrato].completed++;
    else if (curr.isOverdue) acc[curr.subcontrato].delayed++;
    else acc[curr.subcontrato].pending++;
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(aggData).sort((a: any, b: any) => b.total - a.total);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-800">Gestión de Subcontratos</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Resumen de Cumplimiento por Empresa</h3>
        <div className="w-full h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                interval={0} 
                angle={-45} 
                textAnchor="end"
                tick={{fontSize: 12}}
                height={80}
              />
              <YAxis />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey="completed" name="Completadas" stackId="a" fill="#10b981" />
              <Bar dataKey="pending" name="En Proceso" stackId="a" fill="#94a3b8" />
              <Bar dataKey="delayed" name="Atrasadas" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chartData.map((company: any) => (
          <div key={company.name} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-bold text-slate-800 mb-2 truncate" title={company.name}>{company.name}</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Items:</span>
                <span className="font-medium">{company.total}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full" 
                  style={{ width: `${(company.completed / company.total) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>{Math.round((company.completed / company.total) * 100)}% Cumplimiento</span>
                {company.delayed > 0 && <span className="text-red-500 font-bold">{company.delayed} Atrasos</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
