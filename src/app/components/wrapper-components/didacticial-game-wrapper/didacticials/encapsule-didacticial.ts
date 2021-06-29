import { EncapsuleMove } from 'src/app/games/encapsule/EncapsuleMove';
import { EncapsulePiece } from 'src/app/games/encapsule/EncapsulePiece';
import { EncapsuleCase, EncapsulePartSlice } from 'src/app/games/encapsule/EncapsulePartSlice';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { DidacticialStep } from '../DidacticialStep';

const _: number = new EncapsuleCase(Player.NONE, Player.NONE, Player.NONE).encode();
const s: number = new EncapsuleCase(Player.ZERO, Player.NONE, Player.NONE).encode();
const m: number = new EncapsuleCase(Player.NONE, Player.ZERO, Player.NONE).encode();
const b: number = new EncapsuleCase(Player.NONE, Player.NONE, Player.ZERO).encode();
const S: number = new EncapsuleCase(Player.ONE, Player.NONE, Player.NONE).encode();
const B: number = new EncapsuleCase(Player.NONE, Player.NONE, Player.ONE).encode();

const Sm: number = new EncapsuleCase(Player.ONE, Player.ZERO, Player.NONE).encode();
const sm: number = new EncapsuleCase(Player.ZERO, Player.ZERO, Player.NONE).encode();
const Mb: number = new EncapsuleCase(Player.NONE, Player.ONE, Player.ZERO).encode();

export const encapsuleDidacticial: DidacticialStep[] = [
    DidacticialStep.informational(
        $localize`But du jeu`,
        $localize`Le but du jeu à Encapsule est d'aligner trois de vos pièces.
         Ici nous avons une victoire du joueur foncé.`,
        new EncapsulePartSlice([
            [s, S, B],
            [_, m, _],
            [_, _, b],
        ], 0, [
            EncapsulePiece.SMALL_BLACK, EncapsulePiece.MEDIUM_BLACK, EncapsulePiece.BIG_BLACK,
            EncapsulePiece.SMALL_WHITE, EncapsulePiece.MEDIUM_WHITE, EncapsulePiece.MEDIUM_WHITE,
            EncapsulePiece.BIG_WHITE,
        ])),
    DidacticialStep.anyMove(
        $localize`Placement`,
        $localize`Ceci est le plateau de départ. Vous jouez foncé.
         Choisissez une des pièces sur le côté du plateau est placez là sur le plateau.`,
        EncapsulePartSlice.getInitialSlice(),
        EncapsuleMove.fromDrop(EncapsulePiece.SMALL_BLACK, new Coord(1, 1)),
        $localize`Bravo !`),
    DidacticialStep.fromMove(
        $localize`Déplacement`,
        $localize`Un autre type de coup à Encapsule est de déplacer une de ses pièces déjà sur le plateau.
         Cliquez sur votre pièce foncée et puis sur n'importe quel emplacement vide du plateau.`,
        new EncapsulePartSlice([
            [s, B, _],
            [_, _, _],
            [_, _, _],
        ], 0, []),
        [
            EncapsuleMove.fromMove(new Coord(0, 0), new Coord(2, 0)),
            EncapsuleMove.fromMove(new Coord(0, 0), new Coord(0, 1)),
            EncapsuleMove.fromMove(new Coord(0, 0), new Coord(1, 1)),
            EncapsuleMove.fromMove(new Coord(0, 0), new Coord(2, 1)),
            EncapsuleMove.fromMove(new Coord(0, 0), new Coord(0, 2)),
            EncapsuleMove.fromMove(new Coord(0, 0), new Coord(1, 2)),
            EncapsuleMove.fromMove(new Coord(0, 0), new Coord(2, 2)),
        ],
        $localize`Bravo !`,
        $localize`Raté, réessayez.`),
    DidacticialStep.fromMove(
        $localize`Spécificité`,
        $localize`À Encapsule, les pièces s'encapsulent les unes sur les autres.
         Il est donc possible d'avoir jusqu'à trois pièces par case !
         Cependant, seulement la plus grosse pièce de chaque case compte :
         il n'est pas possible de gagner avec une pièce « cachée » par une pièce plus grande.
         De même, il n'est pas possible de déplacer une pièce qui est recouverte par une autre pièce plus grande.
         Finalement, il est interdit de recouvrir une pièce avec une autre pièce plus petite.
         Vous jouez ici avec les foncé et pouvez gagner à ce tour de plusieurs façons,
         essayez de gagner en effectuant un déplacement.`,
        new EncapsulePartSlice([
            [Sm, _, S],
            [sm, Mb, B],
            [_, _, _],
        ], 0, [
            EncapsulePiece.MEDIUM_BLACK, EncapsulePiece.BIG_BLACK,
            EncapsulePiece.MEDIUM_WHITE, EncapsulePiece.BIG_WHITE,
        ]),
        [EncapsuleMove.fromMove(new Coord(0, 1), new Coord(2, 2))],
        $localize`Bravo !`,
        $localize`Raté, réessayez.`),
];
