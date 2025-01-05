import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export class Secrets {
  static getSecret = async (secretArn: string) => {
    const client = new SecretsManagerClient({
      region: process.env.AWS_DEFAULT_REGION,
      endpoint: process.env.AWS_ENDPOINT || undefined,
      credentials: (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        accountId: process.env.AWS_ACCOUNT_ID,
        sessionToken: process.env.AWS_SESSION_TOKEN,
      } : undefined
    });
    const command = new GetSecretValueCommand({ SecretId: secretArn });
    const response = await client.send(command);
    return JSON.parse(response.SecretString || '{}');
  }
}
