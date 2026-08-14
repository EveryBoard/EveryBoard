/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '@everyboard/games';
import { Minimax } from '@everyboard/games';

import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { P4Heuristic } from '../P4Heuristic';
import { P4Move } from '../P4Move';
import { P4OrderedMoveGenerator } from '../P4OrderedMoveGenerator';
import { P4Config, P4Node, P4Rules } from '../P4Rules';
import { P4State } from '../P4State';

class P4Minimax extends Minimax<P4Move, P4State, P4Config> {
    public constructor() {
        super('Minimax', P4Rules.get(), new P4Heuristic(), new P4OrderedMoveGenerator());
    }
}

describe('P4Minimax', () => {

    let minimax: Minimax<P4Move, P4State, P4Config>;
    const defaultConfig: P4Config = P4Rules.get().getDefaultRulesConfig();

    beforeEach(() => {
        minimax = new P4Minimax();
    });

    it('should choose center as first choice at all AI depths', () => {
        const initialState: P4State = P4Rules.get().getInitialState(defaultConfig);
        for (let depth: number = 1; depth < 6; depth ++) {
            const node: P4Node = new P4Node(initialState);
            expect(minimax.chooseNextMove(node, { name: `Level ${depth}`, maxDepth: depth }, defaultConfig))
                .withContext('depth ' + depth + ' should still think center is better')
                .toEqual(P4Move.of(3));
        }
    });

    SlowTest.it('should be able play against itself', () => {
        const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
        minimaxTest({
            rules: P4Rules.get(),
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: true,
        });
    });

});
