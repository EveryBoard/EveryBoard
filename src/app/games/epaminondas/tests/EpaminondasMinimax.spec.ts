/* eslint-disable max-lines-per-function */
import { Direction } from 'src/app/jscaip/Direction';
import { AIDepthLimitOptions } from 'src/app/jscaip/AI/AI';
import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { EpaminondasConfig, EpaminondasLegalityInformation, EpaminondasRules } from '../EpaminondasRules';
import { EpaminondasMove } from '../EpaminondasMove';
import { EpaminondasState } from '../EpaminondasState';
import { EpaminondasNode } from '../EpaminondasRules';
import { EpaminondasMinimax } from '../EpaminondasMinimax';
import { MGPOptional } from 'src/app/utils/MGPOptional';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('EpaminondasMinimax', () => {

    let minimax: Minimax<EpaminondasMove, EpaminondasState, EpaminondasConfig, EpaminondasLegalityInformation>;
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: MGPOptional<EpaminondasConfig> = EpaminondasRules.get().getDefaultRulesConfig();

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
        const capture: EpaminondasMove = new EpaminondasMove(4, 9, 2, 1, Direction.UP);
        const bestMove: EpaminondasMove = minimax.chooseNextMove(node, minimaxOptions, defaultConfig);
        expect(bestMove).toEqual(capture);
    });

});
