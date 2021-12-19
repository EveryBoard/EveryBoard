import { Component, EventEmitter, Output, Type } from '@angular/core';
import { AbaloneComponent } from 'src/app/games/abalone/abalone.component';
import { ApagosComponent } from 'src/app/games/apagos/apagos.component';
import { AwaleComponent } from 'src/app/games/awale/awale.component';
import { BrandhubComponent } from 'src/app/games/tafl/brandhub/brandhub.component';
import { CoerceoComponent } from 'src/app/games/coerceo/coerceo.component';
import { DiamComponent } from 'src/app/games/diam/diam.component';
import { DvonnComponent } from 'src/app/games/dvonn/dvonn.component';
import { EncapsuleComponent } from 'src/app/games/encapsule/encapsule.component';
import { EpaminondasComponent } from 'src/app/games/epaminondas/epaminondas.component';
import { GipfComponent } from 'src/app/games/gipf/gipf.component';
import { GoComponent } from 'src/app/games/go/go.component';
import { KamisadoComponent } from 'src/app/games/kamisado/kamisado.component';
import { LinesOfActionComponent } from 'src/app/games/lines-of-action/lines-of-action.component';
import { MinimaxTestingComponent } from 'src/app/games/minimax-testing/minimax-testing.component';
import { P4Component } from 'src/app/games/p4/p4.component';
import { PentagoComponent } from 'src/app/games/pentago/pentago.component';
import { PylosComponent } from 'src/app/games/pylos/pylos.component';
import { QuartoComponent } from 'src/app/games/quarto/quarto.component';
import { QuixoComponent } from 'src/app/games/quixo/quixo.component';
import { ReversiComponent } from 'src/app/games/reversi/reversi.component';
import { SaharaComponent } from 'src/app/games/sahara/sahara.component';
import { SiamComponent } from 'src/app/games/siam/siam.component';
import { SixComponent } from 'src/app/games/six/six.component';
import { TablutComponent } from 'src/app/games/tafl/tablut/tablut.component';
import { YinshComponent } from 'src/app/games/yinsh/yinsh.component';
import { AbstractGameComponent } from '../../game-components/game-component/GameComponent';
import { Localized } from 'src/app/utils/LocaleUtils';

class GameDescription {

    public static readonly ABALONE: Localized = () => $localize`Use simple mechanics to push 6 of the opponent's pieces out of the board!`;

    public static readonly APAGOS: Localized = () => $localize`Very simple game, but, will you be able to win everytime?`;

    public static readonly AWALE: Localized = () => $localize`The international version of the famous African strategy game!`;

    public static readonly BRANDHUB: Localized = () => $localize`The Irish version of the Tafl game family!`;

    public static readonly COERCEO: Localized = () => $localize`Get rid of all of your opponent's pieces on a board that shrinks little by little!`;

    public static readonly DIAM: Localized = () => $localize`Drop your pieces and move them around to align two pieces of the same color across the board to win!`;

    public static readonly DVONN: Localized = () => $localize`Stack your pieces and control as many stacks as you can to win!`;

    public static readonly ENCAPSULE: Localized = () => $localize`An enhanced tic-tac-toe where piece can encapsule other and prevent them to win.`;

    public static readonly EPAMINONDAS: Localized = () => $localize`An antiquity-war inspired game. Be the first to pierce your opponent's lines!`;

    public static readonly GIPF: Localized = () => $localize`A hexagonal game of alignment. Insert your pieces on the board to capture your opponent's pieces!`;

    public static readonly GO: Localized = () => $localize`The oldest strategy game still practiced widely. A territory control game.`;

    public static readonly KAMISADO: Localized = () => $localize`Your goal is simple: reach the last line. But the piece you move depends on your opponent's last move!`;

    public static readonly LINES_OF_ACTION: Localized = () => $localize`Regroup your pieces to win. But your possible moves will often change!`;

    public static readonly P4: Localized = () => $localize`The classical 4 in a row game!`;

    public static readonly PENTAGO: Localized = () => $localize`Drop a piece, then rotate a quadrant. The first player to align 5 pieces wins!`;

    public static readonly PYLOS: Localized = () => $localize`Overlay your pieces and use two game mechanics to conserve your pieces. First player to run out of pieces loses!`;

    public static readonly QUARTO: Localized = () => $localize`Create a winning alignment. The problem: you don't pick the piece that you're placing on the board!`;

    public static readonly QUIXO: Localized = () => $localize`Align 5 of your pieces on a board where pieces slide!`;

    public static readonly REVERSI: Localized = () => $localize`Sandwich your opponent's pieces to dominate the board!`;

    public static readonly SAHARA: Localized = () => $localize`Immobilize one of your opponent's pyramids before your opponent does!`;

    public static readonly SIAM: Localized = () => $localize`Be the first to push a mountain out of the board!`;

    public static readonly SIX: Localized = () => $localize`Put your hexagonal pieces next to another one, and create one of the 3 victorious shapes to win!`;

    public static readonly TABLUT: Localized = () => $localize`The Viking board game! Invaders must capture the king, defender must make him escape!`;

    public static readonly YINSH: Localized = () => $localize`Align your pieces to score points, but beware, pieces can flip!`;

}

