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
    info: null,
    confData: null,
    ip: "0.0.0.0",
    ipdata: null,
    adminDrawer: null
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
    setImgLoading(state, payload) {
      state.imgloading = payload;
    },
    setError(state, payload) {
      state.error = payload;
    },
    clearError(state) {
      state.error = null;
    },
    setInfo(state, payload) {
      state.info = payload;
    },
    clearInfo(state) {
      state.info = null;
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
    },
    updateProviderID(state, payload) {
      if (payload.length <= 1) {
        if (
          payload[0].providerId === "google.com" &&
                 payload.length === 1 &&
                 state.user.providerId !== "google.com"
        ) {
          db.updateUserProviderId(state.user.uid, "google.com");
        }

        return;
      }
      const arr = [];
      for (const [key] in payload) {
        arr.push(payload[key].providerId);
      }
      db.updateUserProviderId(state.user.uid, arr.join(", "));
    },
    adminDrawerToggle(state, payload) {
      state.adminDrawer = !state.adminDrawer;
    }
  },

  actions: {
    signUserUp({ commit, state }, payload) {
      return new Promise((resolve, reject) => {
        commit("setSignUpProcess", true);
        commit("clearError");

        db.auth
          .createUserWithEmailAndPassword(
            payload.email,
            payload.password
          )
          .then((result) => {
            const user = result.user;
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
                  providerId: "password",
                  isAdmin:
                           state.confData.adminemail === user.email
                };
                db.addUser(
                  user,
                  newUser.isAdmin,
                  "password"
                ).then(() => {
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
          .signInWithEmailAndPassword(
            payload.email,
            payload.password
          )
          .then((result) => {
            const user = result.user;
            db.updateUserInfoWhenLogin(
              user,
              user.metadata.lastSignInTime,
              "password"
            ).then(() => {
              commit("setUser", {
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
                displayName: user.displayName,
                photoURL: user.photoURL,
                providerId: "password",
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
        const user = payload.redirectResult.user;

        const firebaseErrorAuthCredential = localStorage.getItem(
          "firebaseErrorAuthCredential"
        );
        if (firebaseErrorAuthCredential !== null) {
          const credErr = JSON.parse(firebaseErrorAuthCredential);
          let cred = null;
          if (credErr.providerId === "github.com") {
            cred = db.firebase.auth.GithubAuthProvider.credential(
              credErr.accessToken
            );
          } else if (credErr.providerId === "facebook.com") {
            cred = db.firebase.auth.FacebookAuthProvider.credential(
              credErr.accessToken
            );
          } else if (credErr.providerId === "twitter.com") {
            cred = db.firebase.auth.TwitterAuthProvider.credential(
              credErr.accessToken,
              credErr.secret
            );
          }

          try {
            if (cred !== null) {
              user
                .linkAndRetrieveDataWithCredential(cred)
                .then(() => {
                  commit("updateProviderID", user.providerData);
                });
            }
          } finally {
            localStorage.removeItem(
              "firebaseErrorAuthCredential"
            );
          }
        }

        if (payload.redirectResult.additionalUserInfo.isNewUser) {
          db.addUser(
            user,
            state.confData.adminemail === user.email,
            payload.redirectResult.additionalUserInfo.providerId
          );
        } else {
          commit("updateProviderID", user.providerData);
          db.updateUserInfoWhenLogin(
            user,
            user.metadata.lastSignInTime,
            payload.redirectResult.additionalUserInfo.providerId
          );
        }
      } else {
        // todo maybe do not log this?
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
    clearInfo({ commit }) {
      commit("clearInfo");
    },
    updateUserProfile({ commit }, payload) {
      return new Promise((resolve, reject) => {
        commit("setLoading", true);
        commit("clearError");
        const currentUser = db.auth.currentUser;
        currentUser
          .updateProfile({
            displayName: payload.displayName
          })
          .then(() => {
            db.updateUserDisplayName(
              payload.userid,
              payload.displayName
            ).then(() => {
              commit("setLoading", false);
              resolve();
            });
          })
          .catch((error) => {
            commit("setLoading", false);
            commit("setError", error);
            reject(error);
          });
      });
    },
    updateUserProfilePhoto({ commit }, photoUrl) {
      return new Promise((resolve, reject) => {
        const currentUser = db.auth.currentUser;
        currentUser
          .updateProfile({
            photoUrl: photoUrl
          })
          .then(() => {
            resolve();
          })
          .catch((error) => {
            commit("setError", error);
            reject(error);
          });
      });
    },
    changeUserPassword({ commit }, payload) {
      return new Promise((resolve, reject) => {
        commit("setLoading3", true);
        commit("clearError");
        const currentUser = db.auth.currentUser;
        if (payload.password !== "") {
          currentUser
            .updatePassword(payload.password)
            .then(() => {
              commit(
                "updateProviderID",
                currentUser.providerData
              );
              commit("setLoading3", false);
              resolve();
            })
            .catch((error) => {
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
        const currentUser = db.auth.currentUser;
        currentUser
          .sendEmailVerification()
          .then(() => {
            commit("setLoading2", false);
          })
          .catch((error) => {
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
          .then(() => {
            commit("setLoading", false);
            resolve();
          })
          .catch((error) => {
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
          .ref(
            "profileImages/" +
                     payload.userid +
                     "/pImg_" +
                     payload.userid +
                     payload.ext
          )
          .put(payload.image)
          .then((snapshot) => {
            snapshot.ref.getDownloadURL().then((url) => {
              const currentUser = db.auth.currentUser;
              currentUser
                .updateProfile({
                  photoURL: url
                })
                .then(() => {
                  db.updateUserPhotoURL(payload.userid, url).then(
                    () => {
                      resolve(url);
                    }
                  );
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
          .ref()
          .child(
            "profileImages/" +
                     payload.userid +
                     "/pImg_" +
                     payload.userid +
                     payload.ext
          )
          .delete()
          .then(() => {
            const currentUser = db.auth.currentUser;
            currentUser
              .updateProfile({
                photoURL: ""
              })
              .then(() => {
                db.updateUserPhotoURL(payload.userid, "").then(
                  () => {
                    resolve();
                  }
                );
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
        commit("clearError");

        try {
          if (state.user === null) {
            throw new Error("There is no logged user!");
          }
          const currentUser = db.auth.currentUser;
          if (currentUser.uid !== state.user.uid) {
            throw new Error("uid values mismatch");
          }

          db.firefunctions
            .httpsCallable("deleteUserProfile")({
              uid: currentUser.uid
            })
            .then(() => {
              resolve();
            })
            .catch((error) => {
              reject(error);
            });
        } catch (error) {
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
    imgloading(state) {
      return state.imgloading;
    },
    signUpProcess(state) {
      return state.signUpProcess;
    },
    error(state) {
      return state.error;
    },
    info(state) {
      return state.info;
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
