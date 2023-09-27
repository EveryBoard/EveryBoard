/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Table } from 'src/app/utils/ArrayUtils';
import { TaflPawn } from '../TaflPawn';
import { TablutState } from '../tablut/TablutState';
import { TablutNode, TablutRules } from '../tablut/TablutRules';
import { TablutMove } from '../tablut/TablutMove';
import { Minimax } from 'src/app/jscaip/Minimax';
import { TaflPieceAndInfluenceMinimax } from '../TaflPieceAndInfluenceMinimax';

describe('TaflPieceAndInfluenceMinimax', () => {

    let minimax: Minimax<TablutMove, TablutState>;

    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const O: TaflPawn = TaflPawn.INVADERS;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;

    beforeEach(() => {
        minimax = new TaflPieceAndInfluenceMinimax(TablutRules.get());
    });
    it('should choose king escape, at depth 1 and more', () => {
        const board: Table<TaflPawn> = [
            [_, A, _, _, _, _, _, O, _],
            [_, O, _, O, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, O, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: TablutState = new TablutState(board, 1);
        const node: TablutNode = new TablutNode(state);
        const expectedMove: TablutMove = TablutMove.of(new Coord(1, 0), new Coord(0, 0));
        for (let depth: number = 1; depth < 4; depth++) {
            const chosenMove: TablutMove = minimax.chooseNextMove(node, { name: 'Level', maxDepth: depth });
            expect(chosenMove).toEqual(expectedMove);
        }
    });
});
