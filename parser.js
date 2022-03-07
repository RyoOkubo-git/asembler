class Parser{
    constructor(){
        this.lex = new Lexer();
        this.tokens;
        this.labels = {};
        this.sp;
        this.stack = new Array();
        for(let i = 0; i < 100; i++){
            this.stack.push(new StackData(0,"digit"));
        }
        this.startLabel;
        this.pc;
        this.program = new Array();
        for(let i = 0; i < 100; i++){
            this.program.push(new ProgData());
        }
    }

    parse(stream){
        this.lex.lexer(stream);
        this.tokens = this.lex.tokens;
        console.log(this.tokens);
        this.sp = 4*99;
        this.pc = 0;
        while(this.tokens.length > 0){
            let tkn = this.tokens[0];
            switch(tkn.kind){
                case "data" : this.parseData(); break;
                case "text" : this.parseText(); break;
                default:
                    throw new Error(`Parse Error, line: ${tkn.ln}`)
            }
        }
    }

    remToken(n){
        if(this.tokens.length < n){throw new Error(`invalid number`);}
        while(n>0){
            this.tokens.shift();
            n--;
        }
    }

    parseData(){
        const tkn = this.tokens.shift();
        while(this.tokens.length > 0 && this.tokens[0].kind == "label"){
            if(this.tokens.length >= 4 &&
                this.tokens[1].kind == "colon" &&
                this.tokens[2].kind == "word"){
                    this.parseWordData();
            }else if(this.tokens.length >= 6 &&
                this.tokens[1].kind == "colon" &&
                this.tokens[2].kind == "asciiz"){
                this.parseAsciiData();
            }else{
                throw new Error(`Parse Error, line: ${tkn.ln}`);
            }
        }
    }

    parseWordData(){
        this.labels[this.tokens[0].value] = this.sp;
        this.remToken(3);
        let tkn = this.tokens[0];
        if(tkn.kind != "digit"){throw new Error(`Parse Error, line: ${tkn.ln}`);}
        this.stack[this.sp/4].value = parseInt(tkn.value, 10);
        this.stack[this.sp/4].kind = "digit";
        this.sp = this.sp - 4;
        this.remToken(1);
        while(this.tokens.length > 0 && this.tokens[0].kind == "comma"){
            if(this.tokens.length < 2 || this.tokens[1].kind != "digit"){
                throw new Error(`Parse Error, line: ${tkn.ln}`);
            }
            tkn = this.tokens[1];
            this.stack[this.sp / 4].value = parseInt(tkn.value, 10);
            this.stack[this.sp / 4].kind = "digit";
            this.sp = this.sp - 4;
            this.remToken(2);
        }
    }

    parseAsciiData(){
        this.labels[this.tokens[0].value] = this.sp;
        this.remToken(3);
        const tkn = this.tokens[1];
        if(this.tokens[0].kind != "quotation" ||
        this.tokens[2].kind != "quotation" ||
        tkn.kind != "asciidata"){
            throw new Error(`Parse Error, line: ${tkn.ln}`);
        }

        const len = tkn.value.length;
        for(let i = 0; i < len; i++){
            if(tkn.value[i] == "\\"){
                let c;
                switch(tkn.value[++i]){
                    case "n" : c = "\n"; break;
                    default:
                        throw new Error(`invalid escape character. line: ${tkn.ln}`);
                }
                this.stack[this.sp / 4].value = c;
                this.stack[this.sp / 4].kind = "asciidata";
                this.sp = this.sp - 4;
            }else{
                this.stack[this.sp / 4].value = tkn.value[i];
                this.stack[this.sp / 4].kind = "asciidata";
                this.sp = this.sp - 4;
            }
        }
        this.stack[this.sp / 4].value = "\0";
        this.stack[this.sp / 4].kind = "asciidata";
        this.sp = this.sp - 4;
        this.remToken(3);
    }

    parseText(){
        const tkn = this.tokens.shift();
        if(this.tokens.length < 2 ||
            this.tokens[0].kind != "globl" &&
            this.tokens[1].kind != "label"){
                throw new Error(`Parse Error. line: ${tkn.ln}`);
        }
        this.startLabel = this.tokens[1].value;
        this.remToken(2);

        let flag, flagToken;
        while(this.tokens.length > 0){
            flag = 0;
            flagToken = this.tokens[0];
            if(flagToken.kind == "label"){
                this.labels[flagToken.value] = this.pc;
                flag = 1;
                this.remToken(2);
            }
            if(this.tokens.length == 0 || this.tokens[0].kind != "opt"){
                throw new Error(`Parse Error. line: ${flagToken.ln}`);
            }
            if(flag == 1){
                this.parseInstruction(flagToken.value);
            }else{
                this.parseInstruction("");
            }
        }
    }

    parseInstruction(label){
        let inst;
        const optToken = this.tokens.shift();
        switch(optToken.value){
            case "li" : inst = this.parseLi(); break;
            case "move" : inst = this.parseMove(); break;
            case "syscall" : inst = this.parseSyscall(); break;
            case "add" : inst = this.parseAdd(); break;
            case "addi" : inst = this.parseAddi(); break;
            case "sub" : inst = this.parseSub(); break;
            case "and" : inst = this.parseAnd(); break;
            case "andi" : inst = this.parseAndi(); break;
            case "or" : inst = this.parseOr(); break;
            case "ori" : inst = this.parseOri(); break;
            case "sll" : inst = this.parseSll(); break;
            case "srl" : inst = this.parseSrl(); break;
            case "sra" : inst = this.parseSra(); break;
            case "sw" : inst = this.parseSw(); break;
            case "lw" : inst = this.parseLw(); break;
            case "la" : inst = this.parseLa(); break;
            case "beq" : inst = this.parseBeq(); break;
            case "bne" : inst = this.parseBne(); break;
            case "b" : inst = this.parseB(); break;
            case "j" : inst = this.parseJ(); break;
            case "jr" : inst = this.parseJr(); break;
            case "jal" : inst = this.parseJal(); break;
            default:
                throw new Error(`Parse Error. line: ${optToken.ln}`)
        }
        this.program[this.pc].label = label;
        this.program[this.pc].inst = inst;
        this.program[this.pc++].ln = optToken.ln;
    }

    parseLi(){
        if(this.tokens.length <= 2 ||
            this.tokens[0].kind != "register" ||
            this.tokens[1].kind != "comma" ||
            this.tokens[2].kind != "digit"){
                throw new Error(`wrong argument. "li"`);   
        }
        const inst = new Instruction("li", this.tokens[0].value, this.tokens[2].value, "");
        this.remToken(3);
        return inst;
    }

    parseMove(){
        if(this.tokens.length <= 2 ||
            this.tokens[0].kind != "register" ||
            this.tokens[1].kind != "comma" ||
            this.tokens[2].kind != "register"){
                throw new Error(`wrong argument. "move"`);   
        }
        const inst = new Instruction("move", this.tokens[0].value, this.tokens[2].value, "");
        this.remToken(3);
        return inst;
    }

    parseSyscall(){
        const inst = new Instruction("syscall", "", "", "");
        return inst;
    }

    parseAdd(){
        if(this.tokens.length <= 4 ||
            this.tokens[0].kind != "register" ||
            this.tokens[1].kind != "comma" ||
            this.tokens[2].kind != "register" ||
            this.tokens[3].kind != "comma" ||
            this.tokens[4].kind != "register"){
                throw new Error(`wrong argument. "add"`);
        }
        const inst = new Instruction("add", this.tokens[0].value, this.tokens[2].value, this.tokens[4].value);
        this.remToken(5);
        return inst;
    }

    parseAddi(){
        if(this.tokens.length <= 4 ||
            this.tokens[0].kind != "register" ||
            this.tokens[1].kind != "comma" ||
            this.tokens[2].kind != "register" ||
            this.tokens[3].kind != "comma" ||
            this.tokens[4].kind != "digit"){
                throw new Error(`wrong argument. "addi"`);
        }
        const inst = new Instruction("addi", this.tokens[0].value, this.tokens[2].value, this.tokens[4].value);
        this.remToken(5);
        return inst;
    }

    parseSub(){
        if(this.tokens.length <= 4 ||
            this.tokens[0].kind != "register" ||
            this.tokens[1].kind != "comma" ||
            this.tokens[2].kind != "register" ||
            this.tokens[3].kind != "comma" ||
            this.tokens[4].kind != "register"){
                throw new Error(`wrong argument. "sub"`);
        }
        const inst = new Instruction("sub", this.tokens[0].value, this.tokens[2].value, this.tokens[4].value);
        this.remToken(5);
        return inst;
    }

    parseAnd(){
        if(this.tokens.length <= 4 ||
            this.tokens[0].kind != "register" ||
            this.tokens[1].kind != "comma" ||
            this.tokens[2].kind != "register" ||
            this.tokens[3].kind != "comma" ||
            this.tokens[4].kind != "register"){
                throw new Error(`wrong argument. "and"`);
        }
        const inst = new Instruction("and", this.tokens[0].value, this.tokens[2].value, this.tokens[4].value);
        this.remToken(5);
        return inst;
    }

    parseAndi(){
        if(this.tokens.length <= 4 ||
            this.tokens[0].kind != "register" ||
            this.tokens[1].kind != "comma" ||
            this.tokens[2].kind != "register" ||
            this.tokens[3].kind != "comma" ||
            this.tokens[4].kind != "digit"){
                throw new Error(`wrong argument. "andi"`);
        }
        const inst = new Instruction("andi", this.tokens[0].value, this.tokens[2].value, this.tokens[4].value);
        this.remToken(5);
        return inst;
    }

    parseOr(){
        if(this.tokens.length <= 4 ||
            this.tokens[0].kind != "register" ||
            this.tokens[1].kind != "comma" ||
            this.tokens[2].kind != "register" ||
            this.tokens[3].kind != "comma" ||
            this.tokens[4].kind != "register"){
                throw new Error(`wrong argument. "or"`);
        }
        const inst = new Instruction("or", this.tokens[0].value, this.tokens[2].value, this.tokens[4].value);
        this.remToken(5);
        return inst;
    }

    parseOri(){
        if(this.tokens.length <= 4 ||
            this.tokens[0].kind != "register" ||
            this.tokens[1].kind != "comma" ||
            this.tokens[2].kind != "register" ||
            this.tokens[3].kind != "comma" ||
            this.tokens[4].kind != "digit"){
                throw new Error(`wrong argument. "ori"`);
        }
        const inst = new Instruction("ori", this.tokens[0].value, this.tokens[2].value, this.tokens[4].value);
        this.remToken(5);
        return inst;
    }

    parseSll(){
        if(this.tokens.length <= 4 ||
            this.tokens[0].kind != "register" ||
            this.tokens[1].kind != "comma" ||
            this.tokens[2].kind != "register" ||
            this.tokens[3].kind != "comma" ||
            this.tokens[4].kind != "digit"){
                throw new Error(`wrong argument. "sll"`);
        }
        const inst = new Instruction("sll", this.tokens[0].value, this.tokens[2].value, this.tokens[4].value);
        this.remToken(5);
        return inst;
    }

    parseSrl(){
        if(this.tokens.length <= 4 ||
            this.tokens[0].kind != "register" ||
            this.tokens[1].kind != "comma" ||
            this.tokens[2].kind != "register" ||
            this.tokens[3].kind != "comma" ||
            this.tokens[4].kind != "digit"){
                throw new Error(`wrong argument. "srl"`);
        }
        const inst = new Instruction("srl", this.tokens[0].value, this.tokens[2].value, this.tokens[4].value);
        this.remToken(5);
        return inst;
    }

    parseSra(){
        if(this.tokens.length <= 4 ||
            this.tokens[0].kind != "register" ||
            this.tokens[1].kind != "comma" ||
            this.tokens[2].kind != "register" ||
            this.tokens[3].kind != "comma" ||
            this.tokens[4].kind != "digit"){
                throw new Error(`wrong argument. "sra"`);
        }
        const inst = new Instruction("sra", this.tokens[0].value, this.tokens[2].value, this.tokens[4].value);
        this.remToken(5);
        return inst;
    }

    parseSw(){
        if(this.tokens.length <= 5 ||
            this.tokens[0].kind != "register" ||
            this.tokens[1].kind != "comma" ||
            this.tokens[2].kind != "digit" ||
            this.tokens[3].kind != "lparen" ||
            this.tokens[4].kind != "register" ||
            this.tokens[5].kind != "rparen"){
                throw new Error(`wrong argument. "sw"`);
        }
        const inst = new Instruction("sw", this.tokens[0].value, this.tokens[2].value, this.tokens[4].value);
        this.remToken(6);
        return inst;
    }

    parseLw(){
        if(this.tokens.length <= 5 ||
            this.tokens[0].kind != "register" ||
            this.tokens[1].kind != "comma" ||
            this.tokens[2].kind != "digit" ||
            this.tokens[3].kind != "lparen" ||
            this.tokens[4].kind != "register" ||
            this.tokens[5].kind != "rparen"){
                throw new Error(`wrong argument. "lw"`);
        }
        const inst = new Instruction("lw", this.tokens[0].value, this.tokens[2].value, this.tokens[4].value);
        this.remToken(6);
        return inst;
    }

    parseLa(){
        if(this.tokens.length <= 2 ||
            this.tokens[0].kind != "register" ||
            this.tokens[1].kind != "comma" ||
            this.tokens[2].kind != "label"){
                throw new Error(`wrong argument. "la"`);
        }
        const inst = new Instruction("la", this.tokens[0].value, this.tokens[2].value, "");
        this.remToken(3);
        return inst;
    }

    parseBeq(){
        if(this.tokens.length <= 4 ||
            this.tokens[0].kind != "register" ||
            this.tokens[1].kind != "comma" ||
            this.tokens[2].kind != "register" ||
            this.tokens[3].kind != "comma" ||
            this.tokens[4].kind != "label"){
                throw new Error(`wrong argument. "beq"`);
        }
        const inst = new Instruction("beq", this.tokens[0].value, this.tokens[2].value, this.tokens[4].value);
        this.remToken(5);
        return inst;
    }

    parseBne(){
        if(this.tokens.length <= 4 ||
            this.tokens[0].kind != "register" ||
            this.tokens[1].kind != "comma" ||
            this.tokens[2].kind != "register" ||
            this.tokens[3].kind != "comma" ||
            this.tokens[4].kind != "label"){
                throw new Error(`wrong argument. "bne"`);
        }
        const inst = new Instruction("bne", this.tokens[0].value, this.tokens[2].value, this.tokens[4].value);
        this.remToken(5);
        return inst;
    }

    parseB(){
        if(this.tokens.length == 0 ||
            this.tokens[0].kind != "label"){
                throw new Error(`wrong argument. "b"`);
        }
        const inst = new Instruction("b", this.tokens[0].value, "", "");
        this.remToken(1);
        return inst;
    }

    parseJ(){
        if(this.tokens.length == 0 ||
            this.tokens[0].kind != "label"){
                throw new Error(`wrong argument. "j"`);
        }
        const inst = new Instruction("j", this.tokens[0].value, "", "");
        this.remToken(1);
        return inst;
    }

    parseJr(){
        if(this.tokens.length == 0 ||
            this.tokens[0].kind != "register"){
                throw new Error(`wrong argument. "jr"`);
        }
        const inst = new Instruction("jr", this.tokens[0].value, "", "");
        this.remToken(1);
        return inst;
    }

    parseJal(){
        if(this.tokens.length == 0 ||
            this.tokens[0].kind != "label"){
                throw new Error(`wrong argument. "jal"`);
        }
        const inst = new Instruction("jal", this.tokens[0].value, "", "");
        this.remToken(1);
        return inst;
    }
}

