class OutputController{
    constructor(){
        this.displayId = document.getElementById("display");
        this.messageId = document.getElementById("message");
        this.makeStackTable();
        this.makeProgramTable();
    }

    makeStackTable(){
        let stackTableId = document.getElementById('stackTable');
        for(let i=0; i<stackSize; i++){
            let tr = document.createElement('tr');
            let td1 = document.createElement('td');
            let td2 = document.createElement('td');
            td1.innerHTML = "0x" + (stackStandard-4*(stackSize-i)).toString(16);
            td2.innerHTML = "0";
            td2.id="stackTableAddress"+String(i);
            td2.id="stackTableData"+String(i);
            td2.align="center";
            tr.appendChild(td1);
            tr.appendChild(td2);
            stackTableId.appendChild(tr);
        }
    }

    makeProgramTable(){
        let programTableId = document.getElementById('programTable');
        for(let i = 0; i < programSize; i++){
            let tr = document.createElement('tr');
            let td1 = document.createElement('td');
            let td2 = document.createElement('td');
            td1.innerHTML = "0x" + (pcStandard + 4*i).toString(16);
            td2.innerHTML = String("");
            td2.id = "programTableAddress"+String(i);
            td2.id = "programTableData"+String(i);
            tr.appendChild(td1);
            tr.appendChild(td2);
            programTableId.appendChild(tr);
        }
    }

    loadAllTable(r, p, hi, lo, pc){
        this.loadRegisterTable(r);
        this.loadOtherRegisterTable(hi, lo, pc);
        this.loadProgramTable(p);
    }

    loadRegisterTable(registers){
        let cellId;
        for(let i = 0; i < registerNum; i++){
            cellId = document.getElementById("registerTableCell"+String(i));           
            cellId.innerHTML = this.d2x(registers[i].value);
        }
    }

    loadOtherRegisterTable(hi, lo, pc){
        const cellIdHi = document.getElementById("registerTableCell"+String(registerNum));
        const cellIdLo = document.getElementById("registerTableCell"+String(registerNum+1));
        const cellIdPc = document.getElementById("registerTableCell"+String(registerNum+2));        
        cellIdPc.innerHTML = this.d2x(pc);
        cellIdHi.innerHTML = this.d2x(hi.value);
        cellIdLo.innerHTML = this.d2x(lo.value);        
    }

    loadProgramTable(program){
        let cellId;
        for(let i = 0; i < programSize; i++){
            cellId = document.getElementById("programTableData" + String(i));
            const opt = program[i].inst.opt;
            const opd1 = program[i].inst.opd1;
            const opd2 = program[i].inst.opd2;
            const opd3 = program[i].inst.opd3;
            let str = "";
            if(opt == "sw" || opt == "lw"){
                str = `${opt} ${opd1} ${opd2}(${opd3})`
            }else if(opd1 == ""){
                str = `${opt}`
            }else if(opd2 == ""){
                str = `${opt} ${opd1}`
            }else if(opd3 == ""){
                str = `${opt} ${opd1}, ${opd2}`
            }else{
                str = `${opt} ${opd1}, ${opd2}, ${opd3}`
            }
            cellId.innerHTML = str;
        }
    }

    rewriteAllTable(r, s, p, hi, lo, pc){
        this.rewriteRegisterTable(r);
        this.rewriteOtherRegisterTable(hi, lo, pc);
        this.rewriteStackTable(s);
        this.highlightProgramTable(p);
    }

    rewriteRegisterTable(registers){
        let cellId;
        for(let i = 0; i < registerNum; i++){
            cellId = document.getElementById("registerTableCell"+String(i));           
            const dst = registers[i].dst;
            const src = registers[i].src;
            if(dst == 1 && src == 1){
                cellId.innerHTML = this.d2x(registers[i].value);
                cellId.style.backgroundColor = "#9370db";
            }else if(dst == 1){
                cellId.innerHTML = this.d2x(registers[i].value);
                cellId.style.backgroundColor = "#ffc0cb";
            }else if(src == 1){
                cellId.style.backgroundColor = "#7fffd4";
            }else{
                cellId.style.backgroundColor = "#ffffff";
            }
            registers[i].dst = 0;
            registers[i].src = 0;
        }
    }

    rewriteOtherRegisterTable(hi, lo, pc){
        const cellIdHi = document.getElementById("registerTableCell"+String(registerNum));
        const cellIdLo = document.getElementById("registerTableCell"+String(registerNum+1));
        const cellIdPc = document.getElementById("registerTableCell"+String(registerNum+2));        
        cellIdPc.innerHTML = this.d2x(pc);
        if(hi.dst == 1){
            cellIdHi.innerHTML = this.d2x(hi.value);
            cellIdHi.style.backgroundColor = "#ffc0cb";
        }else if(hi.src == 1){
            cellIdHi.style.backgroundColor = "#7fffd4";
        }else{
            cellIdHi.style.backgroundColor = "#ffffff";
        }
        if(lo.dst == 1){
            cellIdLo.innerHTML = this.d2x(lo.value);
            cellIdLo.style.backgroundColor = "#ffc0cb";
        }else if(lo.src == 1){
            cellIdLo.style.backgroundColor = "#7fffd4";
        }else{
            cellIdLo.style.backgroundColor = "#ffffff";
        }
        hi.dst = hi.src = lo.dst = lo.src = 0;
    }

    rewriteStackTable(stack){
        let cellId;
        for(let i = 0; i < stackSize; i++){
            cellId = document.getElementById("stackTableData"+String(i));
            const dst = stack[i].dst;
            const src = stack[i].src;
            if(dst == 1 && src == 1){
                cellId.innerHTML = this.d2x(stack[i].value);
                cellId.style.backgroundColor = "#9370db";
            }else if(dst == 1){
                cellId.innerHTML = this.d2x(stack[i].value);
                cellId.style.backgroundColor = "#ffc0cb";
            }else if(src == 1){
                cellId.style.backgroundColor = "#7fffd4";
            }else{
                cellId.style.backgroundColor = "#ffffff";
            }
            stack[i].dst = 0;
            stack[i].src = 0;
        }
    }

    d2x(val){
        if((stackStandard - 4*stackSize <= val && val <= stackStandard) ||
            (dataStandard <= val && val < dataStandard + 4*dataSize) ||
            (pcStandard <= val && val < pcStandard + 4*programSize)){
                return "0x" + val.toString(16)
        }else{
            return String(val);
        }
    }

    highlightProgramTable(program){
        let cellId;
        for(let i = 0; i < programSize; i++){
            cellId = document.getElementById("programTableData"+String(i));
            if(program[i].current == 1){
                cellId.style.backgroundColor = "#ffd700";
                program[i].current = 0;
            }else{
                cellId.style.backgroundColor = "#ffffff";
            }
        }
    }

    printDisplay(str){
        this.displayId.value = this.displayId.value + str;
    }

    printMessage(str){
        this.messageId.value = str;
    }
}