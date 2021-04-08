/* eslint-disable max-len */
import { CoerceoMove } from 'src/app/games/coerceo/coerceo-move/CoerceoMove';
import { DidacticialStep } from 'src/app/components/wrapper-components/didacticial-game-wrapper/DidacticialStep';
import { CoerceoPartSlice, CoerceoPiece } from 'src/app/games/coerceo/coerceo-part-slice/CoerceoPartSlice';
import { Coord } from 'src/app/jscaip/coord/Coord';

const _: number = CoerceoPiece.EMPTY.value;
const N: number = CoerceoPiece.NONE.value;
const O: number = CoerceoPiece.ZERO.value;
const X: number = CoerceoPiece.ONE.value;

export const coerceoDidacticial: DidacticialStep[] = [
    DidacticialStep.informational(
        `Plateau et but du jeu`,
        `Le Coerceo se joue sur un plateau comme ceci, composé d'hexagones, comportant chacuns 6 triangles.
         Les triangles sont les cases où les pièces se déplacent le long de la partie.
         Les hexagones, appellés également "tuiles" sont séparable du reste du plateau (vous verez comment plus tard).
         Les pièces foncées appartiennent au premier joueur et ne se déplaceront toute la partie que sur les cases foncées,
         les pièces claire appartiennent au second joueur et ne se déplaceront également que sur les cases claires.
         Le but du jeu au Coerceo est de capturer toutes les pièces de l'adversaire.`,
        CoerceoPartSlice.getInitialSlice(),
    ),
    DidacticialStep.anyMove(
        `Deplacement`,
        `Pour effectuer un déplacement, il faut:
        1. Cliquer sur l'une de vos pièces.
        2. Cliquer sur l'une des 6 cases triangulaires (claire) libre les plus proches de votre pièce.
        Note, vous pouvez passer à travers les pièces adverse.
        Vous jouez en premier, vous jouez donc Foncé, faites n'importe quel déplacement.`,
        CoerceoPartSlice.getInitialSlice(),
        'Bravo, voyons les captures maintenant.',
    ),
    DidacticialStep.forMove(
        `Capture`,
        `Chaque pièce a trois cases triangulaires voisines (2 sur les bords).
         Quand toutes les cases voisines sauf une sont occupées, et qu'un ennemi vient se déplacer sur cette dernière case libre, votre pièce est capturée!
         Vous jouez clair, effectuez une capture`,
        new CoerceoPartSlice([
            [N, N, N, N, N, N, O, _, O, N, N, N, N, N, N],
            [N, N, N, O, _, _, _, _, _, O, _, _, N, N, N],
            [_, X, _, X, O, X, _, _, O, _, _, X, _, X, _],
            [X, _, _, _, _, _, _, _, _, _, X, _, _, _, X],
            [_, X, _, X, _, _, _, _, _, _, _, X, _, X, _],
            [_, O, _, O, _, _, _, _, _, _, _, O, _, O, _],
            [O, _, _, _, O, _, _, _, _, _, O, _, _, _, O],
            [_, O, _, O, _, _, X, _, X, _, _, O, _, O, _],
            [N, N, N, _, _, X, _, _, _, X, _, _, N, N, N],
            [N, N, N, N, N, N, X, _, X, N, N, N, N, N, N],
        ], 3, [0, 0], [0, 0]),
        [CoerceoMove.fromCoordToCoord(new Coord(5, 2), new Coord(4, 1))],
        'Bravo!',
        `Raté, vous n'avez pas capturé de pièces!`,
    ),
    DidacticialStep.forMove(
        `Gagner une tuile`,
        `Quand une tuile est quittée, elle devient potentiellement enlevable du plateau.
         Pour qu'elle soit enlevée, il faut que trois de ses bords voisins soient libres.
         Notez que si une tuile vide, voisine d'une tuile qu'on vient de retirer, devient retirablerable, elle peut l'être.
         Par exemple, ci-dessous, en quittant la tuile du haut, celle-ci restera connectée,
         Mais en quittant la tuile en bas à gauche, deux tuiles seront enlevées. Faite-le.`,
        new CoerceoPartSlice([
            [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
            [_, _, _, N, N, N, _, _, _, N, N, N, N, N, N],
            [_, _, X, _, _, _, _, O, _, N, N, N, N, N, N],
            [_, _, _, X, _, _, _, _, _, N, N, N, N, N, N],
            [_, _, _, _, _, _, _, _, _, _, _, O, N, N, N],
            [_, _, O, _, _, X, _, _, _, _, O, _, _, _, O],
            [_, _, _, _, _, _, X, _, X, _, _, O, _, O, _],
            [N, N, N, _, _, X, _, _, _, X, _, _, N, N, N],
            [N, N, N, N, N, N, X, _, X, N, N, N, N, N, N],
        ], 2, [0, 0], [0, 0]),
        [
            CoerceoMove.fromCoordToCoord(new Coord(2, 6), new Coord(4, 6)),
            CoerceoMove.fromCoordToCoord(new Coord(2, 6), new Coord(3, 5)),
            CoerceoMove.fromCoordToCoord(new Coord(2, 6), new Coord(3, 7)),
        ],
        'Bravo!',
        `Raté, vous n'avez pas récupéré les deux tuiles récupérable!`,
    ),
    DidacticialStep.forMove(
        `Échanger une tuile`,
        `Dès que vous avez au moins une tuile, vous pourrez le voir sur la gauche du plateau.
         Dès que vous en avez deux, vous pouvez, en cliquant sur une pièce ennemie, la capturer immédiatement.
         Cet action vous coûtera deux tuiles.
         Gagnez du temps, et capturez la dernière pièce ennemie!`,
        new CoerceoPartSlice([
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, _, _, O, N, N, N, N, N, N, N, N, N],
            [N, N, N, _, _, _, _, _, _, N, N, N, N, N, N],
            [N, N, N, _, _, _, X, _, X, N, N, N, N, N, N],
            [N, N, N, _, _, X, _, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, X, _, X, N, N, N, N, N, N],
        ], 1, [0, 2], [0, 0]),
        [
            CoerceoMove.fromTilesExchange(new Coord(5, 5)),
        ],
        'Bravo!',
        `C'est bien gentil de se déplacer mais en cliquant sur la pièce vous l'aurez immédiatement!`,
    ),
];
