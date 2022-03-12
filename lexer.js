class Lexer{
    constructor(){
        this.stream = "";
        this.tokens = new Array();
        this.ln = 1;
    }

    lexer(stream){
        let c;
        this.stream = stream;
        this.ln = 1;
        this.tokens = new Array();
        while(this.stream != ""){
            this.skipSpace();
            if(this.isStreamEmpty()){break;}
            c = this.stream[0];
            switch(true){
                case /#/.test(c) : this.remComment(); break;
                case /[a-zA-Z]/.test(c) : this.tokenId(); break;
                case /\$/.test(c) : this.tokenRegister(); break;
                case /[0-9\-\+]/.test(c) : this.tokenDigit(); break;
                case /\./.test(c) : this.tokenDot(); break;
                case /:/.test(c) : this.tokenColon(); break;
                case /"/.test(c) : this.tokenDQuo(); break;
                case /,/.test(c) : this.tokenComma(); break;
                case /[()]/.test(c) : this.tokenBrackets(); break;
                default:
                    throw new Error(`${this.ln}行目：誤った文字が存在します。`);
            }
        }
    }

    isStreamEmpty(){
        if(this.stream == ""){return true}
        else return false;
    }

    nextWord(){
        this.stream = this.stream.slice(1);
    }

    skipSpace(){
        if(this.isStreamEmpty()){return;}
        let c = this.stream[0];
        while(c == " " || c == "\t" || c == "\n"){
            if(c == "\n"){this.ln++}
            this.nextWord();
            if(this.isStreamEmpty()){return;}
            c = this.stream[0];
        };
    }

    remComment(){
        let c = this.stream[0];
        while(c != "\n"){
            this.nextWord();
            if(this.isStreamEmpty()){return;}
            c = this.stream[0];
        };
    }

    tokenId(){
        let idx = this.stream.search(/[^a-zA-Z0-9_-]/)
        if(idx < 0) idx = this.stream.length;
        const tid = this.stream.substring(0,idx);
        this.stream = this.stream.slice(idx);

        switch(tid){
            case "li" : case "move" : case "syscall" :
            case "add" : case "addi" : case "sub" : case "neg" :
            case "mult" : case "div" : case "mfhi" : case "mflo" :
            case "and" : case "andi" : case "or" : case "ori" :
            case "not" : case "xor" : case "xori":
            case "sll" : case "srl" : case "sra" :
            case "sw" : case "lw" : case "la" :
            case "slt" : case "slti" : case "seq" : case "sge":
            case "sgt" : case "sle" : case "sne":
            case "beq" : case "bne" : case "b" :
            case "bge" : case "bgt" : case "ble" : case "blt" :
            case "bgez" : case "bgtz" : case "blez" : case "bltz" :
            case "beqz" : case "bnez" :
            case "j" : case "jr" : case "jal" :
                this.tokens.push(new Token(tid, "opt", this.ln)); break;
            default:
                this.tokens.push(new Token(tid, "label", this.ln));
        }
    }

    tokenDigit(){
        let idx = this.stream.search(/[ \n(,]/);
        if(idx < 0) idx = this.stream.length;
        const dig = this.stream.substring(0,idx);
        const regexp = RegExp('^[\-\+]?[0-9]+$', 'g');
        if(!(regexp.test(dig))){throw new Error(`${this.ln}行目：数字ではない字句が含まれています。`);}
        this.stream = this.stream.slice(idx);
        this.tokens.push(new Token(dig, "digit", this.ln));
    }

    tokenDot(){
        this.nextWord();
        let idx = this.stream.search(/[ \n]/);
        if(idx < 0) idx = this.stream.length;
        const seg = "."+this.stream.substring(0,idx);
        this.stream = this.stream.slice(idx);
        switch(seg){
            case ".data" : this.tokens.push(new Token(seg, "data", this.ln)); break;
            case ".asciiz" : this.tokens.push(new Token(seg, "asciiz", this.ln)); break;
            case ".word" : this.tokens.push(new Token(seg, "word", this.ln)); break;
            case ".text" : this.tokens.push(new Token(seg, "text", this.ln)); break;
            case ".globl" : this.tokens.push(new Token(seg, "globl", this.ln)); break;
            default:
                throw new Error(`${this.ln}行目：未知の文字列が存在します。`);
        }
    }

    tokenRegister(){
        this.nextWord();
        let idx = this.stream.search(/[^a-z0-9]/);
        if(idx < 0) idx = this.stream.length;
        const reg = "$"+this.stream.substring(0,idx);
        this.stream = this.stream.slice(idx);
        switch(reg){
            case "$zero" : case "$at" : case "$v0" : case "v1" :
            case "$a0" : case "$a1" : case "$a2" : case "$a3" :
            case "$t0" : case "$t1" : case "$t2" : case "$t3" :
            case "$t4" : case "$t5" : case "$t6" : case "$t7" :
            case "$s0" : case "$s1" : case "$s2" : case "$s3" :
            case "$s4" : case "$s5" : case "$s6" : case "$s7" :
            case "$t8" : case "$t9" : case "$k0" : case "$k1" :
            case "$gp" : case "$sp" : case "$fp" : case "$ra" : break;
            default:
                throw new Error(`${this.ln}行目：誤ったレジスタが含まれています。`);
        }
        this.tokens.push(new Token(reg, "register", this.ln));
    }

    tokenColon(){
        this.tokens.push(new Token(":", "colon", this.ln));
        this.nextWord();
    }

    tokenComma(){
        this.tokens.push(new Token(",", "comma", this.ln));
        this.nextWord();
    }

    tokenDQuo(){
        this.nextWord();
        let idx = this.stream.search(/"/);
        if(idx < 0) throw new Error(`${this.ln}行目：ダブルクオテーションが閉じられていません。`);
        const adata = this.stream.substring(0,idx);
        this.stream = this.stream.slice(idx+1);
        this.tokens.push(new Token("\"", "quotation", this.ln));
        this.tokens.push(new Token(adata, "asciidata", this.ln));
        this.tokens.push(new Token("\"", "quotation", this.ln));
    }

    tokenBrackets(){
        const c = this.stream[0];
        if(c == "("){
            this.tokens.push(new Token(c, "lparen", this.ln));
        }else{
            this.tokens.push(new Token(c, "rparen", this.ln));
        }
        this.nextWord();
    }
}