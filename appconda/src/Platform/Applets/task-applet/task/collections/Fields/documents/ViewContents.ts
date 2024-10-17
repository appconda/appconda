

export const ViewContentsFields = [
    {
        "key": "viewId",
        "name": "View ID",
        "type": "string",

        "fieldInfo": JSON.stringify({
            "size": 255,
        }),
        "collectionId": "viewContents",
    },
    {
        "key": "content",
        "name": "Content",
        "type": "string",

        "fieldInfo": JSON.stringify({
            "size": 16777216,
        }),
        "collectionId": "viewContents",
    }
]