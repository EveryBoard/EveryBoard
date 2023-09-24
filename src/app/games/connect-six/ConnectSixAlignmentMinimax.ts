import { Minimax } from 'src/app/jscaip/Minimax';
import { ConnectSixMove } from './ConnectSixMove';
import { ConnectSixState } from './ConnectSixState';
import { ConnectSixRules } from './ConnectSixRules';
import { ConnectSixAlignmentHeuristic } from './ConnectSixAlignmentHeuristic';
import { ConnectSixMoveGenerator } from './ConnectSixMoveGenerator';

export class ConnectSixAlignmentMinimax extends Minimax<ConnectSixMove, ConnectSixState> {

    public constructor() {
        super($localize`Alignment`, ConnectSixRules.get(), new ConnectSixAlignmentHeuristic(), new ConnectSixMoveGenerator());
    }
}
