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

    // 1. Le go en couche est une version du Go augmentée
    // 2. voyez cet atari standard, toutes les pièces qui entourent Foncé sont à une distance de 1
    // 3. voyez maintenant ce plateau,
    //    c'est l'équivalent du précédent avec des pièces qui entourent Foncé à une distance de 2,
    //    ceci est un atari sur la deuxième couche!
    // 4. même pattern,
    //    même si cette pièce n'est pas dans les coins,
    //    elle n'as aucune case à une distance de 3 vers le haut ni à une distance de 3 vers la droite,
    //    cette pièce est donc dans le coin en haut à droite dans la troisième couche
    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Preliminary information`,
            $localize`Zoomed Go is a layered version of Go, for extra challenge. Let us explain what we call zoom`,
            ZoomedGoRules.get().getInitialState(defaultConfig),
            MGPOptional.of(defaultConfig),
        ),
        TutorialStep.informational(
            $localize`Why are there multiple boards?`,
            $localize`In Zoomed Go, the different boards are only visual aids.<br/><br/>There is only one real game board and one move to play each turn.<br/><br/>The additional boards simply help visualize interactions at different distances.<br/>The largest board (zoom 1) shows the real board.<br/>The other boards show the different layers.<br/>For example, the middle boards show interactions at a distance of 2, and the small boards show interactions at a distance of 3. The zoom level can be configured for extra challenges. A level of 2 is already challenging.<br/>Every move is played on the same intersection on all boards at once. The extra boards do not add new pieces or new decisions, they only help understand the extended liberties.`,
            ZoomedGoRules.get().getInitialState(defaultConfig),
            MGPOptional.of(defaultConfig),
        ),
        TutorialStep.fromMove(
            $localize`Simple capture`,
            $localize`At zoomed go, stones are not only connected to directly adjacent intersections. At zoom level 2, stones also interact with intersections located exactly two spaces away horizontally or vertically. This means that liberties are counted both at distance 1 and distance 2. As a consequence, captures can happen from farther away than in regular Go.<br/><br/>You are playing Dark. Do a capture.`,
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
            MGPOptional.of(defaultConfig),
        ),
        TutorialStep.informational(
            $localize`End of the game`,
            $localize`The end of the game works exactly like in regular Go.<br/><br/>
            When both players pass consecutively, the game ends and territory is counted as usual.<br/><br/>
            The only difference in Zoomed Go is how stones connect and how liberties are counted during play.`,
            ZoomedGoRules.get().getInitialState(defaultConfig),
            MGPOptional.of(defaultConfig),
        ),
        TutorialStep.informational(
            $localize`Distance-2 capture`,
            $localize`Here, the light stones are not directly adjacent to the dark stone. However, because the game is played with zoom level 2, the three dark stones can still remove liberties from the light stone. The light stone has only one liberty left and is therefore capturable.`,
            new GoState([
                [_, _, _, _, _, _, _],
                [_, _, _, O, _, _, _],
                [_, _, _, _, _, _, _],
                [_, O, _, X, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, O, _, _, _],
                [_, _, _, _, _, _, _],
            ], PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), GoPhase.PLAYING),
            MGPOptional.of(defaultConfig),
        ),
        TutorialStep.fromMove(
            $localize`Capture at distance 2`,
            $localize`You're playing Light. In this variant, the dark stone in the center is connected to intersections at distance 1 and distance 2. Play on its last remaining liberty to capture it.`,
            new GoState([
                [_, _, _, _, _, _, _, _],
                [_, _, _, X, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, X, _, O, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, X, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ], PlayerNumberMap.of(0, 0), 1, MGPOptional.empty(), GoPhase.PLAYING),
            [new GoMove(5, 3)],
            $localize`Congratulations, the dark stone has been captured from a distance.`,
            $localize`Failed, try again by playing on the last liberty of the dark stone.`,
            MGPOptional.of(defaultConfig),
        ),
        TutorialStep.informational(
            $localize`Extended eyes`,
            $localize`Eyes also work differently in zoom level 2. A group must now keep enough liberties both nearby and at distance 2 in order to stay alive. Groups that seem alive in regular Go may become vulnerable at zoomed go.`,
            new GoState([
                [_, _, X, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [X, _, X, _, X, _, X, _],
                [_, _, _, _, _, _, _, _],
                [_, _, X, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ], PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), GoPhase.PLAYING),
            MGPOptional.of(defaultConfig),
        ),
        // The other proposal
        TutorialStep.informational(
            $localize`Example Tutorial: Zoomed Go`,
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
