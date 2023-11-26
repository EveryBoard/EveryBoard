/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { ConnectSixFirstMove, ConnectSixMove } from '../ConnectSixMove';
import { ConnectSixNode, ConnectSixRules } from '../ConnectSixRules';
import { ConnectSixState } from '../ConnectSixState';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { ConnectSixMoveGenerator } from '../ConnectSixMoveGenerator';

describe('ConnectSixMoveGenerator', () => {

    let moveGenerator: ConnectSixMoveGenerator;

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;

    beforeEach(() => {
        moveGenerator = new ConnectSixMoveGenerator();
    });
    it('should propose only one move at first turn', () => {
        // Given the initial node
        const width: number = ConnectSixState.WIDTH;
        const height: number = ConnectSixState.HEIGHT;
        const state: ConnectSixState = ConnectSixRules.get().getInitialState();
        const node: ConnectSixNode = new ConnectSixNode(state);

        // When asking it the list of move at the first turn
        const moves: ConnectSixMove[] = moveGenerator.getListMoves(node);

        // Then it should only include the center of the board
        const cx: number = Math.floor(width/2);
        const cy: number = Math.floor(height/2);
        expect(moves.length).toBe(1);
        expect(moves[0]).toEqual(ConnectSixFirstMove.of(new Coord(cx, cy)));
    });
    it('should count all possible moves including only neighboring-coord', () => {
        // Given a board with 60 possibles combinations of two coords
        // With the firsts being neighbors of a piece on board
        // and the seconds being neighbors of a piece on board or of the firsts coords
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, O, O, O, O, O, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const state: ConnectSixState = new ConnectSixState(board, 3);
        const node: ConnectSixNode = new ConnectSixNode(state);

        // When counting the number of choices
        const moves: ConnectSixMove[] = moveGenerator.getListMoves(node);

        // Then the answer should be 65
        expect(moves.length).toBe(65);
    });
});
