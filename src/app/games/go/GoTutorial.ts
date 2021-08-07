import { GoMove } from 'src/app/games/go/GoMove';
import { GoPartSlice, GoPiece, Phase } from 'src/app/games/go/GoPartSlice';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TutorialStep } from '../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';

const X: GoPiece = GoPiece.WHITE;
const O: GoPiece = GoPiece.BLACK;
const k: GoPiece = GoPiece.DEAD_WHITE;
const w: GoPiece = GoPiece.WHITE_TERRITORY;
const b: GoPiece = GoPiece.BLACK_TERRITORY;
const _: GoPiece = GoPiece.EMPTY;

export const goTutorial: TutorialStep[] = [
    TutorialStep.informational(
        $localize`Info préalables`,
        $localize`Le jeu de Go se joue sur un plateau appelé Goban, et les pierres sont placées sur les intersections.
        Le plateau traditionnel fait 19x19 intersections, mais le 13x13 est implémenté sur ce site.
        (Pour des parties plus courtes, le 9x9 et 5x5 existent, mais ne sont pas encore disponibles).
        Pour ce tutoriel, nous utiliserons un petit 5x5 à fin pédagogique.`,
        GoPartSlice.getInitialSlice(),
    ),
    TutorialStep.informational(
        $localize`But du jeu`,
        $localize`Le but du jeu est d'avoir le plus de points en fin de partie.
        On appelle territoires les intersections inoccupées et isolées du reste du Goban par les pierres d'un seul joueur.
        Ici, le joueur foncé a 9 territoires à gauche, le joueur clair en a 8 à droite.
        La zone en haut au milieu n'appartient à personne.
        Le score en fin de partie correspondra à l'addition des territoires et des captures.`,
        new GoPartSlice([
            [_, O, _, _, X, X],
            [_, O, _, _, X, _],
            [_, O, O, X, X, _],
            [_, _, O, X, _, _],
            [_, _, O, X, _, _],
            [_, _, O, X, _, _],
        ], [0, 0], 0, MGPOptional.empty(), Phase.PLAYING),
    ),
    TutorialStep.fromMove(
        $localize`Capture simple`,
        $localize`Une pierre isolée, comme la pierre claire au milieu, a 4 intersections voisines (et non 8, car on ne compte pas les diagonales).
        Si une intersection voisine est inoccupée, elle est appelée liberté.
        Si Foncé joue sur la dernière liberté de la pierre claire, cette pierre est enlevée du goban (capturée) et rapporte un point à Foncé.<br/><br/>
        Il ne reste plus qu'une liberté à la pierre claire, capturez-la.`,
        new GoPartSlice([
            [_, _, _, _, _],
            [_, _, O, _, _],
            [_, O, X, _, _],
            [_, _, O, _, _],
            [_, _, _, _, _],
        ], [0, 0], 0, MGPOptional.empty(), Phase.PLAYING),
        [new GoMove(3, 2)],
        $localize`Bravo, vous avez gagné un point`,
        $localize`Raté, réessayez en jouant sur l'une des intersections immédiatement voisines de la pierre claire.`,
    ),
    TutorialStep.fromMove(
        $localize`Capture de plusieurs pierres`,
        $localize`Des pierres connectées horizontalement ou verticalement doivent être capturées ensemble, et ne sont pas capturables séparement.<br/><br/>
        Le groupe clair ci-dessus n'a plus qu'une liberté, capturez ce groupe.`,
        new GoPartSlice([
            [_, O, _, _, _],
            [O, X, _, _, _],
            [O, X, X, O, _],
            [_, O, O, _, _],
            [_, _, _, _, _],
        ], [0, 0], 0, MGPOptional.empty(), Phase.PLAYING),
        [new GoMove(2, 1)],
        $localize`Bravo, vous avez gagné trois points, et formé un territoire.`,
        $localize`Raté, vous n'avez pas capturé le groupe, jouez sur la dernière liberté de ce groupe.`,
    ),
    TutorialStep.informational(
        $localize`Suicide`,
        $localize`Au Go le suicide est interdit.
        Quand mettre une pierre sur une intersection ferait que le groupe de votre dernière pierre n'a aucune liberté et ne capture aucunes pierres, jouer cette intersection serait un suicide, et est donc interdit.
        Ici, l'intersection en haut à gauche est un suicide pour Clair.
        En bas à droite, un suicide pour Foncé, et en bas à gauche n'est un suicide pour aucun joueur.`,
        new GoPartSlice([
            [_, O, _, _, _],
            [O, _, _, _, _],
            [O, _, _, _, X],
            [X, O, _, X, _],
            [_, X, _, X, O],
        ], [0, 0], 0, MGPOptional.empty(), Phase.PLAYING),
    ),
    TutorialStep.informational(
        $localize`Vie et mort (mort)`,
        $localize`De la règle de capture découle la notion de vie et de mort:
        des pierres mortes sont des pierres que l'on est sûr de pouvoir capturer (sans rien y perdre ailleurs).
        Tandis que des pierres vivantes sont des pierres que l'on ne peut plus espérer capturer.
        D'après la règle de capture, Foncé peut jouer à l'intérieur du territoire de Clair et le capturer.
        On dit dans ce cas que Clair n'a qu'un œil (sa dernière liberté) et qu'il est mort (même si pas encore capturé).
        En fin de partie, la pierre morte est comptée comme une capture, et la case qu'elle occupe comme un territoire.`,
        new GoPartSlice([
            [_, _, _, _, _],
            [O, O, O, _, _],
            [X, X, O, _, _],
            [_, X, O, _, _],
            [X, X, O, _, _],
        ], [0, 0], 0, MGPOptional.empty(), Phase.PLAYING),
    ),
    TutorialStep.informational(
        $localize`Vie et mort (yeux)`,
        $localize`Ici, Clair ne pouvant jouer ni en haut à gauche, ni en bas à gauche, il ne pourra jamais capturer Foncé.
        On dit alors que Foncé a deux yeux (l'oeil en haut à gauche et celui en bas à gauche) et qu'il est vivant.`,
        new GoPartSlice([
            [_, O, X, _, _],
            [X, O, X, _, _],
            [O, O, X, _, _],
            [X, O, X, _, _],
            [_, O, X, _, _],
        ], [0, 0], 0, MGPOptional.empty(), Phase.PLAYING),
    ),
    TutorialStep.informational(
        $localize`Seki`,
        $localize`Si Foncé joue au milieu en haut (ou en bas), Clair jouera au milieu en bas (ou en haut) et le capturera.
        De même, si Clair joue au milieu haut (ou en bas), Foncé le capturera.
        Autrement dit, personne n'a intérêt à jouer au milieu.
        Dans ce cas, on dit que les pierres du milieu sont vivantes par Seki, et que les deux intersections du milieu sont des intersections neutres.`,
        new GoPartSlice([
            [_, X, O, _, X, O, _],
            [_, X, O, O, X, O, _],
            [_, X, O, O, X, O, _],
            [_, X, O, O, X, O, _],
            [_, X, O, X, X, O, _],
            [_, X, O, X, X, O, _],
            [_, X, O, _, X, O, _],
        ], [0, 0], 0, MGPOptional.empty(), Phase.PLAYING),
    ),
    TutorialStep.fromMove(
        $localize`Ko`,
        $localize`Un joueur, en posant une pierre, ne doit pas redonner au goban un état identique à l'un de ceux qu'il lui avait déjà donné, ce afin d'empêcher qu'une partie soit sans fin.<br/><br/>
        Capturez la pierre claire.`,
        new GoPartSlice([
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, X, _, _],
            [_, _, O, X, _, X, _],
            [_, _, _, O, X, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ], [0, 0], 0, MGPOptional.empty(), Phase.PLAYING),
        [new GoMove(4, 3)],
        $localize`Maintenant, si Clair essaye de recapturer la pierre que Foncé vient de poser, il rendrait au goban son état précédent, ouvrant la porte à une partie sans fin.
         L'emplacement de cette pièce est donc marqué d'un rectangle rouge, pour rapeller que c'est une intersection interdite.
         Cette règle s'appelle le Ko.
         Toute l'astuce pour Clair consiste, à essayer de créer une menace suffisamment grave pour que Foncé ait intérêt à y répondre immédiatement, et n'ait pas le temps de protéger sa dernière pierre, afin que Clair puisse la recapturer.`,
        $localize`Raté !`,
    ),
    TutorialStep.fromMove(
        $localize`Fin de partie`,
        $localize`Quand un joueur estime qu'il n'a plus intérêt à placer une pierre, il l'indique en passant son tour.
        La phase de jeu s'arrête lorsque les deux joueurs passent consécutivement, on passe alors en phase de comptage.
        On marque alors les groupes morts en cliquant dessus.
        Chaque intersection du territoire d'un joueur lui rapporte un point.
        Le gagnant est celui qui a le plus de points.<br/><br/>
        Une dernière pierre est morte, marquez-la.`,
        new GoPartSlice([
            [X, O, O, O, O, O, b, b, b],
            [X, X, X, X, O, O, O, b, b],
            [X, w, X, X, O, k, k, O, b],
            [O, X, X, X, X, O, b, b, b],
            [_, X, w, X, O, O, k, O, b],
            [X, w, X, X, O, O, O, O, O],
            [X, X, O, O, O, X, X, O, X],
            [O, O, O, X, X, X, w, X, X],
            [b, b, O, O, O, X, X, w, w],
        ], [0, 0], 0, MGPOptional.empty(), Phase.COUNTING),
        [new GoMove(0, 3)],
        $localize`Bravo, Foncé a 15 territoires et 3 pierres claire mortes mais encore présentes, appellées prisonnier en fin de partie.
         Les emplacements où les prisonniers sont comptent comme territoire pour Foncé.
         Clair a 8 territoires et 1 prisonnier.
         Le résultat est donc 18 - 9 en faveur de Foncé.`,
        $localize`Raté, recommencez.`,
    ),
];
