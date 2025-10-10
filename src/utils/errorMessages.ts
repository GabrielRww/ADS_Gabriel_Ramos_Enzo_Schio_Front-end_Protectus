/**
 * Utilitários para formatação e tradução de mensagens de erro da API
 */

export interface ErrorInfo {
  field?: string;
  message: string;
  type: 'validation' | 'server' | 'network' | 'unknown';
}

/**
 * Mapeia mensagens de erro comuns do backend para mensagens amigáveis
 */
const ERROR_TRANSLATIONS: Record<string, string> = {
  // Erros de CPF
  'CPF deve conter apenas números': 'CPF deve conter apenas números (remova pontos e traços)',
  'CPF inválido': 'CPF informado é inválido',
  'CPF já cadastrado': 'Este CPF já está cadastrado no sistema',
  'cpf must be a valid CPF': 'CPF informado é inválido',
  
  // Erros de email
  'Email já cadastrado': 'Este email já está cadastrado no sistema',
  'Email inválido': 'Email informado é inválido',
  'email must be an email': 'Email informado é inválido',
  'E-mail já existe': 'Este email já está cadastrado no sistema',
  
  // Erros de telefone
  'Telefone deve conter apenas números': 'Telefone deve conter apenas números (remova parênteses, traços e espaços)',
  'Telefone inválido': 'Telefone informado é inválido',
  'phone must be a valid phone number': 'Telefone informado é inválido',
  
  // Erros de CEP
  'CEP deve conter apenas números': 'CEP deve conter apenas números (remova traços)',
  'CEP inválido': 'CEP informado é inválido',
  'cep must be a valid CEP': 'CEP informado é inválido',
  
  // Erros de senha
  'Senha muito fraca': 'A senha deve ter pelo menos 8 caracteres com letras maiúsculas, minúsculas, números e símbolos',
  'password too weak': 'A senha deve ter pelo menos 8 caracteres com letras maiúsculas, minúsculas, números e símbolos',
  'Senha deve ter pelo menos 6 caracteres': 'A senha deve ter pelo menos 6 caracteres',
  
  // Erros de nome
  'Nome é obrigatório': 'Nome completo é obrigatório',
  'name is required': 'Nome completo é obrigatório',
  'Nome deve ter pelo menos 2 caracteres': 'Nome deve ter pelo menos 2 caracteres',
  
  // Erros gerais de validação
  'Bad Request': 'Dados inválidos fornecidos',
  'Validation Error': 'Erro de validação nos dados fornecidos',
  'Missing required fields': 'Campos obrigatórios não preenchidos',
  
  // Erros de servidor
  'Internal Server Error': 'Erro interno do servidor. Tente novamente em alguns minutos',
  'Service Unavailable': 'Serviço temporariamente indisponível. Tente novamente',
  'Timeout': 'Tempo limite excedido. Verifique sua conexão e tente novamente',
  
  // Erros de autenticação
  'Unauthorized': 'Credenciais inválidas',
  'Invalid credentials': 'Email ou senha incorretos',
  'Usuario não encontrado': 'Email ou senha incorretos',
  'Senha incorreta': 'Email ou senha incorretos',
  'Token expirado': 'Sessão expirada. Faça login novamente',
};

/**
 * Identifica o campo relacionado ao erro baseado na mensagem
 */
function identifyErrorField(message: string): string | undefined {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('cpf')) return 'cpf';
  if (lowerMessage.includes('email') || lowerMessage.includes('e-mail')) return 'email';
  if (lowerMessage.includes('telefone') || lowerMessage.includes('phone')) return 'phone';
  if (lowerMessage.includes('cep')) return 'cep';
  if (lowerMessage.includes('senha') || lowerMessage.includes('password')) return 'password';
  if (lowerMessage.includes('nome') || lowerMessage.includes('name')) return 'name';
  if (lowerMessage.includes('endereço') || lowerMessage.includes('address')) return 'address';
  
  return undefined;
}

