/* eslint-disable @typescript-eslint/no-unused-vars */ // TODO: remove this AND FILL AI INFO
/* eslint-disable no-multi-spaces */
import { MGPOptional, Utils } from '@everyboard/lib';

import { AbaloneRules } from '../../../games/abalone/AbaloneRules';
import { AbaloneTutorial } from '../../../games/abalone/AbaloneTutorial';
import { ApagosRules } from '../../../games/apagos/ApagosRules';
import { ApagosTutorial } from '../../../games/apagos/ApagosTutorial';
import { AwaleRules } from '../../../games/mancala/awale/AwaleRules';
import { AwaleTutorial } from '../../../games/mancala/awale/AwaleTutorial';

import { BaAwaRules } from '../../../games/mancala/ba-awa/BaAwaRules';
import { BaAwaTutorial } from '../../../games/mancala/ba-awa/BaAwaTutorial';
import { BrandhubRules } from '../../../games/tafl/brandhub/BrandhubRules';
import { BrandhubTutorial } from '../../../games/tafl/brandhub/BrandhubTutorial';

import { ConnectSixRules } from '../../../games/connect-six/ConnectSixRules';
import { ConnectSixTutorial } from '../../../games/connect-six/ConnectSixTutorial';
import { ConspirateursRules } from '../../../games/conspirateurs/ConspirateursRules';
import { ConspirateursTutorial } from '../../../games/conspirateurs/ConspirateursTutorial';

import { CoerceoRules } from '../../../games/coerceo/CoerceoRules';
import { CoerceoTutorial } from '../../../games/coerceo/CoerceoTutorial';

import { DiaballikRules } from '../../../games/diaballik/DiaballikRules';
import { DiaballikTutorial } from '../../../games/diaballik/DiaballikTutorial';
import { DiamRules } from '../../../games/diam/DiamRules';
import { DiamTutorial } from '../../../games/diam/DiamTutorial';
import { DvonnRules } from '../../../games/dvonn/DvonnRules';
import { DvonnTutorial } from '../../../games/dvonn/DvonnTutorial';

import { EncapsuleRules } from '../../../games/encapsule/EncapsuleRules';
import { EncapsuleTutorial } from '../../../games/encapsule/EncapsuleTutorial';
import { EpaminondasRules } from '../../../games/epaminondas/EpaminondasRules';
import { EpaminondasTutorial } from '../../../games/epaminondas/EpaminondasTutorial';

import { GipfRules } from '../../../games/gipf/GipfRules';
import { GipfTutorial } from '../../../games/gipf/GipfTutorial';
import { GoRules } from '../../../games/gos/go/GoRules';
import { GoTutorial } from '../../../games/gos/go/GoTutorial';

import { HexodiaRules } from '../../../games/hexodia/HexodiaRules';
import { HexodiaTutorial } from '../../../games/hexodia/HexodiaTutorial';
import { HiveRules } from '../../../games/hive/HiveRules';
import { HiveTutorial } from '../../../games/hive/HiveTutorial';
import { HnefataflRules } from '../../../games/tafl/hnefatafl/HnefataflRules';
import { HnefataflTutorial } from '../../../games/tafl/hnefatafl/HnefataflTutorial';

import { InternationalCheckersRules } from '../../../games/checkers/international-checkers/InternationalCheckersRules';
import { InternationalCheckersTutorial } from '../../../games/checkers/international-checkers/InternationalCheckersTutorial';

import { KalahRules } from '../../../games/mancala/kalah/KalahRules';
import { KalahTutorial } from '../../../games/mancala/kalah/KalahTutorial';
import { KamisadoRules } from '../../../games/kamisado/KamisadoRules';
import { KamisadoTutorial } from '../../../games/kamisado/KamisadoTutorial';

import { LascaRules } from '../../../games/checkers/lasca/LascaRules';
import { LascaTutorial } from '../../../games/checkers/lasca/LascaTutorial';
import { LinesOfActionRules } from '../../../games/lines-of-action/LinesOfActionRules';
import { LinesOfActionTutorial } from '../../../games/lines-of-action/LinesOfActionTutorial';
import { LodestoneRules } from '../../../games/lodestone/LodestoneRules';
import { LodestoneTutorial } from '../../../games/lodestone/LodestoneTutorial';

import { MartianChessRules } from '../../../games/martian-chess/MartianChessRules';
import { MartianChessTutorial } from '../../../games/martian-chess/MartianChessTutorial';

