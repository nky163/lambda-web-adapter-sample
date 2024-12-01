import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Docker イメージから Lambda 関数を作成
    const lambdaFunction = new lambda.DockerImageFunction(this, 'DockerLambda', {
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '../../app')),
      architecture: lambda.Architecture.ARM_64,
      timeout: cdk.Duration.seconds(15), // タイムアウトを 15 秒に設定
      memorySize: 1024, // メモリを増加
    });

    // API Gateway を作成して Lambda を公開
    new apigateway.LambdaRestApi(this, 'ApiGateway', {
      handler: lambdaFunction,
    });
  }
}
