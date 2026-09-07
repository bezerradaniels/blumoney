import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import type { CreditCard, Transaction } from '../types/financial';
import { calculate6MonthProjections } from '../utils/projectionsCalculator';
import { ProjectionBarChart } from '../components/dashboard/ProjectionBarChart';
import { formatBRL } from '../utils/formatters';

interface ProjectionsViewProps {
  cards: CreditCard[];
  transactions: Transaction[];
}

export const ProjectionsView: React.FC<ProjectionsViewProps> = ({ cards, transactions }) => {
  const projections = calculate6MonthProjections(cards, transactions);

  const grandTotal6Months = projections.reduce((sum, p) => sum + p.totalAmount, 0);
  const averageMonthlyCommitment = grandTotal6Months / 6;

  // Extract active installment groups
  const activeInstallmentGroupsMap: Record<string, Transaction[]> = {};
  transactions.forEach((tx) => {
    if (tx.installment_group_id) {
      if (!activeInstallmentGroupsMap[tx.installment_group_id]) {
        activeInstallmentGroupsMap[tx.installment_group_id] = [];
      }
      activeInstallmentGroupsMap[tx.installment_group_id].push(tx);
    }
  });

  const activeInstallmentGroups = Object.values(activeInstallmentGroupsMap);

  return (
    <PageContainer
      title="Planejamento & Projeção 6 Meses (M+1 a M+6)"
      subtitle="Analise os compromissos futuros acumulados em parcelamentos e faturas dos seus cartões."
    >
      <div className="space-y-6">
        {/* Top Summary KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="dash-card p-6 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Compromisso Total (6 Meses)
            </span>
            <div className="mt-4">
              <h2 className="text-3xl font-extrabold text-white font-mono">
                {formatBRL(grandTotal6Months)}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Soma de todas as parcelas e faturas projetadas para M+1 a M+6
              </p>
            </div>
          </div>

          <div className="dash-card p-6 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Média Mensal Comprometida
            </span>
            <div className="mt-4">
              <h2 className="text-3xl font-extrabold text-indigo-400 font-mono">
                {formatBRL(averageMonthlyCommitment)}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Impacto mensal médio na sua capacidade de caixa futura
              </p>
            </div>
          </div>

          <div className="dash-card p-6 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Contratos de Parcelamento Ativos
            </span>
            <div className="mt-4">
              <h2 className="text-3xl font-extrabold text-purple-400 font-mono">
                {activeInstallmentGroups.length} Compras Parceladas
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Compras distribuídas em faturas futuras
              </p>
            </div>
          </div>
        </div>

        {/* Projection Chart */}
        <div className="h-80">
          <ProjectionBarChart projections={projections} />
        </div>

        {/* Matrix Table: Breakdown by Month and Card */}
        <div className="dash-card p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Matriz de Projeção Mensal por Cartão
            </h3>
            <p className="text-xs text-slate-400">Detalhamento dos valores por cartão em cada mês futuro</p>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Cartão de Crédito</th>
                  {projections.map((p) => (
                    <th key={p.monthKey} className="py-3 px-4 text-right">
                      {p.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/30">
                {cards.map((card) => (
                  <tr key={card.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: card.theme_color }} />
                      {card.name}
                    </td>
                    {projections.map((p) => (
                      <td key={p.monthKey} className="py-3 px-4 text-right font-mono text-slate-300">
                        {formatBRL(p.cardBreakdown[card.id] || 0)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-900/80 font-bold border-t border-slate-800 text-xs">
                <tr>
                  <td className="py-3 px-4 text-white uppercase text-[10px]">Total Comprometido</td>
                  {projections.map((p) => (
                    <td key={p.monthKey} className="py-3 px-4 text-right font-mono text-indigo-400">
                      {formatBRL(p.totalAmount)}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Active Installment Groups List */}
        <div className="dash-card p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Acompanhamento de Compras Parceladas (Smart Installments)
            </h3>
            <p className="text-xs text-slate-400">Lançamentos futuros vinculados a compras parceladas</p>
          </div>

          <div className="space-y-3">
            {activeInstallmentGroups.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Nenhum parcelamento ativo no momento.</p>
            ) : (
              activeInstallmentGroups.map((txList) => {
                const sampleTx = txList[0];
                const card = cards.find((c) => c.id === sampleTx.credit_card_id);
                const totalInstallments = sampleTx.installment_total || 1;
                const totalGroupAmount = txList.reduce((sum, t) => sum + t.amount, 0);

                return (
                  <div
                    key={sampleTx.installment_group_id}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-sm">{sampleTx.description.replace(/\s\(\d+\/\d+\)/, '')}</span>
                        <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 font-mono">
                          {totalInstallments}x de {formatBRL(sampleTx.amount)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Cartão: <strong className="text-slate-200">{card?.name}</strong> • Categoria: {sampleTx.category}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Valor Total Acumulado</span>
                      <span className="text-sm font-extrabold text-white font-mono">
                        {formatBRL(totalGroupAmount)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
