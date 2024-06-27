import { AbstractGoHeuristic } from '../AbstractGoHeuristic';
import { TriGoRules } from './TriGoRules';

export class TriGoHeuristic extends AbstractGoHeuristic {

    constructor() {
        super(TriGoRules.get());
    }

}
