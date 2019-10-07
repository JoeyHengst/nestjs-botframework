// tslint:disable-next-line:function-name
export function Step(order) {
  return (target, propertyKey) => {
    const steps = Reflect.getMetadata('steps', target) || [];
    steps.push({ order, propertyKey });
    steps.sort((a, b) => (a.order > b.order ? 1 : -1));
    Reflect.defineMetadata('steps', steps, target);
  };
}
