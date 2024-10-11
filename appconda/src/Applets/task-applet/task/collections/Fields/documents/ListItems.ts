
export const ListItemsCollectionFields = [
    {
        "key": "PARENT_ID",
        "name": "Parent Id",
        "type": "string",
        'system': true,
        "custom": false,

        "fieldInfo": JSON.stringify({
            "size": 255,
        }),
        "collectionId": "tasks",
    },
    {
        "key": "TITLE",
        "name": "Title",
        "type": "string",
        "custom": false,

        "fieldInfo": JSON.stringify({
            "size": 255,
        }),
        "collectionId": "tasks",
    },
    {
        "key": "DESCRIPTION",
        "name": "Description",
        "type": "string",
        "custom": false,


        "fieldInfo": JSON.stringify({
            "size": 16777216,
        }),
        "collectionId": "tasks",
    },
    {
        "key": "MARK",
        "name": "Mark",
        "type": "string",
        "custom": false,
        'system': true,


        "fieldInfo": JSON.stringify({
            "size": 10,
        }),
        "collectionId": "tasks",
    },
    {
        "key": "PRIORITY",
        "name": "Priority",
        "type": "select",
        "custom": false,
        'system': true,

        "fieldInfo": JSON.stringify({
            "options": [
                {
                    key: 'High',
                    value: 2
                },
                {
                    key: 'Medium',
                    value: 1
                },
                {
                    key: 'Low',
                    value: 0
                }
            ],
        }),
        "collectionId": "tasks",
    },
    {
        "key": "STATUS",
        "name": "Status",
        "type": "select",
        "custom": false,
        'system': true,

        "fieldInfo": JSON.stringify({
            "options": [
                {
                    key: 'Pending',
                    value: 2
                },
                {
                    key: 'In progress',
                    value: 3
                },
                {
                    key: 'Pending review',
                    value: 4
                },
                {
                    key: 'Completed',
                    value: 5
                },
                {
                    key: 'Deferred',
                    value: 6
                }
            ],
        }),
        "collectionId": "tasks",
    },
    {
        "key": "MULTITASK",
        "name": "Multitask",
        "type": "select",
        "custom": false,
        'system': true,

        "fieldInfo": JSON.stringify({
            "options": [
                {
                    key: 'Yes',
                    value: "Y"
                },
                {
                    key: 'No',
                    value: "N"
                }
            ],
        }),
        "collectionId": "tasks",
    },
    {
        "key": "NOT_VIEWED",
        "name": "Not Viewed",
        "type": "select",
        "custom": false,
        'system': true,

        "fieldInfo": JSON.stringify({
            "options": [
                {
                    key: 'Yes',
                    value: "Y"
                },
                {
                    key: 'No',
                    value: "N"
                }
            ],
        }),
        "collectionId": "tasks",
    },
    {
        "key": "REPLICATE",
        "name": "Replicate",
        "type": "select",
        "custom": false,
        'system': true,

        "fieldInfo": JSON.stringify({
            "options": [
                {
                    key: 'Yes',
                    value: "Y"
                },
                {
                    key: 'No',
                    value: "N"
                }
            ],
        }),
        "collectionId": "tasks",
    },
    {
        "key": "GROUP_ID",
        "name": "Group Id",
        "type": "string",
        "custom": false,
        'system': true,

        "fieldInfo": JSON.stringify({
            "size": 255,
        }),
        "collectionId": "tasks",
    },
    {
        "key": "STAGE_ID",
        "name": "Stage Id",
        "type": "string",
        "custom": false,
        'system': true,

        "fieldInfo": JSON.stringify({
            "size": 255,
        }),
        "collectionId": "tasks",
    },
    {
        "key": "CREATED_BY",
        "name": "Created By",
        "type": "string",
        "custom": false,
        'system': true,

        "fieldInfo": JSON.stringify({
            "size": 255,
        }),
        "collectionId": "tasks",
    },
]