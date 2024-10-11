import React from "react";
import { Routes } from "react-router-dom";
import { UIView } from "../../UIView/UIView";
import { UIRoutesClass } from "./UIRoutesClass";

 interface IControlProperties {
    control: UIRoutesClass
}


function UIRoutesRenderer({ control }: IControlProperties) {

    return (
        <Routes>
            {
                control.vp_Chidren.map((view: UIView) => view.render())
            }
        </Routes>
    );

}

export default UIRoutesRenderer;