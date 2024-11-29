import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "stats-gl";
import { generateRandom } from "./analysis/generateData";
import { Vector3 } from "three/src/Three.js";
import { CSG } from "three-csg-ts";
import { MitredLineGeometry } from "./MitredLineGeometry";
import { BevelledCylinderGeometry } from "./BevelledCylinderGeometry";

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.z = 5;
const rotationFactorRads = 0.261799; // rotate line by a factor of 15 degrees
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);

const dataset = generateRandom(0, 300, 1, 0, 50, 5);

// const dataset = [
//   [0, 0],
//   [40, 40],
//   [80, 0],
//   [120, 40],
// ];

// Types of lines that can be drawn
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
   * Creates a simple line through the given data points using `THREE.Line`.
   *
   * @param {Array<Array<number>>} dataset - An array of [x, y] coordinates defining the line vertices.
   * @param {(string|number)} lineColor - The color of the line, specified as a hex value or CSS color string.
   * @returns {THREE.Line} A single `THREE.Line` object representing the path.
   *
   * @see {@link onemitredlinegeometry} for a detailed example of how to create and add a line to a scene.
   */
  onethinline: (dataset, lineColor) => {
    const points = dataset.map(
      (point) => new THREE.Vector3(point[0], point[1], 0)
    );
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: lineColor });
    const line = new THREE.Line(geometry, material);
    line.rotateY(0 * rotationFactorRads); // no ratation about Y
    return line;
  },

  /**
   * Creates multiple individual line segments from consecutive points in the dataset.
   *
   * @param {Array<Array<number>>} dataset - An array of [x, y] coordinates defining the line vertices.
   * @param {(string|number)} lineColor - The color of the line segments, specified as a hex value or CSS color string.
   * @returns {Array<THREE.Line>} An array of individual line segments, each connecting two consecutive points.
   *
   * @description
   * Constructs separate line segments between each pair of consecutive points in the dataset.
   * Each segment is:
   * - An independent `THREE.Line` object.
   * - Aligned to connect exactly two consecutive points.
   *
   * @see {@link onemitredlinegeometry} for a detailed example of how to create and add a line to a scene.
   */
  manythinlines: (dataset, lineColor) => {
    let lineSegments = [];
    const material = new THREE.LineBasicMaterial({ color: "green" });
    for (let i = 0; i < dataset.length - 1; i++) {
      const start = new Vector3(dataset[i][0], dataset[i][1], 0);
      const end = new Vector3(dataset[i + 1][0], dataset[i + 1][1], 0);
      const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
      const segment = new THREE.Line(geometry, material);
      segment.rotateY(1 * rotationFactorRads); // to aid multi-line display, rotate line by a certain amount about Y-axis
      lineSegments.push(segment);
    }
    return lineSegments;
  },

  /**
   * Creates a 3D line composed of cylindrical segments between consecutive points.
   *
   * @param {Array<Array<number>>} dataset - An array of [x, y] coordinates defining the line path.
   * @param {(string|number)} lineColor - The line color, specified as a hex value or CSS color string.
   * @param {number} lineWidth - The diameter of the cylindrical segments.
   * @returns {Array<THREE.Mesh>} An array of cylindrical meshes representing the line segments.
   *
   * @description
   * Constructs a 3D line by connecting each pair of consecutive points in the dataset with a cylindrical segment.
   * Each cylinder is:
   * - Positioned at the starting point of its segment.
   * - Scaled to span the exact distance between two points.
   * - Rotated to align with the direction to the next point, calculated using `atan2`.
   *
   * @see {@link onemitredlinegeometry} for a detailed example of how to create and add a line to a scene.
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
        new THREE.MeshBasicMaterial({ color: "orange" })
      );
      mesh.position.set(position.x, position.y, position.z);
      // mesh.rotateY(4 * -rotationFactorRads) // to aid multi-line display, rotate line by a certain amount about Y-axis
      lineSegments.push(mesh);
    }
    return lineSegments;
  },

  /**
   * Creates a 3D mitred line using cylindrical segments with smooth transitions at joints, leveraging Constructive Solid Geometry (CSG).
   *
   * @param {Array<Array<number>>} dataset - An array of [x, y] coordinates defining the line path.
   * @param {(string|number)} lineColor - Color of the line, specified as a hex value or CSS color string.
   * @param {number} lineWidth - The diameter of the cylindrical segments forming the line.
   * @param {number} mitreLimit - Maximum mitre length, expressed as a multiple of the line width.
   * @returns {Array<THREE.Mesh>} An array of 3D mesh objects representing individual mitred line segments.
   *
   * @description
   * Constructs a 3D mitred line by:
   * - Generating cylindrical segments for each line segment.
   * - Applying CSG-based cuts at joint angles to create smooth transitions, constrained by the `mitreLimit`.
   *
   * Each segment:
   * - Matches the distance and angle between two consecutive points.
   * - Is adjusted for mitre cuts when joint angles exceed the specified limit.
   *
   * @example
   * const data = [[0, 0], [2, 2], [4, 0]];
   * const mitredLine = lineBuilder.csgmitreline(data, 0xff0000, 0.5, 2); // Red line, 0.5 units thick, mitre limit 2
   * mitredLine.forEach(mesh => scene.add(mesh)); // Add segments to the scene
   *
   * @see {@link onemitredlinegeometry} for an exmaple of how to call the function.
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

  /**
   * Generates multiple 3D segments forming a mitred line using cylindrical geometries.
   *
   * @param {Array<Array<number>>} dataset - Array of [x, y] coordinates defining the line path.
   * @param {(string|number)} lineColor - The color of the line segments, can be a hex value or CSS color string.
   * @param {number} lineWidth - The diameter of the cylindrical segments forming the line.
   * @param {number} mitreLimit - Maximum allowed mitre length as a multiple of the line width.
   * @returns {Array<THREE.Mesh>} Array of 3D mesh objects, each representing a segment of the mitred line.
   *
   * @description
   * Creates a line by constructing individual cylindrical segments between consecutive points, with smooth mitre cuts applied
   * at joint angles. Each segment is:
   * - A bevelled cylinder with its length and orientation adjusted to match the line path.
   * - Adjusted for mitre cuts at joints using `BevelledCylinderGeometry`.
   *
   *
   * @see {@link onemitredlinegeometry} for examples of a similar function that creates a single geometry and how to call it.
   */
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
        mitreLimit
      );

      bottomCutAngle = topCutAngle;

      const meshSegment = new THREE.Mesh(segment, material);
      meshSegment.position.set(currPosition.x, currPosition.y, 0);
      meshSegment.rotateZ(-currSegmentAngle);
      meshesOfLine.push(meshSegment);
    }

    return meshesOfLine;
  },

  /**
   * Generates a single 3D mesh representing a mitred line, built as one continuous geometry.
   *
   * @param {Array<Array<number>>} dataset - Array of [x, y] coordinates defining the line path.
   * @param {(string|number)} lineColor - The color of the line, can be a hex value or CSS color string.
   * @param {number} lineWidth - The diameter of the cylindrical line.
   * @param {number} mitreLimit - Maximum allowed mitre length as a multiple of the line width.
   * @returns {THREE.Mesh} A single 3D mesh object representing the entire mitred line.
   *
   * @description
   * Constructs a single, continuous 3D line geometry using `MitredLineGeometry`. The geometry is:
   * - Formed by merging cylindrical segments and applying smooth mitre transitions.
   * - Optimized for performance by using a single mesh instead of individual segments.
   *
   * @example
   * const data = [[0, 0], [2, 2], [4, 0]];
   * const line = lineBuilder.onemitredlinegeometry(data, 0xff0000, 0.5, 2); // Red line
   * scene.add(line);
   */
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
const line = buildLine(dataset, "onemitredlinegeometry", "#0000ff", 0.3, 2); // Use the same defaults as in controls
timeTaken += performance.now();
console.log(`Takes: ${timeTaken / 1000}`);

