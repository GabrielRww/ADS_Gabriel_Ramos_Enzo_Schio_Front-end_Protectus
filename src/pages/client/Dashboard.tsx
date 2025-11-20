import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Car, Home, Smartphone, Plus, FileText, MapPin, House } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getSegurosByCpf } from '@/service';
import { useQuery } from '@tanstack/react-query';
import Apolices from './Apolices';

export default function ClientDashboard() {
  const { user } = useAuthStore();

  const query = useQuery({
    queryKey: ['seguros-pendentes-by-cpf', user?.cpf],
    queryFn: () => getSegurosByCpf({ cpfCliente: user?.cpf }),
    enabled: !!user?.cpf,
  });

  if (query.isLoading) return <div>Carregando propostas...</div>;
  if (query.isError) return <div>Erro ao carregar propostas.</div>;

  const getTypeIcon = (type: number) => {
    switch (type) {
      case 1: return Car;
      case 2: return Smartphone;
      case 3: return House;
      default: return undefined;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case '0': return 'Em Análise';
      case '1': return 'Aprovada';
      case '2': return 'Rejeitada';
    }
  };

  const pendentes = query.data.segurosPendentes;
  const apolices = query.data.segurosAtivos

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.07)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.07)_1px,transparent_1px)] bg-[size:32px_32px] animate-grid-flow"></div>

        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-32 right-10 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[140px] animate-float" style={{ animationDelay: '2s' }}></div>

        {[...Array(12)].map((_, i) => (
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
        {/* Welcome Section */}
        <div className="bg-gradient-primary rounded-lg p-6 text-primary-foreground animate-fade-in shadow-glow">
          <h1 className="text-2xl font-bold mb-2">
            Olá{user?.nome ? ' ' + user.nome.split(' ')[0] + ',' : ''} bem-vindo(a)!
          </h1>
          <p className="opacity-90">
            Gerencie seus seguros e mantenha-se protegido com a Protectus.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Card className="hover:shadow-glow transition-all duration-300 cursor-pointer group bg-card/80 backdrop-blur-sm border-primary/10 hover:border-primary/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Link to="/apolices" className="block p-6 relative z-10">
              <div className="flex flex-col items-center space-y-2 text-center">
                <FileText className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-medium">Minhas Apólices</span>
              </div>
            </Link>
          </Card>

          <Card className="hover:shadow-glow transition-all duration-300 cursor-pointer group bg-card/80 backdrop-blur-sm border-primary/10 hover:border-primary/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Link to="/rastreamento" className="block p-6 relative z-10">
              <div className="flex flex-col items-center space-y-2 text-center">
                <MapPin className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-medium">Rastreamento</span>
              </div>
            </Link>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <Card className="bg-card/80 backdrop-blur-sm border-primary/10 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{apolices.length}</p>
                  <p className="text-sm text-muted-foreground">Apólices Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-primary/10 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold">{pendentes.length}</p>
                  <p className="text-sm text-muted-foreground">Proposta{pendentes.length !== 1 ? 's' : ''} Pendente{pendentes.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-primary/10 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <MapPin className="h-8 w-8 text-success" />
                <div>
                  <p className="text-2xl font-bold">{0}</p>
                  <p className="text-sm text-muted-foreground">Rastreador Ativo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Policies */}
        <Card className="bg-card/80 backdrop-blur-sm border-primary/10 hover:border-primary/20 hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
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
            {apolices.length > 0 ? (
              <div className="space-y-4">
                {apolices.map((policy) => {
                  const IconComponent = getTypeIcon(policy.idSeguro);
                  return (
                    <div key={policy.apoliceId} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center">
                          <IconComponent className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <h3 className="font-medium">{policy.produtoNome}</h3>
                          <p className="text-sm text-muted-foreground">{policy.produtoSegurado}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-success-light text-success">{getStatusLabel(policy.status)}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">Vence em {policy.fimVigencia}</p>
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

        {/* Recent Proposals */}
        <Card className="bg-card/80 backdrop-blur-sm border-primary/10 hover:border-primary/20 hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle>Propostas Recentes</CardTitle>
            <CardDescription>
              Acompanhe o status das suas solicitações
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendentes.length > 0 ? (
              <div className="space-y-4">
                {pendentes.map((proposal) => {
                  const IconComponent = getTypeIcon(proposal.idSeguro);
                  return (
                    <div key={proposal.apoliceId} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-warning-light rounded-lg flex items-center justify-center">
                          <IconComponent className="h-5 w-5 text-warning" />
                        </div>
                        <div>
                          <h3 className="font-medium">{proposal.produtoNome}</h3>
                          <p className="text-sm text-muted-foreground">{proposal.produtoSegurado}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="border-warning text-warning">
                          {getStatusLabel(proposal.status)}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">Enviada em {proposal.dtaSistema}</p>
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
      </div>
    </div>
  );
}