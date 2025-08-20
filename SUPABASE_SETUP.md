# Configuração do Supabase para Perfectus Seguros

## Passos para configurar a autenticação e banco de dados:

### 1. Configurar as variáveis de ambiente
No painel do Supabase, vá em Settings > API e copie:
- `VITE_SUPABASE_URL`: URL do projeto
- `VITE_SUPABASE_ANON_KEY`: Chave pública anônima

### 2. Executar o SQL de configuração
No painel do Supabase, vá em SQL Editor e execute o conteúdo do arquivo `supabase-setup.sql`

### 3. Criar usuário funcionário/admin
1. No painel do Supabase, vá em Authentication > Users
2. Clique em "Add user" e crie um usuário com email do admin (ex: admin@perfectus.com)
3. Após criar o usuário, copie o UUID gerado
4. No SQL Editor, execute:
```sql
INSERT INTO public.profiles (id, name, email, role)
VALUES ('UUID_COPIADO_AQUI', 'Admin Perfectus', 'admin@perfectus.com', 'funcionario');
```

### 4. Configurar políticas de segurança (RLS)
As políticas já estão configuradas no SQL, garantindo que:
- Clientes só veem seus próprios dados
- Funcionários têm acesso a todos os dados
- Registro público sempre cria usuários como 'cliente'

### 5. Funcionalidades implementadas
- ✅ Autenticação real com Supabase Auth
- ✅ Cadastro público sempre cria clientes
- ✅ Funcionários criados diretamente no banco
- ✅ Controle de acesso baseado em roles
- ✅ Políticas de segurança (RLS)
- ✅ Perfis de usuário persistidos

### 6. Para testar
1. Cadastre um novo usuário em `/cadastro` (será sempre cliente)
2. Use o usuário admin criado manualmente para acessar `/admin`
3. As rotas estão protegidas por role automaticamente