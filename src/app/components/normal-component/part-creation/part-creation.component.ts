import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IJoiner, IJoinerId} from '../../../domain/ijoiner';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {GameService} from '../../../services/game/GameService';
import {JoinerService} from '../../../services/joiner/JoinerService';
import {ChatService} from '../../../services/chat/ChatService';

@Component({
    selector: 'app-part-creation',
    templateUrl: './part-creation.component.html',
    styleUrls: ['./part-creation.component.css']
})
export class PartCreationComponent implements OnInit, OnDestroy {
    /* First  : choosing an opponent
     * Second : proposing the rules
     * Third  : waiting opponent to agree
     * Fourth : starting
     *
     * PageCreationComponent are always child components of OnlineGames component (one to one)
     * they need common data so mother calculate/retrieve then share them with her child
     */

    static VERBOSE = false;

    @Input() partId: string;
    @Input() userName: string;

    @Output() gameStartNotification = new EventEmitter<void>();
    gameStarted = false; // notify that the game has started, a thing evaluated with the joiner doc game status

    currentJoiner: IJoiner = null;

    userIsCreator: boolean;

    userIsChosenPlayer: boolean;

    acceptingDisabled = true;
    proposingDisabled = true;
    proposalSent = false;

    // Game Configuration Values
    // timeout = 60;
    firstPlayer = '0';
    maximalMoveDuration = 30;

    // Subscription
    private userSub: Subscription;
    private partSub: Subscription;

    opponentFormGroup: FormGroup;
    configFormGroup: FormGroup;

