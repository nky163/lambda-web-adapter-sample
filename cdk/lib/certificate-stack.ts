import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { CertificateConstruct } from './constracts/certificate-constract';
interface CertificateStackProps extends StackProps {
  domainName: string;
  subDomainName: string;
}

export class CertificateStack extends Stack {
  
  public readonly hostedZone: route53.IHostedZone;
  public readonly certificate: acm.Certificate;
  public readonly fqdn: string;
  
  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, props);
    
    const certificate = new CertificateConstruct(this, `Certificate-Constract`, {
      domainName: props.domainName,
      subDomainName: props.subDomainName
    })
    
    this.hostedZone = certificate.hostedZone;
    this.certificate = certificate.certificate;
    this.fqdn = certificate.fqdn;
  }
}