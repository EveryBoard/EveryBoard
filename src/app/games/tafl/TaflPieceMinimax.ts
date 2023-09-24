import { Minimax } from 'src/app/jscaip/Minimax';
import { TaflMoveGenerator } from './TaflMoveGenerator';
import { TaflState } from './TaflState';
import { TaflMove } from './TaflMove';
import { TaflRules } from './TaflRules';
import { TaflPieceHeuristic } from './TaflPieceHeuristic';

export class TaflPieceMinimax<M extends TaflMove, S extends TaflState> extends Minimax<M, S> {

    public constructor(rules: TaflRules<M, S>) {
        super($localize`Piece`, rules, new TaflPieceHeuristic(rules), new TaflMoveGenerator(rules));
    }
}
