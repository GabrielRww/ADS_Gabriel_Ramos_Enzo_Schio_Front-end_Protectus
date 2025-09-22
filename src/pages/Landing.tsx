import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Car, Home, Smartphone, Star, CheckCircle, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import heroImage from '@/assets/hero-insurance.jpg';
import protectusLogo from '@/assets/protectus-logo-complete.png';
import protectusIcon from '@/assets/protectus-icon.png';
import SimulacaoModal from '@/components/SimulacaoModal';

export default function Landing() {
  const { theme, setTheme } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [tipoSeguro, setTipoSeguro] = useState<'veiculo' | 'residencial' | 'celular'>('veiculo');
  const services = [
    {
      icon: Car,
      title: 'Seguro Auto',
      description: 'Proteção completa para seu veículo com cobertura 24h.',
      features: ['Guincho 24h', 'Carro reserva', 'Vidros inclusos']
    },
    {
      icon: Home,
      title: 'Seguro Residencial',
      description: 'Sua casa protegida contra imprevistos.',
      features: ['Incêndio', 'Roubo', 'Danos elétricos']
    },
    {
      icon: Smartphone,
      title: 'Seguro Celular',
      description: 'Seu smartphone protegido onde você estiver.',
      features: ['Quebra acidental', 'Roubo/Furto', 'Oxidação']
    }
  ];

  const testimonials = [
    {
      name: 'Maria Silva',
      text: 'Excelente atendimento! Resolveram meu sinistro rapidamente.',
      rating: 5
    },
    {
      name: 'João Santos',
      text: 'Preços justos e cobertura completa. Recomendo!',
      rating: 5
    },
    {
      name: 'Ana Costa',
      text: 'Muito prático simular e contratar online.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src={protectusLogo}
                alt="Protectus Seguros" 
                className="h-20 w-auto transition-all duration-300 hover:scale-105 dark:brightness-125 dark:contrast-110"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="relative"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Alternar tema</span>
              </Button>
              
              <Button variant="ghost" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild className="bg-gradient-primary hover:bg-primary-hover animate-fade-in">
                <Link to="/cadastro">Começar Agora</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20 dark:from-primary/20 dark:via-primary/10 dark:to-background overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-72 h-72 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-72 h-72 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                  Proteção que você{' '}
                  <span className="text-primary">confia</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Seguros personalizados para cada momento da sua vida. 
                  Simule, contrate e gerencie tudo online de forma simples e segura.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:bg-primary-hover shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 animate-bounce-subtle"
                  onClick={() => {
                    setTipoSeguro('veiculo');
                    setModalOpen(true);
                  }}
                >
                  Simular Agora
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-8">
                <div className="text-center group">
                  <div className="text-3xl font-bold text-primary group-hover:scale-110 transition-transform">50k+</div>
                  <div className="text-sm text-muted-foreground">Clientes</div>
                </div>
                <div className="w-px h-8 bg-border"></div>
                <div className="text-center group">
                  <div className="text-3xl font-bold text-primary group-hover:scale-110 transition-transform">98%</div>
                  <div className="text-sm text-muted-foreground">Satisfação</div>
                </div>
                <div className="w-px h-8 bg-border"></div>
                <div className="text-center group">
                  <div className="text-3xl font-bold text-primary group-hover:scale-110 transition-transform">24h</div>
                  <div className="text-sm text-muted-foreground">Suporte</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl blur-3xl"></div>
              <img 
                src={heroImage} 
                alt="Proteção e segurança" 
                className="relative rounded-2xl shadow-2xl w-full border border-border/50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent rounded-2xl"></div>
              <div className="absolute top-4 right-4 w-16 h-16 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 bg-accent/20 rounded-full blur-lg animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Nossos Seguros
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Encontre a proteção ideal para o que mais importa na sua vida
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 group border-border/50 hover:border-primary/20 bg-gradient-to-br from-card to-card/80">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <service.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-success mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              O que nossos clientes dizem
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 bg-gradient-to-br from-card to-muted/20">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-accent text-accent animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic relative">
                    <span className="text-6xl text-primary/20 absolute -top-4 -left-2">"</span>
                    {testimonial.text}
                  </p>
                  <p className="font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-lg animate-pulse delay-500"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="animate-bounce-subtle">
            <Shield className="h-16 w-16 text-primary-foreground mx-auto mb-6" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Pronto para se proteger?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Faça uma simulação gratuita em menos de 2 minutos
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            onClick={() => {
              setTipoSeguro('veiculo');
              setModalOpen(true);
            }}
          >
            Simular Meu Seguro
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src={protectusLogo}
                  alt="Protectus Seguros" 
                  className="h-16 w-auto dark:brightness-150 dark:contrast-125 dark:saturate-110"
                />
              </div>
              <p className="text-background/70">
                Seguros que protegem o que mais importa na sua vida.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Seguros</h4>
              <ul className="space-y-2 text-background/70">
                <li>Seguro Auto</li>
                <li>Seguro Residencial</li>
                <li>Seguro Celular</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-background/70">
                <li>Central de Ajuda</li>
                <li>Fale Conosco</li>
                <li>WhatsApp</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-background/70">
                <li>0800 123 4567</li>
                <li>contato@protectus.com</li>
                <li>24h por dia</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-background/20 mt-8 pt-8 text-center">
            <p className="text-background/70">
              © 2024 Protectus Seguros. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Modal de Simulação */}
      <SimulacaoModal 
        open={modalOpen}
        onOpenChange={setModalOpen}
        tipoSeguro={tipoSeguro}
      />
    </div>
  );
}