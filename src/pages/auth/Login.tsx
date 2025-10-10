import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Shield, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, isLoading: authLoading, error } = useAuthStore();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password);
    
    if (success) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo à Protectus Seguros."
      });
      navigate(from, { replace: true });
    } else {
      const { error } = useAuthStore.getState();
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: error || "Email ou senha incorretos."
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.05)_1px,transparent_1px)] bg-[size:48px_48px] animate-grid-flow"></div>
      
      {/* Multiple layered glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl animate-glow-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-accent/20 via-accent/10 to-transparent rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
      </div>
      
      {/* Animated flowing lines with gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-shimmer"></div>
        <div className="absolute top-40 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent animate-shimmer" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/25 to-transparent animate-shimmer" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/15 to-transparent animate-shimmer" style={{ animationDelay: '3s' }}></div>
      </div>
      
      {/* Enhanced floating particles with different sizes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-[8%] w-3 h-3 bg-primary/20 rounded-full animate-float blur-sm"></div>
        <div className="absolute top-32 right-[12%] w-2 h-2 bg-accent/25 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-[45%] left-[15%] w-1.5 h-1.5 bg-primary/30 rounded-full animate-float blur-sm" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-40 left-[18%] w-2.5 h-2.5 bg-primary/15 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[55%] right-[20%] w-1 h-1 bg-accent/30 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-[25%] left-[25%] w-2 h-2 bg-accent/20 rounded-full animate-float blur-sm" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute top-[70%] right-[30%] w-1.5 h-1.5 bg-primary/25 rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
      </div>
      
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative backdrop-blur-sm"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </div>

      <div className="w-full max-w-md space-y-8 animate-scale-in relative z-10">
        {/* Enhanced Logo */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative group">
              {/* Multiple layered glow effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-primary/60 to-primary/40 rounded-full blur-3xl opacity-60 animate-glow-pulse group-hover:opacity-80 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-primary/30 rounded-full blur-2xl opacity-40 animate-glow-pulse" style={{ animationDelay: '1s' }}></div>
              
              {/* Logo container with enhanced styling */}
              <div className="relative w-20 h-20 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center shadow-2xl ring-2 ring-primary/20 ring-offset-4 ring-offset-background group-hover:scale-110 transition-transform duration-500">
                <Shield className="h-10 w-10 text-primary-foreground drop-shadow-lg animate-pulse" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Protectus Seguros
            </h1>
            <p className="text-muted-foreground text-lg font-medium">Acesse sua conta</p>
          </div>
        </div>

        {/* Enhanced Login Form */}
        <Card className="relative overflow-hidden border-primary/30 shadow-2xl backdrop-blur-xl bg-card/98 group hover:shadow-glow transition-all duration-500">
          {/* Multiple animated gradient effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-lg blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-700"></div>
          
          <CardHeader className="relative space-y-2 pb-6">
            <CardTitle className="text-2xl font-bold text-foreground">Bem-vindo de volta</CardTitle>
            <CardDescription className="text-base">
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 text-base border-border/60 focus:border-primary focus:ring-primary/20 transition-all duration-300 bg-background/50"
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">Senha</Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 text-base pr-12 border-border/60 focus:border-primary focus:ring-primary/20 transition-all duration-300 bg-background/50"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-primary/10 transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 relative bg-gradient-to-r from-primary via-primary/95 to-primary/90 hover:from-primary/95 hover:via-primary/90 hover:to-primary/85 text-primary-foreground font-semibold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group overflow-hidden mt-6"
                disabled={isLoading || authLoading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {(isLoading || authLoading) ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                      Entrando...
                    </>
                  ) : (
                    'Entrar na Conta'
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Não tem uma conta?{' '}
                <Link 
                  to="/cadastro" 
                  className="text-primary hover:text-primary/80 font-semibold transition-all duration-300 relative group inline-block"
                >
                  Cadastre-se agora
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300"></span>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}