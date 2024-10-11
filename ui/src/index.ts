


/* export * from './FormBuilder/DynoDialog';
export * from './FormBuilder/FormBuilder'; */
export * from './views/UIView/ViewProperty';
export * from './views/UIView/UIView';
export * from './views/HStack/HStack';
export * from './views/VStack/VStack';
export * from './views/Text/Text';
export * from './views/UIView/Constants';
export * from './views/Controller/UIController';
export * from './views/Router';
export * from './views/Fragment';
export * from './views/Button';
export * from './views/TextField';
export * from './views/SecureField';
export * from './views/Dropdown';
export * from './ForEach';
export * from './views/UIImage';
export * from './views/UIViewBuilder';
export * from './views/Spacer/Spacer';
export * from './views/ScrollView/ScrollView';
export * from './views/UITable';
export * from './views/UIFileUpload';
export * from './views/Icon';
export * from './views/ReactView/ReactView';
export * from './views/Divider';
export * from './views/UISpinner';

export * from './StartBios';


export * from './urlFriendly';

export * from './is';

export { useNavigate, useLocation,  Link, HashRouter, Routes, Router, Route } from 'react-router-dom'

import { useParams as _useParams} from 'react-router-dom';

function getSelected(param: string) {
    const regex = /\[(.*?)\]/;
    const match = param.match(regex);

    if (match && match[1]) {
        return match[1];
    } else {
        return null;
    }
}

export function useParams() {
    const params = _useParams();
    const newParams = {};
    for (let key in params) {
        const splitted = params[key].split('-');
        if (splitted.length > 1) {
            const param = getSelected(splitted[splitted.length - 1]) ?? splitted[splitted.length - 1];
            newParams[key] = param;
        } else {
            newParams[key] = params[key];
        }
    }
    return newParams as any;
}   