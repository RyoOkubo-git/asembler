ProcessMult(2000000000,4000000);

function ProcessMult(reg1, reg2){
    let bit1 = new Array(32).fill(0);
    let bit2 = new Array(32).fill(0);
    let bit3 = new Array(64).fill(0);
    let i, c = 0, shift = 1;
    let hi = 0, lo = 0;
    for(i = 0; i < 32; i++){
        if((reg1 & shift) != 0){bit1[i] = 1;}
        if((reg2 & shift) != 0){bit2[i] = 1;}
        shift = shift << 1;
    }
    console.log(bit1);
    console.log(bit2);

    for(i = 0; i < 32; i++){
        if(bit2[i] == 1){
            c = this.BitAdder(bit3, bit1, i, c);
        }
    }
    console.log(bit3);

    shift = 1;
    for(i = 0; i < 32; i++){
        lo = lo + bit3[i]*shift;
        hi = hi + bit3[i+32]*shift;
        shift = shift << 1;
    }
    console.log(lo.toString(16));
    console.log(hi.toString(16));
    console.log((reg1*reg2).toString(16));
}

function BitAdder(dst, src, num, c){
    let i, d, s;
    for(i = 0; i < 32; i++){
        d = dst[i+num]; s = src[i];
        dst[i+num] = (d ^ s ^ c);
        c = ((d & s) | ((d ^ s) & c));
    }
    return c;
}