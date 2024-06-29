import { TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPOptional, MGPValidation } from '@everyboard/lib';
import { PentagoMove } from './PentagoMove';
import { PentagoState } from './PentagoState';
import { PentagoRules } from './PentagoRules';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';
import { Coord } from 'src/app/jscaip/Coord';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

export class PentagoTutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Initial board`,
            $localize`The initial Pentago board is made of 6x6 spaces, subdivided in 4 quadrants, which can each rotate.`,
            PentagoRules.get().getInitialState(),
        ),
        TutorialStep.informational(
            TutorialStepMessage.OBJECT_OF_THE_GAME(),
            $localize`The goal at Pentago is to align 5 of your pieces. In the following board, Dark wins.`,
            new PentagoState([
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
            $localize`At their turn, players put a piece on the board and possibly rotate one quadrant. As long as there are neutral quadrants, i.e., quadrants that would not change after being rotated, a player may skip rotating a quadrant. To do this, you have to click on the crossed circle that appears at the center of the board when it is possible.<br/><br/>You're playing Dark, do a simple move.`,
            new PentagoState([
                [_, _, _, _, _, _],
                [_, O, _, _, X, _],
                [_, _, _, _, _, _],
                [_, _, _, _, _, _],
                [_, X, _, _, O, _],
                [_, _, _, _, _, _],
            ], 10),
            PentagoMove.rotationless(2, 2),
            (move: PentagoMove, _previous: PentagoState, _result: PentagoState) => {
                if (move.blockTurned.isPresent()) {
                    return MGPValidation.failure($localize`You have made a move with a rotation. This tutorial step is about moves without rotations!`);
                } else {
                    return MGPValidation.SUCCESS;
                }
            },
            TutorialStepMessage.CONGRATULATIONS(),
        ).withPreviousMove(PentagoMove.of(new Coord(1, 4), MGPOptional.empty(), false)),
        TutorialStep.fromPredicate(
            $localize`Move with rotation`,
            $localize`After putting a piece, arrows will appear on non-neutral quadrants.<br/><br/>
        You're playing Dark, place a piece on a quadrant and do a rotation!`,
            new PentagoState([
                [_, _, _, _, _, _],
                [_, O, _, _, X, _],
                [_, _, _, _, _, _],
                [_, _, _, _, _, _],
                [_, X, _, _, O, _],
                [_, _, _, _, _, _],
            ], 10),
            PentagoMove.withRotation(0, 0, 0, true),
            (move: PentagoMove, _previous: PentagoState, _result: PentagoState) => {
                if (move.blockTurned.isPresent()) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`You made a move without rotation, try again!`);
                }
            },
            $localize`Congratulations! Note that if all quadrants are neutral after you have put your piece, there will be no rotation.`,
        ).withPreviousMove(PentagoMove.of(new Coord(1, 4), MGPOptional.empty(), false)),
    ];
}
