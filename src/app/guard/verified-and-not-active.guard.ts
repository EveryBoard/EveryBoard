import { Injectable, OnDestroy } from '@angular/core';
import { Router, UrlTree } from '@angular/router';

import { Subscription } from 'rxjs';

import { LobbyComponentFailure } from '../components/normal-component/lobby/lobby.component';
import { FocussedPart } from '../domain/User';
import { ConnectedUserService, AuthUser } from '../services/ConnectedUserService';
import { MessageDisplayer } from '../services/MessageDisplayer';
import { MGPOptional } from '../utils/MGPOptional';
import { Utils } from '../utils/utils';
import { VerifiedAccountGuard } from './verified-account.guard';

@Injectable({
    providedIn: 'root',
})
export class VerifiedAndNotActiveGuard extends VerifiedAccountGuard implements OnDestroy {

    protected observedPartSub: MGPOptional<Subscription> = MGPOptional.empty();

    constructor(authService: ConnectedUserService,
                public readonly messageDisplayer: MessageDisplayer,
                protected readonly router: Router) {
        super(authService, router);
    }
    public async evaluateUserPermission(user: AuthUser): Promise<boolean | UrlTree> {
        const isVerified: boolean | UrlTree = await super.evaluateUserPermission(user);
        if (isVerified !== true) {
            return isVerified;
        }
        return this.evaluateUserPermissionBasedOnHisObservedPart(user);
    }
    protected async evaluateUserPermissionBasedOnHisObservedPart(user: AuthUser): Promise<boolean | UrlTree> {
        return new Promise((resolve: (value: boolean | UrlTree) => void) => {// 1
            const subscription: Subscription = this.authService
                .getObservedPartObs()
                .subscribe((optionalPart: MGPOptional<FocussedPart>) => {
                    if (optionalPart.isAbsent()) {
                        return resolve(true);
                    }
                    const part: FocussedPart = optionalPart.get();
                    switch (part.role) {
                        case 'Player':
                            const playingMessage: string = LobbyComponentFailure.YOU_ARE_ALREADY_PLAYING();
                            this.messageDisplayer.criticalMessage(playingMessage);
                            break;
                        case 'Candidate':
                            const candidateMessage: string = LobbyComponentFailure.YOU_ARE_ALREADY_CANDIDATE();
                            this.messageDisplayer.criticalMessage(candidateMessage);
                            break;
                        case 'ChosenOpponent':
                            const opponentMessage: string = LobbyComponentFailure.YOU_ARE_ALREADY_CHOSEN_OPPONENT();
                            this.messageDisplayer.criticalMessage(opponentMessage);
                            break;
                        case 'Creator':
                            const creatorMessage: string = LobbyComponentFailure.YOU_ARE_ALREADY_CREATING();
                            this.messageDisplayer.criticalMessage(creatorMessage);
                            break;
                        default:
                            Utils.expectToBe(part.role, 'Observer', 'VerifiedAndNotActiveGuard did not expected role ' + part.role);
                            const observerMessage: string = LobbyComponentFailure.YOU_ARE_ALREADY_OBSERVING();
                            this.messageDisplayer.criticalMessage(observerMessage);
                            break;
                    }
                    return resolve(false);
                });
            this.observedPartSub = MGPOptional.of(subscription);
        });

        // return new Promise((resolve: (value: boolean | UrlTree) => void) => {// 1
        //     this.userSub = this.authService.getUserObs().subscribe(async(user: AuthUser) => {
        //         await this.evaluateUserPermission(user).then(resolve);
        //     });
        // })
    }
    public ngOnDestroy(): void {
        this.userSub.unsubscribe();
        if (this.observedPartSub.isPresent()) {
            this.observedPartSub.get().unsubscribe();
        }
    }
}
