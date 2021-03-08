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
        `Le but du jeu est de capturer les pièces de l'adversaire afin qu'il ne puisse plus jouer.
         Voici la configuration initial du plateau.
         Le premier joueur possède les pièces foncées, le deuxième les pièces claires.`,
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
        'Capture (1/2)',
        `Pour faire une capture, il faut aligner quatre de ses pièces.
         Il y a plusieurs choses à savoir sur une capture:
         1. Quand 4 pièces sont capturées, toutes les pièces directement connectées à ces 4 pièces le sont également.
         2. Dès qu'un espace le long de cette ligne est rencontré, la capture s'arrête.
         3. Les pièces à vous que vous capturez sont enlevées du plateau mais rejoigne votre "main".
         4. Celles de l'adversaire capturée sont définitivement perdues.
         5. Si vous créez une ligne une ligne de 4 pièces de l'adversaire, c'est au début de son tour qu'il pourra les capturer.
         Ceci implique que votre tour peut aussi être en trois phases:
         A. Choisir la capture crée par le tour de votre adversaire.
         B. Faire votre insertion.
         C. Choisir la capture que vous venez de créer.
         Vous jouez Clair, une capture est faisable, faites là.`,
        null, // TODO after refactor, hurry cariboo-san.
        [],
        [],
        `Bravo, vous avez capturé une pièce de l'adversaire et récupéré 4 des votres.`,
        'Raté',
    ),
    new DidacticialStep(
        'Capture (2/2)',
        `Ici, plusieurs captures sont faisables, mais aucunes ne capture autant de pièces adverses que les autres.
         Choisissez celle qui capture le plus de pièces ennemies.`,
        null, // TODO after refactor, hurry cariboo-san.
        [], [], null, null,
    ),
/*    new DidacticialStep(
        'Fin de partie',
        `Il ne reste qu'une pièce à capturer à Foncé, capturez là`,
        slice,
        moves,
        [],
        success,
        failure
    ),*/
];
