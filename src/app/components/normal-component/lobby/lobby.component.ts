import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { display } from 'src/app/utils/utils';
import { ActivePartsService } from 'src/app/services/ActivePartsService';
import { PartDocument } from 'src/app/domain/Part';
import { FocusedPart, UserDocument } from 'src/app/domain/User';
import { ConnectedUserService } from 'src/app/services/ConnectedUserService';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Subscription } from 'rxjs';
import { ActiveUsersService } from 'src/app/services/ActiveUsersService';
import { ObservedPartService } from 'src/app/services/ObservedPartService';

type Tab = 'games' | 'create' | 'chat';

@Component({
    selector: 'app-lobby',
    templateUrl: './lobby.component.html',
})
export class LobbyComponent implements OnInit, OnDestroy {

    public static VERBOSE: boolean = false;

    public activeUsers: UserDocument[] = [];

    public activeParts: PartDocument[] = [];

    private activeUsersSubscription!: Subscription; // initialized in ngOnInit

    private activePartsSubscription!: Subscription; // initialized in ngOnInit

    public currentTab: Tab = 'games';
    public createTabClasses: string[] = [];

    constructor(public readonly router: Router,
                public readonly messageDisplayer: MessageDisplayer,
                private readonly activePartsService: ActivePartsService,
                private readonly activeUsersService: ActiveUsersService,
                private readonly observedPartService: ObservedPartService) {
    }
    public ngOnInit(): void {
        display(LobbyComponent.VERBOSE, 'lobbyComponent.ngOnInit');
        this.activeUsersSubscription = this.activeUsersService.subscribeToActiveUsers(
            (activeUsers: UserDocument[]) => {
                this.activeUsers = activeUsers;
            });
        this.activePartsSubscription = this.activePartsService.subscribeToActiveParts(
            (activeParts: PartDocument[]) => {
                this.activeParts = activeParts;
            });
        this.observedPartService.subscribeToObservedPart((observed: MGPOptional<FocusedPart>) => {
            this.createTabClasses = [];
            if (observed.isPresent()) {
                this.createTabClasses = ['disabled-tab'];
            }
        });
    }
    public ngOnDestroy(): void {
        display(LobbyComponent.VERBOSE, 'lobbyComponent.ngOnDestroy');
        this.activeUsersSubscription.unsubscribe();
        this.activePartsSubscription.unsubscribe();
    }
    public async joinGame(part: PartDocument): Promise<void> {
        const partId: string = part.id;
        const typeGame: string = part.data.typeGame;
        const gameStarted: boolean = part.data.beginning != null;
        const canUserJoin: MGPValidation = this.observedPartService.canUserJoin(partId, gameStarted);
        if (canUserJoin.isSuccess()) {
            await this.router.navigate(['/play', typeGame, partId]);
        } else {
            this.messageDisplayer.criticalMessage(canUserJoin.getReason());
        }
    }
    public selectTab(tab: Tab): void {
        if (tab ==='create') {
            const canUserCreate: MGPValidation = this.observedPartService.canUserCreate();
            if (canUserCreate.isSuccess()) {
                this.currentTab = tab;
            } else {
                this.messageDisplayer.criticalMessage(canUserCreate.getReason());
            }
        } else {
            this.currentTab = tab;
        }
    }
}
