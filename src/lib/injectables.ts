import 'reflect-metadata';

export const registeredServices: {[name: string]: Object} = {};

export function Service(): ClassDecorator {
    return target => {

    }
}

export const Injector = new class {
    resolve(target) {
      let tokens = Reflect.getMetadata('design:paramtypes', target) || [];
      let injections = tokens.map(token => Injector.resolve(token));
      if (injectables[target.name]) {
          return injectables[target.name];
      }
      console.log('making new instance of ' + target.name);
      const instance = new target(...injections);
      injectables[target.name] = instance;
      return instance;
    }
  };
const injectables: {[name: string]: any} = {};