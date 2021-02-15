/* eslint-disable max-len */
import { AwaleMove } from 'src/app/games/awale/awale-move/AwaleMove';
import { AwalePartSlice } from 'src/app/games/awale/AwalePartSlice';
import { DidacticialStep } from 'src/app/components/wrapper-components/didacticial-game-wrapper/DidacticialStep';

export const awaleDidacticial: DidacticialStep[] = [
    new DidacticialStep(
        'Distribuer',
        'L’awalé est un jeu d\'égrenage, laissez moi vous montrer comment se distribuent les graines. Choisissez une maison à vous. Vous êtes le premier joueur, donc ce sont celles d’en haut!',
        AwalePartSlice.getInitialSlice(),
        [
            new AwaleMove(0, 0),
            new AwaleMove(1, 0),
            new AwaleMove(2, 0),
            new AwaleMove(3, 0),
            new AwaleMove(4, 0),
            new AwaleMove(5, 0),
        ],
        [],
        'Voilà, regardez les 4 maison suivant la maison choisie dans l’ordre horlogé, elle comptent maintenant 5 graines, c’est comme celà que les pierres se distribuent: une à une à partir de la maison suivante dans l’ordre horlogé de la maison d’où elles viennent!',
        'Vous ne pouvez pas distribuer les maison de votre adversaire.',
    ),
    new DidacticialStep(
        'Grosse distribution',
        'Vous êtes maintenant le joueur 2 (en bas). Quand il y a assez de pierred pour faire un tour complet, quelque chose d’autre se passe. Distribuez cette grosse maison.',
        new AwalePartSlice([
            [0, 0, 0, 0, 0, 0],
            [0, 12, 0, 0, 0, 0],
        ], 1, [0, 0]),
        [new AwaleMove(1, 1)],
        [],
        'Voyez, la case d’origine n’as pas été reremplie et la distribution à continué immédiatement à la case suivante (qui contient donc deux)!',
        'Perdu. Recommencez.',
    ),
    new DidacticialStep(
        'Capture simple',
        'Vous jouez le joueur 2 (en bas): En cliquant sur votre pièce la plus à droite, vous atterrissez sur la case suivante. Faites-le.',
        new AwalePartSlice([
            [1, 0, 0, 0, 1, 0],
            [1, 0, 0, 0, 1, 0],
        ], 1, [0, 0]),
        [new AwaleMove(0, 1)],
        [],
        'Voyez, là où votre graine a atterie, il y avait 1 (plus la votre, après), vous avez donc capturé ces graines et gagné 2 points. Ça aurait également marché si cette case en contenait 2 (3 en comptant la votre, donc)!',
        'Perdu. Recommencez.',
    ),
    new DidacticialStep(
        'Capture composée possible',
        'En cliquant sur votre pièce la plus à gauche, vous aterrissez deux maisons plus loin. Faites-le.',
        new AwalePartSlice([
            [2, 1, 0, 0, 1, 0],
            [2, 0, 0, 0, 1, 0],
        ], 1, [0, 0]),
        [new AwaleMove(0, 1)],
        [],
        'La maison où votre dernière graine a atterri (la 2ème) contient 2 graines et celle juste avant dans l’ordre horlogé en contenait 2, ce qui est également capturable, vous avez donc obtenu 5 points dans 2 maisons différentes.',
        'Perdu. Recommencez.',
    ),
    new DidacticialStep(
        'Une capture doit être ininterrompue',
        'En cliquant sur votre pièce la plus à gauche, vous atterrissez sur la 3ème maison, qui est capturable. Faites-le.',
        new AwalePartSlice([
            [1, 0, 1, 0, 0, 1],
            [3, 0, 0, 0, 0, 0],
        ], 1, [0, 0]),
        [new AwaleMove(0, 1)],
        [],
        'Constatez que la 1ère case n’étant pas capturable, la capture a été interrompue et vous n’avez pas pu capturer la 2ème maison.',
        'Perdu. Recommencez.',
    ),
    new DidacticialStep(
        'Capture chez l\'adversaire uniquement',
        'Essayez de capturer les deux maisons les plus à gauche de l’adversaire.',
        new AwalePartSlice([
            [2, 2, 0, 0, 1, 0],
            [1, 3, 0, 0, 1, 0],
        ], 1, [0, 0]),
        [new AwaleMove(1, 1)],
        [],
        'Bravo. Constatez que la capture s\'est interrompue en arrivant dans votre territoire, on ne peut pas capturer ses propres maisons!',
        'Vous n\'avez capturé qu\'une seule maison, recommencez!',
    ),
    new DidacticialStep(
        'Ne pas affamer',
        'Vous avez une très belle capture qui semble possible, il semble que vous pouviez capturer tous les pions de l’adversaire! Lancez-vous !',
        new AwalePartSlice([
            [1, 1, 1, 1, 1, 0],
            [5, 0, 0, 0, 0, 0],
        ], 1, [0, 0]),
        [new AwaleMove(0, 1)],
        [],
        'Malheureusement, c’est interdit, car sinon l’adversaire ne pourrait pas jouer après vous. À ces moments là, le mouvement est autorisé mais la capture n’est pas effectuée!',
        'Perdu. Recommencez',
    ),
    new DidacticialStep(
        'Nourir est obligatoire',
        '"Affamer" est interdit, c\'est-à-dire: si votre adversaire n\'a plus de graines et que vous savez lui en donner une ou plusieurs, vous êtes obligé de le faire. Allez-y!',
        new AwalePartSlice([
            [0, 0, 0, 0, 0, 0],
            [0, 1, 2, 4, 4, 5],
        ], 1, [0, 0]),
        [new AwaleMove(3, 1)],
        [],
        'Bravo. Notez que vous pouvez choisir de lui en donner le moins possible si cela vous arrange mieux! C’est souvent un bon moyen d’avoir des captures faciles!',
        'Raté, ce mouvement n\'as distrubué aucune graine à l\'adversaire, hors l\'un de vos mouvement permet de le faire, c\'est donc obligatoire.',
    ),
    new DidacticialStep(
        'Fin de partie',
        'Une partie est gagnée dès qu’un des deux joueurs atteint les 25 graines, car il a plus de la moitié. Distribuez la maison en haut à droite.',
        new AwalePartSlice([
            [0, 0, 0, 0, 0, 1],
            [0, 1, 2, 3, 4, 4],
        ], 0, [0, 0]),
        [new AwaleMove(5, 0)],
        [],
        'Aussi, dès qu\'un joueur ne peux plus jouer, l\'autre joueurs capture toutes les pièces dans son camps. Ici, c\'est au premier joueur de jouer et joueur deux récoltera toutes les pièces restantes.',
        'WTF.',
    ),
];