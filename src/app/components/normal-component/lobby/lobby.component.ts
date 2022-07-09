import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from '../../../services/UserService';
import { display, Utils } from 'src/app/utils/utils';
import { ActivePartsService } from 'src/app/services/ActivePartsService';
import { PartDocument } from 'src/app/domain/Part';
import { FocussedPart, UserDocument } from 'src/app/domain/User';
import { ConnectedUserService } from 'src/app/services/ConnectedUserService';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { Localized } from 'src/app/utils/LocaleUtils';

type Tab = 'games' | 'create' | 'chat';


export class LobbyComponentFailure {

    public static YOU_ARE_ALREADY_PLAYING: Localized = () => $localize`You are already playing in another game.`;

    public static YOU_ARE_ALREADY_CREATING: Localized = () => $localize`You are already the creator of another game.`;

    public static YOU_ARE_ALREADY_CHOSEN_OPPONENT: Localized = () => $localize`You are already the chosen opponent in another game.`;

    public static YOU_ARE_ALREADY_CANDIDATE: Localized = () => $localize`You are already candidate in another game.`;

    public static YOU_ARE_ALREADY_OBSERVING: Localized = () => $localize`You are already observer in another game.`;
}
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
        if (this.observedPart.isAbsent() || this.observedPart.get().id === partId) {
            // User is allowed to observe one part in any way
            // or to do it twice with the same one
            await this.router.navigate(['/play', typeGame, partId]);
        } else {
            const observedPart: FocussedPart = this.observedPart.get();
            switch (observedPart.role) {
                case 'Creator':
                    // Even if one player can be creator of one part that is started
                    // It is here only used for non started game
                    return this.messageDisplayer.infoMessage(LobbyComponentFailure.YOU_ARE_ALREADY_CREATING());
                case 'Candidate':
                    return this.messageDisplayer.infoMessage(LobbyComponentFailure.YOU_ARE_ALREADY_CANDIDATE());
                case 'ChosenOpponent':
                    return this.messageDisplayer.infoMessage(LobbyComponentFailure.YOU_ARE_ALREADY_CHOSEN_OPPONENT());
                case 'Player':
                    return this.messageDisplayer.infoMessage(LobbyComponentFailure.YOU_ARE_ALREADY_PLAYING());
                default:
                    Utils.expectToBe(observedPart.role, 'Observer');
                    await this.router.navigate(['/play', typeGame, partId]);
                    // It is allow to observe another game
            }
        }
    }
    public getCreateButtonClass(): string[] {
        const classes: string[] = [];
        if (this.currentTab === 'create') {
            classes.push('is-active');
        }
        if (this.canUserCreate() === false) {
            classes.push('is-disabled'); // TODOTODO check its face and UNIT TEST
        }
        return classes;
    }
    private canUserCreate(): boolean {
        return this.observedPart.isAbsent(); // TODOTODO UNIT TEST
    }
    public selectTab(tab: Tab): void {
        if (tab ==='create') {
            if (this.canUserCreate()) {
                this.currentTab = tab;
            }
        } else {
            this.currentTab = tab;
        }
    }
}
