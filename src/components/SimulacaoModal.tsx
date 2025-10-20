import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSimulation, useCellphoneSimulation, useResidentialSimulation } from '@/hooks/useApi';
import { ChevronLeft, ChevronRight, User, FileText, Car, Home, Smartphone, CheckCircle, Edit } from 'lucide-react';
import { apiService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface SelectOption {
  value: string;
  label: string;
}

interface ImportMetaEnv {
  [key: string]: string | boolean | undefined;
}

interface ImportMeta {
  env: ImportMetaEnv;
}

interface User {
  id?: string;
  phone?: string;
  telefone?: string;
  cpf?: string;
  nome?: string;
  email?: string;
  [key: string]: unknown;
}

interface SimulacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoSeguro?: 'veiculo' | 'residencial' | 'celular';
}

interface FormData {
  // Dados pessoais
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  
  // Dados específicos do seguro
  marca?: string;
  modelo?: string;
  ano?: string;
  marcaCelular?: string;
  modeloCelular?: string;
  corCelular?: string;
  valorImovel?: string;
  tipoImovel?: string;
  localidade?: string;
  valorBem?: number;
  idVeiculo?: number;
  idCelular?: number; // ID do celular no catálogo
  [key: string]: string | number | undefined;
}

interface CatalogItem {
  id?: string;
  nome?: string | { descricao?: string; name?: string; valor?: string };
  codigo?: string;
  valor?: string;
  preco?: string;
  marca?: string;
  modelo?: string | { descricao?: string; name?: string };
  ano?: string;
  cor?: string;
  value?: string;
  cod?: string;
  sigla?: string;
  code?: string;
  key?: string;
  label?: string | { pt?: string; value?: string };
  descricao?: string;
  description?: string;
  name?: string | { pt?: string; descricao?: string; name?: string; valor?: string; value?: string };
  title?: string;
  year?: string;
  modelo_ano?: string;
  anoModelo?: string;
  [key: string]: unknown;
}

interface SimulationResult {
  id?: string;
  valor?: number;
  premio?: number;
  valorPremio?: number;
  valorBem?: number;
  valorSeguro?: number;
  detalhes?: Record<string, unknown>;
  originalData?: FormData;
  formData?: FormData;
}

