const reviewTextarea = document.getElementById('reviewTextarea');
const loadButton = document.getElementById('loadButton');
const stepButton = document.getElementById('stepButton');
const runButton = document.getElementById('runButton');
const reinitializeButton = document.getElementById('reinitializeButton');
const reExeButton = document.getElementById('reExeButton');
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
reinitializeButton.addEventListener('click', callReinitialize);
reExeButton.addEventListener("click", callReExecutionState);
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

function callReinitialize(){
    processor.reinitialize();
}

function callReExecutionState(){
    processor.reExecutionState();
}

const initCode = ".data\nlist: .word 1, 2, 3, 4, 5, 6, 7, 8, 9, 10\n\n      .text\n      .globl main\n\nmain: addi $sp, $sp, -4 #>スタックに 1 ワードの領域を確保\n      sw $ra, 0($sp) # 戻り先アドレスの退避\n      la $a0, list # 第 1 引 数 = データ領域 list のアドレス\n      li $a1, 10 # 第 2 引数 = 10 データ数\n      jal sum # サブルーチン sum の呼び出し\n      move $a0, $v0 # システムコールの引数 = sum の戻り値 $v0 総和\n      li $v0, 1 # print_integer の指定\n      syscall # 総和の>出力\n      lw $ra, 0($sp) # 戻り先アドレスの復元\n      addi $sp, $sp, 4 # スタックに確保した領域の開放\n      jr $ra\n\nsum:  addi $sp, $sp, -4 # スタックに 1 ワードの領域を確保\n      sw $s0, 0($sp) # $s0 の退避\n      li $v0, 0\nl1:   lw $s0 , 0($a0)\n      add $v0, $v0, $s0\n      addi $a0, $a0, 4\n      addi $a1, $a1, -1\n      bne $a1, $zero, l1\n      lw $s0, 0($sp) # $s0 の回復\n      addi $sp, $sp, 4 # スタックに確保した領域の開放\n      jr $ra"
reviewTextarea.value = initCode