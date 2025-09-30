import { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/authStore';
import { apiService, type User } from '@/lib/api';
import { Camera, Edit3, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ClientProfile() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '(11) 99999-9999',
    cpfCnpj: '123.456.789-00',
    address: 'Rua das Flores, 123 - São Paulo, SP'
  });
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatar);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSave = async () => {
    if (!user) return;
    // Monta payload mínimo esperado pelo backend; limpa campos numéricos
    const payload: Partial<User> & { telefone?: string; cpf?: string } = {
      name: formData.name,
      email: formData.email,
      address: formData.address,
      phone: formData.phone?.replace(/\D/g, ''),
      cpf: formData.cpfCnpj?.replace(/\D/g, ''),
      avatar: avatarUrl,
    };

    // Atualização local imediata para UX
    const updated: User = { ...user, ...payload } as User;
    try { localStorage.setItem('protectus-user', JSON.stringify(updated)); } catch {}
    // Se existir backend habilitado, tenta enviar
    const resp = await apiService.updateProfile(user.id, payload);
    if (resp.success) {
      // Se vier user do backend, usa ele; senão mantém o local
      const finalUser = (resp.data as User) || updated;
      try { localStorage.setItem('protectus-user', JSON.stringify(finalUser)); } catch {}
      // atualiza store para refletir no header imediatamente
      useAuthStore.setState({ user: finalUser });
      toast({ title: 'Perfil atualizado', description: 'Suas informações foram salvas com sucesso.' });
      setIsEditing(false);
    } else {
      // Mantém alteração local e avisa que ficou offline
      useAuthStore.setState({ user: updated });
      toast({ title: 'Alterações salvas localmente', description: 'Quando a API estiver disponível, faremos a sincronização.' });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: '(11) 99999-9999',
      cpfCnpj: '123.456.789-00',
      address: 'Rua das Flores, 123 - São Paulo, SP'
    });
    setAvatarUrl(user?.avatar);
    setIsEditing(false);
  };

  const onPickAvatar = () => fileInputRef.current?.click();

  const onAvatarChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    // Pré-visualização imediata
    const preview = URL.createObjectURL(file);
    setAvatarUrl(preview);
    // Upload opcionalmente no backend
    const resp = await apiService.uploadAvatar(user.id, file);
    if (resp.success && resp.data?.url) {
      setAvatarUrl(resp.data.url);
      const updated = { ...(user as any), avatar: resp.data.url } as User;
      try { localStorage.setItem('protectus-user', JSON.stringify(updated)); } catch {}
      useAuthStore.setState({ user: updated });
      toast({ title: 'Foto atualizada', description: 'Sua foto de perfil foi alterada.' });
    } else {
      const updated = { ...(user as any), avatar: preview } as User;
      useAuthStore.setState({ user: updated });
      toast({ title: 'Foto atualizada localmente', description: 'Ao habilitar a API de perfil, faremos o envio.' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
        </div>
        
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <Edit3 className="h-4 w-4" />
            Editar Perfil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Salvar
            </Button>
            <Button variant="outline" onClick={handleCancel} className="gap-2">
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Foto de Perfil */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Foto de Perfil</CardTitle>
            <CardDescription>
              Sua imagem de perfil aparecerá em todo o sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-2xl">
                  {user?.name?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="sm"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                  variant="secondary"
                  onClick={onPickAvatar}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            {isEditing && (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
                <Button variant="outline" size="sm" onClick={onPickAvatar}>
                  Alterar Foto
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Informações Pessoais */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>
              Seus dados pessoais e de contato
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              ) : (
                <p className="text-sm text-foreground bg-muted p-3 rounded-md">
                  {formData.name}
                </p>
              )}
            </div>

            <Separator />

            {/* E-mail */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              ) : (
                <p className="text-sm text-foreground bg-muted p-3 rounded-md">
                  {formData.email}
                </p>
              )}
            </div>

            <Separator />

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              ) : (
                <p className="text-sm text-foreground bg-muted p-3 rounded-md">
                  {formData.phone}
                </p>
              )}
            </div>

            <Separator />

            {/* CPF/CNPJ */}
            <div className="space-y-2">
              <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
              {isEditing ? (
                <Input
                  id="cpfCnpj"
                  value={formData.cpfCnpj}
                  onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
                />
              ) : (
                <p className="text-sm text-foreground bg-muted p-3 rounded-md">
                  {formData.cpfCnpj}
                </p>
              )}
            </div>

            <Separator />

            {/* Endereço */}
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              {isEditing ? (
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              ) : (
                <p className="text-sm text-foreground bg-muted p-3 rounded-md">
                  {formData.address}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações Adicionais */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Configurações da Conta</CardTitle>
          <CardDescription>
            Configurações de segurança e privacidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Alterar Senha</h4>
              <p className="text-sm text-muted-foreground">
                Última alteração há 3 meses
              </p>
            </div>
            <Button variant="outline" size="sm">
              Alterar
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Notificações por E-mail</h4>
              <p className="text-sm text-muted-foreground">
                Receber atualizações sobre suas apólices
              </p>
            </div>
            <Button variant="outline" size="sm">
              Configurar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}