import { P4MoveGenerator } from '../../../games/p4/P4MoveGenerator';
import { P4Rules } from '../../../games/p4/P4Rules';
import { P4Tutorial } from '../../../games/p4/P4Tutorial';
import { PentagoRules } from '../../../games/pentago/PentagoRules';
import { PentagoTutorial } from '../../../games/pentago/PentagoTutorial';
import { PenteRules } from '../../../games/pente/PenteRules';
import { PenteTutorial } from '../../../games/pente/PenteTutorial';
import { PylosRules } from '../../../games/pylos/PylosRules';
import { PylosTutorial } from '../../../games/pylos/PylosTutorial';

import { QuartoRules } from '../../../games/quarto/QuartoRules';
import { QuartoTutorial } from '../../../games/quarto/QuartoTutorial';
import { QuixoRules } from '../../../games/quixo/QuixoRules';
import { QuixoTutorial } from '../../../games/quixo/QuixoTutorial';

import { ReversiMinimax } from '../../../games/reversi/ReversiMinimax';
import { ReversiMoveGenerator } from '../../../games/reversi/ReversiMoveGenerator';
import { ReversiRules } from '../../../games/reversi/ReversiRules';
import { ReversiTutorial } from '../../../games/reversi/ReversiTutorial';

import { SaharaRules } from '../../../games/sahara/SaharaRules';
import { SaharaTutorial } from '../../../games/sahara/SaharaTutorial';
import { SiamRules } from '../../../games/siam/SiamRules';
import { SiamTutorial } from '../../../games/siam/SiamTutorial';
import { SixRules } from '../../../games/six/SixRules';
import { SixTutorial } from '../../../games/six/SixTutorial';
import { SquarzRules } from '../../../games/squarz/SquarzRules';
import { SquarzTutorial } from '../../../games/squarz/SquarzTutorial';

import { TablutRules } from '../../../games/tafl/tablut/TablutRules';
import { TablutTutorial } from '../../../games/tafl/tablut/TablutTutorial';
import { TeekoRules } from '../../../games/teeko/TeekoRules';
import { TeekoTutorial } from '../../../games/teeko/TeekoTutorial';
import { TrexoRules } from '../../../games/trexo/TrexoRules';
import { TrexoTutorial } from '../../../games/trexo/TrexoTutorial';
import { TrigoRules } from '../../../games/gos/trigo/TrigoRules';
import { TrigoTutorial } from '../../../games/gos/trigo/TrigoTutorial';

import { YinshRules } from '../../../games/yinsh/YinshRules';
import { YinshTutorial } from '../../../games/yinsh/YinshTutorial';

import { AbstractRules } from '../../../jscaip/Rules';
import { Tutorial } from '../../wrapper-components/tutorial-game-wrapper/TutorialStep';
import { RulesConfigDescription } from '../../wrapper-components/rules-configuration/RulesConfigDescription';
import { RulesConfig } from '../../../jscaip/RulesConfigUtil';
import { GameState } from '../../../jscaip/state/GameState';
import { GameDescription } from './game-description';
import { AI, AIOptions } from '../../../jscaip/AI/AI';
import { Move } from '../../../jscaip/Move';
import { P4Minimax } from '../../../games/p4/P4Minimax';
import { MCTS } from '../../../jscaip/AI/MCTS';

const p4AIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [
    new P4Minimax(),
    new MCTS($localize`MCTS`, new P4MoveGenerator(), P4Rules.get()),
];
const awaleAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const quartoAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const tablutAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const reversiAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [
    new ReversiMinimax(),
    new MCTS($localize`MCTS`, new ReversiMoveGenerator(), ReversiRules.get()),
];
const goAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const encapsuleAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const siamAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const saharaAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const pylosAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const kamisadoAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const quixoAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const dvonnAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const epaminondasAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const gipfAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const coerceoAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const sixAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const linesOfActionAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const pentagoAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const abaloneAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const yinshAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const apagosAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const diamAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const brandhubAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const conspirateursAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const lodestoneAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const martianChessAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const hnefataflAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const hiveAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const trexoAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const lascaAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const connectSixAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const penteAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const teekoAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const kalahAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const diaballikAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const baAwaAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const squarzAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const hexodiaAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const trigoAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];
const internationalCheckersAIList: AI<Move, GameState, AIOptions, RulesConfig>[] = [];

export class AIInfo {

    private static ALL_GAMES: AIInfo[] = []; // Initialized like a singleton

    // Games sorted by creation date
    public static getAllGames(): AIInfo[] {
        if (AIInfo.ALL_GAMES.length === 0) {
            AIInfo.fillAllGames();
        }
        return AIInfo.ALL_GAMES;
    }

