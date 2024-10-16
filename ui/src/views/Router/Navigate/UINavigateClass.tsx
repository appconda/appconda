import React from "react";
import { Navigate } from "react-router-dom";
import { UIView } from "../../UIView/UIView";
import { ViewProperty } from "../../UIView/ViewProperty";

export class UINavigateClass extends UIView {

    /** @internal */
    @ViewProperty() vp_To: string;

    public to(value: string) {
        this.vp_To = value;
        return this;
    }


    public render() {
        return (
            <Navigate to={this.vp_To} replace={true} />
        )
    }
}
