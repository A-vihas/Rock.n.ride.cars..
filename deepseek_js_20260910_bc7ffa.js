function makeCar(color) {
  var g = new THREE.Group();
  var bodyMat = new THREE.MeshStandardMaterial({ color: color, metalness: 0.9, roughness: 0.25 });
  var darkMat = new THREE.MeshStandardMaterial({ color: 0x0a0e14, roughness: 0.5 });
  var glassMat = new THREE.MeshStandardMaterial({ color: 0x84c9ff, transparent: true, opacity: 0.7, metalness: 0.4, roughness: 0.1 });
  var chromeMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 1, roughness: 0.15 });

  var chassis = new THREE.Mesh(new THREE.BoxGeometry(2, 0.55, 4.5), bodyMat);
  chassis.position.y = 0.72;
  chassis.castShadow = true;
  g.add(chassis);

  var hood = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.18, 1.5), bodyMat);
  hood.position.set(0, 1.0, -1.5);
  hood.castShadow = true;
  g.add(hood);

  var cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.55, 1.9), glassMat);
  cabin.position.set(0, 1.3, 0.15);
  cabin.castShadow = true;
  g.add(cabin);

  var wheels = [];
  var wGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
  var rGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.32, 12);
  var xs = [-1, 1], zs = [-1.4, 1.4];
  for (var a = 0; a < xs.length; a++) {
    for (var b = 0; b < zs.length; b++) {
      var w = new THREE.Mesh(wGeo, darkMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(xs[a], 0.42, zs[b]);
      w.castShadow = true;
      g.add(w);
      var rim = new THREE.Mesh(rGeo, chromeMat);
      rim.rotation.z = Math.PI / 2;
      rim.position.set(xs[a], 0.42, zs[b]);
      g.add(rim);
      wheels.push(w);
    }
  }

  var headMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  var tailMat = new THREE.MeshBasicMaterial({ color: 0xff2a2a });
  var lx = [-0.7, 0.7];
  for (var c = 0; c < lx.length; c++) {
    var h = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.06), headMat);
    h.position.set(lx[c], 0.85, -2.26);
    g.add(h);
    var t = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.06), tailMat);
    t.position.set(lx[c], 0.85, 2.26);
    g.add(t);
  }

  g.userData.wheels = wheels;
  return g;
}