addToScene(line);

// Rerender the canvas with every new frame
function animate() {
  requestAnimationFrame(animate);
  updateScene();
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

// ------------------------------------------------------------UI CONTORLS---------------------------------------------------------------------------

// Event listeners for all contorls
document.getElementById("linecolor").addEventListener("input", updateScene);
document.getElementById("linewidth").addEventListener("input", updateScene);
document.getElementById("mitrelimit").addEventListener("input", updateScene);
const checkboxes = document.querySelectorAll(".form-check-input");
checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", updateScene);
});

function updateScene() {
  // Get all new attributes
  const color = document.getElementById("linecolor").value;
  const width = document.getElementById("linewidth").value;
  const mitreLimit = document.getElementById("mitrelimit").value;

  // Repaint the scene
  clearScene(scene);
  // Check each line type and add if checked
  for (let lineType in lineBuilder) {
    // Skip the helper function
    if (lineType !== "getTopCut") {
      if (document.getElementById(lineType).checked) {
        const line = buildLine(dataset, lineType, color, width, mitreLimit);
        addToScene(line);
      }
    }
  }
}

function clearScene(scene) {
  while (scene.children.length > 0) {
    const object = scene.children[0];
    if (object.geometry) object.geometry.dispose(); // Dispose geometry
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach((material) => material.dispose()); // Dispose materials array
      } else {
        object.material.dispose(); // Dispose singlar material
      }
    }
    if (object.texture) object.texture.dispose(); // Dispose texture (if applicable)
    scene.remove(object); // Remove object from the scene
  }
}

// Add each line segment or each line to scene. Depends on strategy used to create line
function addToScene(line) {
  if (Array.isArray(line)) {
    line.forEach((element) => scene.add(element));
  } else {
    scene.add(line);
  }
}
