import { Minimax } from 'src/app/jscaip/Minimax';
import { P4Move } from './P4Move';
import { P4State } from './P4State';
import { P4Rules } from './P4Rules';
import { P4MoveGenerator } from './P4MoveGenerator';
import { P4Heuristic } from './P4Heuristic';

export class P4Minimax extends Minimax<P4Move, P4State> {

    public constructor() {
        super('Minimax', P4Rules.get(), new P4Heuristic(), new P4MoveGenerator());
    }
}
