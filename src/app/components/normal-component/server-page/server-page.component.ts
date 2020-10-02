import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {Subscription} from 'rxjs';

import { IJoueurId } from '../../../domain/iuser';
import {ICurrentPartId} from '../../../domain/icurrentpart';

import { UserService } from '../../../services/user/UserService';
import { GameService } from '../../../services/game/GameService';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';

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
                                       'Encapsule',      // 2
                                       'Go',             // 3
                                       // 'MinimaxTesting', nor counted nor showed on the list, but it could be reached
                                       'P4',             // 4
                                       'Pylos',          // 5
                                       'Quarto',         // 6
                                       'Reversi',        // 7
                                       'Sahara',         // 8
                                       'Siam',           // 9
                                       'Tablut'];        // 10

    public selectedGame: string;

    public userName: string;

    private userNameSub: Subscription;

    private activesPartsSub: Subscription;

    private activesUsersSub: Subscription;

    constructor(public router: Router,
                private userService: UserService,
                private gameService: GameService,
                private authenticationService: AuthenticationService) {
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
    public async createGame() {
        if (this.canCreateGame()) {
            const gameId: string = await this.gameService.createGame(this.userName, this.selectedGame, '');
            // create Part and Joiner
            this.router.navigate(['/play/' + this.selectedGame, gameId]);
        } else {
            console.log('vous devez vous connecter pour créer une partie'); // TODO: redirect vers la connection
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