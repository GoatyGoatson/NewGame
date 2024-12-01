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

function renderPlayers(player1, player2) {
  const gameArea = document.getElementById('game');
  
  document.querySelectorAll('.player').forEach(el => el.remove());
  
  // Spieler 1
  if (player1) {
    const player1Tile = document.querySelector(`.tile[data-x="${player1.x}"][data-y="${player1.y}"]`);
    if (player1Tile) {
      const player1Element = document.createElement('div');
      player1Element.classList.add('player', 'player1');
      player1Element.style.backgroundColor = player1.color || 'blue';
      player1Tile.appendChild(player1Element);
    }
  }
  
  // Spieler 2
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

export { createMap, gameMap, renderPlayers };