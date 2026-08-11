/**
 * globe.js
 * A stylised, artistic 3D globe — not a scientific visualisation.
 * Renders into any <canvas>, exposes focusOn() / showRoute() / dispose().
 */

class WanderGlobe {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.opts = Object.assign(
      {
        markers: [],
        interactive: true,
        autoRotate: true,
      },
      opts
    );

    this.radius = 1;
    this.markerMeshes = [];
    this.routeGroup = null;
    this.pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.destRotation = null;

    this._initScene();
    this._buildGlobe();
    this._buildMarkers();
    this._bindEvents();
    this._resize();
    this._tick = this._tick.bind(this);
    this.raf = requestAnimationFrame(this._tick);
  }

  _initScene() {
    const THREE = window.THREE;
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    this.camera.position.set(0, 0, 4.4);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // Soft key + fill light, no scientific-looking hard shadows.
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(3, 2, 4);
    this.scene.add(key);
    const fill = new THREE.AmbientLight(0x8fb4c2, 0.65);
    this.scene.add(fill);

    this.group = new THREE.Group();
    this.scene.add(this.group);
  }

  _buildGlobe() {
    const THREE = window.THREE;

    // Base sphere — deep ink with a faint ocean-blue sheen.
    const geo = new THREE.SphereGeometry(this.radius, 64, 64);
    const mat = new THREE.MeshPhongMaterial({
      color: 0x14181b,
      emissive: 0x0d2a33,
      emissiveIntensity: 0.35,
      shininess: 12,
      specular: 0x4b6d7a,
      transparent: true,
      opacity: 0.98,
    });
    this.sphere = new THREE.Mesh(geo, mat);
    this.group.add(this.sphere);

    // Dotted "continent" texture, generated on a canvas so no external
    // texture asset is required.
    const dotTexture = this._buildDotTexture();
    const dotsGeo = new THREE.SphereGeometry(this.radius * 1.001, 64, 64);
    const dotsMat = new THREE.MeshBasicMaterial({
      map: dotTexture,
      transparent: true,
      opacity: 0.9,
    });
    this.dotsSphere = new THREE.Mesh(dotsGeo, dotsMat);
    this.group.add(this.dotsSphere);

    // Fine graticule lines for a designed, cartographic hint (very subtle).
    const wireGeo = new THREE.SphereGeometry(this.radius * 1.002, 24, 16);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x4b6d7a,
      wireframe: true,
      transparent: true,
      opacity: 0.07,
    });
    this.wireSphere = new THREE.Mesh(wireGeo, wireMat);
    this.group.add(this.wireSphere);

    // Atmospheric glow shell.
    const glowGeo = new THREE.SphereGeometry(this.radius * 1.12, 48, 48);
    const glowMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { glowColor: { value: new THREE.Color(0x5b8a99) } },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform vec3 glowColor;
        void main() {
          float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
          gl_FragColor = vec4(glowColor, intensity * 0.55);
        }
      `,
    });
    this.glow = new THREE.Mesh(glowGeo, glowMat);
    this.group.add(this.glow);
  }

  _buildDotTexture() {
    const THREE = window.THREE;
    // Extremely simplified landmass silhouette, drawn as scattered dots —
    // deliberately impressionistic rather than geographically precise.
    const size = 1024;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size / 2;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#e7d9bd";

    // Rough band-based "continents": a handful of soft blob regions.
    const blobs = [
      // x%, y%, w%, h%
      [0.08, 0.22, 0.16, 0.22], // N. America
      [0.14, 0.5, 0.1, 0.24], // S. America
      [0.45, 0.16, 0.14, 0.14], // Europe
      [0.44, 0.32, 0.16, 0.32], // Africa
      [0.58, 0.14, 0.28, 0.24], // Asia
      [0.78, 0.55, 0.14, 0.14], // Australia
    ];
    blobs.forEach(([bx, by, bw, bh]) => {
      const cx = bx * size;
      const cy = by * (size / 2);
      const w = bw * size;
      const h = bh * (size / 2);
      const dotCount = 340;
      for (let i = 0; i < dotCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random();
        const x = cx + Math.cos(angle) * (w / 2) * r;
        const y = cy + Math.sin(angle) * (h / 2) * r;
        ctx.globalAlpha = 0.35 + Math.random() * 0.35;
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
  }

  _latLonToVec3(lat, lon, r) {
    const THREE = window.THREE;
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
  }

  _buildMarkers() {
    const THREE = window.THREE;
    this.markerGroup = new THREE.Group();
    this.group.add(this.markerGroup);

    (this.opts.markers || []).forEach((m) => {
      const pos = this._latLonToVec3(m.lat, m.lon, this.radius * 1.01);
      const dotGeo = new THREE.SphereGeometry(0.014, 12, 12);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xc9a66b });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(pos);
      dot.userData = m;
      this.markerGroup.add(dot);
      this.markerMeshes.push(dot);
    });
  }

  _bindEvents() {
    if (!this.opts.interactive) return;
    this._onMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const nx = (clientX - rect.left) / rect.width - 0.5;
      const ny = (clientY - rect.top) / rect.height - 0.5;
      this.pointer.targetX = nx;
      this.pointer.targetY = ny;
    };
    window.addEventListener("mousemove", this._onMove, { passive: true });
    window.addEventListener("touchmove", this._onMove, { passive: true });

    this._onResize = () => this._resize();
    window.addEventListener("resize", this._onResize);
  }

  _resize() {
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(rect.width, 1);
    const h = Math.max(rect.height, 1);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /** Rotate + tilt the globe so the given lat/lon faces the camera. */
  focusOn(lat, lon) {
    const targetTheta = -((lon + 180) * (Math.PI / 180)) - Math.PI / 2;
    const targetPhi = (lat * Math.PI) / 180;
    this.destRotation = { y: -targetTheta, x: targetPhi * 0.6 };

    const marker = this.markerMeshes.find(
      (m) => Math.abs(m.userData.lat - lat) < 0.01 && Math.abs(m.userData.lon - lon) < 0.01
    );
    if (marker && window.gsap) {
      gsap.fromTo(
        marker.scale,
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 1, duration: 0.9, ease: "back.out(2)", delay: 0.5 }
      );
    }
  }

  /** Draw a great-circle-ish arc from origin to destination with a travelling dot. */
  showRoute(origin, dest) {
    const THREE = window.THREE;
    if (this.routeGroup) {
      this.group.remove(this.routeGroup);
    }
    this.routeGroup = new THREE.Group();

    const p0 = this._latLonToVec3(origin.lat, origin.lon, this.radius * 1.01);
    const p1 = this._latLonToVec3(dest.lat, dest.lon, this.radius * 1.01);
    const mid = p0.clone().add(p1).multiplyScalar(0.5);
    mid.setLength(this.radius * 1.35);

    const curve = new THREE.QuadraticBezierCurve3(p0, mid, p1);
    const points = curve.getPoints(64);
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: 0xc9a66b,
      transparent: true,
      opacity: 0.85,
    });
    const line = new THREE.Line(geo, mat);
    this.routeGroup.add(line);

    const planeGeo = new THREE.ConeGeometry(0.02, 0.05, 8);
    const planeMat = new THREE.MeshBasicMaterial({ color: 0xf5f1e8 });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    this.routeGroup.add(plane);
    this.group.add(this.routeGroup);

    this._flightCurve = curve;
    this._flightProgress = 0;
  }

  _tick(t) {
    const THREE = window.THREE;
    this.raf = requestAnimationFrame(this._tick);

    if (this.opts.autoRotate && !this.reduced) {
      this.group.rotation.y += 0.0011;
    }

    if (this.destRotation) {
      this.group.rotation.y += (this.destRotation.y - this.group.rotation.y) * 0.04;
      this.group.rotation.x += (this.destRotation.x - this.group.rotation.x) * 0.04;
    }

    if (this.opts.interactive && !this.reduced) {
      this.pointer.x += (this.pointer.targetX - this.pointer.x) * 0.05;
      this.pointer.y += (this.pointer.targetY - this.pointer.y) * 0.05;
      this.group.rotation.x += (-this.pointer.y * 0.25 - this.group.rotation.x) * 0.0 + (-this.pointer.y * 0.12);
      this.group.rotation.z = this.pointer.x * 0.03;
    }

    if (this._flightCurve && this.routeGroup) {
      this._flightProgress = Math.min(this._flightProgress + 0.0026, 1);
      const pos = this._flightCurve.getPoint(this._flightProgress);
      const plane = this.routeGroup.children[1];
      if (plane) {
        plane.position.copy(pos);
        const tangent = this._flightCurve.getTangent(this._flightProgress);
        plane.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent.normalize());
      }
      if (this._flightProgress >= 1) this._flightProgress = 0;
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    if (this._onMove) {
      window.removeEventListener("mousemove", this._onMove);
      window.removeEventListener("touchmove", this._onMove);
    }
    if (this._onResize) window.removeEventListener("resize", this._onResize);
    this.renderer.dispose();
  }
}

window.WanderGlobe = WanderGlobe;
