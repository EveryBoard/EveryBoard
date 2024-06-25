import { GipfMove, GipfPlacement } from 'src/app/games/gipf/GipfMove';
import { GipfState } from 'src/app/games/gipf/GipfState';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { Coord } from 'src/app/jscaip/Coord';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { MGPOptional, MGPValidation } from '@everyboard/lib';
import { Tutorial, TutorialStep } from '../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { GipfCapture } from 'src/app/jscaip/GipfProjectHelper';
import { GipfRules } from './GipfRules';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';

const N: FourStatePiece = FourStatePiece.UNREACHABLE;
const _: FourStatePiece = FourStatePiece.EMPTY;
const O: FourStatePiece = FourStatePiece.ZERO;
const X: FourStatePiece = FourStatePiece.ONE;

export class GipfTutorial extends Tutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Goal of the game`,
            $localize`The goal of Gipf is to capture the opponent's piece so that the opponent can no longer play.
        This is the initial board.
        Each player has 12 pieces on the side and 3 pieces on the board.
        When, at its turn, a player has no more pieces on the side, that player cannot play anymore and loses the game.
        The first player plays with the dark pieces, the second player plays with the light pieces.`,
            GipfRules.get().getInitialState(),
        ),
        TutorialStep.anyMove(
            $localize`Pushing`,
            $localize`Pieces can only enter the board through the edges. To insert a new piece:
        <ol>
            <li>Click on a space on the edge of the board.</li>
            <li>If that space was already occupied, click on the arrow that indicates the direction in which you want to push the piece(s) already on the corresponding line.</li>
        </ol>
        You cannot push when a line is full.<br/><br/>
        You're playing Dark, insert a piece.`,
            GipfRules.get().getInitialState(),
            new GipfMove(new GipfPlacement(new Coord(3, 0), MGPOptional.of(HexaDirection.DOWN)), [], []),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromMove(
            $localize`Captures (1/3)`,
            $localize`To capture, you must align 4 of your own pieces, which will be the first 4 captured pieces.
        There are multiple important aspects of a capture:
        <ol>
            <li>When 4 pieces are captured, all pieces that are directly aligned with these 4 pieces are also captured.</li>
            <li>As soon as there is an empty space on the line, the capture stops.</li>
            <li>Your own pieces that are captured go back to your stock.
                Your opponent's pieces however are really captured and do not go back to your opponent's stock.</li>
            <li>If you create a line of 4 of your opponent's pieces, it will be at the beginning of your opponent's turn that your opponent can capture them.
                This means that a turn happens in three phases:
                <ol type="A">
                    <li>Pick the capture(s) resulting from the last move of your opponent (by clicking on it).</li>
                    <li>Make your insertion.</li>
                    <li>Pick the capture(s) resulting from your move (by clicking on it).</li>
                </ol>
            </li>
        </ol><br/>
        You're playing Dark, you can make a capture, do it.`,
            new GipfState([
                [N, N, N, O, X, _, _],
                [N, N, _, _, _, _, _],
                [N, _, _, _, _, _, _],
                [O, O, O, _, _, _, _],
                [X, _, _, _, _, _, N],
                [_, _, _, X, _, N, N],
                [_, _, _, X, N, N, N],
            ], 42, PlayerNumberMap.of(8, 8), PlayerNumberMap.of(0, 0)),
            [new GipfMove(
                new GipfPlacement(new Coord(0, 3), MGPOptional.of(HexaDirection.RIGHT)),
                [],
                [new GipfCapture([
                    new Coord(0, 3),
                    new Coord(1, 3),
                    new Coord(2, 3),
                    new Coord(3, 3),
                ])],
            )],
            $localize`Congratulations, you have gotten 4 of your pieces back. This is not the most useful capture.
        Let's now see how captures can really be useful.`,
            TutorialStepMessage.FAILED_TRY_AGAIN(),
        ),
        TutorialStep.fromMove(
            $localize`Captures (2/3)`,
            $localize`Here, there are three different ways for Dark to capture.
        <ol>
          <li>One way does not capture any of your opponent's pieces.</li>
          <li>Another way captures one of your opponent's pieces.</li>
          <li>The last way captures two of your opponent's pieces.</li>
        </ol>
        <br/>
        You're playing Dark, capture the most pieces from your opponent.`,
            new GipfState([
                [N, N, N, _, _, _, _],
                [N, N, _, X, _, _, _],
                [N, _, _, O, _, _, _],
                [O, O, O, X, _, _, _],
                [_, _, _, O, _, _, N],
                [_, _, _, O, _, N, N],
                [_, _, _, X, N, N, N],
            ], 42, PlayerNumberMap.of(8, 4), PlayerNumberMap.of(2, 3)),
            [new GipfMove(
                new GipfPlacement(new Coord(0, 3), MGPOptional.of(HexaDirection.RIGHT)),
                [],
                [new GipfCapture([
                    new Coord(3, 1),
                    new Coord(3, 2),
                    new Coord(3, 3),
                    new Coord(3, 4),
                    new Coord(3, 5),
                    new Coord(3, 6),
                ])],
            )],
            $localize`Congratulations, you have gotten back 4 of your pieces and captured 2 of the opponent's.
        The most you can get is 3 per capture.`,
            $localize`Failed, the best capture was taking 2 of your opponent's pieces`,
        ),
        TutorialStep.fromPredicate(
            $localize`Captures (3/3)`,
            $localize`Here, you must capture at the beginning of your turn.
        This is due to a move of your opponent at the previous turn
        (even though this is a fictitious board for pedagogical purpose).
        After your capture, by performing the right move you can even capture two more of your opponent's pieces!
        Keep it mind that the most useful in a capture is to take your opponent's pieces.<br/><br/>
        You're playing Dark, capture the most pieces from your opponent.`,
            new GipfState([
                [N, N, N, O, _, _, O],
                [N, N, _, O, _, _, O],
                [N, O, O, _, O, X, O],
                [_, _, _, O, _, _, O],
                [_, _, _, O, _, _, N],
                [O, O, O, X, X, N, N],
                [_, _, _, O, N, N, N],
            ], 42, PlayerNumberMap.of(3, 4), PlayerNumberMap.of(2, 3)),
            new GipfMove(new GipfPlacement(new Coord(3, 6), MGPOptional.of(HexaDirection.UP)),
                         [new GipfCapture([
                             new Coord(6, 0),
                             new Coord(6, 1),
                             new Coord(6, 2),
                             new Coord(6, 3),
                         ])],
                         [
                             new GipfCapture([
                                 new Coord(0, 5),
                                 new Coord(1, 5),
                                 new Coord(2, 5),
                                 new Coord(3, 5),
                                 new Coord(4, 5),
                             ]),
                             new GipfCapture([
                                 new Coord(1, 2),
                                 new Coord(2, 2),
                                 new Coord(3, 2),
                                 new Coord(4, 2),
                                 new Coord(5, 2),
                             ]),
                         ]),
            (move: GipfMove, _previous: GipfState, _result: GipfState) => {
                if (move.finalCaptures.length === 2) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`Failed, the best capture takes 2 of your opponent's pieces.`);
                }
            },
            $localize`Congratulations, you have gotten 12 of your pieces back and captured 2 of your opponent's pieces.`,
        ),
    ];
}
