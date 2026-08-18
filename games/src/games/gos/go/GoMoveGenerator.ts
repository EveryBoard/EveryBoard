import { AbstractGoMoveGenerator } from '../AbstractGoMoveGenerator';

import { GoConfig, GoRules } from './GoRules';

export class GoMoveGenerator extends AbstractGoMoveGenerator<GoConfig> {

    public constructor() {
        super(GoRules.get());
    }

}
