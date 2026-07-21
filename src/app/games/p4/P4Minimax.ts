import { Player } from '../../jscaip/Player';
import { DummyHeuristic, IterativeDeepeningMinimax, Minimax } from '../../jscaip/AI/Minimax';

import { P4Heuristic } from './P4Heuristic';
import { P4Move } from './P4Move';
import { P4OrderedMoveGenerator } from './P4OrderedMoveGenerator';
import { P4Config, P4Rules } from './P4Rules';
import { P4State } from './P4State';

export class P4Minimax extends Minimax<P4Move, P4State, P4Config> {

    public constructor() {
        super($localize`Minimax`,
              P4Rules.get(),
              new P4Heuristic(),
              new P4OrderedMoveGenerator(),
        );
        this.transpositionTables = false;
    }
}

export class P4IDMinimax extends IterativeDeepeningMinimax<P4Move, P4State, P4Config> {

    public constructor() {
        super($localize`IDMinimax`,
              P4Rules.get(),
              new DummyHeuristic(),
              new P4OrderedMoveGenerator(),
        );
    }

    public override hash(state: P4State): string {
        let result: string = '';
        for (const line of state.board) {
            for (const cell of line) {
                switch (cell) {
                    case Player.ZERO:
                        result += '0';
                        break;
                    case Player.ONE:
                        result += '1';
                        break;
                    default:
                        result += '_';
                }
            }
        }
        return result;
    }
}
