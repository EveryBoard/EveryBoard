import { ReversiMove } from 'src/app/games/reversi/ReversiMove';
import { ReversiPartSlice } from 'src/app/games/reversi/ReversiPartSlice';
import { Player } from 'src/app/jscaip/Player';
import { DidacticialStep } from '../DidacticialStep';

const _: number = Player.NONE.value;
const O: number = Player.ZERO.value;
const X: number = Player.ONE.value;
export const reversiDidacticial: DidacticialStep[] = [
    DidacticialStep.informational(
        $localize`But du jeu`,
        $localize`Les pièces du Reversi sont double face, une face foncée pour le premier joueur, une face claire pour le deuxième.
         Quand une pièce est retournée, elle change de propriétaire.
         Le joueur possédant le plus de pièces en fin de partie gagne.
         Ici, le joueur foncé a 28 points et le joueur clair en a 36, le joueur clair a donc gagné.`,
        new ReversiPartSlice([
            [O, O, O, O, O, O, O, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, O, O, O, O, O, O, O],
        ], 60),
    ),
    DidacticialStep.anyMove(
        $localize`Capture (1/2)`,
        $localize`Au début de la partie, voici la configuration des pièces.
         Pour qu'un coup soit légal il faut qu'il prenne en sandwich minimum une pièce adverse entre la pièce que vous posez et une de vos pièces.
         Faites n'importe quel mouvement.`,
        ReversiPartSlice.getInitialSlice(),
        new ReversiMove(2, 4),
        $localize`Bravo !`,
    ),
    DidacticialStep.fromMove(
        $localize`Capture (2/2)`,
        $localize`Un mouvement peut également capturer une plus grande ligne, et plusieurs lignes à la fois.
         Vous êtes le joueur clair ici.
         Jouez en bas à gauche pour voir un exemple.`,
        new ReversiPartSlice([
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, X, _, _, _],
            [_, _, _, O, _, _, _, _],
            [_, _, O, _, _, _, _, _],
            [O, O, _, _, _, _, _, _],
            [_, O, X, O, X, O, _, _],
        ], 1),
        [new ReversiMove(0, 7)],
        $localize`Bravo !`,
        $localize`Un peu plus en bas et un peu plus à gauche, s'il vous plaît.`,
    ),
    DidacticialStep.informational(
        $localize`Passer son tour`,
        $localize`Si, à son tour de jeu, un joueur n'a aucun mouvement lui permettant de capturer une pièce, il est obligé de passer son tour.
         Si d'aventure le joueur suivant ne savait pas jouer non plus, la partie terminerait avant que la plateau ne soit rempli, et les points seraient décomptés de la façon habituelle.`,
        new ReversiPartSlice([
            [X, O, O, O, O, O, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [X, X, X, X, X, X, _, _],
            [O, O, O, O, O, O, _, _],
        ], 60),
    ),
];
