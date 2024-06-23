import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { HiveState } from './HiveState';
import { HivePiece } from './HivePiece';
import { Player } from 'src/app/jscaip/Player';
import { HiveMove } from './HiveMove';
import { Coord } from 'src/app/jscaip/Coord';
import { Move } from 'src/app/jscaip/Move';
import { GameState } from 'src/app/jscaip/state/GameState';
import { MGPValidation } from '@everyboard/lib';
import { HiveRules } from './HiveRules';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';

const Q: HivePiece = new HivePiece(Player.ZERO, 'QueenBee');
const B: HivePiece = new HivePiece(Player.ZERO, 'Beetle');
const G: HivePiece = new HivePiece(Player.ZERO, 'Grasshopper');
const S: HivePiece = new HivePiece(Player.ZERO, 'Spider');
const A: HivePiece = new HivePiece(Player.ZERO, 'SoldierAnt');
const q: HivePiece = new HivePiece(Player.ONE, 'QueenBee');
const b: HivePiece = new HivePiece(Player.ONE, 'Beetle');
const g: HivePiece = new HivePiece(Player.ONE, 'Grasshopper');
const s: HivePiece = new HivePiece(Player.ONE, 'Spider');
const a: HivePiece = new HivePiece(Player.ONE, 'SoldierAnt');

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
        TutorialStep.informational(
            $localize`Object of the game`,
            $localize`The object of the game at Hive is to surround the opponent's queen. Once the queen is surrounded by 6 pieces, no matter the owner of these pieces, the game ends. The player with a queen that is not surrounded wins. In case both queens are fully surrounded at the same turn, it is a draw. Here, Dark won.`,
            HiveState.fromRepresentation([
                [[], [b], [S]],
                [[a], [q], [Q]],
                [[G], [B], []],
            ], 7)),
        TutorialStep.anyMove(
            $localize`Placing the first and second piece`,
            $localize`There are two types of actions: drops and moves. Initially, the board is empty, so we will have to put (drop) pieces on the board. For the first piece dropped on the board, there is no placement restriction: you can choose any piece and put in on the board. The second piece, put by Light, will need to be put in a neighboring space of the first piece. To drop a piece on the board, select the piece of your choice in your remaining pieces (below the board), and then click on the space you want to drop it on.<br/><br/>You're playing Dark and starting the game, put any piece on the board.`,
            HiveRules.get().getInitialState(),
            HiveMove.drop(B, new Coord(0, 0)),
            TutorialStepMessage.CONGRATULATIONS()),
        TutorialStep.anyMove(
            $localize`Placing pieces after the second turn`,
            $localize`After the second turn, you are still allowed to place pieces any time you want, as long as you respect two conditions: <ol><li>your piece must be connected to the hive, and</li><li>the space on which you drop your piece must not touch a stack of the opponent.</li></ol><br/>You're playing Dark, drop a piece on the board.`,
            HiveState.fromRepresentation([
                [[b], [G]],
            ], 2),
            HiveMove.drop(Q, new Coord(2, 0)),
            TutorialStepMessage.CONGRATULATIONS()),
        TutorialStep.fromMove(
            $localize`Moving pieces: the queen bee`,
            $localize`Once you have placed you queen bee on the board, you can move your pieces. You must place your queen bee on the board as your fourth piece at the latest. Each creature moves in a different way, and moves should respect two restrictions:<ol><li>the hive must always remain fully connected, and</li><li>pieces should be able to physically slide to their destination (except for the beetle and grasshopper as we will see later).</li></ol>The queen bee can move to any of its empty neighbors. To move a piece, click on it and then click on its destination. The possible destinations are highlighted.<br/><br/>You are playing Dark, move your queen bee.`,
            HiveState.fromRepresentation([
                [[], [S], [g], [q], [b]],
                [[b], [Q], [B], [], []],
            ], 4),
            [
                HiveMove.move(new Coord(1, 1), new Coord(0, 2)).get(),
                HiveMove.move(new Coord(1, 1), new Coord(1, 2)).get(),
            ],
            TutorialStepMessage.CONGRATULATIONS(),
            TutorialStepMessage.FAILED_TRY_AGAIN(),
        ),
        TutorialStep.fromMove(
            $localize`Moving the beetle`,
            $localize`The beetle moves like the queen bee, but it is allowed to climb on top of other pieces! Therefore, it need not adhere to the sliding restriction. Note that you are not allowed to drop the beetle on top of another piece in the drop phase, this can only be achieved when moving a beetle already on the board. A piece with a beetle on top is not allowed to move. A stack is considered to be of the player who has the beetle of the top.<br/><br/>You're playing Dark, block your opponent's queen by moving on top of it!`,
            HiveState.fromRepresentation([
                [[Q], [q], [B]],
                [[b], [], []],
            ], 6),
            [HiveMove.move(new Coord(2, 0), new Coord(1, 0)).get()],
            TutorialStepMessage.CONGRATULATIONS(),
            TutorialStepMessage.FAILED_TRY_AGAIN(),
        ),
        TutorialStep.forClick(
            $localize`Inspecting stacks`,
            $localize`When pieces are stacked together, you are allowed to inspect the stack to see which pieces are under the beetle. This works with opponent-controlled stacks too. To do so, you can simply click on any stack to see their composition.<br/><br/>You're playing Dark and your opponent has a beetle on top of one of your piece, click on it.`,
            HiveState.fromRepresentation([
                [[b, Q], [q], [B]],
            ], 2),
            ['#piece-0-0-0'],
            TutorialStepMessage.CONGRATULATIONS(),
            TutorialStepMessage.FAILED_TRY_AGAIN(),
        ),
        TutorialStep.fromMove(
            $localize`Moving the grasshopper`,
            $localize`The grasshopper jumps over one or more pieces in a straight line, and stops at the first empty space encountered. It cannot jump over empty spaces, and can only move through jumps. Because it jumps, it does not adhere to the sliding restriction.<br/><br/>You're playing Dark. Jump over three pieces with your grasshopper!`,
            HiveState.fromRepresentation([
                [[G], [Q], [b], [a]],
                [[g], [], [], []],
            ], 6),
            [HiveMove.move(new Coord(0, 0), new Coord(4, 0)).get()],
            TutorialStepMessage.CONGRATULATIONS(),
            TutorialStepMessage.FAILED_TRY_AGAIN(),
        ),
        TutorialStep.fromPredicate(
            $localize`Moving the soldier ant`,
            $localize`The soldier ant is a powerful piece: it can move anywhere in the hive as long as it respects the sliding and the one hive restrictions!<br/><br/>You're playing Dark. Your queen bee is stuck, move your soldier ant to free up your queen!`,
            HiveState.fromRepresentation([
                [[], [A], [q]],
                [[], [Q], [b]],
                [[a], [s], []],
            ], 6),
            HiveMove.move(new Coord(1, 0), new Coord(3, 1)).get(),
            (move: Move, _previousState: GameState, _resultingState: GameState): MGPValidation => {
                if (move.equals(HiveMove.move(new Coord(1, 0), new Coord(0, 1)).get())) {
                    return MGPValidation.failure($localize`You have not freed your queen, try again!`);
                }
                return MGPValidation.SUCCESS;
            },
            TutorialStepMessage.CONGRATULATIONS()),
        TutorialStep.anyMove(
            $localize`Moving the spider`,
            $localize`Finally, the spider can move exactly 3 spaces at a time. It is not allowed to go twice through the same space in a move. As the spider crawls around other pieces, it can only move around pieces that are in direct contact with it. This means that the spider is not allowed to temporarily split the hive. For example, here, Dark's spider cannot go on the left as its first move. To do a spider move, select a spider and click on the three spaces that compose the move.<br/><br/>You're playing Dark, move your spider!`,
            HiveState.fromRepresentation([
                [[], [S], [s], [b]],
                [[], [], [], [B]],
                [[b], [], [], [a]],
                [[A], [], [G], []],
                [[Q], [g], [], []],
            ], 6),
            HiveMove.spiderMove([new Coord(1, 0), new Coord(1, 1), new Coord(2, 1), new Coord(2, 2)]),
            TutorialStepMessage.CONGRATULATIONS()),
        TutorialStep.informational(
            $localize`Restrictions`,
            $localize`Let us clarify the two restrictions during moves.<ol><li>All pieces of the hive should always be connected in a way that there is a single hive. It can be the case that your piece disconnects from the hive when you slide it, but after the move there should be only one hive.</li><li>Except grasshoppers and beetles, all moves should be done by sliding the piece without disturbing the rest of the hive.</li></ol>Observe here how the queen bee is stuck, as it is not possible to slide it without moving one of the other pieces. Moreover, moving it would split the hive in two.`,
            HiveState.fromRepresentation([
                [[], [S], []],
                [[], [Q], [b]],
                [[a], [], []],
            ], 6)),
        TutorialStep.informational(
            $localize`Passing your turn`,
            $localize`Finally, it is possible that you are not able to do any move: when it is the case, you must pass your turn. Here, Dark must pass: the queen bee cannot move without disconnecting the hive, the beetle is stuck beneath another beetle, and a dropped piece would be in contact with an opponent's piece.`,
            HiveState.fromRepresentation([
                [[b, B], [Q], [q]],
            ], 4)),
    ];
}
