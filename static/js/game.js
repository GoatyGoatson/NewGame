// game.js
import { gameRef, bulletsRef, update, onValue } from './firebase.js';
import { addPlayerToQueue, startMatch } from './matchmaking.js';
import { map } from './map.js'; // Importiere die Map aus der map.js

// Hier die Firebase-Initiierung und andere Spielvariablen

function createMap(map) {
  const gameArea = document.getElementById('game');
  gameArea.innerHTML = '';  // Leert das Spielfeld

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
        }
      });
    }
  });
}

function initGame() {
  const joinQueueButton = document.getElementById("joinQueueButton");
  joinQueueButton.addEventListener("click", () => {
    addPlayerToQueue();
    startMatch();
  });

  setupPlayerMovement();
  updateBullets();
}

initGame();
