import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString: string): string => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

export const getStatusColor = (status: string, isOverdue: boolean): string => {
  if (status === 'Incorporada') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (isOverdue) return 'bg-red-100 text-red-800 border-red-200';
  
  switch (status) {
    case 'Pendiente': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'En Proceso': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Rechazada': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};
