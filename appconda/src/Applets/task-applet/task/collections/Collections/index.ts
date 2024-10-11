export const _Collections =
{
    "name": "Collections",
    "id": "collections",
    "attributes": [
        {
            "key": "name",
            "type": "string"
        },
        {
            "key": "type",
            "type": "string"
        },
        {
            "key": "order",
            "type": "number"
        }
    ]
}


export const Collections = {
    ..._Collections,
    "documents": [
        // ---------- List Items Collection --------------------
        {
            "$id": "listItems",
            "name": "List Items"
        },

        // ---------- List Status Collection --------------------
        {
            "$id": "listStatuses",
            "name": "List Statuses"
        },
        // ---------- Views Collection --------------------
        {
            "$id": "views",
            "name": "Views"
        },
        // ---------- View Contents Collection --------------------
        {
            "$id": "viewContents",
            "name": "View Contents"
        },
        {
            "$id": "list",
            "name": "List"
        },
        {
            "$id": "taskType",
            "name": "Task Type"
        }
    ]
}