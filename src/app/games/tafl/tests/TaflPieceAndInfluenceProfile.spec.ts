/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { Coord } from '../../../jscaip/Coord';
import { TaflConfig } from '../TaflConfig';
import { TaflMoveGenerator } from '../TaflMoveGenerator';
import { TaflPawn } from '../TaflPawn';
import { TaflPieceAndInfluenceHeuristic } from '../TaflPieceAndInfluenceHeuristic';
import { TaflState } from '../TaflState';
import { TablutMove } from '../tablut/TablutMove';
import { TablutNode, TablutRules } from '../tablut/TablutRules';

describe('Tafl pieces and influence profile', () => {

    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const O: TaflPawn = TaflPawn.PLAYER_ZERO_PAWN;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;
    const defaultConfig: TaflConfig = TablutRules.get().getDefaultRulesConfig();
    const minimax: Minimax<TablutMove, TaflState, TaflConfig> =
        new Minimax($localize`Pieces > Influence`,
                    TablutRules.get(),
                    new TaflPieceAndInfluenceHeuristic(TablutRules.get()),
                    new TaflMoveGenerator(TablutRules.get()));

    it('should choose king escape at depth one and deeper', () => {
        const state: TaflState = new TaflState([
            [_, A, _, _, _, _, _, O, _],
            [_, O, _, O, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, O, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ], 1);
        const node: TablutNode = new TablutNode(state);
        const expectedMove: TablutMove = TablutMove.from(new Coord(1, 0), new Coord(0, 0)).get();

        for (let depth: number = 1; depth < 4; depth++) {
            const options: AIDepthLimitOptions = { name: `Level ${depth}`, maxDepth: depth };
            expect(minimax.chooseNextMove(node, options, defaultConfig))
                .withContext('AI chose the wrong move at level ' + depth)
                .toEqual(expectedMove);
        }
    });

});
