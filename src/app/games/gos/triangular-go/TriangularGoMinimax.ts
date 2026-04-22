import { AbstractGoMinimax } from '../AbstractGoMinimax';

import { TriangularGoHeuristic } from './TriangularGoHeuristic';
import { TriangularGoMoveGenerator as TriangularGoMoveGenerator } from './TriangularGoMoveGenerator';
import { TriangularGoConfig, TriangularGoRules } from './TriangularGoRules';

export class TriangularGoMinimax extends AbstractGoMinimax<TriangularGoConfig> {

    public constructor() {
        super(
            TriangularGoRules.get(),
            new TriangularGoMoveGenerator(),
            new TriangularGoHeuristic(),
        );
    }

}
