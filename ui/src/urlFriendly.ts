import { is } from "./is";


export function urlFriendly(value) {
    if (is.string(value)) {
        return value == undefined ? '' : value.replace(/[^a-z0-9_]+/gi, '-').replace(/^-|-$/g, '').toLowerCase()
    } else {
        return '';
    }
}