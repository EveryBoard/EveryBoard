import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional, MGPValidation } from '@everyboard/lib';
import { MartianChessMove } from './MartianChessMove';
import { MartianChessState } from './MartianChessState';
import { MartianChessPiece } from './MartianChessPiece';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';
import { MartianChessRules } from './MartianChessRules';

const _: MartianChessPiece = MartianChessPiece.EMPTY;
const A: MartianChessPiece = MartianChessPiece.PAWN;
const B: MartianChessPiece = MartianChessPiece.DRONE;
const C: MartianChessPiece = MartianChessPiece.QUEEN;

export class MartianChessTutorial extends Tutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            TutorialStepMessage.OBJECT_OF_THE_GAME(),
            $localize`At Martian Chess, the goal is to have the most points at the end of the game. Each piece is assigned a value, you win this value when capturing the piece. The board is divided in two by a line called the canal. There is one side for each player. You do not own pieces, but you control the ones on your side of the canal. Pieces are colored to help you: they will change color when crossing the canal.`,
            MartianChessRules.get().getInitialState(),
        ),
        TutorialStep.informational(
            $localize`The pieces`,
            $localize`The pieces are dark on the side of the first player, the light ones on the side of the second one. There are 3 kind of pieces: <ul><li>The Queens: represented as circles with 3 dots.</li><li>The Drones: represented as circles with 2 dots.</li><li>The Pawns: represented as circles with one dot.</li></ul>`,
            MartianChessRules.get().getInitialState(),
        ),
        TutorialStep.fromPredicate(
            $localize`Moving pawns`,
            $localize`Pawns are worth one point. They can move one step diagonally.<br/><br/>You're playing Dark, move a pawn.`,
            MartianChessRules.get().getInitialState(),
            MartianChessMove.from(new Coord(2, 5), new Coord(1, 4)).get(),
            (move: MartianChessMove, _previous: MartianChessState, result: MartianChessState) => {
                if (result.getPieceAt(move.getEnd()) === MartianChessPiece.PAWN) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`This is not a pawn!`);
                }
            },
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromPredicate(
            $localize`Moving drones`,
            $localize`Drones are worth two points. They can move one or two steps in any direction, in a straight line, without jumping over other pieces.<br/><br/>You're playing Dark, move a drone.`,
            MartianChessRules.get().getInitialState(),
            MartianChessMove.from(new Coord(1, 7), new Coord(0, 7)).get(),
            (move: MartianChessMove, _previous: MartianChessState, result: MartianChessState) => {
                if (result.getPieceAt(move.getEnd()) === MartianChessPiece.DRONE) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`This is not a drone!`);
                }
            },
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromPredicate(
            $localize`Moving queens`,
            $localize`Queens are worth three points. They can move any number of steps in any direction, in a straight line, without jumping over other pieces.<br/><br/>You're playing Light, move a queen.`,
            new MartianChessState([
                [B, A, _, _],
                [C, _, _, _],
                [_, _, _, _],
                [_, _, C, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [C, B, A, _],
            ], 1),
            MartianChessMove.from(new Coord(2, 3), new Coord(2, 7)).get(),
            (move: MartianChessMove, _previous: MartianChessState, result: MartianChessState) => {
                if (result.getPieceAt(move.getEnd()) === MartianChessPiece.QUEEN) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`This is not a queen!`);
                }
            },
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromMove(
            $localize`Captures`,
            $localize`When a piece crosses the canal and lands on another piece, you capture it and gain the value of that captured piece. However, you lose control of your piece as it crosses the canal!<br/><br/>A capture is possible for Light, do it.`,
            new MartianChessState([
                [B, A, A, _],
                [_, _, _, _],
                [C, _, _, _],
                [_, _, _, _],
                [_, _, A, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, B, A, _],
            ], 1),
            [MartianChessMove.from(new Coord(0, 2), new Coord(2, 4)).get()],
            $localize`Congratulations! By capturing that pawn, you won one point.`,
            TutorialStepMessage.YOU_DID_NOT_CAPTURE_ANY_PIECE(),
        ),
        TutorialStep.fromMove(
            $localize`Field Promotion (1/2)`,
            $localize`It is sometimes possible to perform what is called a field promotion. If you are out of one type of piece, you can merge two pieces to add their value and get a new piece. For example, if you have no drones, you can merge two pawns into a drone. To merge two pawns, move one of your pawns on another.<br/><br/>Such a move is possible for Light. Do it.`,
            new MartianChessState([
                [_, _, _, C],
                [_, A, _, _],
                [_, _, A, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, C],
                [_, _, B, _],
                [_, A, _, _],
            ], 1),
            [
                MartianChessMove.from(new Coord(1, 1), new Coord(2, 2)).get(),
                MartianChessMove.from(new Coord(2, 2), new Coord(1, 1)).get(),
            ],
            TutorialStepMessage.CONGRATULATIONS(),
            $localize`This is not a field promotion!`,
        ),
        TutorialStep.fromPredicate(
            $localize`Field Promotion (2/2)`,
            $localize`The other kind of field promotion is to merge a drone and a pawn to obtain a queen.<br/><br/>Such a move is possible for Light. Do it.`,
            new MartianChessState([
                [A, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, B, _],
                [_, A, _, _],
            ], 0),
            MartianChessMove.from(new Coord(1, 7), new Coord(2, 6)).get(),
            (move: MartianChessMove, _previous: MartianChessState, result: MartianChessState) => {
                const landed: MartianChessPiece = result.getPieceAt(move.getEnd());
                if (landed === MartianChessPiece.QUEEN) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`This is not a field promotion!`);
                }
            },
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromPredicate(
            $localize`Call the clock`,
            $localize`When the game seems to be going nowhere, you can "call the clock" during your turn. To do so, click on the clock symbol on the right, then perform your move. Once the clock is called, seven more turn will be played.<br/><br/>You're playing Dark. Call the clock and perform a move.`,
            MartianChessRules.get().getInitialState(),
            MartianChessMove.from(new Coord(1, 5), new Coord(0, 4), true).get(),
            (move: MartianChessMove, _previous: MartianChessState, _result: MartianChessState) => {
                if (move.calledTheClock) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`You did not call the clock!`);
                }
            },
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromMove(
            $localize`Restarting the clock`,
            $localize`If the clock has been called, whenever a capture is done the countdown restarts.<br/><br/>You're playing Dark, do a capture to restart the countdown.`,
            new MartianChessState([
                [_, _, _, _],
                [_, A, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, A],
                [_, _, B, _],
                [_, C, _, _],
            ], 16, MGPOptional.empty(), MGPOptional.of(1)),
            [MartianChessMove.from(new Coord(1, 7), new Coord(1, 1)).get()],
            TutorialStepMessage.CONGRATULATIONS(),
            $localize`This is not a capture, the game is now over, please retry!`,
        ),
        TutorialStep.anyMove(
            $localize`End game (by clock)`,
            $localize`When seven turns have passed after the clock has been called, the player with the most points win. If both player have the same number of points, it is a tie.<br/><br/>You're playing Light, do the last move.`,
            new MartianChessState([
                [_, _, _, C],
                [_, A, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [B, _, _, _],
                [_, _, _, _],
                [_, B, _, _],
            ], 15, MGPOptional.empty(), MGPOptional.of(1)),
            MartianChessMove.from(new Coord(1, 1), new Coord(2, 2)).get(),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromPredicate(
            $localize`End by emptyness`,
            $localize`When a player's last piece is moved into the opponent territory, the game ends. If both players have the same number of points, the last player win!<br/><br/>Light player can win this way, do it!`,
            new MartianChessState([
                [_, _, _, C],
                [_, A, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, A, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
            ], 0),
            MartianChessMove.from(new Coord(2, 4), new Coord(1, 3)).get(),
            (move: MartianChessMove, _previous: MartianChessState, _result: MartianChessState) => {
                if (move.getEnd().y === 3) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`Your piece is still in you territory!`);
                }
            },
            TutorialStepMessage.CONGRATULATIONS(),
        ),
    ];
}
