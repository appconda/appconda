import { css } from "@emotion/css";
import { VStackClass } from "./VStackClass";
import { is } from "../../is";
import { motion } from "framer-motion";
import { UIView } from "../UIView/UIView";
import { ReactNode } from "react";
import React from "react";


export interface IControlProperties {
    control: VStackClass
}


function VStackRenderer({ control }: IControlProperties) {

    control.Appearance.Gap = control.vp_Spacing;


    const className = css`
    ${control.Appearance.ToString()}
    ${control.HoverAppearance.IsEmpty ? '' : '&:hover { ' + control.HoverAppearance.ToString() + ' }'}
    ${control.ActiveAppearance.IsEmpty ? '' : '&:active { ' + control.ActiveAppearance.ToString() + ' }'}
    ${control.FocusAppearance.IsEmpty ? '' : '&:focus { ' + control.FocusAppearance.ToString() + ' }'}
    ${control.BeforeAppearance.IsEmpty ? '' : '&:before { ' + control.BeforeAppearance.ToString() + ' }'}
    ${control.AfterAppearance.IsEmpty ? '' : '&:after { ' + control.AfterAppearance.ToString() + ' }'}
`;

    const className2 = control.vp_Style ? css(control.vp_Style) : '';

    const events = {};
    events['onClick'] = is.function(control.vp_OnClick) ? (e) => control.vp_OnClick(e) : void 0;

    const elementProperties = {}
    if (control.renderAsAnimated) {
        elementProperties['animated'] = true;

        if (control._initial != null) {
            elementProperties['initial'] = control._initial;
        }
        if (control._animate != null) {
            elementProperties['animate'] = control._animate;
        }
        if (control._transition != null) {
            elementProperties['transition'] = control._transition;
        }

        if (control._whileHover != null) {
            elementProperties['whileHover'] = control._whileHover;
        }
        if (control._whileTap != null) {
            elementProperties['whileTap'] = control._whileTap;
        }
        if (control._whileDrag != null) {
            elementProperties['whileDrag'] = control._whileDrag;
        }
        if (control._whileFocus != null) {
            elementProperties['whileFocus'] = control._whileFocus;
        }
        if (control._whileInView != null) {
            elementProperties['whileInView'] = control._whileInView;
        }
        if (control._exit != null) {
            elementProperties['exit'] = control._exit;
        }
        console.log(elementProperties)


        return (
            <motion.div ref={control.vp_Ref} className={`${className} ${control.vp_ClassName} ${className2}`} {...control.GetEventsObject()} {...elementProperties}>
                {
                    is.array(control.vp_Chidren) && control.vp_Chidren.map((view: (UIView | ReactNode)) => {
                        if (view == null) {
                            return null;
                        }

                        /*  if (control.vp_Spacing) {
                             view.Appearance.MarginRight = control.vp_Spacing;
                         } */
                        if (view instanceof UIView) {
                            return view.render();
                        } else {
                            return view;
                        }

                    })
                }
            </motion.div>
        );
    }




    let finalComponent;


    finalComponent = (
        <div ref={control.vp_Ref} className={`${className} ${className2}`} {...control.GetEventsObject()} draggable={control.vp_Draggable}>

            {
                is.array(control.vp_Chidren) && control.vp_Chidren.map((view: (UIView | ReactNode)) => {
                    if (view == null) {
                        return null;
                    }

                    /*   if (control.vp_Spacing) {
                          view.Appearance.MarginBottom = control.vp_Spacing;
                      } */

                    return view instanceof UIView ? view.render() : view;
                })
            }

        </div>
    )








    return finalComponent;


}

export default VStackRenderer;