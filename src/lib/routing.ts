import { FindControllers, METADATAKEYS, ControllerMethod } from './controller';
import * as http from 'http';
import 'reflect-metadata';

export default class Routing {
    controllers: {[route: string]: any};
    
    async initialize() {
        this.controllers = await FindControllers();
    }

    async route(req: http.IncomingMessage, res: http.ServerResponse) {         
        const controller = this.findController(req);
        const response = {
            statusCode: 404,
            body: {
                statusCode: 404
            },
            headers: {
                'Content-Type': 'application/json'
            }
        };
        if (controller) {
            const method = this.findMethod(req, controller);
            if (method) {  
                if (method.headers) {
                    for (let name in method.headers) {
                        response.headers[name] = method.headers[name];
                    }
                }                         
                const result = controller[method.exec](...method.params);
                if (result !== undefined) {
                    response.body = result !== undefined ? result : response.body;
                }
            }
        }
        res.writeHead(response.statusCode, response.headers);
        res.write(this.outputResult(response.headers, response.body));
        res.end();       
    }

    outputResult(headers, result) {
        if (headers['Content-Type'] && headers['Content-Type'].includes('text') && typeof result === 'string') {
            return result;
        }
        return JSON.stringify(result);
    }
    
    findController(req: http.IncomingMessage) {
        return this.controllers[this.getController(this.getPath(req))];
    }

    getPath(req: http.IncomingMessage) {
        let routing = req.url.replace('/api', '').split('/');
        if (routing.length === 0) {
            routing.push(DEFAULT_ROUTE);
            return routing;
        }         
        return routing.splice(1);
    }

    getController(path: string[]) {
        return path[0];
    }

    getRoute(path: string[]) {
        const a = path.join('/').replace(new RegExp(this.getController(path)+'\/?'), '');
        return a;
    }

    getRouteParams(path: string[]) {
        return path.join('/').replace(this.getController(path)+'/', '').split('/');
    }

    methodMatches(req: http.IncomingMessage, method: ControllerMethod): boolean {
        return method.method.toUpperCase() == req.method.toUpperCase();
    }

    routeMatches(req: http.IncomingMessage, method: ControllerMethod): boolean {
        const incomingRoute = this.getRoute(this.getPath(req));
        if (incomingRoute == method.route) {
            return true;
        }
        const regexRoute = '^' + method.route.replace(/\{[A-Za-z0-9_\-]+}/, '[A-Za-z0-9]+') + '$';
        if (regexRoute != DEFAULT_ROUTE) {
            const regex = new RegExp(regexRoute);
            const match = incomingRoute.match(regex);
            if (match && (match[0] || match[0] === DEFAULT_ROUTE)) {
                return true;
            }
        }
        return false;
    }

    findMethod(req, controller) {
        var methods: ControllerMethod[] = Reflect.getMetadata(METADATAKEYS.CONTROLLER_METHODS, controller);
        var method = methods.find(x => this.methodMatches(req, x) &&
            this.routeMatches(req, x)         
            );
        if (method) {
            method.params = method.params ? method.params.map((x, i) => this.getRouteParams(this.getPath(req))[i]) : [];
            return method;
        }
    }
}

export const DEFAULT_ROUTE = '';