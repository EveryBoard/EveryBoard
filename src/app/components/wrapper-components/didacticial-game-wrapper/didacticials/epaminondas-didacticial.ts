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
        'Plateau de départ',
        `Ceci est le plateau de départ.
         La ligne tout en haut est la ligne de départ de Clair.
         La ligne tout en bas est la ligne de départ de Foncé.`,
        EpaminondasPartSlice.getInitialSlice(),
        [], [], null, null,
    ),
    new DidacticialStep(
        'But du jeu (1/2)',
        `Après plusieurs déplacements, si au début de son tour de jeu, un joueur a plus de pièces sur la ligne de départ de l'adversaire que l'adversaire n'en a sur la ligne de départ du joueur, ce joueur gagne.
         Ici, c'est au tour du joueur foncé de jouer, il a donc gagné.`,
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
            [_, _, _, _, _, _, _, O, O, O, O, _, _, _],
        ], 0),
        [], [], null, null,
    ),
    new DidacticialStep(
        'But du jeu (2/2)',
        `Dans ce cas ci, c'est au tour de Clair, et celui-ci gagne, car il a deux pièces sur la ligne de départ de Foncé, et Foncé n'en a qu'une sur la ligne de départ de Clair.`,
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
        'Déplacement de pièce',
        `Voici le plateau de départ, c'est à Foncé de commencer.
         Commençons simplement par un déplacement d'une seule pièce.
         1. Cliquez la pièce sur la colonne la plus à gauche et sur la deuxième rangée en commençant par le bas.
         2. Cliquez une case plus haut.`,
        EpaminondasPartSlice.getInitialSlice(),
        [new EpaminondasMove(0, 10, 1, 1, Direction.UP)],
        [],
        `Voilà, c'est comme ça qu'on déplace une seule pièce.`,
        'Raté, recommencez.',
    ),
    new DidacticialStep(
        'Déplacement de phalange',
        `Maintenant, comment déplacer plusieurs pièces sur une seule ligne (une phalange)?
         1. Cliquez sur la première pièce (la plus en bas à gauche).
         2. Cliquez sur la dernière pièce de la phalange (celle juste au dessus pour l'exemple).
         3. Cliquez une ou deux cases plus haut, pour déplacer toute la phalange de deux cases
         (soit de la distance maximale légale qui vaut le nombre de pièces déplacées).`,
        EpaminondasPartSlice.getInitialSlice(),
        [new EpaminondasMove(0, 11, 2, 1, Direction.UP), new EpaminondasMove(0, 11, 2, 2, Direction.UP)],
        [],
        `Bravo.
         Les pièces déplacées doivent être horizontalement, verticalement, ou diagonalement alignées.
         Le déplacement doit se faire le long de cette ligne, en avant ou en arrière.
         Il ne peut y avoir ni ennemis ni trous dans la phalange.`,
        'Raté',
    ),
    new DidacticialStep(
        'Capture',
        `Pour capturer une phalange ennemie:
         1. Il faut que celle-ci soit alignée avec la phalange en déplacement.
         2. Qu'elle soit strictement plus courte.
         3. Que la première pièce de votre phalange aterrisse sur la première pièce rencontrée de la phalange à capturer.
         Capturez la phalange.`,
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
