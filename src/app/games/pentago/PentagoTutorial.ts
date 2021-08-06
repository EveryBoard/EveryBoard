import { TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { Player } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { PentagoMove } from './PentagoMove';
import { PentagoGameState } from './PentagoGameState';

const _: number = Player.NONE.value;
const X: number = Player.ONE.value;
const O: number = Player.ZERO.value;

export const pentagoTutorial: TutorialStep[] = [
    TutorialStep.informational(
        $localize`Initial board`,
        $localize`The initial Pentago board is made of 6x6 spaces, subdivided in 4 blocks, which can each rotate.`,
        PentagoGameState.getInitialSlice(),
    ),
    TutorialStep.informational(
        $localize`Goal of the game`,
        $localize`The goal at Pentago is to align 5 of your pieces. In the following board, Dark wins.`,
        new PentagoGameState([
            [O, _, _, O, X, _],
            [O, X, _, _, _, _],
            [O, _, X, _, _, _],
            [O, _, _, _, _, X],
            [O, _, _, _, X, _],
            [_, _, _, _, _, _],
        ], 10),
    ).withPreviousMove(PentagoMove.withRotation(0, 0, 0, false)),
    TutorialStep.fromPredicate(
        $localize`Simple move`,
        $localize`At their turn, players put a piece on the board and possibly rotate one block.
        As long as there are neutral blocks, i.e., blocks that would not change after being rotated, a player may skip rotating a block.
        To do this, you have to click on the crossed circle that appears at the center of the board when it is possible.<br/><br/>
        Do it.`,
        new PentagoGameState([
            [_, _, _, _, _, _],
            [_, O, _, _, X, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, X, _, _, O, _],
            [_, _, _, _, _, _],
        ], 10),
        PentagoMove.rotationless(2, 2),
        (move: PentagoMove, _: PentagoGameState) => {
            if (move.blockTurned.isPresent()) {
                return MGPValidation.failure($localize`You have made a move with a rotation. This tutorial step is about moves without rotations!`);
            } else {
                return MGPValidation.SUCCESS;
            }
        },
        $localize`Congratulations!`,
    ),
    TutorialStep.fromPredicate(
        $localize`Move with rotation`,
        $localize`After putting a piece, arrows will appear on non-neutral blocks.<br/><br/>
        Click on one of them and see the rotation!`,
        new PentagoGameState([
            [_, _, _, _, _, _],
            [_, O, _, _, X, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, X, _, _, O, _],
            [_, _, _, _, _, _],
        ], 10),
        PentagoMove.withRotation(0, 0, 0, true),
        (move: PentagoMove, _: PentagoGameState) => {
            if (move.blockTurned.isPresent()) {
                return MGPValidation.SUCCESS;
            } else {
                return MGPValidation.failure($localize`You made a move without rotation, try again!`);
            }
        },
        $localize`Congratulations! Note that if all blocks are neutral after you have put your piece, there will be no rotation.`,
    ),
];
