const axios = require("axios");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const basketBtn = document.getElementById("basketBtn");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");

let timer;
let timeRemaining = 10; // Segundos
let score = 0;
let isRunning = false;
let isPaused = false; // Variável de controle para pausa

// Função para iniciar ou reiniciar o timer
function startTimer() {
  if (isRunning) {
    // Se o botão "Iniciar" for clicado enquanto o timer estiver rodando, reinicia tudo
    resetTimer();
  } else {
    // Iniciar o temporizador
    isRunning = true;
    isPaused = false;
    startBtn.textContent = "Reiniciar"; // Altera o texto do botão para "Reiniciar"
    startBtn.disabled = false;
    pauseBtn.disabled = false;
    basketBtn.disabled = false;

    timer = setInterval(() => {
      if (!isPaused) {
        timeRemaining--;
        timerDisplay.textContent = timeRemaining;

        if (timeRemaining <= 0) {
          clearInterval(timer);
          isRunning = false;
          basketBtn.disabled = true;
          enviarPontuacao(score); // Enviar a pontuação quando o tempo acabar
        }
      }
    }, 1000);
  }
}

// Função para pausar e retomar o timer
function togglePause() {
  if (isPaused) {
    isPaused = false;
    pauseBtn.textContent = "Pausar";
    basketBtn.disabled = false; // Habilitar contar cesta ao continuar
  } else {
    isPaused = true;
    pauseBtn.textContent = "Continuar";
    basketBtn.disabled = true; // Desabilitar contar cesta ao pausar
  }
}

// Função para reiniciar o timer (resetar tudo)
function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  isPaused = false;
  timeRemaining = 10;
  score = 0;
  timerDisplay.textContent = timeRemaining;
  scoreDisplay.textContent = score;
  startBtn.textContent = "Iniciar"; // Volta o texto do botão para "Iniciar"
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  basketBtn.disabled = true;
}

// Função para contar cestas
function contarCesta() {
  if (!isPaused) {
    score += 3;
    scoreDisplay.textContent = score;
  }
}

// Função para enviar a pontuação via Axios
async function enviarPontuacao(pontuacao) {
  try {
    const response = await axios.post("http://127.0.0.1:8002/api/pontos", {
      pontuacao: pontuacao,
    });
    alert("Pontuação enviada com sucesso: " + response.data.pontuacao);
  } catch (error) {
    alert("Erro ao enviar pontuação: " + error.message);
  }
}

// Event listeners
startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", togglePause); // Botão de Pausa
basketBtn.addEventListener("click", contarCesta);
