/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { BackendMessage, BackendService } from '../BackendService';
import { ConnectedUserService } from '../ConnectedUserService';
import { ConnectedUserServiceMock } from './ConnectedUserService.spec';
import { environment } from 'src/environments/environment';
import { MessageDisplayer } from '../MessageDisplayer';
import { JSONValue } from 'lib/dist';
import { MGPFallible } from '@everyboard/lib';

describe('BackendMessage', () => {
    describe('getArgument', () => {
        it('should return argument value when present', () => {
            const message: BackendMessage = new BackendMessage('TestTag', { name: 'John', age: 30 });
            expect(message.getArgument<string>('name')).toBe('John');
            expect(message.getArgument<number>('age')).toBe(30);
        });

        it('should throw error when argument is missing', () => {
            const message: BackendMessage = new BackendMessage('TestTag', { name: 'John' });
            expect(() => message.getArgument<string>('missing'))
                .toThrowError(/Trying to extract argument from server reply/);
        });

        it('should throw error when argument is null', () => {
            const message: BackendMessage = new BackendMessage('TestTag', { name: null });
            expect(() => message.getArgument<string>('name'))
                .toThrowError(/Trying to extract argument from server reply/);
        });

        it('should throw error when args is null', () => {
            const message: BackendMessage = new BackendMessage('TestTag', null);
            expect(() => message.getArgument<string>('name'))
                .toThrowError(/Trying to extract argument from server reply, but there were no argument/);
        });
    });

    describe('getOptionalArgument', () => {
        it('should return argument value when present', () => {
            const message: BackendMessage = new BackendMessage('TestTag', { name: 'John' });
            expect(message.getOptionalArgument<string>('name')).toBe('John');
        });

        it('should return undefined when argument is missing', () => {
            const message: BackendMessage = new BackendMessage('TestTag', { name: 'John' });
            expect(message.getOptionalArgument<string>('missing')).toBeUndefined();
        });

        it('should return null when argument value is null', () => {
            const message: BackendMessage = new BackendMessage('TestTag', { name: null });
            expect(message.getOptionalArgument<string>('name')).toBeNull();
        });

        it('should throw error when args is null', () => {
            const message: BackendMessage = new BackendMessage('TestTag', null);
            expect(() => message.getOptionalArgument<string>('name'))
                .toThrowError(/Trying to extract argument from server reply, but there were no argument/);
        });
    });
});

