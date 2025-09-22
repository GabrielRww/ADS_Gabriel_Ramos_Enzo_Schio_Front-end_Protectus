import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Car, Home, Smartphone, Plus, FileText, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function ClientDashboard() {
  const { user } = useAuthStore();
  
  // Dados ilustrativos apenas para o usuário João
  const isJoaoUser = user?.email === 'joao@email.com';
  
  const mockPolicies = isJoaoUser ? [
    {
      id: '1',
      type: 'auto',
      title: 'Seguro Auto - Honda Civic',
      subtitle: 'ABC-1234',
      icon: Car,
      status: 'Ativo',
      expiryDate: '23/05/2025'
    },
    {
      id: '2',
      type: 'residencial',
      title: 'Seguro Residencial',
      subtitle: 'Rua das Flores, 123',
      icon: Home,
      status: 'Ativo',
      expiryDate: '15/08/2025'
    }
  ] : [];

  const mockProposals = isJoaoUser ? [
    {
      id: '1',
      title: 'Seguro Celular - iPhone 14',
      subtitle: 'Proposta #12345',
      icon: Smartphone,
      status: 'Em Análise',
      date: '10/12/2024'
    }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-primary rounded-lg p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold mb-2">
          Bem-vindo{user?.name ? ', ' + user.name.split(' ')[0] : ''} de volta!
        </h1>
        <p className="opacity-90">
          Gerencie seus seguros e mantenha-se protegido com a Protectus.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          asChild 
          className="h-auto p-4 bg-gradient-primary hover:bg-primary-hover"
        >
          <Link to="/simulacao" className="flex flex-col items-center space-y-2">
            <Plus className="h-6 w-6" />
            <span>Simular Novo Seguro</span>
          </Link>
        </Button>
        
        <Button 
          asChild 
          variant="outline" 
          className="h-auto p-4"
        >
          <Link to="/apolices" className="flex flex-col items-center space-y-2">
            <FileText className="h-6 w-6" />
            <span>Minhas Apólices</span>
          </Link>
        </Button>
        
        <Button 
          asChild 
          variant="outline" 
          className="h-auto p-4"
        >
          <Link to="/rastreamento" className="flex flex-col items-center space-y-2">
            <MapPin className="h-6 w-6" />
            <span>Rastreamento</span>
          </Link>
        </Button>
      </div>

      {/* Active Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Apólices Ativas
          </CardTitle>
          <CardDescription>
            Seus seguros ativos e em vigor
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mockPolicies.length > 0 ? (
            <div className="space-y-4">
              {mockPolicies.map((policy) => {
                const IconComponent = policy.icon;
                return (
                  <div key={policy.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <h3 className="font-medium">{policy.title}</h3>
                        <p className="text-sm text-muted-foreground">{policy.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-success-light text-success">{policy.status}</Badge>
                      <p className="text-sm text-muted-foreground mt-1">Vence em {policy.expiryDate}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma apólice encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Você ainda não possui seguros ativos. Que tal simular um novo seguro?
              </p>
              <Button asChild>
                <Link to="/simulacao">
                  <Plus className="h-4 w-4 mr-2" />
                  Simular Seguro
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Proposals */}
      <Card>
        <CardHeader>
          <CardTitle>Propostas Recentes</CardTitle>
          <CardDescription>
            Acompanhe o status das suas solicitações
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mockProposals.length > 0 ? (
            <div className="space-y-4">
              {mockProposals.map((proposal) => {
                const IconComponent = proposal.icon;
                return (
                  <div key={proposal.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-warning-light rounded-lg flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <h3 className="font-medium">{proposal.title}</h3>
                        <p className="text-sm text-muted-foreground">{proposal.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="border-warning text-warning">
                        {proposal.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">Enviada em {proposal.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma proposta encontrada</h3>
              <p className="text-muted-foreground">
                Você ainda não possui propostas de seguro.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{mockPolicies.length}</p>
                <p className="text-sm text-muted-foreground">Apólices Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{mockProposals.length}</p>
                <p className="text-sm text-muted-foreground">Proposta{mockProposals.length !== 1 ? 's' : ''} Pendente{mockProposals.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{isJoaoUser ? 1 : 0}</p>
                <p className="text-sm text-muted-foreground">Rastreador{isJoaoUser ? ' Ativo' : 'es Ativos'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}