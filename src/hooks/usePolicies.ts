import { useEffect, useMemo, useState } from 'react';
import { apiService } from '@/lib/api';

export type PolicyStatus = 'Ativo' | 'Pendente' | 'Cancelado';

export interface Policy {
  id: string;
  tipo: 'Veículo' | 'Residencial' | 'Celular' | string;
  objeto: string; // descrição do bem/placa/endereço/modelo
  status: PolicyStatus;
  vigencia: string; // período textual
  valor: string; // preço textual ex: R$ 149,90/mês
}

export function usePolicies() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      
      try {
        const resp = await apiService.getPolicies();
        if (resp.success && Array.isArray(resp.data) && resp.data.length > 0) {
          const mapped: Policy[] = (resp.data as any[]).map((p, idx) => ({
            id: String(p.id ?? p.codigo ?? p.apolice_id ?? `AP${String(idx + 1).padStart(3, '0')}`),
            tipo: (p.type ?? p.tipo_seguro ?? p.tipo ?? 'Veículo') as Policy['tipo'],
            objeto: p.objeto ?? p.descricao ?? p.placa ?? p.endereco ?? 'Objeto segurado',
            status: (p.status ?? 'Ativo') as PolicyStatus,
            vigencia: p.vigencia ?? p.periodo ?? '—',
            valor: p.valor ?? p.preco ?? '—',
          }));
          if (mounted) setPolicies(mapped);
        } else {
          if (mounted) setPolicies([]);
        }
      } catch (e: any) {
        setError(e?.message || 'Falha ao carregar apólices');
        setPolicies([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = policies.length;
    const ativas = policies.filter(p => p.status === 'Ativo').length;
    const pendentes = policies.filter(p => p.status === 'Pendente').length;
    const canceladas = policies.filter(p => p.status === 'Cancelado').length;
    return { total, ativas, pendentes, canceladas };
  }, [policies]);

  return { policies, stats, loading, error };
}
