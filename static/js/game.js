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
