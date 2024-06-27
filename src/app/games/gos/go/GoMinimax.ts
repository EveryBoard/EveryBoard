import { AbstractGoMinimax } from '../AbstractGoMinimax';
import { GoMoveGenerator } from './GoMoveGenerator';
import { GoConfig, GoRules } from './GoRules';

export class GoMinimax extends AbstractGoMinimax<GoConfig> {

    constructor() {
        super(
            GoRules.get(),
            new GoMoveGenerator(),
        );
    }

}
