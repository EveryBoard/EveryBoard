import { AbstractGoMoveGenerator } from '../AbstractGoMoveGenerator';
import { RectangularGoConfig } from '../abstract-rectangular-go/AbstractRectangularGoRules';

import { GoRules } from './GoRules';

export class GoMoveGenerator extends AbstractGoMoveGenerator<RectangularGoConfig> {

    public constructor() {
        super(GoRules.get());
    }

}
