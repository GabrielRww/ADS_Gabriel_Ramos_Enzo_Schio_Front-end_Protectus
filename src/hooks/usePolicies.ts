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

const MOCK_POLICIES: Policy[] = [
  {
    id: 'AP001',
    tipo: 'Veículo',
    objeto: 'Honda Civic - ABC-1234',
    status: 'Ativo',
    vigencia: '23/05/2024 - 23/05/2025',
    valor: 'R$ 149,90/mês',
  },
  {
    id: 'AP002',
    tipo: 'Residencial',
    objeto: 'Rua das Flores, 123',
    status: 'Ativo',
    vigencia: '15/08/2024 - 15/08/2025',
    valor: 'R$ 89,90/mês',
  },
  {
    id: 'AP003',
    tipo: 'Celular',
    objeto: 'iPhone 14 Pro',
    status: 'Pendente',
    vigencia: 'Aguardando aprovação',
    valor: 'R$ 29,90/mês',
  },
  {
    id: 'AP004',
    tipo: 'Veículo',
    objeto: 'Toyota Corolla - XYZ-5678',
    status: 'Cancelado',
    vigencia: '10/01/2024 - 10/01/2025',
    valor: 'R$ 134,90/mês',
  },
];

const ENABLE_POLICIES_API = import.meta.env.VITE_POLICIES_API === 'true';

export function usePolicies() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      if (!ENABLE_POLICIES_API) {
        // Não chama backend — usa mock e encerra
        if (mounted) setPolicies(MOCK_POLICIES);
        if (mounted) setLoading(false);
        return;
      }
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
          if (mounted) setPolicies(MOCK_POLICIES);
        }
      } catch (e: any) {
        setError(e?.message || 'Falha ao carregar apólices');
        setPolicies(MOCK_POLICIES);
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
