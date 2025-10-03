import { ConnectedUserService } from './ConnectedUserService';
import { environment } from 'src/environments/environment';
import { JSONValue, MGPMap, MGPOptional, Utils } from '@everyboard/lib';
import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
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

export type Callback = (message: BackendMessage) => void

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

    public async sendAndWaitForReply(message: JSONValue, replyTag: string): Promise<BackendMessage> {
        await this.send(message);
        return this.waitForMessage(replyTag);
    }

    private async waitForMessage(tag: string): Promise<BackendMessage> {
        return new Promise((resolve: (value: BackendMessage) => void) => {
            this.setCallback(tag, (message: BackendMessage) => {
                this.removeCallback(tag);
                resolve(message);
            });
        });
    }

    public setCallback(tag: string, callback: Callback): Subscription {
        console.log('setCallback called with ' + tag)
        this.callbacks.set(tag, callback);
        return new Subscription(() => this.removeCallback(tag));
    }

    protected receive(message: BackendMessage): void {
        const callback: MGPOptional<Callback> = this.callbacks.get(message.tag);
        Utils.assert(callback.isPresent(), `Received a message with no callback registered: ${message.tag}`);
        callback.get()(message);
    }

    public removeCallback(tag: string): void {
        this.callbacks.delete(tag);
    }

}

@Injectable({
    // This ensures that this is a singleton service, which is very important for this one
    // because we want only a single websocket connection, shared among all other services
    providedIn: 'root',
})
export class BackendService extends AbstractBackendService {

    private webSocket: MGPOptional<WebSocket> = MGPOptional.empty();

    private connectionPromise: Promise<void>;
    private resolveConnection!: () => void;

    private nextConnectionAttemptTime: number = 1;
    private disconnectRequested: boolean = false;

    public constructor(private readonly connectedUserService: ConnectedUserService,
                       private readonly messageDisplayer: MessageDisplayer)
    {
        super();
        this.connectionPromise = new Promise((resolve: () => void) => {
            this.resolveConnection = resolve;
        });
    }

    public waitForConnection(): Promise<void> {
        return this.connectionPromise;
    }

    public override async connect(): Promise<Subscription> {
        console.warn('----------------- connect() is called')
        Utils.assert(this.webSocket.isAbsent(), 'Should not connect twice to WebSocket!')
        const token: string = await this.connectedUserService.getIdToken();

        return new Promise((resolve: (sub: Subscription) => void) => {
            console.warn('1')
            const ws: WebSocket = new WebSocket(environment.backendURL.replace(/^http/, 'ws') + '/ws', ['Authorization', token]);
            let timeout: MGPOptional<number> = MGPOptional.empty();
            console.warn('2')
            const reconnect: () => void = (): void => {
                if (timeout.isPresent()) {
                    // not trying to reconnect because there's already an attempt scheduled
                    return;
                }
                this.messageDisplayer.criticalMessage($localize`Connection to server failed or closed, trying again in ${this.nextConnectionAttemptTime} seconds...`);
                timeout = MGPOptional.of(window.setTimeout(async() => await this.connect(),
                                                           this.nextConnectionAttemptTime * 1000));
                this.nextConnectionAttemptTime *= 2; // exponential backoff: wait twice as long at every new attempt
            };

            ws.onopen = (): void => {
                console.warn('WS: connected');
                if (timeout.isPresent()) {
                    window.clearTimeout(timeout.get());
                    timeout = MGPOptional.empty(); // clear the timeout
                }
                console.warn('4')
                this.messageDisplayer.infoMessage($localize`Connection to server successful!`);
                this.webSocket = MGPOptional.of(ws);
                this.nextConnectionAttemptTime = 1; // reset the exponential backoff
                this.resolveConnection(); // notify waiters
                console.warn('5')
                resolve(new Subscription(() => this.disconnect()));
            };
            ws.onerror = (_error: Event): void => {
                console.warn('------ clearing websocket on error')
                this.webSocket = MGPOptional.empty();
                reconnect();
            };
            ws.onclose = (): void => {
                console.warn('DISCONNECT')
                this.webSocket = MGPOptional.empty();
                // The connection has been closed by the server.
                if (this.disconnectRequested) {
                    // It is because client code requested to disconnect. Keep it as is.
                    this.disconnectRequested = false;
                } else {
                    // Or it is because the server has restarted (or some unexpected error).
                    // It is best to try to reconnect.
                    reconnect();
                }
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
                this.receive(new BackendMessage(tag as string, args));
            };
            console.warn('3')
        });
    }

    protected override async subscribeTo(subscription: string, gameId?: string): Promise<Subscription> {
        if (gameId !== undefined) {
            await this.send([subscription, { gameId }]);
        } else {
            await this.send([subscription]);
        }
        return new Subscription(async() => this.send(['Unsubscribe']));
    }

    public override async send(message: JSONValue): Promise<void> {
        await this.waitForConnection(); // block until we are connected, otherwise we'll send messages nowhere
        console.log('%cWS: >>> ' + JSON.stringify(message), 'color: lightblue');
        this.webSocket.get().send(JSON.stringify(message));
    }

    private disconnect(): void {
        Utils.assert(this.webSocket.isPresent(), 'Should not disconnect from unconnected WebSocket!');
        this.disconnectRequested = true;
        this.webSocket.get().close();
        // Need to clear the promise for the next connection
        this.connectionPromise = new Promise((resolve: () => void) => {
            this.resolveConnection = resolve;
        });
    }
}
