import { Minimax } from '../../../app/jscaip/AI/Minimax';
import { ConnectSixMove } from './ConnectSixMove';
import { ConnectSixState } from './ConnectSixState';
import { ConnectSixRules } from './ConnectSixRules';
import { ConnectSixAlignmentHeuristic } from './ConnectSixAlignmentHeuristic';
import { ConnectSixMoveGenerator } from './ConnectSixMoveGenerator';
import { GobanConfig } from '../../../app/jscaip/GobanConfig';

export class ConnectSixAlignmentMinimax extends Minimax<ConnectSixMove, ConnectSixState, GobanConfig> {

    public constructor() {
        super($localize`Alignment`,
              ConnectSixRules.get(),
              new ConnectSixAlignmentHeuristic(),
              new ConnectSixMoveGenerator(),
        );
    }
}
