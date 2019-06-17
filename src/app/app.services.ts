import { Service } from "../lib/injectables";

@Service()
export default class AppService {

    get(test: string) {
        return {[test]:'helloooooooo'};
    }

}