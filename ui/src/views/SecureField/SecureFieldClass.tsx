import React from "react";
import { UIView } from "../UIView/UIView";
import {UIViewRenderer} from "../UIView/UIViewRenderer";
import { ViewProperty } from "../UIView/ViewProperty";
import { SecureFielddRenderer } from "./SecureFieldRenderer";
import { ValidateRule } from "../Controller/UIFormController";



export class SecureFieldClass extends UIView {
    /** @internal */
    @ViewProperty() vp_Value: string;

    public value(value: string) {
        this.vp_Value = value;
        return this;
    }

    /** @internal */
    @ViewProperty() vp_Placeholder: string;

    public placeholder(value: string) {
        this.vp_Placeholder = value;
        return this;
    }

    /** @internal */
    @ViewProperty() vp_FormField: { name: string, rules: ValidateRule[] };

    public formField(name: string, rules: ValidateRule[]): this {
        this.vp_FormField = {
            name: name,
            rules: rules
        };
        return this;
    }

    /** @internal */
    @ViewProperty() vp_Multiline: boolean;

    public multiline(value: boolean): this {
        this.vp_Multiline = value;
        return this;
    }

    /** @internal */
    @ViewProperty() vp_Autofocus: boolean;

    public autofocus(value: boolean): this {
        this.vp_Autofocus = value;
        return this;
    }

    /** @internal */
    @ViewProperty() vp_OnChange: Function;

    public onChange(value: Function) {
        this.vp_OnChange = value;
        return this;
    }

    @ViewProperty()
    public vp_Label: string;
    public label(value: string): this {
        this.vp_Label = value;
        return this;
    }
    
    @ViewProperty()
    public vp_LabelTemplate: (label: string) => UIView;
    public labelTemplate(value: (label: string) => UIView): this {
        this.vp_LabelTemplate = value;
        return this;
    }

    public constructor() {
        super();

        this.Appearance.Width = '100%';
        this.Appearance.Height = 'fit-content';
        //this.Appearance.Border = 'solid 1px gray';
        this.Appearance.Overflow = 'hidden';


        this.vp_Autofocus = false;
    }

    public render() {
        return (<UIViewRenderer wrap={false} control={this} renderer={SecureFielddRenderer}></UIViewRenderer>)
    }
}
