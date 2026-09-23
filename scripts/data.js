// The template of level is used to note where monolithicSlab('▉') are and where bricks
// '▉' represents a monolithicSlab
// 'X' represents a player start zone

// 1, 2, 12, 13 | 1, 11
// 1, 13 | 2, 10

// const templateOfLevel = [
//   ['▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉'],
//   ['▉', 'X', 'X', '_', '_', '_', '_', '_', '_', '_', '_', '_', 'X', 'X', '▉'],
//   ['▉', 'X', '▉', '_', '▉', '_', '▉', '_', '▉', '_', '▉', '_', '▉', 'X', '▉'],
//   ['▉', 'X', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', 'X', '▉'],
//   ['▉', '_', '▉', '_', '▉', '_', '▉', '_', '▉', '_', '▉', '_', '▉', '_', '▉'],
//   ['▉', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '▉'],
//   ['▉', '_', '▉', '_', '▉', '_', '▉', '_', '▉', '_', '▉', '_', '▉', '_', '▉'],
//   ['▉', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '▉'],
//   ['▉', '_', '▉', '_', '▉', '_', '▉', '_', '▉', '_', '▉', '_', '▉', '_', '▉'],
//   ['▉', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '▉'],
//   ['▉', 'X', '▉', '_', '▉', '_', '▉', '_', '▉', '_', '▉', '_', '▉', 'X', '▉'],
//   ['▉', 'X', 'X', '_', '_', '_', '_', '_', '_', '_', '_', '_', 'X', 'X', '▉'],
//   ['▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉']
// ];

let activeKey = null;

const brickWallDestructionTimer = 500;
let brickWallTimer = null;
let activatedBombQuantity = 0;
const bombOffset = {
  x: 8,
  y: 8,
};

const bonusOffSet = {
  x: 6,
  y: 6,
};

// [value, spriteRow]
const bonusType = {
  bombKicker: [false, 6],
  destroyed: [false, 2],
  explotionPower: [1, 1],
  extraBomb: [0, 0],
  extraLife: [1, 4],
  movementSpeed: [1, 7],
  protection: [false, 3],
  timer: [false, 8],
  threeInRow: [false, 9],
  unlimitedBomb: [false, 5]
}

let bonus = new Bonus({
  row: 1,
  col: 1,
  position: {
    x: 70,
    y: 70
  },
  imageSrc: './images/bonuses.png',
  scale: .75,
  framesMax: 10,
  spriteRow: bonusType.destroyed[1],
  spriteRowMax: 10,
  spritePositions: 1,
  spritePositionNumber: 0,
  type: 'bonus'
});

const brickWall = new Monolith({
  row: 0, // i
  col: 0, // j
  position: {
    x: 0,
    y: 0
  },
  imageSrc: './images/brick_wall.png',
  scale: 1,
  framesMax: 1,
  spriteRow: 0,
  spriteRowMax: 1,
  spritePositions: 1,
  spritePositionNumber: 0,
  type: 'brickWall'
});

const cellSize = 64;

const config = {
  bombsQuantity: 1,
  speed: .5,
}

// [blowUpLength, velocity, quantity of bricks]
const difficulty = {
  easy: [5, 2, .45],
  normal: [5, 3, .5],
  hard: [7, 4, .6],
  insane: [9, 5, .75]
};

const directions = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]];

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
const monolith = new Monolith({
  row: 0, // i
  col: 0, // j
  position: {
    // x: j * cellSize,
    // y: i * cellSize
    x: 0,
    y: 0
  },
  imageSrc: './images/monolith.png',
  scale: 1,
  framesMax: 1,
  spriteRow: 0,
  spriteRowMax: 1,
  spritePositions: 2,
  spritePositionNumber: 0,
  type: 'monolith'
});

const numberOfRows = 13;
const numberOfColumns = 15;

const cells = Array.from({ length: numberOfRows }, (v, i) => {
  switch (true) {
    case i === 0:
    case i == numberOfRows - 1:
      v = Array.from({ length: numberOfColumns }, (_, j) =>
        new Monolith({
          row: i, // i
          col: j, // j
          position: {
            x: j * cellSize,
            y: i * cellSize
          },
          imageSrc: './images/monolith.png',
          scale: 1,
          framesMax: 1,
          spriteRow: 0,
          spriteRowMax: 1,
          spritePositions: 2,
          spritePositionNumber: 0,
          type: 'monolith'
        }));
      break;
    case !(i % 2):
      v = Array.from({ length: numberOfColumns }, (_, j) =>
        !(j % 2) ?
          new Monolith({
            row: i, // i
            col: j, // j
            position: {
              x: j * cellSize,
              y: i * cellSize
            },
            imageSrc: './images/monolith.png',
            scale: 1,
            framesMax: 1,
            spriteRow: 0,
            spriteRowMax: 1,
            spritePositions: 2,
            spritePositionNumber: j == 0 || j == numberOfColumns - 1 ? 0 : 1,
            type: 'monolith'
          }) : '');
      break;
    default:
      v = Array.from({ length: numberOfColumns }, (_, j) =>
        j == 0 || j == numberOfColumns - 1 ?
          new Monolith({
            row: i, // i
            col: j, // j
            position: {
              x: j * cellSize,
              y: i * cellSize
            },
            imageSrc: './images/monolith.png',
            scale: 1,
            framesMax: 1,
            spriteRow: 0,
            spriteRowMax: 1,
            spritePositions: 2,
            spritePositionNumber: 0,
            type: 'monolith'
          }) : '');
      break;
  }
  return v;
});

// const player = new Player(1, 1, config.bombsQuantity, 1);
const player = new Player({
  row: 2,
  col: 1,
  bombsQuantity: config.bombsQuantity,
  explosionPower: 1,  
  position: {
    x: 64,
    y: 128
  },
  imageSrc: './images/player.png',
  scale: .65,
  framesMax: 3,
  spriteRow: 0,
  spriteRowMax: 8,
  spritePositions: 4,
  spritePositionNumber: 1
});

const playerDestruction = new PlayerDestruction({
  row: 1,
  col: 1,
  position: {
    x: 64,
    y: 64
  },
  imageSrc: './images/player_destruction.png',
  scale: .65,
  framesMax: 9,
  spriteRow: 0,
  spriteRowMax: 4,
  // spritePositions: 1,
  // spritePositionNumber: 0
  type: 'destroyed'
});

const playerOffset = {
  top: 2,
  bottom: 0,
  left: 3,
  right: 3,
};

const playerSize = 62;

function bombSetPosition(point) {
  return Math.round(point / cellSize) * cellSize;
}

function getPosition(position) {
  return position * cellSize;
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}