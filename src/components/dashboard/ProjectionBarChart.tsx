import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { MonthlyProjection } from '../../types/financial';
import { formatBRL } from '../../utils/formatters';

interface ProjectionBarChartProps {
  projections: MonthlyProjection[];
}

export const ProjectionBarChart: React.FC<ProjectionBarChartProps> = ({ projections }) => {
  const chartData = projections.map((p) => ({
    label: p.label,
    Compromissos: p.totalAmount,
  }));

  return (
    <div className="dash-card p-6 h-full flex flex-col justify-between">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">Projeção de Faturas (6 Múltiplos Meses)</h3>
        <p className="text-xs text-slate-400 mt-0.5">Compromissos acumulados em cartões de crédito (M+1 a M+6)</p>
      </div>

      <div className="h-64 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `R$ ${(val / 1000).toFixed(1)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px',
              }}
              formatter={(val: any) => [formatBRL(Number(val)), 'Compromisso Futuro']}
            />
            <Bar
              dataKey="Compromissos"
              fill="#6366f1"
              radius={[6, 6, 0, 0]}
              barSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
