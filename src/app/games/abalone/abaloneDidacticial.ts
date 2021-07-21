import { DidacticialStep } from 'src/app/components/wrapper-components/didacticial-game-wrapper/DidacticialStep';
import { Coord } from 'src/app/jscaip/Coord';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { AbaloneGameState } from './AbaloneGameState';
import { AbaloneMove } from './AbaloneMove';

export const abaloneDidacticial: DidacticialStep[] = [
    DidacticialStep.informational(
        $localize`Plateau|Board`,
        $localize`À l'Abalone, le but du jeu est d'être le premier joueur à pousser 6 pièces adverses en dehors du plateau. Voyons voir comment!
        In Abalone, the aim of the game is to be the first player to push 6 opponent's piece outside the board.`,
        AbaloneGameState.getInitialSlice(),
    ),
    DidacticialStep.anyMove(
        $localize`Déplacement|Moving`,
        $localize`Chaque tour, déplacez une, deux ou trois pièces, soit le long de leur alignement, soit en un pas de côté.
        Pour vos déplacement vous avez donc au maximum à choisir parmis 6 directions.
        Les trois pièces à déplacer doivent être alignées et immédiatement voisines et atterrir sur des cases vides (sauf pour pousser, ce que nous verrons plus tard).
        Pour effectuer un déplacement, cliquez sur une de vos pièces, puis cliquez sur une flèche pour en choisissez sa direction.
        Vous jouez Foncé, allez-y.
        Each turn, move one, two, or three pieces, either in the direction their aligned, either by doing a side step.
        For your moves, you have up to six choices of direction.
        The three moving pieces must be aligned and immediately neighboors, and land on empty cases (except for pushes, which we'll cover later).
        To do a move, click on one of your pieces, then click on an arrows to choose its direction.`,
        AbaloneGameState.getInitialSlice(),
        AbaloneMove.fromSingleCoord(new Coord(2, 6), HexaDirection.UP),
        $localize`Bravo!`,
    ),
];
