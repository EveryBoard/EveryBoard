/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { TaflPawn } from '../TaflPawn';
import { TablutNode, TablutRules } from '../tablut/TablutRules';
import { Table } from 'src/app/utils/ArrayUtils';
import { TablutMove } from '../tablut/TablutMove';
import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { TaflPieceMinimax } from '../TaflPieceMinimax';
import { TaflConfig } from '../TaflConfig';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TaflState } from '../TaflState';

describe('TaflPieceMinimax', () => {

    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const O: TaflPawn = TaflPawn.PLAYER_ZERO_PAWN;
    const X: TaflPawn = TaflPawn.PLAYER_ONE_PAWN;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;
    const defaultConfig: MGPOptional<TaflConfig> = TablutRules.get().getDefaultRulesConfig();

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

        const minimax: Minimax<TablutMove, TaflState, TaflConfig> = new TaflPieceMinimax(TablutRules.get());
        const bestMove: TablutMove = minimax.chooseNextMove(node, { name: 'Level 1', maxDepth: 1 }, defaultConfig);
        expect(bestMove).toEqual(winnerMove);
    });

});
