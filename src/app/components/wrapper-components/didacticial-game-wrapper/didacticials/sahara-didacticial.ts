import { SaharaMove } from 'src/app/games/sahara/SaharaMove';
import { SaharaPartSlice } from 'src/app/games/sahara/SaharaPartSlice';
import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { DidacticialStep } from '../DidacticialStep';

const N: number = FourStatePiece.NONE.value;
const O: number = FourStatePiece.ZERO.value;
const X: number = FourStatePiece.ONE.value;
const _: number = FourStatePiece.EMPTY.value;
const c: Coord = new Coord(5, 2);
export const saharaDidacticial: DidacticialStep[] = [
    DidacticialStep.informational(
        $localize`Plateau initial`,
        $localize`Le Sâhârâ se joue sur un plateau dont chaque case est triangulaire.
        Chaque joueur contrôle six pyramides.`,
        SaharaPartSlice.getInitialSlice(),
    ),
    DidacticialStep.informational(
        $localize`But du jeu`,
        $localize`Au Sâhârâ, le but du jeu est d'immobiliser une des pyramides de l'adversaire.
        Pour ce faire il faut occuper toutes les cases voisines de celle-ci.
        Ici, le joueur clair a perdu car sa pyramide tout à gauche est immobilisée.`,
        new SaharaPartSlice([
            [N, N, _, _, X, _, _, O, X, N, N],
            [N, _, _, _, _, _, _, _, _, _, N],
            [X, O, _, _, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, _, _, _, X],
            [N, _, _, _, _, _, _, _, _, _, N],
            [N, N, X, O, _, _, _, X, O, N, N],
        ], 3),
    ),
    DidacticialStep.anyMove(
        $localize`Déplacement simple`,
        $localize`Pour parvenir à immobiliser l'adversaire, il faut déplacer ses pyramides.
        Quand une pyramide partage ses arêtes avec des cases claires, elle peut se déplacer dessus (un 'pas').
        Vous jouez le premier joueur, qui contrôle les pyramides foncées.
        <ul>
            <li> 1. Cliquez sur la pyramide (foncée pour ce tour ci).</li>
            <li> 2. Cliquez ensuite sur une des deux ou trois cases voisines, pour y déplacer votre pyramide.</li>
        </ul><br/>
        Faite n'importe quel mouvement.`,
        SaharaPartSlice.getInitialSlice(),
        new SaharaMove(new Coord(2, 0), new Coord(2, 1)),
        $localize`Bravo !`,
    ),
    DidacticialStep.fromMove(
        $localize`Déplacement double`,
        $localize`Quand une pyramide partage ses arêtes avec des cases foncées, vous pouvez la déplacer de deux pas.
         Pour ce faire:
         1. Cliquez sur la pyramide à déplacer (celle tout au centre).
         2. Cliquez directement sur l'une des 6 destinations possibles en deux pas:
         les 6 cases claires voisines des 3 cases foncées voisines de votre pyramide.`,
        new SaharaPartSlice([
            [N, N, _, _, O, _, _, O, X, N, N],
            [N, _, _, _, _, _, _, _, _, _, N],
            [X, _, _, _, _, X, _, _, _, _, O],
            [O, _, _, _, _, _, _, _, _, _, X],
            [N, _, _, _, _, _, _, _, _, _, N],
            [N, N, X, O, _, _, _, X, O, N, N],
        ], 3),
        [
            new SaharaMove(c, new Coord(3, 2)),
            new SaharaMove(c, new Coord(7, 2)),
            new SaharaMove(c, new Coord(6, 1)),
            new SaharaMove(c, new Coord(4, 1)),
            new SaharaMove(c, new Coord(6, 3)),
            new SaharaMove(c, new Coord(4, 3)),
        ],
        $localize`Bravo !`,
        $localize`Raté !`,
    ),
];
