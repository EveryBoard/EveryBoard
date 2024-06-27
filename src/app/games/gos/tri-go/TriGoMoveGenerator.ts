import { AbstractGoMoveGenerator } from '../AbstractGoMoveGenerator';
import { TriGoRules } from './TriGoRules';

export class TriGoMoveGenerator extends AbstractGoMoveGenerator {

    constructor() {
        super(TriGoRules.get());
    }

}
