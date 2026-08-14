/* eslint-disable max-lines-per-function */
import { Player } from '@everyboard/games';
import { HeuristicUtils } from '@everyboard/games';
import { Table } from '@everyboard/games';
import { MGPOptional } from '@everyboard/lib';

import { TaflConfig } from '../TaflConfig';
import { TaflEscapeThenPieceThenControlHeuristic } from '../TaflEscapeThenPieceThenControlHeuristic';
import { TaflPawn } from '../TaflPawn';
import { TaflState } from '../TaflState';
import { BrandhubMove } from '../brandhub/BrandhubMove';
import { BrandhubRules } from '../brandhub/BrandhubRules';
import { HnefataflRules } from '../hnefatafl/HnefataflRules';
import { TablutRules } from '../tablut/TablutRules';

describe('Tafl escape/piece/control heuristic', () => {

    let heuristic: TaflEscapeThenPieceThenControlHeuristic<BrandhubMove>;
    let defaultConfig: TaflConfig;

    let rules: BrandhubRules;
    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const O: TaflPawn = TaflPawn.PLAYER_ZERO_PAWN;
    const X: TaflPawn = TaflPawn.PLAYER_ONE_PAWN;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;

    beforeEach(() => {
        rules = BrandhubRules.get();
        heuristic = new TaflEscapeThenPieceThenControlHeuristic(rules);
    });

    for (const tafl of [BrandhubRules, HnefataflRules, TablutRules]) {

        defaultConfig = tafl.get().getDefaultRulesConfig();

        it('should be better when king can escape than when he cannot', () => {
            // Given a state where the king can escape, and one where king can't
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

            // When comparing them
            // Then the one where king can escape should be better for defender
            HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                                   weakState, MGPOptional.empty(),
                                                                   strongState, MGPOptional.empty(),
                                                                   Player.ONE,
                                                                   defaultConfig);
        });

        it('should be better when king is one step away from winning than two', () => {
            // Given a state where king could escape in two turn, and one in one
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

            // When comparing them
            // Then the one where king can escape in one move should be better for defender
            HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                                   weakState, MGPOptional.empty(),
                                                                   strongState, MGPOptional.empty(),
                                                                   Player.ONE,
                                                                   defaultConfig);
        });

    }

});
