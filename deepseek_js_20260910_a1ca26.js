var STREETS = [-132, -44, 44, 132];
var WORLD_HALF = 300;
var RAMPS = [
  { x: 0, z: -100, rot: Math.PI/2, w: 14, d: 40, h: 6 },
  { x: 0, z: 100, rot: -Math.PI/2, w: 14, d: 40, h: 6 },
  { x: -100, z: 0, rot: 0, w: 14, d: 40, h: 6 },
  { x: 100, z: 0, rot: Math.PI, w: 14, d: 40, h: 6 },
  { x: -176, z: -176, rot: Math.PI/4, w: 12, d: 36, h: 5 },
  { x: 176, z: 176, rot: -3*Math.PI/4, w: 12, d: 36, h: 5 },
  { x: -176, z: 176, rot: 3*Math.PI/4, w: 12, d: 36, h: 5 },
  { x: 176, z: -176, rot: -Math.PI/4, w: 12, d: 36, h: 5 }
];
for (var i = 0; i < RAMPS.length; i++) {
  var r = RAMPS[i];
  r._c = Math.cos(r.rot);
  r._s = Math.sin(r.rot);
  r._slope = r.h / r.d;
  r._ax = Math.sin(r.rot);
  r._az = Math.cos(r.rot);
}