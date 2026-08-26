import { NgClass } from '@angular/common';
import { Component, OnInit, OnDestroy, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCog, faSpinner, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

import { MGPOptional, Utils } from '@everyboard/lib';

import { CurrentGame } from '../../../domain/User';
import { ConnectedUserService, AuthUser } from '../../../services/ConnectedUserService';
import { CurrentGameService } from '../../../services/CurrentGameService';
import { GameInfo } from '../pick-game/GameInfo';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    imports: [RouterLink, NgClass, FaIconComponent],
})
export class HeaderComponent implements OnInit, OnDestroy {

    private readonly router: Router = inject(Router);
    private readonly connectedUserService: ConnectedUserService = inject(ConnectedUserService);
    private readonly currentGameService: CurrentGameService = inject(CurrentGameService);

    public faCog: IconDefinition = faCog;
    public faSpinner: IconDefinition = faSpinner;

    private userSubscription: Subscription = new Subscription();
    private currentGameSubscription: Subscription = new Subscription();

    private readonly connectedUser: WritableSignal<AuthUser> = signal(AuthUser.NOT_CONNECTED);
    private readonly currentGameState: WritableSignal<MGPOptional<CurrentGame>> = signal(MGPOptional.empty());

    public showMenu: boolean = false;

    public readonly currentGame: Signal<MGPOptional<CurrentGame>> = this.currentGameState.asReadonly();
    public readonly loading: WritableSignal<boolean> = signal(true);
    public readonly username: Signal<MGPOptional<string>> = computed(() =>
        this.connectedUser().username.orElse(this.connectedUser().email),
    );
    public readonly currentGameName: Signal<string> = computed(() =>
        GameInfo.getByUrlName(this.currentGame().get().gameName).get().name,
    );

    public readonly opponentName: Signal<string> = computed(() => {
        const currentGame: CurrentGame = this.currentGame().get();
        if (this.connectedUser().id === currentGame.creator.id) {
            return Utils.getNonNullable(currentGame.opponent?.name);
        } else {
            return currentGame.creator.name;
        }
    });

    public ngOnInit(): void {
        this.userSubscription = this.connectedUserService.subscribeToUser((user: AuthUser) => {
            this.connectedUser.set(user);
            this.loading.set(false);
        });
        this.currentGameSubscription =
            this.currentGameService.subscribeToCurrentGame((currentGame: MGPOptional<CurrentGame>) => {
                this.currentGameState.set(currentGame);
            });
    }

    public async logout(): Promise<void> {
        await this.connectedUserService.disconnect();
        await this.router.navigate(['/']);
    }

    public async navigateToPart(): Promise<boolean> {
        return this.router.navigate(['/play', this.currentGame().get().gameName, this.currentGame().get().id]);
    }

    public ngOnDestroy(): void {
        this.userSubscription.unsubscribe();
        this.currentGameSubscription.unsubscribe();
    }
}
