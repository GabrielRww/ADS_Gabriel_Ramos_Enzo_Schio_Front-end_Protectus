import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import {
  getMarcasVeiculos,
  getModelosVeiculos,
  getAnosVeiculos,
  getMarcasCelulares,
  getModelosCelulares,
  getVeiculo,
  createSeguroVeiculo,
  createSeguroCelular,
  createSeguroImovel,
  updateSeguroVeiculoStatus,
  updateSeguroCelularStatus,
  updateSeguroImovelStatus,
  getCelular
} from '@/service';

// ======== TIPOS E INTERFACES ========

export interface FormData {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  marca?: string;
  modelo?: string;
  ano?: string;
  placa?: string;
  uso?: string;
  valorVeiculo?: string;
  idVeiculo?: number;
  marcaCelular?: string;
  modeloCelular?: string;
  imei?: string;
  idCelular?: number;
  tipoImovel?: string;
  area?: string;
  cepResidencia?: string;
  valorImovel?: string;
  valorCelular?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  [key: string]: string | number | undefined;
}

export interface CatalogItem {
  id?: string;
  nome?: string | { descricao?: string; name?: string; valor?: string };
  codigo?: string;
  valor?: string;
  marca?: string;
  modelo?: string | { descricao?: string; name?: string };
  ano?: string;
  cor?: string;
  value?: string;
  cod?: string;
  [key: string]: unknown;
}

export interface SimulationResult {
  id?: string;
  valor?: number;
  premio?: number;
  valorPremio?: number;
  valorBem?: number;
  vlrSeguro?: number;
  detalhes?: Record<string, unknown>;
  originalData?: FormData;
  formData?: FormData;
}

export interface LoadingStates {
  marcas: boolean;
  modelos: boolean;
  anos: boolean;
}

// ======== CUSTOM HOOK ========

