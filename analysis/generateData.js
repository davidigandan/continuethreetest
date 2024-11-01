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