import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import protectusLogo from '@/assets/protectus-logo-complete.png';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { Notifications } from './Notifications';
import SimulacaoModal from '../SimulacaoModal';

interface NavigationItem {
  name: string;
  href?: string;
  action?: () => void;
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [tipoSeguro, setTipoSeguro] = useState<'veiculo' | 'residencial' | 'celular'>('veiculo');
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSimularSeguro = () => {
    setModalOpen(true);
    setMobileMenuOpen(false);
  };

  const clientNavigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Simular Seguro', action: handleSimularSeguro },
    { name: 'Minhas Apólices', href: '/apolices' },
    { name: 'Rastreamento', href: '/rastreamento' }
  ];

  const employeeNavigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Funcionários', href: '/admin/clientes' },
    { name: 'Propostas', href: '/admin/propostas' },
    { name: 'Rastreadores', href: '/admin/rastreadores' }
  ];

  const navigation = user?.role === 'gerente' ? employeeNavigation : clientNavigation;

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src={protectusLogo}
                alt="Protectus Seguros" 
                className="h-20 w-auto transition-all duration-300 hover:scale-105 dark:brightness-125 dark:contrast-110"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              item.href ? (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  {item.name}
                </Link>
              ) : (
                <button
                  key={item.name}
                  onClick={item.action}
                  className="text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  {item.name}
                </button>
              )
            ))}
          </nav>

          {/* User Menu */}
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

            {/* Notifications */}
            <Notifications />

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-muted-foreground">{user?.email}</div>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {user?.role === 'gerente' ? 'Gerente' : user?.role === 'funcionario' ? 'Funcionário' : 'Cliente'}
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={user?.role === 'gerente' ? '/admin/perfil' : '/perfil'} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="space-y-2">
              {navigation.map((item) => (
                item.href ? (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <button
                    key={item.name}
                    onClick={item.action}
                    className="w-full text-left block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                  >
                    {item.name}
                  </button>
                )
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Modal de Simulação */}
      <SimulacaoModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        tipoSeguro={tipoSeguro} 
      />
    </header>
  );
}