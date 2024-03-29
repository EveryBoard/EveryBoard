import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { P4Move } from './P4Move';
import { P4State } from './P4State';
import { P4Config, P4Rules } from './P4Rules';
import { P4Heuristic } from './P4Heuristic';
import { P4OrderedMoveGenerator } from './P4OrderedMoveGenerator';

export class P4Minimax extends Minimax<P4Move, P4State, P4Config> {

    public constructor() {
        super($localize`Minimax`,
              P4Rules.get(),
              new P4Heuristic(),
              new P4OrderedMoveGenerator(),
        );
    }
}
