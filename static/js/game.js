import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Firebase-Konfiguration
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
const database = getDatabase(app);

// Referenz auf die Datenbank
const gameRef = ref(database, "game");

// Daten schreiben
set(gameRef, {
  player1: "Player A",
  player2: "Player B",
  status: "active",
});

// Daten lesen
onValue(gameRef, (snapshot) => {
  const data = snapshot.val();
  console.log("Aktueller Spielstatus:", data);
});

console.log("Firebase erfolgreich initialisiert!");

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
let direction = { x: 1, y: 0 }; 
let bulletDirection = { ...direction };

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

function updatePlayerPosition() {
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach((tile) => {
        tile.classList.remove('player');
        const playerDiv = tile.querySelector('.player');
        if (playerDiv) playerDiv.remove(); // Entferne alte Spieler-Elemente
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

// Spiellogik für Bewegungen und Schießen
document.addEventListener("keydown", (event) => {
    const playerData = {
        key: event.key,
        timestamp: Date.now(),
    };

    let newX = playerPosition.x;
    let newY = playerPosition.y;

    switch (event.key) {
        case 'w': // Nach oben
            newY -= 1;
            direction = { x: 0, y: -1 }; // Blickrichtung nach oben
            break;
        case 's': // Nach unten
            newY += 1;
            direction = { x: 0, y: 1 }; // Blickrichtung nach unten
            break;
        case 'a': // Nach links
            newX -= 1;
            direction = { x: -1, y: 0 }; // Blickrichtung nach links
            break;
        case 'd': // Nach rechts
            newX += 1;
            direction = { x: 1, y: 0 }; // Blickrichtung nach rechts
            break;
        case ' ': // Leertaste zum Schießen
            shootBullet();
            break;
    }

    if (map[newY] && map[newY][newX] === 0) {
        playerPosition.x = newX;
        playerPosition.y = newY;
        updatePlayerPosition();
        // Bewegungen in Firebase-Datenbank speichern
        set(ref(database, "game/player1"), {
            x: playerPosition.x,
            y: playerPosition.y,
        });
    }

    // Spielerbewegungen speichern
    set(ref(database, "game/player1"), playerData);

    // Bewegungen von Spieler 2 synchronisieren
    set(ref(database, "game/player2"), playerData);
});

// Bewegungen von Spieler 1 und Spieler 2 in Echtzeit abrufen
onValue(ref(database, "game/player1"), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        const player1 = document.getElementById("player1");
        player1.style.left = `${data.x * 50}px`;
        player1.style.top = `${data.y * 50}px`;
    }
});

onValue(ref(database, "game/player2"), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        const player2 = document.getElementById("player2");
        player2.style.left = `${data.x * 50}px`;
        player2.style.top = `${data.y * 50}px`;
    }
});

function shootBullet() {
    const gameArea = document.getElementById('game');
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');

    // Kugel startet bei der Spielerposition
    const playerTile = document.querySelector(
        `.tile[data-x="${playerPosition.x}"][data-y="${playerPosition.y}"]`
    );
    const rect = playerTile.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();

    bullet.style.left = `${rect.left - gameRect.left + 25}px`;
    bullet.style.top = `${rect.top - gameRect.top + 25}px`;

    gameArea.appendChild(bullet);

    let bulletDirection = { ...direction };  // Setze die Richtung hier einmal

    // Kugel bewegen
    const interval = setInterval(() => {
        const bulletRect = bullet.getBoundingClientRect();
        const gameRect = gameArea.getBoundingClientRect();

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

        bullet.style.left = `${bullet.offsetLeft + bulletDirection.x * 5}px`;
        bullet.style.top = `${bullet.offsetTop + bulletDirection.y * 5}px`;
    }, 20);
}

// Initialisierung
createMap(map);
updatePlayerPosition();

