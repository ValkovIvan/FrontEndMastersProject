const timesToRepeat = 10;
let charachter = '&';

for(let i=0; i<timesToRepeat; i++){
    charachter = `${charachter}&`
}

console.log(charachter);
console.log(charachter.length)