import { AbstractGoMinimax } from '../AbstractGoMinimax';
import { TrigoHeuristic } from './TrigoHeuristic';
import { TrigoMoveGenerator } from './TrigoMoveGenerator';
import { TrigoConfig, TrigoRules } from './TrigoRules';

export class TrigoMinimax extends AbstractGoMinimax<TrigoConfig> {

    constructor() {
        super(
            TrigoRules.get(),
            new TrigoMoveGenerator(),
            new TrigoHeuristic(),
        );
    }

}
