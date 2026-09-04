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

const bombOffset = {
  x: 8,
  y: 8,
};

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
  switch (true) {
    case i === 0:
    case i == numberOfRows - 1:
      v = Array.from({ length: numberOfColumns }, () => '▉');
      break;
    case !(i % 2):
      v = Array.from({ length: numberOfColumns }, (_, j) => !(j % 2) ? '▉' : '');
      break;
    default:
      v = Array.from({ length: numberOfColumns }, (_, k) => k == 0 || k == numberOfColumns - 1 ? '▉' : '');
      break;
  }
  return v;
});

const monolith = new Monolith({
  row: 0,
  col: 0,
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



// const player = new Player(1, 1, config.bombsQuantity, 1);
const player = new Player({
  row: 1,
  col: 1,
  bombsQuantity: config.bombsQuantity,
  explosionPower: 1,
  position: {
    x: 67,
    y: 130
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

const playerOffset = {
  top: 2,
  bottom: 1,
  left: 3,
  right: 3,
};