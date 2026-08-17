/* eslint-disable no-multi-spaces */
import { Component, OutputEmitterRef, inject, output } from '@angular/core';
import Fuse, { FuseResult } from 'fuse.js';

import { AutofocusDirective } from '../../../pipes-and-directives/autofocus.directive';
import { ThemeService } from '../../../services/ThemeService';

import { GameInfo } from './GameInfo';


@Component({
    selector: 'app-pick-game',
    templateUrl: './pick-game.component.html',
    imports: [AutofocusDirective],
})
export class PickGameComponent {

    public readonly games: GameInfo[] = GameInfo.getAllGames();

    public readonly theme: 'dark' | 'light' = inject(ThemeService).getTheme();

    public matchingGames: GameInfo[] = this.games;

    public readonly pickGame: OutputEmitterRef<string> = output<string>();

    public selectGame(gameName: string): void {
        this.pickGame.emit(gameName);
    }

    public search(input: EventTarget | null): void {
        const searchTerm: string = this.normalize((input as HTMLInputElement).value);
        if (searchTerm.length === 0) {
            this.matchingGames = this.games;
        } else {
            const fuse: Fuse<GameInfo> = new Fuse(this.games, {
                keys: ['name', 'urlName'],
                ignoreLocation: true,
                threshold: 0.5,
            });
            this.matchingGames = fuse.search(searchTerm)
                .map((result: FuseResult<GameInfo>): GameInfo => result.item);
        }
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
