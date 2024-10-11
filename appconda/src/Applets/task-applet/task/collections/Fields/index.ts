
import { ListFields } from "./documents/List";
import { ListItemsCollectionFields } from "./documents/ListItems";
import { ListStatusesFields } from "./documents/ListStatuses";
import { TaskTypeFields } from "./documents/TaskType";
import { ViewContentsFields } from "./documents/ViewContents";
import { ViewsFields } from "./documents/Views";


export const _Fields =
{
    "name": "Fields",
    "id": "fields",
    "attributes": [
        {
            "key": "key",
            "type": "string"
        },
        {
            "key": "name",
            "type": "string"
        },
        {
            "key": "type",
            "type": "string"
        },
        {
            "key": "custom",
            "type": "boolean",
            "defaultValue": false,
        },
        {
            "key": "system",
            "type": "boolean",
            "defaultValue": true,
        },
        {
            "key": "fieldInfo",
            "type": "string",
            "size": 18900
        },
        {
            "key": "collectionId",
            "type": "string"
        },
        {
            "key": "order",
            "type": "number"
        }
    ]
}

export const Fields =
{
    ..._Fields,
    "documents": [
        ...ListFields,
        ...ListItemsCollectionFields,
        ...ListStatusesFields,
        ...ViewsFields,
        ...ViewContentsFields,
        ...TaskTypeFields

    ]
}