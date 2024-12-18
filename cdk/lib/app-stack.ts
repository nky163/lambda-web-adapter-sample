import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as path from 'path';

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 バケット
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // パブリックアクセスを無効化
    });

    // CloudFront OAI を作成
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OriginAccessIdentity');
    siteBucket.grantRead(originAccessIdentity)

    // CloudFront ディストリビューション
    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(siteBucket, {
          originAccessIdentity,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    // フロントエンドファイルを S3 にデプロイ
    new s3deploy.BucketDeployment(this, 'DeploySite', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../frontend/dist'))],
      destinationBucket: siteBucket,
      distribution,
    });

    // Lambda 関数
    const backendLambda = new lambda.DockerImageFunction(this, 'BackendLambda', {
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '../../backend')),
      architecture: lambda.Architecture.ARM_64,
    });
    
        // Amazon Cognito ユーザープール
        const userPool = new cognito.UserPool(this, 'UserPool', {
          userPoolName: 'AppUserPool',
          selfSignUpEnabled: true, // ユーザーの自己サインアップを許可
          signInAliases: { email: true }, // Eメールでサインイン可能
        });
    
        // Cognito ユーザープールクライアント
        const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
          userPool,
          generateSecret: false, // クライアントシークレットは不要
        });

    // API Gateway
    const cloudWatchRole = new iam.Role(this, 'APIGWCloudWatchRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonAPIGatewayPushToCloudWatchLogs')
      ]
    });
    const apiGatewayAccount = new apigateway.CfnAccount(this, 'ApiGatewayAccount', {
      cloudWatchRoleArn: cloudWatchRole.roleArn
    });
    const api = new apigateway.LambdaRestApi(this, 'BackendApi', {
      handler: backendLambda,
      proxy: true,
      deployOptions: {
        accessLogDestination: new apigateway.LogGroupLogDestination(new logs.LogGroup(this, 'ApiAccessLog')),
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
          caller: false,
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          user: true,
        }),
      },
    });
    api.node.addDependency(apiGatewayAccount);

    // CloudFront に API Gateway を追加
    distribution.addBehavior('/api/*', new origins.HttpOrigin(`${api.restApiId}.execute-api.${this.region}.amazonaws.com`, {
      originPath: '/prod',
    }));
  }
}
