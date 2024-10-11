import React from "react";
import { UISpinnerClass } from './UISpinnerClass';



export interface IControlProperties {
    control: UISpinnerClass
}



function UISpinnerRenderer({ control }: IControlProperties) {

    /* <Loader size={control.vp_Size} /> */
    return (
        <div className="dot-elastic-small"></div>
    )
}

export default UISpinnerRenderer;