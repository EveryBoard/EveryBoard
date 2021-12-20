import { EncapsuleMove } from 'src/app/games/encapsule/EncapsuleMove';
import { EncapsulePiece } from 'src/app/games/encapsule/EncapsulePiece';
import { EncapsuleCase, EncapsuleState } from 'src/app/games/encapsule/EncapsuleState';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { TutorialStep } from '../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';

const _: EncapsuleCase = new EncapsuleCase(Player.NONE, Player.NONE, Player.NONE);
const s: EncapsuleCase = new EncapsuleCase(Player.ZERO, Player.NONE, Player.NONE);
const m: EncapsuleCase = new EncapsuleCase(Player.NONE, Player.ZERO, Player.NONE);
const b: EncapsuleCase = new EncapsuleCase(Player.NONE, Player.NONE, Player.ZERO);
const S: EncapsuleCase = new EncapsuleCase(Player.ONE, Player.NONE, Player.NONE);
const B: EncapsuleCase = new EncapsuleCase(Player.NONE, Player.NONE, Player.ONE);

const Sm: EncapsuleCase = new EncapsuleCase(Player.ONE, Player.ZERO, Player.NONE);
const sm: EncapsuleCase = new EncapsuleCase(Player.ZERO, Player.ZERO, Player.NONE);

export class EncapsuleTutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Goal of the game`,
            $localize`The goal of Encapsule is to align three of your pieces.
        Here, we have a victory of the dark player.`,
            new EncapsuleState([
                [s, S, B],
                [_, m, _],
                [_, _, b],
            ], 0, [
                EncapsulePiece.SMALL_BLACK, EncapsulePiece.MEDIUM_BLACK, EncapsulePiece.BIG_BLACK,
                EncapsulePiece.SMALL_WHITE, EncapsulePiece.MEDIUM_WHITE, EncapsulePiece.MEDIUM_WHITE,
                EncapsulePiece.BIG_WHITE,
            ])),
        TutorialStep.anyMove(
            $localize`Putting a piece`,
            $localize`This is the initial board. You're playing Dark.<br/><br/>
        Pick one of your piece on the side of the board and put it on the board.`,
            EncapsuleState.getInitialState(),
            EncapsuleMove.fromDrop(EncapsulePiece.SMALL_BLACK, new Coord(1, 1)),
            $localize`Congratulations!`),
        TutorialStep.fromMove(
            $localize`Moving`,
            $localize`Another possible action is to move one of your pieces that is already on the board.<br/><br/>
        Click on your dark piece and then on any empty square of the board.`,
            new EncapsuleState([
                [s, B, _],
                [_, _, _],
                [_, _, _],
            ], 0, []),
            [
                EncapsuleMove.fromMove(new Coord(0, 0), new Coord(2, 0)),
                EncapsuleMove.fromMove(new Coord(0, 0), new Coord(0, 1)),
                EncapsuleMove.fromMove(new Coord(0, 0), new Coord(1, 1)),
                EncapsuleMove.fromMove(new Coord(0, 0), new Coord(2, 1)),
                EncapsuleMove.fromMove(new Coord(0, 0), new Coord(0, 2)),
                EncapsuleMove.fromMove(new Coord(0, 0), new Coord(1, 2)),
                EncapsuleMove.fromMove(new Coord(0, 0), new Coord(2, 2)),
            ],
            $localize`Congratulations!`,
            $localize`Failed. Try again.`),
        TutorialStep.fromPredicate(
            $localize`Particularity`,
            $localize`At Encapsule, pieces encapsulate each other.
        It is therefore possible to have up to three pieces per square!
        However, only the biggest piece of each square counts:
        you cannot win with a piece that is "hidden" by a bigger piece.
        Similarly, you cannot move a piece if it is encapsulated by a bigger piece.
        Finally, you cannot encapsulate a piece with a smaller piece.
        You're playing Dark and you can win now in various ways.<br/><br/>
        Try to win by making a move, and not by putting a new piece on the board.`,
            new EncapsuleState([
                [Sm, _, S],
                [sm, B, B],
                [_, _, _],
            ], 0, [
                EncapsulePiece.MEDIUM_BLACK, EncapsulePiece.BIG_BLACK,
                EncapsulePiece.MEDIUM_WHITE, EncapsulePiece.MEDIUM_WHITE,
            ]),
            EncapsuleMove.fromMove(new Coord(0, 1), new Coord(0, 2)),
            (move: EncapsuleMove, _: EncapsuleState) => {
                const isCorrectLandingCoord: boolean = move.landingCoord.equals(new Coord(0, 2));
                if (isCorrectLandingCoord) {
                    if (move.isDropping()) {
                        return MGPValidation.failure($localize`You won, but the exercise is to win while moving a piece!`);
                    } else if (move.startingCoord.equalsValue(new Coord(0, 1))) {
                        return MGPValidation.SUCCESS;
                    }
                }
                return MGPValidation.failure($localize`Failed. Try again.`);
            },
            $localize`Congratulations!`),
    ];
}
