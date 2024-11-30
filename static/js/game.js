import { gameRef, bulletsRef, update, onValue, push, ref, remove, set, playerQueueRef } from './firebase.js';
import { addPlayerToQueue } from './matchmaking.js';
import { gameMap, renderPlayers, createMap } from './ui.js';

class GameManager {
  constructor() {
    this.currentPlayer = null;
    this.isPlayer1 = false;
    this.matchTimer = null;
  }

  init() {
    this.setupQueueListener();
    this.setupGameStatusListener();
    this.setupJoinQueueButton();
  }

  setupQueueListener() {
    onValue(playerQueueRef, (snapshot) => {
      const players = snapshot.val();
      if (players && Object.keys(players).length === 2) {
        this.startMatch(players);
      }
    });
  }

  setupGameStatusListener() {
    onValue(gameRef, (snapshot) => {
      const gameData = snapshot.val();
      const gameStatusElement = document.getElementById("game-status");

      if (gameData && gameData.status === "active") {
        gameStatusElement.textContent = "Aktives Match: Ja";
        this.setupPlayerMovement(gameData);
        this.startMatchTimer();
        this.setupBulletTracking();
      } else {
        this.updateQueueStatus(gameStatusElement);
      }
    });
  }

  setupJoinQueueButton() {
    const joinQueueButton = document.getElementById("joinQueueButton");
    joinQueueButton.addEventListener("click", () => {
      addPlayerToQueue();
    });
  }

  startMatch(players) {
    const playerIds = Object.keys(players).sort((a, b) => players[a].timestamp - players[b].timestamp);
    
    update(gameRef, {
      player1: { 
        ...players[playerIds[0]], 
        x: 1, 
        y: 1, 
        color: 'blue',
        health: 100
      },
      player2: { 
        ...players[playerIds[1]], 
        x: 14, 
        y: 1, 
        color: 'red',
        health: 100
      },
      status: "active"
    }).then(() => {
      set(playerQueueRef, null);
      createMap(gameMap);
      this.updatePlayerPositions();
    });
  }

  updatePlayerPositions() {
    onValue(gameRef, (snapshot) => {
      const gameData = snapshot.val();
      if (gameData && gameData.status === "active") {
        renderPlayers(
          gameData.player1, 
          gameData.player2
        );
      }
    });
  }

  setupPlayerMovement(gameData) {
    this.currentPlayer = gameData.player1;
    this.isPlayer1 = true;

    document.addEventListener('keydown', (event) => {
      if (!this.currentPlayer) return;

      let newX = this.currentPlayer.x;
      let newY = this.currentPlayer.y;
      let direction = { x: 0, y: 0 };

      switch (event.key) {
        case 'w': newY -= 1; direction = { x: 0, y: -1 }; break;
        case 's': newY += 1; direction = { x: 0, y: 1 }; break;
        case 'a': newX -= 1; direction = { x: -1, y: 0 }; break;
        case 'd': newX += 1; direction = { x: 1, y: 0 }; break;
        case ' ': 
          this.shootBullet(this.currentPlayer, direction);
          return;
      }

      if (this.isValidMove(newX, newY)) {
        this.currentPlayer.x = newX;
        this.currentPlayer.y = newY;

        const playerPath = this.isPlayer1 ? "player1" : "player2";
        update(gameRef, {
          [playerPath]: {
            ...this.currentPlayer,
            x: newX,
            y: newY
          }
        });
      }
    });
  }

  isValidMove(x, y) {
    return x >= 0 && x < gameMap[0].length && 
           y >= 0 && y < gameMap.length && 
           gameMap[y][x] === 0;
  }

  shootBullet(player, direction) {
    const bulletRef = push(bulletsRef);
    set(bulletRef, {
      x: player.x,
      y: player.y,
      dx: direction.x,
      dy: direction.y,
      owner: this.isPlayer1 ? 'player1' : 'player2',
      timestamp: Date.now()
    });
  }

  setupBulletTracking() {
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

  startMatchTimer() {
    this.matchTimer = setTimeout(() => {
      this.endMatch();
    }, 10 * 60 * 1000); // 10 Minuten
  }

  endMatch() {
    update(gameRef, {
      status: "ended",
      winner: "Timeout"
    }).then(() => {
      console.log("Match automatisch beendet.");
      this.clearPlayers();
    });
  }

  clearPlayers() {
    const player1Ref = ref(gameRef, "player1");
    const player2Ref = ref(gameRef, "player2");

    remove(player1Ref);
    remove(player2Ref);
  }

  updateQueueStatus(gameStatusElement) {
    onValue(playerQueueRef, (queueSnapshot) => {
      const players = queueSnapshot.val();
      const queueSize = players ? Object.keys(players).length : 0;
      gameStatusElement.textContent = `Queue: ${queueSize} Spieler`;
    });
  }
}

const gameManager = new GameManager();
gameManager.init();