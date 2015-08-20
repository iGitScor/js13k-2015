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
    },
    {
      sol : [
        {
          x : 0,
          y : height - map.y,
          w : 0.8 * width,
          h : map.y,
        },
        {
          x : 0.9 * width,
          y : height - map.y,
          w : 0.1 * width,
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
        if(this.image){
            this.context.drawImage(this.image, this.x-128, this.y-128);         
            // If the image is being rendered do not draw the circle so break out of the draw function                
            return;
        }
        // Draw the circle as before, with the addition of using the position and the radius from this object.
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        this.context.fillStyle = "rgba(0, 255, 255, 1)";
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
        }
        // Check if has crossed the left edge
        else if (this.x <= 0) {
            this.xVelocity = -this.xVelocity;
            this.x = 0;
        }

        // Check if has crossed the bottom edge
        if (this.y >= height) {
            this.yVelocity = -this.yVelocity;
            this.y = height;
        }
        
        // Check if has crossed the top edge
        else if (this.y <= 0) {
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
      for(var i=0; i < particleCount; ++i){
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
  deep = 100 + randomize;
  divergence = 10 + randomize;
  reduction = 65/100;
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
  if (keys[38] && (player.jumper || powers.solaire)) {
    // up arrow or space
    if (!player.jumping){
      player.jumping = true;
      var sjump = powers.anal ? 7 : 5;
      player.velY = -player.speed * sjump;
    }
  }
  if (keys[39]) {
    // right arrow
    if (player.velX < player.speed) {
      player.velX++;
    }
  }
  if (keys[37]) {
    // left arrow
    if (player.velX > -player.speed) {
      player.velX--;
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
  ctx.fillText('o-o', player.x + player.width, player.y + 30);

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
    ctx.fillRect(0, height - map.y, width - (level * 100), map.y);
    ctx.fillRect(width - 100, height - map.y, 100, map.y);
  }

  // Info
  ctx.font = '1.2em Arial';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'right';
  ctx.fillText('Level : ' + level, width - 20, 35);
  if (player.jumper) {
    ctx.font = '.8em Arial';
    ctx.fillText('You can now jump with up arrow !', width  - 20, 50);
  }

  tree();

  ctx.fillStyle = '#000';
  ctx.font = '40px Arial';
  ctx.fillText('☠', finish.x, finish.y);

  requestAnimationFrame(update);
}

function setPowers(anal, cheveu, solaire) {
  powers.anal = anal;
  powers.cheveu = cheveu;
  powers.solaire = solaire;
}

document.body.addEventListener('keydown', function (e) {
  setPowers(e.shiftKey, e.altKey, e.ctrlKey);
  keys[e.keyCode] = true;
});

document.body.addEventListener('keyup', function (e) {
  setPowers(false, false, false);
  keys[e.keyCode] = false;
});

window.addEventListener('load', function () {
  update();
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9tYWluIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID1cbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgfHwgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgIHx8IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICB8fCB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG4gIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG59KSgpO1xuXG52YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWUnKSxcbiAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyksXG4gIGRvYyA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxcbiAgd2lkdGggPSBkb2MuY2xpZW50V2lkdGgsXG4gIGhlaWdodCA9IGRvYy5jbGllbnRIZWlnaHQsXG4gIHBsYXllciA9IHtcbiAgICB4IDogd2lkdGgsXG4gICAgeSA6IGhlaWdodCAtIDE1MCxcbiAgICB3aWR0aCA6IDM1LFxuICAgIGhlaWdodCA6IDEwMCxcbiAgICBzcGVlZCA6IDMsXG4gICAgdmVsWCA6IDAsXG4gICAgdmVsWSA6IDAsXG4gICAganVtcGluZyA6IGZhbHNlLFxuICAgIGp1bXBlciA6IGZhbHNlXG4gIH0sXG4gIG1hcCA9IHtcbiAgICB5IDogMjBcbiAgfSxcbiAgZmluaXNoID0ge1xuICAgIHggOiAxMDAsXG4gICAgeSA6IGhlaWdodCAtIDQwXG4gIH0sXG4gIGxldmVscyA9IFtcbiAgICB7XG4gICAgICBzb2wgOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB4IDogMCxcbiAgICAgICAgICB5IDogaGVpZ2h0IC0gbWFwLnksXG4gICAgICAgICAgdyA6IHdpZHRoLFxuICAgICAgICAgIGggOiBtYXAueVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBzb2wgOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB4IDogMCxcbiAgICAgICAgICB5IDogaGVpZ2h0IC0gbWFwLnksXG4gICAgICAgICAgdyA6IDAuOCAqIHdpZHRoLFxuICAgICAgICAgIGggOiBtYXAueSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHggOiAwLjkgKiB3aWR0aCxcbiAgICAgICAgICB5IDogaGVpZ2h0IC0gbWFwLnksXG4gICAgICAgICAgdyA6IDAuMSAqIHdpZHRoLFxuICAgICAgICAgIGggOiBtYXAueVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfVxuICBdLFxuICBsZXZlbCA9IDAsXG4gIGtleXMgPSBbXSxcbiAgcG93ZXJzID0gW10sXG4gIGZyaWN0aW9uID0gMC44LFxuICBncmF2aXR5ID0gMC4zO1xuICBcbnZhciBkZWVwLCBkaXZlcmdlbmNlLCByZWR1Y3Rpb24sIGxpbmVfd2lkdGgsIHN0YXJ0X3BvaW50cyA9IFtdO1xuXG52YXIgcGFydGljbGVzID0gW107XG52YXIgcGFydGljbGVDb3VudCA9IDMwO1xudmFyIG1heFZlbG9jaXR5ID0gMjtcbnZhciB0YXJnZXRGUFMgPSAzMztcbnZhciBpbWFnZU9iaiA9IG5ldyBJbWFnZSgpO1xuaW1hZ2VPYmoub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgcGFydGljbGVzLmZvckVhY2goZnVuY3Rpb24ocGFydGljbGUpIHtcbiAgICAgICAgICAgIHBhcnRpY2xlLnNldEltYWdlKGltYWdlT2JqKTtcbiAgICB9KTtcbn07XG5cbi8vIE9uY2UgdGhlIGNhbGxiYWNrIGlzIGFycmFuZ2VkIHRoZW4gc2V0IHRoZSBzb3VyY2Ugb2YgdGhlIGltYWdlXG5pbWFnZU9iai5zcmMgPSAnc21va2UucG5nJztcblxuLy8gQSBmdW5jdGlvbiB0byBjcmVhdGUgYSBwYXJ0aWNsZSBvYmplY3QuXG5mdW5jdGlvbiBQYXJ0aWNsZShjb250ZXh0KSB7XG5cbiAgICAvLyBTZXQgdGhlIGluaXRpYWwgeCBhbmQgeSBwb3NpdGlvbnNcbiAgICB0aGlzLnggPSAwO1xuICAgIHRoaXMueSA9IDA7XG5cbiAgICAvLyBTZXQgdGhlIGluaXRpYWwgdmVsb2NpdHlcbiAgICB0aGlzLnhWZWxvY2l0eSA9IDA7XG4gICAgdGhpcy55VmVsb2NpdHkgPSAwO1xuXG4gICAgLy8gU2V0IHRoZSByYWRpdXNcbiAgICB0aGlzLnJhZGl1cyA9IDU7XG5cbiAgICAvLyBTdG9yZSB0aGUgY29udGV4dCB3aGljaCB3aWxsIGJlIHVzZWQgdG8gZHJhdyB0aGUgcGFydGljbGVcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuXG4gICAgLy8gVGhlIGZ1bmN0aW9uIHRvIGRyYXcgdGhlIHBhcnRpY2xlIG9uIHRoZSBjYW52YXMuXG4gICAgdGhpcy5kcmF3ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIFxuICAgICAgICAvLyBJZiBhbiBpbWFnZSBpcyBzZXQgZHJhdyBpdFxuICAgICAgICBpZih0aGlzLmltYWdlKXtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5kcmF3SW1hZ2UodGhpcy5pbWFnZSwgdGhpcy54LTEyOCwgdGhpcy55LTEyOCk7ICAgICAgICAgXG4gICAgICAgICAgICAvLyBJZiB0aGUgaW1hZ2UgaXMgYmVpbmcgcmVuZGVyZWQgZG8gbm90IGRyYXcgdGhlIGNpcmNsZSBzbyBicmVhayBvdXQgb2YgdGhlIGRyYXcgZnVuY3Rpb24gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gRHJhdyB0aGUgY2lyY2xlIGFzIGJlZm9yZSwgd2l0aCB0aGUgYWRkaXRpb24gb2YgdXNpbmcgdGhlIHBvc2l0aW9uIGFuZCB0aGUgcmFkaXVzIGZyb20gdGhpcyBvYmplY3QuXG4gICAgICAgIHRoaXMuY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgdGhpcy5jb250ZXh0LmFyYyh0aGlzLngsIHRoaXMueSwgdGhpcy5yYWRpdXMsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuY29udGV4dC5maWxsU3R5bGUgPSBcInJnYmEoMCwgMjU1LCAyNTUsIDEpXCI7XG4gICAgICAgIHRoaXMuY29udGV4dC5maWxsKCk7XG4gICAgICAgIHRoaXMuY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICB9O1xuXG4gICAgLy8gVXBkYXRlIHRoZSBwYXJ0aWNsZS5cbiAgICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBVcGRhdGUgdGhlIHBvc2l0aW9uIG9mIHRoZSBwYXJ0aWNsZSB3aXRoIHRoZSBhZGRpdGlvbiBvZiB0aGUgdmVsb2NpdHkuXG4gICAgICAgIHRoaXMueCArPSB0aGlzLnhWZWxvY2l0eTtcbiAgICAgICAgdGhpcy55ICs9IHRoaXMueVZlbG9jaXR5O1xuXG4gICAgICAgIC8vIENoZWNrIGlmIGhhcyBjcm9zc2VkIHRoZSByaWdodCBlZGdlXG4gICAgICAgIGlmICh0aGlzLnggPj0gd2lkdGgpIHtcbiAgICAgICAgICAgIHRoaXMueFZlbG9jaXR5ID0gLXRoaXMueFZlbG9jaXR5O1xuICAgICAgICAgICAgdGhpcy54ID0gd2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2hlY2sgaWYgaGFzIGNyb3NzZWQgdGhlIGxlZnQgZWRnZVxuICAgICAgICBlbHNlIGlmICh0aGlzLnggPD0gMCkge1xuICAgICAgICAgICAgdGhpcy54VmVsb2NpdHkgPSAtdGhpcy54VmVsb2NpdHk7XG4gICAgICAgICAgICB0aGlzLnggPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgaGFzIGNyb3NzZWQgdGhlIGJvdHRvbSBlZGdlXG4gICAgICAgIGlmICh0aGlzLnkgPj0gaGVpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLnlWZWxvY2l0eSA9IC10aGlzLnlWZWxvY2l0eTtcbiAgICAgICAgICAgIHRoaXMueSA9IGhlaWdodDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gQ2hlY2sgaWYgaGFzIGNyb3NzZWQgdGhlIHRvcCBlZGdlXG4gICAgICAgIGVsc2UgaWYgKHRoaXMueSA8PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnlWZWxvY2l0eSA9IC10aGlzLnlWZWxvY2l0eTtcbiAgICAgICAgICAgIHRoaXMueSA9IDA7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIHRoaXMueCA9IHg7XG4gICAgICB0aGlzLnkgPSB5O1xuICAgIH07XG5cbiAgICB0aGlzLnNldFZlbG9jaXR5ID0gZnVuY3Rpb24oeCwgeSkge1xuICAgICAgdGhpcy54VmVsb2NpdHkgPSB4O1xuICAgICAgdGhpcy55VmVsb2NpdHkgPSB5O1xuICAgIH07XG5cbiAgICB0aGlzLnNldEltYWdlID0gZnVuY3Rpb24oaW1hZ2Upe1xuICAgICAgdGhpcy5pbWFnZSA9IGltYWdlO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVSYW5kb20obWluLCBtYXgpe1xuICByZXR1cm4gTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluO1xufVxuXG4vLyBJbml0aWFsaXNlIHRoZSBzY2VuZSBhbmQgc2V0IHRoZSBjb250ZXh0IGlmIHBvc3NpYmxlXG5mdW5jdGlvbiBpbml0KCkge1xuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWUnKTtcbiAgaWYgKGNhbnZhcy5nZXRDb250ZXh0KSB7XG5cbiAgICAgIC8vIFNldCB0aGUgY29udGV4dCB2YXJpYWJsZSBzbyBpdCBjYW4gYmUgcmUtdXNlZFxuICAgICAgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAvLyBDcmVhdGUgdGhlIHBhcnRpY2xlcyBhbmQgc2V0IHRoZWlyIGluaXRpYWwgcG9zaXRpb25zIGFuZCB2ZWxvY2l0aWVzXG4gICAgICBmb3IodmFyIGk9MDsgaSA8IHBhcnRpY2xlQ291bnQ7ICsraSl7XG4gICAgICAgIHZhciBwYXJ0aWNsZSA9IG5ldyBQYXJ0aWNsZShjb250ZXh0KTtcbiAgICAgICAgXG4gICAgICAgIC8vIFNldCB0aGUgcG9zaXRpb24gdG8gYmUgaW5zaWRlIHRoZSBjYW52YXMgYm91bmRzXG4gICAgICAgIHBhcnRpY2xlLnNldFBvc2l0aW9uKGdlbmVyYXRlUmFuZG9tKDAsIHdpZHRoKSwgZ2VuZXJhdGVSYW5kb20oMCwgaGVpZ2h0KSk7XG4gICAgICAgIFxuICAgICAgICAvLyBTZXQgdGhlIGluaXRpYWwgdmVsb2NpdHkgdG8gYmUgZWl0aGVyIHJhbmRvbSBhbmQgZWl0aGVyIG5lZ2F0aXZlIG9yIHBvc2l0aXZlXG4gICAgICAgIHBhcnRpY2xlLnNldFZlbG9jaXR5KGdlbmVyYXRlUmFuZG9tKC1tYXhWZWxvY2l0eSwgbWF4VmVsb2NpdHkpLCBnZW5lcmF0ZVJhbmRvbSgtbWF4VmVsb2NpdHksIG1heFZlbG9jaXR5KSk7XG4gICAgICAgIHBhcnRpY2xlcy5wdXNoKHBhcnRpY2xlKTtcbiAgICAgIH1cbiAgfVxufVxuXG5pbml0KCk7XG5cbmNhbnZhcy53aWR0aCA9IHdpZHRoO1xuY2FudmFzLmhlaWdodCA9IGhlaWdodDtcblxuZnVuY3Rpb24gdHJlZSgpIHtcbiAgdmFyIHJhbmRvbWl6ZSA9IDMwO1xuICBkZWVwID0gMTAwICsgcmFuZG9taXplO1xuICBkaXZlcmdlbmNlID0gMTAgKyByYW5kb21pemU7XG4gIHJlZHVjdGlvbiA9IDY1LzEwMDtcbiAgbGluZV93aWR0aCA9IDEwO1xuICB2YXIgdHJ1bmsgPSB7eDogd2lkdGgvMiwgeTogZGVlcCArIDkwLCBhbmdsZTogOTB9O1xuICBzdGFydF9wb2ludHMgPSBbXTtcbiAgc3RhcnRfcG9pbnRzLnB1c2godHJ1bmspO1xuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5tb3ZlVG8odHJ1bmsueCwgaGVpZ2h0LW1hcC55KTtcbiAgY3R4LmxpbmVUbyh0cnVuay54LCBoZWlnaHQtdHJ1bmsueSk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ2Jyb3duJztcbiAgY3R4LmxpbmVXaWR0aCA9IGxpbmVfd2lkdGg7XG4gIGN0eC5zdHJva2UoKTtcbiAgXG4gIGJyYW5jaGVzKCk7XG59XG5cbmZ1bmN0aW9uIGJyYW5jaGVzKCkge1xuICBkZWVwID0gZGVlcCAqIHJlZHVjdGlvbjtcbiAgbGluZV93aWR0aCA9IGxpbmVfd2lkdGggKiByZWR1Y3Rpb247XG4gIGN0eC5saW5lV2lkdGggPSBsaW5lX3dpZHRoO1xuICBcbiAgdmFyIG5ld19zdGFydF9wb2ludHMgPSBbXTtcbiAgY3R4LmJlZ2luUGF0aCgpO1xuICB2YXIgaTtcbiAgZm9yIChpID0gMDsgaSA8IHN0YXJ0X3BvaW50cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBzcCA9IHN0YXJ0X3BvaW50c1tpXTtcbiAgICB2YXIgZXAxID0gZ2V0X2VuZHBvaW50KHNwLngsIHNwLnksIHNwLmFuZ2xlK2RpdmVyZ2VuY2UsIGRlZXApO1xuICAgIHZhciBlcDIgPSBnZXRfZW5kcG9pbnQoc3AueCwgc3AueSwgc3AuYW5nbGUtZGl2ZXJnZW5jZSwgZGVlcCk7XG4gICAgXG4gICAgY3R4Lm1vdmVUbyhzcC54LCBoZWlnaHQtc3AueSk7XG4gICAgY3R4LmxpbmVUbyhlcDEueCwgaGVpZ2h0LWVwMS55KTtcbiAgICBjdHgubW92ZVRvKHNwLngsIGhlaWdodC1zcC55KTtcbiAgICBjdHgubGluZVRvKGVwMi54LCBoZWlnaHQtZXAyLnkpO1xuICAgIFxuICAgIGVwMS5hbmdsZSA9IHNwLmFuZ2xlK2RpdmVyZ2VuY2U7XG4gICAgZXAyLmFuZ2xlID0gc3AuYW5nbGUtZGl2ZXJnZW5jZTtcbiAgICBcbiAgICBuZXdfc3RhcnRfcG9pbnRzLnB1c2goZXAxKTtcbiAgICBuZXdfc3RhcnRfcG9pbnRzLnB1c2goZXAyKTtcbiAgfVxuICBjdHguY2xvc2VQYXRoKCk7XG4gIGN0eC5zdHJva2VTdHlsZSA9IGRlZXAgPCAxMCA/ICdncmVlbicgOiAnYnJvd24nO1xuICBjdHguc3Ryb2tlKCk7XG4gIHN0YXJ0X3BvaW50cyA9IG5ld19zdGFydF9wb2ludHM7XG4gIFxuICBpZiAoZGVlcCA+IDIpIHtcbiAgICBicmFuY2hlcygpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldF9lbmRwb2ludCh4LCB5LCBhLCBsKSB7XG4gIHZhciBlcHggPSB4ICsgbCAqIE1hdGguY29zKGEqTWF0aC5QSS8xODApO1xuICB2YXIgZXB5ID0geSArIGwgKiBNYXRoLnNpbihhKk1hdGguUEkvMTgwKTtcblxuICByZXR1cm4ge3g6IGVweCwgeTogZXB5fTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlKCkge1xuICAvLyBjaGVjayBrZXlzXG4gIGlmIChrZXlzWzM4XSAmJiAocGxheWVyLmp1bXBlciB8fCBwb3dlcnMuc29sYWlyZSkpIHtcbiAgICAvLyB1cCBhcnJvdyBvciBzcGFjZVxuICAgIGlmICghcGxheWVyLmp1bXBpbmcpe1xuICAgICAgcGxheWVyLmp1bXBpbmcgPSB0cnVlO1xuICAgICAgdmFyIHNqdW1wID0gcG93ZXJzLmFuYWwgPyA3IDogNTtcbiAgICAgIHBsYXllci52ZWxZID0gLXBsYXllci5zcGVlZCAqIHNqdW1wO1xuICAgIH1cbiAgfVxuICBpZiAoa2V5c1szOV0pIHtcbiAgICAvLyByaWdodCBhcnJvd1xuICAgIGlmIChwbGF5ZXIudmVsWCA8IHBsYXllci5zcGVlZCkge1xuICAgICAgcGxheWVyLnZlbFgrKztcbiAgICB9XG4gIH1cbiAgaWYgKGtleXNbMzddKSB7XG4gICAgLy8gbGVmdCBhcnJvd1xuICAgIGlmIChwbGF5ZXIudmVsWCA+IC1wbGF5ZXIuc3BlZWQpIHtcbiAgICAgIHBsYXllci52ZWxYLS07XG4gICAgfVxuICB9XG5cbiAgcGxheWVyLnZlbFggKj0gZnJpY3Rpb247XG4gIHBsYXllci52ZWxZICs9IGdyYXZpdHk7XG5cbiAgdmFyIGFjYyA9IHBvd2Vycy5hbmFsID8gNSA6IDE7XG4gIHBsYXllci54ICs9IHBsYXllci52ZWxYICogYWNjO1xuICBwbGF5ZXIueSArPSBwbGF5ZXIudmVsWTtcblxuICBpZiAocGxheWVyLnggPiB3aWR0aCAtIDIwMCAmJiBwbGF5ZXIueCA8IHdpZHRoIC0gMjAwKSB7IFxuICAgIGlmIChwbGF5ZXIueSA+PSBoZWlnaHQgLSBwbGF5ZXIuaGVpZ2h0KXtcbiAgICAgIHBsYXllci55ID0gaGVpZ2h0IC0gcGxheWVyLmhlaWdodCArIDIwO1xuICAgICAgcGxheWVyLmp1bXBpbmcgPSBmYWxzZTtcbiAgICAgIHBsYXllci5qdW1wZXIgPSB0cnVlO1xuICAgICAgcGxheWVyLnggPSB3aWR0aDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKHBsYXllci55ID49IGhlaWdodCAtIHBsYXllci5oZWlnaHQgLSBtYXAueSl7XG4gICAgICBwbGF5ZXIueSA9IGhlaWdodCAtIHBsYXllci5oZWlnaHQgLSBtYXAueTtcbiAgICAgIHBsYXllci5qdW1waW5nID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgdmFyIG91dExlZnQgPSAocGxheWVyLnggPD0gMCk7XG4gIGlmIChcbiAgICAoKGZpbmlzaC54IC0gMjApID49IChwbGF5ZXIueCArIHBsYXllci53aWR0aCAvIDIpKVxuICAgICYmICgoZmluaXNoLnkgLSAyMCkgPD0gKHBsYXllci55ICsgcGxheWVyLmhlaWdodCkgJiYgKGZpbmlzaC55IC0gMjApID4gKHBsYXllci55KSlcbiAgICAmJiAhb3V0TGVmdFxuICApIHtcbiAgICBsZXZlbCsrO1xuICAgIHBsYXllci54ID0gd2lkdGg7XG4gIH0gZWxzZSBpZiAocGxheWVyLnggPj0gd2lkdGggLSBwbGF5ZXIud2lkdGgpIHtcbiAgICBwbGF5ZXIueCA9IHdpZHRoIC0gcGxheWVyLndpZHRoO1xuICB9IGVsc2UgaWYgKG91dExlZnQpIHtcbiAgICBwbGF5ZXIueCA9IDA7XG4gIH1cblxuICAvLyBCYWNrZ3JvdW5kXG4gIGN0eC5jbGVhclJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4Lm1vdmVUbygxNzAsIDgwKTtcbiAgY3R4LmJlemllckN1cnZlVG8oMTMwLCAxMDAsIDEzMCwgMTUwLCAyMzAsIDE1MCk7XG4gIGN0eC5iZXppZXJDdXJ2ZVRvKDI1MCwgMTgwLCAzMjAsIDE4MCwgMzQwLCAxNTApO1xuICBjdHguYmV6aWVyQ3VydmVUbyg0MjAsIDE1MCwgNDIwLCAxMjAsIDM5MCwgMTAwKTtcbiAgY3R4LmJlemllckN1cnZlVG8oNDMwLCA0MCwgMzcwLCAzMCwgMzQwLCA1MCk7XG4gIGN0eC5iZXppZXJDdXJ2ZVRvKDMyMCwgNSwgMjUwLCAyMCwgMjUwLCA1MCk7XG4gIGN0eC5iZXppZXJDdXJ2ZVRvKDIwMCwgNSwgMTUwLCAyMCwgMTcwLCA4MCk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcbiAgY3R4LmxpbmVXaWR0aCA9IDU7XG4gIGN0eC5zdHJva2VTdHlsZSA9ICcjRkZGJztcbiAgY3R4LmZpbGxTdHlsZSA9ICcjREREJztcbiAgY3R4LmZpbGwoKTtcbiAgY3R4LnN0cm9rZSgpO1xuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4Lm1vdmVUbyg0NzAsIDM4MCk7XG4gIGN0eC5iZXppZXJDdXJ2ZVRvKDQzMCwgNDAwLCA0MzAsIDQ1MCwgNTMwLCA0NTApO1xuICBjdHguYmV6aWVyQ3VydmVUbyg1NTAsIDQ4MCwgNjIwLCA0ODAsIDY0MCwgNDUwKTtcbiAgY3R4LmJlemllckN1cnZlVG8oNzIwLCA0NTAsIDcyMCwgNDIwLCA2OTAsIDQwMCk7XG4gIGN0eC5iZXppZXJDdXJ2ZVRvKDczMCwgMzQwLCA2NzAsIDMzMCwgNjQwLCAzNTApO1xuICBjdHguYmV6aWVyQ3VydmVUbyg2MjAsIDMwNSwgNTUwLCAzMjAsIDU1MCwgMzUwKTtcbiAgY3R4LmJlemllckN1cnZlVG8oNTAwLCAzMDUsIDQ1MCwgMzIwLCA0NzAsIDM4MCk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcbiAgY3R4LmxpbmVXaWR0aCA9IDU7XG4gIGN0eC5zdHJva2VTdHlsZSA9ICcjRkZGJztcbiAgY3R4LmZpbGxTdHlsZSA9ICcjREREJztcbiAgY3R4LmZpbGwoKTtcbiAgY3R4LnN0cm9rZSgpO1xuXG4gIHBhcnRpY2xlcy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnRpY2xlKSB7XG4gICAgcGFydGljbGUudXBkYXRlKCk7XG4gICAgcGFydGljbGUuZHJhdygpO1xuICB9KTtcblxuICAvLyBCdWRkeVxuICBjdHguZmlsbFN0eWxlID0gJ2RhcmtyZWQnO1xuICBjdHguZmlsbFJlY3QocGxheWVyLngsIHBsYXllci55LCBwbGF5ZXIud2lkdGgsIHBsYXllci5oZWlnaHQpO1xuICBjdHguZmlsbFN0eWxlID0gJyMwMDAnO1xuICBjdHguZmlsbFJlY3QocGxheWVyLngsIHBsYXllci55LCBwbGF5ZXIud2lkdGgsIDEwKTtcbiAgY3R4LmZpbGxTdHlsZSA9ICdiZWlnZSc7XG4gIGN0eC5maWxsUmVjdChwbGF5ZXIueCwgcGxheWVyLnkgKyAxMCwgcGxheWVyLndpZHRoLCAyMCk7XG4gIGN0eC5maWxsU3R5bGUgPSAnIzAwMCc7XG4gIGN0eC5mb250ID0gJzEuOGVtIEFyaWFsJztcbiAgY3R4LmZpbGxUZXh0KCdvLW8nLCBwbGF5ZXIueCArIHBsYXllci53aWR0aCwgcGxheWVyLnkgKyAzMCk7XG5cbiAgLy8gTGV2ZWxcbiAgY3R4LmZpbGxTdHlsZSA9ICdncmVlbic7XG4gIGlmIChsZXZlbHNbbGV2ZWxdKSB7XG4gICAgdmFyIHNvbCA9IGxldmVsc1tsZXZlbF0uc29sLCBpO1xuICAgIGZvciAoaSA9IDA7IGkgPCBzb2wubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwbGF0Zm9ybSA9IHNvbFtpXTtcbiAgICAgIGN0eC5maWxsUmVjdChwbGF0Zm9ybS54LCBwbGF0Zm9ybS55LCBwbGF0Zm9ybS53LCBwbGF0Zm9ybS5oKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gUmFuZG9taXplICFcbiAgICBjdHguZmlsbFJlY3QoMCwgaGVpZ2h0IC0gbWFwLnksIHdpZHRoIC0gKGxldmVsICogMTAwKSwgbWFwLnkpO1xuICAgIGN0eC5maWxsUmVjdCh3aWR0aCAtIDEwMCwgaGVpZ2h0IC0gbWFwLnksIDEwMCwgbWFwLnkpO1xuICB9XG5cbiAgLy8gSW5mb1xuICBjdHguZm9udCA9ICcxLjJlbSBBcmlhbCc7XG4gIGN0eC5maWxsU3R5bGUgPSAnIzAwMCc7XG4gIGN0eC50ZXh0QWxpZ24gPSAncmlnaHQnO1xuICBjdHguZmlsbFRleHQoJ0xldmVsIDogJyArIGxldmVsLCB3aWR0aCAtIDIwLCAzNSk7XG4gIGlmIChwbGF5ZXIuanVtcGVyKSB7XG4gICAgY3R4LmZvbnQgPSAnLjhlbSBBcmlhbCc7XG4gICAgY3R4LmZpbGxUZXh0KCdZb3UgY2FuIG5vdyBqdW1wIHdpdGggdXAgYXJyb3cgIScsIHdpZHRoICAtIDIwLCA1MCk7XG4gIH1cblxuICB0cmVlKCk7XG5cbiAgY3R4LmZpbGxTdHlsZSA9ICcjMDAwJztcbiAgY3R4LmZvbnQgPSAnNDBweCBBcmlhbCc7XG4gIGN0eC5maWxsVGV4dCgn4pigJywgZmluaXNoLngsIGZpbmlzaC55KTtcblxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKTtcbn1cblxuZnVuY3Rpb24gc2V0UG93ZXJzKGFuYWwsIGNoZXZldSwgc29sYWlyZSkge1xuICBwb3dlcnMuYW5hbCA9IGFuYWw7XG4gIHBvd2Vycy5jaGV2ZXUgPSBjaGV2ZXU7XG4gIHBvd2Vycy5zb2xhaXJlID0gc29sYWlyZTtcbn1cblxuZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24gKGUpIHtcbiAgc2V0UG93ZXJzKGUuc2hpZnRLZXksIGUuYWx0S2V5LCBlLmN0cmxLZXkpO1xuICBrZXlzW2Uua2V5Q29kZV0gPSB0cnVlO1xufSk7XG5cbmRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbiAoZSkge1xuICBzZXRQb3dlcnMoZmFsc2UsIGZhbHNlLCBmYWxzZSk7XG4gIGtleXNbZS5rZXlDb2RlXSA9IGZhbHNlO1xufSk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24gKCkge1xuICB1cGRhdGUoKTtcbn0pO1xuIl19
