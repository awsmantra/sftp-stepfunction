import { Construct } from "constructs";
import { StackProps} from "aws-cdk-lib";
import * as sf from "aws-cdk-lib/aws-stepfunctions";
import { LogLevel, StateMachineType } from "aws-cdk-lib/aws-stepfunctions";
import { Options } from "../types/options";
import * as fs from "fs";
import * as path from "path";
import * as logs from "aws-cdk-lib/aws-logs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { ITopic } from "aws-cdk-lib/aws-sns";
import {StateMachineExecutionRole} from "./state-machine-access-role";
import {Table} from "aws-cdk-lib/aws-dynamodb";
import {SFTPBaseRole} from "./sftpbase-role";


interface SFTPStateMachineProps extends StackProps {
    options: Options;
    table: Table,
    stateMachineExecutionRole: StateMachineExecutionRole,
    sftpBaseRole:SFTPBaseRole
}

export class SFTPStateMachine extends Construct {
    private readonly _createSFTPStateMachine: sf.CfnStateMachine;
    private readonly _deleteSFTPStateMachine: sf.CfnStateMachine;


    constructor(scope: Construct, id: string, props: SFTPStateMachineProps) {
        super(scope, id);

        const file = fs.readFileSync(
            path.resolve(__dirname, "../../statemachine/create-sftp-server.json")
        );

        const file1 = fs.readFileSync(
            path.resolve(__dirname, "../../statemachine/delete-sftp-server.json")
        );


        // State Machine LogGroup
        const logGroup = new logs.LogGroup(
            this,
            '/aws/vendedlogs/states/sftp',
            {
                retention: RetentionDays.ONE_DAY,
            }
        );


        this._createSFTPStateMachine = new sf.CfnStateMachine(
            this,
            'create-sftp-server-state-machine',
            {
                stateMachineName: "create-sftp-server",
                stateMachineType: StateMachineType.EXPRESS,
                roleArn: props.stateMachineExecutionRole.roleArn,
                definitionString: file.toString(),
                definitionSubstitutions: {
                    SFTPBaseRole: props.sftpBaseRole.roleArn,
                    SFTPTable: props.table.tableName
                },

                loggingConfiguration: {
                    destinations: [
                        {
                            cloudWatchLogsLogGroup: {
                                logGroupArn: logGroup.logGroupArn,
                            },
                        },
                    ],
                    includeExecutionData: true,
                    level: LogLevel.ALL,
                },
            }
        );

        this._deleteSFTPStateMachine = new sf.CfnStateMachine(
            this,
            'delete-sftp-server-state-machine',
            {
                stateMachineName: "delete-sftp-server",
                stateMachineType: StateMachineType.EXPRESS,
                roleArn: props.stateMachineExecutionRole.roleArn,
                definitionString: file1.toString(),
                definitionSubstitutions: {
                    SFTPBaseRole: props.sftpBaseRole.roleArn,
                    SFTPTable: props.table.tableName
                },

                loggingConfiguration: {
                    destinations: [
                        {
                            cloudWatchLogsLogGroup: {
                                logGroupArn: logGroup.logGroupArn,
                            },
                        },
                    ],
                    includeExecutionData: true,
                    level: LogLevel.ALL,
                },
            }
        );
    }

    get createSFTPStateMachineArn(): string {
        return this._createSFTPStateMachine.attrArn;
    }

    get deleteFTPStateMachineArn(): string {
        return this._deleteSFTPStateMachine.attrArn;
    }

}
