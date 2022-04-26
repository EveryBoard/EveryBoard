import { TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MartianChessMove } from './MartianChessMove';
import { MartianChessPiece, MartianChessState } from './MartianChessState';

const _: MartianChessPiece = MartianChessPiece.EMPTY;
const A: MartianChessPiece = MartianChessPiece.PAWN;
const B: MartianChessPiece = MartianChessPiece.DRONE;
const C: MartianChessPiece = MartianChessPiece.QUEEN;

export const NOT_A_FIELD_PROMOTION: () => string = () => $localize`This is not a field promotion!`;

export class MartianChessTutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Goal of the game`,
            $localize`The goal of Martian Chess is to have the more points at the end of the game. When you capture a piece, you win its value. The board is divided in two by a line called the canal. There is one side for each player. You have no ownership over pieces, you only control the ones on your side of the canal, the color of the piece is just there to help you, they will change color when crossing the canal.`,
            MartianChessState.getInitialState(),
        ),
        TutorialStep.informational(
            $localize`The pieces`,
            $localize`The dark pieces belong to the first player, the light ones to the second one. There is 3 kind of pieces: <ul><li>The Queens: represented as circles with 3 points.</li><li>The Drones: represented as circles with 2 points.</li><li>The Pawns: represented as circles with one point.</li></ul>`,
            MartianChessState.getInitialState(),
        ),
        TutorialStep.fromPredicate(
            $localize`Moving pawns`,
            $localize`Pawns are worth one point. They can move one step in each diagonals.<br/><br/>You play the first player (Dark), move a pawn.`,
            MartianChessState.getInitialState(),
            MartianChessMove.from(new Coord(2, 2), new Coord(3, 3)).get(),
            (move: MartianChessMove, state: MartianChessState) => {
                if (state.getPieceAt(move.end) === MartianChessPiece.PAWN) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`This is not a pawn!`);
                }
            },
            $localize`Congratulations!`,
        ),
        TutorialStep.fromPredicate(
            $localize`Moving drones`,
            $localize`Drones are worth two points. They can move two orthogonals steps.<br/><br/>You play Dark, move a drone.`,
            MartianChessState.getInitialState(),
            MartianChessMove.from(new Coord(0, 2), new Coord(0, 4)).get(),
            (move: MartianChessMove, state: MartianChessState) => {
                if (state.getPieceAt(move.end) === MartianChessPiece.DRONE) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`This is not a drone!`);
                }
            },
            $localize`Congratulations!`,
        ),
        TutorialStep.fromPredicate(
            $localize`Moving queens`,
            $localize`Queens are worth three points. They can move any number of step in one of the 8 directions, without jumping over other pieces.<br/><br/>You play Dark, move a queen.`,
            new MartianChessState([
                [B, A, A, _],
                [C, _, _, _],
                [_, _, _, _],
                [_, _, C, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [C, B, A, _],
            ], 0),
            MartianChessMove.from(new Coord(0, 1), new Coord(0, 7)).get(),
            (move: MartianChessMove, state: MartianChessState) => {
                if (state.getPieceAt(move.end) === MartianChessPiece.QUEEN) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`This is not a queen!`);
                }
            },
            $localize`Congratulations!`,
        ),
        TutorialStep.fromMove(
            $localize`Capture`,
            $localize`When your piece cross the canal and land on another piece, you capture it and win the captured piece's value, yet, you loose control of your piece!<br/><br/>A capture is possible for Dark, do it.`,
            new MartianChessState([
                [B, A, A, _],
                [_, _, _, _],
                [C, _, _, _],
                [_, _, _, _],
                [_, _, A, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, B, A, _],
            ], 0),
            [MartianChessMove.from(new Coord(0, 2), new Coord(2, 4)).get()],
            $localize`Congratulations! By capturing that pawn, you won one point.`,
            $localize`This move was not a capture.`,
        ),
        TutorialStep.fromMove(
            $localize`Field Promotion (1/2)`,
            $localize`You have the option to do something called the field promotion: when you don't have a piece, you can merge two pieces, to get a piece who'se value equals the addition of the two merged pieces values. First example, if you have no drones, you can merge two pawns into one drone.<br/><br/>Such a move is possible for Dark. Do it.`,
            new MartianChessState([
                [_, _, _, C],
                [_, A, _, _],
                [_, _, A, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, C],
                [_, _, B, _],
                [_, A, _, _],
            ], 0),
            [
                MartianChessMove.from(new Coord(1, 1), new Coord(2, 2)).get(),
                MartianChessMove.from(new Coord(2, 2), new Coord(1, 1)).get(),
            ],
            $localize`Congratulations!`,
            NOT_A_FIELD_PROMOTION(),
        ),
        TutorialStep.fromPredicate(
            $localize`Field Promotion (2/2)`,
            $localize`The other kind of field promotion is merging a drone and a pawn, to have a queen.<br/><br/>Such a move is possible for Light. Do it.`,
            new MartianChessState([
                [_, _, _, C],
                [_, A, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, A],
                [_, _, B, _],
                [_, A, _, _],
            ], 1),
            MartianChessMove.from(new Coord(1, 7), new Coord(2, 6)).get(),
            (move: MartianChessMove, state: MartianChessState) => {
                const landed: MartianChessPiece = state.getPieceAt(move.end);
                if (landed === MartianChessPiece.QUEEN) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure(NOT_A_FIELD_PROMOTION());
                }
            },
            $localize`Congratulations!`,
        ),
        TutorialStep.fromPredicate(
            $localize`Call the clock`,
            $localize`When the part seem to be going nowhere, during their turn, you can "call the clock", by clicking on the clock symbol on the right, then do your move. Once done, only seven more turn will be played.<br/><br/>Call the clock.`,
            MartianChessState.getInitialState(),
            MartianChessMove.from(new Coord(2, 2), new Coord(3, 3), true).get(),
            (move: MartianChessMove, _: MartianChessState) => {
                if (move.calledTheClock) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`You did not call the clock!`);
                }
            },
            $localize`Congratulations!`,
        ),
        TutorialStep.fromMove(
            $localize`Restarting the clock`,
            $localize`If the clock has been called, whenever a capture is done the countdown restart.<br/><br/>You are playing Dark, do a capture to restart the countdown.`,
            new MartianChessState([
                [_, _, _, C],
                [_, A, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, A],
                [_, _, B, _],
                [_, A, _, _],
            ], 14, MGPOptional.empty(), MGPOptional.of(1)),
            [MartianChessMove.from(new Coord(3, 0), new Coord(3, 5)).get()],
            $localize`Congratulations!`,
            $localize`This is not a capture, the game is now over, please retry!`,
        ),
        TutorialStep.anyMove(
            $localize`End game (by clock)`,
            $localize`When seven turn pass after the clock is called, the player that has the more points win. If none has more points, it is a tie.<br/><br/>You are playing Dark, do the last move.`,
            new MartianChessState([
                [_, _, _, C],
                [_, A, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [B, _, _, _],
                [_, _, _, _],
                [_, B, _, _],
            ], 14, MGPOptional.empty(), MGPOptional.of(1)),
            MartianChessMove.from(new Coord(1, 1), new Coord(2, 2)).get(),
            $localize`Congratulations!`,
        ),
        TutorialStep.fromPredicate(
            $localize`End by emptyness`,
            $localize`When a player send his last piece into the opponent territory, the game ends. If both players have the same number of points, the last player win!<br/><br/>Light player can win this way, do it!`,
            new MartianChessState([
                [_, _, _, C],
                [_, A, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, A, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
            ], 1),
            MartianChessMove.from(new Coord(2, 4), new Coord(1, 3)).get(),
            (move: MartianChessMove, _: MartianChessState) => {
                if (move.end.y === 3) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`Your piece is still in you territory!`);
                }
            },
            $localize`Congratulations!`,
        ),
    ];
}
