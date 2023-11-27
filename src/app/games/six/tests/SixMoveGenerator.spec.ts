/* eslint-disable max-lines-per-function */
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { SixState } from '../SixState';
import { SixMove } from '../SixMove';
import { SixNode } from '../SixRules';
import { Table } from 'src/app/jscaip/TableUtils';
import { SixMoveGenerator } from '../SixMoveGenerator';

const O: PlayerOrNone = Player.ZERO;
const X: PlayerOrNone = Player.ONE;

describe('SixMoveGenerator', () => {

    let moveGenerator: SixMoveGenerator;

    beforeEach(() => {
        moveGenerator = new SixMoveGenerator();
    });

    it(`should propose all movements`, () => {
        // Given an board where all piece are blocked
        const board: Table<PlayerOrNone> = [
            [O, X, X, X, X, X, O],
        ];
        const state: SixState = SixState.ofRepresentation(board, 40);
        const node: SixNode = new SixNode(state);

        // When listing the choices
        const choices: SixMove[] = moveGenerator.getListMoves(node);

        // Then there should be all the possibilities
        // 2 starting positions * 15 possible ends
        expect(choices.length).toBe(30);
    });
});
