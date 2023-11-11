import { Minimax } from 'src/app/jscaip/Minimax';
import { TaflMoveGenerator } from './TaflMoveGenerator';
import { TaflState } from './TaflState';
import { TaflMove } from './TaflMove';
import { TaflRules } from './TaflRules';
import { TaflPieceAndControlHeuristic } from './TaflPieceAndControlHeuristic';

export class TaflPieceAndControlMinimax<M extends TaflMove, S extends TaflState> extends Minimax<M, S> {

    public constructor(rules: TaflRules<M, S>) {
        super($localize`Pieces > Control`,
              rules,
              new TaflPieceAndControlHeuristic(rules),
              new TaflMoveGenerator(rules),
        );
    }
}
