import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Car, Home, Smartphone, Star, CheckCircle, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-family-protection.jpg';
import protectusLogo from '@/assets/protectus-logo-complete.png';
import protectusIcon from '@/assets/protectus-icon.png';
import SimulacaoModal from '@/components/SimulacaoModal';

export default function Landing() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Verificar se há tema salvo no localStorage ou preferência do sistema
    const savedTheme = localStorage.getItem('protectus-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    // Verificar preferência do sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [tipoSeguro, setTipoSeguro] = useState<'veiculo' | 'residencial' | 'celular'>('veiculo');

  // Aplicar tema ao documentRoot e salvar no localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('protectus-theme', theme);
  }, [theme]);

  // Função para alternar tema
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };
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
                onClick={toggleTheme}
                className="relative"
              >
                <Sun className={`h-5 w-5 transition-all ${theme === 'dark' ? '-rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
                <Moon className={`absolute h-5 w-5 transition-all ${theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
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
      <section className="relative bg-gradient-to-br from-background via-background to-primary/5 py-24 overflow-hidden">
        {/* Enhanced Animated Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808018_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)] bg-[size:32px_32px] animate-[gradient-shift_20s_ease_infinite]"></div>
        
        {/* Radial gradient overlays */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-glow-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Animated flowing lines */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-shimmer"></div>
          <div className="absolute top-40 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-shimmer" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-32 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent animate-shimmer" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Enhanced floating particles */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-[10%] w-3 h-3 bg-primary/50 rounded-full animate-float shadow-glow"></div>
          <div className="absolute top-40 right-[15%] w-2 h-2 bg-accent/50 rounded-full animate-float shadow-glow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-32 left-[20%] w-2.5 h-2.5 bg-primary/40 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/3 right-[25%] w-1.5 h-1.5 bg-primary/50 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-[60%] left-[30%] w-2 h-2 bg-accent/45 rounded-full animate-float shadow-glow" style={{ animationDelay: '3s' }}></div>
          <div className="absolute bottom-[20%] right-[35%] w-1.5 h-1.5 bg-primary/40 rounded-full animate-float" style={{ animationDelay: '2.5s' }}></div>
          <div className="absolute top-[15%] left-[40%] w-2 h-2 bg-accent/35 rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
        </div>
        
        {/* Elegant wave effect */}
        <div className="absolute bottom-0 left-0 right-0 h-40 opacity-20">
          <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-primary/30 via-primary/10 to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-up">
              <div>
                <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
                  Proteção que você{' '}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-glow-pulse">confia</span>
                    <span className="absolute -bottom-2 left-0 w-full h-1.5 bg-gradient-tech rounded-full shadow-glow"></span>
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
                  Seguros personalizados para cada momento da sua vida. 
                  <span className="text-foreground font-semibold"> Simule, contrate e gerencie</span> tudo online de forma simples e segura.
                </p>
              </div>
            </div>
            
            <div className="relative animate-scale-in">
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 z-20 bg-gradient-tech text-primary-foreground px-6 py-3 rounded-full shadow-glow animate-float">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-bold">Proteção Garantida</span>
                </div>
              </div>
              
              {/* Main image container */}
              <div className="relative rounded-3xl overflow-hidden border-2 border-primary/20 shadow-2xl hover:shadow-glow-lg hover:border-primary/40 transition-all duration-500 group">
                <img 
                  src={heroImage} 
                  alt="Proteção e segurança para sua família" 
                  className="w-full group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Enhanced tech frame effect */}
                <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-primary/60 animate-pulse group-hover:border-primary transition-colors rounded-tl-lg"></div>
                <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-primary/60 animate-pulse group-hover:border-primary transition-colors rounded-tr-lg" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-primary/60 animate-pulse group-hover:border-primary transition-colors rounded-bl-lg" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-primary/60 animate-pulse group-hover:border-primary transition-colors rounded-br-lg" style={{ animationDelay: '1.5s' }}></div>
                
                {/* Elegant animated glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/0 via-primary/10 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Subtle inner shadow for depth */}
                <div className="absolute inset-0 shadow-inner"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <span className="text-sm font-semibold text-primary">Proteção Completa</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Nossos <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Seguros</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Encontre a proteção ideal para o que mais importa na sua vida, com cobertura completa e atendimento 24 horas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-glow-lg hover:-translate-y-2 transition-all duration-500 group border-2 border-primary/10 hover:border-primary/40 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                {/* Animated gradient border effect */}
                <div className="absolute inset-0 bg-gradient-tech opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                
                {/* Enhanced glow effect */}
                <div className="absolute -inset-1 bg-gradient-tech opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500"></div>
                
                {/* Floating indicator */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <CardContent className="relative p-8">
                  <div className="w-16 h-16 bg-gradient-tech rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-glow">
                    <service.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm group/item">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mr-3 group-hover/item:bg-primary/20 transition-colors">
                          <CheckCircle className="h-3.5 w-3.5 text-primary group-hover/item:scale-110 transition-transform" />
                        </div>
                        <span className="group-hover/item:text-foreground group-hover/item:translate-x-1 transition-all">{feature}</span>
                      </li>
                    ))}
                  </ul>
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