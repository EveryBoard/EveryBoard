import { AbstractGoHeuristic } from '../AbstractGoHeuristic';
import { GoConfig, GoRules } from './GoRules';

export class GoHeuristic extends AbstractGoHeuristic<GoConfig> {

    constructor() {
        super(GoRules.get());
    }

}
