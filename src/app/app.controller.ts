import { Controller, Get, Header } from '../lib/controller';
import AppService from './app.services';

@Controller('app')
export default class AppController {

    constructor(private appService: AppService) {

    }
    @Get('ping/{response}')
    ping(response: string) {
        return {response, time: Date.now()};
    }

    @Header('Content-Type', 'text/html')
    @Get('html')
    html() {
        return `<!DOCTYPE html>
<html>
    <head>
        <title>Hello World</title>
    </head>
    <body>
        <p>
            I'm a little teapot short and stout
        </p>
    </body>
</html>
        `;
    }

    @Get('{test}')
    home(test: string) {
        return this.appService.get(test);
    }

}