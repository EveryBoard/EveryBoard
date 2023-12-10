import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { TaflMoveGenerator } from './TaflMoveGenerator';
import { TaflPieceAndInfluenceHeuristic } from './TaflPieceAndInfluenceHeuristic';
import { TaflState } from './TaflState';
import { TaflMove } from './TaflMove';
import { TaflRules } from './TaflRules';
import { TaflConfig } from './TaflConfig';

export class TaflPieceAndInfluenceMinimax<M extends TaflMove> extends Minimax<M, TaflState, TaflConfig> {

    public constructor(rules: TaflRules<M>) {
        super($localize`Pieces > Influence`,
              rules,
              new TaflPieceAndInfluenceHeuristic(rules),
              new TaflMoveGenerator(rules),
        );
    }

}
