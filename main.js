const reviewTextarea = document.getElementById('reviewTextarea');
const loadButton = document.getElementById('loadButton');
const stepButton = document.getElementById('stepButton');
const runButton = document.getElementById('runButton');
const inputButton = document.getElementById("inputButton");
const inputTextId = document.getElementById("inputTextId");
const stackTable = document.getElementById("stackTable");
const stackStandard = parseInt("0x7fffee90", 16);
const pcStandard = parseInt("0x00400020", 16);
const dataStandard = parseInt("0x10010000", 16);
const stackSize = 100, dataSize = 50, programSize = 100;
const registerNum = 32;
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