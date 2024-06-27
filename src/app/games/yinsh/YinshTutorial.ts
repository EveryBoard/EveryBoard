import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { Localized } from 'src/app/utils/LocaleUtils';
import { MGPOptional, MGPValidation } from '@everyboard/lib';
import { YinshState } from './YinshState';
import { YinshCapture, YinshMove } from './YinshMove';
import { YinshPiece } from './YinshPiece';
import { YinshRules } from './YinshRules';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';

const _: YinshPiece = YinshPiece.EMPTY;
const N: YinshPiece = YinshPiece.UNREACHABLE;
const a: YinshPiece = YinshPiece.MARKER_ZERO;
const A: YinshPiece = YinshPiece.RING_ZERO;
const b: YinshPiece = YinshPiece.MARKER_ONE;
const B: YinshPiece = YinshPiece.RING_ONE;

export class YinshTutorialMessages {
    public static readonly MUST_ALIGN_FIVE: Localized = () => $localize`Failed! You need to align 5 markers of your color in order to get them, and to get a ring at the same time.`;

    public static readonly MUST_CAPTURE_TWO: Localized = () => $localize`Failed! You can capture two rings in total, by capturing two times 5 of your markers. Try again.`;
}

export class YinshTutorial extends Tutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            TutorialStepMessage.OBJECT_OF_THE_GAME(),
            $localize`The goal at Yinsh is to capture three rings in total. The rings taken are shown on the top left for Dark, and on the bottom right for Light. Here, Dark won the game. Note that on the board you have two types of pieces for each player: rings (empty circles) and markers (full circles).`,
            new YinshState([
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, a, B, _, _, _, _, _, _],
                [N, N, _, a, _, B, _, b, _, _, _],
                [N, _, A, b, _, _, B, a, _, _, _],
                [N, _, _, a, b, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, B, _, _, N],
                [_, _, _, b, a, A, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ], PlayerNumberMap.of(3, 1), 20),
        ),
        TutorialStep.anyMove(
            $localize`Initial board and placement phase`,
            $localize`The initial board is empty.
        At the beginning of the game, each player puts one of its ring on the board at their turn.
        This phase stops when all rings have been placed on the board.<br/><br/>
        You're playing Dark, put one of your ring on the board by clicking the space where you want to place it.`,
            new YinshState(YinshRules.get().getInitialState().board, PlayerNumberMap.of(5, 5), 0),
            new YinshMove([], new Coord(5, 5), MGPOptional.empty(), []),
            TutorialStepMessage.CONGRATULATIONS()),
        TutorialStep.anyMove(
            $localize`Putting a marker`,
            $localize`Once the initial phase is done and all rings are on the board, you need to place markers on the board.
        To do so, put a marker in a ring by clicking on that ring.
        Then, the ring must be moved in a straight line, in any direction.
        A ring cannot pass through other rings during its move.
        If it goes over a group of markers, your move must stop at the first empty space after that group.
        All markers in the group are then flipped and their color change.<br/><br/>
        You're playing Dark, do a move.`,
            new YinshState([
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, B, _, _, _, _, _, _, _],
                [N, N, B, _, _, B, _, _, _, _, _],
                [N, _, A, b, _, _, B, _, _, _, _],
                [N, _, _, b, _, _, _, _, _, _, N],
                [_, _, _, _, A, _, _, B, _, _, N],
                [_, _, _, _, _, A, _, _, _, N, N],
                [_, _, _, A, _, _, _, N, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ], PlayerNumberMap.of(0, 0), 20),
            new YinshMove([], new Coord(2, 4), MGPOptional.of(new Coord(4, 4)), []),
            TutorialStepMessage.CONGRATULATIONS()),
        TutorialStep.fromPredicate(
            $localize`Getting a ring by aligning 5 markers`,
            $localize`Finally, the last mechanic you need is to be able to get a ring from the board in order to gain points.
        To do so, you need to align 5 markers of your color.
        You can then get these markers by clicking on them, and then get one of your ring by clicking on it.
        You will then have one more point.
        You must capture when you can.<br/><br/>
        You're playing Dark, perform a capture!`,
            new YinshState([
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, B, _, _, _, _, _, _, _],
                [N, N, B, _, _, B, _, _, _, _, _],
                [N, _, a, a, A, b, b, _, _, _, _],
                [N, _, _, B, _, _, _, _, _, _, N],
                [_, _, _, _, A, _, _, B, _, _, N],
                [_, _, _, _, _, A, _, _, _, N, N],
                [_, _, _, A, _, _, _, A, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ], PlayerNumberMap.of(0, 0), 20),
            new YinshMove([], new Coord(4, 4), MGPOptional.of(new Coord(7, 4)),
                          [YinshCapture.of(new Coord(2, 4), new Coord(6, 4), MGPOptional.of(new Coord(7, 4)))]),
            (_move: YinshMove, _previous: YinshState, result: YinshState): MGPValidation => {
                if (result.sideRings.get(Player.ZERO) === 1) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure(YinshTutorialMessages.MUST_ALIGN_FIVE());
                }
            },
            TutorialStepMessage.CONGRATULATIONS()),
        TutorialStep.fromPredicate(
            $localize`Compound captures`,
            $localize`During a turn, you could have to choose between multiple captures,
        or you could even capture multiple times!
        During the capture selection, if you see that the marker you clicked belongs to two captures, you have to click on a second marker to avoid any ambiguity.<br/><br/>
        Here, playing Dark, you can capture two rings, do it!`,
            new YinshState([
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, A, _, _, B, B, A, _],
                [N, N, N, A, _, _, b, B, _, A, _],
                [N, N, _, A, _, _, _, _, _, B, _],
                [N, _, _, _, _, a, _, _, B, _, _],
                [N, _, _, _, a, a, _, b, _, _, N],
                [_, _, _, a, _, a, _, _, _, _, N],
                [_, _, a, _, _, a, _, _, _, N, N],
                [_, a, _, _, _, a, _, _, N, N, N],
                [_, _, _, _, _, a, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ], PlayerNumberMap.of(0, 0), 10),
            new YinshMove([
                YinshCapture.of(new Coord(5, 4), new Coord(1, 8), MGPOptional.of(new Coord(3, 2))),
                YinshCapture.of(new Coord(5, 9), new Coord(5, 5), MGPOptional.of(new Coord(3, 3))),
            ],
                          new Coord(4, 1), MGPOptional.of(new Coord(4, 2)),
                          []),
            (_move: YinshMove, _previous: YinshState, result: YinshState): MGPValidation => {
                if (result.sideRings.get(Player.ZERO) === 2) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure(YinshTutorialMessages.MUST_CAPTURE_TWO());
                }
            },
            TutorialStepMessage.CONGRATULATIONS()),
    ];
}
