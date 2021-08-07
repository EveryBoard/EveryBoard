import { P4Move } from 'src/app/games/p4/P4Move';
import { P4PartSlice } from 'src/app/games/p4/P4PartSlice';
import { TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';

export const p4Tutorial: TutorialStep[] = [
    TutorialStep.informational(
        $localize`But du jeu`,
        $localize`Le plateau du Puissance 4 fait 7 colonnes et 6 rangées et est initialement vide.
        Le premier joueur joue Foncé, le deuxième joue Clair.
        Le but du du jeu est d'être le premier joueur à aligner 4 de ses pièces (horizontalement, verticalement, ou diagonalement).`,
        P4PartSlice.getInitialSlice(),
    ),
    TutorialStep.anyMove(
        $localize`Déposez une pièce`,
        $localize`Cliquez sur n’importe quelle case d’une colonne.`,
        P4PartSlice.getInitialSlice(),
        P4Move.THREE,
        $localize`Comme vous voyez, la pièce va toujours tomber tout en bas de la colonne.`,
    ),
    TutorialStep.fromMove(
        $localize`Victoire`,
        $localize`Vous jouez Foncé.
        Placez votre pion de façon à aligner horizontalement 4 de vos pièces.`,
        new P4PartSlice([
            [2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 1, 2, 2, 2],
            [2, 2, 2, 1, 2, 2, 2],
            [2, 2, 0, 0, 0, 1, 2],
        ], 0),
        [P4Move.of(1)],
        $localize`Voilà, vous avez gagné!`,
        $localize`Raté, vous n'avez pas aligné 4 pièces et perdu votre occasion de gagner.`,
    ),
    TutorialStep.fromMove(
        $localize`Autre Victoire`,
        $localize`Vous pouvez également aligner 4 pions diagonalement ou verticalement`,
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
        $localize`Voilà, vous avez gagné!`,
        $localize`Raté, vous n'avez pas aligné 4 pièces et perdu votre occasion de gagner.`,
    ),
];
