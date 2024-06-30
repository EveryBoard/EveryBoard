/* eslint-disable max-lines-per-function */
import { Table } from 'src/app/jscaip/TableUtils';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { EpaminondasMove } from '../EpaminondasMove';
import { EpaminondasState } from '../EpaminondasState';
import { EpaminondasConfig, EpaminondasNode, EpaminondasRules } from '../EpaminondasRules';
import { EpaminondasPhalanxSizeAndFilterMoveGenerator } from '../EpaminondasPhalanxSizeAndFilterMoveGenerator';
import { MGPOptional } from '@everyboard/lib';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('EpaminondasPhalanxSizeAndFilterMoveGenerator', () => {

    let rules: EpaminondasRules;
    let moveGenerator: EpaminondasPhalanxSizeAndFilterMoveGenerator;
    const defaultConfig: MGPOptional<EpaminondasConfig> = EpaminondasRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        rules = EpaminondasRules.get();
        moveGenerator = new EpaminondasPhalanxSizeAndFilterMoveGenerator();
    });

    it('should filter number of choices', () => {
        const node: EpaminondasNode = rules.getInitialNode(defaultConfig);
        expect(moveGenerator.getListMoves(node, defaultConfig).length).toBeLessThan(114);
    });

    it('should not filter number of choices if it is below 40', () => {
        // Given a board with less than 40 choice in total
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, O, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, X, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const state: EpaminondasState = new EpaminondasState(board, 1);
        const node: EpaminondasNode = new EpaminondasNode(state);

        // When listing the moves
        const moves: EpaminondasMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then we should have all of them (8)
        expect(moves.length).toBe(8);
    });

    it('should propose move on a specific board', () => {
        // Given a specific board (with no possible capture)
        const board: PlayerOrNone[][] = [
            [_, X, _, _, _, _, _, _, _, _, _, _, X, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, O],
            [_, _, _, _, X, _, _, _, _, _, _, _, O, _],
            [_, X, _, O, _, _, O, _, _, _, _, _, _, _],
            [_, O, _, _, _, O, _, _, _, _, _, _, _, _],
            [_, _, _, _, O, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, O, _, _],
            [_, _, _, O, _, _, _, _, _, _, _, _, _, _],
            [_, _, O, _, _, X, _, O, _, _, _, _, _, _],
            [_, O, _, _, X, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, O, _, _, _, _, _, _, O],
        ];

        // When listing the moves
        const state: EpaminondasState = new EpaminondasState(board, 101);
        const node: EpaminondasNode = new EpaminondasNode(state);

        // Then it should at least generate one move
        expect(moveGenerator.getListMoves(node, defaultConfig).length).toBeGreaterThan(0);
        // This test used to break because of randomness used in the move generator.
    });

});
