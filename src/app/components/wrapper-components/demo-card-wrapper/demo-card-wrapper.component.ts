import { AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { AbstractNode } from 'src/app/jscaip/GameNode';
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
export class DemoCardWrapperComponent extends GameWrapper<string> implements AfterViewInit, OnChanges {

    @Input() public demoNodeInfo: DemoNodeInfo;

    @ViewChild('board', { read: ViewContainerRef })
    public override boardRef: ViewContainerRef | null = null;

    public constructor(activatedRoute: ActivatedRoute,
                       connectedUserService: ConnectedUserService,
                       router: Router,
                       messageDisplayer: MessageDisplayer,
                       private readonly cdr: ChangeDetectorRef)
    {
        super(activatedRoute, connectedUserService, router, messageDisplayer);
    }

    public async ngAfterViewInit(): Promise<void> {
        window.setTimeout(async() => {
            await this.createMatchingGameComponent();
            this.gameComponent.node = this.demoNodeInfo.node;
            // The component needs to be interactive in order to show all possible stylistic elements
            this.gameComponent.setInteractive(true);
            // The board needs to be updated to render the changed node, setRole will do it
            await this.setRole(this.gameComponent.getCurrentPlayer());
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

    public async ngOnChanges(_changes: SimpleChanges): Promise<void> {
        // This function is triggered when the parent component modify the @Input of this one
        // And also it is called on creation, then, this.gameComponent is not setted yet
        if (this.gameComponent != null) {
            // When it is, we want to manually update the board with the new infos and display them
            this.gameComponent.node = this.demoNodeInfo.node;
            await this.gameComponent.updateBoard(false);
            this.cdr.detectChanges();
        }
    }

    protected override getGameName(): string {
        // Unlike all other BaseGameComponent (wrapper or game) those will share one page: everyboard.org/demo
        // Hence we cannot read the name of the game via the URL
        return this.demoNodeInfo.name;
    }

    public async onLegalUserMove(move: Move, scores?: [number, number] | undefined): Promise<void> {
        return;
    }
    public override getPlayer(): string {
        return 'no-player';
    }
    public async onCancelMove(_reason?: string | undefined): Promise<void> {
        return;
    }
}
