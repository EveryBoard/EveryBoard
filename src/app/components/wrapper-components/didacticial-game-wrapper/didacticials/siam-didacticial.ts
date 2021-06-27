import { SiamMove } from 'src/app/games/siam/SiamMove';
import { SiamPiece } from 'src/app/games/siam/SiamPiece';
import { SiamPartSlice } from 'src/app/games/siam/SiamPartSlice';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { DidacticialStep } from '../DidacticialStep';

const _: number = SiamPiece.EMPTY.value;
const M: number = SiamPiece.MOUNTAIN.value;

const U: number = SiamPiece.WHITE_UP.value;
const L: number = SiamPiece.WHITE_LEFT.value;
const R: number = SiamPiece.WHITE_RIGHT.value;
const D: number = SiamPiece.WHITE_DOWN.value;

const u: number = SiamPiece.BLACK_UP.value;
const l: number = SiamPiece.BLACK_LEFT.value;
const r: number = SiamPiece.BLACK_RIGHT.value;
const d: number = SiamPiece.BLACK_DOWN.value;

export const siamDidacticial: DidacticialStep[] = [
    DidacticialStep.informational(
        $localize`But du jeu`,
        $localize`Le but du Siam est d'être le premier à pousser une montagne hors du plateau.
         Le plateau de départ en contient trois, au centre, et aucun pion n'est initialement sur le plateau.
         Durant son tour de jeu un joueur peut effectuer l'une des trois actions suivantes:
         1. Faire entrer une pièce sur le plateau.
         2. Changer l'orientation d'une de ses pièces et optionnellement la déplacer.
         3. Sortir un de ses pions du plateau.`,
        SiamPartSlice.getInitialSlice(),
    ),
    DidacticialStep.anyMove(
        $localize`Insérer une pièce`,
        $localize`Chaque joueur a en tout 5 pièces.
         Tant qu'il n'en a pas 5 sur le plateau, il peut en insérer une. Pour ce faire:
         1. Appuyez sur une des grosses flèches autour du plateau.
         2. Cliquez sur une des 4 petites flèches apparues sur la case d'arrivée de la pièce insérée.
         Cela indiquera la direction dans laquelle sera orientée votre pièce.`,
        SiamPartSlice.getInitialSlice(),
        new SiamMove(2, -1, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN),
        $localize`Bravo !`,
    ),
    DidacticialStep.fromMove(
        $localize`Déplacer une pièce`,
        $localize`Nous distinguerons ici "déplacer" et "pousser".
         Un déplacement de pièce se fait de sa case à une case vide voisine horizontalement ou verticalement.
         Lors de ce déplacement on peut aussi faire sortir la pièce du plateau.
         Pour déplacer la pièce:
         1. Cliquez dessus.
         2. Cliquez sur l'une des 5 flèches pour choisir la direction dans laquelle elle va se déplacer.
         En cliquant sur celle au milieu, vous décidez de juste changer l'orientation de la pièce, sans la déplacer.
         3. Cliquez sur l'une des 4 flèches sur la case d'arrivée de votre pièce pour choisir son orientation.
         Essayer de déplacer la pièce sur le plateau d'une case vers le haut et de l'orienter vers le bas.`,
        new SiamPartSlice([
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, U, _, _],
        ], 0),
        [new SiamMove(2, 4, MGPOptional.of(Orthogonal.UP), Orthogonal.DOWN)],
        $localize`Bravo, vous avez fait un dérapage!`,
        $localize`Raté !`,
    ),
    DidacticialStep.fromMove(
        $localize`Sortir une pièce`,
        $localize`Sortir une pièce du plateau est plus simple, préciser son orientation d'arrivée n'est pas nécessaire.
         Sortez cette pièce du plateau!`,
        new SiamPartSlice([
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, U, _, _],
        ], 0),
        [new SiamMove(2, 4, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN)],
        $localize`Bravo, même si dans le contexte c'était plutôt un mouvement inutile.`,
        $localize`Raté, elle est encore sur le plateau.`,
    ),
    DidacticialStep.fromMove(
        $localize`Pousser`,
        $localize`Quand la case d'arrivée de votre déplacement est occupée, on parle de "pousser".
         Pour pousser il faut plusieurs critères:
         1. Être déjà orienté dans le sens de la poussée.
         2. Que le nombre de pièces (ennemies ou non) qui font face à la votre (les résistants)
         soit plus petit que le nombre de pièces qui vont dans la même direction, votre y compris (les pousseurs).
         3. Le nombre de montagne doit être inférieur ou égal à la différence entre pousseurs et résistant.
         Votre pièce tout en haut à droite ne peut pas pousser car il y a une montagne de trop.
         Votre pièce tout en bas à droite, elle, peut pousser. Faites-le.`,
        new SiamPartSlice([
            [R, M, M, l, L],
            [_, _, _, _, _],
            [_, _, _, M, _],
            [_, _, _, _, _],
            [_, _, r, l, L],
        ], 0),
        [new SiamMove(4, 4, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT)],
        $localize`Bravo !`,
        $localize`Raté !`,
    ),
    DidacticialStep.fromMove(
        $localize`Victoire`,
        $localize`Pour rappel, la partie se termine quand une montagne est poussée hors du plateau.
         Si vous l'avez poussé et que personne ne vous barre la route, vous êtes le vainqueur.
         Cependant, si vous poussez un adversaire orienté dans la même direction que vous, il sera considéré vainqueur.
         En revanche, si un adversaire est plus proche de la montagne, mais mal orienté, la victoire sera vôtre.
         Vous avez deux moyen de finir la partie, un gagnant, un perdant, choisissez!`,
        new SiamPartSlice([
            [_, _, _, _, _],
            [_, _, _, _, _],
            [M, u, L, _, D],
            [_, _, _, _, d],
            [_, _, _, _, M],
        ], 0),
        [new SiamMove(2, 2, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT)],
        $localize`Bravo, vous avez gagné!`,
        $localize`Raté, vous avez perdu.`,
    ),
];
