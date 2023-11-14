/* eslint-disable max-lines-per-function */
import { P4Move } from '../P4Move';
import { P4State } from '../P4State';
import { P4Config, P4Node, P4Rules } from '../P4Rules';
import { Minimax } from 'src/app/jscaip/Minimax';
import { P4Minimax } from '../P4Minimax';

describe('P4Minimax', () => {

    let minimax: Minimax<P4Move, P4State>;
    const config: P4Config = P4Rules.RULES_CONFIG_DESCRIPTION.getDefaultConfig().config;

    beforeEach(() => {
        minimax = new P4Minimax();
    });
    it('First choice should be center at all AI depths', () => {
        const initialState: P4State = P4Rules.get().getInitialState(config);
        for (let depth: number = 1; depth < 6; depth ++) {
            const node: P4Node = new P4Node(initialState);
            expect(minimax.chooseNextMove(node, { name: `Level ${depth}`, maxDepth: depth }))
                .withContext('depth ' + depth + ' should still think center is better')
                .toEqual(P4Move.of(3));
        }
    });
});
