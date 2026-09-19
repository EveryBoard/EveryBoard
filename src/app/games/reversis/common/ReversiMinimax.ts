import { Minimax } from '../../../jscaip/AI/Minimax';

import { AbstractReversiRules, ReversiConfig, ReversiLegalityInformation } from './AbstractReversiRules';
import { ReversiHeuristic } from './ReversiHeuristic';
import { ReversiMove } from './ReversiMove';
import { ReversiMoveGenerator } from './ReversiMoveGenerator';
import { ReversiState } from './ReversiState';

export class ReversiMinimax<R extends AbstractReversiRules>
    extends Minimax<ReversiMove, ReversiState, ReversiConfig, ReversiLegalityInformation>
{
    public constructor(rules: R) {
        super($localize`Minimax`,
              rules,
              new ReversiHeuristic(),
              new ReversiMoveGenerator(rules),
        );
    }
}
