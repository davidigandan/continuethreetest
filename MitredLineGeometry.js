import {
  BufferGeometry,
  Float32BufferAttribute,
  Vector3,
  Vector2,
} from "three";

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
class MitredLineGeometry extends BufferGeometry {
  constructor(dataset, radius, radialSegments, mitreLimit) {
    super();

    this.type = "MitredLineGeometry";

    this.parameters = {
      dataset: dataset,
      radius: radius,
      radialSegments: radialSegments,
      mitreLimit,
    };

    radialSegments = Math.floor(radialSegments);

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
      // generate cover
      const lastDataPoint = new Vector3(
        dataset[dataset.length - 1][0],
        dataset[dataset.length - 1][1],
        0
      );
      let indexRow = [];
      for (let x = 0; x <= radialSegments; x++) {
        vertices.push(lastDataPoint.x, lastDataPoint.y, lastDataPoint.z);
        indexRow.push(index++);
      }
      indexArray.push(indexRow);

      for (let i = 0; i < dataset.length - 1; i++) {
        const currPosition = new Vector2(dataset[i][0], dataset[i][1]);
        const nextPosition = new Vector2(dataset[i + 1][0], dataset[i + 1][1]);

        const deltaXTo1 = nextPosition.x - currPosition.x;
        const deltaYTo1 = nextPosition.y - currPosition.y;

        const currSegmentAngle = Math.atan2(deltaXTo1, deltaYTo1);

        let bottomAngle;
        let topAngle;
        if (i < dataset.length - 2) {
          topAngle = getTopCut(dataset[i], dataset[i + 1], currSegmentAngle);
        } else {
          topAngle = 0;
        }

        // generate vertices
        const vertex = new Vector3();
        const tanTopAngle = Math.tan(-topAngle);

        indexRow = [];
        let prevPointBelowLimit = true; // previous point was below the limit
        for (let x = 0; x <= radialSegments; x++) {
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
          vertices.push(
            vertex.x + nextPosition.x,
            vertex.y + nextPosition.y,
            vertex.z
          );

          // save the index of the vertex just generated into indexRow
          indexRow.push(index++);
        }

        indexArray.push(indexRow);

        indexRow = [];
        const tanBottomAngle = Math.tan(bottomAngle);
        let prevPointAboveLimit = true;
        for (let x = 0; x <= radialSegments; x++) {
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
          vertices.push(
            vertex.x + currPosition.x,
            vertex.y + currPosition.y,
            vertex.z
          );

          // save the index of the vertex just generated into indexRow
          indexRow.push(index++);
        }
        indexArray.push(indexRow);
      }
      // generate bottom cover
      indexRow = [];
      for (let x = 0; x <= radialSegments; x++) {
        vertices.push(0, 0, 0);
        indexRow.push(index++);
      }
      indexArray.push(indexRow);

      // generate all indices
      for (let x = 0; x < radialSegments; x++) {
        for (let y = 0; y < 3; y++) {
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
