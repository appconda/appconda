import React from "react";
import { Outlet } from "react-router-dom";
import { UIRouteOutletClass } from "./UIRouteOutletClass";

 interface IControlProperties {
    control: UIRouteOutletClass
}


function UIRouteOutletRenderer({ control }: IControlProperties) {
    return (
        <Outlet />
    );
}

export default UIRouteOutletRenderer;