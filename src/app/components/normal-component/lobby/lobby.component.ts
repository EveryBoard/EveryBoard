import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { display } from 'src/app/utils/utils';
import { ActivePartsService } from 'src/app/services/ActivePartsService';
import { PartDocument } from 'src/app/domain/Part';
import { UserDocument } from 'src/app/domain/User';
import { ActiveUsersService } from 'src/app/services/ActiveUsersService';
import { Unsubscribe } from 'firebase/firestore';

type Tab = 'games' | 'create' | 'chat';

@Component({
    selector: 'app-lobby',
    templateUrl: './lobby.component.html',
})
export class LobbyComponent implements OnInit, OnDestroy {

    public static VERBOSE: boolean = false;

    public activeUsers: UserDocument[] = [];

    public activeParts: PartDocument[] = [];

    private activeUsersUnsubscribe!: Unsubscribe; // initialized in ngOnInit

    private activePartsUnsubscribe!: Unsubscribe; // initialized in ngOnInit

    public currentTab: Tab = 'games';

    constructor(public router: Router,
                private readonly activeUsersService: ActiveUsersService,
                private readonly activePartsService: ActivePartsService) {
    }
    public ngOnInit(): void {
        display(LobbyComponent.VERBOSE, 'lobbyComponent.ngOnInit');
        this.activeUsersUnsubscribe = this.activeUsersService.subscribeToActiveUsers(
            (activeUsers: UserDocument[]) => {
                this.activeUsers = activeUsers;
            });
        this.activePartsUnsubscribe = this.activePartsService.subscribeToActiveParts(
            (activeParts: PartDocument[]) => {
                this.activeParts = activeParts;
            });
    }
    public ngOnDestroy(): void {
        display(LobbyComponent.VERBOSE, 'lobbyComponent.ngOnDestroy');
        this.activeUsersUnsubscribe();
        this.activePartsUnsubscribe();
    }
    public async joinGame(partId: string, typeGame: string): Promise<void> {
        await this.router.navigate(['/play', typeGame, partId]);
    }
    public selectTab(tab: Tab): void {
        this.currentTab = tab;
    }
}
