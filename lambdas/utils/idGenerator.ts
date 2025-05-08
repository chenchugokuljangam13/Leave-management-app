export const idGeneratorFun= (): string => {
    let chars = "";
    for (let i = 65; i <= 90; i++) chars += String.fromCharCode(i); 
    for (let i = 97; i <= 122; i++) chars += String.fromCharCode(i); 
    for (let i = 48; i <= 57; i++) chars += String.fromCharCode(i); 
  
    let res = "";
    for (let i = 0; i <= 7; i++) {
        const randomInd = Math.floor(Math.random() * chars.length);
        res += chars.charAt(randomInd);
    }
    console.log("res")
    return res;
  }