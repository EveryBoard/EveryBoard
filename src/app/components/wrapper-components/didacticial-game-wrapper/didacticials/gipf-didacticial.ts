import { GipfMove, GipfPlacement } from 'src/app/games/gipf/gipf-move/GipfMove';
import { GipfPartSlice } from 'src/app/games/gipf/gipf-part-slice/GipfPartSlice';
import { GipfPiece } from 'src/app/games/gipf/gipf-piece/GipfPiece';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { Direction } from 'src/app/jscaip/DIRECTION';
import { HexaBoard } from 'src/app/jscaip/hexa/HexaBoard';
import { ArrayUtils, NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { DidacticialStep } from '../DidacticialStep';

const _: GipfPiece = GipfPiece.EMPTY;
const O: GipfPiece = GipfPiece.PLAYER_ZERO;
const X: GipfPiece = GipfPiece.PLAYER_ONE;
const numberedBoard: NumberTable = ArrayUtils.mapBiArray([
    [_, _, _, X, _, _, O],
    [_, _, _, _, _, _, _],
    [_, _, _, _, _, _, _],
    [O, _, _, _, _, _, X],
    [_, _, _, _, _, _, _],
    [_, _, _, _, _, _, _],
    [X, _, _, O, _, _, _],
], GipfPiece.encoder.encode);
const board: HexaBoard<GipfPiece> = HexaBoard.fromNumberTable(numberedBoard, _, GipfPiece.encoder);
new GipfPartSlice(board, 0, [12, 12], [0, 0]);
export const gipfDidacticial: DidacticialStep[] = [
    new DidacticialStep(
        'But du jeu',
        `Le but du jeu est de capturer toutes les pièces de l'adversaire pour qu'il ne puisse plus jouer.
         Voici la configuration initial du plateau.
         Le premier joueur joue les pièces foncées, le deuxième les pièces claires.`,
        GipfPartSlice.getInitialSlice(),
        [], [], null, null,
    ),
    new DidacticialStep(
        'Insertion',
        `Un tour classique commence par une insertion:
         1. vous choisissez la case où vous voulez insérer votre pièce.
         2. vous choisissez la direction dans laquelle insérer.
         Une insertion est interdite dans une rangée complète.
         Vous jouez Foncé, insérez une pièce de bas en haut, en entrant par la case la plus basse.`,
        GipfPartSlice.getInitialSlice(),
        [
            new GipfMove(
                new GipfPlacement(new Coord(0, 3), MGPOptional.of(Direction.UP)),
                [],
                [],
            ),
        ],
        [],
        'Bravo.',
        'Raté',
    ),
    new DidacticialStep(
        'Capture',
        `Pour faire une capture, il faut aligner quatre de ses pièces.
         Quand 4 pièces sont capturées, toutes les pièces directement connectées à ces 4 pièces le sont également.
         Dès qu'un espace le long de cette ligne est rencontré, la capture s'arrête.
         Vous jouez`,
        null, // TODO after refactor, hurry cariboo-san.
        [], [], null, null,
    ),
    new DidacticialStep(
        'Capture, exemple',
        `Pour faire une capture, il faut aligner quatre de ses pièces.
         Quand 4 pièces sont capturées, toutes les pièces directement connectées à ces 4 pièces le sont également.
         Dès qu'un espace le long de cette ligne est rencontré, la capture s'arrête.`,
        null, // TODO after refactor, hurry cariboo-san.
        [], [], null, null,
    ),
    // new DidacticialStep(
    //     title,
    //     instruction,
    //     slice,
    //     moves,
    //     [],
    //     success,
    //     failure
    // ),
];
