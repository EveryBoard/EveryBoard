import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { TaflMoveGenerator } from './TaflMoveGenerator';
import { TaflState } from './TaflState';
import { TaflMove } from './TaflMove';
import { TaflRules } from './TaflRules';
import { TaflPieceHeuristic } from './TaflPieceHeuristic';

export class TaflPieceMinimax<M extends TaflMove> extends Minimax<M, TaflState> {

    public constructor(rules: TaflRules<M>) {
        super($localize`Pieces`, rules, new TaflPieceHeuristic(rules), new TaflMoveGenerator(rules));
    }
}
