'use client';

import { useState, useRef } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Calendar,
  FileText,
  Upload,
  Search,
  ArrowUpDown,
  Paperclip,
  DollarSign,
  CheckCircle2,
  Clock,
  CreditCard,
  QrCode,
  Sparkles,
  ArrowRight,
  TrendingUp,
  PieChart,
  Lock
} from 'lucide-react';
import { FinanceiroItem, PlanejamentoItem, Usuario } from '@/utils/supabase';

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────
interface FinanceiroViewProps {
  financeiro: FinanceiroItem[];
  planejamento: PlanejamentoItem[];
  currentUser?: Usuario | null;
  onAddFinanceiro: (item: Omit<FinanceiroItem, 'id' | 'valor_pendente' | 'criado_em'> | Omit<FinanceiroItem, 'id' | 'valor_pendente' | 'criado_em'>[]) => void;
  onUpdateFinanceiro: (id: string, updates: Partial<FinanceiroItem>) => void;
  onDeleteFinanceiro: (id: string) => void;
  onAddPlanejamento: (item: Omit<PlanejamentoItem, 'id' | 'criado_em'>) => void;
  onUpdatePlanejamento: (id: string, updates: Partial<PlanejamentoItem>) => void;
  onDeletePlanejamento: (id: string) => void;
}

type SortFieldFinanceiro = 'item' | 'valor_total' | 'valor_pago' | 'valor_pendente' | 'pagante' | 'data' | 'parcela';
type SortFieldPlanejamento = 'item' | 'valor_estimado' | 'unidade_medida';

