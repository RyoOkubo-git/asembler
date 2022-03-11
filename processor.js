class Processor{
    constructor(){
        this.parser = new Parser();
        this.labels = this.parser.labels;
        this.stack = new Array();
        for(let i = 0; i < stackSize; i++){
            this.stack.push(new StackData(0,"digit"));
        }
        this.staticData = this.parser.staticData;
        this.program = this.parser.program;
        this.startLabel;
        this.pc; 
        this.hi = new Register();
        this.lo = new Register();
        this.registers = new Array();
        for(let i = 0; i < registerNum; i++){
            this.registers.push(new Register());
        }
        this.r2i = 
        {"$zero": 0, "$at": 1, "$v0": 2, "$v1": 3, "$a0": 4, "$a1": 5, "$a2": 6, "$a3": 7,
        "$t0": 8, "$t1": 9, "$t2": 10, "$t3": 11, "$t4": 12, "$t5": 13, "$t6": 14, "$t7": 15,
        "$s0": 16, "$s1": 17, "$s2": 18, "$s3": 19, "$s4": 20, "$s5": 21, "$s6": 22, "$s7": 23,
        "$t8": 24, "$t9": 25, "$k0": 26, "$k1": 27, "$gp": 28, "$sp": 29, "$fp": 30, "$ra": 31,}
        this.syscallState = 0;
        this.runState = 0;
        this.execState = 0;
        this.outputController = new OutputController();
    }

    loadInstructions(stream){
        try {
            this.parser.parse(stream);
            this.startLabel = this.parser.startLabel;
            this.registers[this.r2i["$sp"]].value = stackStandard;
            this.pc = this.labels[this.startLabel];
            this.registers[this.r2i["$ra"]].value = -1;
            this.syscallState = 0;
            this.execState = 1;
            this.runState = 0;
            this.outputController.loadAllTable(this.registers, this.staticData, this.program, this.hi, this.lo, this.pc);
            this.outputController.printMessage("Load.\n");
        } catch (error) {
            this.outputController.printMessage(error.message);
        }
    }

    reinitialize(){
        let i;
        this.execState = 0;
        this.syscallState = 0;
        this.runState = 0;
        this.pc = 0;
        this.hi.value = this.lo.value = 0;
        this.hi.dst = this.hi.src = this.lo.dst = this.lo.src = 0;
        this.startLabel = "";
        for(let key in this.labels){
            delete this.labels[key];
        }
        for(i = 0; i < registerNum; i++){
            this.registers[i].value = 0;
            this.registers[i].dst = 0;
            this.registers[i].src = 0;
        }
        for(i = 0; i < stackSize; i++){
            this.stack[i].value = 0;
            this.stack[i].dst = 0;
            this.stack[i].src = 0;
        }
        for(i = 0; i < dataSize; i++){
            this.staticData[i].value = 0;
            this.staticData[i].dst = 0;
            this.staticData[i].src = 0;
        }
        for(i = 0; i < programSize; i++){
            this.program[i].label = "";
            this.program[i].inst.opt = "";
            this.program[i].inst.opd1 = "";
            this.program[i].inst.opd2 = "";
            this.program[i].inst.opd3 = "";
            this.program[i].ln = -1;
            this.program[i].current = 0;
        }
        this.outputController.reinitializeAllTable();
        this.outputController.printMessage("Reinitialized.");
    }

    reExecutionState(){
        this.execState = 1;
        this.syscallState = 0;
        this.runState = 0;
        this.pc = this.labels[this.startLabel];
        this.registers[this.r2i["$ra"]].value = -1;
        this.outputController.printMessage("再実行可能です。\n");
        //this.registers[this.r2i["$sp"]].value = stackStandard;
    }

    executeRun(){
        let programIdx;
        this.runState = 1;
        if(this.execState == 0){
            this.outputController.printMessage("Program is not executable state.\n");
            return;
        }
        if(this.syscallState == 5){
            this.outputController.printMessage("Input Integer and click button.\n");
            return;
        }
        while(this.runState == 1 && this.execState == 1 && this.syscallState != 5){
            programIdx = this.pa2i(this.pc);
            this.pc = this.pc + 4;
            this.processInstruction(this.program[programIdx].inst);
        }
        if(this.syscallState == 5){return;}
        this.runState = 0;
        this.resetDstSrc();
        this.outputController.afterRunAllTable(this.registers, this.stack, this.hi, this.lo, this.pc);
    }

    resetDstSrc(){
        let i;
        this.hi.dst = this.hi.src = this.lo.dst = this.lo.src = 0;
        for(i = 0; i < registerNum; i++){
            this.registers[i].dst = 0;
            this.registers[i].src = 0;
        }
        for(i = 0; i < stackSize; i++){
            this.stack[i].dst = 0;
            this.stack[i].src = 0;
        }
    }

    executeStep(){
        if(this.execState == 0){
            this.outputController.printMessage("Program is not executable state.\n");
            return;
        }
        if(this.syscallState == 5){
            this.outputController.printMessage("Input Integer and click button.\n");
            return;
        }
        const programIdx = this.pa2i(this.pc);
        this.program[programIdx].current = 1;
        this.pc = this.pc + 4;
        this.processInstruction(this.program[programIdx].inst);
        this.outputController.rewriteAllTable(this.registers, this.stack, this.program, this.hi, this.lo, this.pc);
        this.hi.dst = this.hi.src = this.lo.dst = this.lo.src = 0;
    }

    processInstruction(inst){
        switch(inst.opt){
            case "li" : this.processLi(inst); break;
            case "move" : this.processMove(inst); break;
            case "add" : this.processAdd(inst); break;
            case "addi" : this.processAddi(inst); break;
            case "sub" : this.processSub(inst); break;
            case "mult" : this.processMult(inst); break;
            case "div" : this.processDiv(inst); break;
            case "mfhi" : this.processMfhi(inst); break;
            case "mflo" : this.processMflo(inst); break;
            case "and" : this.processAnd(inst); break;
            case "andi" : this.processAndi(inst); break;
            case "or" : this.processOr(inst); break;
            case "ori" : this.processOri(inst); break;
            case "not" : this.processNot(inst); break;
            case "xor" : this.processXor(inst); break;
            case "xori" : this.processXori(inst); break;
            case "sll" : this.processSll(inst); break;
            case "srl" : this.processSrl(inst); break;
            case "sra" : this.processSra(inst); break;
            case "sw" : this.processSw(inst); break;
            case "lw" : this.processLw(inst); break;
            case "la" : this.processLa(inst); break;
            case "slt" : this.processSlt(inst); break;
            case "slti" : this.processSlti(inst); break;
            case "seq" : this.processSeq(inst); break;
            case "sge" : this.processSge(inst); break;
            case "sgt" : this.processSgt(inst); break;
            case "sle" : this.processSle(inst); break;
            case "sne" : this.processSne(inst); break;
            case "beq" : this.processBeq(inst); break;
            case "bne" : this.processBne(inst); break;
            case "b" : this.processB(inst); break;
            case "j" : this.processJ(inst); break;
            case "jr" : this.processJr(inst); break;
            case "jal" : this.processJal(inst); break;
            case "syscall" : this.processSyscall(); break;
            default:
                throw new Error(`No such instruction. "${inst.opt}"`);
        }
    }

    processLi(inst){
        const reg = this.r2i[inst.opd1];
        this.registers[reg].value = parseInt(inst.opd2, 10);
        this.registers[reg].dst = 1;
    }

    processMove(inst){
        const reg1 = this.r2i[inst.opd1];
        const reg2 = this.r2i[inst.opd2];
        this.registers[reg1].value = this.registers[reg2].value;
        this.registers[reg1].dst = 1;
        this.registers[reg2].src = 1;
    }

    processAdd(inst){
        const reg1 = this.r2i[inst.opd1];
        const reg2 = this.r2i[inst.opd2];
        const reg3 = this.r2i[inst.opd3];
        this.registers[reg1].value = this.registers[reg2].value + this.registers[reg3].value;
        this.registers[reg1].dst = 1;
        this.registers[reg2].src = 1;
        this.registers[reg3].src = 1;
    }

    processAddi(inst){
        const reg1 = this.r2i[inst.opd1];
        const reg2 = this.r2i[inst.opd2];
        this.registers[reg1].value = this.registers[reg2].value + parseInt(inst.opd3, 10);
        this.registers[reg1].dst = 1;
        this.registers[reg2].src = 1;
    }

    processSub(inst){
        const reg1 = this.r2i[inst.opd1];
        const reg2 = this.r2i[inst.opd2];
        const reg3 = this.r2i[inst.opd3];
        this.registers[reg1].value = this.registers[reg2].value - this.registers[reg3].value;
        this.registers[reg1].dst = 1;
        this.registers[reg2].src = 1;
        this.registers[reg3].src = 1;
    }

    processMult(inst){
        const reg1id = this.r2i[inst.opd1];
        const reg2id = this.r2i[inst.opd2];
        const reg1 = this.registers[reg1id].value;
        const reg2 = this.registers[reg2id].value;
        let bit1 = new Array(32).fill(0);
        let bit2 = new Array(32).fill(0);
        let bit3 = new Array(64).fill(0);
        let i, c = 0, shift = 1;
        this.hi.value = 0, this.lo.value = 0;
        for(i = 0; i < 32; i++){
            if((reg1 & shift) != 0){bit1[i] = 1;}
            if((reg2 & shift) != 0){bit2[i] = 1;}
            shift = shift << 1;
        }
    
        for(i = 0; i < 32; i++){
            if(bit2[i] == 1){
                c = this.bitAdder(bit3, bit1, i, c);
            }
        }
    
        shift = 1;
        for(i = 0; i < 32; i++){
            this.lo.value = this.lo.value + bit3[i]*shift;
            this.hi.value = this.hi.value + bit3[i+32]*shift;
            shift = shift << 1;
        }
        this.registers[reg1id].src = 1;
        this.registers[reg2id].src = 1;
        this.hi.dst = 1;
        this.lo.dst = 1;
    }
    
    bitAdder(dst, src, num, c){
        let i, d, s;
        for(i = 0; i < 32; i++){
            d = dst[i+num]; s = src[i];
            dst[i+num] = (d ^ s ^ c);
            c = ((d & s) | ((d ^ s) & c));
        }
        return c;
    }

    processDiv(inst){
        const reg1id = this.r2i[inst.opd1];
        const reg2id = this.r2i[inst.opd2];
        const reg1 = this.registers[reg1id].value;
        const reg2 = this.registers[reg2id].value;
        this.hi.value = reg1 % reg2;
        this.lo.value = Math.floor(reg1 / reg2);
        this.registers[reg1id].src = 1;
        this.registers[reg2id].src = 1;
        this.hi.dst = 1;
        this.lo.dst = 1;
    }

    processMfhi(inst){
        const reg1 = this.r2i[inst.opd1];
        this.registers[reg1].value = this.hi.value;
        this.registers[reg1].dst = 1;
        this.hi.src = 1;
    }

    processMflo(inst){
        const reg1 = this.r2i[inst.opd1];
        this.registers[reg1].value = this.lo.value;
        this.registers[reg1].dst = 1;
        this.lo.src = 1;
    }

    processAnd(inst){
        const reg1 = this.r2i[inst.opd1];
        const reg2 = this.r2i[inst.opd2];
        const reg3 = this.r2i[inst.opd3];
        this.registers[reg1].value = this.registers[reg2].value & this.registers[reg3].value;
        this.registers[reg1].dst = 1;
        this.registers[reg2].src = 1;
        this.registers[reg3].src = 1;
    }

    processAndi(inst){
        const reg1 = this.r2i[inst.opd1];
        const reg2 = this.r2i[inst.opd2];
        this.registers[reg1].value = this.registers[reg2].value & parseInt(inst.opd3, 10);
        this.registers[reg1].dst = 1;
        this.registers[reg2].src = 1;
    }

    processOr(inst){
        const reg1 = this.r2i[inst.opd1];
        const reg2 = this.r2i[inst.opd2];
        const reg3 = this.r2i[inst.opd3];
        this.registers[reg1].value = this.registers[reg2].value | this.registers[reg3].value;
        this.registers[reg1].dst = 1;
        this.registers[reg2].src = 1;
        this.registers[reg3].src = 1;
    }

    processOri(inst){
        const reg1 = this.r2i[inst.opd1];
        const reg2 = this.r2i[inst.opd2];
        this.registers[reg1].value = this.registers[reg2].value | parseInt(inst.opd3, 10);
        this.registers[reg1].dst = 1;
        this.registers[reg2].src = 1;
    }

    processNot(inst){
        const reg1 = this.r2i[inst.opd1];
        const reg2 = this.r2i[inst.opd2];
        this.registers[reg1].value = ~this.registers[reg2].value;
        this.registers[reg1].dst = 1;
        this.registers[reg2].src = 1;
    }

    processXor(inst){
        const reg1 = this.r2i[inst.opd1];
        const reg2 = this.r2i[inst.opd2];
        const reg3 = this.r2i[inst.opd3];
        this.registers[reg1].value = this.registers[reg2].value ^ this.registers[reg3].value;
        this.registers[reg1].dst = 1;
        this.registers[reg2].src = 1;
        this.registers[reg3].src = 1;
    }

    processXori(inst){
        const reg1 = this.r2i[inst.opd1];
        const reg2 = this.r2i[inst.opd2];
        this.registers[reg1].value = this.registers[reg2].value ^ parseInt(inst.opd3, 10);
        this.registers[reg1].dst = 1;
        this.registers[reg2].src = 1;
    }

    processSll(inst){
        const reg1 = this.r2i[inst.opd1];
        const reg2 = this.r2i[inst.opd2];
        this.registers[reg1].value = this.registers[reg2].value << parseInt(inst.opd3, 10);
        this.registers[reg1].dst = 1;
        this.registers[reg2].src = 1;
    }

    processSrl(inst){
        const reg1 = this.r2i[inst.opd1];
        const reg2 = this.r2i[inst.opd2];
        this.registers[reg1].value = this.registers[reg2].value >>> parseInt(inst.opd3, 10);
        this.registers[reg1].dst = 1;
        this.registers[reg2].src = 1;
    }

    processSra(inst){
        const reg1 = this.r2i[inst.opd1];
        const reg2 = this.r2i[inst.opd2];
        this.registers[reg1].value = this.registers[reg2].value >> parseInt(inst.opd3, 10);
        this.registers[reg1].dst = 1;
        this.registers[reg2].src = 1;
    }

    processSw(inst){
        const reg1 = this.r2i[inst.opd1];
        const reg3 = this.r2i[inst.opd3];
        const address = this.sa2i(this.registers[reg3].value + parseInt(inst.opd2, 10));
        this.stack[address].value = this.registers[reg1].value;
        this.stack[address].kind = "digit";
        this.stack[address].dst = 1;
        this.registers[reg1].src = 1;
        this.registers[reg3].src = 1;
    }

    processLw(inst){
        const reg1 = this.r2i[inst.opd1];
        const reg3 = this.r2i[inst.opd3];
        let idx;
        const address = this.registers[reg3].value + parseInt(inst.opd2, 10);
        if(this.addressInStack(address)){
            idx = this.sa2i(address);
            this.registers[reg1].value = this.stack[idx].value;
            this.stack[idx].src = 1;
        }else if(this.addressInData(address)){
            idx = this.da2i(address);
            this.registers[reg1].value = this.staticData[idx].value;
        }else if(this.addressInProgram(address)){
            throw new Error(`Sorry. You can't access to program`);
        }else{
            throw new Error(`Address 0x${address.toString(16)} is out of range.`);
        }
        this.registers[reg1].dst = 1;
        this.registers[reg3].src = 1;
    }

    processLa(inst){
        const reg1 = this.r2i[inst.opd1];
        if(!(inst.opd2 in this.labels)){throw new Error(`No such label. "${inst.opd2}"`);}
        this.registers[reg1].value = this.labels[inst.opd2];
        this.registers[reg1].dst = 1;
    }

    processSlt(inst){
        const reg1 = this.r2i[inst.opd1];
        const reg2 = this.r2i[inst.opd2];
        const reg3 = this.r2i[inst.opd3];
        this.registers[reg1].value = (this.registers[reg2].value < this.registers[reg3].value) ? 1 : 0;
        this.registers[reg1].dst = 1;
        this.registers[reg2].src = 1;
        this.registers[reg3].src = 1;
    }

    processSlti(inst){
        const reg1 = this.r2i[inst.opd1];
        const reg2 = this.r2i[inst.opd2];
        this.registers[reg1].value = (this.registers[reg2].value < parseInt(inst.opd3, 10)) ? 1 : 0;
        this.registers[reg1].dst = 1;
        this.registers[reg2].src = 1;
    }

    processSeq(inst){
        const reg1 = this.r2i[inst.opd1];
        const reg2 = this.r2i[inst.opd2];
        const reg3 = this.r2i[inst.opd3];
        this.registers[reg1].value = (this.registers[reg2].value == this.registers[reg3].value) ? 1 : 0;
        this.registers[reg1].dst = 1;
        this.registers[reg2].src = 1;
        this.registers[reg3].src = 1;
    }

    processSge(inst){
        const reg1 = this.r2i[inst.opd1];
        const reg2 = this.r2i[inst.opd2];
        const reg3 = this.r2i[inst.opd3];
        this.registers[reg1].value = (this.registers[reg2].value >= this.registers[reg3].value) ? 1 : 0;
        this.registers[reg1].dst = 1;
        this.registers[reg2].src = 1;
        this.registers[reg3].src = 1;
    }

    processSgt(inst){
        const reg1 = this.r2i[inst.opd1];
        const reg2 = this.r2i[inst.opd2];
        const reg3 = this.r2i[inst.opd3];
        this.registers[reg1].value = (this.registers[reg2].value > this.registers[reg3].value) ? 1 : 0;
        this.registers[reg1].dst = 1;
        this.registers[reg2].src = 1;
        this.registers[reg3].src = 1;
    }

    processSle(inst){
        const reg1 = this.r2i[inst.opd1];
        const reg2 = this.r2i[inst.opd2];
        const reg3 = this.r2i[inst.opd3];
        this.registers[reg1].value = (this.registers[reg2].value <= this.registers[reg3].value) ? 1 : 0;
        this.registers[reg1].dst = 1;
        this.registers[reg2].src = 1;
        this.registers[reg3].src = 1;
    }

    processSne(inst){
        const reg1 = this.r2i[inst.opd1];
        const reg2 = this.r2i[inst.opd2];
        const reg3 = this.r2i[inst.opd3];
        this.registers[reg1].value = (this.registers[reg2].value != this.registers[reg3].value) ? 1 : 0;
        this.registers[reg1].dst = 1;
        this.registers[reg2].src = 1;
        this.registers[reg3].src = 1;
    }

    processBeq(inst){
        const reg1 = this.r2i[inst.opd1];
        const reg2 = this.r2i[inst.opd2];
        if(!(inst.opd3 in this.labels)){throw new Error(`No such label. "${inst.opd3}"`);}
        if(this.registers[reg1].value == this.registers[reg2].value){
            this.pc = this.labels[inst.opd3];
        }
        this.registers[reg1].src = 1;
        this.registers[reg2].src = 1;
    }

    processBne(inst){
        const reg1 = this.r2i[inst.opd1];
        const reg2 = this.r2i[inst.opd2];
        if(!(inst.opd3 in this.labels)){throw new Error(`No such label. "${inst.opd3}"`);}
        if(this.registers[reg1].value != this.registers[reg2].value){
            this.pc = this.labels[inst.opd3];
        }
        this.registers[reg1].src = 1;
        this.registers[reg2].src = 1;
    }
    
    processB(inst){
        if(!(inst.opd1 in this.labels)){throw new Error(`No such label. "${inst.opd1}"`);}
        this.pc = this.labels[inst.opd1];
    }

    processJ(inst){
        if(!(inst.opd1 in this.labels)){throw new Error(`No such label. "${inst.opd1}"`);}
        this.pc = this.labels[inst.opd1];
    }

    processJr(inst){
        const reg1 = this.r2i[inst.opd1];
        const address = this.registers[reg1].value;
        if(address < 0){ this.execState = 0; this.runState = 0; return;/* program terminate */ }
        if(address < pcStandard || pcStandard + 4*programSize <= address){throw new Error("invalid access. 0x" + address.toString(16));}
        this.pc = address;
        this.registers[reg1].src = 1;
    }

    processJal(inst){
        if(!(inst.opd1 in this.labels)){throw new Error(`No such label. "${inst.opd1}"`);}
        this.registers[this.r2i["$ra"]].value = this.pc;
        this.registers[this.r2i["$ra"]].dst = 1;
        this.pc = this.labels[inst.opd1];
    }

    processSyscall(){
        this.syscallState = this.registers[this.r2i["$v0"]].value;
        switch(this.syscallState){
            case 1 : this.outputController.printDisplay(this.outputInt()); this.syscallState = 0; break;
            case 4 : this.outputController.printDisplay(this.makeString()); this.syscallState = 0; break;
            case 5 : this.outputController.printMessage("Input integer and click button.\n"); break;
            default:
                throw new Error(`Sorry. This program can't use syscall number "${this.syscallState}".`);
        }
    }

    makeString(){
        let address = this.registers[this.r2i["$a0"]].value;
        if(address < dataStandard || dataStandard + 4*dataSize < address){throw new Error(`out of data segment`)}
        let str = "";
        let dataIdx = this.da2i(address);
        let c = this.staticData[dataIdx];
        while(c.value != "\0"){
            if(c.kind != "asciidata"){throw new Error(`This is not character`)}
            str = str + c.value;
            address = address + 4;
            dataIdx = this.da2i(address);
            c = this.staticData[dataIdx];
        }
        return str;
    }

    outputInt(){
        return String(this.registers[this.r2i["$a0"]].value) + "\n";
    }

    inputText(text){
        const regexp = RegExp('^[+-]?[0-9]+', 'g');
        if(this.syscallState != 5){
            this.outputController.printMessage("Now is not input phase.\n");
        }else if(!regexp.test(text)){
            this.outputController.printMessage("Only a number will be accepted.\n");
        }else{
            const num = parseInt(text, 10);
            this.registers[this.r2i["$v0"]].value = num;
            this.syscallState = 0;
            this.outputController.printMessage("Accepted.\n");
            this.outputController.printDisplay(text+"\n");
            if(this.runState == 1){this.executeRun();}
        }
    }

    da2i(address){  //data address to index
        return Math.floor((address - dataStandard) / 4);
    }

    pa2i(address){  //program address to index
        return Math.floor((address - pcStandard) / 4);
    }

    sa2i(address){  // stack address to index
        return stackSize - Math.floor((stackStandard - address) / 4);
    }

    addressInData(address){
        return (dataStandard <= address && address < dataStandard + 4*dataSize);
    }

    addressInStack(address){
        return (stackStandard - 4*stackSize <= address && address <= stackStandard);
    }

    addressInProgram(address){
        return (pcStandard <= address && address < pcStandard + 4*programSize);
    }
}