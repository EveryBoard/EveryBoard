import { AbstractGoHeuristic } from '../AbstractGoHeuristic';
import { GoRules } from './GoRules';

export class GoHeuristic extends AbstractGoHeuristic {

    constructor() {
        super(GoRules.get());
    }

}
