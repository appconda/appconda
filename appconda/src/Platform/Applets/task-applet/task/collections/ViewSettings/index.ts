import { documents } from "./documents";

export const ViewSettings = {
    "name": "View Settings",
    "id": "viewSettings",
    "attributes": [
        {
            "key": "viewId",
            "type": "string",
            "size": 255,
        },
        {
            "key": "key",
            "type": "string",
            "size": 255,
        },
        {
            "key": "hidden",
            "type": "boolean",
            "defaultValue": true
        },

    ],
    "documents": documents
}