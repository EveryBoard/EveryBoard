import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from '../../../services/UserService';
import { display } from 'src/app/utils/utils';
import { ActivePartsService } from 'src/app/services/ActivePartsService';
import { PartDocument } from 'src/app/domain/Part';
import { FocussedPart, UserDocument } from 'src/app/domain/User';
import { ConnectedUserService } from 'src/app/services/ConnectedUserService';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPValidation } from 'src/app/utils/MGPValidation';

type Tab = 'games' | 'create' | 'chat';

@Component({
    selector: 'app-lobby',
    templateUrl: './lobby.component.html',
})
export class LobbyComponent implements OnInit, OnDestroy {

    public static VERBOSE: boolean = false;

    public activeUsers: UserDocument[] = [];

    public activeParts: PartDocument[] = [];

    public observedPart: MGPOptional<FocussedPart> = MGPOptional.empty();

    private activeUsersSub: Subscription;
    private activePartsSub: Subscription;
    private observedPartSub: Subscription;

    public currentTab: Tab = 'games';

    constructor(public readonly router: Router,
                public readonly messageDisplayer: MessageDisplayer,
                private readonly userService: UserService,
                private readonly activePartsService: ActivePartsService,
                private readonly connectedUserService: ConnectedUserService) {
    }
    public ngOnInit(): void {
        display(LobbyComponent.VERBOSE, 'lobbyComponent.ngOnInit');
        this.activeUsersSub = this.userService.getActiveUsersObs()
            .subscribe((activeUsers: UserDocument[]) => {
                this.activeUsers = activeUsers;
            });
        this.activePartsService.startObserving();
        this.activePartsSub = this.activePartsService.getActivePartsObs()
            .subscribe((activeParts: PartDocument[]) => {
                this.activeParts = activeParts;
            });
        this.observedPartSub = this.connectedUserService.getObservedPartObs()
            .subscribe((observedPart: MGPOptional<FocussedPart>) => {
                this.observedPart = observedPart;
            });
    }
    public ngOnDestroy(): void {
        display(LobbyComponent.VERBOSE, 'lobbyComponent.ngOnDestroy');
        this.activeUsersSub.unsubscribe();
        this.activePartsService.stopObserving();
        this.activePartsSub.unsubscribe();
        this.userService.unSubFromActiveUsersObs();
        this.observedPartSub.unsubscribe();
    }
    public async joinGame(partId: string, typeGame: string): Promise<void> {
        const canUserJoin: MGPValidation = this.connectedUserService.canUserJoin(partId);
        if (canUserJoin.isSuccess()) {
            await this.router.navigate(['/play', typeGame, partId]);
        } else {
            this.messageDisplayer.criticalMessage(canUserJoin.getReason());
        }
    }
    public getCreateButtonClass(): string[] {
        const classes: string[] = [];
        if (this.currentTab === 'create') {
            classes.push('is-active');
        }
        return classes;
    }
    public selectTab(tab: Tab): void {
        if (tab ==='create') {
            const canUserCreate: MGPValidation = this.connectedUserService.canUserCreate();
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
