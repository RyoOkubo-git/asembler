class OutputController{
    constructor(){
        this.displayId = document.getElementById("display");
        this.messageId = document.getElementById("message");
    }

    rewriteAllTable(r, s, p, hi, lo, pc){
        this.rewriteRegisterTable(r);
        this.rewriteOtherRegisterTable(hi, lo, pc);
        this.rewriteStackTable(s);
        this.rewriteProgramTable(p);
    }

    rewriteRegisterTable(registers){
        let cellId;
        for(let i = 0; i < registerNum; i++){
            cellId = document.getElementById("registerTableCell"+String(i));
            cellId.innerHTML = registers[i].value;
            const dst = registers[i].dst;
            const src = registers[i].src;
            if(dst == 1 && src == 1){
                cellId.style.backgroundColor = "#9370db";
            }else if(dst == 1){
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
        cellIdHi.innerHTML = hi.value;
        cellIdLo.innerHTML = lo.value;
        cellIdPc.innerHTML = pc;
        if(hi.dst == 1){
            cellIdHi.style.backgroundColor = "#ffc0cb";
        }else if(hi.src == 1){
            cellIdHi.style.backgroundColor = "#7fffd4";
        }else{
            cellIdHi.style.backgroundColor = "#ffffff";
        }
        if(lo.dst == 1){
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
            cellId.innerHTML = stack[i].value;
            const dst = stack[i].dst;
            const src = stack[i].src;
            if(dst == 1 && src == 1){
                cellId.style.backgroundColor = "#9370db";
                stack[i].dst = 0;
                stack[i].src = 0;
            }else if(dst == 1){
                cellId.style.backgroundColor = "#ffc0cb";
                stack[i].dst = 0;
            }else if(src == 1){
                cellId.style.backgroundColor = "#7fffd4";
                stack[i].src = 0;
            }else{
                cellId.style.backgroundColor = "#ffffff";
            }
        }
    }

    rewriteProgramTable(program){
        let cellId;
        for(let i = 0; i < programSize; i++){
            cellId = document.getElementById("programTableData"+String(i));
            const opt = program[i].inst.opt;
            const opd1 = program[i].inst.opd1;
            const opd2 = program[i].inst.opd2;
            const opd3 = program[i].inst.opd3;
            let str = "";
            if(opt == "sw", opt == "lw"){
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
            if(program[i].current == 1){
                cellId.style.backgroundColor = "#ffd700";
                program[i].current = 0;
            }else{
                cellId.style.backgroundColor = "#ffffff";
            }
            cellId.innerHTML = str;
        }
    }

    printDisplay(str){
        this.displayId.value = this.displayId.value + str;
    }

    printMessage(str){
        this.messageId.value = str;
    }
}