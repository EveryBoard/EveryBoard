import { Coord } from 'src/app/jscaip/Coord';
import { ConnectSixMinimax } from '../ConnectSixMinimax';
import { ConnectSixDrops, ConnectSixFirstMove, ConnectSixMove } from '../ConnectSixMove';
import { ConnectSixNode, ConnectSixRules } from '../ConnectSixRules';
import { ConnectSixState } from '../ConnectSixState';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';

/* eslint-disable max-lines-per-function */
describe('ConnectSixMinimax', () => {

    let minimax: ConnectSixMinimax;

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;

    beforeEach(() => {
        const rules: ConnectSixRules = ConnectSixRules.get();
        minimax = new ConnectSixMinimax(rules, 'Minimax');
    });
    it('should propose only one move at first turns', () => {
        // Given the minimax and the ConnectSix size of board, and the initial board
        const width: number = ConnectSixState.WIDTH;
        const height: number = ConnectSixState.HEIGHT;
        const state: ConnectSixState = ConnectSixState.getInitialState();
        const node: ConnectSixNode = new ConnectSixNode(state);

        // When asking it the list of move at the first turn
        const moves: ConnectSixMove[] = minimax.getListMoves(node);

        // Then it should only include the center of the board
        const cx: number = Math.floor(width/2);
        const cy: number = Math.floor(height/2);
        expect(moves.length).toBe(1);
        expect(moves[0]).toEqual(ConnectSixFirstMove.from(new Coord(cx, cy)));
    });
    it('should do winning move when one is possible', () => {
        // Given a board where there is place for a victory of first player
        const board: Table<PlayerOrNone> = [
            [O, O, O, O, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
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
        ];
        const state: ConnectSixState = new ConnectSixState(board, 2);
        const node: ConnectSixNode = new ConnectSixNode(state);

        // When asking what is the best move
        const bestMove: ConnectSixMove = node.findBestMove(1, minimax);

        // Then it should be that victory
        expect(bestMove).toEqual(ConnectSixDrops.from(new Coord(4, 0), new Coord(5, 0)).get());
    });
    it('should block double-open fives at level two', () => {
        // Given a minimax at level two
        // And an board where current opponent could win if nothing is done (..XXXXX..)
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

        // When asking what is the best move
        const bestMove: ConnectSixMove = node.findBestMove(2, minimax);

        // Then the minimax level two should block
        expect(bestMove).toEqual(ConnectSixDrops.from(new Coord(1, 18), new Coord(7, 18)).get());
    });
    it('should count all possible moves including only neighbooring-coord', () => {
        // Given a board with 60 possibles combinaisons of two coords
        // With the first being neighbors of the original set
        // and the second able to also be a neighboor of the first coord
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
        const moves: ConnectSixMove[] = minimax.getListMoves(node);

        // Then the answer should be 60
        expect(moves.length).toBe(60);
    });
    it('should block double-open four at level two', () => {
        // Given a minimax at level two
        // And an board where current opponent could win if nothing is done (..XXXX..)
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
            [_, _, O, O, O, O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const state: ConnectSixState = new ConnectSixState(board, 3);
        const node: ConnectSixNode = new ConnectSixNode(state);

        // When asking what is the best move
        const bestMove: ConnectSixMove = node.findBestMove(2, minimax);

        // Then the minimax level two should block
        expect(bestMove).toEqual(ConnectSixDrops.from(new Coord(1, 18), new Coord(6, 18)).get());
    });
});
