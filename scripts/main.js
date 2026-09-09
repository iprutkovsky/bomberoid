// Variables section
const btn = document.querySelector('#start-game');
const canvas = document.querySelector('#game-canvas');
const context = canvas.getContext('2d');

// field size
canvas.width = cellSize * numberOfColumns;
canvas.height = cellSize * numberOfRows;

// -= Movement section =-
document.addEventListener('keydown', (e) => {
  let row = Math.floor((player.position.y + playerSize) / cellSize);
  let col = Math.floor((player.position.x + playerSize) / cellSize);

  // console.log(cells);
  // console.log(e.key, row, (player.position.y), col, (player.position.x));
  switch (e.code) {
    case 'KeyW': // Up
      keys.w.pressed = true;
      player.idle = false;
      player.spritePositionNumber = 3;
      break;
    case 'KeyS': // Down
      keys.s.pressed = true;
      player.idle = false;
      player.spritePositionNumber = 0;
      break;
    case 'KeyA': // Left
      keys.a.pressed = true;
      player.idle = false;
      player.spritePositionNumber = 2;
      break;
    case 'KeyD': // Right
      keys.d.pressed = true;
      player.idle = false;
      player.spritePositionNumber = 1;
      break;
    case 'Space': // Set bomb
      if (!cells[row][col] && entities.filter((entity) => entity.type == types.bomb && entity.owner == player).length < player.bombsQuantity) {
        // console.log(player, 'player details');
        const bomb = new Bomb({
          row: row,
          col: col,
          size: player.explosionPower,
          owner: player,
          position: {
            x: bombSetPosition(player.position.x) + bombOffset.x,
            y: bombSetPosition(player.position.y) + bombOffset.y
          },
          imageSrc: './images/bomb.png',
          scale: .65,
          framesMax: 4,
          spriteRow: 0,
          spriteRowMax: 8
        });
        entities.push(bomb);
        cells[row][col] = types.bomb;
      }
      break;
    case 'Escape': // Pause
      cancelAnimationFrame(loop);
      // btn.style.display = 'block';
      // btn.innerHTML = language[selectedGameLanguage].pauseGame;
      // game.paused = true;
      // stopTimer();
      break;
  }

  if (!cells[row][col]) {
    player.row = row;
    player.col = col;
  }
});

document.addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'KeyW': // Up
      keys.w.pressed = false;
      player.idle = true;
      break;
    case 'KeyS': // Down
      keys.s.pressed = false;
      player.idle = true;
      break;
    case 'KeyA': // Left
      keys.a.pressed = false;
      player.idle = true;
      break;
    case 'KeyD': // Right
      keys.d.pressed = false;
      player.idle = true;
      break;
  }
});

// blow up a bomb and its surrounding tiles
function blowUpBomb(bomb) {

  let brickWallTimer = null;
  // bomb has already exploded so don't blow up again
  if (!bomb.alive) return;

  // console.log(bomb, 'bomb data')

  bomb.alive = false;

  // remove bomb from the field
  cells[bomb.row][bomb.col] = '';
  clearTimeout(brickWallTimer);
  dirs.forEach((dir) => {
    for (let i = 0; i <= bomb.size; i++) {
      const row = bomb.row + dir.row * i;
      const col = bomb.col + dir.col * i;
      const cell = cells[row][col];
      const explosion = new Explosion({
        row: row,
        col: col,
        position: {
          x: bomb.position.x,
          y: bomb.position.y
        },
        imageSrc: './images/bomb.png',
        scale: .65,
        framesMax: 4,
        spriteRow: 1,
        spriteRowMax: 8
      });

      // stop the explosion if it hit a wall
      if (cell.type == 'monolith') {
        return;
      }

      // center of the explosion is the first iteration of the loop
      entities.push(explosion);
      // cells[row][col] = '';

      // run brick wall destruction
      if (cell.type == 'brickWall') {
        cell.idle = false;
        brickWallTimer = setTimeout(() => (cells[row][col] = ''), brickWallDestructionTimer);        
      }

      // bomb hit another bomb so blow that one up too
      if (cell == types.bomb) {
        // find the bomb that was hit by comparing positions
        const nextBomb = entities.find((entity) =>
          entity.type == types.bomb && entity.row == row && entity.col == col
        );
        blowUpBomb(nextBomb);
      }

      // stop the explosion if hit anything
      if (cell) {
        return;
      }
    }
  });
}

