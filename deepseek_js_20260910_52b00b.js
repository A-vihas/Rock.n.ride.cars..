var player = makeCar(0xff3b30);
player.position.set(0, 0, 100);
scene.add(player);

var P = { x: 0, z: 100, y: 0, heading: 0, speed: 0, vy: 0, airborne: false, airTime: 0, nitro: 100 };
var keys = {};
var started = false;
var paused = false;
var camMode = 0;

window.addEventListener('keydown', function (e) {
  var k = e.key.toLowerCase();
  keys[k] = true;
  if (k === 'w' || k === 'a' || k === 's' || k === 'd' || k === ' ' || k === 'shift') {
    e.preventDefault();
  }
  if (k === 'c') camMode = (camMode + 1) % 3;
  if (e.key === 'Escape' && started) paused = !paused;
});
window.addEventListener('keyup', function (e) {
  keys[e.key.toLowerCase()] = false;
});

document.getElementById('start').onclick = function () {
  started = true;
  document.getElementById('menu').style.display = 'none';
  document.getElementById('hud').style.display = 'block';
};

var speedEl = document.getElementById('speed');

function update(dt) {
  if (!started || paused) return;

  var throttle = keys['w'] ? 1 : 0;
  var brake = keys['s'] ? 1 : 0;
  var steer = (keys['a'] ? 1 : 0) - (keys['d'] ? 1 : 0);
  var nitro = keys['shift'] && P.nitro > 0 && !P.airborne;

  if (throttle) P.speed += (nitro ? 45 : 28) * dt;
  if (brake) P.speed -= 38 * dt;
  if (!throttle && !brake) {
    var fr = 6 * dt;
    P.speed -= Math.sign(P.speed) * Math.min(Math.abs(P.speed), fr);
  }
  if (nitro) P.nitro = Math.max(0, P.nitro - 24 * dt);
  else P.nitro = Math.min(100, P.nitro + 4 * dt);
  P.speed = Math.max(-22, Math.min(nitro ? 80 : 60, P.speed));

  if (!P.airborne) {
    var grip = Math.min(Math.abs(P.speed) / 18, 1);
    P.heading += steer * dt * 2.1 * grip * Math.sign(P.speed || 1);
  } else {
    P.heading += steer * dt * 1.1;
  }

  var vx = -Math.sin(P.heading) * P.speed;
  var vz = -Math.cos(P.heading) * P.speed;
  var nx = P.x + vx * dt;
  var nz = P.z + vz * dt;

  var hit = rampAt(nx, nz);
  var blocked = false;
  if (hit) {
    var surf = ((hit.lz + hit.ramp.d / 2) / hit.ramp.d) * hit.ramp.h;
    if (!P.airborne && surf > P.y + 1.2) blocked = true;
  }
  if (blocked) {
    P.speed *= -0.25;
  } else {
    P.x = nx;
    P.z = nz;
  }

  var bx = WORLD_HALF - 10;
  if (P.x < -bx) { P.x = -bx; P.speed *= 0.6; }
  if (P.x > bx) { P.x = bx; P.speed *= 0.6; }
  if (P.z < -bx) { P.z = -bx; P.speed *= 0.6; }
  if (P.z > bx) { P.z = bx; P.speed *= 0.6; }

  var here = rampAt(P.x, P.z);
  var rampSurf = 0, rampSlope = 0, rampAx = 0, rampAz = 0;
  if (here) {
    rampSurf = ((here.lz + here.ramp.d / 2) / here.ramp.d) * here.ramp.h;
    rampSlope = here.ramp._slope;
    rampAx = here.ramp._ax;
    rampAz = here.ramp._az;
  }
  var gh = groundHeight(P.x, P.z);

  if (P.airborne) {
    P.vy -= 26 * dt;
    P.y += P.vy * dt;
    P.airTime += dt;
    if (P.y <= gh) {
      P.y = gh;
      P.vy = 0;
      P.airborne = false;
      P.airTime = 0;
    }
  } else {
    if (gh < P.y - 0.15) {
      P.airborne = true;
      P.airTime = 0;
      if (rampSurf > 0) {
        var along = vx * rampAx + vz * rampAz;
        P.vy = Math.max(-3, Math.min(14, rampSlope * along));
      } else {
        P.vy = 0;
      }
    } else {
      P.y = gh;
      if (rampSurf > 0) {
        var along2 = vx * rampAx + vz * rampAz;
        P.vy = Math.max(-3, Math.min(14, rampSlope * along2));
      } else {
        P.vy = 0;
      }
    }
  }

  player.position.set(P.x, P.y, P.z);
  player.rotation.y = P.heading;
  for (var i = 0; i < player.userData.wheels.length; i++) {
    player.userData.wheels[i].rotation.x -= P.speed * dt * 1.9;
  }
  speedEl.childNodes[0].nodeValue = Math.round(Math.abs(P.speed) * 3.6);
}

var camTarget = new THREE.Vector3();
function updateCamera(dt) {
  var lx, ly, lz;
  if (camMode === 0) {
    camTarget.set(P.x + Math.sin(P.heading) * 11, P.y + 5.5, P.z + Math.cos(P.heading) * 11);
    lx = P.x; ly = P.y + 1.3; lz = P.z;
  } else if (camMode === 1) {
    camTarget.set(P.x - Math.sin(P.heading) * 0.4, P.y + 1.55, P.z - Math.cos(P.heading) * 0.4);
    lx = P.x - Math.sin(P.heading) * 14;
    ly = P.y + 1.1;
    lz = P.z - Math.cos(P.heading) * 14;
  } else {
    camTarget.set(P.x, P.y + 45, P.z + 0.5);
    lx = P.x; ly = P.y; lz = P.z;
  }
  var k = 1 - Math.pow(0.0015, dt);
  camera.position.lerp(camTarget, k);
  camera.lookAt(lx, ly, lz);
  sun.position.set(P.x + 80, 150, P.z + 60);
  sun.target.position.set(P.x, 0, P.z);
  sun.target.updateMatrixWorld();
}

var last = performance.now();
function loop(now) {
  var dt = Math.min(0.034, (now - last) / 1000);
  last = now;
  update(dt);
  updateCamera(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);