export default function SimulacaoModal({ open, onOpenChange, tipoSeguro: initialTipoSeguro }: SimulacaoModalProps) {
  // ======== DEBUGGING DE NAVEGAÇÃO ========
  useEffect(() => {
    if (open) {
      console.log(' SimulacaoModal aberto - configurando interceptores de navegação');
      console.log(' URL INICIAL:', window.location.href);
      
      const initialUrl = window.location.href;
      
      // Intercepta mudanças de URL
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;
      
      window.history.pushState = function(...args) {
        console.error(' NAVEGAÇÃO DETECTADA (pushState)!');
        console.error('   De:', initialUrl);
        console.error('   Para:', args[2]);
        console.error('   Stack:', new Error().stack);
        
        // BLOQUEIA navegação se for para /apolices ou página vazia
        if (args[2] && (String(args[2]).includes('/apolices') || String(args[2]).includes('about:blank'))) {
          console.error('   NAVEGAÇÃO BLOQUEADA!');
          return; // Não executa a navegação
        }
        
        return originalPushState.apply(this, args);
      };
      
      window.history.replaceState = function(...args) {
        console.error(' NAVEGAÇÃO DETECTADA (replaceState)!');
        console.error('   De:', initialUrl);
        console.error('   Para:', args[2]);
        console.error('   Stack:', new Error().stack);
        
        // BLOQUEIA navegação se for para /apolices ou página vazia
        if (args[2] && (String(args[2]).includes('/apolices') || String(args[2]).includes('about:blank'))) {
          console.error('   NAVEGAÇÃO BLOQUEADA!');
          return; // Não executa a navegação
        }
        
        return originalReplaceState.apply(this, args);
      };
      
      // Intercepta eventos popstate
      const popstateHandler = (event: PopStateEvent) => {
        console.error(' NAVEGAÇÃO DETECTADA (popstate):', window.location.href, event);
        
        // Se navegou para página errada, volta
        if (window.location.href !== initialUrl && 
            (window.location.href.includes('/apolices') || window.location.href.includes('about:blank'))) {
          console.error('    VOLTANDO PARA URL INICIAL:', initialUrl);
          window.history.pushState({}, '', initialUrl);
        }
      };
      window.addEventListener('popstate', popstateHandler);
      
      // Monitor contínuo da URL
      const urlMonitor = setInterval(() => {
        const currentUrl = window.location.href;
        if (currentUrl !== initialUrl && open) {
          console.error(' MUDANÇA DE URL DETECTADA PELO MONITOR!');
          console.error('   URL Inicial:', initialUrl);
          console.error('   URL Atual:', currentUrl);
          console.error('   Modal Aberto:', open);
          
          // Tenta restaurar
          if (currentUrl.includes('/apolices') || currentUrl.includes('about:blank')) {
            console.error('    RESTAURANDO URL...');
            window.history.pushState({}, '', initialUrl);
          }
        }
      }, 100);
      
      return () => {
        console.log(' SimulacaoModal fechado - removendo interceptores');
        clearInterval(urlMonitor);
        window.history.pushState = originalPushState;
        window.history.replaceState = originalReplaceState;
        window.removeEventListener('popstate', popstateHandler);
      };
    }
  }, [open]);
  
  // Função para formatar valores em formato brasileiro
  const formatCurrency = (value: string | number | null | undefined): string => {
    if (!value || value === 'A calcular') return 'A calcular';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'A calcular';
    
    return numValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [tipoSeguro, setTipoSeguro] = useState<'veiculo' | 'residencial' | 'celular' | ''>('');
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
  });
  
  // Estados para o fluxo de simulação -> resultado -> contratação
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [contractingLoading, setContractingLoading] = useState(false);
  
  const { toast } = useToast();
  const { simulate, loading: simulationLoading } = useSimulation();
  const { simulate: simulateCellphone, loading: cellphoneLoading } = useCellphoneSimulation();
  const { simulate: simulateResidential, loading: residentialLoading } = useResidentialSimulation();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const prefilledRef = useRef(false);

  // Definir loading baseado no tipo de seguro
  const currentLoading = useMemo(() => {
    switch (tipoSeguro) {
      case 'veiculo':
        return simulationLoading;
      case 'celular':
        return cellphoneLoading;
      case 'residencial':
        return residentialLoading;
      default:
        return false;
    }
  }, [tipoSeguro, simulationLoading, cellphoneLoading, residentialLoading]);

  // Helper para normalizar opções { id, nome } evitando [object Object]
  const toOption = (m: CatalogItem, index?: number): { id: string; nome: string } => {
    console.log('[toOption] Recebeu:', m, 'tipo:', typeof m, 'index:', index);
    
    // Se for string simples, usar como nome e criar ID
    if (typeof m === 'string') {
      const result = { id: String(index !== undefined ? index + 1 : m), nome: m };
      console.log('[toOption] String:', result);
      return result;
    }
    
    // Se for objeto
    if (m && typeof m === 'object') {
      console.log('[toOption] Analisando objeto:', JSON.stringify(m));
      
      // Primeira tentativa: usar campos mais comuns para ID
      const id = String(m?.id ?? m?.codigo ?? m?.cod ?? (index !== undefined ? index + 1 : ''));
      let nome = '';
      
      // Tentar diferentes campos para o nome (incluindo "cor" e "color")
      if (typeof m?.nome === 'string' && m.nome.trim()) {
        nome = m.nome;
      } else if (typeof m?.name === 'string' && m.name.trim()) {
        nome = m.name;
      } else if (typeof m?.descricao === 'string' && m.descricao.trim()) {
        nome = m.descricao;
      } else if (typeof m?.label === 'string' && m.label.trim()) {
        nome = m.label;
      } else if (typeof m?.cor === 'string' && m.cor.trim()) {
        nome = m.cor;
      } else if (typeof m?.color === 'string' && m.color.trim()) {
        nome = m.color;
      } else if (id && id !== '0') {
        nome = id;
      } else {
        // Última tentativa: pegar qualquer propriedade string que não seja vazia
        const keys = Object.keys(m);
        for (const key of keys) {
          const val = (m as any)[key];
          if (typeof val === 'string' && val.trim() && val !== 'null' && val !== 'undefined') {
            nome = val;
            console.log(`[toOption] Usando propriedade "${key}" como nome:`, val);
            break;
          }
        }
        if (!nome) {
          nome = 'Item sem nome';
        }
      }
      
      const result = { id, nome };
      console.log(' toOption (objeto):', result);
      return result;
    }
    
    // Fallback
    const result = { id: String(index !== undefined ? index + 1 : 'unknown'), nome: String(m || 'Desconhecido') };
    console.log(' toOption (fallback):', result);
    return result;
  };

  // Helper específico para anos: tenta extrair um número e usá-lo como id e nome
  const toYearOption = (m: CatalogItem): SelectOption => {
    let year: string | null = null;
    if (typeof m === 'number') year = String(m);
    else if (typeof m === 'string') {
      const digits = m.match(/\d{4}/)?.[0];
      if (digits) year = digits;
    } else if (m && typeof m === 'object') {
      const num = m.ano ?? m.year ?? m.valor ?? m.value ?? m.modelo_ano ?? m.anoModelo ?? m['ano-modelo'];
      if (typeof num === 'number') year = String(num);
      else if (typeof num === 'string') {
        const digits = num.match(/\d{4}/)?.[0];
        if (digits) year = digits; else year = num;
      } else {
        // Procura primeira propriedade numérica
        const firstNum = Object.values(m).find((v) => typeof v === 'number');
        if (typeof firstNum === 'number') year = String(firstNum);
        else {
          const firstStrDigits = Object.values(m).find((v) => typeof v === 'string' && /\d{4}/.test(v as string)) as string | undefined;
          if (firstStrDigits) year = firstStrDigits.match(/\d{4}/)![0];
        }
      }
    }
    if (!year) return toOption(m); // fallback genérico
    return { id: year, nome: year };
  };
  // Catálogo veicular dinâmico
  const [marcas, setMarcas] = useState<Array<{ id: string | number; nome: string }>>([]);
  const [modelos, setModelos] = useState<Array<{ id: string | number; nome: string }>>([]);
  const [anos, setAnos] = useState<Array<{ id: string | number; nome: string }>>([]);
  const [loadingCatalog, setLoadingCatalog] = useState({ marcas: false, modelos: false, anos: false });

  // Catálogo de celulares dinâmico
  const [marcasCelulares, setMarcasCelulares] = useState<Array<{ id: string | number; nome: string }>>([]);
  const [modelosCelulares, setModelosCelulares] = useState<Array<{ id: string | number; nome: string }>>([]);
  const [coresCelulares, setCoresCelulares] = useState<Array<{ id: string | number; nome: string }>>([]);
  const [loadingCelulares, setLoadingCelulares] = useState({ marcas: false, modelos: false, cores: false });

  useEffect(() => {
    console.log(' useEffect principal disparado:', { open, isAuthenticated, initialTipoSeguro, tipoSeguro }); // Debug
    
    // Enforce auth: se abrir sem estar logado, redireciona para login
    if (open && !isAuthenticated) {
      console.log(' Usuário não autenticado, redirecionando para login'); // Debug
      toast({ title: 'Faça login para simular', description: 'Você precisa estar autenticado para realizar a simulação.', variant: 'destructive' });
      onOpenChange(false);
      navigate('/login', { replace: false });
      return;
    }
    
    // Inicializar tipo de seguro se passado como prop
    if (open && initialTipoSeguro && !tipoSeguro) {
      console.log(' Inicializando tipo de seguro:', initialTipoSeguro); // Debug
      setTipoSeguro(initialTipoSeguro);
    }
    
    // Reset flag ao fechar e limpar dados
    if (!open) {
      prefilledRef.current = false;
      // Limpar dados dos catálogos ao fechar
      setMarcas([]);
      setModelos([]);
      setAnos([]);
      setMarcasCelulares([]);
      setModelosCelulares([]);
      setCoresCelulares([]);
      // Reset loading states
      setLoadingCatalog({ marcas: false, modelos: false, anos: false });
      setLoadingCelulares({ marcas: false, modelos: false, cores: false });
    }
  }, [open, isAuthenticated, initialTipoSeguro]);

  // Prefill de dados pessoais quando autenticado e modal abrir
  useEffect(() => {
    if (open && isAuthenticated && user && !prefilledRef.current) {
      const rawPhone = (user as unknown as User).phone || (user as unknown as User).telefone || '';
      const rawCpf = (user as unknown as User).cpf || '';
      const onlyDigits = (v: string) => v.replace(/\D/g, '');
      const fmtPhone = (v: string) => {
        const d = onlyDigits(v).slice(0, 11);
        if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
        return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
      };
      const fmtCpf = (v: string) => onlyDigits(v).slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4').trim();
      setFormData((prev) => ({
        ...prev,
        nome: user.name || prev.nome || '',
        email: user.email || prev.email || '',
        telefone: rawPhone ? fmtPhone(String(rawPhone)) : (prev.telefone || ''),
        cpf: rawCpf ? fmtCpf(String(rawCpf)) : (prev.cpf || ''),
      }));
      prefilledRef.current = true;
      // Se faltar telefone/cpf, tenta buscar do backend (quando habilitado por env)
      (async () => {
        try {
          if (!rawPhone || !rawCpf) {
            const env = (import.meta as ImportMeta).env || {};
            const enabled = String(env.VITE_PROFILE_API) === 'true' && !!env.VITE_PROFILE_CLIENTE_GET_PATH;
            if (!enabled) return;
            const profile = await apiService.fetchClienteProfile({ id: user.id, email: user.email });
            if (profile.success && profile.data) {
              const p = profile.data as User;
              const phoneFmt = p.phone ? fmtPhone(String(p.phone)) : '';
              const cpfFmt = p.cpf ? fmtCpf(String(p.cpf)) : '';
              setFormData((prev) => ({
                ...prev,
                telefone: prev.telefone || phoneFmt,
                cpf: prev.cpf || cpfFmt,
              }));
            }
          }
        } catch (error) {
          console.log('Erro ao carregar perfil:', error);
        }
      })();
    }
  }, [open, isAuthenticated, user]);

  useEffect(() => {
    if (!open || tipoSeguro !== 'veiculo') {
      console.log(' Condições não atendidas para carregar marcas:', { open, tipoSeguro }); // Debug
      return;
    }
    
    console.log(' Tentando carregar marcas...', { isAuthenticated }); // Debug
    
    // Carregar marcas da API
    (async () => {
      try {
        setLoadingCatalog((s) => ({ ...s, marcas: true }));
        console.log(' Fazendo requisição para getMarcas...'); // Debug
        const resp = await apiService.getMarcas();
        console.log(' Resposta getMarcas:', resp); // Debug
        
        if (resp.success) {
          const raw = resp.data;
          console.log(' Dados brutos marcas:', raw); // Debug
          
          // O backend retorna { marcas: string[] | object[] }
          let marcasArray: unknown[] = [];
          
          if (raw && typeof raw === 'object' && 'marcas' in raw && Array.isArray(raw.marcas)) {
            marcasArray = raw.marcas;
          } else if (Array.isArray(raw)) {
            marcasArray = raw;
          } else {
            console.log(' Formato inesperado de marcas:', raw);
            marcasArray = [];
          }
          
          console.log(' Array de marcas processado:', marcasArray); // Debug
          
          // Converter para formato {id, nome} - suporta strings ou objetos
          const mapped = marcasArray.map((marca: unknown, index: number) => {
            // Se for string, usa como nome
            if (typeof marca === 'string') {
              return {
                id: String(index + 1),
                nome: marca
              };
            }
            
            // Se for objeto, extrai o nome
            if (typeof marca === 'object' && marca !== null) {
              const obj = marca as Record<string, unknown>;
              const nome = obj.nome || obj.marca || obj.name || obj.descricao || 
                          obj.description || obj.label || String(obj.id || index + 1);
              
              return {
                id: String(obj.id || obj.codigo || obj.cod || index + 1),
                nome: String(nome)
              };
            }
            
            // Fallback
            return {
              id: String(index + 1),
              nome: String(marca)
            };
          });
          
          console.log(' Marcas mapeadas:', mapped); // Debug
          setMarcas(mapped);
        } else {
          const msg = (resp as { error?: string })?.error || 'Não foi possível carregar marcas';
          console.log(' Erro ao carregar marcas:', msg); // Debug
          if (String(msg).includes('401') || String(msg).includes('Unauthorized')) {
            toast({ title: 'Sessão necessária', description: 'Faça login para carregar marcas de veículos.', variant: 'destructive' });
          } else {
            toast({ title: 'Falha ao carregar marcas', description: String(msg), variant: 'destructive' });
          }
          // Fallback para dados mockados se API falhar
          console.log(' Usando dados mockados como fallback...'); // Debug
          setMarcas([
            { id: '1', nome: 'Toyota' },
            { id: '2', nome: 'Honda' },
            { id: '3', nome: 'Ford' },
            { id: '4', nome: 'Chevrolet' },
          ]);
        }
      } catch (e) {
        console.log('Erro na requisição de marcas:', e); // Debug
        // Fallback para dados mockados em caso de erro
        console.log(' Usando dados mockados devido a erro...'); // Debug
        setMarcas([
          { id: '1', nome: 'Toyota' },
          { id: '2', nome: 'Honda' },
          { id: '3', nome: 'Ford' },
          { id: '4', nome: 'Chevrolet' },
        ]);
      } finally {
        setLoadingCatalog((s) => ({ ...s, marcas: false }));
      }
    })();
    
  }, [open, tipoSeguro, isAuthenticated]);

  // Carregar marcas de celulares
  useEffect(() => {
    if (!open || tipoSeguro !== 'celular') return;
    if (!isAuthenticated) {
      setMarcasCelulares([]); setModelosCelulares([]); setCoresCelulares([]);
      return;
    }
    (async () => {
      try {
        setLoadingCelulares((s) => ({ ...s, marcas: true }));
        const resp = await apiService.getMarcasCelulares();
        console.log(' Resposta getMarcasCelulares:', resp); // Debug
        
        if (resp.success) {
          const raw = resp.data;
          console.log(' Dados brutos marcas celulares:', raw); // Debug
          
          // O backend retorna { marcas: string[] }
          let marcasArray: string[] = [];
          
          if (raw && typeof raw === 'object' && 'marcas' in raw && Array.isArray(raw.marcas)) {
            marcasArray = raw.marcas;
          } else if (Array.isArray(raw)) {
            marcasArray = raw;
          } else {
            console.log(' Formato inesperado de marcas celulares:', raw);
            marcasArray = [];
          }
          
          console.log(' Array de marcas celulares processado:', marcasArray); // Debug
          
          // Converter strings para formato {id, nome}
          const mapped = marcasArray.map((marca: string, index: number) => ({
            id: String(index + 1), // Usar índice como ID
            nome: marca
          }));
          
          console.log(' Marcas celulares mapeadas:', mapped); // Debug
          setMarcasCelulares(mapped);
        } else {
          const msg = (resp as any)?.error || 'Não foi possível carregar marcas de celulares';
          if (String(msg).includes('401')) {
            toast({ title: 'Sessão necessária', description: 'Faça login para carregar marcas de celulares.', variant: 'destructive' });
          } else {
            toast({ title: 'Falha ao carregar marcas', description: String(msg), variant: 'destructive' });
          }
          setMarcasCelulares([]);
        }
      } catch (e) {
        setMarcasCelulares([]);
      } finally {
        setLoadingCelulares((s) => ({ ...s, marcas: false }));
      }
    })();
  }, [open, tipoSeguro, isAuthenticated]);

  // Quando selecionar marca, carregar modelos e limpar dependentes
  useEffect(() => {
    const marca = formData.marca;
    console.log(' useEffect modelos disparado:', { marca, tipoSeguro, isAuthenticated, marcasLength: marcas.length }); // Debug
    
    if (tipoSeguro !== 'veiculo' || !marca || !isAuthenticated) { 
      console.log('Condições não atendidas para carregar modelos'); // Debug
      setModelos([]); 
      setAnos([]); 
      return; 
    }
    
    (async () => {
      try {
        console.log('Iniciando carregamento de modelos...'); // Debug
        setLoadingCatalog((s) => ({ ...s, modelos: true }));
        
        // Muitas APIs esperam o nome da marca, não o id
        const marcaNome = marcas.find((m) => String(m.id) === String(marca))?.nome || String(marca);
        console.log(' Carregando modelos para marca:', { marcaId: marca, marcaNome }); // Debug
        
        const resp = await apiService.getModelos({ marca: String(marcaNome) });
        console.log(' Resposta getModelos:', resp); // Debug
        
        if (resp.success) {
          const raw = resp.data;
          console.log(' Dados brutos modelos:', raw); // Debug
          
          // O backend retorna { modelos: string[] | object[] }
          let modelosArray: unknown[] = [];
          
          if (raw && typeof raw === 'object' && 'modelos' in raw && Array.isArray(raw.modelos)) {
            modelosArray = raw.modelos;
          } else if (Array.isArray(raw)) {
            modelosArray = raw;
          } else {
            console.log(' Formato inesperado de modelos:', raw);
            modelosArray = [];
          }
          
          console.log(' Array de modelos processado:', modelosArray); // Debug
          
          // Converter para formato {id, nome} - suporta strings ou objetos
          const mapped = modelosArray.map((modelo: unknown, index: number) => {
            // Se for string, usa como nome
            if (typeof modelo === 'string') {
              return {
                id: String(index + 1),
                nome: modelo
              };
            }
            
            // Se for objeto, extrai o nome de diferentes possíveis propriedades
            if (typeof modelo === 'object' && modelo !== null) {
              const obj = modelo as Record<string, unknown>;
              const nome = obj.nome || obj.modelo || obj.name || obj.descricao || 
                          obj.description || obj.label || String(obj.id || index + 1);
              
              return {
                id: String(obj.id || obj.codigo || obj.cod || index + 1),
                nome: String(nome)
              };
            }
            
            // Fallback
            return {
              id: String(index + 1),
              nome: String(modelo)
            };
          });
          
          console.log(' Modelos mapeados:', mapped); // Debug
          setModelos(mapped);
        } else {
          const msg = (resp as { error?: string })?.error || 'Não foi possível carregar modelos';
          console.log(' Erro ao carregar modelos:', msg); // Debug
          
          // Para erro 401, usar dados mockados como fallback
          if (String(msg).includes('401') || String(msg).includes('Unauthorized')) {
            console.log(' Usando dados mockados para modelos devido a erro 401'); // Debug
            setModelos([
              { id: '1', nome: 'Modelo 1' },
              { id: '2', nome: 'Modelo 2' },
              { id: '3', nome: 'Modelo 3' },
            ]);
          } else {
            console.log(' Erro não relacionado a autenticação'); // Debug
            setModelos([]);
          }
        }
        
        // reset campos dependentes
        setFormData((prev) => ({ ...prev, modelo: '', ano: '' }));
        setAnos([]);
        
        console.log(' Carregamento de modelos finalizado'); // Debug
        
      } catch (e) {
        console.log(' Erro crítico ao carregar modelos:', e); // Debug
        setModelos([]);
        // Não mostrar toast em caso de erro crítico para evitar crash
      } finally {
        setLoadingCatalog((s) => ({ ...s, modelos: false }));
        console.log(' Loading de modelos finalizado'); // Debug
      }
    })();
  }, [formData.marca, tipoSeguro, isAuthenticated, marcas]);

  // Quando selecionar modelo, carregar anos e limpar dependente
  useEffect(() => {
    const marca = formData.marca; const modelo = formData.modelo;
    if (tipoSeguro !== 'veiculo' || !marca || !modelo || !isAuthenticated) { setAnos([]); return; }
    (async () => {
      try {
        setLoadingCatalog((s) => ({ ...s, anos: true }));
        // Muitas APIs esperam nome de marca e modelo
        const marcaNome = marcas.find((m) => String(m.id) === String(marca))?.nome || String(marca);
        const modeloNome = modelos.find((m) => String(m.id) === String(modelo))?.nome || String(modelo);
        console.log(' Carregando anos para:', { marca: marcaNome, modelo: modeloNome }); // Debug
        const resp = await apiService.getAnos({ marca: String(marcaNome), modelo: String(modeloNome) });
        console.log(' Resposta getAnos:', resp); // Debug
        
        if (resp.success) {
          const raw = resp.data;
          console.log(' Dados brutos anos:', raw); // Debug
          
          // O backend retorna { anos: number[] | string[] | object[] }
          let anosArray: unknown[] = [];
          
          if (raw && typeof raw === 'object' && 'anos' in raw && Array.isArray(raw.anos)) {
            anosArray = raw.anos;
          } else if (Array.isArray(raw)) {
            anosArray = raw;
          } else {
            console.log(' Formato inesperado de anos:', raw);
            anosArray = [];
          }
          
          console.log(' Array de anos processado:', anosArray); // Debug
          
          // Converter para formato {id, nome} - suporta numbers, strings ou objetos
          const mapped = anosArray.map((ano: unknown, index: number) => {
            // Se for número ou string, usa como nome
            if (typeof ano === 'number' || typeof ano === 'string') {
              return {
                id: String(ano),
                nome: String(ano)
              };
            }
            
            // Se for objeto, extrai o ano
            if (typeof ano === 'object' && ano !== null) {
              const obj = ano as Record<string, unknown>;
              const anoValue = obj.ano || obj.year || obj.valor || obj.value || 
                              obj.modelo_ano || obj.anoModelo || String(obj.id || index + 1);
              
              return {
                id: String(anoValue),
                nome: String(anoValue)
              };
            }
            
            // Fallback
            return {
              id: String(index + 1),
              nome: String(ano)
            };
          });
          
          console.log(' Anos mapeados:', mapped); // Debug
          setAnos(mapped);
        } else {
          const msg = (resp as any)?.error || 'Não foi possível carregar anos';
          if (String(msg).includes('401')) {
            toast({ title: 'Sessão necessária', description: 'Faça login para carregar anos.', variant: 'destructive' });
          } else {
            toast({ title: 'Falha ao carregar anos', description: String(msg), variant: 'destructive' });
          }
          setAnos([]);
        }
        // reset ano
        setFormData((prev) => ({ ...prev, ano: '' }));
      } catch (e) {
        setAnos([]);
      } finally {
        setLoadingCatalog((s) => ({ ...s, anos: false }));
      }
    })();
  }, [formData.modelo, tipoSeguro, isAuthenticated]);

  // Quando selecionar marca de celular, carregar modelos
  useEffect(() => {
    const marcaCelular = formData.marcaCelular;
    if (tipoSeguro !== 'celular' || !marcaCelular || !isAuthenticated) { 
      setModelosCelulares([]); setCoresCelulares([]); 
      return; 
    }
    (async () => {
      try {
        setLoadingCelulares((s) => ({ ...s, modelos: true }));
        const marcaNome = marcasCelulares.find((m) => String(m.id) === String(marcaCelular))?.nome || String(marcaCelular);
        console.debug('Carregando modelos de celular para marca:', marcaNome);
        const resp = await apiService.getModelosCelulares({ marca: String(marcaNome) });
        if (resp.success) {
          const raw = resp.data as any;
          console.log('Resposta getModelosCelulares raw:', raw);
          
          const arr = Array.isArray(raw) ? raw : Array.isArray(raw?.modelos) ? raw.modelos : Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.items) ? raw.items : [];
          console.log(' Array de modelos extraído:', arr);
          
          const mapped = arr.map((item: any, index: number) => toOption(item, index));
          console.log(' Modelos celulares mapeados:', mapped);
          
          setModelosCelulares(mapped);
        } else {
          const msg = (resp as any)?.error || 'Não foi possível carregar modelos de celular';
          toast({ title: 'Falha ao carregar modelos', description: String(msg), variant: 'destructive' });
          setModelosCelulares([]);
        }
        // reset campos dependentes
        setFormData((prev) => ({ ...prev, modeloCelular: '', corCelular: '' }));
        setCoresCelulares([]);
      } catch (e) {
        setModelosCelulares([]);
      } finally {
        setLoadingCelulares((s) => ({ ...s, modelos: false }));
      }
    })();
  }, [formData.marcaCelular, tipoSeguro, isAuthenticated]);

  // Quando selecionar modelo de celular, carregar cores
  useEffect(() => {
    const marcaCelular = formData.marcaCelular; 
    const modeloCelular = formData.modeloCelular;
    if (tipoSeguro !== 'celular' || !marcaCelular || !modeloCelular || !isAuthenticated) { 
      setCoresCelulares([]); 
      return; 
    }
    (async () => {
      try {
        setLoadingCelulares((s) => ({ ...s, cores: true }));
        const marcaNome = marcasCelulares.find((m) => String(m.id) === String(marcaCelular))?.nome || String(marcaCelular);
        const modeloNome = modelosCelulares.find((m) => String(m.id) === String(modeloCelular))?.nome || String(modeloCelular);
        console.debug('Carregando cores para:', { marca: marcaNome, modelo: modeloNome });
        const resp = await apiService.getCoresCelulares({ marca: String(marcaNome), modelo: String(modeloNome) });
        if (resp.success) {
          const raw = resp.data as any;
          console.log(' Resposta getCoresCelulares raw:', raw);
          console.log(' Tipo de raw:', typeof raw, Array.isArray(raw) ? 'É array' : 'Não é array');
          
          const arr = Array.isArray(raw) ? raw : Array.isArray(raw?.cores) ? raw.cores : Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.items) ? raw.items : [];
          console.log('[Cores] Array de cores extraído:', arr);
          console.log('[Cores] Tamanho do array:', arr.length);
          console.log('[Cores] Raw completo:', JSON.stringify(raw));
          
          if (arr.length > 0) {
            console.log('[Cores] Primeira cor no array:', arr[0], 'tipo:', typeof arr[0]);
          }
          
          // Mapear cores (backend retorna array de strings)
          const mapped = arr
            .filter((item: any) => item !== null && item !== undefined && item !== '') // Filtrar valores vazios
            .map((item: any, index: number) => {
              console.log(`[Cores] Processando cor ${index}:`, item, 'tipo:', typeof item);
              // Se for string simples (como o backend retorna), usar a string como nome e ID
              if (typeof item === 'string') {
                return { id: item, nome: item };
              }
              return toOption(item, index);
            });
          console.log('[Cores] Cores celulares mapeadas:', mapped);
          
          // Se não houver cores no banco, adicionar cores padrão
          if (mapped.length === 0) {
            console.warn('[Cores] Nenhuma cor encontrada no banco, usando cores padrão');
            const coresPadrao = [
              { id: 'Preto', nome: 'Preto' },
              { id: 'Branco', nome: 'Branco' },
              { id: 'Prata', nome: 'Prata' },
              { id: 'Dourado', nome: 'Dourado' },
              { id: 'Azul', nome: 'Azul' },
              { id: 'Verde', nome: 'Verde' },
              { id: 'Rosa', nome: 'Rosa' },
              { id: 'Vermelho', nome: 'Vermelho' },
            ];
            setCoresCelulares(coresPadrao);
            toast({ 
              title: 'Cores não cadastradas', 
              description: 'Usando cores padrão. Entre em contato para cadastrar cores específicas deste modelo.',
              variant: 'default'
            });
          } else {
            setCoresCelulares(mapped);
          }
          
          // NÃO resetar a cor se já existir uma selecionada
          // Apenas resetar se as cores mudaram (novo modelo selecionado)
          const coresFinais = mapped.length > 0 ? mapped : [
            { id: 'Preto', nome: 'Preto' },
            { id: 'Branco', nome: 'Branco' },
            { id: 'Prata', nome: 'Prata' },
          ];
          if (!formData.corCelular || !coresFinais.find(c => c.id === formData.corCelular)) {
            setFormData((prev) => ({ ...prev, corCelular: '' }));
          }
        } else {
          const msg = (resp as any)?.error || 'Não foi possível carregar cores';
          toast({ title: 'Falha ao carregar cores', description: String(msg), variant: 'destructive' });
          setCoresCelulares([]);
        }
      } catch (e) {
        setCoresCelulares([]);
      } finally {
        setLoadingCelulares((s) => ({ ...s, cores: false }));
      }
    })();
  }, [formData.modeloCelular, tipoSeguro, isAuthenticated]);

  // Auto-buscar valor do veículo quando marca, modelo e ano estiverem selecionados
  useEffect(() => {
    const { marca, modelo, ano } = formData;
    if (tipoSeguro !== 'veiculo' || !marca || !modelo || !ano || !isAuthenticated) return;
    
    (async () => {
      try {
        const marcaNome = marcas.find((m) => String(m.id) === String(marca))?.nome || '';
        const modeloNome = modelos.find((m) => String(m.id) === String(modelo))?.nome || '';
        
        // Mostrar loading
        toast({
          title: "Consultando FIPE...",
          description: `Buscando valor para ${marcaNome} ${modeloNome} ${ano}`,
        });

        console.log('[FIPE] Iniciando consulta com dados:', { marcaNome, modeloNome, ano });

        // Buscar valor real da FIPE
        const fipeResponse = await apiService.getValorFipe({
          marca: marcaNome,
          modelo: modeloNome,
          ano: String(ano)
        });
        
        console.log('Resposta completa da FIPE:', JSON.stringify(fipeResponse, null, 2));
        
        if (fipeResponse.success && fipeResponse.data?.valor) {
          const valorFipe = fipeResponse.data.valor;
          const idVeiculo = fipeResponse.data.idVeiculo; // Capturar o ID do veículo
          const fonte = fipeResponse.data.fonte || 'DESCONHECIDA';
          
          console.log(' Dados FIPE capturados:', { valorFipe, idVeiculo, fonte });
          
          setFormData((prev) => ({ 
            ...prev, 
            valorVeiculo: valorFipe,
            idVeiculo: idVeiculo // Salvar o ID do veículo para usar na simulação
          }));
          
          toast({
            title: `Valor FIPE encontrado! (${fonte})`,
            description: `${marcaNome} ${modeloNome} ${ano}: R$ ${formatCurrency(valorFipe)}`,
          });
        } else {
          console.warn(' FIPE não retornou valor válido:', JSON.stringify(fipeResponse, null, 2));
          
          // Fallback para simulação se FIPE não estiver disponível
          const errorMessage = fipeResponse.error || 'Resposta inválida';
          console.warn('FIPE não disponível, usando simulação. Erro:', errorMessage);
          
          let valorEstimado = '';
          const anoInt = parseInt(String(ano));
          const idadeVeiculo = new Date().getFullYear() - anoInt;
          
          if (idadeVeiculo <= 2) {
            valorEstimado = 'R$ 65.000';
          } else if (idadeVeiculo <= 5) {
            valorEstimado = 'R$ 45.000';
          } else if (idadeVeiculo <= 10) {
            valorEstimado = 'R$ 25.000';
          } else {
            valorEstimado = 'R$ 15.000';
          }
          
          setFormData((prev) => ({ ...prev, valorVeiculo: valorEstimado }));
          
          toast({
            title: "Valor estimado calculado",
            description: `${marcaNome} ${modeloNome} ${ano}: ${valorEstimado} (FIPE indisponível: ${errorMessage})`,
            variant: "default"
          });
        }
      } catch (error: unknown) {
        console.error(' Erro crítico ao buscar valor do veículo:', {
          error: error,
          message: (error as Error)?.message || 'unknown',
          response: (error as { response?: unknown })?.response || null,
          stack: (error as Error)?.stack || null
        });
        
        const marcaNome = marcas.find((m) => String(m.id) === String(marca))?.nome || '';
        const modeloNome = modelos.find((m) => String(m.id) === String(modelo))?.nome || '';
        
        // Fallback para simulação em caso de erro
        let valorEstimado = '';
        const anoInt = parseInt(String(ano));
        const idadeVeiculo = new Date().getFullYear() - anoInt;
        
        if (idadeVeiculo <= 2) {
          valorEstimado = 'R$ 65.000';
        } else if (idadeVeiculo <= 5) {
          valorEstimado = 'R$ 45.000';
        } else if (idadeVeiculo <= 10) {
          valorEstimado = 'R$ 25.000';
        } else {
          valorEstimado = 'R$ 15.000';
        }
        
        setFormData((prev) => ({ ...prev, valorVeiculo: valorEstimado }));
        
        toast({
          title: "Valor estimado calculado",
          description: `${marcaNome} ${modeloNome} ${ano}: ${valorEstimado} (estimativa)`,
          variant: "default"
        });
      }
    })();
  }, [formData.marca, formData.modelo, formData.ano, tipoSeguro, isAuthenticated]);

  // Auto-buscar valor do celular quando marca, modelo e cor estiverem selecionados
  useEffect(() => {
    const { marcaCelular, modeloCelular, corCelular } = formData;
    if (tipoSeguro !== 'celular' || !marcaCelular || !modeloCelular || !corCelular || !isAuthenticated) return;
    
    (async () => {
      try {
        const marcaNome = marcasCelulares.find((m) => String(m.id) === String(marcaCelular))?.nome || '';
        const modeloNome = modelosCelulares.find((m) => String(m.id) === String(modeloCelular))?.nome || '';
        
        // Mostrar loading
        toast({
          title: "Consultando valor do aparelho...",
          description: `Buscando valor para ${marcaNome} ${modeloNome}`,
        });

        console.log(' Buscando valor do celular:', { marcaNome, modeloNome });
        
        // Valores mais realistas baseados na marca e modelo
        let valorEstimado = 0;
        const marcaLower = marcaNome.toLowerCase();
        const modeloLower = modeloNome.toLowerCase();
        
        // Apple (iPhone)
        if (marcaLower.includes('apple') || marcaLower.includes('iphone')) {
          if (modeloLower.includes('15 pro') || modeloLower.includes('15pro')) {
            valorEstimado = 7500;
          } else if (modeloLower.includes('15')) {
            valorEstimado = 6000;
          } else if (modeloLower.includes('14 pro') || modeloLower.includes('14pro')) {
            valorEstimado = 6500;
          } else if (modeloLower.includes('14')) {
            valorEstimado = 5000;
          } else if (modeloLower.includes('13')) {
            valorEstimado = 4000;
          } else if (modeloLower.includes('12')) {
            valorEstimado = 3200;
          } else if (modeloLower.includes('11')) {
            valorEstimado = 2500;
          } else {
            valorEstimado = 4500; // Padrão Apple
          }
        }
        // Samsung
        else if (marcaLower.includes('samsung')) {
          if (modeloLower.includes('s24') || modeloLower.includes('s23') || modeloLower.includes('fold') || modeloLower.includes('flip')) {
            valorEstimado = 5000;
          } else if (modeloLower.includes('s22') || modeloLower.includes('s21')) {
            valorEstimado = 3500;
          } else if (modeloLower.includes('a5') || modeloLower.includes('a7')) {
            valorEstimado = 2000;
          } else if (modeloLower.includes('a')) {
            valorEstimado = 1500;
          } else {
            valorEstimado = 3200; // Padrão Samsung
          }
        }
        // Xiaomi
        else if (marcaLower.includes('xiaomi')) {
          if (modeloLower.includes('13') || modeloLower.includes('14')) {
            valorEstimado = 2500;
          } else if (modeloLower.includes('12')) {
            valorEstimado = 2000;
          } else if (modeloLower.includes('redmi')) {
            valorEstimado = 1200;
          } else {
            valorEstimado = 1800; // Padrão Xiaomi
          }
        }
        // Motorola
        else if (marcaLower.includes('motorola') || marcaLower.includes('moto')) {
          if (modeloLower.includes('edge') || modeloLower.includes('razr')) {
            valorEstimado = 3000;
          } else if (modeloLower.includes('g')) {
            valorEstimado = 1500;
          } else {
            valorEstimado = 1800;
          }
        }
        // Outras marcas
        else {
          valorEstimado = 1200;
        }
        
        const valorFormatado = `R$ ${valorEstimado.toFixed(0)}`;
        
        // Gerar ou usar ID do celular (usar ID da marca como base ou gerar único)
        const idCelularGerado = formData.modeloCelular || Date.now();
        
        console.log(' Valor do celular calculado:', { 
          marca: marcaNome, 
          modelo: modeloNome, 
          valor: valorFormatado,
          idCelular: idCelularGerado
        });
        
        setFormData((prev) => ({ 
          ...prev, 
          valorAparelho: valorFormatado,
          idCelular: Number(idCelularGerado) // Salvar ID do celular
        }));
        
        toast({
          title: "Valor do aparelho carregado",
          description: `${marcaNome} ${modeloNome}: ${valorFormatado}`,
        });
      } catch (error) {
        console.error('Erro ao buscar valor do celular:', error);
      }
    })();
  }, [formData.marcaCelular, formData.modeloCelular, formData.corCelular, tipoSeguro, isAuthenticated, marcasCelulares, modelosCelulares]);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (field: string, value: string) => {
    console.log('[Input] Change:', field, '=', value); // Debug
    
    // Log especial para mudanças de marca
    if (field === 'marca' || field === 'marcaCelular') {
      console.log(' MUDANÇA DE MARCA DETECTADA:', {
        field,
        value,
        isAuthenticated,
        userEmail: user?.email,
        urlAtual: window.location.href,
        stackTrace: new Error().stack
      });
    }
    
    // Previne propagação de eventos que possam causar navegação
    try {
      if (window.event) {
        window.event.stopPropagation?.();
        window.event.preventDefault?.();
      }
    } catch (e) {
      // Ignora erros de acesso ao event
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Verifica se houve redirecionamento após mudança
    setTimeout(() => {
      const newUrl = window.location.href;
      if (newUrl.includes('/apolices')) {
        console.error(' REDIRECIONAMENTO PARA /apolices DETECTADO APÓS MUDANÇA DE CAMPO:', {
          field,
          value,
          urlAntes: window.location.href,
          urlDepois: newUrl,
          timestamp: new Date().toISOString()
        });
      }
    }, 50);
  };

  const handleNextStep = () => {
    // Validação por etapa
    if (currentStep === 1 && !tipoSeguro) {
      toast({
        title: "Tipo de seguro",
        description: "Por favor, selecione o tipo de seguro.",
        variant: "destructive"
      });
      return;
    }

    if (currentStep === 3) {
      const requiredPersonalFields = ['nome', 'email', 'telefone', 'cpf'];
      const missingPersonal = requiredPersonalFields.filter(field => !formData[field]);
      
      if (missingPersonal.length > 0) {
        toast({
          title: "Dados pessoais incompletos",
          description: "Por favor, preencha todos os seus dados pessoais.",
          variant: "destructive"
        });
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Função para aceitar a contratação (enviar com status=1)
  const handleAcceptContract = async () => {
    if (!simulationResult?.originalData) return;
    
    setContractingLoading(true);
    try {
      // Enviar dados com status=1 para efetivar contratação
      // Remover campos temporários que não devem ir ao backend
      const { simulationId, valorAparelho, ...cleanData } = simulationResult.originalData;
      
      const contractData = {
        ...cleanData,
        qtdMeses: 12, // Garantir que qtdMeses está presente como número
        status: 1 // Status 1 = contratação confirmada
      };
      
      console.log('[Contrato] originalData completo:', simulationResult.originalData);
      console.log('[Contrato] Dados limpos:', cleanData);
      console.log('[Contrato] Confirmando contratação:', contractData);
      
      // Escolher a função de contratação correta baseada no tipo de seguro
      let result;
      if (tipoSeguro === 'veiculo') {
        result = await simulate(contractData);
      } else if (tipoSeguro === 'celular') {
        result = await simulateCellphone(contractData);
      } else if (tipoSeguro === 'residencial') {
        result = await simulateResidential(contractData);
      } else {
        toast({
          title: "Tipo de seguro inválido",
          description: "Por favor, selecione um tipo de seguro válido.",
          variant: "destructive"
        });
        return;
      }
      
      if (result) {
        toast({
          title: "Contratação realizada com sucesso!",
          description: "Seu seguro foi contratado. Em breve você receberá mais informações.",
        });
        
        // Reset e fechar modal
        handleCloseModal();
      } else {
        toast({
          title: "Erro na contratação",
          description: "Não foi possível finalizar a contratação. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro na contratação:', error);
      toast({
        title: "Erro na contratação",
        description: "Ocorreu um erro ao finalizar a contratação.",
        variant: "destructive"
      });
    } finally {
      setContractingLoading(false);
    }
  };
  
  // Função para editar/refazer a simulação
  const handleRejectContract = () => {
    // Voltar para o formulário permitindo nova simulação
    setShowResult(false);
    setSimulationResult(null);
    setCurrentStep(2); // Voltar para o step do formulário de veículo
    
    toast({
      title: "Editando simulação",
      description: "Você pode alterar os dados e fazer uma nova simulação.",
    });
  };
  
  // Função para resetar modal completamente
  const handleCloseModal = () => {
    setCurrentStep(1);
    setTipoSeguro('');
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
    });
    setShowResult(false);
    setSimulationResult(null);
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    try {
      // Validação dos dados antes do envio
      const requiredFields = {
        veiculo: ['marca', 'modelo', 'ano', 'placa', 'uso'],
        residencial: ['tipoImovel', 'area', 'cepResidencia', 'valorImovel'],
        celular: ['marcaCelular', 'modeloCelular', 'corCelular', 'imei']
      };

      const currentRequired = requiredFields[tipoSeguro] || [];
      const missingFields = currentRequired.filter(field => !formData[field]);

      if (missingFields.length > 0) {
        toast({
          title: "Campos obrigatórios",
          description: `Por favor, preencha todos os campos obrigatórios.`,
          variant: "destructive"
        });
        return;
      }

      // Função auxiliar para limpar e converter valores
      const cleanValue = (value: string | number | null | undefined): number => {
        if (!value) return 0;
        // Remove apenas R$, espaços e outros caracteres, mantendo números, vírgulas e pontos
        const cleanedValue = String(value)
          .replace(/[R$\s]/g, '') // Remove R$ e espaços
          .replace(/\./g, '') // Remove pontos de milhares
          .replace(',', '.'); // Converte vírgula decimal para ponto
        return parseFloat(cleanedValue) || 0;
      };

      // Preparar dados para envio
      let simulationData: Record<string, unknown> = {
        type: tipoSeguro,
        dadosPessoais: {
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          cpf: formData.cpf,
        },
        ...formData
      };

      // Adicionar dados específicos por tipo
      if (tipoSeguro === 'veiculo') {
        // Formato esperado pelo backend PostSeguroVeiculoDto - status=0 para simulação
        const vlrVeiculo = cleanValue(formData.valorVeiculo);
        
        // Calcular valor do seguro localmente (simulação)
        // Baseado no cálculo do backend: vlrSeguro = vlrVeiculo * PER_VALOR + vlrVeiculo * IOF
        // Valores típicos: PER_VALOR = 0.05 (5%), IOF = 0.07 (7%)
        const perValor = 0.05; // 5% do valor do veículo
        const iof = 0.07; // 7% do valor do veículo (IOF)
        const vlrSeguroCalculado = (vlrVeiculo * perValor) + (vlrVeiculo * iof);
        const vlrSeguroMensal = vlrSeguroCalculado / 12; // Divide por 12 para valor mensal
        
        console.log('Cálculo do seguro:', {
          vlrVeiculo,
          perValor: `${perValor * 100}%`,
          iof: `${iof * 100}%`,
          vlrSeguroAnual: vlrSeguroCalculado.toFixed(2),
          vlrSeguroMensal: vlrSeguroMensal.toFixed(2)
        });
        
        simulationData = {
          placa: formData.placa,
          idVeiculo: formData.idVeiculo || 1, // Usar o ID do veículo da consulta FIPE
          cpfCliente: formData.cpf.replace(/[^\d]/g, ''), // Remove formatação do CPF, deixa só números
          idSeguro: 1, // ID do tipo de seguro (veículo)
          vlrVeiculo: vlrVeiculo,
          vlrSeguro: Number(vlrSeguroMensal.toFixed(2)), // Adiciona o valor calculado
          qtdMeses: 12, // Quantidade de meses (1 ano)
          status: 0, // Status 0 = apenas simulação, não contrata
          simulationId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // ID único para simulação
        };
        
        console.log(' Dados da simulação de veículo:', simulationData);
      } else if (tipoSeguro === 'celular') {
        const valorAparelho = cleanValue(formData.valorAparelho);
        
        // Calcular valor do seguro de celular localmente
        // Percentuais típicos para seguro de celular:
        // - 8% do valor do aparelho (taxa base)
        // - 7% IOF
        const perValor = 0.08; // 8% do valor do aparelho
        const iof = 0.07; // 7% do valor do aparelho (IOF)
        const vlrSeguroCalculado = (valorAparelho * perValor) + (valorAparelho * iof);
        const vlrSeguroMensal = vlrSeguroCalculado / 12; // Divide por 12 para valor mensal
        
        console.log(' Cálculo do seguro de celular:', {
          valorAparelho,
          perValor: `${perValor * 100}%`,
          iof: `${iof * 100}%`,
          vlrSeguroAnual: vlrSeguroCalculado.toFixed(2),
          vlrSeguroMensal: vlrSeguroMensal.toFixed(2)
        });
        
        // Debug: verificar mapeamento de cor
        console.log('[Celular] formData.corCelular:', formData.corCelular);
        console.log('[Celular] coresCelulares disponíveis:', coresCelulares);
        const corEncontrada = coresCelulares.find(c => String(c.id) === String(formData.corCelular));
        console.log('[Celular] Cor encontrada:', corEncontrada);
        
        simulationData = {
          imei: formData.imei,
          idCelular: formData.idCelular || 1, // ID do celular do catálogo (obrigatório)
          marca: marcasCelulares.find(m => String(m.id) === String(formData.marcaCelular))?.nome || 'Marca Desconhecida',
          modelo: modelosCelulares.find(m => String(m.id) === String(formData.modeloCelular))?.nome || 'Modelo Desconhecido',
          cor: corEncontrada?.nome || formData.corCelular || 'Desconhecido',
          cpfCliente: formData.cpf.replace(/[^\d]/g, ''),
          idSeguro: 2, // ID do tipo de seguro (celular)
          vlrCelular: valorAparelho, // Nome correto do campo no backend
          qtdMeses: 12, // Quantidade de meses (1 ano)
          status: 0, // Status 0 = apenas simulação
          vlrSeguro: Number(vlrSeguroMensal.toFixed(2)),
          simulationId: `sim_cel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
        
        console.log('[Celular] Dados da simulação:', simulationData);
      } else if (tipoSeguro === 'residencial') {
        const valorImovel = cleanValue(formData.valorImovel);
        
        // Calcular valor do seguro residencial localmente
        // Percentuais típicos para seguro residencial:
        // - 0.3% do valor do imóvel (taxa base - geralmente mais baixa que veículo)
        // - 7% IOF
        const perValor = 0.003; // 0.3% do valor do imóvel
        const iof = 0.07; // 7% do valor do imóvel (IOF)
        const vlrSeguroCalculado = (valorImovel * perValor) + (valorImovel * iof * perValor);
        const vlrSeguroMensal = vlrSeguroCalculado / 12; // Divide por 12 para valor mensal
        
        console.log('Cálculo do seguro residencial:', {
          valorImovel,
          perValor: `${perValor * 100}%`,
          iof: `${iof * 100}%`,
          vlrSeguroAnual: vlrSeguroCalculado.toFixed(2),
          vlrSeguroMensal: vlrSeguroMensal.toFixed(2)
        });
        
        // Gerar CIB único: formato CIB{CPF_ultimos_4}{timestamp_curto}
        const cpfNumeros = formData.cpf.replace(/[^\d]/g, '');
        const cibUnico = `CIB${cpfNumeros.slice(-4)}${Date.now().toString().slice(-8)}`;
        
        simulationData = {
          cib: cibUnico, // CIB único gerado
          cpfCliente: cpfNumeros,
          idSeguro: 3, // ID do tipo de seguro (residencial)
          qtdMeses: 12, // Quantidade de meses (1 ano)
          numero: 'S/N', // Número (padrão se não houver)
          complemento: '', // Complemento opcional
          bairro: 'Centro', // Bairro (padrão)
          cidade: 'São Paulo', // Cidade (padrão)
          estado: 'SP', // Estado (padrão)
          cep: formData.cepResidencia?.replace(/[^\d]/g, '') || '00000000',
          areaM2: Number(formData.area) || 0,
          sistemaSeguranca: false, // Sistema de segurança (padrão false)
          vlrImovel: valorImovel,
          vlrSeguro: Number(vlrSeguroMensal.toFixed(2)),
          status: 0, // Status 0 = apenas simulação
          tipoImovel: formData.tipoImovel || 'casa', // Adicionar tipo para referência no resultado
          simulationId: `sim_res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
        
        console.log('[Residencial] Dados da simulação:', simulationData);
      }

      // Para veículos, celulares e residenciais, já calculamos localmente
      let result: any;
      
      if (tipoSeguro === 'veiculo') {
        // Usa o valor já calculado localmente
        result = {
          vlrSeguro: simulationData.vlrSeguro,
          vlrVeiculo: simulationData.vlrVeiculo,
          ...simulationData
        };
        console.log('[Simulação] Usando cálculo local para veículo:', result);
      } else if (tipoSeguro === 'celular') {
        // Usa o valor já calculado localmente
        result = {
          vlrSeguro: simulationData.vlrSeguro,
          vlrCelular: simulationData.vlrCelular, // Usar nome correto do backend
          ...simulationData
        };
        console.log('[Simulação] Usando cálculo local para celular:', result);
      } else if (tipoSeguro === 'residencial') {
        // Usa o valor já calculado localmente
        result = {
          vlrSeguro: simulationData.vlrSeguro,
          valorImovel: simulationData.valorImovel,
          ...simulationData
        };
        console.log('[Simulação] Usando cálculo local para residencial:', result);
      } else {
        toast({
          title: "Tipo de seguro inválido",
          description: "Por favor, selecione um tipo de seguro válido.",
          variant: "destructive"
        });
        return;
      }
      
      console.log('[Resultado] Simulação recebida:', result);
      console.log('[Resultado] Tipo:', typeof result);
      console.log('[Resultado] Keys:', Object.keys(result || {}));
      
      if (result) {
        // Extrair valor do seguro de diferentes formatos possíveis do backend
        let valorCalculado: string | number = 'A calcular';
        
        // Função auxiliar para extrair valor numérico
        const extractValue = (obj: any, keys: string[]): number | null => {
          for (const key of keys) {
            if (obj[key] !== undefined && obj[key] !== null) {
              const val = obj[key];
              // Se for número, retorna direto
              if (typeof val === 'number') return val;
              // Se for string numérica, converte
              if (typeof val === 'string') {
                const parsed = parseFloat(val.replace(/[^\d.-]/g, ''));
                if (!isNaN(parsed)) return parsed;
              }
            }
          }
          return null;
        };
        
        // Lista de possíveis nomes de campos que contêm o valor do seguro
        const possibleValueKeys = [
          'vlrSeguro', 'valorSeguro', 'valor', 'value', 
          'premio', 'valorPremio', 'preco', 'price',
          'vlr_seguro', 'valor_seguro', 'seguro'
        ];
        
        // Tenta extrair valor do resultado direto
        let valorNumerico = extractValue(result, possibleValueKeys);
        
        // Se não encontrou no nível raiz, tenta em propriedades aninhadas
        if (!valorNumerico) {
          console.log('[Extração] Valor não encontrado no nível raiz, procurando em objetos aninhados...');
          
          // Procura em cada propriedade do objeto
          for (const [key, value] of Object.entries(result)) {
            if (value && typeof value === 'object') {
              console.log(`[Extração] Verificando propriedade: ${key}`, value);
              valorNumerico = extractValue(value as any, possibleValueKeys);
              if (valorNumerico) {
                console.log(`[Extração] Valor encontrado em ${key}:`, valorNumerico);
                break;
              }
            }
          }
        }
        
        if (valorNumerico !== null && valorNumerico > 0) {
          valorCalculado = valorNumerico;
          console.log('[Cálculo] Valor extraído:', valorCalculado);
        } else {
          console.warn('[Aviso] Não foi possível extrair valor do resultado');
          console.log('[Resultado] Objeto completo:', JSON.stringify(result, null, 2));
        }
        
        // Guardar resultado da simulação e mostrar tela de confirmação
        setSimulationResult({
          ...result,
          originalData: simulationData, // Guardar dados originais para enviar depois
          formData: { ...formData }, // Guardar dados do formulário
          valorSeguro: valorCalculado
        });
        setShowResult(true);
        
        toast({
          title: "Simulação calculada!",
          description: valorCalculado !== 'A calcular' 
            ? `Valor mensal: R$ ${formatCurrency(valorCalculado)}` 
            : "Confira os valores e confirme sua contratação.",
        });
      } else {
        console.error('[Erro] Resultado da simulação é null ou undefined');
        toast({
          title: "Erro na simulação",
          description: "Não foi possível calcular o valor do seguro. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar simulação",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  };

  const segurosInfo = {
    veiculo: {
      title: 'Seguro Auto',
      description: 'Proteção completa para seu veículo com assistência 24 horas',
      coberturas: [
        'Colisão, roubo e furto',
        'Danos a terceiros',
        'Assistência 24h com guincho',
        'Carro reserva',
        'Vidros e retrovisores',
        'Proteção contra fenômenos naturais'
      ]
    },
    residencial: {
      title: 'Seguro Residencial',
      description: 'Sua casa e família protegidas contra imprevistos',
      coberturas: [
        'Incêndio e raio',
        'Roubo e furto de bens',
        'Danos elétricos',
        'Vazamento de água',
        'Responsabilidade civil',
        'Assistência residencial 24h'
      ]
    },
    celular: {
      title: 'Seguro Celular',
      description: 'Seu smartphone protegido onde você estiver',
      coberturas: [
        'Quebra acidental de tela',
        'Roubo e furto qualificado',
        'Oxidação',
        'Danos elétricos',
        'Aparelho reserva',
        'Cobertura nacional'
      ]
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <FileText className="h-5 w-5" />;
      case 2: return tipoSeguro === 'veiculo' ? <Car className="h-5 w-5" /> : 
                   tipoSeguro === 'residencial' ? <Home className="h-5 w-5" /> : 
                   <Smartphone className="h-5 w-5" />;
      case 3: return <User className="h-5 w-5" />;
      case 4: return tipoSeguro === 'veiculo' ? <Car className="h-5 w-5" /> : 
                   tipoSeguro === 'residencial' ? <Home className="h-5 w-5" /> : 
                   <Smartphone className="h-5 w-5" />;
      default: return null;
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Tipo de Seguro';
      case 2: return 'Coberturas';
      case 3: return 'Dados Pessoais';
      case 4: return tipoSeguro === 'veiculo' ? 'Dados do Veículo' : 
                   tipoSeguro === 'residencial' ? 'Dados Residencial' : 
                   'Dados Celular';
      default: return '';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Escolha o tipo de seguro</h3>
              <p className="text-muted-foreground">Selecione o seguro que deseja simular</p>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Novidades:</strong> Agora consultamos automaticamente a tabela FIPE oficial para 
                  buscar valores reais dos veículos, além do nosso catálogo completo de marcas, modelos e celulares!
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg ${tipoSeguro === 'veiculo' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setTipoSeguro('veiculo')}
              >
                <CardContent className="p-6 text-center space-y-3">
                  <Car className="h-12 w-12 mx-auto text-primary" />
                  <h4 className="font-semibold">Seguro Auto</h4>
                  <p className="text-sm text-muted-foreground">Proteção completa para seu veículo</p>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg ${tipoSeguro === 'residencial' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setTipoSeguro('residencial')}
              >
                <CardContent className="p-6 text-center space-y-3">
                  <Home className="h-12 w-12 mx-auto text-primary" />
                  <h4 className="font-semibold">Seguro Residencial</h4>
                  <p className="text-sm text-muted-foreground">Sua casa protegida</p>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg ${tipoSeguro === 'celular' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setTipoSeguro('celular')}
              >
                <CardContent className="p-6 text-center space-y-3">
                  <Smartphone className="h-12 w-12 mx-auto text-primary" />
                  <h4 className="font-semibold">Seguro Celular</h4>
                  <p className="text-sm text-muted-foreground">Proteja seu smartphone</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 2: {
        if (!tipoSeguro) return null;
        const seguroInfo = segurosInfo[tipoSeguro];
        return (
          <div className="space-y-6">
            <div className="text-center">
              {tipoSeguro === 'veiculo' && <Car className="h-16 w-16 mx-auto text-primary mb-4" />}
              {tipoSeguro === 'residencial' && <Home className="h-16 w-16 mx-auto text-primary mb-4" />}
              {tipoSeguro === 'celular' && <Smartphone className="h-16 w-16 mx-auto text-primary mb-4" />}
              <h3 className="text-2xl font-bold mb-2">{seguroInfo.title}</h3>
              <p className="text-muted-foreground">{seguroInfo.description}</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Coberturas Incluídas</CardTitle>
                <CardDescription>Veja tudo que está protegido</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {seguroInfo.coberturas.map((cobertura, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{cobertura}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        );
      }

      case 3: {
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Digite seu nome completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
          </div>
        );
      }

      case 4: {
        if (tipoSeguro === 'veiculo') {
          return (
            <div className="space-y-4" onClick={(e) => e.stopPropagation()} onClickCapture={(e) => {
              // Previne propagação de cliques que possam causar navegação
              const target = e.target as HTMLElement;
              if (target.closest('[role="option"]') || target.closest('[data-radix-select-item]')) {
                console.log('[Select] Click em item detectado e controlado');
              }
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca *</Label>
                  <Select disabled={!isAuthenticated || loadingCatalog.marcas} value={formData.marca || ''} onValueChange={(value) => handleInputChange('marca', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={!isAuthenticated ? 'Faça login para carregar marcas' : (loadingCatalog.marcas ? 'Carregando marcas...' : 'Selecione a marca')} />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={5}>
                      {marcas.map((m) => (
                        <SelectItem key={String(m.id)} value={String(m.id)}>{m.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo *</Label>
                  <Select disabled={!isAuthenticated || !formData.marca || loadingCatalog.modelos} value={formData.modelo || ''} onValueChange={(value) => handleInputChange('modelo', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={!isAuthenticated ? 'Faça login primeiro' : (!formData.marca ? 'Selecione a marca primeiro' : (loadingCatalog.modelos ? 'Carregando modelos...' : 'Selecione o modelo'))} />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={5}>
                      {modelos.map((m) => (
                        <SelectItem key={String(m.id)} value={String(m.id)}>{m.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ano">Ano *</Label>
                  <Select disabled={!isAuthenticated || !formData.modelo || loadingCatalog.anos || anos.length === 0} value={formData.ano || ''} onValueChange={(value) => handleInputChange('ano', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={!isAuthenticated ? 'Faça login primeiro' : (!formData.modelo ? 'Selecione o modelo primeiro' : (loadingCatalog.anos ? 'Carregando anos...' : (anos.length ? 'Ano do veículo' : 'Nenhum ano disponível')))} />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={5}>
                      {anos.map((a) => (
                        <SelectItem key={String(a.id)} value={String(a.id)}>{a.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="placa">Placa *</Label>
                  <Input
                    id="placa"
                    value={formData.placa || ''}
                    onChange={(e) => handleInputChange('placa', e.target.value.toUpperCase())}
                    placeholder="ABC-1234"
                    maxLength={8}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="valor-veiculo">Valor do Veículo (FIPE)</Label>
                  <Input
                    id="valor-veiculo"
                    value={formData.valorVeiculo ? `R$ ${formatCurrency(formData.valorVeiculo)}` : ''}
                    onChange={(e) => handleInputChange('valorVeiculo', e.target.value)}
                    placeholder="Consultando FIPE..."
                    readOnly
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    * Valor consultado automaticamente na tabela FIPE oficial
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="uso">Uso do veículo *</Label>
                  <Select value={String(formData.uso || '')} onValueChange={(value) => handleInputChange('uso', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Como usa o veículo?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="particular">Particular</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                      <SelectItem value="uber">Uber/99</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          );
        } else if (tipoSeguro === 'residencial') {
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo-imovel">Tipo do Imóvel *</Label>
                  <Select onValueChange={(value) => handleInputChange('tipoImovel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casa">Casa</SelectItem>
                      <SelectItem value="apartamento">Apartamento</SelectItem>
                      <SelectItem value="sobrado">Sobrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="area">Área (m²) *</Label>
                  <Input
                    id="area"
                    value={formData.area || ''}
                    onChange={(e) => handleInputChange('area', e.target.value)}
                    placeholder="Ex: 120"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cep-residencia">CEP *</Label>
                  <Input
                    id="cep-residencia"
                    value={formData.cepResidencia || ''}
                    onChange={(e) => handleInputChange('cepResidencia', e.target.value)}
                    placeholder="00000-000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="valor-imovel">Valor do Imóvel *</Label>
                  <Input
                    id="valor-imovel"
                    value={formData.valorImovel || ''}
                    onChange={(e) => handleInputChange('valorImovel', e.target.value)}
                    placeholder="R$ 500.000"
                  />
                </div>
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marca-celular">Marca *</Label>
                  <Select 
                    disabled={!isAuthenticated || loadingCelulares.marcas} 
                    value={formData.marcaCelular || undefined} 
                    onValueChange={(value) => {
                      if (value && value !== '') {
                        handleInputChange('marcaCelular', value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !isAuthenticated ? 'Faça login para carregar marcas' : 
                        loadingCelulares.marcas ? 'Carregando marcas...' : 
                        'Selecione a marca'
                      } />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={5}>
                      {marcasCelulares.filter(m => m.id && m.id !== '').map((m) => (
                        <SelectItem 
                          key={String(m.id)} 
                          value={String(m.id)}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          {m.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="modelo-celular">Modelo *</Label>
                  <Select 
                    disabled={!isAuthenticated || !formData.marcaCelular || loadingCelulares.modelos} 
                    value={formData.modeloCelular || undefined} 
                    onValueChange={(value) => {
                      if (value && value !== '') {
                        handleInputChange('modeloCelular', value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !isAuthenticated ? 'Faça login primeiro' : 
                        !formData.marcaCelular ? 'Selecione a marca primeiro' : 
                        loadingCelulares.modelos ? 'Carregando modelos...' : 
                        'Selecione o modelo'
                      } />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={5}>
                      {modelosCelulares.filter(m => m.id && m.id !== '').map((m) => (
                        <SelectItem 
                          key={String(m.id)} 
                          value={String(m.id)}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          {m.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cor-celular">Cor *</Label>
                  <Select 
                    disabled={!isAuthenticated || !formData.modeloCelular || loadingCelulares.cores || coresCelulares.length === 0} 
                    value={formData.corCelular || undefined} 
                    onValueChange={(value) => {
                      if (value && value !== '') {
                        handleInputChange('corCelular', value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !isAuthenticated ? 'Faça login primeiro' : 
                        !formData.modeloCelular ? 'Selecione o modelo primeiro' : 
                        loadingCelulares.cores ? 'Carregando cores...' : 
                        coresCelulares.length ? 'Selecione a cor' : 'Nenhuma cor disponível'
                      } />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={5}>
                      {coresCelulares.filter(c => c.id && c.id !== '').map((c) => (
                        <SelectItem 
                          key={String(c.id)} 
                          value={String(c.id)}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imei">IMEI *</Label>
                  <Input
                    id="imei"
                    value={formData.imei || ''}
                    onChange={(e) => handleInputChange('imei', e.target.value)}
                    placeholder="123456789012345"
                    maxLength={15}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="valor-aparelho">Valor do Aparelho</Label>
                  <Input
                    id="valor-aparelho"
                    value={formData.valorAparelho || ''}
                    onChange={(e) => handleInputChange('valorAparelho', e.target.value)}
                    placeholder="R$ 3.500"
                    readOnly
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    * Valor será calculado automaticamente baseado no modelo selecionado
                  </p>
                </div>
              </div>
            </div>
          );
        }
        return null;
      }

      default:
        return null;
    }
  };

  return (
    <>
      {/* Overlay invisível para prevenir cliques no header/links quando modal estiver aberto */}
      {open && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40,
            pointerEvents: 'none'
          }}
        />
      )}
      
      <Dialog open={open} onOpenChange={handleCloseModal} modal={true}>
        <DialogContent 
          className="max-w-2xl max-h-[90vh] overflow-y-auto" 
          style={{ zIndex: 60 }}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            // Previne fechamento quando interagir com selects
            const target = e.target as HTMLElement;
            if (target.closest('[role="listbox"]') || target.closest('[data-radix-select-content]')) {
              e.preventDefault();
            }
          }}
        >
        {/* Tela de Resultado da Simulação */}
        {showResult && simulationResult ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                Resultado da Simulação
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Card com valor do seguro */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Valor do Seu Seguro
                  </h3>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
                    R$ {formatCurrency(simulationResult.valorSeguro)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Valor mensal do seguro calculado
                  </p>
                </div>
              </div>

              {/* Resumo dos dados */}
              <div className="space-y-4">
                <h4 className="font-semibold">Resumo da Proposta:</h4>
                
                {tipoSeguro === 'veiculo' && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Veículo:</span>
                      <p className="font-medium">
                        {marcas.find(m => String(m.id) === String(simulationResult.formData.marca))?.nome} {' '}
                        {modelos.find(m => String(m.id) === String(simulationResult.formData.modelo))?.nome} {' '}
                        {simulationResult.formData.ano}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Placa:</span>
                      <p className="font-medium">{simulationResult.formData.placa}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Valor FIPE:</span>
                      <p className="font-medium">R$ {formatCurrency(simulationResult.formData.valorVeiculo)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Uso:</span>
                      <p className="font-medium">{simulationResult.formData.uso}</p>
                    </div>
                  </div>
                )}

                {tipoSeguro === 'celular' && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Aparelho:</span>
                      <p className="font-medium">
                        {marcasCelulares.find(m => String(m.id) === String(simulationResult.formData.marcaCelular))?.nome} {' '}
                        {modelosCelulares.find(m => String(m.id) === String(simulationResult.formData.modeloCelular))?.nome}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cor:</span>
                      <p className="font-medium">
                        {coresCelulares.find(c => String(c.id) === String(simulationResult.formData.corCelular))?.nome}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">IMEI:</span>
                      <p className="font-medium">{simulationResult.formData.imei}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Valor do Aparelho:</span>
                      <p className="font-medium">R$ {formatCurrency(simulationResult.formData.valorAparelho)}</p>
                    </div>
                  </div>
                )}

                {tipoSeguro === 'residencial' && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tipo de Imóvel:</span>
                      <p className="font-medium capitalize">{simulationResult.formData.tipoImovel}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Área:</span>
                      <p className="font-medium">{simulationResult.formData.area} m²</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">CEP:</span>
                      <p className="font-medium">{simulationResult.formData.cepResidencia}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Valor do Imóvel:</span>
                      <p className="font-medium">R$ {formatCurrency(simulationResult.formData.valorImovel)}</p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <span className="text-muted-foreground">Cliente:</span>
                  <p className="font-medium">
                    {simulationResult.formData.nome} - {simulationResult.formData.cpf}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {simulationResult.formData.email} • {simulationResult.formData.telefone}
                  </p>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-col gap-3 pt-4">
                {/* Primeira linha: Editar e Aceitar */}
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleRejectContract}
                    disabled={contractingLoading}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Simulação
                  </Button>
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={handleAcceptContract}
                    disabled={contractingLoading}
                  >
                    {contractingLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Contratando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aceitar e Contratar
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Segunda linha: Recusar */}
                <Button 
                  variant="ghost" 
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setShowResult(false);
                    setSimulationResult(null);
                    handleCloseModal();
                    toast({
                      title: "Simulação cancelada",
                      description: "Você pode fazer uma nova simulação a qualquer momento.",
                    });
                  }}
                  disabled={contractingLoading}
                >
                  Recusar Proposta
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Tela Normal de Simulação */
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getStepIcon(currentStep)}
                Simulação de Seguro {tipoSeguro ? (tipoSeguro === 'veiculo' ? 'Veicular' : tipoSeguro === 'residencial' ? 'Residencial' : 'Celular') : ''}
              </DialogTitle>
            </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Passo {currentStep} de {totalSteps}</span>
              <span>{Math.round(progress)}% completo</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Steps Navigation */}
          <div className="flex justify-between">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`flex items-center space-x-2 ${
                  i + 1 <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    i + 1 <= currentStep
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted'
                  }`}
                >
                  {i + 1 <= currentStep ? (
                    getStepIcon(i + 1)
                  ) : (
                    <span className="text-sm">{i + 1}</span>
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {getStepTitle(i + 1)}
                </span>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            {currentStep < totalSteps ? (
              <Button onClick={handleNextStep}>
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={currentLoading}>
                {currentLoading ? 'Calculando...' : 'Calcular Seguro'}
              </Button>
            )}
          </div>
        </div>
          </>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}