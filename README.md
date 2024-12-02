# Thick Line Support

## Aim
We will use **Three.js** to build custom 3D geometries that can be utilized in **h5web**. 

### Initial Approaches
The simplest method to create a line is to connect datapoints with a series of cylinders. However, this introduces unpleasant artifacts at the joints (Figure 1: No joint). To address this, a **Mitre joint** was explored, resulting in more aesthetically pleasing connections where line segments meet at corresponding angles (Figure 2: Mitre Joint; Figure 3: Mitred Segment).

---

## Constructing Mitred Segments with Constructive Solid Geometry (CSG)
While **Three.js** lacks a Mitred Segment geometry, its **CylinderGeometry** can be modified using the **CSG** library. The process involves:

1. **Generating a Mitred Segment**:
   - Intersect a cylinder with a rotated cube and subtract the cube from the cylinder to achieve a mitred cut.
   - Rotate the cube around a datapoint (marked X) to vary the cut angle for different mitre joints.

2. **Key Parameters**:
   - **Precut Length**: The cylinder must exceed the distance between two datapoints to ensure proper connection, with constraints applied for acute angles.
   - **Cube Width**: Determined by the angle of the cut:
     \[
     \text{topCubeWidth} = \frac{\text{cylinderWidth}}{\cos(\text{topAngle})}
     \]

3. **Joint Angles**:
   - The angle between two segments determines the sum of the angles at the connecting joints:
     \[
     \text{relativeSegmentAngle}(A, B) = \text{bottomAngle}_A + \text{topAngle}_B
     \]
     Equal angles are preferred for congruent triangles:
     \[
     \text{bottomAngle}_A = \text{topAngle}_B = \frac{\text{relativeSegmentAngle}(A, B)}{2}
     \]

4. **Cube Rotation**:
   - The cube’s center is aligned with the datapoint through translation.
   - The rotation aligns the cube with the desired joint angle, accounting for Three.js’s coordinate transformations (e.g., negating topAngles).

5. **Memory Optimization**:
   - Intermediate geometries (cylinders, cubes, intersections) are disposed of after generating the final sliced cylinder.

6. **Segment Generation**:
   - Iterate through the dataset, create segments, and add them to the scene.

**Performance**: Using the CSG library, up to **300 segments per second** can be generated.

---

## Constructing a Mitred Line with Buffered Geometry
By extending **BufferedGeometry**, a more efficient **MitredLineGeometry** class can be developed:

1. **Advantages**:
   - Generate the entire line in a single geometry.
   - Avoid overhead of multiple geometry calls.

2. **Key Steps**:
   - Calculate segment angles, lengths, and top cut angles.
   - Handle **mitre limits** for acute angles by adjusting relevant points.
   - Create vertices for top and bottom covers, correcting center positions when limits are applied.
   - Modify the indexing strategy for more efficient generation.

3. **Performance**:
   - Reducing calls significantly improved performance compared to the CSG approach.

---

## Benchmarking
The time taken to generate lines for **3000 datapoints** was compared across different methods:

| Line Type             | Attempt 1 | Attempt 2 | Attempt 3 | Attempt 4 | Attempt 5 | Average       |
|-----------------------|-----------|-----------|-----------|-----------|-----------|---------------|
| **One thin line**     | 0.0018    | 0.0014    | 0.0008    | 0.0006    | 0.0008    | **0.00108**   |
| **Many thin lines**   | 0.0127    | 0.0154    | 0.0123    | 0.0101    | 0.0603    | **0.02216**   |
| **Cylinder line**     | 0.2458    | 0.2035    | 0.1748    | 0.1621    | 0.1745    | **0.19214**   |
| **CSG Mitred line**   | 8.2512    | 7.6269    | 8.1315    | 7.7563    | 7.6690    | **7.88698**   |
| **MML Geometry**      | 0.0377    | 0.0387    | 0.0415    | 0.0366    | 0.0345    | **0.03780**   |
| **OML Geometry**      | 0.0882    | 0.0230    | 0.0313    | 0.0413    | 0.0390    | **0.04456**   |

### Key Insights
- Buffered geometry methods outperform CSG-based methods by a significant margin.
- Generating the entire line in one class provided **no substantial performance gain**, contrary to expectations.

--- 
