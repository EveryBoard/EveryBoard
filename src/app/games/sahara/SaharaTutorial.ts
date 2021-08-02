import { SaharaMove } from 'src/app/games/sahara/SaharaMove';
import { SaharaPartSlice } from 'src/app/games/sahara/SaharaPartSlice';
import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { DidacticialStep } from '../../components/wrapper-components/didacticial-game-wrapper/DidacticialStep';

const N: number = FourStatePiece.NONE.value;
const O: number = FourStatePiece.ZERO.value;
const X: number = FourStatePiece.ONE.value;
const _: number = FourStatePiece.EMPTY.value;
export const saharaTutorial: DidacticialStep[] = [

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
    DidacticialStep.fromPredicate(
        $localize`Déplacement simple`,
        $localize`Pour parvenir à immobiliser l'adversaire, il faut déplacer ses pyramides.
        Quand une pyramide partage ses arêtes avec des cases claires, elle peut se déplacer dessus (appelons ceci, faire un pas simple).
        Vous jouez le premier joueur, qui contrôle les pyramides foncées.
        <ul>
            <li> 1. Cliquez sur une de vos pyramides.</li>
            <li> 2. Cliquez ensuite sur une des deux ou trois cases voisines, pour y déplacer votre pyramide.</li>
        </ul><br/>
        Faite n'importe quel mouvement.`,
        SaharaPartSlice.getInitialSlice(),
        new SaharaMove(new Coord(2, 0), new Coord(2, 1)),
        (move: SaharaMove, state: SaharaPartSlice) => {
            if (move.isSimpleStep()) {
                return MGPValidation.SUCCESS;
            } else {
                return MGPValidation.failure($localize`Vous avez fait un double pas, c'est très bien, mais c'est l'exercice suivant!`);
            }
        },
        $localize`Bravo !`,
    ),
    DidacticialStep.fromPredicate(
        $localize`Déplacement double`,
        $localize`Quand une pyramide partage ses arêtes avec des cases foncées, vous pouvez la déplacer de deux pas.
        Pour ce faire:
        <ul>
            <li> 1. Cliquez sur la pyramide à déplacer (celle tout au centre).</li>
            <li> 2. Cliquez directement sur l'une des 6 destinations possibles en deux pas:
                les 6 cases claires voisines des 3 cases foncées voisines de votre pyramide.
        </li>`,
        SaharaPartSlice.getInitialSlice(),
        new SaharaMove(new Coord(7, 0), new Coord(5, 0)),
        (move: SaharaMove, state: SaharaPartSlice) => {
            if (move.isSimpleStep()) {
                return MGPValidation.failure($localize`Raté ! Vous avez fait un simple pas!`);
            } else {
                return MGPValidation.SUCCESS;
            }
        },
        $localize`Bravo !`,
    ),
];
