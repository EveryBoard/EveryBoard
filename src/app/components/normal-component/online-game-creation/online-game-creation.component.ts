import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ICurrentPartId } from 'src/app/domain/icurrentpart';
import { AuthenticationService, AuthUser } from 'src/app/services/authentication/AuthenticationService';
import { GameService } from 'src/app/services/game/GameService';

@Component({
    selector: 'app-online-game-creation',
    templateUrl: './online-game-creation.component.html',
    styleUrls: ['./online-game-creation.component.css'],
})
export class OnlineGameCreationComponent implements OnInit, OnDestroy {

    public selectedGame: string;

    public userName: string;

    public activesParts: ICurrentPartId[];

    private userNameSub: Subscription;

    private activesPartsSub: Subscription;

    public constructor(public router: Router,
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
        this.activesPartsSub = this.gameService.getActivesPartsObs()
            .subscribe((activesParts: ICurrentPartId[]) => {
                this.activesParts = activesParts;
            });
    }
    public pickGame(pickedGame: string): void {
        this.selectedGame = pickedGame;
    }
    public async createGame(): Promise<void> {
        if (this.canCreateGame()) {
            const gameId: string = await this.gameService.createGame(this.userName, this.selectedGame, '');
            // create Part and Joiner
            this.router.navigate(['/play/' + this.selectedGame, gameId]);
        } else {
            this.messageError('Vous avez déjà une partie en cours. Terminez là ou annulez là d\'abord!');
            this.router.navigate(['/server']);
        }
    }
    public messageError(msg: string): void {
        this.snackBar.open(msg, 'Ok!', { duration: 3000, verticalPosition: 'top' });
    }
    public canCreateGame(): boolean {
        let i: number = 0;
        let found: boolean = false;
        let playerZero: string;
        let playerOne: string;
        while ((i < this.activesParts.length) && (!found)) {
            playerZero = this.activesParts[i].doc.playerZero;
            playerOne = this.activesParts[i++].doc.playerOne;
            found = (this.userName === playerZero) || (this.userName === playerOne);
        }
        return !found;
    }
    public ngOnDestroy(): void {
        if (this.userNameSub) {
            this.userNameSub.unsubscribe();
        }
        if (this.activesPartsSub) {
            this.activesPartsSub.unsubscribe();
            this.gameService.unSubFromActivesPartsObs();
        }
    }
}
