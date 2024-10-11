import { BaseService } from "../BaseService";
import MiningService from "../Services/MiningService";
import { CsvImporter } from "../Services/mining-service/mining/objects/log/importer/csv/importer";
import { nanoid } from "../modules/nanoid/nanoid";

var fs = require('fs');
class CspTestService extends BaseService {

    public async __init() {


        const url = 'https://dev.bimser.net';
        const eData = 'k1locoKLE4dVg9kmquJp3LWYzFVXmzJ46BwSuzNKEptxs8+gLZO9ONk/tdlDEWJSaMx7NBf8sNAzyyyW4RCsZMSMoDOGuZVtWVbHABYDNg8tT9pPOvIt72X7A+pI63orW3T+slzkDI2GWrdJc4B3xMHfJgy0KI+vks/6cn79/uo=';
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoZW50aWNhdGlvblR5cGUiOiIxIiwiSW5zdGFuY2UiOiJkZXYiLCJJbnRlcm5hbFVzZXJJZCI6IjQiLCJJbnRlcm5hbFVzZXJuYW1lIjoicmd1ciIsIlBvc2l0aW9ucyI6IltdIiwiRGVsZWdhdGlvbklkIjoiIiwiVG9rZW5JZCI6IjNhOTdkMGY3LWIzYjYtNDBjYy05OGQ5LTk1MTlhYzNhMTRmMyIsIlVzZXJuYW1lIjoicmd1ciIsIlVzZXJJZCI6IjQiLCJUaW1lVG9MaXZlIjoiODY0MDAwMDAiLCJTY29wZSI6IjMiLCJuYmYiOjE3MTQ3MTc2NzgsImV4cCI6MTcxNDgwNDA3OCwiaXNzIjoiQmltc2VyIMOHw7Z6w7xtIiwiYXVkIjoiU3luZXJneSBVc2VycyJ9.JG1T1ygHwQpKh_gE1mAo4J13SM3ADm2_8VNZxGgabIU';

        const enc = this.services.get('encryption-service');
        const key = await enc.createKey({
            domain: url,
            token,
            eData
        });


        const projectSecretKey = '2xZ2IAMWM8C%2BnaEzBxBMYKAalvJ1n6AUArWfPbuxlayRq9RJYzECEIlkDwxnIaS7TFxabjNp02%2B8s0V9IohqaUX0XXRuhueWRFQhoD4vcjbGhw4St4q69jKoKVG2Ukx0HY9xULBIq%2FnAcg1TtG7G4jVvzBWycVjNclgpPtcLAMks0f8xfhbvrsgR%2FPxax6ENpwY0Ri29tvw3u%2B6Ovn9L%2FVIaTt8ucQdSGYEY4ZjUzFArRXVEyOiOeSzIKq83CEVVoKhEXDdt9ITJq7zy8T5MrND4oizvFqxIWIoEdaQTZiOf%2Bng%2BKY1j37mk71U5q%2FgO'
        const projectId = '04833a1b-01be-4c1a-8dd3-fc30a93bd2d8'

        const cspService = this.services.get('csp-service');

        const projects: object[] = await this.cspService.getProjects(key);
        for (let i = 0; i < projects.length; i++) {
            const project: any = projects[i];
            const flows: any[] = await this.cspService.getFlows(key, project.secretKey, project.id);
            for (let j = 0; j < flows.length; j++) {
                const flow: any = flows[j];
                const processes: any[] = await this.cspService.getProcesses(key, project.id, flow.id);
                if (processes.length > 0) {
                    for (let k = 0; k < processes.length; k++) {
                        const process: any = processes[k];
                      /*    const steps: any[] = await this.cspService.getProcessSteps(key, process.id);
                        if (steps.length > 0) {
                            console.log('==================Project=================================');
                            console.log(project.secretKey);
                            console.log(project.id);
                            console.log(flow.id);
                            console.log(process.id);
                            console.log(steps.length)

                            console.log('===================================================');
                        } */
                        
                        console.log('==================Project=================================');
                        console.log(project.secretKey);
                        console.log(project.id);
                        console.log(flow.id);
                        console.log(processes.length)

                        console.log('===================================================');


                    }
                }

              


            }
        }


        //console.log( flows);



    }
    public static get Name(): string {
        return 'csp-test-service';
    }


}


module.exports = CspTestService;