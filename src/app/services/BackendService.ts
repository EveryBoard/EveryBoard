import { ConnectedUserService } from './ConnectedUserService';
import { environment } from 'src/environments/environment';
import { JSONValue, MGPMap, MGPOptional, Utils } from '@everyboard/lib';
import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageDisplayer } from './MessageDisplayer';

export class WebSocketMessage {
    public constructor(private readonly tag: string,
                       private readonly args: JSONValue) {
    }

    public getArgument<T>(name: string): T {
        const value: T | null = this.getOptionalArgument<T>(name);
        if (value == null) {
            throw new Error(`Trying to extract argument from server reply, but there were no such argument: ${name} (on a ${this.tag} message: argunments are ${JSON.stringify(this.args)})`);
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

export type Callback = (message: WebSocketMessage) => void


@Injectable({
    // This ensures that this is a singleton service, which is very important for this one
    // because we want only a single websocket connection, shared among all other services
    providedIn: 'root',
})
export class WebSocketManagerService {

    private webSocket: MGPOptional<WebSocket> = MGPOptional.empty();
    private readonly callbacks: MGPMap<string, Callback> = new MGPMap();

    private readonly connectionPromise: Promise<void>;
    private resolveConnection!: () => void;

    private nextConnectionAttemptTime: number = 1;

    public constructor(private readonly connectedUserService: ConnectedUserService,
                       private readonly messageDisplayer: MessageDisplayer)
    {
        this.connectionPromise = new Promise((resolve: () => void) => {
            this.resolveConnection = resolve;
        });
    }

    public waitForConnection(): Promise<void> {
        return this.connectionPromise;
    }

    public async connect(): Promise<Subscription> {
        Utils.assert(this.webSocket.isAbsent(), 'Should not connect twice to WebSocket!');
        const token: string = await this.connectedUserService.getIdToken();

        return new Promise((resolve: (sub: Subscription) => void) => {
            const ws: WebSocket = new WebSocket(environment.backendURL.replace(/^http/, 'ws') + '/ws', ['Authorization', token]);
            let timeout: MGPOptional<number> = MGPOptional.empty();
            const reconnect: () => void = (): void => {
                if (timeout.isPresent()) {
                    // not trying to reconnect because there's already an attempt scheduled
                    return;
                }
                this.messageDisplayer.criticalMessage($localize`Connection to server failed or closed, trying again in ${this.nextConnectionAttemptTime} seconds...`);
                timeout = MGPOptional.of(window.setTimeout(async() => await this.connect(),
                                                           this.nextConnectionAttemptTime * 1000));
                this.nextConnectionAttemptTime *= 2; // exponential backoff
            };

            ws.onopen = (): void => {
                console.log('WS: connected');
                if (timeout.isPresent()) {
                    window.clearTimeout(timeout.get());
                    timeout = MGPOptional.empty(); // clear the timeout
                }
                this.messageDisplayer.infoMessage($localize`Connection to server successful!`);
                this.webSocket = MGPOptional.of(ws);
                this.nextConnectionAttemptTime = 1; // reset it
                this.resolveConnection(); // notify waiters
                resolve(new Subscription(() => this.disconnect()));
            };
            ws.onerror = (_error: Event): void => {
                reconnect();
            };
            ws.onclose = (): void => {
                // The connection has been closed by the server.
                // This is either unexpected, or because the server has restarted.
                // It is best to try to reconnect in either case.
                reconnect();
            };
            ws.onmessage = (ev: MessageEvent<unknown>): void => {
                Utils.assert(typeof(ev.data) === 'string', `Received malformed WebSocket message (not a string): ${JSON.stringify(ev.data)}`);
                const json: NonNullable<JSONValue> = Utils.getNonNullable(JSON.parse(ev.data as string));
                console.log('%cWS: <<< ' + JSON.stringify(json), 'color: green');
                Utils.assert(typeof(json) === 'object', // i.e., an array
                             `Received malformed WebSocket message (not an object): ${JSON.stringify(json)}`);
                const tag: unknown = json[0]; // the tag is the first element of the array
                const args: JSONValue = json[1]; // the arguments is an object being the second element
                Utils.assert(tag != null && typeof(tag) === 'string',
                             `Received malformed WebSocket message (missing tag): ${JSON.stringify(json)}`);
                // each callback is associated to a tag
                const callback: MGPOptional<Callback> = this.callbacks.get(tag as string);
                Utils.assert(callback.isPresent(), `Received a message with no callback registered: ${JSON.stringify(json)}`);
                // NOTE: in case we need async for callbacks, use void to not wait for the async here.
                callback.get()(new WebSocketMessage(tag as string, args));
            };
        });
    }

    private async subscribeTo(subscription: string, gameId?: string): Promise<Subscription> {
        if (gameId !== undefined) {
            await this.send([subscription, { gameId }]);
        } else {
            await this.send([subscription]);
        }
        return new Subscription(async() => this.send(['Unsubscribe']));
    }

    public subscribeToGame(gameId: string): Promise<Subscription> {
        return this.subscribeTo('SubscribeGame', gameId);
    }

    public subscribeToConfigRoom(gameId: string): Promise<Subscription> {
        return this.subscribeTo('SubscribeConfigRoom', gameId);
    }

    public subscribeToLobby(): Promise<Subscription> {
        return this.subscribeTo('SubscribeLobby');
    }

    public async send(message: JSONValue): Promise<void> {
        await this.waitForConnection(); // block until we are connected, otherwise we'll send messages nowhere
        console.log('%cWS: >>> ' + JSON.stringify(message), 'color: lightblue');
        this.webSocket.get().send(JSON.stringify(message));
    }

    public async sendAndWaitForReply(message: JSONValue, replyTag: string): Promise<WebSocketMessage> {
        await this.send(message);
        return this.waitForMessage(replyTag);
    }

    private async waitForMessage(tag: string): Promise<WebSocketMessage> {
        return new Promise((resolve: (value: WebSocketMessage) => void) => {
            this.setCallback(tag, (message: WebSocketMessage) => {
                this.removeCallback(tag);
                resolve(message);
            });
        });
    }

    public setCallback(tag: string, callback: Callback): Subscription {
        this.callbacks.set(tag, callback);
        return new Subscription(() => this.removeCallback(tag));
    }

    public removeCallback(tag: string): void {
        this.callbacks.delete(tag);
    }

    private disconnect(): void {
        Utils.assert(this.webSocket.isPresent(), 'Should not disconnect from unconnected WebSocket!');
        this.webSocket.get().close();
        this.callbacks.clear();
    }

}
