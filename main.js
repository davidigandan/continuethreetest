import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import  makeSegment  from './makeSegment'

// Setup scene, camera, renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xFFFFFF );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z=60;
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Contorls
const controls = new OrbitControls(camera, renderer.domElement)
const dataset=[[0,5], [1,30], [2,15], [3,40], [4,27], [5,50], [5,17]]

function getTopAngle(){}
function getBottomAngle(){}

function buildLine(lineWidth=5, lineColor="green", dataset=[[0,5], [1,30], [2,15], [3,40], [4,27], [5,50], [5,17]]) {
    
    const meshesOfLine=[]
    const material = new THREE.MeshBasicMaterial( { color: lineColor } )
    
    let startBottomAngle = 0
    let endTopAngle = 0


    function getTopCut([x1,y1],[x2,y2], currentSegmentAngle) {
        
        // NEXT SEGMENT CALCULATIONS
        // change between points dp[current+1] and dp[current+2]
        const deltaX1To2 = x1 - x2
        const deltaY1To2 = y1 - y2

        const nextSegmentAngle = Math.PI - Math.atan2(deltaY1To2,deltaX1To2)
        const relativeAngle = nextSegmentAngle - currentSegmentAngle

        const topCutAngle = relativeAngle/2
        return topCutAngle
    }
    
    // Loop helper variables (from last loop)
    let bottomCutHelper;

    
    for (let i=0; i<dataset.length-1; i++) { //don't compose a segment on last datapoint
        console.log(`run number: ${i} time`)
            
    // ------------------------------------------------------------------------------------------------------------------------------------------------
        //CURRENT SEGMENT CALCULATIONS
        // change between points dp[current] and dp[current+1]
        const deltaXTo1 = dataset[i+1][0] - dataset[i][0]
        const deltaYTo1 = dataset[i+1][1] - dataset[i][1] 

        // calculate length to next datapoint(currentSegmentLength)
        let currentSegmentLength;
        currentSegmentLength = Math.hypot(deltaXTo1, deltaYTo1);
        console.log(`Current segment length is ${currentSegmentLength}`)

        // calculate angle of current segment
        const currentSegmentAngle =  Math.asin(deltaXTo1/currentSegmentLength)

        let topCutAngle;
        let bottomCutAngle;

        
        if ( i===0 ) { 
            bottomCutAngle = 0
            console.log(dataset[i+1], dataset[i+2], currentSegmentAngle)
            topCutAngle = getTopCut(dataset[i+1], dataset[i+2], currentSegmentAngle)
            console.log(`topCutAngle on first segment is ${topCutAngle}`)
            bottomCutHelper = topCutAngle
        } else if (i>0 && i<dataset.length-2) {
            bottomCutAngle = bottomCutHelper
            console.log(`Initial bottomCutHelper ${bottomCutHelper}`)
            topCutAngle = getTopCut(dataset[i+1], dataset[i+2], currentSegmentAngle)
            bottomCutHelper = topCutAngle
            console.log(`After update bottomCutHelper${bottomCutHelper}, topCutAngle ${topCutAngle}` )
        } else if (i===dataset.length-2) {
            bottomCutAngle = bottomCutHelper
            topCutAngle = 0   
        }

        const segment = makeSegment(currentSegmentLength,lineWidth,topCutAngle,bottomCutAngle,material)

        // segment.rotateZ(currentSegmentAngle)
        // segment.position.x=dataset[i][0]
        // segment.position.y=dataset[i][1]



        // call makeSegment
        meshesOfLine.push(segment)

    }
    return meshesOfLine;
}


const meshes = buildLine(1,"red", dataset)

meshes.forEach((mesh,i) => {
    // mesh.geometry.rotateZ()
    scene.add(mesh);
})


const axesHelper = new THREE.AxesHelper(10)

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	renderer.render( scene, camera );
 }
animate();

// Mesh output disposal
console.log('Current memory use:', renderer.info)


