import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as path from 'path';

interface AppStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  stage: string;
}

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: AppStackProps) {
    super(scope, id, props);

    // -----------------------------
    //  S3, CloudFront, Lambda, API Gateway は省略 (ご質問コードと同じ)
    // -----------------------------

    // 省略: S3 Bucket
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL
    });

    // 省略: OAI
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OriginAccessIdentity');
    siteBucket.grantRead(originAccessIdentity);

    // 省略: CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(siteBucket, { originAccessIdentity }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0), // キャッシュ期間は必要に応じて設定
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
      ],
    });

    // 省略: S3 Deploy
    new s3deploy.BucketDeployment(this, 'DeploySite', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../frontend/dist'))],
      destinationBucket: siteBucket,
      distribution,
    });

    // 省略: Lambda
    const backendLambda = new lambda.DockerImageFunction(this, 'BackendLambda', {
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '../../backend')),
      architecture: lambda.Architecture.ARM_64,
    });
    
    // 省略: API Gateway
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
      proxy: false,
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
    
    const noCachePolicy = new cloudfront.CachePolicy(this, 'NoCachePolicy', {
      defaultTtl: cdk.Duration.seconds(0),
      minTtl: cdk.Duration.seconds(1),
      maxTtl: cdk.Duration.seconds(0),
      headerBehavior: cloudfront.CacheHeaderBehavior.allowList('Authorization'),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
      // 必要に応じてCookieBehaviorも設定
    });

    distribution.addBehavior('/api/*', new origins.HttpOrigin(`${api.restApiId}.execute-api.${this.region}.amazonaws.com`, {
      originPath: '/prod',
    }), {
      cachePolicy: noCachePolicy,
    });

    const customMessageLambda = new NodejsFunction(this, 'CustomMessageLambda', {
      runtime: lambda.Runtime.NODEJS_22_X, // Node.jsのバージョンは適宜選択
      entry: path.join(__dirname, '../../backend', 'lambda/cognito-userpool-triggers', 'customMessage.ts'),
      handler: 'handler',
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'node20',
        externalModules: ['aws-sdk'], // Lambda ランタイムに含まれるものは基本的に除外
      },
    });
    
    
    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'AppUserPool',
      // mfa: cognito.Mfa.REQUIRED,
      mfa: cognito.Mfa.OPTIONAL,
      mfaSecondFactor: {
        sms: true,
        otp: false, // TOTP(Authenticatorアプリ)を使わない場合はfalse
      },
      signInAliases: {
        username: true,
        // preferredUsername: true,
      },
      autoVerify: {
        email: true,        // メールアドレスを自動検証
        phone: true,        // 電話番号を自動検証
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      enableSmsRole: true,
      lambdaTriggers: {
        customMessage: customMessageLambda,
      },
      featurePlan: cognito.FeaturePlan.PLUS,
    });
    const cfnUserPool = userPool.node.defaultChild as cognito.CfnUserPool;
    cfnUserPool.userPoolAddOns = 
      {
        advancedSecurityMode: 'AUDIT',
      };
    const logGroup = new logs.LogGroup(this, 'CognitoUserPoolEventLog', {
      retention: logs.RetentionDays.ONE_DAY,
    });
    new cognito.CfnLogDeliveryConfiguration(this, 'LogDeliveryConfiguration', {
      userPoolId: userPool.userPoolId,
      logConfigurations: [{
        cloudWatchLogsConfiguration: {
          logGroupArn: cdk.Stack.of(this).formatArn({
            service: 'logs',
            resource: 'log-group',
            resourceName: logGroup.logGroupName,
            arnFormat: cdk.ArnFormat.COLON_RESOURCE_NAME,
          }),
        },
        eventSource: 'userAuthEvents',
        logLevel: 'INFO'
      }]
    })

    // ユーザープールクライアント
    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool,
      generateSecret: false,
    });
    
    const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      cognitoUserPools: [userPool],
      identitySource: apigateway.IdentitySource.header('Authorization'),
    });
    
    api.root.addMethod('ANY', new apigateway.LambdaIntegration(backendLambda), {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    const proxyResource = api.root.addResource('{proxy+}');
    proxyResource.addMethod('ANY', new apigateway.LambdaIntegration(backendLambda), {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
  }
}
