import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import {decodingJWT} from './utils/commonHelper';
const secret = process.env.JWT_SECRET as string;
export const authorizerHandler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  try {
    console.log('secret',secret)
    const token: string = event.authorizationToken;
    // decodes the token and validates with secret key
    const decoded = decodingJWT(token, secret)
    // generates allow policy for Authorizers
    const allowPolicy:APIGatewayAuthorizerResult = generatePolicy(decoded.email, 'Allow', event.methodArn)
    return allowPolicy;
  } catch (error) {
    // generates allow policy for Authorizers
    const denyPolicy: APIGatewayAuthorizerResult = generatePolicy('unauthorized', 'Deny', event.methodArn);
    return denyPolicy;
  }
};

// for generating Auth policy for Both allow and deny
const generatePolicy = (principalID:string, effect:'Allow'|'Deny', resource:string) =>{
  const authResponse:APIGatewayAuthorizerResult = {
    principalId: principalID,
    policyDocument: {
      Version : '2012-10-17',
      Statement: [
        {
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource
        },
      ],
    },
  };
  return authResponse
}