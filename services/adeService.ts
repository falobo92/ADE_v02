import { FixedData, WeeklyReport, MergedADEItem, FilterState, DashboardMetrics } from '../types';

export const mergeDatasets = (fixed: FixedData[], weekly: WeeklyReport[]): MergedADEItem[] => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Map for O(1) access
  const fixedMap = new Map(fixed.map(f => [String(f.id), f]));

  return weekly.map(w => {
    const fData = fixedMap.get(String(w.correlativo)) || {
      id: w.correlativo,
      item: 'N/A',
      autoridad: 'Desconocido',
      texto_pregunta: 'Pregunta no encontrada en base fija'
    };

    const deliveryDate = new Date(w.fecha_entrega);
    // Logic for overdue: Date passed AND not incorporated (completed)
    const isOverdue = deliveryDate < now && w.estado !== 'Incorporada';

    return {
      ...w,
      ...fData,
      isOverdue
    };
  });
};

export const filterData = (data: MergedADEItem[], filters: FilterState): MergedADEItem[] => {
  return data.filter(item => {
    if (filters.semana && String(item.semana) !== filters.semana) return false;
    if (filters.fecha && item.fecha_entrega !== filters.fecha) return false;
    if (filters.tematica && item.tematica !== filters.tematica) return false;
    if (filters.revisor && item.revisor !== filters.revisor) return false;
    if (filters.estado && item.estado !== filters.estado) return false;
    if (filters.subcontrato && item.subcontrato !== filters.subcontrato) return false;
    return true;
  });
};

export const calculateMetrics = (data: MergedADEItem[]): DashboardMetrics => {
  const total = data.length;
  const completed = data.filter(i => i.estado === 'Incorporada').length;
  const overdue = data.filter(i => i.isOverdue).length;
  const pending = total - completed;

  // Status Distribution
  const statusCounts = data.reduce((acc, curr) => {
    acc[curr.estado] = (acc[curr.estado] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byStatus = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
    color: name === 'Incorporada' ? '#10b981' : name === 'En Proceso' ? '#3b82f6' : '#64748b'
  }));
  // Add specific color for overdue implicitly or via custom handling, here we map basic status

  // Topic Progress
  const topicMap = data.reduce((acc, curr) => {
    if (!acc[curr.tematica]) acc[curr.tematica] = { total: 0, completed: 0 };
    acc[curr.tematica].total++;
    if (curr.estado === 'Incorporada') acc[curr.tematica].completed++;
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

  const byTopic = Object.entries(topicMap).map(([name, stats]) => ({
    name,
    total: stats.total,
    completed: stats.completed
  })).sort((a, b) => b.total - a.total);

  // Revisor Load
  const revisorCounts = data.reduce((acc, curr) => {
    if(!curr.revisor) return acc;
    acc[curr.revisor] = (acc[curr.revisor] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byRevisor = Object.entries(revisorCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10

  return { total, completed, pending, overdue, byStatus, byTopic, byRevisor };
};

// Mock Data Generators for Initial Load
export const generateMockData = () => {
  const fixed: FixedData[] = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    item: `RCA-${100 + i}`,
    autoridad: i % 2 === 0 ? 'SMA' : 'SEA',
    texto_pregunta: `Verificar cumplimiento del compromiso ambiental específico número ${i + 1} relacionado con emisiones.`
  }));

  const tematicas = ['Aire', 'Agua', 'Ruido', 'Residuos', 'Biodiversidad'];
  const revisores = ['Juan Perez', 'Maria Silva', 'Carlos Ruiz', 'Ana Torres'];
  const subcontratos = ['Constructora A', 'Transportes B', 'Ingeniería C', 'Consultora D'];
  const estados = ['Pendiente', 'En Proceso', 'Incorporada', 'Rechazada'];

  const weekly: WeeklyReport[] = Array.from({ length: 50 }, (_, i) => {
    const isLate = Math.random() > 0.8;
    const status = isLate ? 'Pendiente' : estados[Math.floor(Math.random() * estados.length)];
    // Random date within last month and next month
    const date = new Date();
    date.setDate(date.getDate() + (Math.floor(Math.random() * 60) - 30));
    
    return {
      correlativo: i + 1,
      tematica: tematicas[Math.floor(Math.random() * tematicas.length)],
      subcontrato: subcontratos[Math.floor(Math.random() * subcontratos.length)],
      revisor: revisores[Math.floor(Math.random() * revisores.length)],
      estado: status,
      fecha_entrega: date.toISOString().split('T')[0],
      semana: 24
    };
  });

  return { fixed, weekly };
};
