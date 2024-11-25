import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "stats-gl";
import { generateRandom } from "./analysis/generateData";
import { Vector3 } from "three/src/Three.js";
import { CSG } from "three-csg-ts";
import { MitredLineGeometry } from "./MitredLineGeometry";
import { BevelledCylinderGeometry } from "./BevelledCylinderGeometry";

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

const dataset = generateRandom(0, 300, 1, 0, 50, 5);
// const dataset = [
//   [0, 0],
//   [40, 40],
//   [80, 0],
//   [120,40],
// ];

const lineBuilder = {
  // helper function
  getTopCut: ([x1, y1], [x2, y2], currentSegmentAngle) => {
    // NEXT SEGMENT CALCULATIONS
    // change between points dp[current+1] and dp[current+2]
    const deltaX1To2 = x2 - x1;
    const deltaY1To2 = y2 - y1;

    let nextSegmentAngle = Math.atan2(deltaX1To2, deltaY1To2);

    // Normalise angles greater than PI to their negative equivalents
    if (nextSegmentAngle >= Math.PI) {
      nextSegmentAngle = nextSegmentAngle - 2 * Math.PI;
    }
    const relativeAngle = nextSegmentAngle - currentSegmentAngle;

    const topCutAngle = relativeAngle / 2;
    return topCutAngle;
  },
  /**
   * Creates a simple line through the given data points using THREE.Line
   * @param {Array<Array<number>>} dataset - Array of [x,y] coordinates defining the line vertices
   * @param {(string|number)} lineColor - Color of the line, can be hex number or CSS color string
   * @returns {THREE.Line} A single THREE.Line object representing the path
   *
   * @example
   * const data = [[0,0], [1,1], [2,0]];
   * const line = onethinline(data, 0x0000ff); // Blue line
   * scene.add(line);
   */
  onethinline: (dataset, lineColor) => {
    const points = dataset.map(
      (point) => new THREE.Vector3(point[0], point[1], 0)
    );
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: lineColor });
    const line = new THREE.Line(geometry, material);
    return line;
  },

  /**
   * Creates multiple individual line segments from consecutive points in the dataset
   * @param {Array<Array<number>>} dataset - Array of [x,y] coordinates defining the line vertices
   * @param {(string|number)} lineColor - Color of the line segments, can be hex number or CSS color string
   * @returns {Array<THREE.Line>} Array of individual line segments, each connecting two consecutive points
   *
   * @description
   * Unlike thinline which creates one continuous line, this creates separate line segments.
   * Each segment is:
   * - An independent THREE.Line object
   * - Connects exactly two consecutive points
   *
   * @example
   * const data = [[0,0], [40,40], [80,0], [120,40]];
   * const segments = manythinlines(data, "green");
   * segments.forEach(segment => scene.add(segment));
   */
  manythinlines: (dataset, lineColor) => {
    let lineSegments = [];
    const material = new THREE.LineBasicMaterial({ color: lineColor });
    for (let i = 0; i < dataset.length - 1; i++) {
      const deltaX = dataset[i + 1][0] - dataset[i][0];
      const deltaY = dataset[i + 1][1] - dataset[i][1];

      const start = new Vector3(dataset[i][0], dataset[i][1], 0);
      const end = new Vector3(dataset[i + 1][0], dataset[i + 1][1], 0);
      const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
      const segment = new THREE.Line(geometry, material);
      lineSegments.push(segment);
    }
    return lineSegments;
  },

  /**
   * Creates a 3D line using cylindrical segments between consecutive points
   * @param {Array<Array<number>>} dataset - Array of [x,y] coordinates defining the line path
   * @param {(string|number)} lineColor - Color of the line, can be hex number or CSS color string
   * @param {number} lineWidth - Diameter of the cylindrical segments
   * @returns {Array<THREE.Mesh>} Array of cylindrical meshes forming the line segments
   *
   * @description
   * Creates a line by placing cylinders between consecutive points. Each cylinder is:
   * - Oriented using atan2 to point to the next coordinate
   * - Scaled to exactly reach between its two defining points
   * - Positioned at the starting point of its segment
   *
   * @example
   * const data = [[0,0], [1,1], [2,0]];
   * const segments = cylinderline(data, 0x0000ff, 0.1); // Blue line, 0.1 units thick
   * segments.forEach(mesh => scene.add(mesh));
   */
  cylinderline: (dataset, lineColor, lineWidth) => {
    let lineSegments = [];
    for (let i = 0; i < dataset.length - 1; i++) {
      const deltaX = dataset[i + 1][0] - dataset[i][0];
      const deltaY = dataset[i + 1][1] - dataset[i][1];
      const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const segmentAngle = Math.atan2(deltaX, deltaY);
      const position = new Vector3(dataset[i][0], dataset[i][1], 0);
      const radius = lineWidth / 2;
      const geometry = new THREE.CylinderGeometry(radius, radius, length, 36);
      geometry.translate(0, length / 2, 0);
      geometry.rotateZ(-segmentAngle);
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ color: lineColor })
      );
      mesh.position.set(position.x, position.y, position.z);
      lineSegments.push(mesh);
    }
    return lineSegments;
  },

  /**
   * Generates a 3D mitred line using cylindrical segments and CSG (Constructive Solid Geometry) for smooth transitions at angles.
   *
   * @param {Array<Array<number>>} dataset - Array of [x, y] coordinates defining the line path.
   * @param {(string|number)} lineColor - The color of the line, can be a hex value or CSS color string.
   * @param {number} lineWidth - Diameter of the cylindrical segments forming the line.
   * @param {number} mitreLimit - Maximum allowed mitre length as a multiple of the line width.
   * @returns {Array<THREE.Mesh>} Array of 3D mesh objects representing the mitred line segments.
   *
   * @description
   * This function creates a mitred line using cylinders and applies CSG operations for smooth transitions at joints between consecutive segments.
   * Each segment is:
   * - Constructed as a cylinder scaled and oriented to match the distance and angle between two points.
   * - Mitred using additional CSG-based cuts if the angle exceeds the specified mitre limit.
   *
   * Internally, the function:
   * 1. Computes segment lengths and angles.
   * 2. Applies mitre cuts using CSG operations for each joint, respecting the mitre limit.
   * 3. Adjusts the position and orientation of each segment in the 3D space.
   *
   * @example
   * const data = [[0, 0], [2, 2], [4, 0]];
   * const mitredLine = lineBuilder.csgmitreline(data, 0xff0000, 0.5, 2); // Red line with 0.5 unit thickness and mitre limit 2
   * mitredLine.forEach(mesh => scene.add(mesh)); // Add each segment to the scene
   */
  csgmitreline: (dataset, lineColor, lineWidth, mitreLimit) => {
    const radius = lineWidth / 2;
    const maxExcess = mitreLimit * radius;

    let bottomCutAngle = 0;

    let lineSegments = [];
    for (let i = 0; i < dataset.length - 1; i++) {
      // calcualate angle
      const deltaXTo1 = dataset[i + 1][0] - dataset[i][0];
      const deltaYTo1 = dataset[i + 1][1] - dataset[i][1];

      const currSegmentLength = Math.hypot(deltaXTo1, deltaYTo1);
      const currSegmentAngle = Math.atan2(deltaXTo1, deltaYTo1);

      let topCutAngle;
      if (i < dataset.length - 2) {
        topCutAngle = lineBuilder["getTopCut"](
          dataset[i + 1],
          dataset[i + 2],
          currSegmentAngle
        );
      } else {
        topCutAngle = 0;
      }

      const topExcess =
        radius * Math.min(maxExcess, Math.abs(Math.tan(topCutAngle)));
      const bottomExcess =
        radius * Math.min(maxExcess, Math.abs(Math.tan(bottomCutAngle)));

      // Generate cylinder body
      const precutLength = topExcess + bottomExcess + currSegmentLength;
      const geometry = new THREE.CylinderGeometry(
        radius,
        radius,
        precutLength,
        36
      );
      const cylinder = new THREE.Mesh(geometry);

      // Create topCube
      const topCubeWidth = lineWidth / Math.cos(topCutAngle);
      const topCubeGeometry = new THREE.BoxGeometry(
        topCubeWidth,
        topCubeWidth,
        topCubeWidth
      );
      const topCube = new THREE.Mesh(topCubeGeometry);

      // Position topCube
      topCube.geometry.translate(0, topCubeWidth / 2, 0);
      topCube.geometry.rotateZ(-topCutAngle); //rotate topCube
      const topShift = (currSegmentLength + bottomExcess - topExcess) / 2;
      topCube.geometry.translate(0, topShift, 0);

      // Top subtraction
      const topTip = CSG.intersect(cylinder, topCube);
      const slicedCylinderTemp = CSG.subtract(cylinder, topTip);

      // Generate bottom cube
      const bottomCubeWidth = lineWidth / Math.cos(bottomCutAngle);
      const bottomCubeGeometry = new THREE.BoxGeometry(
        bottomCubeWidth,
        bottomCubeWidth,
        bottomCubeWidth
      );
      const bottomCube = new THREE.Mesh(bottomCubeGeometry);

      // Position bottomCube
      bottomCube.geometry.translate(0, -bottomCubeWidth / 2, 0);
      bottomCube.geometry.rotateZ(bottomCutAngle); //rotate bottomCube
      const bottomShift = (currSegmentLength + topExcess - bottomExcess) / 2;
      bottomCube.geometry.translate(0, -bottomShift, 0);

      // Bottom subtraction
      const bottomTip = CSG.intersect(slicedCylinderTemp, bottomCube);
      let slicedCylinder = CSG.subtract(slicedCylinderTemp, bottomTip);

      // Move bottom to world origin
      const bottomToOrigin = precutLength / 2 - bottomExcess;
      slicedCylinder.geometry.translate(0, bottomToOrigin, 0);

      const material = new THREE.MeshBasicMaterial({ color: lineColor });
      slicedCylinder = new THREE.Mesh(slicedCylinder.geometry, material);

      // Disposal
      cylinder.geometry.dispose();
      topCube.geometry.dispose();
      bottomCube.geometry.dispose();
      topTip.geometry.dispose();
      bottomTip.geometry.dispose();
      slicedCylinderTemp.geometry.dispose();

      slicedCylinder.rotateZ(-currSegmentAngle);
      slicedCylinder.position.x = dataset[i][0];
      slicedCylinder.position.y = dataset[i][1];
      lineSegments.push(slicedCylinder);

      bottomCutAngle = topCutAngle;
    }

    return lineSegments;
  },

  manymitredlinegeometry: (dataset, lineColor, lineWidth, mitreLimit) => {
    let meshesOfLine = [];
    const material = new THREE.MeshBasicMaterial({ color: lineColor });
    const radius = lineWidth / 2;
    const radialSegments = 36;

    let bottomCutAngle = 0;
    let topCutAngle;

    for (let i = 0; i < dataset.length - 1; i++) {
      //don't compose a segment on last datapoint

      const deltaXTo1 = dataset[i + 1][0] - dataset[i][0];
      const deltaYTo1 = dataset[i + 1][1] - dataset[i][1];

      const currPosition = new THREE.Vector2(dataset[i][0], dataset[i][1]);

      const length = Math.hypot(deltaXTo1, deltaYTo1);
      const currSegmentAngle = Math.atan2(deltaXTo1, deltaYTo1);

      let topCutAngle;
      if (i < dataset.length - 2) {
        topCutAngle = lineBuilder["getTopCut"](
          dataset[i + 1],
          dataset[i + 2],
          currSegmentAngle,
          i
        );
      } else {
        topCutAngle = 0;
      }

      const segment = new BevelledCylinderGeometry(
        length,
        radius,
        topCutAngle,
        bottomCutAngle,
        radialSegments,
        3
      );

      bottomCutAngle = topCutAngle;

      const meshSegment = new THREE.Mesh(segment, material);
      meshSegment.position.set(currPosition.x, currPosition.y, 0);
      meshSegment.rotateZ(-currSegmentAngle);
      meshesOfLine.push(meshSegment);
    }

    return meshesOfLine;
  },

  onemitredlinegeometry: (dataset, lineColor, lineWidth, mitreLimit) => {
    const radius = lineWidth / 2;
    const material = new THREE.MeshBasicMaterial({ color: lineColor });

    const lineGeometry = new MitredLineGeometry(
      dataset,
      radius,
      36,
      mitreLimit
    );

    const mesh = new THREE.Mesh(lineGeometry, material);
    return mesh;
  },

  // disposals: geometries, lines, meshes, materials = null
};
// returns either a mesh or a line object that can be added to a scene
function buildLine(dataset, lineType, lineColor, lineWidth, mitreLimit) {
  const builderFunction = lineBuilder[lineType];
  if (!builderFunction) throw new Error(`Unknown line type: ${lineType}`);
  return builderFunction(dataset, lineColor, lineWidth, mitreLimit);
}

let timeTaken = -performance.now();
const line = buildLine(dataset, "manymitredlinegeometry", "red", 1, 2);
timeTaken += performance.now();
console.log(`Takes: ${timeTaken / 1000}`);

if (Array.isArray(line)) {
  line.forEach((element) => scene.add(element));
} else {
  scene.add(line);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
