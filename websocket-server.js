const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      console.log(`Mensagem recebida: ${message}`);

      // Garante que o message seja enviado como string
      const jsonMessage = JSON.stringify(JSON.parse(message));

      // Repassa para todos os clientes
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(jsonMessage); // Enviar como string
        }
      });
    });
    ws.on('close', () => {
        console.log('Cliente desconectado.');
      });
  });


console.log('Servidor WebSocket rodando na porta 81');
