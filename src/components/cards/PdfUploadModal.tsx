import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import type { CreditCard, ParsedInvoiceItem } from '../../types/financial';
import { parseInvoicePDF } from '../../services/pdfInvoiceParser';
import { formatBRL } from '../../utils/formatters';
import { FileUp, Loader2, Sparkles, Check, Layers } from 'lucide-react';

interface PdfUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CreditCard[];
  onCommitParsedItems: (items: ParsedInvoiceItem[], cardId: string) => void;
}

export const PdfUploadModal: React.FC<PdfUploadModalProps> = ({
  isOpen,
  onClose,
  cards,
  onCommitParsedItems,
}) => {
  const [selectedCardId, setSelectedCardId] = useState(() => (cards[0] ? cards[0].id : ''));
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedInvoiceItem[] | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileChange = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Por favor selecione um arquivo de fatura em formato PDF.');
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);

    try {
      const items = await parseInvoicePDF(file);
      setParsedItems(items);
    } catch (err) {
      console.error(err);
      alert('Erro ao ler arquivo PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const toggleItemSelection = (id: string) => {
    if (!parsedItems) return;
    setParsedItems((prev) =>
      prev ? prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)) : null
    );
  };

  const updateItemField = (id: string, field: keyof ParsedInvoiceItem, value: any) => {
    if (!parsedItems) return;
    setParsedItems((prev) =>
      prev ? prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)) : null
    );
  };

  const selectedTotal = parsedItems
    ? parsedItems.filter((i) => i.selected).reduce((sum, i) => sum + i.amount, 0)
    : 0;

  const handleCommit = () => {
    if (!parsedItems || !selectedCardId) return;
    const selectedItems = parsedItems.filter((i) => i.selected);
    if (selectedItems.length === 0) {
      alert('Nenhum item selecionado para importação.');
      return;
    }

    onCommitParsedItems(selectedItems, selectedCardId);
    setParsedItems(null);
    setFileName('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setParsedItems(null);
        setFileName('');
        onClose();
      }}
      title="Importar & Conciliar Fatura PDF"
      subtitle="Envie a fatura do seu cartão de crédito para extração de lançamentos com reconciliação."
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Card Selector */}
        <Select
          label="Selecione o Cartão de Crédito Destino"
          options={cards.map((c) => ({
            value: c.id,
            label: `${c.name} (vence dia ${c.due_day})`,
          }))}
          value={selectedCardId}
          onChange={(e) => setSelectedCardId(e.target.value)}
        />

        {/* File Dropzone */}
        {!parsedItems && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
            }`}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-3">
                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                <p className="text-sm font-semibold text-slate-200">
                  Analisando documento PDF e extraindo transações...
                </p>
                <p className="text-xs text-slate-400">Processando regex de lançamentos e parcelamentos</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <FileUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Arraste o arquivo PDF da fatura aqui
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Suporta faturas do Nubank, Itaú, Inter, Bradesco e outros bancos
                  </p>
                </div>
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors">
                    Selecionar Arquivo PDF
                  </span>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {/* Parsed Reconciliation Preview Table ("Diff Modal") */}
        {parsedItems && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <div>
                  <h4 className="text-xs font-bold text-indigo-300">
                    Reconciliação de Lançamentos ({parsedItems.length} itens extraídos)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Arquivo: <span className="text-slate-200 font-mono">{fileName}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Selecionado</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">
                  {formatBRL(selectedTotal)}
                </span>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">Importar</th>
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Descrição Extratada</th>
                    <th className="py-2.5 px-3">Categoria</th>
                    <th className="py-2.5 px-3 text-right">Valor (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {parsedItems.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        !item.selected && 'opacity-40'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => toggleItemSelection(item.id)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                        {item.date}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItemField(item.id, 'description', e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 w-full focus:border-indigo-500 focus:outline-none"
                          />
                          {item.installment && (
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded shrink-0 flex items-center gap-0.5">
                              <Layers className="w-2.5 h-2.5" /> [{item.installment.current}/{item.installment.total}]
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={item.category}
                          onChange={(e) => updateItemField(item.id, 'category', e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                        >
                          <option value="Alimentação">Alimentação</option>
                          <option value="Transporte">Transporte</option>
                          <option value="Compras">Compras</option>
                          <option value="Assinaturas">Assinaturas</option>
                          <option value="Saúde">Saúde</option>
                          <option value="Moradia">Moradia</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-200">
                        {formatBRL(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setParsedItems(null);
                  setFileName('');
                }}
              >
                Escolher Outro Arquivo
              </Button>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" icon={<Check className="w-4 h-4" />} onClick={handleCommit}>
                  Confirmar & Importar Fatura
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
