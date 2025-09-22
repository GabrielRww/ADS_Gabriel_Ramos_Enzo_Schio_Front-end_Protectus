import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Mail, User, FileText, Car, Home, Smartphone } from 'lucide-react';

interface SimulacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoSeguro: 'veiculo' | 'residencial' | 'celular';
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

export default function SimulacaoModal({ open, onOpenChange, tipoSeguro }: SimulacaoModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
  });
  const { toast } = useToast();

  const totalSteps = 3;
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
    // Simular envio de email
    try {
      console.log('Dados enviados:', { tipoSeguro, ...formData });
      
      toast({
        title: "Simulação enviada com sucesso!",
        description: "Em breve entraremos em contato para análise da sua proposta.",
      });
      
      // Reset form and close modal
      setCurrentStep(1);
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

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <User className="h-5 w-5" />;
      case 2: return tipoSeguro === 'veiculo' ? <Car className="h-5 w-5" /> : 
                   tipoSeguro === 'residencial' ? <Home className="h-5 w-5" /> : 
                   <Smartphone className="h-5 w-5" />;
      case 3: return <FileText className="h-5 w-5" />;
      default: return null;
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Dados Pessoais';
      case 2: return `Dados do ${tipoSeguro === 'veiculo' ? 'Veículo' : tipoSeguro === 'residencial' ? 'Imóvel' : 'Celular'}`;
      case 3: return 'Revisão e Envio';
      default: return '';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
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

      case 2:
        if (tipoSeguro === 'veiculo') {
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca *</Label>
                  <Select onValueChange={(value) => handleInputChange('marca', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a marca" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="honda">Honda</SelectItem>
                      <SelectItem value="toyota">Toyota</SelectItem>
                      <SelectItem value="volkswagen">Volkswagen</SelectItem>
                      <SelectItem value="ford">Ford</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo *</Label>
                  <Select onValueChange={(value) => handleInputChange('modelo', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="civic">Civic</SelectItem>
                      <SelectItem value="corolla">Corolla</SelectItem>
                      <SelectItem value="gol">Gol</SelectItem>
                      <SelectItem value="fiesta">Fiesta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ano">Ano *</Label>
                  <Select onValueChange={(value) => handleInputChange('ano', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ano do veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                      <SelectItem value="2021">2021</SelectItem>
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

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Confirme seus dados</h3>
              <p className="text-muted-foreground">
                Revise as informações antes de enviar sua solicitação
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><strong>Nome:</strong> {formData.nome}</div>
                <div><strong>Email:</strong> {formData.email}</div>
                <div><strong>Telefone:</strong> {formData.telefone}</div>
                <div><strong>CPF:</strong> {formData.cpf}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>
                  Dados do {tipoSeguro === 'veiculo' ? 'Veículo' : tipoSeguro === 'residencial' ? 'Imóvel' : 'Celular'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {tipoSeguro === 'veiculo' && (
                  <>
                    <div><strong>Marca/Modelo:</strong> {formData.marca} {formData.modelo}</div>
                    <div><strong>Ano:</strong> {formData.ano}</div>
                    <div><strong>Placa:</strong> {formData.placa}</div>
                    <div><strong>CEP:</strong> {formData.cep}</div>
                    <div><strong>Uso:</strong> {formData.uso}</div>
                  </>
                )}
                {tipoSeguro === 'residencial' && (
                  <>
                    <div><strong>Tipo:</strong> {formData.tipoImovel}</div>
                    <div><strong>Área:</strong> {formData.area} m²</div>
                    <div><strong>CEP:</strong> {formData.cepResidencia}</div>
                    <div><strong>Valor:</strong> {formData.valorImovel}</div>
                  </>
                )}
                {tipoSeguro === 'celular' && (
                  <>
                    <div><strong>Marca/Modelo:</strong> {formData.marcaCelular} {formData.modeloCelular}</div>
                    <div><strong>IMEI:</strong> {formData.imei}</div>
                    <div><strong>Valor:</strong> {formData.valorAparelho}</div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        );

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
            Simulação de Seguro {tipoSeguro === 'veiculo' ? 'Veicular' : tipoSeguro === 'residencial' ? 'Residencial' : 'Celular'}
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
              <Button onClick={handleSubmit}>
                <Mail className="h-4 w-4 mr-2" />
                Enviar Simulação
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}