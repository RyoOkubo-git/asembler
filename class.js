class StackData{
    constructor(value, kind) {
        this.value = value;
        this.kind = kind;
        this.dst = 0;
        this.src = 0;
    }
}

class Instruction{
    constructor(opt, opd1, opd2, opd3){
        this.opt = opt;
        this.opd1 = opd1;
        this.opd2 = opd2;
        this.opd3 = opd3;
    }
}

class ProgData{
    constructor() {
        this.label = "";
        this.inst = new Instruction("","","","");
        this.ln = -1;
        this.current = 0;
    }
}

class Token{
    constructor(value, kind, ln){
        this.value = value;
        this.kind = kind;
        this.ln = ln;
    }
}

class Register{
    constructor(){
        this.value = 0;
        this.dst = 0;
        this.src = 0;
    }
}