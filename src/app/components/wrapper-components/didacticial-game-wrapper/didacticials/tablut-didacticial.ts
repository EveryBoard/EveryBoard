import { TablutMove } from 'src/app/games/tablut/tablut-move/TablutMove';
import { TablutCase } from 'src/app/games/tablut/tablut-rules/TablutCase';
import { TablutPartSlice } from 'src/app/games/tablut/TablutPartSlice';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { DidacticialStep } from '../DidacticialStep';

const _: number = TablutCase.UNOCCUPIED.value;
const x: number = TablutCase.INVADERS.value;
const i: number = TablutCase.DEFENDERS.value;
const A: number = TablutCase.PLAYER_ONE_KING.value;

export const tablutDidacticial: DidacticialStep[] = [
    DidacticialStep.informational(
        'But du jeu',
        `Le Tablut est un jeu de stratégie auquel jouaient les Vikings.
         Le but du jeu pour les deux joueurs n'est pas le même.
         L'attaquant joue en premier, ses pièces sont placées proches des bords.
         Son but est de capturer le roi, qui est tout au centre du plateau.
         Le défenseur joue en deuxième, ses pièces sont au centre.
         Son but est de placer le roi sur l'un des 4 trônes situés dans les coins.
         Note, la case où est le roi au début du jeu, au centre du plateau, est également un trône.`,
        TablutPartSlice.getInitialSlice(),
    ),
    DidacticialStep.anyMove(
        'Déplacement',
        `Au Tablut, toutes les pièces se déplacent de la même façon.
         De façon équivalente aux tours aux échecs, une pièce se déplace:
        1. D'autant de case qu'elle veut.
        2. Sans passer à travers ou s'arrêter sur une autre pièce.
        3. Horizontalement ou verticalement.
        4. Seul le roi peut s'arrêter sur un trône.
        Pour déplacer une pièce, cliquer dessus, puis sur sa destination.`,
        TablutPartSlice.getInitialSlice(),
        'Bravo',
    ),
    DidacticialStep.forMove(
        'Comment capturer un simple soldat (1/2)',
        `Toutes les pièces, attaquantes comme défenseur, sont des soldats, à l'exception du roi.
         Pour les capturer, il faut en prendre une en sandwich entre deux de vos soldats.
         En s'approchant trop, un pion de l'envahisseur s'est mis en danger.
         Capturez-le.`,
        new TablutPartSlice([
            [_, _, _, x, x, x, _, _, _],
            [_, _, _, _, x, _, _, _, _],
            [_, _, _, _, i, _, _, _, _],
            [_, _, _, x, i, _, _, _, x],
            [x, x, i, i, A, i, i, x, x],
            [_, _, _, _, i, _, _, _, x],
            [_, _, _, _, i, _, _, _, _],
            [_, _, _, _, x, _, _, _, _],
            [_, _, _, x, x, x, _, _, _],
        ], 1),
        [
            new TablutMove(new Coord(2, 4), new Coord(2, 3)),
            new TablutMove(new Coord(4, 2), new Coord(3, 2)),
        ],
        'Bravo, ça lui apprendra!',
        'Raté, vous avez raté l\'occasion de capturer un adversaire',
    ),
    DidacticialStep.forMove(
        'Comment capturer un simple soldat (2/2)',
        `Un deuxième moyen de capturer un soldat, est contre un trône vide.
         Le Roi a quitté son poste, et mis en danger un de ses soldats.
         Capturez le.`,
        new TablutPartSlice([
            [_, _, _, x, x, x, _, _, _],
            [_, _, _, _, x, _, _, _, _],
            [_, _, _, _, i, _, _, _, _],
            [_, _, i, _, A, _, i, _, x],
            [x, x, _, i, _, i, i, x, x],
            [_, _, _, _, i, _, _, _, x],
            [_, _, _, _, i, _, _, _, _],
            [_, _, _, _, x, _, _, _, _],
            [_, _, _, x, x, x, _, _, _],
        ], 12),
        [new TablutMove(new Coord(1, 4), new Coord(2, 4))],
        'Bravo, un de plus en moins, mais gardez quand même un oeil sur le roi, c\'est le plus important.',
        'Raté, vous n\'avez pas fait le mouvement demandé',
    ),
    DidacticialStep.forMove(
        'Comment capturer le roi (1/2)',
        `Pour capturer le roi, deux soldats ne sont pas suffisant, il en faut plus.
         Pour la première solution, il faut simplement que les 4 cases voisines (horizontalement et verticalement) soient occupées par vos soldats.`,
        new TablutPartSlice([
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, x, _, _, _, _, _, _, _],
            [x, A, _, x, _, _, _, _, _],
            [_, x, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ], 72),
        [new TablutMove(new Coord(3, 4), new Coord(2, 4))],
        'Bravo, vous avez gagné la partie.',
        'Raté, vous avez laissé fuir le roi.',
    ),
    DidacticialStep.forMove(
        'Comment capturer le roi (2/2)',
        `Un autre moyen de capturer le roi est de l'immobiliser à 3 contre un bord.
         Note, un roi n'est pas capturable sur une case voisine à un trône.`,
        new TablutPartSlice([
            [_, _, x, A, x, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, x, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ], 72),
        [new TablutMove(new Coord(4, 4), new Coord(4, 1))],
        'Le Roi est mort, longue vie au Roi. Bravo, vous avez gagné la partie.',
        'Raté.',
    ),
];
