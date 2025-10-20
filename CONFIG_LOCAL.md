# Configuração para Backend Local

## Status: ✅ CONFIGURADO PARA LOCALHOST

### URLs Atualizadas

**Antes:**
```
VITE_API_URL="https://protectus-back-end-production.up.railway.app"
```

**Agora:**
```
VITE_API_URL="http://localhost:3000"
```

### Verificações

✅ Backend rodando na porta 3000 (PID: 9932)  
✅ Arquivo .env atualizado  
✅ Configurações locais já estavam presentes no .env  

### Endpoints Configurados (localhost:3000)

#### Autenticação
- `POST /auth/login-cliente`
- `POST /auth/login-funcionario`

#### Veículos
- `GET /insurances/marcas`
- `GET /insurances/modelos?marca={marca}`
- `GET /insurances/anos?marca={marca}&modelo={modelo}`
- `GET /insurances/veiculo?marca={marca}&modelo={modelo}&ano={ano}` (FIPE)
- `POST /insurances/seguro-veiculo`

#### Celulares
- `GET /insurances/celulares/marcas`
- `GET /insurances/celulares/modelos?marca={marca}`
- `GET /insurances/celulares/cores?marca={marca}&modelo={modelo}`
- `POST /insurances/seguro-celular`

#### Residencial
- `POST /insurances/seguro-residencial`

#### Usuários
- `GET /users/cliente?cpf={cpf}`
- `POST /users/cliente`

### Como Usar

1. **Backend já está rodando** ✅
   - Porta: 3000
   - URL: http://localhost:3000

2. **Reinicie o front-end** para aplicar as mudanças:
   ```bash
   # Pare o servidor atual (Ctrl+C)
   # Depois execute:
   npm run dev
   # ou
   bun dev
   ```

3. **Verifique no console do navegador**:
   - Os logs agora devem mostrar `[API] http://localhost:3000/...`
   - Não deve mais aparecer erros do Railway

### Troubleshooting

**Se ainda aparecer erro do Railway:**
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Reinicie o servidor do front-end
- Verifique se o arquivo `.env` foi salvo corretamente

**Se o backend não responder:**
- Verifique se o backend está rodando: `netstat -ano | grep :3000`
- Verifique os logs do backend
- Confirme que o CORS está habilitado no backend (já está configurado)

**Porta do front-end:**
- Por padrão o Vite usa a porta 5173
- Acesse: http://localhost:5173

### Variáveis de Ambiente Importantes

```env
# URL PRINCIPAL - AGORA LOCALHOST
VITE_API_URL="http://localhost:3000"

# APIs de Políticas desativadas (evita 404)
VITE_POLICIES_API=false

# Modo local detectado automaticamente
VITE_LOCAL_API_URL="http://localhost:3000"
```

### Retornar para Produção (Railway)

Se precisar voltar para o Railway no futuro:
```env
VITE_API_URL="https://protectus-back-end-production.up.railway.app"
```

---

**Data da configuração:** 20/10/2025  
**Configurado por:** GitHub Copilot
