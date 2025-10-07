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
      <section className="relative bg-background py-20 overflow-hidden">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Removed saturated glow effects */}
        
        {/* Animated flowing lines */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-shimmer"></div>
          <div className="absolute top-40 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent animate-shimmer" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-32 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-[10%] w-2 h-2 bg-primary/40 rounded-full animate-float"></div>
          <div className="absolute top-40 right-[15%] w-1.5 h-1.5 bg-accent/40 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-32 left-[20%] w-2 h-2 bg-primary/30 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/3 right-[25%] w-1 h-1 bg-primary/40 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-[60%] left-[30%] w-1.5 h-1.5 bg-primary/35 rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
          <div className="absolute bottom-[20%] right-[35%] w-1 h-1 bg-accent/30 rounded-full animate-float" style={{ animationDelay: '2.5s' }}></div>
        </div>
        
        {/* Subtle wave effect */}
        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-10">
          <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-primary/20 to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-up">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                  Proteção que você{' '}
                  <span className="relative inline-block">
                    <span className="text-primary animate-glow-pulse">confia</span>
                    <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-tech rounded-full"></span>
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Seguros personalizados para cada momento da sua vida. 
                  Simule, contrate e gerencie tudo online de forma simples e segura.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="relative bg-gradient-tech hover:scale-105 shadow-glow hover:shadow-glow-lg transition-all duration-300 group overflow-hidden"
                  onClick={() => {
                    setModalOpen(true);
                  }}
                >
                  <span className="relative z-10 font-semibold">Simular Agora</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-8">
                <div className="text-center group cursor-default">
                  <div className="text-3xl font-bold text-foreground group-hover:text-primary group-hover:scale-110 transition-all">50k+</div>
                  <div className="text-sm text-muted-foreground">Clientes</div>
                </div>
                <div className="w-px h-8 bg-gradient-to-b from-transparent via-border to-transparent"></div>
                <div className="text-center group cursor-default">
                  <div className="text-3xl font-bold text-foreground group-hover:text-primary group-hover:scale-110 transition-all">98%</div>
                  <div className="text-sm text-muted-foreground">Satisfação</div>
                </div>
                <div className="w-px h-8 bg-gradient-to-b from-transparent via-border to-transparent"></div>
                <div className="text-center group cursor-default">
                  <div className="text-3xl font-bold text-foreground group-hover:text-primary group-hover:scale-110 transition-all">24h</div>
                  <div className="text-sm text-muted-foreground">Suporte</div>
                </div>
              </div>
            </div>
            
            <div className="relative animate-scale-in">
              {/* Main image container - removed green overlays */}
              <div className="relative rounded-2xl overflow-hidden border border-border shadow-xl hover:shadow-2xl transition-shadow duration-500">
                <img 
                  src={heroImage} 
                  alt="Proteção e segurança" 
                  className="w-full"
                />
                
                {/* Tech frame effect - subtle corners only */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary/50 animate-pulse"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/50 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary/50 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary/50 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
              </div>
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
              <Card key={index} className="relative overflow-hidden hover:shadow-glow transition-all duration-300 group border-primary/10 hover:border-primary/30 bg-card/50 backdrop-blur-sm">
                {/* Animated gradient border effect */}
                <div className="absolute inset-0 bg-gradient-tech opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                
                {/* Glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-tech opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
                
                <CardContent className="relative p-6">
                  <div className="w-14 h-14 bg-gradient-tech rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-glow">
                    <service.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm group/item">
                        <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                        <span className="group-hover/item:text-foreground transition-colors">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
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
      <section className="py-20 bg-gradient-tech relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-glow-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-float"></div>
        </div>
        
        {/* Additional animated elements */}
        <div className="absolute inset-0">
          <div className="absolute top-[20%] right-[10%] w-3 h-3 bg-white/30 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-[30%] left-[15%] w-2 h-2 bg-white/30 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[60%] right-[20%] w-2.5 h-2.5 bg-white/30 rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="animate-float mb-6">
            <div className="inline-flex p-4 bg-white/10 backdrop-blur-sm rounded-full">
              <Shield className="h-16 w-16 text-primary-foreground drop-shadow-glow" />
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4 drop-shadow-lg">
            Pronto para se proteger?
          </h2>
          <p className="text-xl text-primary-foreground/95 mb-8 max-w-2xl mx-auto leading-relaxed">
            Faça uma simulação gratuita em menos de 2 minutos e descubra a proteção ideal para você
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-lg px-8 py-6 font-semibold"
            onClick={() => {
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
      />
    </div>
  );
}