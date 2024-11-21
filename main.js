import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "stats-gl";
import { generateRandom } from "./analysis/generateData";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);

const dataset = generateRandom(0, 100, 1, 0, 50, 5);

const lineBuilder = {
  thinline: (dataset, lineColor) => {
    const points = dataset.map(
      (point) => new THREE.Vector3(point[0], point[1], 0)
    );
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: lineColor });
    return new THREE.Line(geometry, material);
  },

  cylinderline: (dataset, lineColor, lineWidth) => {},

  csgmitreline: (dataset, lineColor, lineWidth) => {},

  bcgmitreline: (dataset, lineColor, lineWidth, mitreLimit) => {},

  // disposals: geometries, lines, meshes, materials = null
};

// returns either a mesh or a line object that can be added to a scene
function buildLine(
  dataset,
  lineType,
  lineColor,
  lineWidth = null,
  mitreLimit = null
) {
  const builderFunction = lineBuilder[lineType];
  if (!builderFunction) throw new Error(`Unknown line type: ${lineType}`);
  return builderFunction(dataset, lineColor, lineWidth, mitreLimit);
}

const line = buildLine(dataset, "thinline", "blue");
scene.add(line);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
