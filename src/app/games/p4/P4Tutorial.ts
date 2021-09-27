import { P4Move } from 'src/app/games/p4/P4Move';
import { P4PartSlice } from 'src/app/games/p4/P4PartSlice';
import { TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';

export class P4Tutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Goal of the game`,
            $localize`The board at Four in a Row is made of 7 columns and 6 rows, and it is initially empty.
        The first player plays Dark, the second plays Light.
        The goal is to be the first to align 4 of its pieces (horizontally, vertically, or diagonally).`,
            P4PartSlice.getInitialSlice(),
        ),
        TutorialStep.anyMove(
            $localize`Dropping a piece`,
            $localize`Click on any space in any column.`,
            P4PartSlice.getInitialSlice(),
            P4Move.THREE,
            $localize`As you can see, the piece falls at the bottom of the column.`,
        ),
        TutorialStep.fromMove(
            $localize`Victory`,
            $localize`You're playing Dark.
        Place your piece so that you create a horizontal alignment of 4 of your pieces.`,
            new P4PartSlice([
                [2, 2, 2, 2, 2, 2, 2],
                [2, 2, 2, 2, 2, 2, 2],
                [2, 2, 2, 2, 2, 2, 2],
                [2, 2, 2, 1, 2, 2, 2],
                [2, 2, 2, 1, 2, 2, 2],
                [2, 2, 0, 0, 0, 1, 2],
            ], 0),
            [P4Move.of(1)],
            $localize`You won!`,
            $localize`Failed, you have not aligned 4 pieces and missed an opportunity to win.`,
        ),
        TutorialStep.fromMove(
            $localize`Other victory`,
            $localize`You can also align 4 pieces diagonally or vertically.`,
            new P4PartSlice([
                [2, 2, 2, 2, 2, 2, 2],
                [2, 2, 2, 2, 2, 2, 2],
                [2, 2, 2, 2, 2, 2, 2],
                [2, 2, 2, 0, 1, 2, 2],
                [2, 2, 0, 0, 1, 2, 2],
                [2, 0, 1, 0, 0, 2, 2],
            ], 0),
            [
                P4Move.of(3),
                P4Move.of(4),
            ],
            $localize`You won!`,
            $localize`Failed, you have not aligned 4 pieces and missed an opportunity to win.`,
        ),
    ];
}
