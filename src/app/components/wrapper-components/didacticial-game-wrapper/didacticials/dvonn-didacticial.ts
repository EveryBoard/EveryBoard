/* eslint-disable max-len */
import { DvonnMove } from 'src/app/games/dvonn/dvonn-move/DvonnMove';
import { DvonnPartSlice } from 'src/app/games/dvonn/DvonnPartSlice';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { DidacticialStep } from 'src/app/components/wrapper-components/didacticial-game-wrapper/DidacticialStep';
import { DvonnPieceStack } from 'src/app/games/dvonn/dvonn-piece-stack/DvonnPieceStack';
import { Player } from 'src/app/jscaip/player/Player';

const __: number = DvonnPieceStack.EMPTY.getValue();

const SO: number = DvonnPieceStack.SOURCE.getValue();

const O1: number = DvonnPieceStack.PLAYER_ZERO.getValue();

const X1 : number = DvonnPieceStack.PLAYER_ONE.getValue();

const O4: number = new DvonnPieceStack(Player.ZERO, 4, false).getValue();

const X4: number = new DvonnPieceStack(Player.ONE, 4, false).getValue();

export const dvonnDidacticial: DidacticialStep[] = [
    DidacticialStep.anyMove(
        'Déplacement',
        `Au Dvonn, chaques cases hexagonales comportent une pile de pièce.
         Si aucun nombre n'est indiqué sur une pile, c'est qu'elle ne comporte qu'une pièce.
         Le nombre écrit sur une pile correspond au nombre de pièces empilées et donc le nombre de point qu’elle rapporte à son propriétaire.
         Son propriétaire est celui dont une pièce est au sommet de la pile.
         Seul son propriétaire peut déplacer la pile.
         Il ne peut pas la déplacer si elle est entourée par 6 autres piles.
         Il la déplace d’autant de cases que sa hauteur, en ligne droite, et doit aterrir sur une case occupée.
         Cette ligne droite ne peut pas passer le long de l'arête de deux cases voisines, comme le ferait un déplacement vertical.
         Il y a donc six directions possibles.
         Le joueur avec les piles foncées commence.
         Vous jouez avec Foncé, cliquez sur une pile puis déplacez la d'une case.`,
        DvonnPartSlice.getInitialSlice(),
        'Bravo.',
    ),
    DidacticialStep.fromMove(
        'Déconnection',
        `Les pièces rouges sont appelées “sources”.
         Quand une pile n’est plus directement ou indirectement connectée à une source, elle est enlevée du plateau.
         Vous jouez Foncé, déplacez votre pièce sur la source.`,
        new DvonnPartSlice([
            [__, __, SO, __, __, __, __, __, __, __, __],
            [__, __, O1, __, __, __, __, __, __, __, __],
            [__, __, X4, __, __, __, __, X1, SO, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
        ], 0, false),
        [DvonnMove.of(new Coord(2, 1), new Coord(2, 0))],
        `Bravo, vous avez déconnecté 4 pièces de l’adversaire!
         Il a donc perdu 4 points.
         Les piles déconnectées cesseront d'être visibles au tour suivant.`,
        `Mauvais choix! En le déplaçant sur la source vous déconnectiez l'adversaire et lui faisiez perdre ces 4 points. Ici, il gagne 2 à 0.`,
    ),
    DidacticialStep.fromMove(
        'Fin de partie',
        `Quand plus aucun mouvement n’est possible, la partie est finie et le joueur avec le plus de points gagne.
         Faites votre dernier mouvement!`,
        new DvonnPartSlice([
            [__, __, SO, __, __, __, __, __, __, __, __],
            [__, __, O1, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, SO, O4, __],
            [__, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
        ], 0, false),
        [DvonnMove.of(new Coord(2, 1), new Coord(2, 0))],
        'Bravo, vous avez même gagné (6 - 0)',
        'Mauvaise idée, en la déplaçant sur la source, vous auriez gagné votre pièce et gagné un point.',
    ),
];
