import { P4Move } from 'src/app/games/p4/P4Move';
import { P4PartSlice } from 'src/app/games/p4/P4PartSlice';
import { DidacticialStep } from 'src/app/components/wrapper-components/didacticial-game-wrapper/DidacticialStep';

export const p4Didacticial: DidacticialStep[] = [
    new DidacticialStep(
        'Déposez une pièce',
        'Cliquez sur n’importe quelle case d’une colonne',
        P4PartSlice.getInitialSlice(),
        [
            P4Move.of(0),
            P4Move.of(1),
            P4Move.of(2),
            P4Move.of(3),
            P4Move.of(4),
            P4Move.of(5),
            P4Move.of(6),
        ],
        [],
        'Comme vous voyez, la pièce va toujours tomber tout en bas de la colonne',
        null,
    ),
    new DidacticialStep(
        'Victoire',
        'Placez votre pion de façon à aligner horizontalement 4 de vos pièces.',
        new P4PartSlice([
            [2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 1, 2, 2, 2],
            [2, 2, 2, 1, 2, 2, 2],
            [2, 2, 0, 0, 0, 1, 2],
        ], 0),
        [P4Move.of(1)],
        [],
        'Voilà, vous avez gagné!',
        'Raté, vous n\'avez pas aligné 4 pièces et perdu votre occasion de gagner.',
    ),
    new DidacticialStep(
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
        [],
        'Voilà, vous avez gagné!',
        'Raté, vous n\'avez pas aligné 4 pièces et perdu votre occasion de gagner.',
    ),
];
