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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 h-full flex flex-col justify-between shadow-xs">
      <div>
        <h3 className="text-base font-bold text-slate-900 tracking-tight">Projeção de Faturas (Próximos Meses)</h3>
        <p className="text-xs text-slate-500 mt-0.5">Compromissos acumulados em cartões de crédito</p>
      </div>

      <div className="h-64 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
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
                backgroundColor: '#ffffff',
                borderColor: '#cbd5e1',
                borderRadius: '8px',
                color: '#0f172a',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(val: any) => [formatBRL(Number(val)), 'Compromisso Futuro']}
            />
            <Bar
              dataKey="Compromissos"
              fill="#34d399"
              radius={[6, 6, 0, 0]}
              barSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
