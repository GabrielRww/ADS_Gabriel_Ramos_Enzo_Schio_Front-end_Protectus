import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Car, Home, Smartphone, Plus, FileText, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { usePolicies } from '@/hooks/usePolicies';

export default function ClientDashboard() {
  const { user } = useAuthStore();
  const { policies, stats } = usePolicies();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-primary rounded-lg p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold mb-2">
          Olá{user?.name ? ' ' + user.name.split(' ')[0] + ',' : ''} bem-vindo!
        </h1>
        <p className="opacity-90">
          Gerencie seus seguros e mantenha-se protegido com a Protectus.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          {policies.filter(p => p.status === 'Ativo').length > 0 ? (
            <div className="space-y-4">
              {policies.filter(p => p.status === 'Ativo').map((p) => {
                const Icon = p.tipo === 'Veículo' ? Car : p.tipo === 'Residencial' ? Home : Smartphone;
                return (
                  <div key={p.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <h3 className="font-medium">{p.tipo}</h3>
                        <p className="text-sm text-muted-foreground">{p.objeto}</p>
                        <p className="text-xs text-muted-foreground">Vigência: {p.vigencia}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-success-light text-success">{p.status}</Badge>
                      <p className="text-sm text-muted-foreground mt-1">{p.valor}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma apólice encontrada</h3>
              <p className="text-muted-foreground">
                Você ainda não possui seguros ativos.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Proposals (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Propostas Recentes</CardTitle>
          <CardDescription>
            Acompanhe o status das suas solicitações
          </CardDescription>
        </CardHeader>
        <CardContent>
          {false ? (
            <div className="space-y-4">
              {/* Implementar quando houver endpoint real de propostas */}
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
                <p className="text-2xl font-bold">{stats.total}</p>
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
                <p className="text-2xl font-bold">{stats.pendentes}</p>
                <p className="text-sm text-muted-foreground">Propostas Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{stats.ativas}</p>
                <p className="text-sm text-muted-foreground">Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}