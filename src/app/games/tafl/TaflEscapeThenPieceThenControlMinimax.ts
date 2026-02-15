import { Minimax } from '../../jscaip/AI/Minimax';
import { TaflConfig } from './TaflConfig';
import { TaflEscapeThenPieceThenControlHeuristic } from './TaflEscapeThenPieceThenControlHeuristic';
import { TaflMove } from './TaflMove';
import { TaflMoveGenerator } from './TaflMoveGenerator';
import { TaflRules } from './TaflRules';
import { TaflState } from './TaflState';

export class TaflEscapeThenPieceThenControlMinimax<M extends TaflMove> extends Minimax<M, TaflState, TaflConfig> {

    public constructor(rules: TaflRules<M>) {
        super($localize`Escape > Pieces > Control`,
              rules,
              new TaflEscapeThenPieceThenControlHeuristic(rules),
              new TaflMoveGenerator(rules),
        );
    }

}
