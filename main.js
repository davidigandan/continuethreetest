const toDegrees = 180 / Math.PI;

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "stats-gl";
import { makeMitreSegment2, makeMitreSegment, makeSegment } from "./makeSegment";
import { sine, generateRandom } from "./analysis/generateData";

// Create stats instance
const stats = new Stats({ trackGPU: true });
document.body.appendChild(stats.dom);

// Setup scene, camera, renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.x = 80;
camera.position.y = 0;
camera.position.z = 60;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Initialize stats with the renderer
stats.init(renderer);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
const rightAngleDataset4 = [
  [0, 0],
  [40, -40],
  [80, -40],
  [120, -80],
];
const randomDataset = generateRandom(0, 10, 1, 0, 50, 5);
const sineDataset = sine(0, 2 * Math.PI, Math.PI / 4);

function buildLine(dataset, lineWidth = 5, lineColor = "green") {
  const meshesOfLine = [];
  const material = new THREE.MeshBasicMaterial({ color: lineColor });

  let startBottomAngle = 0;
  let endTopAngle = 0;

  function getTopCut([x1, y1], [x2, y2], currentSegmentAngle, i) {
    // NEXT SEGMENT CALCULATIONS
    // change between points dp[current+1] and dp[current+2]
    const deltaX1To2 = x2 - x1;
    const deltaY1To2 = y2 - y1;

    const nextSegmentAngle = Math.atan2(deltaX1To2, deltaY1To2);

    const relativeAngle = nextSegmentAngle - currentSegmentAngle;

    const topCutAngle = relativeAngle / 2;

    return topCutAngle;
  }

  // Loop helper variables (from last loop)
  let bottomCutAngle = 0;

  for (let i = 0; i < dataset.length - 1; i++) {
    //don't compose a segment on last datapoint
    if (i % 100 === 0) {
      console.log(`run number: ${i} time`);
    }

    // ------------------------------------------------------------------------------------------------------------------------------------------------
    //CURRENT SEGMENT CALCULATIONS
    // change between points dp[current] and dp[current+1]
    const deltaXTo1 = dataset[i + 1][0] - dataset[i][0];
    const deltaYTo1 = dataset[i + 1][1] - dataset[i][1];

    // calculate length to next datapoint(currentSegmentLength)
    const currentSegmentLength = Math.hypot(deltaXTo1, deltaYTo1);
    // console.log(`Current segment length is ${currentSegmentLength}`)

    // calculate angle of current segment
    const currentSegmentAngle = Math.atan2(deltaXTo1, deltaYTo1);

    let topCutAngle;

    if (i < dataset.length - 2) {
      topCutAngle = getTopCut(
        dataset[i + 1],
        dataset[i + 2],
        currentSegmentAngle,
        i
      );
    } else {
      topCutAngle = 0;
    }

    // const segment = makeMitreSegment(
    //   currentSegmentLength,
    //   lineWidth,
    //   topCutAngle,
    //   bottomCutAngle,
    //   material
    // );

    const segment = makeMitreSegment2(length, lineWidth, topCutAngle, bottomCutAngle, material);

    // const segment = makeSegment(currentSegmentLength, lineWidth, material)

    bottomCutAngle = topCutAngle;

    segment.rotateZ(-currentSegmentAngle);
    segment.position.x = dataset[i][0];
    segment.position.y = dataset[i][1];

    // call makeSegment
    meshesOfLine.push(segment);
  }
  return meshesOfLine;
}

let timeTaken = -performance.now();
const meshes = buildLine(rightAngleDataset4, 1, "blue");
const colorWheel = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "black",
  "pink",
];

meshes.forEach((mesh, i) => {
  // mesh.material = new THREE.MeshBasicMaterial({ color: colorWheel[i] });
  scene.add(mesh);
});

const axesHelper = new THREE.AxesHelper(40);
scene.add(axesHelper);
camera.lookAt(80, 0, 0);
controls.update();
// renderer.render(scene, camera)
timeTaken += performance.now();
console.log(timeTaken / 1000);
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  stats.update(); // Add stats update call
}

animate();

// Mesh output disposal
console.log("Current memory use:", renderer.info);
