export function fixUserDataWithRealData() {
  console.log(' Corrigindo dados do usuário com dados reais...');
  
  const currentUserStr = localStorage.getItem('protectus-user');
  if (!currentUserStr) {
    console.error('Nenhum usuário encontrado no localStorage');
    return;
  }
  
  const currentUser = JSON.parse(currentUserStr);

  const phone = prompt('Digite seu telefone (apenas números):', '') || '';
  const cpf = prompt('Digite seu CPF (apenas números):', '') || '';
  const cep = prompt('Digite seu CEP (apenas números):', '') || '';
  const address = prompt('Digite seu endereço completo:', '') || '';
  
  const userData = {
    ...currentUser,
    phone: phone.replace(/\D/g, ''),
    cpf: cpf.replace(/\D/g, ''),
    cep: cep.replace(/\D/g, ''),
    address: address,
  };
  
  try {
    localStorage.setItem('protectus-user', JSON.stringify(userData));
    console.log('Dados atualizados no localStorage:', userData);
    

    window.location.reload();
  } catch (error) {
    console.error('Erro ao salvar:', error);
  }
}

export function fixUserData() {
  console.log('Corrigindo dados do usuário...');
  
  const userData = {
    id: 22,
    name: "Gabriel Ramos Wendland", 
    email: "joao@email.com",
    role: "cliente",
    phone: "11999999999", 
    cpf: "12345678900",   
    cep: "12345678",      
    address: "Rua das Flores, 123",
  };
  
  try {
    localStorage.setItem('protectus-user', JSON.stringify(userData));
    console.log('Dados salvos no localStorage:', userData);
    
    // Força atualização do store
    window.location.reload();
  } catch (error) {
    console.error('Erro ao salvar:', error);
  }
}

if (typeof window !== 'undefined') {
  (window as any).fixUserData = fixUserData;
  (window as any).fixUserDataWithRealData = fixUserDataWithRealData;
}