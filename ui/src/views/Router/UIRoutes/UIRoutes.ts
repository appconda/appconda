import { UIRouteClass } from "../UIRoute/UIRouteClass";
import { UIRoutesClass } from "./UIRoutesClass";


export function UIRoutes(...routes: UIRouteClass[] ): UIRoutesClass {
        return new UIRoutesClass().children(...routes);
}