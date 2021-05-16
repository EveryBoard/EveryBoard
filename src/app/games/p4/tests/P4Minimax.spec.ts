import { MGPNode } from 'src/app/jscaip/MGPNode';
import { P4Minimax } from '../P4Minimax';
import { P4Move } from '../P4Move';
import { P4PartSlice } from '../P4PartSlice';
import { P4Rules } from '../P4Rules';

describe('P4Minimax', () => {

    let minimax: P4Minimax;

    beforeEach(() => {
        MGPNode.ruler = new P4Rules(P4PartSlice);
        minimax = new P4Minimax('P4Minimax');
    });
    xit('First choice should be center at all IA depths', () => {
        const initialState: P4PartSlice = P4PartSlice.getInitialSlice();
        for (let depth: number = 1; depth < 6; depth ++) {
            const node: MGPNode<P4Rules, P4Move, P4PartSlice> = new MGPNode(null, null, initialState);
            expect(node.findBestMove(depth, minimax)).toEqual(P4Move.THREE);
        }
    });
});
