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


    @Get('{test}')
    home(test: string) {
        return this.appService.get(test);
    }

}