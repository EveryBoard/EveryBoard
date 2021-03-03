import { SaharaMove } from 'src/app/games/sahara/sahara-move/SaharaMove';
import { SaharaPartSlice } from 'src/app/games/sahara/SaharaPartSlice';
import { SaharaPawn } from 'src/app/games/sahara/SaharaPawn';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { DidacticialStep } from '../DidacticialStep';

const N: number = SaharaPawn.NONE;
const O: number = SaharaPawn.BLACK;
const X: number = SaharaPawn.WHITE;
const _: number = SaharaPawn.EMPTY;
const c: Coord = new Coord(5, 2);
export const saharaDidacticial: DidacticialStep[] = [
    new DidacticialStep(
        'But du jeu',
        `Au Sâhârâ, le but du jeu est d'immobiliser une des pyramides de l'adversaire.
         Pour ce faire il faut occuper toutes les cases voisines de celle-ci.
         Ici, le joueur Foncé a perdu car sa pyramide tout à gauche est immobilisée.`,
        new SaharaPartSlice([
            [N, N, _, _, X, _, _, O, X, N, N],
            [N, _, _, _, _, _, _, _, _, _, N],
            [X, O, _, _, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, _, _, _, X],
            [N, _, _, _, _, _, _, _, _, _, N],
            [N, N, X, O, _, _, _, X, O, N, N],
        ], 3),
        [], [], null, null,
    ),
    new DidacticialStep(
        'Déplacement simple',
        `Pour parvenir à immobiliser l'adversaire, il faut déplacer ses pièces.
         Quand une pyramide partage ses arêtes avec des cases jaunes, elle peut se déplacer dessus (un 'pas').
         Vous jouez le premier joueur, qui contrôle les pyramides grises.
         1. Cliquez sur la pyramide grise en haut à gauche.
         2. Cliquez ensuite sur la case en dessous, pour y déplacer votre pyramide.`,
        SaharaPartSlice.getInitialSlice(),
        [new SaharaMove(new Coord(2, 0), new Coord(2, 1))],
        [],
        'Bravo',
        `Raté.
         Vous n'avez pas déplacé la pyramide demandée.
         Cependant c'est un déplacement légal, donc j'imagine que vous pouvez aller jouer maintenant!`,
    ),
    new DidacticialStep(
        'Déplacement double',
        `Quand une pyramide partage ses arêtes avec des cases brunes, vous pouvez si vous le souhaite la déplacer de deux pas.
         Pour ce faire:
         1. Cliquez sur la pyramide à déplacer (celle tout au centre).
         2. Cliquez sur l'une des 6 destinations possibles en deux pas:
         les 6 cases jaunes voisines des 3 cases brunes voisines de votre pyramide.`,
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
        [],
        'gg dudos',
        'booloose',
    ),
];
