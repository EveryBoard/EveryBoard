import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IJoueurId } from '../../../domain/iuser';
import { ICurrentPartId } from '../../../domain/icurrentpart';
import { UserService } from '../../../services/UserService';
import { GameService } from '../../../services/GameService';
import { display } from 'src/app/utils/utils';

@Component({
    selector: 'app-server-page',
    templateUrl: './server-page.component.html',
    styleUrls: ['./server-page.component.css'],
})
export class ServerPageComponent implements OnInit, OnDestroy {
    public static VERBOSE: boolean = false;

    public activesUsers: IJoueurId[];

    public selectedGame: string;

    private activesUsersSub: Subscription;

    constructor(public router: Router,
                private userService: UserService,
                private gameService: GameService) {
    }
    public ngOnInit(): void {
        display(ServerPageComponent.VERBOSE, 'serverPageComponent.ngOnInit');
        this.activesUsersSub = this.userService.getActivesUsersObs()
            .subscribe((activesUsers: IJoueurId[]) => {
                this.activesUsers = activesUsers;
            });
    }
    public pickGame(pickedGame: string): void {
        this.selectedGame = pickedGame;
    }
    public joinGame(partId: string, typeGame: string): void {
        this.router.navigate(['/play/' + typeGame, partId]);
    }
    public playLocally(): void {
        this.router.navigate(['local/' + this.selectedGame]);
    }
    public startTutorial(): void {
        this.router.navigate(['didacticial/' + this.selectedGame]);
    }
    public async createGame(): Promise<boolean> {
        return this.gameService.createGameAndRedirectOrShowError(this.selectedGame);
    }
    public getActiveParts(): ICurrentPartId[] {
        return this.gameService.activesPartsService.getActiveParts();
    }
    public getActiveUsers(): IJoueurId[] {
        return this.activesUsers;
    }
    public ngOnDestroy(): void {
        display(ServerPageComponent.VERBOSE, 'serverPageComponent.ngOnDestroy');
        if (this.activesUsersSub) {
            this.activesUsersSub.unsubscribe();
            this.userService.unSubFromActivesUsersObs();
        }
    }
}
