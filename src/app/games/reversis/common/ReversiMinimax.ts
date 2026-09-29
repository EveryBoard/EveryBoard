import { Minimax } from '../../../jscaip/AI/Minimax';

import { TopologicReversiRules, ReversiConfig, ReversiLegalityInformation } from './AbstractReversiRules';
import { ReversiHeuristic } from './ReversiHeuristic';
import { ReversiMove } from './ReversiMove';
import { ReversiMoveGenerator } from './ReversiMoveGenerator';
import { ReversiState } from './ReversiState';

export class ReversiMinimax<R extends TopologicReversiRules>
    extends Minimax<ReversiMove, ReversiState, ReversiConfig, ReversiLegalityInformation>
{
    public constructor(rules: R) {
        super($localize`Minimax`,
              rules,
              new ReversiHeuristic(rules),
              new ReversiMoveGenerator(rules),
        );
    }
}