export class GameInfo {
    // Games sorted by creation date
    public static ALL_GAMES: () => GameInfo[] = () => [
        new GameInfo('MinimaxTesting', 'MinimaxTesting', MinimaxTestingComponent, new Date('1970-01-01'), '', false),

        new GameInfo($localize`Four in a Row`, 'P4', P4Component, new Date('2018-08-28'), GameDescription.P4()),
        new GameInfo($localize`Awalé`, 'Awale', AwaleComponent, new Date('2018-11-29'), GameDescription.AWALE()), // 93 days after P4
        new GameInfo($localize`Quarto`, 'Quarto', QuartoComponent, new Date('2018-12-09'), GameDescription.QUARTO()), // 10 days after Awale
        new GameInfo($localize`Tablut`, 'Tablut', TablutComponent, new Date('2018-12-27'), GameDescription.TABLUT()), // 26 days after Quarto

        new GameInfo($localize`Reversi`, 'Reversi', ReversiComponent, new Date('2019-01-16'), GameDescription.REVERSI()), // 20 days after Tablut
        new GameInfo($localize`Go`, 'Go', GoComponent, new Date('2019-12-21'), GameDescription.GO()), // 11 months after Reversi
        new GameInfo($localize`Encapsule`, 'Encapsule', EncapsuleComponent, new Date('2019-12-30'), GameDescription.ENCAPSULE()), // 9 days after Go

        new GameInfo($localize`Siam`, 'Siam', SiamComponent, new Date('2020-01-11'), GameDescription.SIAM()), // 12 days after Encapsule
        new GameInfo($localize`Sahara`, 'Sahara', SaharaComponent, new Date('2020-02-29'), GameDescription.SAHARA()), // 49 days after Siam
        new GameInfo($localize`Pylos`, 'Pylos', PylosComponent, new Date('2020-10-02'), GameDescription.PYLOS()), // 7 months after Sahara
        new GameInfo($localize`Kamisado`, 'Kamisado', KamisadoComponent, new Date('2020-10-03'), GameDescription.KAMISADO()), // 26 days after joining *Quentin
        new GameInfo($localize`Quixo`, 'Quixo', QuixoComponent, new Date('2020-10-15'), GameDescription.QUIXO()), // 13 days after Pylos
        new GameInfo($localize`Dvonn`, 'Dvonn', DvonnComponent, new Date('2020-10-21'), GameDescription.DVONN()), // 18 days after Kamisado *Quentin

        new GameInfo($localize`Epaminondas`, 'Epaminondas', EpaminondasComponent, new Date('2021-01-16'), GameDescription.EPAMINONDAS()), // 22 days after Quixo
        new GameInfo($localize`Gipf`, 'Gipf', GipfComponent, new Date('2021-02-22'), GameDescription.GIPF()), // 4 months after Dvonn *Quentin
        new GameInfo($localize`Coerceo`, 'Coerceo', CoerceoComponent, new Date('2021-03-21'), GameDescription.COERCEO()), // 76 days after Epaminondas
        new GameInfo($localize`Six`, 'Six', SixComponent, new Date('2021-04-08'), GameDescription.SIX()), // 18 days after Coerceo
        new GameInfo($localize`Lines of Action`, 'LinesOfAction', LinesOfActionComponent, new Date('2021-04-28'), GameDescription.LINES_OF_ACTION()), // 65 days after Gipf *Quentin
        new GameInfo($localize`Pentago`, 'Pentago', PentagoComponent, new Date('2021-05-23'), GameDescription.PENTAGO()), // 25 days after Six
        new GameInfo($localize`Abalone`, 'Abalone', AbaloneComponent, new Date('2021-07-13'), GameDescription.ABALONE()), // 71 days after Pentago
        new GameInfo($localize`Yinsh`, 'Yinsh', YinshComponent, new Date('2021-07-31'), GameDescription.YINSH()), // 94 days after LinesOfAction *Quentin
        new GameInfo($localize`Apagos`, 'Apagos', ApagosComponent, new Date('2021-11-04'), GameDescription.APAGOS()), // 4 month after Abalone
        new GameInfo($localize`Diam`, 'Diam', DiamComponent, new Date('2021-11-30'), GameDescription.DIAM()), // 4 months after Yinsh *Quentin
        new GameInfo($localize`Brandhub`, 'Brandhub', BrandhubComponent, new Date('2021-12-07'), GameDescription.BRANDHUB()), // 33 days after Apagos
    ].sort((a: GameInfo, b: GameInfo) => a.name.localeCompare(b.name));
    // After Apagos: median = 26d; average = 53d
    // 9d 10d 12d 13d 18d - 18d 20d 22d 25d 26d - (26d) - 49d 65d 71d 76d 93d - 94j 4m 4m 7m 11m

    public constructor(public readonly name: string,
                       public readonly urlName: string,
                       public readonly component: Type<AbstractGameComponent>,
                       public readonly creationDate: Date,
                       public readonly description: string,
                       public readonly display: boolean = true) {
    }
}

@Component({
    selector: 'app-pick-game',
    templateUrl: './pick-game.component.html',
})
export class PickGameComponent {

    public readonly gameNameList: ReadonlyArray<string> =
        GameInfo.ALL_GAMES()
            .filter((game: GameInfo) => game.display === true)
            .map((game: GameInfo): string => game.urlName);

    @Output('pickGame') pickGame: EventEmitter<string> = new EventEmitter<string>();

    public onChange(event: Event): void {
        const select: HTMLSelectElement = event.target as HTMLSelectElement;
        this.pickGame.emit(select.value);
    }
}
