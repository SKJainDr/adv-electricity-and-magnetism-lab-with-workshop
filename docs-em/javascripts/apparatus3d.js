/* ============================================================================
   3-D Apparatus Viewer — Advanced Electricity & Magnetism Learning Lab
   A lightweight, reusable Three.js "lab bench" schematic renderer.
   Renders a simplified 3-D layout of the apparatus for each experiment so
   students can see how the components are physically arranged in space,
   complementing the 2-D graphs/animations in the interactive simulator.
   ============================================================================ */
(function () {
  "use strict";

  var COLORS = {
    bench: 0x0b173a,
    benchTop: 0x142b66,
    grid: 0x33529e,
    positive: 0xa8452f,
    negative: 0x2e6ea8,
    neutral: 0x8a94a6,
    coil: 0xc9a227,
    coilCore: 0x334155,
    plateMetal: 0x9fb0c4,
    magnetN: 0xa8452f,
    magnetS: 0x2e6ea8,
    wire: 0xc9a227,
    dielectric: 0xbfe3ff,
    screen: 0x1a2e26,
    trace: 0x5ae68c,
    gold: 0xc9a227,
    label: 0x0b173a
  };

  function makeLabelSprite(text) {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    var fontSize = 40;
    ctx.font = "bold " + fontSize + "px Inter, Helvetica, sans-serif";
    var metrics = ctx.measureText(text);
    var padX = 22, padY = 14;
    canvas.width = Math.ceil(metrics.width) + padX * 2;
    canvas.height = fontSize + padY * 2;
    ctx.font = "bold " + fontSize + "px Inter, Helvetica, sans-serif";
    ctx.fillStyle = "rgba(11,23,58,0.92)";
    roundRect(ctx, 0, 0, canvas.width, canvas.height, 12);
    ctx.fill();
    ctx.strokeStyle = "#C9A227";
    ctx.lineWidth = 3;
    roundRect(ctx, 1.5, 1.5, canvas.width - 3, canvas.height - 3, 12);
    ctx.stroke();
    ctx.fillStyle = "#FFFFFF";
    ctx.textBaseline = "middle";
    ctx.fillText(text, padX, canvas.height / 2 + 2);

    var texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    var material = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
    var sprite = new THREE.Sprite(material);
    var scale = 0.011;
    sprite.scale.set(canvas.width * scale, canvas.height * scale, 1);
    sprite.renderOrder = 999;
    return sprite;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function group(x, z) {
    var g = new THREE.Group();
    g.position.set(x, 0, z || 0);
    return g;
  }

  function addLabel(g, text, height) {
    var s = makeLabelSprite(text);
    s.position.set(0, height || 2.1, 0);
    g.add(s);
  }

  /* ---- component builders ---- */
  /* Each builder takes an item {x, z, label, ...props} and returns a THREE.Group */

  function buildSphereCharge(item) {
    var g = group(item.x);
    var sign = item.charge >= 0 ? 1 : -1;
    var mat = new THREE.MeshStandardMaterial({ color: sign > 0 ? COLORS.positive : COLORS.negative, metalness: 0.35, roughness: 0.4 });
    var sphere = new THREE.Mesh(new THREE.SphereGeometry(item.radius || 0.32, 24, 18), mat);
    sphere.position.y = 0.85;
    g.add(sphere);
    var stand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.85, 8), new THREE.MeshStandardMaterial({ color: COLORS.neutral }));
    stand.position.y = 0.42;
    g.add(stand);
    var base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 16), new THREE.MeshStandardMaterial({ color: COLORS.bench }));
    base.position.y = 0.03;
    g.add(base);
    addLabel(g, item.label + (item.charge ? (item.charge > 0 ? " (+)" : " (\u2212)") : ""), 1.5);
    return g;
  }

  function buildPlate(item) {
    var g = group(item.x);
    var mat = new THREE.MeshStandardMaterial({
      color: item.charge > 0 ? COLORS.positive : (item.charge < 0 ? COLORS.negative : COLORS.plateMetal),
      metalness: 0.4, roughness: 0.4
    });
    var plate = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.4, 1.4), mat);
    plate.position.y = 0.85;
    g.add(plate);
    var stand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.85, 8), new THREE.MeshStandardMaterial({ color: COLORS.neutral }));
    stand.position.y = 0.42;
    g.add(stand);
    addLabel(g, item.label, 1.9);
    return g;
  }

  function buildDielectricSlab(item) {
    var g = group(item.x);
    var mat = new THREE.MeshStandardMaterial({ color: COLORS.dielectric, transparent: true, opacity: 0.55, metalness: 0.1, roughness: 0.2 });
    var slab = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.1, 1.1), mat);
    slab.position.y = 0.85;
    g.add(slab);
    addLabel(g, item.label, 1.65);
    return g;
  }

  function buildCoil(item) {
    var g = group(item.x);
    var turns = item.turns || 10;
    var radius = item.radius || 0.55;
    var length = item.length || 1.4;
    var core = new THREE.Mesh(
      new THREE.CylinderGeometry(item.coreRadius || radius * 0.55, item.coreRadius || radius * 0.55, length, 20),
      new THREE.MeshStandardMaterial({ color: COLORS.coilCore, roughness: 0.6 })
    );
    core.rotation.z = Math.PI / 2;
    core.position.y = 0.85;
    g.add(core);
    var windMat = new THREE.MeshStandardMaterial({ color: COLORS.coil, metalness: 0.6, roughness: 0.3 });
    for (var i = 0; i < turns; i++) {
      var ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.035, 8, 24), windMat);
      ring.rotation.y = Math.PI / 2;
      ring.position.set(-length / 2 + (i + 0.5) * (length / turns), 0.85, 0);
      g.add(ring);
    }
    addLabel(g, item.label, 1.85);
    return g;
  }

  function buildToroid(item) {
    var g = group(item.x);
    var R = item.R || 0.65, r = item.r || 0.22;
    var core = new THREE.Mesh(new THREE.TorusGeometry(R, r, 14, 30), new THREE.MeshStandardMaterial({ color: COLORS.coilCore, roughness: 0.6 }));
    core.position.y = 0.9;
    g.add(core);
    var windMat = new THREE.MeshStandardMaterial({ color: COLORS.coil, metalness: 0.6, roughness: 0.3 });
    var n = 16;
    for (var i = 0; i < n; i++) {
      var ang = (i / n) * Math.PI * 2;
      var ring = new THREE.Mesh(new THREE.TorusGeometry(r * 1.35, 0.025, 6, 14), windMat);
      ring.position.set(Math.cos(ang) * R, 0.9 + Math.sin(ang) * R * 0, 0);
      ring.position.x = Math.cos(ang) * R;
      ring.position.z = Math.sin(ang) * R;
      ring.position.y = 0.9;
      ring.rotation.y = ang;
      ring.rotation.x = Math.PI / 2;
      g.add(ring);
    }
    addLabel(g, item.label, 1.75);
    return g;
  }

  function buildWireStraight(item) {
    var g = group(item.x);
    var h = item.height || 1.9;
    var wire = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, h, 12), new THREE.MeshStandardMaterial({ color: COLORS.wire, metalness: 0.7, roughness: 0.25 }));
    wire.position.y = h / 2 + 0.05;
    g.add(wire);
    if (item.arrow !== false) {
      var arrow = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 10), new THREE.MeshStandardMaterial({ color: COLORS.wire }));
      arrow.position.y = h * 0.78;
      g.add(arrow);
    }
    if (item.rings) {
      var ringMat = new THREE.MeshBasicMaterial({ color: 0x88a2d6, transparent: true, opacity: 0.55 });
      [0.5, 0.85, 1.2].forEach(function (rr) {
        var ring = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.012, 6, 32), ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = h * 0.55;
        g.add(ring);
      });
    }
    addLabel(g, item.label, h + 0.35);
    return g;
  }

  function buildBattery(item) {
    var g = group(item.x);
    var body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.75), new THREE.MeshStandardMaterial({ color: 0x2b3550, metalness: 0.3, roughness: 0.5 }));
    body.position.y = 0.5;
    g.add(body);
    var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.18, 12), new THREE.MeshStandardMaterial({ color: COLORS.gold, metalness: 0.7 }));
    cap.position.set(0, 0.86, 0);
    g.add(cap);
    addLabel(g, item.label, 1.3);
    return g;
  }

  function buildResistor(item) {
    var g = group(item.x);
    var body = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.7, 14), new THREE.MeshStandardMaterial({ color: 0xd9c08a, roughness: 0.5 }));
    body.rotation.z = Math.PI / 2;
    body.position.y = 0.85;
    g.add(body);
    [-0.18, 0, 0.18].forEach(function (off) {
      var band = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.145, 0.05, 14), new THREE.MeshStandardMaterial({ color: 0x334155 }));
      band.rotation.z = Math.PI / 2;
      band.position.set(off, 0.85, 0);
      g.add(band);
    });
    addLabel(g, item.label, 1.3);
    return g;
  }

  function buildMeter(item) {
    var g = group(item.x);
    var dial = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.14, 28), new THREE.MeshStandardMaterial({ color: 0xf4f1e9, roughness: 0.4 }));
    dial.rotation.x = Math.PI / 2;
    dial.position.y = 0.95;
    g.add(dial);
    var rim = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.035, 10, 28), new THREE.MeshStandardMaterial({ color: COLORS.bench }));
    rim.position.y = 0.95;
    g.add(rim);
    var needleSprite = makeLabelSprite(item.symbol || "M");
    needleSprite.position.set(0, 0.95, 0.08);
    needleSprite.scale.multiplyScalar(0.55);
    g.add(needleSprite);
    var stand = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.3), new THREE.MeshStandardMaterial({ color: COLORS.bench }));
    stand.position.y = 0.45;
    g.add(stand);
    addLabel(g, item.label, 1.55);
    return g;
  }

  function buildBarMagnet(item) {
    var g = group(item.x);
    var n = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.35), new THREE.MeshStandardMaterial({ color: COLORS.magnetN, roughness: 0.4 }));
    n.position.set(-0.28, 0.7, 0);
    g.add(n);
    var s = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.35), new THREE.MeshStandardMaterial({ color: COLORS.magnetS, roughness: 0.4 }));
    s.position.set(0.28, 0.7, 0);
    g.add(s);
    addLabel(g, item.label, 1.25);
    return g;
  }

  function buildRailsRod(item) {
    var g = group(item.x);
    var railMat = new THREE.MeshStandardMaterial({ color: COLORS.neutral, metalness: 0.6, roughness: 0.35 });
    var len = item.length || 3.2, gap = item.gap || 1.2;
    [gap / 2, -gap / 2].forEach(function (zz) {
      var rail = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, len, 10), railMat);
      rail.rotation.z = Math.PI / 2;
      rail.position.set(0, 0.5, zz);
      g.add(rail);
    });
    var rod = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, gap, 10), new THREE.MeshStandardMaterial({ color: COLORS.gold, metalness: 0.7, roughness: 0.25 }));
    rod.rotation.x = Math.PI / 2;
    rod.position.set(item.rodOffset || 0, 0.5, 0);
    g.add(rod);
    addLabel(g, item.label, 1.05);
    return g;
  }

  function buildCRO(item) {
    var g = group(item.x);
    var box = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 0.9), new THREE.MeshStandardMaterial({ color: 0x2b3550, roughness: 0.5 }));
    box.position.y = 0.7;
    g.add(box);
    var scr = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), new THREE.MeshBasicMaterial({ color: COLORS.screen }));
    scr.position.set(0.56, 0.72, 0);
    scr.rotation.y = Math.PI / 2;
    g.add(scr);
    var traceMat = new THREE.LineBasicMaterial({ color: COLORS.trace });
    var pts = [];
    for (var i = 0; i <= 40; i++) {
      var t = i / 40;
      pts.push(new THREE.Vector3(0.565, 0.72 + 0.22 * Math.sin(t * Math.PI * 4), -0.35 + t * 0.7));
    }
    var traceGeo = new THREE.BufferGeometry().setFromPoints(pts);
    g.add(new THREE.Line(traceGeo, traceMat));
    addLabel(g, item.label, 1.3);
    return g;
  }

  function buildAntenna(item) {
    var g = group(item.x);
    var rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 10), new THREE.MeshStandardMaterial({ color: COLORS.wire, metalness: 0.6 }));
    rod.position.y = 0.9;
    g.add(rod);
    var mat = new THREE.LineBasicMaterial({ color: COLORS.positive });
    var pts = [];
    for (var i = 0; i <= 60; i++) {
      var t = i / 60;
      pts.push(new THREE.Vector3(0.4 + t * 2.6, 0.9 + 0.35 * Math.sin(t * Math.PI * 5), 0));
    }
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
    var mat2 = new THREE.LineBasicMaterial({ color: COLORS.negative });
    var pts2 = [];
    for (var j = 0; j <= 60; j++) {
      var t2 = j / 60;
      pts2.push(new THREE.Vector3(0.4 + t2 * 2.6, 0.9, 0.35 * Math.sin(t2 * Math.PI * 5)));
    }
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts2), mat2));
    addLabel(g, item.label, 1.55);
    return g;
  }

  function buildProbe(item) {
    var g = group(item.x);
    var tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 12), new THREE.MeshStandardMaterial({ color: COLORS.gold, metalness: 0.6 }));
    tip.rotation.x = Math.PI;
    tip.position.y = 0.85;
    g.add(tip);
    var stick = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8), new THREE.MeshStandardMaterial({ color: COLORS.neutral }));
    stick.position.y = 0.4;
    g.add(stick);
    addLabel(g, item.label, 1.35);
    return g;
  }

  function buildSwitch(item) {
    var g = group(item.x);
    var base = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.3), new THREE.MeshStandardMaterial({ color: COLORS.bench }));
    base.position.y = 0.45;
    g.add(base);
    var lever = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), new THREE.MeshStandardMaterial({ color: COLORS.wire, metalness: 0.6 }));
    lever.position.set(0, 0.7, 0);
    lever.rotation.z = Math.PI / 6;
    g.add(lever);
    addLabel(g, item.label, 1.05);
    return g;
  }

  var BUILDERS = {
    sphereCharge: buildSphereCharge,
    plate: buildPlate,
    dielectricSlab: buildDielectricSlab,
    coil: buildCoil,
    toroid: buildToroid,
    wireStraight: buildWireStraight,
    battery: buildBattery,
    resistor: buildResistor,
    meter: buildMeter,
    barMagnet: buildBarMagnet,
    railsRod: buildRailsRod,
    cro: buildCRO,
    antenna: buildAntenna,
    probe: buildProbe,
    switch: buildSwitch
  };

  /* ---- per-experiment layouts ---- */
  var CONFIGS = {
    "coulombs-law": [
      { type: "sphereCharge", x: -1.6, label: "Ball A (fixed)", charge: 1 },
      { type: "sphereCharge", x: 1.6, label: "Ball B (movable)", charge: -1 }
    ],
    "gauss-law-flux": [
      { type: "sphereCharge", x: 0, label: "Enclosed charge q", charge: 1, radius: 0.24 },
      { type: "probe", x: 2.3, label: "Flux probe on surface" }
    ],
    "dipole-field-potential": [
      { type: "sphereCharge", x: -0.45, label: "+q", charge: 1, radius: 0.22 },
      { type: "sphereCharge", x: 0.45, label: "\u2212q", charge: -1, radius: 0.22 },
      { type: "probe", x: 2.4, label: "Field / potential probe P" }
    ],
    "conductors-charge-distribution": [
      { type: "sphereCharge", x: -1.8, label: "Charged conductor", charge: 1, radius: 0.55 },
      { type: "probe", x: 0.2, label: "Proof-plane probe" },
      { type: "battery", x: 2.2, label: "Van de Graaff drive belt" }
    ],
    "parallel-plate-capacitor": [
      { type: "battery", x: -2.7, label: "Supply V" },
      { type: "plate", x: -0.6, label: "Plate +Q", charge: 1 },
      { type: "dielectricSlab", x: 0.35, label: "Dielectric slab" },
      { type: "plate", x: 1.2, label: "Plate \u2212Q", charge: -1 }
    ],
    "dielectric-polarization-clausius-mossotti": [
      { type: "plate", x: -1, label: "Plate +", charge: 1 },
      { type: "dielectricSlab", x: 0, label: "Dielectric (polarised)" },
      { type: "plate", x: 1, label: "Plate \u2212", charge: -1 }
    ],
    "biot-savart-wire": [
      { type: "wireStraight", x: 0, label: "Current-carrying wire, I", height: 2.3, rings: true },
      { type: "probe", x: 1.7, label: "B-field probe at r" }
    ],
    "ampere-law-solenoid-toroid": [
      { type: "coil", x: -1.7, label: "Solenoid", turns: 12, radius: 0.5, length: 1.9 },
      { type: "toroid", x: 1.7, label: "Toroid", R: 0.62, r: 0.22 }
    ],
    "circular-coil-helmholtz": [
      { type: "coil", x: -1.1, label: "Coil 1", turns: 8, radius: 0.55, length: 0.22 },
      { type: "coil", x: 1.1, label: "Coil 2 (Helmholtz pair)", turns: 8, radius: 0.55, length: 0.22 },
      { type: "probe", x: 0, label: "Axial field probe" }
    ],
    "force-parallel-conductors": [
      { type: "wireStraight", x: -0.85, label: "Wire 1, I\u2081", height: 2.2 },
      { type: "wireStraight", x: 0.85, label: "Wire 2, I\u2082", height: 2.2 }
    ],
    "magnetic-hysteresis-bh-curve": [
      { type: "toroid", x: -1.4, label: "Ferromagnetic core", R: 0.6, r: 0.26 },
      { type: "cro", x: 1.7, label: "CRO \u2014 B\u2013H plotter" }
    ],
    "faraday-induction": [
      { type: "barMagnet", x: -1.9, label: "Bar magnet (moved by hand)" },
      { type: "coil", x: 0.3, label: "Coil (N turns)", turns: 10, radius: 0.5, length: 1.2 },
      { type: "meter", x: 2.3, label: "Galvanometer", symbol: "G" }
    ],
    "motional-emf-lenz": [
      { type: "meter", x: -2.3, label: "Galvanometer", symbol: "G" },
      { type: "railsRod", x: 0.1, label: "Rails & sliding rod", length: 3.4, gap: 1.3 }
    ],
    "rc-rl-transients": [
      { type: "battery", x: -2.7, label: "DC supply V" },
      { type: "switch", x: -1.8, label: "Switch" },
      { type: "resistor", x: -0.9, label: "Resistor R" },
      { type: "plate", x: 0.1, label: "C+", charge: 1 },
      { type: "plate", x: 0.4, label: "C\u2212", charge: -1 },
      { type: "coil", x: 1.7, label: "Inductor L (RL circuit)", turns: 8, radius: 0.4, length: 1 }
    ],
    "lcr-resonance": [
      { type: "battery", x: -2.6, label: "AC signal source" },
      { type: "resistor", x: -1.3, label: "R" },
      { type: "coil", x: -0.1, label: "L", turns: 8, radius: 0.4, length: 0.9 },
      { type: "plate", x: 0.9, label: "C+", charge: 1 },
      { type: "plate", x: 1.2, label: "C\u2212", charge: -1 },
      { type: "meter", x: 2.5, label: "Ammeter", symbol: "A" }
    ],
    "maxwell-plane-waves": [
      { type: "antenna", x: -1.2, label: "Oscillating dipole antenna" },
      { type: "probe", x: 2.3, label: "Field probe (E, B)" }
    ],
    "reflection-refraction-brewster": [
      { type: "antenna", x: -2.2, label: "EM wave source" },
      { type: "dielectricSlab", x: 0.6, label: "Dielectric medium n\u2082" },
      { type: "probe", x: 2.5, label: "Reflected/refracted detector" }
    ],
    "wave-propagation-media-skindepth": [
      { type: "antenna", x: -2.2, label: "EM wave source" },
      { type: "dielectricSlab", x: 0.8, label: "Conducting medium (skin depth \u03b4)" },
      { type: "probe", x: 2.7, label: "Amplitude probe" }
    ],
    "image-charge-grounded-plane": [
      { type: "sphereCharge", x: -0.5, label: "Real charge +q", charge: 1 },
      { type: "plate", x: 1.3, label: "Grounded conducting plane", charge: 0 }
    ],
    "multipole-expansion-quadrupole": [
      { type: "sphereCharge", x: -1.3, label: "+q", charge: 1, radius: 0.2 },
      { type: "sphereCharge", x: 0, label: "\u22122q", charge: -1, radius: 0.28 },
      { type: "sphereCharge", x: 1.3, label: "+q", charge: 1, radius: 0.2 },
      { type: "probe", x: 3, label: "Field point P (on axis)" }
    ],
    "magnetic-vector-potential-dipole": [
      { type: "coil", x: 0, label: "Current loop, I", turns: 10, radius: 0.55, length: 0.18 },
      { type: "probe", x: 2.6, label: "Field point (r, \u03b8)" }
    ],
    "cyclotron-velocity-selector": [
      { type: "plate", x: -1.6, label: "+ deflection plate", charge: 1 },
      { type: "plate", x: -0.7, label: "\u2212 deflection plate", charge: -1 },
      { type: "probe", x: 1.8, label: "Selected beam \u2192 cyclotron orbit" }
    ],
    "hall-effect-carrier-density": [
      { type: "battery", x: -2.4, label: "Current source" },
      { type: "plate", x: -0.4, label: "Sample slab", charge: 0 },
      { type: "meter", x: 1.5, label: "Hall voltmeter", symbol: "V" }
    ],
    "meissner-effect-flux-expulsion": [
      { type: "barMagnet", x: -2.1, label: "Applied field source" },
      { type: "dielectricSlab", x: 0.3, label: "Superconductor (T < T_c)" }
    ],
    "eddy-current-damping": [
      { type: "plate", x: -0.3, label: "Conducting plate (moving)", charge: 0 },
      { type: "barMagnet", x: 1.5, label: "Localised field magnet" }
    ],
    "rlc-filter-response": [
      { type: "battery", x: -2.6, label: "AC source" },
      { type: "resistor", x: -1.3, label: "R" },
      { type: "coil", x: -0.1, label: "L", turns: 8, radius: 0.4, length: 0.9 },
      { type: "plate", x: 0.9, label: "C+", charge: 1 },
      { type: "plate", x: 1.2, label: "C\u2212", charge: -1 },
      { type: "meter", x: 2.5, label: "V_out", symbol: "V" }
    ],
    "poynting-vector-coaxial-cable": [
      { type: "wireStraight", x: 0, label: "Inner conductor", height: 1.9, rings: true },
      { type: "probe", x: 1.9, label: "S = E \u00d7 H probe" }
    ],
    "waveguide-cutoff-frequency": [
      { type: "antenna", x: -2.2, label: "Source" },
      { type: "dielectricSlab", x: 0.2, label: "Waveguide interior (a)" },
      { type: "probe", x: 2.2, label: "Propagating / evanescent probe" }
    ],
    "transmission-line-impedance-vswr": [
      { type: "railsRod", x: -0.2, label: "Transmission line, Z\u2080", length: 3, gap: 0.45 },
      { type: "plate", x: 1.7, label: "Load Z_L", charge: 0 }
    ],
    "faraday-cage-shielding-effectiveness": [
      { type: "antenna", x: -2.4, label: "External field source" },
      { type: "dielectricSlab", x: 0.2, label: "Conducting enclosure wall" },
      { type: "probe", x: 0.9, label: "Interior probe (\u2248 0)" }
    ]
  };

  function buildBench(scene, minX, maxX) {
    var len = maxX - minX + 2;
    var bench = new THREE.Mesh(
      new THREE.BoxGeometry(len, 0.12, 2.4),
      new THREE.MeshStandardMaterial({ color: COLORS.bench, metalness: 0.3, roughness: 0.7 })
    );
    bench.position.set((minX + maxX) / 2, -0.06, 0);
    scene.add(bench);

    var grid = new THREE.GridHelper(Math.max(len, 4), 12, COLORS.grid, COLORS.grid);
    grid.position.set((minX + maxX) / 2, 0.01, 0);
    grid.material.opacity = 0.35;
    grid.material.transparent = true;
    scene.add(grid);
  }

  function initOne(container) {
    var setupKey = container.getAttribute("data-setup");
    var config = CONFIGS[setupKey];
    if (!config || typeof THREE === "undefined") return;

    var width = container.clientWidth || 600;
    var height = container.clientHeight || 300;

    var scene = new THREE.Scene();
    scene.background = null;

    var camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(2, 4.2, 9.5);

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    var ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    var dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(4, 8, 6);
    scene.add(dir);
    var dir2 = new THREE.DirectionalLight(0x6699ff, 0.3);
    dir2.position.set(-4, 3, -6);
    scene.add(dir2);

    var xs = config.map(function (c) { return c.x; });
    buildBench(scene, Math.min.apply(null, xs), Math.max.apply(null, xs));

    config.forEach(function (item) {
      var builder = BUILDERS[item.type];
      if (!builder) return;
      var mesh = builder(item);
      mesh.position.z = item.z || 0;
      scene.add(mesh);
    });

    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 4;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.target.set((Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, 0.6, 0);
    controls.update();

    var frameId;
    function animate() {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      var w = container.clientWidth || width;
      var h = container.clientHeight || height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    container._apparatus3dCleanup = function () {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
    };
  }

  function initAll() {
    var containers = document.querySelectorAll(".apparatus-3d[data-setup]");
    containers.forEach(function (c) {
      if (c._apparatus3dCleanup) { c._apparatus3dCleanup(); }
      initOne(c);
    });
  }

  window.__EM_APPARATUS_CONFIGS__ = CONFIGS;

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(initAll, 30);
  } else {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(initAll, 30); });
  }
  if (window.document$ && window.document$.subscribe) {
    window.document$.subscribe(function () { setTimeout(initAll, 30); });
  }
})();
