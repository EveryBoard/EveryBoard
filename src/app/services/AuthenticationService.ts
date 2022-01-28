import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { assert, display, Utils } from 'src/app/utils/utils';
import { MGPValidation } from '../utils/MGPValidation';
import { MGPFallible } from '../utils/MGPFallible';
import { UserDAO } from '../dao/UserDAO';
import { User } from '../domain/User';
import { MGPOptional } from '../utils/MGPOptional';
import { serverTimestamp, Unsubscribe } from 'firebase/firestore';
import { DatabaseReference, DataSnapshot, getDatabase, onDisconnect, onValue, ref, set } from 'firebase/database';
import { FirebaseError } from 'firebase/app';
import * as FireAuth from 'firebase/auth';

export class RTDB {
    public static OFFLINE: ConnectivityStatus = {
        state: 'offline',
        last_changed: serverTimestamp(),
    };
    public static ONLINE: ConnectivityStatus = {
        state: 'online',
        last_changed: serverTimestamp(),
    };
    public static setOffline(uid: string): Promise<void> {
        return set(ref(getDatabase(), '/status/' + uid), RTDB.OFFLINE);
    }
    public static async updatePresence(uid: string): Promise<void> {
        const userStatusDatabaseRef: DatabaseReference = ref(getDatabase(), '/status/' + uid);
        onValue(ref(getDatabase(), '.info/connected'), async(snapshot: DataSnapshot) => {
            if (snapshot.val() === false) {
                return;
            }
            await onDisconnect(userStatusDatabaseRef).set(RTDB.OFFLINE).then(async() => {
                await set(userStatusDatabaseRef, RTDB.ONLINE);
            });
        });
    }
}

// This class is an indirection to Firebase's auth methods, to support spyOn on them in the test code.
export class Auth {
    public static createUserWithEmailAndPassword(email: string, password: string)
    : Promise<FireAuth.UserCredential>
    {
        return FireAuth.createUserWithEmailAndPassword(FireAuth.getAuth(), email, password);
    }
    public static sendEmailVerification(user: FireAuth.User): Promise<void> {
        return FireAuth.sendEmailVerification(user);
    }
    public static sendPasswordResetEmail(email: string): Promise<void> {
        return FireAuth.sendPasswordResetEmail(FireAuth.getAuth(), email);
    }
    public static async signInWithEmailAndPassword(email: string, password: string): Promise<FireAuth.User> {
        return (await FireAuth.signInWithEmailAndPassword(FireAuth.getAuth(), email, password)).user;
    }
    public static async signInWithPopup(provider: FireAuth.AuthProvider): Promise<FireAuth.User> {
        return (await FireAuth.signInWithPopup(FireAuth.getAuth(), provider)).user;
    }
    public static updateProfile(user: FireAuth.User, profile: { displayName?: string, photoURL?: string })
    : Promise<void>
    {
        return FireAuth.updateProfile(user, profile);
    }
}

interface ConnectivityStatus {
    state: string,
    // eslint-disable-next-line camelcase
    last_changed: unknown,
}

export class AuthUser {
    /**
     * Represents the fact the user is not connected
     */
    public static NOT_CONNECTED: AuthUser = new AuthUser(MGPOptional.empty(), MGPOptional.empty(), false);

    /**
     * Constructs an AuthUser.
     * Requires:
     * - the email of the user, which may be null to represent that no user is connected
     * - the username of the user, which may be null if the user hasn't chosen a username yet
     * - a boolean indicating whether the user is verified
     */
    constructor(public email: MGPOptional<string>,
                public username: MGPOptional<string>,
                public verified: boolean) {
    }
    public isConnected(): boolean {
        return this.email.isPresent();
    }
}

@Injectable()
export class AuthenticationService implements OnInit, OnDestroy {
    public static VERBOSE: boolean = false;

    public unsubscribeFromAuth!: Unsubscribe; // public for testing purposes only, initialized on init

    /**
     * This is the current user, if there is one.
     * Components depending on an AccountGuard can safely assume it is defined and directly call .get() on it.
     * (This is because the guard can't activate if there is no user, so if the guard was activated, there is a user)
     */
    public user: MGPOptional<AuthUser>;

    private userRS: ReplaySubject<AuthUser>;

    private userObs: Observable<AuthUser>;

    private registrationInProgress: MGPOptional<Promise<MGPFallible<FireAuth.User>>> = MGPOptional.empty();

