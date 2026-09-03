// Variables section
const btn = document.querySelector('#start-game');
const canvas = document.querySelector('#game-canvas');
const context = canvas.getContext('2d');
// [blowUpLength, velocity, quantity of bricks]

const config = {
  bombsQuantity: 1,
  speed: .5,
}

const difficulty = {
  easy: [5, 2, .45],
  normal: [5, 3, .5],
  hard: [7, 4, .6],
  insane: [9, 5, .75]
};
const dirs = [
  {
    row: -1, // up
    col: 0
  },
  {
    row: 1, // down
    col: 0
  },
  {
    row: 0,
    col: -1 // left
  },
  {
    row: 0,
    col: 1 // right
  }
];
let dt;
let entities = [];
const keys = {
  w: {
    pressed: false
  },
  s: {
    pressed: false
  },
  a: {
    pressed: false
  },
  d: {
    pressed: false
  }
};
let lastTimeStamp;
let loop;
const numberOfRows = 13;
const numberOfColumns = 15;
const cells = Array.from({ length: numberOfRows }, (v, i) => {
  if (i == 0 || i == numberOfRows - 1) {
    v = Array.from({ length: numberOfColumns }, () => '▉');
  }
  else if (!(i % 2)) {
    v = Array.from({ length: numberOfColumns }, (_, j) => !(j % 2) ? '▉' : '');
  }
  else {
    v = Array.from({ length: numberOfColumns }, (_, k) => k == 0 || k == numberOfColumns - 1 ? '▉' : '');
  }
  return v;
});

const monolith = new Monolith({
  row: 0,
  col: 0,
  position: {
    x: 0,
    y: 0
  },
  imageSrc: './images/tiles.png',
  scale: .984375,
  framesMax: 1,
  spriteRow: 6,
  spriteRowMax: 7
});

// const player = new Player(1, 1, config.bombsQuantity, 1);
const player = new Player({
  row: 1,
  col: 1,
  bombsQuantity: config.bombsQuantity,
  explosionPower: 1,
  position: {
    x: 67,
    y: 67
  },
  imageSrc: './images/player.png',
  scale: .65,
  framesMax: 3,
  spriteRow: 0,
  spriteRowMax: 8,
  spritePositions: 4,
  spritePositionNumber: 1
});
const types = {
  bomb: 2,
  brickWall: 1,
  monolith: '▉',
};

// field size
canvas.width = grid * numberOfColumns;
canvas.height = grid * numberOfRows;

// canvas for the bricks
const brickWallCanvas = document.createElement('canvas');
const brickWallCtx = brickWallCanvas.getContext('2d');

brickWallCanvas.width = grid;
brickWallCanvas.height = grid;

brickWallCtx.fillStyle = 'grey';
brickWallCtx.fillRect(0, 0, grid, grid);

// 1st row brick
brickWallCtx.fillStyle = '#bdbdbd';
brickWallCtx.fillRect(1, 1, grid - 2, 20);

// 2nd row bricks
brickWallCtx.fillRect(0, 23, 20, 18);
brickWallCtx.fillRect(22, 23, 42, 18);

// 3rd row bricks
brickWallCtx.fillRect(0, 43, 42, 20);
brickWallCtx.fillRect(44, 43, 20, 20);

// canvas for the monolith
const monolithCanvas = document.createElement('canvas');
const monolithCtx = monolithCanvas.getContext('2d');

monolithCanvas.width = grid;
monolithCanvas.height = grid;

monolithCtx.fillStyle = 'grey';
monolithCtx.fillRect(0, 0, grid, grid);
monolithCtx.fillStyle = '#d6d6d6';
monolithCtx.fillRect(0, 0, grid - 2, grid - 2);
monolithCtx.fillStyle = '#a9a9a9';
monolithCtx.fillRect(2, 2, grid - 4, grid - 4);

// Functions section
document.addEventListener('keydown', (e) => {
  let row = player.row;
  let col = player.col;

  console.log(e.key);
  switch (e.code) {
    case 'KeyW': // Up
      row--;
      keys.w.pressed = true;
      player.idle = false;
      player.spritePositionNumber = 3;
      break;
    case 'KeyS': // Down
      row++;
      keys.s.pressed = true;
      player.idle = false;
      player.spritePositionNumber = 0;
      break;
    case 'KeyA': // Left
      col--;
      keys.a.pressed = true;
      player.idle = false;
      player.spritePositionNumber = 2;
      break;
    case 'KeyD': // Right
      col++;
      keys.d.pressed = true;
      player.idle = false;
      player.spritePositionNumber = 1;
      break;
    case 'Space': // Set bomb
      if (!cells[row][col] && entities.filter((entity) => entity.type == types.bomb && entity.owner == player).length < player.bombsQuantity) {
        console.log(player, 'player details');
        const bomb = new Bomb({
          row: row,
          col: col,
          size: player.explosionPower,
          owner: player,
          position: {
            x: grid * (col + 1) + .15 * grid,
            y: grid * row + .15 * grid
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

  // bomb has already exploded so don't blow up again
  if (!bomb.alive) return;

  bomb.alive = false;

  // remove bomb from the field
  cells[bomb.row][bomb.col] = null;

  dirs.forEach((dir) => {
    for (let i = 0; i < bomb.size; i++) {
      const row = bomb.row + dir.row * i;
      const col = bomb.col + dir.col * i;
      const cell = cells[row][col];
      const explosion = new Explosion({
        row: row,
        col: col,
        position: {
          x: grid * (col + 1) + .15 * grid,
          y: grid * row + .15 * grid
        },
        imageSrc: './images/bomb.png',
        scale: .65,
        framesMax: 4,
        spriteRow: 1,
        spriteRowMax: 8
      });

      // stop the explosion if it hit a wall
      if (cell == types.monolith) {
        return;
      }

      // center of the explosion is the first iteration of the loop
      entities.push(explosion);
      cells[row][col] = null;

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
  for (let row = 1; row < numberOfRows - 1; row++) {
    for (let col = 1; col < numberOfColumns - 1; col++) {

      if ([1, 11].includes(row) && [1, 2, 12, 13].includes(col) || [2, 10].includes(row) && [1, 13].includes(col)) {
        continue;
      }

      // % of chance cells will contain a brick
      if (!cells[row][col] && Math.random() < difficulty['easy'][2]) {
        cells[row][col] = types.brickWall;
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
      switch (cells[row][col]) {
        case types.brickWall:
          context.drawImage(brickWallCanvas, col * grid, row * grid);
          break;
        case types.monolith:
          // monolith.update();
          context.drawImage(monolithCanvas, col * grid, row * grid);
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
  // monolith.update();

  player.movement.x = 0;
  player.movement.y = 0;

  // player movement
  if (keys.w.pressed) {
    player.movement.y = -config.speed;
  }
  else if (keys.s.pressed) {
    player.movement.y = config.speed;
  }
  else if (keys.a.pressed) {
    player.movement.x = -config.speed;
  }
  else if (keys.d.pressed) {
    player.movement.x = config.speed;
  }

  // remove deprecated entities
  entities = entities.filter((entity) => entity.alive);
}

generateMazeLayout();
requestAnimationFrame(main);