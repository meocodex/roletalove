// Versão ultra simples apenas para testar React
function App() {
  return (
    <div style={{ 
      background: '#22c55e', 
      minHeight: '100vh', 
      color: 'white', 
      padding: '50px',
      fontSize: '24px',
      fontFamily: 'Arial'
    }}>
      <h1>SISTEMA FUNCIONANDO!</h1>
      <p>React carregado: {new Date().toLocaleString()}</p>
    </div>
  );
}

export default App;