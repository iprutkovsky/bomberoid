/*
  player - 96*96
  bomb   - 63*63
  tile   - 62*62
*/

class Sprite {

  constructor({ position, imageSrc, scale = 1, framesMax = 1, spriteRow, spriteRowMax, spritePositions = 1, spritePositionNumber = 0 }) {
    this.position = position;
    this.image = new Image();
    this.image.src = imageSrc;
    this.scale = scale;
    this.framesMax = framesMax;
    this.spriteRow = spriteRow;
    this.spriteRowMax = spriteRowMax;
    this.spritePositions = spritePositions;
    this.spritePositionNumber = spritePositionNumber;
    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = 45;
  }

  animateFrames() {
    this.framesElapsed++;
    if (!(this.framesElapsed % this.framesHold)) {
      this.framesCurrent = this.framesCurrent < this.framesMax - 1 ? this.framesCurrent + 1 : 0;
    }
  }

  draw() {
    // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    context.drawImage(
      this.image,
      this.framesCurrent * (this.image.width / (this.framesMax * this.spritePositions)) + this.width * this.framesMax * this.spritePositionNumber,
      this.height * this.spriteRow,
      this.image.width / (this.framesMax * this.spritePositions),
      this.image.height / this.spriteRowMax,
      this.position.x,
      this.position.y,
      this.image.width / (this.framesMax * this.spritePositions) * this.scale,
      this.image.height / this.spriteRowMax * this.scale,
    )
  }

  update() {
    this.draw();
    this.animateFrames();
  }
}

class Bomb extends Sprite {
  alive = true;
  height = 63;
  timer = 3000;
  type = 2;
  width = 63;

  constructor({ row, col, size, owner, position, imageSrc, scale, framesMax, spriteRow, spriteRowMax }) {
    super({
      position,
      imageSrc,
      scale,
      framesMax,
      spriteRow,
      spriteRowMax
    });
    this.row = row;
    this.col = col;
    this.size = size;
    this.owner = owner;
    this.position = position;
    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = 45;
  }

  // update the bomb each frame
  update(dt) {
    this.draw();
    this.animateFrames();

    this.timer -= dt;

    // blow up bomb if timer is done
    if (this.timer <= 0) {
      return blowUpBomb(this);
    }
  };
}

class Explosion extends Sprite {
  alive = true;
  height = 63;
  timer = 300;
  width = 63;

  constructor({ row, col, position, imageSrc, scale, framesMax, spriteRow, spriteRowMax }) {
    super({
      position,
      imageSrc,
      scale,
      framesMax,
      spriteRow,
      spriteRowMax
    });
    this.row = row;
    this.col = col;
    this.position = position;
    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = 45;
  }

  // update the explosion each frame
  update(dt) {
    this.draw();
    this.alive && this.animateFrames();
    this.timer -= dt;

    if (this.timer <= 0) {
      this.alive = false;
    }
  };
}

class Monolith extends Sprite {
  height = 63;
  width = 63;

  constructor({ row, col, position, imageSrc, scale, framesMax, spriteRow, spriteRowMax }) {
    super({
      position,
      imageSrc,
      scale,
      framesMax,
      spriteRow,
      spriteRowMax
    });
    this.row = row;
    this.col = col;
    this.position = position;
    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = 45;
  }

  update() {
    this.draw();
    this.animateFrames();
  };
}

class Player extends Sprite {

  width = 96;
  height = 96;

  constructor({
    row,
    col,
    movement = { x: 0, y: 0 },
    bombsQuantity,
    explosionPower,
    idle = true,
    position,
    imageSrc,
    scale,
    framesMax,
    spriteRow,
    spriteRowMax,
    spritePositions,
    spritePositionNumber
  }) {
    super({
      position,
      imageSrc,
      scale,
      framesMax,
      spriteRow,
      spriteRowMax,
      spritePositions,
      spritePositionNumber
    });
    this.row = row;
    this.col = col;
    this.movement = movement;
    this.bombsQuantity = bombsQuantity;
    this.explosionPower = explosionPower;
    this.idle = idle;
    this.position = position;
    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = 45;
  }

  update() {
    this.draw();
    this.animateFrames();

    this.position.x += this.movement.x;
    this.position.y += this.movement.y;

    if (this.idle) {
      this.framesCurrent = 0;
    }
  };
}