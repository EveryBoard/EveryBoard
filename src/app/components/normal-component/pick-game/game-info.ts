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

export class GameInfo {

    private static ALL_GAMES: GameInfo[] = []; // Initialized like a singleton

    // Games sorted by creation date
    public static getAllGames(): GameInfo[] {
        if (GameInfo.ALL_GAMES.length === 0) {
            GameInfo.fillAllGames();
        }
        return GameInfo.ALL_GAMES;
    }

    // eslint-disable-next-line max-lines-per-function
    private static fillAllGames(): void {
        GameInfo.ALL_GAMES = [
            new GameInfo($localize`Four in a Row`,          'P4',                    new P4Tutorial(),                    P4Rules.get(),                    new Date('2018-08-28'), GameDescription.P4()                    ), //                             * Martin
            new GameInfo($localize`Awalé`,                  'Awale',                 new AwaleTutorial(),                 AwaleRules.get(),                 new Date('2018-11-29'), GameDescription.AWALE()                 ), // 93 days after P4            * Martin
            new GameInfo($localize`Quarto`,                 'Quarto',                new QuartoTutorial(),                QuartoRules.get(),                new Date('2018-12-09'), GameDescription.QUARTO()                ), // 10 days after Awale         * Martin
            new GameInfo($localize`Tablut`,                 'Tablut',                new TablutTutorial(),                TablutRules.get(),                new Date('2018-12-27'), GameDescription.TABLUT()                ), // 26 days after Quarto        * Martin

            new GameInfo($localize`Reversi`,                'Reversi',               new ReversiTutorial(),               ReversiRules.get(),               new Date('2019-01-16'), GameDescription.REVERSI()               ), // 20 days after Tablut        * Martin
            new GameInfo($localize`Go`,                     'Go',                    new GoTutorial(),                    GoRules.get(),                    new Date('2019-12-21'), GameDescription.GO()                    ), // 11 months after Reversi     * Martin
            new GameInfo($localize`Encapsule`,              'Encapsule',             new EncapsuleTutorial(),             EncapsuleRules.get(),             new Date('2019-12-30'), GameDescription.ENCAPSULE()             ), // 9 days after Go             * Martin

            new GameInfo($localize`Siam`,                   'Siam',                  new SiamTutorial(),                  SiamRules.get(),                  new Date('2020-01-11'), GameDescription.SIAM()                  ), // 12 days after Encapsule     * Martin
            new GameInfo($localize`Sahara`,                 'Sahara',                new SaharaTutorial(),                SaharaRules.get(),                new Date('2020-02-29'), GameDescription.SAHARA()                ), // 49 days after Siam          * Martin
            new GameInfo($localize`Pylos`,                  'Pylos',                 new PylosTutorial(),                 PylosRules.get(),                 new Date('2020-10-02'), GameDescription.PYLOS()                 ), // 7 months after Sahara       * Martin
            new GameInfo($localize`Kamisado`,               'Kamisado',              new KamisadoTutorial(),              KamisadoRules.get(),              new Date('2020-10-03'), GameDescription.KAMISADO()              ), // 26 days after joining       * Quentin
            new GameInfo($localize`Quixo`,                  'Quixo',                 new QuixoTutorial(),                 QuixoRules.get(),                 new Date('2020-10-15'), GameDescription.QUIXO()                 ), // 13 days after Pylos         * Martin
            new GameInfo($localize`Dvonn`,                  'Dvonn',                 new DvonnTutorial(),                 DvonnRules.get(),                 new Date('2020-10-21'), GameDescription.DVONN()                 ), // 18 days after Kamisado      * Quentin

            new GameInfo($localize`Epaminondas`,            'Epaminondas',           new EpaminondasTutorial(),           EpaminondasRules.get(),           new Date('2021-01-16'), GameDescription.EPAMINONDAS()           ), // 22 days after Quixo         * Martin
            new GameInfo($localize`Gipf`,                   'Gipf',                  new GipfTutorial(),                  GipfRules.get(),                  new Date('2021-02-22'), GameDescription.GIPF()                  ), // 4 months after Dvonn        * Quentin
            new GameInfo($localize`Coerceo`,                'Coerceo',               new CoerceoTutorial(),               CoerceoRules.get(),               new Date('2021-03-21'), GameDescription.COERCEO()               ), // 76 days after Epaminondas   * Martin
            new GameInfo($localize`Six`,                    'Six',                   new SixTutorial(),                   SixRules.get(),                   new Date('2021-04-08'), GameDescription.SIX()                   ), // 18 days after Coerceo       * Martin
            new GameInfo($localize`Lines of Action`,        'LinesOfAction',         new LinesOfActionTutorial(),         LinesOfActionRules.get(),         new Date('2021-04-28'), GameDescription.LINES_OF_ACTION()       ),      // 65 days after Gipf          * Quentin
            new GameInfo($localize`Pentago`,                'Pentago',               new PentagoTutorial(),               PentagoRules.get(),               new Date('2021-05-23'), GameDescription.PENTAGO()               ), // 25 days after Six           * Martin
            new GameInfo($localize`Abalone`,                'Abalone',               new AbaloneTutorial(),               AbaloneRules.get(),               new Date('2021-07-13'), GameDescription.ABALONE()               ), // 71 days after Pentago       * Martin
            new GameInfo($localize`Yinsh`,                  'Yinsh',                 new YinshTutorial(),                 YinshRules.get(),                 new Date('2021-07-31'), GameDescription.YINSH()                 ), // 94 days after LinesOfAction * Quentin
            new GameInfo($localize`Apagos`,                 'Apagos',                new ApagosTutorial(),                ApagosRules.get(),                new Date('2021-11-04'), GameDescription.APAGOS()                ), // 4 month after Abalone       * Martin
            new GameInfo($localize`Diam`,                   'Diam',                  new DiamTutorial(),                  DiamRules.get(),                  new Date('2021-11-30'), GameDescription.DIAM()                  ), // 4 months after Yinsh        * Quentin
            new GameInfo($localize`Brandhub`,               'Brandhub',              new BrandhubTutorial(),              BrandhubRules.get(),              new Date('2021-12-07'), GameDescription.BRANDHUB()              ), // 33 days after Apagos        * Martin
            new GameInfo($localize`Conspirateurs`,          'Conspirateurs',         new ConspirateursTutorial(),         ConspirateursRules.get(),         new Date('2021-12-30'), GameDescription.CONSPIRATEURS()         ), // 30 days after Diam          * Quentinµ

            new GameInfo($localize`Lodestone`,              'Lodestone',             new LodestoneTutorial(),             LodestoneRules.get(),             new Date('2022-06-24'), GameDescription.LODESTONE()             ), //                             * Quentin
            new GameInfo($localize`Martian Chess`,          'MartianChess',          new MartianChessTutorial(),          MartianChessRules.get(),          new Date('2022-07-01'), GameDescription.MARTIAN_CHESS()         ), //                             * Martin
            new GameInfo($localize`Hnefatafl`,              'Hnefatafl',             new HnefataflTutorial(),             HnefataflRules.get(),             new Date('2022-09-21'), GameDescription.HNEFATAFL()             ), //                             * Martin

            new GameInfo($localize`Hive`,                   'Hive',                  new HiveTutorial(),                  HiveRules.get(),                  new Date('2023-04-02'), GameDescription.HIVE()                  ), //                             * Quentin
            new GameInfo($localize`Trexo`,                  'Trexo',                 new TrexoTutorial(),                 TrexoRules.get(),                 new Date('2023-04-23'), GameDescription.TREXO()                 ), //                             * Martin
            new GameInfo($localize`Lasca`,                  'Lasca',                 new LascaTutorial(),                 LascaRules.get(),                 new Date('2023-05-11'), GameDescription.LASCA()                 ), //                             * Martin
            new GameInfo($localize`Connect Six`,            'ConnectSix',            new ConnectSixTutorial(),            ConnectSixRules.get(),            new Date('2023-05-13'), GameDescription.CONNECT_SIX()           ), //                             * Martin
            new GameInfo($localize`Pente`,                  'Pente',                 new PenteTutorial(),                 PenteRules.get(),                 new Date('2023-05-20'), GameDescription.PENTE()                 ), //                             * Quentin
            new GameInfo($localize`Teeko`,                  'Teeko',                 new TeekoTutorial(),                 TeekoRules.get(),                 new Date('2023-07-30'), GameDescription.TEEKO()                 ), //                             * Martin
            new GameInfo($localize`Kalah`,                  'Kalah',                 new KalahTutorial(),                 KalahRules.get(),                 new Date('2023-09-07'), GameDescription.KALAH()                 ), //                             * Martin
            new GameInfo($localize`Diaballik`,              'Diaballik',             new DiaballikTutorial(),             DiaballikRules.get(),             new Date('2023-11-18'), GameDescription.DIABALLIK()             ), //                             * Quentin

            new GameInfo($localize`Ba-awa`,                 'BaAwa',                 new BaAwaTutorial(),                 BaAwaRules.get(),                 new Date('2024-01-28'), GameDescription.BA_AWA()                ), //                             * Martin
            new GameInfo($localize`Squarz`,                 'Squarz',                new SquarzTutorial(),                SquarzRules.get(),                new Date('2024-05-08'), GameDescription.SQUARZ()                ), //                             * Martin
            new GameInfo($localize`Hexodia`,                'Hexodia',               new HexodiaTutorial(),               HexodiaRules.get(),               new Date('2024-06-26'), GameDescription.HEXODIA()               ), //                             * Martin
            new GameInfo($localize`Trigo`,                  'Trigo',                 new TrigoTutorial(),                 TrigoRules.get(),                 new Date('2024-06-29'), GameDescription.TRI_GO()                ), //                             * Martin
            new GameInfo($localize`International Checkers`, 'InternationalCheckers', new InternationalCheckersTutorial(), InternationalCheckersRules.get(), new Date('2024-10-08'), GameDescription.INTERNATIONAL_CHECKERS()), //                             * Martin
        ].sort((a: GameInfo, b: GameInfo) => a.name.localeCompare(b.name));
        // After Apagos: median = 26d; average = 53d
        // 9d 10d 12d 13d 18d - 18d 20d 22d 25d 26d - (26d) - 49d 65d 71d 76d 93d - 94j 4m 4m 7m 11m
    }

