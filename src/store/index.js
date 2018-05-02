import Vue from "vue";
import Vuex from "vuex";

import { router } from "@/router";
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
		authpreparing: true,
		error: null,
		confData: null
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
		setSignUpProcess(state, payload) {
			state.signUpProcess = payload;
		},
		setAuthPreparing(state, payload) {
			state.authpreparing = payload;
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
		}
	},

	actions: {
		signUserUp({ commit, state }, payload) {
			return new Promise((resolve, reject) => {
				commit("setSignUpProcess", true);
				commit("clearError");

				db.auth
					.createUserWithEmailAndPassword(payload.email, payload.password)
					.then((user) => {
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
					.then((user) => {
						db
							.updateUserInfoWhenLogin(user.uid, user.emailVerified, user.metadata.lastSignInTime)
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
						commit("setLoading", false);
						commit("setError", error);
						reject(error);
					});
			});
		},
		autoLogin({ commit, dispatch, state }, payload) {
			let lastSignInTime = new Date().toUTCString();
			db
				.updateUserInfoWhenLogin(payload.uid, payload.emailVerified, lastSignInTime)
				.then(() => {
					if (!payload.emailVerified) {
						router.push("/profile");
					}
				})
				.catch((error) => {
					commit("setError", error);
				});
		},
		authPreparing({ commit }, payload) {
			commit("setAuthPreparing", false);
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
				Vue.http
					.get("/static/conf/conf.json")
					.then((response) => {
						resolve(response.json());
					})
					.catch((error) => {
						reject(error);
					});
			});
		},
		setProfileImage({ commit }, payload) {
			return new Promise((resolve, reject) => {
				commit("setLoading", true);
				commit("clearError");

				db.storage
					.ref("profileImages/" + payload.userid + "/pImg_" + payload.userid + payload.ext)
					.put(payload.image)
					.then((filedata) => {
						let currentUser = db.auth.currentUser;
						currentUser
							.updateProfile({
								photoURL: filedata.metadata.downloadURLs[0]
							})
							.then(function() {
								db
									.updateUserPhotoURL(payload.userid, filedata.metadata.downloadURLs[0])
									.then(() => {
										commit("setLoading", false);
										resolve(filedata.metadata);
									})
									.catch((error) => {
										commit("setLoading", false);
										commit("setError", error);
										reject(error);
									});
							})
							.catch(function(error) {
								commit("setLoading", false);
								commit("setError", error);
								reject(error);
							});
					})
					.catch((error) => {
						commit("setLoading", false);
						commit("setError", error);
						reject(error);
					});
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
		signUpProcess(state) {
			return state.signUpProcess;
		},
		authpreparing(state) {
			return state.authpreparing;
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
