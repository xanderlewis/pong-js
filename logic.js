// LOAD AUDIO
var bleep1 = new Audio("bleep1.mp3");
bleep1.volume = 0.3;
var bleep2 = new Audio("bleep2.mp3");
bleep1.volume = 0.3;

// RANDOM FUNCTION
function randInRange(min, max) {
  return Math.random() * (max - min) + min;
}

// SETUP CANVAS
const WIDTH = 250, HEIGHT = 250;
const PADDLE_SPACING = 10, PADDLE_WIDTH = 10, PADDLE_HEIGHT = 50;
const BALL_SIDE = 10, COL = [255,255,255], HIT_COL = [255,200,0];
const canvas = document.getElementById("gamecanvas");
const ctx = canvas.getContext("2d");
const pixelMult = window.devicePixelRatio;
canvas.width = WIDTH*pixelMult;
canvas.height = HEIGHT*pixelMult;
canvas.style.width = canvas.width/pixelMult + "px";
canvas.style.height = canvas.height/pixelMult + "px";
ctx.scale(pixelMult, pixelMult);

// SETUP SCENE
const UPARROW = 38, DOWNARROW = 40, WKEY = 87, SKEY = 83;
var keystate = {};
document.addEventListener("keydown", function(e) {
  keystate[e.keyCode] = true;
});
document.addEventListener("keyup", function(e) {
  delete keystate[e.keyCode];
});

const score1 = document.getElementById("left");
const score2 = document.getElementById("right");

function Particle(size, colour, x, y, xV, yV) {
  this.x = x;
  this.y = y;
  this.xV = xV;
  this.yV = yV;
  this.size = size;
  this.colour = colour;

  this.update = function() {
    // Shrink
    if (this.size <= 0) {
      delete this;
    } else {
      this.size -= delta * 0.005;
    }

    // Move
    this.x += this.xV;
    this.y += this.yV;
  };

  this.draw = function() {
    ctx.fillStyle = this.colour;
    ctx.fillRect(this.x - this.size, this.y - this.size, this.size, this.size);
  };
}

