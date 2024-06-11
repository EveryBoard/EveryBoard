import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { HexagonalConnectionMove } from './HexagonalConnectionMove';
import { HexagonalConnectionState } from './HexagonalConnectionState';
import { HexagonalConnectionConfig, HexagonalConnectionRules } from './HexagonalConnectionRules';
import { HexagonalConnectionAlignmentHeuristic } from './HexagonalConnectionAlignmentHeuristic';
import { HexagonalConnectionMoveGenerator } from './HexagonalConnectionMoveGenerator';

export class HexagonalConnectionAlignmentMinimax extends Minimax<HexagonalConnectionMove,
                                                                 HexagonalConnectionState,
                                                                 HexagonalConnectionConfig>
{
    public constructor() {
        super($localize`Alignment`,
              HexagonalConnectionRules.get(),
              new HexagonalConnectionAlignmentHeuristic(),
              new HexagonalConnectionMoveGenerator(),
        );
    }
}
