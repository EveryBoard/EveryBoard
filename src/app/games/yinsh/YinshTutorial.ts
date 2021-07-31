import { DidacticialStep } from 'src/app/components/wrapper-components/didacticial-game-wrapper/DidacticialStep';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { YinshBoard } from './YinshBoard';
import { YinshGameState } from './YinshGameState';
import { YinshCapture, YinshMove } from './YinshMove';
import { YinshPiece } from './YinshPiece';

const _: YinshPiece = YinshPiece.EMPTY;
const a: YinshPiece = YinshPiece.MARKER_ZERO;
const A: YinshPiece = YinshPiece.RING_ZERO;
const b: YinshPiece = YinshPiece.MARKER_ONE;
const B: YinshPiece = YinshPiece.RING_ONE;

export const yinshTutorial: DidacticialStep[] = [
    DidacticialStep.informational(
        $localize`But du jeu`,
        $localize`Le but du jeu à Yinsh est de capturer trois anneaux en tout.
         Le nombre d'anneaux capturés est indiqué en haut à gauche pour le joueur foncé,
         et en bas à droite pour le joueur clair. Ici, Foncé a gagné la partie.
         Notez que sur le plateau vous avez deux types des pièces pour chaque joueur:
         des anneaux (pièces creuses) et des marqueurs (pièces entières).`,
        new YinshGameState(YinshBoard.of([
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, B, a, _, _, _, _, _, _, _],
            [_, _, _, a, _, B, _, b, _, _, _],
            [_, _, A, b, _, _, B, a, _, _, _],
            [_, _, _, a, b, _, _, _, _, _, _],
            [_, _, _, a, _, _, _, B, _, _, _],
            [_, _, _, b, a, A, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ]), [3, 1], 20),
    ),
    DidacticialStep.anyMove(
        $localize`Plateau initial et phase de placement`,
        $localize`Le plateau initial est vide.
        Au début de la partie, chaque joueur place à son tour un de ses anneaux.
        Cette phase s'arrête lorsque que tous les anneaux ont été placés.
        Placez un de vos anneaux en cliquant sur la case du plateau où vous désirez le placer.`,
        new YinshGameState(YinshBoard.EMPTY, [5, 5], 0),
        new YinshMove([], new Coord(5, 5), MGPOptional.empty(), []),
        $localize`Bravo !`),
    DidacticialStep.anyMove(
        $localize`Placer un marqueur`,
        $localize`Une fois la phase initiale terminée et tous vos anneaux présents sur le plateau, il vous faut placer des marqueurs sur le plateau.
        Pour ce faire, placez un marqueur dans un de vos anneaux en cliquant sur cet anneau.
        Ensuite, l'anneau doit se déplacer en ligne droite dans n'importe quelle direction.
        Un anneau ne peut pas lors de son mouvement passer à travers d'autres anneaux.
        Si vous passez au dessus d'un groupe de marqueurs, votre mouvement doit s'arrêter au premier espace vide qui suit ce groupe.
        Tous les marqueurs du groupe sont alors retournés et changent de couleur.
        Vous jouez foncé, effectuez un mouvement.`,
        new YinshGameState(YinshBoard.of([
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, B, B, _, _, _, _, _, _, _],
            [_, _, _, _, _, B, _, _, _, _, _],
            [_, _, A, b, _, _, B, _, _, _, _],
            [_, _, _, b, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, B, _, _, _],
            [_, _, _, _, _, A, _, _, _, _, _],
            [_, _, _, A, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ]), [0, 0], 20),
        new YinshMove([], new Coord(2, 4), MGPOptional.of(new Coord(4, 4)), []),
        $localize`Bravo !`),
    DidacticialStep.fromMove(
        $localize`Récupérer un anneau en alignant 5 marqueurs`,
        $localize`Finalement, la seule mécanique qu'il vous manque est de pouvoir récupérer des anneaux afin de marquer des points.
        Pour cela, il faut que vous alignez 5 marqueurs à votre couleur.
        Vous pouvez alors récupérer ces marqueurs en cliquant dessus, et ensuite récupérer un de vos anneaux en cliquant dessus.
        Vous avez alors un point de plus.
        Vous êtes obligés d'effectuer une capture quand elle se présente.
        Vous jouez foncé, effectuez une capture !`,
        new YinshGameState(YinshBoard.of([
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, B, B, _, _, _, _, _, _, _],
            [_, _, _, _, _, B, _, _, _, _, _],
            [_, _, a, a, A, b, b, _, _, _, _],
            [_, _, _, B, _, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, B, _, _, _],
            [_, _, _, _, _, A, _, _, _, _, _],
            [_, _, _, A, _, _, _, A, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ]), [0, 0], 20),
        [new Coord(7, 4), new Coord(4, 6), new Coord(5, 7), new Coord(3, 8), new Coord(7, 8)].map((ringTaken: Coord) =>
            new YinshMove([], new Coord(4, 4), MGPOptional.of(new Coord(7, 4)),
                          [YinshCapture.of(new Coord(2, 4), new Coord(6, 4), ringTaken)])),
        $localize`Bravo !`,
        $localize`Raté ! Vous devez aligner 5 marqueurs pour pouvoir les récupérer et prendre un anneau par la même occasion.`),
];
