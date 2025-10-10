import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Car, Home, Smartphone, Check, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SimulacaoModal from '@/components/SimulacaoModal';

export default function Simulacao() {
  const [tipoSeguro, setTipoSeguro] = useState('veiculo');
  const [showPlanos, setShowPlanos] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  const handleSimular = () => {
    setShowPlanos(true);
    toast({
      title: "Simulação realizada!",
      description: "Confira os planos disponíveis abaixo.",
    });
  };

  const planos = {
    veiculo: [
      {
        nome: 'Básico',
        preco: 'R$ 89,90/mês',
        cobertura: 'R$ 50.000',
        beneficios: ['Assistência 24h', 'Guincho', 'Chaveiro'],
        popular: false
      },
      {
        nome: 'Completo',
        preco: 'R$ 149,90/mês',
        cobertura: 'R$ 100.000',
        beneficios: ['Assistência 24h', 'Guincho', 'Chaveiro', 'Carro reserva', 'Vidros'],
        popular: true
      },
      {
        nome: 'Premium',
        preco: 'R$ 219,90/mês',
        cobertura: 'R$ 200.000',
        beneficios: ['Assistência 24h', 'Guincho', 'Chaveiro', 'Carro reserva', 'Vidros', 'Rastreador GPS'],
        popular: false
      }
    ],
    residencial: [
      {
        nome: 'Básico',
        preco: 'R$ 45,90/mês',
        cobertura: 'R$ 150.000',
        beneficios: ['Incêndio', 'Roubo/Furto', 'Danos elétricos'],
        popular: false
      },
      {
        nome: 'Completo',
        preco: 'R$ 89,90/mês',
        cobertura: 'R$ 300.000',
        beneficios: ['Incêndio', 'Roubo/Furto', 'Danos elétricos', 'Responsabilidade civil', 'Vidros'],
        popular: true
      },
      {
        nome: 'Premium',
        preco: 'R$ 159,90/mês',
        cobertura: 'R$ 500.000',
        beneficios: ['Incêndio', 'Roubo/Furto', 'Danos elétricos', 'Responsabilidade civil', 'Vidros', 'Desastres naturais'],
        popular: false
      }
    ],
    celular: [
      {
        nome: 'Básico',
        preco: 'R$ 19,90/mês',
        cobertura: 'R$ 3.000',
        beneficios: ['Quebra de tela', 'Roubo/Furto'],
        popular: false
      },
      {
        nome: 'Completo',
        preco: 'R$ 34,90/mês',
        cobertura: 'R$ 5.000',
        beneficios: ['Quebra de tela', 'Roubo/Furto', 'Danos por líquidos', 'Defeitos'],
        popular: true
      },
      {
        nome: 'Premium',
        preco: 'R$ 54,90/mês',
        cobertura: 'R$ 8.000',
        beneficios: ['Quebra de tela', 'Roubo/Furto', 'Danos por líquidos', 'Defeitos', 'Perda/Extravio'],
        popular: false
      }
    ]
  };

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.07)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.07)_1px,transparent_1px)] bg-[size:32px_32px] animate-grid-flow"></div>
        
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-32 right-10 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[140px] animate-float" style={{ animationDelay: '2s' }}></div>
        
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-${i % 3 + 1} h-${i % 3 + 1} bg-primary/${20 + (i % 3) * 10} rounded-full animate-float`}
            style={{
              top: `${(i * 7) % 90}%`,
              left: `${(i * 11) % 90}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${8 + (i % 5)}s`
            }}
          />
        ))}
      </div>

      <div className="space-y-6 relative">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold">Simular Seguro</h1>
        <p className="text-muted-foreground">
          Descubra o plano ideal para sua proteção
        </p>
      </div>

      <Tabs value={tipoSeguro} onValueChange={setTipoSeguro} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="veiculo" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Veículo
          </TabsTrigger>
          <TabsTrigger value="residencial" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Residencial
          </TabsTrigger>
          <TabsTrigger value="celular" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Celular
          </TabsTrigger>
        </TabsList>

        <TabsContent value="veiculo" className="space-y-6">
          <Card className="bg-card/80 backdrop-blur-sm border-primary/10 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                Dados do Veículo
              </CardTitle>
              <CardDescription>
                Informe os dados do seu veículo para simulação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca</Label>
                  <Select>
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
                  <Label htmlFor="modelo">Modelo</Label>
                  <Select>
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
                  <Label htmlFor="ano">Ano</Label>
                  <Select>
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
                  <Label htmlFor="placa">Placa</Label>
                  <Input id="placa" placeholder="ABC-1234" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cep">CEP de pernoite</Label>
                  <Input id="cep" placeholder="00000-000" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uso">Uso do veículo</Label>
                  <Select>
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

              <Button onClick={() => setModalOpen(true)} className="w-full">
                Simular Agora
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="residencial" className="space-y-6">
          <Card className="bg-card/80 backdrop-blur-sm border-primary/10 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                Dados da Residência
              </CardTitle>
              <CardDescription>
                Informe os dados da sua residência para simulação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo-imovel">Tipo do Imóvel</Label>
                  <Select>
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
                  <Label htmlFor="area">Área (m²)</Label>
                  <Input id="area" placeholder="Ex: 120" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cep-residencia">CEP</Label>
                  <Input id="cep-residencia" placeholder="00000-000" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor-imovel">Valor do Imóvel</Label>
                  <Input id="valor-imovel" placeholder="R$ 500.000" />
                </div>
              </div>

              <Button onClick={() => setModalOpen(true)} className="w-full">
                Simular Agora
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="celular" className="space-y-6">
          <Card className="bg-card/80 backdrop-blur-sm border-primary/10 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                Dados do Celular
              </CardTitle>
              <CardDescription>
                Informe os dados do seu celular para simulação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marca-celular">Marca</Label>
                  <Select>
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
                  <Label htmlFor="modelo-celular">Modelo</Label>
                  <Select>
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
                  <Label htmlFor="imei">IMEI</Label>
                  <Input id="imei" placeholder="123456789012345" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor-aparelho">Valor do Aparelho</Label>
                  <Input id="valor-aparelho" placeholder="R$ 3.500" />
                </div>
              </div>

              <Button onClick={() => setModalOpen(true)} className="w-full">
                Simular Agora
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showPlanos && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Planos Disponíveis</h2>
            <p className="text-muted-foreground">
              Escolha o plano que melhor se adequa às suas necessidades
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planos[tipoSeguro as keyof typeof planos].map((plano, index) => (
              <Card key={index} className={`relative overflow-hidden group bg-card/80 backdrop-blur-sm transition-all duration-300 ${plano.popular ? 'border-primary shadow-glow hover:shadow-glow-lg' : 'border-primary/10 hover:border-primary/30 hover:shadow-lg'}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {plano.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle>{plano.nome}</CardTitle>
                  <div className="text-3xl font-bold text-primary">{plano.preco}</div>
                  <CardDescription>Cobertura até {plano.cobertura}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plano.beneficios.map((beneficio, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-success" />
                        <span className="text-sm">{beneficio}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full" 
                    variant={plano.popular ? 'default' : 'outline'}
                  >
                    Contratar Plano
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <SimulacaoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        tipoSeguro={tipoSeguro as 'veiculo' | 'residencial' | 'celular'}
      />
      </div>
    </div>
  );
}