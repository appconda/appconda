
export const ListItemsCollection = {
    "name": "Tasks",
    "id": "tasks",
    "attributes": [
        // 	Parent task ID
        {
            "key": "parentId",
            "type": "string",
            "size": 255
        },
        {
            "key": "title",
            "type": "string",
            "size": 255
        },
        {
            "key": "description",
            "type": "string",
            "size": 16777216
        },
        // N - Negative,
        // P - Positive.
        // Default value - null
        {
            "key": "mark",
            "type": "string",
            "size": 10
        },

        // 2 - High,
        // 1 - Medium,
        // 0 - Low.
        // Default value - 1
        {
            "key": "priority",
            "type": "string",
            "size": 1255,
            "defaultValue": "1"
        },

        // 2 -Pending,
        // 3 - In progress,
        // 4 - Pending review,
        // 5 - Completed,
        // 6 - Deferred.
        // Default value - 2
        {
            "key": "status",
            "type": "string",
            "size": 255,
            "defaultValue": "2"
        },

        // Y - Yes,
        // N - No.
        // Default value - No.
        {
            "key": "multitask",
            "type": "string",
            "size": 1255,
            "defaultValue": "N"
        },

        // Y - Yes,
        // N - No.
        // Default value - No.
        {
            "key": "notViewed",
            "type": "string",
            "size": 1255,
            "defaultValue": "N"
        },

        // Y - Yes,
        // N - No.
        // Default value - No.
        {
            "key": "replicate",
            "type": "string",
            "size": 1255,
            "defaultValue": "N"
        },
        {
            "key": "groupId",
            "type": "string",
            "size": 255,
            "defaultValue": "0"
        },
        {
            "key": "stageId",
            "type": "string",
            "size": 255,
            "defaultValue": "0"
        },
        {
            "key": "createdBy",
            "type": "string",
            "size": 255,
            "defaultValue": "0"
        },
        {
            "key": "createdDate",
            "type": "datetime"
        },
        {
            "key": "responsibleId",
            "type": "string",
            "size": 255
        },
        {
            "key": "ACCOMPLICES",
            "type": "string",
            "size": 255
        },
        {
            "key": "AUDITORS",
            "type": "string",
            "size": 255
        },
        {
            "key": "CHANGED_BY",
            "type": "string",
            "size": 255
        },
        {
            "key": "CHANGED_DATE",
            "type": "datetime"
        },
        {
            "key": "STATUS_CHANGED_BY",
            "type": "string",
            "size": 255
        },
        {
            "key": "CLOSED_BY",
            "type": "string",
            "size": 255
        },
        {
            "key": "CLOSED_DATE",
            "type": "datetime"
        },
        {
            "key": "DATE_START",
            "type": "datetime",
            "defaultValue": null
        },
        {
            "key": "DEADLINE",
            "type": "datetime",
            "defaultValue": null
        },
        {
            "key": "START_DATE_PLAN",
            "type": "datetime",
            "defaultValue": null
        },
        {
            "key": "END_DATE_PLAN",
            "type": "datetime",
            "defaultValue": null
        },
        {
            "key": "COMMENTS_COUNT",
            "type": "number",
            "defaultValue": 0
        },
        {
            "key": "NEW_COMMENTS_COUNT",
            "type": "number",
            "defaultValue": 0
        },

        // Y - Yes,
        // N - No.
        // Default value - No.
        {
            "key": "ALLOW_CHANGE_DEADLINE",
            "type": "string",
            "size": 255,
            "defaultValue": "N"
        },

        // Y - Yes,
        // N - No.
        // Default value - No.
        {
            "key": "TASK_CONTROL",
            "type": "string",
            "size": 255,
            "defaultValue": "N"
        },

        // Y - Yes,
        // N - No.
        // Default value - No.
        {
            "key": "ADD_IN_REPORT",
            "type": "string",
            "size": 255,
            "defaultValue": "N"
        },

        // Y - Yes,
        // N - No.
        // Default value - No.
        {
            "key": "FORKED_BY_TEMPLATE_ID",
            "type": "string",
            "size": 255,
            "defaultValue": "N"
        },
        {
            "key": "TIME_ESTIMATE",
            "type": "number",
            "defaultValue": null
        },
        {
            "key": "TIME_SPENT_IN_LOGS",
            "type": "number",
            "defaultValue": null
        },
        {
            "key": "MATCH_WORK_TIME",
            "type": "number",
            "defaultValue": null
        },
        {
            "key": "FORUM_TOPIC_ID",
            "type": "string",
            "size": 255
        },
        {
            "key": "FORUM_ID",
            "type": "string",
            "size": 255
        },
        {
            "key": "SITE_ID",
            "type": "string",
            "size": 255
        },

        // Y - Yes,
        // N - No.
        // Default value - No.
        {
            "key": "SUBORDINATE",
            "type": "string",
            "size": 255,
            "defaultValue": "N"
        },
        
        // Y - Yes,
        // N - No.
        // Default value - No.
        {
            "key": "FAVORITE",
            "type": "string",
            "size": 255,
            "defaultValue": "N"
        },
        {
            "key": "EXCHANGE_MODIFIED",
            "type": "datetime",
            "defaultValue": null
        },
        {
            "key": "EXCHANGE_ID",
            "type": "number",
            "defaultValue": null
        },
        {
            "key": "OUTLOOK_VERSION",
            "type": "number",
            "defaultValue": null
        },
        // Last view date
        {
            "key": "VIEWED_DATE",
            "type": "datetime",
            "defaultValue": null
        },
        {
            "key": "SORTING",
            "type": "number",
            "defaultValue": null
        },
        {
            "key": "DURATION_PLAN",
            "type": "number",
            "defaultValue": null
        },
        {
            "key": "CHECKLIST",
            "type": "number",
            "defaultValue": null
        },

        // [0] => secs
        // [1] => mins
        // [2] => hours
        // [3] => days
        // [4] => weeks
        // [5] => monts
        // [6] => years.
        // Default value - 3
        {
            "key": "DURATION_TYPE",
            "type": "number",
            "defaultValue": -3
        },















    ]

}