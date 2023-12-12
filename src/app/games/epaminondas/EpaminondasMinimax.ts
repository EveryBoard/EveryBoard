import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasState } from './EpaminondasState';
import { EpaminondasConfig, EpaminondasLegalityInformation, EpaminondasRules } from './EpaminondasRules';
import { EpaminondasPhalanxSizeAndFilterMoveGenerator } from './EpaminondasPhalanxSizeAndFilterMoveGenerator';
import { EpaminondasPieceThenRowDominationThenAlignementThenRowPresenceHeuristic } from './EpaminondasPieceThenRowDominationThenAlignementThenRowPresenceHeuristic';

export class EpaminondasMinimax extends Minimax<EpaminondasMove,
                                                EpaminondasState,
                                                EpaminondasConfig,
                                                EpaminondasLegalityInformation>
{

    public constructor() {
        super($localize`Piece > Row Domination > Alignement > Row Presence`,
              EpaminondasRules.get(),
              new EpaminondasPieceThenRowDominationThenAlignementThenRowPresenceHeuristic(),
              new EpaminondasPhalanxSizeAndFilterMoveGenerator(),
        );
    }

}
