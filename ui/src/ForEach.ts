import { UIView } from "./views/UIView/UIView";


type ForEachIterateFunction<T> = (item: T, index?: number) => UIView;
export function ForEach<T>(enumarable: UIView[]): (value: ForEachIterateFunction<T>) => any[] {
    return (enumFunc: ForEachIterateFunction<T>) => {
        const result: any[] = [];
        let index: number = 0;

        const t0 = performance.now();

        enumarable.forEach( (item: any) => {
            const subView: any = enumFunc(item, index);
            if (Array.isArray(subView)) {
                subView.forEach((view: any) => {
                    result.push(view);
                })
            } else {
                result.push(subView);
            }
            index++;
        });

        const t1 = performance.now();
        //console.log(`ForEach ${t1 - t0} milliseconds.`);
        return result;
    }
}