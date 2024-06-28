import { AbstractGoMinimax } from '../AbstractGoMinimax';
import { TriGoHeuristic } from './TriGoHeuristic';
import { TriGoMoveGenerator } from './TriGoMoveGenerator';
import { TriGoConfig, TriGoRules } from './TriGoRules';

export class TriGoMinimax extends AbstractGoMinimax<TriGoConfig> {

    constructor() {
        super(
            TriGoRules.get(),
            new TriGoMoveGenerator(),
            new TriGoHeuristic(),
        );
    }

}
