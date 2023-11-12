/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { TaflPawn } from '../TaflPawn';
import { Table } from 'src/app/utils/ArrayUtils';
import { BrandhubMove } from '../brandhub/BrandhubMove';
import { BrandhubNode, BrandhubRules } from '../brandhub/BrandhubRules';
import { TaflMoveGenerator } from '../TaflMoveGenerator';
import { TaflState } from '../TaflState';

describe('TaflMoveGenerator', () => {

    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const O: TaflPawn = TaflPawn.INVADERS;
    const X: TaflPawn = TaflPawn.DEFENDERS;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;

    it('should not propose to King to go back on the throne when its forbidden', () => {
        // Given a board where king could go back on his throne but the rules forbid it
        const moveGenerator: TaflMoveGenerator<BrandhubMove> = new TaflMoveGenerator(BrandhubRules.get());
        const board: Table<TaflPawn> = [
            [_, _, _, O, _, _, _],
            [_, _, _, _, O, _, _],
            [_, _, O, A, _, _, O],
            [O, _, _, _, O, X, _],
            [_, _, O, O, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ];
        const state: TaflState = new TaflState(board, 1);
        const node: BrandhubNode = new BrandhubNode(state);

        // When asking the list of legal move
        const moves: BrandhubMove[] = moveGenerator.getListMoves(node);

        // Then going back on throne should not be part of it
        const kingBackOnThrone: BrandhubMove = BrandhubMove.from(new Coord(3, 2), new Coord(3, 3)).get();
        expect(moves).not.toContain(kingBackOnThrone);
    });
});
