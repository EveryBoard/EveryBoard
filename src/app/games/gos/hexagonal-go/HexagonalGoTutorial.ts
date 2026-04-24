import { MGPOptional } from '@everyboard/lib';

import { Tutorial, TutorialStep } from '../../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { PlayerNumberMap } from '../../../jscaip/PlayerMap';
import { GoPhase } from '../GoPhase';
import { GoPiece } from '../GoPiece';
import { GoState } from '../GoState';

import { HexagonalGoConfig, HexagonalGoRules } from './HexagonalGoRules';

const X: GoPiece = GoPiece.LIGHT;
const O: GoPiece = GoPiece.DARK;
const _: GoPiece = GoPiece.EMPTY;
const N: GoPiece = GoPiece.UNREACHABLE;

const defaultConfig: HexagonalGoConfig = HexagonalGoRules.get().getDefaultRulesConfig();

export class HexagonalGoTutorial extends Tutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Preliminary information`,
            $localize`The game of HexagonalGo is a hexagonal adaptation of the game of Go. Go is present on Everyboard, you can go learn it <a href="/tutorial/Go">here</a>. This tutorial will only review the small differences that this experimental adaptation induced.`,
            HexagonalGoRules.get().getInitialState(defaultConfig),
        ),
        TutorialStep.informational(
            $localize`Freedom` + ' (1/4)',
            $localize`Since the board is hexagonal, pieces have three freedom in the corners.`,
            new GoState([
                [N, N, N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, N, N, _, _, _, _, _, _, _, _],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, N, N, N, N],
                [O, O, _, _, _, _, _, _, N, N, N, N, N],
                [X, _, _, _, _, _, _, N, N, N, N, N, N],
            ], PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), GoPhase.PLAYING),
        ),
        TutorialStep.informational(
            $localize`Freedom` + ' (2/4)',
            $localize`Since the board is hexagonal, pieces have four freedoms on the edges.`,
            new GoState([
                [N, N, N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, N, N, _, _, _, _, _, _, _, _],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, X, _, N, N],
                [_, _, _, _, _, _, _, _, X, O, N, N, N],
                [_, _, _, _, _, _, _, _, X, N, N, N, N],
                [_, _, _, _, _, _, _, _, N, N, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N, N, N],
            ], PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), GoPhase.PLAYING),
        ),
        TutorialStep.informational(
            $localize`Freedom` + ' (3/4)',
            $localize`Since the board is hexagonal, pieces have six freedoms when they don't touch the edge.`,
            new GoState([
                [N, N, N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, N, N, _, _, _, _, _, _, _, _],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, N, N, N, N],
                [_, _, _, _, _, _, _, _, N, N, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N, N, N],
            ], PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), GoPhase.PLAYING),
        ),
        TutorialStep.informational(
            $localize`Freedom` + ' (4/4)',
            $localize`Since the board is hexagonal, groups of two pieces have three more freedoms (making ko impossible).`,
            new GoState([
                [N, N, N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, N, N, _, _, _, _, _, _, _, _],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, X, X, _, _, _, _, _],
                [_, _, _, _, _, X, O, O, X, _, _, _, _],
                [_, _, _, _, _, X, X, X, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, N, N, N, N],
                [_, _, _, _, _, _, _, _, N, N, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N, N, N],
            ], PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), GoPhase.PLAYING),
        ),
    ];
}
