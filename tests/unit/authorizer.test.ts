import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import {authorizerHandler} from '../../lambdas/authorizer';
import * as jwt from 'jsonwebtoken';
const event: APIGatewayTokenAuthorizerEvent = {
    type: 'TOKEN',
    methodArn: 'arn:aws:execute-api:region:account-id:api-id/stage/GET/resource',
    authorizationToken: '',
  };
  
  describe('unit test for authorizer handler', () => {
    test('should return Deny policy if token is missing', async () => {
      const result: APIGatewayAuthorizerResult = await authorizerHandler(event);
      expect(result.policyDocument.Statement[0].Effect).toBe('Deny');
      expect(result.principalId).toBe('unauthorized');
    });
    test('should return Deny policy with invalid token', async () => {
        event.authorizationToken = 'invalid.token.value';
        const result: APIGatewayAuthorizerResult = await authorizerHandler(event);
        expect(result.policyDocument.Statement[0].Effect).toBe('Deny');
        expect(result.principalId).toBe('unauthorized');
    });
    test('should return Allow policy with valid token', async () => {
        process.env.JWT_SECRET = 'test-secret';
        const token = jwt.sign({ email: 'test@example.com' }, process.env.JWT_SECRET);
        event.authorizationToken = token
        const result: APIGatewayAuthorizerResult = await authorizerHandler(event);
        expect(result.policyDocument.Statement[0].Effect).toBe('Allow');
        expect(result.policyDocument.Version).toBe('2012-10-17');
        expect(result.principalId).toBe('test@example.com');
    });
  });