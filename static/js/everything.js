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

// Generate a unique session ID for the game
function generateSessionId() {
    sessionId = 'game_' + Date.now();
    set(ref(db, `games/${sessionId}`), {
        startTime: Date.now(),
        player1: null,
        player2: null
    });
    console.log(`Session ID created: ${sessionId}`);
}

// Queue logic for matchmaking
document.getElementById('queue-button').addEventListener('click', () => {
  const playerName = document.getElementById('player-name').value;
  if (!playerName) {
      alert('Please enter your name!');
      return;
  }

  const queueRef = ref(db, 'queue');
  onValue(queueRef, (snapshot) => {
      let queue = snapshot.val() || [];
      if (queue.includes(playerName)) {
          alert('You are already in the queue!');
          return;
      }

      if (queue.length === 0) {
          // Add as player1
          isPlayer1 = true;
          queue.push(playerName);
          update(queueRef, queue);
          generateSessionId();
          alert('Waiting for another player...');
      } else {
          // Add as player2 and start game
          const [player1] = queue;
          set(ref(db, `games/${sessionId}/player1`), player1);
          set(ref(db, `games/${sessionId}/player2`), playerName);
          set(queueRef, []); // Clear the queue
          startGame();
      }
  }, { onlyOnce: true }); // Only trigger once for this action
});

// Start game
function startGame() {
    setTimeout(() => {
        alert('Game Over!');
        endGame();
    }, 180000); // End game after 3 minutes
}

// End game
function endGame() {
    if (sessionId) {
        set(ref(db, `games/${sessionId}`), null);
        sessionId = null;
    }
}

// Player movement
document.addEventListener('keydown', (event) => {
    if (!sessionId) return;

    const playerPath = isPlayer1 ? 'player1Position' : 'player2Position';
    const currentPosition = { /* logic to get current position */ };

    let newPosition;
    switch (event.key) {
        case 'ArrowUp': newPosition = { x: currentPosition.x, y: currentPosition.y - 1 }; break;
        case 'ArrowDown': newPosition = { x: currentPosition.x, y: currentPosition.y + 1 }; break;
        case 'ArrowLeft': newPosition = { x: currentPosition.x - 1, y: currentPosition.y }; break;
        case 'ArrowRight': newPosition = { x: currentPosition.x + 1, y: currentPosition.y }; break;
        default: return;
    }

    update(ref(db, `games/${sessionId}/${playerPath}`), newPosition);
});

// Shooting logic
document.addEventListener('keydown', (event) => {
    if (event.key === 'Space') {
        const bullet = { /* logic for bullet position and direction */ };
        // Update Firebase with bullet data
        update(ref(db, `games/${sessionId}/bullets`), { bullet });
    }
});
