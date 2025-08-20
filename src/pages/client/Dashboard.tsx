import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Car, Home, Smartphone, Plus, FileText, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ClientDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-primary rounded-lg p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold mb-2">Bem-vindo de volta!</h1>
        <p className="opacity-90">
          Gerencie seus seguros e mantenha-se protegido com a Perfectus.
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
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center">
                  <Car className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="font-medium">Seguro Auto - Honda Civic</h3>
                  <p className="text-sm text-muted-foreground">ABC-1234</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-success-light text-success">Ativo</Badge>
                <p className="text-sm text-muted-foreground mt-1">Vence em 23/05/2025</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Seguro Residencial</h3>
                  <p className="text-sm text-muted-foreground">Rua das Flores, 123</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-success-light text-success">Ativo</Badge>
                <p className="text-sm text-muted-foreground mt-1">Vence em 15/08/2025</p>
              </div>
            </div>
          </div>
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
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warning-light rounded-lg flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <h3 className="font-medium">Seguro Celular - iPhone 14</h3>
                  <p className="text-sm text-muted-foreground">Proposta #12345</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="border-warning text-warning">
                  Em Análise
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">Enviada em 10/12/2024</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">2</p>
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
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Proposta Pendente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Rastreador Ativo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}