// Import firebase libs
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

import { store } from "@/store";

// Firebase service instances and config
let config = {
	apiKey: "AIzaSyBoZ7fgZiSHbsDfwk0hDIeDavqe3uNe_yw",
	authDomain: "myuedb.firebaseapp.com",
	databaseURL: "https://myuedb.firebaseio.com",
	projectId: "myuedb",
	storageBucket: "gs://myuedb.appspot.com",
	messagingSenderId: "523406585701"
};
let app = firebase.initializeApp(config);
let auth = firebase.auth(app);
let db = firebase.firestore(app);
db.settings({ timestampsInSnapshots: true });
let storage = firebase.storage();

// Functions
function signInWithGoogleAuthProvider() {
	let provider = new firebase.auth.GoogleAuthProvider();

	provider.addScope("email");
	provider.addScope("profile");

	return firebase.auth().signInWithRedirect(provider);
}

function signInWithFacebookAuthProvider() {
	let provider = new firebase.auth.FacebookAuthProvider();

	provider.addScope("email");
	provider.addScope("public_profile");
	provider.setCustomParameters({
		"display": "popup"
	});

	return firebase.auth().signInWithRedirect(provider);
}

function addUser(user, isAdmin, extproviderId) {
	return new Promise((resolve, reject) => {
		let userRef = db.collection("users").doc(user.uid);
		userRef
			.set({
				uid: user.uid,
				email: user.email,
				displayName: user.displayName,
				photoURL: user.photoURL,
				emailVerified: user.emailVerified,
				providerId: extproviderId !== undefined ? extproviderId : user.providerId,
				creationTime: user.metadata.creationTime,
				lastSignInTime: user.metadata.lastSignInTime,
				isAdmin: isAdmin
			})
			.then(() => {
				userRef.collection("logins").add({
					loginTime: user.metadata.lastSignInTime,
					emailVerified: user.emailVerified,
					providerId: extproviderId !== undefined ? extproviderId : user.providerId,
					userip: store.state.ip,
					country: store.state.ipdata.country_name,
					city: store.state.ipdata.city,
					timezone: store.state.ipdata.timezone,
					utc_offset: store.state.ipdata.utc_offset,
					latitude: store.state.ipdata.latitude,
					longitude: store.state.ipdata.longitude
				});
				resolve(userRef);
			})
			.catch((error) => {
				reject(error);
			});
	});
}

function updateUserPhotoURL(uid, photoURL) {
	return db.collection("users").doc(uid).set(
		{
			photoURL: photoURL
		},
		{ merge: true }
	);
}

function updateUserDisplayName(uid, displayName) {
	return db.collection("users").doc(uid).set(
		{
			displayName: displayName
		},
		{ merge: true }
	);
}

function updateUserInfoWhenLogin(user, lastSignInTime, extproviderId) {
	return new Promise((resolve, reject) => {
		let userRef = db.collection("users").doc(user.uid);

		userRef
			.set(
				{
					emailVerified: user.emailVerified,
					lastSignInTime: lastSignInTime
				},
				{ merge: true }
			)
			.then(() => {
				userRef.collection("logins").add({
					loginTime: lastSignInTime,
					emailVerified: user.emailVerified,
					providerId: extproviderId !== undefined ? extproviderId : user.providerId,
					userip: store.state.ip,
					country: store.state.ipdata.country_name,
					city: store.state.ipdata.city,
					timezone: store.state.ipdata.timezone,
					utc_offset: store.state.ipdata.utc_offset,
					latitude: store.state.ipdata.latitude,
					longitude: store.state.ipdata.longitude
				});
				resolve(userRef);
			})
			.catch((error) => {
				reject(error);
			});
	});
}

// ------------------------------------- //
export default {
	auth,
	db,
	storage,

	// Functions
	signInWithGoogleAuthProvider,
	signInWithFacebookAuthProvider,
	addUser,
	updateUserPhotoURL,
	updateUserDisplayName,
	updateUserInfoWhenLogin
};
