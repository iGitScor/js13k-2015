(function() {
  var requestAnimationFrame =
    window.requestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

var canvas = document.getElementById('game'),
  ctx = canvas.getContext('2d'),
  doc = document.documentElement,
  width = doc.clientWidth,
  height = doc.clientHeight,
  player = {
    x : width,
    y : height - 150,
    width : 35,
    height : 100,
    speed : 3,
    velX : 0,
    velY : 0,
    jumping : false,
    jumper : false
  },
  map = {
    y : 20
  },
  finish = {
    x : 100,
    y : height - 40
  },
  fall = 0,
  gap = 0,
  levels = [
    {
      sol : [
        {
          x : 0,
          y : height - map.y,
          w : width,
          h : map.y
        }
      ]
    }
  ],
  level = 0,
  keys = [],
  powers = [],
  friction = 0.8,
  gravity = 0.3;
  
var deep, divergence, reduction, line_width, start_points = [];

var particles = [];
var particleCount = 30;
var maxVelocity = 2;
var targetFPS = 33;
var imageObj = new Image();
imageObj.onload = function() {
    particles.forEach(function(particle) {
            particle.setImage(imageObj);
    });
};

// Once the callback is arranged then set the source of the image
imageObj.src = 'smoke.png';

// A function to create a particle object.
function Particle(context) {

    // Set the initial x and y positions
    this.x = 0;
    this.y = 0;

    // Set the initial velocity
    this.xVelocity = 0;
    this.yVelocity = 0;

    // Set the radius
    this.radius = 5;

    // Store the context which will be used to draw the particle
    this.context = context;

    // The function to draw the particle on the canvas.
    this.draw = function() {
        
        // If an image is set draw it
        if (this.image){
            this.context.drawImage(this.image, this.x-128, this.y-128);         
            // If the image is being rendered do not draw the circle so break out of the draw function                
            return;
        }
        // Draw the circle as before, with the addition of using the position and the radius from this object.
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        this.context.fillStyle = 'rgba(0, 255, 255, 1)';
        this.context.fill();
        this.context.closePath();
    };

    // Update the particle.
    this.update = function() {
        // Update the position of the particle with the addition of the velocity.
        this.x += this.xVelocity;
        this.y += this.yVelocity;

        // Check if has crossed the right edge
        if (this.x >= width) {
            this.xVelocity = -this.xVelocity;
            this.x = width;
        } else if (this.x <= 0) {// Check if has crossed the left edge
            this.xVelocity = -this.xVelocity;
            this.x = 0;
        }

        // Check if has crossed the bottom edge
        if (this.y >= height) {
            this.yVelocity = -this.yVelocity;
            this.y = height;
        } else if (this.y <= 0) {// Check if has crossed the top edge
            this.yVelocity = -this.yVelocity;
            this.y = 0;
        }
    };

    this.setPosition = function(x, y) {
      this.x = x;
      this.y = y;
    };

    this.setVelocity = function(x, y) {
      this.xVelocity = x;
      this.yVelocity = y;
    };

    this.setImage = function(image){
      this.image = image;
    }
}

function generateRandom(min, max){
  return Math.random() * (max - min) + min;
}

// Initialise the scene and set the context if possible
function init() {
  var canvas = document.getElementById('game');
  if (canvas.getContext) {
    // Set the context variable so it can be re-used
    context = canvas.getContext('2d');

    // Create the particles and set their initial positions and velocities
    for (var i=0; i < particleCount; ++i){
      var particle = new Particle(context);
      
      // Set the position to be inside the canvas bounds
      particle.setPosition(generateRandom(0, width), generateRandom(0, height));
      
      // Set the initial velocity to be either random and either negative or positive
      particle.setVelocity(generateRandom(-maxVelocity, maxVelocity), generateRandom(-maxVelocity, maxVelocity));
      particles.push(particle);
    }
  }
}

init();

canvas.width = width;
canvas.height = height;

function tree() {
  var randomize = 30;
  deep = (100-(20*level)) >= 0 ? (100-(20*level)) + randomize : randomize;
  divergence = 10 + randomize;
  reduction = (65-(5*level)) > 0 ? (65-(5*level))/100 : 0;
  line_width = 10;
  var trunk = {x: width/2, y: deep + 90, angle: 90};
  start_points = [];
  start_points.push(trunk);
  ctx.beginPath();
  ctx.moveTo(trunk.x, height-map.y);
  ctx.lineTo(trunk.x, height-trunk.y);
  ctx.closePath();
  ctx.strokeStyle = 'brown';
  ctx.lineWidth = line_width;
  ctx.stroke();
  
  branches();
}

function branches() {
  deep = deep * reduction;
  line_width = line_width * reduction;
  ctx.lineWidth = line_width;
  
  var new_start_points = [];
  ctx.beginPath();
  var i;
  for (i = 0; i < start_points.length; i++) {
    var sp = start_points[i];
    var ep1 = get_endpoint(sp.x, sp.y, sp.angle+divergence, deep);
    var ep2 = get_endpoint(sp.x, sp.y, sp.angle-divergence, deep);
    
    ctx.moveTo(sp.x, height-sp.y);
    ctx.lineTo(ep1.x, height-ep1.y);
    ctx.moveTo(sp.x, height-sp.y);
    ctx.lineTo(ep2.x, height-ep2.y);
    
    ep1.angle = sp.angle+divergence;
    ep2.angle = sp.angle-divergence;
    
    new_start_points.push(ep1);
    new_start_points.push(ep2);
  }
  ctx.closePath();
  ctx.strokeStyle = deep < 10 ? 'green' : 'brown';
  ctx.stroke();
  start_points = new_start_points;
  
  if (deep > 2) {
    branches();
  }
}

function get_endpoint(x, y, a, l) {
  var epx = x + l * Math.cos(a*Math.PI/180);
  var epy = y + l * Math.sin(a*Math.PI/180);

  return {x: epx, y: epy};
}

function update() {
  // check keys
  if (keys[38] && powers.solaire) {
    // up arrow or space
    if (!player.jumping){
      player.jumping = true;
      var sjump = powers.anal ? 5 : 3;
      player.velY = -player.speed * sjump;
    }
  }
  if (keys[39]) {
    // right arrow
    if (player.velX < player.speed) {
      player.velX++;
    }
    player.glass = 7 + powers.anal * 5;
  }
  if (keys[37]) {
    // left arrow
    if (player.velX > -player.speed) {
      player.velX--;
    }
    player.glass = 0 - powers.anal * 5;
  }
  if (!keys[39] && !keys[37]) {
    if (player.glass <= 0) {
      player.glass = 0;
    } else {
      player.glass = 7;
    }
  }

  player.velX *= friction;
  player.velY += gravity;

  var acc = powers.anal ? 5 : 1;
  player.x += player.velX * acc;
  player.y += player.velY;

  if (player.x > width - 200 && player.x < width - 200) { 
    if (player.y >= height - player.height){
      player.y = height - player.height + 20;
      player.jumping = false;
      player.jumper = true;
      player.x = width;
    }
  } else {
    if (player.y >= height - player.height - map.y){
      player.y = height - player.height - map.y;
      player.jumping = false;
    }
  }

  var outLeft = (player.x <= 0);
  if (
    ((finish.x - 20) >= (player.x + player.width / 2))
    && ((finish.y - 20) <= (player.y + player.height) && (finish.y - 20) > (player.y))
    && !outLeft
  ) {
    gap = parseInt(Math.random() * 5, 10);
    level++;
    player.x = width;
  } else if (player.x >= width - player.width) {
    player.x = width - player.width;
  } else if (outLeft) {
    player.x = 0;
  }

  // Background
  ctx.clearRect(0, 0, width, height);
  ctx.beginPath();
  ctx.moveTo(170, 80);
  ctx.bezierCurveTo(130, 100, 130, 150, 230, 150);
  ctx.bezierCurveTo(250, 180, 320, 180, 340, 150);
  ctx.bezierCurveTo(420, 150, 420, 120, 390, 100);
  ctx.bezierCurveTo(430, 40, 370, 30, 340, 50);
  ctx.bezierCurveTo(320, 5, 250, 20, 250, 50);
  ctx.bezierCurveTo(200, 5, 150, 20, 170, 80);
  ctx.closePath();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#FFF';
  ctx.fillStyle = '#DDD';
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(470, 380);
  ctx.bezierCurveTo(430, 400, 430, 450, 530, 450);
  ctx.bezierCurveTo(550, 480, 620, 480, 640, 450);
  ctx.bezierCurveTo(720, 450, 720, 420, 690, 400);
  ctx.bezierCurveTo(730, 340, 670, 330, 640, 350);
  ctx.bezierCurveTo(620, 305, 550, 320, 550, 350);
  ctx.bezierCurveTo(500, 305, 450, 320, 470, 380);
  ctx.closePath();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#FFF';
  ctx.fillStyle = '#DDD';
  ctx.fill();
  ctx.stroke();

  particles.forEach(function(particle) {
    particle.update();
    particle.draw();
  });

  // Buddy
  ctx.fillStyle = 'darkred';
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = '#000';
  ctx.fillRect(player.x, player.y, player.width, 10);
  ctx.fillStyle = 'beige';
  ctx.fillRect(player.x, player.y + 10, player.width, 20);
  ctx.fillStyle = '#000';
  ctx.font = '1.8em Arial';
  ctx.fillText('o-o', player.x + player.width + player.glass, player.y + 30);

  // Level
  ctx.fillStyle = 'green';
  if (levels[level]) {
    var sol = levels[level].sol, i;
    for (i = 0; i < sol.length; i++) {
      var platform = sol[i];
      ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
    }
  } else {
    // Randomize !
    ctx.fillRect(0, height - map.y, width - (gap * 100), map.y);
    ctx.fillRect(width - 100, height - map.y, 100, map.y);
  }
  
  if ((width - (gap * 100)) < player.x 
  && (player.x + player.width) < (width - 100) 
  && player.y === (height - player.height - map.y)) {
    fall++;
    player.x = width;
  }

  // Info
  ctx.font = '1.2em Arial';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'right';
  ctx.fillText('Level : ' + level, width - 20, 35);
  if (powers.solaire) {
    ctx.font = '.8em Arial';
    ctx.fillText('You can now jump with up arrow !', width  - 20, 50);
  }

  tree();

  ctx.fillStyle = '#000';
  ctx.font = '40px Arial';
  ctx.fillText('☠', finish.x, finish.y);
  ctx.textAlign = 'left';
  ctx.font = '32px Arial';
  ctx.fillText('Who would you choose ?', finish.x, height - finish.y);
  if (level === 13) {
    ctx.textAlign = 'center';
    ctx.fillText('You kill the nature ! Human wins', width /2, height/2);
  }
  if (fall === 13) {
    ctx.textAlign = 'center';
    ctx.fillText('You kill the human ! Nature wins', width /2, height/2);
  }
  ctx.textAlign = 'right';

  requestAnimationFrame(update);
}

function setPowers(anal, cheveu, solaire) {
  powers.anal = anal;
  powers.cheveu = cheveu;
  powers.solaire = solaire;
}

document.body.addEventListener('keydown', function (e) {
  if (level < 13 && fall < 13) {
    setPowers(e.shiftKey, e.altKey, e.ctrlKey || level > 0);
    keys[e.keyCode] = true;
  } else {
    keys = [];
    setPowers(false, false, false);
  }
});

document.body.addEventListener('keyup', function (e) {
  setPowers(false, false, level > 0);
  keys[e.keyCode] = false;
});

window.addEventListener('load', function () {
  update();
});