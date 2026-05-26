/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Coord } from '../../../jscaip/Coord';
import { Table } from '../../../jscaip/TableUtils';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { TaflConfig } from '../TaflConfig';
import { TaflPawn } from '../TaflPawn';
import { TaflPieceMinimax } from '../TaflPieceMinimax';
import { TaflState } from '../TaflState';
import { TablutMove } from '../tablut/TablutMove';
import { TablutNode, TablutRules } from '../tablut/TablutRules';

describe('TaflPieceMinimax', () => {

    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const O: TaflPawn = TaflPawn.PLAYER_ZERO_PAWN;
    const X: TaflPawn = TaflPawn.PLAYER_ONE_PAWN;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;
    const defaultConfig: TaflConfig = TablutRules.get().getDefaultRulesConfig();
    const minimax: TaflPieceMinimax<TablutMove> = new TaflPieceMinimax(TablutRules.get());

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

        const bestMove: TablutMove = minimax.chooseNextMove(node, { name: 'Level 1', maxDepth: 1 }, defaultConfig);
        expect(bestMove).toEqual(winnerMove);
    });

    SlowTest.it('should be able play against itself', () => {
        const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
        minimaxTest({
            rules: TablutRules.get(),
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: true,
        });
    });

});
