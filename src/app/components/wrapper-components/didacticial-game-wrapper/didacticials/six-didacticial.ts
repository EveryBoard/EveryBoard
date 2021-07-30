import { SixGameState } from 'src/app/games/six/SixGameState';
import { SixMove } from 'src/app/games/six/SixMove';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { DidacticialStep } from '../DidacticialStep';

const _: number = Player.NONE.value;
const O: number = Player.ZERO.value;
const X: number = Player.ONE.value;

export class SixDidacticialMessages {

    public static readonly MOVEMENT_NOT_DISCONNECTING: string = $localize`Ce mouvement ne déconnecte pas de pièce adverse ! Réessayez avec une autre pièce !`;
}

export const sixTutorial: DidacticialStep[] = [

    DidacticialStep.informational(
        $localize`Six`,
        $localize`Le six est une jeu sans plateau, où les pièces sont placées les unes à côtés des autres, en un bloc continu.
        Chaque joueur a 21 pièces à lui, 2 étant déjà placée sur le plateau.
        Le but principal du jeu est de former l'une des trois formes gagnantes avec vos pièces.`,
        SixGameState.getInitialSlice(),
    ),
    DidacticialStep.fromMove(
        $localize`Victoires (ligne)`,
        $localize`Sur ce plateau, en plaçant votre pièce au bon endroit, vous alignez six de vos pièces, et gagnez la partie.<br/><br/>
        Trouvez la victoire, Vous jouez Foncé.`,
        SixGameState.fromRepresentation([
            [O, X, X, X, X, O],
            [_, O, X, _, O, _],
            [X, X, O, _, _, _],
            [_, _, O, _, _, _],
            [_, O, _, _, _, _],
            [O, _, _, _, _, _],
        ], 0),
        [SixMove.fromDrop(new Coord(3, 2))],
        $localize`Bravo !`,
        $localize`Raté !`,
    ),
    DidacticialStep.fromMove(
        $localize`Victoires (rond)`,
        $localize`Sur ce plateau, en plaçant votre pièce au bon endroit, vous dessinez un cercle avec 6 de vos pièces, et gagnez la partie.<br/><br/>
        Trouvez la victoire, Vous jouez Foncé.`,
        SixGameState.fromRepresentation([
            [_, _, _, X, _, _],
            [_, _, X, X, O, O],
            [_, X, _, O, X, _],
            [X, O, O, O, O, X],
        ], 0),
        [SixMove.fromDrop(new Coord(5, 2))],
        $localize`Bravo ! Notez que la présence ou non d'une pièce à l'intérieur du rond ne change rien.`,
        $localize`Raté !`,
    ),
    DidacticialStep.fromMove(
        $localize`Victoires (triangle)`,
        $localize`Sur ce plateau, en plaçant votre pièce au bon endroit, vous dessinez un triangle avec 6 de vos pièces, et gagnez la partie.<br/><br/>
        Trouvez la victoire, Vous jouez Foncé.`,
        SixGameState.fromRepresentation([
            [_, _, _, X, _, _],
            [_, O, X, O, O, O],
            [_, O, _, O, O, _],
            [X, X, X, _, X, _],
        ], 0),
        [SixMove.fromDrop(new Coord(3, 3))],
        $localize`Bravo !`,
        $localize`Raté !`,
    ),
    DidacticialStep.fromPredicate(
        $localize`Deuxième phase`,
        $localize`Quand après 40 tours, toutes vos pièces sont placées, on passe en deuxième phase.
        Il faut maintenant déplacer ses pièces, en prenant garde à ne pas enlever une pièce qui empêchait l'adversaire de gagner.
        Dorénavant, si après un déplacement un ou plusieurs groupe de pièce est déconnecté du plus grand groupe de pièce, ces petits groupes de pièces sont enlevés définitivement du jeu.<br/><br/>
        Vous jouez Foncé, effectuez un déplacement qui déconnecte une pièce de votre adversaire.`,
        SixGameState.fromRepresentation([
            [_, _, _, _, _, _, _, X, _],
            [_, _, _, _, _, _, O, _, _],
            [_, _, _, _, O, O, O, _, _],
            [_, _, _, _, X, X, _, X, O],
            [_, O, X, X, O, O, X, _, _],
            [O, O, O, O, X, X, X, _, _],
            [X, X, O, _, X, X, O, O, _],
            [_, O, _, O, O, _, _, _, _],
            [X, X, X, X, _, _, _, _, _],
            [_, O, _, _, _, _, _, _, _],
        ], 40),
        SixMove.fromDeplacement(new Coord(6, 1), new Coord(5, 1)),
        (move: SixMove, resultingState: SixGameState) => {
            if (new Coord(6, 1).equals(move.start.getOrNull()) &&
                resultingState.getPieceAt(new Coord(7, 0).getNext(resultingState.offset)) === Player.NONE)
            {
                return MGPValidation.SUCCESS;
            } else {
                return MGPValidation.failure(SixDidacticialMessages.MOVEMENT_NOT_DISCONNECTING);
            }
        },
        $localize`Bravo, vous avez fait perdre une pièce à votre adversaire et vous êtes rapproché potentiellement de la victoire !`,
    ),
    DidacticialStep.fromPredicate(
        $localize`Victoire par déconnection`,
        $localize`Lors de la seconde phase de jeu, en plus des victoires normales (ligne, rond, triangle), on peux gagner par déconnection.
        Si à un moment du jeu, l'un des deux joueurs n'a plus assez de pièce pour gagner (il en a donc moins de 6), la partie s'arrête.
        Celui qui a le plus de pièces a gagné, et en cas d'égalité, c'est match nul.<br/><br/>
        Ici, vous pouvez gagné (vous jouez Foncé). Faites le!`,
        SixGameState.fromRepresentation([
            [_, _, _, _, _, X],
            [_, _, _, _, O, X],
            [_, _, _, O, O, O],
            [_, _, O, _, X, _],
            [X, X, _, _, _, _],
            [O, X, _, _, _, _],
            [O, _, _, _, _, _],
        ], 40),
        SixMove.fromDeplacement(new Coord(2, 3), new Coord(6, 2)),
        (move: SixMove, _resultingState: SixGameState) => {
            if (new Coord(2, 3).equals(move.start.getOrNull())) {
                return MGPValidation.SUCCESS;
            } else {
                return MGPValidation.failure($localize`Ce mouvement ne déconnecte pas du jeu de pièces adverses ! Réessayez avec une autre pièce !`);
            }
        },
        $localize`Bravo, vous avez gagné !`,
    ),
    DidacticialStep.fromPredicate(
        $localize`Déconnection spéciale`,
        $localize`Lors d'une déconnection, de deux à plusieurs groupes peuvent faire la même taille,
        auquel cas, un clic en plus sera nécessaire pour indiquer lequel vous souhaitez garder.<br/><br/>
        Vous jouez Foncé, créer un mouvement de la sorte !`,
        SixGameState.fromRepresentation([
            [_, _, _, _, _, X],
            [_, _, _, _, O, X],
            [_, _, _, X, O, O],
            [O, _, O, _, _, X],
            [X, X, _, _, _, _],
            [O, O, _, _, _, _],
            [O, _, _, _, _, _],
        ], 40),
        SixMove.fromCut(new Coord(2, 3), new Coord(2, 5), new Coord(2, 5)),
        (move: SixMove, resultingState: SixGameState) => {
            if (move.keep.isAbsent()) {
                return MGPValidation.failure($localize`Ce mouvement n'as pas coupé le plateau en deux parties égales`);
            }
            if (new Coord(2, 3).equals(move.start.getOrNull())) {
                if (resultingState.getPieceAt(move.landing.getNext(resultingState.offset)) === Player.NONE) {
                    return MGPValidation.failure(`Raté ! Vous avez bien coupé le plateau en deux mais vous avez choisi de conserver la moitié ou vous êtes en minorité, vous avez donc perdu. Réessayez !`);
                } else {
                    return MGPValidation.SUCCESS;
                }
            } else {
                return MGPValidation.failure($localize`Ce mouvement ne déconnecte pas du jeu de pièces adverses ! Réessayez avec une autre pièce !`);
            }
        },
        $localize`Bravo, vous avez gagné !`,
    ),
];
