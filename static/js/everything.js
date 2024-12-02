import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js';
import { getDatabase, ref, set, update, push, onValue, remove } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-database.js';

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

const gameRef = ref(db, 'game');
const playerQueueRef = ref(db, 'queue');
const bulletsRef = ref(db, 'bullets');
const gameSessionRef = ref(db, 'gameSession');


const gameMap = [
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
   
function createMap(gameMap) {
    const gameArea = document.getElementById('game');
    gameArea.innerHTML = '';
    gameMap.forEach((row, y) => {
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
    console.log("Map erstellt!");
}

document.getElementById("queue-button").onclick = handleQueueButtonClick;

function handleQueueButtonClick() {
	const button = document.getElementById("queue-button");
  
	button.textContent = "Warten auf Gegner...";
	button.style.backgroundColor = "purple";
	button.disabled = true;

	const playerName = getPlayerName();
	if (!playerName) {
		alert("Bitte gib einen gültigen Namen ein.");
		resetButton(button);
		return;
	}
	addPlayerToQueue(playerName);
	observeQueue(button);
}

function getPlayerName() {
	const playerNameInput = document.getElementById("player-name");
	return playerNameInput.value.trim();
}

function addPlayerToQueue(playerName) {
	const newPlayerRef = push(playerQueueRef);
	set(newPlayerRef, {
		name: playerName,
		timestamp: Date.now(),
		health: 100,
	}).then(() => {
		console.log("Spieler ${playerName} wurde der Queue hinzugefügt.");
		document.getElementById("player-name").disabled = true;
	}).catch((error) => {
		console.error("Fehler beim Hinzufügen des Spielers zur Queue:", error);
		alert("Fehler beim Beitreten zur Queue. Bitte versuche es erneut.");
		resetButton(document.getElementById("queue-button")); // Button zurücksetzen
	});
}

function observeQueue(button) {
	onValue(playerQueueRef, (snapshot) => {
		const players = snapshot.val();
		if (players) {
			const playerIds = Object.keys(players);
			if (playerIds.length === 2) {
				button.textContent = "Match gefunden! Starte Spiel...";
				button.style.backgroundColor = "green";
				createMap(gameMap);
				startMatch(players);
			}
		}
	});
}

function renderPlayers(player1, player2) {
    const gameArea = document.getElementById('game');
    
    document.querySelectorAll('.player').forEach(el => el.remove());
    
    if (player1) {
      const player1Tile = document.querySelector(`.tile[data-x="${player1.x}"][data-y="${player1.y}"]`);
      if (player1Tile) {
        const player1Element = document.createElement('div');
        player1Element.classList.add('player', 'player1');
        player1Element.style.backgroundColor = player1.color || 'blue';
        player1Tile.appendChild(player1Element);
      }
    }
    
    if (player2) {
      const player2Tile = document.querySelector(`.tile[data-x="${player2.x}"][data-y="${player2.y}"]`);
      if (player2Tile) {
        const player2Element = document.createElement('div');
        player2Element.classList.add('player', 'player2');
        player2Element.style.backgroundColor = player2.color || 'red';
        player2Tile.appendChild(player2Element);
      }
    }
  }

function startMatch(players) {
	const playerIds = Object.keys(players);
	const sortedPlayers = playerIds.sort(
		(a, b) => players[a].timestamp - players[b].timestamp);
	update(gameRef, {
		player1: {
			...players[sortedPlayers[0]],
			x: 1,
			y: 1,
			color: "blue",
			health: 100,
		},
		player2: {
			...players[sortedPlayers[1]],
			x: 14,
			y: 1,
			color: "red",
			health: 100,
		},
		status: "active",
	}).then(() => {
		console.log("Match erfolgreich gestargt!");
		set(playerQueueRef, null);
		renderPlayers({
			x: 1,
			y: 1,
			color: "blue"
		}, {
			x: 14,
			y: 1,
			color: "red"
		});
	}).catch((error) => {
		console.error("Fehler beim Starten des Matches:", error);
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

function updatePlayerPositions() {
  onValue(gameRef, (snapshot) => {
    const gameData = snapshot.val();
    if (gameData && gameData.status === "active") {
      renderPlayers(gameData.player1, gameData.player2);
      console.log("Spieler gerendert:", gameData);
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