export function useSimulacaoLogic(
  tipoSeguro: 'veiculo' | 'residencial' | 'celular' | '',
  open: boolean
) {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  // ======== ESTADOS ========

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
  });

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [contractingLoading, setContractingLoading] = useState(false);

  // Estados de catálogo
  const [marcas, setMarcas] = useState<{ id: string; nome: string }[]>([]);
  const [modelos, setModelos] = useState<{ id: string; nome: string }[]>([]);
  const [anos, setAnos] = useState<{ id: string; nome: string }[]>([]);
  const [marcasCelulares, setMarcasCelulares] = useState<{ id: string; nome: string }[]>([]);
  const [modelosCelulares, setModelosCelulares] = useState<{ id: string; nome: string }[]>([]);
  // Estado de cores removido - API não existe

  const [loadingCatalog, setLoadingCatalog] = useState<LoadingStates>({
    marcas: false,
    modelos: false,
    anos: false,
  });

  const [loadingCelulares, setLoadingCelulares] = useState<LoadingStates>({
    marcas: false,
    modelos: false,
    anos: false, // Reutilizamos 'anos' como placeholder para cores
  });

  // ======== LOADING STATES ========
  const [isLoading, setIsLoading] = useState(false);

  // ======== COMPUTED VALUES ========

  const currentLoading = isLoading;

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // ======== UTILITÁRIOS ========

  const formatCurrency = (value: string | number | null | undefined): string => {
    if (!value || value === 'A calcular') return 'A calcular';

    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) return 'A calcular';

    return numValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const cleanValue = (value: string | number | null | undefined): number => {
    if (!value) return 0;
    const cleanedValue = String(value)
      .replace(/[R$\s]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    return parseFloat(cleanedValue) || 0;
  };

  const toOption = (m: CatalogItem, index?: number): { id: string; nome: string } => {
    if (typeof m === 'string') {
      return { id: String(index !== undefined ? index + 1 : m), nome: m };
    }

    if (m && typeof m === 'object') {
      const nomeValue = m.nome || m.descricao || m.name || m.label || m.value || String(m.id || index);
      const idValue = m.id || m.codigo || m.cod || m.value || String(index !== undefined ? index + 1 : '');

      return {
        id: String(idValue),
        nome: typeof nomeValue === 'string' ? nomeValue : String(nomeValue)
      };
    }

    return { id: String(index || ''), nome: String(m) };
  };

  // ======== HANDLERS ========

  const handleInputChange = (field: string, value: string) => {


    try {
      if (window.event) {
        window.event.stopPropagation?.();
        window.event.preventDefault?.();
      }
    } catch (e) {
      // Ignora erros
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
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

  const handleAcceptContract = async (status: number) => {
    if (!simulationResult?.originalData) return;

    setContractingLoading(true);
    try {




      let result;

      if (tipoSeguro === 'veiculo') {
        const statusData = {
          placa: simulationResult.originalData.placa,
          status
        };

        result = await updateSeguroVeiculoStatus(statusData);

      } else if (tipoSeguro === 'celular') {
        const statusData = {
          imei: simulationResult.originalData.imei,
          status
        };

        result = await updateSeguroCelularStatus(statusData);

      } else if (tipoSeguro === 'residencial') {
        const statusData = {
          cib: String(simulationResult.originalData.cib),
          status
        };

        result = await updateSeguroImovelStatus(statusData);

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

        return true;
      } else {
        toast({
          title: "Erro na contratação",
          description: "Não foi possível finalizar a contratação. Tente novamente.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Erro na contratação:', error);
      toast({
        title: "Erro na contratação",
        description: "Ocorreu um erro ao finalizar a contratação.",
        variant: "destructive"
      });
      return false;
    } finally {
      setContractingLoading(false);
    }
  };

  const handleRejectContract = () => {
    setShowResult(false);
    setSimulationResult(null);
    setCurrentStep(2);

    toast({
      title: "Editando simulação",
      description: "Você pode alterar os dados e fazer uma nova simulação.",
    });
  };

  const handleReset = () => {
    setCurrentStep(1);
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
    });
    setShowResult(false);
    setSimulationResult(null);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const requiredFields = {
        veiculo: ['marca', 'modelo', 'ano', 'placa', 'uso'],
        residencial: ['tipoImovel', 'area', 'cepResidencia', 'valorImovel', 'endereco', 'numero', 'bairro', 'cidade', 'estado'],
        celular: ['marcaCelular', 'modeloCelular', 'imei']
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

      if (tipoSeguro === 'veiculo') {
        const vlrVeiculo = cleanValue(formData.valorVeiculo);
        simulationData = {
          placa: formData.placa,
          idVeiculo: formData.idVeiculo || 1,
          cpfCliente: formData.cpf.replace(/[^\d]/g, ''),
          idSeguro: 1,
          vlrVeiculo: vlrVeiculo,
          qtdMeses: 12,
          status: 0,
          simulationId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };


        const result = await createSeguroVeiculo(simulationData);

        if (result) {

          setSimulationResult({
            ...result,
            originalData: simulationData as FormData
          });
          setShowResult(true);
          setCurrentStep(totalSteps);
        }

      } else if (tipoSeguro === 'celular') {
        const valorAparelho = cleanValue(formData.valorCelular);



        const { simulationId, valorCelular: _, ...cleanData } = {
          ...formData,
          simulationId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };

        simulationData = {
          imei: formData.imei,
          idCelular: formData.idCelular,
          cpfCliente: formData.cpf.replace(/[^\d]/g, ''),
          idSeguro: 2,
          marca: marcasCelulares.find(m => String(m.id) === String(formData.marcaCelular))?.nome || '',
          modelo: modelosCelulares.find(m => String(m.id) === String(formData.modeloCelular))?.nome || '',
          vlrCelular: valorAparelho,
          qtdMeses: 12,
          status: 0,
        };


        const result = await createSeguroCelular(simulationData);

        if (result) {

          setSimulationResult({
            ...result,
            originalData: simulationData as FormData
          });
          setShowResult(true);
          setCurrentStep(totalSteps);
        }

      } else if (tipoSeguro === 'residencial') {
        const vlrImovel = cleanValue(formData.valorImovel);
        const area = parseFloat(formData.area || '0');
        const cepLimpo = formData.cepResidencia?.replace(/[^\d]/g, '') || '';

        // CIB mais curto para evitar erro de 20 caracteres
        const timestamp = Date.now().toString().slice(-8); // Últimos 8 dígitos
        const random = Math.random().toString(36).substr(2, 4).toUpperCase(); // 4 caracteres
        const cib = `IM${timestamp}${random}`; // IM + 8 + 4 = 14 caracteres

        simulationData = {
          cib: cib,
          cpfCliente: formData.cpf.replace(/[^\d]/g, ''),
          idSeguro: 3,
          tipoImovel: (formData.tipoImovel || 'casa').substring(0, 20), // Máximo 20 chars
          vlrImovel: vlrImovel,
          areaM2: area,
          endereco: (formData.endereco?.trim() || '').substring(0, 20), // Máximo 20 chars
          numero: (formData.numero?.trim() || '').substring(0, 20), // Máximo 20 chars
          bairro: (formData.bairro?.trim() || '').substring(0, 20), // Máximo 20 chars
          cidade: (formData.cidade?.trim() || '').substring(0, 20), // Máximo 20 chars
          estado: (formData.estado?.trim() || '').substring(0, 20), // Máximo 20 chars
          cep: cepLimpo,
          qtdMeses: 12,
          status: 0,
        };


        try {
          const result = await createSeguroImovel(simulationData);


          if (result) {

            setSimulationResult({
              ...result,
              originalData: simulationData as FormData
            });
            setShowResult(true);
            setCurrentStep(totalSteps);
          }
        } catch (residentialError) {
          console.error('[Residencial] Erro específico:', residentialError);
          throw residentialError; // Re-throw para ser capturado pelo catch principal
        }
      }

    } catch (error) {
      console.error('[Simulação] Erro:', error);
      toast({
        title: "Erro na simulação",
        description: "Ocorreu um erro ao processar a simulação.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ======== EFEITOS DE CARREGAMENTO DE CATÁLOGOS ========

  // Preencher dados do usuário logado
  useEffect(() => {
    if (isAuthenticated && user && open) {
      // Só preenche se os campos estão vazios
      setFormData(prev => ({
        ...prev,
        nome: prev.nome || user.nome || '',
        email: prev.email || user.email || '',
        telefone: prev.telefone || user.telefone || '',
        cpf: prev.cpf || user.cpf || '',
      }));
    }
  }, [isAuthenticated, user, open]);

  // Carregar marcas de veículos
  useEffect(() => {
    if (tipoSeguro !== 'veiculo' || !isAuthenticated) return;

    (async () => {
      try {
        setLoadingCatalog(s => ({ ...s, marcas: true }));
        const resp = await getMarcasVeiculos();

        if (resp) {
          const raw = resp;
          const arr = Array.isArray(raw) ? raw :
            Array.isArray(raw?.marcas) ? raw.marcas :
              Array.isArray(raw?.data) ? raw.data : [];

          const mapped = arr.map((item: any, index: number) => toOption(item, index));
          setMarcas(mapped);
        } else {
          setMarcas([]);
        }
      } catch (e) {
        console.error('Erro ao carregar marcas:', e);
        setMarcas([]);
      } finally {
        setLoadingCatalog(s => ({ ...s, marcas: false }));
      }
    })();
  }, [tipoSeguro, isAuthenticated]);

  // Carregar modelos quando selecionar marca
  useEffect(() => {
    const marca = formData.marca;
    if (tipoSeguro !== 'veiculo' || !marca || !isAuthenticated) {
      setModelos([]);
      return;
    }

    (async () => {
      try {
        setLoadingCatalog(s => ({ ...s, modelos: true }));
        const marcaNome = marcas.find(m => String(m.id) === String(marca))?.nome || String(marca);

        const resp = await getModelosVeiculos({ marca: String(marcaNome) });

        if (resp) {
          const raw = resp;
          let modelosArray: unknown[] = [];

          if (raw && typeof raw === 'object' && 'modelos' in raw && Array.isArray(raw.modelos)) {
            modelosArray = raw.modelos;
          } else if (Array.isArray(raw)) {
            modelosArray = raw;
          }

          const mapped = modelosArray.map((modelo: unknown, index: number) => {
            if (typeof modelo === 'string') {
              return { id: String(index + 1), nome: modelo };
            }

            if (typeof modelo === 'object' && modelo !== null) {
              const obj = modelo as Record<string, unknown>;
              const nome = obj.nome || obj.modelo || obj.name || String(obj.id || index + 1);
              return {
                id: String(obj.id || obj.codigo || index + 1),
                nome: String(nome)
              };
            }

            return { id: String(index + 1), nome: String(modelo) };
          });

          setModelos(mapped);
        } else {
          setModelos([]);
        }

        setFormData(prev => ({
          ...prev,
          modelo: '',
          ano: '',
          valorVeiculo: '',
          idVeiculo: 1
        }));
        setAnos([]);
      } catch (e) {
        console.error('Erro ao carregar modelos:', e);
        setModelos([]);
      } finally {
        setLoadingCatalog(s => ({ ...s, modelos: false }));
      }
    })();
  }, [formData.marca, tipoSeguro, isAuthenticated, marcas]);

  // Carregar anos quando selecionar modelo
  useEffect(() => {
    const marca = formData.marca;
    const modelo = formData.modelo;
    if (tipoSeguro !== 'veiculo' || !marca || !modelo || !isAuthenticated) {
      setAnos([]);
      return;
    }

    (async () => {
      try {
        setLoadingCatalog(s => ({ ...s, anos: true }));
        const marcaNome = marcas.find(m => String(m.id) === String(marca))?.nome || String(marca);
        const modeloNome = modelos.find(m => String(m.id) === String(modelo))?.nome || String(modelo);

        const resp = await getAnosVeiculos({ marca: String(marcaNome), modelo: String(modeloNome) });

        if (resp) {
          const raw = resp;
          let anosArray: unknown[] = [];

          if (raw && typeof raw === 'object' && 'anos' in raw && Array.isArray(raw.anos)) {
            anosArray = raw.anos;
          } else if (Array.isArray(raw)) {
            anosArray = raw;
          }

          const mapped = anosArray.map((ano: unknown, index: number) => {
            if (typeof ano === 'number' || typeof ano === 'string') {
              return { id: String(ano), nome: String(ano) };
            }

            if (typeof ano === 'object' && ano !== null) {
              const obj = ano as Record<string, unknown>;
              const anoValue = obj.ano || obj.year || obj.valor || String(obj.id || index + 1);
              return { id: String(anoValue), nome: String(anoValue) };
            }

            return { id: String(index + 1), nome: String(ano) };
          });

          setAnos(mapped);
        } else {
          setAnos([]);
        }

        setFormData(prev => ({
          ...prev,
          ano: '',
          valorVeiculo: '',
          idVeiculo: 1
        }));
      } catch (e) {
        console.error('Erro ao carregar anos:', e);
        setAnos([]);
      } finally {
        setLoadingCatalog(s => ({ ...s, anos: false }));
      }
    })();
  }, [formData.modelo, tipoSeguro, isAuthenticated, marcas, modelos]);

  // Carregar marcas de celulares
  useEffect(() => {
    if (tipoSeguro !== 'celular' || !isAuthenticated) return;

    (async () => {
      try {
        setLoadingCelulares(s => ({ ...s, marcas: true }));
        const resp = await getMarcasCelulares();

        if (resp) {
          const raw = resp;
          const arr = Array.isArray(raw) ? raw :
            Array.isArray(raw?.marcas) ? raw.marcas :
              Array.isArray(raw?.data) ? raw.data : [];

          const mapped = arr.map((item: any, index: number) => toOption(item, index));
          setMarcasCelulares(mapped);
        } else {
          setMarcasCelulares([]);
        }
      } catch (e) {
        console.error('Erro ao carregar marcas de celulares:', e);
        setMarcasCelulares([]);
      } finally {
        setLoadingCelulares(s => ({ ...s, marcas: false }));
      }
    })();
  }, [tipoSeguro, isAuthenticated]);

  // Carregar modelos de celulares
  useEffect(() => {
    const marcaCelular = formData.marcaCelular;
    if (tipoSeguro !== 'celular' || !marcaCelular || !isAuthenticated) {
      setModelosCelulares([]);
      return;
    }

    (async () => {
      try {
        setLoadingCelulares(s => ({ ...s, modelos: true }));
        const marcaNome = marcasCelulares.find(m => String(m.id) === String(marcaCelular))?.nome || String(marcaCelular);

        const resp = await getModelosCelulares({ marca: String(marcaNome) });

        if (resp) {
          const raw = resp;
          const arr = Array.isArray(raw) ? raw :
            Array.isArray(raw?.modelos) ? raw.modelos :
              Array.isArray(raw?.data) ? raw.data : [];

          const mapped = arr.map((item: any, index: number) => toOption(item, index));
          setModelosCelulares(mapped);
        } else {
          setModelosCelulares([]);
        }

        setFormData(prev => ({ ...prev, modeloCelular: '' }));
      } catch (e) {
        console.error('Erro ao carregar modelos de celulares:', e);
        setModelosCelulares([]);
      } finally {
        setLoadingCelulares(s => ({ ...s, modelos: false }));
      }
    })();
  }, [formData.marcaCelular, tipoSeguro, isAuthenticated, marcasCelulares]);

  // APIs de cores e valor do aparelho não existem - removidas

  // Memoizar toast para evitar re-renders desnecessários
  const memoizedToast = useCallback(toast, [toast]);

  // Buscar valor do veículo FIPE quando marca, modelo e ano estiverem selecionados
  useEffect(() => {
    const marca = formData.marca;
    const modelo = formData.modelo;
    const ano = formData.ano;

    if (tipoSeguro === 'veiculo' && marca && modelo && ano && isAuthenticated) {

      // Limpa valor anterior quando mudam os dados
      setFormData(prev => ({
        ...prev,
        valorVeiculo: '',
        idVeiculo: 1
      }));

      (async () => {
        try {
          const marcaNome = marcas.find(m => String(m.id) === String(marca))?.nome || String(marca);
          const modeloNome = modelos.find(m => String(m.id) === String(modelo))?.nome || String(modelo);
          const anoNumero = Number(ano);



          const resp = await getVeiculo({ marca: marcaNome, modelo: modeloNome, ano: anoNumero });

          if (resp?.valor) {
            const valorFormatado = (resp.valor);
            setFormData(prev => ({
              ...prev,
              valorVeiculo: valorFormatado,
              idVeiculo: resp.idVeiculo || 1
            }));

            memoizedToast({
              title: "Valor FIPE carregado",
              description: `${marcaNome} ${modeloNome} ${ano}: R$ ${valorFormatado}`,
            });
          } else {

            setFormData(prev => ({
              ...prev,
              valorVeiculo: '',
              idVeiculo: 1
            }));
          }
        } catch (error) {
          console.error('Erro ao buscar valor FIPE:', error);
          setFormData(prev => ({
            ...prev,
            valorVeiculo: '',
            idVeiculo: 1
          }));
        }
      })();
    }
  }, [formData.marca, formData.modelo, formData.ano, tipoSeguro, isAuthenticated, marcas, modelos, memoizedToast]);

  // Buscar valor do celular quando marca e modelo estiverem selecionados
  useEffect(() => {

    const marca = formData.marcaCelular;
    const modelo = formData.modeloCelular;

    if (tipoSeguro === 'celular' && marca && modelo && isAuthenticated) {

      // Limpa valor anterior quando mudam os dados
      setFormData(prev => ({
        ...prev,
        valorCelular: '',
        idCelular: 0
      }));

      (async () => {
        try {
          const marcaNome = marcasCelulares.find(m => String(m.id) === String(marca))?.nome || String(marca);
          const modeloNome = modelosCelulares.find(m => String(m.id) === String(modelo))?.nome || String(modelo);


          const resp = await getCelular({ marca: marcaNome, modelo: modeloNome, });


          if (resp && resp.valor) {
            const valorFormatado = (resp.valor);


            setFormData(prev => ({
              ...prev,
              valorCelular: valorFormatado,
              idCelular: resp.idCelular
            }));

          } else {

            setFormData(prev => ({
              ...prev,
              valorCelular: '',
              idCelular: 0
            }));
          }
        } catch (error) {
          console.error('Erro ao buscar valor:', error);
          setFormData(prev => ({
            ...prev,
            valorVeiculo: '',
            idCelular: 0
          }));
        }
      })();
    }
  }, [formData.marcaCelular, formData.modeloCelular, tipoSeguro, isAuthenticated, marcasCelulares, modelosCelulares]);

  // Nota: Busca de valor do celular foi removida - deve ser calculado localmente ou adicionado ao backend

  // ======== RETORNO ========
  return {
    // Estados
    currentStep,
    formData,
    simulationResult,
    showResult,
    contractingLoading,
    currentLoading,
    progress,
    totalSteps,

    // Catálogos
    marcas,
    modelos,
    anos,
    marcasCelulares,
    modelosCelulares,
    // coresCelulares removido - API não existe
    loadingCatalog,
    loadingCelulares,

    // Handlers
    handleInputChange,
    handleNextStep,
    handlePrevStep,
    handleSubmit,
    handleAcceptContract,
    handleRejectContract,
    handleReset,

    // Utilitários
    formatCurrency,
  };
}
