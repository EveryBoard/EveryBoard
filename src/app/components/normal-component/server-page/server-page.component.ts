import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from '../../../services/UserService';
import { display } from 'src/app/utils/utils';
import { ActivePartsService } from 'src/app/services/ActivePartsService';
import { PartDocument } from 'src/app/domain/icurrentpart';
import { UserDocument } from 'src/app/domain/iuser';

type Tab = 'games' | 'create' | 'chat';

@Component({
    selector: 'app-server-page',
    templateUrl: './server-page.component.html',
})
export class ServerPageComponent implements OnInit, OnDestroy {

    public static VERBOSE: boolean = false;

    public activeUsers: UserDocument[] = [];

    public activeParts: PartDocument[] = [];

    private activeUsersSub: Subscription;

    private activePartsSub: Subscription;

    public currentTab: Tab = 'games';

    constructor(public router: Router,
                private readonly userService: UserService,
                private readonly activePartsService: ActivePartsService) {
    }
    public ngOnInit(): void {
        display(ServerPageComponent.VERBOSE, 'serverPageComponent.ngOnInit');
        this.activeUsersSub = this.userService.getActiveUsersObs()
            .subscribe((activeUsers: UserDocument[]) => {
                this.activeUsers = activeUsers;
            });
        this.activePartsService.startObserving();
        this.activePartsSub = this.activePartsService.getActivePartsObs()
            .subscribe((activeParts: PartDocument[]) => {
                this.activeParts = activeParts;
            });
    }
    public ngOnDestroy(): void {
        display(ServerPageComponent.VERBOSE, 'serverPageComponent.ngOnDestroy');
        this.activeUsersSub.unsubscribe();
        this.activePartsService.stopObserving();
        this.activePartsSub.unsubscribe();
        this.userService.unSubFromActiveUsersObs();
    }
    public async joinGame(partId: string, typeGame: string): Promise<void> {
        await this.router.navigate(['/play/', typeGame, partId]);
    }
    public selectTab(tab: Tab): void {
        this.currentTab = tab;
    }
}
