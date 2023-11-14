import { Minimax } from 'src/app/jscaip/Minimax';
import { TaflMoveGenerator } from './TaflMoveGenerator';
import { TaflPieceAndInfluenceHeuristic } from './TaflPieceAndInfluenceHeuristic';
import { TaflState } from './TaflState';
import { TaflMove } from './TaflMove';
import { TaflRules } from './TaflRules';

export class TaflPieceAndInfluenceMinimax<M extends TaflMove> extends Minimax<M, TaflState> {

    public constructor(rules: TaflRules<M>) {
        super($localize`Pieces > Influence`,
              rules,
              new TaflPieceAndInfluenceHeuristic(rules),
              new TaflMoveGenerator(rules),
        );
    }

}
