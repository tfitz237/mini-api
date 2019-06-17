import 'reflect-metadata';

export const registeredServices: {[name: string]: Object} = {};

export function Service(): GenericClassDecorator<Type<any>> {
    return (target: Type<any>) => {
        
    }
}

export const Injector = new class {
    resolve<T>(target: Type<any>): T {
      let tokens = Reflect.getMetadata('design:paramtypes', target) || [];
      console.log(tokens);
      let injections = tokens.map(token => Injector.resolve<any>(token));
  
      return new target(...injections);
    }
  };
export interface Type<T> {
    new(...args: any[]): T;
  }
  
  /**
   * Generic `ClassDecorator` type
   */
  export type GenericClassDecorator<T> = (target: T) => void;