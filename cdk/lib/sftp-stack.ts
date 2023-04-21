import * as cdk from "aws-cdk-lib"
import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import { StateMachineExecutionRole} from "./state-machine-access-role";
import { SFTPTable} from "./table-stack";
import {Options} from "../types/options";
import {SFTPStateMachine} from "./sftp-state-machine";
import {ScheduleRole} from "./eventbridge-schedule-role";
import {EventBridgeSchedule} from "./eventbridge-schedule";
import {SFTPBaseRole} from "./sftpbase-role";
import {S3BucketStack} from "./s3-bucket-stack";

interface SFTPStackProps extends StackProps {
  options: Options,
}

export class SftpStack extends Stack {
  constructor(scope: Construct, id: string, props: SFTPStackProps) {
    super(scope, id, props);


    // Create Employee DynamoDB table
    const tableStack = new SFTPTable(this, 'SFTPTableStack', {})

   // Create S3Bucket

    const s3Bucket = new S3BucketStack(this,"SFTPBucketStack", {
        options:props.options,
    })

    // Create StateMachine Execution Role
    const stateMachineExecutionRole = new StateMachineExecutionRole(this,"SFTPStateMachineRoleStack" ,{
          options:props.options,
          table: tableStack.table,
          bucketArn: s3Bucket.bucketArn
        }
    )

    // Create StateMachine Execution Role
    const sftpBaseRole = new SFTPBaseRole(this,"SFTPSBaseRoleStack" ,{
          options:props.options,
          table: tableStack.table,
          bucketArn: s3Bucket.bucketArn
        }
    )

    // Create State Machine
    const sftpStateMachine = new SFTPStateMachine(this, "SFTPStateMachineStack" , {
        options:props.options,
        table: tableStack.table,
        stateMachineExecutionRole:stateMachineExecutionRole,
        sftpBaseRole: sftpBaseRole,
      }
    )

    //Export Create SFTP State Machine Arn
    new cdk.CfnOutput(this, 'CreateSFTPExport', {
      value: sftpStateMachine.createSFTPStateMachineArn,
      description: 'create-sftp-state-machine-arn',
      exportName: 'create-sftp-state-machine',
    });

    //Export Delete SFTP State Machine Arn
    new cdk.CfnOutput(this, 'DeleteSFTPExport', {
        value: sftpStateMachine.deleteFTPStateMachineArn,
        description: 'delete-sftp-state-machine-arn',
        exportName: 'delete-sftp-state-machine',
    });

    // Create EventBridge Scheduler Role
    const scheduleRole = new ScheduleRole(this,"SFTPSchedulerRoleStack", {
          options:props.options,
          createSFTPStateMachineArn: sftpStateMachine.createSFTPStateMachineArn,
          deleteSFTPStateMachineArn: sftpStateMachine.deleteFTPStateMachineArn,
    });

    const eventBridgeSchedule = new EventBridgeSchedule(this,"SFTPEventBridgeScheduleStack",{
        options:props.options,
        schedulerRoleArn: scheduleRole.roleArn,
        createSFTPStateMachineArn: sftpStateMachine.createSFTPStateMachineArn,
        deleteSFTPStateMachineArn: sftpStateMachine.deleteFTPStateMachineArn,
    })


  }
}
