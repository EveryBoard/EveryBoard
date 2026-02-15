import { Minimax } from '../../jscaip/AI/Minimax';
import { GobanConfig } from '../../jscaip/GobanConfig';
import { ConnectSixAlignmentHeuristic } from './ConnectSixAlignmentHeuristic';
import { ConnectSixMove } from './ConnectSixMove';
import { ConnectSixMoveGenerator } from './ConnectSixMoveGenerator';
import { ConnectSixRules } from './ConnectSixRules';
import { ConnectSixState } from './ConnectSixState';

export class ConnectSixAlignmentMinimax extends Minimax<ConnectSixMove, ConnectSixState, GobanConfig> {

    public constructor() {
        super($localize`Alignment`,
              ConnectSixRules.get(),
              new ConnectSixAlignmentHeuristic(),
              new ConnectSixMoveGenerator(),
        );
    }
}
