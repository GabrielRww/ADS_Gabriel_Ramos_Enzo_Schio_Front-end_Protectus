import { useMemo } from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordCriteria {
  id: string;
  label: string;
  validator: (password: string) => boolean;
}

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

const passwordCriteria: PasswordCriteria[] = [
  {
    id: 'length',
    label: 'Pelo menos 8 caracteres',
    validator: (password: string) => password.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'Uma letra maiúscula (A-Z)',
    validator: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'Uma letra minúscula (a-z)',
    validator: (password: string) => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: 'Um número (0-9)',
    validator: (password: string) => /\d/.test(password),
  },
  {
    id: 'special',
    label: 'Um caractere especial (!@#$%^&*)',
    validator: (password: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  },
];

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const results = useMemo(() => {
    return passwordCriteria.map((criteria) => ({
      ...criteria,
      isValid: criteria.validator(password),
    }));
  }, [password]);

  const validCount = results.filter((result) => result.isValid).length;
  const strengthPercentage = (validCount / passwordCriteria.length) * 100;

  const getStrengthLevel = () => {
    if (validCount === 0) return { label: 'Muito Fraca', color: 'text-gray-500' };
    if (validCount <= 2) return { label: 'Fraca', color: 'text-red-500' };
    if (validCount <= 3) return { label: 'Média', color: 'text-yellow-500' };
    if (validCount <= 4) return { label: 'Forte', color: 'text-blue-500' };
    return { label: 'Muito Forte', color: 'text-green-500' };
  };

  const strengthLevel = getStrengthLevel();

  const getStrengthBarColor = () => {
    if (validCount <= 2) return 'bg-red-500';
    if (validCount <= 3) return 'bg-yellow-500';
    if (validCount <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  if (!password) return null;

  return (
    <div className={cn('space-y-3 p-3 bg-muted/50 rounded-lg border', className)}>
      {/* Strength Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Força da senha:</span>
          <span className={cn('text-sm font-semibold', strengthLevel.color)}>
            {strengthLevel.label}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-300 ease-in-out',
              getStrengthBarColor()
            )}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
      </div>

      {/* Criteria List */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-muted-foreground">Sua senha deve conter:</span>
        <ul className="space-y-1">
          {results.map((result) => (
            <li key={result.id} className="flex items-center gap-2 text-sm">
              {result.isValid ? (
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : (
                <X className="h-4 w-4 text-red-500 flex-shrink-0" />
              )}
              <span
                className={cn(
                  'transition-colors duration-200',
                  result.isValid
                    ? 'text-green-700 dark:text-green-400 line-through'
                    : 'text-muted-foreground'
                )}
              >
                {result.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Security Tips */}
      {validCount < passwordCriteria.length && (
        <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-700 dark:text-yellow-300">
            <p className="font-medium">Dica de segurança:</p>
            <p>
              {validCount <= 2
                ? 'Use uma combinação de letras, números e símbolos para maior segurança.'
                : validCount <= 3
                ? 'Adicione mais um critério para aumentar a segurança.'
                : 'Sua senha está quase perfeita! Complete todos os critérios.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook para validação de senha
export function usePasswordValidation(password: string) {
  return useMemo(() => {
    const results = passwordCriteria.map((criteria) => ({
      ...criteria,
      isValid: criteria.validator(password),
    }));

    const validCount = results.filter((result) => result.isValid).length;
    const isStrong = validCount >= 4; // Pelo menos 4 de 5 critérios
    const isValid = validCount >= 3; // Mínimo aceitável: 3 critérios

    return {
      results,
      validCount,
      isStrong,
      isValid,
      strengthPercentage: (validCount / passwordCriteria.length) * 100,
    };
  }, [password]);
}