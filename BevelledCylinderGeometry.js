import {
  BufferGeometry,
  Float32BufferAttribute,
  Vector3,
  Vector2,
} from "three";

class BevelledCylinderGeometry extends BufferGeometry {
  constructor(
    radius = 5,
    length = 20,
    radialSegments = 32,
    heightSegments = 3,
    topAngle,
    bottomAngle
  ) {
    super();

    this.type = "BevelledCylinderGeometry";

    this.parameters = {
      radius: radius,
      length: length,
      radialSegments: radialSegments,
      heightSegments: heightSegments,
    };

    const scope = this;

    radialSegments = Math.floor(radialSegments);
    heightSegments = Math.floor(heightSegments);

    // top and bottom helpers
    const topCapLength = 2 * radius * Math.tan(topAngle);
    const bottomCapLength = 2 * radius * Math.tan(bottomAngle);
    const torsoLength = length - topCapLength - bottomCapLength;

    // buffers

    const indices = [];
    const vertices = [];

    // helper variables

    let index = 0;
    const indexArray = [];
    const halfLength = length / 2;
    let groupStart = 0;
    let torsoEndIndex;

    const halfTopCap = topCapLength / 2;
    const halfBottomCap = bottomCapLength / 2;

    // generate geometry

    generateTorso();
    generateTopCap(topAngle);
    generateBottomCap(bottomAngle);

    // build geometry
    this.setIndex(indices);
    this.setAttribute("position", new Float32BufferAttribute(vertices, 3));

    function generateTorso() {
      const vertex = new Vector3();

      let groupCount = 0;

      // generate vertices

      for (let y = 0; y <= heightSegments; y++) {
        const indexRow = [];

        const v = y / heightSegments;

        for (let x = 0; x <= radialSegments; x++) {
          const u = x / radialSegments;

          const theta = u * 2 * Math.PI;

          const sinTheta = Math.sin(theta);
          const cosTheta = Math.cos(theta);

          // vertex

          vertex.x = radius * sinTheta;
          vertex.y = -v * length + torsoLength + halfBottomCap; // push up bottom datapoint to world origin
          vertex.z = radius * cosTheta;
          vertices.push(vertex.x, vertex.y, vertex.z);

          // save the index of the vertex just generated into indexRow
          indexRow.push(index++);
        }
        indexArray.push(indexRow);
        torsoEndIndex = index; // only useful on final loop to get index of end of segment
      }

      // generate indices

      for (let x = 0; x < radialSegments; x++) {
        for (let y = 0; y < heightSegments; y++) {
          // assemble a square

          const a = indexArray[y][x];
          const b = indexArray[y + 1][x];
          const c = indexArray[y + 1][x + 1];
          const d = indexArray[y][x + 1];

          // faces
          indices.push(a, b, d);
          groupCount += 3;
          indices.push(b, c, d);
          groupCount += 3;
        }
      }
    }

    function generateTopCap(topAngle) {
      // generate topCap

      const vertex = new Vector3();

      // generate centre point (at datapoint)

      const centreIndex = index;

      vertex.x = 0;
      vertex.y = halfTopCap + torsoLength + halfBottomCap; // keep bottom dP at world origin
      vertex.z = 0;
      vertices.push(vertex.x, vertex.y, vertex.z);

      index++;

      //generate top radial cap

      const radialTopCapIndexStart = index;

      for (let x = 0; x <= radialSegments; x++) {
        const u = x / radialSegments;

        const theta = u * 2 * Math.PI;

        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        // vertex

        vertex.x = radius * sinTheta;
        if (vertex.x <= 0) {
          vertex.y = abs(vertex.x) * Math.tan(topAngle) + halfTopCap;
        } else {
          vertex.y = abs(vertex.x) * Math.tan(topAngle);
        }

        vertex.y += torsoLength + halfBottomCap; // keep bottom datapoint at world origin
        vertex.z = radius * cosTheta;
        vertices.push(vertex.x, vertex.y, vertex.z);

        index++;
      }

      // generate indices

      for (let x = 0; x <= radialSegments - 2; x++) {
        indices.push(centreIndex, centreIndex + 1 + x, centreIndex + 2 + x);
      }

      //connect cap to torso

      for (let x = 0; x < radialSegments; x++) {
        indices.push(x, x + 1, radialTopCapIndexStart + x);
      }
    }

    function generateBottomCap(bottomAngle) {
      // generate bottomCap

      const vertex = new Vector3();

      // generate centre point (at datapoint)

      const centreIndex = index;

      vertex.x = 0;
      vertex.y = 0;
      vertex.z = 0;
      vertices.push(vertex.x, vertex.y, vertex.z);

      index++;

      // generate bottom radial cap

      const radialBottomCapIndexStart = index;

      for (let x = 0; x <= radialSegments; x++) {
        const u = x / radialSegments;

        const theta = u * 2 * Math.PI;

        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        // vertex

        // origin is at bottom datapoint
        vertex.x = radius * sinTheta;
        if (vertex.x >= 0) {
          vertex.y = -(abs(vertex.x) * Math.tan(topAngle)); // translate downwards
        } else {
          vertex.y = abs(vertex.x) * Math.tan(topAngle);
        }
        vertex.z = radius * cosTheta;
        vertices.push(vertex.x, vertex.y, vertex.z);

        index++;
      }

      // generate indices

      for (let x = 0; x <= radialSegments - 2; x++) {
        indices.push(centreIndex, centreIndex + 1 + x, centreIndex + 2 + x);
      }

      // connect cap to torso
      const torsoBottomStartIndex = torsoEndIndex - radialSegments;
      for (let x = 0; x < radialSegments; x++) {
        indices.push(
          torsoBottomStartIndex + x,
          torsoBottomStartIndex + x + 1,
          radialBottomCapIndexStart + x
        );
      }
    }
  }
}

export { BevelledCylinderGeometry };