    constructor(private readonly userDAO: UserDAO) {
        display(AuthenticationService.VERBOSE || true, 'AuthenticationService constructor');

        this.userRS = new ReplaySubject<AuthUser>(1);
        this.userObs = this.userRS.asObservable();
    }
    public ngOnInit() {
        this.unsubscribeFromAuth = FireAuth.onAuthStateChanged(FireAuth.getAuth(), async(user: FireAuth.User) => {
            console.log(`[authState] new user`)
            if (user == null) { // user logged out
                display(AuthenticationService.VERBOSE || true, 'User is not connected');
                this.userRS.next(AuthUser.NOT_CONNECTED);
            } else { // user logged in
                console.log(`[authState] user is connected, is registration in progress? ${this.registrationInProgress}, info: : ${user.email}, verified: ${user.emailVerified}`)
                if (this.registrationInProgress.isPresent()) {
                    // We need to wait for the entire registration process to finish,
                    // otherwise we risk reading an empty username before the user is fully created
                    await this.registrationInProgress.get();
                    console.log('[authState] registration done, promise awaited, clearing it');
                    this.registrationInProgress = MGPOptional.empty();
                }
                console.log('[authState] registration finished, continuing')
                await RTDB.updatePresence(user.uid);
                console.log('[authState] reading user in DB')
                const userInDB: User = (await this.userDAO.read(user.uid)).get();
                display(AuthenticationService.VERBOSE || true, `User ${userInDB.username} is connected, and the verified status is ${this.emailVerified(user)}`);
                const userHasFinalizedVerification: boolean =
                    this.emailVerified(user) === true && userInDB.username !== null;
                if (userHasFinalizedVerification === true && userInDB.verified === false) {
                    // The user has finalized verification but isn't yet marked as so in the DB, so we mark it.
                    await this.userDAO.markVerified(user.uid);
                }
                const authUser: AuthUser = new AuthUser(MGPOptional.ofNullable(user.email),
                                                        MGPOptional.ofNullable(userInDB.username),
                                                        userHasFinalizedVerification);
                this.user = MGPOptional.of(authUser);
                console.log('Generating next AuthUser : ' + authUser.email) 
                this.userRS.next(authUser);
            }
        });
    }
    public emailVerified(user: FireAuth.User): boolean {
        // Only needed for mocking purposes
        return user.emailVerified;
    }
    public async sendPasswordResetEmail(email: string): Promise<MGPValidation> {
        try {
            await Auth.sendPasswordResetEmail(email);
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
        display(AuthenticationService.VERBOSE || true, 'AuthenticationService.doRegister(' + email + ')');
        if (await this.userDAO.usernameIsAvailable(username)) {
            console.log('[doRegister] setting promise')
            this.registrationInProgress = MGPOptional.of(new Promise((resolve: (value: MGPFallible<FireAuth.User>) => void, reject: () => void) => {
                console.log('[doRegister] in promise')
                this.registerAfterUsernameCheck(username, email, password).then((value) => {
                    console.log('[doRegister] resolved with ' + value)
                    resolve(value)
                }).catch(reject);
            }));
            console.log('[doRegister] promise set to ' + this.registrationInProgress)
            return this.registrationInProgress.get();
        } else {
            return MGPFallible.failure($localize`This username is already in use.`);
        }
    }
    private async registerAfterUsernameCheck(username: string, email: string, password: string)
    : Promise<MGPFallible<FireAuth.User>>
    {
        try {
            console.log('create user with email and password')
            const userCredential: FireAuth.UserCredential =
                await Auth.createUserWithEmailAndPassword(email, password);
            const user: FireAuth.User = Utils.getNonNullable(userCredential.user);
            console.log('creating user in DB')
            await this.createUser(user.uid, username);
            console.log('created')
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
            default:
                Utils.handleError('Unsupported firebase error: ' + error.code + ' (' + error.message + ')');
                return error.message;
        }
    }
    public async sendEmailVerification(): Promise<MGPValidation> {
        display(AuthenticationService.VERBOSE, 'AuthenticationService.sendEmailVerification()');
        const user: MGPOptional<FireAuth.User> = MGPOptional.ofNullable(FireAuth.getAuth().currentUser);
        if (user.isPresent()) {
            if (this.emailVerified(user.get()) === true) {
                // This should not be reachable from a component
                return Utils.handleError('Verified users should not ask email verification twice');
            }
            try {
                await Auth.sendEmailVerification(user.get());
                return MGPValidation.SUCCESS;
            } catch (e) {
                return MGPValidation.failure(this.mapFirebaseError(e));
            }
        } else {
            // This should not be reachable from a component
            return Utils.handleError('Unlogged users cannot request for email verification');
        }
    }

    /**
     * Logs in using an email and a password. Returns a validation to indicate
     * either success, or failure with a specific error.
     */
    public async doEmailLogin(email: string, password: string): Promise<MGPValidation> {
        display(AuthenticationService.VERBOSE || true, 'AuthenticationService.doEmailLogin(' + email + ')');
        try {
            // Login through firebase. If the login is incorrect or fails for some reason, an error is thrown.
            await Auth.signInWithEmailAndPassword(email, password);
            return MGPValidation.SUCCESS;
        } catch (e) {
            return MGPValidation.failure(this.mapFirebaseError(e));
        }
    }
    /**
     * Create the user doc in firestore. Google accounts initially have no username.
     */
    public async createUser(uid: string, username?: string): Promise<void> {
        console.log(`creating user with uid ${uid} and username ${username}`)
        assert(await this.userDAO.exists(uid) === false, 'createUser should only be called for new users');
        if (username == null) {
            await this.userDAO.set(uid, { verified: false });
        } else {
            await this.userDAO.set(uid, { username, verified: false });
        }
    }
    public async doGoogleLogin(): Promise<MGPValidation> {
        console.log('[doGoogleLogin] setting promise')
        this.registrationInProgress = MGPOptional.of(new Promise((resolve: (value: MGPFallible<FireAuth.User>) => void, reject: () => void) => {
            console.log('[doGoogleLogin] in promise')
            this.registerOrLoginWithGoogle().then((value) => {
                console.log('[doGoogleLogin] resolved with ' + value);
                resolve(value)
            }).catch(reject);
        }));
        console.log('[doGoogleLogin] promise set to ' + this.registrationInProgress);
        const result: MGPFallible<FireAuth.User> = await this.registrationInProgress.get();
        return MGPValidation.ofFallible(result);
    }
    private async registerOrLoginWithGoogle(): Promise<MGPFallible<FireAuth.User>> {
        try {
            const provider: FireAuth.GoogleAuthProvider = new FireAuth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            const user: FireAuth.User = await Auth.signInWithPopup(provider);
            if (await this.userDAO.exists(user.uid) === false) {
                console.log('create user')
                await this.createUser(user.uid);
            }
            console.log('registered or logged in with google')
            return MGPFallible.success(user);
        } catch (e) {
            return MGPFallible.failure(this.mapFirebaseError(e));
        }

    }
    public async disconnect(): Promise<MGPValidation> {
        const user: MGPOptional<FireAuth.User> = MGPOptional.ofNullable(FireAuth.getAuth().currentUser);
        if (user.isPresent()) {
            const uid: string = user.get().uid;
            await RTDB.setOffline(uid);
            await FireAuth.getAuth().signOut();
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure('Cannot disconnect a non-connected user');
        }
    }
    public getUserObs(): Observable<AuthUser> {
        return this.userObs;
    }
    public async setUsername(username: string): Promise<MGPValidation> {
        if (username === '') {
            return MGPValidation.failure($localize`Your username may not be empty.`);
        }
        try {
            const available: boolean = await this.userDAO.usernameIsAvailable(username);
            if (available === false) {
                return MGPValidation.failure($localize`This username is already in use, please select a different one.`);
            }
            const currentUser: FireAuth.User = Utils.getNonNullable(FireAuth.getAuth().currentUser);
            await Auth.updateProfile(currentUser, { displayName: username });
            await this.userDAO.setUsername(currentUser.uid, username);
            // Only gmail accounts can set their username, and they become finalized once they do
            await this.userDAO.markVerified(currentUser.uid);
            // Reload the user to notify listeners that the user has changed
            await this.reloadUser();
            return MGPValidation.SUCCESS;
        } catch (e) {
            return MGPValidation.failure(this.mapFirebaseError(e));
        }
    }
    public async setPicture(url: string): Promise<MGPValidation> {
        try {
            const currentUser: FireAuth.User = Utils.getNonNullable(FireAuth.getAuth().currentUser);
            await Auth.updateProfile(currentUser, { photoURL: url });
            return MGPValidation.SUCCESS;
        } catch (e) {
            return MGPValidation.failure(this.mapFirebaseError(e));
        }
    }
    public async reloadUser(): Promise<void> {
        const currentUser: FireAuth.User = Utils.getNonNullable(FireAuth.getAuth().currentUser);
        await currentUser.getIdToken(true);
        await currentUser.reload();
    }
    public ngOnDestroy(): void {
        console.log('--------- unsubscribing')
        this.unsubscribeFromAuth();
    }

}
