import { Minimax } from '../../jscaip/AI/Minimax';
import { TaflConfig } from './TaflConfig';
import { TaflMove } from './TaflMove';
import { TaflMoveGenerator } from './TaflMoveGenerator';
import { TaflPieceAndInfluenceHeuristic } from './TaflPieceAndInfluenceHeuristic';
import { TaflRules } from './TaflRules';
import { TaflState } from './TaflState';

export class TaflPieceAndInfluenceMinimax<M extends TaflMove> extends Minimax<M, TaflState, TaflConfig> {

    public constructor(rules: TaflRules<M>) {
        super($localize`Pieces > Influence`,
              rules,
              new TaflPieceAndInfluenceHeuristic(rules),
              new TaflMoveGenerator(rules),
        );
    }

}
