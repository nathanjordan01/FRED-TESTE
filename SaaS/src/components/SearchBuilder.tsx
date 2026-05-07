"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, UploadCloud, Search as SearchIcon, FileText, ChevronDown, Check } from "lucide-react";
import { SearchEntry } from "../types/product";

const SELECT_OPTIONS = [
  { value: "concorrente", label: "Código de Concorrente" },
  { value: "descricao", label: "Texto Livre / Descrição" },
  { value: "dynar", label: "Código Dynar (Exato)" },
  { value: "visual", label: "Anexo / Imagem (IA)" },
];

function CustomDropdown({ value, onChange, disabled }: { value: string, onChange: (val: string) => void, disabled?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = SELECT_OPTIONS.find(opt => opt.value === value) || SELECT_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-14 bg-white dark:bg-neutral-800 border-2 border-neutral-100 dark:border-neutral-700 rounded-2xl pl-5 pr-10 py-2 text-neutral-900 dark:text-white outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 focus:bg-white dark:focus:bg-neutral-700 transition-all font-black flex items-center justify-between disabled:opacity-60 text-[10px] uppercase tracking-[0.15em] shadow-sm group"
      >
        <span className="truncate">{selected.label}</span>
        <ChevronDown className={`w-4 h-4 text-neutral-300 dark:text-neutral-600 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-600' : 'group-hover:text-neutral-400'}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-none z-50 overflow-hidden py-3 animate-in fade-in zoom-in-95 duration-200">
          {SELECT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full px-6 py-4 text-left flex items-center justify-between transition-all group relative ${
                opt.value === value 
                  ? 'bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white' 
                  : 'text-neutral-400 dark:text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-emerald-700 dark:hover:text-emerald-400'
              }`}
            >
              {opt.value === value && <div className="absolute left-0 top-0 h-full w-1.5 bg-emerald-600 rounded-r-full"></div>}
              <span className={`text-[9px] uppercase tracking-[0.2em] ${opt.value === value ? 'font-black' : 'font-bold'}`}>
                {opt.label}
              </span>
              {opt.value === value && <Check className="w-3.5 h-3.5 text-emerald-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchBuilder({ onSearch, isProcessing }: { onSearch: (entries: SearchEntry[]) => void, isProcessing?: boolean }) {
  const [entries, setEntries] = useState<SearchEntry[]>([
    { id: "1", type: "concorrente", value: "" }
  ]);

  const addEntry = () => {
    if (entries.length >= 10 || isProcessing) return;
    setEntries([
      ...entries,
      { id: Date.now().toString(), type: "concorrente", value: "" }
    ]);
  };

  const removeEntry = (id: string) => {
    if (isProcessing) return;
    setEntries(entries.filter(e => e.id !== id));
  };

  const updateEntry = (id: string, updates: Partial<SearchEntry>) => {
    if (isProcessing) return;
    setEntries(entries.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (isProcessing) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      updateEntry(id, { file: e.dataTransfer.files[0], value: "" });
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    if (isProcessing) return;
    if (e.target.files && e.target.files.length > 0) {
      updateEntry(id, { file: e.target.files[0], value: "" });
    }
  };

  return (
    <div className={`w-full max-w-5xl mx-auto transition-all ${isProcessing ? 'opacity-80 pointer-events-none' : ''}`}>
      <div className="space-y-4">
        {entries.map((entry) => (
          // CORREÇÃO: Fundo Branco Puro para Light Mode. Adicionado overflow-hidden
          <div key={entry.id} className="flex flex-col lg:flex-row gap-6 items-start p-8 bg-white dark:bg-neutral-900 rounded-[32px] border-2 border-neutral-100 dark:border-neutral-800 shadow-sm transition-all hover:border-emerald-600/10 group relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-neutral-50 dark:bg-neutral-800 group-hover:bg-[#00c07e] transition-colors rounded-l-[30px]"></div>
            
            <div className="w-full lg:w-1/3 lg:min-w-[280px] shrink-0">
              <label className="block text-[9px] font-black text-neutral-400 dark:text-neutral-500 mb-3 uppercase tracking-[0.2em]">Canal de Entrada</label>
              <CustomDropdown 
                value={entry.file ? 'visual' : entry.type}
                disabled={isProcessing}
                onChange={(val) => updateEntry(entry.id, { type: val as any, value: "", file: undefined })}
              />
            </div>
            
            <div className="flex-1 w-full min-w-0">
              <label className="block text-[9px] font-black text-neutral-400 dark:text-neutral-500 mb-3 uppercase tracking-[0.2em]">
                {entry.type === 'visual' || entry.file ? 'Documentação / Imagem' : 'Valor de Referência'}
              </label>
              
              {entry.type === 'visual' || entry.file ? (
                <div 
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, entry.id)}
                  className={`border-2 border-dashed rounded-2xl h-14 flex items-center px-6 transition-all relative ${entry.file ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 hover:border-emerald-400 hover:bg-emerald-50/10 dark:hover:bg-emerald-900/20'} ${isProcessing ? 'opacity-60' : ''}`}
                >
                  <input 
                    type="file" 
                    title="Anexar arquivo"
                    aria-label="Upload"
                    disabled={isProcessing}
                    onChange={(e) => handleFileChange(e, entry.id)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  {entry.file ? (
                    <div className="flex items-center gap-3 text-emerald-900 dark:text-emerald-300 font-black truncate">
                      <FileText className="w-5 h-5 shrink-0 text-emerald-600" />
                      <span className="truncate text-[10px] tracking-widest uppercase">{entry.file.name}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-neutral-400 dark:text-neutral-500 w-full justify-between pointer-events-none">
                      <span className="truncate text-[10px] font-black uppercase tracking-widest opacity-60 italic">Anexar ou arraste arquivo técnico...</span>
                      <UploadCloud className="w-5 h-5 shrink-0 opacity-40" />
                    </div>
                  )}
                </div>
              ) : (
                <input 
                  type="text" 
                  value={entry.value}
                  disabled={isProcessing}
                  onChange={(e) => updateEntry(entry.id, { value: e.target.value })}
                  placeholder={
                    entry.type === 'dynar' ? 'Ex: AJTI-08-08' :
                    entry.type === 'concorrente' ? 'Ex: 8G-8FJX ou 1/2 JIC' : 
                    entry.type === 'descricao' ? 'Ex: Mangueira de 1/2 com fêmea giratória...' : 'Descreva a peça...'
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isProcessing && (entry.value || entry.file)) {
                      onSearch(entries);
                    }
                  }}
                  className="w-full h-14 bg-white dark:bg-neutral-800 border-2 border-neutral-100 dark:border-neutral-700 rounded-2xl px-6 py-2 text-neutral-900 dark:text-white placeholder:text-neutral-300 dark:placeholder:text-neutral-600 outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 focus:bg-white dark:focus:bg-neutral-700 transition-all font-bold disabled:opacity-60 text-sm shadow-none tracking-tight"
                />
              )}
            </div>

            <div className="shrink-0 lg:pt-8 w-full lg:w-auto flex justify-end">
               <button 
                onClick={() => removeEntry(entry.id)}
                disabled={entries.length === 1 || isProcessing}
                className="w-12 h-12 flex items-center justify-center text-neutral-300 dark:text-neutral-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-5 rounded-xl transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                title="Remover"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {entries.length < 10 && (
          <button 
            onClick={addEntry}
            disabled={isProcessing}
            className="w-full py-5 border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-3xl text-neutral-400 dark:text-neutral-500 font-black hover:border-[#00c07e] dark:hover:border-emerald-500 hover:text-emerald-900 dark:hover:text-emerald-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-all flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.3em]"
          >
            <Plus className="w-5 h-5" />
            Adicionar Novo Canal de Diagnóstico
          </button>
        )}
      </div>
      
      <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
          <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.25em]">Sincronização Ativa</span>
        </div>
        
        <button 
          onClick={() => onSearch(entries)}
          disabled={entries.every(e => !e.value && !e.file) || isProcessing}
          className="w-full md:w-auto bg-[#171717] dark:bg-emerald-600 hover:bg-black dark:hover:bg-emerald-500 disabled:opacity-30 text-white font-black py-5 px-12 rounded-[24px] shadow-2xl shadow-black/20 dark:shadow-emerald-900/20 transition-all flex items-center justify-center gap-5 group uppercase tracking-widest text-sm"
        >
          <span>{isProcessing ? 'Analisando...' : 'Gerar Relatório Técnico'}</span>
          {isProcessing ? (
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <SearchIcon className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          )}
        </button>
      </div>
    </div>
  );
}
