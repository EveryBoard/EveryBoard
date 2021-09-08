import { KamisadoMove } from 'src/app/games/kamisado/KamisadoMove';
import { KamisadoColor } from 'src/app/games/kamisado/KamisadoColor';
import { KamisadoPartSlice } from 'src/app/games/kamisado/KamisadoPartSlice';
import { KamisadoPiece } from 'src/app/games/kamisado/KamisadoPiece';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TutorialStep } from '../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';

const __: number = KamisadoPiece.NONE.getValue();
const or: number = KamisadoPiece.ZERO.ORANGE.getValue();
const Or: number = KamisadoPiece.ONE.ORANGE.getValue();
const bl: number = KamisadoPiece.ZERO.BLUE.getValue();
const Bl: number = KamisadoPiece.ONE.BLUE.getValue();
const pu: number = KamisadoPiece.ZERO.PURPLE.getValue();
const Pu: number = KamisadoPiece.ONE.PURPLE.getValue();
const pi: number = KamisadoPiece.ZERO.PINK.getValue();
const Pi: number = KamisadoPiece.ONE.PINK.getValue();
const ye: number = KamisadoPiece.ZERO.YELLOW.getValue();
const Ye: number = KamisadoPiece.ONE.YELLOW.getValue();
const re: number = KamisadoPiece.ZERO.RED.getValue();
const Re: number = KamisadoPiece.ONE.RED.getValue();
const gr: number = KamisadoPiece.ZERO.GREEN.getValue();
const Gr: number = KamisadoPiece.ONE.GREEN.getValue();
const br: number = KamisadoPiece.ZERO.BROWN.getValue();
const Br: number = KamisadoPiece.ONE.BROWN.getValue();

export const kamisadoTutorial: TutorialStep[] = [

    TutorialStep.informational(
        $localize`But du jeu`,
        $localize`Au Kamisado, il y a deux façons de gagner : soit en plaçant une de vos pièces sur la ligne de départ de
        l'adversaire, soit en forçant l'adversaire à faire un coup qui bloque la partie.
        Ici, le joueur foncé gagne car il a sa pièce brune sur la ligne de départ du joueur clair, en haut à gauche.`,
        new KamisadoPartSlice(5, KamisadoColor.ORANGE, MGPOptional.empty(), false, [
            [br, Bl, Pu, Pi, Ye, Re, Gr, Br],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, Or, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, gr, re, ye, pi, pu, bl, or],
        ]),
    ).withPreviousMove(KamisadoMove.of(new Coord(0, 7), new Coord(0, 0))),

    TutorialStep.anyMove(
        $localize`Plateau de départ et déplacement initial`,
        $localize`Voici le plateau de départ.
        Au Kamisado, les pièces ne peuvent se déplacer que vers l'avant, verticalement ou diagonalement.
        Vous jouez en premier, donc avec les pièces foncées, vous pouvez faire votre premier déplacement.<br/><br/>
        Cliquez sur la pièce de votre choix, et cliquez sur sa case d'arrivée.`,
        KamisadoPartSlice.getInitialSlice(),
        KamisadoMove.of(new Coord(7, 7), new Coord(3, 3)),
        $localize`Parfait! Notez bien que chacune de vos pièces a une couleur différente.`,
    ),
    TutorialStep.fromMove(
        $localize`Déplacement`,
        $localize`Considérons maintenant le coup du joueur clair, après le déplacement de la pièce bleue.
        Tous les déplacements après le déplacement initial se font obligatoirement à partir de la pièce correspondant
        à la couleur sur laquelle le dernier déplacement s'est terminé.
        Ici, le déplacement précédent s'étant terminé sur une case rose, c'est donc au pion rose de se déplacer.
        Il est d'ailleurs déjà sélectionné, vous ne devez donc plus cliquer dessus.<br/><br/>
        Déplacez-le jusqu'à la case bleue.`,
        new KamisadoPartSlice(1, KamisadoColor.PINK, MGPOptional.of(new Coord(3, 0)), false, [
            [Or, Bl, Pu, Pi, Ye, Re, Gr, Br],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, bl, __],
            [__, __, __, __, __, __, __, __],
            [br, gr, re, ye, pi, pu, __, or],
        ]),
        [
            KamisadoMove.of(new Coord(3, 0), new Coord(3, 6)),
            KamisadoMove.of(new Coord(3, 0), new Coord(4, 1)),
        ],
        $localize`Parfait!`,
        $localize`Vous n'avez pas avancé votre pièce rose sur une case bleue !`,
    ).withPreviousMove(KamisadoMove.of(new Coord(6, 7), new Coord(6, 5))),

    TutorialStep.informational(
        $localize`Blocage`,
        $localize`Foncé s'est déplacé sur une autre case rose, et vous oblige donc à déplacer votre pièce rose.
        Cependant, votre pièce rose est bloquée ! Dans ce cas ci, vous êtes obligé de passer votre tour.
        Foncé devra jouer son prochain tour en déplaçant lui-même sa pièce rose.`,
        new KamisadoPartSlice(1, KamisadoColor.PINK, MGPOptional.of(new Coord(3, 6)), false, [
            [Or, Bl, Pu, __, Ye, Re, Gr, Br],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, bl],
            [__, __, __, __, __, __, __, __],
            [__, __, __, Pi, __, __, __, __],
            [br, gr, re, ye, pi, pu, __, or],
        ]),
    ).withPreviousMove(KamisadoMove.of(new Coord(6, 5), new Coord(7, 4))),

    TutorialStep.fromMove(
        $localize`Victoire par blocage`,
        $localize`À tout moment, si un joueur provoque un blocage total du jeu, il perd.
        C'est-à-dire que si un joueur oblige son adversaire à déplacer une pièce que l'adversaire ne peut bouger,
        et que lui-même ne peut pas déplacer sa pièce de la même couleur, il perd.
        Ici, en jouant avec les pions foncés,
        vous pouvez obliger votre adversaire à provoquer cette situation et donc l'obliger à perdre!<br/><br/>
        Essayez de faire ce mouvement.`,
        new KamisadoPartSlice(2, KamisadoColor.RED, MGPOptional.of(new Coord(2, 4)), false, [
            [__, Bl, Pu, __, __, Re, __, __],
            [__, __, __, Ye, __, __, __, __],
            [__, __, __, Pi, __, Pu, __, __],
            [__, __, __, ye, __, __, __, __],
            [__, __, re, __, __, __, __, __],
            [__, __, __, __, __, __, Gr, __],
            [Or, __, __, __, __, pi, __, Br],
            [br, gr, __, __, __, __, bl, or],
        ]),
        [KamisadoMove.of(new Coord(2, 4), new Coord(0, 2))],
        $localize`Parfait!
         Clair est obligé d'avancer son pion vert sur la case orange, vous obligeant à joueur avec votre pion orange.
         Dès lors, votre pion orange sera bloqué et vous devrez donc passer votre tour.
         Clair devra ensuite aussi passer son tour car son pion orange est aussi bloqué :
         la partie est totalement bloquée.
         Dans ce cas, le dernier joueur à avoir déplacé une pièce perd la partie.
         Ici, Clair aura déplacé sa pièce verte en dernier, vous êtes donc vainqueur !`,
        $localize`Raté !`,
    ).withPreviousMove(KamisadoMove.of(new Coord(4, 0), new Coord(3, 1))),
];
