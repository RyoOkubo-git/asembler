let mytext = document.getElementById('mytext');
let loadButton = document.getElementById('loadButton');
let stepButton = document.getElementById('stepButton');
const processor = new Processor();
loadButton.addEventListener('click', loadStream);
stepButton.addEventListener('click', stepInstruction);

function loadStream(){
    processor.loadInstructions(mytext.value);
}

function stepInstruction(){
    processor.processInstruction();
}