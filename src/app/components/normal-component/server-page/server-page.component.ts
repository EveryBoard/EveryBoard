import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {Subscription} from 'rxjs';

import { IJoueurId } from '../../../domain/iuser';
import {ICurrentPartId} from '../../../domain/icurrentpart';

import { UserService } from '../../../services/UserService';
import { GameService } from '../../../services/GameService';
import { AuthenticationService } from 'src/app/services/authentication-service/AuthenticationService';

@Component({
    selector: 'app-server-page',
    templateUrl: './server-page.component.html',
    styleUrls: ['./server-page.component.css']
})
export class ServerPageComponent implements OnInit, OnDestroy {

    static VERBOSE = false;

    public activesParts: ICurrentPartId[];

    public activesUsers: IJoueurId[];

    readonly gameNameList: String[] = ['Awale',          // 1
                                       'Encapsule',      // 2
                                       'Go',             // 3
                                       'MinimaxTesting', // neh.
                                       'P4',             // 4
                                       'Quarto',         // 5
                                       'Reversi',        // 6
                                       'Sahara',         // 7
                                       'Siam',           // 8
                                       'Tablut'];        // 9
    
    public selectedGame: string;
    
    public userName: string;

    private userNameSub: Subscription;

    private activesPartsSub: Subscription;

    private activesUsersSub: Subscription;

    constructor(private router: Router,
                private userService: UserService,
                private gameService: GameService,
                private authenticationService: AuthenticationService) {

    }
    public ngOnInit() {
        this.userNameSub = this.authenticationService.getJoueurObs()
            .subscribe(joueur => {
                if (joueur) this.userName = joueur.pseudo;
                else this.userName = null;
             });
        this.activesPartsSub = this.gameService.getActivesPartsObs()
            .subscribe(activesParts => this.activesParts = activesParts);
        this.activesUsersSub = this.userService.getActivesUsersObs()
            .subscribe(activesUsers => this.activesUsers = activesUsers);
    }
    public joinGame(partId: string, typeGame: string) {
        if (this.userLogged()) {
            this.router.navigate(['/play/' + typeGame, partId]);
        } else {
            if (ServerPageComponent.VERBOSE) {
                console.log('vous devez vous connecter pour rejoindre??'); // TODO: redirect vers la connection, doit il ??
            }
        }
    }
    public userLogged(): boolean {
        return (this.userName != null) && (this.userName !== '');
    }
    public playLocally() {
        this.router.navigate(['local/' + this.selectedGame]);
    }
    public createGame() {
        if (this.canCreateGame()) {
            this.gameService
                .createGame(this.userName, this.selectedGame, '') // create Part and Joiner
                .then(createdDocId => {
                    this.router.navigate(['/play/' + this.selectedGame, createdDocId]);
                })
                .catch(onRejected => {
                    console.log('gameService Failed to create a game: ');
                    console.log(JSON.stringify(onRejected));
                });
        } else {
            console.log('vous devez vous connecter pour créer une partie'); // TODO: redirect vers la connection
        }
    }
    public canCreateGame(): boolean {
        if (!this.userLogged()) {
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