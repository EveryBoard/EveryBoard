import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { TaflMoveGenerator } from './TaflMoveGenerator';
import { TaflState } from './TaflState';
import { TaflMove } from './TaflMove';
import { TaflRules } from './TaflRules';
import { TaflEscapeThenPieceThenControlHeuristic } from './TaflEscapeThenPieceThenControlHeuristic';
import { TaflConfig } from './TaflConfig';

export class TaflEscapeThenPieceThenControlMinimax<M extends TaflMove> extends Minimax<M, TaflState, TaflConfig> {

    public constructor(rules: TaflRules<M>) {
        super($localize`Escape > Pieces > Control`,
              rules,
              new TaflEscapeThenPieceThenControlHeuristic(rules),
              new TaflMoveGenerator(rules),
        );
    }

}
