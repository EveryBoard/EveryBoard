/* eslint-disable max-lines-per-function */
import { Player } from '@everyboard/games';
import { MGPOptional } from '@everyboard/lib';

import { HeuristicUtils } from '../../../jscaip/AI/tests/HeuristicUtils.spec';
import { Table } from '../../../jscaip/TableUtils';
import { TaflConfig } from '../TaflConfig';
import { TaflMove } from '../TaflMove';
import { TaflPawn } from '../TaflPawn';
import { TaflPieceAndControlHeuristic } from '../TaflPieceAndControlHeuristic';
import { TaflState } from '../TaflState';
import { BrandhubRules } from '../brandhub/BrandhubRules';
import { HnefataflRules } from '../hnefatafl/HnefataflRules';
import { TablutRules } from '../tablut/TablutRules';

describe('TaflPieceAndControlHeuristic', () => {

    let heuristic: TaflPieceAndControlHeuristic<TaflMove>;
    let defaultConfig: TaflConfig;

    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const O: TaflPawn = TaflPawn.PLAYER_ZERO_PAWN;
    const X: TaflPawn = TaflPawn.PLAYER_ONE_PAWN;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;

    for (const tafl of [BrandhubRules, HnefataflRules, TablutRules]) {

        heuristic = new TaflPieceAndControlHeuristic(tafl.get());
        defaultConfig = tafl.get().getDefaultRulesConfig();

        it('should prefer to be threatened by false threat than by real one', () => {
            // Given a board where you are threatened by an uncapturable piece
            // here, X is threatened for real (and each player have 1 threat)
            const weakBoard: Table<TaflPawn> = [
                [_, _, _, _, _, _, _],
                [O, X, _, _, _, _, _],
                [_, _, _, O, _, _, _],
                [_, _, _, _, _, A, _],
                [_, _, O, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
            ];
            const weakState: TaflState = new TaflState(weakBoard, 1);

            // And a board where what threatens you is a threatened piece
            // (and each player has 1 threat)
            const strongBoard: Table<TaflPawn> = [
                [_, _, _, _, _, _, _],
                [O, X, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, O, _, _, A, _],
                [_, _, _, O, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
            ];
            const strongState: TaflState = new TaflState(strongBoard, 1);

            // Then the strong board should be preferred
            HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                                   weakState, MGPOptional.empty(),
                                                                   strongState, MGPOptional.empty(),
                                                                   Player.ONE,
                                                                   defaultConfig);
        });

    }

});
