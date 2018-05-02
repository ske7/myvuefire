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
function addUser(user, isAdmin) {
	return new Promise((resolve, reject) => {
		let userRef = db.collection("users").doc(user.uid);
		userRef
			.set({
				uid: user.uid,
				email: user.email,
				displayName: user.displayName,
				photoURL: user.photoURL,
				emailVerified: user.emailVerified,
				providerId: user.providerId,
				creationTime: user.metadata.creationTime,
				lastSignInTime: user.metadata.lastSignInTime,
				isAdmin: isAdmin
			})
			.then(() => {
				userRef.collection("logins").add({
					loginTime: user.metadata.lastSignInTime,
					emailVerified: false,
					userip: store.state.ip,
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

function updateUserInfoWhenLogin(uid, emailVerified, lastSignInTime) {
	return new Promise((resolve, reject) => {
		let userRef = db.collection("users").doc(uid);

		userRef
			.set(
				{
					emailVerified: emailVerified,
					lastSignInTime: lastSignInTime
				},
				{ merge: true }
			)
			.then(() => {
				userRef.collection("logins").add({
					loginTime: lastSignInTime,
					emailVerified: emailVerified,
					userip: store.state.ip,
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
	addUser,
	updateUserPhotoURL,
	updateUserInfoWhenLogin
};
