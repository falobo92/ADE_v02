export interface FixedData {
  id: string | number; // Correlativo
  item: string;
  autoridad: string;
  texto_pregunta: string;
}

export interface WeeklyReport {
  correlativo: string | number;
  tematica: string;
  subcontrato: string;
  revisor: string;
  estado: 'Pendiente' | 'En Proceso' | 'Incorporada' | 'Rechazada' | 'Atrasada' | string;
  fecha_entrega: string; // YYYY-MM-DD
  semana: string | number;
}

export interface MergedADEItem extends FixedData, WeeklyReport {
  isOverdue: boolean;
}

export interface FilterState {
  semana: string;
  fecha: string;
  tematica: string;
  revisor: string;
  estado: string;
  subcontrato: string;
}

export interface DashboardMetrics {
  total: number;
  completed: number; // 'Incorporada'
  pending: number;
  overdue: number;
  byStatus: { name: string; value: number; color: string }[];
  byTopic: { name: string; total: number; completed: number }[];
  byRevisor: { name: string; count: number }[];
}

export type ViewMode = 'dashboard' | 'list' | 'delays' | 'subcontracts' | 'settings';
