import { AbstractGoHeuristic } from '../AbstractGoHeuristic';
import { RectangularGoConfig } from '../abstract-rectangular-go/AbstractRectangularGoRules';

import { ZoomedGoRules } from './ZoomedGoRules';


export class ZoomedGoHeuristic extends AbstractGoHeuristic<RectangularGoConfig> {

    public constructor() {
        super(ZoomedGoRules.get());
    }

}
