import { useEffect, useRef, useState } from 'react';
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
import { debugUserData } from '@/utils/debugUser';

export function ClientProfile() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado para detectar mudanças não salvas
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Debug completo ao montar
  useEffect(() => {
    console.log('Profile: Componente montado com user', user);
    debugUserData();
  }, []);
  
  // Helpers de formatação
  const onlyDigits = (v: string) => (v || '').replace(/\D/g, '');
  const fmtPhone = (v?: string) => {
    const d = onlyDigits(v || '').slice(0, 11);
    if (!d) return '';
    if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
  };
  const fmtCpf = (v?: string) => {
    const d = onlyDigits(v || '').slice(0, 11);
    if (!d) return '';
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4').trim();
  };

  const composeAddress = (u?: typeof user) => {
    if (!u) return '';
    const base = [u.address, u.addressNumber].filter(Boolean).join(', ');
    // Campos de cidade/UF podem vir no futuro via profile API; mantém base por enquanto
    return base || '';
  };

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: fmtPhone((user as any)?.phone || (user as any)?.telefone),
    cpfCnpj: fmtCpf((user as any)?.cpf),
    address: composeAddress(user)
  });
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatar);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Função para atualizar formData e detectar mudanças
  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!user || isSaving) return;

    // Validação básica dos campos obrigatórios
    if (!formData.name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, preencha seu nome completo.',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: 'E-mail obrigatório',
        description: 'Por favor, preencha seu e-mail.',
        variant: 'destructive'
      });
      return;
    }

    // Validação do formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'E-mail inválido',
        description: 'Por favor, digite um e-mail válido.',
        variant: 'destructive'
      });
      return;
    }

    // Validação do CPF (se preenchido)
    if (formData.cpfCnpj) {
      const cpfDigits = onlyDigits(formData.cpfCnpj);
      if (cpfDigits.length !== 11) {
        toast({
          title: 'CPF inválido',
          description: 'O CPF deve ter 11 dígitos.',
          variant: 'destructive'
        });
        return;
      }
    }

    // Validação do telefone (se preenchido)
    if (formData.phone) {
      const phoneDigits = onlyDigits(formData.phone);
      if (phoneDigits.length < 10) {
        toast({
          title: 'Telefone inválido',
          description: 'O telefone deve ter pelo menos 10 dígitos.',
          variant: 'destructive'
        });
        return;
      }
    }

    setIsSaving(true);

    // Monta payload mínimo esperado pelo backend; limpa campos numéricos
    const payload: Partial<User> & { telefone?: string; cpf?: string } = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      address: formData.address.trim(),
      phone: formData.phone?.replace(/\D/g, '') || undefined,
      cpf: formData.cpfCnpj?.replace(/\D/g, '') || undefined,
      avatar: avatarUrl,
    };

    // Remove campos vazios do payload
    Object.keys(payload).forEach(key => {
      if (payload[key as keyof typeof payload] === '' || payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload];
      }
    });

    // Atualização local imediata para UX
    const updated: User = { ...user, ...payload } as User;
    
    try {
      localStorage.setItem('protectus-user', JSON.stringify(updated));
      
      // Se existir backend habilitado, tenta enviar
      const resp = await apiService.updateProfile(user.id, payload);
      
      if (resp.success) {
        // Se vier user do backend, usa ele; senão mantém o local
        const finalUser = (resp.data as User) || updated;
        localStorage.setItem('protectus-user', JSON.stringify(finalUser));
        
        // atualiza store para refletir no header imediatamente
        useAuthStore.setState({ user: finalUser });
        
        toast({ 
          title: 'Perfil atualizado com sucesso!', 
          description: 'Suas informações foram salvas e sincronizadas.' 
        });
        setIsEditing(false);
        setHasUnsavedChanges(false);
      } else {
        // Mantém alteração local e avisa que ficou offline
        useAuthStore.setState({ user: updated });
        toast({ 
          title: 'Alterações salvas localmente', 
          description: 'Quando a API estiver disponível, faremos a sincronização.',
          variant: 'default'
        });
        setIsEditing(false);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao salvar suas informações. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: fmtPhone((user as any)?.phone || (user as any)?.telefone),
      cpfCnpj: fmtCpf((user as any)?.cpf),
      address: composeAddress(user)
    });
    setAvatarUrl(user?.avatar);
    setIsEditing(false);
    setIsSaving(false);
    setHasUnsavedChanges(false);
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

  // Mantém os dados em sincronia quando o usuário for atualizado (ex.: pós-login/cadastro)
  useEffect(() => {
    if (user) {
      const phoneFormatted = fmtPhone((user as any)?.phone || (user as any)?.telefone);
      const cpfFormatted = fmtCpf((user as any)?.cpf);
      const addressComposed = composeAddress(user);
      
      console.log('Profile: Sincronizando dados do usuário', {
        phone: (user as any)?.phone,
        telefone: (user as any)?.telefone,
        cpf: (user as any)?.cpf,
        address: user?.address,
        phoneFormatted,
        cpfFormatted,
        addressComposed
      });
      
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: phoneFormatted,
        cpfCnpj: cpfFormatted,
        address: addressComposed
      });
      setAvatarUrl(user?.avatar);
      setHasUnsavedChanges(false);
    }
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Meu Perfil
            {hasUnsavedChanges && isEditing && (
              <span className="ml-2 text-sm font-normal text-orange-600 dark:text-orange-400">
                (alterações não salvas)
              </span>
            )}
          </h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
        </div>
        
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <Edit3 className="h-4 w-4" />
            Editar Perfil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={isSaving} className="gap-2">
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
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  placeholder="Digite seu nome completo"
                  required
                />
              ) : (
                <p className="text-sm text-foreground bg-muted p-3 rounded-md">
                  {formData.name || 'Não informado'}
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
                  onChange={(e) => updateFormData({ email: e.target.value })}
                  placeholder="seu@email.com"
                  required
                />
              ) : (
                <p className="text-sm text-foreground bg-muted p-3 rounded-md">
                  {formData.email || 'Não informado'}
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
                  onChange={(e) => {
                    const formatted = fmtPhone(e.target.value);
                    updateFormData({ phone: formatted });
                  }}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                />
              ) : (
                <p className="text-sm text-foreground bg-muted p-3 rounded-md">
                  {formData.phone || 'Não informado'}
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
                  onChange={(e) => {
                    const formatted = fmtCpf(e.target.value);
                    updateFormData({ cpfCnpj: formatted });
                  }}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              ) : (
                <p className="text-sm text-foreground bg-muted p-3 rounded-md">
                  {formData.cpfCnpj || 'Não informado'}
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
                  onChange={(e) => updateFormData({ address: e.target.value })}
                  placeholder="Rua, número, complemento"
                />
              ) : (
                <p className="text-sm text-foreground bg-muted p-3 rounded-md">
                  {formData.address || 'Não informado'}
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
        </CardContent>
      </Card>
    </div>
  );
}