#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AppStack } from '../lib/app-stack';
import { VpcStack } from '../lib/vpc-stack';
import { RdsStack } from '../lib/rds-stack';
import { RdsCredentialStack } from '../lib/rds-credential-stack';
import { FargateSessionManagerStack } from '../lib/fargate-session-manager-stack';

const app = new cdk.App();

const stage = app.node.getContext('stage') as string;

const vpcStack = new VpcStack(app, 'VpcStack', {env: {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
}});

const rdsStack = new RdsStack(app, 'RdsStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
  vpc: vpcStack.vpc
})

const rdsCredentialStack = new RdsCredentialStack(app, `RdsCredentialStack-${stage}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
  vpc: vpcStack.vpc,
  stage: stage,
})

new FargateSessionManagerStack(app, `FargateSessionManagerStack`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
  vpc: vpcStack.vpc,
})

new AppStack(app, `AppStack-${stage}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
  stage: stage,
  vpc: vpcStack.vpc
});
