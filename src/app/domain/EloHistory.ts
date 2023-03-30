import { FirestoreJSONObject } from '../utils/utils';

export interface PlayerEloInfo extends FirestoreJSONObject {
    playerId: string; // playerId: the id of the player (is also the id of it's User Document)
    playerK: number; // K of player before the match
    playerElo: number; // elo of player before the match
    playerScoreChange: number; // the modification to player's elo (positive for win, negative for loose)
}

export interface EloHistory extends FirestoreJSONObject {
    /**
     * gameId: the reference of the game that took place (is also the id of the Part Document)
     * gameType: the name of the game played (P4, ...)
     * playerZeroInfos
     * playerOneInfos
     * status: 'ZERO_WON', 'ONE_WON', 'DRAW'
     * date: the date at which this happend, as a timestamp
     */
    gameId: string;
    gameType: string;
    playerZeroInfos: PlayerEloInfo;
    playerOneInfos: PlayerEloInfo;
    status: 'ZERO_WON' | 'ONE_WON' | 'DRAW';
    date: number;
}


/**
 * Petite Analyse du besoin:
 *
 * le document du joueur doit contenir son ELO Actuel pour chaque jeux auquel il a joué. → ou une sous-collection ELO/méta-données, car pas désirable de télécharger l’ELO d’un joueur en entier si on veut juste afficher son nom
 *
 * Sur sa page perso, un joueur peux voir tout ses différents ELO → oui mais peut-être dans une seconde itération ? (un joueur n’a pas encore de page perso je pense :D)
 *
 * quand un joueur gagne, il doit voir une petite animation augmentant son ELO. → chaud patate ! C’pas très très inspiré de BGA ? Juste augmenter l’ELO dans une première itération me semble bien
 *
 * quand un joueur perd, il doit voir une petite animation diminuant son ELO. → same remark
 *
 * quand un joueur plus faible fait match nul contre un joueur plus fort, il doit voir une petite animation augmentant son ELO. → en gros 3-6 c’est “animer le changement d’ELO” :D Mais je découperais en “changer l’ELO” (partie logique) et “afficher le changement d’ELO” (partie design)
 *
 * quand un joueur plus fort fait match nul contre un joueur plus faible, il doit voir une petite animation diminuant son ELO.
 *
 * Voir “MAKE Minimax Bot”
 *
 * une nouvelle collection doit contenir l’historique des parties et d’ELO affectée [typeJeu, idPartie, joueurZero, joueurUn, ELOZero, ELOUn, KZero, KUn, deltaZero, deltaUn, dateJeu] → hm la victoire/défaite d’une partie est déjà stockée, c’est suffisant non ? Connaître l’ELO actuel des joueurs + savoir s’ils perdent ou gagnent la partie actuelle suffit à recalculer le nouvel ELO ?
 *
 * Les users doivent avoir un rôle changeable uniquement via l’interface DB pour l’instant → hein wat? Un rôle ?
 *
 * Une page doit montrer cette page HistoElo (seulement aux devs) avec multiples filtres: (joueurs, ELO, jeu) → ah, mode admin, y’a pas un ticket déjà ? Et c’est pour simplifier du debug ? Ça me semble overkill pour une première itération de ce ticket. Un ticket “historique des parties” tout court serait bien plus adapté ÀMHA (et il displayerait d’ELO change)
 */