const toDegrees = 180 / Math.PI;

import {
  BufferGeometry,
  Float32BufferAttribute,
  Vector3,
  Vector2,
} from "three";

class BevelledCylinderGeometry extends BufferGeometry {
  constructor(
    length,
    radius,
    topAngle,
    bottomAngle,
    radialSegments,
    mitreLimit
  ) {
    super();

    this.type = "BevelledCylinderGeometry";

    this.parameters = {
      radius: radius,
      length: length,
      radialSegments: radialSegments,
    };

    const scope = this;

    radialSegments = Math.floor(radialSegments);

    // top and bottom helpers
    const maxExcess = mitreLimit * radius;

    // const topExcess = Math.min(maxExcess, radius * Math.tan(topAngle));
    const topExcess = radius * Math.tan(topAngle);
    // const bottomExcess = Math.max(-maxExcess, radius * Math.tan(bottomAngle));
    const bottomExcess = radius * Math.tan(bottomAngle);

    const midHeight = (length - topExcess + bottomExcess) / 2;

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
      let indexRow = [];
      for (let x = 0; x <= radialSegments; x++) {
        vertices.push(0, length, 0);
        indexRow.push(index++);
      }
      indexArray.push(indexRow);

      for (let i = 0; i < dataset.length - 1; i++) {
        
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
          vertices.push(vertex.x, vertex.y, vertex.z);

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
          vertices.push(vertex.x, vertex.y, vertex.z);

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

export { BevelledCylinderGeometry };
