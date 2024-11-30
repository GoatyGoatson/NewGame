// Firebase initialisieren
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, set, onValue, push, update } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

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
const playerQueueRef = ref(db, "game/queue");  // Warteschlange für Spieler

// Funktion, um einen Spieler zur Warteschlange hinzuzufügen
// Funktion, um einen Spieler zur Warteschlange hinzuzufügen und ihm eine Farbe zuzuweisen
function addPlayerToQueue(playerData) {
    const newPlayerRef = push(playerQueueRef);  // Spieler zur Warteschlange hinzufügen
    set(newPlayerRef, playerData);  // Spieler-Daten speichern
  }
  
  // Wenn zwei Spieler in der Warteschlange sind, das Spiel starten und Farben zuweisen
  onValue(playerQueueRef, (snapshot) => {
    const players = snapshot.val();
    if (players) {
      const playerIds = Object.keys(players);
      if (playerIds.length === 2) {
        // Zwei Spieler sind in der Warteschlange
        const player1 = players[playerIds[0]];
        const player2 = players[playerIds[1]];
  
        // Den Spielern die Farben und Startpositionen zuweisen
        player1.color = "blue";
        player1.x = 1;  // Startposition für Spieler 1
        player1.y = 1;

        player2.color = "red";
        player2.x = 14;  // Startposition für Spieler 2
        player2.y = 1;
  
        // Spieler zuweisen und Spielstatus aktiv setzen
        update(gameRef, {
          player1: player1,
          player2: player2,
          status: "active",
        });
  
        // Warteschlange leeren, nachdem das Spiel begonnen hat
        set(playerQueueRef, null);
      }
    }
  });
  

// Spielfeld und Spieler erstellen
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

let playerPosition = { x: 1, y: 1 };

let direction = { x: 1, y: 0 }; // Startrichtung des Spielers

// Map rendern
function createMap(map) {
  const gameArea = document.getElementById('game');
  gameArea.innerHTML = '';  // Clear the game area

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

// Spielerposition aktualisieren
function updatePlayerPosition() {
  const tiles = document.querySelectorAll('.tile');
  tiles.forEach((tile) => {
    tile.classList.remove('player');
    const playerDiv = tile.querySelector('.player');
    if (playerDiv) playerDiv.remove();
  });

  const playerTile = document.querySelector(
    `.tile[data-x="${playerPosition.x}"][data-y="${playerPosition.y}"]`
  );
  if (playerTile) {
    const playerElement = document.createElement('div');
    playerElement.classList.add('player');
    playerTile.appendChild(playerElement);
  }
}

// Spielerbewegung
document.addEventListener('keydown', (event) => {
  let newX = playerPosition.x;
  let newY = playerPosition.y;

  switch (event.key) {
    case 'w': newY -= 1; direction = { x: 0, y: -1 }; break;
    case 's': newY += 1; direction = { x: 0, y: 1 }; break;
    case 'a': newX -= 1; direction = { x: -1, y: 0 }; break;
    case 'd': newX += 1; direction = { x: 1, y: 0 }; break;
  }

  if (map[newY] && map[newY][newX] === 0) {
    playerPosition.x = newX;
    playerPosition.y = newY;
    updatePlayerPosition();
    // Bewege die Position in der Datenbank
    set(ref(db, "game/player1"), {
      x: playerPosition.x,
      y: playerPosition.y,
    });
  }
});

// Kugel schießen
document.addEventListener('keydown', (event) => {
  if (event.key === ' ') { // Leertaste
    shootBullet();
  }
});

function shootBullet() {
  const gameArea = document.getElementById('game');
  const bullet = document.createElement('div');
  bullet.classList.add('bullet');

  const playerTile = document.querySelector(
    `.tile[data-x="${playerPosition.x}"][data-y="${playerPosition.y}"]`
  );
  const rect = playerTile.getBoundingClientRect();
  const gameRect = gameArea.getBoundingClientRect();

  bullet.style.left = `${rect.left - gameRect.left + 25}px`;
  bullet.style.top = `${rect.top - gameRect.top + 25}px`;

  gameArea.appendChild(bullet);

  let bulletDirection = { ...direction };

  const interval = setInterval(() => {
    const bulletRect = bullet.getBoundingClientRect();

    if (
      bulletRect.left < gameRect.left ||
      bulletRect.top < gameRect.top ||
      bulletRect.right > gameRect.right ||
      bulletRect.bottom > gameRect.bottom
    ) {
      bullet.remove();
      clearInterval(interval);
      return;
    }

    const bulletX = bulletRect.left + bulletRect.width / 2;
    const bulletY = bulletRect.top + bulletRect.height / 2;

    const tileX = Math.floor((bulletX - gameRect.left) / 50);
    const tileY = Math.floor((bulletY - gameRect.top) / 50);

    if (map[tileY] && map[tileY][tileX] === 1) {
      bullet.remove();
      clearInterval(interval);
      return;
    }

    bullet.style.left = `${bullet.offsetLeft + bulletDirection.x * 5}px`;
    bullet.style.top = `${bullet.offsetTop + bulletDirection.y * 5}px`;
  }, 20);
}

// Spieler 1 Bewegungen synchronisieren
onValue(ref(db, "game/player1"), (snapshot) => {
  const data = snapshot.val();
  if (data) {
    const player1 = document.getElementById("player1");
    player1.style.left = `${data.x * 50}px`;
    player1.style.top = `${data.y * 50}px`;
  }
});

// Spieler 2 Bewegungen synchronisieren
onValue(ref(db, "game/player2"), (snapshot) => {
  const data = snapshot.val();
  if (data) {
    const player2 = document.getElementById("player2");
    player2.style.left = `${data.x * 50}px`;
    player2.style.top = `${data.y * 50}px`;
  }
});

// Initialisierung der Map und Spieler
createMap(map);
updatePlayerPosition();

// Warteschlangen-Button: Spieler zur Warteschlange hinzufügen
const joinQueueButton = document.getElementById('joinQueueButton');
joinQueueButton.addEventListener('click', () => {
  const playerData = {
    x: playerPosition.x,
    y: playerPosition.y,
    id: Date.now()  // Einzigartige ID für den Spieler
  };
  addPlayerToQueue(playerData);  // Spieler zur Warteschlange hinzufügen
  joinQueueButton.disabled = true;  // Button deaktivieren, um doppelte Anmeldungen zu verhindern
  joinQueueButton.textContent = "In Warteschlange...";
});

// Daten des Spielstatus synchronisieren
onValue(gameRef, (snapshot) => {
  const data = snapshot.val();
  if (data && data.status === "active") {
    console.log("Spiel gestartet zwischen:", data.player1, "und", data.player2);
    // Hier könnte man den Spieler in das aktive Spiel überführen
    // oder eine neue Spieloberfläche anzeigen.
  }
});
