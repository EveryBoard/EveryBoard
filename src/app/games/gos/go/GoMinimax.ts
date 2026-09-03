import { AbstractGoMinimax } from '../AbstractGoMinimax';
import { RectangularGoConfig } from '../abstract-rectangular-go/AbstractRectangularGoRules';

import { GoHeuristic } from './GoHeuristic';
import { GoMoveGenerator } from './GoMoveGenerator';
import { GoRules } from './GoRules';

export class GoMinimax extends AbstractGoMinimax<RectangularGoConfig> {

    public constructor() {
        super(
            GoRules.get(),
            new GoMoveGenerator(),
            new GoHeuristic(),
        );
    }

}
