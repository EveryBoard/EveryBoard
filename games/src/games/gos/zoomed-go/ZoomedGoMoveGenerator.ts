import { AbstractGoMoveGenerator } from '../AbstractGoMoveGenerator';
import { RectangularGoConfig } from '../abstract-rectangular-go/AbstractRectangularGoRules';

import { ZoomedGoRules } from './ZoomedGoRules';

export class ZoomedGoMoveGenerator extends AbstractGoMoveGenerator<RectangularGoConfig> {

    public constructor() {
        super(ZoomedGoRules.get());
    }

}
