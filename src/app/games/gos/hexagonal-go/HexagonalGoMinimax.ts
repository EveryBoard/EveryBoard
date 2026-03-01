import { AbstractGoMinimax } from '../AbstractGoMinimax';
import { HexagonalGoHeuristic } from './HexagonalGoHeuristic';
import { HexagonalGoMoveGenerator } from './HexagonalGoMoveGenerator';
import { HexagonalGoConfig, HexagonalGoRules } from './HexagonalGoRules';

export class HexagonalGoMinimax extends AbstractGoMinimax<HexagonalGoConfig> {

    constructor() {
        super(
            HexagonalGoRules.get(),
            new HexagonalGoMoveGenerator(),
            new HexagonalGoHeuristic(),
        );
    }

}
