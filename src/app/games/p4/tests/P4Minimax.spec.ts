/* eslint-disable max-lines-per-function */
import { P4Move } from '../P4Move';
import { P4State } from '../P4State';
import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { P4Config, P4Node, P4Rules } from '../P4Rules';
import { P4Minimax } from '../P4Minimax';
import { MGPOptional } from '@everyboard/lib';
import { minimaxTest, SlowTest } from 'src/app/utils/tests/TestUtils.spec';
import { AIDepthLimitOptions } from 'src/app/jscaip/AI/AI';

describe('P4Minimax', () => {

    let minimax: Minimax<P4Move, P4State, P4Config>;
    const defaultConfig: MGPOptional<P4Config> = P4Rules.get().getDefaultRulesConfig();

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
