export function Action(actionType: any) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      descriptor.value = (payload) => {
        const action = target.getAction(actionType.NAME);
        action.call(payload);
      };
    };
  }
  