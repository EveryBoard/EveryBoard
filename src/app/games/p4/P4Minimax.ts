import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { display } from 'src/app/utils/utils';
import { P4Move } from './P4Move';
import { P4State } from './P4State';
import { P4Node, P4Rules } from './P4Rules';

export class P4Minimax extends Minimax<P4Move, P4State> {
    public getListMoves(node: P4Node): P4Move[] {
        return P4Rules.getListMoves(node);
    }
    public getBoardValue(node: P4Node): NodeUnheritance {
        const state: P4State = node.gameState;
        display(P4Rules.VERBOSE, {
            text: 'P4Rules instance methods getBoardValue called',
            board: state.getCopiedBoard(),
        });
        return P4Rules.getBoardValue(state);
    }
}
