// Teste básico sem React - apenas DOM
document.addEventListener('DOMContentLoaded', function() {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="min-height: 100vh; background: #1f2937; color: white; padding: 20px; font-family: Arial;">
        <h1 style="font-size: 28px; margin-bottom: 20px;">🎯 Sistema de Roleta - TESTE DOM</h1>
        <div style="background: #22c55e; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p>✅ HTML carregado</p>
          <p>✅ CSS aplicado</p>
          <p>✅ JavaScript funcionando</p>
          <p>🔧 Teste sem React</p>
        </div>
        <div style="background: #dc2626; padding: 15px; border-radius: 8px;">
          <p><strong>Status:</strong> Testando DOM puro</p>
          <p><strong>Data:</strong> ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;
    console.log('DOM carregado com sucesso!');
  } else {
    console.error('Elemento root não encontrado!');
  }
});
