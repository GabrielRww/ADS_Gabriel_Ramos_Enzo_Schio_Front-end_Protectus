import { useState, useCallback } from 'react';
import { apiService } from '@/lib/api';

interface SimulationResult {
  value?: number | string;
  [key: string]: any;
}

export function useSimulation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulate = useCallback(async (payload: any): Promise<SimulationResult | null> => {
    setLoading(true);
    setError(null);
    try {
      console.log('🚀 Enviando simulação para API:', payload);
      const resp = await apiService.simulateInsurance(payload);
      console.log('📦 Resposta completa da API:', resp);
      
      if (resp.success) {
        console.log('✅ Simulação bem-sucedida, dados:', resp.data);
        // resp.data pode conter o resultado; se não houver, retorne objeto vazio
        return (resp.data as SimulationResult) ?? {};
      }
      
      console.error('❌ Falha na simulação:', resp.error);
      setError(resp.error || 'Falha na simulação');
      return null;
    } catch (e: any) {
      console.error('💥 Erro ao simular:', e);
      setError(e?.message || 'Erro inesperado');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { simulate, loading, error };
}

// Hook para simulação de seguro de celular
export function useCellphoneSimulation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulate = useCallback(async (payload: any): Promise<SimulationResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const resp = await apiService.simulateCellphoneInsurance(payload);
      if (resp.success) {
        return (resp.data as SimulationResult) ?? {};
      }
      setError(resp.error || 'Falha na simulação de celular');
      return null;
    } catch (e: any) {
      setError(e?.message || 'Erro inesperado na simulação de celular');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { simulate, loading, error };
}

// Hook para simulação de seguro residencial
export function useResidentialSimulation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulate = useCallback(async (payload: any): Promise<SimulationResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const resp = await apiService.simulateResidentialInsurance(payload);
      if (resp.success) {
        return (resp.data as SimulationResult) ?? {};
      }
      setError(resp.error || 'Falha na simulação residencial');
      return null;
    } catch (e: any) {
      setError(e?.message || 'Erro inesperado na simulação residencial');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { simulate, loading, error };
}
