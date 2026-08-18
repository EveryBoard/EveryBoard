import { AbstractGoMoveGenerator } from '../AbstractGoMoveGenerator';

import { HexagonalGoConfig, HexagonalGoRules } from './HexagonalGoRules';

export class HexagonalGoMoveGenerator extends AbstractGoMoveGenerator<HexagonalGoConfig> {

    public constructor() {
        super(HexagonalGoRules.get());
    }

}
