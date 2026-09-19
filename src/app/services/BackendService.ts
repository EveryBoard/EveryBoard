import { Injectable, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';

import { JSONValue, MGPFallible, MGPMap, MGPOptional, Utils } from '@everyboard/lib';

import { environment } from '../../environments/environment';

import { ConnectedUserService } from './ConnectedUserService';
import { MessageDisplayer } from './MessageDisplayer';

export class BackendMessage {
    public constructor(public readonly tag: string,
                       private readonly args: JSONValue) {
    }

    public getArgument<T>(name: string): T {
        const value: T | null = this.getOptionalArgument<T>(name);
        if (value == null) {
            throw new Error(`Trying to extract argument from server reply, but there were no such argument: ${name} (on a ${this.tag} message: arguments are ${JSON.stringify(this.args)})`);
        } else {
            return value;
        }
    }

    public getOptionalArgument<T>(name: string): T | null {
        if (this.args == null) {
            throw new Error(`Trying to extract argument from server reply, but there were no argument: ${name} (on a ${this.tag} message)`);
        }
        const value: unknown = this.args[name];
        // The only thing we can't check is that the argument value really corresponds to the type.
        return value as T | null;
    }
}

export type Callback = (message: BackendMessage) => void;

export abstract class AbstractBackendService {
    private readonly callbacks: MGPMap<string, Callback> = new MGPMap();

    protected abstract subscribeTo(subscription: string, gameId?: string): Promise<Subscription>;

    public abstract send(message: JSONValue): Promise<void>;

    public abstract connect(): Promise<Subscription>;

    public subscribeToGame(gameId: string): Promise<Subscription> {
        return this.subscribeTo('SubscribeGame', gameId);
    }

    public subscribeToConfigRoom(gameId: string): Promise<Subscription> {
        return this.subscribeTo('SubscribeConfigRoom', gameId);
    }

    public subscribeToLobby(): Promise<Subscription> {
        return this.subscribeTo('SubscribeLobby');
    }

    public async sendAndWaitForReply(message: JSONValue, replyTag: string): Promise<MGPFallible<BackendMessage>> {
        await this.send(message);
        return this.waitForMessage(replyTag);
    }

    private async waitForMessage(tag: string): Promise<MGPFallible<BackendMessage>> {
        return new Promise((resolve: (value: MGPFallible<BackendMessage>) => void) => {
            const onMessage: (message: BackendMessage) => void = (message: BackendMessage): void => {
                this.removeCallback(tag);
                this.removeCallback('Error');
                if (message.tag === 'Error') {
                    resolve(MGPFallible.failure(message.getArgument('reason')));
                } else {
                    resolve(MGPFallible.success(message));
                }
            };
            this.setCallback(tag, onMessage);
            this.setCallback('Error', onMessage);
        });
    }

    public setCallback(tag: string, callback: Callback): Subscription {
        if (this.callbacks.containsKey(tag)) {
            throw new Error(`registering a callback which already exists (${tag}), this is likely not what we need!`);
        }
        this.callbacks.set(tag, callback);
        return new Subscription(() => this.removeCallback(tag));
    }

    protected receive(message: BackendMessage): void {
        const callback: MGPOptional<Callback> = this.callbacks.get(message.tag);
        if (callback.isPresent()) {
            callback.get()(message);
        } else {
            console.warn('MESSAGE WITHOUT CALLBACK: ' + JSON.stringify(message));
        }
    }

    private removeCallback(tag: string): void {
        this.callbacks.delete(tag);
    }

}

@Injectable({
    // This ensures that this is a singleton service, which is very important for this one
    // because we want only a single websocket connection, shared among all other services
    providedIn: 'root',
})
export class BackendService extends AbstractBackendService implements OnDestroy {

    private readonly connectedUserService: ConnectedUserService = inject(ConnectedUserService);
    private readonly messageDisplayer: MessageDisplayer = inject(MessageDisplayer);

    private webSocket: MGPOptional<WebSocket> = MGPOptional.empty();

    private connectionPromise: Promise<void>;
    private resolveConnection!: () => void;

    private nextConnectionAttemptTime: number = 1;
    private disconnectRequested: boolean = false;
    private pageIsUnloading: boolean = false;

    // Upon the "pagehide" event, we need to disconnect
    // This arises for example when we navigate away from the page in the same tab (e.g., by entering another URL)
    // It is necessary to disconnect at that time because otherwise the websocket may remain open for too long
    // and then if we load EveryBoard in the same tab, we may get an already-subscribed error
    private readonly disconnectOnPageHide: () => void = (): void => {
        this.pageIsUnloading = true;
        if (this.webSocket.isPresent()) {
            this.disconnect();
        }
    };

    public constructor() {
        super();
        this.connectionPromise = new Promise((resolve: () => void) => {
            this.resolveConnection = resolve;
        });
        window.addEventListener('pagehide', this.disconnectOnPageHide);
    }

    public waitForConnection(): Promise<void> {
        return this.connectionPromise;
    }

    public override async connect(): Promise<Subscription> {
        Utils.assert(this.webSocket.isAbsent(), 'Should not connect twice to WebSocket!');
        const token: string = await this.connectedUserService.getIdToken();

        return new Promise((resolve: (sub: Subscription) => void) => {
            const ws: WebSocket = new WebSocket(environment.backendURL.replace(/^http/, 'ws') + '/ws', ['Authorization', token]);
            let timeout: MGPOptional<ReturnType<typeof setTimeout>> = MGPOptional.empty();
            const reconnect: () => void = (): void => {
                if (timeout.isPresent()) {
                    // not trying to reconnect because there's already an attempt scheduled
                    return;
                }
                this.messageDisplayer.criticalMessage($localize`Connection to server failed or closed, trying again in ${this.nextConnectionAttemptTime} seconds...`);
                timeout = MGPOptional.of(setTimeout(
                    async() => {
                        const subscription: Subscription = await this.connect();
                        resolve(subscription);
                    },
                    this.nextConnectionAttemptTime * 1000));
                this.nextConnectionAttemptTime *= 2; // exponential backoff: wait twice as long at every new attempt
            };

            ws.onopen = (): void => {
                if (this.pageIsUnloading) {
                    ws.close();
                    resolve(new Subscription());
                    return;
                }
                if (timeout.isPresent()) {
                    window.clearTimeout(timeout.get());
                    timeout = MGPOptional.empty(); // clear the timeout
                }
                this.webSocket = MGPOptional.of(ws);
                this.nextConnectionAttemptTime = 1; // reset the exponential backoff
                this.resolveConnection(); // notify waiters
                resolve(new Subscription(() => this.disconnect()));
            };
            ws.onerror = (_error: Event): void => {
                if (this.webSocket.isPresent()) {
                    this.webSocket.get().close();
                }
                this.webSocket = MGPOptional.empty();
                reconnect();
            };
            ws.onclose = (): void => {
                this.webSocket = MGPOptional.empty();
                if (this.disconnectRequested) {
                    // We closed it ourselves (most likely due to disconnect), keep it closed.
                    this.disconnectRequested = false; // clear it for next time
                    return;
                }
                // The connection has been closed by the server.
                // It is best to try to reconnect.
                reconnect();
            };
            ws.onmessage = (ev: MessageEvent<unknown>): void => {
                Utils.assert(typeof(ev.data) === 'string', `Received malformed WebSocket message (not a string): ${JSON.stringify(ev.data)}`);
                const json: NonNullable<JSONValue> = Utils.getNonNullable(JSON.parse(ev.data as string));
                Utils.assert(typeof(json) === 'object', // i.e., an array
                             `Received malformed WebSocket message (not an object): ${JSON.stringify(json)}`);
                const tag: unknown = json[0]; // the tag is the first element of the array
                const args: JSONValue = json[1]; // the arguments is an object being the second element
                Utils.assert(tag != null && typeof(tag) === 'string',
                             `Received malformed WebSocket message (missing tag): ${JSON.stringify(json)}`);
                // each callback is associated to a tag
                this.receive(new BackendMessage(tag as string, args));
            };
        });
    }

    protected override async subscribeTo(subscription: string, gameId?: string): Promise<Subscription> {
        if (gameId === undefined) {
            await this.send([subscription]);
        } else {
            await this.send([subscription, { gameId }]);
        }
        return new Subscription(async() => this.send(['Unsubscribe']));
    }

    public override async send(message: JSONValue): Promise<void> {
        await this.waitForConnection(); // block until we are connected, otherwise we'll send messages nowhere
        this.webSocket.get().send(JSON.stringify(message));
    }

    private disconnect(): void {
        Utils.assert(this.webSocket.isPresent(), 'Should not disconnect from unconnected WebSocket!');
        this.disconnectRequested = true;
        this.webSocket.get().close();
        this.webSocket = MGPOptional.empty();
        // Need to clear the promise for the next connection
        this.connectionPromise = new Promise((resolve: () => void) => {
            this.resolveConnection = resolve;
        });
    }

    public ngOnDestroy(): void {
        window.removeEventListener('pagehide', this.disconnectOnPageHide);
        this.disconnectOnPageHide();
    }
}
