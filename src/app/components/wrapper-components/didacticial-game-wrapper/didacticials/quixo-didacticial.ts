/* eslint-disable max-len */
import { QuixoPartSlice } from 'src/app/games/quixo/QuixoPartSlice';
import { QuixoMove } from 'src/app/games/quixo/QuixoMove';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { DidacticialStep } from '../DidacticialStep';

const _: number = Player.NONE.value;
const O: number = Player.ZERO.value;
const X: number = Player.ONE.value;

export const quixoDidacticial: DidacticialStep[] = [
    DidacticialStep.informational(
        'But du jeu',
        `Au Quixo, le but du jeu est d'aligner 5 de vos pièces.
         Le premier joueur contrôle les pièces foncées, le deuxième les claires.
         Le plateau est constitué de 25 pièces réparties en un carré de 5x5.
         Chaque pièce a un face neutre, une face claire et une face foncée.`,
        QuixoPartSlice.getInitialSlice(),
    ),
    DidacticialStep.fromMove(
        'A quoi ressemble un mouvement (sans animation)',
        `Quand c'est à votre tour de jouer:
         1. Cliquez sur une de vos pièces ou une pièce neutre, il est interdit de choisir une pièce de l'adversaire.
         Notez que vous ne pouvez choisir qu'une pièce sur le bord du plateau.
         2. Choisissez une direction dans laquelle l'envoyer (en cliquant sur la flèche).
         Il faudra imaginer que la pièce que vous avez choisie a été déplacée jusqu'au bout du plateau dans la direction choisie.
         Une fois arrivée au bout, toutes les pièces vont se glisser d'une case dans la direction inverse à celle qu'a pris votre pièce.
         Après cela, si elle était neutre, la pièce devient la votre et prend votre couleur.
         Pour exemple, prenez la pièce neutre tout en bas à droite, déplacez là tout à gauche (vous jouez Clair).`,
        new QuixoPartSlice([
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [O, O, O, O, _],
        ], 1),
        [new QuixoMove(4, 4, Orthogonal.LEFT)],
        `Voyez comme les quatre pièces foncées ont été déplacées d'une case à droite.
         La pièce neutre, elle, s'est déplacé de 4 cases à gauche et est devenue claire.`,
        'Raté.',
    ),
    DidacticialStep.fromMove(
        'Victoire',
        `Vous savez déjà tout ce qu'il faut pour jouer, il ne manque qu'une spécificité.
         Si vous créez une ligne de 5 pièces vous appartenant, vous gagnez.
         Si vous créez une ligne de 5 pièces ennemies, vous perdez.
         Si vous créez les deux, vous perdez aussi!
         Ce plateau permet de gagner, essayez.
         Vous jouez Clair.`,
        new QuixoPartSlice([
            [_, X, _, X, X],
            [_, O, O, _, O],
            [X, X, X, O, X],
            [O, _, O, X, X],
            [X, O, _, X, O],
        ], 31),
        [new QuixoMove(3, 0, Orthogonal.DOWN)],
        'Bravo, vous avez gagné!',
        'Perdu.',
    ),
];
