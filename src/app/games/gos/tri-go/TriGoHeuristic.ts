import { AbstractGoHeuristic } from '../AbstractGoHeuristic';
import { TriGoConfig, TriGoRules } from './TriGoRules';

export class TriGoHeuristic extends AbstractGoHeuristic<TriGoConfig> {

    constructor() {
        super(TriGoRules.get());
    }

}
