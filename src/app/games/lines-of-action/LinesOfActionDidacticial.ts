import { DidacticialStep } from 'src/app/components/wrapper-components/didacticial-game-wrapper/DidacticialStep';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { LinesOfActionMove } from './LinesOfActionMove';
import { LinesOfActionState } from './LinesOfActionState';

const X: number = Player.ZERO.value;
const O: number = Player.ONE.value;
const _: number = Player.NONE.value;

export const linesOfActionDidacticial: DidacticialStep[] = [
    DidacticialStep.informational(
        'But du jeu',
        `À Lines of Actions, le but est de regrouper toutes vos pièces de façon
        contigues, orthogonalement et/ou diagonalement. Ici, Foncé gagne la partie :
        ses pièces ne forment qu'un seul groupe, alors que les pièces de Clair forment trois groupes.`,
        new LinesOfActionState([
            [_, _, _, _, _, _, _, _],
            [O, _, _, _, X, _, _, O],
            [_, _, X, X, O, _, _, _],
            [_, _, _, X, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ], 0),
    ),
    DidacticialStep.anyMove(
        'Plateau de départ et déplacement',
        `Voici le plateau de départ.
         Les déplacements s'effectuent orthogonalement ou diagonalement.
         La longueur d'un déplacement est égale au nombre de pièces présentes dans la ligne du déplacement.
         Notez la présence d'un indicateur d'aide qui indique où une pièce peut atterrir quand vous la sélectionnez.
         Vous jouez Foncé, faites le premier déplacement !`,
        LinesOfActionState.getInitialSlice(),
        LinesOfActionMove.of(new Coord(1, 7), new Coord(1, 5)).get(),
        `Super !`,
    ),
    DidacticialStep.fromMove(
        'Sauts',
        `Lors d'un déplacement, il est possible de sauter au dessus de ses propres pièces.
         Mais il est interdit de sauter au dessus des pièces de l'adversaire.
         Effectuez un saut au dessus de l'une de vos pièces avec la configuration suivante.`,
        new LinesOfActionState([
            [_, _, _, _, _, _, _, _],
            [_, _, O, X, X, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, X],
        ], 0),
        [LinesOfActionMove.of(new Coord(3, 1), new Coord(6, 1)).get()],
        `Parfait !`,
        `Ce n'était pas le déplacement attendu.`,
    ),
    DidacticialStep.fromMove(
        'Déplacement',
        `Voici une configuration différente. Sélectionnez la pièce foncée au milieu (ligne 4, colonne 4)
         et observez bien les déplacements possibles.
         Horizontalement, elle se déplace d'une case car elle est seule sur cette ligne.
         Verticalement, elle se déplace de trois cases car il y a en tout trois pièces sur cette ligne verticale.
         Mais elle ne peut qu'aller vers le haut, car vers le bas la case d'atterrissage est occupée par une autre
         de vos pièces.
         Diagonalement, un seul mouvement est possible : sur la diagonale qui contient trois pièces, dans la seule
         direction où on ne doit pas sauter au dessus d'une pièce adverse.
         Sur l'autre diagonale, il y a trop de pièces pour que le déplacement se termine sur le plateau.
         Effectuez un de ces déplacements.`,
        new LinesOfActionState([
            [_, _, _, _, _, _, O, _],
            [_, _, _, _, _, X, _, _],
            [_, _, _, _, O, _, _, _],
            [_, _, _, X, _, _, _, _],
            [_, _, _, _, _, _, _, O],
            [_, _, _, _, _, O, _, O],
            [_, _, _, X, _, _, O, O],
            [_, _, _, X, _, _, _, _],
        ], 0),
        [
            LinesOfActionMove.of(new Coord(3, 3), new Coord(3, 0)).get(),
            LinesOfActionMove.of(new Coord(3, 3), new Coord(0, 0)).get(),
            LinesOfActionMove.of(new Coord(3, 3), new Coord(2, 3)).get(),
            LinesOfActionMove.of(new Coord(3, 3), new Coord(4, 3)).get(),
        ],
        `Bravo !`,
        `Ce n'était pas un des déplacements attendus`,
    ),
    DidacticialStep.fromMove(
        'Captures',
        `Si un déplacement se termine sur une pièce adverse, celle-ci est capturée et disparait du plateau.
         Un déplacement par contre ne peut pas se terminer sur une pièce du joueur lui-même.
         Attention, avoir moins de pièces à Lines of Action rend plus atteignable la condition de victoire,
         car il est plus facile de regrouper moins de pièces ! D'ailleurs, s'il reste une seule pièce à un joueur,
         il gagne la partie. Dans la configuration suivante, avec Foncé, essayez de capturer une pièce.`,
        new LinesOfActionState([
            [_, X, _, X, X, X, X, _],
            [O, _, _, _, _, _, _, O],
            [_, _, X, _, O, _, _, _],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, O],
            [_, X, X, X, X, X, X, _],
        ], 0),
        [LinesOfActionMove.of(new Coord(2, 2), new Coord(4, 2)).get()],
        `Bravo !`,
        `Raté !`,
    ),
    DidacticialStep.fromMove(
        'Égalité',
        `Dans le cas spécial où un mouvement résulte en une connexion complète des pièces des deux joueurs,
         simultanément, alors la partie se termine par une égalité. Vous jouez Foncé, forcez l'égalité en un coup.`,
        new LinesOfActionState([
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [X, _, _, X, O, X, _, _],
            [_, _, _, X, _, _, _, O],
            [_, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, O],
            [_, _, _, _, _, _, _, _],
        ], 0),
        [LinesOfActionMove.of(new Coord(0, 2), new Coord(4, 2)).get()],
        `Bravo !`,
        `Raté !`,
    ),
];
