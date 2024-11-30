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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const gameRef = ref(db, "game");
const playerQueueRef = ref(db, "game/queue");
const bulletsRef = ref(db, "game/bullets");

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

let currentPlayer = null;
let isPlayer1 = false;

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

function addPlayerToQueue() {
  const newPlayerRef = push(playerQueueRef);
  set(newPlayerRef, {
    name: `Player-${Math.floor(Math.random() * 1000)}`,
    timestamp: Date.now(),
    health: 100
  });
}

function isValidMove(x, y) {
  return map[y] && map[y][x] === 0;
}

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
      case ' ': 
        shootBullet(currentPlayer, direction);
        return;
    }

    if (isValidMove(newX, newY)) {
      currentPlayer.x = newX;
      currentPlayer.y = newY;

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

function shootBullet(player, direction) {
  const bulletRef = push(bulletsRef);
  set(bulletRef, {
    x: player.x,
    y: player.y,
    dx: direction.x,
    dy: direction.y,
    owner: isPlayer1 ? 'player1' : 'player2',
    timestamp: Date.now()
  });
}

function updateBullets() {
  onValue(bulletsRef, (snapshot) => {
    const bullets = snapshot.val();
    const gameArea = document.getElementById('game');
    
    // Clear existing bullets
    document.querySelectorAll('.bullet').forEach(b => b.remove());

    if (bullets) {
      Object.keys(bullets).forEach(key => {
        const bullet = bullets[key];
        const bulletElement = document.createElement('div');
        bulletElement.classList.add('bullet');
        
        const tile = document.querySelector(`.tile[data-x="${bullet.x}"][data-y="${bullet.y}"]`);
        if (tile) {
          const rect = tile.getBoundingClientRect();
          bulletElement.style.left = `${rect.left + rect.width/2 - 10}px`;
          bulletElement.style.top = `${rect.top + rect.height/2 - 10}px`;
          
          gameArea.appendChild(bulletElement);

          // Bullet movement and collision logic
          moveBullet(key, bullet);
        }
      });
    }
  });
}

function moveBullet(bulletKey, bullet) {
  const newX = bullet.x + bullet.dx;
  const newY = bullet.y + bullet.dy;

  // Wall collision
  if (map[newY] && map[newY][newX] === 1) {
    remove(ref(db, `game/bullets/${bulletKey}`));
    return;
  }

  // Update bullet position
  update(ref(db, `game/bullets/${bulletKey}`), {
    x: newX,
    y: newY
  });

  // Player collision detection
  checkPlayerHit(newX, newY, bullet.owner);
}

function checkPlayerHit(x, y, shooterOwner) {
  const targetPlayer = shooterOwner === 'player1' ? 'player2' : 'player1';
  
  onValue(gameRef, (snapshot) => {
    const gameData = snapshot.val();
    
    if (gameData && gameData[targetPlayer]) {
      const targetPlayerData = gameData[targetPlayer];
      
      if (targetPlayerData.x === x && targetPlayerData.y === y) {
        // Reduce health
        const newHealth = (targetPlayerData.health || 100) - 10;
        
        update(gameRef, {
          [targetPlayer]: {
            ...targetPlayerData,
            health: Math.max(0, newHealth)
          }
        });

        // Check for game end
        if (newHealth <= 0) {
          endGame(shooterOwner);
        }
      }
    }
  }, { onlyOnce: true });
}

function endGame(winner) {
  update(gameRef, {
    status: "ended",
    winner: winner
  });

  alert(`Game Over! ${winner} wins!`);
}

onValue(gameRef, (snapshot) => {
  const gameData = snapshot.val();

  if (gameData && gameData.status === "active") {
    const gameArea = document.getElementById("game");

    if (gameData.player1) {
      updatePlayerInGame(gameData.player1, 'player1', gameArea, 'blue');
      if (!currentPlayer && isPlayer1) {
        currentPlayer = { ...gameData.player1 };
      }
    }

    if (gameData.player2) {
      updatePlayerInGame(gameData.player2, 'player2', gameArea, 'red');
      if (!currentPlayer && !isPlayer1) {
        currentPlayer = { ...gameData.player2 };
      }
    }

    // Check for single player in active match
    if (!gameData.player1 || !gameData.player2) {
      endGame(gameData.player1 ? 'player1' : 'player2');
    }
  }
});

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

  // Display health
  playerElement.innerHTML = `Health: ${playerData.health || 100}`;
}

onValue(playerQueueRef, (snapshot) => {
  const players = snapshot.val();

  if (players) {
    const playerIds = Object.keys(players);

    if (playerIds.length === 2) {
      const sortedPlayers = playerIds.sort((a, b) => 
        players[a].timestamp - players[b].timestamp
      );

      update(gameRef, {
        player1: { 
          ...players[sortedPlayers[0]], 
          x: 1, 
          y: 1, 
          color: 'blue',
          health: 100
        },
        player2: { 
          ...players[sortedPlayers[1]], 
          x: 14, 
          y: 1, 
          color: 'red',
          health: 100
        },
        status: "active"
      }).then(() => {
        set(playerQueueRef, null);
      });
    }
  }
});

function initGame() {
  createMap(map);
  setupPlayerMovement();
  updateBullets();

  const joinQueueButton = document.getElementById("joinQueueButton");
  joinQueueButton.addEventListener("click", () => {
    addPlayerToQueue();
    
    onValue(playerQueueRef, (snapshot) => {
      const players = snapshot.val();
      if (players) {
        const playerIds = Object.keys(players);
        isPlayer1 = playerIds[0] === Object.keys(players).find(id => players[id]);
      }
    });
  });
}

initGame();