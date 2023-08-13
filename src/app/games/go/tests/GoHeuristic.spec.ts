/* eslint-disable max-lines-per-function */
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GoState, GoPiece, Phase } from '../GoState';
import { GoNode } from '../GoRules';
import { GoHeuristic } from '../GoHeuristic';

const X: GoPiece = GoPiece.LIGHT;
const O: GoPiece = GoPiece.DARK;
const _: GoPiece = GoPiece.EMPTY;

describe('GoHeuristic', () => {

    let heuristic: GoHeuristic;

    beforeEach(() => {
        heuristic = new GoHeuristic();
    });
    xit('should getBoardValue according considering alive group who control alone one territory and not considering alive the others', () => {
        const board: Table<GoPiece> = [
            [_, X, _, _, _],
            [X, X, _, _, _],
            [_, X, _, O, O],
            [O, X, _, O, _],
            [_, X, _, O, _],
        ];
        const state: GoState = new GoState(board, [0, 0], 0, MGPOptional.empty(), Phase.PLAYING);
        const initialNode: GoNode = new GoNode(state);
        const boardValue: number = heuristic.getBoardValue(initialNode).value;
        expect(boardValue).toBe(3);
    });
});