    // eslint-disable-next-line max-lines-per-function
    private static fillAllGames(): void {
        AIInfo.ALL_GAMES = [
            new AIInfo('P4',                    p4AIList                   ), //                             * Martin
            new AIInfo('Awale',                 awaleAIList                ), // 93 days after P4            * Martin
            new AIInfo('Quarto',                quartoAIList               ), // 10 days after Awale         * Martin
            new AIInfo('Tablut',                tablutAIList               ), // 26 days after Quarto        * Martin
            new AIInfo('Reversi',               reversiAIList              ), // 20 days after Tablut        * Martin
            new AIInfo('Go',                    goAIList                   ), // 11 months after Reversi     * Martin
            new AIInfo('Encapsule',             encapsuleAIList            ), // 9 days after Go             * Martin
            new AIInfo('Siam',                  siamAIList                 ), // 12 days after Encapsule     * Martin
            new AIInfo('Sahara',                saharaAIList               ), // 49 days after Siam          * Martin
            new AIInfo('Pylos',                 pylosAIList                ), // 7 months after Sahara       * Martin
            new AIInfo('Kamisado',              kamisadoAIList             ), // 26 days after joining       * Quentin
            new AIInfo('Quixo',                 quixoAIList                ), // 13 days after Pylos         * Martin
            new AIInfo('Dvonn',                 dvonnAIList                ), // 18 days after Kamisado      * Quentin
            new AIInfo('Epaminondas',           epaminondasAIList          ), // 22 days after Quixo         * Martin
            new AIInfo('Gipf',                  gipfAIList                 ), // 4 months after Dvonn        * Quentin
            new AIInfo('Coerceo',               coerceoAIList              ), // 76 days after Epaminondas   * Martin
            new AIInfo('Six',                   sixAIList                  ), // 18 days after Coerceo       * Martin
            new AIInfo('LinesOfAction',         linesOfActionAIList        ), // 65 days after Gipf          * Quentin
            new AIInfo('Pentago',               pentagoAIList              ), // 25 days after Six           * Martin
            new AIInfo('Abalone',               abaloneAIList              ), // 71 days after Pentago       * Martin
            new AIInfo('Yinsh',                 yinshAIList                ), // 94 days after LinesOfAction * Quentin
            new AIInfo('Apagos',                apagosAIList               ), // 4 month after Abalone       * Martin
            new AIInfo('Diam',                  diamAIList                 ), // 4 months after Yinsh        * Quentin
            new AIInfo('Brandhub',              brandhubAIList             ), // 33 days after Apagos        * Martin
            new AIInfo('Conspirateurs',         conspirateursAIList        ), // 30 days after Diam          * Quentin
            new AIInfo('Lodestone',             lodestoneAIList            ), //                             * Quentin
            new AIInfo('MartianChess',          martianChessAIList         ), //                             * Martin
            new AIInfo('Hnefatafl',             hnefataflAIList            ), //                             * Martin
            new AIInfo('Hive',                  hiveAIList                 ), //                             * Quentin
            new AIInfo('Trexo',                 trexoAIList                ), //                             * Martin
            new AIInfo('Lasca',                 lascaAIList                ), //                             * Martin
            new AIInfo('ConnectSix',            connectSixAIList           ), //                             * Martin
            new AIInfo('Pente',                 penteAIList                ), //                             * Quentin
            new AIInfo('Teeko',                 teekoAIList                ), //                             * Martin
            new AIInfo('Kalah',                 kalahAIList                ), //                             * Martin
            new AIInfo('Diaballik',             diaballikAIList            ), //                             * Quentin
            new AIInfo('BaAwa',                 baAwaAIList                ), //                             * Martin
            new AIInfo('Squarz',                squarzAIList               ), //                             * Martin
            new AIInfo('Hexodia',               hexodiaAIList              ), //                             * Martin
            new AIInfo('Trigo',                 trigoAIList                ), //                             * Martin
            new AIInfo('InternationalCheckers', internationalCheckersAIList), //                             * Martin
            new AIInfo('QuebecCastles',         []                         ), //                             * Martin
        ].sort((a: AIInfo, b: AIInfo) => a.urlName.localeCompare(b.urlName));
        // After Apagos: median = 26d; average = 53d
        // 9d 10d 12d 13d 18d - 18d 20d 22d 25d 26d - (26d) - 49d 65d 71d 76d 93d - 94j 4m 4m 7m 11m
    }

    public static getByUrlName(urlName: string): MGPOptional<AIInfo> {
        const games: AIInfo[] = AIInfo.getAllGames().filter((gameInfo: AIInfo) => gameInfo.urlName === urlName);
        Utils.assert(games.length <= 1, `There should only be one game matching $urlName!`);
        if (games.length === 0) {
            return MGPOptional.empty();
        } else {
            return MGPOptional.of(games[0]);
        }
    }

    public constructor(public readonly urlName: string,
                       public readonly ais: AI<Move, GameState, AIOptions, RulesConfig>[],
                       public readonly display: boolean = true)
    {
    }
}
