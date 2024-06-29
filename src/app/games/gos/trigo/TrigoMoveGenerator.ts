import { AbstractGoMoveGenerator } from '../AbstractGoMoveGenerator';
import { TrigoRules } from './TrigoRules';

export class TrigoMoveGenerator extends AbstractGoMoveGenerator {

    constructor() {
        super(TrigoRules.get());
    }

}
