/* eslint-disable max-lines-per-function */
import { Coord } from '../../../jscaip/Coord';
import { Table } from '../../../jscaip/TableUtils';
import { TaflConfig } from '../TaflConfig';
import { TaflMoveGenerator } from '../TaflMoveGenerator';
import { TaflPawn } from '../TaflPawn';
import { TaflState } from '../TaflState';
import { BrandhubMove } from '../brandhub/BrandhubMove';
import { BrandhubNode, BrandhubRules } from '../brandhub/BrandhubRules';

describe('TaflMoveGenerator', () => {

    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const O: TaflPawn = TaflPawn.PLAYER_ZERO_PAWN;
    const X: TaflPawn = TaflPawn.PLAYER_ONE_PAWN;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;
    const defaultConfig: TaflConfig = BrandhubRules.get().getDefaultRulesConfig();

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

        // When listing the moves
        const moves: BrandhubMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then going back on throne should not be part of it
        const kingBackOnThrone: BrandhubMove = BrandhubMove.from(new Coord(3, 2), new Coord(3, 3)).get();
        expect(moves).not.toContain(kingBackOnThrone);
    });

    it('should order king escapes before other defender moves', () => {
        // Given defender moves including a king escape to an external throne
        const moveGenerator: TaflMoveGenerator<BrandhubMove> = new TaflMoveGenerator(BrandhubRules.get());
        const board: Table<TaflPawn> = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [A, _, _, _, _, X, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ];
        const state: TaflState = new TaflState(board, 1);
        const escape: BrandhubMove = BrandhubMove.from(new Coord(0, 3), new Coord(0, 0)).get();
        const kingMove: BrandhubMove = BrandhubMove.from(new Coord(0, 3), new Coord(0, 2)).get();
        const soldierMove: BrandhubMove = BrandhubMove.from(new Coord(5, 3), new Coord(5, 2)).get();

        // When ordering them
        const moves: BrandhubMove[] = moveGenerator.orderMoves(state, [soldierMove, kingMove, escape], defaultConfig);

        // Then the escape should be first
        expect(moves[0]).toBe(escape);
    });

});
