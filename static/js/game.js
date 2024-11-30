// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

document.addEventListener("keydown", (event) => {
    const playerData = {
      key: event.key, // z. B. "ArrowUp" oder "w"
      timestamp: Date.now(), // Zeitstempel für die Aktion
    };
  
    // Schreib die Aktion des Spielers in die Datenbank
    set(ref(db, "game/player1"), playerData);
  });

  onValue(ref(db, "game/player2"), (snapshot) => {
    const data = snapshot.val();
    if (data) {
      console.log("Spieler 2 bewegt sich:", data.key);
      // Hier reagierst du auf die Aktion (z. B. Spieler 2 auf dem Bildschirm bewegen)
    }
  });

  document.addEventListener("keydown", (event) => {
    const playerData = {
      key: event.key,
      timestamp: Date.now(),
    };
  
    set(ref(db, "game/player2"), playerData); // Spieler 2 schreibt seine Daten
  });
  
  onValue(ref(db, "game/player1"), (snapshot) => {
    const data = snapshot.val();
    if (data) {
      console.log("Spieler 1 bewegt sich:", data.key);
      // Reagiere auf Spieler 1's Bewegung
    }
  });
  
  const player1 = document.getElementById("player1");
  const player2 = document.getElementById("player2");
  
  // Spieler 1 Bewegung
  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") player1.style.left = `${player1.offsetLeft + 10}px`;
    if (event.key === "ArrowLeft") player1.style.left = `${player1.offsetLeft - 10}px`;
  
    set(ref(db, "game/player1"), {
      x: player1.offsetLeft,
      y: player1.offsetTop,
    });
  });
  
  // Spieler 2 Bewegung synchronisieren
  onValue(ref(db, "game/player2"), (snapshot) => {
    const data = snapshot.val();
    if (data) {
      player2.style.left = `${data.x}px`;
      player2.style.top = `${data.y}px`;
    }
  });
  


// Spielerbewegungen speichern
document.addEventListener("keydown", (event) => {
  set(ref(db, "game/player1"), {
    key: event.key,
  });
});

// Echtzeit-Bewegungen anderer Spieler abrufen
onValue(ref(db, "game/player2"), (snapshot) => {
  const data = snapshot.val();
  console.log("Bewegung von Spieler 2:", data);
});

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

direction = { x: 1, y: 0 }; 

let bulletDirection = {...direction};

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

document.addEventListener('keydown', (event) => {
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
    }

    if (map[newY] && map[newY][newX] === 0) {
        playerPosition.x = newX;
        playerPosition.y = newY;
        updatePlayerPosition();
    }
});

// Kugeln schießen
document.addEventListener('keydown', (event) => {
    if (event.key === ' ') { // Leertaste
        shootBullet();
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

    let bulletDirection = { ...direction };

    // Kugel bewegen
    const interval = setInterval(() => {
        const bulletRect = bullet.getBoundingClientRect();

        // Überprüfen, ob die Kugel außerhalb des Spielfelds ist
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

        /// Berechne die neuen Koordinaten der Kugel
        const bulletX = Math.floor((bulletRect.left + bulletRect.right) / 2);
        const bulletY = Math.floor((bulletRect.top + bulletRect.bottom) / 2);

        // Berechne die Tile-Koordinaten der Kugel
        const tileX = Math.floor((bulletX - gameRect.left) / 50);  // Hier 50px ist die Kachelgröße
        const tileY = Math.floor((bulletY - gameRect.top) / 50);   // Hier 50px ist die Kachelgröße

        // Überprüfen, ob die Kugel auf einer Wandkachel ist
        if (map[tileY] && map[tileY][tileX] === 1) { // 1 bedeutet Wand
            bullet.remove();
            clearInterval(interval);
            return;
        }

        // Kugel in der festen Richtung bewegen (ändert sich nicht mehr während des Fluges)
        bullet.style.left = `${bullet.offsetLeft + bulletDirection.x * 5}px`;
        bullet.style.top = `${bullet.offsetTop + bulletDirection.y * 5}px`;
    }, 20);
}

// Initialisierung
createMap(map);
updatePlayerPosition();
