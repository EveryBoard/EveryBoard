import { MGPOptional } from '@everyboard/lib';

import { Tutorial, TutorialStep } from '../../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { TutorialStepMessage } from '../../../components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';
import { PlayerNumberMap } from '../../../jscaip/PlayerMap';
import { GoMove } from '../GoMove';
import { GoPhase } from '../GoPhase';
import { GoPiece } from '../GoPiece';
import { GoState } from '../GoState';
import { RectangularGoConfig } from '../abstract-rectangular-go/AbstractRectangularGoRules';

import { ZoomedGoRules } from './ZoomedGoRules';


const X: GoPiece = GoPiece.LIGHT;
const w: GoPiece = GoPiece.LIGHT_TERRITORY;
const O: GoPiece = GoPiece.DARK;
const u: GoPiece = GoPiece.DEAD_DARK;
const _: GoPiece = GoPiece.EMPTY;

const defaultConfig: RectangularGoConfig = ZoomedGoRules.get().getDefaultRulesConfig();
const zoom2Shown: RectangularGoConfig = {
    ...defaultConfig,
    zoom: 2,
    showZooms: true,
};
const zoom2Hidden: RectangularGoConfig = {
    ...defaultConfig,
    zoom: 2,
    showZooms: false,
};

export class ZoomedGoTutorial extends Tutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            TutorialStepMessage.INITIAL_BOARD_AND_OBJECT_OF_THE_GAME(),
            $localize`Zoomed Go is a layered version of Go, for extra challenge. Let us explain by the example the difference with normal Go.`,
            ZoomedGoRules.get().getInitialState(defaultConfig),
            MGPOptional.of(defaultConfig),
        ),
        TutorialStep.fromMove(
            $localize`Simple capture`,
            $localize`The main and almost only difference is the way you can capture.<br/><br/>You are playing Dark. Do a capture.`,
            new GoState([
                [_, _, _, _, _, _, _, _],
                [_, _, _, O, _, _, _, _],
                [_, _, _, _, _, _, O, _],
                [_, O, _, X, _, _, X, O],
                [_, _, _, _, _, _, O, _],
                [_, _, _, O, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ], PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), GoPhase.PLAYING),
            [new GoMove(5, 3)],
            $localize`Congratulations, you have captured the stone you expected, but also another one on the left. See how this one is captured by four stones at a distance of two, but the pattern of the atari is the exact same, it's called "a capture at zoom 2", while the light stone on the right is a capture at zoom 1.`,
            $localize`Failed, try again.`,
            MGPOptional.of(zoom2Hidden),
        ),
        TutorialStep.informational(
            $localize`What is a zoom`,
            $localize`In normal Go, a stone interacts with the intersections directly above, below, left and right.<br/>In Zoomed Go, the same pattern exists at larger distances.<br/>The highlighted mini-board shows the board seen at zoom 2. On it, intersections that are two spaces apart behave exactly like adjacent intersections in normal Go.`,
            new GoState([
                [O, _, O, _, O, _, _, _],
                [X, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [X, _, _, _, _, _, _, _],
                [_, _, _, _, O, _, _, _],
                [X, _, _, _, _, X, _, _],
                [_, _, _, _, _, _, O, _],
                [_, _, _, _, _, _, _, X],
            ], PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), GoPhase.PLAYING),
            MGPOptional.of(zoom2Shown),
        ),
        TutorialStep.fromMove(
            $localize`Simple capture, with shown zoom`,
            $localize`In the previous step and this one, the same rules are applied, but in this one you get a visual help.<br/><br/>Do it again`,
            new GoState([
                [_, _, _, _, _, _, _, _],
                [_, _, _, O, _, _, _, _],
                [_, _, _, _, _, _, O, _],
                [_, O, _, X, _, _, X, O],
                [_, _, _, _, _, _, O, _],
                [_, _, _, O, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ], PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), GoPhase.PLAYING),
            [new GoMove(5, 3)],
            $localize`See how the main board is split in 4 little boards ? On the zoom 2 lower-right board, you can see the capture as in a normal go board. Note that you can click on either a small board or the big board, piece are dropped in both, since the small boards are just a visual help.`,
            $localize`Failed, try again.`,
            MGPOptional.of(zoom2Shown),
        ),
        TutorialStep.informational(
            $localize`Suicide with zooms`,
            $localize`Now as you can see, in 4-4 you could play in the normal go, but here, due to zoom 2, you cannot, as it is now a suicide.<br/>And at 7-4, you have the opposite, a suicide at zoom 1 that would be legal at zoom 2, so it's a suicide too.`,
            new GoState([
                [_, _, _, _, _, _, _, _],
                [_, _, _, O, _, _, _, _],
                [_, _, _, _, _, _, O, _],
                [_, O, _, _, _, O, _, O],
                [_, _, _, _, _, _, O, _],
                [_, _, _, O, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ], PlayerNumberMap.of(0, 0), 1, MGPOptional.empty(), GoPhase.PLAYING),
            MGPOptional.of(zoom2Shown),
        ),
        TutorialStep.fromMove(
            $localize`Fake-suicide with zooms`,
            $localize`Here, the 1-1 corner is a suicide at zoom-2, and a capture at zoom-1, which is not enough to make it legal. But since that capture at zoom-1 would capture some of the piece that make it a suicide at zoom-2, it is then a fake suicide, so it is legal.<br/><br/>You are playing Light. Do that capture.`,
            new GoState([
                [_, O, O, X, _, _, _, _],
                [_, X, X, _, _, _, _, _],
                [O, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ], PlayerNumberMap.of(0, 0), 1, MGPOptional.empty(), GoPhase.PLAYING),
            [new GoMove(0, 0)],
            $localize`Congratulations. What make a move legal or not is then that, after playing it and applying the capture, the piece you dropped has at least one freedom in every zoom !`,
            $localize`Failed, try again.`,
            MGPOptional.of(zoom2Shown),
        ),
        TutorialStep.informational(
            $localize`End game`,
            $localize`At the end of the game, only what is marked as dead on the zoom 1 is counted.`,
            new GoState([
                [O, O, _, O, O, _, _, O, O, _],
                [X, _, _, X, X, X, X, _, _, _],
                [O, O, O, O, O, O, O, O, O, O],
                [X, X, X, X, X, X, _, X, _, X],
                [X, w, X, X, X, w, X, X, X, X],
                [X, X, X, X, X, X, X, X, X, w],
                [u, u, u, X, w, X, X, X, X, w],
                [w, w, w, X, X, w, w, X, w, w],
                [u, u, u, X, X, w, X, X, w, w],
                [w, w, X, X, w, X, w, w, w, w],
            ], PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), GoPhase.COUNTING),
            MGPOptional.of(zoom2Shown),
        ),
    ];
}
