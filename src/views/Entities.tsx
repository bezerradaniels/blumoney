import React, { useState } from 'react';
import { Plus, Users, User, Building, Search, Key, Edit, Trash2, Mail, Phone, FileText, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EntityModal } from '../components/entities/EntityModal';
import type { Entity } from '../types/financial';

interface EntitiesViewProps {
  entities: Entity[];
  onAddEntity: (entity: Omit<Entity, 'id'>) => void;
  onUpdateEntity: (id: string, entity: Omit<Entity, 'id'>) => void;
  onDeleteEntity: (id: string) => void;
}

export const EntitiesView: React.FC<EntitiesViewProps> = ({
  entities,
  onAddEntity,
  onUpdateEntity,
  onDeleteEntity,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'individual' | 'company'>('all');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingEntity(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (entity: Entity) => {
    setEditingEntity(entity);
    setIsModalOpen(true);
  };

  const handleSave = (data: Omit<Entity, 'id'>, editId?: string) => {
    if (editId) {
      onUpdateEntity(editId, data);
    } else {
      onAddEntity(data);
    }
  };

  const handleCopyPixKey = (keyValue: string, keyId: string) => {
    navigator.clipboard.writeText(keyValue);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const filteredEntities = entities.filter((ent) => {
    const matchSearch =
      ent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ent.document && ent.document.includes(searchQuery)) ||
      (ent.email && ent.email.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterType === 'all') return matchSearch;
    return matchSearch && ent.type === filterType;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" /> Pessoas & Empresas
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre contatos, fornecedores e clientes com gerenciamento de múltiplas chaves PIX
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4 text-slate-950" />} onClick={handleOpenAdd}>
          Nova Pessoa / Empresa
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por nome, CPF/CNPJ, e-mail..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-emerald-400 text-slate-950 shadow-xs font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({entities.length})
          </button>
          <button
            onClick={() => setFilterType('individual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              filterType === 'individual'
                ? 'bg-emerald-400 text-slate-950 shadow-xs font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Pessoas Físicas
          </button>
          <button
            onClick={() => setFilterType('company')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              filterType === 'company'
                ? 'bg-emerald-400 text-slate-950 shadow-xs font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" /> Empresas
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredEntities.length === 0 ? (
        <div className="dash-card p-12 text-center bg-white border border-slate-200 rounded-2xl">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">Nenhum cadastro encontrado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Cadastre pessoas ou empresas para facilitar o lançamento de novas receitas e despesas vinculadas.
          </p>
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4 text-slate-950" />} onClick={handleOpenAdd}>
            Cadastrar Agora
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEntities.map((entity) => (
            <div
              key={entity.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Badge & Actions */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        entity.type === 'company'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {entity.type === 'company' ? (
                        <Building className="w-5 h-5" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <Badge variant={entity.type === 'company' ? 'teal' : 'emerald'}>
                        {entity.type === 'company' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(entity)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteEntity(entity.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 truncate mb-1">{entity.name}</h3>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  {entity.document && (
                    <p className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{entity.document}</span>
                    </p>
                  )}
                  {entity.email && (
                    <p className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{entity.email}</span>
                    </p>
                  )}
                  {entity.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{entity.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* PIX Keys Section */}
              <div className="border-t border-slate-100 pt-3 mt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <Key className="w-3 h-3 text-emerald-600" /> Chaves PIX ({entity.pix_keys?.length || 0})
                  </span>
                </div>

                {!entity.pix_keys || entity.pix_keys.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">Sem chaves PIX cadastradas</p>
                ) : (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {entity.pix_keys.map((pix) => (
                      <div
                        key={pix.id}
                        className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1.5">
                            [{pix.key_type}]
                          </span>
                          <span className="text-slate-800 font-medium truncate inline-block max-w-[140px] align-bottom">
                            {pix.key_value}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopyPixKey(pix.key_value, pix.id)}
                          className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 cursor-pointer shrink-0"
                          title="Copiar Chave PIX"
                        >
                          {copiedKeyId === pix.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-[10px] text-emerald-600 font-bold">Copiado</span>
                            </>
                          ) : (
                            <span className="text-[10px] hover:underline">Copiar</span>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <EntityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveEntity={handleSave}
        editingEntity={editingEntity}
      />
    </div>
  );
};
