
import { UIController } from "../../Controller/UIController";
import { UIRouteClass } from "./UIRouteClass";

export type ControllerConstructor = new (props: any) => UIController;

export type UIRouteFunction = (path: string, routeController: ControllerConstructor) => UIRouteClass;

export function UIRoute(path: string, routeController: ControllerConstructor): UIRouteClass {
        return new UIRouteClass().routePath(path).routeController(routeController);
}


