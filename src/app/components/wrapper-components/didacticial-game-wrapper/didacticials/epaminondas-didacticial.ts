import { EpaminondasMove } from 'src/app/games/epaminondas/epaminondas-move/EpaminondasMove';
import { EpaminondasPartSlice } from 'src/app/games/epaminondas/epaminondas-part-slice/EpaminondasPartSlice';
import { Direction } from 'src/app/jscaip/DIRECTION';
import { Player } from 'src/app/jscaip/player/Player';
import { DidacticialStep } from '../DidacticialStep';

const _: number = Player.NONE.value;
const O: number = Player.ZERO.value;
const X: number = Player.ONE.value;
export const epaminondasDidacticial: DidacticialStep[] = [
    new DidacticialStep(
        'But du jeu (1/2)',
        'Si au début de son tour de jeu, un joueur a plus de pièces sur la ligne de départ de l\'adversaire que l\'adversaire n\'en a sur la ligne de départ du joueur, ce joueur gagne. Ici, c\'est au tour du joueur noir de jouer, il a donc gagné.',
        new EpaminondasPartSlice([
            [_, _, _, _, _, O, _, _, _, _, X, X, X, X],
            [_, _, _, _, _, O, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, X, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, O, O, O, O, O, O, O],
        ], 0),
        [], [], null, null,
    ),
    new DidacticialStep(
        'But du jeu (2/2)',
        'Dans ce cas ci, c\'est au tour du joueur blanc, et celui-ci gagne, car il a deux pièces sur la ligne de départ du joueur noir, et noir n\'en a qu\'une sur la ligne de départ du joueur blanc.',
        new EpaminondasPartSlice([
            [_, _, _, _, _, O, _, _, _, _, X, X, X, X],
            [_, _, _, _, _, O, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, X, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, X, X, _, _, _, O, O, _, O, O, O, O],
        ], 1),
        [], [], null, null,
    ),
    new DidacticialStep(
        'Déplacement simple',
        'Voici le plateau de départ, c\'est au joueur noir de commencer, commençons simplement par un déplacement d\'une seule pièce, cliquez la pièce sur la colonne la plus à gauche et sur la deuxième rangée en commençant par le bas, puis cliquez une case plus haut',
        EpaminondasPartSlice.getInitialSlice(),
        [new EpaminondasMove(0, 10, 1, 1, Direction.UP)],
        [],
        'Voilà, rien de bien compliqué',
        'Raté, recommencez.',
    ),
    new DidacticialStep(
        'Déplacement compliqué',
        'Maintenant, pour déplacer plusieurs pièces sur une seule ligne (une phalange), cliquez sur la première pièce (la plus en bas à gauche) puis sur la dernière pièce de la phalange (celle juste au dessus pour l\'exemple), puis une ou deux cases plus haut, pour déplacer toute la phalange de deux cases, soit de la distance maximale possible qui vaut le nombre de pièce déplacées.',
        EpaminondasPartSlice.getInitialSlice(),
        [new EpaminondasMove(0, 11, 2, 1, Direction.UP), new EpaminondasMove(0, 11, 2, 2, Direction.UP)],
        [],
        'Bravo, les pièces déplacées doivent être horizontalement, verticalement, ou diagonalement alignées, et le déplacement doit se faire le long de cette ligne, en avant ou en arrière, il ne peut y avoir ni ennemis ni trous dans la phalange.',
        'Raté',
    ),
    new DidacticialStep(
        'Capture',
        'Pour capturer une phalange ennemie, il faut que celle-ci soit alignée avec la phalange en déplacement, qu\'elle soit plus courte, et que la première pièce de votre phalange aterrisse sur la première pièce de la phalange capturée. Capturez la phalange.',
        new EpaminondasPartSlice([
            [_, _, _, _, _, _, _, _, X, X, X, X, X, X],
            [_, _, _, X, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, X, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, O, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, O, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, O, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, X, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, O, O, O, O, O, O, O],
        ], 0),
        [new EpaminondasMove(3, 7, 3, 3, Direction.UP)],
        [],
        'Bravo, vous avez réussi.',
        'Raté, vous n\'avez pas capturé la phalange.',
    ),
];
