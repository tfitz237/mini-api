import { FindAllFiles } from './shared/functions';
import * as path from 'path';
import { DEFAULT_ROUTE } from './routing';
import { Injector } from './injectables';
export const registeredControllers: {[route: string]: any} = {};

export function Controller(route: string = DEFAULT_ROUTE): ClassDecorator {
    return function(target: any) {
        var original = target;
        var f : any = function (...args) {

            const instance = Injector.resolve(original);
            Reflect.defineMetadata(METADATAKEYS.ROUTE, route, instance);
            return instance;
        }
        f.prototype = original.prototype;
        return f;
    }
}

export function Get(route: string = DEFAULT_ROUTE): MethodDecorator {
    return function(target: any, propKey: string, descriptor) {
        const routes = route.split('/');

        for(var i = 0; i < routes.length; i++) {
            if (routes[i] && routes[i].includes('{') && routes[i].includes('}')) {
                const paramName = routes[i].replace('{', '').replace('}', '');
                const params = Reflect.getMetadata(METADATAKEYS.PARAMS, descriptor.value);
                if (params) {
                    params.push(paramName);
                } else {
                    Reflect.defineMetadata(METADATAKEYS.PARAMS, [paramName], descriptor.value);
                }
            }
        }

        Reflect.defineMetadata(METADATAKEYS.ROUTE, route, descriptor.value);
        Reflect.defineMetadata(METADATAKEYS.METHOD, 'get', descriptor.value);
    }
}

export function Header(name: string, value: string): MethodDecorator {
    return function(target: any, propKey: string, descriptor) {
        const metaData = Reflect.getMetadata(METADATAKEYS.HEADERS, descriptor.value);
        if (!metaData) {
            const headers = {};
            headers[name] = value;
            Reflect.defineMetadata(METADATAKEYS.HEADERS, headers, descriptor.value);
        } else {
            metaData[name] = value;
        }

    }
}

export async function FindControllers() {
    const files = FindAllFiles().filter((x: string) => x.includes('controller'));
    const controllers = {};
    for (var file of files) {
        const pkg = await import(path.join(__dirname, '..', file));
        const controller = new pkg.default();
        if (Reflect.hasMetadata(METADATAKEYS.ROUTE, controller)) {
            Reflect.defineMetadata(METADATAKEYS.CONTROLLER_METHODS, findMethods(controller), controller);

            controllers[Reflect.getMetadata(METADATAKEYS.ROUTE, controller)] = controller;
        }
    }
    return controllers;

}


export function findMethods(instance: Object): ControllerMethod[] {
    var rtn = [];
    for(let i of Object.values(
        Object.getOwnPropertyDescriptors(instance.constructor.prototype))
            .filter(x => typeof x.value == 'function'
            && x.value.name != instance.constructor.prototype.name
            && Reflect.hasMetadata(METADATAKEYS.METHOD, x.value)
            && Reflect.hasMetadata(METADATAKEYS.ROUTE, x.value)
            )) {
        const route: ControllerMethod = {
            method: Reflect.getMetadata(METADATAKEYS.METHOD, i.value),
            route: Reflect.getMetadata(METADATAKEYS.ROUTE, i.value),
            headers: Reflect.getMetadata(METADATAKEYS.HEADERS, i.value),
            exec: i.value.name,
            params: Reflect.getMetadata(METADATAKEYS.PARAMS, i.value)
        }
        rtn.push(route);
    }
    return rtn;
}

export interface ControllerMethod {
    method: string;
    route: string;
    headers: {[name: string]: string},
    exec: string,
    params: string[];
}

function getMethodParams(func: Function) {
    return (func + '')
      .replace(/[/][/].*$/mg,'')
      .replace(/\s+/g, '')
      .replace(/[/][*][^/*]*[*][/]/g, '')
      .split('){', 1)[0].replace(/^[^(]*[(]/, '')
      .replace(/=[^,]+/g, '')
      .split(',').filter(Boolean);
}



export const METADATAKEYS = {
    CONTROLLER_METHODS: 'controller_methods',
    ROUTE: 'route',
    METHOD: 'method',
    HEADERS: 'headers',
    PARAMS: 'params'
}