import {Component, OnDestroy, OnInit} from '@angular/core';
import { NavigationEnd, Router} from '@angular/router';
import { Location } from '@angular/common';

import {Subscription} from 'rxjs';

import { IJoueurId } from '../../../domain/iuser';
import {ICurrentPartId} from '../../../domain/icurrentpart';

import { UserService } from '../../../services/user/UserService';
import { GameService } from '../../../services/game/GameService';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-server-page',
    templateUrl: './server-page.component.html',
    styleUrls: ['./server-page.component.css']
})
export class ServerPageComponent implements OnInit, OnDestroy {

    public static VERBOSE: boolean = false;

    public activesParts: ICurrentPartId[];

    public activesUsers: IJoueurId[];

    readonly gameNameList: String[] = ['Awale',          // 1
                                       'Dvonn',          // 2
                                       'Encapsule',      // 3
                                       'Go',             // 4
                                       'Kamisado',       // 5
                                       // 'MinimaxTesting', nor counted nor showed on the list, but it could be reached
                                       'P4',             // 6
                                       'Pylos',          // 7
                                       'Quarto',         // 8
                                       'Quixo',          // 9
                                       'Reversi',        // 10
                                       'Sahara',         // 11
                                       'Siam',           // 12
                                       'Tablut'];        // 13

    public selectedGame: string;

    public userName: string;

    private userNameSub: Subscription;

    private activesPartsSub: Subscription;

    private activesUsersSub: Subscription;

    constructor(private snackBar: MatSnackBar,
                public router: Router,
                private userService: UserService,
                private gameService: GameService,
                private authenticationService: AuthenticationService,
                private location: Location) {
    }
    public ngOnInit() {
        this.userNameSub = this.authenticationService.getJoueurObs()
            .subscribe(joueur => {
                if (joueur == null) this.userName = null;
                else this.userName = joueur.pseudo;
            });
        this.activesPartsSub = this.gameService.getActivesPartsObs()
            .subscribe(activesParts => this.activesParts = activesParts);
        this.activesUsersSub = this.userService.getActivesUsersObs()
            .subscribe(activesUsers => this.activesUsers = activesUsers);
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                const path = this.location.path();
                if (path.startsWith("/play/")) {
                    this.checkGameNameInPath(path, /^\/play\/([a-zA-Z0-9]+)\/[a-zA-Z0-9]+$/);
                } else if (path.startsWith("/local/")) {
                    this.checkGameNameInPath(path, /^\/local\/([a-zA-Z0-9]+)$/);
                }
            }
        });
    }
    private checkGameNameInPath(path: string, regex: RegExp) {
        const matches = path.match(regex);
        if (matches == null || matches.length != 2) {
            this.router.navigate(['/server']);
        } else {
            const game = matches[1];
            if (!this.gameNameList.includes(game)) {
                this.router.navigate(['/server']);
            }
        }
    }

    public joinGame(partId: string, typeGame: string) {
        this.router.navigate(['/play/' + typeGame, partId]);
    }
    public isUserLogged(): boolean {
        return this.authenticationService.isUserLogged();
    }
    public playLocally() {
        this.router.navigate(['local/' + this.selectedGame]);
    }
    public messageInfo(msg: string) {
        this.snackBar.open(msg, "Ok!", { duration: 2000, });
    }
    public messageError(msg: string) {
        this.snackBar.open(msg, "Ok!", { duration: 2000, });
    }

    public async createGame() {
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
        let i = 0;
        let found = false;
        let playerZero: string;
        let playerOne: string;
        while ((i < this.activesParts.length) && (!found)) {
            playerZero = this.activesParts[i].doc.playerZero;
            playerOne = this.activesParts[i++].doc.playerOne;
            found = (this.userName === playerZero) || (this.userName === playerOne);
        }
        return !found;
    }
    public ngOnDestroy() {
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
