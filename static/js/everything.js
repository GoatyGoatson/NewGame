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

// Game setup
let sessionId = null;
let isPlayer1 = false;

// Game Map (16x9 grid)
const map_name = "...";

const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const info = document.getElementById("game-status");
const timer = document.getElementById("timer");

// Generate a unique session ID and return a Promise
function generateSessionId(playerName) {
  return new Promise((resolve, reject) => {
      const newSessionId = 'game_' + Date.now();
      set(ref(db, `games/${newSessionId}`), {
          startTime: Date.now(),
          map,
          player1: { name: playerName, x: 1, y: 1 },
          player2: { name: null, x: 14, y: 7 },
      })
      .then(() => {
          console.log(`Session ID created: ${newSessionId}`);
          resolve({ sessionId: newSessionId, playerName });
      })
      .catch((error) => {
          console.error('Failed to create session ID:', error);
          reject(error);
      });
  });
}

// Render the map
function renderMap(player1, player2) {
    const gameContainer = document.getElementById('game');
    gameContainer.innerHTML = ''; // Clear previous content

    // Check if player1 and player2 are defined
    player1 = player1 || { x: -1, y: -1 };
    player2 = player2 || { x: -1, y: -1 };

    info.textContent += `Player 1: ${player1.name} (${player1.x}, ${player1.y})`;
    info.textContent += ` Player 2: ${player2.name} (${player2.x}, ${player2.y})`;

    // Render the game map
    map.forEach((row, y) => {
        row.forEach((tile, x) => {
            const tileElement = document.createElement('div');
            tileElement.classList.add('tile');
            tileElement.classList.add(tile === 1 ? 'wall' : 'floor');
            if (player1.x === x && player1.y === y) {
                tileElement.classList.add('player', 'player1');
            }
            if (player2.x === x && player2.y === y) {
                tileElement.classList.add('player', 'player2');
            }
            gameContainer.appendChild(tileElement);
        });
    });
}

// Timer variables
let timeLeft = 180; // 3 minutes in seconds
let timerInterval;

// Start game
function startGame() {
    onValue(ref(db, `games/${sessionId}`), (snapshot) => {
        const gameData = snapshot.val();
        if (!gameData) {
            console.error('No game data found');
            return;
        }
        if (!gameData.player1 || !gameData.player2) {
            console.error('Player data is missing');
            return;
        }
        renderMap(gameData.player1, gameData.player2);
    });

    // Start the timer
    timerInterval = setInterval(() => {
        timeLeft--;
        timer.textContent = `Time left: ${timeLeft} seconds`;

        if (timeLeft <= 0) {
            timer.textContent = 'Game Over!';
            endGame();
            clearInterval(timerInterval);
        }
    }, 1000); // Update every second
}

// Player movement
document.addEventListener('keydown', (event) => {
    if (!sessionId) return;

    const playerPath = isPlayer1 ? 'player1' : 'player2';
    const currentPosition = isPlayer1
        ? { x: 1, y: 1 } // Starting position for Player 1
        : { x: 14, y: 7 }; // Starting position for Player 2

    let newPosition = { ...currentPosition };
    switch (event.key) {
        case 'ArrowUp': newPosition.y--; break;
        case 'ArrowDown': newPosition.y++; break;
        case 'ArrowLeft': newPosition.x--; break;
        case 'ArrowRight': newPosition.x++; break;
        default: return;
    }

    // Prevent movement into walls
    if (map[newPosition.y][newPosition.x] === 1) return;

    update(ref(db, `games/${sessionId}/${playerPath}`), newPosition);
});

// Queue logic for matchmaking
document.getElementById('queue-button').addEventListener('click', async () => {
  const playerName = document.getElementById('player-name').value;
  if (!playerName) {
      alert('Please enter your name!');
      return;
  }

  const queueRef = ref(db, 'queue');
  onValue(queueRef, async (snapshot) => {
      let queue = snapshot.val() || [];
      if (queue.some(player => player.name === playerName)) {
          alert('You are already in the queue!');
          return;
      }

      if (queue.length === 0) {
          // Player 1 joins the game
          isPlayer1 = true;
          try {
              const { sessionId: newSessionId } = await generateSessionId(playerName);
              sessionId = newSessionId;
              queue.push({ name: playerName, sessionId: newSessionId });
              await set(queueRef, queue);
              info.textContent = 'Waiting for another player...';
          } catch (error) {
              console.error('Failed to create game session:', error);
          }
      } else {
          // Player 2 joins the game
          const player1Data = queue[0];
          sessionId = player1Data.sessionId;
          isPlayer1 = false;
          queue.push({ name: playerName });
          try {
              await set(queueRef, queue);
              await update(ref(db, `games/${sessionId}`), {
                player2: { name: playerName, x: 14, y: 7 }
              });
              info.textContent = `Game started with ${player1Data.name} and ${playerName}`;

              // Remove players from the queue
              await remove(queueRef);

              // Start the game
              startGame();
          } catch (error) {
              console.error('Failed to update players in game session:', error);
          }
      }
  }, { onlyOnce: true });
});

function endGame() {
    const gameRef = ref(db, 'games');
    const playerQueueRef = ref(db, 'queue');

    // Disable the queue button
    const queueButton = document.getElementById("queue-button");
    queueButton.disabled = true;
  
    // Update the game status in the database
    update(gameRef, {
      status: "inactive"
    }).then(() => {
      console.log("Game ended!");
  
      // Clear the player queue
      set(playerQueueRef, null);
  
      // Clear the game data
      set(gameRef, null);
  
      // Clear the bullets data - habe ich noch nicht
      // set(bulletsRef, null);

      // Clear the timer interval
      clearInterval(timerInterval);
  
      // Display a message to the players
      const gameStatusElement = document.getElementById("game-status");
      gameStatusElement.textContent = "Match beendet!";
    }).catch((error) => {
      console.error("Error ending the game:", error);
    });
  }