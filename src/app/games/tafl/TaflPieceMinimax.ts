import { Minimax } from 'src/app/jscaip/Minimax';
import { TaflMoveGenerator } from './TaflMoveGenerator';
import { TaflState } from './TaflState';
import { TaflMove } from './TaflMove';
import { TaflRules } from './TaflRules';
import { TaflPieceHeuristic } from './TaflPieceHeuristic';
import { TaflConfig } from './TaflConfig';

export class TaflPieceMinimax<M extends TaflMove> extends Minimax<M, TaflState, TaflConfig> {

    public constructor(rules: TaflRules<M>) {
        super($localize`Pieces`,
              rules,
              new TaflPieceHeuristic(rules),
              new TaflMoveGenerator(rules),
        );
    }

}
