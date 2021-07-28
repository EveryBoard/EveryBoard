import { DvonnMove } from 'src/app/games/dvonn/DvonnMove';
import { DvonnGameState } from 'src/app/games/dvonn/DvonnGameState';
import { Coord } from 'src/app/jscaip/Coord';
import { DidacticialStep } from 'src/app/components/wrapper-components/didacticial-game-wrapper/DidacticialStep';
import { DvonnPieceStack } from 'src/app/games/dvonn/DvonnPieceStack';
import { Player } from 'src/app/jscaip/Player';
import { DvonnBoard } from 'src/app/games/dvonn/DvonnBoard';

const __: DvonnPieceStack = DvonnPieceStack.EMPTY;
const SO: DvonnPieceStack = DvonnPieceStack.SOURCE;
const O1: DvonnPieceStack = DvonnPieceStack.PLAYER_ZERO;
const X1: DvonnPieceStack = DvonnPieceStack.PLAYER_ONE;
const O4: DvonnPieceStack = new DvonnPieceStack(Player.ZERO, 4, false);
const X4: DvonnPieceStack = new DvonnPieceStack(Player.ONE, 4, false);

export const dvonnTutorial: DidacticialStep[] = [
    DidacticialStep.anyMove(
        $localize`Déplacement`,
        $localize`Au Dvonn, chaque case hexagonale comporte une pile de pièce.
        Si aucun nombre n'est indiqué sur une pile, c'est qu'elle ne comporte qu'une pièce.
        Le nombre écrit sur une pile correspond au nombre de pièces empilées et donc le nombre de point qu’elle rapporte à son propriétaire.
        Son propriétaire est celui dont une pièce est au sommet de la pile.
        Seul son propriétaire peut déplacer la pile.
        Il ne peut pas la déplacer si elle est entourée par 6 autres piles.
        Il la déplace d’autant de cases que sa hauteur, en ligne droite, et doit atterrir sur une case occupée.
        Cette ligne droite ne peut pas passer le long de l'arête de deux cases voisines, comme le ferait un déplacement vertical.
        Il y a donc six directions possibles.
        Le joueur avec les piles foncées commence.<br/><br/>
        Vous jouez avec Foncé, cliquez sur une pile puis déplacez la d'une case.`,
        DvonnGameState.getInitialSlice(),
        DvonnMove.of(new Coord(2, 0), new Coord(3, 0)),
        $localize`Bravo !`,
    ),
    DidacticialStep.fromMove(
        $localize`Déconnection`,
        $localize`Les pièces rouges sont appelées “sources”.
        Quand une pile n’est plus directement ou indirectement connectée à une source, elle est enlevée du plateau.<br/><br/>
        Vous jouez Foncé, déplacez votre pièce sur la source.`,
        new DvonnGameState(new DvonnBoard([
            [__, __, SO, __, __, __, __, __, __, __, __],
            [__, __, O1, __, __, __, __, __, __, __, __],
            [__, __, X4, __, __, __, __, X1, SO, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
        ]), 0, false),
        [DvonnMove.of(new Coord(2, 1), new Coord(2, 0))],
        $localize`Bravo, vous avez déconnecté 4 pièces de l’adversaire!
        Il a donc perdu 4 points.
        Les piles déconnectées cesseront d'être visibles au tour suivant.`,
        $localize`Mauvais choix! En le déplaçant sur la source vous déconnectiez l'adversaire et lui faisiez perdre ces 4 points.
        Ici, il gagne 2 à 0.`,
    ),
    DidacticialStep.fromMove(
        $localize`Fin de partie`,
        $localize`Quand plus aucun mouvement n’est possible, la partie est finie et le joueur avec le plus de points gagne.<br/><br/>
        Faites votre dernier mouvement!`,
        new DvonnGameState(new DvonnBoard([
            [__, __, SO, __, __, __, __, __, __, __, __],
            [__, __, O1, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, SO, O4, __],
            [__, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
        ]), 0, false),
        [DvonnMove.of(new Coord(2, 1), new Coord(2, 0))],
        $localize`Bravo, vous avez même gagné (6 - 0)`,
        $localize`Mauvaise idée, en la déplaçant sur la source, vous auriez gagné votre pièce et gagné un point.`,
    ),
];
