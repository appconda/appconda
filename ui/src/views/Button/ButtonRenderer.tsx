import { css } from "@emotion/css";
import { Button } from "primereact";
import React from "react";
import { ButtonClass } from "./ButtonClass";

export interface IControlProperties {
    control: ButtonClass
}


function ButtonRenderer({ control }: IControlProperties) {

    const className = css`
    ${control.Appearance.ToString()}
    ${control.HoverAppearance.IsEmpty ? '' : '&:hover { ' + control.HoverAppearance.ToString() + ' }'}
    ${control.ActiveAppearance.IsEmpty ? '' : '&:active { ' + control.ActiveAppearance.ToString() + ' }'}
    ${control.FocusAppearance.IsEmpty ? '' : '&:focus { ' + control.FocusAppearance.ToString() + ' }'}
`;

   
        return (
            <Button className={className}>
                <img alt="logo" src="https://primefaces.org/cdn/primereact/images/primereact-logo-light.svg" className="h-2rem"></img>
            </Button>
        );
    


}

export default ButtonRenderer;