const { app, BrowserWindow, ipcMain, nativeTheme } = require("electron");
const WebSocket = require("ws");
const path = require("path");

let controleWindow, exibirWindow;

// Função para criar a janela principal
function createWindow() {
  nativeTheme.themeSource = 'dark';
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.resolve(__dirname, 'preload.js'), // Adicionando preload.js
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });

  win.loadFile("index.html");
}

// Função para abrir novas janelas
function openNewWindow(page) {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Preload opcional
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Carregar a página da pasta 'views'
  win.loadFile(path.join(__dirname, "views", page));
  return win;
}

// Inicializar WebSocket Server
const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("Cliente conectado");

  ws.on("message", (message) => {
    console.log(`Mensagem recebida: ${message}`);
    // Enviar mensagem para todos os outros clientes conectados
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    console.log("Cliente desconectado");
  });
});

app.whenReady().then(() => {
  createWindow();

  ipcMain.on("open-window", (event, page) => {
    console.log(`Abrindo página: ${page}`);
    switch (page) {
      case "controlo.html":
        controleWindow = openNewWindow(page);
        break;
      case "exibir.html":
        exibirWindow = openNewWindow(page);
        break;
      default:
        openNewWindow(page); // Abrir outras janelas diretamente
        break;
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
});
