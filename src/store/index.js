import Vue from "vue";
import Vuex from "vuex";

import axios from "axios";
import db from "@/dbfunc/db";

Vue.use(Vuex);

export const store = new Vuex.Store({
	strict: process.env.NODE_ENV !== "production",

	state: {
		user: null,
		loading: false,
		loading2: false,
		loading3: false,
		signUpProcess: false,
		imgloading: false,
		error: null,
		confData: null,
		ip: "0.0.0.0",
		ipdata: null,
		isWorking: false
	},

	mutations: {
		setUser(state, payload) {
			state.user = payload;
		},
		setLoading(state, payload) {
			state.loading = payload;
		},
		setLoading2(state, payload) {
			state.loading2 = payload;
		},
		setLoading3(state, payload) {
			state.loading3 = payload;
		},
		setIsWorking(state, payload) {
			state.isWorking = payload;
		},
		setSignUpProcess(state, payload) {
			state.signUpProcess = payload;
		},
		setImgLoading(state, payload) {
			state.imgloading = payload;
		},
		setError(state, payload) {
			state.error = payload;
		},
		clearError(state) {
			state.error = null;
		},
		setConfData(state, payload) {
			state.confData = payload;
		},
		setUserVerified(state) {
			state.user.emailVerified = true;
		},
		setUserPhotoURL(state, payload) {
			state.user.photoURL = payload;
		},
		setUserDisplayName(state, payload) {
			state.user.displayName = payload;
		},
		setUserIP(state, payload) {
			state.ip = payload;
		},
		setUserIPData(state, payload) {
			state.ipdata = payload;
		}
	},

	actions: {
		signUserUp({ commit, state }, payload) {
			return new Promise((resolve, reject) => {
				commit("setSignUpProcess", true);
				commit("clearError");

				db.auth
					.createUserWithEmailAndPassword(payload.email, payload.password)
					.then((result) => {
						let user = result.user;
						user
							.updateProfile({
								displayName: payload.displayName
							})
							.then(() => {
								const newUser = {
									uid: user.uid,
									email: user.email,
									emailVerified: false,
									displayName: payload.displayName,
									photoURL: "",
									isAdmin: state.confData.adminemail === user.email
								};

								db.addUser(user, newUser.isAdmin).then(() => {
									resolve(newUser);
								});
							})
							.catch((error) => {
								user.delete();
								reject(error);
							});
					})
					.catch((error) => {
						reject(error);
					});
			});
		},
		logUserIn({ commit, dispatch, state }, payload) {
			return new Promise((resolve, reject) => {
				commit("setLoading", true);
				commit("clearError");

				db.auth
					.signInWithEmailAndPassword(payload.email, payload.password)
					.then((result) => {
						let user = result.user;
						db
							.updateUserInfoWhenLogin(user, user.metadata.lastSignInTime)
							.then(() => {
								commit("setUser", {
									uid: user.uid,
									email: user.email,
									emailVerified: user.emailVerified,
									displayName: user.displayName,
									photoURL: user.photoURL,
									isAdmin: state.confData.adminemail === user.email
								});
								commit("setLoading", false);
								resolve(user.emailVerified);
							});
					})
					.catch((error) => {
						reject(error);
					});
			});
		},
		autoLogin({ commit, state }, payload) {
			if (payload.redirectResult.user !== null) {
				let user = payload.redirectResult.user;

				const firebaseErrorAuthCredential = localStorage.getItem("firebaseErrorAuthCredential");
				if (firebaseErrorAuthCredential !== null) {
					let credErr = JSON.parse(firebaseErrorAuthCredential);
					let cred = null;
					if (credErr.providerId === "github.com") {
						cred = db.firebase.auth.GithubAuthProvider.credential(credErr.accessToken);
					} else if (credErr.providerId === "facebook.com") {
						cred = db.firebase.auth.FacebookAuthProvider.credential(credErr.accessToken);
					}

					try {
						if (cred !== null) {
							user.linkAndRetrieveDataWithCredential(cred);
						}
					} finally {
						localStorage.removeItem("firebaseErrorAuthCredential");
					}
				}

				if (payload.redirectResult.additionalUserInfo.isNewUser) {
					db.addUser(user, state.confData.adminemail === user.email, payload.redirectResult.additionalUserInfo.providerId);
				} else {
					db.updateUserInfoWhenLogin(user, user.metadata.lastSignInTime, payload.redirectResult.additionalUserInfo.providerId);
				}
			} else {
				const lastSignInTime = new Date().toUTCString();
				db.updateUserInfoWhenLogin(payload.user, lastSignInTime);
			}
		},
		logout({ commit }) {
			return new Promise((resolve, reject) => {
				db.auth
					.signOut()
					.then(() => {
						commit("setUser", null);
						resolve();
					})
					.catch((error) => {
						commit("setError", error);
						reject(error);
					});
			});
		},
		clearError({ commit }) {
			commit("clearError");
		},
		updateUserProfile({ commit }, payload) {
			return new Promise((resolve, reject) => {
				commit("setLoading", true);
				commit("clearError");
				let currentUser = db.auth.currentUser;
				currentUser
					.updateProfile({
						displayName: payload.displayName
					})
					.then(function() {
						db.updateUserDisplayName(payload.userid, payload.displayName).then(() => {
							commit("setLoading", false);
							resolve();
						});
					})
					.catch(function(error) {
						commit("setLoading", false);
						commit("setError", error);
						reject(error);
					});
			});
		},
		updateUserProfilePhoto({ commit }, photoUrl) {
			return new Promise((resolve, reject) => {
				let currentUser = db.auth.currentUser;
				currentUser
					.updateProfile({
						photoUrl: photoUrl
					})
					.then(function() {
						resolve();
					})
					.catch(function(error) {
						commit("setError", error);
						reject(error);
					});
			});
		},
		changeUserPassword({ commit }, payload) {
			return new Promise((resolve, reject) => {
				commit("setLoading3", true);
				commit("clearError");
				let currentUser = db.auth.currentUser;
				if (payload.password !== "") {
					currentUser
						.updatePassword(payload.password)
						.then(function() {
							commit("setLoading3", false);
							resolve();
						})
						.catch(function(error) {
							commit("setLoading3", false);
							commit("setError", error);
							reject(error);
						});
				}
			});
		},
		sendVerificationEmail({ commit }) {
			return new Promise((resolve, reject) => {
				commit("setLoading2", true);
				commit("clearError");
				let currentUser = db.auth.currentUser;
				currentUser
					.sendEmailVerification()
					.then(function() {
						commit("setLoading2", false);
					})
					.catch(function(error) {
						commit("setLoading2", false);
						commit("setError", error);
						reject(error);
					});
				resolve();
			});
		},
		passwordReset({ commit }, payload) {
			return new Promise((resolve, reject) => {
				commit("setLoading", true);
				commit("clearError");
				db.auth
					.sendPasswordResetEmail(payload.email)
					.then(function() {
						commit("setLoading", false);
						resolve();
					})
					.catch(function(error) {
						commit("setLoading", false);
						commit("setError", error);
						reject(error);
					});
			});
		},
		getconfJSON({ commit }) {
			return new Promise((resolve, reject) => {
				axios
					.get("/static/conf/conf.json")
					.then((response) => {
						resolve(response.data);
					})
					.catch((error) => {
						reject(error);
					});
			});
		},
		setProfileImage({ commit }, payload) {
			return new Promise((resolve, reject) => {
				commit("setImgLoading", true);
				commit("clearError");

				db.storage
					.ref("profileImages/" + payload.userid + "/pImg_" + payload.userid + payload.ext)
					.put(payload.image)
					.then((snapshot) => {
						snapshot.ref.getDownloadURL().then((url) => {
							let currentUser = db.auth.currentUser;
							currentUser
								.updateProfile({
									photoURL: url
								})
								.then(function() {
									db
										.updateUserPhotoURL(payload.userid, url)
										.then(() => {
											resolve(url);
										});
								});
						});
					})
					.catch((error) => {
						commit("setImgLoading", false);
						commit("setError", error);
						reject(error);
					});
			});
		},
		deleteProfileImage({ commit }, payload) {
			return new Promise((resolve, reject) => {
				commit("setImgLoading", true);
				commit("clearError");

				db.storage
					.ref().child("profileImages/" + payload.userid + "/pImg_" + payload.userid + payload.ext)
					.delete()
					.then(() => {
						let currentUser = db.auth.currentUser;
						currentUser
							.updateProfile({
								photoURL: ""
							})
							.then(function() {
								db
									.updateUserPhotoURL(payload.userid, "")
									.then(() => {
										resolve();
									});
							});
					})
					.catch((error) => {
						commit("setImgLoading", false);
						commit("setError", error);
						reject(error);
					});
			});
		},
		eraseProfile({ commit, state }) {
			return new Promise((resolve, reject) => {
				commit("setIsWorking", true);
				commit("clearError");

				try {
					if (state.user === null) {
						throw new Error("There is no logged user!");
					}
					let currentUser = db.auth.currentUser;
					if (currentUser.uid !== state.user.uid) {
						throw new Error("uid values mismatch");
					}

					db.deleteCollection(`/users/${state.user.uid}/logins`, 5).then(() => {
						db.firestore.collection("users").doc(state.user.uid).delete().then(() => {
							currentUser.delete().then(() => {
								commit("setIsWorking", false);
								resolve();
							}).catch((error) => {
								commit("setIsWorking", false);
								reject(error);
							});
						});
					});
				} catch (error) {
					commit("setIsWorking", false);
					reject(error);
				}
			});
		}
	},

	getters: {
		user(state) {
			return state.user;
		},
		loading(state) {
			return state.loading;
		},
		loading2(state) {
			return state.loading2;
		},
		loading3(state) {
			return state.loading3;
		},
		isWorking(state) {
			return state.isWorking;
		},
		imgloading(state) {
			return state.imgloading;
		},
		signUpProcess(state) {
			return state.signUpProcess;
		},
		error(state) {
			return state.error;
		},
		isadminemail(state) {
			return state.user.isAdmin;
		},
		isUserVerified(state) {
			if (!state.user) {
				return true;
			} else {
				return state.user.emailVerified;
			}
		}
	}
});
