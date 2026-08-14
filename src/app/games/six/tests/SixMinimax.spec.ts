/* eslint-disable max-lines-per-function */
import { Player, PlayerOrNone } from '@everyboard/games';
import { AIDepthLimitOptions } from '@everyboard/games';
import { Minimax } from '@everyboard/games';
import { Coord } from '@everyboard/games';
import { Table } from '@everyboard/games';

import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { SixFilteredMoveGenerator } from '../SixFilteredMoveGenerator';
import { SixHeuristic } from '../SixHeuristic';
import { SixMove } from '../SixMove';
import { SixConfig, SixLegalityInformation, SixNode, SixRules } from '../SixRules';
import { SixState } from '../SixState';

const O: PlayerOrNone = Player.ZERO;
const X: PlayerOrNone = Player.ONE;
const _: PlayerOrNone = PlayerOrNone.NONE;

class SixMinimax extends Minimax<SixMove, SixState, SixConfig, SixLegalityInformation> {
    public constructor() {
        const rules: SixRules = SixRules.get();
        super('Minimax', rules, new SixHeuristic(), new SixFilteredMoveGenerator(rules));
    }
}

describe('SixMinimax', () => {

    let minimax: Minimax<SixMove, SixState, SixConfig, SixLegalityInformation>;
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: SixConfig = SixRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        minimax = new SixMinimax();
    });

    it('should not consider moving piece that are blocking an opponent victory', () => {
        // Given a board with only one non losing move
        const board: Table<PlayerOrNone> = [
            [O, O, _, _, _, _, O],
            [X, _, _, _, _, X, _],
            [X, _, _, O, X, X, _],
            [X, X, O, X, X, O, _],
            [X, _, X, X, O, _, _],
            [_, X, _, _, _, _, _],
        ];
        const state: SixState = SixState.ofRepresentation(board, 40);
        const node: SixNode = new SixNode(state);

        // When asking the minimax the best choice
        const bestMove: SixMove = minimax.chooseNextMove(node, minimaxOptions, defaultConfig);
        expect(bestMove.start.get()).toEqual(new Coord(1, 0));
    });

    SlowTest.it('should be able to play against itself', () => {
        minimaxTest({
            rules: SixRules.get(),
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: true,
        });
    });

});
