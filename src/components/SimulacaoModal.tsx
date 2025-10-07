import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSimulation } from '@/hooks/useApi';
import { ChevronLeft, ChevronRight, User, FileText, Car, Home, Smartphone, CheckCircle } from 'lucide-react';
import { apiService } from '@/lib/api';

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
  [key: string]: string;
}

export default function SimulacaoModal({ open, onOpenChange, tipoSeguro: initialTipoSeguro }: SimulacaoModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [tipoSeguro, setTipoSeguro] = useState<'veiculo' | 'residencial' | 'celular' | ''>('');
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
  });
  const { toast } = useToast();
  const { simulate, loading: simulationLoading } = useSimulation();
  // Catálogo veicular dinâmico
  const [marcas, setMarcas] = useState<Array<{ id: string | number; nome: string }>>([]);
  const [modelos, setModelos] = useState<Array<{ id: string | number; nome: string }>>([]);
  const [anos, setAnos] = useState<Array<{ id: string | number; nome: string }>>([]);
  const [loadingCatalog, setLoadingCatalog] = useState({ marcas: false, modelos: false, anos: false });

  useEffect(() => {
    if (!open) return;
    // Carregar marcas ao abrir o modal
    (async () => {
      try {
        setLoadingCatalog((s) => ({ ...s, marcas: true }));
        const resp = await apiService.getMarcas();
        if (resp.success && Array.isArray(resp.data)) {
          const mapped = resp.data.map((m: any) => ({ id: m.id ?? m.value ?? m.codigo ?? m.cod ?? m.sigla ?? String(m), nome: m.nome ?? m.label ?? m.descricao ?? m.name ?? String(m) }));
          setMarcas(mapped);
        } else {
          setMarcas([]);
        }
      } catch (e) {
        setMarcas([]);
      } finally {
        setLoadingCatalog((s) => ({ ...s, marcas: false }));
      }
    })();
  }, [open]);

  // Quando selecionar marca, carregar modelos e limpar dependentes
  useEffect(() => {
    const marca = formData.marca;
    if (!marca) { setModelos([]); setAnos([]); return; }
    (async () => {
      try {
        setLoadingCatalog((s) => ({ ...s, modelos: true }));
        const resp = await apiService.getModelos({ marca: String(marca) });
        if (resp.success && Array.isArray(resp.data)) {
          const mapped = resp.data.map((m: any) => ({ id: m.id ?? m.value ?? m.codigo ?? m.cod ?? m.sigla ?? String(m), nome: m.nome ?? m.label ?? m.descricao ?? m.name ?? String(m) }));
          setModelos(mapped);
        } else {
          setModelos([]);
        }
        // reset campos dependentes
        setFormData((prev) => ({ ...prev, modelo: '', ano: '' }));
        setAnos([]);
      } catch (e) {
        setModelos([]);
      } finally {
        setLoadingCatalog((s) => ({ ...s, modelos: false }));
      }
    })();
  }, [formData.marca]);

  // Quando selecionar modelo, carregar anos e limpar dependente
  useEffect(() => {
    const marca = formData.marca; const modelo = formData.modelo;
    if (!marca || !modelo) { setAnos([]); return; }
    (async () => {
      try {
        setLoadingCatalog((s) => ({ ...s, anos: true }));
        const resp = await apiService.getAnos({ marca: String(marca), modelo: String(modelo) });
        if (resp.success && Array.isArray(resp.data)) {
          const mapped = resp.data.map((m: any) => ({ id: m.id ?? m.value ?? m.codigo ?? m.cod ?? m.sigla ?? String(m), nome: m.nome ?? m.label ?? m.descricao ?? m.name ?? String(m) }));
          setAnos(mapped);
        } else {
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
  }, [formData.modelo]);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const simulationData = {
        type: tipoSeguro,
        ...formData
      };

      const result = await simulate(simulationData);
      
      if (result) {
        toast({
          title: "Simulação realizada com sucesso!",
          description: `Valor estimado: R$ ${result.value || 'A calcular'}`,
        });
      } else {
        toast({
          title: "Simulação enviada!",
          description: "Em breve entraremos em contato para análise da sua proposta.",
        });
      }
      
      // Reset form and close modal
      setCurrentStep(1);
      setTipoSeguro('');
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        cpf: '',
      });
      onOpenChange(false);
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

      case 2:
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

      case 3:
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

      case 4:
        if (tipoSeguro === 'veiculo') {
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca *</Label>
                  <Select disabled={loadingCatalog.marcas} value={(formData.marca as any) || ''} onValueChange={(value) => handleInputChange('marca', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCatalog.marcas ? 'Carregando marcas...' : 'Selecione a marca'} />
                    </SelectTrigger>
                    <SelectContent>
                      {marcas.map((m) => (
                        <SelectItem key={String(m.id)} value={String(m.id)}>{m.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo *</Label>
                  <Select disabled={!formData.marca || loadingCatalog.modelos} value={(formData.modelo as any) || ''} onValueChange={(value) => handleInputChange('modelo', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={!formData.marca ? 'Selecione a marca primeiro' : (loadingCatalog.modelos ? 'Carregando modelos...' : 'Selecione o modelo')} />
                    </SelectTrigger>
                    <SelectContent>
                      {modelos.map((m) => (
                        <SelectItem key={String(m.id)} value={String(m.id)}>{m.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ano">Ano *</Label>
                  <Select disabled={!formData.modelo || loadingCatalog.anos} value={(formData.ano as any) || ''} onValueChange={(value) => handleInputChange('ano', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={!formData.modelo ? 'Selecione o modelo primeiro' : (loadingCatalog.anos ? 'Carregando anos...' : 'Ano do veículo')} />
                    </SelectTrigger>
                    <SelectContent>
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
                    onChange={(e) => handleInputChange('placa', e.target.value)}
                    placeholder="ABC-1234"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP de pernoite *</Label>
                  <Input
                    id="cep"
                    value={formData.cep || ''}
                    onChange={(e) => handleInputChange('cep', e.target.value)}
                    placeholder="00000-000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="uso">Uso do veículo *</Label>
                  <Select onValueChange={(value) => handleInputChange('uso', value)}>
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
                  <Select onValueChange={(value) => handleInputChange('marcaCelular', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a marca" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apple">Apple</SelectItem>
                      <SelectItem value="samsung">Samsung</SelectItem>
                      <SelectItem value="xiaomi">Xiaomi</SelectItem>
                      <SelectItem value="motorola">Motorola</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="modelo-celular">Modelo *</Label>
                  <Select onValueChange={(value) => handleInputChange('modeloCelular', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iphone14">iPhone 14</SelectItem>
                      <SelectItem value="galaxys23">Galaxy S23</SelectItem>
                      <SelectItem value="redminote12">Redmi Note 12</SelectItem>
                      <SelectItem value="motog32">Moto G32</SelectItem>
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
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="valor-aparelho">Valor do Aparelho *</Label>
                  <Input
                    id="valor-aparelho"
                    value={formData.valorAparelho || ''}
                    onChange={(e) => handleInputChange('valorAparelho', e.target.value)}
                    placeholder="R$ 3.500"
                  />
                </div>
              </div>
            </div>
          );
        }


      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              <Button onClick={handleSubmit} disabled={simulationLoading}>
                {simulationLoading ? 'Enviando...' : 'Enviar Simulação'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}