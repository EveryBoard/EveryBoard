import { Injectable, OnDestroy } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { display, Utils } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';
import { MGPValidation } from '../utils/MGPValidation';
import { MGPFallible } from '../utils/MGPFallible';
import { UserDAO } from '../dao/UserDAO';
import { FocusedPart, User, UserRoleInPart } from '../domain/User';
import { MGPOptional } from '../utils/MGPOptional';
import { FirebaseError } from '@angular/fire/app';
import * as FireAuth from '@angular/fire/auth';
import { ErrorLoggerService } from './ErrorLoggerService';
import { MinimalUser } from '../domain/MinimalUser';
import { Localized } from '../utils/LocaleUtils';
import { MGPMap } from '../utils/MGPMap';
import { Subscription } from 'rxjs';
import { UserService } from './UserService';

export class GameActionFailure {

    public static YOU_ARE_ALREADY_PLAYING: Localized = () => $localize`You are already playing in another game.`;

    public static YOU_ARE_ALREADY_CREATING: Localized = () => $localize`You are already the creator of another game.`;

    public static YOU_ARE_ALREADY_CHOSEN_OPPONENT: Localized = () => $localize`You are already the chosen opponent in another game.`;

    public static YOU_ARE_ALREADY_CANDIDATE: Localized = () => $localize`You are already candidate in another game.`;

    public static YOU_ARE_ALREADY_OBSERVING: Localized = () => $localize`You are already observing in another game.`;
}

// This class is an indirection to Firestore's auth methods, to support spyOn on them in the test code.
export class Auth {
    public static createUserWithEmailAndPassword(auth: FireAuth.Auth, email: string, password: string)
    : Promise<FireAuth.UserCredential>
    {
        return FireAuth.createUserWithEmailAndPassword(auth, email, password);
    }
    public static sendEmailVerification(user: FireAuth.User): Promise<void> {
        return FireAuth.sendEmailVerification(user);
    }
    public static sendPasswordResetEmail(auth: FireAuth.Auth, email: string): Promise<void> {
        return FireAuth.sendPasswordResetEmail(auth, email);
    }
    public static async signInWithEmailAndPassword(auth: FireAuth.Auth, email: string, password: string)
    : Promise<FireAuth.User>
    {
        const credential: FireAuth.UserCredential = await FireAuth.signInWithEmailAndPassword(auth, email, password);
        return credential.user;
    }
    public static async signInWithPopup(auth: FireAuth.Auth, provider: FireAuth.AuthProvider): Promise<FireAuth.User> {
        const credential: FireAuth.UserCredential = await FireAuth.signInWithPopup(auth, provider);
        return credential.user;
    }
    public static updateProfile(user: FireAuth.User, profile: { displayName?: string, photoURL?: string })
    : Promise<void>
    {
        return FireAuth.updateProfile(user, profile);
    }
}

export class AuthUser {
    /**
     * Represents the fact the user is not connected
     */
    public static NOT_CONNECTED: AuthUser = new AuthUser('', MGPOptional.empty(), MGPOptional.empty(), false);

    /**
     * Constructs an AuthUser.
     * Requires:
     * - the id of the user
     * - the email of the user, which may be null to represent that no user is connected
     * - the username of the user, which may be null if the user hasn't chosen a username yet
     * - a boolean indicating whether the user is verified
     */
    constructor(public id: string,
                public email: MGPOptional<string>,
                public username: MGPOptional<string>,
                public verified: boolean) {
    }
    public isConnected(): boolean {
        // Only a user that is connected has its email set pour éviter les confusions futures !
        return this.email.isPresent();
    }
    public toMinimalUser(): MinimalUser {
        return {
            id: this.id,
            name: this.username.get(),
        };
    }
}

@Injectable({
    providedIn: 'root',
})
export class ConnectedUserService implements OnDestroy {

    public static VERBOSE: boolean = false;

    public static roleToMessage: MGPMap<UserRoleInPart, Localized> = new MGPMap([
        { key: 'Candidate', value: GameActionFailure.YOU_ARE_ALREADY_CANDIDATE },
        { key: 'ChosenOpponent', value: GameActionFailure.YOU_ARE_ALREADY_CHOSEN_OPPONENT },
        { key: 'Creator', value: GameActionFailure.YOU_ARE_ALREADY_CREATING },
        { key: 'Player', value: GameActionFailure.YOU_ARE_ALREADY_PLAYING },
        { key: 'Observer', value: GameActionFailure.YOU_ARE_ALREADY_OBSERVING },
    ]);

