

/**
 * Action decorator that modifies the method to call an action based on the provided action type.
 * 
 * @param actionType - The type of action to be executed.
 * @returns A decorator function that wraps the original method.
 */
export function Action(actionType: any) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      descriptor.value = (payload) => {
        const action = target.getAction(actionType.NAME);
        action.call(payload);
      };
    };
  }