/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Table } from 'src/app/utils/ArrayUtils';
import { TaflPawn } from '../TaflPawn';
import { TablutNode, TablutRules } from '../tablut/TablutRules';
import { TablutMove } from '../tablut/TablutMove';
import { Minimax } from 'src/app/jscaip/Minimax';
import { TaflPieceAndInfluenceMinimax } from '../TaflPieceAndInfluenceMinimax';
import { TaflConfig } from '../TaflConfig';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TaflState } from '../TaflState';

describe('TaflPieceAndInfluenceMinimax', () => {

    let minimax: Minimax<TablutMove, TaflState>;
    const defaultConfig: TaflConfig = TablutRules.get().getRulesConfigDescription().defaultConfig.config;

    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const O: TaflPawn = TaflPawn.PLAYER_ZERO_PAWN;
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
        const state: TaflState = new TaflState(board, 1);
        const node: TablutNode = new TablutNode(state, undefined, undefined, MGPOptional.of(defaultConfig));
        const expectedMove: TablutMove = TablutMove.of(new Coord(1, 0), new Coord(0, 0));
        for (let depth: number = 1; depth < 4; depth++) {
            const chosenMove: TablutMove = minimax.chooseNextMove(node, { name: 'Level', maxDepth: depth });
            expect(chosenMove).toEqual(expectedMove);
        }
    });

});
