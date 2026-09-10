var scene = new THREE.Scene();
scene.background = new THREE.Color(0x87b8e8);
scene.fog = new THREE.Fog(0x87b8e8, 140, 480);

var camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 1200);

var renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;

scene.add(new THREE.HemisphereLight(0x88bbee, 0x2a2a30, 1.2));

var sun = new THREE.DirectionalLight(0xffffff, 2.5);
sun.position.set(80, 150, 60);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -250;
sun.shadow.camera.right = 250;
sun.shadow.camera.top = 250;
sun.shadow.camera.bottom = -250;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 700;
scene.add(sun);
scene.add(sun.target);

var ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1200, 1200),
  new THREE.MeshStandardMaterial({ color: 0x2a2a30, roughness: 0.95 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

var asphaltMat = new THREE.MeshStandardMaterial({ color: 0x222226, roughness: 0.9 });
for (var i = 0; i < STREETS.length; i++) {
  var s = STREETS[i];
  var m1 = new THREE.Mesh(new THREE.PlaneGeometry(16, 700), asphaltMat);
  m1.rotation.x = -Math.PI / 2;
  m1.position.set(s, 0.02, 0);
  m1.receiveShadow = true;
  scene.add(m1);
  var m2 = new THREE.Mesh(new THREE.PlaneGeometry(700, 16), asphaltMat);
  m2.rotation.x = -Math.PI / 2;
  m2.position.set(0, 0.02, s);
  m2.receiveShadow = true;
  scene.add(m2);
}

var colors = [0x2a3a5a, 0x3a2a4a, 0x2a4a3a, 0x4a3a2a, 0x2a2a4a, 0x3a3a5a, 0x1e2a40, 0x302838];
var seed = 1337;
function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }

for (var b = 0; b < 120; b++) {
  var x = (rnd() * 2 - 1) * 300;
  var z = (rnd() * 2 - 1) * 300;
  var skip = false;
  for (var k = 0; k < STREETS.length; k++) {
    if (Math.abs(x - STREETS[k]) < 14 || Math.abs(z - STREETS[k]) < 14) { skip = true; break; }
  }
  if (skip) continue;
  for (var q = 0; q < RAMPS.length; q++) {
    if (Math.hypot(x - RAMPS[q].x, z - RAMPS[q].z) < 40) { skip = true; break; }
  }
  if (skip) continue;

  var w = 12 + rnd() * 16;
  var d = 12 + rnd() * 16;
  var h = 15 + rnd() * 60;
  var box = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color: colors[b % colors.length], roughness: 0.85, metalness: 0.1 })
  );
  box.position.set(x, h / 2, z);
  box.castShadow = true;
  box.receiveShadow = true;
  scene.add(box);
}

var rampMat = new THREE.MeshStandardMaterial({ color: 0x4a4e58, roughness: 0.7, metalness: 0.3 });
var railMat = new THREE.MeshStandardMaterial({ color: 0xff3b30, emissive: 0xff3b30, emissiveIntensity: 0.6 });
for (var ri = 0; ri < RAMPS.length; ri++) {
  var r = RAMPS[ri];
  var grp = new THREE.Group();
  grp.position.set(r.x, 0, r.z);
  grp.rotation.y = r.rot;
  var ang = Math.atan2(r.h, r.d);
  var len = Math.hypot(r.h, r.d);
  var plate = new THREE.Mesh(new THREE.BoxGeometry(r.w, 0.5, len), rampMat);
  plate.rotation.x = -ang;
  plate.position.y = r.h / 2;
  plate.castShadow = true;
  grp.add(plate);
  var rl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, len), railMat);
  rl.rotation.x = -ang;
  rl.position.set(-r.w / 2, r.h / 2 + 0.4, 0);
  grp.add(rl);
  var rr = rl.clone();
  rr.position.x = r.w / 2;
  grp.add(rr);
  scene.add(grp);
}

function rampAt(x, z) {
  for (var i = 0; i < RAMPS.length; i++) {
    var r = RAMPS[i];
    var dx = x - r.x;
    var dz = z - r.z;
    var lx = r._c * dx - r._s * dz;
    var lz = r._s * dx + r._c * dz;
    if (Math.abs(lx) <= r.w / 2 && Math.abs(lz) <= r.d / 2) {
      return { ramp: r, lx: lx, lz: lz };
    }
  }
  return null;
}

function groundHeight(x, z) {
  var h = rampAt(x, z);
  if (!h) return 0;
  return ((h.lz + h.ramp.d / 2) / h.ramp.d) * h.ramp.h;
}

window.addEventListener('resize', function () {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});