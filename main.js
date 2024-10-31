import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import  makeSegment  from './makeSegment'
import { color } from 'three/webgpu';

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
const dataset=[[0,0], [40,40], [80,0], [120,40], [160,0], [200,40], [240,0],[280,40]]

function getTopAngle(){}
function getBottomAngle(){}

function buildLine(lineWidth=5, lineColor="green", dataset=[[0,0], [40,40], [80,0], [120,40], [160,0], [200,40], [240,0],[280,40]]) {
    
    const meshesOfLine=[]
    const material = new THREE.MeshBasicMaterial( { color: lineColor } )
    
    let startBottomAngle = 0
    let endTopAngle = 0


    function getTopCut([x1,y1],[x2,y2], currentSegmentAngle) {
        
        // NEXT SEGMENT CALCULATIONS
        // change between points dp[current+1] and dp[current+2]
        const deltaX1To2 = x2 - x1
        const deltaY1To2 = y2 - y1

        const nextSegmentAngle = Math.PI - Math.abs(Math.atan2(deltaY1To2, deltaX1To2))
        const relativeAngle = nextSegmentAngle - currentSegmentAngle

        const topCutAngle = relativeAngle/2
        // console.log(
        //     `Current deltaX1To2 should be 40. It is: ${deltaX1To2}. \n
        //     Current deltaY1To2 should be 40. It is: ${deltaY1To2} (alternating). The sum is ${y2} -${y1}\n
        //     Computing nextSegmentAngle: 180 - ${Math.abs(Math.atan2(deltaY1To2,deltaX1To2))} \n
        //     Current nextSegmentAngle should be 135. It is: ${nextSegmentAngle*(180/Math.PI)}. \n
        //     Relative angles should be 90. They are ${relativeAngle*(180/Math.PI)}\n`
        // )
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
        // console.log(`Current segment length is ${currentSegmentLength}`)

        // calculate angle of current segment
        // const currentSegmentAngle =  Math.atan(deltaXTo1/deltaYTo1) //the breaking change
        const currentSegmentAngle = Math.asin(deltaXTo1/currentSegmentLength)

        let topCutAngle;
        let bottomCutAngle;

        
        if ( i===0 ) { 
            console.log(`Current positionX is: ${dataset[i][0]}, Current postionY is: ${dataset[i][1]}`)
            bottomCutAngle = 0
            console.log(dataset[i+1], dataset[i+2], currentSegmentAngle*(180/Math.PI))
            topCutAngle = getTopCut(dataset[i+1], dataset[i+2], currentSegmentAngle)
            // console.log(`topCutAngle on first segment is ${topCutAngle}`)
            bottomCutHelper = topCutAngle
        } else if (i>0 && i<dataset.length-2) {
            console.log(`Current positionX is: ${dataset[i][0]}, Current postionY is: ${dataset[i][1]}`)
            bottomCutAngle = bottomCutHelper
            // console.log(`Initial bottomCutHelper ${bottomCutHelper}`)
            console.log(dataset[i+1], dataset[i+2], currentSegmentAngle*(180/Math.PI))
            topCutAngle = getTopCut(dataset[i+1], dataset[i+2], currentSegmentAngle)
            bottomCutHelper = topCutAngle
            // console.log(`After update bottomCutHelper${bottomCutHelper}, topCutAngle ${topCutAngle}` )
        } else if (i===dataset.length-2) {
            console.log(`Current positionX is: ${dataset[i][0]}, Current postionY is: ${dataset[i][1]}`)
            console.log(dataset[i+1], dataset[i+2], currentSegmentAngle*(180/Math.PI))
            bottomCutAngle = bottomCutHelper
            topCutAngle = 0   
        }

        const segment = makeSegment(currentSegmentLength,lineWidth,topCutAngle,bottomCutAngle,material)
        console.log(`currentSegmentAngles is ${currentSegmentAngle*(180/Math.PI)}`);
        segment.rotateZ(-currentSegmentAngle)
        segment.position.x=dataset[i][0]
        segment.position.y=dataset[i][1]

        // call makeSegment
        meshesOfLine.push(segment)

    }
    return meshesOfLine;
}


const meshes = buildLine(1,"red", dataset)
const colorWheel = ["red","orange","yellow", "green", "blue", "purple", "black"]

meshes.forEach((mesh,i) => {
    console.log(`Is it a mesh?: ${mesh instanceof THREE.Mesh}`)
    mesh.material = new THREE.MeshBasicMaterial({ color: colorWheel[i] })
    scene.add(mesh);
})

const axesHelper = new THREE.AxesHelper(40)
scene.add(axesHelper)

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	renderer.render( scene, camera );
 }
animate();

// Mesh output disposal
console.log('Current memory use:', renderer.info)


