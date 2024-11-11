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
    topAngle,
    bottomAngle
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
    const topExcess = Math.abs(radius * Math.tan(topAngle));
    const bottomExcess = Math.abs(radius * Math.tan(bottomAngle));
    const midHeight = (length - topExcess + bottomExcess) / 2;

    // buffers

    const indices = [];
    const vertices = [];

    // helper variables

    let index = 0;
    const indexArray = [];
    const halfLength = length / 2;
    let groupStart = 0;
    let torsoEndIndex;

    // generate geometry

    generateTorso();
    // generateTopCap(topAngle);
    // generateBottomCap(bottomAngle);

    // build geometry
    this.setIndex(indices);
    this.setAttribute("position", new Float32BufferAttribute(vertices, 3));

    function generateTorso() {
      const vertex = new Vector3();

      const tanTopAngle = Math.tan(topAngle);

      let indexRow = [];
      // generate cover
      for (let x = 0; x <= radialSegments; x++) {
        vertices.push(0, length, 0);
        indexRow.push(index++);
      }
      indexArray.push(indexRow);

      // generate vertices
      indexRow = [];

      for (let x = 0; x <= radialSegments; x++) {
        const u = x / radialSegments;

        const theta = u * 2 * Math.PI;

        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        // center vertex

        // vertex

        vertex.x = radius * sinTheta;
        vertex.y = length + vertex.x * tanTopAngle;
        vertex.z = radius * cosTheta;
        vertices.push(vertex.x, vertex.y, vertex.z);

        // save the index of the vertex just generated into indexRow
        indexRow.push(index++);
      }
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
        vertex.z = radius * cosTheta;
        vertices.push(vertex.x, vertex.y, vertex.z);

        // save the index of the vertex just generated into indexRow
        indexRow.push(index++);
      }
      indexArray.push(indexRow);
      indexRow = [];
      const tanBottomAngle = Math.tan(-bottomAngle);

      for (let x = 0; x <= radialSegments; x++) {
        const u = x / radialSegments;

        const theta = u * 2 * Math.PI;

        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        // centre vertex

        // vertex

        vertex.x = radius * sinTheta;
        vertex.y = vertex.x * tanBottomAngle;
        vertex.z = radius * cosTheta;
        vertices.push(vertex.x, vertex.y, vertex.z);

        // save the index of the vertex just generated into indexRow
        indexRow.push(index++);
      }
      indexArray.push(indexRow);

      indexRow = [];
      // generate cover
      for (let x = 0; x <= radialSegments; x++) {
        vertices.push(0, 0, 0);
        indexRow.push(index++);
      }
      indexArray.push(indexRow);

      // generate indices

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

      console.log(indexArray);
    }
  }
}

export { BevelledCylinderGeometry };
