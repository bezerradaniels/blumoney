import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatBRL } from '../../utils/formatters';

interface CashFlowChartProps {
  data?: Array<{
    month: string;
    Receitas: number;
    Despesas: number;
  }>;
}

const DEFAULT_CASH_FLOW_DATA = [
  { month: 'Mai', Receitas: 0, Despesas: 0 },
  { month: 'Jun', Receitas: 0, Despesas: 0 },
  { month: 'Jul', Receitas: 0, Despesas: 0 },
  { month: 'Ago', Receitas: 0, Despesas: 0 },
  { month: 'Set', Receitas: 0, Despesas: 0 },
  { month: 'Out', Receitas: 0, Despesas: 0 },
];

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ data = DEFAULT_CASH_FLOW_DATA }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 h-full flex flex-col justify-between shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Fluxo de Caixa</h3>
          <p className="text-xs text-slate-500">Evolução comparativa de Receitas vs Despesas</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-500" />
            <span className="text-slate-700">Receitas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-rose-600" />
            <span className="text-slate-700">Despesas</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
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
              formatter={(value: any) => [formatBRL(Number(value)), '']}
            />
            <Area
              type="monotone"
              dataKey="Receitas"
              stroke="#34d399"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#incomeGradient)"
            />
            <Area
              type="monotone"
              dataKey="Despesas"
              stroke="#f43f5e"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#expenseGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
