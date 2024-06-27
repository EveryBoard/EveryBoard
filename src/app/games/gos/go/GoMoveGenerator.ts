import { AbstractGoMoveGenerator } from '../AbstractGoMoveGenerator';
import { GoRules } from './GoRules';

export class GoMoveGenerator extends AbstractGoMoveGenerator {

    constructor() {
        super(GoRules.get());
    }

}
