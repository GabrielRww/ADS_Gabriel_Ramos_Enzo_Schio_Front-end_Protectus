import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSimulation } from '../hooks/useApi';

interface SimulationFormProps {
  tipoSeguro: 'veiculo' | 'residencial' | 'celular';
  onSuccess?: (data: any) => void;
}

export function SimulationForm({ tipoSeguro, onSuccess }: SimulationFormProps) {
  const [formData, setFormData] = useState<any>({});
  const { simulate, loading, error } = useSimulation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const simulationData = {
      type: tipoSeguro,
      ...formData
    };

    const result = await simulate(simulationData);
    
    if (result) {
      toast({
        title: "Simulação realizada com sucesso!",
        description: `Valor estimado: R$ ${result.value}`
      });
      onSuccess?.(result);
    } else {
      toast({
        variant: "destructive",
        title: "Erro na simulação",
        description: error || "Tente novamente"
      });
    }
  };

  const renderVeiculoForm = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="marca">Marca do Veículo</Label>
        <Input
          id="marca"
          placeholder="Ex: Toyota, Ford, Volkswagen"
          value={formData.marca || ''}
          onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="modelo">Modelo</Label>
        <Input
          id="modelo"
          placeholder="Ex: Corolla, Focus, Gol"
          value={formData.modelo || ''}
          onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ano">Ano</Label>
          <Input
            id="ano"
            type="number"
            placeholder="2020"
            min="1900"
            max={new Date().getFullYear() + 1}
            value={formData.ano || ''}
            onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="valor">Valor do Veículo (R$)</Label>
          <Input
            id="valor"
            type="number"
            placeholder="50000"
            value={formData.valor || ''}
            onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cep">CEP</Label>
        <Input
          id="cep"
          placeholder="00000-000"
          value={formData.cep || ''}
          onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
          required
        />
      </div>
    </>
  );

  const renderResidencialForm = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="tipo_imovel">Tipo de Imóvel</Label>
        <Select onValueChange={(value) => setFormData({ ...formData, tipo_imovel: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="casa">Casa</SelectItem>
            <SelectItem value="apartamento">Apartamento</SelectItem>
            <SelectItem value="sobrado">Sobrado</SelectItem>
            <SelectItem value="kitnet">Kitnet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="area">Área (m²)</Label>
          <Input
            id="area"
            type="number"
            placeholder="100"
            value={formData.area || ''}
            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="valor_imovel">Valor do Imóvel (R$)</Label>
          <Input
            id="valor_imovel"
            type="number"
            placeholder="300000"
            value={formData.valor_imovel || ''}
            onChange={(e) => setFormData({ ...formData, valor_imovel: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cep">CEP</Label>
        <Input
          id="cep"
          placeholder="00000-000"
          value={formData.cep || ''}
          onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
          required
        />
      </div>
    </>
  );

  const renderCelularForm = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="marca_celular">Marca do Celular</Label>
        <Input
          id="marca_celular"
          placeholder="Ex: Apple, Samsung, Xiaomi"
          value={formData.marca_celular || ''}
          onChange={(e) => setFormData({ ...formData, marca_celular: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="modelo_celular">Modelo</Label>
        <Input
          id="modelo_celular"
          placeholder="Ex: iPhone 14, Galaxy S23"
          value={formData.modelo_celular || ''}
          onChange={(e) => setFormData({ ...formData, modelo_celular: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ano_compra">Ano de Compra</Label>
          <Input
            id="ano_compra"
            type="number"
            placeholder="2023"
            min="2010"
            max={new Date().getFullYear()}
            value={formData.ano_compra || ''}
            onChange={(e) => setFormData({ ...formData, ano_compra: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="valor_celular">Valor do Celular (R$)</Label>
          <Input
            id="valor_celular"
            type="number"
            placeholder="2000"
            value={formData.valor_celular || ''}
            onChange={(e) => setFormData({ ...formData, valor_celular: e.target.value })}
            required
          />
        </div>
      </div>
    </>
  );

  const renderForm = () => {
    switch (tipoSeguro) {
      case 'veiculo':
        return renderVeiculoForm();
      case 'residencial':
        return renderResidencialForm();
      case 'celular':
        return renderCelularForm();
      default:
        return null;
    }
  };

  const getTitulo = () => {
    switch (tipoSeguro) {
      case 'veiculo':
        return 'Seguro Veicular';
      case 'residencial':
        return 'Seguro Residencial';
      case 'celular':
        return 'Seguro Celular';
      default:
        return 'Simulação';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulação - {getTitulo()}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderForm()}
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Simulando...' : 'Simular Seguro'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}