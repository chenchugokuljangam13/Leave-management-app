import * as jwt from 'jsonwebtoken';

// decode the token by using secret key
export function decodingJWT(token:string, secret:string) {
    return jwt.verify(token, secret) as {email:string};
}

