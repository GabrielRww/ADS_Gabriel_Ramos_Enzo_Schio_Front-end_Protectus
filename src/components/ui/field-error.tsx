import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { type ErrorInfo } from '@/utils/errorMessages';

interface FieldErrorProps {
  errors: ErrorInfo[];
  fieldName: string;
  className?: string;
}

export function FieldError({ errors, fieldName, className = "" }: FieldErrorProps) {
  const fieldErrors = errors.filter(error => error.field === fieldName);
  
  if (fieldErrors.length === 0) return null;

  return (
    <div className={`space-y-1 ${className}`}>
      {fieldErrors.map((error, index) => (
        <Alert key={index} variant="destructive" className="py-2 px-3">
          <AlertCircle className="h-3 w-3" />
          <AlertDescription className="text-xs">
            {error.message}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}

interface FormErrorSummaryProps {
  errors: ErrorInfo[];
  className?: string;
}

export function FormErrorSummary({ errors, className = "" }: FormErrorSummaryProps) {
  if (errors.length === 0) return null;

  // Agrupa erros por tipo
  const validationErrors = errors.filter(e => e.type === 'validation');
  const serverErrors = errors.filter(e => e.type === 'server');
  const networkErrors = errors.filter(e => e.type === 'network');
  const otherErrors = errors.filter(e => !['validation', 'server', 'network'].includes(e.type));

  return (
    <div className={`space-y-3 ${className}`}>
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Erros de validação encontrados:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {validationErrors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {serverErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Erro do servidor:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {serverErrors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {networkErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Erro de conexão:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {networkErrors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {otherErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Outros erros:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {otherErrors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}