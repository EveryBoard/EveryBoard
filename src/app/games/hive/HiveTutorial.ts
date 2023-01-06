import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { HiveState } from './HiveState';
import { HivePiece, HivePieceBeetle, HivePieceGrasshopper, HivePieceQueenBee, HivePieceSoldierAnt, HivePieceSpider } from './HivePiece';
import { Player } from 'src/app/jscaip/Player';

const Q: HivePiece = new HivePieceQueenBee(Player.ZERO);
const B: HivePiece = new HivePieceBeetle(Player.ZERO);
const G: HivePiece = new HivePieceGrasshopper(Player.ZERO);
const S: HivePiece = new HivePieceSpider(Player.ZERO);
const A: HivePiece = new HivePieceSoldierAnt(Player.ZERO);
const q: HivePiece = new HivePieceQueenBee(Player.ONE);
const b: HivePiece = new HivePieceBeetle(Player.ONE);
const g: HivePiece = new HivePieceGrasshopper(Player.ONE);
const s: HivePiece = new HivePieceSpider(Player.ONE);
const a: HivePiece = new HivePieceSoldierAnt(Player.ONE);

export class HiveTutorial extends Tutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Hive`,
            $localize`Hive is a game without a board, where pieces are placed on the side of each other, in a contiguous block called the hive. Each player has 11 pieces, representing various insects.`,
            HiveState.fromRepresentation([
                [[q], [b], [s], [G]],
                [[G], [], [A], []],
                [[A], [], [], []],
            ], 8)),
    // Board (show a board in the middle of a game)
    // Object of the game
    // Placing the first piece
    // Placing the second piece
    // Placing any later piece
    // Moving the queen bee
    // Moving each other piece (one step per piece)
    // Splitting the hive is forbidden
    // Piece must be able to slide to its destination
    // Passing
    ];
}
