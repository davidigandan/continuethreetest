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
      function getIntercept(maxExcess, angle, firstIndex) {
        const tanAngle = Math.tan(angle);
        const x = Number((maxExcess / tanAngle)).toFixed(10);

        const y = maxExcess;

        const currTheta = Math.asin(x / radius);
        const z = x * Math.cos(currTheta);

        // if first index is +ve
        if (vertices[firstIndex + 2] > 0) {
          return [
            [x, y, z],
            [x, y, -z],
          ];
        } else {
          return [
            [x, y, -z],
            [x, y, z],
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
      for (let x = 0; x <= radialSegments; x++) {
        const u = x / radialSegments;
        const theta = u * 2 * Math.PI;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        // vertex
        vertex.x = radius * sinTheta;
        vertex.y = length + vertex.x * tanTopAngle;

        //implement mitre limit
        if (vertex.y > length) {
          vertex.y = Math.min(
            length + maxExcess,
            length + vertex.x * tanTopAngle
          );
        }


        // if ((vertex.y = length + maxExcess)) {
        //   topLimited = true;

          // get the index of the first and last occurence of limit
        //   if (firstLimitVertIndex === null) {
        //     firstLimitVertIndex = index * 3;
        //   }
        //   lastLimitVertIndex = index * 3;
        // }
        // const [firstIntercept, lastIntercept] = getIntercept(
        //   maxExcess,
        //   topAngle,
        //   firstLimitVertIndex
        // );
        // console.log(`first: ${firstIntercept}, last: ${lastIntercept}`);

        vertex.z = radius * -cosTheta;
        vertices.push(vertex.x, vertex.y, vertex.z);

        // save the index of the vertex just generated into indexRow
        indexRow.push(index++);
      }
      indexArray.push(indexRow);

      // check if top mitre is limited

      // calculate adjustedX
      // const adjustedX =
      // calcualted adjustedZ

      // if (firstLimitVertIndex) {
      //   vertices[lastLimitVertIndex * 3] = adjustedX;
      //   vertices[lastLimitVertIndex * 3 + 2] = adjustedZ;
      // }

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
      // console.log(`L+ME ${length + maxExcess}`)
      // console.log(`vertices are: ${vertices}`)

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

      // console.log(indexArray);
    }

    // console.log(vertices);
  }
}

export { BevelledCylinderGeometry };