    constructor(private router: Router,
                private gameService: GameService,
                private joinerService: JoinerService,
                private chatService: ChatService,
                private formBuilder: FormBuilder) {
    }
    public ngOnInit() {
        // console.log('PartCreationComponent.ngOnInit');
        if (this.userName === '') { // TODO: ces vérifications doivent être faite par le composant mère, et une seule fois ??
            console.log('PartCreationComponent we did not receive userName error');
            this.router.navigate(['/server']);
            return;
        }
        if (this.partId === '') {
            console.log('PartCreationComponent we did not receive partId error');
            this.router.navigate(['/server']);
            return;
        }
        // console.log('PartCreationComponent ngOnInit correctly starting (' + this.userName + ', ' + this.partId + ')');
        this.opponentFormGroup = this.formBuilder.group({
            chosenOpponent: ['', Validators.required]
        });
        this.configFormGroup = this.formBuilder.group({
            firstPlayer: ['', Validators.required],
            maximalMoveDuration: [10, Validators.required],
            totalPartDuration: [60, Validators.required]
        });
        this.joinerService
            .joinGame(this.partId, this.userName)
            .then(onFullFilled =>
                this.joinerService.startObserving(this.partId, iJoiner =>
                    this.onCurrentJoinerUpdate(iJoiner)))
            .catch(onRejected => {
                console.log('!!!PartCreationComponent joining game FAILED because : ');
                console.log(onRejected);
                this.router.navigate(['/server']);
            });
        // console.log('PartCreation Component Initialized!');
    }
    public ngOnDestroy() {
        if (PartCreationComponent.VERBOSE) {
            console.log('part-creation-component destroying');
        }
        if (this.userSub && this.userSub.unsubscribe) {
            this.userSub.unsubscribe();
        }
        if (this.partSub && this.partSub.unsubscribe) {
            this.partSub.unsubscribe();
        }
        if (this.gameStarted) {
            this.joinerService.stopObserving();
        } else {
            if (this.userIsCreator) {
                if (PartCreationComponent.VERBOSE) {
                    console.log('you leave, creator');
                }
                this.cancelGameCreation().then(onFullFilled =>
                    this.joinerService.stopObserving());
            } else {
                if (PartCreationComponent.VERBOSE) {
                    console.log('vous quittez le channel ' + this.userName);
                }
                this.joinerService
                    .cancelJoining(this.userName)
                    .then(onFullFilled => {
                        this.joinerService.stopObserving();
                        if (PartCreationComponent.VERBOSE) {
                            console.log('you left the channel, joiner');
                        }
                    })
                    .catch(onRejected => {
                        console.log('cancelJoining failed');
                        console.log(onRejected);
                    });
            }
        }
    }
    private onCurrentJoinerUpdate(iJoinerId: IJoinerId) {
        if (this.isGameCanceled(iJoinerId)) {
            if (PartCreationComponent.VERBOSE) {
                console.log('LAST UPDATE : the game is cancelled');
            }
            return this.onGameCancelled();
        }
        if (this.isGameStarted(iJoinerId)) {
            if (PartCreationComponent.VERBOSE) {
                console.log('the game has started');
            }
            return this.onGameStarted();
        }
        if (PartCreationComponent.VERBOSE) {
            console.log('joiner updated');
        }
        // here game is nor cancelled nor started, no reason to redirect anything
        this.updateJoiner(iJoinerId);
    }
    private isGameCanceled(iJoinerId: IJoinerId): boolean {
        return (iJoinerId == null) || (iJoinerId.joiner == null);
    }
    private onGameCancelled() {
        this.router.navigate(['/server']);
    }
    private isGameStarted(iJoinerId: IJoinerId): boolean {
        return iJoinerId && iJoinerId.joiner && (iJoinerId.joiner.partStatus === 3);
    }
    private onGameStarted() {
        if (PartCreationComponent.VERBOSE) {
            console.log('PartCreation.onGameStarted called');
        }
        this.gameStartNotification.emit();
        this.gameStarted = true;
        if (PartCreationComponent.VERBOSE) {
            console.log('PartCreation.onGameStarted finished');
        }
    }
    private updateJoiner(iJoinerId: IJoinerId) {
        // Update the form depending on which state we're on now
        this.userIsCreator = (this.userName === iJoinerId.joiner.creator);
        this.userIsChosenPlayer = (this.userName === iJoinerId.joiner.chosenPlayer);
        this.proposalSent = iJoinerId.joiner.partStatus > 1;
        if (this.userIsCreator) {
            this.proposingDisabled = (iJoinerId.joiner.partStatus !== 1);
        } else {
            // this.timeout = iJoinerId.joiner.timeoutMinimalDuration;
            this.maximalMoveDuration = iJoinerId.joiner.maximalMoveDuration;
            this.firstPlayer = iJoinerId.joiner.firstPlayer;
            this.acceptingDisabled = (iJoinerId.joiner.partStatus !== 2);
        }
        this.currentJoiner = iJoinerId.joiner;
    }
    private cancelGameCreation(): Promise<void> {
        // callable only by the creator
        return new Promise((resolve, reject) => {
            this.gameService
                .deletePart(this.partId)
                .then(then => {
                    if (PartCreationComponent.VERBOSE) {
                        console.log('part suppressed');
                    }
                    this.joinerService
                        .deleteJoiner()
                        .then(onFullFilled => {
                            if (PartCreationComponent.VERBOSE) {
                                console.log('joiner and part suppressed');
                            }
                            this.chatService
                                .deleteChat(this.partId)
                                .then(onSuccess => {
                                    if (PartCreationComponent.VERBOSE) {
                                        console.log('joiner, part, and chat suppressed');
                                    }
                                    resolve(onSuccess);
                                })
                                .catch(onRejected => {
                                    console.log('chat could not be cancelled');
                                    reject(onRejected);
                                });
                        })
                        .catch(onRejected => {
                            console.log('joiner could not be cancelled');
                            reject(onRejected);
                        });
                })
                .catch(fail => {
                    console.log('delete part failed');
                    reject(fail);
                });
        });
    }
    cancelAndLeave() {
        this.router.navigate(['/server']);
    }
    setChosenPlayer(pseudo: string): Promise<void> {
        if (PartCreationComponent.VERBOSE) {
            console.log('set chosen player to ' + JSON.stringify(pseudo));
        }
        return this.joinerService.setChosenPlayer(pseudo);
    }
    proposeConfig(): Promise<void> {
        // called by the creator

        // send the proposal to opponent
        // status become 2 (waiting joiner confirmation)
        const maxMoveDur: number = this.configFormGroup.get('maximalMoveDuration').value;
        const firstPlayer: string = this.configFormGroup.get('firstPlayer').value;
        const totalPartDuration: number = this.configFormGroup.get('totalPartDuration').value;
        return this.joinerService.proposeConfig(maxMoveDur, firstPlayer, totalPartDuration);
    }
    acceptConfig(): Promise<void> {
        // called by the joiner

        // trigger the beginning redirection that will be called on every subscribed user
        // status become 3 (game started)
        // console.log('let\'s accept config of ' + this.partId);
        // console.log('GameService observing : ');
        return this.gameService.acceptConfig(this.currentJoiner);
    }
}
