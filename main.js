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
    const line = new THREE.Line(geometry, material);
    return line;
  },

  cylinderline: (dataset, lineColor, lineWidth) => {
    dataset.forEach((_, i) => {
      deltaX = dataset[i][0] - dataset[i + 1][0];
      deltaY = dataset[i][1] - dataset[i + 1][1];
      const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const segmentAngle = atan2(deltaY, deltaX);
    });

    const radius = width / 2;
    const geometry = new THREE.CylinderGeometry(radius, radius, length, 36);
    const material = new THREE.MeshBasicMaterial({ color: lineColor });
    const line = new THREE.Mesh(geometry, material);
    return line;
  },

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

// add some error handling
const line = buildLine(dataset, "thinline", "blue", "triangle");
scene.add(line);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
