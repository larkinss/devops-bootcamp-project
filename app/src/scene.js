import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { SHIPS, hueOf } from './ship-schema.js';

export function createScene(container, params, { onError } = {}) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 1.1, 6);
  camera.lookAt(0, 0, 0); // the fit-centred ship sits at the origin — aim at it

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.append(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x223344, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 1.3);
  key.position.set(3, 5, 4);
  scene.add(key);

  const spinner = document.createElement('div');
  spinner.className = 'loader';
  spinner.style.setProperty('--ship-color', params.color);
  container.append(spinner);

  const ship = SHIPS.find((s) => s.id === params.shipModel) || SHIPS[0];
  const hue = hueOf(params.color); // target hue fraction [0,1), or null for a greyscale colour

  let rocket = null;
  let disposed = false;
  let raf = 0;
  const clock = new THREE.Clock();

  function onResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
  window.addEventListener('resize', onResize);

  function tick() {
    const t = clock.getElapsedTime();
    if (rocket) {
      rocket.rotation.y = t * 0.5;
      rocket.position.y = Math.sin(t * 1.5) * 0.15;
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  tick();

  function teardown() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
    spinner.remove();
    if (rocket) disposeObject3D(rocket);
    renderer.dispose();
    renderer.domElement.remove();
  }

  // The load is async; the scene may be disposed before it resolves. Guard both
  // callbacks so a late load neither touches a torn-down scene nor leaks the GPU
  // resources it just allocated.
  new GLTFLoader().load(
    import.meta.env.BASE_URL + ship.file,
    (gltf) => {
      spinner.remove();
      if (disposed) {
        disposeObject3D(gltf.scene);
        return;
      }
      rocket = gltf.scene;
      applyHueShift(rocket, hue);
      fitByMaxDimension(rocket, 2.8);
      scene.add(rocket);
    },
    undefined,
    (err) => {
      if (disposed) return;
      console.warn(`${ship.file} failed to load`, err);
      teardown();
      onError?.(err);
    },
  );

  return { dispose: teardown };
}

// Recolour the model by SETTING every saturated texel to `hueFrac` (the chosen
// colour's hue, [0,1)), in-shader, after the base-colour texture is sampled.
// Setting the hue (rather than rotating it) lands exactly on the chosen colour
// on any model — the four ships share one atlas with no per-model base hue.
// Low-saturation texels (black cockpit, grey trim) keep their ~0 saturation, so
// they stay neutral. A null hueFrac (greyscale colour) leaves the paint alone.
function applyHueShift(object3d, hueFrac) {
  if (hueFrac == null) return;
  object3d.traverse((node) => {
    if (node.isMesh && node.material) {
      node.material = node.material.clone();
      node.material.onBeforeCompile = (shader) => {
        shader.uniforms.uHue = { value: hueFrac };
        shader.fragmentShader =
          `uniform float uHue;
           vec3 rgb2hsv(vec3 c) {
             vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
             vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
             vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
             float d = q.x - min(q.w, q.y);
             float e = 1.0e-10;
             return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
           }
           vec3 hsv2rgb(vec3 c) {
             vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
             vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
             return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
           }
           ` +
          shader.fragmentShader.replace(
            '#include <map_fragment>',
            `#include <map_fragment>
             {
               // Set hue absolutely; keep saturation + value, so greys and
               // blacks (saturation ~0) stay neutral while the paint recolours.
               vec3 hsv = rgb2hsv(diffuseColor.rgb);
               hsv.x = uHue;
               diffuseColor.rgb = hsv2rgb(hsv);
             }`,
          );
      };
      node.material.needsUpdate = true;
    }
  });
}

function fitByMaxDimension(object3d, target) {
  const box = new THREE.Box3().setFromObject(object3d);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const max = Math.max(size.x, size.y, size.z);
  const scale = max > 0 ? target / max : 1;
  object3d.scale.setScalar(scale);
  object3d.position.sub(center.multiplyScalar(scale));
}

function disposeObject3D(obj) {
  obj.traverse((node) => {
    if (node.isMesh) {
      node.geometry?.dispose();
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      for (const m of mats) disposeMaterial(m);
    }
  });
}

function disposeMaterial(material) {
  if (!material) return;
  // A material owns its textures (map, normalMap, roughnessMap, …); dispose them
  // too, or the GPU handles leak. Walk its properties rather than naming each map.
  for (const value of Object.values(material)) {
    if (value?.isTexture) value.dispose();
  }
  material.dispose();
}
