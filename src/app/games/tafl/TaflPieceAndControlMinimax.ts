import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { TaflMoveGenerator } from './TaflMoveGenerator';
import { TaflState } from './TaflState';
import { TaflMove } from './TaflMove';
import { TaflRules } from './TaflRules';
import { TaflPieceAndControlHeuristic } from './TaflPieceAndControlHeuristic';
import { TaflConfig } from './TaflConfig';

export class TaflPieceAndControlMinimax<M extends TaflMove> extends Minimax<M, TaflState, TaflConfig> {

    public constructor(rules: TaflRules<M>) {
        super($localize`Pieces > Control`,
              rules,
              new TaflPieceAndControlHeuristic(rules),
              new TaflMoveGenerator(rules),
        );
    }

}
