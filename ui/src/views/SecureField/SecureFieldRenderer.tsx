import { css } from "@emotion/css";
import { Password } from 'primereact';
import React, { Fragment } from "react";
import { UIView } from "../UIView/UIView";
import { SecureFieldClass } from "./SecureFieldClass";
import { UIFormController, useFormController } from "../Controller/UIFormController";
import { is } from "../../is";

export interface IControlProperties {
    control: SecureFieldClass
}

const MyInputText = (_params) => {

    const params = { ..._params };
    const getLabel = () => {
        if (is.function(params.obj.vp_LabelTemplate)) {
            const view: UIView = params.obj.vp_LabelTemplate(params.obj.vp_Label);
            if (view != null) {
                return view.render()
            }
        } else {
            return (
                <label className="block">{params.obj.vp_Label}</label>
            )
        }
    }




    const controller: UIFormController = useFormController();
    // console.log(controller);


    if (params.obj.vp_FormField == null || controller == null) {
      
        return (
            <Fragment>
                {getLabel()}
                <SecureFieldProxy control={params.obj} {...params}> </SecureFieldProxy>
            </Fragment>
        )

    } else {

        controller.register(params.obj.vp_FormField.name, params.obj.vp_FormField.rules);
        const formState = controller.GetFieldState(params.obj.vp_FormField.name);

        const record = null;

        if (record && !formState.isTouched) {

            params['value'] = record[params.obj.vp_FormField.name];
        } else {
            params['value'] = controller.GetValue(params.obj.vp_FormField.name);
        }


        //params['value'] = controller.GetValue(params.obj.vp_FormField.name);

        params['onChange'] = (e) => {
            controller.SetFieldState(params.obj.vp_FormField.name, { isTouched: true });
            controller.SetValue(params.obj.vp_FormField.name, e.target.value);
        }



        const fieldState = controller.GetFieldState(params.obj.vp_FormField.name);
        if (fieldState.errors.length > 0) {
            delete params['height']; // we do not want 100% height
        }
        return (
            <Fragment>
                {getLabel()}
                <SecureFieldProxy control={params.obj} {...params} />
                {fieldState.errors.map(error => (
                    <small className="p-error">{error}</small>
                ))}

            </Fragment>
        )
    }
}

export function SecureFieldProxy(_props) {
    const props = { ..._props };

    const _className = `textfield-view`;

    const children = props.children;

   // let className = props.className;


    const isMultiline = props.control.vp_Multiline;

    delete props['className'];
    delete props['control'];
    delete props['children'];


    const className = css`
        border-color: #609af8 !important;
        font-family: "Inter var", sans-serif;
        font-feature-settings: "cv02","cv03","cv04","cv11";
        font-size: 1rem;
        color: #4b5563;
        
        
        border: 1px solid #d1d5db;
        transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;
        appearance: none;
        border-radius: 6px;
        width: 100%;
        min-height: 32px;

        & input {
            border: 0px;
            padding: 0.75rem 0.75rem;
            background: #ffffff;
            border-radius: 6px;
            width: 100%;
            height: 100%;
        }
    `;

    return (
        <Password feedback={false} {...props}  pt={{
            root: { className: className }
        }}></Password>
    )

}




export function SecureFielddRenderer({ control }: IControlProperties) {
    const className = css`
    ${control.Appearance.ToString()}
    ${control.HoverAppearance.IsEmpty ? '' : '&:hover { ' + control.HoverAppearance.ToString() + ' }'}
    ${control.ActiveAppearance.IsEmpty ? '' : '&:active { ' + control.ActiveAppearance.ToString() + ' }'}
    ${control.FocusAppearance.IsEmpty ? '' : '&:focus { ' + control.FocusAppearance.ToString() + ' }'}
    `;

    const attributes = {}
    if (control.vp_Autofocus) {
        attributes['autofocus'] = true;
    }

    /*
    if (control.vp_myLostFocus) {
        attributes['onfocusout'] = (e) => (obj.vp_myLostFocus(e));
    } */

    return (
        <MyInputText
            className={className}
            obj={control}
            renderer={this}
            tabIndex={control.vp_TabIndex}
            {...attributes}
            value={control.vp_Value}
            placeholder={control.vp_Placeholder}
            onChange={(e) => is.function(control.vp_OnChange) ? control.vp_OnChange(e.target.value) : void 0}>
        </MyInputText>
    );

}
