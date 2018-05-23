import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export const defstore = new Vuex.Store({
	strict: process.env.NODE_ENV !== "production",

	state: {
		isLoading: true,
		isError: false,
		errorText: "",
		errorCode: "",
		errorMode: ""
	},

	mutations: {
		setLoading(state, payload) {
			state.isLoading = payload;
		},
		setError(state, payload) {
			state.isError = true;
			state.isLoading = false;
			state.errorText = payload.errorText;
			if (payload.errorCode !== undefined) {
				state.errorCode = payload.errorCode;
			}
			if (payload.errorMode !== undefined) {
				state.errorMode = payload.errorMode;
			}
		}
	},

	getters: {
		loading(state) {
			return state.isLoading;
		},
		isError(state) {
			return state.isError;
		},
		errorMode(state) {
			return state.errorMode;
		}
	}
});
