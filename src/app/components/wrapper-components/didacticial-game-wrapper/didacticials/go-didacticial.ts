/* eslint-disable max-len */
import { GoMove } from 'src/app/games/go/go-move/GoMove';
import { GoPartSlice, GoPiece, Phase } from 'src/app/games/go/go-part-slice/GoPartSlice';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { DidacticialStep } from '../DidacticialStep';

const X: GoPiece = GoPiece.WHITE;
const O: GoPiece = GoPiece.BLACK;
const k: GoPiece = GoPiece.DEAD_WHITE;
const w: GoPiece = GoPiece.WHITE_TERRITORY;
const b: GoPiece = GoPiece.BLACK_TERRITORY;
const _: GoPiece = GoPiece.EMPTY;

export const goDidacticial: DidacticialStep[] = [
    new DidacticialStep(
        'Info préalables',
        'Le jeu de Go se joue sur un plateau appelé Goban, et les pierres sont placées sur les intersections. Le plateau traditionnel fait 19x19 intersections, mais le 13x13 est implémenté sur ce site et aussi commun pour les parties plus courtes, le 9x9 et 5x5 sont aussi commun mais sont plus déséquilibré et les parties trop courtes. Pour ce tutoriel, ne faites pas attention à la taille des plateaux.',
        GoPartSlice.getInitialSlice(),
        [], [], null, null,
    ),
    new DidacticialStep(
        'But du jeu',
        'Le but du jeu est d\'avoir le plus de points en fin de partie. Chaque intersection en fin de partie comptera comme un territoire si elle n\'appartient qu\'à un seul joueur. Ici, le joueur noir a 9 territoires à gauche, le joueur blanc en a 8 à droite. La zone en haut au milieu n\'appartient à personne. On additionnera à ce score: le territoire, les captures faites en cours de partie.',
        new GoPartSlice([
            [_, O, _, _, X, X],
            [_, O, _, _, X, _],
            [_, O, O, X, X, _],
            [_, _, O, X, _, _],
            [_, _, O, X, _, _],
            [_, _, O, X, _, _],
        ], [0, 0], 0, MGPOptional.empty(), Phase.PLAYING),
        [], [], null, null,
    ),
    new DidacticialStep(
        'Capture simple',
        'Une pierre isolée, comme la pierre blanche au milieu, a 4 cases voisines, aussi appellées libertés. Si noir occupe la dernière, cette pierre est enlevée du goban (capturée) et rapporte un point au joueur noir. Il ne reste plus qu\'une liberté à la pierre blanche, capturez-la.',
        new GoPartSlice([
            [_, _, _, _, _],
            [_, _, O, _, _],
            [_, O, X, _, _],
            [_, _, O, _, _],
            [_, _, _, _, _],
        ], [0, 0], 0, MGPOptional.empty(), Phase.PLAYING),
        [new GoMove(3, 2)],
        [],
        'Bravo, vous avez gagné un point',
        'Raté, réessayez en jouant sur l\'une des cases immédiatement voisine de la pierre blanche.',
    ),
    new DidacticialStep(
        'Capture de plusieurs pierres',
        'Des pierres connectées horizontalement ou verticalement doivent être capturées ensemble, et ne sont pas capturables séparement. Le groupe blanc ci dessus n\'as plus qu\'une liberté, capturez ce groupe.',
        new GoPartSlice([
            [_, O, _, _, _],
            [O, X, _, _, _],
            [O, X, X, O, _],
            [_, O, O, _, _],
            [_, _, _, _, _],
        ], [0, 0], 0, MGPOptional.empty(), Phase.PLAYING),
        [new GoMove(2, 1)],
        [],
        'Bravo, vous avez gagné trois points, et formé un territoire.',
        'Raté, vous n\'avez pas capturé le groupe, jouez sur la dernière liberté de ce groupe.',
    ),
    new DidacticialStep(
        'Vie et mort (mort)',
        'De la règle de capture découle la notion de vie et de mort: des pierres mortes sont des pierres que l\'on est sûr de pouvoir capturer (sans rien y perdre ailleurs), tandis que des pierres vivantes sont des pierres que l\'on ne peut plus espérer capturer. D\'après la règle de capture, Noir peut jouer à l\'intérieur du territoire de blanc et le capturer. On dit dans ce cas que Blanc n\'a qu\'un œil (sa dernière liberté) et qu\'il est mort (même si pas encore capturé).',
        new GoPartSlice([
            [_, _, _, _, _],
            [O, O, O, _, _],
            [X, X, O, _, _],
            [_, X, O, _, _],
            [X, X, O, _, _],
        ], [0, 0], 0, MGPOptional.empty(), Phase.PLAYING),
        [], [], null, null,
    ),
    new DidacticialStep(
        'Vie et mort (yeux)',
        'Ici, Blanc ne pouvant jouer ni en haut à gauche, ni en bas à gauche, il ne pourra jamais capturer Noir. On dit alors que Noir a deux yeux (l\'oeil en haut à gauche et celui en bas à gauche) et qu\'il est vivant.',
        new GoPartSlice([
            [_, O, X, _, _],
            [X, O, X, _, _],
            [O, O, X, _, _],
            [X, O, X, _, _],
            [_, O, X, _, _],
        ], [0, 0], 0, MGPOptional.empty(), Phase.PLAYING),
        [], [], null, null,
    ),
    new DidacticialStep(
        'Seki',
        'Si Noir joue au milieu en haut (ou en bas), Blanc jouera au milieu en bas (ou en haut) et le capturera. De même, si Blanc joue au milieu haut (ou en bas), Noir le capturera. Autrement dit, personne n\'a intérêt à jouer au milieu. Dans ce cas, on dit que les pierres du milieu sont vivantes par Seki, et que les deux cases du milieu sont des intersections neutres.',
        new GoPartSlice([
            [_, X, O, _, X, O, _],
            [_, X, O, O, X, O, _],
            [_, X, O, O, X, O, _],
            [_, X, O, O, X, O, _],
            [_, X, O, X, X, O, _],
            [_, X, O, X, X, O, _],
            [_, X, O, _, X, O, _],
        ], [0, 0], 0, MGPOptional.empty(), Phase.PLAYING),
        [], [], null, null,
    ),
    new DidacticialStep(
        'Ko',
        'Un joueur, en posant une pierre, ne doit pas redonner au goban un état identique à l\'un de ceux qu\'il lui avait déjà donné, ce afin d\'empêcher qu\'une partie soit sans fin. Capturez la pierre noire.',
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
        [],
        'Maintenant, si Blanc essaye de recapturer la pierre que Noir vient de poser, il rendrait au goban son état précédent, ouvrant la porte à une partie sans fin. L\'emplacement de cette pièce est donc marqué d\'un rectangle rouge, pour rapeller que c\'est une case interdite. Cette règle s\'appelle le Ko. Toute l\'astuce pour Blanc consiste, à essayer de créer une menace suffisamment grave pour que Noir ait intérêt à y répondre immédiatement, et n\'ait pas le temps de jouer lui-même en (3, 3), afin que Blanc puisse à nouveau jouer en (3, 3).',
        'Raté.',
    ),
    new DidacticialStep(
        'Fin de partie',
        'La phase de jeu s\'arrête lorsque les deux joueurs passent consécutivement, on passe alors en phase de comptage. On marque alors les groupes morts en cliquant dessus. Chaque intersection du territoire d\'un joueur lui rapporte un point. Le gagnant est celui qui a le plus de points. Une dernière pierre est morte, marquez-la.',
        new GoPartSlice([
            [X, O, O, O, O, O, b, b, b],
            [X, X, O, X, O, O, O, b, b],
            [X, w, X, X, O, k, k, O, b],
            [O, X, X, X, X, O, b, b, b],
            [_, X, w, X, O, O, k, O, b],
            [X, w, X, X, O, O, O, O, O],
            [X, X, O, O, O, X, X, O, X],
            [O, O, O, X, X, X, w, X, X],
            [b, b, O, O, O, X, X, w, w],
        ], [0, 0], 0, MGPOptional.empty(), Phase.COUNTING),
        [new GoMove(0, 3)],
        [],
        'Bravo, Noir 15 territoire et 3 prisonnier (les emplacements où les prisonnier sont comptant comme territoire pour noir) et Blanc a TMMMRRR',
        'Raté, recommencez.',
    ),
];
