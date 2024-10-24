import { css } from "@emotion/css";
import { Dropdown } from 'primereact';
import React, { Fragment } from "react";
import { UIView } from "../../UIView/UIView";
import { DropdownClass } from "../DropdownClass";
import { is } from "../../../is";
import { UIFormController, useFormController } from "../../Controller/UIFormController";



const MyDropDown = (_params) => {
    const params = { ..._params }
    const getLabel = () => {
        if (is.function(params.obj.vp_LabelTemplate)) {
            const view: UIView = params.obj.vp_LabelTemplate(params.obj.vp_Label);
            if (view != null) {
                return view.render()
            }
        } else if (!is.nullOrEmpty(params.obj.vp_Label)) {
            return (
                <label className="font-bold block mb-2">{params.obj.vp_Label}</label>
            )
        }
    }

    const controller: UIFormController = useFormController();
    // console.log(controller);


    if (params.obj.vp_FormField == null || controller == null) {
        return (
            <Fragment>
                {getLabel()}
                <Dropdown {...params}> </Dropdown>
            </Fragment>
        )

    } else {

        controller.register(params.obj.vp_FormField.name, params.obj.vp_FormField.rules);
        const formState = controller.GetFieldState(params.obj.vp_FormField.name);

        const record = null;

        if (record && !formState?.isTouched) {
            if (params.defaultValue != null) {
                controller.SetValue(params.obj.vp_FormField.name, params.defaultValue, true);
            }
            params['value'] = record[params.obj.vp_FormField.name] || params.defaultValue;
        } else {
            if (params.defaultValue != null) {
                controller.SetValue(params.obj.vp_FormField.name, params.defaultValue, true);
            }
            params['value'] = controller.GetValue(params.obj.vp_FormField.name) || params.defaultValue;
        }


        params['onChange'] = (e) => {
            controller.SetFieldState(params.obj.vp_FormField.name, { isTouched: true });
            controller.SetValue(params.obj.vp_FormField.name, e.target.value)
        }

        const fieldState = controller.GetFieldState(params.obj.vp_FormField.name);
        if (fieldState.errors.length > 0) {
            delete params['height']; // we do not want 100% height
        }
        return (
            <Fragment>
                {getLabel()}
                <Dropdown  {...params} />
                {fieldState.errors.map(error => (
                    <small className="p-error">{error}</small>
                ))}

            </Fragment>
        )
    }
}


export interface IControlProperties {
    control: DropdownClass
}


function PrimeRenderer({ control }: IControlProperties) {
    const className = css`
    ${control.Appearance.ToString()}
    ${control.HoverAppearance.IsEmpty ? '' : '&:hover { ' + control.HoverAppearance.ToString() + ' }'}
    ${control.ActiveAppearance.IsEmpty ? '' : '&:active { ' + control.ActiveAppearance.ToString() + ' }'}
    ${control.FocusAppearance.IsEmpty ? '' : '&:focus { ' + control.FocusAppearance.ToString() + ' }'}
    `;

    const emptyTemplate = () => {
        if (is.function(control.vp_emptyTemplate)) {
            const view: UIView = control.vp_emptyTemplate();
            if (view != null) {
                return view.render();
            }
        }
    }

    const template = (option) => {
        if (option && is.function(control.vp_itemTemplate)) {
            const view = control.vp_itemTemplate(option);
            if (view != null) {
                return view.render();
            }
        }

        return (<span></span>)

    }

    const selectedTemplate = (option, props) => {
        // console.group('Drop Down Context')
        // console.log(option)


        if (option != null && is.function(control.vp_selectedItemTemplate)) {
            const view: UIView = control.vp_selectedItemTemplate(option);

            if (view != null) {
                //console.groupEnd();

                return view.render();
            }
        }
        // console.groupEnd()

        return (
            <span>
                {props.placeholder}
            </span>
        );

    }

    const style = {};
    style['width'] = '100%';
    //style['height'] = '100%';
    // style['height'] = '100%';
    style['backgroundColor'] = control.Appearance.BackgroundColor;
    style['background'] = control.Appearance.Background;
    style['color'] = control.Appearance.Color;
    style['border'] = control.Appearance.Border;


    return (
        <MyDropDown
            className={className}
            defaultValue={control.vp_DefaultValue}
            obj={control}
            onFocus={(e) => is.function(control.vp_OnFocus) ? control.vp_OnFocus(e) : void 0}
            onBlur={(e) => is.function(control.vp_OnBlur) ? control.vp_OnBlur(e) : void 0}
            style={style}
            optionLabel={control.vp_fields?.text}
            optionValue={control.vp_fields?.value}
            valueTemplate={control.vp_selectedItemTemplate && selectedTemplate}
            itemTemplate={control.vp_itemTemplate && template}
            emptyMessage={emptyTemplate()}
            value={control.vp_Value}
            options={control.vp_Model}
            onChange={(e) => { control.vp_OnChange(e.value) }}
            placeholder={control.vp_Placeholder} />

    );




}

export default PrimeRenderer;