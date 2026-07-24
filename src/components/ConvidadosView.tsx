'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, Check, X, Star, UserCheck, User, ChevronLeft, ArrowUpDown, Lock } from 'lucide-react';
import { Convidado, Usuario } from '@/utils/supabase';

// ─────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────
const PARTICIPACOES_OPTIONS = ['Bolo', 'Cerveja', 'Churrasco', 'Doces', 'Não Alcoólico', 'Piscina'];

const formatDateTime = (isoString?: string) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return '';
  }
};

// ─────────────────────────────────────────────────────────
// DESKTOP: MultiSelect dropdown for Participações
// ─────────────────────────────────────────────────────────
function MultiSelectParticipacoes({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option].sort());
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none flex items-center justify-between gap-1 cursor-pointer select-none"
      >
        <span className="truncate block max-w-[120px]">
          {selected.length === 0 ? 'Nenhuma' : selected.join(', ')}
        </span>
        <span className="text-[9px] text-slate-400 shrink-0">▼</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute left-0 mt-1 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 p-2.5 space-y-1 text-slate-700">
            {PARTICIPACOES_OPTIONS.map((opt) => {
              const isChecked = selected.includes(opt);
              return (
                <label
                  key={opt}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg text-xs font-semibold cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleOption(opt)}
                    className="rounded text-sonic-blue focus:ring-sonic-blue w-3.5 h-3.5"
                  />
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MOBILE: Inline checkbox pills for Participações
// ─────────────────────────────────────────────────────────
function MobileParticipacoes({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    onChange(
      selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt].sort()
    );
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {PARTICIPACOES_OPTIONS.map((opt) => {
        const checked = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`text-xs font-bold py-2.5 px-2 rounded-xl border-2 transition-all active:scale-95 ${
              checked
                ? 'bg-sonic-blue text-white border-sonic-blue shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────
interface GuestFormData {
  nome: string;
  tipo: 'Adulto' | 'Criança';
  convidado_por: 'Wellington' | 'Raissa';
  prioridade: 1 | 2 | 3;
  participacoes: string[];
  confirmado: boolean;
}

const DEFAULT_FORM: GuestFormData = {
  nome: '',
  tipo: 'Adulto',
  convidado_por: 'Wellington',
  prioridade: 1,
  participacoes: [],
  confirmado: false,
};

interface ConvidadosViewProps {
  convidados: Convidado[];
  currentUser?: Usuario | null;
  onAdd: (convidado: Omit<Convidado, 'id' | 'criado_em'>) => Promise<void> | void;
  onUpdate: (id: string, updates: Partial<Convidado>) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}

interface NewGuestRow {
  tempId: string;
  nome: string;
  tipo: 'Adulto' | 'Criança';
  convidado_por: 'Wellington' | 'Raissa';
  prioridade: 1 | 2 | 3;
  participacoes: string[];
  confirmado: boolean;
}

// ─────────────────────────────────────────────────────────
// MOBILE: Bottom Sheet Form
// ─────────────────────────────────────────────────────────
function MobileBottomSheet({
  isOpen,
  mode,
  initialData,
  isUserAdmin,
  userDefaultConvidadoPor,
  onClose,
  onSave,
  onDelete,
}: {
  isOpen: boolean;
  mode: 'add' | 'edit';
  initialData?: GuestFormData;
  isUserAdmin: boolean;
  userDefaultConvidadoPor: 'Wellington' | 'Raissa';
  onClose: () => void;
  onSave: (data: GuestFormData) => void;
  onDelete?: () => void;
}) {
  const [form, setForm] = useState<GuestFormData>(DEFAULT_FORM);

  // Re-populate form when sheet opens
  useEffect(() => {
    if (isOpen) {
      setForm(initialData ?? { ...DEFAULT_FORM, convidado_por: userDefaultConvidadoPor });
    }
  }, [isOpen, initialData, userDefaultConvidadoPor]);

  const update = <K extends keyof GuestFormData>(field: K, value: GuestFormData[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!form.nome.trim()) {
      alert('Por favor, informe o nome do convidado.');
      return;
    }
    onSave({ ...form, nome: form.nome.trim() });
  };

  const starCount = (p: number) => (p === 1 ? 5 : p === 2 ? 3 : 1);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sheet panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[60] md:hidden bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-4 pb-1">
          <div className="w-10 h-1.5 bg-slate-200 rounded-full" />
        </div>

        {/* Sheet header */}
        <div className="px-6 py-3 flex items-center justify-between border-b border-slate-100">
          <h3 className="text-lg font-black text-slate-800">
            {mode === 'add' ? 'Novo Convidado' : 'Editar Convidado'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 active:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable form body */}
        <div
          className="px-6 py-5 space-y-5 overflow-y-auto"
          style={{ maxHeight: 'calc(100dvh - 260px)' }}
        >
          {/* Nome */}
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Nome *
            </label>
            <input
              type="text"
              placeholder="Nome do convidado..."
              value={form.nome}
              onChange={(e) => update('nome', e.target.value)}
              maxLength={30}
              className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-bold text-slate-800 focus:outline-none focus:border-sonic-blue focus:bg-white transition-colors"
            />
          </div>

          {/* Tipo + Convidado Por */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Tipo
              </label>
              <select
                value={form.tipo}
                onChange={(e) => update('tipo', e.target.value as 'Adulto' | 'Criança')}
                className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-sonic-blue appearance-none"
              >
                <option value="Adulto">Adulto</option>
                <option value="Criança">Criança</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Convidado por
              </label>
              <select
                value={form.convidado_por}
                disabled={!isUserAdmin}
                onChange={(e) => update('convidado_por', e.target.value as 'Wellington' | 'Raissa')}
                className={`w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none appearance-none ${
                  !isUserAdmin ? 'opacity-70 cursor-not-allowed bg-slate-100' : 'focus:border-sonic-blue'
                }`}
              >
                <option value="Wellington">Wellington</option>
                <option value="Raissa">Raissa</option>
              </select>
            </div>
          </div>

          {/* Prioridade */}
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Prioridade
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([1, 2, 3] as const).map((p) => {
                const s = starCount(p);
                const isSelected = form.prioridade === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => update('prioridade', p)}
                    className={`py-3 rounded-2xl border-2 text-xs font-bold flex flex-col items-center gap-1.5 transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-yellow-50 border-yellow-400 text-yellow-700'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span className="flex gap-0.5">
                      {Array.from({ length: s }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            isSelected ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </span>
                    <span className="text-[10px]">{s} ★</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Participações */}
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Participações
            </label>
            <MobileParticipacoes
              selected={form.participacoes}
              onChange={(v) => update('participacoes', v)}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => update('confirmado', false)}
                className={`py-3.5 rounded-2xl border-2 text-sm font-black transition-all active:scale-95 ${
                  !form.confirmado
                    ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                Pendente
              </button>
              <button
                type="button"
                onClick={() => update('confirmado', true)}
                className={`py-3.5 rounded-2xl border-2 text-sm font-black transition-all active:scale-95 ${
                  form.confirmado
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                ✓ Confirmado
              </button>
            </div>
          </div>

          {/* Excluir (edit mode only) */}
          {mode === 'edit' && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="w-full py-3.5 text-sm font-bold text-red-500 border-2 border-red-100 rounded-2xl bg-red-50 active:scale-95 transition-all"
            >
              🗑 Excluir convidado
            </button>
          )}

          <div className="h-4" />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 text-sm font-bold text-slate-600 bg-slate-100 rounded-2xl active:scale-95 transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-[2] py-4 text-sm font-bold text-white sonic-gradient-primary rounded-2xl shadow-md active:scale-95 transition-all"
          >
            Salvar
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────
// MOBILE: Guest Card with swipe-to-reveal actions
// ─────────────────────────────────────────────────────────
function MobileGuestCard({
  convidado,
  canEdit,
  onEdit,
  onDelete,
  onToggleStatus,
  onSetConfirmed,
}: {
  convidado: Convidado;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onSetConfirmed: () => void;
}) {
  const [swipeX, setSwipeX] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const THRESHOLD = 80;

  const getStarCount = (p: number) => (p === 1 ? 5 : p === 2 ? 3 : 1);

  const snapTo = (x: number, revealed = false) => {
    setIsTracking(false);
    setIsRevealed(revealed);
    setSwipeX(x);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    isDraggingRef.current = false;
    setIsTracking(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
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

    if (!canEdit) return;

    const width = containerRef.current?.clientWidth || 320;

    if (isRevealed) {
      if (dx > 0) setSwipeX(Math.min(-THRESHOLD + dx, 0));
    } else {
      if (dx < 0) {
        setSwipeX(Math.max(dx, -THRESHOLD));
      } else if (dx > 0) {
        setSwipeX(Math.min(dx, width));
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current || !canEdit) return;

    const width = containerRef.current?.clientWidth || 320;

    if (!isRevealed) {
      if (swipeX < -(THRESHOLD / 2)) {
        snapTo(-THRESHOLD, true);
      } else if (swipeX > 80 || swipeX > width * 0.3) {
        onSetConfirmed();
        snapTo(0, false);
      } else {
        snapTo(0, false);
      }
    } else {
      if (swipeX > -(THRESHOLD / 2)) {
        snapTo(0, false);
      } else {
        snapTo(-THRESHOLD, true);
      }
    }
  };

  const handleCardTap = () => {
    if (isRevealed) {
      snapTo(0, false);
    } else if (canEdit) {
      onEdit();
    }
  };

  return (
    <div ref={containerRef} className="relative rounded-2xl overflow-hidden mb-2.5 shadow-sm">
      {/* Background action for Swipe Right: Full card width Green Confirm */}
      {canEdit && swipeX > 0 && (
        <div className="absolute inset-0 bg-green-500 text-white rounded-2xl flex items-center justify-start pl-6 font-black text-sm gap-2">
          <Check className="w-6 h-6 shrink-0 animate-bounce" />
          <span className="uppercase tracking-wider">Confirmar Presença</span>
        </div>
      )}

      {/* Background action buttons revealed on swipe left (Right side) */}
      {canEdit && swipeX < 0 && (
        <div className="absolute inset-y-0 right-0 flex" style={{ width: THRESHOLD }}>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); snapTo(0, false); onEdit(); }}
            className="flex-1 flex items-center justify-center bg-sonic-blue text-white"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); snapTo(0, false); onDelete(); }}
            className="flex-1 flex items-center justify-center bg-red-500 text-white rounded-r-2xl"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Card content — slides on swipe */}
      <div
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: isTracking ? 'none' : 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCardTap}
        className="relative z-10 bg-white rounded-2xl border border-slate-200/80 cursor-pointer select-none active:bg-slate-50/80"
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            {/* Left: name, type, invited-by, stars */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-black text-slate-800 text-[15px] truncate">
                  {convidado.nome}
                </span>
                <span
                  className={`shrink-0 text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                    convidado.tipo === 'Criança'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {convidado.tipo}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold">
                <span className="flex items-center gap-1" title={!canEdit ? "Somente leitura" : undefined}>
                  👤 {convidado.convidado_por}
                  {!canEdit && <Lock className="w-3 h-3 text-slate-400" />}
                </span>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: getStarCount(convidado.prioridade) }).map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </span>
              </div>
              <div className="text-[9px] text-slate-400 font-medium mt-1">
                Cad: {convidado.criado_em ? formatDateTime(convidado.criado_em) : '-'}
                {convidado.atualizado_em && convidado.atualizado_em !== convidado.criado_em && ` · Alt: ${formatDateTime(convidado.atualizado_em)}`}
              </div>
            </div>

            {/* Right: quick-toggle status button */}
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                if (canEdit) onToggleStatus();
              }}
              disabled={!canEdit}
              className={`shrink-0 px-3 py-1.5 text-[10px] font-black uppercase rounded-full border transition-all ${
                !canEdit ? 'opacity-60 cursor-not-allowed' : 'active:scale-95 cursor-pointer'
              } ${
                convidado.confirmado
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-700'
              }`}
            >
              {convidado.confirmado ? 'Confirmado' : 'Pendente'}
            </button>
          </div>

          {/* Participações tags */}
          {convidado.participacoes.length > 0 && (
            <div className="mt-2.5 flex gap-1.5 flex-wrap">
              {convidado.participacoes.map((p) => (
                <span
                  key={p}
                  className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Swipe hint */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
          <ChevronLeft className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
type SortField = 'nome' | 'tipo' | 'convidado_por' | 'prioridade' | 'status';
type SortDir = 'asc' | 'desc';

export default function ConvidadosView({ convidados, currentUser, onAdd, onUpdate, onDelete }: ConvidadosViewProps) {
  const isUserAdmin = currentUser?.login?.toLowerCase() === 'admin';

  const getUserConvidadoPor = (): 'Wellington' | 'Raissa' => {
    if (currentUser?.nome?.toLowerCase() === 'raissa' || currentUser?.login?.toLowerCase() === 'raissa') {
      return 'Raissa';
    }
    return 'Wellington';
  };

  const userDefaultConvidadoPor = getUserConvidadoPor();

  const canEditGuest = (guestConvidadoPor: string) => {
    if (!currentUser) return false;
    if (isUserAdmin) return true;
    return guestConvidadoPor.toLowerCase() === userDefaultConvidadoPor.toLowerCase();
  };

  // ── Shared filter state ──
  const [search, setSearch] = useState('');
  const [filterConfirmado, setFilterConfirmado] = useState<'todos' | 'confirmados' | 'pendentes'>('todos');
  const [filterConvidadoPor, setFilterConvidadoPor] = useState<'todos' | 'Wellington' | 'Raissa'>('todos');
  const [sortField, setSortField] = useState<SortField>('nome');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // ── Desktop: Excel-style editing ──
  const [newRows, setNewRows] = useState<NewGuestRow[]>([]);
  const [editingRows, setEditingRows] = useState<Record<string, Convidado>>({});

  // ── Mobile: Bottom Sheet ──
  const [mobileSheet, setMobileSheet] = useState<{
    open: boolean;
    mode: 'add' | 'edit';
    guestId?: string;
    initialData?: GuestFormData;
  }>({ open: false, mode: 'add' });

  // ── Helpers ──
  const getStarCount = (prioridade: number): number => {
    if (prioridade === 1) return 5;
    if (prioridade === 2) return 3;
    return 1;
  };

  const handleSortChange = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filtered = convidados.filter((c) => {
    const matchesSearch = c.nome.toLowerCase().includes(search.toLowerCase());
    const matchesConfirmado =
      filterConfirmado === 'todos' ? true :
      filterConfirmado === 'confirmados' ? c.confirmado : !c.confirmado;
    const matchesConvidadoPor =
      filterConvidadoPor === 'todos' ? true : c.convidado_por === filterConvidadoPor;
    return matchesSearch && matchesConfirmado && matchesConvidadoPor;
  });

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'nome':
        return dir * a.nome.localeCompare(b.nome, 'pt-BR');
      case 'tipo':
        return dir * a.tipo.localeCompare(b.tipo, 'pt-BR');
      case 'convidado_por':
        return dir * a.convidado_por.localeCompare(b.convidado_por, 'pt-BR');
      case 'prioridade':
        return dir * (a.prioridade - b.prioridade);
      case 'status':
        return dir * (Number(a.confirmado) - Number(b.confirmado));
      default:
        return 0;
    }
  });

  // ── Desktop: New row ──
  const handleAddNewRow = () => {
    const newRow: NewGuestRow = {
      tempId: Math.random().toString(36).substring(2, 9),
      nome: '',
      tipo: 'Adulto',
      convidado_por: userDefaultConvidadoPor,
      prioridade: 1,
      participacoes: [],
      confirmado: false,
    };
    setNewRows((prev) => [newRow, ...prev]);
  };

  const handleSaveNewRow = async (tempId: string) => {
    const row = newRows.find((r) => r.tempId === tempId);
    if (!row) return;
    if (!row.nome.trim()) {
      alert('Por favor, informe o nome do convidado.');
      return;
    }
    await onAdd({
      nome: row.nome.trim(),
      tipo: row.tipo,
      convidado_por: row.convidado_por,
      prioridade: row.prioridade,
      participacoes: row.participacoes,
      confirmado: row.confirmado,
    });
    setNewRows((prev) => prev.filter((r) => r.tempId !== tempId));
  };

  const handleCancelNewRow = (tempId: string) =>
    setNewRows((prev) => prev.filter((r) => r.tempId !== tempId));

  const handleUpdateNewRowField = (tempId: string, field: keyof NewGuestRow, value: unknown) =>
    setNewRows((prev) => prev.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r)));

  // ── Desktop: Edit existing row ──
  const handleStartEdit = (convidado: Convidado) =>
    setEditingRows((prev) => ({ ...prev, [convidado.id]: { ...convidado } }));

  const handleSaveEdit = async (id: string) => {
    const edited = editingRows[id];
    if (!edited) return;
    if (!edited.nome.trim()) {
      alert('O nome do convidado não pode ficar vazio.');
      return;
    }
    await onUpdate(id, {
      nome: edited.nome.trim(),
      tipo: edited.tipo,
      convidado_por: edited.convidado_por,
      prioridade: edited.prioridade,
      participacoes: edited.participacoes,
      confirmado: edited.confirmado,
    });
    setEditingRows((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleCancelEdit = (id: string) =>
    setEditingRows((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

  const handleUpdateEditField = (id: string, field: keyof Convidado, value: unknown) =>
    setEditingRows((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  // ── Mobile: Bottom Sheet ──
  const openMobileEdit = (c: Convidado) => {
    setMobileSheet({
      open: true,
      mode: 'edit',
      guestId: c.id,
      initialData: {
        nome: c.nome,
        tipo: c.tipo,
        convidado_por: c.convidado_por,
        prioridade: c.prioridade,
        participacoes: c.participacoes,
        confirmado: c.confirmado,
      },
    });
  };

  const openMobileAdd = () => setMobileSheet({ open: true, mode: 'add' });
  const closeMobileSheet = () => setMobileSheet((prev) => ({ ...prev, open: false }));

  const handleMobileSheetSave = async (data: GuestFormData) => {
    if (mobileSheet.mode === 'add') {
      await onAdd(data);
    } else if (mobileSheet.guestId) {
      await onUpdate(mobileSheet.guestId, data);
    }
    closeMobileSheet();
  };

  const handleMobileDelete = async () => {
    if (!mobileSheet.guestId) return;
    if (confirm('Excluir este convidado?')) {
      closeMobileSheet();
      await onDelete(mobileSheet.guestId);
    }
  };

  // ─────────────────────────────────────────────────────────
  return (
    <div className="animate-dash">

      {/* ═══════════════════════════════════════════
          MOBILE LAYOUT  (hidden on md+)
      ═══════════════════════════════════════════ */}
      <div className="md:hidden space-y-4">
        {/* Header */}
        <div>
          <h2 className="text-xl font-black text-slate-800">Convidados</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {convidados.filter((c) => c.confirmado).length} confirmados · {convidados.length} total
          </p>
        </div>

        {/* Search + filters */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar convidado..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-base md:text-sm font-semibold text-slate-700 focus:outline-none shadow-sm focus:border-sonic-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Status filter */}
            <div className="relative">
              <UserCheck className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              <select
                value={filterConfirmado}
                onChange={(e) => setFilterConfirmado(e.target.value as 'todos' | 'confirmados' | 'pendentes')}
                className="w-full pl-8 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-base md:text-xs font-bold text-slate-700 focus:outline-none shadow-sm appearance-none cursor-pointer"
              >
                <option value="todos">Status</option>
                <option value="confirmados">Confirmado</option>
                <option value="pendentes">Pendente</option>
              </select>
              <span className="absolute right-3 top-3.5 text-[9px] text-slate-400 pointer-events-none">▼</span>
            </div>

            {/* Convidado por filter */}
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              <select
                value={filterConvidadoPor}
                onChange={(e) => setFilterConvidadoPor(e.target.value as 'todos' | 'Wellington' | 'Raissa')}
                className="w-full pl-8 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-base md:text-xs font-bold text-slate-700 focus:outline-none shadow-sm appearance-none cursor-pointer"
              >
                <option value="todos">Convidado por</option>
                <option value="Wellington">Wellington</option>
                <option value="Raissa">Raissa</option>
              </select>
              <span className="absolute right-3 top-3.5 text-[9px] text-slate-400 pointer-events-none">▼</span>
            </div>
          </div>

          {/* Sort / Ordenação */}
          <div className="relative">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
            <select
              value={sortField}
              onChange={(e) => handleSortChange(e.target.value as SortField)}
              className="w-full pl-10 pr-8 py-3 bg-white border border-slate-200 rounded-2xl text-base md:text-xs font-bold text-slate-700 focus:outline-none shadow-sm appearance-none cursor-pointer"
            >
              <option value="nome">Ordenar: Nome</option>
              <option value="tipo">Ordenar: Tipo</option>
              <option value="convidado_por">Ordenar: Convidado por</option>
              <option value="prioridade">Ordenar: Prioridade</option>
              <option value="status">Ordenar: Status</option>
            </select>
            <span className="absolute right-3 top-3.5 text-[9px] text-slate-400 pointer-events-none">{sortDir === 'asc' ? '↑' : '↓'}</span>
          </div>
        </div>

        {/* Card list */}
        <div>
          {sorted.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-5xl mb-3">👥</p>
              <p className="font-bold text-sm">Nenhum convidado encontrado</p>
              <p className="text-xs mt-1">Tente ajustar os filtros ou adicione um convidado</p>
            </div>
          ) : (
            sorted.map((c) => {
              const canEdit = canEditGuest(c.convidado_por);
              return (
                <MobileGuestCard
                  key={c.id}
                  convidado={c}
                  canEdit={canEdit}
                  onEdit={() => openMobileEdit(c)}
                  onDelete={() => {
                    if (confirm(`Excluir ${c.nome}?`)) onDelete(c.id);
                  }}
                  onToggleStatus={() => onUpdate(c.id, { confirmado: !c.confirmado })}
                  onSetConfirmed={() => onUpdate(c.id, { confirmado: true })}
                />
              );
            })
          )}
          <div className="h-6" />
        </div>

        {/* FAB — add new guest */}
        <button
          onClick={openMobileAdd}
          className="fixed bottom-24 right-5 z-40 w-14 h-14 sonic-gradient-primary rounded-full shadow-2xl flex items-center justify-center text-white active:scale-90 transition-transform"
          aria-label="Adicionar convidado"
        >
          <Plus className="w-7 h-7" />
        </button>

        {/* Bottom Sheet */}
        <MobileBottomSheet
          isOpen={mobileSheet.open}
          mode={mobileSheet.mode}
          initialData={mobileSheet.initialData}
          isUserAdmin={isUserAdmin}
          userDefaultConvidadoPor={userDefaultConvidadoPor}
          onClose={closeMobileSheet}
          onSave={handleMobileSheetSave}
          onDelete={mobileSheet.mode === 'edit' ? handleMobileDelete : undefined}
        />
      </div>

      {/* ═══════════════════════════════════════════
          DESKTOP LAYOUT  (hidden on mobile)
      ═══════════════════════════════════════════ */}
      <div className="hidden md:flex md:flex-col space-y-5 md:h-[calc(100vh-140px)]">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800">Lista de Convidados</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {convidados.filter((c) => c.confirmado).length} confirmados de {convidados.length} total
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white/40 p-3 rounded-3xl border border-slate-200/50 shadow-sm shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Buscar convidado..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none shadow-sm focus:border-sonic-blue"
              />
            </div>

            {/* Status filter */}
            <div className="relative w-full sm:w-44">
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
              <select
                value={filterConfirmado}
                onChange={(e) => setFilterConfirmado(e.target.value as 'todos' | 'confirmados' | 'pendentes')}
                className="w-full pl-11 pr-8 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none shadow-sm focus:border-sonic-blue cursor-pointer appearance-none"
              >
                <option value="todos">Todos Status</option>
                <option value="confirmados">Confirmado</option>
                <option value="pendentes">Pendente</option>
              </select>
              <span className="absolute right-4 top-4 text-[9px] text-slate-400 pointer-events-none">▼</span>
            </div>

            {/* Convidado Por filter */}
            <div className="relative w-full sm:w-48">
              <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
              <select
                value={filterConvidadoPor}
                onChange={(e) => setFilterConvidadoPor(e.target.value as 'todos' | 'Wellington' | 'Raissa')}
                className="w-full pl-11 pr-8 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none shadow-sm focus:border-sonic-blue cursor-pointer appearance-none"
              >
                <option value="todos">Convidado por...</option>
                <option value="Wellington">Wellington</option>
                <option value="Raissa">Raissa</option>
              </select>
              <span className="absolute right-4 top-4 text-[9px] text-slate-400 pointer-events-none">▼</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:justify-end shrink-0">
            <button
              onClick={handleAddNewRow}
              className="flex items-center gap-1.5 px-4 py-3 text-sm font-bold text-white sonic-gradient-primary rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Convidado
            </button>
          </div>
        </div>

        {/* Excel-style table */}
        <div className="glass-card rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden md:flex-1 md:flex md:flex-col bg-white">
          <div className="overflow-x-auto w-full md:flex-1 md:overflow-y-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="sticky top-0 z-10 bg-slate-900">
                <tr className="bg-slate-900 text-white text-[10px] uppercase font-bold tracking-wider whitespace-nowrap">
                  <th className="px-5 py-4 w-40">
                    <button onClick={() => handleSortChange('nome')} className="flex items-center gap-1.5 cursor-pointer hover:text-yellow-300 transition-colors">
                      Nome
                      <ArrowUpDown className={`w-3 h-3 ${sortField === 'nome' ? 'text-yellow-400' : 'text-slate-500'}`} />
                      {sortField === 'nome' && <span className="text-yellow-400 text-[8px]">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                    </button>
                  </th>
                  <th className="px-4 py-4 w-28">
                    <button onClick={() => handleSortChange('tipo')} className="flex items-center gap-1.5 cursor-pointer hover:text-yellow-300 transition-colors">
                      Tipo
                      <ArrowUpDown className={`w-3 h-3 ${sortField === 'tipo' ? 'text-yellow-400' : 'text-slate-500'}`} />
                      {sortField === 'tipo' && <span className="text-yellow-400 text-[8px]">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                    </button>
                  </th>
                  <th className="px-4 py-4 w-32">
                    <button onClick={() => handleSortChange('convidado_por')} className="flex items-center gap-1.5 cursor-pointer hover:text-yellow-300 transition-colors">
                      De
                      <ArrowUpDown className={`w-3 h-3 ${sortField === 'convidado_por' ? 'text-yellow-400' : 'text-slate-500'}`} />
                      {sortField === 'convidado_por' && <span className="text-yellow-400 text-[8px]">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                    </button>
                  </th>
                  <th className="px-4 py-4 w-24">
                    <button onClick={() => handleSortChange('prioridade')} className="flex items-center gap-1.5 cursor-pointer hover:text-yellow-300 transition-colors">
                      Prioridade
                      <ArrowUpDown className={`w-3 h-3 ${sortField === 'prioridade' ? 'text-yellow-400' : 'text-slate-500'}`} />
                      {sortField === 'prioridade' && <span className="text-yellow-400 text-[8px]">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                    </button>
                  </th>
                  <th className="px-4 py-4 w-96">Participações</th>
                  <th className="px-4 py-4 w-28 text-center">
                    <button onClick={() => handleSortChange('status')} className="flex items-center gap-1.5 cursor-pointer hover:text-yellow-300 transition-colors mx-auto">
                      Status
                      <ArrowUpDown className={`w-3 h-3 ${sortField === 'status' ? 'text-yellow-400' : 'text-slate-500'}`} />
                      {sortField === 'status' && <span className="text-yellow-400 text-[8px]">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                    </button>
                  </th>
                  <th className="px-5 py-4 w-32 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">

                {/* Temporary new rows */}
                {newRows.map((row) => (
                  <tr key={row.tempId} className="bg-yellow-50/40 hover:bg-yellow-50/70 transition-colors whitespace-nowrap">
                    <td className="px-5 py-3">
                      <input
                        type="text"
                        placeholder="Nome..."
                        value={row.nome}
                        maxLength={15}
                        onChange={(e) => handleUpdateNewRowField(row.tempId, 'nome', e.target.value)}
                        className="w-full bg-white border border-yellow-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-sonic-blue font-bold text-slate-800"
                        autoFocus
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={row.tipo}
                        onChange={(e) => handleUpdateNewRowField(row.tempId, 'tipo', e.target.value)}
                        className="w-full bg-white border border-yellow-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
                      >
                        <option value="Adulto">Adulto</option>
                        <option value="Criança">Criança</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={row.convidado_por}
                        disabled={!isUserAdmin}
                        onChange={(e) => handleUpdateNewRowField(row.tempId, 'convidado_por', e.target.value)}
                        className={`w-full bg-white border border-yellow-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none ${
                          !isUserAdmin ? 'opacity-70 cursor-not-allowed bg-slate-100' : ''
                        }`}
                      >
                        <option value="Wellington">Wellington</option>
                        <option value="Raissa">Raissa</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={row.prioridade}
                        onChange={(e) => handleUpdateNewRowField(row.tempId, 'prioridade', Number(e.target.value))}
                        className="w-full bg-white border border-yellow-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
                      >
                        <option value="1">5 Estrelas (1)</option>
                        <option value="2">3 Estrelas (2)</option>
                        <option value="3">1 Estrela (3)</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <MultiSelectParticipacoes
                        selected={row.participacoes}
                        onChange={(opts) => handleUpdateNewRowField(row.tempId, 'participacoes', opts)}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={row.confirmado}
                        onChange={(e) => handleUpdateNewRowField(row.tempId, 'confirmado', e.target.checked)}
                        className="w-4 h-4 rounded text-sonic-blue focus:ring-sonic-blue border-yellow-300 cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleSaveNewRow(row.tempId)}
                          className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                          title="Salvar"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCancelNewRow(row.tempId)}
                          className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-colors cursor-pointer"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Existing convidados */}
                {sorted.length === 0 && newRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 font-semibold bg-white">
                      Nenhum convidado encontrado.
                    </td>
                  </tr>
                ) : (
                  sorted.map((c) => {
                    const canEdit = canEditGuest(c.convidado_por);
                    const isEditing = editingRows[c.id] !== undefined;
                    const editingRow = editingRows[c.id];

                    if (isEditing && editingRow && canEdit) {
                      return (
                        <tr key={c.id} className="bg-blue-50/30 hover:bg-blue-50/50 transition-colors whitespace-nowrap">
                          <td className="px-5 py-3">
                            <input
                              type="text"
                              value={editingRow.nome}
                              maxLength={15}
                              onChange={(e) => handleUpdateEditField(c.id, 'nome', e.target.value)}
                              className="w-full bg-white border border-blue-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-sonic-blue font-bold text-slate-800"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={editingRow.tipo}
                              onChange={(e) => handleUpdateEditField(c.id, 'tipo', e.target.value)}
                              className="w-full bg-white border border-blue-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
                            >
                              <option value="Adulto">Adulto</option>
                              <option value="Criança">Criança</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={editingRow.convidado_por}
                              disabled={!isUserAdmin}
                              onChange={(e) => handleUpdateEditField(c.id, 'convidado_por', e.target.value)}
                              className={`w-full bg-white border border-blue-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none ${
                                !isUserAdmin ? 'opacity-70 cursor-not-allowed bg-slate-100' : ''
                              }`}
                            >
                              <option value="Wellington">Wellington</option>
                              <option value="Raissa">Raissa</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={editingRow.prioridade}
                              onChange={(e) => handleUpdateEditField(c.id, 'prioridade', Number(e.target.value))}
                              className="w-full bg-white border border-blue-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
                            >
                              <option value="1">5 Estrelas (1)</option>
                              <option value="2">3 Estrelas (2)</option>
                              <option value="3">1 Estrela (3)</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <MultiSelectParticipacoes
                              selected={editingRow.participacoes || []}
                              onChange={(opts) => handleUpdateEditField(c.id, 'participacoes', opts)}
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={editingRow.confirmado}
                              onChange={(e) => handleUpdateEditField(c.id, 'confirmado', e.target.checked)}
                              className="w-4 h-4 rounded text-sonic-blue focus:ring-sonic-blue border-blue-300 cursor-pointer"
                            />
                          </td>
                          <td className="px-5 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleSaveEdit(c.id)}
                                className="p-1.5 bg-sonic-blue hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                                title="Salvar Alterações"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCancelEdit(c.id)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors cursor-pointer"
                                title="Descartar Alterações"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition-colors whitespace-nowrap">
                        <td className="px-5 py-4 text-[10px] font-extrabold text-slate-800 truncate max-w-[176px]">
                          <span className="block font-black text-slate-800">{c.nome}</span>
                          <span className="block text-[8px] text-slate-400 font-medium mt-0.5">
                            Cad: {c.criado_em ? formatDateTime(c.criado_em) : '-'}
                            {c.atualizado_em && c.atualizado_em !== c.criado_em && ` · Alt: ${formatDateTime(c.atualizado_em)}`}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              c.tipo === 'Criança'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-slate-150 text-slate-600'
                            }`}
                          >
                            {c.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[10px] font-extrabold text-slate-600">
                          <span className="flex items-center gap-1" title={!canEdit ? "Somente leitura" : undefined}>
                            {c.convidado_por}
                            {!canEdit && <Lock className="w-3 h-3 text-slate-400" />}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="flex items-center gap-0.5">
                            {Array.from({ length: getStarCount(c.prioridade) }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400 shrink-0" />
                            ))}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs font-medium text-slate-500">
                          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-nowrap">
                            {c.participacoes.map((p) => (
                              <span
                                key={p}
                                className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0"
                              >
                                {p}
                              </span>
                            ))}
                            {c.participacoes.length === 0 && (
                              <span className="text-slate-400 italic">Nenhuma</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => canEdit && onUpdate(c.id, { confirmado: !c.confirmado })}
                            disabled={!canEdit}
                            className={`inline-flex px-2.5 py-1 text-[10px] font-black uppercase rounded-full border select-none transition-all ${
                              !canEdit
                                ? 'opacity-60 cursor-not-allowed'
                                : 'cursor-pointer active:scale-95'
                            } ${
                              c.confirmado
                                ? 'bg-green-50 border-green-200 text-green-700'
                                : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                            }`}
                          >
                            {c.confirmado ? 'Confirmado' : 'Pendente'}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-center">
                          {canEdit ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleStartEdit(c)}
                                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl transition-all cursor-pointer"
                                title="Editar Linha"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Excluir convidado ${c.nome}?`)) {
                                    onDelete(c.id);
                                  }
                                }}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 rounded-xl transition-all cursor-pointer"
                                title="Excluir Convidado"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-bold" title="Somente leitura (cadastrado por outro usuário)">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Somente leitura</span>
                            </div>
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
      </div>
    </div>
  );
}
