// Versão mínima para teste
export default function App() {
  console.log('[RHNet] Minimal App rendering...');
  
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1 style={{ color: '#001a40', fontSize: '48px' }}>🎉 RHNet Funcionando!</h1>
      <p style={{ fontSize: '24px', color: '#666' }}>
        Se você está vendo esta mensagem, o React está carregando corretamente.
      </p>
      <div style={{ marginTop: '30px', padding: '20px', background: '#e8f5e9', borderRadius: '8px' }}>
        <p style={{ color: '#2e7d32', fontSize: '18px' }}>
          ✓ Servidor rodando<br/>
          ✓ React renderizando<br/>
          ✓ Aplicação inicializando
        </p>
      </div>
    </div>
  );
}
