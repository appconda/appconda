import { Context } from "./Context/Context";
import { Path } from "./Path";

export interface IExecution {
    id?: string;
    factory?: () => any;
    handler?: any;
    context?: Context;
    data?: any;
    value?: any;
    node?: any;
    xml?: string;
    path?: Path;
    schema?: any;
    exec?: any;
  }