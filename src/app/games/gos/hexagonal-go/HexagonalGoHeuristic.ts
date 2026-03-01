import { AbstractGoHeuristic } from '../AbstractGoHeuristic';
import { HexagonalGoConfig, HexagonalGoRules } from './HexagonalGoRules';

export class HexagonalGoHeuristic extends AbstractGoHeuristic<HexagonalGoConfig> {

    constructor() {
        super(HexagonalGoRules.get());
    }

}
