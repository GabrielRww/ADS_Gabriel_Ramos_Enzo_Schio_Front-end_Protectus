// Script de debug para verificar dados do usuário
export function debugUserData() {
  console.group('🔍 DEBUG: Dados do Usuário');
  
  // 1. localStorage
  console.group('📦 LocalStorage');
  try {
    const userStr = localStorage.getItem('protectus-user');
    const tokenStr = localStorage.getItem('protectus-token');
    
    console.log('protectus-user (raw):', userStr);
    console.log('protectus-token (raw):', tokenStr);
    
    if (userStr) {
      const user = JSON.parse(userStr);
      console.log('protectus-user (parsed):', user);
      console.log('  - id:', user.id);
      console.log('  - name:', user.name);
      console.log('  - email:', user.email);
      console.log('  - phone:', user.phone);
      console.log('  - cpf:', user.cpf);
      console.log('  - cep:', user.cep);
      console.log('  - address:', user.address);
      console.log('  - addressNumber:', user.addressNumber);
    } else {
      console.warn('protectus-user não encontrado no localStorage');
    }
  } catch (e) {
    console.error('Erro ao ler localStorage:', e);
  }
  console.groupEnd();
  
  // 2. Zustand Store
  console.group('🗄️ Zustand Store');
  try {
    const authState = localStorage.getItem('protectus-auth');
    console.log('protectus-auth (raw):', authState);
    if (authState) {
      const parsed = JSON.parse(authState);
      console.log('protectus-auth (parsed):', parsed);
      if (parsed.state?.user) {
        console.log('Store user:', parsed.state.user);
      }
    }
  } catch (e) {
    console.error('Erro ao ler Zustand store:', e);
  }
  console.groupEnd();
  
  console.groupEnd();
  
  return {
    localStorage: {
      user: localStorage.getItem('protectus-user'),
      token: localStorage.getItem('protectus-token'),
    },
    store: localStorage.getItem('protectus-auth'),
  };
}

// Expor globalmente para usar no console
if (typeof window !== 'undefined') {
  (window as any).debugUser = debugUserData;
}
