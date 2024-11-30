import { gameRef, bulletsRef, update, onValue, push, ref, remove, set, playerQueueRef } from './firebase.js';
import { addPlayerToQueue } from './matchmaking.js';
import { map } from './map.js';

document.addEventListener('DOMContentLoaded', () => {
  createMap(map);
});

function createMap(map) {
  console.log('Creating map...');
  console.log(map);
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

function startMatchTimer() {
  setTimeout(() => {
    endMatch();
  }, 10 * 60 * 1000); // 10 Minuten in Millisekunden
}

function endMatch() {
  update(gameRef, {
    status: "ended",
    winner: "Timeout"
  }).then(() => {
    console.log("Match automatisch beendet.");
  });

  const player1Ref = ref(gameRef, "player1");
  const player2Ref = ref(gameRef, "player2");

  remove(player1Ref);
  remove(player2Ref);
}

function clearQueuePeriodically() {
  setInterval(() => {
    clearQueue();
  }, 10 * 60 * 1000); // 10 Minuten in Millisekunden
}

function clearQueue() {
  remove(playerQueueRef)
    .then(() => {
      console.log("Queue automatisch geleert.");
    })
    .catch((error) => {
      console.error("Fehler beim Leeren der Queue:", error);
    });
}
clearQueuePeriodically();

let currentPlayer = null;
let isPlayer1 = false;

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

function isValidMove(x, y) {
  if (x < 0 || x >= map[0].length || y < 0 || y >= map.length) {
    return false; // Spieler bewegt sich außerhalb der Karte
  }
  return map[y][x] === 0; // Spieler kann nur auf freien Feldern stehen
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
    
    document.querySelectorAll('.bullet').forEach(b => b.remove());

    if (bullets) {
      Object.keys(bullets).forEach(key => {
        const bullet = bullets[key];
        const bulletElement = document.createElement('div');
        bulletElement.classList.add('bullet');
        
        const tile = document.querySelector(`.tile[data-x="${bullet.x}"][data-y="${bullet.y}"]`);
        if (tile) {
          const rect = tile.getBoundingClientRect();
          bulletElement.style.left = `${rect.left + rect.width / 2 - 10}px`;
          bulletElement.style.top = `${rect.top + rect.height / 2 - 10}px`;
          
          gameArea.appendChild(bulletElement);
        }
      });
    }
  });
}

function initGame() {
  updateMatchAndQueueStatus();

  const joinQueueButton = document.getElementById("joinQueueButton");
  joinQueueButton.addEventListener("click", () => {
    addPlayerToQueue();

    // Prüfe regelmäßig, ob ein Match gefunden wurde
    onValue(playerQueueRef, (snapshot) => {
      const players = snapshot.val();
      if (players) {
        const playerIds = Object.keys(players);
        
        if (playerIds.length === 2) {
          startMatch();
          startMatchTimer();
          setupPlayerMovement();
          updateBullets();

          const sortedPlayers = playerIds.sort((a, b) => players[a].timestamp - players[b].timestamp);
          
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
            createMap(map);
          });
        }
      }
    });
  });
}

function updateMatchAndQueueStatus() {
  onValue(gameRef, (snapshot) => {
    const gameData = snapshot.val();
    const gameStatusElement = document.getElementById("game-status");

    if (gameData && gameData.status === "active") {
      gameStatusElement.textContent = "Aktives Match: Ja";
    } else {
      onValue(playerQueueRef, (queueSnapshot) => {
        const players = queueSnapshot.val();
        const queueSize = players ? Object.keys(players).length : 0;
        gameStatusElement.textContent = `Queue: ${queueSize} Spieler`;
      });
    }
  });
}

initGame();
