import { AwaleMove } from 'src/app/games/awale/AwaleMove';
import { AwalePartSlice } from 'src/app/games/awale/AwalePartSlice';
import { DidacticialStep } from 'src/app/components/wrapper-components/didacticial-game-wrapper/DidacticialStep';
export const awaleDidacticial: DidacticialStep[] = [
    DidacticialStep.anyMove(
        $localize`Distribuer`,
        $localize`L’awalé est un jeu de distribution et de capture, le but est de capturer le plus de graines possible.
         Nous allons voir comment se distribuent les graines.
         Comme vous jouez en premier, les 6 maisons du haut vous appartiennent.
         Cliquez sur l'une d'entre elles pour en distribuer les graines, elles seront distribués dans le sens horaires, à raison d'une graine par maison.`,
        AwalePartSlice.getInitialSlice(),
        AwaleMove.ZERO,
        $localize`Voilà, regardez les 4 maisons suivant la maison choisie dans l’ordre horlogé, elle comptent maintenant 5 graines.
         C’est comme cela que les graines se distribuent:
         une à une à partir de la maison suivante dans l’ordre horlogé de la maison d’où elles viennent!`,
    ),
    DidacticialStep.anyMove(
        $localize`Grosse distribution`,
        $localize`Vous êtes maintenant le joueur 2 (en bas). Quand il y a assez de graines pour faire un tour complet, quelque chose d’autre se passe. Distribuez la maison qui contient 12 graines.`,
        new AwalePartSlice([
            [0, 0, 0, 0, 0, 0],
            [0, 12, 0, 0, 0, 0],
        ], 1, [0, 0]),
        AwaleMove.ONE,
        $localize`Voyez, la maison distribuée n’a pas été reremplie et la distribution a continué immédiatement à la maison suivante (qui contient donc deux graines) !`,
    ),
    DidacticialStep.fromMove(
        $localize`Capture simple`,
        $localize`Après une distribution, si la dernière graine tombe dans une maison du camp adverse et qu'il y a maintenant deux ou trois graines dans cette maison, le joueur capture ces deux ou trois graines.
         Ensuite il regarde la case précédente:
         si elle est dans le camp adverse et contient deux ou trois graines, il les capture aussi, et ainsi de suite jusqu'à ce qu'il arrive à son camp ou jusqu'à ce qu'il y ait un nombre de graines différent de deux ou trois.
         Vous êtes le deuxième joueur, faites une capture!`,
        new AwalePartSlice([
            [1, 0, 0, 0, 1, 0],
            [1, 0, 0, 0, 1, 0],
        ], 1, [0, 0]),
        [AwaleMove.ZERO],
        $localize`Bravo ! Il s'agissait ici d'une capture simple, voyons maintenant une capture composée.`,
        $localize`Perdu. Recommencez et distribuez la maison la plus à gauche.`,
    ),
    DidacticialStep.fromMove(
        $localize`Capture composée possible`,
        $localize`En distribuant votre maison la plus à gauche, vous ferez passer une première maison de 2 à 3 graines, et la deuxième de 1 à 2.
         Ces deux maisons, étant consécutives, seront donc toutes les deux capturées.
         Capturez-les.`,
        new AwalePartSlice([
            [2, 1, 0, 0, 1, 0],
            [2, 0, 0, 0, 1, 0],
        ], 1, [0, 0]),
        [AwaleMove.ZERO],
        $localize`Bravo, vous gagnez 3 points dans la première maison plus 2 dans la seconde!`,
        $localize`Perdu. Recommencez.`,
    ),
    DidacticialStep.fromMove(
        $localize`Capture interrompue`,
        $localize`En cliquant sur votre maison la plus à gauche, vous atterrissez sur la 3ème maison, qui est capturable. Faites-le.`,
        new AwalePartSlice([
            [1, 0, 1, 0, 0, 1],
            [3, 0, 0, 0, 1, 0],
        ], 1, [0, 0]),
        [AwaleMove.ZERO],
        $localize`Constatez que la 2ème maison n’étant pas capturable, la capture a été interrompue et vous n’avez pas pu capturer la 1ère maison.`,
        $localize`Perdu. Recommencez.`,
    ),
    DidacticialStep.fromMove(
        $localize`Capture chez l'adversaire uniquement`,
        $localize`Essayez de capturer les deux maisons les plus à gauche de l’adversaire.`,
        new AwalePartSlice([
            [2, 2, 0, 0, 1, 0],
            [1, 3, 0, 0, 1, 0],
        ], 1, [0, 0]),
        [AwaleMove.ONE],
        $localize`Bravo ! Constatez que la capture s'est interrompue en arrivant dans votre territoire, on ne peut pas capturer ses propres maisons!`,
        $localize`Vous n'avez capturé qu'une seule maison, recommencez!`,
    ),
    DidacticialStep.fromMove(
        $localize`Ne pas affamer`,
        $localize`Vous avez une très belle capture qui semble possible, il semble que vous pouviez capturer tous les pions de l’adversaire ! Lancez-vous !`,
        new AwalePartSlice([
            [1, 1, 1, 1, 1, 0],
            [5, 0, 0, 1, 0, 0],
        ], 1, [0, 0]),
        [AwaleMove.ZERO],
        $localize`Malheureusement, vous ne pouvez pas capturer, car sinon l’adversaire ne pourrait pas jouer après vous. À ces moments là, le mouvement est autorisé mais la capture n’est pas effectuée!`,
        $localize`Perdu. Recommencez.`,
    ),
    DidacticialStep.anyMove(
        $localize`Nourir est obligatoire`,
        $localize`"Affamer" est interdit, c'est-à-dire: si votre adversaire n'a plus de graines et que vous savez lui en donner une ou plusieurs, vous êtes obligé de le faire.
         Allez-y !`,
        new AwalePartSlice([
            [0, 0, 0, 0, 0, 0],
            [0, 1, 2, 4, 4, 5],
        ], 1, [0, 0]),
        AwaleMove.THREE,
        $localize`Bravo ! Notez que vous pouvez choisir de lui en donner le moins possible si cela vous arrange mieux ! C’est souvent un bon moyen d’avoir des captures faciles !`,
    ),
    DidacticialStep.anyMove(
        $localize`Fin de partie`,
        $localize`Une partie est gagnée dès qu’un des deux joueurs a capturé 25 graines, car il a plus de la moitié de leur total.
         Distribuez la maison en haut à droite.`,
        new AwalePartSlice([
            [0, 0, 0, 0, 0, 1],
            [0, 1, 2, 3, 4, 4],
        ], 0, [0, 0]),
        AwaleMove.FIVE,
        $localize`Aussi, dès qu'un joueur ne peut plus jouer, l’autre joueur capture toutes les graines dans son propre camp.
         Ici, c'était au premier joueur de jouer et joueur deux a récolté toutes les graines restantes.`,
    ),
];
