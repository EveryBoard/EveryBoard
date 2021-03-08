import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Subscription } from 'rxjs';

import { IJoueurId } from '../../../domain/iuser';
import { ICurrentPartId } from '../../../domain/icurrentpart';

import { UserService } from '../../../services/user/UserService';
import { GameService } from '../../../services/game/GameService';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { display } from 'src/app/utils/collection-lib/utils';

@Component({
    selector: 'app-server-page',
    templateUrl: './server-page.component.html',
    styleUrls: ['./server-page.component.css'],
})
export class ServerPageComponent implements OnInit, OnDestroy {
    public static VERBOSE: boolean = false;

    public activesParts: ICurrentPartId[];

    public activesUsers: IJoueurId[];

    public readonly gameNameList: string[] = [ // After Gipf: median = 24j; average = 65j
        'Awale', // /////  2ème: 2018.11.29 ( 3  mois après P4)
        'Dvonn', // ///// 13ème: 2020.10.21 (18 jours après Kamisado) *Quentin
        'Encapsule', // /  7ème: 2019.12.30 ( 9 jours après Go)
        'Epaminondas', // 14ème: 2021.01.06 (22 jours après Quixo)
        'Gipf', // ////// 15ème: 2021.02.22 ( 4  mois après Dvonn) *Quentin
        'Go', // ////////  6ème: 2019.12.21 (11  mois après Reversi)
        'Kamisado', // // 11ème: 2020.10.03 (26 jours après arrivée) *Quentin
        // 'MinimaxTesting', nor counted nor showed on the list, but it could be reached
        'P4', // ////////  1 er: 2018.08.28  (????????????????????)
        'Pylos', // ///// 10ème: 2020.10.02 ( 7  mois après Sahara)
        'Quarto', // ////  3ème: 2018.12.09 (10 jours après P4)
        'Quixo', // ///// 12ème: 2020.10.15 (13 jours après Pylos)
        'Reversi', // ///  5ème: 2019.01.16 (20 jours après Tablut)
        'Sahara', // ////  9ème: 2020.02.29 (49 jours après Siam)
        'Siam', // //////  8ème: 2020.01.11 (12 jours après Encapsule)
        'Tablut']; // ///  4ème: 2018.12.27 (26 jours après Quarto)

    public selectedGame: string;

    public userName: string;

    private userNameSub: Subscription;

    private activesPartsSub: Subscription;

    private activesUsersSub: Subscription;

    constructor(private snackBar: MatSnackBar,
                public router: Router,
                private userService: UserService,
                private gameService: GameService,
                private authenticationService: AuthenticationService) {
    }
    public ngOnInit(): void {
        display(ServerPageComponent.VERBOSE, 'serverPageComponent.ngOnInit');
        this.userNameSub = this.authenticationService.getJoueurObs()
            .subscribe((joueur) => {
                if (joueur == null) this.userName = null;
                else this.userName = joueur.pseudo;
            });
        this.activesPartsSub = this.gameService.getActivesPartsObs()
            .subscribe((activesParts) => {
                this.activesParts = activesParts;
            });
        this.activesUsersSub = this.userService.getActivesUsersObs()
            .subscribe((activesUsers) => {
                this.activesUsers = activesUsers;
            });
    }
    public joinGame(partId: string, typeGame: string): void {
        this.router.navigate(['/play/' + typeGame, partId]);
    }
    public isUserLogged(): boolean {
        return this.authenticationService.isUserLogged();
    }
    public playLocally(): void {
        this.router.navigate(['local/' + this.selectedGame]);
    }
    public startTutorial(): void {
        this.router.navigate(['didacticial/' + this.selectedGame]);
    }
    public messageInfo(msg: string): void {
        // TODO: generalise this calculation method (sorry, it's out of sprint scope)
        // 200 word by minute is the average reading speed, so:
        // const words: number = StringUtils.count(" ") + 1;
        // const readingTime: number = (words*60*1000)/150; // (150 for slow reader facility)
        // const toastTime: number = Math.max(readingTime, 3000); // so at least 3 sec the toast is there
        this.snackBar.open(msg, 'Ok!', { duration: 3000 });
    }
    public messageError(msg: string): void {
        this.snackBar.open(msg, 'Ok!', { duration: 3000 });
    }
    public async createGame(): Promise<void> {
        if (this.canCreateGame()) {
            const gameId: string = await this.gameService.createGame(this.userName, this.selectedGame, '');
            // create Part and Joiner
            this.router.navigate(['/play/' + this.selectedGame, gameId]);
        } else {
            this.messageError('Vous devez vous connecter pour créer une partie'); // TODO: redirect vers la connexion
        }
    }
    public canCreateGame(): boolean {
        if (!this.isUserLogged()) {
            return false;
        }
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
        display(ServerPageComponent.VERBOSE, 'serverPageComponent.ngOnDestroy');
        if (this.userNameSub) {
            this.userNameSub.unsubscribe();
        }
        if (this.activesPartsSub) {
            this.activesPartsSub.unsubscribe();
            this.gameService.unSubFromActivesPartsObs();
        }
        if (this.activesUsersSub) {
            this.activesUsersSub.unsubscribe();
            this.userService.unSubFromActivesUsersObs();
        }
    }
}
