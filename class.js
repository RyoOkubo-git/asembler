class StackData{
    constructor(value, kind) {
        this.value = value;
        this.kind = kind;
        this.dst = 0;
        this.src = 0;
    }

    get getValue(){
        return this.value;
    }

    get getKind(){
        return this.kind;
    }

    set setValue(v){
        this.value = v;
    }

    set setKind(k){
        this.kind = k;
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

    get getLabel(){
        return this.label;
    }

    get getInst(){
        return this.inst;
    }

    get getLn(){
        return this.ln;
    }

    set setLabel(label){
        this.label = label;
    }

    set setInst(inst){
        this.inst = inst;
    }

    set setLn(ln){
        this.ln = ln;
    }
}

class Token{
    constructor(value, kind, ln){
        this.value = value;
        this.kind = kind;
        this.ln = ln;
    }

    get getValue(){
        return this.value;
    }

    get getKind(){
        return this.kind;
    }
    get getLn(){
        return this.ln;
    }
}

class Register{
    constructor(){
        this.value = 0;
        this.dst = 0;
        this.src = 0;
    }
}