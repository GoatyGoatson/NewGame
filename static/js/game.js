// Firebase initialisieren
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, set, onValue, push, update, remove } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBXvE64zxiLq4llMRX-sG8oMC5NZ-n1lBw",
  authDomain: "bulletbound-70a04.firebaseapp.com",
  databaseURL: "https://bulletbound-70a04-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bulletbound-70a04",
  storageBucket: "bulletbound-70a04.firebasestorage.app",
  messagingSenderId: "512551082564",
  appId: "1:512551082564:web:eeded9d53aba74e2f0ba11",
  measurementId: "G-0KBGW2TCQS"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Referenzen für die Datenbank
const gameRef = ref(db, "game");
const playerQueueRef = ref(db, "game/queue");

// Spielfeld definieren
const map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Globale Spielvariablen
let currentPlayer = null;
let isPlayer1 = false;

// Map rendern
function createMap(map) {
  const gameArea = document.getElementById('game');
  gameArea.innerHTML = '';

  map.forEach((row, y) => {
    row.forEach((cell, x) => {
      const tile = document.createElement('div');
      tile.classList.add('tile');
      tile.dataset.x = x;
      tile.dataset.y = y;

      if (cell === 1) {
        tile.classList.add('wall');
      } else if (cell === 0) {
        tile.classList.add('floor');
      }

      gameArea.appendChild(tile);
    });
  });
}

// Spieler zur Queue hinzufügen
function addPlayerToQueue() {
  const newPlayerRef = push(playerQueueRef);
  set(newPlayerRef, {
    name: `Player-${Math.floor(Math.random() * 1000)}`,
    timestamp: Date.now()
  });
}

// Spielerbewegung validieren
function isValidMove(x, y) {
  return map[y] && map[y][x] === 0;
}

// Spieler-Bewegungslogik
function setupPlayerMovement() {
  document.addEventListener('keydown', (event) => {
    if (!currentPlayer) return;

    let newX = currentPlayer.x;
    let newY = currentPlayer.y;
    let direction = { x: 0, y: 0 };

    switch (event.key) {
      case 'w': newY -= 1; direction = { x: 0, y: -1 }; break;
      case 's': newY += 1; direction = { x: 0, y: 1 }; break;
      case 'a': newX -= 1; direction = { x: -1, y: 0 }; break;
      case 'd': newX += 1; direction = { x: 1, y: 0 }; break;
    }

    if (isValidMove(newX, newY)) {
      currentPlayer.x = newX;
      currentPlayer.y = newY;

      // Spielerbewegung in Firebase aktualisieren
      const playerPath = isPlayer1 ? "player1" : "player2";
      update(gameRef, {
        [playerPath]: {
          ...currentPlayer,
          x: newX,
          y: newY
        }
      });
    }
  });
}

// Schießen implementieren
function setupShooting() {
  document.addEventListener('keydown', (event) => {
    if (event.key === ' ' && currentPlayer) {
      const bulletRef = push(ref(db, 'game/bullets'));
      set(bulletRef, {
        x: currentPlayer.x,
        y: currentPlayer.y,
        owner: isPlayer1 ? 'player1' : 'player2'
      });
    }
  });
}

// Game State Listener
onValue(gameRef, (snapshot) => {
  const gameData = snapshot.val();

  if (gameData && gameData.status === "active") {
    const gameArea = document.getElementById("game");

    // Spieler 1 aktualisieren
    if (gameData.player1) {
      updatePlayerInGame(gameData.player1, 'player1', gameArea, 'blue');
      if (!currentPlayer && isPlayer1) {
        currentPlayer = { ...gameData.player1 };
      }
    }

    // Spieler 2 aktualisieren
    if (gameData.player2) {
      updatePlayerInGame(gameData.player2, 'player2', gameArea, 'red');
      if (!currentPlayer && !isPlayer1) {
        currentPlayer = { ...gameData.player2 };
      }
    }
  }
});

// Spieler in der Gamearea aktualisieren
function updatePlayerInGame(playerData, id, gameArea, color) {
  let playerElement = document.getElementById(id);
  
  if (!playerElement) {
    playerElement = document.createElement("div");
    playerElement.classList.add("player");
    playerElement.id = id;
    playerElement.style.backgroundColor = color;
    gameArea.appendChild(playerElement);
  }

  playerElement.style.left = `${playerData.x * 50}px`;
  playerElement.style.top = `${playerData.y * 50}px`;
}

// Queue Listener
onValue(playerQueueRef, (snapshot) => {
  const players = snapshot.val();

  if (players) {
    const playerIds = Object.keys(players);

    if (playerIds.length === 2) {
      // Sortiere Spieler nach Beitrittszeitpunkt
      const sortedPlayers = playerIds.sort((a, b) => 
        players[a].timestamp - players[b].timestamp
      );

      // Starte das Spiel mit zugewiesenen Positionen
      update(gameRef, {
        player1: { 
          ...players[sortedPlayers[0]], 
          x: 1, 
          y: 1, 
          color: 'blue' 
        },
        player2: { 
          ...players[sortedPlayers[1]], 
          x: 14, 
          y: 1, 
          color: 'red' 
        },
        status: "active"
      }).then(() => {
        // Queue leeren
        set(playerQueueRef, null);
      });
    }
  }
});

// Initialisierung
function initGame() {
  createMap(map);
  setupPlayerMovement();
  setupShooting();

  const joinQueueButton = document.getElementById("joinQueueButton");
  joinQueueButton.addEventListener("click", () => {
    addPlayerToQueue();
    
    // Setze Spielerrolle basierend auf Beitrittszeitpunkt
    onValue(playerQueueRef, (snapshot) => {
      const players = snapshot.val();
      if (players) {
        const playerIds = Object.keys(players);
        isPlayer1 = playerIds[0] === Object.keys(players).find(id => players[id]);
      }
    });
  });
}

// Starte das Spiel
initGame();