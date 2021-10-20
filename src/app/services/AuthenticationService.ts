import { AngularFireAuth } from '@angular/fire/auth';
import { Injectable, OnDestroy } from '@angular/core';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/database';
import { Observable, Subscription, ReplaySubject } from 'rxjs';

import { display, Utils } from 'src/app/utils/utils';
import { MGPValidation } from '../utils/MGPValidation';
import { MGPFallible } from '../utils/MGPFallible';
import { UserDAO } from '../dao/UserDAO';

export class RTDB {
    public static OFFLINE: ConnectivityStatus = {
        state: 'offline',
        last_changed: firebase.database.ServerValue.TIMESTAMP,
    };
    public static ONLINE: ConnectivityStatus = {
        state: 'online',
        last_changed: firebase.database.ServerValue.TIMESTAMP,
    }
    public static setOffline(uid: string): Promise<void> {
        return firebase.database().ref('/status/' + uid).set(RTDB.OFFLINE);
    }
    public static updatePresence(uid: string): void {
        const userStatusDatabaseRef: firebase.database.Reference = firebase.database().ref('/status/' + uid);
        firebase.database().ref('.info/connected').on('value', function(snapshot: firebase.database.DataSnapshot) {
            if (snapshot.val() === false) {
                return;
            }
            userStatusDatabaseRef.onDisconnect().set(RTDB.OFFLINE).then(function() {
                userStatusDatabaseRef.set(RTDB.ONLINE);
            });
        });
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
    public static NOT_CONNECTED: AuthUser = new AuthUser(null, null, false);

    constructor(public email: string | null, public username: string | null, public verified: boolean) {
    }

    public isConnected(): boolean {
        return this.email != null;
    }
    public isVerified(): boolean {
        // A gmail user has the verified flag set, but needs to define its username to be fully verified
        return this.verified && this.username != null && this.username !== '';
    }
}

@Injectable()
export class AuthenticationService implements OnDestroy {
    public static VERBOSE: boolean = false;


    public authSub: Subscription; // public for testing purposes only

    private userRS: ReplaySubject<AuthUser>;

    private userObs: Observable<AuthUser>;

    private registrationInProgress: Promise<MGPFallible<firebase.User>>;

    constructor(public afAuth: AngularFireAuth,
                private userDAO: UserDAO) {
        display(AuthenticationService.VERBOSE, '1 authService subscribe to Obs<User>');

        this.userRS = new ReplaySubject<AuthUser>(1);
        this.userObs = this.userRS.asObservable();
        this.authSub = this.afAuth.authState.subscribe(async(user: firebase.User) => {
            if (user == null) { // user logged out
                display(AuthenticationService.VERBOSE, '2.B: User is not connected, according to fireAuth');
                this.userRS.next(AuthUser.NOT_CONNECTED);
            } else { // user logged in
                if (this.registrationInProgress) {
                    /**
                     * We need to wait for the entire registration process to finish,
                     * otherwise we risk reading an empty username before the user is fully created
                     */
                    await this.registrationInProgress;
                    this.registrationInProgress = undefined;
                }
                RTDB.updatePresence(user.uid);
                const username: string = await userDAO.getUsername(user.uid);
                display(AuthenticationService.VERBOSE, { userLoggedInAccordingToFireAuth: user });
                this.userRS.next(new AuthUser(user.email, username, user.emailVerified));
            }
        });
    }
    /*
     * Registers an user given its username, email, and password.
     * Returns the firebase user upon success, or a failure otherwise.
     */
    public async doRegister(username: string, email: string, password: string): Promise<MGPFallible<firebase.User>> {
        display(AuthenticationService.VERBOSE, 'AuthenticationService.doRegister(' + email + ')');
        if (username == null || email == null || password == null) {
            return MGPFallible.failure($localize`There are missing fields in the registration form, please check that you filled in all fields.`);
        }
        if (await this.userDAO.usernameIsAvailable(username)) {
            this.registrationInProgress = this.registerAfterUsernameCheck(username, email, password);
            return await this.registrationInProgress;
        } else {
            return MGPFallible.failure($localize`This username is already in use.`);
        }
    }
    private async registerAfterUsernameCheck(username: string, email: string, password: string)
    : Promise<MGPFallible<firebase.User>>
    {
        try {
            const userCredential: firebase.auth.UserCredential =
                await firebase.auth().createUserWithEmailAndPassword(email, password);
            const user: firebase.User = userCredential.user;
            await this.createUser(user.uid, username);
            return MGPFallible.success(userCredential.user);
        } catch (e) {
            return MGPFallible.failure(this.mapFirebaseError(e));
        }
    }
    public mapFirebaseError(error: firebase.FirebaseError): string {
        switch (error.code) {
            case 'auth/email-already-in-use':
                return $localize`This email address is already in use.`;
            case 'auth/invalid-email':
                return $localize`This email address is invalid.`;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                // In accordance with security best practices, we don't give too much details here
                return $localize`You have entered an invalid username or password.`;
            case 'auth/invalid-credential':
                return $localize`The credential is invalid or has expired, please try again.`;
            case 'auth/weak-password':
                return $localize`Your password is too weak, please use a stronger password.`;
            case 'auth/too-many-requests':
                return $localize`There has been too many requests from your device. You are temporarily blocked due to unusual activity. Try again later.`;
            default:
                Utils.handleError('Unsupported firebase error: ' + error.code + ' (' + error.message + ')');
                return error.message;
        }
    }
    public async sendEmailVerification(): Promise<MGPValidation> {
        display(AuthenticationService.VERBOSE, 'AuthenticationService.sendEmailVerification()');
        const user: firebase.User = firebase.auth().currentUser;
        if (user != null) {
            if (user.emailVerified === true) {
                return MGPValidation.failure('Verified users should not ask email verification twice');
            }
            user.sendEmailVerification();
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure('Unlogged users cannot request for email verification');
        }
    }

