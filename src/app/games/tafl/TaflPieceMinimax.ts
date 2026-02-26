import { Minimax } from '../../jscaip/AI/Minimax';

import { TaflConfig } from './TaflConfig';
import { TaflMove } from './TaflMove';
import { TaflMoveGenerator } from './TaflMoveGenerator';
import { TaflPieceHeuristic } from './TaflPieceHeuristic';
import { TaflRules } from './TaflRules';
import { TaflState } from './TaflState';

export class TaflPieceMinimax<M extends TaflMove> extends Minimax<M, TaflState, TaflConfig> {

    public constructor(rules: TaflRules<M>) {
        super($localize`Pieces`,
              rules,
              new TaflPieceHeuristic(rules),
              new TaflMoveGenerator(rules),
        );
    }

}
