import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Plus, Trash2, Key, User, Building } from 'lucide-react';
import type { Entity, EntityType, PixKey, PixKeyType } from '../../types/financial';

interface EntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEntity: (entity: Omit<Entity, 'id'>, editId?: string) => void;
  editingEntity?: Entity | null;
}

export const EntityModal: React.FC<EntityModalProps> = ({
  isOpen,
  onClose,
  onSaveEntity,
  editingEntity,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<EntityType>('individual');
  const [document, setDocument] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pixKeys, setPixKeys] = useState<PixKey[]>([]);

  useEffect(() => {
    if (editingEntity) {
      setName(editingEntity.name);
      setType(editingEntity.type);
      setDocument(editingEntity.document || '');
      setEmail(editingEntity.email || '');
      setPhone(editingEntity.phone || '');
      setPixKeys(editingEntity.pix_keys || []);
    } else {
      setName('');
      setType('individual');
      setDocument('');
      setEmail('');
      setPhone('');
      setPixKeys([]);
    }
  }, [editingEntity, isOpen]);

  const handleAddPixKey = () => {
    const newKey: PixKey = {
      id: `pix_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      key_type: type === 'company' ? 'cnpj' : 'cpf',
      key_value: '',
    };
    setPixKeys((prev) => [...prev, newKey]);
  };

  const handleRemovePixKey = (id: string) => {
    setPixKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const handleUpdatePixKey = (id: string, field: 'key_type' | 'key_value', val: string) => {
    setPixKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, [field]: val } : k))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveEntity(
      {
        name,
        type,
        document,
        email,
        phone,
        pix_keys: pixKeys.filter((k) => k.key_value.trim().length > 0),
      },
      editingEntity?.id
    );

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEntity ? 'Editar Cadastro' : 'Novo Cadastro de Pessoa / Empresa'}
      subtitle="Gerencie contatos, fornecedores e clientes com suporte a múltiplas chaves PIX"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type selector */}
        <div className="flex gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setType('individual')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              type === 'individual'
                ? 'bg-white text-emerald-900 border border-emerald-400 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-emerald-600" />
            <span>Pessoa Física</span>
          </button>
          <button
            type="button"
            onClick={() => setType('company')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              type === 'company'
                ? 'bg-white text-emerald-900 border border-emerald-400 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4 text-teal-600" />
            <span>Empresa / Pessoa Jurídica</span>
          </button>
        </div>

        {/* Basic fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={type === 'company' ? 'Razão Social / Nome Fantasia' : 'Nome Completo'}
            placeholder={type === 'company' ? 'Ex: Google Brasil Ltda' : 'Ex: João da Silva'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label={type === 'company' ? 'CNPJ' : 'CPF'}
            placeholder={type === 'company' ? '00.000.000/0001-00' : '000.000.000-00'}
            value={document}
            onChange={(e) => setDocument(e.target.value)}
          />

          <Input
            label="E-mail de Contato"
            type="email"
            placeholder="contato@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Telefone / WhatsApp"
            placeholder="(11) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* PIX Keys Section */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-emerald-600" /> Chaves PIX Vinculadas
              </h4>
              <p className="text-[11px] text-slate-500">
                Adicione uma ou mais chaves PIX para esta pessoa/empresa
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5 text-emerald-600" />}
              onClick={handleAddPixKey}
            >
              Adicionar Chave PIX
            </Button>
          </div>

          {pixKeys.length === 0 ? (
            <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
              Nenhuma chave PIX cadastrada ainda. Clique em "Adicionar Chave PIX".
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {pixKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200"
                >
                  <div className="w-1/3">
                    <Select
                      options={[
                        { value: 'cpf', label: 'CPF' },
                        { value: 'cnpj', label: 'CNPJ' },
                        { value: 'email', label: 'E-mail' },
                        { value: 'phone', label: 'Telefone' },
                        { value: 'random', label: 'Chave Aleatória' },
                      ]}
                      value={key.key_type}
                      onChange={(e) =>
                        handleUpdatePixKey(key.id, 'key_type', e.target.value as PixKeyType)
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Informe a chave PIX..."
                      value={key.key_value}
                      onChange={(e) => handleUpdatePixKey(key.id, 'key_value', e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePixKey(key.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remover Chave PIX"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {editingEntity ? 'Salvar Alterações' : 'Cadastrar Pessoa/Empresa'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
