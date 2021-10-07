import { SiamMove } from 'src/app/games/siam/SiamMove';
import { SiamPiece } from 'src/app/games/siam/SiamPiece';
import { SiamPartSlice } from 'src/app/games/siam/SiamPartSlice';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TutorialStep } from '../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';

const _: number = SiamPiece.EMPTY.value;
const M: number = SiamPiece.MOUNTAIN.value;

const U: number = SiamPiece.WHITE_UP.value;
const L: number = SiamPiece.WHITE_LEFT.value;
const R: number = SiamPiece.WHITE_RIGHT.value;
const D: number = SiamPiece.WHITE_DOWN.value;

const u: number = SiamPiece.BLACK_UP.value;
const l: number = SiamPiece.BLACK_LEFT.value;
const r: number = SiamPiece.BLACK_RIGHT.value;
const d: number = SiamPiece.BLACK_DOWN.value;

export class SiamTutorial {
    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Goal of the game`,
            $localize`The goal at Siam is to be the first to push a mountain out of the board.
        The initial board contains three mountains, and no pieces are initially on the board.
        During its turn, a player can do one of the following three actions:
        <ol>
            <li>Put a new piece on the board.</li>
            <li>Change the orientation of one of its piece, and optionally move it.</li>
            <li>Take one of its pieces out of the board.</li>
        </ol>`,
            SiamPartSlice.getInitialSlice(),
        ),
        TutorialStep.anyMove(
            $localize`Inserting a piece`,
            $localize`Each player has 5 pieces in total.
        As long as you do not have 5 pieces on the board, you can insert new pieces. To do so:
        <ol>
            <li>Click on one of the big arrows alongside the board.</li>
            <li>Click on one of the small arrows that appeared on the landing square of your piece.
                This is the direction in which your piece will be oriented.</li>
        </ol><br/>
        Insert a piece on the board.`,
            SiamPartSlice.getInitialSlice(),
            new SiamMove(2, -1, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN),
            $localize`Congratulations!`,
        ),
        TutorialStep.fromMove(
            $localize`Moving a piece`,
            $localize`We will distinguish here "moving" and "pushing".
        A move is made from a piece's square to an empty neighboring square, horizontally or vertically.
        During that move, you can also move the piece out of the board.
        To move a piece:
        <ol>
            <li>Click on it.</li>
            <li>Click on one of the 4 arrows to pick the direction in which it will move.
                You can also click on the middle dot to change the piece's orientation without moving it.</li>
            <li>Click on one of the 4 arrows on the landing square to pick its orientation.</li>
        </ol><br/>
        Try to move the piece that is on the board one square upwards and to orient it downwards.`,
            new SiamPartSlice([
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, M, M, M, _],
                [_, _, _, _, _],
                [_, _, U, _, _],
            ], 0),
            [new SiamMove(2, 4, MGPOptional.of(Orthogonal.UP), Orthogonal.DOWN)],
            $localize`Congratulations, you made a side-slip!`,
            $localize`Failed!`,
        ),
        TutorialStep.fromMove(
            $localize`Moving a piece out of the board`,
            $localize`To move a piece out of the board, you do not have to pick an orientation after the move.<br/><br/>
        Get that piece out of the board!`,
            new SiamPartSlice([
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, M, M, M, _],
                [_, _, _, _, _],
                [_, _, U, _, _],
            ], 0),
            [new SiamMove(2, 4, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN)],
            $localize`Congratulations, even if in this context it was not a useful move.`,
            $localize`Failed, the piece is still on the board.`,
        ),
        TutorialStep.fromMove(
            $localize`Pushing`,
            $localize`When the landing square of your move is occupied, we use the term "push".
        In order to push, multiple conditions must hold:
        <ol>
            <li>Your piece must already be oriented in the direction of the push.</li>
            <li>The number of the pieces (opponent's or not) that are facing yours (called the resistants)
                must be smaller than the number of pieces that are oriented in the same direction as the push, yourself included (the pushers).</li>
            <li>The number of mountains on that line must be smaller or equal to the difference between the pushers and the resistants.</li>
        </ol>
        Your piece on the top right cannot push because there is one mountain too much.
        Your piece on the bottom right can push.<br/><br/>
        Do it.`,
            new SiamPartSlice([
                [R, M, M, l, L],
                [_, _, _, _, _],
                [_, _, _, M, _],
                [_, _, _, _, _],
                [_, _, r, l, L],
            ], 0),
            [new SiamMove(4, 4, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT)],
            $localize`Congratulations!`,
            $localize`Failed!`,
        ),
        TutorialStep.fromMove(
            $localize`Victory`,
            $localize`The game ends when a mountain is pushed out of the board.
        If you pushed it and nobody is in front of you, you're the winner.
        However, if you were pushing an opponent oriented in the same direction as you, your opponent will win because that piece is closer to the mountain.
        However, if that opponent is closer to the mountain but not oriented towards it, victory will be yours.<br/><br/>
        You have two ways of ending the game here: you can either win, or lose. Choose correctly!`,
            new SiamPartSlice([
                [_, _, _, _, _],
                [_, _, _, _, _],
                [M, u, L, _, D],
                [_, _, _, _, d],
                [_, _, _, _, M],
            ], 0),
            [new SiamMove(2, 2, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT)],
            $localize`Congratulations, you won!`,
            $localize`Failed, you lost.`,
        ),
    ];
}
