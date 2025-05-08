import * as jwt from 'jsonwebtoken';

export function decodingJWT(token:string, secret:string) {
    return jwt.verify(token, secret) as {email:string};
}
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
    return res;
  }


