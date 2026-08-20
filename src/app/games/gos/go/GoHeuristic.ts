import { AbstractGoHeuristic } from '../AbstractGoHeuristic';
import { RectangularGoConfig } from '../abstract-rectangular-go/AbstractRectangularGoRules';

import { GoRules } from './GoRules';


export class GoHeuristic extends AbstractGoHeuristic<RectangularGoConfig> {

    public constructor() {
        super(GoRules.get());
    }

}
