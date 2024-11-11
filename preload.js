const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  openWindow: (page) => ipcRenderer.send('open-window', page),
  
  sendMessageToMain: async (message) => {
    if (typeof message !== 'string') {
      console.error('Mensagem deve ser uma string');
      return;
    }
    const response = await ipcRenderer.invoke('message-to-exibir', message);
    return response; // Retorne a resposta ou trate conforme necessário
  },

  onMessageFromMain: (callback) => {
    const handler = (event, message) => {
      try {
        callback(message);
      } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        callback(null, error); // Envie o erro para o callback
      }
    };

    ipcRenderer.on('message-from-main', handler);

    // Retornar uma função para remover o listener
    return () => {
      ipcRenderer.off('message-from-main', handler);
    };
  },
});
