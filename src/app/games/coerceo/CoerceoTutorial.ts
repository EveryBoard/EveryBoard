import { CoerceoMove } from 'src/app/games/coerceo/CoerceoMove';
import { TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { CoerceoPartSlice } from 'src/app/games/coerceo/CoerceoPartSlice';
import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';

const _: number = FourStatePiece.EMPTY.value;
const N: number = FourStatePiece.NONE.value;
const O: number = FourStatePiece.ZERO.value;
const X: number = FourStatePiece.ONE.value;

export const coerceoTutorial: TutorialStep[] = [
    TutorialStep.informational(
        $localize`Plateau et but du jeu`,
        $localize`Le Coerceo se joue sur un plateau comme ceci, composé de tuiles hexagonales, comportant chacune 6 triangles.
         Les triangles sont les cases où les pièces se déplacent tout le long de la partie.
         Les tuiles sont séparable du reste du plateau (vous verez comment plus tard).
         Les pièces foncées appartiennent au premier joueur et ne se déplaceront toute la partie que sur les cases foncées,
         les pièces claire appartiennent au second joueur et ne se déplaceront également que sur les cases claires.
         Le but du jeu au Coerceo est de capturer toutes les pièces de l'adversaire.`,
        CoerceoPartSlice.getInitialSlice(),
    ),
    TutorialStep.anyMove(
        $localize`Deplacement`,
        $localize`Pour effectuer un déplacement, il faut:
        <ul>
            <li>1. Cliquer sur l'une de vos pièces.</li>
            <li>2. Cliquer sur l'une des cases triangulaires encadrées en jaune.</li>
        </ul>
        Vous pouvez passer à travers les pièces adverses.<br/><br/>
        Vous jouez en premier, vous jouez donc Foncé, faites n'importe quel déplacement.<br/>
        Note: peut importe ce que vous faites, aucunes de vos pièces ne peuvent être capturée pendant votre tour.`,
        CoerceoPartSlice.getInitialSlice(),
        CoerceoMove.fromCoordToCoord(new Coord(3, 5), new Coord(5, 5)),
        $localize`Bravo, voyons ensuite les captures.`,
    ),
    TutorialStep.fromMove(
        $localize`Capture`,
        $localize`Chaque pièce a trois cases triangulaires voisines (2 sur les bords).
        Quand toutes les cases voisines sauf une sont occupées, et qu'un ennemi vient se déplacer sur cette dernière case libre, votre pièce est capturée !
        Cependant, il est possible pour un joueur de se placer entre 3 pièces adverses (ou 2 contre un bord) sans être capturé.<br/><br/>
        Vous jouez Clair, effectuez une capture`,
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
        [
            CoerceoMove.fromCoordToCoord(new Coord(5, 2), new Coord(4, 1)),
            CoerceoMove.fromCoordToCoord(new Coord(3, 4), new Coord(4, 3)),
        ],
        $localize`Bravo !`,
        $localize`Raté, vous n'avez pas capturé de pièce !`,
    ),
    TutorialStep.fromMove(
        $localize`Gagner une tuile`,
        $localize`Quand une tuile est quittée, elle devient potentiellement enlevable du plateau.
        Pour qu'elle soit enlevée, il faut que trois de ses bords soient libres, et qu'ils soient l'un à côté de l'autre.
        Notez que si une tuile vide, voisine d'une tuile qu'on vient de retirer, devient retirable, elle sera retirée.
        Par exemple, ci-dessous, en quittant sa tuile le pion foncé le plus haut ne déconnectera pas celle-ci !
        Mais en quittant la tuile en bas à gauche, deux tuiles seront enlevées.<br/><br/>
        Effectuez un mouvement pour récupérer deux tuiles.`,
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
        $localize`Bravo !`,
        $localize`Raté, vous n'avez pas récupéré les deux tuiles récupérable !`,
    ),
    TutorialStep.fromMove(
        $localize`Échanger une tuile`,
        $localize`Dès que vous avez au moins une tuile, vous pourrez le voir sur la gauche du plateau.
        Dès que vous en avez deux, vous pouvez, en cliquant sur une pièce ennemie, la capturer immédiatement.
        Cet action vous coûtera deux tuiles.
        Si une ou plusieurs tuile sont retirées pendant ce tour, personne ne les récupérera.<br/><br/>
        Gagnez du temps, et capturez la dernière pièce ennemie !`,
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
        $localize`Bravo !`,
        $localize`C'est bien gentil de se déplacer mais en cliquant sur la pièce vous l'aurez immédiatement !`,
    ),
    TutorialStep.fromMove(
        $localize`Capture spéciale`,
        $localize`Dès qu'une tuile est enlevée du plateau pendant votre tour, certaines pièces de l'adversaires peuvent n'avoir plus aucunes cases voisines libre, elle seront alors capturées !
        Si cela arrivait à l'une de vos pièces, celle-ci resterait cependant sur le plateau.<br/><br/>
        Un coup démontrant ces deux choses est faisable pour le joueur clair, faites-le !`,
        new CoerceoPartSlice([
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
            [N, N, N, _, _, O, _, _, _, N, N, N, N, N, N],
            [N, N, N, _, O, X, _, X, _, N, N, N, N, N, N],
            [N, N, N, _, X, O, _, _, _, N, N, N, N, N, N],
            [N, N, N, _, _, X, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
        ], 1, [0, 0], [0, 0]),
        [
            CoerceoMove.fromCoordToCoord(new Coord(7, 6), new Coord(6, 5)),
            CoerceoMove.fromCoordToCoord(new Coord(7, 6), new Coord(8, 5)),
        ],
        $localize`Bravo ! Voyez, votre pièce a perdu sa dernière liberté quand vous avez récupéré la tuile, mais est restée car c'était votre tour.
        Celle de l'adversaire a disparu car la capture de la tuile lui a enlevé une liberté il ne lui en restait plu !`,
        $localize`Raté !`,
    ),
];
