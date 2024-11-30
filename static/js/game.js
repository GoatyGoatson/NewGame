import { gameRef, bulletsRef, update, onValue, push, ref, remove, set, playerQueueRef } from './firebase.js';
import { addPlayerToQueue } from './matchmaking.js';
import { gameMap } from './ui.js'; 
import { renderPlayers } from './ui.js';


function updatePlayerPositions() {
  onValue(gameRef, (snapshot) => {
    const gameData = snapshot.val();
    if (gameData && gameData.status === "active") {
      renderPlayers(gameData.player1, gameData.player2);
      console.log("Spieler gerendert:", gameData);
    }
  });
}

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
  if (x < 0 || x >= gameMap[0].length || y < 0 || y >= gameMap.length) {
    return false; // Spieler bewegt sich außerhalb der Karte
  }
  return gameMap[y][x] === 0; // Spieler kann nur auf freien Feldern stehen
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
  updatePlayerPositions();

  const joinQueueButton = document.getElementById("joinQueueButton");
  joinQueueButton.addEventListener("click", () => {
    addPlayerToQueue();

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