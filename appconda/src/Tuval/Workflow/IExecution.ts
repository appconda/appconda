import { Context } from "./Context/Context";
import { Process } from "./Process";

export interface IExecution {
    id?: string;
    factory?: () => any;
    handler?: any;
    context?: Context;
    data?: any;
    value?: any;
    node?: any;
    xml?: string;
    path?: Process;
    schema?: any;
    exec?: any;
  }