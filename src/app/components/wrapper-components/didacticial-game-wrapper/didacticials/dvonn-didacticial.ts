/* eslint-disable max-len */
import { DvonnMove } from 'src/app/games/dvonn/dvonn-move/DvonnMove';
import { DvonnPartSlice } from 'src/app/games/dvonn/DvonnPartSlice';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { DidacticialStep } from 'src/app/components/wrapper-components/didacticial-game-wrapper/DidacticialStep';
import { DvonnPieceStack } from 'src/app/games/dvonn/dvonn-piece-stack/DvonnPieceStack';
import { DvonnPiece } from 'src/app/games/dvonn/DvonnPiece';

const _: number = DvonnPieceStack.EMPTY.getValue();

const D: number = DvonnPieceStack.SOURCE.getValue();

const W: number = DvonnPieceStack.PLAYER_ZERO.getValue();

const W4: number = new DvonnPieceStack([
    DvonnPiece.PLAYER_ZERO,
    DvonnPiece.PLAYER_ZERO,
    DvonnPiece.PLAYER_ZERO,
    DvonnPiece.PLAYER_ZERO]).getValue();

const B : number = DvonnPieceStack.PLAYER_ONE.getValue();

export const dvonnDidacticial: DidacticialStep[] = [
    new DidacticialStep(
        'Déplacement',
        'Au Dvonn, ce que vous voyez sont les tours. Le numéro écrit dessus est la hauteur de la tour et le nombre de points qu’elle rapporte à son propriétaire. Son propriétaire est celui dont une pièce est au sommet de la tour. Seul son propriétaire peut la déplacer. Elle ne peut pas se déplacer si elle est entourée par 6 autres pièces. Elle se déplace d’autant de cases que sa hauteur en ligne droite. Cliquez sur la tour la plus à droite, et déplacez la d\'une case en haut à gauche.',
        DvonnPartSlice.getInitialSlice(),
        [DvonnMove.of(new Coord(10, 2), new Coord(10, 1))],
        [],
        'Bravo. Vous avez gagné un point et l’adversaire en a perdu un.',
        'Raté.',
    ),
    new DidacticialStep(
        'Déconnection',
        'Les pièces rouges sont appelées “sources”. Quand une tour n’est plus directement ou indirectement connectée à une source, elle est enlevée du plateau. Déplacez votre pièce pour voir.',
        new DvonnPartSlice([
            [_, _, D, _, _, _, _, _, _, _, _],
            [_, _, W, _, _, _, _, _, _, _, _],
            [_, _, B, _, _, _, _, B, D, _, _],
            [_, _, W4, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ], 0, false),
        [DvonnMove.of(new Coord(2, 1), new Coord(2, 0))],
        [],
        'Voilà, tous ses pions là sont perdus, les votre et ceux de l’adversaire!',
        'Raté.',
    ),
    new DidacticialStep(
        'Fin de partie',
        'Quand plus aucun mouvement n’est possible, la partie est finie et le joueur avec le plus de points gagne. Faites votre dernier mouvement!',
        new DvonnPartSlice([
            [_, _, D, _, _, _, _, _, _, _, _],
            [_, _, W, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, D, W4, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ], 0, false),
        [DvonnMove.of(new Coord(2, 1), new Coord(2, 0))],
        [],
        'Bravo, vous avez même gagné (6 - 0)',
        'Mauvais idée, en la déplaçant sur la source, vous auriez gagné votre pièce et gagné un point.',
    ),
];
