import React from "react";
import { HStackClass } from "./HStackClass";
import { useClickAway } from "@uidotdev/usehooks";
import { css } from "@emotion/css";
import { is } from "../../is";
import { motion } from "framer-motion";
import { UIView } from "../UIView/UIView";
import { Fragment } from "../Fragment";
import {Text} from '../Text'



export interface IControlProperties {
    control: HStackClass
}


function HStackRenderer({ control }: IControlProperties) {

    const [isOpen, setIsOpen] = React.useState(false);
    const ref = useClickAway(() => {
        control.vp_OnClickAway?.();
    });

    control.Appearance.Gap = control.vp_Spacing;

    const className = css`
    ${control.Appearance.ToString()}
    ${control.HoverAppearance.IsEmpty ? '' : '&:hover { ' + control.HoverAppearance.ToString() + ' }'}
    ${control.ActiveAppearance.IsEmpty ? '' : '&:active { ' + control.ActiveAppearance.ToString() + ' }'}
    ${control.FocusAppearance.IsEmpty ? '' : '&:focus { ' + control.FocusAppearance.ToString() + ' }'}
    &:before {
        ${control.BeforeAppearance.ToString()}
     }
    &:after {
        ${control.AfterAppearance.ToString()}
     }
`;

     const className2 = control.vp_Style ? css(control.vp_Style) : '';



    if (!control.BeforeAppearance.IsEmpty) {
        console.log(control.BeforeAppearance.ToString())
    }

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



        return (
            <motion.div 
            //@ts-ignore
            ref={ref/* control.vp_Ref */} className={`${className} ${control.vp_ClassName} ${className2}`} {...control.GetEventsObject()} {...elementProperties}>
                {
                    is.array(control.vp_Chidren) && control.vp_Chidren.map((view: UIView) => {
                        if (!(view instanceof UIView)) {
                            return Fragment().render();
                        }

                        /* if (control.vp_Spacing) {
                            view.Appearance.MarginRight = control.vp_Spacing;
                        } */
                        return view.render();
                    })
                }
            </motion.div>
        );
    }

    const beforeStyleObject = control.BeforeAppearance.GetStyleObject();
    let beforeElement = null;
    /*  if (!!Object.keys(beforeStyleObject).length) {

         const style = {};
         style['position'] = 'absolute';
         style['width'] = '100%';
         style['height'] = '100%';
         style['zIndex'] = '-1000';

         beforeElement = (<i className={'before-element'} style={style}></i>)
     } */


    const finalComponent = (
        <div 
        //@ts-ignore
        ref={ref/* control.vp_Ref */} className={`${className} ${control.vp_ClassName} ${className2}`} {...control.GetEventsObject()} draggable={control.vp_Draggable}>
            {
                is.array(control.vp_Chidren) && control.vp_Chidren.map((view: UIView, index) => {
                    try {
                        if (!(view instanceof UIView)) {
                            return Fragment().render();
                        }

                        /*  if (control.vp_Spacing && index !== control.vp_Chidren.length - 1) {
                             view.Appearance.MarginRight = control.vp_Spacing;
                         } */
                        return view.render();
                    } catch (e) {
                        alert(e)
                        return Text(e.toString()).foregroundColor('red').render()
                    }
                })
            }
            {/*  {beforeElement} */}
        </div>
    )

   /*  if (control.vp_Tooltip) {
        return (
            <Tooltip style={{ zIndex: 10001 }} content={control.vp_Tooltip} position={control.vp_TooltipPosition as any} showDelay={100}  >
                {finalComponent}
            </Tooltip>
        )
    } */
    return (
        finalComponent

    )


}

export default HStackRenderer;