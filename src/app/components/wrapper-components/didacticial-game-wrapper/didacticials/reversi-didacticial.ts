/* eslint-disable max-len */
import { ReversiMove } from 'src/app/games/reversi/reversi-move/ReversiMove';
import { ReversiPartSlice } from 'src/app/games/reversi/ReversiPartSlice';
import { Player } from 'src/app/jscaip/player/Player';
import { DidacticialStep } from '../DidacticialStep';

const _: number = Player.NONE.value;
const O: number = Player.ZERO.value;
const X: number = Player.ONE.value;
export const reversiDidacticial: DidacticialStep[] = [
    DidacticialStep.informational(
        'But du jeu',
        `Les pièces du Reversi sont double face, une face foncée pour le premier joueur, une face claire pour le deuxième.
         Quand une pièce est retournée, elle change de propriétaire.
         Le joueur possédant le plus de pièces en fin de partie gagne.
         Ici, le joueur foncé a 28 points et le joueur clair en a 36, le joueur clair a donc gagné.`,
        new ReversiPartSlice([
            [O, O, O, O, O, O, O, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, O, O, O, O, O, O, O],
        ], 60),
    ),
    DidacticialStep.forMove(
        'Capture (1/2)',
        `Au début de la partie, voici la configuration des pièces, pour qu'un coup soit légal il faut qu'il prenne en sandwich minimum une pièce adverse entre la pièce que vous posez et une de vos pièces.`,
        ReversiPartSlice.getInitialSlice(),
        [new ReversiMove(2, 4), new ReversiMove(3, 5), new ReversiMove(4, 2), new ReversiMove(5, 3)],
        'Bravo',
        null,
    ),
    DidacticialStep.forMove(
        'Capture (2/2)',
        'Un mouvement peut également capturer une plus grande ligne, et plusieurs lignes à la fois. Jouez en bas à gauche.',
        new ReversiPartSlice([
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, X, _, _, _],
            [_, _, _, O, _, _, _, _],
            [_, _, O, _, _, _, _, _],
            [O, O, _, _, _, _, _, _],
            [_, O, X, O, X, O, _, _],
        ], 1),
        [new ReversiMove(0, 7)],
        'Bravo',
        'Un peu plus en bas et un peu plus à gauche, s\'il vous plai.',
    ),
    DidacticialStep.informational(
        'Passer son tour',
        `Si, à son tour de jeu, un joueur n'as aucun mouvement lui permettant de capturer une pièce, il est obligé de passer son tour.
         Si d'aventure le joueur suivant ne savais pas jouer non plus, la partie terminerait avant que la plateau soit rempli, et les points seraient décomptés de la même façon.`,
        new ReversiPartSlice([
            [X, O, O, O, O, O, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [X, X, X, X, X, X, _, _],
            [O, O, O, O, O, O, _, _],
        ], 60),
    ),
];
