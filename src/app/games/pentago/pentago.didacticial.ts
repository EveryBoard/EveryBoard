import { DidacticialStep } from 'src/app/components/wrapper-components/didacticial-game-wrapper/DidacticialStep';
import { Player } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { PentagoMove } from './PentagoMove';
import { PentagoGameState } from './PentagoGameState';

const _: number = Player.NONE.value;
const X: number = Player.ONE.value;
const O: number = Player.ZERO.value;

export const pentagoDidacticial: DidacticialStep[] = [
    DidacticialStep.informational(
        `Plateau de départ`,
        `Le plateau du pentago fait 6 cases de haut et de large, et est composé de quatre blocs, ceux-ci pouvant effectuer des rotations`,
        PentagoGameState.getInitialSlice(),
    ),
    DidacticialStep.informational(
        `But du jeu`,
        `Le but du pentago est d'aligner 5 de vos pièces. Dans le plateau ci-dessous, Foncé gagne.`,
        new PentagoGameState([
            [O, _, _, O, X, _],
            [O, X, _, _, _, _],
            [O, _, X, _, _, _],
            [O, _, _, _, _, X],
            [O, _, _, _, X, _],
            [_, _, _, _, _, _],
        ], 10),
    ),
    DidacticialStep.fromPredicate(
        `Mouvement simple`,
        `Chacun à son tour, les joueurs posent une pièce sur le plateau, et effectuent éventuellement une rotation d'un bloc. Tant qu'il existe des blocs neutres, c'est à dire des blocs qui ne changeraient pas après avoir été tournés, l'option de ne pas effectueur de rotation est acceptée. Pour ce faire il faut cliquer sur le rond barré qui apparaît au centre du plateau quand c'est possible. Faites-le.`,
        PentagoGameState.getInitialSlice(),
        PentagoMove.rotationless(1, 1),
        (move: PentagoMove, resultingState: PentagoGameState) => {
            if (move.blockTurned.isPresent()) {
                return MGPValidation.failure(`Vous avez effectué un mouvement avec rotation, cette étape du didacticiel concerne les tours sans rotations!`);
            } else if (resultingState.neutralBlocks.length === 4) {
                return MGPValidation.failure(`Vous avez placé votre pièce au centre d'un bloc, de la sorte, tout les blocs étaient neutres et le tour c'est terminé tout seul. Réessayez sans jouer au centre!`);
            } else {
                return MGPValidation.SUCCESS;
            }
        },
        `Bravo !`,
    ),
    DidacticialStep.fromPredicate(
        `Mouvement avec rotation`,
        `Après avoir déposé sa pièce, des flèches apparaîtront sur les blocs non neutres, cliquez sur l'une d'entre elles et voyez la rotation!`,
        PentagoGameState.getInitialSlice(),
        PentagoMove.withRotation(0, 0, 0, true),
        (move: PentagoMove, resultingState: PentagoGameState) => {
            if (move.blockTurned.isPresent()) {
                return MGPValidation.SUCCESS;
            } else {
                return MGPValidation.failure(`Vous avez effectué un mouvement sans rotation, recommencez!`);
            }
        },
        `Bravo ! Note: si tout les blocs sont neutre après que vous ayez déposé votre pièce, il n'y aura pas de rotation!`,
    ),
];
