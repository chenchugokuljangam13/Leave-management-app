import * as jwt from 'jsonwebtoken';

export function decodingJWT(token:string, secret:string) {
    return jwt.verify(token, secret) as {email:string};
}