var paddle1 = {
  x: 0 + PADDLE_SPACING,
  y: HEIGHT / 2 - PADDLE_HEIGHT/2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  maxSpeed: 4,
  score: 0,
  velocity: 0,
  ai: true,
  timeSinceCheck: 0,

  reset: function() {
    this.maxSpeed = 6;
    timeSinceCheck: 0;
  },

  update: function() {
    // Calculate width
    this.width = PADDLE_WIDTH * 2/(Math.abs(this.velocity)/10+2)

    this.timeSinceCheck += delta;


    if (!this.ai) {
      // Player control
      if (keystate[WKEY] && this.y >= 0) {
        this.velocity = -1 * this.maxSpeed;
      } else if (keystate[SKEY] && this.y + this.height <= HEIGHT) {
        this.velocity = 1 * this.maxSpeed;
      } else {
        // Slow down
        this.velocity *= 0.9;
      }
    } else {
      // AI control
      if (this.timeSinceCheck > 150) {
        this.maxSpeed += 0.1
        this.timeSinceCheck = 0;
        if (ball.y + ball.height/2 > this.y + this.height) {
          this.velocity = 1 * this.maxSpeed;
        } else if (ball.y + ball.height/2 < this.y) {
          this.velocity = -1 * this.maxSpeed;
        }
      } else {
        // Slow down
        this.velocity *= 0.9;
      }
    }

    this.y += this.velocity * delta * 0.06;

    if (this.y >= 0 && this.y + this.height <= HEIGHT) {
    } else {
      this.velocity *= -1
    }

  },

  draw: function() {
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

var paddle2 = {
  x: WIDTH - PADDLE_SPACING - PADDLE_WIDTH,
  y: HEIGHT / 2 - PADDLE_HEIGHT/2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  maxSpeed: 8,
  score: 0,
  velocity: 0,

  update: function() {

    // Calculate width
    this.width = PADDLE_WIDTH * 2/(Math.abs(this.velocity)/10+2)

    // Player control
    if (keystate[UPARROW] && this.y >= 0) {
      this.velocity = -1 * this.maxSpeed;
    } else if (keystate[DOWNARROW] && this.y + this.height <= HEIGHT) {
      this.velocity = 1 * this.maxSpeed;
    } else {
      // Slow down
      this.velocity *= 0.9;
    }

    this.y += this.velocity * delta * 0.06;

    if (this.y >= 0 && this.y + this.height <= HEIGHT) {
    } else {
      this.velocity *= -1
    }
  },

  draw: function() {
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

var ball = {
  x: WIDTH / 2 - BALL_SIDE/2,
  y: HEIGHT / 2 - BALL_SIDE/2,
  width: BALL_SIDE,
  height: BALL_SIDE,
  colour: 1,

  timeSinceReset: 0,
  timeSinceCollision: undefined,
  timeSinceParticle: 0,
  intersecting: false,

  xVel: 0,
  yVel: 0,

  reset: function() {
    // Starting position
    this.x = WIDTH / 2 - BALL_SIDE/2;
    this.y = HEIGHT / 2 - BALL_SIDE/2;

    // Constant speed and random angle
    var speed = 4;
    var angle = randInRange(Math.PI/4, Math.PI-Math.PI/4);
    angle = Math.random() > 0.5 ? angle : angle + Math.PI;
    this.xVel = speed * Math.sin(angle);
    this.yVel = speed * Math.cos(angle);

    particles = [];

    this.timeSinceReset = 0;
  },

  particleBurst: function() {
    // Random speed and angle (0 -> 2pi)
    for (var i = 0; i < 10; i++) {
      var speed = randInRange(4,8);
      var angle = randInRange(0, Math.PI * 2);
      var xV = speed * Math.sin(angle);
      var yV = speed * Math.cos(angle);
      particles.push(new Particle(randInRange(2, 8), "rgb(255,200,0)", this.x+this.width, this.y+this.height, xV, yV))
    }
  },

  update: function() {

    this.timeSinceCollision += delta;
    this.timeSinceParticle += delta;

    if (this.timeSinceParticle > 200) {
      // Produce particle
      particles.push(new Particle(6, "rgb(255,255,255)", this.x + this.width, this.y + this.height, 0, 0));
      this.timeSinceParticle = 0;
    }


    // Calculate colour
    if(this.timeSinceCollision <= 800) {
      this.colour = this.timeSinceCollision/800;
    } else {
      this.colour = 1;
    }

    if (this.timeSinceReset >= 1000) {
      this.x += this.xVel * delta * 0.06;
      this.y += this.yVel * delta * 0.06;
    } else {
      this.timeSinceReset += delta;
    }

    // Collision with edges
    if (this.y + this.height >= HEIGHT || this.y <= 0) {
      this.yVel *= -1;
    }
    if (this.x <= 0) {
      // Player 2 scores!
      paddle2.score++;
      this.reset();

    } else if (this.x + this.width >= WIDTH) {
      // Player 1 scores!
      paddle1.score++;
      this.reset();
    }

    // Collision with paddle 1
    if (this.x <= paddle1.x + paddle1.width) {
      if (this.y + this.height >= paddle1.y && this.y <= paddle1.y + paddle1.height) {
        if (!this.intersecting) {
          bleep1.play();
          this.intersecting = true;
          this.xVel *= -1;
          this.yVel += paddle1.velocity * 0.4;

          this.particleBurst();

          this.timeSinceCollision = 0;
          paddle1.reset();
        }
      }
      // Collision with paddle 2
    } else if (this.x + this.width >= paddle2.x) {
      if (this.y + this.height >= paddle2.y && this.y <= paddle2.y + paddle2.height) {
        if (!this.intersecting) {
          bleep2.play();
          this.intersecting = true;
          this.xVel *= -1;
          this.yVel += paddle2.velocity * 0.4;

          this.particleBurst();

          this.timeSinceCollision = 0;
        }
      }
    } else {
      this.intersecting = false;
    }
  },

  draw: function() {

    // Calculate colour (255,255,255) -> (0,0,0)
    var r = HIT_COL[0] + ball.colour * (COL[0] - HIT_COL[0]);
    var g = HIT_COL[1] + ball.colour * (COL[1] - HIT_COL[1]);
    var b = HIT_COL[2] + ball.colour * (COL[2] - HIT_COL[2]);

    ctx.fillStyle = "rgb("+Math.floor(r)+","+Math.floor(g)+","+Math.floor(b)+")";
    ctx.fillRect(this.x, this.y, this.width, this.height);
   }
}

ball.reset();

var particles = [];

var now, delta;
var then = new Date().getTime();

window.requestAnimationFrame(drawFrame);

function drawFrame() {
  // TIMING
  now = new Date().getTime();
  delta = now - then;

  // CLEAR
  ctx.fillStyle = "rgb(255, 0, 84)";
  ctx.fillRect(0,0,WIDTH,HEIGHT);

  // DRAW PARTICLES
  for (i in particles) {
    particles[i].draw();
  }

  // DRAW PADDLES
  paddle1.draw();
  paddle2.draw();

  // DRAW BALL
  ball.draw();

  // UPDATE
  paddle1.update();
  paddle2.update();
  ball.update();

  // UPDATE SCORES
  score1.innerHTML = paddle1.score;
  score2.innerHTML = paddle2.score;

  // UPDATE PARTICLES
  for (i in particles) {
    particles[i].update();
  }

  then = now;

  window.requestAnimationFrame(drawFrame);
}
