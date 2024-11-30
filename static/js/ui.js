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
  
  export { createMap };
  