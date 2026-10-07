/* eslint-disable max-lines-per-function */
import { BoardValue } from '../../../jscaip/AI/BoardValue';
import { HeuristicBounds } from '../../../jscaip/AI/Heuristic';
import { Table } from '../../../jscaip/TableUtils';
import { TaflConfig } from '../TaflConfig';
import { TaflPawn } from '../TaflPawn';
import { TaflPieceHeuristic } from '../TaflPieceHeuristic';
import { TaflState } from '../TaflState';
import { TablutMove } from '../tablut/TablutMove';
import { TablutNode, TablutRules } from '../tablut/TablutRules';

describe('TaflPieceHeuristic', () => {

    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const O: TaflPawn = TaflPawn.PLAYER_ZERO_PAWN;
    const X: TaflPawn = TaflPawn.PLAYER_ONE_PAWN;
    const defaultConfig: TaflConfig = TablutRules.get().getDefaultRulesConfig();
    const heuristic: TaflPieceHeuristic<TablutMove> = new TaflPieceHeuristic(TablutRules.get());

    it('should weight defender pieces as Player.ONE when invader starts', () => {
        // Given one invader and one defender in default Tablut, where Player.ZERO is the invader
        const board: Table<TaflPawn> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, O, X, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: TaflState = new TaflState(board, 0);
        const node: TablutNode = new TablutNode(state);

        // When computing the board value
        const value: readonly number[] = heuristic.getBoardValue(node, defaultConfig).metrics;

        // Then the defender should be weighted twice, so the score is 2 - 1 = 1
        expect(value).toEqual([1]);
    });

    it('should weight defender pieces as Player.ZERO when invader does not start', () => {
        // Given one defender and one invader in Tablut, where Player.ONE is the invader
        const customConfig: TaflConfig = {
            ...defaultConfig,
            invaderStarts: false,
        };
        const board: Table<TaflPawn> = [
            [O, X],
            [_, _],
        ];
        const state: TaflState = new TaflState(board, 0);
        const node: TablutNode = new TablutNode(state);

        // When computing the board value
        const value: readonly number[] = heuristic.getBoardValue(node, customConfig).metrics;

        // Then the defender should be weighted twice, so the score is 1 - 2 = -1
        expect(value).toEqual([-1]);
    });

    it('should compute bounds', () => {
        // Given the default config
        // When computing the bounds
        const bounds: HeuristicBounds<BoardValue> = heuristic.getBounds(defaultConfig);
        // Then it should 2 * the number of squares
        const expectedBounds: HeuristicBounds<BoardValue> = {
            player0Best: BoardValue.ofSingle(24, 0),
            player1Best: BoardValue.ofSingle(0, 26),
        };
        expect(bounds).toEqual(expectedBounds);
    });

});
