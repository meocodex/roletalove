import { Component, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; error?: any };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error("Erro de runtime capturado:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, color: "#fff", background: "#111", minHeight: "100vh", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" }}>
          <h1 style={{ fontSize: 24, marginBottom: 12 }}>Ocorreu um erro na aplicação</h1>
          <pre style={{ whiteSpace: "pre-wrap", background: "#222", padding: 16, borderRadius: 8, overflow: "auto" }}>
            {String(this.state.error?.stack || this.state.error)}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: 16, padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
