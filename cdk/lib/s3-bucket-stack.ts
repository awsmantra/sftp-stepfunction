import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Options} from "../types/options";
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from "aws-cdk-lib";

interface S3StackProps extends StackProps {
    options: Options,
}

export class S3BucketStack extends cdk.NestedStack{
    private readonly _s3Bucket: s3.Bucket;

    constructor(scope: Construct, id: string, props: S3StackProps) {
        super(scope, id, props);


     this._s3Bucket = new s3.Bucket(this, 'SFTPBucket', {
        bucketName : props.options.bucketName,
        objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

     this._s3Bucket.grantRead(new iam.AccountRootPrincipal());

    }

    get bucketArn(): string {
        return this._s3Bucket.bucketArn;
    }
}
