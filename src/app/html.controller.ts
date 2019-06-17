import { Controller, Get, Header } from '../lib/controller';
import AppService from './app.services';

@Controller('html')
export default class HtmlController {

    constructor(private appService: AppService) {

    }

    @Get('test')
    test() {
        return this.appService.get('test!!!!!!!');
    }

    @Header('Content-Type', 'text/html')
    @Get()
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

}