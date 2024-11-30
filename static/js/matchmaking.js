// matchmaking.js
import { playerQueueRef, gameRef, set, update, onValue, push } from './firebase.js';

function addPlayerToQueue() {
  const newPlayerRef = push(playerQueueRef);
  set(newPlayerRef, {
    name: `Player-${Math.floor(Math.random() * 1000)}`,
    timestamp: Date.now(),
    health: 100
  });
}

function startMatch() {
  onValue(playerQueueRef, (snapshot) => {
    const players = snapshot.val();
    if (players) {
      const playerIds = Object.keys(players);

      if (playerIds.length === 2) {
        const sortedPlayers = playerIds.sort((a, b) => 
          players[a].timestamp - players[b].timestamp
        );

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
        });
      }
    }
  });
}

export { addPlayerToQueue, startMatch };
