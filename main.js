let reviewTextarea = document.getElementById('reviewTextarea');
let loadButton = document.getElementById('loadButton');
let stepButton = document.getElementById('stepButton');
let inputButton = document.getElementById("inputButton");
let inputTextId = document.getElementById("inputTextId");
let stackTable = document.getElementById("stackTable");
const processor = new Processor();
loadButton.addEventListener('click', loadStream);
runButton.addEventListener('click', runInstruction);
stepButton.addEventListener('click', stepInstruction);
inputButton.addEventListener('click', inputButtonClick);
stackTable.scrollIntoView(false);

function loadStream(){
    processor.loadInstructions(reviewTextarea.value);
}

function runInstruction(){
    processor.executeRun();
}

function stepInstruction(){
    processor.executeStep();
}

function inputButtonClick(){
    processor.inputText(inputTextId.value);
    inputTextId.value = "";
}