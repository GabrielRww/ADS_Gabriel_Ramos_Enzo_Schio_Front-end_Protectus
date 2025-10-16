// ============ SCRIPT DE DEBUG PARA REDIRECIONAMENTO ============
// Execute este script no console do navegador ANTES de selecionar uma marca

console.clear();
console.log('🔧 Configurando interceptores de debug...');

// 1. Intercepta todas as mudanças de URL
const originalPushState = window.history.pushState;
const originalReplaceState = window.history.replaceState;

window.history.pushState = function(...args) {
  if (args[2] && args[2].includes('/apolices')) {
    console.error(' REDIRECIONAMENTO PARA /apolices VIA pushState:', {
      url: args[2],
      stack: new Error().stack,
      timestamp: new Date().toISOString()
    });
    debugger; // Pausa execução para análise
  }
  return originalPushState.apply(this, args);
};

window.history.replaceState = function(...args) {
  if (args[2] && args[2].includes('/apolices')) {
    console.error(' REDIRECIONAMENTO PARA /apolices VIA replaceState:', {
      url: args[2],
      stack: new Error().stack,
      timestamp: new Date().toISOString()
    });
    debugger; // Pausa execução para análise
  }
  return originalReplaceState.apply(this, args);
};

// 2. Intercepta eventos de popstate
window.addEventListener('popstate', function(event) {
  if (window.location.href.includes('/apolices')) {
    console.error(' REDIRECIONAMENTO PARA /apolices VIA popstate:', {
      url: window.location.href,
      event: event,
      timestamp: new Date().toISOString()
    });
  }
});

// 3. Intercepta mudanças diretas em window.location
let currentUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== currentUrl) {
    if (window.location.href.includes('/apolices')) {
      console.error('🚨 REDIRECIONAMENTO PARA /apolices VIA location change:', {
        urlAnterior: currentUrl,
        urlNova: window.location.href,
        timestamp: new Date().toISOString()
      });
    }
    currentUrl = window.location.href;
  }
}, 100);

// 4. Monitora React Router Navigate
if (window.React && window.React.version) {
  console.log(' React detectado, monitorando hooks de navegação...');
}

// 5. Monitora errors que podem causar redirecionamento
window.addEventListener('error', function(event) {
  console.log(' Erro JavaScript detectado:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    timestamp: new Date().toISOString()
  });
});

// 6. Monitora chamadas de API que podem falhar
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  console.log(' API Call:', url);
  
  return originalFetch.apply(this, args).then(response => {
    if (!response.ok) {
      console.warn(' API Error:', {
        url: url,
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString()
      });
    }
    return response;
  }).catch(error => {
    console.error(' API Fetch Error:', {
      url: url,
      error: error,
      timestamp: new Date().toISOString()
    });
    throw error;
  });
};

console.log(' Interceptadores configurados! Agora você pode selecionar uma marca.');
console.log(' Se houver redirecionamento para /apolices, os logs aparecerão acima.');
console.log(' Para desabilitar os interceptadores, recarregue a página.');