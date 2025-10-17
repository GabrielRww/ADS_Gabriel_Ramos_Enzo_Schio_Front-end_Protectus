```javascript
// Copie e cole estes comandos um por um:

// 1. Versão do React Router
console.log('React Router:', window.location);

// 2. Estado atual da navegação
console.log('URL atual:', window.location.href);
console.log('Pathname:', window.location.pathname);
console.log('Search:', window.location.search);
console.log('Hash:', window.location.hash);

// 3. Histórico do navegador
console.log('History length:', window.history.length);
console.log('History state:', window.history.state);

// 4. Verificar se há listeners no history
console.log('Performance entries:', performance.getEntriesByType('navigation'));
```

### 5. Estado do Modal
Quando o modal estiver aberto e ANTES de selecionar a marca, execute:

```javascript
// Cole no console ANTES de selecionar a marca:
console.log('Modal aberto, aguardando seleção...');

// Crie um listener para capturar a navegação
const originalPushState = window.history.pushState;
window.history.pushState = function(...args) {
    console.error('[ALERTA] PUSHSTATE CHAMADO:', args);
    console.trace(); // Mostra de onde veio a chamada
    return originalPushState.apply(this, args);
};

const originalReplaceState = window.history.replaceState;
window.history.replaceState = function(...args) {
    console.error('[ALERTA] REPLACESTATE CHAMADO:', args);
    console.trace();
    return originalReplaceState.apply(this, args);
};

console.log('[OK] Listeners instalados, agora selecione a marca');
```

Depois de executar isso, selecione a marca e me envie TODOS os logs que aparecerem.

## O que Procurar

Especialmente fique atento a logs que contenham:
- [ALERTA] (mensagens de alerta)
- "NAVEGAÇÃO DETECTADA"
- "REDIRECIONAMENTO"
- "/apolices"
- Qualquer chamada de `navigate()`
- Erros 401, 403, 404
- Stack traces

## Como Me Enviar

Copie TODOS os logs do console e me envie em um bloco de código markdown:

\`\`\`
[Cole aqui todos os logs]
\`\`\`

Ou tire prints das abas Console e Network e me envie.
