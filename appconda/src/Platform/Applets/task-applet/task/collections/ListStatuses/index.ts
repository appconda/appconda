import { documents } from "./documents";

export const ListStatusesCollection = {
    "name": "List Statuses",
    "id": "listStatuses",
    "attributes": [
        {
            "key": "name",
            "type": "string",
            "size": 255
        },
        {
            "key": "description",
            "type": "string",
            "size": 16777216
        },
        {
            "key": "type",
            "type": "string",
            "size": 255
        },
        {
            "key": "bgColor",
            "type": "string",
            "size": 50
        },
        {
            "key": "fgColor",
            "type": "string",
            "size": 50
        },
        {
            "key": "orderBy",
            "type": "number",
            "size": 10
        }
    ]
    ,
    "documents": [...documents]
}