import { DvonnMove } from 'src/app/games/dvonn/DvonnMove';
import { DvonnGameState } from 'src/app/games/dvonn/DvonnGameState';
import { Coord } from 'src/app/jscaip/Coord';
import { TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { DvonnPieceStack } from 'src/app/games/dvonn/DvonnPieceStack';
import { Player } from 'src/app/jscaip/Player';
import { DvonnBoard } from 'src/app/games/dvonn/DvonnBoard';

const __: DvonnPieceStack = DvonnPieceStack.EMPTY;
const SO: DvonnPieceStack = DvonnPieceStack.SOURCE;
const O1: DvonnPieceStack = DvonnPieceStack.PLAYER_ZERO;
const X1: DvonnPieceStack = DvonnPieceStack.PLAYER_ONE;
const O4: DvonnPieceStack = new DvonnPieceStack(Player.ZERO, 4, false);
const X4: DvonnPieceStack = new DvonnPieceStack(Player.ONE, 4, false);

export const dvonnTutorial: TutorialStep[] = [
    TutorialStep.anyMove(
        $localize`Moving`,
        $localize`At Dvonn, each hexagonal space contains a stack of pieces.
        If no number is indicated on a stack, it means that it only contains one piece.
        The number written on a stack indicates the number of pieces within that stack, hence the number of points its owner gets.
        The owner of a stack is the one that has a piece at the top of the stack.
        Only the owner of a stack can move it.
        A stack cannot be moved if it is surrounded by 6 other stacks.
        A stack is moved by as many spaces as there are pieces within, in a straight line, and it should land on an occupied space.
        This line cannot move along the vertex of two neighboring spaces, as would a vertical move.
        Therefore, there are six possible directions.
        The player with dark pieces starts.<br/><br/>
        You're playing Dark, click on a stack and move it by one space.`,
        DvonnGameState.getInitialSlice(),
        DvonnMove.of(new Coord(2, 0), new Coord(3, 0)),
        $localize`Congratulations!`,
    ),
    TutorialStep.fromMove(
        $localize`Disconnection`,
        $localize`Red pieces are called "sources".
        When a stack is not directly nor indirectly connected to a source, it is removed from the board.
        You can move on a source: this forms a stack that contains the source, and which will never be disconnected.
        Besides this, a stack containing a source acts like any other stack: you can move it, and your opponent can move on that stack to take possession of it.<br/><br/>
        You're playing Dark, move your piece on the source.`,
        new DvonnGameState(new DvonnBoard([
            [__, __, SO, __, __, __, __, __, __, __, __],
            [__, __, O1, __, __, __, __, __, __, __, __],
            [__, __, X4, __, __, __, __, X1, SO, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
        ]), 0, false),
        [DvonnMove.of(new Coord(2, 1), new Coord(2, 0))],
        $localize`Nice, you have disconnected 4 pieces of your opponent!
        He has lost 4 points.
        Disconnected stacks will not be visible at the next turn.`,
        $localize`Bad choice! By moving on the source you would have disconnected the opponent's pieces and they would have lost 4 points.
        Here, the opponent wins 2 to 0`,
    ),
    TutorialStep.fromMove(
        $localize`End of the game`,
        $localize`When no more move is possible, the game ends and the player with the most points wins.<br/><br/>
        Make your last move.`,
        new DvonnGameState(new DvonnBoard([
            [__, __, SO, __, __, __, __, __, __, __, __],
            [__, __, O1, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, SO, O4, __],
            [__, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
        ]), 0, false),
        [DvonnMove.of(new Coord(2, 1), new Coord(2, 0))],
        $localize`Congratulations, you won 6 - 0!`,
        $localize`Bad idea, by moving on the source you would have won a point.`,
    ),
];
