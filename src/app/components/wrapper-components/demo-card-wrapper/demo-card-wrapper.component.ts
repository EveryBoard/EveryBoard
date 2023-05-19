import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { AbstractNode } from 'src/app/jscaip/MGPNode';
import { Utils } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GameWrapper } from '../../wrapper-components/GameWrapper';
import { ActivatedRoute, Router } from '@angular/router';
import { ConnectedUserService } from 'src/app/services/ConnectedUserService';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { Move } from 'src/app/jscaip/Move';

export type DemoNodeInfo = {
    name: string, // The name of the game
    node: AbstractNode, // The demo node
    click: MGPOptional<string>, // An element to click
}

@Component({
    selector: 'app-demo-card',
    template: `<div #board></div>`,
})
export class DemoCardWrapperComponent extends GameWrapper<string> implements AfterViewInit {

    @Input() public demoNodeInfo: DemoNodeInfo;

    @ViewChild('board', { read: ViewContainerRef })

    public override boardRef: ViewContainerRef | null = null;

    public constructor(componentFactoryResolver: ComponentFactoryResolver,
                       actRoute: ActivatedRoute,
                       connectedUserService: ConnectedUserService,
                       router: Router,
                       messageDisplayer: MessageDisplayer,
                       private readonly cdr: ChangeDetectorRef)
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
            // Need to detect changes before potentially clicking,
            // and otherwise we'll get an angular exception in our tests
            this.cdr.detectChanges();
            // We perform a click if necessary
            if (this.demoNodeInfo.click.isPresent()) {
                const element: Element = Utils.getNonNullable(document.querySelector(this.demoNodeInfo.click.get()));
                element.dispatchEvent(new Event('click'));
                // Update the view after the click
                this.cdr.detectChanges();
            }
        }, 1);
    }
    public async onLegalUserMove(move: Move, scores?: [number, number] | undefined): Promise<void> {
        return;
    }
    public getPlayer(): string {
        return 'no-player';
    }
    public onCancelMove(_reason?: string | undefined): void {
        return;
    }
}
