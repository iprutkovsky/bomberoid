// Variables section
const btn = document.querySelector('#start-game');
const canvas = document.querySelector('#game-canvas');
const context = canvas.getContext('2d');

// field size
canvas.width = cellSize * numberOfColumns;
canvas.height = cellSize * numberOfRows;

// -= Movement section =-
document.addEventListener('keydown', (e) => {
  let row = player.row;
  let col = player.col;

  // console.log(cells);
  // console.log(e.key, row, (player.position.y), col, (player.position.x));

  // if (!activeKey) {
  //   activeKey = e.code;
  //   // return;
  // }

  switch (e.code) {
    case 'KeyW': // Up
      // if (activeKey != e.code) {
      //   e.preventDefault();
      // }
      // else {
        keys.w.pressed = true;
        player.idle = false;
        player.spritePositionNumber = 3;
        console.log(player.idle, 'Up')
      // }
      break;
    case 'KeyS': // Down
      // if (activeKey != e.code) {
      //   e.preventDefault();
      // }
      // else {
        keys.s.pressed = true;
        player.idle = false;
        player.spritePositionNumber = 0;
        console.log(player.idle, 'Down')
      // }
      break;
    case 'KeyA': // Left
      // if (activeKey != e.code) {
      //   e.preventDefault();
      // }
      // else {
        keys.a.pressed = true;
        player.idle = false;
        player.spritePositionNumber = 2;
        console.log(player.idle, 'Left')
      // }
      break;
    case 'KeyD': // Right
      // if (activeKey != e.code) {
      //   e.preventDefault();
      // }
      // else {
        keys.d.pressed = true;
        player.idle = false;
        player.spritePositionNumber = 1;
        console.log(player.idle, 'Right')
      // }
      break;
    case 'Space': // Set bomb
      if (!cells[row][col] && entities.filter((entity) => entity.type == 'bomb' && entity.owner == player).length < player.bombsQuantity) {
        const bomb = new Bomb({
          row: row,
          col: col,
          size: player.explosionPower,
          owner: 'player',
          position: {
            x: getPosition(col) + bombOffset.x,
            y: getPosition(row) + bombOffset.y
          },
          imageSrc: './images/bomb.png',
          scale: .65,
          framesMax: 4,
          spriteRow: 0,
          spriteRowMax: 8,
          type: 'bomb'
        });
        cells[row][col] = bomb;
        entities.push(bomb);
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

  // activeKey == e.code && (activeKey = null);

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

  // bomb has already exploded so don't blow up again
  if (!bomb.alive) return;

  // console.log(bomb, 'bomb data')

  bomb.alive = false;

  // remove bomb from the field
  cells[bomb.row][bomb.col] = '';
  clearTimeout(brickWallTimer);

  //    0,    1,  2,    3,    4
  // center , Up, Down, Left, Right
  // [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]];
  // center of the explosion is the first iteration of the loop
  // i iterate over edges of explosion and add to the center (0 - center, 1 - top, 2 - bottom, 3 - left, 4 - right)
  // explosion extention (5 - vertical, 6 - horizontal)
  directions.forEach((dir, i) => {
    const row = bomb.row + dir[0];
    const col = bomb.col + dir[1];
    const cell = cells[row][col];

    // console.log(`from directions: [${row}, ${col}], [${bomb.row}, ${bomb.col}]`);

    switch (cell.type) {
      // run brick wall destruction
      case 'brickWall':
        cell.idle = false;
        brickWallTimer = setTimeout(() => (cells[row][col] = ''), brickWallDestructionTimer);
        break;
      // stop the explosion if it hit a wall
      case 'monolith':
        return;
    }

    // center of the explosion is the first iteration of the loop
    // i iterate over edges of explosion and add to the center (0 - center, 1 - top, 2 - bottom, 3 - left, 4 - right)
    entities.push(
      new Explosion({
        row: row,
        col: col,
        position: {
          x: getPosition(col),
          y: getPosition(row)
        },
        imageSrc: './images/bomb_edit.png',
        scale: 1,
        framesMax: 4,
        spriteRow: i,
        spriteRowMax: 8
      })
    );

    if (row == player.row && col == player.col) {
      // console.log('same location with player');
      player.destruction = true;
      playerDestruction.col = col;
      playerDestruction.row = row;
      playerDestruction.position.x = player.position.x;
      playerDestruction.position.y = player.position.y;
      // console.log(playerDestruction, player.position.x, player.position.y);
    }

    // bomb hit another bomb so blow that one up too
    if (cell.type == 'bomb') {
      // find the bomb that was hit by comparing positions
      const nextBomb = entities.find((entity) =>
        entity.type == 'bomb' && entity.row == row && entity.col == col
      );
      blowUpBomb(nextBomb);
    }

    // stop the explosion if hit anything
    if (cell) {
      return;
    }
  });
}

// generate maze level
function generateMazeLayout() {

  // console.log(cells);
  for (let row = 1; row < numberOfRows - 1; row++) {
    for (let col = 1; col < numberOfColumns - 1; col++) {

      if ([1, 11].includes(row) && [1, 2, 12, 13].includes(col) || [2, 3, 9, 10].includes(row) && [1, 13].includes(col)) {
        continue;
      }

      // % of chance cells will contain a brick
      if (!cells[row][col] && Math.random() < difficulty['easy'][2]) {
        cells[row][col] = new Monolith({
          row: row, // i
          col: col, // j
          position: {
            x: getPosition(col),
            y: getPosition(row)
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

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

  // update player and player's status
  player.update();
  if (player.destruction) {
    playerDestruction.update();
  }
  // bonus.update();

  player.movement.x = 0;
  player.movement.y = 0;

  // player movement
  switch (true) {
    case keys.w.pressed:
      let mazePositionUp = [Math.round((player.position.y - .525 * cellSize) / cellSize), Math.round(player.position.x / cellSize)];
      // console.log(`Up | position: [${mazePositionUp[0]}, ${mazePositionUp[1]}] | [x(${player.position.x}), y(${player.position.y})] | ${mazePositionUp} | ${cells[mazePositionUp[0]][mazePositionUp[1]].type}`);
      if (cells[mazePositionUp[0]][mazePositionUp[1]].type == 'brickWall' || cells[mazePositionUp[0]][mazePositionUp[1]].type == 'monolith' || cells[mazePositionUp[0]][mazePositionUp[1]].type == 'bomb') {
        keys.w.pressed = false;
        player.idle = true;
      }
      else {
        player.row = Math.round(player.position.y / cellSize);
        player.col = Math.round(player.position.x / cellSize);
        player.movement.y = -config.speed;
      }
      break;
    case keys.s.pressed:
      let mazePositionDown = [Math.round((player.position.y + .525 * cellSize) / cellSize), Math.round(player.position.x / cellSize)];
      // console.log(`Down | position: [${mazePositionDown[0]}, ${mazePositionDown[1]}] | [x(${player.position.x}), y(${player.position.y})] | ${mazePositionDown}`);
      if (cells[mazePositionDown[0]][mazePositionDown[1]].type == 'brickWall' || cells[mazePositionDown[0]][mazePositionDown[1]].type == 'monolith' || cells[mazePositionDown[0]][mazePositionDown[1]].type == 'bomb') {
        keys.s.pressed = false;
        player.idle = true;
      }
      else {
        player.row = Math.round(player.position.y / cellSize);
        player.col = Math.round(player.position.x / cellSize);
        player.movement.y = config.speed;
      }
      break;
    case keys.a.pressed:
      let mazePositionLeft = [Math.round(player.position.y / cellSize), Math.round((player.position.x - .55 * cellSize) / cellSize)];
      // console.log(`Left | position: [${mazePositionLeft[0]}, ${mazePositionLeft[1]}] | [x(${player.position.x}), y(${player.position.y})] | ${mazePositionLeft}`);
      if (cells[mazePositionLeft[0]][mazePositionLeft[1]].type == 'brickWall' || cells[mazePositionLeft[0]][mazePositionLeft[1]].type == 'monolith' || cells[mazePositionLeft[0]][mazePositionLeft[1]].type == 'bomb') {
        keys.a.pressed = false;
        player.idle = true;
      }
      else {
        player.row = Math.round(player.position.y / cellSize);
        player.col = Math.round(player.position.x / cellSize);
        player.movement.x = -config.speed;
      }
      break;
    case keys.d.pressed:
      let mazePositionRight = [Math.round(player.position.y / cellSize), Math.round((player.position.x + .55 * cellSize) / cellSize)];
      // console.log(`Right | position: [${mazePositionRight[0]}, ${mazePositionRight[1]}] | [x(${player.position.x}), y(${player.position.y})] | ${mazePositionRight}`);
      if (cells[mazePositionRight[0]][mazePositionRight[1]].type == 'brickWall' || cells[mazePositionRight[0]][mazePositionRight[1]].type == 'monolith' || cells[mazePositionRight[0]][mazePositionRight[1]].type == 'bomb') {
        keys.d.pressed = false;
        player.idle = true;
      }
      else {
        player.row = Math.round(player.position.y / cellSize);
        player.col = Math.round(player.position.x / cellSize);
        player.movement.x = config.speed;
      }
      break;
  }

  // remove deprecated entities
  entities = entities.filter((entity) => entity.alive);
}

function playerStartPosition() {
  clearTimeout(brickWallTimer);
  brickWallTimer = null;
  entities = [];
  player.row = getRandomNumber(1, 3);
  player.col = player.row < 2 ? getRandomNumber(1, 2) : 1;
  player.destruction = false;
  player.position.x = getPosition(player.col) + playerOffset.top;
  player.position.y = getPosition(player.row) + playerOffset.top;
  playerDestruction.framesCurrent = 0;
}

generateMazeLayout();
playerStartPosition();
requestAnimationFrame(main);