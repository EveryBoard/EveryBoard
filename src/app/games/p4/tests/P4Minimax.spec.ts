import { MGPNode } from 'src/app/jscaip/MGPNode';
import { P4Minimax } from '../P4Minimax';
import { P4Move } from '../P4Move';
import { P4State } from '../P4State';
import { P4Rules } from '../P4Rules';

describe('P4Minimax', () => {

    let minimax: P4Minimax;

    beforeEach(() => {
        const rules: P4Rules = new P4Rules(P4State);
        minimax = new P4Minimax(rules, 'P4Minimax');
    });
    xit('First choice should be center at all IA depths', () => {
        const initialState: P4State = P4State.getInitialState();
        for (let depth: number = 1; depth < 6; depth ++) {
            const node: MGPNode<P4Rules, P4Move, P4State> = new MGPNode(initialState);
            expect(node.findBestMove(depth, minimax)).toEqual(P4Move.THREE);
        }
    });
});
