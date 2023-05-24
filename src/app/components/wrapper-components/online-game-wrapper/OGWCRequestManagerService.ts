import { Injectable } from '@angular/core';
import { faBackwardStep, faFlag, faRepeat, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { GameEventReply, GameEventRequest, RequestType } from 'src/app/domain/Part';
import { Player } from 'src/app/jscaip/Player';
import { Localized } from 'src/app/utils/LocaleUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPSet } from 'src/app/utils/MGPSet';
import { Utils } from 'src/app/utils/utils';

export interface RequestInfo {
    requestType: RequestType,
    textForRequest: Localized,
    textForReply: Localized,
    name: Localized,
    icon: IconDefinition,
};

/**
 * The request manager manages the requests and replies.
 * It keeps state about whether a current request has been sent or is waiting for a reply.
 */
@Injectable({
    providedIn: 'root',
})
export class OGWCRequestManagerService {

    public static requestInfos: Record<RequestType, RequestInfo> = {
        'TakeBack': {
            requestType: 'TakeBack',
            textForRequest: () => $localize`Ask to take back one move`,
            textForReply: () => $localize`Your opponent is asking for a take back.`,
            name: () => $localize`take back`,
            icon: faBackwardStep,
        },
        'Draw': {
            requestType: 'Draw',
            textForRequest: () => $localize`Propose a draw`,
            textForReply: () => $localize`Your opponent is proposing a draw.`,
            name: () => $localize`draw`,
            icon: faFlag,
        },
        'Rematch': {
            requestType: `Rematch`,
            textForRequest: () => $localize`Propose a rematch`,
            textForReply: () => $localize`Your opponent is proposing a rematch.`,
            name: () => $localize`rematch`,
            icon: faRepeat,
        },
    };

    private requestAwaitingReply: MGPOptional<GameEventRequest> = MGPOptional.empty();
    private lastDeniedRequest: MGPOptional<RequestType> = MGPOptional.empty();
    private forbiddenRequests: MGPSet<RequestType> = new MGPSet();

    public onGameStart(): void {
        // Upon game start, clear out requests
        this.requestAwaitingReply = MGPOptional.empty();
        this.lastDeniedRequest = MGPOptional.empty();
        this.forbiddenRequests = new MGPSet();
    }
    public onReceivedMove(): void {
        // Upon a new turn, the player can again request anything
        this.forbiddenRequests = new MGPSet();
        this.lastDeniedRequest = MGPOptional.empty();
    }
    public onReceivedRequest(request: GameEventRequest): void {
        Utils.assert(this.requestAwaitingReply.isAbsent(), 'Should not receive two requests in a row!');
        this.requestAwaitingReply = MGPOptional.of(request);
    }
    /**
     * Called when a reply is received.
     * @returns true if the request has been accepted and must be handled by the OGWC
     */
    public async onReceivedReply(reply: GameEventReply, currentPlayer: Player): Promise<boolean> {
        this.requestAwaitingReply = MGPOptional.empty();
        switch (reply.reply) {
            case 'Accept':
                // The request has been accepted by the opponent, we give it back to OGWC
                return true;
            case 'Reject':
                // When one of our requests is rejected, we cannot make this request until the next turn
                if (reply.player === currentPlayer.getOpponent().value) {
                    // Opponent denied our request
                    this.lastDeniedRequest = MGPOptional.of(reply.requestType);
                    this.forbiddenRequests.add(reply.requestType);
                }
                return false;
        }
    }
    public canMakeRequest(request: RequestType): boolean {
        // If a request is awaiting a reply, no other request can be made until replied
        if (this.requestAwaitingReply.isPresent()) return false;
        // If the request is forbidden, we cannot make it
        if (this.forbiddenRequests.contains(request)) return false;
        return true;
    }
    public mustReply(player: Player): MGPOptional<RequestInfo> {
        // Different from canMakeRequest, as we can play if our requests have not been answered for example.
        if (this.requestAwaitingReply.isPresent() &&
            this.requestAwaitingReply.get().player === player.getOpponent().value)
        {
            return MGPOptional.of(OGWCRequestManagerService.requestInfos[this.requestAwaitingReply.get().requestType]);
        } else {
            return MGPOptional.empty();
        }
    }
    public getCurrentRequest(): MGPOptional<GameEventRequest> {
        return this.requestAwaitingReply;
    }
    public deniedRequest(): MGPOptional<RequestInfo> {
        return this.lastDeniedRequest.map((r: RequestType) => OGWCRequestManagerService.requestInfos[r]);
    }
}
