import { AfterViewInit, Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, Inject, Input, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { AbstractNode } from 'src/app/jscaip/MGPNode';
import { Utils } from 'src/app/utils/utils';
import { AbstractGameComponent } from '../../game-components/game-component/GameComponent';
import { DOCUMENT } from '@angular/common'; 
import { MGPOptional } from 'src/app/utils/MGPOptional';

export type DemoNodeInfo = {
    name: string, // The name of the game
    component: Type<AbstractGameComponent>, // The component
    node: AbstractNode, // The demo node
    click: MGPOptional<string>, // An element to click
}

@Component({
    selector: 'app-demo-card',
    template: `<div #board></div>`,
})
export class DemoCardComponent implements AfterViewInit {
    @Input() public demoNodeInfo: DemoNodeInfo;

    @ViewChild('board', { read: ViewContainerRef })
    public boardRef: ViewContainerRef | null;

    public gameComponent: AbstractGameComponent | null;

    public constructor(private readonly componentFactoryResolver: ComponentFactoryResolver,
                       @Inject(DOCUMENT) private readonly document: Document)
    {
    }

    public ngAfterViewInit(): void {
        const componentFactory: ComponentFactory<AbstractGameComponent> =
            this.componentFactoryResolver.resolveComponentFactory(this.demoNodeInfo.component);
        const componentRef: ComponentRef<AbstractGameComponent> =
            Utils.getNonNullable(this.boardRef).createComponent(componentFactory);
        this.gameComponent = componentRef.instance;
        this.gameComponent.rules.node = this.demoNodeInfo.node;
        // The demo node is shown from the point of the player corresponding to the current turn
        this.gameComponent.role = this.gameComponent.getCurrentPlayer();
        this.gameComponent.isPlayerTurn = function() {
            return false;
        };
        // The board needs to be updated to account for the changed node
        this.gameComponent.updateBoard();
        // We perform a click if necessary
        if (this.demoNodeInfo.click.isPresent()) {
            Utils.getNonNullable(document.getElementById(this.demoNodeInfo.click.get())).click();
        }
        // Need to detect changes, otherwise we'll get an angular exception in our tests
        componentRef.changeDetectorRef.detectChanges();
    }
}
