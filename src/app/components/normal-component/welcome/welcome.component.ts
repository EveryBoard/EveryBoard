import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService, AuthUser } from 'src/app/services/AuthenticationService';
import { GameService } from 'src/app/services/GameService';
import { GameInfo } from '../pick-game/pick-game.component';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
})
export class WelcomeComponent implements OnInit, OnDestroy {
    public readonly games: GameInfo[] = GameInfo.ALL_GAMES;

    private userNameSub: Subscription;

    private userName: string;

    public constructor(private router: Router,
                       private gameService: GameService,
                       private snackBar: MatSnackBar,
                       private authenticationService: AuthenticationService) {
    }
    public ngOnInit(): void {
        this.userNameSub = this.authenticationService.getJoueurObs()
            .subscribe((joueur: AuthUser) => {
                if (joueur == null) this.userName = null;
                else this.userName = joueur.pseudo;
            });
    }
    public async createGame(game: string): Promise<void> {
        if (this.gameService.canCreateGame(this.userName)) {
            const gameId: string = await this.gameService.createGame(this.userName, game, '');
            // create Part and Joiner
            this.router.navigate(['/play/' + game, gameId]);
        } else {
            this.messageError(`Vous avez déjà une partie en cours. Terminez là ou annulez là d'abord!`);
            this.router.navigate(['/server']);
        }
    }
    private messageError(msg: string): void {
        this.snackBar.open(msg, 'Ok!', { duration: 3000, verticalPosition: 'top' });
    }
    public ngOnDestroy(): void {
        if (this.userNameSub) {
            this.userNameSub.unsubscribe();
        }
    }
}
