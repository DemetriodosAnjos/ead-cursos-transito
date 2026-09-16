import React, { useState } from 'react';
import { X, Search, FileText, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Order } from '../types';

interface OrderRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderFound: (order: Order) => void;
}

export const OrderRecoveryModal: React.FC<OrderRecoveryModalProps> = ({
  isOpen,
  onClose,
  onOrderFound,
}) => {
  const [cpfOrId, setCpfOrId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpfOrId.trim()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const cleanTerm = cpfOrId.trim();
      const res = await fetch(`/api/orders/lookup?cpf=${encodeURIComponent(cleanTerm)}`);
      const data = await res.json();

      if (!res.ok || !data.order) {
        throw new Error(data.error || 'Nenhum pedido ou matrícula localizado com este CPF/Código.');
      }

      onOrderFound(data.order);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao buscar pedido. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        id="recovery-modal-card"
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">2ª Via do Pedido / Pagamento</h3>
              <p className="text-xs text-zinc-400">Recupere sua tela de pagamento informando seu CPF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Digite seu CPF ou Código do Pedido:
            </label>
            <div className="relative">
              <input
                id="input-recovery-cpf"
                type="text"
                placeholder="Ex: 000.000.000-00 ou ped_..."
                value={cpfOrId}
                onChange={(e) => setCpfOrId(e.target.value)}
                autoFocus
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 font-mono transition-all"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-950/50 border border-red-800/50 rounded-xl flex items-start gap-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              id="submit-recovery-btn"
              type="submit"
              disabled={loading || !cpfOrId.trim()}
              className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Buscando Pré-Matrícula...</span>
                </>
              ) : (
                <>
                  <span>Recuperar Tela de Pagamento</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <p className="text-center text-[11px] text-zinc-500 pt-1">
            Se você já cadastrou seus dados, sua vaga está reservada e pronta para emissão de Pix ou Cartão.
          </p>
        </form>
      </div>
    </div>
  );
};
