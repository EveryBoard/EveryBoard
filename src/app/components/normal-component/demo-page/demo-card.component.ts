import { AfterViewInit, Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, Inject, Input, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { AbstractNode } from 'src/app/jscaip/MGPNode';
import { Utils } from 'src/app/utils/utils';
import { AbstractGameComponent } from '../../game-components/game-component/GameComponent';
import { DOCUMENT } from '@angular/common'; 
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GameWrapper } from '../../wrapper-components/GameWrapper';
import { ActivatedRoute, Router } from '@angular/router';
import { ConnectedUserService } from 'src/app/services/ConnectedUserService';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { Move } from 'src/app/jscaip/Move';
import { MGPValidation } from 'src/app/utils/MGPValidation';

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
export class DemoCardComponent extends GameWrapper<string> implements AfterViewInit {
    @Input() public demoNodeInfo: DemoNodeInfo;

    @ViewChild('board', { read: ViewContainerRef })
    public boardRef: ViewContainerRef | null = null;

    constructor(componentFactoryResolver: ComponentFactoryResolver,
                actRoute: ActivatedRoute,
                connectedUserService: ConnectedUserService,
                router: Router,
                messageDisplayer: MessageDisplayer,
                @Inject(DOCUMENT) private readonly document: Document)
    {
        super(componentFactoryResolver, actRoute, connectedUserService, router, messageDisplayer);
    }

    protected override getGameName(): string {
        return this.demoNodeInfo.name;
    }
    public async ngAfterViewInit(): Promise<void> {
        setTimeout(async() => {
            await this.afterViewInit();
            this.gameComponent.rules.node = this.demoNodeInfo.node;
            this.setRole(this.gameComponent.getCurrentPlayer());
            // The board needs to be updated to render the changed node
            this.gameComponent.updateBoard();
            // Need to detect changes, otherwise we'll get an angular exception in our tests
            // TODO: try to disable this one and replace by one on the last line of this method
            Utils.getNonNullable(this.componentRef).changeDetectorRef.detectChanges();
            // We perform a click if necessary
            if (this.demoNodeInfo.click.isPresent()) {
                const element: Element = Utils.getNonNullable(document.querySelector(this.demoNodeInfo.click.get()));
                element.dispatchEvent(new Event('click'));
                // Update the view to account for the click
                // TODO: use cdr instead like in local game wrapper
                Utils.getNonNullable(this.componentRef).changeDetectorRef.detectChanges();
            }
        });
    }
    public async onLegalUserMove(move: Move, scores?: [number, number] | undefined): Promise<void> {
        return;
    }
    public getPlayer(): string {
        return 'no-player';
    }
}