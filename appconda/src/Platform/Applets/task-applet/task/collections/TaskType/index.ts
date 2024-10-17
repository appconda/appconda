export const TaskTypeCollection = {

    "name": "Task Types",
    "id": "taskType",
    "attributes": [
        {
            "key": "name",
            "type": "string",
            "size": 255
        },
        {
            "key": "icon",
            "type": "string",
            "size": 255
        },
        {
            "key": "orderBy",
            "type": "number",
            "size": 12
        }
    ],
    "documents": [
        {
            "name": 'Task',
            "icon": "icon1",
            "orderBy": 0,

        },
        {
            "name": 'Milestone',
            "icon": "icon2",
            "orderBy": 1,

        }
    ]

}