    public static getByUrlName(urlName: string): MGPOptional<GameInfo> {
        const games: GameInfo[] = GameInfo.getAllGames().filter((gameInfo: GameInfo) => gameInfo.urlName === urlName);
        Utils.assert(games.length <= 1, `There should only be one game matching $urlName!`);
        if (games.length === 0) {
            return MGPOptional.empty();
        } else {
            return MGPOptional.of(games[0]);
        }
    }

    public static getStateProvider(urlName: string): MGPOptional<(config: MGPOptional<RulesConfig>) => GameState> {
        return GameInfo.getByUrlName(urlName).map((info: GameInfo) => {
            return (config: MGPOptional<RulesConfig>) => {
                return info.rules.getInitialState(config);
            };
        });
    }

    public constructor(public readonly name: string,
                       public readonly urlName: string,
                       public readonly tutorial: Tutorial,
                       public readonly rules: AbstractRules,
                       public readonly creationDate: Date,
                       public readonly description: string,
                       public readonly display: boolean = true)
    {
    }

    public getRulesConfigDescription(): MGPOptional<RulesConfigDescription<RulesConfig>> {
        return this.rules.getRulesConfigDescription();
    }

    public getRulesConfig(): MGPOptional<RulesConfig> {
        const description: MGPOptional<RulesConfigDescription<RulesConfig>> = this.getRulesConfigDescription();
        if (description.isPresent()) {
            return MGPOptional.of(description.get().getDefaultConfig().config);
        } else {
            return MGPOptional.empty();
        }
    }

}
