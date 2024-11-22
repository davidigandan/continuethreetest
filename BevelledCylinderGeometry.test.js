import { BevelledCylinderGeometry } from "./MitredLineGeometry";

const toDegrees = 180 / Math.PI;

test("properly limits vertex height", () => {
  const length = Math.sqrt(1700);
  const geometry = new BevelledCylinderGeometry(
    length,
    0.5,
    -82.98187 / toDegrees,
    0,
    7,
    3
  );

  const vertices = geometry.attributes.position.array;
  const error = 0.0001;

  for (let i = 0; i < vertices.length; i += 3) {
    const y = vertices[i + 1];
    expect(y).toBeLessThanOrEqual(length + 3 * 0.5 + error);
  }
});
