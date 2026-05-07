"use client";

import React, { useState, useEffect, useRef } from "react";
import SearchBuilder from "./SearchBuilder";
import ProductList from "./ProductList";
import { ScoredProductWithStructure, SearchEntry } from "../types/product";
import { Activity, Tag, Ruler, FileText } from "lucide-react";

export default function SearchContainer() {
  const [results, setResults] = useState<ScoredProductWithStructure[] | null>(null);
  const [insights, setInsights] = useState<(string | { insight: string; termo?: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [baseCount, setBaseCount] = useState(0);
  const [dbStatus, setDbStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL('../workers/searchWorker.ts', import.meta.url));
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'DATA_LOADED') {
        setBaseCount(payload.count);
        setDbStatus('ready');
      } else if (type === 'SEARCH_RESULTS') {
        setResults(payload);
        setLoading(false);
      }
    };

    worker.onerror = () => {
      setDbStatus('error');
    };

    worker.postMessage({ type: 'LOAD_DATA', payload: { url: '/data/base_produtos_clean.csv' } });

    return () => worker.terminate();
  }, []);

  const handleSearch = async (entries: SearchEntry[]) => {
    if (!workerRef.current) return;
    
    setLoading(true);
    setResults(null);
    setInsights([]);

    try {
      const formData = new FormData();
      let hasAITrigger = false;

      entries.forEach((e, idx) => {
        if (e.type === 'dynar' && e.value) formData.append("dynar", e.value);
        if (e.type === 'concorrente' && e.value) {
          formData.append("concorrentes", e.value);
          hasAITrigger = true;
        }
        if (e.type === 'descricao' && e.value) {
          formData.append("descricao", e.value);
          hasAITrigger = true;
        }
        if (e.file) {
          formData.append(`file_${idx}`, e.file);
          hasAITrigger = true;
        }
      });

      let finalEntriesToSearch = [...entries];

      if (hasAITrigger) {
        const response = await fetch('/api/extract-entities', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.entities) {
            const aiInsights = data.entities
              .filter((e: any) => e.insight)
              .map((e: any) => ({ 
                insight: e.insight, 
                termo: e.termo 
              }));
            
            setInsights(aiInsights);

            const aiEntitiesAsEntries = data.entities.map((e: any) => ({
              id: `ai-${Math.random()}`,
              type: e.isDynar ? 'dynar' : (e.categoria === "TERMINAL" ? 'dynar' : 'descricao'),
              value: e.termo || e.value,
              origin: 'ai'
            }));

            finalEntriesToSearch = [...entries, ...aiEntitiesAsEntries];
          } else {
             // Caso a API responda com success: false (Ex: falta de API_KEY)
             console.error("AI API REJECTED:", data.error);
             alert(`Aviso da IA: ${data.error || "Serviço temporariamente indisponível."}`);
          }
        } else {
          try {
            const errorData = await response.json();
             alert(`Erro Crítico no Servidor (${response.status}): ${errorData.error || "Tente novamente mais tarde."}`);
          } catch(e) {
             alert("Erro de conexão com o motor Fred IA. Verifique se o servidor está online.");
          }
        }
      }

      workerRef.current.postMessage({ 
        type: 'SEARCH', 
        payload: { entries: finalEntriesToSearch } 
      });

    } catch (err) {
      console.error("SEARCH ERROR:", err);
      workerRef.current.postMessage({ 
        type: 'SEARCH', 
        payload: { entries } 
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-10">
      {/* Barra de Status - UNIFICADA COM O "D" - RESPONSIVA */}
      <div className="flex flex-col md:flex-row items-center md:justify-between mb-12 gap-8 border-b border-neutral-100 dark:border-neutral-800 pb-10 transition-colors">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Logo D unificada */}
          <div className="w-14 h-14 md:w-10 md:h-10 bg-[#00c07e] rounded-2xl md:rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/10 transition-colors transform hover:rotate-3 shrink-0">
            <span className="text-white font-black text-2xl md:text-lg italic select-none ml-0.5">D</span>
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-1.5 mb-1 md:mb-0.5">
              <span className="text-[10px] md:text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em]">Fred IA</span>
              <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
            </div>
            <h1 className="text-2xl md:text-xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase italic leading-none mb-1.5 md:mb-0">Consultor de Engenharia</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">Automação Industrial</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center w-full md:w-auto">
          <div className="w-full md:w-auto px-6 py-3 md:py-2 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-2xl md:rounded-full flex items-center justify-center gap-3 shadow-sm md:shadow-none transition-colors">
            <div className={`w-2.5 h-2.5 rounded-full ${dbStatus === 'loading' ? 'bg-amber-500 animate-pulse' : dbStatus === 'ready' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            <span className="text-[10px] font-black tracking-widest text-neutral-700 dark:text-neutral-300">
              {dbStatus === 'loading' ? 'CARREGANDO BANCO DE CÓDIGOS...' : 
               dbStatus === 'ready' ? `${baseCount.toLocaleString()} ITENS IDENTIFICADOS` : 
               'BANCO DE DADOS INDISPONÍVEL'}
            </span>
            <button 
              onClick={() => window.location.reload()} 
              className="ml-2 p-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-md transition-all text-neutral-400 dark:text-neutral-500 hover:text-emerald-600"
              title="Recarregar Banco"
            >
              <Activity className="w-4 h-4 md:w-3.5 md:h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <SearchBuilder onSearch={handleSearch} isProcessing={loading} />
      </div>

      {/* Grid de Benefícios - UNIFICADO */}
      <div className="mt-16 pt-10 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 transition-colors text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-4 group">
          <div className="p-3 rounded-xl bg-white dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 group-hover:bg-emerald-600 group-hover:text-white border border-neutral-100 dark:border-neutral-700 transition-all shadow-none">
            <Tag size={18} />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-neutral-900 dark:text-white uppercase tracking-widest mb-1">OCR Nativo</h4>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold">Extração técnica em superfícies.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 group">
          <div className="p-3 rounded-xl bg-white dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 group-hover:bg-emerald-600 group-hover:text-white border border-neutral-100 dark:border-neutral-700 transition-all shadow-none">
            <Ruler size={18} />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-neutral-900 dark:text-white uppercase tracking-widest mb-1">Precisão</h4>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold">Conversão técnica de bitolas.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 group">
          <div className="p-3 rounded-xl bg-white dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 group-hover:bg-emerald-600 group-hover:text-white border border-neutral-100 dark:border-neutral-700 transition-all shadow-none">
            <FileText size={18} />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-neutral-900 dark:text-white uppercase tracking-widest mb-1">Mapeamento</h4>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold">Sincronização de kits Dynar.</p>
          </div>
        </div>
      </div>

      <ProductList results={results} insights={insights} loading={loading} />
    </div>
  );
}
