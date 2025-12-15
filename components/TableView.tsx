import React, { useState } from 'react';
import { MergedADEItem } from '../types';
import { formatDate, getStatusColor } from '../utils';
import { ArrowUpDown, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface TableViewProps {
  data: MergedADEItem[];
  title: string;
  isDelayView?: boolean;
}

export const TableView: React.FC<TableViewProps> = ({ data, title, isDelayView }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof MergedADEItem>('fecha_entrega');
  const [sortAsc, setSortAsc] = useState(true);

  const itemsPerPage = 10;

  // Filtering
  const filteredData = data.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.item.toLowerCase().includes(searchLower) ||
      item.texto_pregunta.toLowerCase().includes(searchLower) ||
      item.subcontrato.toLowerCase().includes(searchLower) ||
      item.revisor.toLowerCase().includes(searchLower)
    );
  });

  // Sorting
  const sortedData = [...filteredData].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA === valB) return 0;
    
    // Handle nulls
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;

    const result = valA < valB ? -1 : 1;
    return sortAsc ? result : -result;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field: keyof MergedADEItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(sortedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ADE Report");
    XLSX.writeFile(wb, `ADE_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Actions */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className={`text-lg font-bold ${isDelayView ? 'text-red-600' : 'text-slate-800'}`}>
            {title}
          </h2>
          <p className="text-sm text-slate-500">
            {filteredData.length} registros encontrados
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar por item, pregunta, revisor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 md:w-64 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors"
          >
            <FileSpreadsheet size={18} />
            <span className="hidden sm:inline">Excel</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-900 font-medium sticky top-0 z-10">
            <tr>
              <Th label="ID" field="id" currentSort={sortField} sortAsc={sortAsc} onSort={handleSort} />
              <Th label="Item / Pregunta" field="item" currentSort={sortField} sortAsc={sortAsc} onSort={handleSort} className="w-1/3 min-w-[300px]" />
              <Th label="Autoridad" field="autoridad" currentSort={sortField} sortAsc={sortAsc} onSort={handleSort} />
              <Th label="Subcontrato" field="subcontrato" currentSort={sortField} sortAsc={sortAsc} onSort={handleSort} />
              <Th label="Revisor" field="revisor" currentSort={sortField} sortAsc={sortAsc} onSort={handleSort} />
              <Th label="Estado" field="estado" currentSort={sortField} sortAsc={sortAsc} onSort={handleSort} />
              <Th label="Fecha Entrega" field="fecha_entrega" currentSort={sortField} sortAsc={sortAsc} onSort={handleSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.map((row, idx) => (
              <tr key={`${row.id}-${idx}`} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs">{row.id}</td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-800 mb-1">{row.item}</div>
                  <div className="text-xs text-slate-500 line-clamp-2" title={row.texto_pregunta}>{row.texto_pregunta}</div>
                </td>
                <td className="px-6 py-4">{row.autoridad}</td>
                <td className="px-6 py-4">{row.subcontrato}</td>
                <td className="px-6 py-4">{row.revisor}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(row.estado, row.isOverdue)}`}>
                    {row.estado}
                    {row.isOverdue && <span className="ml-1 font-bold">!</span>}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono">{formatDate(row.fecha_entrega)}</td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  No se encontraron datos que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-slate-100 flex justify-between items-center">
        <button 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium text-slate-600">
          Página {currentPage} de {totalPages || 1}
        </span>
        <button 
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

const Th = ({ label, field, currentSort, sortAsc, onSort, className }: any) => (
  <th 
    onClick={() => onSort(field)}
    className={`px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors select-none ${className}`}
  >
    <div className="flex items-center gap-1">
      {label}
      <ArrowUpDown size={14} className={currentSort === field ? (sortAsc ? "text-emerald-600" : "text-emerald-600 transform rotate-180") : "text-slate-300"} />
    </div>
  </th>
);
