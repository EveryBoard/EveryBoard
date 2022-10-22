import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Player } from 'src/app/jscaip/Player';
import { Utils } from 'src/app/utils/utils';
import { AbstractGameComponent } from '../../game-components/game-component/GameComponent';
import { GameInfo } from '../pick-game/pick-game.component';

type DemoNodeInfo = {
    name: string, // The name of the game
    component: any, // The component
    node: any, // The demo node (TODO: type it)
}

@Component({
    selector: 'app-demo-card',
    template: `<div #board></div>`,
})
export class DemoCardComponent implements AfterViewInit {
    @Input() public demoNodeInfo: DemoNodeInfo;

    @ViewChild('board', { read: ViewContainerRef })
    public boardRef: ViewContainerRef | null;

    public constructor(private readonly componentFactoryResolver: ComponentFactoryResolver) {
    }

    public ngAfterViewInit(): void {
        const componentFactory: ComponentFactory<AbstractGameComponent> =
            this.componentFactoryResolver.resolveComponentFactory(this.demoNodeInfo.component);
        const componentRef: ComponentRef<AbstractGameComponent> =
            Utils.getNonNullable(this.boardRef).createComponent(componentFactory);
        componentRef.instance.rules.node = this.demoNodeInfo.node;
        // The demo node is shown from the point of the player corresponding to the current turn
        componentRef.instance.role = componentRef.instance.getCurrentPlayer();
        // The board needs to be updated to account for the changed node
        componentRef.instance.updateBoard();
    }
}

@Component({
    selector: 'app-demo-page',
    template: `
<form>
    <div class="field">
        <label class="label" for="numberOfColumns">
             <ng-container i18n>Number of columns: </ng-container>
             <output>{{ numberOfColumns.value }}</output>
         </label>
         <div class="control">
             <input class="slider is-circle is-primary"
                    step="1"
                    min="1" max="10"
                    name="maximalMoveDuration"
                    [formControl]="numberOfColumns" type="range">
         </div>
    </div>
</form>
<div class="columns">
    <div *ngFor="let column of columns" class="column">
        <div *ngFor="let game of column" class="card">
        <div class="card-header">
            <p class="card-header-title">{{ game.name }}</p>
        </div>
        <div class="card-image game-card">
            <figure class="image">
                <app-demo-card [demoNodeInfo]="game"></app-demo-card>
            </figure>
        </div>
    </div>
</div>`,
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