/**
 * Determina o tipo de erro baseado na mensagem e contexto
 */
function classifyError(message: string, statusCode?: number): ErrorInfo['type'] {
  if (statusCode === 400 || statusCode === 422) return 'validation';
  if (statusCode && statusCode >= 500) return 'server';
  if (message.toLowerCase().includes('network') || message.toLowerCase().includes('conexão')) return 'network';
  return 'unknown';
}

/**
 * Processa e formata mensagens de erro da API
 */
export function parseApiError(error: any): ErrorInfo[] {
  const errors: ErrorInfo[] = [];
  
  // Se é uma string simples
  if (typeof error === 'string') {
    const translatedMessage = ERROR_TRANSLATIONS[error] || error;
    return [{
      field: identifyErrorField(error),
      message: translatedMessage,
      type: classifyError(error)
    }];
  }
  
  // Se é um objeto de erro estruturado
  if (error && typeof error === 'object') {
    // Formato: { errors: [[{ details: "...", title: "..." }]] }
    if (error.errors && Array.isArray(error.errors)) {
      error.errors.forEach((errorGroup: any) => {
        if (Array.isArray(errorGroup)) {
          errorGroup.forEach((err: any) => {
            const message = err.details || err.title || err.message || 'Erro desconhecido';
            const translatedMessage = ERROR_TRANSLATIONS[message] || message;
            errors.push({
              field: identifyErrorField(message),
              message: translatedMessage,
              type: classifyError(message, err.status)
            });
          });
        }
      });
    }
    // Formato simples: { message: "..." } ou { error: "..." }
    else if (error.message || error.error) {
      const message = error.message || error.error;
      const translatedMessage = ERROR_TRANSLATIONS[message] || message;
      errors.push({
        field: identifyErrorField(message),
        message: translatedMessage,
        type: classifyError(message)
      });
    }
  }
  
  // Se não conseguiu processar ou não há erros, retorna erro genérico
  if (errors.length === 0) {
    errors.push({
      message: 'Ocorreu um erro inesperado. Verifique os dados e tente novamente.',
      type: 'unknown'
    });
  }
  
  return errors;
}

/**
 * Formata uma lista de erros para exibição em toast
 */
export function formatErrorsForToast(errors: ErrorInfo[]): { title: string; description: string } {
  if (errors.length === 1) {
    const error = errors[0];
    const title = error.type === 'validation' ? 'Erro de validação' :
                  error.type === 'server' ? 'Erro do servidor' :
                  error.type === 'network' ? 'Erro de conexão' :
                  'Erro no cadastro';
    
    return {
      title,
      description: error.message
    };
  }
  
  // Múltiplos erros
  const validationErrors = errors.filter(e => e.type === 'validation');
  const otherErrors = errors.filter(e => e.type !== 'validation');
  
  if (validationErrors.length > 0) {
    const descriptions = validationErrors.map(e => `• ${e.message}`).join('\n');
    return {
      title: 'Erros de validação',
      description: descriptions
    };
  }
  
  // Se não há erros de validação, pega o primeiro erro
  return {
    title: 'Erro no cadastro',
    description: errors[0].message
  };
}

/**
 * Gera dicas específicas baseadas no tipo de erro
 */
export function getErrorTips(errors: ErrorInfo[]): string[] {
  const tips: string[] = [];
  
  errors.forEach(error => {
    if (error.field === 'cpf') {
      tips.push('💡 Digite apenas os números do CPF (ex: 12345678901)');
    } else if (error.field === 'phone') {
      tips.push('💡 Digite apenas os números do telefone (ex: 11999999999)');
    } else if (error.field === 'cep') {
      tips.push('💡 Digite apenas os números do CEP (ex: 12345678)');
    } else if (error.field === 'email') {
      tips.push('💡 Verifique se o email está correto e não está já cadastrado');
    } else if (error.field === 'password') {
      tips.push('💡 Use uma senha forte com letras, números e símbolos');
    }
  });
  
  // Remove duplicatas
  return [...new Set(tips)];
}