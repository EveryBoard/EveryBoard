import { KamisadoColor } from 'src/app/games/kamisado/KamisadoColor';
import { KamisadoPartSlice } from 'src/app/games/kamisado/KamisadoPartSlice';
import { KamisadoPiece } from 'src/app/games/kamisado/KamisadoPiece';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { DidacticialStep } from '../DidacticialStep';

const __: number = KamisadoPiece.NONE.getValue();
const or: number = KamisadoPiece.ZERO.ORANGE.getValue();
const Or: number = KamisadoPiece.ONE.ORANGE.getValue();
const bl: number = KamisadoPiece.ZERO.BLUE.getValue();
const Bl: number = KamisadoPiece.ONE.BLUE.getValue();
const pu: number = KamisadoPiece.ZERO.PURPLE.getValue();
const Pu: number = KamisadoPiece.ONE.PURPLE.getValue();
const ye: number = KamisadoPiece.ZERO.YELLOW.getValue();
const Ye: number = KamisadoPiece.ONE.YELLOW.getValue();
const re: number = KamisadoPiece.ZERO.RED.getValue();
const Re: number = KamisadoPiece.ONE.RED.getValue();
const gr: number = KamisadoPiece.ZERO.GREEN.getValue();
const Gr: number = KamisadoPiece.ONE.GREEN.getValue();
const br: number = KamisadoPiece.ZERO.BROWN.getValue();
const Br: number = KamisadoPiece.ONE.BROWN.getValue();

export const kamisadoDidacticial: DidacticialStep[] = [
    new DidacticialStep(
        'But du jeu',
        `À Kamisado, il y a deux façons de gagner: soit en plaçant une de vos pièces sur la ligne de départ de
         l'adversaire, soit en forçant l'adversaire à faire un coup qui empêche tout déplacement futur dans le jeu.
         Ici, le joueur noir gagne car il a sa pièce rouge sur la ligne de départ du joueur blanc.`,
        new KamisadoPartSlice(5, KamisadoColor.ORANGE, MGPOptional.of(new Coord(1, 3)), false, [
            [__, re, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, Ye, Gr, or, Or, __],
            [bl, __, __, Bl, __, __, __, __],
            [pu, __, Pu, __, ye, __, __, __],
            [__, __, __, __, __, __, Re, gr],
            [__, __, __, __, br, __, Br, __],
            [__, __, __, __, __, __, __, __],
        ]),
        [], [], '', ''),
];
