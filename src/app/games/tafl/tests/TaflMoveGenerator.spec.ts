/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { TaflPawn } from '../TaflPawn';
import { Table } from 'src/app/jscaip/TableUtils';
import { BrandhubMove } from '../brandhub/BrandhubMove';
import { BrandhubNode, BrandhubRules } from '../brandhub/BrandhubRules';
import { TaflMoveGenerator } from '../TaflMoveGenerator';
import { TaflConfig } from '../TaflConfig';
import { MGPOptional } from '@everyboard/lib';
import { TaflState } from '../TaflState';

describe('TaflMoveGenerator', () => {

    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const O: TaflPawn = TaflPawn.PLAYER_ZERO_PAWN;
    const X: TaflPawn = TaflPawn.PLAYER_ONE_PAWN;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;
    const defaultConfig: MGPOptional<TaflConfig> = BrandhubRules.get().getDefaultRulesConfig();

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

});
