/* eslint-disable max-lines-per-function */
import { Table } from 'src/app/utils/ArrayUtils';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { EpaminondasMove } from '../EpaminondasMove';
import { EpaminondasState } from '../EpaminondasState';
import { EpaminondasConfig, EpaminondasNode, EpaminondasRules } from '../EpaminondasRules';
import { EpaminondasPhalanxSizeAndFilterMoveGenerator } from '../EpaminondasPhalanxSizeAndFilterMoveGenerator';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('EpaminondasPhalanxSizeAndFilterMoveGenerator', () => {

    let rules: EpaminondasRules;
    let moveGenerator: EpaminondasPhalanxSizeAndFilterMoveGenerator;
    const config: EpaminondasConfig = EpaminondasRules.RULES_CONFIG_DESCRIPTION.getDefaultConfig().config;

    beforeEach(() => {
        rules = EpaminondasRules.get();
        moveGenerator = new EpaminondasPhalanxSizeAndFilterMoveGenerator();
    });
    it('should filter number of choices', () => {
        const node: EpaminondasNode = rules.getInitialNode(config);
        expect(moveGenerator.getListMoves(node).length).toBeLessThan(114);
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

        // When getting the list of move
        const moves: EpaminondasMove[] = moveGenerator.getListMoves(node);

        // Then we should have all of them (8)
        expect(moves.length).toBe(8);
    });
});
