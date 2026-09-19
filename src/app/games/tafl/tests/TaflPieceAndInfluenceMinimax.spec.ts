/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { Coord } from '../../../jscaip/Coord';
import { Table } from '../../../jscaip/TableUtils';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { TaflConfig } from '../TaflConfig';
import { TaflMove } from '../TaflMove';
import { TaflMoveGenerator } from '../TaflMoveGenerator';
import { TaflPawn } from '../TaflPawn';
import { TaflPieceAndInfluenceHeuristic } from '../TaflPieceAndInfluenceHeuristic';
import { TaflRules } from '../TaflRules';
import { TaflState } from '../TaflState';
import { TablutMove } from '../tablut/TablutMove';
import { TablutNode, TablutRules } from '../tablut/TablutRules';

class TaflPieceAndInfluenceMinimax<M extends TaflMove> extends Minimax<M, TaflState, TaflConfig> {
    public constructor(rules: TaflRules<M>) {
        super('Pieces > Influence',
              rules,
              new TaflPieceAndInfluenceHeuristic(rules),
              new TaflMoveGenerator(rules),
        );
    }
}

describe('TaflPieceAndInfluenceMinimax', () => {

    const minimax: Minimax<TablutMove, TaflState, TaflConfig> = new TaflPieceAndInfluenceMinimax(TablutRules.get());
    const defaultConfig: TaflConfig = TablutRules.get().getDefaultRulesConfig();

    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const O: TaflPawn = TaflPawn.PLAYER_ZERO_PAWN;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;

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
        const state: TaflState = new TaflState(board, 1);
        const node: TablutNode = new TablutNode(state);
        const expectedMove: TablutMove = TablutMove.from(new Coord(1, 0), new Coord(0, 0)).get();
        for (let depth: number = 1; depth < 4; depth++) {
            const chosenMove: TablutMove = minimax.chooseNextMove(node, { name: 'Level', maxDepth: depth }, defaultConfig);
            expect(chosenMove).withContext('AI chose the wrong move at level ' + depth).toEqual(expectedMove);
        }
    });

    SlowTest.it('should be able play against itself', () => {
        const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
        minimaxTest({
            rules: TablutRules.get(),
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: false, // not always a finisher
        });
    });

});