// generate maze
function generateMazeLayout() {

  // console.log(cells);
  for (let row = 1; row < numberOfRows - 1; row++) {
    for (let col = 1; col < numberOfColumns - 1; col++) {

      if ([1, 11].includes(row) && [1, 2, 12, 13].includes(col) || [2, 10].includes(row) && [1, 13].includes(col)) {
        continue;
      }

      // % of chance cells will contain a brick
      if (!cells[row][col] && Math.random() < difficulty['easy'][2]) {
        cells[row][col] = new Monolith({
          row: row, // i
          col: col, // j
          position: {
            x: col * cellSize,
            y: row * cellSize
          },
          imageSrc: './images/brick_wall.png',
          scale: 1,
          framesMax: 8,
          spriteRow: 0,
          spriteRowMax: 1,
          spritePositions: 1,
          spritePositionNumber: 0,
          type: 'brickWall'
        });
      }
    }
  }
}

function main(timestamp) {
  loop = requestAnimationFrame(main);

  // check the difference between current and last timestamp
  if (!lastTimeStamp) {
    lastTimeStamp = timestamp;
  }

  dt = timestamp - lastTimeStamp;
  lastTimeStamp = timestamp;

  // refresh canvas after every move
  context.clearRect(0, 0, canvas.width, canvas.height);

  // update main field
  for (let row = 0; row < numberOfRows; row++) {
    for (let col = 0; col < numberOfColumns; col++) {
      switch (cells[row][col].type) {
        case 'brickWall':
          cells[row][col].update();
          break;
        case 'monolith':
          cells[row][col].update();
          break;
      }
    }
  }

  // update entities
  entities.forEach((entity) => {
    entity.draw();
    entity.update(dt);
  });

  player.update();

  player.movement.x = 0;
  player.movement.y = 0;

  // player movement
  switch (true) {
    case keys.w.pressed:
      let mazePositionUp = [Math.round((player.position.y - .5 * cellSize - playerOffset.top) / cellSize), Math.round(player.position.x / cellSize)];
      // console.log(`Up | position: [${mazePositionUp[0]}, ${mazePositionUp[1]}] | [x(${player.position.x}), y(${player.position.y})] | ${mazePositionUp}`);
      if (cells[mazePositionUp[0]][mazePositionUp[1]].type == 'brickWall' || cells[mazePositionUp[0]][mazePositionUp[1]].type == 'monolith') {
        keys.w.pressed = false;
        player.idle = true;
      }
      else {
        player.movement.y = -config.speed;
      }
      break;
    case keys.s.pressed:
      let mazePositionDown = [Math.round((player.position.y + .5 * cellSize) / cellSize), Math.round(player.position.x / cellSize)];
      // console.log(`Down | position: [${mazePositionDown[0]}, ${mazePositionDown[1]}] | [x(${player.position.x}), y(${player.position.y})] | ${mazePositionDown}`);
      if (cells[mazePositionDown[0]][mazePositionDown[1]].type == 'brickWall' || cells[mazePositionDown[0]][mazePositionDown[1]].type == 'monolith') {
        keys.s.pressed = false;
        player.idle = true;
      }
      else {
        player.movement.y = config.speed;
      }
      break;
    case keys.a.pressed:
      let mazePositionLeft = [Math.round(player.position.y / cellSize), Math.round((player.position.x - .4 * cellSize) / cellSize)];
      // console.log(`Left | position: [${mazePositionLeft[0]}, ${mazePositionLeft[1]}] | [x(${player.position.x}), y(${player.position.y})] | ${mazePositionLeft}`);
      if (cells[mazePositionLeft[0]][mazePositionLeft[1]].type == 'brickWall' || cells[mazePositionLeft[0]][mazePositionLeft[1]].type == 'monolith') {
        keys.a.pressed = false;
        player.idle = true;
      }
      else {
        player.movement.x = -config.speed;
      }
      break;
    case keys.d.pressed:
      let mazePositionRight = [Math.round(player.position.y / cellSize), Math.round((player.position.x + .25 * cellSize + playerOffset.right) / cellSize)];
      // console.log(`Right | position: [${mazePositionRight[0]}, ${mazePositionRight[1]}] | [x(${player.position.x}), y(${player.position.y})] | ${mazePositionRight}`);
      if (cells[mazePositionRight[0]][mazePositionRight[1]].type == 'brickWall' || cells[mazePositionRight[0]][mazePositionRight[1]].type == 'monolith') {
        keys.d.pressed = false;
        player.idle = true;
      }
      else {
        player.movement.x = config.speed;
      }
      break;
  }

  // remove deprecated entities
  entities = entities.filter((entity) => entity.alive);
}

generateMazeLayout();
requestAnimationFrame(main);