import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md p-8 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Oops! Algo deu errado
            </h1>
            <p className="text-gray-700 mb-4">
              A aplicação encontrou um erro inesperado.
            </p>
            <details className="text-sm text-gray-600 bg-gray-50 p-4 rounded">
              <summary className="cursor-pointer font-semibold mb-2">
                Detalhes do erro
              </summary>
              <pre className="whitespace-pre-wrap overflow-auto">
                {this.state.error?.toString()}
                {'\n'}
                {this.state.error?.stack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
