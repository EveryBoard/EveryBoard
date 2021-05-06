/* eslint-disable max-len */
import { SixGameState } from 'src/app/games/six/SixGameState';
import { SixMove } from 'src/app/games/six/SixMove';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { DidacticialStep } from '../DidacticialStep';

const _: number = Player.NONE.value;
const O: number = Player.ZERO.value;
const X: number = Player.ONE.value;

export const sixDidacticial: DidacticialStep[] = [

    DidacticialStep.informational(
        'Six',
        `Le six est une jeu sans plateau, où les pièces sont placées les unes à côtés des autres, en un bloc discontinu.
         Chaque joueur a 21 pièces à lui, 2 étant déjà placée sur le plateau.
         Le but principal du jeu est de former l'une des trois formes gagnantes avec vos pièces.`,
        SixGameState.getInitialSlice(),
    ),
    DidacticialStep.fromMove(
        'Victoires (ligne)',
        `Sur ce plateau, en plaçant votre pièce au bon endroit, vous alignez six de vos pièces, et gagnez la partie.
         Vous jouez le joueur foncé.`,
        SixGameState.fromRepresentation([
            [O, X, X, X, X, O],
            [_, O, X, _, O, _],
            [X, X, O, _, _, _],
            [_, _, O, _, _, _],
            [_, O, _, _, _, _],
            [O, _, _, _, _, _],
        ], 0),
        [SixMove.fromDrop(new Coord(3, 2))],
        'Bravo!',
        'Raté!',
    ),
    DidacticialStep.fromMove(
        'Victoires (rond)',
        `Sur ce plateau, en plaçant votre pièce au bon endroit, vous dessinez un cercle avec vos 6 de pièces, et gagnez la partie.`,
        SixGameState.fromRepresentation([
            [_, _, _, X, _, _],
            [_, _, X, X, O, O],
            [_, X, _, O, X, _],
            [X, O, O, O, O, X],
        ], 0),
        [SixMove.fromDrop(new Coord(5, 2))],
        `Bravo! Notez que la présence ou non d'une pièce à l'intérieur du rond ne change rien.`,
        'Raté!',
    ),
    DidacticialStep.fromMove(
        'Victoires (triangle)',
        `Sur ce plateau, en plaçant votre pièce au bon endroit, vous dessinez un cercle avec vos 6 de pièces, et gagnez la partie.`,
        SixGameState.fromRepresentation([
            [_, _, _, X, _, _],
            [_, O, X, O, O, O],
            [_, O, _, O, O, _],
            [X, X, X, _, X, _],
        ], 0),
        [SixMove.fromDrop(new Coord(3, 3))],
        `Bravo!`,
        'Raté!',
    ),
    DidacticialStep.informational(
        'Deuxième phase',
        `Quand après 40 tours, toutes vos pièces sont placées, on passe en deuxième phase.
         Il faut maintenant déplacer ses pièces, en prenant garde à ne pas enlever une pièce qui empêchait l'adversaire de gagner.
         Dorénavant, si après un déplacement un ou plusieurs groupe de pièce est déconnecté du plus grand groupe de pièce, ces petits groupes de pièces sont enlevés définitivement du jeu.
         Dès qu'au moins un joueur tombe en dessous des 6 pièces, la partie est finie et le joueur qui a le moins de pièces perds.
         `,
        SixGameState.fromRepresentation([
            [_, _, _, _, _, _, _, X, _, _],
            [_, _, _, _, X, X, O, _, _, O],
            [_, _, _, _, O, O, O, O, X, _],
            [_, _, _, _, X, X, _, X, O, _],
            [_, O, X, X, O, O, X, _, _, _],
            [O, O, O, O, X, X, X, _, _, _],
            [X, X, O, _, X, X, O, O, _, _],
            [_, O, _, O, O, _, _, _, _, _],
            [X, X, X, X, _, _, _, _, _, _],
            [_, O, _, _, _, _, _, _, _, _],
        ], 40),
    ),
];
