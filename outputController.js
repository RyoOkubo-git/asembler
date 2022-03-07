class OutputController{
    constructor(){
        //his.registerTableId = r;
        //this.stackTableId = s;
        //this.programTableId = p;
        this.displayId = document.getElementById("display");
        this.messageId = document.getElementById("message");
    }

    makeAllTable(r, s, p){
        this.makeRegisterTable(r);
        this.makeStackTable(s);
        this.makeProgramTable(p);
    }

    makeRegisterTable(registers){
        let cellId;
        for(let i = 0; i < 32; i++){
            cellId = document.getElementById("registerTableCell"+String(i));
            cellId.innerHTML = registers[i].value;
            const dst = registers[i].dst;
            const src = registers[i].src;
            if(dst == 1 && src == 1){
                cellId.style.backgroundColor = "#9370db";
                registers[i].dst = 0;
                registers[i].src = 0;
            }else if(dst == 1){
                cellId.style.backgroundColor = "#ffc0cb";
                registers[i].dst = 0;
            }else if(src == 1){
                cellId.style.backgroundColor = "#7fffd4";
                registers[i].src = 0;
            }else{
                cellId.style.backgroundColor = "#ffffff";
            }
        }
    }

    makeStackTable(stack){
        let cellId;
        for(let i = 0; i < 100; i++){
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

    makeProgramTable(program){
        let cellId;
        for(let i = 0; i < 100; i++){
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