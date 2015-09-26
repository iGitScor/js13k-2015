(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9tYWluIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24oKSB7XG4gIHZhciByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPVxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICB8fCB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgfHwgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgIHx8IHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHJlcXVlc3RBbmltYXRpb25GcmFtZTtcbn0pKCk7XG5cbnZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZScpLFxuICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKSxcbiAgZG9jID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxuICB3aWR0aCA9IGRvYy5jbGllbnRXaWR0aCxcbiAgaGVpZ2h0ID0gZG9jLmNsaWVudEhlaWdodCxcbiAgcGxheWVyID0ge1xuICAgIHggOiB3aWR0aCxcbiAgICB5IDogaGVpZ2h0IC0gMTUwLFxuICAgIHdpZHRoIDogMzUsXG4gICAgaGVpZ2h0IDogMTAwLFxuICAgIHNwZWVkIDogMyxcbiAgICB2ZWxYIDogMCxcbiAgICB2ZWxZIDogMCxcbiAgICBqdW1waW5nIDogZmFsc2UsXG4gICAganVtcGVyIDogZmFsc2VcbiAgfSxcbiAgbWFwID0ge1xuICAgIHkgOiAyMFxuICB9LFxuICBmaW5pc2ggPSB7XG4gICAgeCA6IDEwMCxcbiAgICB5IDogaGVpZ2h0IC0gNDBcbiAgfSxcbiAgZmFsbCA9IDAsXG4gIGdhcCA9IDAsXG4gIGxldmVscyA9IFtcbiAgICB7XG4gICAgICBzb2wgOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB4IDogMCxcbiAgICAgICAgICB5IDogaGVpZ2h0IC0gbWFwLnksXG4gICAgICAgICAgdyA6IHdpZHRoLFxuICAgICAgICAgIGggOiBtYXAueVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfVxuICBdLFxuICBsZXZlbCA9IDAsXG4gIGtleXMgPSBbXSxcbiAgcG93ZXJzID0gW10sXG4gIGZyaWN0aW9uID0gMC44LFxuICBncmF2aXR5ID0gMC4zO1xuICBcbnZhciBkZWVwLCBkaXZlcmdlbmNlLCByZWR1Y3Rpb24sIGxpbmVfd2lkdGgsIHN0YXJ0X3BvaW50cyA9IFtdO1xuXG52YXIgcGFydGljbGVzID0gW107XG52YXIgcGFydGljbGVDb3VudCA9IDMwO1xudmFyIG1heFZlbG9jaXR5ID0gMjtcbnZhciB0YXJnZXRGUFMgPSAzMztcbnZhciBpbWFnZU9iaiA9IG5ldyBJbWFnZSgpO1xuaW1hZ2VPYmoub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgcGFydGljbGVzLmZvckVhY2goZnVuY3Rpb24ocGFydGljbGUpIHtcbiAgICAgICAgICAgIHBhcnRpY2xlLnNldEltYWdlKGltYWdlT2JqKTtcbiAgICB9KTtcbn07XG5cbi8vIE9uY2UgdGhlIGNhbGxiYWNrIGlzIGFycmFuZ2VkIHRoZW4gc2V0IHRoZSBzb3VyY2Ugb2YgdGhlIGltYWdlXG5pbWFnZU9iai5zcmMgPSAnc21va2UucG5nJztcblxuLy8gQSBmdW5jdGlvbiB0byBjcmVhdGUgYSBwYXJ0aWNsZSBvYmplY3QuXG5mdW5jdGlvbiBQYXJ0aWNsZShjb250ZXh0KSB7XG5cbiAgICAvLyBTZXQgdGhlIGluaXRpYWwgeCBhbmQgeSBwb3NpdGlvbnNcbiAgICB0aGlzLnggPSAwO1xuICAgIHRoaXMueSA9IDA7XG5cbiAgICAvLyBTZXQgdGhlIGluaXRpYWwgdmVsb2NpdHlcbiAgICB0aGlzLnhWZWxvY2l0eSA9IDA7XG4gICAgdGhpcy55VmVsb2NpdHkgPSAwO1xuXG4gICAgLy8gU2V0IHRoZSByYWRpdXNcbiAgICB0aGlzLnJhZGl1cyA9IDU7XG5cbiAgICAvLyBTdG9yZSB0aGUgY29udGV4dCB3aGljaCB3aWxsIGJlIHVzZWQgdG8gZHJhdyB0aGUgcGFydGljbGVcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuXG4gICAgLy8gVGhlIGZ1bmN0aW9uIHRvIGRyYXcgdGhlIHBhcnRpY2xlIG9uIHRoZSBjYW52YXMuXG4gICAgdGhpcy5kcmF3ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIFxuICAgICAgICAvLyBJZiBhbiBpbWFnZSBpcyBzZXQgZHJhdyBpdFxuICAgICAgICBpZiAodGhpcy5pbWFnZSl7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQuZHJhd0ltYWdlKHRoaXMuaW1hZ2UsIHRoaXMueC0xMjgsIHRoaXMueS0xMjgpOyAgICAgICAgIFxuICAgICAgICAgICAgLy8gSWYgdGhlIGltYWdlIGlzIGJlaW5nIHJlbmRlcmVkIGRvIG5vdCBkcmF3IHRoZSBjaXJjbGUgc28gYnJlYWsgb3V0IG9mIHRoZSBkcmF3IGZ1bmN0aW9uICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIERyYXcgdGhlIGNpcmNsZSBhcyBiZWZvcmUsIHdpdGggdGhlIGFkZGl0aW9uIG9mIHVzaW5nIHRoZSBwb3NpdGlvbiBhbmQgdGhlIHJhZGl1cyBmcm9tIHRoaXMgb2JqZWN0LlxuICAgICAgICB0aGlzLmNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgIHRoaXMuY29udGV4dC5hcmModGhpcy54LCB0aGlzLnksIHRoaXMucmFkaXVzLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xuICAgICAgICB0aGlzLmNvbnRleHQuZmlsbFN0eWxlID0gJ3JnYmEoMCwgMjU1LCAyNTUsIDEpJztcbiAgICAgICAgdGhpcy5jb250ZXh0LmZpbGwoKTtcbiAgICAgICAgdGhpcy5jb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgIH07XG5cbiAgICAvLyBVcGRhdGUgdGhlIHBhcnRpY2xlLlxuICAgIHRoaXMudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgcG9zaXRpb24gb2YgdGhlIHBhcnRpY2xlIHdpdGggdGhlIGFkZGl0aW9uIG9mIHRoZSB2ZWxvY2l0eS5cbiAgICAgICAgdGhpcy54ICs9IHRoaXMueFZlbG9jaXR5O1xuICAgICAgICB0aGlzLnkgKz0gdGhpcy55VmVsb2NpdHk7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgaGFzIGNyb3NzZWQgdGhlIHJpZ2h0IGVkZ2VcbiAgICAgICAgaWYgKHRoaXMueCA+PSB3aWR0aCkge1xuICAgICAgICAgICAgdGhpcy54VmVsb2NpdHkgPSAtdGhpcy54VmVsb2NpdHk7XG4gICAgICAgICAgICB0aGlzLnggPSB3aWR0aDtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnggPD0gMCkgey8vIENoZWNrIGlmIGhhcyBjcm9zc2VkIHRoZSBsZWZ0IGVkZ2VcbiAgICAgICAgICAgIHRoaXMueFZlbG9jaXR5ID0gLXRoaXMueFZlbG9jaXR5O1xuICAgICAgICAgICAgdGhpcy54ID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIGlmIGhhcyBjcm9zc2VkIHRoZSBib3R0b20gZWRnZVxuICAgICAgICBpZiAodGhpcy55ID49IGhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy55VmVsb2NpdHkgPSAtdGhpcy55VmVsb2NpdHk7XG4gICAgICAgICAgICB0aGlzLnkgPSBoZWlnaHQ7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy55IDw9IDApIHsvLyBDaGVjayBpZiBoYXMgY3Jvc3NlZCB0aGUgdG9wIGVkZ2VcbiAgICAgICAgICAgIHRoaXMueVZlbG9jaXR5ID0gLXRoaXMueVZlbG9jaXR5O1xuICAgICAgICAgICAgdGhpcy55ID0gMDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLnNldFBvc2l0aW9uID0gZnVuY3Rpb24oeCwgeSkge1xuICAgICAgdGhpcy54ID0geDtcbiAgICAgIHRoaXMueSA9IHk7XG4gICAgfTtcblxuICAgIHRoaXMuc2V0VmVsb2NpdHkgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgICB0aGlzLnhWZWxvY2l0eSA9IHg7XG4gICAgICB0aGlzLnlWZWxvY2l0eSA9IHk7XG4gICAgfTtcblxuICAgIHRoaXMuc2V0SW1hZ2UgPSBmdW5jdGlvbihpbWFnZSl7XG4gICAgICB0aGlzLmltYWdlID0gaW1hZ2U7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZVJhbmRvbShtaW4sIG1heCl7XG4gIHJldHVybiBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW47XG59XG5cbi8vIEluaXRpYWxpc2UgdGhlIHNjZW5lIGFuZCBzZXQgdGhlIGNvbnRleHQgaWYgcG9zc2libGVcbmZ1bmN0aW9uIGluaXQoKSB7XG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZScpO1xuICBpZiAoY2FudmFzLmdldENvbnRleHQpIHtcbiAgICAvLyBTZXQgdGhlIGNvbnRleHQgdmFyaWFibGUgc28gaXQgY2FuIGJlIHJlLXVzZWRcbiAgICBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAvLyBDcmVhdGUgdGhlIHBhcnRpY2xlcyBhbmQgc2V0IHRoZWlyIGluaXRpYWwgcG9zaXRpb25zIGFuZCB2ZWxvY2l0aWVzXG4gICAgZm9yICh2YXIgaT0wOyBpIDwgcGFydGljbGVDb3VudDsgKytpKXtcbiAgICAgIHZhciBwYXJ0aWNsZSA9IG5ldyBQYXJ0aWNsZShjb250ZXh0KTtcbiAgICAgIFxuICAgICAgLy8gU2V0IHRoZSBwb3NpdGlvbiB0byBiZSBpbnNpZGUgdGhlIGNhbnZhcyBib3VuZHNcbiAgICAgIHBhcnRpY2xlLnNldFBvc2l0aW9uKGdlbmVyYXRlUmFuZG9tKDAsIHdpZHRoKSwgZ2VuZXJhdGVSYW5kb20oMCwgaGVpZ2h0KSk7XG4gICAgICBcbiAgICAgIC8vIFNldCB0aGUgaW5pdGlhbCB2ZWxvY2l0eSB0byBiZSBlaXRoZXIgcmFuZG9tIGFuZCBlaXRoZXIgbmVnYXRpdmUgb3IgcG9zaXRpdmVcbiAgICAgIHBhcnRpY2xlLnNldFZlbG9jaXR5KGdlbmVyYXRlUmFuZG9tKC1tYXhWZWxvY2l0eSwgbWF4VmVsb2NpdHkpLCBnZW5lcmF0ZVJhbmRvbSgtbWF4VmVsb2NpdHksIG1heFZlbG9jaXR5KSk7XG4gICAgICBwYXJ0aWNsZXMucHVzaChwYXJ0aWNsZSk7XG4gICAgfVxuICB9XG59XG5cbmluaXQoKTtcblxuY2FudmFzLndpZHRoID0gd2lkdGg7XG5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG5mdW5jdGlvbiB0cmVlKCkge1xuICB2YXIgcmFuZG9taXplID0gMzA7XG4gIGRlZXAgPSAoMTAwLSgyMCpsZXZlbCkpID49IDAgPyAoMTAwLSgyMCpsZXZlbCkpICsgcmFuZG9taXplIDogcmFuZG9taXplO1xuICBkaXZlcmdlbmNlID0gMTAgKyByYW5kb21pemU7XG4gIHJlZHVjdGlvbiA9ICg2NS0oNSpsZXZlbCkpID4gMCA/ICg2NS0oNSpsZXZlbCkpLzEwMCA6IDA7XG4gIGxpbmVfd2lkdGggPSAxMDtcbiAgdmFyIHRydW5rID0ge3g6IHdpZHRoLzIsIHk6IGRlZXAgKyA5MCwgYW5nbGU6IDkwfTtcbiAgc3RhcnRfcG9pbnRzID0gW107XG4gIHN0YXJ0X3BvaW50cy5wdXNoKHRydW5rKTtcbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHgubW92ZVRvKHRydW5rLngsIGhlaWdodC1tYXAueSk7XG4gIGN0eC5saW5lVG8odHJ1bmsueCwgaGVpZ2h0LXRydW5rLnkpO1xuICBjdHguY2xvc2VQYXRoKCk7XG4gIGN0eC5zdHJva2VTdHlsZSA9ICdicm93bic7XG4gIGN0eC5saW5lV2lkdGggPSBsaW5lX3dpZHRoO1xuICBjdHguc3Ryb2tlKCk7XG4gIFxuICBicmFuY2hlcygpO1xufVxuXG5mdW5jdGlvbiBicmFuY2hlcygpIHtcbiAgZGVlcCA9IGRlZXAgKiByZWR1Y3Rpb247XG4gIGxpbmVfd2lkdGggPSBsaW5lX3dpZHRoICogcmVkdWN0aW9uO1xuICBjdHgubGluZVdpZHRoID0gbGluZV93aWR0aDtcbiAgXG4gIHZhciBuZXdfc3RhcnRfcG9pbnRzID0gW107XG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgdmFyIGk7XG4gIGZvciAoaSA9IDA7IGkgPCBzdGFydF9wb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgc3AgPSBzdGFydF9wb2ludHNbaV07XG4gICAgdmFyIGVwMSA9IGdldF9lbmRwb2ludChzcC54LCBzcC55LCBzcC5hbmdsZStkaXZlcmdlbmNlLCBkZWVwKTtcbiAgICB2YXIgZXAyID0gZ2V0X2VuZHBvaW50KHNwLngsIHNwLnksIHNwLmFuZ2xlLWRpdmVyZ2VuY2UsIGRlZXApO1xuICAgIFxuICAgIGN0eC5tb3ZlVG8oc3AueCwgaGVpZ2h0LXNwLnkpO1xuICAgIGN0eC5saW5lVG8oZXAxLngsIGhlaWdodC1lcDEueSk7XG4gICAgY3R4Lm1vdmVUbyhzcC54LCBoZWlnaHQtc3AueSk7XG4gICAgY3R4LmxpbmVUbyhlcDIueCwgaGVpZ2h0LWVwMi55KTtcbiAgICBcbiAgICBlcDEuYW5nbGUgPSBzcC5hbmdsZStkaXZlcmdlbmNlO1xuICAgIGVwMi5hbmdsZSA9IHNwLmFuZ2xlLWRpdmVyZ2VuY2U7XG4gICAgXG4gICAgbmV3X3N0YXJ0X3BvaW50cy5wdXNoKGVwMSk7XG4gICAgbmV3X3N0YXJ0X3BvaW50cy5wdXNoKGVwMik7XG4gIH1cbiAgY3R4LmNsb3NlUGF0aCgpO1xuICBjdHguc3Ryb2tlU3R5bGUgPSBkZWVwIDwgMTAgPyAnZ3JlZW4nIDogJ2Jyb3duJztcbiAgY3R4LnN0cm9rZSgpO1xuICBzdGFydF9wb2ludHMgPSBuZXdfc3RhcnRfcG9pbnRzO1xuICBcbiAgaWYgKGRlZXAgPiAyKSB7XG4gICAgYnJhbmNoZXMoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRfZW5kcG9pbnQoeCwgeSwgYSwgbCkge1xuICB2YXIgZXB4ID0geCArIGwgKiBNYXRoLmNvcyhhKk1hdGguUEkvMTgwKTtcbiAgdmFyIGVweSA9IHkgKyBsICogTWF0aC5zaW4oYSpNYXRoLlBJLzE4MCk7XG5cbiAgcmV0dXJuIHt4OiBlcHgsIHk6IGVweX07XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgLy8gY2hlY2sga2V5c1xuICBpZiAoa2V5c1szOF0gJiYgcG93ZXJzLnNvbGFpcmUpIHtcbiAgICAvLyB1cCBhcnJvdyBvciBzcGFjZVxuICAgIGlmICghcGxheWVyLmp1bXBpbmcpe1xuICAgICAgcGxheWVyLmp1bXBpbmcgPSB0cnVlO1xuICAgICAgdmFyIHNqdW1wID0gcG93ZXJzLmFuYWwgPyA1IDogMztcbiAgICAgIHBsYXllci52ZWxZID0gLXBsYXllci5zcGVlZCAqIHNqdW1wO1xuICAgIH1cbiAgfVxuICBpZiAoa2V5c1szOV0pIHtcbiAgICAvLyByaWdodCBhcnJvd1xuICAgIGlmIChwbGF5ZXIudmVsWCA8IHBsYXllci5zcGVlZCkge1xuICAgICAgcGxheWVyLnZlbFgrKztcbiAgICB9XG4gICAgcGxheWVyLmdsYXNzID0gNyArIHBvd2Vycy5hbmFsICogNTtcbiAgfVxuICBpZiAoa2V5c1szN10pIHtcbiAgICAvLyBsZWZ0IGFycm93XG4gICAgaWYgKHBsYXllci52ZWxYID4gLXBsYXllci5zcGVlZCkge1xuICAgICAgcGxheWVyLnZlbFgtLTtcbiAgICB9XG4gICAgcGxheWVyLmdsYXNzID0gMCAtIHBvd2Vycy5hbmFsICogNTtcbiAgfVxuICBpZiAoIWtleXNbMzldICYmICFrZXlzWzM3XSkge1xuICAgIGlmIChwbGF5ZXIuZ2xhc3MgPD0gMCkge1xuICAgICAgcGxheWVyLmdsYXNzID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgcGxheWVyLmdsYXNzID0gNztcbiAgICB9XG4gIH1cblxuICBwbGF5ZXIudmVsWCAqPSBmcmljdGlvbjtcbiAgcGxheWVyLnZlbFkgKz0gZ3Jhdml0eTtcblxuICB2YXIgYWNjID0gcG93ZXJzLmFuYWwgPyA1IDogMTtcbiAgcGxheWVyLnggKz0gcGxheWVyLnZlbFggKiBhY2M7XG4gIHBsYXllci55ICs9IHBsYXllci52ZWxZO1xuXG4gIGlmIChwbGF5ZXIueCA+IHdpZHRoIC0gMjAwICYmIHBsYXllci54IDwgd2lkdGggLSAyMDApIHsgXG4gICAgaWYgKHBsYXllci55ID49IGhlaWdodCAtIHBsYXllci5oZWlnaHQpe1xuICAgICAgcGxheWVyLnkgPSBoZWlnaHQgLSBwbGF5ZXIuaGVpZ2h0ICsgMjA7XG4gICAgICBwbGF5ZXIuanVtcGluZyA9IGZhbHNlO1xuICAgICAgcGxheWVyLmp1bXBlciA9IHRydWU7XG4gICAgICBwbGF5ZXIueCA9IHdpZHRoO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAocGxheWVyLnkgPj0gaGVpZ2h0IC0gcGxheWVyLmhlaWdodCAtIG1hcC55KXtcbiAgICAgIHBsYXllci55ID0gaGVpZ2h0IC0gcGxheWVyLmhlaWdodCAtIG1hcC55O1xuICAgICAgcGxheWVyLmp1bXBpbmcgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICB2YXIgb3V0TGVmdCA9IChwbGF5ZXIueCA8PSAwKTtcbiAgaWYgKFxuICAgICgoZmluaXNoLnggLSAyMCkgPj0gKHBsYXllci54ICsgcGxheWVyLndpZHRoIC8gMikpXG4gICAgJiYgKChmaW5pc2gueSAtIDIwKSA8PSAocGxheWVyLnkgKyBwbGF5ZXIuaGVpZ2h0KSAmJiAoZmluaXNoLnkgLSAyMCkgPiAocGxheWVyLnkpKVxuICAgICYmICFvdXRMZWZ0XG4gICkge1xuICAgIGdhcCA9IHBhcnNlSW50KE1hdGgucmFuZG9tKCkgKiA1LCAxMCk7XG4gICAgbGV2ZWwrKztcbiAgICBwbGF5ZXIueCA9IHdpZHRoO1xuICB9IGVsc2UgaWYgKHBsYXllci54ID49IHdpZHRoIC0gcGxheWVyLndpZHRoKSB7XG4gICAgcGxheWVyLnggPSB3aWR0aCAtIHBsYXllci53aWR0aDtcbiAgfSBlbHNlIGlmIChvdXRMZWZ0KSB7XG4gICAgcGxheWVyLnggPSAwO1xuICB9XG5cbiAgLy8gQmFja2dyb3VuZFxuICBjdHguY2xlYXJSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5tb3ZlVG8oMTcwLCA4MCk7XG4gIGN0eC5iZXppZXJDdXJ2ZVRvKDEzMCwgMTAwLCAxMzAsIDE1MCwgMjMwLCAxNTApO1xuICBjdHguYmV6aWVyQ3VydmVUbygyNTAsIDE4MCwgMzIwLCAxODAsIDM0MCwgMTUwKTtcbiAgY3R4LmJlemllckN1cnZlVG8oNDIwLCAxNTAsIDQyMCwgMTIwLCAzOTAsIDEwMCk7XG4gIGN0eC5iZXppZXJDdXJ2ZVRvKDQzMCwgNDAsIDM3MCwgMzAsIDM0MCwgNTApO1xuICBjdHguYmV6aWVyQ3VydmVUbygzMjAsIDUsIDI1MCwgMjAsIDI1MCwgNTApO1xuICBjdHguYmV6aWVyQ3VydmVUbygyMDAsIDUsIDE1MCwgMjAsIDE3MCwgODApO1xuICBjdHguY2xvc2VQYXRoKCk7XG4gIGN0eC5saW5lV2lkdGggPSA1O1xuICBjdHguc3Ryb2tlU3R5bGUgPSAnI0ZGRic7XG4gIGN0eC5maWxsU3R5bGUgPSAnI0RERCc7XG4gIGN0eC5maWxsKCk7XG4gIGN0eC5zdHJva2UoKTtcblxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5tb3ZlVG8oNDcwLCAzODApO1xuICBjdHguYmV6aWVyQ3VydmVUbyg0MzAsIDQwMCwgNDMwLCA0NTAsIDUzMCwgNDUwKTtcbiAgY3R4LmJlemllckN1cnZlVG8oNTUwLCA0ODAsIDYyMCwgNDgwLCA2NDAsIDQ1MCk7XG4gIGN0eC5iZXppZXJDdXJ2ZVRvKDcyMCwgNDUwLCA3MjAsIDQyMCwgNjkwLCA0MDApO1xuICBjdHguYmV6aWVyQ3VydmVUbyg3MzAsIDM0MCwgNjcwLCAzMzAsIDY0MCwgMzUwKTtcbiAgY3R4LmJlemllckN1cnZlVG8oNjIwLCAzMDUsIDU1MCwgMzIwLCA1NTAsIDM1MCk7XG4gIGN0eC5iZXppZXJDdXJ2ZVRvKDUwMCwgMzA1LCA0NTAsIDMyMCwgNDcwLCAzODApO1xuICBjdHguY2xvc2VQYXRoKCk7XG4gIGN0eC5saW5lV2lkdGggPSA1O1xuICBjdHguc3Ryb2tlU3R5bGUgPSAnI0ZGRic7XG4gIGN0eC5maWxsU3R5bGUgPSAnI0RERCc7XG4gIGN0eC5maWxsKCk7XG4gIGN0eC5zdHJva2UoKTtcblxuICBwYXJ0aWNsZXMuZm9yRWFjaChmdW5jdGlvbihwYXJ0aWNsZSkge1xuICAgIHBhcnRpY2xlLnVwZGF0ZSgpO1xuICAgIHBhcnRpY2xlLmRyYXcoKTtcbiAgfSk7XG5cbiAgLy8gQnVkZHlcbiAgY3R4LmZpbGxTdHlsZSA9ICdkYXJrcmVkJztcbiAgY3R4LmZpbGxSZWN0KHBsYXllci54LCBwbGF5ZXIueSwgcGxheWVyLndpZHRoLCBwbGF5ZXIuaGVpZ2h0KTtcbiAgY3R4LmZpbGxTdHlsZSA9ICcjMDAwJztcbiAgY3R4LmZpbGxSZWN0KHBsYXllci54LCBwbGF5ZXIueSwgcGxheWVyLndpZHRoLCAxMCk7XG4gIGN0eC5maWxsU3R5bGUgPSAnYmVpZ2UnO1xuICBjdHguZmlsbFJlY3QocGxheWVyLngsIHBsYXllci55ICsgMTAsIHBsYXllci53aWR0aCwgMjApO1xuICBjdHguZmlsbFN0eWxlID0gJyMwMDAnO1xuICBjdHguZm9udCA9ICcxLjhlbSBBcmlhbCc7XG4gIGN0eC5maWxsVGV4dCgnby1vJywgcGxheWVyLnggKyBwbGF5ZXIud2lkdGggKyBwbGF5ZXIuZ2xhc3MsIHBsYXllci55ICsgMzApO1xuXG4gIC8vIExldmVsXG4gIGN0eC5maWxsU3R5bGUgPSAnZ3JlZW4nO1xuICBpZiAobGV2ZWxzW2xldmVsXSkge1xuICAgIHZhciBzb2wgPSBsZXZlbHNbbGV2ZWxdLnNvbCwgaTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgc29sLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcGxhdGZvcm0gPSBzb2xbaV07XG4gICAgICBjdHguZmlsbFJlY3QocGxhdGZvcm0ueCwgcGxhdGZvcm0ueSwgcGxhdGZvcm0udywgcGxhdGZvcm0uaCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIFJhbmRvbWl6ZSAhXG4gICAgY3R4LmZpbGxSZWN0KDAsIGhlaWdodCAtIG1hcC55LCB3aWR0aCAtIChnYXAgKiAxMDApLCBtYXAueSk7XG4gICAgY3R4LmZpbGxSZWN0KHdpZHRoIC0gMTAwLCBoZWlnaHQgLSBtYXAueSwgMTAwLCBtYXAueSk7XG4gIH1cbiAgXG4gIGlmICgod2lkdGggLSAoZ2FwICogMTAwKSkgPCBwbGF5ZXIueCBcbiAgJiYgKHBsYXllci54ICsgcGxheWVyLndpZHRoKSA8ICh3aWR0aCAtIDEwMCkgXG4gICYmIHBsYXllci55ID09PSAoaGVpZ2h0IC0gcGxheWVyLmhlaWdodCAtIG1hcC55KSkge1xuICAgIGZhbGwrKztcbiAgICBwbGF5ZXIueCA9IHdpZHRoO1xuICB9XG5cbiAgLy8gSW5mb1xuICBjdHguZm9udCA9ICcxLjJlbSBBcmlhbCc7XG4gIGN0eC5maWxsU3R5bGUgPSAnIzAwMCc7XG4gIGN0eC50ZXh0QWxpZ24gPSAncmlnaHQnO1xuICBjdHguZmlsbFRleHQoJ0xldmVsIDogJyArIGxldmVsLCB3aWR0aCAtIDIwLCAzNSk7XG4gIGlmIChwb3dlcnMuc29sYWlyZSkge1xuICAgIGN0eC5mb250ID0gJy44ZW0gQXJpYWwnO1xuICAgIGN0eC5maWxsVGV4dCgnWW91IGNhbiBub3cganVtcCB3aXRoIHVwIGFycm93ICEnLCB3aWR0aCAgLSAyMCwgNTApO1xuICB9XG5cbiAgdHJlZSgpO1xuXG4gIGN0eC5maWxsU3R5bGUgPSAnIzAwMCc7XG4gIGN0eC5mb250ID0gJzQwcHggQXJpYWwnO1xuICBjdHguZmlsbFRleHQoJ+KYoCcsIGZpbmlzaC54LCBmaW5pc2gueSk7XG4gIGN0eC50ZXh0QWxpZ24gPSAnbGVmdCc7XG4gIGN0eC5mb250ID0gJzMycHggQXJpYWwnO1xuICBjdHguZmlsbFRleHQoJ1dobyB3b3VsZCB5b3UgY2hvb3NlID8nLCBmaW5pc2gueCwgaGVpZ2h0IC0gZmluaXNoLnkpO1xuICBpZiAobGV2ZWwgPT09IDEzKSB7XG4gICAgY3R4LnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgIGN0eC5maWxsVGV4dCgnWW91IGtpbGwgdGhlIG5hdHVyZSAhIEh1bWFuIHdpbnMnLCB3aWR0aCAvMiwgaGVpZ2h0LzIpO1xuICB9XG4gIGlmIChmYWxsID09PSAxMykge1xuICAgIGN0eC50ZXh0QWxpZ24gPSAnY2VudGVyJztcbiAgICBjdHguZmlsbFRleHQoJ1lvdSBraWxsIHRoZSBodW1hbiAhIE5hdHVyZSB3aW5zJywgd2lkdGggLzIsIGhlaWdodC8yKTtcbiAgfVxuICBjdHgudGV4dEFsaWduID0gJ3JpZ2h0JztcblxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKTtcbn1cblxuZnVuY3Rpb24gc2V0UG93ZXJzKGFuYWwsIGNoZXZldSwgc29sYWlyZSkge1xuICBwb3dlcnMuYW5hbCA9IGFuYWw7XG4gIHBvd2Vycy5jaGV2ZXUgPSBjaGV2ZXU7XG4gIHBvd2Vycy5zb2xhaXJlID0gc29sYWlyZTtcbn1cblxuZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24gKGUpIHtcbiAgaWYgKGxldmVsIDwgMTMgJiYgZmFsbCA8IDEzKSB7XG4gICAgc2V0UG93ZXJzKGUuc2hpZnRLZXksIGUuYWx0S2V5LCBlLmN0cmxLZXkgfHwgbGV2ZWwgPiAwKTtcbiAgICBrZXlzW2Uua2V5Q29kZV0gPSB0cnVlO1xuICB9IGVsc2Uge1xuICAgIGtleXMgPSBbXTtcbiAgICBzZXRQb3dlcnMoZmFsc2UsIGZhbHNlLCBmYWxzZSk7XG4gIH1cbn0pO1xuXG5kb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24gKGUpIHtcbiAgc2V0UG93ZXJzKGZhbHNlLCBmYWxzZSwgbGV2ZWwgPiAwKTtcbiAga2V5c1tlLmtleUNvZGVdID0gZmFsc2U7XG59KTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XG4gIHVwZGF0ZSgpO1xufSk7Il19
