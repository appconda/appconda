import React from "react";
import { UIView } from "../UIView/UIView";

export class SpacerClass extends UIView {

    public constructor() {
        super();
        this.Appearance.FlexGrow = '1';
    }
    public render() {
        return (<div style={this.Appearance.GetStyleObject()} ></div>)
    }
}

export function Spacer(): SpacerClass {
  
        return new SpacerClass();
    
}