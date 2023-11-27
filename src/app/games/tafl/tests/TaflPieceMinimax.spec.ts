/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { TaflPawn } from '../TaflPawn';
import { TablutNode, TablutRules } from '../tablut/TablutRules';
import { Table } from 'src/app/jscaip/TableUtils';
import { TablutMove } from '../tablut/TablutMove';
import { Minimax } from 'src/app/jscaip/Minimax';
import { TaflPieceMinimax } from '../TaflPieceMinimax';
import { TaflState } from '../TaflState';

describe('TaflPieceMinimax', () => {

    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const O: TaflPawn = TaflPawn.INVADERS;
    const X: TaflPawn = TaflPawn.DEFENDERS;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;

    it('should try to make the king escape when it can', () => {
        const board: Table<TaflPawn> = [
            [_, _, O, A, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, X, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: TaflState = new TaflState(board, 1);
        const node: TablutNode = new TablutNode(state);
        const winnerMove: TablutMove = TablutMove.from(new Coord(3, 0), new Coord(8, 0)).get();

        const minimax: Minimax<TablutMove, TaflState> = new TaflPieceMinimax(TablutRules.get());
        const bestMove: TablutMove = minimax.chooseNextMove(node, { name: 'Level 1', maxDepth: 1 });
        expect(bestMove).toEqual(winnerMove);
    });
});
