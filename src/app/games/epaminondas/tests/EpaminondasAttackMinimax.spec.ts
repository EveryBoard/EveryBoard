/* eslint-disable max-lines-per-function */
import { Ordinal } from 'src/app/jscaip/Ordinal';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { Table } from 'src/app/jscaip/TableUtils';
import { EpaminondasMove } from '../EpaminondasMove';
import { EpaminondasState } from '../EpaminondasState';
import { AIDepthLimitOptions } from 'src/app/jscaip/AI/AI';
import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { EpaminondasConfig, EpaminondasLegalityInformation, EpaminondasNode, EpaminondasRules } from '../EpaminondasRules';
import { EpaminondasAttackMinimax } from '../EpaminondasAttackMinimax';
import { MGPOptional } from '@everyboard/lib';
import { minimaxTest, SlowTest } from 'src/app/utils/tests/TestUtils.spec';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('EpaminondasAttackMinimax', () => {

    let minimax: Minimax<EpaminondasMove, EpaminondasState, EpaminondasConfig, EpaminondasLegalityInformation>;
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: MGPOptional<EpaminondasConfig> = EpaminondasRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        minimax = new EpaminondasAttackMinimax();
    });

    it('should consider possible capture the best move', () => {
        const board: Table<PlayerOrNone> = [
            [X, X, X, X, X, X, X, X, _, _, _, _, _, _],
            [_, O, O, _, _, _, X, X, X, X, _, _, _, _],
            [_, _, O, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, O, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, X, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, O, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, O, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, O, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const state: EpaminondasState = new EpaminondasState(board, 1);
        const node: EpaminondasNode = new EpaminondasNode(state);
        const expectedMove: EpaminondasMove = new EpaminondasMove(9, 1, 4, 4, Ordinal.LEFT);
        const bestMove: EpaminondasMove = minimax.chooseNextMove(node, minimaxOptions, defaultConfig);
        expect(bestMove).toEqual(expectedMove);
    });

    SlowTest.it('should be able play against itself', () => {
        minimaxTest({
            rules: EpaminondasRules.get(),
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: false, // not always a finisher
        });
    });

});
