/* eslint-disable max-len */
import { DvonnMove } from 'src/app/games/dvonn/dvonn-move/DvonnMove';
import { DvonnPartSlice } from 'src/app/games/dvonn/DvonnPartSlice';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { DidacticialStep } from 'src/app/components/wrapper-components/didacticial-game-wrapper/DidacticialStep';
import { DvonnPieceStack } from 'src/app/games/dvonn/dvonn-piece-stack/DvonnPieceStack';
import { Player } from 'src/app/jscaip/player/Player';
import { DvonnBoard } from 'src/app/games/dvonn/DvonnBoard';

const __: DvonnPieceStack = DvonnPieceStack.EMPTY;
const SO: DvonnPieceStack = DvonnPieceStack.SOURCE;
const O1: DvonnPieceStack = DvonnPieceStack.PLAYER_ZERO;
const X1: DvonnPieceStack = DvonnPieceStack.PLAYER_ONE;
const O4: DvonnPieceStack = new DvonnPieceStack(Player.ZERO, 4, false);
const X4: DvonnPieceStack = new DvonnPieceStack(Player.ONE, 4, false);

export const dvonnDidacticial: DidacticialStep[] = [
    DidacticialStep.anyMove(
        'Déplacement',
        `Au Dvonn, ce que vous voyez sont des piles de pièces.
         Le numéro écrit dessus est la hauteur de la pile et le nombre de points qu’elle rapporte à son propriétaire.
         Si aucun nombre n'est indiqué sur une pile, c'est qu'elle ne comporte qu'une pièce.
         Son propriétaire est celui dont une pièce est au sommet de la pile.
         Seul son propriétaire peut la déplacer.
         Elle ne peut pas se déplacer si elle est entourée par 6 autres piles.
         Elle se déplace d’autant de cases que sa hauteur en ligne droite, et doit aterrir sur une case occupée.
         Cette ligne droite doit passer par le centre des autres piles, comme la ligne horizontale,
         et pas le long d'un arête, comme le serait un déplacement vertical.
         Il y a donc six directions possibles.
         Le joueur avec les piles foncées commence.
         Vous jouez avec Foncé, cliquez sur une pile puis déplacez la d'une case.`,
        DvonnPartSlice.getInitialSlice(),
        'Bravo.',
    ),
    DidacticialStep.forMove(
        'Déconnection',
        `Les pièces rouges sont appelées “sources”.
         Quand une pile n’est plus directement ou indirectement connectée à une source, elle est enlevée du plateau.
         Vous jouez Foncé, déplacez votre pièce sur la source.`,
        new DvonnPartSlice(new DvonnBoard([
            [__, __, SO, __, __, __, __, __, __, __, __],
            [__, __, O1, __, __, __, __, __, __, __, __],
            [__, __, X4, __, __, __, __, X1, SO, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
        ]), 0, false),
        [DvonnMove.of(new Coord(2, 1), new Coord(2, 0))],
        'Bravo, vous avez déconnecté 4 pièces de l’adversaire! Il a donc perdu 4 points.',
        `Mauvais choix! En le déplaçant sur la source vous déconnectiez l'adversaire et lui faisiez perdre ces 4 points. Ici, il gagne 2 à 0.`,
    ),
    DidacticialStep.forMove(
        'Fin de partie',
        `Quand plus aucun mouvement n’est possible, la partie est finie et le joueur avec le plus de points gagne.
         Faites votre dernier mouvement!`,
        new DvonnPartSlice(new DvonnBoard([
            [__, __, SO, __, __, __, __, __, __, __, __],
            [__, __, O1, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, SO, O4, __],
            [__, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
        ]), 0, false),
        [DvonnMove.of(new Coord(2, 1), new Coord(2, 0))],
        'Bravo, vous avez même gagné (6 - 0)',
        'Mauvaise idée, en la déplaçant sur la source, vous auriez gagné votre pièce et gagné un point.',
    ),
];