    private readonly authSubscription!: Subscription;

    /**
     * This is the current user, if there is one.
     * Components depending on an AccountGuard can safely assume it is defined and directly call .get() on it.
     * (This is because the guard can't activate if there is no user, so if the guard was activated, there is a user)
     */
    public user: MGPOptional<AuthUser> = MGPOptional.empty();
    private readonly userRS: ReplaySubject<AuthUser>;
    private readonly userObs: Observable<AuthUser>;
    private userSubscription: Subscription = new Subscription();

    private observedPart: MGPOptional<FocusedPart> = MGPOptional.empty();
    private readonly observedPartRS: ReplaySubject<MGPOptional<FocusedPart>>;
    private readonly observedPartObs: Observable<MGPOptional<FocusedPart>>;

    constructor(private readonly userDAO: UserDAO,
                private readonly userService: UserService,
                private readonly auth: FireAuth.Auth)
    {
        display(ConnectedUserService.VERBOSE, 'ConnectedUserService constructor');

        this.userRS = new ReplaySubject<AuthUser>(1);
        this.userObs = this.userRS.asObservable();
        this.observedPartRS = new ReplaySubject<MGPOptional<FocusedPart>>(1);
        this.observedPartRS.next(MGPOptional.empty());
        this.observedPartObs = this.observedPartRS.asObservable();
        this.authSubscription =
            new Subscription(FireAuth.onAuthStateChanged(this.auth, async(user: FireAuth.User | null) => {
                if (user == null) { // user logged out
                    display(ConnectedUserService.VERBOSE, 'User is not connected');
                    this.userSubscription.unsubscribe();
                    this.userRS.next(AuthUser.NOT_CONNECTED);
                    this.user = MGPOptional.empty();
                } else { // new user logged in
                    assert(this.user.isAbsent(), 'ConnectedUserService received a double update for an user, this is unexpected');
                    this.userSubscription =
                        this.userDAO.subscribeToChanges(user.uid, (docOpt: MGPOptional<User>) => {
                            if (docOpt.isPresent()) {
                                const doc: User = docOpt.get();
                                const username: string | undefined = doc.username;
                                display(ConnectedUserService.VERBOSE, `User ${username} is connected, and the verified status is ${this.emailVerified(user)}`);
                                const userHasFinalizedVerification: boolean =
                                    this.emailVerified(user) === true && username != null;
                                if (userHasFinalizedVerification === true && doc.verified === false) {
                                    // The user has finalized verification but isn't yet marked as so in the DB.
                                    // So we mark it, and we'll get notified when the user is marked.
                                    return this.userService.markAsVerified(user.uid);
                                }
                                const authUser: AuthUser = new AuthUser(user.uid,
                                                                        MGPOptional.ofNullable(user.email),
                                                                        MGPOptional.ofNullable(username),
                                                                        userHasFinalizedVerification);
                                this.user = MGPOptional.of(authUser);
                                this.userRS.next(authUser);
                                this.updateObservedPartWithDoc(doc.observedPart);
                            }
                        });
                }
            }));
    }
    private updateObservedPartWithDoc(newObservedPart: FocusedPart | null | undefined): void {
        const previousObservedPart: MGPOptional<FocusedPart> = this.observedPart;
        const stayedNull: boolean = newObservedPart == null && previousObservedPart.isAbsent();
        const stayedItselfAsNonNull: boolean = newObservedPart != null &&
                                               previousObservedPart.equalsValue(newObservedPart);
        const valueChanged: boolean = stayedNull === false && stayedItselfAsNonNull === false;
        if (valueChanged) {
            this.observedPart = MGPOptional.ofNullable(newObservedPart);
            this.observedPartRS.next(this.observedPart);
        }
    }
    public emailVerified(user: FireAuth.User): boolean {
        // Only needed for mocking purposes
        return user.emailVerified;
    }
    public async sendPasswordResetEmail(email: string): Promise<MGPValidation> {
        try {
            await Auth.sendPasswordResetEmail(this.auth, email);
            return MGPValidation.SUCCESS;
        } catch (e) {
            return MGPValidation.failure(this.mapFirebaseError(e));
        }
    }
    /**
     * Registers an user given its username, email, and password.
     * Returns the firebase user upon success, or a failure otherwise.
     */
    public async doRegister(username: string, email: string, password: string): Promise<MGPFallible<FireAuth.User>> {
        display(ConnectedUserService.VERBOSE, 'ConnectedUserService.doRegister(' + email + ')');
        if (await this.userService.usernameIsAvailable(username)) {
            return this.registerAfterUsernameCheck(username, email, password);
        } else {
            return MGPFallible.failure($localize`This username is already in use.`);
        }
    }
    private async registerAfterUsernameCheck(username: string, email: string, password: string)
    : Promise<MGPFallible<FireAuth.User>>
    {
        try {
            const userCredential: FireAuth.UserCredential =
                await Auth.createUserWithEmailAndPassword(this.auth, email, password);
            // Directly logs in
            await Auth.signInWithEmailAndPassword(this.auth, email, password);
            const user: FireAuth.User = Utils.getNonNullable(userCredential.user);
            await this.createUser(user.uid, username);
            return MGPFallible.success(user);
        } catch (e) {
            return MGPFallible.failure(this.mapFirebaseError(e));
        }
    }
    public mapFirebaseError(error: FirebaseError): string {
        switch (error.code) {
            case 'auth/email-already-in-use':
                return $localize`This email address is already in use.`;
            case 'auth/invalid-email':
                return $localize`This email address is invalid.`;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                // In accordance with security best practices, we don't give too much details here
                return $localize`You have entered invalid credentials.`;
            case 'auth/invalid-credential':
                return $localize`The credential is invalid or has expired, please try again.`;
            case 'auth/weak-password':
                return $localize`Your password is too weak, please use a stronger password.`;
            case 'auth/too-many-requests':
                return $localize`There has been too many requests from your device. You are temporarily blocked due to unusual activity. Try again later.`;
            case 'auth/popup-closed-by-user':
                return $localize`You closed the authentication popup without finalizing your log in.`;
            case 'auth/popup-blocked':
                return $localize`The authentication popup was blocked. Try again after disabling popup blocking.`;
            default:
                ErrorLoggerService.logError('ConnectedUserService', 'Unsupported firebase error', { errorCode: error.code, errorMessage: error.message });
                return error.message;
        }
    }
    public async sendEmailVerification(): Promise<MGPValidation> {
        display(ConnectedUserService.VERBOSE, 'ConnectedUserService.sendEmailVerification()');
        const user: MGPOptional<FireAuth.User> = MGPOptional.ofNullable(this.auth.currentUser);
        if (user.isPresent()) {
            if (this.emailVerified(user.get())) {
                // This should not be reachable from a component
                return ErrorLoggerService.logError('ConnectedUserService', 'Verified users should not ask email verification after being verified');
            }
            try {
                await Auth.sendEmailVerification(user.get());
                return MGPValidation.SUCCESS;
            } catch (e) {
                return MGPValidation.failure(this.mapFirebaseError(e));
            }
        } else {
            // This should not be reachable from a component
            return ErrorLoggerService.logError('ConnectedUserService', 'Unlogged users cannot request for email verification');
        }
    }
    /**
     * Logs in using an email and a password. Returns a validation to indicate
     * either success, or failure with a specific error.
     */
    public async doEmailLogin(email: string, password: string): Promise<MGPValidation> {
        display(ConnectedUserService.VERBOSE, 'ConnectedUserService.doEmailLogin(' + email + ')');
        try {
            // Login through firebase. If the login is incorrect or fails for some reason, an error is thrown.
            await Auth.signInWithEmailAndPassword(this.auth, email, password);
            return MGPValidation.SUCCESS;
        } catch (e) {
            return MGPValidation.failure(this.mapFirebaseError(e));
        }
    }
    /**
     * Create the user doc in firestore. Google accounts initially have no username.
     */
    public async createUser(uid: string, username?: string): Promise<void> {
        if (username == null) {
            await this.userDAO.set(uid, { verified: false });
        } else {
            await this.userDAO.set(uid, { username, verified: false });
        }
    }
    public async doGoogleLogin(): Promise<MGPValidation> {

        return MGPValidation.ofFallible(await this.registerOrLoginWithGoogle());
    }
    private async registerOrLoginWithGoogle(): Promise<MGPFallible<FireAuth.User>> {
        try {
            const provider: FireAuth.GoogleAuthProvider = new FireAuth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            const user: FireAuth.User = await Auth.signInWithPopup(this.auth, provider);
            if (await this.userDAO.exists(user.uid) === false) {
                await this.createUser(user.uid);
            }
            return MGPFallible.success(user);
        } catch (e) {
            return MGPFallible.failure(this.mapFirebaseError(e));
        }

    }
    public async disconnect(): Promise<MGPValidation> {
        const user: MGPOptional<FireAuth.User> = MGPOptional.ofNullable(this.auth.currentUser);
        if (user.isPresent()) {
            this.observedPartRS.next(MGPOptional.empty());
            await this.auth.signOut();
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure('Cannot disconnect a non-connected user');
        }
    }
    public subscribeToUser(callback: (user: AuthUser) => void): Subscription {
        return this.userObs.subscribe(callback);
    }
    public subscribeToObservedPart(callback: (optFocusedPart: MGPOptional<FocusedPart>) => void): Subscription {
        return this.observedPartObs.subscribe(callback);
    }
    public async setUsername(username: string): Promise<MGPValidation> {
        if (username === '') {
            return MGPValidation.failure($localize`Your username may not be empty.`);
        }
        try {
            const available: boolean = await this.userService.usernameIsAvailable(username);
            if (available === false) {
                return MGPValidation.failure($localize`This username is already in use, please select a different one.`);
            }
            const currentUser: FireAuth.User = Utils.getNonNullable(this.auth.currentUser);
            await Auth.updateProfile(currentUser, { displayName: username });
            await this.userService.setUsername(currentUser.uid, username);
            // Only gmail accounts can set their username, and they become finalized once they do
            await this.userService.markAsVerified(currentUser.uid);
            // Reload the user to notify listeners that the user has changed
            await this.reloadUser();
            return MGPValidation.SUCCESS;
        } catch (e) {
            return MGPValidation.failure(this.mapFirebaseError(e));
        }
    }
    public async setPicture(url: string): Promise<MGPValidation> {
        try {
            const currentUser: FireAuth.User = Utils.getNonNullable(this.auth.currentUser);
            await Auth.updateProfile(currentUser, { photoURL: url });
            return MGPValidation.SUCCESS;
        } catch (e) {
            return MGPValidation.failure(this.mapFirebaseError(e));
        }
    }
    public async reloadUser(): Promise<void> {
        const currentUser: FireAuth.User = Utils.getNonNullable(this.auth.currentUser);
        await currentUser.getIdToken(true);
        await currentUser.reload();
    }
    public updateObservedPart(observedPart: Partial<FocusedPart>): Promise<void> {
        // TODO FOR REVIEW should we assert that observedPart (the update) is not partial if this.observedPart (the current value) is not set ?
        const oldObservedPart: FocusedPart = this.observedPart.getOrElse(observedPart as FocusedPart);
        const mergedObservedPart: FocusedPart = { ...oldObservedPart, ...observedPart };
        assert(this.user.isPresent(), 'Should not call updateObservedPart when not connected');
        return this.userDAO.update(this.user.get().id, { observedPart: mergedObservedPart });
    }
    public removeObservedPart(): Promise<void> {
        assert(this.user.isPresent(), 'Should not call removeObservedPart when not connected');
        return this.userDAO.update(this.user.get().id, { observedPart: null });
    }
    public sendPresenceToken(): Promise<void> {
        assert(this.user.isPresent(), 'Should not call sendPresenceToken when not connected');
        return this.userService.updatePresenceToken(this.user.get().id);
    }
    public canUserCreate(): MGPValidation {
        if (this.observedPart.isAbsent()) {
            return MGPValidation.SUCCESS;
        } else {
            const message: string = ConnectedUserService.roleToMessage.get(this.observedPart.get().role).get()();
            return MGPValidation.failure(message);
        }
    }
    public canUserJoin(partId: string, gameStarted: boolean): MGPValidation {
        if (this.observedPart.isAbsent() || this.observedPart.get().id === partId) {
            // If user is in no part, he can join one
            // If he is onne part and want to join it again, he can
            return MGPValidation.SUCCESS;
        } else {
            if (gameStarted && this.observedPart.get().role === 'Observer') {
                // User is allowed to observe two different parts
                return MGPValidation.SUCCESS;
            } else {
                // If the other-part is not-started, you cannot (join it and become candidate)
                // if the other-part is started but you are active(aka: non-observer) you cannot join it
                const message: string = ConnectedUserService.roleToMessage.get(this.observedPart.get().role).get()();
                return MGPValidation.failure(message);
            }
        }
    }
    public ngOnDestroy(): void {
        this.userSubscription.unsubscribe();
        this.authSubscription.unsubscribe();
    }
}
