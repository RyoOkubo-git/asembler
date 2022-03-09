class OutputController{
    constructor(){
        this.displayId = document.getElementById("display");
        this.messageId = document.getElementById("message");
        this.makeDataTable();
        this.makeStackTable();
        this.makeProgramTable();
    }

    makeDataTable(){
        let dataTableId = document.getElementById('dataTable');
        for(let i=0; i<dataSize; i++){
            let tr = document.createElement('tr');
            let th = document.createElement('th');
            let td = document.createElement('td');
            th.innerHTML = "0x" + (dataStandard+4*i).toString(16);
            th.classList.add("th-cssNoneBorder");
            td.innerHTML = "0";
            td.classList.add("td-data");
            td.id="dataTableAddress"+String(i);
            td.id="dataTableData"+String(i);
            tr.appendChild(th);
            tr.appendChild(td);
            dataTableId.appendChild(tr);
        }
    }

    makeStackTable(){
        let stackTableId = document.getElementById('stackTable');
        for(let i=0; i<=stackSize; i++){
            let tr = document.createElement('tr');
            let th = document.createElement('th');
            let td = document.createElement('td');
            let tdSp = document.createElement('td');
            tdSp.classList.add("td-arrow");
            th.innerHTML = "0x" + (stackStandard-4*(stackSize-i)).toString(16);
            th.classList.add("th-cssNoneBorder");
            td.innerHTML = "0";
            td.classList.add("td-data");
            tdSp.id = "stackTableArrow" + String(i);
            td.id="stackTableAddress" + String(i);
            td.id="stackTableData" + String(i);
            tr.appendChild(tdSp);
            tr.appendChild(th);
            tr.appendChild(td);
            stackTableId.appendChild(tr);
        }
    }

    makeProgramTable(){
        let programTableId = document.getElementById('programTable');
        for(let i = 0; i < programSize; i++){
            let tr = document.createElement('tr');
            let th = document.createElement('th');
            let td = document.createElement('td');
            let tdPc = document.createElement('td');
            let tdLabel = document.createElement('td');
            tdPc.classList.add("td-arrow");
            th.innerHTML = "0x" + (pcStandard + 4*i).toString(16);
            th.classList.add("th-cssNoneBorder");
            td.classList.add("td-program");
            td.innerHTML = String("");
            tdLabel.classList.add("td-label");
            tdPc.id = "programTableArrow" + String(i);
            td.id = "programTableAddress" + String(i);
            td.id = "programTableData" + String(i);
            tdLabel.id = "programTableLabel" + String(i);
            tr.appendChild(tdPc);
            tr.appendChild(th);
            tr.appendChild(td);
            tr.appendChild(tdLabel);
            programTableId.appendChild(tr);
        }
    }

    loadAllTable(r, d, p, hi, lo, pc){
        this.loadRegisterTable(r);
        this.loadOtherRegisterTable(hi, lo, pc);
        this.loadDataTable(d);
        this.loadProgramTable(p, pc);
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

    loadDataTable(staticData){
        let cellId, kind, value;
        for(let i = 0; i < dataSize; i++){
            cellId = document.getElementById("dataTableData"+String(i));
            kind = staticData[i].kind;
            value = staticData[i].value;
            if(kind == "asciidata" && value == "\n"){
                cellId.innerHTML = "\\n";
            }else if(kind == "asciidata" && value == "\0"){
                cellId.innerHTML = "\\0";
            }else{
                cellId.innerHTML = value;
            }
        }
    }

    loadProgramTable(program, pc){
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
            cellId = document.getElementById("programTableLabel" + String(i));
            cellId.innerHTML = program[i].label;
            cellId = document.getElementById("programTableArrow" + String(i));
            if(pc == pcStandard + 4*i){
                cellId.innerHTML = "pc → ";
            }else{
                cellId.innerHTML = ""
            }
        }
    }

    rewriteAllTable(r, s, p, hi, lo, pc){
        this.rewriteRegisterTable(r);
        this.rewriteOtherRegisterTable(hi, lo, pc);
        this.rewriteStackTable(s, r[29].value);
        this.highlightProgramTable(p, pc);
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

    rewriteStackTable(stack, address){
        const spIdx = stackSize - Math.floor((stackStandard - address) / 4);
        let cellId;
        for(let i = 0; i < stackSize; i++){
            cellId = document.getElementById("stackTableData"+String(i));
            if(i < spIdx){
                cellId.style.backgroundColor = "#c0c0c0";
            }else{
                cellId.style.backgroundColor = "#ffffff";
            }
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
            }
            stack[i].dst = 0;
            stack[i].src = 0;
            cellId = document.getElementById("stackTableArrow"+i);
            if(spIdx == i){
                cellId.innerHTML = "sp → ";
            }else{
                cellId.innerHTML = ""
            }
        }
        cellId = document.getElementById("stackTableArrow"+stackSize);
        if(spIdx == stackSize){
            cellId.innerHTML = "sp → ";
        }else{
            cellId.innerHTML = ""
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

    highlightProgramTable(program, pc){
        let cellId;
        for(let i = 0; i < programSize; i++){
            cellId = document.getElementById("programTableData" + String(i));
            if(program[i].current == 1){
                cellId.style.backgroundColor = "#ffd700";
                program[i].current = 0;
            }else{
                cellId.style.backgroundColor = "#ffffff";
            }
            cellId = document.getElementById("programTableArrow" + String(i));
            if(pc == pcStandard + 4*i){
                cellId.innerHTML = "pc → ";
            }else{
                cellId.innerHTML = ""
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