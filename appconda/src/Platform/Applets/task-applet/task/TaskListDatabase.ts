import { Collections } from "./collections/Collections";
import { Fields } from "./collections/Fields";
import { ListCollection } from "./collections/List";
import { ListItemsCollection } from "./collections/ListItems";
import { ListStatusesCollection } from "./collections/ListStatuses";
import { TaskTypeCollection } from "./collections/TaskType";
import { ViewContentsCollection } from "./collections/ViewContents";
import { ViewSettings } from "./collections/ViewSettings";
import { ViewsCollection } from "./collections/Views";

export const ListAppletDatabase = [
    {
        "name": "List Applet",
        "id": "world",
        "category": "applet",
        "collections": [
            Collections,
            Fields,
            ListItemsCollection,
            ListCollection,
            ListStatusesCollection,
            ViewsCollection,
            ViewContentsCollection,
            ViewSettings,
            TaskTypeCollection
            
        ]
    }
]


