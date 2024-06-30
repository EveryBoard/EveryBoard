import { AbstractGoMoveGenerator } from '../AbstractGoMoveGenerator';
import { TrigoConfig, TrigoRules } from './TrigoRules';

export class TrigoMoveGenerator extends AbstractGoMoveGenerator<TrigoConfig> {

    constructor() {
        super(TrigoRules.get());
    }

}
