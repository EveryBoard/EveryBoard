/* eslint-disable max-len */
import { P4Move } from 'src/app/games/p4/P4Move';
import { P4PartSlice } from 'src/app/games/p4/P4PartSlice';
import { DidacticialStep } from 'src/app/components/wrapper-components/didacticial-game-wrapper/DidacticialStep';

export const p4Didacticial: DidacticialStep[] = [
    DidacticialStep.informational(
        'But du jeu',
        `Le plateau du Puissance 4 fait 7 colonnes et 6 rangées et est initialement vide.
         Le premier joueur joue Foncé, le deuxième joue Clair.
         Le but du du jeu est d'être le premier joueur à aligner 4 de ses pièces (horizontalement, verticalement, ou diagonalement).`,
        P4PartSlice.getInitialSlice(),
    ),
    DidacticialStep.anyMove(
        'Déposez une pièce',
        'Cliquez sur n’importe quelle case d’une colonne.',
        P4PartSlice.getInitialSlice(),
        'Comme vous voyez, la pièce va toujours tomber tout en bas de la colonne.',
    ),
    DidacticialStep.fromMove(
        'Victoire',
        `Vous jouez Foncé.
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
        'Voilà, vous avez gagné!',
        'Raté, vous n\'avez pas aligné 4 pièces et perdu votre occasion de gagner.',
    ),
    DidacticialStep.fromMove(
        'Autre Victoire',
        'Vous pouvez également aligner 4 pions diagonalement ou verticalement',
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
        'Voilà, vous avez gagné!',
        'Raté, vous n\'avez pas aligné 4 pièces et perdu votre occasion de gagner.',
    ),
];
