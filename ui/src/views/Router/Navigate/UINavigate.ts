import { UINavigateClass } from "./UINavigateClass";


export function UINavigate(path: string): UINavigateClass {
        return new UINavigateClass().to(path);
}