    /*
     * Logs in using an email and a password. Returns a validation to indicate
     * either success, or failure with a specific error.
     */
    public async doEmailLogin(email: string, password: string): Promise<MGPValidation> {
        display(AuthenticationService.VERBOSE, 'AuthenticationService.doEmailLogin(' + email + ')');
        try {
            // Login through firebase. If the login is incorrect or fails for some reason, an error is thrown.
            await firebase.auth().signInWithEmailAndPassword(email, password);
            return MGPValidation.SUCCESS;
        } catch (e) {
            return MGPValidation.failure(this.mapFirebaseError(e));
        }
    }
    /**
     * Create the user doc in firestore
     */
    public async createUser(uid: string, username: string): Promise<void> {
        if (await this.userDAO.exists(uid) === false) {
            await this.userDAO.set(uid, { username: username });
        }
    }
    public async doGoogleLogin(): Promise<MGPValidation> {
        try {
            const provider: firebase.auth.GoogleAuthProvider =
                new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            const userCredential: firebase.auth.UserCredential =
                await this.afAuth.signInWithPopup(provider);
            await this.createUser(userCredential.user.uid, '');
            return MGPValidation.SUCCESS;
        } catch (e) {
            return MGPValidation.failure(this.mapFirebaseError(e));
        }
    }
    public async disconnect(): Promise<MGPValidation> {
        const user: firebase.User = firebase.auth().currentUser;
        if (user) {
            const uid: string = user.uid;
            RTDB.setOffline(uid);
            await this.afAuth.signOut();
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure('Cannot disconnect a non-connected user');
        }
    }
    public getUserObs(): Observable<AuthUser> {
        return this.userObs;
    }
    public async setUsername(username: string): Promise<MGPValidation> {
        try {
            const currentUser: firebase.User = firebase.auth().currentUser;
            await currentUser.updateProfile({ displayName: username });
            await this.userDAO.setUsername(currentUser.uid, username);
            // Notify listeners that the user has changed
            this.userRS.next(new AuthUser(currentUser.email, username, currentUser.emailVerified));
            return MGPValidation.SUCCESS;
        } catch (e) {
            return MGPValidation.failure(this.mapFirebaseError(e));
        }
    }
    public async setPicture(url: string): Promise<MGPValidation> {
        try {
            await firebase.auth().currentUser.updateProfile({ photoURL: url });
            return MGPValidation.SUCCESS;
        } catch (e) {
            return MGPValidation.failure(this.mapFirebaseError(e));
        }
    }

    public ngOnDestroy(): void {
        this.authSub.unsubscribe();
    }

}
