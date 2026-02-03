import { Minimax } from '../../jscaip/AI/Minimax';
import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasPhalanxSizeAndFilterMoveGenerator } from './EpaminondasPhalanxSizeAndFilterMoveGenerator';
import { EpaminondasPieceThenRowDominationThenAlignmentThenRowPresenceHeuristic } from './EpaminondasPieceThenRowDominationThenAlignmentThenRowPresenceHeuristic';
import { EpaminondasConfig, EpaminondasLegalityInformation, EpaminondasRules } from './EpaminondasRules';
import { EpaminondasState } from './EpaminondasState';

export class EpaminondasMinimax extends Minimax<EpaminondasMove,
                                                EpaminondasState,
                                                EpaminondasConfig,
                                                EpaminondasLegalityInformation>
{

    public constructor() {
        super($localize`Piece > Row Domination > Alignment > Row Presence`,
              EpaminondasRules.get(),
              new EpaminondasPieceThenRowDominationThenAlignmentThenRowPresenceHeuristic(),
              new EpaminondasPhalanxSizeAndFilterMoveGenerator(),
        );
    }

}
