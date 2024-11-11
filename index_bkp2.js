// const { app, BrowserWindow, ipcMain, nativeTheme, Menu } = require("electron");
const { app, BrowserWindow, ipcMain, nativeTheme } = require("electron");
const WebSocket = require("ws");
const path = require("path");

let controleWindow, exibirWindow;

// Função para criar a janela principal
function createWindow() {
  nativeTheme.themeSource = "dark";
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.resolve(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });

  // Carregar a interface principal
  win.loadFile("index.html");

  // Cria o menu básico
  const menu = Menu.buildFromTemplate([
    {
      label: "Arquivo",
      submenu: [{ role: "quit", label: "Sair" }],
    },
    {
      label: "Editar",
      submenu: [{ role: "undo", label: "Desfazer" }, { role: "redo", label: "Refazer" }],
    },
  ]);

  Menu.setApplicationMenu(menu); // Define o menu global

  // Eventos para controlar o menu em tela cheia
  win.on("enter-full-screen", () => {
    Menu.setApplicationMenu(null); // Oculta o menu ao entrar em tela cheia
  });

  win.on("leave-full-screen", () => {
    Menu.setApplicationMenu(menu); // Restaura o menu ao sair de tela cheia
  });

  // Adiciona um listener para a tecla F11
  win.webContents.on("before-input-event", (event, input) => {
    if (input.key === "F11") {
      event.preventDefault(); // Impede a ação padrão da tecla F11
      win.setFullScreen(!win.isFullScreen()); // Alterna entre tela cheia e normal
    }
  });
}

// Função para abrir novas janelas
function openNewWindow(page) {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile(path.join(__dirname, "views", page));

  // Cria o menu para a janela secundária
  const menu = Menu.buildFromTemplate([
    {
      label: "Arquivo",
      submenu: [{ role: "quit", label: "Sair" }],
    },
    {
      label: "Editar",
      submenu: [{ role: "undo", label: "Desfazer" }, { role: "redo", label: "Refazer" }],
    },
  ]);
  Menu.setApplicationMenu(menu); // Define o menu para a janela secundária

  // Eventos para controlar o menu em tela cheia para janelas secundárias
  win.on("enter-full-screen", () => {
    Menu.setApplicationMenu(null); // Oculta o menu ao entrar em tela cheia
  });

  win.on("leave-full-screen", () => {
    Menu.setApplicationMenu(menu); // Restaura o menu ao sair de tela cheia
  });

  // Adiciona um listener para a tecla F11 na janela secundária
  win.webContents.on("before-input-event", (event, input) => {
    if (input.key === "F11") {
      event.preventDefault(); // Impede a ação padrão da tecla F11
      win.setFullScreen(!win.isFullScreen()); // Alterna entre tela cheia e normal
    }
  });
  

  return win;
}

// Inicializar WebSocket Server
const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("Cliente conectado");

  ws.on("message", (message) => {
    console.log(`Mensagem recebida: ${message}`);
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

// Inicializar aplicação Electron
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
        openNewWindow(page);
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
