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
        TutorialStep.informational(
            $localize`Why are there multiple boards?`,
            $localize`In Zoomed Go, the different boards are only visual aids.<br/><br/>There is still only one game board and one move to play each turn.<br/><br/>The additional boards simply help visualize interactions at different distances:<ul><li>The biggest board: Zoom 1, shows the usual Go connections (distance 1).</li><li>The 4 next boards: Zoom 2, shows additional interactions at distance 2.</li><li>The next 9 nexts boards: Zoom 3, shows additional interactions at distance 3.</li><li>It can be configured to go further if you want more challenges, or you could start with a Zoom 2, it's already enough challenge</li></ul>Every move is played on the same intersection on all boards at once. The extra boards do not add new pieces or new decisions, they only help understand the extended liberties.`,
            ZoomedGoRules.get().getInitialState(defaultConfig),
        ),
        TutorialStep.fromMove(
            $localize`Simple capture`,
            $localize`In this variant of Go, stones are not only connected to directly adjacent intersections. At zoom level 2, stones also interact with intersections located exactly two spaces away horizontally or vertically. This means that liberties are counted both at distance 1 and distance 2. As a consequence, captures can happen from farther away than in regular Go.<br/><br/>You are playing Dark. Do a capture.`,
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
            $localize`End of the game`,
            $localize`The end of the game works exactly like in regular Go.<br/><br/>
            When both players pass consecutively, the game ends and territory is counted normally.<br/><br/>
            The only difference in Zoomed Go is how stones connect and how liberties are counted during play.`,
            ZoomedGoRules.get().getInitialState(defaultConfig),
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
