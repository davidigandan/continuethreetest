const toDegrees = 180 / Math.PI;

import {
  BufferGeometry,
  Float32BufferAttribute,
  Vector3,
  Vector2,
  Matrix4,
} from "three";

import * as THREE from "three";

const getTopCut = ([x1, y1], [x2, y2], currentSegmentAngle) => {
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
};

/**
 * A geometry class for generating a mitred line mesh based on a dataset of points.
 * The class extends THREE.BufferGeometry and supports customizations for radius, radial segments, and mitre limit.
 */
class MitredLineGeometry extends BufferGeometry {
  /**
   * Creates an instance of MitredLineGeometry.
   *
   * @param {Array<Array<number>>} dataset - An array of 2D points defining the line path. Each point is represented as [x, y].
   * @param {number} radius - The radius of the line's cross-section.
   * @param {number} radialSegments - Number of segments around the circumference of the line's cross-section.
   * @param {number} mitreLimit - The maximum limit for the mitre adjustments at sharp angles.
   */
  constructor(dataset, radius, radialSegments, mitreLimit) {
    super();

    this.type = "MitredLineGeometry";
    this.parameters = {
      dataset: dataset,
      radius: radius,
      radialSegments: radialSegments,
      mitreLimit,
    };

    // top and bottom helpers
    const maxExcess = mitreLimit * radius;

    // buffers
    const indices = [];
    const vertices = [];

    // helper variables
    let index = 0;
    const indexArray = [];

    // generate geometry
    generateTorso();

    // build geometry
    this.setIndex(indices);
    this.setAttribute("position", new Float32BufferAttribute(vertices, 3));

    function generateTorso() {
      let bottomAngle = 0;
      let indexRow = [];
      for (let i = 0; i < dataset.length - 1; i++) {
        // CALCULATE SEGMENT PARAMETERS
        const currPosition = new Vector2(dataset[i][0], dataset[i][1]);
        const nextPosition = new Vector2(dataset[i + 1][0], dataset[i + 1][1]);

        const deltaXTo1 = nextPosition.x - currPosition.x;
        const deltaYTo1 = nextPosition.y - currPosition.y;

        const currSegmentAngle = Math.atan2(deltaXTo1, deltaYTo1);
        const length = Math.hypot(deltaXTo1, deltaYTo1);

        let topAngle;
        if (i < dataset.length - 2) {
          const afterNextPosition = new Vector2(
            dataset[i + 2][0],
            dataset[i + 2][1]
          );
          topAngle = getTopCut(
            [nextPosition.x, nextPosition.y],
            [afterNextPosition.x, afterNextPosition.y],
            currSegmentAngle
          );
        } else {
          topAngle = 0;
        }

        // CREATE TRANSFORMATION MATRIX
        const matrix = new THREE.Matrix4();
        matrix.makeRotationZ(-currSegmentAngle);
        matrix.setPosition(currPosition.x, currPosition.y, 0);

        // GENERATE VERTICES
        const vertex = new Vector3();
        const tanTopAngle = Math.tan(-topAngle);

        indexRow = [];
        let prevPointBelowLimit = true; // previous point was below the limit
        for (let x = 0; x <= radialSegments; x++) {
          //TODO1/3: Generate top cover
          const u = x / radialSegments;
          const theta = u * 2 * Math.PI;
          const sinTheta = Math.sin(theta);
          const cosTheta = Math.cos(theta);

          // vertex
          vertex.x = radius * sinTheta;

          let deltaY = vertex.x * tanTopAngle;

          if (deltaY > maxExcess) {
            deltaY = maxExcess;

            if (prevPointBelowLimit) {
              // if it's the first limit
              prevPointBelowLimit = false; // helper variable for next loop

              const x = maxExcess / tanTopAngle;
              const z = Math.sqrt(Math.max(radius * radius - x * x, 0));
              vertex.z = cosTheta > 0 ? -z : z; // radius * -cosTheta
              vertex.x = x;
            } else {
              vertex.z = radius * -cosTheta;
            }
          } else {
            if (prevPointBelowLimit) {
              vertex.z = radius * -cosTheta;
            } else {
              prevPointBelowLimit = true;

              const x = maxExcess / tanTopAngle;
              const z = Math.sqrt(Math.max(radius * radius - x * x, 0));
              vertex.z = cosTheta > 0 ? -z : z; // radius * -cosTheta
              vertex.x = x;

              deltaY = maxExcess;
            }
          }

          vertex.y = length + deltaY;
          vertex.applyMatrix4(matrix);
          vertices.push(vertex.x, vertex.y, vertex.z);

          // save the index of the vertex just generated into indexRow
          indexRow.push(index++);
        }

        indexArray.push(indexRow);

        indexRow = [];
        const tanBottomAngle = Math.tan(bottomAngle);
        let prevPointAboveLimit = true;
        for (let x = 0; x <= radialSegments; x++) {
          // TODO 2/3: Generate bottom cover
          const u = x / radialSegments;
          const theta = u * 2 * Math.PI;
          const sinTheta = Math.sin(theta);
          const cosTheta = Math.cos(theta);

          // vertex
          vertex.x = radius * sinTheta;
          let deltaY = vertex.x * tanBottomAngle;

          if (deltaY < -maxExcess) {
            // if we're in the limited region
            deltaY = -maxExcess;

            if (prevPointAboveLimit) {
              prevPointAboveLimit = false; // `helper variable for next loop

              const x = -maxExcess / tanBottomAngle;
              const z = Math.sqrt(Math.max(radius * radius - x * x, 0));
              vertex.z = cosTheta > 0 ? -z : z;
              vertex.x = x;
            } else {
              vertex.z = radius * -cosTheta;
            }
          } else {
            if (prevPointAboveLimit) {
              vertex.z = radius * -cosTheta;
            } else {
              prevPointAboveLimit = true;

              const x = -maxExcess / tanBottomAngle;
              const z = Math.sqrt(Math.max(radius * radius - x * x, 0));
              vertex.z = cosTheta > 0 ? -z : z;
              vertex.x = x;

              deltaY = -maxExcess;
            }
          }

          vertex.y = deltaY;
          vertex.applyMatrix4(matrix);
          vertices.push(vertex.x, vertex.y, vertex.z);

          // save the index of the vertex just generated into indexRow
          indexRow.push(index++);
        }
        indexArray.push(indexRow);

        bottomAngle = topAngle;
      }


  

      // generate all indices
      for (let x = 0; x < radialSegments; x++) {
        for (let y = 0; y < indexArray.length - 1; y += 2) {
          // TODO 3/3: Adjust indexing strategy (y+=4) when top and bottom covers added
          // assemble a square

          const a = indexArray[y][x];
          const b = indexArray[y + 1][x];
          const c = indexArray[y + 1][x + 1];
          const d = indexArray[y][x + 1];

          // faces
          indices.push(a, b, d);
          indices.push(b, c, d);
        }
      }
    }
  }
}

export { MitredLineGeometry };
