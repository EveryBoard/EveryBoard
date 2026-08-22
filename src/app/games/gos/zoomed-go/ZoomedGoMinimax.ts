import { AbstractGoMinimax } from '../AbstractGoMinimax';
import { RectangularGoConfig } from '../abstract-rectangular-go/AbstractRectangularGoRules';
import { GoHeuristic } from '../go/GoHeuristic';

import { ZoomedGoMoveGenerator } from './ZoomedGoMoveGenerator';
import { ZoomedGoRules } from './ZoomedGoRules';

export class ZoomedGoMinimax extends AbstractGoMinimax<RectangularGoConfig> {

    public constructor() {
        super(
            ZoomedGoRules.get(),
            new ZoomedGoMoveGenerator(),
            new GoHeuristic(),
        );
    }

}
