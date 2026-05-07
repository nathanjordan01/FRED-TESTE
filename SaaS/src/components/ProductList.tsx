"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Package, Tag, Ruler, Box, AlertCircle, CheckCircle2, FileText, ExternalLink, Cpu, Activity } from "lucide-react";
import { ScoredProductWithStructure } from "../types/product";

interface ProductCardProps {
  product: ScoredProductWithStructure;
}

function ProductCard({ product }: ProductCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const isHighConfidence = product.score >= 10;
  
  return (
    <div className={`w-full bg-white dark:bg-neutral-900/40 rounded-[32px] border-2 ${isHighConfidence ? 'border-emerald-600/30 shadow-[0_10px_40px_-15px_rgba(16,185,129,0.1)]' : 'border-neutral-100 dark:border-neutral-800'} p-0 overflow-hidden mb-8 transition-all duration-300 hover:shadow-xl`}>
      <div 
        className={`p-6 md:p-8 flex flex-col md:flex-row items-start gap-8 ${product.isMontado ? 'cursor-pointer' : ''}`}
        onClick={() => product.isMontado && setExpanded(!expanded)}
      >
        <div className="flex items-start gap-6 flex-1 w-full">
          <div className={`p-5 rounded-2xl shrink-0 border-2 ${product.isMontado ? 'bg-black dark:bg-emerald-600 dark:border-emerald-500 text-white shadow-lg' : 'bg-neutral-50 dark:bg-neutral-800 text-emerald-900 dark:text-emerald-400 border-neutral-100 dark:border-neutral-700'}`}>
            {product.isMontado ? <Package className="w-8 h-8 md:w-6 md:h-6" /> : <Box className="w-8 h-8 md:w-6 md:h-6" />}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
              <span className="font-black text-neutral-900 dark:text-white text-2xl md:text-xl uppercase tracking-tighter leading-none">{product.COD_LEGADO || product.COD_INTERNO}</span>
              <div className="flex flex-wrap gap-2">
                {product.termoSugerido && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 text-white text-[9px] font-black uppercase tracking-[0.2em]">
                    MATCH: {product.termoSugerido}
                  </span>
                )}
                {isHighConfidence && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% COMPATÍVEL
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-lg md:text-base text-neutral-600 dark:text-neutral-400 font-semibold leading-relaxed mb-6">
              {product.DESCRICAO_RICA || product.DESCRICAO}
            </p>
            
            {/* Ações e Atributos */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-6 border-t border-neutral-50 dark:border-neutral-800/50">
              <div className="flex items-center gap-x-5 gap-y-3 text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em] flex-wrap">
                {product.TIPO_PRODUTO && (
                  <span className="flex items-center gap-2"><Tag className="w-4 h-4 text-emerald-600" /> {product.TIPO_PRODUTO}</span>
                )}
                {product.MEDIDA_UNIDADE && (
                  <span className="flex items-center gap-2"><Ruler className="w-4 h-4 text-emerald-600" /> {product.MEDIDA_UNIDADE}</span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {product.URL_CATALOGO && (
                  <a 
                    href={product.URL_CATALOGO} 
                    target="_blank" 
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center gap-3 text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-neutral-200 dark:border-neutral-700 shadow-sm active:scale-95"
                  >
                    <FileText className="w-5 h-5 text-emerald-600" /> PDF TÉCNICO
                  </a>
                )}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const msg = encodeURIComponent(`Olá Fred IA! Verifiquei o produto ${product.COD_LEGADO || product.COD_INTERNO} (${product.DESCRICAO}) e gostaria de confirmar a disponibilidade.`);
                    window.open(`https://wa.me/5511953252541?text=${msg}`, '_blank');
                  }}
                  className="flex items-center justify-center gap-3 text-white bg-[#00c07e] hover:bg-[#00a66d] transition-all px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  WHATSAPP
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {product.isMontado && (
          <div className="shrink-0 w-full md:w-auto flex items-center justify-center md:justify-start gap-3 text-sm text-neutral-800 dark:text-neutral-200 font-black group py-4 md:py-0 bg-neutral-50 dark:bg-neutral-800/50 md:bg-transparent rounded-2xl md:rounded-none">
            <span className="group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors uppercase tracking-[0.2em] text-[10px]">{expanded ? 'RECOLHER' : 'VER COMPONENTES'}</span>
            <div className={`p-2.5 rounded-full transition-all ${expanded ? 'bg-black dark:bg-emerald-600 text-white' : 'bg-white dark:bg-neutral-700 text-neutral-400 dark:text-neutral-300 group-hover:bg-emerald-600 group-hover:text-white border border-neutral-100 dark:border-neutral-600'}`}>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        )}
      </div>

      {product.isMontado && expanded && (
        <div className="bg-neutral-50/50 dark:bg-black/20 border-t border-neutral-100 dark:border-neutral-800 p-8 pb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-0.5 flex-1 bg-neutral-200 dark:bg-neutral-800"></div>
            <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
              COMPOSIÇÃO DO SISTEMA ({product.componentes.length} ITENS)
            </h4>
            <div className="h-0.5 flex-1 bg-neutral-200 dark:bg-neutral-800"></div>
          </div>
          
          <div className="grid gap-4">
            {product.componentes.map((comp, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl gap-6 transition-all hover:border-emerald-600/30">
                 <div className="flex items-center gap-5 w-full sm:w-auto flex-1 min-w-0">
                   <div className="w-12 h-12 rounded-xl bg-black dark:bg-neutral-800 text-white dark:text-emerald-500 flex items-center justify-center font-black text-sm shrink-0 border border-white/5">
                     {comp.quantidade}x
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="font-black text-base text-neutral-900 dark:text-white flex items-center gap-3">
                       <span className="truncate">{comp.codFilho}</span>
                       {comp.urlCatalogo && (
                         <a 
                           href={comp.urlCatalogo} 
                           target="_blank" 
                           rel="noreferrer"
                           className="text-emerald-600 hover:text-black transition-colors shrink-0"
                           title="Acessar catálogo técnico"
                           aria-label="Acessar catálogo técnico"
                         >
                           <ExternalLink className="w-4 h-4" />
                         </a>
                       )}
                     </div>
                     <div className="text-sm text-neutral-500 font-semibold mt-1 wrap-break-word line-clamp-2">{comp.descricaoRica || comp.descricao}</div>
                   </div>
                 </div>
                 {comp.medida && (
                   <div className="text-[10px] font-black text-neutral-800 flex items-center gap-2 shrink-0 bg-neutral-50 px-3 py-2 rounded-md border border-neutral-100 uppercase tracking-widest">
                     <Ruler className="w-4 h-4 text-emerald-600" /> {comp.medida}
                   </div>
                 )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductList({ results, insights = [], loading = false }: { 
  results: ScoredProductWithStructure[] | null; 
  insights?: (string | { insight: string; termo?: string })[];
  loading?: boolean;
}) {
  if (!results) return null;
  const safeResults = Array.isArray(results) ? results : [];
  const hasResults = safeResults.length > 0;
  const highConfidence = safeResults.filter(r => r.score >= 10);
  const midConfidence = safeResults.filter(r => r.score < 10);

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 pb-32">
      {insights && insights.length > 0 && (
        <div className="mb-12 animate-in fade-in slide-in-from-top-6 duration-700">
          <div className="bg-white dark:bg-neutral-900 rounded-[40px] p-10 relative overflow-hidden border border-neutral-100 dark:border-white/10 shadow-sm dark:shadow-none">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-600"></div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-600/5 dark:bg-emerald-600/10 rounded-full blur-[100px]"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="px-4 py-1.5 bg-emerald-600 rounded-full text-[10px] font-black tracking-[0.2em] text-white uppercase flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5" /> IA EXPERT ADVISOR
                </div>
                <div className="text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest leading-none">Relatório Técnico Gerado</div>
              </div>
              
              <div className="space-y-6">
                {insights.map((insightObj, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="text-emerald-500 mt-1 font-black text-2xl">“</div>
                    <div className="text-neutral-900 dark:text-white text-xl md:text-3xl font-extrabold leading-[1.1] tracking-tight max-w-2xl">
                    {typeof insightObj === 'string' 
                      ? insightObj 
                      : (insightObj.termo 
                          ? <span className="flex flex-col gap-1">
                              <span className="text-emerald-600 dark:text-emerald-500 text-sm uppercase tracking-[0.3em] font-black">{insightObj.termo}</span>
                              {insightObj.insight}
                            </span>
                          : insightObj.insight)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="absolute right-10 top-10 opacity-5 dark:opacity-20">
              <Activity size={120} className="text-emerald-600" />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-6 animate-pulse">
           {[1,2].map(i => (
             <div key={i} className="h-44 bg-neutral-100 dark:bg-neutral-900/50 rounded-[32px] w-full border-2 border-dashed border-neutral-200 dark:border-neutral-800"></div>
           ))}
        </div>
      ) : !hasResults ? (
        <div className="bg-neutral-50 dark:bg-black/20 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-[48px] p-20 text-center">
          <div className="w-24 h-24 bg-white dark:bg-neutral-900 shadow-xl rounded-full flex items-center justify-center mx-auto mb-8 border border-neutral-100 dark:border-neutral-800">
            <AlertCircle className="text-neutral-300 dark:text-neutral-700" size={48} />
          </div>
          <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-3 tracking-tighter">Nenhuma Correspondência encontrada no Inventário.</h3>
          <p className="text-neutral-500 dark:text-neutral-500 max-w-md mx-auto leading-relaxed font-medium">
            A análise técnica foi concluída, mas o SKU mapeado não está presente no lote de estoque atualizado.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-6 border-b border-neutral-100 dark:border-neutral-800 pb-10 px-4 text-center md:text-left">
             <div className="flex-1">
               <h2 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tighter mb-2">Resultados</h2>
               <p className="text-neutral-400 dark:text-neutral-500 text-[10px] md:text-sm font-bold uppercase tracking-widest italic leading-relaxed">Seleção exclusiva baseada em critérios técnicos</p>
             </div>
             <div className="inline-flex mx-auto md:mx-0 px-6 py-2.5 bg-black dark:bg-emerald-600 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-xl shadow-black/20 dark:shadow-emerald-900/20 whitespace-nowrap">
               {safeResults.length} PARTES IDENTIFICADAS
             </div>
          </div>

          {highConfidence.length > 0 && (
            <div className="space-y-6 mb-16">
              <div className="flex items-center gap-3 mb-6 px-4">
                <div className="h-6 w-1.5 bg-emerald-600 rounded-full"></div>
                <span className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.3em]">RECOMENDAÇÃO PRINCIPAL (MATCH 1:1)</span>
              </div>
              {highConfidence.map((prod, idx) => (
                <ProductCard key={`${prod.COD_LEGADO || prod.COD_INTERNO}-${idx}`} product={prod} />
              ))}
            </div>
          )}
          
          {midConfidence.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6 px-4">
                <div className="h-6 w-1.5 bg-neutral-300 rounded-full"></div>
                <span className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.3em]">ITENS SECUNDÁRIOS / COMPLEMENTARES</span>
              </div>
              {midConfidence.map((prod, idx) => (
                <ProductCard key={`${prod.COD_LEGADO || prod.COD_INTERNO}-${idx}`} product={prod} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
