import { Minimax } from '../../jscaip/AI/Minimax';
import { TaflConfig } from './TaflConfig';
import { TaflMove } from './TaflMove';
import { TaflMoveGenerator } from './TaflMoveGenerator';
import { TaflPieceAndControlHeuristic } from './TaflPieceAndControlHeuristic';
import { TaflRules } from './TaflRules';
import { TaflState } from './TaflState';

export class TaflPieceAndControlMinimax<M extends TaflMove> extends Minimax<M, TaflState, TaflConfig> {

    public constructor(rules: TaflRules<M>) {
        super($localize`Pieces > Control`,
              rules,
              new TaflPieceAndControlHeuristic(rules),
              new TaflMoveGenerator(rules),
        );
    }

}
