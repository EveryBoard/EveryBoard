import { Component, EventEmitter, Output, Type } from '@angular/core';
import { AwaleComponent } from 'src/app/games/awale/awale.component';
import { CoerceoComponent } from 'src/app/games/coerceo/coerceo.component';
import { DvonnComponent } from 'src/app/games/dvonn/dvonn.component';
import { EncapsuleComponent } from 'src/app/games/encapsule/encapsule.component';
import { EpaminondasComponent } from 'src/app/games/epaminondas/epaminondas.component';
import { GipfComponent } from 'src/app/games/gipf/gipf.component';
import { GoComponent } from 'src/app/games/go/go.component';
import { KamisadoComponent } from 'src/app/games/kamisado/kamisado.component';
import { LinesOfActionComponent } from 'src/app/games/lines-of-action/LinesOfAction.component';
import { MinimaxTestingComponent } from 'src/app/games/minimax-testing/minimax-testing.component';
import { P4Component } from 'src/app/games/p4/p4.component';
import { PentagoComponent } from 'src/app/games/pentago/Pentago.component';
import { PylosComponent } from 'src/app/games/pylos/pylos.component';
import { QuartoComponent } from 'src/app/games/quarto/quarto.component';
import { QuixoComponent } from 'src/app/games/quixo/quixo.component';
import { ReversiComponent } from 'src/app/games/reversi/reversi.component';
import { SaharaComponent } from 'src/app/games/sahara/sahara.component';
import { SiamComponent } from 'src/app/games/siam/siam.component';
import { SixComponent } from 'src/app/games/six/six.component';
import { TablutComponent } from 'src/app/games/tablut/tablut.component';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { Move } from 'src/app/jscaip/Move';
import { AbstractGameComponent } from '../../game-components/abstract-game-component/AbstractGameComponent';

class GameDescription {

    public static readonly AWALE: string = $localize`The international version of the more famous african strategy game!`;

    public static readonly ENCAPSULE: string = $localize`An enhanced tic-tac-toe where piece can encapsule other and prevent them to win.`;

    public static readonly EPAMINONDAS: string = $localize`An antiquity-war inspired game. Be the first to pierce ennemy lines!`;

    public static readonly GO: string = $localize`The oldest strategy game still practiced widely. A territory control game.`;

    public static readonly P4: string = $localize`The classical 4 in a row game!`;

    public static readonly PENTAGO: string = $localize`Drop a piece, then rotate the board, be the first to align 5 of your pieces to win!`;

    public static readonly PYLOS: string = $localize`Overlay your pieces and use two game mechanics to conserve your pieces. First player to run out of pieces loose!`;

    public static readonly SAHARA: string = $localize`Immobilize one of your ennemy's pyramids before he immobilize one of yours!`;

    public static readonly SIAM: string = $localize`Be the first to push a mountain out of the board!`;

    public static readonly SIX: string = $localize`Put your hexagonals pieces next to another one, and create one of the 3 victorious shapes to win!`;

    public static readonly TABLUT: string = $localize`The vikings checkers! Invaders must capture the King, defender must make him escape!`;
}

export class GameInfo {
    // Games sorted by creation date
    public static ALL_GAMES: GameInfo[] = [
        new GameInfo('MinimaxTesting', 'MinimaxTesting', MinimaxTestingComponent, new Date('1970-01-01'), '', false),

        new GameInfo($localize`Four in a Row`, 'P4', P4Component, new Date('2018-08-28'), GameDescription.P4),
        new GameInfo($localize`Awalé`, 'Awale', AwaleComponent, new Date('2018-11-29'), GameDescription.AWALE), // 93 days after P4
        new GameInfo($localize`Quarto`, 'Quarto', QuartoComponent, new Date('2018-12-09')), // 10 days after Awale
        new GameInfo($localize`Tablut`, 'Tablut', TablutComponent, new Date('2018-12-27'), GameDescription.TABLUT), // 26 days after Quarto
        new GameInfo($localize`Reversi`, 'Reversi', ReversiComponent, new Date('2019-01-16')), // 20 days after Tablut)
        new GameInfo($localize`Go`, 'Go', GoComponent, new Date('2019-12-21'), GameDescription.GO), // 11 months after Reversi
        new GameInfo($localize`Encapsule`, 'Encapsule', EncapsuleComponent, new Date('2019-12-30'), GameDescription.ENCAPSULE), // 9 days after Go
        new GameInfo($localize`Siam`, 'Siam', SiamComponent, new Date('2020-01-11'), GameDescription.SIAM), // 12 days after Encapsule
        new GameInfo($localize`Sahara`, 'Sahara', SaharaComponent, new Date('2020-02-29'), GameDescription.SAHARA), // 49 days after Siam
        new GameInfo($localize`Pylos`, 'Pylos', PylosComponent, new Date('2020-10-02'), GameDescription.PYLOS), // 7 months after Sahara
        new GameInfo($localize`Kamisado`, 'Kamisado', KamisadoComponent, new Date('2020-10-03')), // 26 days after joining *Quentin
        new GameInfo($localize`Quixo`, 'Quixo', QuixoComponent, new Date('2020-10-15')), // 13 days after Pylos
        new GameInfo($localize`Dvonn`, 'Dvonn', DvonnComponent, new Date('2020-10-21')), // 18 days after Kamisado *Quentin
        new GameInfo($localize`Epaminondas`, 'Epaminondas', EpaminondasComponent, new Date('2021-01-16'), GameDescription.EPAMINONDAS), // 22 days after Quixo
        new GameInfo($localize`Gipf`, 'Gipf', GipfComponent, new Date('2021-02-22')), // 4 months after Dvonn *Quentin
        new GameInfo($localize`Coerceo`, 'Coerceo', CoerceoComponent, new Date('2021-03-21')), // 76 days after Epaminondas
        new GameInfo($localize`Six`, 'Six', SixComponent, new Date('2021-04-08'), GameDescription.SIX), // 18 days after Coerceo
        new GameInfo($localize`Lines of Action`, 'LinesOfAction', LinesOfActionComponent, new Date('2020-04-28')), // 65 days after Gipf *Quentin
        new GameInfo($localize`Pentago`, 'Pentago', PentagoComponent, new Date('2021-05-23'), GameDescription.PENTAGO), // 25 days after Six
    ].sort((a: GameInfo, b: GameInfo) => a.name.localeCompare(b.name));
    // After Gipf: median = 26d; average = 34d
    // 9d 10d 12d 13d 18d - 18d 20d 22d (25d 26d) 26d 49d 65d - 76d 93d 4m 7m 11m

    public constructor(public readonly name: string,
                       public readonly urlName: string,
                       public readonly component: Type<AbstractGameComponent<Move, GamePartSlice>>,
                       public readonly creationDate: Date,
                       public readonly description: string = '',
                       public readonly display: boolean = true) {
    }
}

@Component({
    selector: 'app-pick-game',
    templateUrl: './pick-game.component.html',
})
export class PickGameComponent {

    public readonly gameNameList: ReadonlyArray<string> =
        GameInfo.ALL_GAMES
            .filter((game: GameInfo) => game.display === true)
            .map((game: GameInfo): string => game.urlName);


    @Output('pickGame') pickGame: EventEmitter<string> = new EventEmitter<string>();

    public onChange(game: string): void {
        this.pickGame.emit(game);
    }
}
