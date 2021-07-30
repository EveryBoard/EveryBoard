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
        $localize`Plateau de départ`,
        $localize`Le plateau du pentago fait 6 cases de haut et de large, et est composé de quatre blocs, ceux-ci pouvant effectuer des rotations`,
        new PentagoGameState([
            [_, _, _, _, _, _],
            [_, O, _, _, X, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, X, _, _, O, _],
            [_, _, _, _, _, _],
        ], 10),
    ),
    DidacticialStep.informational(
        $localize`But du jeu`,
        $localize`Le but du pentago est d'aligner 5 de vos pièces. Dans le plateau ci-dessous, Foncé gagne.`,
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
        $localize`Mouvement simple`,
        $localize`Chacun à son tour, les joueurs posent une pièce sur le plateau, et effectuent éventuellement une rotation d'un bloc.
        Tant qu'il existe des blocs neutres, c'est à dire des blocs qui ne changeraient pas après avoir été tournés, l'option de ne pas effectueur de rotation est acceptée.
        Pour ce faire il faut cliquer sur le rond barré qui apparaît au centre du plateau quand c'est possible.<br/><br/>
        Faites-le.`,
        new PentagoGameState([
            [_, _, _, _, _, _],
            [_, O, _, _, X, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, X, _, _, O, _],
            [_, _, _, _, _, _],
        ], 10),
        PentagoMove.rotationless(2, 2),
        (move: PentagoMove, resultingState: PentagoGameState) => {
            if (move.blockTurned.isPresent()) {
                return MGPValidation.failure($localize`Vous avez effectué un mouvement avec rotation, cette étape du didacticiel concerne les tours sans rotations!`);
            } else if (resultingState.neutralBlocks.length === 4) {
                return MGPValidation.failure($localize`Vous avez placé votre pièce au centre d'un bloc, de la sorte, tout les blocs étaient neutres et le tour c'est terminé tout seul. Réessayez sans jouer au centre!`);
            } else {
                return MGPValidation.SUCCESS;
            }
        },
        $localize`Bravo !`,
    ),
    DidacticialStep.fromPredicate(
        $localize`Mouvement avec rotation`,
        $localize`Après avoir déposé sa pièce, des flèches apparaîtront sur les blocs non neutres.<br/><br/>
        Cliquez sur l'une d'entre elles et voyez la rotation!`,
        new PentagoGameState([
            [_, _, _, _, _, _],
            [_, O, _, _, X, _],
            [_, _, _, _, _, _],
            [_, _, _, _, _, _],
            [_, X, _, _, O, _],
            [_, _, _, _, _, _],
        ], 10),
        PentagoMove.withRotation(0, 0, 0, true),
        (move: PentagoMove, resultingState: PentagoGameState) => {
            if (move.blockTurned.isPresent()) {
                return MGPValidation.SUCCESS;
            } else {
                return MGPValidation.failure($localize`Vous avez effectué un mouvement sans rotation, recommencez!`);
            }
        },
        $localize`Bravo ! Note: si tout les blocs sont neutres après que vous ayez déposé votre pièce, il n'y aura pas de rotation!`,
    ),
];
