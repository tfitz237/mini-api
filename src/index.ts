import * as http from 'http';

import Routing from './lib/routing';

class HttpServer {
    server: http.Server;

    constructor() {
        this.startServer();
    }
    async startServer() {       
        const router = new Routing();
        await router.initialize();
        this.server = http.createServer((req,res) => router.route(req,res)).listen(8080);        
    }    
}

const server = new HttpServer();