import { TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { LodestoneState } from './LodestoneState';

export class LodestoneTutorial {
    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Board and aim of the game`,
            $localize`Lodestone is played on a 8x8 board. The initial board is shown here. The aim of the game is to be the only player with pieces remaining on the board. To do so, you will have to either push your opponent's pieces off the board, or to crush them with your pieces`,
            LodestoneState.getInitialState(),
        ),
        TutorialStep.forClick(
            $localize`Selecting a lodestone`,
            $localize`To perform a move, you have to place your lodestone on the board. Your lodestone has two sides: <ul><li>its <i>push</i> side with which it will push the opponent's pieces (indicated by the outward triangles of your opponent's color on the lodestone), and</li><li>its <i>pull</i> side with which it will pull your pieces (indicated by the indward triangles of your color on the lodestone).</li></ul>Your lodestone can be placed to move pieces orthogonally or diagonally. All available lodestone sides and orientation are shown below the board.<br/><br/>You're playing Dark. Select the lodestone that pushes your pieces diagonally.`,
            LodestoneState.getInitialState(),
            ['#lodestone_push_diagonal'],
            `Congratulations!`,
            `This is not the right lodestone, try again.`,
        ),
    ]
}

// 
// INFO: The push lodestone
// Upon placing a lodestone on the board, it will move all pieces it acts upon
// (according to the lodestone side and direction) simultaneously. Let us first see
// how the push lodestone acts on the pieces. All the opponent's pieces aligned
// with the lodestone, as indicated by the triangles' orientations, will be pushed
// one square away
// from the lodestone. An opponent's piece will be blocked in case it encounters
// on its way either one of your piece, a lodestone, or another blocked piece. Finally, if an opponent's piece
// falls out of the board, it is considered as captured.
// 
// INFO: The pull lodestone
// When the lodestone is on its pull side it will pull your pieces
// one square towards it. In case your pieces encounter a lodestone on their way or
// another blocked piece, they are blocked. However, if they encounter an
// opponent's piece, they will crush it and the opponent's piece is considered as
// captured.
// 
// INFO: The flipping lodestone
// Note that, after every move, you must flip your lodestone: if it was on its push
// side, you must use it on its pull side, and vice versa. Also, you are allowed to
// place your lodestone on the same location as it was on your previous turn.
// 
// MOVE: Capturing
// To summarize, it is possible to capture the opponent's pieces in two ways:
// <ul>
// <li>With a pushing lodestone, by pushing your opponent's pieces out of the board</li>
// <li>With a pulling lodestone, by pulling your pieces over your opponent's pieces.</li>
// </li>
// Once a lodestone is placed and the pieces have been moved and/or captured, in
// case any of the opponent's pieces have been captured, you have to place them on
// the <i>pressure plate</i> that lie around the board. To do so, you must click on
// the pressure plate of your chosing for each capture.<br/><br/>
// Try to perform a move that captures at least one of your opponent's piece.
// 
// MOVE: Crumbling pressure plates (1/2)
// When a pressure plate is full, it will crumble and take a full row or column of
// the board with it! All pieces that are on the crumbled squares are considered
// lost, but will not have to be placed on pressure plates. You have here a board
// with a pressure plate that only requires one more piece to crumble.<br/><br/>
// Perform a move that captures at least one piece, and fill that pressure plate to
// make it crumble.
// 
// MOVE: Crumbling pressure plates (2/2)
// Once a pressure plate has crumbled, a shorter pressure plate takes it place. It
// is the case here, where only 3 spots are available on the top pressure
// plate.<br/><br/>
// Perform a move that captures enough pieces to fill the top pressure plate, and
// make it crumble.
// 
// INFO: Minimal board
// After a pressure plate has crumbled for a second time, there is no more pressure
// plate available on that side. In case all pressure plates have crumbled, the
// board is reduced to a 4x4 board.
// 
// MOVE: Falling lodestone
// If, at any point during the game, your lodestone is situated on a square that
// crumbles with a pressure plate, you will be allowed to select any lodestone face
// on your next turn.<br/><br/>
// In this board, you can place your lodestone and make a pressure plate crumble so
// that your lodestone falls too, allowing to choose more freely its side on your
// next turn. Do it!
// 
// MOVE: End of the game
// In order to win, you must take out all of your opponent's pieces.<br/><br/>
// Here, you can win in the next move, do it!
