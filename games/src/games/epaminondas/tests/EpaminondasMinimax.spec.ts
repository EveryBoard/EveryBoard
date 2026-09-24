/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { Ordinal } from '../../../jscaip/Ordinal';
import { PlayerOrNone } from '../../../jscaip/Player';
import { Table } from '../../../jscaip/TableUtils';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { EpaminondasMove } from '../EpaminondasMove';
import { EpaminondasPhalanxSizeAndFilterMoveGenerator } from '../EpaminondasPhalanxSizeAndFilterMoveGenerator';
import { EpaminondasPieceThenRowDominationThenAlignmentThenRowPresenceHeuristic } from '../EpaminondasPieceThenRowDominationThenAlignmentThenRowPresenceHeuristic';
import { EpaminondasConfig, EpaminondasLegalityInformation, EpaminondasRules } from '../EpaminondasRules';
import { EpaminondasNode } from '../EpaminondasRules';
import { EpaminondasState } from '../EpaminondasState';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

class EpaminondasMinimax extends Minimax<EpaminondasMove,
                                         EpaminondasState,
                                         EpaminondasConfig,
                                         EpaminondasLegalityInformation>
{
    public constructor() {
        super('Piece > Row Domination > Alignment > Row Presence',
              EpaminondasRules.get(),
              new EpaminondasPieceThenRowDominationThenAlignmentThenRowPresenceHeuristic(),
              new EpaminondasPhalanxSizeAndFilterMoveGenerator(),
        );
    }
}

describe('EpaminondasMinimax', () => {

    let minimax: Minimax<EpaminondasMove, EpaminondasState, EpaminondasConfig, EpaminondasLegalityInformation>;
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: EpaminondasConfig = EpaminondasRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        minimax = new EpaminondasMinimax();
    });

    it('should consider possible capture the best move', () => {
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, O, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, X, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, O, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, O, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, O, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const state: EpaminondasState = new EpaminondasState(board, 0);
        const node: EpaminondasNode = new EpaminondasNode(state);
        const capture: EpaminondasMove = new EpaminondasMove(4, 9, 2, 1, Ordinal.UP);
        const bestMove: EpaminondasMove = minimax.chooseNextMove(node, minimaxOptions, defaultConfig);
        expect(bestMove).toEqual(capture);
    });

    SlowTest.it('should be able play against itself', () => {
        minimaxTest({
            rules: EpaminondasRules.get(),
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: true,
        });
    });

});
