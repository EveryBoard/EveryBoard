/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { TablutState } from '../tablut/TablutState';
import { TaflPawn } from '../TaflPawn';
import { TablutNode, TablutRules } from '../tablut/TablutRules';
import { Table } from 'src/app/utils/ArrayUtils';
import { TablutMove } from '../tablut/TablutMove';
import { BrandhubState } from '../brandhub/BrandhubState';
import { BrandhubMove } from '../brandhub/BrandhubMove';
import { BrandhubNode, BrandhubRules } from '../brandhub/BrandhubRules';
import { Minimax } from 'src/app/jscaip/Minimax';
import { TaflHeuristic } from '../TaflHeuristic';
import { TaflMoveGenerator } from '../TaflMoveGenerator';

describe('TaflMinimax', () => {

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
        const state: TablutState = new TablutState(board, 1);
        const node: TablutNode = new TablutNode(state);
        const winnerMove: TablutMove = TablutMove.of(new Coord(3, 0), new Coord(8, 0));

        const rules: TablutRules = TablutRules.get();
        const minimax: Minimax<TablutMove, TablutState> =
            new Minimax('Minimax', rules, new TaflHeuristic(rules), new TaflMoveGenerator(rules));
        const bestMove: TablutMove = minimax.chooseNextMove(node, { name: 'Level 1', maxDepth: 1 });
        expect(bestMove).toEqual(winnerMove);
    });
    it('should not propose to King to go back on the throne when its forbidden', () => {
        // Given a board where king could go back on his throne but the rules forbid it
        const moveGenerator: TaflMoveGenerator<BrandhubMove, BrandhubState> =
            new TaflMoveGenerator(BrandhubRules.get());
        const board: Table<TaflPawn> = [
            [_, _, _, O, _, _, _],
            [_, _, _, _, O, _, _],
            [_, _, O, A, _, _, O],
            [O, _, _, _, O, X, _],
            [_, _, O, O, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ];
        const state: BrandhubState = new BrandhubState(board, 1);
        const node: BrandhubNode = new BrandhubNode(state);

        // When asking the list of legal move
        const moves: BrandhubMove[] = moveGenerator.getListMoves(node);

        // Then going back on throne should not be part of it
        const kingBackOnThrone: BrandhubMove = BrandhubMove.of(new Coord(3, 2), new Coord(3, 3));
        expect(moves).not.toContain(kingBackOnThrone);
    });
});
