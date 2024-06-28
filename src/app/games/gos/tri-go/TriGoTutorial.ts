import { GoMove } from 'src/app/games/gos/GoMove';
import { GoState } from 'src/app/games/gos/GoState';
import { GoPiece } from '../GoPiece';
import { MGPOptional } from '@everyboard/lib';
import { Tutorial, TutorialStep } from '../../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';
import { TriGoConfig, TriGoRules } from './TriGoRules';

const X: GoPiece = GoPiece.LIGHT;
const O: GoPiece = GoPiece.DARK;
const k: GoPiece = GoPiece.DEAD_LIGHT;
const w: GoPiece = GoPiece.LIGHT_TERRITORY;
const b: GoPiece = GoPiece.DARK_TERRITORY;
const _: GoPiece = GoPiece.EMPTY;
const N: GoPiece = GoPiece.UNREACHABLE;

const defaultConfig: MGPOptional<TriGoConfig> = TriGoRules.get().getDefaultRulesConfig();

export class TriGoTutorial extends Tutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Preliminary information`,
            $localize`The game of TriGo is a triangular adaptation of the game of Go. Go is present on the website, you can go learn it here. This tutorial will only review the small differences that this experimental adaptation induced.`,
            TriGoRules.get().getInitialState(defaultConfig),
        ),
        TutorialStep.informational(
            $localize`Freedom (1/4)`,
            $localize`Since it is triangular, pieces have only one freedom in the corners.`,
            new GoState([
                [N, N, N, N, N, N, _, N, N, N, N, N, N],
                [N, N, N, N, N, _, _, _, N, N, N, N, N],
                [N, N, N, N, _, _, _, _, _, N, N, N, N],
                [N, N, N, _, _, _, _, _, _, _, N, N, N],
                [N, N, _, _, _, _, _, _, _, _, _, N, N],
                [N, _, _, _, _, _, _, _, _, _, _, _, N],
                [O, _, _, _, _, _, _, _, _, _, _, _, X],
            ], PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), 'PLAYING'),
        ),
        TutorialStep.informational(
            $localize`Freedom (2/4)`,
            $localize`Since it is triangular, pieces have only two on the edges (when they touch the edge with their corner only, their not really on the edges).`,
            new GoState([
                [N, N, N, N, N, N, X, N, N, N, N, N, N],
                [N, N, N, N, N, O, _, _, N, N, N, N, N],
                [N, N, N, N, _, _, _, _, _, N, N, N, N],
                [N, N, N, X, _, _, _, _, _, _, N, N, N],
                [N, N, _, _, _, _, _, _, _, _, _, N, N],
                [N, O, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, O, _, _, _, X, _, _, _, _],
            ], PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), 'PLAYING'),
        ),
        TutorialStep.informational(
            $localize`Freedom (3/4)`,
            $localize`Since it is triangular, pieces have three freedoms.`,
            new GoState([
                [N, N, N, N, N, N, _, N, N, N, N, N, N],
                [N, N, N, N, N, _, _, _, N, N, N, N, N],
                [N, N, N, N, _, _, O, _, _, N, N, N, N],
                [N, N, N, _, _, _, _, _, _, _, N, N, N],
                [N, N, _, _, _, _, _, _, _, _, _, N, N],
                [N, _, _, _, _, _, _, _, _, _, _, _, N],
                [O, _, _, _, _, _, _, _, _, _, _, _, X],
            ], PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), 'PLAYING'),
        ),
        TutorialStep.informational(
            $localize`Freedom (4/4)`,
            $localize`Since it is triangular, groups of two pieces have three freedoms.`,
            new GoState([
                [N, N, N, N, N, N, _, N, N, N, N, N, N],
                [N, N, N, N, N, _, _, _, N, N, N, N, N],
                [N, N, N, N, _, _, O, _, _, N, N, N, N],
                [N, N, N, _, _, _, _, _, _, _, N, N, N],
                [N, N, _, _, _, _, _, _, _, _, _, N, N],
                [N, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, _, _],
            ], PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), 'PLAYING'),
        ),
    ];
}
