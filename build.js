(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
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
    speed: 3,
    velX: 0,
    velY: 0,
    jumping: false,
    jumper: false
  },
  map = {
    y: 20
  },
  finish = {
    x: 100,
    y: height - 40
  },
  levels = [
    {
      sol: [{
        x:0,
        y:height - map.y,
        w:width,
        h:map.y
      }]
    },
    {
      sol: [
        {
          x: 0,
          y: height - map.y,
          w: 0.8*width,
          h: map.y,
        },
        {
          x: 0.9*width,
          y: height - map.y,
          w: 0.1*width,
          h: map.y
        }
      ]
    }
  ],
  level = 0,
  keys = [],
  friction = 0.8,
  gravity = 0.3;

canvas.width = width;
canvas.height = height;
canvas.style['background-color'] = '#7F7';

function update(){
  // check keys
  if (keys[38] && player.jumper) {
    // up arrow or space
    if (!player.jumping){
      player.jumping = true;
      player.velY = -player.speed*5;
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

  player.x += player.velX*3;
  player.y += player.velY;

  if (player.x > width - 200 && player.x < width - 200) { 
    if (player.y >= height-player.height){
      player.y = height - player.height + 20;
      player.jumping = false;
      player.jumper = true;
      player.x = width;
    }
  } else {
    if (player.y >= height-player.height - map.y){
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
  } else if (player.x >= width-player.width) {
    player.x = width-player.width;
  } else if (outLeft) {
    player.x = 0;
  }

  // Buddy
  ctx.clearRect(0,0,width,height);
  ctx.fillStyle = 'black';
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = 'beige';
  ctx.fillRect(player.x, player.y + 10, player.width, 20);

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
    ctx.fillRect(0, height - map.y, width - 600, map.y);
    ctx.fillRect(width - 100, height - map.y, 100, map.y);
  }

  // Info
  ctx.font = '1.2em Arial';
  ctx.fillStyle = 'black';
  ctx.textAlign = 'right';
  ctx.fillText('Level : ' + level, width - 20, 35);
  if (player.jumper) {
    ctx.font = '.8em Arial';
    ctx.fillText('You can now jump with up arrow !', width  - 20, 50);
  }

  /*ctx.font = '.7em Arial';
  ctx.fillText('X : ' + player.x + ', Y : ' + player.y, width  - 20, 65);
  ctx.fillText('X : ' + (finish.x - 20) + ', Y : ' + (finish.y - 20), width  - 20, 80);*/

  ctx.fillStyle = 'purple';
  ctx.font = '40px Arial';
  ctx.fillText('♥', finish.x, finish.y);

  requestAnimationFrame(update);
}

document.body.addEventListener('keydown', function(e) {
  keys[e.keyCode] = true;
});

document.body.addEventListener('keyup', function(e) {
  keys[e.keyCode] = false;
});

window.addEventListener('load',function(){
  update();
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9tYWluIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbigpIHtcbiAgdmFyIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHJlcXVlc3RBbmltYXRpb25GcmFtZTtcbn0pKCk7XG5cbnZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZScpLFxuICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKSxcbiAgZG9jID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxuICB3aWR0aCA9IGRvYy5jbGllbnRXaWR0aCxcbiAgaGVpZ2h0ID0gZG9jLmNsaWVudEhlaWdodCxcbiAgcGxheWVyID0ge1xuICAgIHggOiB3aWR0aCxcbiAgICB5IDogaGVpZ2h0IC0gMTUwLFxuICAgIHdpZHRoIDogMzUsXG4gICAgaGVpZ2h0IDogMTAwLFxuICAgIHNwZWVkOiAzLFxuICAgIHZlbFg6IDAsXG4gICAgdmVsWTogMCxcbiAgICBqdW1waW5nOiBmYWxzZSxcbiAgICBqdW1wZXI6IGZhbHNlXG4gIH0sXG4gIG1hcCA9IHtcbiAgICB5OiAyMFxuICB9LFxuICBmaW5pc2ggPSB7XG4gICAgeDogMTAwLFxuICAgIHk6IGhlaWdodCAtIDQwXG4gIH0sXG4gIGxldmVscyA9IFtcbiAgICB7XG4gICAgICBzb2w6IFt7XG4gICAgICAgIHg6MCxcbiAgICAgICAgeTpoZWlnaHQgLSBtYXAueSxcbiAgICAgICAgdzp3aWR0aCxcbiAgICAgICAgaDptYXAueVxuICAgICAgfV1cbiAgICB9LFxuICAgIHtcbiAgICAgIHNvbDogW1xuICAgICAgICB7XG4gICAgICAgICAgeDogMCxcbiAgICAgICAgICB5OiBoZWlnaHQgLSBtYXAueSxcbiAgICAgICAgICB3OiAwLjgqd2lkdGgsXG4gICAgICAgICAgaDogbWFwLnksXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB4OiAwLjkqd2lkdGgsXG4gICAgICAgICAgeTogaGVpZ2h0IC0gbWFwLnksXG4gICAgICAgICAgdzogMC4xKndpZHRoLFxuICAgICAgICAgIGg6IG1hcC55XG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9XG4gIF0sXG4gIGxldmVsID0gMCxcbiAga2V5cyA9IFtdLFxuICBmcmljdGlvbiA9IDAuOCxcbiAgZ3Jhdml0eSA9IDAuMztcblxuY2FudmFzLndpZHRoID0gd2lkdGg7XG5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuY2FudmFzLnN0eWxlWydiYWNrZ3JvdW5kLWNvbG9yJ10gPSAnIzdGNyc7XG5cbmZ1bmN0aW9uIHVwZGF0ZSgpe1xuICAvLyBjaGVjayBrZXlzXG4gIGlmIChrZXlzWzM4XSAmJiBwbGF5ZXIuanVtcGVyKSB7XG4gICAgLy8gdXAgYXJyb3cgb3Igc3BhY2VcbiAgICBpZiAoIXBsYXllci5qdW1waW5nKXtcbiAgICAgIHBsYXllci5qdW1waW5nID0gdHJ1ZTtcbiAgICAgIHBsYXllci52ZWxZID0gLXBsYXllci5zcGVlZCo1O1xuICAgIH1cbiAgfVxuICBpZiAoa2V5c1szOV0pIHtcbiAgICAvLyByaWdodCBhcnJvd1xuICAgIGlmIChwbGF5ZXIudmVsWCA8IHBsYXllci5zcGVlZCkge1xuICAgICAgcGxheWVyLnZlbFgrKztcbiAgICB9XG4gIH1cbiAgaWYgKGtleXNbMzddKSB7XG4gICAgLy8gbGVmdCBhcnJvd1xuICAgIGlmIChwbGF5ZXIudmVsWCA+IC1wbGF5ZXIuc3BlZWQpIHtcbiAgICAgIHBsYXllci52ZWxYLS07XG4gICAgfVxuICB9XG4gXG4gIHBsYXllci52ZWxYICo9IGZyaWN0aW9uO1xuIFxuICBwbGF5ZXIudmVsWSArPSBncmF2aXR5O1xuXG4gIHBsYXllci54ICs9IHBsYXllci52ZWxYKjM7XG4gIHBsYXllci55ICs9IHBsYXllci52ZWxZO1xuXG4gIGlmIChwbGF5ZXIueCA+IHdpZHRoIC0gMjAwICYmIHBsYXllci54IDwgd2lkdGggLSAyMDApIHsgXG4gICAgaWYgKHBsYXllci55ID49IGhlaWdodC1wbGF5ZXIuaGVpZ2h0KXtcbiAgICAgIHBsYXllci55ID0gaGVpZ2h0IC0gcGxheWVyLmhlaWdodCArIDIwO1xuICAgICAgcGxheWVyLmp1bXBpbmcgPSBmYWxzZTtcbiAgICAgIHBsYXllci5qdW1wZXIgPSB0cnVlO1xuICAgICAgcGxheWVyLnggPSB3aWR0aDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKHBsYXllci55ID49IGhlaWdodC1wbGF5ZXIuaGVpZ2h0IC0gbWFwLnkpe1xuICAgICAgcGxheWVyLnkgPSBoZWlnaHQgLSBwbGF5ZXIuaGVpZ2h0IC0gbWFwLnk7XG4gICAgICBwbGF5ZXIuanVtcGluZyA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHZhciBvdXRMZWZ0ID0gKHBsYXllci54IDw9IDApO1xuICBpZiAoXG4gICAgKChmaW5pc2gueCAtIDIwKSA+PSAocGxheWVyLnggKyBwbGF5ZXIud2lkdGggLyAyKSlcbiAgICAmJiAoKGZpbmlzaC55IC0gMjApIDw9IChwbGF5ZXIueSArIHBsYXllci5oZWlnaHQpICYmIChmaW5pc2gueSAtIDIwKSA+IChwbGF5ZXIueSkpXG4gICAgJiYgIW91dExlZnRcbiAgKSB7XG4gICAgbGV2ZWwrKztcbiAgICBwbGF5ZXIueCA9IHdpZHRoO1xuICB9IGVsc2UgaWYgKHBsYXllci54ID49IHdpZHRoLXBsYXllci53aWR0aCkge1xuICAgIHBsYXllci54ID0gd2lkdGgtcGxheWVyLndpZHRoO1xuICB9IGVsc2UgaWYgKG91dExlZnQpIHtcbiAgICBwbGF5ZXIueCA9IDA7XG4gIH1cblxuICAvLyBCdWRkeVxuICBjdHguY2xlYXJSZWN0KDAsMCx3aWR0aCxoZWlnaHQpO1xuICBjdHguZmlsbFN0eWxlID0gJ2JsYWNrJztcbiAgY3R4LmZpbGxSZWN0KHBsYXllci54LCBwbGF5ZXIueSwgcGxheWVyLndpZHRoLCBwbGF5ZXIuaGVpZ2h0KTtcbiAgY3R4LmZpbGxTdHlsZSA9ICdiZWlnZSc7XG4gIGN0eC5maWxsUmVjdChwbGF5ZXIueCwgcGxheWVyLnkgKyAxMCwgcGxheWVyLndpZHRoLCAyMCk7XG5cbiAgLy8gTGV2ZWxcbiAgY3R4LmZpbGxTdHlsZSA9ICdncmVlbic7XG4gIGlmIChsZXZlbHNbbGV2ZWxdKSB7XG4gICAgdmFyIHNvbCA9IGxldmVsc1tsZXZlbF0uc29sLCBpO1xuICAgIGZvciAoaSA9IDA7IGkgPCBzb2wubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwbGF0Zm9ybSA9IHNvbFtpXTtcbiAgICAgIGN0eC5maWxsUmVjdChwbGF0Zm9ybS54LCBwbGF0Zm9ybS55LCBwbGF0Zm9ybS53LCBwbGF0Zm9ybS5oKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gUmFuZG9taXplICFcbiAgICBjdHguZmlsbFJlY3QoMCwgaGVpZ2h0IC0gbWFwLnksIHdpZHRoIC0gNjAwLCBtYXAueSk7XG4gICAgY3R4LmZpbGxSZWN0KHdpZHRoIC0gMTAwLCBoZWlnaHQgLSBtYXAueSwgMTAwLCBtYXAueSk7XG4gIH1cblxuICAvLyBJbmZvXG4gIGN0eC5mb250ID0gJzEuMmVtIEFyaWFsJztcbiAgY3R4LmZpbGxTdHlsZSA9ICdibGFjayc7XG4gIGN0eC50ZXh0QWxpZ24gPSAncmlnaHQnO1xuICBjdHguZmlsbFRleHQoJ0xldmVsIDogJyArIGxldmVsLCB3aWR0aCAtIDIwLCAzNSk7XG4gIGlmIChwbGF5ZXIuanVtcGVyKSB7XG4gICAgY3R4LmZvbnQgPSAnLjhlbSBBcmlhbCc7XG4gICAgY3R4LmZpbGxUZXh0KCdZb3UgY2FuIG5vdyBqdW1wIHdpdGggdXAgYXJyb3cgIScsIHdpZHRoICAtIDIwLCA1MCk7XG4gIH1cblxuICAvKmN0eC5mb250ID0gJy43ZW0gQXJpYWwnO1xuICBjdHguZmlsbFRleHQoJ1ggOiAnICsgcGxheWVyLnggKyAnLCBZIDogJyArIHBsYXllci55LCB3aWR0aCAgLSAyMCwgNjUpO1xuICBjdHguZmlsbFRleHQoJ1ggOiAnICsgKGZpbmlzaC54IC0gMjApICsgJywgWSA6ICcgKyAoZmluaXNoLnkgLSAyMCksIHdpZHRoICAtIDIwLCA4MCk7Ki9cblxuICBjdHguZmlsbFN0eWxlID0gJ3B1cnBsZSc7XG4gIGN0eC5mb250ID0gJzQwcHggQXJpYWwnO1xuICBjdHguZmlsbFRleHQoJ+KZpScsIGZpbmlzaC54LCBmaW5pc2gueSk7XG5cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHVwZGF0ZSk7XG59XG5cbmRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcbiAga2V5c1tlLmtleUNvZGVdID0gdHJ1ZTtcbn0pO1xuXG5kb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24oZSkge1xuICBrZXlzW2Uua2V5Q29kZV0gPSBmYWxzZTtcbn0pO1xuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsZnVuY3Rpb24oKXtcbiAgdXBkYXRlKCk7XG59KTtcbiJdfQ==
