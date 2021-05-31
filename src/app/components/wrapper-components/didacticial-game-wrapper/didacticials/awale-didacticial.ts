/* eslint-disable max-len */
import { AwaleMove } from 'src/app/games/awale/AwaleMove';
import { AwalePartSlice } from 'src/app/games/awale/AwalePartSlice';
import { DidacticialStep } from 'src/app/components/wrapper-components/didacticial-game-wrapper/DidacticialStep';
export const awaleDidacticial: DidacticialStep[] = [
    DidacticialStep.anyMove(
        'Distribuer',
        `L’awalé est un jeu de distribution et de capture, le but est de capturer le plus de graines possible.
         Laissez moi vous montrer comment se distribuent les graines.
         Comme vous jouez en premier, les 6 maisons du haut vous appartiennent.
         Cliquez sur l'une d'entre elles pour en distribuer les graines`,
        AwalePartSlice.getInitialSlice(),
        new AwaleMove(0, 0),
        `Voilà, regardez les 4 maisons suivant la maison choisie dans l’ordre horlogé, elle comptent maintenant 5 graines.
         C’est comme cela que les graines se distribuent:
         une à une à partir de la maison suivante dans l’ordre horlogé de la maison d’où elles viennent!`,
    ),
    DidacticialStep.anyMove(
        'Grosse distribution',
        'Vous êtes maintenant le joueur 2 (en bas). Quand il y a assez de graines pour faire un tour complet, quelque chose d’autre se passe. Distribuez cette grosse maison.',
        new AwalePartSlice([
            [0, 0, 0, 0, 0, 0],
            [0, 12, 0, 0, 0, 0],
        ], 1, [0, 0]),
        new AwaleMove(1, 1),
        'Voyez, la maison distribuée n’a pas été reremplie et la distribution a continué immédiatement à la maison suivante (qui contient donc deux graines)!',
    ),
    DidacticialStep.fromMove(
        'Capture simple',
        `Après une distribution, si la dernière graine tombe dans une maison du camp adverse et qu'il y a maintenant deux ou trois graines dans cette maison, le joueur capture ces deux ou trois graines.
         Ensuite il regarde la case précédente:
         si elle est dans le camp adverse et contient deux ou trois graines, il les capture aussi, et ainsi de suite jusqu'à ce qu'il arrive à son camp ou jusqu'à ce qu'il y ait un nombre de graines différent de deux ou trois.
         Vous êtes le deuxième joueur, faites une capture!`,
        new AwalePartSlice([
            [1, 0, 0, 0, 1, 0],
            [1, 0, 0, 0, 1, 0],
        ], 1, [0, 0]),
        [new AwaleMove(0, 1)],
        `Bravo. Il s'agissait ici d'une capture simple, voyons maintenant une capture composée.`,
        'Perdu. Recommencez et distribuez la maison la plus à gauche.',
    ),
    DidacticialStep.fromMove(
        'Capture composée possible',
        `En distribuant votre maison la plus à gauche, vous ferez passer une première maison de 2 à 3 graines, et la deuxième de 1 à 2.
         Ces deux maisons, étant consécutives, seront donc toutes les deux capturables.
         Capturez-les.`,
        new AwalePartSlice([
            [2, 1, 0, 0, 1, 0],
            [2, 0, 0, 0, 1, 0],
        ], 1, [0, 0]),
        [new AwaleMove(0, 1)],
        'Bravo, vous gagnez 3 point dans la première maison plus 2 dans la seconde!',
        'Perdu. Recommencez.',
    ),
    DidacticialStep.fromMove(
        'Capture interrompue',
        'En cliquant sur votre maison la plus à gauche, vous atterrissez sur la 3ème maison, qui est capturable. Faites-le.',
        new AwalePartSlice([
            [1, 0, 1, 0, 0, 1],
            [3, 0, 0, 0, 1, 0],
        ], 1, [0, 0]),
        [new AwaleMove(0, 1)],
        'Constatez que la 2ème maison n’étant pas capturable, la capture a été interrompue et vous n’avez pas pu capturer la 1ère maison.',
        'Perdu. Recommencez.',
    ),
    DidacticialStep.fromMove(
        `Capture chez l'adversaire uniquement`,
        'Essayez de capturer les deux maisons les plus à gauche de l’adversaire.',
        new AwalePartSlice([
            [2, 2, 0, 0, 1, 0],
            [1, 3, 0, 0, 1, 0],
        ], 1, [0, 0]),
        [new AwaleMove(1, 1)],
        `Bravo. Constatez que la capture s'est interrompue en arrivant dans votre territoire, on ne peut pas capturer ses propres maisons!`,
        `Vous n'avez capturé qu'une seule maison, recommencez!`,
    ),
    DidacticialStep.fromMove(
        'Ne pas affamer',
        'Vous avez une très belle capture qui semble possible, il semble que vous pouviez capturer tous les pions de l’adversaire! Lancez-vous !',
        new AwalePartSlice([
            [1, 1, 1, 1, 1, 0],
            [5, 0, 0, 1, 0, 0],
        ], 1, [0, 0]),
        [new AwaleMove(0, 1)],
        'Malheureusement, c’est interdit, car sinon l’adversaire ne pourrait pas jouer après vous. À ces moments là, le mouvement est autorisé mais la capture n’est pas effectuée!',
        'Perdu. Recommencez',
    ),
    DidacticialStep.anyMove(
        'Nourir est obligatoire',
        `"Affamer" est interdit, c'est-à-dire: si votre adversaire n'a plus de graines et que vous savez lui en donner une ou plusieurs, vous êtes obligé de le faire.
         Allez-y!`,
        new AwalePartSlice([
            [0, 0, 0, 0, 0, 0],
            [0, 1, 2, 4, 4, 5],
        ], 1, [0, 0]),
        new AwaleMove(3, 1),
        'Bravo. Notez que vous pouvez choisir de lui en donner le moins possible si cela vous arrange mieux! C’est souvent un bon moyen d’avoir des captures faciles!',
    ),
    DidacticialStep.anyMove(
        'Fin de partie',
        `Une partie est gagnée dès qu’un des deux joueurs a capturé 25 graines, car il a plus de la moitié de leur total.
         Distribuez la maison en haut à droite.`,
        new AwalePartSlice([
            [0, 0, 0, 0, 0, 1],
            [0, 1, 2, 3, 4, 4],
        ], 0, [0, 0]),
        new AwaleMove(5, 0),
        `Aussi, dès qu'un joueur ne peut plus jouer, l’autre joueur capture toutes les graines dans son camp.
         Ici, c'était au premier joueur de jouer et joueur deux a récolté toutes les graines restantes.`,
    ),
];
