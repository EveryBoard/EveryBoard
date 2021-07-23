import { DidacticialStep } from 'src/app/components/wrapper-components/didacticial-game-wrapper/DidacticialStep';
import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { AbaloneGameState } from './AbaloneGameState';
import { AbaloneMove } from './AbaloneMove';

const _: number = FourStatePiece.EMPTY.value;
const N: number = FourStatePiece.NONE.value;
const O: number = FourStatePiece.ZERO.value;
const X: number = FourStatePiece.ONE.value;

export const abaloneDidacticial: DidacticialStep[] = [
    DidacticialStep.informational(
        $localize`Plateau initial`,
        $localize`À l'Abalone, le but du jeu est d'être le premier joueur à pousser 6 pièces adverses en dehors du plateau. Voyons voir comment!`,
        AbaloneGameState.getInitialSlice(),
    ),
    DidacticialStep.anyMove(
        $localize`Déplacer une pièce`,
        $localize`Chaque tour, déplacez une, deux ou trois pièces, soit le long de leur alignement, soit par un pas de côté.
        Pour vos déplacement vous avez donc au maximum à choisir parmis 6 directions.
        Les trois pièces à déplacer doivent être alignées et immédiatement voisines et atterrir sur des cases vides (sauf pour pousser, ce que nous verrons plus tard).
        Pour effectuer un déplacement, cliquez sur une de vos pièces, puis cliquez sur une flèche pour choisir sa direction.
        Vous jouez Foncé, faites n'importe quel movement!`,
        AbaloneGameState.getInitialSlice(),
        AbaloneMove.fromSingleCoord(new Coord(2, 6), HexaDirection.UP),
        $localize`Bravo!`,
    ),
    DidacticialStep.fromMove(
        $localize`Pousser`,
        $localize`Pour pousser une pièce, vous devez déplacer au moins deux de vos pièces.
        Pour pousser deux pièces, vous devez déplacer trois de vos pièces.
        Si une de vos pièces bloque la poussée, celle-ci sera impossible`,
        new AbaloneGameState([
            [N, N, N, N, _, O, O, X, X],
            [N, N, N, _, _, _, _, _, _],
            [N, N, _, O, O, O, X, O, _],
            [N, _, _, _, _, _, _, _, _],
            [_, _, _, _, O, O, O, X, X],
            [_, _, _, _, _, _, _, _, N],
            [_, _, _, _, O, X, _, N, N],
            [_, _, _, O, _, _, N, N, N],
            [_, _, O, _, _, N, N, N, N],
        ], 0),
        [AbaloneMove.fromSingleCoord(new Coord(4, 4), HexaDirection.DOWN_RIGHT)],
        $localize`Bravo !`,
        $localize`Raté !`,
    ),
];
