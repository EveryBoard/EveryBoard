import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from '../../../services/UserService';
import { display } from 'src/app/utils/utils';
import { ActivesPartsService } from 'src/app/services/ActivesPartsService';
import { IPartId } from 'src/app/domain/icurrentpart';
import { IUserId } from 'src/app/domain/iuser';

type Tab = 'games' | 'create' | 'chat';

@Component({
    selector: 'app-server-page',
    templateUrl: './server-page.component.html',
})
export class ServerPageComponent implements OnInit, OnDestroy {

    public static VERBOSE: boolean = false;

    public activeUsers: IUserId[] = [];

    public activeParts: IPartId[] = [];

    private activeUsersSub: Subscription;

    private activePartsSub: Subscription;

    public currentTab: Tab = 'games';

    constructor(public router: Router,
                private readonly userService: UserService,
                private readonly activePartsService: ActivesPartsService) {
    }
    public ngOnInit(): void {
        display(ServerPageComponent.VERBOSE, 'serverPageComponent.ngOnInit');
        this.activeUsersSub = this.userService.getActivesUsersObs()
            .subscribe((activeUsers: IUserId[]) => {
                this.activeUsers = activeUsers;
            });
        this.activePartsSub = this.activePartsService.getActivePartsObs()
            .subscribe((activeParts: IPartId[]) => {
                this.activeParts = activeParts;
            });
    }
    public ngOnDestroy(): void {
        display(ServerPageComponent.VERBOSE, 'serverPageComponent.ngOnDestroy');
        this.activeUsersSub.unsubscribe();
        this.activePartsSub.unsubscribe();
        this.userService.unSubFromActivesUsersObs();
    }
    public joinGame(partId: string, typeGame: string): void {
        this.router.navigate(['/play/' + typeGame, partId]);
    }
    public selectTab(tab: Tab): void {
        this.currentTab = tab;
    }
}
