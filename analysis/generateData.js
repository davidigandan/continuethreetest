import random from 'lcg-random';


export function generateRandom(xStart, xStop, xStep, yMin, yMax, seed) {
    const dataset=[]
    const randomGenerator = random({seed: seed})
    for(let i = xStart; i<xStop; i+=xStep) {
        dataset.push([i,yMin + randomGenerator() * (yMax-yMin)])
    }
    return dataset
}


export function sine(start, stop, step=1) {
    const dataset=[];
    for(let i = start; i<stop; i+=step) {
        dataset.push([i, Math.sin(i)])
    }
    return dataset;
} 


// export  function random(seed) {
//     const dataset=[]

// }