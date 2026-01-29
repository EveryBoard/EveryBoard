/* eslint-disable no-multi-spaces */
import { Component, EventEmitter, Output } from '@angular/core';

import { ThemeService } from '../../../services/ThemeService';
import { GameInfo } from './game-info';

@Component({
    selector: 'app-pick-game',
    templateUrl: './pick-game.component.html',
})
export class PickGameComponent {

    public readonly games: GameInfo[] = GameInfo.getAllGames();

    public readonly theme: 'dark' | 'light';

    public matchingGames: GameInfo[] = this.games;

    @Output() pickGame: EventEmitter<string> = new EventEmitter<string>();

    public constructor(themeService: ThemeService) {
        this.theme = themeService.getTheme();
    }

    public selectGame(gameName: string): void {
        this.pickGame.emit(gameName);
    }

    public search(input: EventTarget | null): void {
        const searchTerm: string = (input as HTMLInputElement).value;
        this.matchingGames = this.games.filter((info: GameInfo) =>
            this.normalize(info.name).includes(this.normalize(searchTerm)));
    }

    private normalize(term: string): string {
        return term.toLowerCase() // we want to be case insensitive
            .replace(/ /g, '') // we want to be space insensitive
            // we also want to be diacritic-insensitive, but we have to resort to black magic incantations for that
            .normalize('NFKD').replace(/[^\w]/g, '');
        // Explanation: normalize('NFKD') performs "compatibility
        // decomposition", basically splitting the diacritic from the character
        // into two different code points, e.g., é is split between ´ and e, at
        // the Unicode level. The replace part removes the code points that are
        // not characters, thereby removing all diacritics. This is not the work
        // of Morgoth as one may think, but regular Unicode manipulation.
    }
}
