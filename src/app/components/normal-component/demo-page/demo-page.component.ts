import { AfterViewInit, Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, ViewChild, ViewContainerRef } from '@angular/core';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Utils } from 'src/app/utils/utils';
import { AbstractGameComponent } from '../../game-components/game-component/GameComponent';
import { GameInfo } from '../pick-game/pick-game.component';

export class AwaleDemo {
}

@Component({
    selector: 'app-demo-page',
    template: '<div #boards></div>',
})
export class DemoPageComponent implements AfterViewInit {
    @ViewChild('boards', { read: ViewContainerRef })
    public boardsRef: ViewContainerRef | null;

    public constructor(private readonly componentFactoryResolver: ComponentFactoryResolver) {
    }

    public ngAfterViewInit(): void {
        const allGames: GameInfo[] = GameInfo.ALL_GAMES().filter((game: GameInfo) => game.display === true);
        // Create a game component for each demo node of each game
        for (const game of allGames) {
            console.log(game.name);
            // eslint-disable-next-line dot-notation
            if (game.component['getDemoNodes'] != null) {
                console.log('demo nodes exists')
                // eslint-disable-next-line dot-notation
                for (const demoNode of game.component['getDemoNodes']()) {
                    console.log('got a demo node')
                    const componentFactory: ComponentFactory<AbstractGameComponent> =
                        this.componentFactoryResolver.resolveComponentFactory(game.component);
                    const componentRef: ComponentRef<AbstractGameComponent> =
                        Utils.getNonNullable(this.boardsRef).createComponent(componentFactory);
                    componentRef.instance.rules.node = demoNode;
                    componentRef.instance.role = Player.ZERO;
                    componentRef.instance.updateBoard();
                }
            }
        }
    }
}
