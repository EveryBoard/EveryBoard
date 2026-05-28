import { MGPOptional } from '@everyboard/lib';

import { Tutorial, TutorialStep } from '../../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { PlayerNumberMap } from '../../../jscaip/PlayerMap';
import { GoMove } from '../GoMove';
import { GoPhase } from '../GoPhase';
import { GoPiece } from '../GoPiece';
import { GoState } from '../GoState';
import { RectangularGoConfig } from '../abstract-rectangular-go/AbstractRectangularGoRules';

import { ZoomedGoRules } from './ZoomedGoRules';


const X: GoPiece = GoPiece.LIGHT;
const O: GoPiece = GoPiece.DARK;
// const k: GoPiece = GoPiece.DEAD_LIGHT;
// const w: GoPiece = GoPiece.LIGHT_TERRITORY;
// const b: GoPiece = GoPiece.DARK_TERRITORY;
const _: GoPiece = GoPiece.EMPTY;

const defaultConfig: RectangularGoConfig = ZoomedGoRules.get().getDefaultRulesConfig();
// const smallConfig: RectangularGoConfig = ZoomedGoRules.get().getRulesConfigDescription().getConfig('Zoomed 2 (small)');

export class ZoomedGoTutorial extends Tutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Preliminary information`,
            $localize`Zoomed Go is a layered version of Go, for extra challenge. Let us explain what we call "layer" or "zoom"`,
            ZoomedGoRules.get().getInitialState(defaultConfig),
        ),
        TutorialStep.fromMove(
            $localize`Simple capture`,
            $localize`The same way an isolated stone can be captured by its 4 neighboring intersections, with Zoomed Go you can capture it with its four "neighboring intersection" that are at a distance of two.<br/><br/> You're playing Dark. The light piece on the board only has one liberty left in Zoom 2, play there.`,
            new GoState([
                [_, _, _, _, _, _, _],
                [_, _, _, O, _, _, _],
                [_, _, _, _, _, _, _],
                [_, O, _, X, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, O, _, _, _],
                [_, _, _, _, _, _, _],
            ], PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), GoPhase.PLAYING),
            [new GoMove(5, 3)],
            $localize`Congratulations, you have earned one point.`,
            $localize`Failed, try again by playing on one of the intersections directly next to the light stone.`,
        ),
        TutorialStep.informational(
            $localize`Extended liberties (zoom 2)`,
            $localize`In this variant of Go, stones are not only connected to directly adjacent intersections. At zoom level 2, stones also interact with intersections located exactly two spaces away horizontally or vertically. This means that liberties are counted both at distance 1 and distance 2. As a consequence, captures can happen from farther away than in regular Go.`,
            new GoState([
                [_, _, _, _, _, _, _],
                [_, _, _, O, _, _, _],
                [_, _, _, _, _, _, _],
                [_, O, _, X, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, O, _, _, _],
                [_, _, _, _, _, _, _],
            ], PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), GoPhase.PLAYING),
        ),
        TutorialStep.informational(
            $localize`Distance-2 capture`,
            $localize`Here, the Light stones are not directly adjacent to the Dark stone. However, because the game is played with zoom level 2, the three Dark stones can still remove liberties from the Light stone. The Light stone only has one liberty left and is therefore capturable.`,
            new GoState([
                [_, _, _, _, _, _, _],
                [_, _, _, O, _, _, _],
                [_, _, _, _, _, _, _],
                [_, O, _, X, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, O, _, _, _],
                [_, _, _, _, _, _, _],
            ], PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), GoPhase.PLAYING),
        ),
        TutorialStep.fromMove(
            $localize`Capture at distance 2`,
            $localize`You're playing Light. In this variant, the Dark stone in the center is connected to intersections at distance 1 and distance 2. Play on its last remaining liberty to capture it.`,
            new GoState([
                [_, _, _, _, _, _, _],
                [_, _, _, O, _, _, _],
                [_, _, _, _, _, _, _],
                [_, O, _, X, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, O, _, _, _],
                [_, _, _, _, _, _, _],
            ], PlayerNumberMap.of(0, 0), 1, MGPOptional.empty(), GoPhase.PLAYING),
            [new GoMove(3, 5)],
            $localize`Congratulations, the Dark stone has been captured from a distance.`,
            $localize`Failed, try again by playing on the last liberty of the Dark stone.`,
        ),
        TutorialStep.informational(
            $localize`Extended eyes`,
            $localize`Eyes also work differently in zoom level 2. A group must now keep enough liberties both nearby and at distance 2 in order to stay alive. Groups that seem alive in regular Go may become vulnerable in this variant.`,
            new GoState([
                [_, _, X, _, _, _, _],
                [_, _, _, _, _, _, _],
                [X, _, X, _, X, _, X],
                [_, _, _, _, _, _, _],
                [_, _, X, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
            ], PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), GoPhase.PLAYING),
        ),
    ];
}
