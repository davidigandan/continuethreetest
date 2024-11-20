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
      function getCorrections(angle, firstIndex) {
        const tanAngle = Math.tan(angle);
        const x = parseFloat((maxExcess / tanAngle).toFixed(10));

        const y = maxExcess;

        const currTheta = Math.asin(x / radius);
        const z = x * Math.cos(currTheta);

        // if first index is +ve
        if (vertices[firstIndex + 2] > 0) {
          return [
            [x, length + y, z],
            [x, length + y, -z],
            [x, length + y, 0],
          ];
        } else {
          return [
            [x, length + y, -z],
            [x, length + y, z],
            [x, length + y, 0],
          ];
        }
      }

      // generate cover
      let indexRow = [];
      for (let x = 0; x <= radialSegments; x++) {
        vertices.push(0, length, 0);
        indexRow.push(index++);
      }
      indexArray.push(indexRow);

      // generate vertices
      const vertex = new Vector3();
      const tanTopAngle = Math.tan(-topAngle);

      let topLimited = null;
      indexRow = [];
      let firstLimitVertIndex = null;
      let lastLimitVertIndex = null;
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
            prevPointBelowLimit = false;

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

        vertex.y = length + deltaY
        vertices.push(vertex.x, vertex.y, vertex.z);

        // save the index of the vertex just generated into indexRow
        indexRow.push(index++);

        console.log(firstLimitVertIndex, lastLimitVertIndex);
      }

      // when mitreLimit is applied, get and implement corrections
      if (topLimited) {
        let [firstIntercept, lastIntercept, centreIntercept] = getCorrections(
          topAngle,
          firstLimitVertIndex
        );

        console.log(
          `First: ${firstIntercept}, Last: ${lastIntercept}, Centre: ${centreIntercept}`
        );

        vertices.splice(firstLimitVertIndex, 3, ...firstIntercept);
        vertices.splice(lastLimitVertIndex, 3, ...lastIntercept);
        for (let x = 0; x <= radialSegments; x++) {
          vertices.splice(x * 3, 3, ...centreIntercept);
        }
      }

      console.log(vertices);
      indexArray.push(indexRow);

      indexRow = [];
      for (let x = 0; x <= radialSegments; x++) {
        const u = x / radialSegments;
        const theta = u * 2 * Math.PI;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        // vertex
        vertex.x = radius * sinTheta;
        vertex.y = midHeight;
        vertex.z = radius * -cosTheta;
        vertices.push(vertex.x, vertex.y, vertex.z);

        // save the index of the vertex just generated into indexRow
        indexRow.push(index++);
      }
      indexArray.push(indexRow);

      indexRow = [];
      const tanBottomAngle = Math.tan(bottomAngle);

      for (let x = 0; x <= radialSegments; x++) {
        const u = x / radialSegments;
        const theta = u * 2 * Math.PI;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        // vertex
        vertex.x = radius * sinTheta;

        vertex.y = vertex.x * tanBottomAngle;
        if (vertex.y < 0) {
          vertex.y = Math.max(-maxExcess, vertex.y);
        }

        vertex.z = radius * -cosTheta;
        vertices.push(vertex.x, vertex.y, vertex.z);

        // save the index of the vertex just generated into indexRow
        indexRow.push(index++);
      }
      indexArray.push(indexRow);

      // generate bottom cover
      indexRow = [];
      for (let x = 0; x <= radialSegments; x++) {
        vertices.push(0, 0, 0);
        indexRow.push(index++);
      }
      indexArray.push(indexRow);

      // generate all indices
      for (let x = 0; x < radialSegments; x++) {
        for (let y = 0; y < 4; y++) {
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
