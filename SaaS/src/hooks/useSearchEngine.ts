"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { SearchInput, Estrutura, ScoredProduct, ScoredProductWithStructure } from '../types/product';
import { attachStructure } from '../lib/structure';
import Papa from 'papaparse';

export const useSearchEngine = () => {
  const [loading, setLoading] = useState(false);
  const [baseCount, setBaseCount] = useState(52570); // Valor fixo agora que está no banco

  const search = useCallback(async (inputs: SearchInput[]): Promise<ScoredProductWithStructure[]> => {
    setLoading(true);
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchInputs: inputs })
      });

      if (!response.ok) throw new Error('Falha na busca');
      
      const results = await response.json();
      
      // Nota: A estrutura (kits) agora pode ser carregada sob demanda 
      // ou retornada diretamente pela API para performance máxima.
      return results;
    } catch (e) {
      console.error("Erro na busca PostgreSQL:", e);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { search, loading, baseCount };
};
