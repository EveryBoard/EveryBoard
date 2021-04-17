import { QuartoMove } from 'src/app/games/quarto/quarto-move/QuartoMove';
import { QuartoPartSlice } from 'src/app/games/quarto/QuartoPartSlice';
import { QuartoPiece } from 'src/app/games/quarto/QuartoPiece';
import { DidacticialStep } from '../DidacticialStep';

export const quartoDidacticial: DidacticialStep[] = [
    DidacticialStep.informational(
        'But du jeu',
        `Quarto est un jeu d'alignement.
         Le but d'aligner quatre pièces qui possèdent au moins un point commun:
         leur couleur (claire ou foncée),
         leur taille (grande ou petite),
         leur motif (vide ou à point),
         leur forme (ronde ou carrée).
         Ici, nous avons un plateau avec une victoire par alignement de pièce rondes.`,
        new QuartoPartSlice([
            [14, 12, 4, 2],
            [16, 16, 16, 16],
            [16, 16, 16, 16],
            [16, 16, 16, 16],
        ], 7, QuartoPiece.ABAB),
    ),
    DidacticialStep.anyMove(
        'Placement',
        `Chaque placement se fait en deux étapes: placer la pièce qu'on a en main en cliquant sur une case du plateau,
         et choisir une pièce que l'adversaire devra placer, en cliquant sur une des pièces affichées à droite.
         Si vous préférez, l'ordre inverse est également possible.
         Gardez juste à l'esprit que le deuxième clic valide le mouvement.
         Effectuez un mouvement.`,
        new QuartoPartSlice([
            [14, 3, 6, 16],
            [16, 16, 16, 16],
            [16, 8, 16, 16],
            [16, 16, 16, 16],
        ], 7, QuartoPiece.ABAA),
        'Parfait!',
    ),
    DidacticialStep.fromMove(
        'Situation',
        `Nous avons ici une situation délicate. Analysez bien le plateau et jouer votre coup,
         en faisant particulièrement attention de ne pas permettre à l'adversaire de l'emporter au prochain coup.`,
        new QuartoPartSlice([
            [15, 14, 13, 16],
            [4, 11, 12, 16],
            [5, 8, 9, 16],
            [16, 16, 16, 16],
        ], 7, QuartoPiece.AABA),
        [new QuartoMove(3, 3, QuartoPiece.AABB)],
        'Bien joué!',
        'Raté!',
    ),
];
