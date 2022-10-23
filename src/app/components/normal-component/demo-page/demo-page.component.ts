import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GameInfo } from '../pick-game/pick-game.component';
import { DemoNodeInfo } from './demo-card.component';

@Component({
    selector: 'app-demo-page',
    templateUrl: './demo-page.component.html',
})
export class DemoPageComponent {
    public numberOfColumns: FormControl = new FormControl(5);

    public columns: DemoNodeInfo[][] = [];

    public constructor() {
        this.fillColumns(5);
        this.numberOfColumns.valueChanges.subscribe((columns: number) => {
            this.fillColumns(columns);
        });
    }
    public fillColumns(numberOfColumns: number) {
        const allGames: GameInfo[] = GameInfo.ALL_GAMES().filter((game: GameInfo) => game.display === true);
        let column: number = 0;
        let i: number = 0;
        this.columns = [];
        // Create a game card for each demo node of each game
        for (const game of allGames) {
            // We only show the demo nodes for games that define them in their components
            // eslint-disable-next-line dot-notation
            if (game.component['getDemoNodes'] != null) {
                // eslint-disable-next-line dot-notation
                for (const node of game.component['getDemoNodes']()) {
                    // We fill from right to left, one node per column at a time
                    if (i < numberOfColumns) {
                        // We need to create the columns the first time we access them
                        this.columns.push([]);
                    }
                    this.columns[column].push({ name: game.name, component: game.component, node });
                    i++;
                    column = (column+1) % numberOfColumns;
                }
            }
        }
    }
}
