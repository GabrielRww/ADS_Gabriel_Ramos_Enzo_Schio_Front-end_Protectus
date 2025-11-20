import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, FileText, MapPin, Clock, Activity } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { getDashboardAdmin, getSegurosPendentes } from '@/service';
import type { GetDashboardAdminRes, SegurosPendentesV2Res } from '@/service/interface';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseBrazilianDate } from '@/utils/functions';

export default function AdminDashboard() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'quarter'>('month');

  const diasAtraso = useMemo(() => {
    switch (period) {
      case 'today': return 1;
      case 'week': return 7;
      case 'month': return 30;
      case 'quarter': return 90;
      default: return 30;
    }
  }, [period]);

  const { data, isLoading, isError } = useQuery<GetDashboardAdminRes>({
    queryKey: ['dashboard-admin', diasAtraso],
    queryFn: () => getDashboardAdmin({ diasAtraso }),
  });

  interface DashboardMetric { title: string; value: string; icon: React.ComponentType<{ className?: string }>; color: string }
  const metrics: DashboardMetric[] = useMemo(() => {
    if (!data) return [];
    return [
      {
        title: 'Total de Clientes',
        value: String(data.clientes ?? 0),
        icon: Users,
        color: 'text-blue-600',
      },
      {
        title: 'Apólices Ativas',
        value: String(data.apolices ?? 0),
        icon: FileText,
        color: 'text-green-600',
      },
      {
        title: 'Rastreadores Ativos',
        value: String(data.rastreadores ?? 0),
        icon: MapPin,
        color: 'text-purple-600',
      },
    ];
  }, [data]);

  const {
    data: pendentesData,
    isLoading: loadingPendentes,
    isError: errorPendentes,
  } = useQuery<SegurosPendentesV2Res[]>({
    queryKey: ['seguros-pendentes-admin'],
    queryFn: () => getSegurosPendentes(),
  });

  const safeFormatRelative = useCallback((raw?: string): string => {
    if (!raw) return '—';
    const dateObj = parseBrazilianDate(raw) || (raw.includes('T') ? new Date(raw) : null);
    if (!dateObj || isNaN(dateObj.getTime())) return '—';
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: ptBR });
  }, []);

  const recentActivities = useMemo(() => {
    if (!pendentesData) return [] as Array<{ id: number; type: string; description: string; time: string; status: string }>; // no any
    return pendentesData
      .filter(p => p.status === '0')
      .slice(0, 5)
      .map(p => {
        const timeRel = safeFormatRelative(p.dtaSistema || p.inicioVigencia);
        return {
          id: p.apoliceId,
          type: 'Proposta Pendente',
          description: `${p.produtoNome} • ${p.desUsuario}`,
          time: timeRel,
          status: 'warning',
        };
      });
  }, [pendentesData, safeFormatRelative]);

  const pendingTasks = [
    { id: 1, task: "Revisar proposta #P001245", priority: "Alta", deadline: "Hoje" },
    { id: 2, task: "Análise de sinistro #S000567", priority: "Média", deadline: "Amanhã" },
    { id: 3, task: "Aprovação de desconto especial", priority: "Baixa", deadline: "Esta semana" },
    { id: 4, task: "Verificar documentos cliente #C001890", priority: "Alta", deadline: "Hoje" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.07)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.07)_1px,transparent_1px)] bg-[size:32px_32px] animate-grid-flow"></div>

        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-32 right-10 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[140px] animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-primary/3 rounded-full blur-[100px] animate-glow-pulse"></div>

        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
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

      <div className="space-y-8 relative">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
            <p className="text-muted-foreground">
              Visão geral das operações da Protectus Seguros
            </p>
          </div>

          {/* Filtros Rápidos */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mês</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
              </SelectContent>
            </Select>

          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {isLoading && (
            <>
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium h-4 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-6 bg-muted rounded w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </>
          )}
          {isError && (
            <Card className="p-4 col-span-3 border-red-400">
              <CardContent className="p-2 text-sm text-red-600">Erro ao carregar métricas do dashboard.</CardContent>
            </Card>
          )}
          {!isLoading && !isError && metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index} className="relative overflow-hidden group border-primary/10 hover:border-primary/30 bg-card/80 backdrop-blur-sm hover:shadow-glow transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium">
                    {metric.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-1 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {/* Atividades Recentes */}
          <Card className="bg-card/80 backdrop-blur-sm border-primary/10 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Atividades Recentes
              </CardTitle>
              <CardDescription>
                Últimas movimentações no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingPendentes && (
                <div className="text-sm text-muted-foreground">Carregando propostas pendentes...</div>
              )}
              {errorPendentes && (
                <div className="text-sm text-red-600">Erro ao carregar propostas pendentes.</div>
              )}
              {!loadingPendentes && !errorPendentes && recentActivities.length === 0 && (
                <div className="text-sm text-muted-foreground">Nenhuma proposta pendente.</div>
              )}
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start justify-between space-x-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.type}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                    <div className={`text-xs ${getStatusColor(activity.status)}`}>
                      <Clock className="inline h-3 w-3 mr-1" />
                      {activity.status === 'warning' ? 'Pendente' : activity.status}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>


          {/* Tarefas Pendentes */}
          {/* <Card className="bg-card/80 backdrop-blur-sm border-primary/10 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Tarefas Pendentes
                </CardTitle>
                <CardDescription>
                  Itens que precisam da sua atenção
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between space-x-4 p-3 rounded-lg border">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{task.task}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Prazo: {task.deadline}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Visualizar
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card> */}
        </div>
      </div>
    </div>
  );
}