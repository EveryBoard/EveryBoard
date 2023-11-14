/* eslint-disable max-lines-per-function */
import { Table } from 'src/app/utils/ArrayUtils';
import { TaflPawn } from '../TaflPawn';
import { BrandhubRules } from '../brandhub/BrandhubRules';
import { HeuristicUtils } from 'src/app/jscaip/tests/HeuristicUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Player } from 'src/app/jscaip/Player';
import { BrandhubMove } from '../brandhub/BrandhubMove';
import { TaflEscapeThenPieceThenControlHeuristic } from '../TaflEscapeThenPieceThenControlHeuristic';
import { TaflConfig } from '../TaflConfig';
import { TaflState } from '../TaflState';

describe('TaflEscapeThenPieceThenControlMinimax', () => {

    let heuristic: TaflEscapeThenPieceThenControlHeuristic<BrandhubMove>;

    let rules: BrandhubRules;
    const defaultConfig: TaflConfig = BrandhubRules.RULES_CONFIG_DESCRIPTION.getDefaultConfig().config;
    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const O: TaflPawn = TaflPawn.PLAYER_ZERO_PAWN;
    const X: TaflPawn = TaflPawn.PLAYER_ONE_PAWN;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;

    beforeEach(() => {
        rules = BrandhubRules.get();
        heuristic = new TaflEscapeThenPieceThenControlHeuristic(rules);
    });

    it('should be better when king can escape than when he cannot', () => {
        const weakBoard: Table<TaflPawn> = [
            [_, _, O, _, _, _, _],
            [_, _, O, _, _, _, _],
            [_, _, _, X, _, _, _],
            [_, _, X, A, X, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ];
        const weakState: TaflState = new TaflState(weakBoard, 0);
        const strongBoard: Table<TaflPawn> = [
            [_, _, O, _, _, _, _],
            [_, _, O, _, _, _, _],
            [_, _, X, _, _, _, _],
            [_, _, X, A, X, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ];
        const strongState: TaflState = new TaflState(strongBoard, 1);
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ONE);
    });

    it('should be better when king is one step away from winning than two', () => {
        const weakBoard: Table<TaflPawn> = [
            [_, _, O, _, _, _, _],
            [_, _, O, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, X, A, X, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ];
        const weakState: TaflState = new TaflState(weakBoard, 0);
        const strongBoard: Table<TaflPawn> = [
            [_, _, O, A, _, _, _],
            [_, _, O, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, X, _, X, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ];
        const strongState: TaflState = new TaflState(strongBoard, 1);
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ONE);
    });

});