describe('BackendService', () => {
    class WebSocketMock {
        public onopen: ((ev: Event) => void) | null = null;
        public onerror: ((ev: Event) => void) | null = null;
        public onclose: ((ev: CloseEvent) => void) | null = null;
        public onmessage: ((ev: MessageEvent) => void) | null = null;
        public send: (data: string) => void = () => {};
        public close: () => void = () => {};

        public constructor(public url: string, public protocols: string[]) {
            webSocketInstances.push(this as unknown as WebSocket);
        }
    }

    let backendService: BackendService;
    let webSocketInstances: WebSocket[] = [];
    let messageDisplayer: MessageDisplayer;
    beforeEach(() => {
        // Mock WebSocket
        webSocketInstances = [];
        window.WebSocket = WebSocketMock as unknown as (typeof WebSocket);

        TestBed.configureTestingModule({
            providers: [
                BackendService,
                { provide: ConnectedUserService, useClass: ConnectedUserServiceMock },
            ],
        });

        backendService = TestBed.inject(BackendService);
        messageDisplayer = TestBed.inject(MessageDisplayer);
        spyOn(messageDisplayer, 'criticalMessage').and.returnValue();
        spyOn(messageDisplayer, 'infoMessage').and.returnValue();
    });

    afterEach(() => {
        expect(messageDisplayer.criticalMessage).not.toHaveBeenCalled();
        expect(messageDisplayer.infoMessage).not.toHaveBeenCalled();
    });

    function expectCriticalMessage(message: string): void {
        expect(messageDisplayer.criticalMessage).toHaveBeenCalledOnceWith(message);
        messageDisplayer.criticalMessage['calls'].reset();
    }

    async function connect(): Promise<Subscription> {
        const subscriptionPromise: Promise<Subscription> = backendService.connect();
        tick(0);
        const ws: WebSocket = webSocketInstances[webSocketInstances.length-1];
        ws.onopen!(new Event('open'));
        const subscription: Subscription = await subscriptionPromise;
        return subscription;
    }

    describe('connect', () => {
        it('should establish WebSocket connection successfully', fakeAsync(async() => {
            // Given a backend service
            // When connecting
            const subscription: Subscription = await connect();
            // Then it should established the connection to the websocket of the server with the identity token
            expect(webSocketInstances.length).toBe(1);
            const ws: WebSocket = webSocketInstances[0];
            expect(ws.url).toContain(environment.backendURL.replace(/^http/, 'ws') + '/ws');
            expect(ws['protocols']).toEqual(['Authorization', 'idToken']);
            subscription.unsubscribe();
        }));

        it('should throw error if connect called twice', fakeAsync(async() => {
            // Given a backend service already connected
            const subscription: Subscription = await connect();

            // When connecting a second time
            expectAsync(backendService.connect()).toBeRejectedWithError(/Should not connect twice to WebSocket/);

            subscription.unsubscribe();
        }));

        it('should handle connection error and retry', fakeAsync(async() => {
            // Given a backend service already connected
            const subscription: Subscription = await connect();

            // When there is an error
            const ws: WebSocket = webSocketInstances[0];
            spyOn(ws, 'close').and.callThrough();
            ws.onerror!(new Event('error'));
            tick(0);

            // Then it should be displayed and the connection closed and retried
            expectCriticalMessage('Connection to server failed or closed, trying again in 1 seconds...');
            tick(1000); // wait 1 second to see if it reconnects
            expect(webSocketInstances.length).toBe(2);
            ws.onopen!(new Event('open')); // open the second connection so that we can unsubscribe
            subscription.unsubscribe();
        }));

        it('should use exponential backoff for reconnection attempts', fakeAsync(async() => {
            // Given a backend service which already tried to reconnect due to an error
            const subscriptionPromise: Promise<Subscription> = backendService.connect();
            tick(0);
            let ws: WebSocket = webSocketInstances[0];
            ws.onerror!(new Event('error'));
            expectCriticalMessage('Connection to server failed or closed, trying again in 1 seconds...');
            tick(1000); // wait 1 second so that it tries to reconnect

            // When there is a second error
            ws = webSocketInstances[1];
            ws.onerror!(new Event('error'));
            tick(1000);

            // Then it not have tried to reconnect after a second, but instead after two seconds
            expectCriticalMessage('Connection to server failed or closed, trying again in 2 seconds...');
            expect(webSocketInstances.length).toBe(2);
            tick(1000);
            expect(webSocketInstances.length).toBe(3);
            ws = webSocketInstances[2];
            ws.onopen!(new Event('open'));
            const subscription: Subscription = await subscriptionPromise;
            subscription.unsubscribe();
        }));

        it('should handle onclose and reconnect when not requested', fakeAsync(async() => {
            // Given a backend service which is connected
            const subscription: Subscription = await connect();

            // When the connection is closed from the server (without being requested by the client)
            let ws: WebSocket = webSocketInstances[0];
            ws.onclose!(new CloseEvent('close'));

            // Then we are notified about it and proceed with a reconnection
            expectCriticalMessage('Connection to server failed or closed, trying again in 1 seconds...');
            tick(1000);
            expect(webSocketInstances.length).toBe(2);
            ws = webSocketInstances[1];
            ws.onopen!(new Event('open'));
            subscription.unsubscribe();
        }));

        it('should not schedule duplicate reconnection if timeout already exists', fakeAsync(async() => {
            // Given a backend service already connected with an error that occured
            const subscription: Subscription = await connect();
            let ws: WebSocket = webSocketInstances[0];
            spyOn(ws, 'close').and.callThrough();
            ws.onerror!(new Event('error'));
            tick(500);

            // When there is a second error
            ws.onerror!(new Event('error'));
            tick(500);

            // Then there should still be one connection attempt
            expectCriticalMessage('Connection to server failed or closed, trying again in 1 seconds...');
            messageDisplayer.criticalMessage['calls'].reset();
            expect(webSocketInstances.length).toBe(2);
            ws = webSocketInstances[1];
            ws.onopen!(new Event('open'));
            subscription.unsubscribe();
        }));

    });

    describe('send', () => {
        const message: JSONValue = ['TestMessage', { data: 'test' }];
        it('should send message through WebSocket', fakeAsync(async() => {
            // Given a backend service already connected
            const subscription: Subscription = await connect();

            // When sending a message
            const ws: WebSocket = webSocketInstances[0];
            spyOn(ws, 'send').and.callThrough();
            await backendService.send(message);

            // Then it should be sent to the websocket
            expect(ws.send).toHaveBeenCalledOnceWith(JSON.stringify(message));
            subscription.unsubscribe();
        }));

        it('should wait for connection before sending', fakeAsync(async() => {
            // Given a backend service not yet connected
            const subscriptionPromise: Promise<Subscription> = backendService.connect();
            tick(0);
            const ws: WebSocket = webSocketInstances[0];

            // When sending a message
            spyOn(ws, 'send').and.callThrough();
            const messagePromise: Promise<void> = backendService.send(message);
            tick(0); // to see if it sends anything

            // Then it should not be sent until we are finally connected
            expect(ws.send).not.toHaveBeenCalled();
            ws.onopen!(new Event('open'));
            const subscription: Subscription = await subscriptionPromise;
            await messagePromise;
            expect(ws.send).toHaveBeenCalledOnceWith(JSON.stringify(message));
            subscription.unsubscribe();
        }));
    });

    describe('callbacks', () => {

        it('should call callback when matching message received', fakeAsync(async() => {
            // Given a backend service connected with a callback set
            const subscription: Subscription = await connect();
            const callback: jasmine.Spy = jasmine.createSpy('callback');
            backendService.setCallback('TestTag', callback);

            // When receiving a message that matches
            const ws: WebSocket = webSocketInstances[0];
            const message: JSONValue = ['TestTag', { data: 'test' }];
            const data: string = JSON.stringify(message);
            ws.onmessage!(new MessageEvent('message', { data }));
            tick(0);

            // Then the callback should be called
            expect(callback).toHaveBeenCalledOnceWith(new BackendMessage('TestTag', message[1]));
            subscription.unsubscribe();
        }));

        it('should not call callback for different tag', fakeAsync(async() => {
            // Given a backend service connected with a callback set
            const subscription: Subscription = await connect();
            const callback: jasmine.Spy = jasmine.createSpy('callback');
            backendService.setCallback('SomeOtherTag', callback);

            // When receiving a message that does not match
            const ws: WebSocket = webSocketInstances[0];
            const message: JSONValue = ['TestTag', { data: 'test' }];
            const data: string = JSON.stringify(message);
            ws.onmessage!(new MessageEvent('message', { data }));
            tick(0);

            // Then the callback should not be called
            expect(callback).not.toHaveBeenCalled();
            subscription.unsubscribe();
        }));

        it('should error if registering two callbacks to the same tag', fakeAsync(async() => {
            // Given a backend service connected with a callback set
            const subscription: Subscription = await connect();
            const callback: jasmine.Spy = jasmine.createSpy('callback');
            backendService.setCallback('SomeOtherTag', callback);

            // When setting another callback to the same tag
            // Then it should fail
            expect(() => backendService.setCallback('SomeOtherTag', callback))
                .toThrowError(/registering a callback which already exists/);
            subscription.unsubscribe();
        }));

        it('should remove callback after calling removeCallback', fakeAsync(async() => {
            // Given a backend service connected with a callback set then removed
            const subscription: Subscription = await connect();
            const callback: jasmine.Spy = jasmine.createSpy('callback');
            const callbackSubscription: Subscription = backendService.setCallback('TestTag', callback);
            callbackSubscription.unsubscribe();

            // When receiving a message that matches the callback
            const ws: WebSocket = webSocketInstances[0];
            const message: JSONValue = ['TestTag', { data: 'test' }];
            const data: string = JSON.stringify(message);
            ws.onmessage!(new MessageEvent('message', { data }));
            tick(0);

            // Then the callback should not be called
            expect(callback).not.toHaveBeenCalled();
            subscription.unsubscribe();
        }));
    });

    describe('message reception', () => {

        it('should throw error on malformed message', fakeAsync(async() => {
            // Given a backend service connected
            const subscription: Subscription = await connect();
            const ws: WebSocket = webSocketInstances[0];

            // When receiveing a malformed message
            // Then it should throw
            expect(() => ws.onmessage!(new MessageEvent('message', { data: { invalid: 'object' } })))
                .toThrowError(/Received malformed WebSocket message \(not a string\)/);
            expect(() => ws.onmessage!(new MessageEvent('message', { data: '"just a string"' })))
                .toThrowError(/Received malformed WebSocket message \(not an object\)/);
            expect(() => ws.onmessage!(new MessageEvent('message', { data: JSON.stringify([null, {}]) })))
                .toThrowError(/Received malformed WebSocket message \(missing tag\)/);

            subscription.unsubscribe();
        }));

    });

    describe('sendAndWaitForReply', () => {
        it('should send message and wait for reply', fakeAsync(async() => {
            // Given a connected service
            const subscription: Subscription = await connect();
            const ws: WebSocket = webSocketInstances[0];

            // When sending and waiting for reply
            const message: JSONValue = ['TestTag', { data: 'test' }];
            spyOn(ws, 'send').and.callThrough();
            const replyPromise: Promise<MGPFallible<BackendMessage>> = backendService.sendAndWaitForReply(message, 'ReplyTag');
            tick(0);

            // Then the message must have been sent and we should get the reply back
            expect(ws.send).toHaveBeenCalledOnceWith(JSON.stringify(message));
            const reply: JSONValue = ['ReplyTag', { result: 'success' }];
            ws.onmessage!(new MessageEvent('message', { data: JSON.stringify(reply) })); // simulate reply

            const received: MGPFallible<BackendMessage> = await replyPromise;
            expect(received.isSuccess()).toBeTrue();
            expect(received.get().tag).toBe('ReplyTag');
            expect(received.get().getArgument<string>('result')).toBe('success');

            subscription.unsubscribe();
        }));

        it('should also receive errors', fakeAsync(async() => {
            // Given a connected service
            const subscription: Subscription = await connect();
            const ws: WebSocket = webSocketInstances[0];

            // When sending and waiting for reply but getting an error
            const message: JSONValue = ['TestTag', { data: 'test' }];
            spyOn(ws, 'send').and.callThrough();
            const replyPromise: Promise<MGPFallible<BackendMessage>> = backendService.sendAndWaitForReply(message, 'ReplyTag');
            tick(0);

            // Then the message must have been sent and we should get the error appropriately
            expect(ws.send).toHaveBeenCalledOnceWith(JSON.stringify(message));
            const reply: JSONValue = ['Error', { reason: 'some-error' }];
            ws.onmessage!(new MessageEvent('message', { data: JSON.stringify(reply) })); // simulate reply

            const received: MGPFallible<BackendMessage> = await replyPromise;
            expect(received.isFailure()).toBeTrue();
            expect(received.getReason()).toBe('some-error');

            subscription.unsubscribe();
        }));
    });

    describe('subscribeTo methods', () => {

        it('should subscribe to game with gameId', fakeAsync(async() => {
            // Given a backend connection
            const subscription: Subscription = await connect();
            const ws: WebSocket = webSocketInstances[0];
            spyOn(ws, 'send').and.callThrough();
            // When subscribing to a game
            await backendService.subscribeToGame('game123');
            tick(0);
            // Then it should send the appropriate message
            expect(ws.send).toHaveBeenCalledOnceWith(JSON.stringify(['SubscribeGame', { gameId: 'game123' }]));
            subscription.unsubscribe();
        }));

        it('should subscribe to config room with gameId', fakeAsync(async() => {
            // Given a backend connection
            const subscription: Subscription = await connect();
            const ws: WebSocket = webSocketInstances[0];
            spyOn(ws, 'send').and.callThrough();
            // When subscribing to a config room
            await backendService.subscribeToConfigRoom('game123');
            tick(0);
            // Then it should send the appropriate message
            expect(ws.send).toHaveBeenCalledOnceWith(JSON.stringify(['SubscribeConfigRoom', { gameId: 'game123' }]));
            subscription.unsubscribe();
        }));

        it('should subscribe to lobby without gameId', fakeAsync(async() => {
            // Given a backend connection
            const subscription: Subscription = await connect();
            const ws: WebSocket = webSocketInstances[0];
            spyOn(ws, 'send').and.callThrough();
            // When subscribing to the lobby
            await backendService.subscribeToLobby();
            tick(0);
            // Then it should send the appropriate message
            expect(ws.send).toHaveBeenCalledOnceWith(JSON.stringify(['SubscribeLobby']));
            subscription.unsubscribe();
        }));

        it('should return subscription that unsubscribes', fakeAsync(async() => {
            // Given a backend connection which is subscribed to a game
            const subscription: Subscription = await connect();
            const ws: WebSocket = webSocketInstances[0];
            spyOn(ws, 'send').and.callThrough();
            const gameSubscription: Subscription = await backendService.subscribeToGame('game123');
            tick(0);
            // When unsubscribing from the game
            gameSubscription.unsubscribe();
            tick(0);
            // Then it should send the appropriate message
            expect(ws.send).toHaveBeenCalledWith(JSON.stringify(['Unsubscribe']));
            subscription.unsubscribe();
        }));
    });

    describe('disconnect', () => {
        it('should close WebSocket and not reconnect', fakeAsync(async() => {
            // Given a backend connected
            const subscription: Subscription = await connect();
            const ws: WebSocket = webSocketInstances[0];
            spyOn(ws, 'close').and.callThrough();
            // When unsubscribing from it
            subscription.unsubscribe();
            // Then it should close the websocket connection
            expect(ws.close).toHaveBeenCalledOnceWith();
        }));

        it('should be able to connect again after disconnect', fakeAsync(async() => {
            // Given a backend connected then disconnected
            const subscription: Subscription = await connect();
            const ws: WebSocket = webSocketInstances[0];
            spyOn(ws, 'close').and.callThrough();
            subscription.unsubscribe();
            // When connecting again
            const otherSubscription: Subscription = await connect();
            // Then it should be able to do it and open a new connection
            expect(webSocketInstances.length).toBe(2);
            otherSubscription.unsubscribe();
        }));
    });

    describe('waitForConnection', () => {
        it('should resolve when connection is established', fakeAsync(async() => {
            // Given a waitForConnection promise waiting for connection
            let connectionReady: boolean = false;
            const promise: Promise<void> = backendService.waitForConnection().then(() => {
                connectionReady = true;
            });
            // When the service is connected
            const subscription: Subscription = await connect();
            // Then the promise mshould be resolved
            await promise;
            expect(connectionReady).toBeTrue();
            subscription.unsubscribe();
        }));
    });
});
