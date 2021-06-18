import { PylosCoord } from 'src/app/games/pylos/PylosCoord';
import { PylosMove } from 'src/app/games/pylos/PylosMove';
import { PylosPartSlice } from 'src/app/games/pylos/PylosPartSlice';
import { Player } from 'src/app/jscaip/Player';
import { DidacticialStep } from '../DidacticialStep';

const _: number = Player.NONE.value;
const O: number = Player.ZERO.value;
const X: number = Player.ONE.value;
export const pylosDidacticial: DidacticialStep[] = [
    DidacticialStep.informational(
        'But du jeu',
        `Au Pylos, le but est d'être le dernier à jouer.
         Pour cela, il faut économiser ses pièces.
         Dès qu'un joueur dépose sa dernière pièce, il perd immédiatement la partie.
         Voici à quoi ressemble le plateau initial, un plateau de 4 x 4 cases.
         Celui-ci deviendra une pyramide petit à petit.
         Ce plateau sera rempli par les pièces dans votre réserve, au nombre de 15 chacun.
         `,
        PylosPartSlice.getInitialSlice(),
    ),
    DidacticialStep.anyMove(
        'Déposer une pièce',
        `Quand c'est votre tour, vous avez toujours l'option de déposer une de vos pièces sur une case vide.
         Les rectangles gris sont les cases sur lesquelles vous pouvez déposez vos pièces.
         Cliquez sur une de ces cases pour déposer une pièce.`,
        PylosPartSlice.getInitialSlice(),
        PylosMove.fromDrop(new PylosCoord(1, 1, 0), []),
        'Voilà, aussi simplement que ça.',
    ),
    DidacticialStep.fromMove(
        'Grimper',
        `Quand 4 pièces forment un carré, il est possible de placer une cinquième pièce dessus.
         Cependant, à ce moment là, se crée une opportunité d'économiser une pièce en "grimpant" au lieu de déposer.
         Pour grimper :
         1. Cliquez sur une de vos pièces libres et plus basse que la case d'atterrissage.
         2. Cliquez sur une case vide plus haute.`,
        new PylosPartSlice([
            [
                [O, X, _, _],
                [X, O, _, _],
                [_, _, _, _],
                [_, _, _, O],
            ], [
                [_, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ], 0),
        [PylosMove.fromClimb(new PylosCoord(3, 3, 0), new PylosCoord(0, 0, 1), [])],
        `Bravo.
         Notes importantes:
         1. On ne peut déplacer une pièce qui est en dessous d'une autre.
         2. Naturellement, on ne peut pas déplacer les pièces adverses.
         3. Un déplacement ne peut se faire que quand la case d'arrivée est plus haute que la case de départ.`,
        'Raté',
    ),
    DidacticialStep.fromMove(
        'Carré (1/3)',
        `Quand la pièce que vous posez est la quatrième d'un carré de pièces de votre couleur,
         vous pouvez choisir alors n'importe où sur le plateau, une à deux de vos pièces.
         Cette(ces) pièce(s) sera(seront) enlevée(s) du plateau, vous permettant d'économiser 1 ou 2 pièces.
         Une pièce choisie pour être enlevée ne peut pas être en dessous d'autres pièces.
         Une pièce choisie peut être la pièce que vous venez de placer.
         Vous jouez Foncé.
         Formez un carré, puis cliquez deux fois sur l'une des quatre pièce pour n'enlever que celle là.`,
        new PylosPartSlice([
            [
                [O, O, _, _],
                [_, O, _, _],
                [_, _, _, _],
                [_, _, _, _],
            ], [
                [_, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ], 0),
        [
            PylosMove.fromDrop(new PylosCoord(0, 1, 0), [new PylosCoord(0, 0, 0)]),
            PylosMove.fromDrop(new PylosCoord(0, 1, 0), [new PylosCoord(0, 1, 0)]),
            PylosMove.fromDrop(new PylosCoord(0, 1, 0), [new PylosCoord(1, 0, 0)]),
            PylosMove.fromDrop(new PylosCoord(0, 1, 0), [new PylosCoord(1, 1, 0)]),
        ],
        'Bravo, vous avez économisé une pièce.',
        'Raté.',
    ),
    DidacticialStep.fromMove(
        'Carré (2/3)',
        `Vous jouez Foncé.
         Faites comme à l'étape précédente, mais cliquez cette fois sur les deux pièces du haut.`,
        new PylosPartSlice([
            [
                [O, O, _, _],
                [_, O, _, _],
                [_, _, _, _],
                [_, _, _, _],
            ], [
                [_, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ], 0),
        [PylosMove.fromDrop(new PylosCoord(0, 1, 0), [new PylosCoord(0, 0, 0), new PylosCoord(1, 0, 0)])],
        'Bravo, vous avez économisé deux pièces.',
        'Raté.',
    ),
    DidacticialStep.fromMove(
        'Carré (3/3)',
        `Vous jouez Foncé.
         Faites comme à l'étape précédente, mais cette fois:
         vous devrez, naturellement, capturer en premier votre pièce la plus haute,
         et ensuite seulement capturer celle du dessous, qui vient d'être enlevable à nouveau.`,
        new PylosPartSlice([
            [
                [O, X, X, O],
                [X, O, O, X],
                [X, X, O, X],
                [O, X, O, _],
            ], [
                [_, O, X],
                [O, O, X],
                [O, X, _],
            ], [
                [_, X],
                [X, _],
            ], [
                [_],
            ],
        ], 0),
        [PylosMove.fromDrop(new PylosCoord(0, 0, 1), [new PylosCoord(0, 0, 1), new PylosCoord(0, 0, 0)])],
        'Bravo, vous avez économisé deux pièces. Vous êtes maintenant prêt à jouer.',
        'Raté.',
    ),
];
