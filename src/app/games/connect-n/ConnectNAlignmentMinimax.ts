import { Minimax } from '../../jscaip/AI/Minimax';
import { FourStatePiece } from '../../jscaip/FourStatePiece';
import { TopologicGameState } from '../../jscaip/state/TopologicGameState';
import { ConnectSixMove } from '../connect-six/ConnectSixMove';

import { ConnectNAlignmentHeuristic } from './ConnectNAlignmentHeuristic';
import { ConnectNMoveGenerator } from './ConnectNMoveGenerator';
import { ConnectNConfig, ConnectNRules } from './ConnectNRules';

export class ConnectNAlignmentMinimax
    extends Minimax<ConnectSixMove, TopologicGameState<FourStatePiece>, ConnectNConfig>
{

    public constructor() {
        super($localize`Alignment`,
              ConnectNRules.get(),
              new ConnectNAlignmentHeuristic(),
              new ConnectNMoveGenerator(),
        );
    }
}
