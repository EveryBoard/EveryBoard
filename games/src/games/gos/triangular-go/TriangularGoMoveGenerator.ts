import { AbstractGoMoveGenerator } from '../AbstractGoMoveGenerator';

import { TriangularGoConfig, TriangularGoRules } from './TriangularGoRules';

export class TriangularGoMoveGenerator extends AbstractGoMoveGenerator<TriangularGoConfig> {

    public constructor() {
        super(TriangularGoRules.get());
    }

}
