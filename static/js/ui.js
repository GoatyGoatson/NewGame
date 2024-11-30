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
   gameMap.forEach((row, y) => {  // Geändert von 'map' zu 'gameMap'
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
 
 export { createMap, gameMap };  // Exportiere auch gameMap