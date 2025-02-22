#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AppStack } from '../lib/app-stack';
import { VpcStack } from '../lib/vpc-stack';
import { RdsStack } from '../lib/rds-stack';
import { RdsCredentialStack } from '../lib/rds-credential-stack';
import { FargateSessionManagerStack } from '../lib/fargate-session-manager-stack';
import { CertificateStack } from '../lib/certificate-stack';

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

const certificate = new CertificateStack(app, `CerificateStack-${stage}`, {
  domainName: `nakayanews.com`,
  subDomainName: stage,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  }
})

new AppStack(app, `AppStack-${stage}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
  stage: stage,
  vpc: vpcStack.vpc,
  domainInfo: {
    certificate: certificate.certificate,
    domainName: certificate.fqdn,
    hostedZone: certificate.hostedZone,
  },
  crossRegionReferences: true
});
