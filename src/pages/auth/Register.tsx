import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore, UserRole, type RegisterData } from '@/store/authStore';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const role: UserRole = 'cliente'; // Sempre cliente por padrão
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, isLoading: authLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro na validação",
        description: "As senhas não coincidem."
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Erro na validação",
        description: "A senha deve ter pelo menos 6 caracteres."
      });
      return;
    }

    setIsLoading(true);

    const userData: RegisterData = {
      name,
      email,
      password,
      phone,
      cpf,
      cep,
      address,
      role
    };

    const success = await register(userData);
    
    if (success) {
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Bem-vindo à Protectus Seguros."
      });
      navigate('/dashboard');
    } else {
      const { error } = useAuthStore.getState();
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: error || "Ocorreu um erro. Tente novamente."
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced animated background with multiple layers */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.04)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.04)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] animate-grid-flow" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--accent)/0.02)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--accent)/0.02)_1px,transparent_1px)] bg-[size:8rem_8rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)]" />
      
      {/* Enhanced gradient orbs with more layers */}
      <div className="absolute top-0 -left-4 w-[500px] h-[500px] bg-primary/25 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob" />
      <div className="absolute top-0 -right-4 w-[500px] h-[500px] bg-accent/25 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-[500px] h-[500px] bg-primary/15 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-full filter blur-[120px] opacity-30 animate-pulse" />
      
      {/* Enhanced floating particles with varied sizes and colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${i % 3 === 0 ? 'bg-primary/15' : i % 3 === 1 ? 'bg-accent/15' : 'bg-primary/10'}`}
            style={{
              width: `${Math.random() * 8 + 2}px`,
              height: `${Math.random() * 8 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 15}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              boxShadow: i % 4 === 0 ? '0 0 20px hsl(var(--primary)/0.3)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative backdrop-blur-sm hover:bg-primary/10 transition-all duration-300"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </div>

      <div className="w-full max-w-md space-y-8 animate-fade-in relative z-10">
        {/* Enhanced Logo */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              {/* Multiple glow layers */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-xl opacity-30 animate-pulse animation-delay-1000" />
              
              {/* Logo container */}
              <div className="relative w-24 h-24 bg-gradient-to-br from-primary via-primary to-accent rounded-full flex items-center justify-center shadow-2xl shadow-primary/50 group-hover:shadow-primary/70 transition-all duration-500 group-hover:scale-110 border border-primary/20">
                <Shield className="h-12 w-12 text-primary-foreground drop-shadow-lg" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
              Protectus Seguros
            </h1>
            <p className="text-base text-muted-foreground font-medium">Crie sua conta e proteja o que é seu</p>
          </div>
        </div>

        {/* Enhanced Register Form with advanced effects */}
        <Card className="backdrop-blur-xl bg-card/90 border-primary/30 shadow-2xl hover:shadow-primary/25 transition-all duration-500 hover:border-primary/40 relative group overflow-hidden">
          {/* Animated gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-lg blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-700 -z-10" />
          
          <CardHeader className="space-y-3 pb-6 relative">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent animate-fade-in">
              Cadastrar
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground/90">
              Preencha os dados para criar sua conta
            </CardDescription>
            {/* Decorative line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </CardHeader>
          <CardContent className="relative">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2 group/field">
                <Label htmlFor="name" className="text-sm font-semibold text-foreground/90 group-focus-within/field:text-primary transition-colors duration-200">
                  Nome Completo
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-11 bg-background/60 backdrop-blur-sm border-primary/20 focus:border-primary/50 focus:bg-background/80 transition-all duration-300 focus:shadow-lg focus:shadow-primary/10 hover:border-primary/30"
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-focus-within/field:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2 group/field">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground/90 group-focus-within/field:text-primary transition-colors duration-200">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 bg-background/60 backdrop-blur-sm border-primary/20 focus:border-primary/50 focus:bg-background/80 transition-all duration-300 focus:shadow-lg focus:shadow-primary/10 hover:border-primary/30"
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-focus-within/field:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 group/field">
                  <Label htmlFor="phone" className="text-sm font-semibold text-foreground/90 group-focus-within/field:text-primary transition-colors duration-200">
                    Telefone
                  </Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="h-11 bg-background/60 backdrop-blur-sm border-primary/20 focus:border-primary/50 focus:bg-background/80 transition-all duration-300 focus:shadow-lg focus:shadow-primary/10 hover:border-primary/30"
                    />
                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-focus-within/field:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>
                
                <div className="space-y-2 group/field">
                  <Label htmlFor="cpf" className="text-sm font-semibold text-foreground/90 group-focus-within/field:text-primary transition-colors duration-200">
                    CPF
                  </Label>
                  <div className="relative">
                    <Input
                      id="cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      required
                      className="h-11 bg-background/60 backdrop-blur-sm border-primary/20 focus:border-primary/50 focus:bg-background/80 transition-all duration-300 focus:shadow-lg focus:shadow-primary/10 hover:border-primary/30"
                    />
                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-focus-within/field:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 group/field">
                  <Label htmlFor="cep" className="text-sm font-semibold text-foreground/90 group-focus-within/field:text-primary transition-colors duration-200">
                    CEP
                  </Label>
                  <div className="relative">
                    <Input
                      id="cep"
                      type="text"
                      placeholder="00000-000"
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                      required
                      className="h-11 bg-background/60 backdrop-blur-sm border-primary/20 focus:border-primary/50 focus:bg-background/80 transition-all duration-300 focus:shadow-lg focus:shadow-primary/10 hover:border-primary/30"
                    />
                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-focus-within/field:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>
                
                <div className="space-y-2 group/field">
                  <Label htmlFor="address" className="text-sm font-semibold text-foreground/90 group-focus-within/field:text-primary transition-colors duration-200">
                    Endereço
                  </Label>
                  <div className="relative">
                    <Input
                      id="address"
                      type="text"
                      placeholder="Sua rua, número"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      className="h-11 bg-background/60 backdrop-blur-sm border-primary/20 focus:border-primary/50 focus:bg-background/80 transition-all duration-300 focus:shadow-lg focus:shadow-primary/10 hover:border-primary/30"
                    />
                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-focus-within/field:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2 group/field">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground/90 group-focus-within/field:text-primary transition-colors duration-200">
                  Senha
                </Label>
                <div className="relative">
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua senha (mínimo 6 caracteres)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 bg-background/60 backdrop-blur-sm border-primary/20 focus:border-primary/50 focus:bg-background/80 transition-all duration-300 focus:shadow-lg focus:shadow-primary/10 hover:border-primary/30 pr-12"
                    />
                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-focus-within/field:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent hover:text-primary transition-colors duration-200 z-10"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2 group/field">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground/90 group-focus-within/field:text-primary transition-colors duration-200">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirme sua senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-11 bg-background/60 backdrop-blur-sm border-primary/20 focus:border-primary/50 focus:bg-background/80 transition-all duration-300 focus:shadow-lg focus:shadow-primary/10 hover:border-primary/30 pr-12"
                    />
                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-focus-within/field:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent hover:text-primary transition-colors duration-200 z-10"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:via-primary/90 hover:to-accent/90 text-primary-foreground font-bold text-base shadow-lg hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 relative overflow-hidden group mt-2 hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading || authLoading}
              >
                {/* Shimmer effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {/* Glow effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                <span className="relative flex items-center justify-center gap-2">
                  {(isLoading || authLoading) ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span className="animate-pulse">Cadastrando...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Criar Conta
                    </>
                  )}
                </span>
              </Button>
            </form>

            <div className="mt-6 text-center relative">
              {/* Decorative line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent -mt-3" />
              <p className="text-sm text-muted-foreground pt-3">
                Já tem uma conta?{' '}
                <Link 
                  to="/login" 
                  className="text-primary hover:text-primary/80 font-bold transition-all duration-200 hover:underline underline-offset-4 inline-flex items-center gap-1 group"
                >
                  Entrar
                  <span className="inline-block transition-transform group-hover:translate-x-1 duration-200">→</span>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}