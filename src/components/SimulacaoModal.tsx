import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, User, FileText, Car, Home, Smartphone, CheckCircle, Edit } from 'lucide-react';
import { useSimulacaoLogic } from '@/hooks/useSimulacaoLogic';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

interface SimulacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoSeguro?: 'veiculo' | 'residencial' | 'celular';
}

// Informações dos tipos de seguros
const segurosInfo = {
  veiculo: {
    title: 'Seguro Veicular',
    description: 'Proteja seu veículo contra imprevistos',
    coberturas: [
      'Colisão, incêndio e roubo',
      'Assistência 24 horas',
      'Carro reserva',
      'Proteção de vidros',
    ],
  },
  residencial: {
    title: 'Seguro Residencial',
    description: 'Proteja seu lar e sua família',
    coberturas: [
      'Incêndio e danos elétricos',
      'Roubo e furto qualificado',
      'Danos por água',
      'Responsabilidade civil',
    ],
  },
  celular: {
    title: 'Seguro Celular',
    description: 'Proteja seu smartphone contra danos e roubos',
    coberturas: [
      'Roubo e furto qualificado',
      'Quebra acidental de tela',
      'Danos por líquidos',
      'Oxidação',
    ],
  },
};

export default function SimulacaoModal({ open, onOpenChange, tipoSeguro: initialTipoSeguro }: SimulacaoModalProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();
  
  // Estado do tipo de seguro
  const [tipoSeguro, setTipoSeguro] = useState<'veiculo' | 'residencial' | 'celular' | ''>(initialTipoSeguro || '');
  
  // Usar hook customizado com toda a lógica
  const logic = useSimulacaoLogic(tipoSeguro, open);

  // Atualizar tipo de seguro quando prop mudar
  useEffect(() => {
    if (initialTipoSeguro && initialTipoSeguro !== tipoSeguro) {
      setTipoSeguro(initialTipoSeguro);
    }
  }, [initialTipoSeguro, tipoSeguro]);

  // ======== FUNÇÕES AUXILIARES DE UI ========

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <FileText className="h-4 w-4" />;
      case 2: return tipoSeguro === 'veiculo' ? <Car className="h-4 w-4" /> : 
                    tipoSeguro === 'residencial' ? <Home className="h-4 w-4" /> : 
                    <Smartphone className="h-4 w-4" />;
      case 3: return <User className="h-4 w-4" />;
      case 4: return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Tipo';
      case 2: return 'Informações';
      case 3: return 'Dados Pessoais';
      case 4: return 'Dados do Bem';
      default: return '';
    }
  };

  const handleCloseModal = () => {
    logic.handleReset();
    setTipoSeguro('');
    onOpenChange(false);
  };

  const handleContractSuccess = async () => {
    const success = await logic.handleAcceptContract();
    if (success) {
      handleCloseModal();
    }
  };

  // ======== RENDERIZAÇÃO DE CONTEÚDO POR STEP ========

  const renderStepContent = () => {
    switch (logic.currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Escolha o tipo de seguro</h3>
              <p className="text-muted-foreground">Selecione o seguro que deseja simular</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card 
                className={`cursor-pointer transition-all hover:border-primary ${tipoSeguro === 'veiculo' ? 'border-primary ring-2 ring-primary' : ''}`}
                onClick={() => setTipoSeguro('veiculo')}
              >
                <CardContent className="p-6 text-center space-y-3">
                  <Car className="h-12 w-12 mx-auto text-primary" />
                  <h4 className="font-semibold">Seguro Veicular</h4>
                  <p className="text-sm text-muted-foreground">Proteja seu veículo</p>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all hover:border-primary ${tipoSeguro === 'residencial' ? 'border-primary ring-2 ring-primary' : ''}`}
                onClick={() => setTipoSeguro('residencial')}
              >
                <CardContent className="p-6 text-center space-y-3">
                  <Home className="h-12 w-12 mx-auto text-primary" />
                  <h4 className="font-semibold">Seguro Residencial</h4>
                  <p className="text-sm text-muted-foreground">Proteja seu lar</p>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all hover:border-primary ${tipoSeguro === 'celular' ? 'border-primary ring-2 ring-primary' : ''}`}
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

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={logic.formData.nome}
                onChange={(e) => logic.handleInputChange('nome', e.target.value)}
                placeholder="Digite seu nome completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={logic.formData.email}
                onChange={(e) => logic.handleInputChange('email', e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={logic.formData.telefone}
                  onChange={(e) => logic.handleInputChange('telefone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={logic.formData.cpf}
                  onChange={(e) => logic.handleInputChange('cpf', e.target.value)}
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
                  <Select 
                    disabled={!isAuthenticated || logic.loadingCatalog.marcas} 
                    value={logic.formData.marca || ''} 
                    onValueChange={(value) => logic.handleInputChange('marca', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !isAuthenticated ? 'Faça login para carregar marcas' : 
                        logic.loadingCatalog.marcas ? 'Carregando marcas...' : 
                        'Selecione a marca'
                      } />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={5}>
                      {logic.marcas.map((m) => (
                        <SelectItem key={String(m.id)} value={String(m.id)}>{m.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo *</Label>
                  <Select 
                    disabled={!isAuthenticated || !logic.formData.marca || logic.loadingCatalog.modelos} 
                    value={logic.formData.modelo || ''} 
                    onValueChange={(value) => logic.handleInputChange('modelo', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !isAuthenticated ? 'Faça login primeiro' : 
                        !logic.formData.marca ? 'Selecione a marca primeiro' : 
                        logic.loadingCatalog.modelos ? 'Carregando modelos...' : 
                        'Selecione o modelo'
                      } />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={5}>
                      {logic.modelos.map((m) => (
                        <SelectItem key={String(m.id)} value={String(m.id)}>{m.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ano">Ano *</Label>
                  <Select 
                    disabled={!isAuthenticated || !logic.formData.modelo || logic.loadingCatalog.anos || logic.anos.length === 0} 
                    value={logic.formData.ano || ''} 
                    onValueChange={(value) => logic.handleInputChange('ano', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !isAuthenticated ? 'Faça login primeiro' : 
                        !logic.formData.modelo ? 'Selecione o modelo primeiro' : 
                        logic.loadingCatalog.anos ? 'Carregando anos...' : 
                        logic.anos.length ? 'Ano do veículo' : 'Nenhum ano disponível'
                      } />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={5}>
                      {logic.anos.map((a) => (
                        <SelectItem key={String(a.id)} value={String(a.id)}>{a.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="placa">Placa *</Label>
                  <Input
                    id="placa"
                    value={logic.formData.placa || ''}
                    onChange={(e) => logic.handleInputChange('placa', e.target.value.toUpperCase())}
                    placeholder="ABC-1234"
                    maxLength={8}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="valor-veiculo">Valor do Veículo (FIPE)</Label>
                  <Input
                    id="valor-veiculo"
                    value={logic.formData.valorVeiculo ? `R$ ${logic.formatCurrency(logic.formData.valorVeiculo)}` : ''}
                    onChange={(e) => logic.handleInputChange('valorVeiculo', e.target.value)}
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
                  <Select value={String(logic.formData.uso || '')} onValueChange={(value) => logic.handleInputChange('uso', value)}>
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
                  <Select value={logic.formData.tipoImovel || ''} onValueChange={(value) => logic.handleInputChange('tipoImovel', value)}>
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
                    value={logic.formData.area || ''}
                    onChange={(e) => logic.handleInputChange('area', e.target.value)}
                    placeholder="Ex: 120"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cep-residencia">CEP *</Label>
                  <Input
                    id="cep-residencia"
                    value={logic.formData.cepResidencia || ''}
                    onChange={(e) => logic.handleInputChange('cepResidencia', e.target.value)}
                    placeholder="00000-000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="valor-imovel">Valor do Imóvel *</Label>
                  <Input
                    id="valor-imovel"
                    value={logic.formData.valorImovel || ''}
                    onChange={(e) => logic.handleInputChange('valorImovel', e.target.value)}
                    placeholder="R$ 500.000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço *</Label>
                  <Input
                    id="endereco"
                    value={logic.formData.endereco || ''}
                    onChange={(e) => logic.handleInputChange('endereco', e.target.value)}
                    placeholder="Rua, Avenida..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="numero">Número *</Label>
                  <Input
                    id="numero"
                    value={logic.formData.numero || ''}
                    onChange={(e) => logic.handleInputChange('numero', e.target.value)}
                    placeholder="123"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro *</Label>
                  <Input
                    id="bairro"
                    value={logic.formData.bairro || ''}
                    onChange={(e) => logic.handleInputChange('bairro', e.target.value)}
                    placeholder="Nome do bairro"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input
                    id="cidade"
                    value={logic.formData.cidade || ''}
                    onChange={(e) => logic.handleInputChange('cidade', e.target.value)}
                    placeholder="Nome da cidade"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado *</Label>
                  <Input
                    id="estado"
                    value={logic.formData.estado || ''}
                    onChange={(e) => logic.handleInputChange('estado', e.target.value)}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>
          );
        } else if (tipoSeguro === 'celular') {
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marca-celular">Marca *</Label>
                  <Select 
                    disabled={!isAuthenticated || logic.loadingCelulares.marcas} 
                    value={logic.formData.marcaCelular || ''} 
                    onValueChange={(value) => logic.handleInputChange('marcaCelular', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !isAuthenticated ? 'Faça login para carregar marcas' : 
                        logic.loadingCelulares.marcas ? 'Carregando marcas...' : 
                        'Selecione a marca'
                      } />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={5}>
                      {logic.marcasCelulares.filter(m => m.id && m.id !== '').map((m) => (
                        <SelectItem key={String(m.id)} value={String(m.id)}>{m.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="modelo-celular">Modelo *</Label>
                  <Select 
                    disabled={!isAuthenticated || !logic.formData.marcaCelular || logic.loadingCelulares.modelos} 
                    value={logic.formData.modeloCelular || ''} 
                    onValueChange={(value) => logic.handleInputChange('modeloCelular', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !isAuthenticated ? 'Faça login primeiro' : 
                        !logic.formData.marcaCelular ? 'Selecione a marca primeiro' : 
                        logic.loadingCelulares.modelos ? 'Carregando modelos...' : 
                        'Selecione o modelo'
                      } />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={5}>
                      {logic.modelosCelulares.filter(m => m.id && m.id !== '').map((m) => (
                        <SelectItem key={String(m.id)} value={String(m.id)}>{m.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cor-celular">Cor *</Label>
                  <Select 
                    disabled={!isAuthenticated || !logic.formData.modeloCelular || logic.loadingCelulares.anos || logic.coresCelulares.length === 0} 
                    value={logic.formData.corCelular || ''} 
                    onValueChange={(value) => logic.handleInputChange('corCelular', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !isAuthenticated ? 'Faça login primeiro' : 
                        !logic.formData.modeloCelular ? 'Selecione o modelo primeiro' : 
                        logic.loadingCelulares.anos ? 'Carregando cores...' : 
                        logic.coresCelulares.length ? 'Selecione a cor' : 'Nenhuma cor disponível'
                      } />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={5}>
                      {(() => {
                        console.log('[Modal] Cores disponíveis:', logic.coresCelulares);
                        return logic.coresCelulares.filter(c => c.id && c.id !== '' && c.nome).map((c) => (
                          <SelectItem key={String(c.id)} value={String(c.id)}>{c.nome}</SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imei">IMEI *</Label>
                  <Input
                    id="imei"
                    value={logic.formData.imei || ''}
                    onChange={(e) => logic.handleInputChange('imei', e.target.value)}
                    placeholder="000000000000000"
                    maxLength={15}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="valor-aparelho">Valor do Aparelho</Label>
                  <Input
                    id="valor-aparelho"
                    value={logic.formData.valorAparelho ? `R$ ${logic.formatCurrency(logic.formData.valorAparelho)}` : ''}
                    placeholder="Carregando..."
                    readOnly
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    * Valor consultado automaticamente
                  </p>
                </div>
              </div>
            </div>
          );
        }
        return null;

      default:
        return null;
    }
  };

  // ======== RENDERIZAÇÃO PRINCIPAL ========

  return (
    <Dialog open={open} onOpenChange={handleCloseModal} modal={true}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto" 
        style={{ zIndex: 60 }}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* Tela de Resultado da Simulação */}
        {logic.showResult && logic.simulationResult ? (
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
                    {(() => {
                      console.log('[SimulacaoModal] simulationResult:', logic.simulationResult);
                      let valor = logic.simulationResult?.valorSeguro;
                      console.log('[SimulacaoModal] valor bruto:', valor);
                      
                      // Se o valor for muito alto (provavelmente anual), dividir por 12
                      if (valor && valor > 10000) {
                        valor = valor / 12;
                        console.log('[SimulacaoModal] valor dividido por 12 (mensal):', valor);
                      }
                      
                      if (valor) {
                        return `R$ ${logic.formatCurrency(valor)}`;
                      }
                      return 'R$ A calcular';
                    })()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Valor mensal do seguro calculado
                  </p>
                </div>
              </div>

              {/* Resumo dos dados */}
              <div className="space-y-4">
                <h4 className="font-semibold">Resumo da Proposta:</h4>
                
                {tipoSeguro === 'veiculo' && logic.simulationResult.originalData && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Veículo:</span>
                      <p className="font-medium">
                        {logic.marcas.find(m => String(m.id) === String(logic.formData.marca))?.nome} {' '}
                        {logic.modelos.find(m => String(m.id) === String(logic.formData.modelo))?.nome} {' '}
                        {logic.formData.ano}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Placa:</span>
                      <p className="font-medium">{logic.formData.placa}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Valor FIPE:</span>
                      <p className="font-medium">
                        {logic.formData.valorVeiculo ? 
                          `R$ ${logic.formatCurrency(logic.formData.valorVeiculo)}` : 
                          'Consultando...'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Uso:</span>
                      <p className="font-medium">{logic.formData.uso}</p>
                    </div>
                  </div>
                )}

                {tipoSeguro === 'celular' && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Aparelho:</span>
                      <p className="font-medium">
                        {logic.marcasCelulares.find(m => String(m.id) === String(logic.formData.marcaCelular))?.nome} {' '}
                        {logic.modelosCelulares.find(m => String(m.id) === String(logic.formData.modeloCelular))?.nome}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cor:</span>
                      <p className="font-medium">
                        {logic.coresCelulares.find(c => String(c.id) === String(logic.formData.corCelular))?.nome}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">IMEI:</span>
                      <p className="font-medium">{logic.formData.imei}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Valor do Aparelho:</span>
                      <p className="font-medium">
                        {logic.formData.valorAparelho ? 
                          `R$ ${logic.formatCurrency(logic.formData.valorAparelho)}` : 
                          'Consultando...'}
                      </p>
                    </div>
                  </div>
                )}

                {tipoSeguro === 'residencial' && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tipo de Imóvel:</span>
                      <p className="font-medium capitalize">{logic.formData.tipoImovel}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Área:</span>
                      <p className="font-medium">{logic.formData.area} m²</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">CEP:</span>
                      <p className="font-medium">{logic.formData.cepResidencia}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Valor do Imóvel:</span>
                      <p className="font-medium">
                        {logic.formData.valorImovel ? 
                          `R$ ${logic.formatCurrency(logic.formData.valorImovel)}` : 
                          'Informar valor'}
                      </p>
                    </div>
                  </div>
                )}

                {(logic.formData.nome || logic.formData.cpf || logic.formData.email || logic.formData.telefone) && (
                  <div className="pt-4 border-t">
                    <span className="text-muted-foreground">Cliente:</span>
                    <p className="font-medium">
                      {logic.formData.nome}
                      {logic.formData.cpf && (
                        <span className="text-muted-foreground">
                          {' - CPF: '}
                          {logic.formData.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                        </span>
                      )}
                    </p>
                    {(logic.formData.email || logic.formData.telefone) && (
                      <p className="text-sm text-muted-foreground">
                        {logic.formData.email}
                        {logic.formData.telefone && logic.formData.email && ' • '}
                        {logic.formData.telefone}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Botões de ação */}
              <div className="flex flex-col gap-3 pt-4">
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={logic.handleRejectContract}
                    disabled={logic.contractingLoading}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Simulação
                  </Button>
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={handleContractSuccess}
                    disabled={logic.contractingLoading}
                  >
                    {logic.contractingLoading ? (
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
                
                <Button 
                  variant="ghost" 
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    logic.handleReset();
                    handleCloseModal();
                    toast({
                      title: "Simulação cancelada",
                      description: "Você pode fazer uma nova simulação a qualquer momento.",
                    });
                  }}
                  disabled={logic.contractingLoading}
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
                {getStepIcon(logic.currentStep)}
                Simulação de Seguro {tipoSeguro ? (tipoSeguro === 'veiculo' ? 'Veicular' : tipoSeguro === 'residencial' ? 'Residencial' : 'Celular') : ''}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Passo {logic.currentStep} de {logic.totalSteps}</span>
                  <span>{Math.round(logic.progress)}% completo</span>
                </div>
                <Progress value={logic.progress} className="w-full" />
              </div>

              {/* Steps Navigation */}
              <div className="flex justify-between">
                {Array.from({ length: logic.totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`flex items-center space-x-2 ${
                      i + 1 <= logic.currentStep ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                        i + 1 <= logic.currentStep
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted'
                      }`}
                    >
                      {i + 1 <= logic.currentStep ? (
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
                  onClick={logic.handlePrevStep}
                  disabled={logic.currentStep === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>

                {logic.currentStep < logic.totalSteps ? (
                  <Button onClick={logic.handleNextStep}>
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={logic.handleSubmit} 
                    disabled={logic.currentLoading}
                    className="bg-primary"
                  >
                    {logic.currentLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Simular Seguro
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