// ─────────────────────────────────────────────────────────
// MOBILE: Gasto Card with Swipe-to-Confirm / Pay
// ─────────────────────────────────────────────────────────
function MobileFinanceiroCard({
  item,
  canEdit,
  onEdit,
  onDelete,
  onToggleStatus,
  onOpenReceipts,
  formatCurrency,
  formatQuantityDisplay
}: {
  item: FinanceiroItem;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onOpenReceipts: () => void;
  formatCurrency: (val: number) => string;
  formatQuantityDisplay: (medida?: any, qty?: any, price?: any) => string;
}) {
  const [swipeX, setSwipeX] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isPaid = item.valor_pago >= item.valor_total;
  const receiptsCount = item.comprovantes?.length || (item.comprovante_url ? 1 : 0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    isDraggingRef.current = false;
    setIsTracking(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!canEdit) return;
    const dx = e.touches[0].clientX - startXRef.current;
    const dy = e.touches[0].clientY - startYRef.current;

    if (!isDraggingRef.current) {
      if (Math.abs(dx) > Math.abs(dy) + 5) {
        isDraggingRef.current = true;
        setIsTracking(true);
      } else {
        return;
      }
    }

    const width = containerRef.current?.clientWidth || 320;
    if (dx > 0) {
      setSwipeX(Math.min(dx, width));
    }
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current || !canEdit) return;
    const width = containerRef.current?.clientWidth || 320;

    if (swipeX > width * 0.4 || swipeX > 120) {
      onToggleStatus();
    }
    setIsTracking(false);
    setSwipeX(0);
  };

  const containerWidth = containerRef.current?.clientWidth || 320;
  const progressPercent = Math.min(100, Math.round((swipeX / containerWidth) * 100));

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm bg-white touch-pan-y">
      {/* Background fill during swipe */}
      {canEdit && swipeX > 0 && (
        <div
          className="absolute inset-0 bg-green-500 flex items-center justify-start pl-6 text-white font-extrabold text-sm z-0 transition-none"
          style={{ width: `${progressPercent}%` }}
        >
          <span className="flex items-center gap-2">
            <Check className="w-5 h-5 animate-bounce" />
            {isPaid ? 'Marcar Pendente' : 'Marcar como Pago'}
          </span>
        </div>
      )}

      {/* Main Card Content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={canEdit ? onEdit : onOpenReceipts}
        style={{
          transform: canEdit && swipeX > 0 ? `translateX(${swipeX}px)` : 'none',
          transition: isTracking ? 'none' : 'transform 0.2s ease-out'
        }}
        className={`relative z-10 p-4 space-y-3 bg-white transition-colors cursor-pointer ${
          isPaid ? 'border-l-4 border-l-green-500 bg-green-50/10' : 'border-l-4 border-l-amber-500'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-black text-slate-800 text-base flex items-center gap-1.5">
              {item.item}
              {!canEdit && <span title="Somente leitura"><Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" /></span>}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold mt-1">
              <span>📅 {new Date(item.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
              <span>•</span>
              <span>👤 {item.pagante}</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (canEdit) onToggleStatus();
            }}
            disabled={!canEdit}
            className={`shrink-0 px-3 py-1 text-[10px] font-black uppercase rounded-full border transition-all ${
              isPaid ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'
            } ${!canEdit ? 'opacity-70 cursor-default' : 'active:scale-95'}`}
          >
            {isPaid ? 'Pago' : 'Pendente'}
          </button>
        </div>

        {/* Quantidade, Valor, Forma */}
        <div className="bg-slate-50 p-3 rounded-xl grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="text-[9px] font-extrabold text-slate-400 uppercase">Qtd / Medida</div>
            <div className="font-bold text-slate-700 text-xs mt-0.5 truncate">
              {formatQuantityDisplay(item.unidade_medida, item.quantidade, item.preco_unitario)}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-extrabold text-slate-400 uppercase">Valor Total</div>
            <div className="font-black text-slate-900 text-sm mt-0.5">{formatCurrency(item.valor_total)}</div>
          </div>
          <div>
            <div className="text-[9px] font-extrabold text-slate-400 uppercase">Forma</div>
            <div className="font-bold text-purple-700 text-xs mt-0.5 truncate">{item.meio_pagamento || 'Pix'}</div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs" onClick={(e) => e.stopPropagation()}>
          <span className="text-[11px] font-bold text-slate-400">
            Parcelas: <strong className="text-slate-700">{item.total_parcelas && item.total_parcelas > 1 ? `${item.parcela_atual || 1}/${item.total_parcelas}` : 'À Vista'}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenReceipts}
              className="p-2 bg-blue-50 text-sonic-sky rounded-xl active:scale-95 flex items-center gap-1 font-bold text-[11px]"
              title="Comprovantes"
            >
              <Paperclip className="w-3.5 h-3.5" />
              {receiptsCount}/3
            </button>
            {canEdit ? (
              <>
                <button onClick={onEdit} className="p-2 bg-slate-100 text-slate-600 rounded-xl active:scale-95">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={onDelete} className="p-2 bg-red-50 text-red-500 rounded-xl active:scale-95">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold italic bg-slate-100 px-2 py-1 rounded-xl">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> Leitura
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FinanceiroView({
  financeiro,
  planejamento,
  currentUser,
  onAddFinanceiro,
  onUpdateFinanceiro,
  onDeleteFinanceiro,
  onAddPlanejamento,
  onUpdatePlanejamento,
  onDeletePlanejamento
}: FinanceiroViewProps) {
  const isUserAdmin = currentUser?.login?.toLowerCase() === 'admin';

  const getUserPagante = (): 'Wellington' | 'Raissa' => {
    if (currentUser?.nome?.toLowerCase() === 'raissa' || currentUser?.login?.toLowerCase() === 'raissa') {
      return 'Raissa';
    }
    return 'Wellington';
  };

  const userDefaultPagante = getUserPagante();

  const canEditReal = (item: FinanceiroItem) => {
    if (!currentUser) return false;
    if (isUserAdmin) return true;
    if (item.usuario_id && currentUser.id) {
      return item.usuario_id === currentUser.id;
    }
    return item.pagante.toLowerCase() === userDefaultPagante.toLowerCase();
  };

  const canEditPlan = (item: PlanejamentoItem) => {
    if (!currentUser) return false;
    if (isUserAdmin) return true;
    if (item.usuario_id && currentUser.id) {
      return item.usuario_id === currentUser.id;
    }
    return true;
  };
  // ── Main Tab Selection ──
  const [subTab, setSubTab] = useState<'planejamento' | 'reais'>('reais');

  // ── State: Filters & Sort ──
  const [search, setSearch] = useState('');
  const [filterPagante, setFilterPagante] = useState<'todos' | 'Wellington' | 'Raissa'>('todos');
  const [filterMeioPagamento, setFilterMeioPagamento] = useState<'todos' | 'Pix' | 'Cartão de Crédito' | 'Dinheiro' | 'Outro'>('todos');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'pago' | 'pendente'>('todos');
  
  const [sortFinanceiroField, setSortFinanceiroField] = useState<SortFieldFinanceiro>('data');
  const [sortFinanceiroDir, setSortFinanceiroDir] = useState<'asc' | 'desc'>('desc');

  const [sortPlanField, setSortPlanField] = useState<SortFieldPlanejamento>('item');
  const [sortPlanDir, setSortPlanDir] = useState<'asc' | 'desc'>('asc');

  // ── State: Form Modals ──
  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  const [isRealFormOpen, setIsRealFormOpen] = useState(false);
  const [editingRealId, setEditingRealId] = useState<string | null>(null);

  // ── Form State: Planejamento (Simples) ──
  const [planItem, setPlanItem] = useState('');
  const [planMedida, setPlanMedida] = useState<'fixo' | 'unid' | 'kg'>('fixo');
  const [planQtd, setPlanQtd] = useState('');
  const [planPrecoUnit, setPlanPrecoUnit] = useState('');
  const [planValorEstimadoFixo, setPlanValorEstimadoFixo] = useState('');
  const [planObs, setPlanObs] = useState('');

  // ── Form State: Gastos Reais (Efetivados) ──
  const [realItem, setRealItem] = useState('');
  const [realMedida, setRealMedida] = useState<'fixo' | 'unid' | 'kg'>('fixo');
  const [realQtd, setRealQtd] = useState('');
  const [realPrecoUnit, setRealPrecoUnit] = useState('');
  const [realValorTotalFixo, setRealValorTotalFixo] = useState('');
  const [realValorPago, setRealValorPago] = useState('');
  const [realMeioPagamento, setRealMeioPagamento] = useState<'Pix' | 'Cartão de Crédito' | 'Dinheiro' | 'Outro'>('Pix');
  const [realPagante, setRealPagante] = useState<'Wellington' | 'Raissa'>('Wellington');
  const [realData, setRealData] = useState(new Date().toISOString().split('T')[0]);
  const [realParcelas, setRealParcelas] = useState<number>(1);
  const [realObs, setRealObs] = useState('');
  const [realComprovantes, setRealComprovantes] = useState<string[]>([]);

  // ── State: Receipt Modal ──
  const [receiptModalItem, setReceiptModalItem] = useState<FinanceiroItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // ─────────────────────────────────────────────────────────
  // CALCULATIONS
  // ─────────────────────────────────────────────────────────

  // Calculation helpers
  const getPlanCalculatedTotal = (): number => {
    if (planMedida === 'unid' || planMedida === 'kg') {
      const q = parseFloat(planQtd) || 0;
      const p = parseFloat(planPrecoUnit) || 0;
      return Number((q * p).toFixed(2));
    }
    return parseFloat(planValorEstimadoFixo) || 0;
  };

  const getRealCalculatedTotal = (): number => {
    if (realMedida === 'unid' || realMedida === 'kg') {
      const q = parseFloat(realQtd) || 0;
      const p = parseFloat(realPrecoUnit) || 0;
      return Number((q * p).toFixed(2));
    }
    return parseFloat(realValorTotalFixo) || 0;
  };

  // Planejamento Summaries
  const totalPlanejado = planejamento.reduce((acc, c) => acc + Number(c.valor_estimado || 0), 0);

  // Gastos Reais Summaries
  const totalRealOrcado = financeiro.reduce((acc, c) => acc + Number(c.valor_total || 0), 0);
  const totalRealPago = financeiro.reduce((acc, c) => acc + Number(c.valor_pago || 0), 0);
  const totalRealPendente = totalRealOrcado - totalRealPago;

  const totalWellington = financeiro.filter(f => f.pagante === 'Wellington').reduce((acc, c) => acc + Number(c.valor_total || 0), 0);
  const pagoWellington = financeiro.filter(f => f.pagante === 'Wellington').reduce((acc, c) => acc + Number(c.valor_pago || 0), 0);

  const totalRaissa = financeiro.filter(f => f.pagante === 'Raissa').reduce((acc, c) => acc + Number(c.valor_total || 0), 0);
  const pagoRaissa = financeiro.filter(f => f.pagante === 'Raissa').reduce((acc, c) => acc + Number(c.valor_pago || 0), 0);

  // Formatting
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const formatQuantityDisplay = (medida?: 'fixo' | 'unid' | 'kg', qtd?: number, preco?: number) => {
    if (medida === 'unid' && qtd) {
      return `${qtd} unid ${preco ? `(R$ ${preco.toFixed(2)}/un)` : ''}`;
    }
    if (medida === 'kg' && qtd) {
      return `${qtd} kg ${preco ? `(R$ ${preco.toFixed(2)}/kg)` : ''}`;
    }
    return 'Livre';
  };

  // ─────────────────────────────────────────────────────────
  // FILTER & SORT LOGIC
  // ─────────────────────────────────────────────────────────
  const filteredPlanejamento = planejamento.filter(p =>
    p.item.toLowerCase().includes(search.toLowerCase()) ||
    (p.observacao && p.observacao.toLowerCase().includes(search.toLowerCase()))
  );

  const sortedPlanejamento = [...filteredPlanejamento].sort((a, b) => {
    const dir = sortPlanDir === 'asc' ? 1 : -1;
    switch (sortPlanField) {
      case 'item':
        return dir * a.item.localeCompare(b.item, 'pt-BR');
      case 'valor_estimado':
        return dir * (a.valor_estimado - b.valor_estimado);
      case 'unidade_medida':
        return dir * a.unidade_medida.localeCompare(b.unidade_medida);
      default:
        return 0;
    }
  });

  const filteredFinanceiro = financeiro.filter(f => {
    const matchesSearch = f.item.toLowerCase().includes(search.toLowerCase()) ||
      (f.observacao && f.observacao.toLowerCase().includes(search.toLowerCase()));
    const matchesPagante = filterPagante === 'todos' ? true : f.pagante === filterPagante;
    const matchesMeio = filterMeioPagamento === 'todos' ? true : f.meio_pagamento === filterMeioPagamento;
    const isPaid = f.valor_pago >= f.valor_total;
    const matchesStatus =
      filterStatus === 'todos' ? true :
      filterStatus === 'pago' ? isPaid : !isPaid;
    return matchesSearch && matchesPagante && matchesMeio && matchesStatus;
  });

  const sortedFinanceiro = [...filteredFinanceiro].sort((a, b) => {
    const dir = sortFinanceiroDir === 'asc' ? 1 : -1;
    switch (sortFinanceiroField) {
      case 'item':
        return dir * a.item.localeCompare(b.item, 'pt-BR');
      case 'valor_total':
        return dir * (a.valor_total - b.valor_total);
      case 'valor_pago':
        return dir * (a.valor_pago - b.valor_pago);
      case 'valor_pendente':
        return dir * (a.valor_pendente - b.valor_pendente);
      case 'pagante':
        return dir * a.pagante.localeCompare(b.pagante, 'pt-BR');
      case 'data':
        return dir * a.data.localeCompare(b.data);
      case 'parcela':
        return dir * ((a.parcela_atual || 1) - (b.parcela_atual || 1));
      default:
        return 0;
    }
  });

  // ─────────────────────────────────────────────────────────
  // FORM HANDLERS: PLANEJAMENTO
  // ─────────────────────────────────────────────────────────
  const openNewPlanForm = () => {
    setEditingPlanId(null);
    setPlanItem('');
    setPlanMedida('fixo');
    setPlanQtd('');
    setPlanPrecoUnit('');
    setPlanValorEstimadoFixo('');
    setPlanObs('');
    setIsPlanFormOpen(true);
  };

  const openEditPlanForm = (p: PlanejamentoItem) => {
    if (!canEditPlan(p)) return;
    setEditingPlanId(p.id);
    setPlanItem(p.item);
    setPlanMedida(p.unidade_medida || 'fixo');
    setPlanQtd(p.quantidade ? p.quantidade.toString() : '');
    setPlanPrecoUnit(p.preco_unitario ? p.preco_unitario.toString() : '');
    setPlanValorEstimadoFixo(p.valor_estimado ? p.valor_estimado.toString() : '');
    setPlanObs(p.observacao || '');
    setIsPlanFormOpen(true);
  };

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planItem.trim()) {
      alert('Por favor, informe a descrição do item.');
      return;
    }
    const val = getPlanCalculatedTotal();
    if (val <= 0) {
      alert('Informe um valor estimado válido.');
      return;
    }

    const payload = {
      item: planItem.trim(),
      unidade_medida: planMedida,
      quantidade: parseFloat(planQtd) || undefined,
      preco_unitario: parseFloat(planPrecoUnit) || undefined,
      valor_estimado: val,
      observacao: planObs.trim() || undefined,
      usuario_id: currentUser?.id
    };

    if (editingPlanId) {
      onUpdatePlanejamento(editingPlanId, payload);
    } else {
      onAddPlanejamento(payload);
    }
    setIsPlanFormOpen(false);
  };

  // Convert Planned Item to Real Expense Form
  const handleConvertPlanToReal = (p: PlanejamentoItem) => {
    setEditingRealId(null);
    setRealItem(p.item);
    setRealMedida(p.unidade_medida);
    setRealQtd(p.quantidade ? p.quantidade.toString() : '');
    setRealPrecoUnit(p.preco_unitario ? p.preco_unitario.toString() : '');
    setRealValorTotalFixo(p.valor_estimado ? p.valor_estimado.toString() : '');
    setRealValorPago('');
    setRealMeioPagamento('Pix');
    setRealPagante(userDefaultPagante);
    setRealData(new Date().toISOString().split('T')[0]);
    setRealParcelas(1);
    setRealObs(p.observacao ? `[Importado do Planejamento] ${p.observacao}` : '[Importado do Planejamento]');
    setRealComprovantes([]);
    setSubTab('reais');
    setIsRealFormOpen(true);
  };

  // ─────────────────────────────────────────────────────────
  // FORM HANDLERS: GASTOS REAIS
  // ─────────────────────────────────────────────────────────
  const openNewRealForm = () => {
    setEditingRealId(null);
    setRealItem('');
    setRealMedida('fixo');
    setRealQtd('');
    setRealPrecoUnit('');
    setRealValorTotalFixo('');
    setRealValorPago('');
    setRealMeioPagamento('Pix');
    setRealPagante(userDefaultPagante);
    setRealData(new Date().toISOString().split('T')[0]);
    setRealParcelas(1);
    setRealObs('');
    setRealComprovantes([]);
    setIsRealFormOpen(true);
  };

  const openEditRealForm = (item: FinanceiroItem) => {
    if (!canEditReal(item)) return;
    setEditingRealId(item.id);
    setRealItem(item.item);
    setRealMedida(item.unidade_medida || 'fixo');
    setRealQtd(item.quantidade ? item.quantidade.toString() : '');
    setRealPrecoUnit(item.preco_unitario ? item.preco_unitario.toString() : '');
    setRealValorTotalFixo(item.valor_total ? item.valor_total.toString() : '');
    setRealValorPago(item.valor_pago ? item.valor_pago.toString() : '');
    setRealMeioPagamento(item.meio_pagamento || 'Pix');
    setRealPagante(item.pagante);
    setRealData(item.data);
    setRealParcelas(item.total_parcelas || 1);
    setRealObs(item.observacao || '');

    const receipts = item.comprovantes && item.comprovantes.length > 0
      ? item.comprovantes
      : item.comprovante_url ? [item.comprovante_url] : [];
    setRealComprovantes(receipts);

    setIsRealFormOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (realComprovantes.length + files.length > 3) {
      alert('Atenção: É permitido anexar até 3 comprovantes por item.');
      return;
    }

    const newFiles: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const rand = Math.floor(Math.random() * 9000) + 1000;
      const cleanName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      newFiles.push(`/comprovantes/${rand}_${cleanName}`);
    }

    setRealComprovantes((prev) => [...prev, ...newFiles].slice(0, 3));
    if (e.target) e.target.value = '';
  };

  const handleRemoveReceipt = (index: number) => {
    setRealComprovantes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!realItem.trim()) {
      alert('Por favor, informe a descrição do gasto.');
      return;
    }
    const valTotal = getRealCalculatedTotal();
    if (valTotal <= 0) {
      alert('Informe um valor total válido.');
      return;
    }

    const valPago = parseFloat(realValorPago) || 0;
    const qtyNum = parseFloat(realQtd) || undefined;
    const unitPriceNum = parseFloat(realPrecoUnit) || undefined;

    if (editingRealId) {
      onUpdateFinanceiro(editingRealId, {
        item: realItem.trim(),
        unidade_medida: realMedida,
        quantidade: qtyNum,
        preco_unitario: unitPriceNum,
        valor_total: valTotal,
        valor_pago: valPago,
        meio_pagamento: realMeioPagamento,
        pagante: realPagante,
        data: realData,
        total_parcelas: realParcelas,
        observacao: realObs.trim() || undefined,
        comprovantes: realComprovantes,
        comprovante_url: realComprovantes[0] || undefined,
        usuario_id: currentUser?.id
      });
    } else {
      if (realParcelas > 1) {
        const installmentValue = Number((valTotal / realParcelas).toFixed(2));
        const installmentItems: Omit<FinanceiroItem, 'id' | 'valor_pendente' | 'criado_em'>[] = [];
        const baseDate = new Date(realData);

        for (let i = 1; i <= realParcelas; i++) {
          const installmentDate = new Date(baseDate);
          installmentDate.setMonth(baseDate.getMonth() + (i - 1));
          const dateStr = installmentDate.toISOString().split('T')[0];

          const paidForThisParcel = i === 1 ? Math.min(valPago, installmentValue) : 0;

          installmentItems.push({
            item: `${realItem.trim()} (${i}/${realParcelas})`,
            unidade_medida: realMedida,
            quantidade: qtyNum,
            preco_unitario: unitPriceNum,
            valor_total: installmentValue,
            valor_pago: paidForThisParcel,
            meio_pagamento: realMeioPagamento,
            pagante: realPagante,
            data: dateStr,
            parcela_atual: i,
            total_parcelas: realParcelas,
            observacao: realObs.trim() || undefined,
            comprovantes: i === 1 ? realComprovantes : [],
            comprovante_url: i === 1 ? realComprovantes[0] : undefined,
            usuario_id: currentUser?.id
          });
        }
        onAddFinanceiro(installmentItems);
      } else {
        onAddFinanceiro({
          item: realItem.trim(),
          unidade_medida: realMedida,
          quantidade: qtyNum,
          preco_unitario: unitPriceNum,
          valor_total: valTotal,
          valor_pago: valPago,
          meio_pagamento: realMeioPagamento,
          pagante: realPagante,
          data: realData,
          parcela_atual: 1,
          total_parcelas: 1,
          observacao: realObs.trim() || undefined,
          comprovantes: realComprovantes,
          comprovante_url: realComprovantes[0] || undefined,
        });
      }
    }

    setIsRealFormOpen(false);
  };

  const toggleFullPayment = (item: FinanceiroItem) => {
    if (!canEditReal(item)) return;
    const isPaid = item.valor_pago >= item.valor_total;
    onUpdateFinanceiro(item.id, {
      valor_pago: isPaid ? 0 : item.valor_total
    });
  };

  // Receipt Modal handlers (Up to 3 receipts)
  const handleModalAddReceipt = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!receiptModalItem) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentReceipts = receiptModalItem.comprovantes || (receiptModalItem.comprovante_url ? [receiptModalItem.comprovante_url] : []);
    if (currentReceipts.length + files.length > 3) {
      alert('Atenção: É permitido anexar no máximo 3 comprovantes.');
      return;
    }

    const newFiles: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const rand = Math.floor(Math.random() * 9000) + 1000;
      const cleanName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      newFiles.push(`/comprovantes/${rand}_${cleanName}`);
    }

    const updatedList = [...currentReceipts, ...newFiles].slice(0, 3);
    onUpdateFinanceiro(receiptModalItem.id, {
      comprovantes: updatedList,
      comprovante_url: updatedList[0] || undefined
    });
    setReceiptModalItem({
      ...receiptModalItem,
      comprovantes: updatedList,
      comprovante_url: updatedList[0] || undefined
    });
  };

  const handleModalRemoveReceipt = (index: number) => {
    if (!receiptModalItem) return;
    const currentReceipts = receiptModalItem.comprovantes || (receiptModalItem.comprovante_url ? [receiptModalItem.comprovante_url] : []);
    const updatedList = currentReceipts.filter((_, i) => i !== index);
    onUpdateFinanceiro(receiptModalItem.id, {
      comprovantes: updatedList,
      comprovante_url: updatedList[0] || undefined
    });
    setReceiptModalItem({
      ...receiptModalItem,
      comprovantes: updatedList,
      comprovante_url: updatedList[0] || undefined
    });
  };

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 animate-dash">

      {/* ─────────────────────────────────────────────────────────
          TOP HEADER & SUB-NAVIGATION TABS
      ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Módulo Financeiro</h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Orçamento estimado no planejamento vs Controle efetivo de gastos reais
          </p>
        </div>

        {/* Sub-tabs selector */}
        <div className="flex items-center p-1 bg-slate-200/80 rounded-2xl shrink-0">
          <button
            onClick={() => setSubTab('planejamento')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              subTab === 'planejamento'
                ? 'bg-white text-sonic-blue shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Planejamento
          </button>
          <button
            onClick={() => setSubTab('reais')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              subTab === 'reais'
                ? 'bg-white text-sonic-blue shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Gastos Reais
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════
          TAB 1: PLANEJAMENTO (Orçamento Estimado)
      ═════════════════════════════════════════════════════════ */}
      {subTab === 'planejamento' && (
        <div className="space-y-5 animate-dash">

          {/* Planejamento Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-card rounded-3xl p-5 border border-blue-100 bg-blue-50/40">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-blue-600">Total Planejado (Estimado)</div>
              <div className="text-2xl font-black text-blue-950 mt-1">{formatCurrency(totalPlanejado)}</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">
                {planejamento.length} itens orçados no planejamento
              </div>
            </div>

            <button
              onClick={openNewPlanForm}
              className="flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-bold text-white sonic-gradient-primary rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Novo Item no Planejamento
            </button>
          </div>

          {/* Search Toolbar */}
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar no planejamento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-base md:text-xs font-semibold text-slate-700 focus:outline-none focus:border-sonic-blue shadow-sm"
            />
          </div>

          {/* Planejamento Desktop Grid */}
          <div className="hidden md:flex md:flex-col glass-card rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden bg-white">
            <div className="overflow-x-auto w-full overflow-y-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead className="sticky top-0 z-10 bg-slate-900">
                  <tr className="bg-slate-900 text-white text-[10px] uppercase font-bold tracking-wider whitespace-nowrap">
                    <th className="px-5 py-4 w-64">
                      <button onClick={() => { setSortPlanField('item'); setSortPlanDir(d => d === 'asc' ? 'desc' : 'asc'); }} className="flex items-center gap-1.5 cursor-pointer hover:text-yellow-300 transition-colors">
                        ITEM
                        <ArrowUpDown className={`w-3 h-3 ${sortPlanField === 'item' ? 'text-yellow-400' : 'text-slate-500'}`} />
                        {sortPlanField === 'item' && <span className="text-yellow-400 text-[8px]">{sortPlanDir === 'asc' ? '↑' : '↓'}</span>}
                      </button>
                    </th>
                    <th className="px-4 py-4 w-40 text-white font-bold text-[10px] uppercase tracking-wider">QTD.</th>
                    <th className="px-4 py-4 w-36">
                      <button onClick={() => { setSortPlanField('valor_estimado'); setSortPlanDir(d => d === 'asc' ? 'desc' : 'asc'); }} className="flex items-center gap-1.5 cursor-pointer hover:text-yellow-300 transition-colors">
                        VALOR
                        <ArrowUpDown className={`w-3 h-3 ${sortPlanField === 'valor_estimado' ? 'text-yellow-400' : 'text-slate-500'}`} />
                        {sortPlanField === 'valor_estimado' && <span className="text-yellow-400 text-[8px]">{sortPlanDir === 'asc' ? '↑' : '↓'}</span>}
                      </button>
                    </th>
                    <th className="px-4 py-4 w-64 text-white font-bold text-[10px] uppercase tracking-wider">OBSERVAÇÕES</th>
                    <th className="px-5 py-4 w-44 text-center text-white font-bold text-[10px] uppercase tracking-wider">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                  {sortedPlanejamento.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400 font-semibold bg-white">
                        Nenhum item estimado no planejamento.
                      </td>
                    </tr>
                  ) : (
                    sortedPlanejamento.map((p) => {
                      const canEdit = canEditPlan(p);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition-colors whitespace-nowrap">
                          <td className="px-5 py-4 font-extrabold text-slate-800 text-[13px]">
                            <span className="flex items-center gap-1.5">
                              {p.item}
                              {!canEdit && <span title="Somente leitura"><Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" /></span>}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs font-semibold text-slate-600">
                            {formatQuantityDisplay(p.unidade_medida, p.quantidade, p.preco_unitario)}
                          </td>
                          <td className="px-4 py-4 text-xs font-black text-blue-900">
                            {formatCurrency(p.valor_estimado)}
                          </td>
                          <td className="px-4 py-4 text-xs text-slate-500 truncate max-w-[240px]">
                            {p.observacao || '-'}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleConvertPlanToReal(p)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-[10px] font-extrabold rounded-xl transition-all cursor-pointer"
                                title="Efetivar como Gasto Real"
                              >
                                <ArrowRight className="w-3 h-3" />
                                Efetivar Gasto
                              </button>
                              {canEdit ? (
                                <>
                                  <button
                                    onClick={() => openEditPlanForm(p)}
                                    className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl transition-all cursor-pointer"
                                    title="Editar"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Excluir item ${p.item} do planejamento?`)) onDeletePlanejamento(p.id);
                                    }}
                                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 rounded-xl transition-all cursor-pointer"
                                    title="Excluir"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold italic">
                                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Leitura
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Planejamento Mobile Cards */}
          <div className="md:hidden space-y-3">
            {sortedPlanejamento.length === 0 ? (
              <div className="text-center py-10 text-slate-400 bg-white rounded-3xl border border-slate-100 p-4">
                <p className="font-bold text-sm">Nenhum item orçado</p>
              </div>
            ) : (
              sortedPlanejamento.map((p) => {
                const canEdit = canEditPlan(p);
                return (
                  <div key={p.id} className="glass-card rounded-2xl p-4 border border-slate-200/80 bg-white space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-black text-slate-800 text-base flex items-center gap-1.5">
                          {p.item}
                          {!canEdit && <span title="Somente leitura"><Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" /></span>}
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          Medida: {formatQuantityDisplay(p.unidade_medida, p.quantidade, p.preco_unitario)}
                        </p>
                      </div>
                      <span className="text-sm font-black text-blue-900">{formatCurrency(p.valor_estimado)}</span>
                    </div>

                    {p.observacao && (
                      <p className="text-xs bg-slate-50 p-2 rounded-xl text-slate-600 italic">
                        {p.observacao}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleConvertPlanToReal(p)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-[11px] font-bold rounded-xl active:scale-95"
                      >
                        Efetivar Gasto <ArrowRight className="w-3 h-3" />
                      </button>
                      {canEdit ? (
                        <div className="flex gap-2">
                          <button onClick={() => openEditPlanForm(p)} className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => { if (confirm(`Excluir ${p.item}?`)) onDeletePlanejamento(p.id); }} className="p-2 bg-red-50 text-red-500 rounded-xl">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold italic bg-slate-100 px-2.5 py-1 rounded-xl">
                          <Lock className="w-3.5 h-3.5" /> Leitura
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          TAB 2: GASTOS REAIS (Controle Efetivado)
      ═════════════════════════════════════════════════════════ */}
      {subTab === 'reais' && (
        <div className="space-y-5 animate-dash">

          {/* Gastos Reais Summary Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="glass-card rounded-2xl p-4 border border-blue-100 bg-blue-50/40 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">Total Efetivo Orçado</span>
                <span className="p-1.5 bg-blue-100 text-blue-600 rounded-xl"><DollarSign className="w-4 h-4" /></span>
              </div>
              <div className="text-xl font-black text-blue-950 mt-1">{formatCurrency(totalRealOrcado)}</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-1">
                Wellington: {formatCurrency(totalWellington)} · Raissa: {formatCurrency(totalRaissa)}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-green-100 bg-green-50/40 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-green-600">Total Efetivo Pago</span>
                <span className="p-1.5 bg-green-100 text-green-600 rounded-xl"><CheckCircle2 className="w-4 h-4" /></span>
              </div>
              <div className="text-xl font-black text-green-950 mt-1">{formatCurrency(totalRealPago)}</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-1">
                Wellington: {formatCurrency(pagoWellington)} · Raissa: {formatCurrency(pagoRaissa)}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-red-100 bg-red-50/40 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-600">Total Pendente</span>
                <span className="p-1.5 bg-red-100 text-red-600 rounded-xl"><Clock className="w-4 h-4" /></span>
              </div>
              <div className="text-xl font-black text-red-950 mt-1">{formatCurrency(totalRealPendente)}</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-1">
                A Pagar: {formatCurrency(totalRealOrcado - totalRealPago)}
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/50 p-3 rounded-3xl border border-slate-200/50 shadow-sm">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar gasto ou observação..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-base md:text-xs font-semibold text-slate-700 focus:outline-none focus:border-sonic-blue shadow-sm"
                />
              </div>

              {/* Pagante */}
              <div className="relative">
                <select
                  value={filterPagante}
                  onChange={(e) => setFilterPagante(e.target.value as any)}
                  className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-2xl text-base md:text-xs font-bold text-slate-700 focus:outline-none shadow-sm appearance-none cursor-pointer"
                >
                  <option value="todos">Todos Pagantes</option>
                  <option value="Wellington">Wellington</option>
                  <option value="Raissa">Raissa</option>
                </select>
                <span className="absolute right-3 top-3 text-[9px] text-slate-400 pointer-events-none">▼</span>
              </div>

              {/* Meio de Pagamento */}
              <div className="relative">
                <select
                  value={filterMeioPagamento}
                  onChange={(e) => setFilterMeioPagamento(e.target.value as any)}
                  className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-2xl text-base md:text-xs font-bold text-slate-700 focus:outline-none shadow-sm appearance-none cursor-pointer"
                >
                  <option value="todos">Todos Meios de Pagamento</option>
                  <option value="Pix">Pix</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Outro">Outro</option>
                </select>
                <span className="absolute right-3 top-3 text-[9px] text-slate-400 pointer-events-none">▼</span>
              </div>

              {/* Status */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-2xl text-base md:text-xs font-bold text-slate-700 focus:outline-none shadow-sm appearance-none cursor-pointer"
                >
                  <option value="todos">Todos Status</option>
                  <option value="pago">Pago</option>
                  <option value="pendente">Pendente</option>
                </select>
                <span className="absolute right-3 top-3 text-[9px] text-slate-400 pointer-events-none">▼</span>
              </div>
            </div>

            <button
              onClick={openNewRealForm}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white sonic-gradient-gold rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Novo Gasto Real
            </button>
          </div>

          {/* Gastos Reais Desktop Grid */}
          <div className="hidden md:flex md:flex-col glass-card rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden bg-white max-h-[calc(100vh-260px)]">
            <div className="overflow-x-auto w-full overflow-y-auto">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead className="sticky top-0 z-10 bg-slate-900">
                  <tr className="bg-slate-900 text-white text-[10px] uppercase font-bold tracking-wider whitespace-nowrap">
                    {/* 1. DATA */}
                    <th className="px-4 py-4 w-28">
                      <button onClick={() => { setSortFinanceiroField('data'); setSortFinanceiroDir(d => d === 'asc' ? 'desc' : 'asc'); }} className="flex items-center gap-1.5 cursor-pointer hover:text-yellow-300 transition-colors">
                        DATA
                        <ArrowUpDown className={`w-3 h-3 ${sortFinanceiroField === 'data' ? 'text-yellow-400' : 'text-slate-500'}`} />
                        {sortFinanceiroField === 'data' && <span className="text-yellow-400 text-[8px]">{sortFinanceiroDir === 'asc' ? '↑' : '↓'}</span>}
                      </button>
                    </th>

                    {/* 2. QTD. */}
                    <th className="px-4 py-4 w-32 text-white font-bold text-[10px] uppercase tracking-wider">QTD.</th>

                    {/* 3. ITEM */}
                    <th className="px-5 py-4 w-52">
                      <button onClick={() => { setSortFinanceiroField('item'); setSortFinanceiroDir(d => d === 'asc' ? 'desc' : 'asc'); }} className="flex items-center gap-1.5 cursor-pointer hover:text-yellow-300 transition-colors">
                        ITEM
                        <ArrowUpDown className={`w-3 h-3 ${sortFinanceiroField === 'item' ? 'text-yellow-400' : 'text-slate-500'}`} />
                        {sortFinanceiroField === 'item' && <span className="text-yellow-400 text-[8px]">{sortFinanceiroDir === 'asc' ? '↑' : '↓'}</span>}
                      </button>
                    </th>

                    {/* 4. VALOR */}
                    <th className="px-4 py-4 w-32">
                      <button onClick={() => { setSortFinanceiroField('valor_total'); setSortFinanceiroDir(d => d === 'asc' ? 'desc' : 'asc'); }} className="flex items-center gap-1.5 cursor-pointer hover:text-yellow-300 transition-colors">
                        VALOR
                        <ArrowUpDown className={`w-3 h-3 ${sortFinanceiroField === 'valor_total' ? 'text-yellow-400' : 'text-slate-500'}`} />
                        {sortFinanceiroField === 'valor_total' && <span className="text-yellow-400 text-[8px]">{sortFinanceiroDir === 'asc' ? '↑' : '↓'}</span>}
                      </button>
                    </th>

                    {/* 5. PARCELA */}
                    <th className="px-4 py-4 w-24">
                      <button onClick={() => { setSortFinanceiroField('parcela'); setSortFinanceiroDir(d => d === 'asc' ? 'desc' : 'asc'); }} className="flex items-center gap-1.5 cursor-pointer hover:text-yellow-300 transition-colors">
                        PARCELA
                        <ArrowUpDown className={`w-3 h-3 ${sortFinanceiroField === 'parcela' ? 'text-yellow-400' : 'text-slate-500'}`} />
                        {sortFinanceiroField === 'parcela' && <span className="text-yellow-400 text-[8px]">{sortFinanceiroDir === 'asc' ? '↑' : '↓'}</span>}
                      </button>
                    </th>

                    {/* 6. FORMA */}
                    <th className="px-4 py-4 w-36 text-white font-bold text-[10px] uppercase tracking-wider">FORMA</th>

                    {/* 7. PAGANTE */}
                    <th className="px-4 py-4 w-32">
                      <button onClick={() => { setSortFinanceiroField('pagante'); setSortFinanceiroDir(d => d === 'asc' ? 'desc' : 'asc'); }} className="flex items-center gap-1.5 cursor-pointer hover:text-yellow-300 transition-colors">
                        PAGANTE
                        <ArrowUpDown className={`w-3 h-3 ${sortFinanceiroField === 'pagante' ? 'text-yellow-400' : 'text-slate-500'}`} />
                        {sortFinanceiroField === 'pagante' && <span className="text-yellow-400 text-[8px]">{sortFinanceiroDir === 'asc' ? '↑' : '↓'}</span>}
                      </button>
                    </th>

                    {/* 8. STATUS */}
                    <th className="px-4 py-4 w-28 text-center text-white font-bold text-[10px] uppercase tracking-wider">STATUS</th>

                    {/* 9. AÇÕES */}
                    <th className="px-5 py-4 w-32 text-center text-white font-bold text-[10px] uppercase tracking-wider">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                  {sortedFinanceiro.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-slate-400 font-semibold bg-white">
                        Nenhum gasto real cadastrado.
                      </td>
                    </tr>
                  ) : (
                    sortedFinanceiro.map((item) => {
                      const isPaid = item.valor_pago >= item.valor_total;
                      const receiptsCount = item.comprovantes?.length || (item.comprovante_url ? 1 : 0);
                      const canEdit = canEditReal(item);

                      return (
                        <tr
                          key={item.id}
                          onClick={() => {
                            if (canEdit) openEditRealForm(item);
                            else setReceiptModalItem(item);
                          }}
                          className="hover:bg-slate-50/80 transition-colors whitespace-nowrap cursor-pointer"
                        >
                          {/* 1. Data */}
                          <td className="px-4 py-4 text-xs font-semibold text-slate-500">
                            {new Date(item.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </td>

                          {/* 2. Qtd */}
                          <td className="px-4 py-4 text-xs font-semibold text-slate-600">
                            {formatQuantityDisplay(item.unidade_medida, item.quantidade, item.preco_unitario)}
                          </td>

                          {/* 3. Item */}
                          <td className="px-5 py-4">
                            <div className="font-extrabold text-slate-800 text-[13px] truncate max-w-[200px] flex items-center gap-1.5">
                              {item.item}
                              {!canEdit && <span title="Somente leitura"><Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" /></span>}
                              {receiptsCount > 0 && (
                                <span className="text-[10px] bg-blue-50 text-sonic-sky font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5" title={`${receiptsCount} comprovante(s)`}>
                                  <Paperclip className="w-3 h-3" />
                                  {receiptsCount}
                                </span>
                              )}
                            </div>
                            {item.observacao && (
                              <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                                {item.observacao}
                              </div>
                            )}
                          </td>

                          {/* 4. Valor */}
                          <td className="px-4 py-4 text-xs font-black text-slate-900">
                            {formatCurrency(item.valor_total)}
                          </td>

                          {/* 5. Parcela */}
                          <td className="px-4 py-4 text-xs font-semibold text-slate-500">
                            {item.total_parcelas && item.total_parcelas > 1
                              ? `${item.parcela_atual || 1}/${item.total_parcelas}`
                              : 'À Vista'}
                          </td>

                          {/* 6. Forma (Meio Pagamento) */}
                          <td className="px-4 py-4 text-xs font-extrabold">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                              item.meio_pagamento === 'Pix'
                                ? 'bg-teal-100 text-teal-800'
                                : item.meio_pagamento === 'Cartão de Crédito'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {item.meio_pagamento || 'Pix'}
                            </span>
                          </td>

                          {/* 7. Pagante */}
                          <td className="px-4 py-4 text-xs font-extrabold text-slate-700">
                            {item.pagante}
                          </td>

                          {/* 8. Status */}
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (canEdit) toggleFullPayment(item);
                              }}
                              disabled={!canEdit}
                              className={`inline-flex px-2.5 py-1 text-[10px] font-black uppercase rounded-full border select-none transition-all ${
                                isPaid
                                  ? 'bg-green-50 border-green-200 text-green-700'
                                  : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                              } ${!canEdit ? 'opacity-70 cursor-default' : 'active:scale-95 cursor-pointer'}`}
                            >
                              {isPaid ? 'Pago' : 'Pendente'}
                            </button>
                          </td>

                          {/* 9. Ações */}
                          <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                            {canEdit ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => openEditRealForm(item)}
                                  className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl transition-all cursor-pointer"
                                  title="Ver Detalhes / Editar"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Excluir gasto ${item.item}?`)) onDeleteFinanceiro(item.id);
                                  }}
                                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 rounded-xl transition-all cursor-pointer"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-semibold italic">
                                <Lock className="w-3.5 h-3.5 text-slate-400" /> Leitura
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gastos Reais Mobile Cards */}
          <div className="md:hidden space-y-3">
            {sortedFinanceiro.length === 0 ? (
              <div className="text-center py-10 text-slate-400 bg-white rounded-3xl border border-slate-100 p-4">
                <p className="font-bold text-sm">Nenhum gasto cadastrado</p>
              </div>
            ) : (
              sortedFinanceiro.map((item) => (
                <MobileFinanceiroCard
                  key={item.id}
                  item={item}
                  canEdit={canEditReal(item)}
                  onEdit={() => openEditRealForm(item)}
                  onDelete={() => {
                    if (confirm(`Excluir gasto ${item.item}?`)) onDeleteFinanceiro(item.id);
                  }}
                  onToggleStatus={() => toggleFullPayment(item)}
                  onOpenReceipts={() => setReceiptModalItem(item)}
                  formatCurrency={formatCurrency}
                  formatQuantityDisplay={formatQuantityDisplay}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Floating Mobile Action Button (FAB) */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={() => (subTab === 'planejamento' ? openNewPlanForm() : openNewRealForm())}
          className="w-14 h-14 rounded-full sonic-gradient-gold text-white shadow-xl flex items-center justify-center active:scale-90 transition-all border-2 border-white"
          title="Novo Lançamento"
        >
          <Plus className="w-7 h-7 stroke-[3]" />
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────
          MODAL FORM: PLANEJAMENTO (Orçamento Estimado)
      ───────────────────────────────────────────────────────── */}
      {isPlanFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 overflow-hidden">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 box-border">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                {editingPlanId ? 'Editar Item do Planejamento' : 'Novo Item no Planejamento'}
              </h3>
              <button onClick={() => setIsPlanFormOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto overflow-x-hidden flex-1 space-y-4 box-border">
              <form onSubmit={handlePlanSubmit} className="space-y-4 w-full box-border">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1">Item / Descrição *</label>
                  <input
                    type="text"
                    placeholder="Ex: Aluguel do Espaço, Bolo Temático..."
                    value={planItem}
                    onChange={(e) => setPlanItem(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base md:text-sm font-bold text-slate-800 focus:outline-none focus:border-sonic-blue box-border"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1">Tipo de Precificação</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full box-border">
                    <button
                      type="button"
                      onClick={() => setPlanMedida('fixo')}
                      className={`py-2.5 px-2 rounded-xl border-2 text-xs font-bold transition-all ${planMedida === 'fixo' ? 'bg-blue-50 border-sonic-blue text-sonic-blue' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                      Valor Fixo
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlanMedida('unid')}
                      className={`py-2.5 px-2 rounded-xl border-2 text-xs font-bold transition-all ${planMedida === 'unid' ? 'bg-blue-50 border-sonic-blue text-sonic-blue' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                      Por Unid (un)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlanMedida('kg')}
                      className={`py-2.5 px-2 rounded-xl border-2 text-xs font-bold transition-all ${planMedida === 'kg' ? 'bg-blue-50 border-sonic-blue text-sonic-blue' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                      Por Peso (kg)
                    </button>
                  </div>
                </div>

                {planMedida !== 'fixo' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 w-full box-border">
                    <div className="min-w-0">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                        {planMedida === 'unid' ? 'Qtd (un)' : 'Qtd (kg)'}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 50"
                        value={planQtd}
                        onChange={(e) => setPlanQtd(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-base md:text-sm font-bold text-slate-800 focus:outline-none focus:border-sonic-blue box-border"
                        required
                      />
                    </div>
                    <div className="min-w-0">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                        {planMedida === 'unid' ? 'Preço/Unid (R$)' : 'Preço/Kg (R$)'}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 12.00"
                        value={planPrecoUnit}
                        onChange={(e) => setPlanPrecoUnit(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-base md:text-sm font-bold text-slate-800 focus:outline-none focus:border-sonic-blue box-border"
                        required
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2 text-right text-xs font-bold text-sonic-blue pt-1">
                      Valor Estimado: {formatCurrency(getPlanCalculatedTotal())}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1">Valor Estimado (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={planValorEstimadoFixo}
                      onChange={(e) => setPlanValorEstimadoFixo(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base md:text-sm font-bold text-slate-800 focus:outline-none focus:border-sonic-blue box-border"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1">Observações</label>
                  <textarea
                    placeholder="Observações do orçamento..."
                    value={planObs}
                    onChange={(e) => setPlanObs(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base md:text-sm font-semibold text-slate-800 focus:outline-none focus:border-sonic-blue h-20 resize-none box-border"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsPlanFormOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 rounded-2xl active:scale-95 transition-all">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-[2] py-3 text-sm font-bold text-white sonic-gradient-primary rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer">
                    Salvar Estimativa
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
          MODAL FORM: GASTOS REAIS (Controle Efetivado)
      ───────────────────────────────────────────────────────── */}
      {isRealFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 overflow-hidden">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 box-border">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                {editingRealId ? 'Editar Gasto Real' : 'Novo Gasto Real'}
              </h3>
              <button onClick={() => setIsRealFormOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto overflow-x-hidden flex-1 space-y-4 box-border">
              <form onSubmit={handleRealSubmit} className="space-y-4 w-full box-border">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1">Item / Descrição *</label>
                  <input
                    type="text"
                    placeholder="Ex: Salgados para a Festa, Decoração..."
                    value={realItem}
                    onChange={(e) => setRealItem(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base md:text-sm font-bold text-slate-800 focus:outline-none focus:border-sonic-blue box-border"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1">Tipo de Precificação</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full box-border">
                    <button
                      type="button"
                      onClick={() => setRealMedida('fixo')}
                      className={`py-2.5 px-2 rounded-xl border-2 text-xs font-bold transition-all ${realMedida === 'fixo' ? 'bg-blue-50 border-sonic-blue text-sonic-blue' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                      Valor Fixo
                    </button>
                    <button
                      type="button"
                      onClick={() => setRealMedida('unid')}
                      className={`py-2.5 px-2 rounded-xl border-2 text-xs font-bold transition-all ${realMedida === 'unid' ? 'bg-blue-50 border-sonic-blue text-sonic-blue' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                      Por Unid (un)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRealMedida('kg')}
                      className={`py-2.5 px-2 rounded-xl border-2 text-xs font-bold transition-all ${realMedida === 'kg' ? 'bg-blue-50 border-sonic-blue text-sonic-blue' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                      Por Peso (kg)
                    </button>
                  </div>
                </div>

                {realMedida !== 'fixo' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 w-full box-border">
                    <div className="min-w-0">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                        {realMedida === 'unid' ? 'Qtd (un)' : 'Qtd (kg)'}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 50"
                        value={realQtd}
                        onChange={(e) => setRealQtd(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-base md:text-sm font-bold text-slate-800 focus:outline-none focus:border-sonic-blue box-border"
                        required
                      />
                    </div>
                    <div className="min-w-0">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                        {realMedida === 'unid' ? 'Preço/Unid (R$)' : 'Preço/Kg (R$)'}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 12.50"
                        value={realPrecoUnit}
                        onChange={(e) => setRealPrecoUnit(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-base md:text-sm font-bold text-slate-800 focus:outline-none focus:border-sonic-blue box-border"
                        required
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2 text-right text-xs font-bold text-sonic-blue pt-1">
                      Total Calculado: {formatCurrency(getRealCalculatedTotal())}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1">Valor Total (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={realValorTotalFixo}
                      onChange={(e) => setRealValorTotalFixo(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base md:text-sm font-bold text-slate-800 focus:outline-none focus:border-sonic-blue box-border"
                      required
                    />
                  </div>
                )}

                {/* Quem Pagou */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1">Quem Pagou *</label>
                  <div className="grid grid-cols-2 gap-2 w-full box-border">
                    <button
                      type="button"
                      onClick={() => setRealPagante('Wellington')}
                      className={`py-2.5 px-3 rounded-2xl border-2 text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        realPagante === 'Wellington'
                          ? 'bg-blue-50 border-sonic-blue text-sonic-blue shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>👤 Wellington</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRealPagante('Raissa')}
                      className={`py-2.5 px-3 rounded-2xl border-2 text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        realPagante === 'Raissa'
                          ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>👤 Raissa</span>
                    </button>
                  </div>
                </div>

                {/* Forma de Pagamento */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1">Forma de Pagamento *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full box-border">
                    {[
                      { id: 'Pix', label: 'Pix', icon: '⚡' },
                      { id: 'Cartão de Crédito', label: 'Cartão', icon: '💳' },
                      { id: 'Dinheiro', label: 'Dinheiro', icon: '💵' },
                      { id: 'Outro', label: 'Outro', icon: '📝' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setRealMeioPagamento(m.id as any)}
                        className={`py-2.5 px-2 rounded-2xl border-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          realMeioPagamento === m.id
                            ? 'bg-teal-50 border-teal-500 text-teal-800 shadow-sm font-black'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>{m.icon}</span>
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Valor Pago & Vencimento/Data */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full box-border">
                  <div className="min-w-0">
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1">Valor Pago (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={realValorPago}
                      onChange={(e) => setRealValorPago(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base md:text-sm font-bold text-slate-800 focus:outline-none focus:border-sonic-blue box-border"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1">Vencimento / Data *</label>
                    <input
                      type="date"
                      value={realData}
                      onChange={(e) => setRealData(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base md:text-sm font-bold text-slate-800 focus:outline-none focus:border-sonic-blue box-border"
                      required
                    />
                  </div>
                </div>

                {/* Parcelas */}
                {!editingRealId && (
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1">Parcelas</label>
                    <div className="flex flex-wrap gap-1.5 w-full box-border">
                      {[
                        { val: 1, label: '1x À vista' },
                        { val: 2, label: '2x' },
                        { val: 3, label: '3x' },
                        { val: 4, label: '4x' },
                        { val: 5, label: '5x' },
                        { val: 6, label: '6x' },
                        { val: 10, label: '10x' },
                        { val: 12, label: '12x' },
                      ].map((p) => (
                        <button
                          key={p.val}
                          type="button"
                          onClick={() => setRealParcelas(p.val)}
                          className={`py-2 px-2.5 rounded-xl border-2 text-xs font-bold transition-all flex-1 min-w-[52px] text-center cursor-pointer ${
                            realParcelas === p.val
                              ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-sm font-black'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comprovantes Attachment Section (Até 3 comprovantes) */}
                <div className="w-full box-border">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase">
                      Comprovantes (Até 3 Fotos ou PDFs)
                    </label>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {realComprovantes.length}/3 anexados
                    </span>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept="image/*,application/pdf"
                    className="hidden"
                  />

                  <div className="space-y-2">
                    {realComprovantes.map((url, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                        <span className="truncate max-w-[220px] sm:max-w-[280px] flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-sonic-sky shrink-0" />
                          {url.split('/').pop()}
                        </span>
                        <button type="button" onClick={() => handleRemoveReceipt(idx)} className="text-red-500 p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {realComprovantes.length < 3 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-slate-400" />
                        Anexar Comprovante ({3 - realComprovantes.length} restantes)
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsRealFormOpen(false)} className="flex-1 py-3.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-2xl active:scale-95 transition-all">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-[2] py-3.5 text-sm font-bold text-white sonic-gradient-gold rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer">
                    {editingRealId ? 'Salvar Gasto' : 'Lançar Gasto Real'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
          MODAL RECEIPT VIEW / MANAGEMENT (Máximo 3)
      ───────────────────────────────────────────────────────── */}
      {receiptModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-x-hidden">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto overflow-x-hidden p-6 space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-800">Comprovantes do Gasto</h3>
                <p className="text-xs text-slate-500 truncate max-w-[260px]">{receiptModalItem.item}</p>
              </div>
              <button onClick={() => setReceiptModalItem(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="file"
              ref={modalFileInputRef}
              onChange={handleModalAddReceipt}
              multiple
              accept="image/*,application/pdf"
              className="hidden"
            />

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(() => {
                const receipts = receiptModalItem.comprovantes || (receiptModalItem.comprovante_url ? [receiptModalItem.comprovante_url] : []);
                if (receipts.length === 0) {
                  return <div className="text-center py-6 text-slate-400 text-xs italic">Nenhum comprovante anexado.</div>;
                }
                return receipts.map((url, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700">
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); alert(`Visualizando comprovante: ${url}`); }}
                      className="truncate max-w-[220px] flex items-center gap-2 text-sonic-sky hover:underline"
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      {url.split('/').pop()}
                    </a>
                    <button onClick={() => handleModalRemoveReceipt(idx)} className="p-1 text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ));
              })()}
            </div>

            {((receiptModalItem.comprovantes?.length || (receiptModalItem.comprovante_url ? 1 : 0)) < 3) && (
              <button
                type="button"
                onClick={() => modalFileInputRef.current?.click()}
                className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4 text-slate-400" />
                Adicionar Comprovante (máx 3)
              </button>
            )}

            <button onClick={() => setReceiptModalItem(null)} className="w-full py-3 text-sm font-bold text-slate-600 bg-slate-100 rounded-2xl">
              Fechar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
