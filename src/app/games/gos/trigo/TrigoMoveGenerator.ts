import { AbstractGoMoveGenerator } from '../AbstractGoMoveGenerator';

import { TrigoConfig, TrigoRules } from './TrigoRules';

export class TrigoMoveGenerator extends AbstractGoMoveGenerator<TrigoConfig> {

    public constructor() {
        super(TrigoRules.get());
    }

}
