import { NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { MGPMap, MGPOptional, MGPValidation } from '@everyboard/lib';

import { ConfigRoom, Status } from '../../../domain/ConfigRoom';
import { CurrentGame } from '../../../domain/User';
import { ActiveConfigRoomsService } from '../../../services/ActiveConfigRoomsService';
import { BackendMessage, BackendService } from '../../../services/BackendService';
import { CurrentGameService, GameActionFailure } from '../../../services/CurrentGameService';
import { MessageDisplayer } from '../../../services/MessageDisplayer';
import { Debug } from '../../../utils/Debug';
import { ChatComponent } from '../chat/chat.component';
import { OnlineGameSelectionComponent } from '../online-game-selection/online-game-selection.component';
import { GameInfo } from '../pick-game/pick-game.component';

type Tab = 'games' | 'create' | 'chat';

type WithId<T> = T & {
    id : string;
};

@Component({
    selector: 'app-lobby',
    templateUrl: './lobby.component.html',
    imports: [NgClass, OnlineGameSelectionComponent, ChatComponent],
})
@Debug.log
export class LobbyComponent implements OnInit, OnDestroy {

    private readonly router: Router = inject(Router);
    private readonly messageDisplayer: MessageDisplayer = inject(MessageDisplayer);
    private readonly activeConfigRoomsService: ActiveConfigRoomsService = inject(ActiveConfigRoomsService);
    private readonly currentGameService: CurrentGameService = inject(CurrentGameService);
    private readonly backendService: BackendService = inject(BackendService);
    private activeConfigRooms: MGPMap<string, ConfigRoom> = new MGPMap();

    private activeConfigRoomsSubscription!: Subscription; // initialized in ngOnInit
    private currentGameSubscription!: Subscription; // initialized in ngOnInit
    private lobbySubscription!: Subscription; // initialized in ngOnInit
    private errorSubscription!: Subscription; // initialized in ngOnInit

    public currentTab: Tab = 'games';
    public createTabClasses: string[] = [];

    public async ngOnInit(): Promise<void> {
        this.activeConfigRoomsSubscription = this.activeConfigRoomsService.subscribe(
            (rooms: MGPMap<string, ConfigRoom>) => {
                this.activeConfigRooms = rooms;
            });
        this.currentGameSubscription = this.currentGameService.subscribeToCurrentGame(
            (observed: MGPOptional<CurrentGame>) => {
                this.createTabClasses = [];
                if (observed.isPresent()) {
                    this.createTabClasses = ['disabled-tab'];
                }
            });

        this.lobbySubscription = await this.backendService.subscribeToLobby();
        this.errorSubscription = this.backendService.setCallback('Error', async(message: BackendMessage): Promise<void> => {
            await this.onError(message.getArgument('reason'));
        });
    }

    private async onError(error: string): Promise<void> {
        switch (error) {
            case 'already-subscribed':
                this.messageDisplayer.criticalMessage(GameActionFailure.YOU_ALREADY_HAVE_ANOTHER_TAB());
                await this.router.navigate(['/']);
                break;
            default:
                this.messageDisplayer.criticalMessage(GameActionFailure.UNEXPECTED_BACKEND_ERROR(error));
                await this.router.navigate(['/']);
                break;
        }
    }

    public async ngOnDestroy(): Promise<void> {
        this.lobbySubscription.unsubscribe();
        this.activeConfigRoomsSubscription.unsubscribe();
        this.currentGameSubscription.unsubscribe();
        this.errorSubscription.unsubscribe();
    }

    public getActiveConfigRooms(): WithId<ConfigRoom>[] {
        const all: WithId<ConfigRoom>[] = [];
        for (const [id, data] of this.activeConfigRooms) {
            all.push({ id, ...data });
        }
        return all;
    }

    public getGameName(configRoom: ConfigRoom): string {
        return GameInfo.getByUrlName(configRoom.gameName).get().name;
    }

    public getCreatorLine(configRoom: ConfigRoom): string {
        return `${configRoom.creator.name} (${Math.floor(configRoom.creatorElo)})`;
    }

    public async joinGame(configRoom: WithId<ConfigRoom>): Promise<void> {
        const gameId: string = configRoom.id;
        const gameName: string = configRoom.gameName;
        const gameStarted: boolean = configRoom.status === Status.STARTED;
        const canUserJoin: MGPValidation = this.currentGameService.canUserJoin(gameId, gameStarted);
        if (canUserJoin.isSuccess()) {
            await this.router.navigate(['/play', gameName, gameId]);
        } else {
            this.messageDisplayer.criticalMessage(canUserJoin.getReason());
        }
    }

    public selectTab(tab: Tab): void {
        if (tab ==='create') {
            const canUserCreate: MGPValidation = this.currentGameService.canUserCreate();
            if (canUserCreate.isSuccess()) {
                this.currentTab = tab;
            } else {
                this.messageDisplayer.criticalMessage(canUserCreate.getReason());
            }
        } else {
            this.currentTab = tab;
        }
    }

    public getVisibility(tab: Tab): string {
        if (this.currentTab === tab) {
            return '';
        } else {
            return 'is-hidden';
        }
    }

}
