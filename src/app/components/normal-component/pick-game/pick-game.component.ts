import { Component, EventEmitter, Output } from '@angular/core';

export class GameInfo {
    // Games sorted by creation date
    public static ALL_GAMES: GameInfo[] = [
        new GameInfo('Puissance 4', 'P4', new Date('2018-08-28')),
        new GameInfo('Awalé', 'Awale', new Date('2018-11-29'), 'Description'), // 93 days after P4
        new GameInfo('Quarto', 'Quarto', new Date('2018-12-09')), // 10 days after Awale
        new GameInfo('Tablut', 'Tablut', new Date('2018-12-27')), // 26 days after Quarto
        new GameInfo('Reversi', 'Reversi', new Date('2019-01-16')), // 20 days after Tablut)
        new GameInfo('Go', 'Go', new Date('2019-12-21')), // 11 months after Reversi
        new GameInfo('Encapsule', 'Encapsule', new Date('2019-12-30')), // 9 days after Go
        new GameInfo('Siam', 'Siam', new Date('2020-01-11')), // 12 days after Encapsule
        new GameInfo('Sahara', 'Sahara', new Date('2020-02-29')), // 49 days after Siam
        new GameInfo('Pylos', 'Pylos', new Date('2020-10-02')), // 7 months after Sahara
        new GameInfo('Kamisado', 'Kamisado', new Date('2020-10-03')), // 26 days after joining *Quentin
        new GameInfo('Quixo', 'Quixo', new Date('2020-10-15')), // 13 days after Pylos
        new GameInfo('Dvonn', 'Dvonn', new Date('2020-10-21')), // 18 days after Kamisado *Quentin
        new GameInfo('Epaminondas', 'Epaminondas', new Date('2021-01-16')), // 22 days after Quixo
        new GameInfo('Gipf', 'Gipf', new Date('2021-02-22')), // 4 months after Dvonn *Quentin
        new GameInfo('Coerceo', 'Coerceo', new Date('2021-03-21')), // 76 days after Epaminondas
        new GameInfo('Six', 'Six', new Date('2021-04-08')), // 18 days after Coerceo
        new GameInfo('Lines of Action', 'LinesOfAction', new Date('2020-04-28')), // 65 days after Gipf *Quentin
    ].sort((a: GameInfo, b: GameInfo) => a.name.localeCompare(b.name));
    // After Gipf: median = 26d; average = 34d
    // 9d 10d 12d 13d 18d - 18d 20d 22d (26d) 26d 49d 65d - 76d 93d 4m 7m 11m

    public constructor(public readonly name: string,
                       public readonly urlName: string,
                       public readonly creationDate: Date,
                       public readonly description?: string) {
    }
}

@Component({
    selector: 'app-pick-game',
    templateUrl: './pick-game.component.html',
    styleUrls: ['./pick-game.component.css'],
})
export class PickGameComponent {

    public readonly gameNameList: ReadonlyArray<string> =
        GameInfo.ALL_GAMES.map((game: GameInfo): string => game.urlName)

    @Output('pickGame') pickGame: EventEmitter<string> = new EventEmitter<string>();

    public onChange(game: string): void {
        this.pickGame.emit(game);
    }
}
