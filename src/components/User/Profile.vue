<template>
  <v-container>
    <v-layout row justify-center align-center>
      <v-flex xs12 sm6>
        <v-card class="blue-border-small" flat>
          <v-card-title primary-title class="headline justify-center">
            <div text-xs-center>User profile</div>
          </v-card-title>
          <v-layout row wrap mr-2>
            <v-flex xs10>
              <v-card-text>
                <span class="indigo--text subheading">Email:</span> {{ email }}
                <span :style="emailVerified ? verifiedStyle : notVerifiedStyle"> ({{ emailVerified ? 'verified' : 'not verified' }})</span>
                <span>
                  <v-tooltip :disabled="emailVerified" bottom open-delay="500">
                    <v-btn
                      v-show="!emailVerified"
                      slot="activator"
                      :disabled="loading2 || emailVerified"
                      :loading="loading2"
                      small
                      style="min-width:48px;"
                      color="accent"
                      @click.native="onEmailVerification()">
                      <span slot="loader" class="custom-loader">
                        <v-icon light>cached</v-icon>
                      </span>Verify
                    </v-btn>
                    <span>Send verification email</span>
                  </v-tooltip>
                </span>
              </v-card-text>
            </v-flex>
            <v-flex xs2>
              <v-card flat>
                <v-toolbar dense card height="25px" color="transparent">
                  <v-tooltip bottom open-delay="500">
                    <v-btn slot="activator" :loading="imgloading" :disabled="imgloading" class="btnprof" small flat @click="onChooseProfileImage()">
                      <v-icon small color="blue darken-4">attachment</v-icon>
                    </v-btn>
                    <span slot="loader" class="custom-loader">
                      <v-icon light>cached</v-icon>
                    </span>
                    <span>Load profile image</span>
                  </v-tooltip>
                  <v-tooltip bottom open-delay="500">
                    <v-btn slot="activator" :disabled="imgloading" class="btnprof" small flat right @click="onChooseToDeleteProfileImage()">
                      <v-icon small color="blue darken-4">clear</v-icon>
                    </v-btn>
                    <span>Delete profile image</span>
                  </v-tooltip>
                </v-toolbar>
                <v-card-media
                  :src="profileImg"
                  height="80px"
                  contain
                />
                <input
                  ref="profileImgInput"
                  type="file"
                  class="disp-none"
                  accept="image/jpeg, image/png"
                  @change="onFilePicked($event)">
              </v-card>
            </v-flex>
          </v-layout>
          <v-container>
            <v-form ref="form" lazy-validation @submit.prevent="onUpdateProfile">
              <v-layout row>
                <v-flex xs12>
                  <v-text-field
                    id="displayName"
                    v-model="displayName"
                    name="displayName"
                    label="User displayed name"
                    type="text"
                    @input="onDisplayNameInput"/>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12>
                  <v-text-field
                    id="password"
                    v-model="password"
                    :rules="[() => {
                      if (password !=='') {
                        return (password.length > 5) || ('Password should be at least 6 characters')
                      } else {
                        return true
                      }
                    }]"
                    name="password"
                    label="New password"
                    type="password"
                    @input="onPassInput"/>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12>
                  <v-text-field
                    id="confirmPassword"
                    ref="confirmPassword"
                    v-model="confirmPassword"
                    :disabled="confirmPasswordDisabled"
                    :rules="[comparePasswords]"
                    name="confirmPassword"
                    label="Confirm new password"
                    type="password"/>
                </v-flex>
              </v-layout>
              <v-layout row justify-center align-center>
                <v-flex xs12 text-xs-center>
                  <v-btn :disabled="loading || !needToUpdate" :loading="loading" style="max-width:150px;" type="submit" @click.native="onUpdateProfile()">
                    Update profile
                    <span slot="loader" class="custom-loader">
                      <v-icon light>cached</v-icon>
                    </span>
                  </v-btn>
                  <v-btn :disabled="loading3 || !needToChangePassword" :loading="loading3" style="max-width:150px;" @click.native="onChangePassword()">
                    Change password
                    <span slot="loader" class="custom-loader">
                      <v-icon light>cached</v-icon>
                    </span>
                  </v-btn>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout v-if="profileUpdated || passwordChanged || verificationEmailSent || needToVerify" row justify-center align-center>
      <v-flex xs12 sm6>
        <v-alert :value="true" :color="alertColor" outline type="info">
          {{ alertUpdateText }}
        </v-alert>
      </v-flex>
    </v-layout>
    <v-layout v-if="error" row justify-center align-center>
      <v-flex xs12 sm6>
        <app-alert :text="error.message" :code="error.code" @dismissed="onDismissed"/>
      </v-flex>
    </v-layout>
    <v-dialog v-model="relogindialog" max-width="280" persistent transition="fade-transition">
      <v-card>
        <v-layout row justify-center align-center>
          <v-card-title class="subheading text-xs-center">Do you want to re-login?</v-card-title>
        </v-layout>
        <v-layout row justify-center align-center>
          <v-flex text-xs-center mb-2>
            <v-btn small color="green darken-5" outline @click.native="onRelogin()">Yes</v-btn>
            <v-btn small color="green darken-5" outline @click.native="relogindialog = false">Cancel</v-btn>
          </v-flex>
        </v-layout>
      </v-card>
    </v-dialog>
    <v-dialog v-model="relogindialog2" max-width="280" persistent transition="fade-transition">
      <v-card>
        <v-layout row justify-center align-center>
          <v-card-title class="subheading text-xs-center">You need to relogin after checking verification email!</v-card-title>
        </v-layout>
        <v-layout row justify-center align-center>
          <v-flex text-xs-center mb-2>
            <v-btn small color="green darken-5" outline @click.native="onRelogin()">OK</v-btn>
          </v-flex>
        </v-layout>
      </v-card>
    </v-dialog>
    <v-dialog v-model="profimgdeletedialog" max-width="280" persistent transition="fade-transition">
      <v-card>
        <v-layout row justify-center align-center>
          <v-card-title class="subheading text-xs-center">Do you really want to delete your profile image?</v-card-title>
        </v-layout>
        <v-layout row justify-center align-center>
          <v-flex text-xs-center mb-2>
            <v-btn small color="green darken-5" outline @click.native="onDeleteProfileImage()">Yes</v-btn>
            <v-btn small color="green darken-5" outline @click.native="profimgdeletedialog = false">Cancel</v-btn>
          </v-flex>
        </v-layout>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import db from "@/dbfunc/db";

export default {
	name: "Profile",
	data() {
		return {
			email: "",
			oldDisplayName: "",
			displayName: "",
			password: "",
			confirmPassword: "",
			confirmPasswordDisabled: true,
			emailVerified: false,
			alertColor: "success",
			alertUpdateText: "",
			notVerifiedStyle: {
				color: "red",
				fontSize: "13px"
			},
			verificationEmailSent: false,
			profileUpdated: false,
			passwordChanged: false,
			alreadyChangePassword: true,
			relogindialog: false,
			relogindialog2: false,
			profimgdeletedialog: false,
			needToVerify: false,
			verifiedStyle: {
				color: "green",
				fontSize: "13px"
			},
			photoURL: ""
		};
	},
	computed: {
		comparePasswords() {
			if (!this.password) {
				return true;
			}
			if (this.password === this.confirmPassword) {
				return true;
			}
			return "Passwords do not match";
		},
		error() {
			return this.$store.getters.error;
		},
		loading() {
			return this.$store.getters.loading;
		},
		loading2() {
			return this.$store.getters.loading2;
		},
		loading3() {
			return this.$store.getters.loading3;
		},
		imgloading() {
			return this.$store.getters.imgloading;
		},
		needToUpdate() {
			return (this.oldDisplayName !== this.displayName);
		},
		needToChangePassword() {
			return (this.password !== "") && !this.alreadyChangePassword;
		},
		profileImg() {
			if (this.photoURL) {
				return this.photoURL;
			} else {
				return require("../../assets/profiledefault.jpg");
			}
		}
	},
	created() {
		this.$store.dispatch("clearError");
		if (this.$store.getters.user !== null && this.$store.getters.user !== undefined) {
			this.email = this.$store.getters.user.email;
			this.displayName = this.$store.getters.user.displayName;
			this.oldDisplayName = this.$store.getters.user.displayName;
			this.emailVerified = this.$store.getters.user.emailVerified;
			if (this.$store.getters.user.photoURL) {
				this.photoURL = this.$store.getters.user.photoURL;
			} else {
				this.photoURL = "";
			}
			if (!this.emailVerified) {
				this.needToVerify = true;
				this.alertColor = "blue";
				this.alertUpdateText = "You have to get verification before proceed to work!";
			}
		}
	},
	methods: {
		setUpdatedFlagsToFalse() {
			this.passwordChanged = false;
			this.profileUpdated = false;
			this.verificationEmailSent = false;
		},
		onDisplayNameInput() {
			this.profileUpdated = false;
		},
		onPassInput(value) {
			this.passwordChanged = false;
			if (value === "") {
				this.confirmPassword = "";
				this.confirmPasswordDisabled = true;
				this.alreadyChangePassword = true;
			} else {
				this.alreadyChangePassword = false;
				this.confirmPasswordDisabled = false;
			}
		},
		onUpdateProfile() {
			this.profileUpdated = false;
			this.$store.dispatch("updateUserProfile", {
				userid: this.$store.getters.user.uid,
				displayName: this.displayName
			}).then(
				() => {
					this.alertUpdateText = "Your profile updated successfully!";
					this.alertColor = "success";
					this.oldDisplayName = this.displayName;
					this.$store.commit("setUserDisplayName", this.displayName);
					this.profileUpdated = true;
				}
			).catch(
				() => {
					this.setUpdatedFlagsToFalse();
				}
			);
		},
		onChangePassword() {
			if (this.$refs.form.validate()) {
				this.passwordChanged = false;
				this.$store.dispatch("changeUserPassword", {
					password: this.password
				}).then(
					() => {
						this.alertUpdateText = "Your password changed successfully!";
						this.alertColor = "success";
						this.passwordChanged = true;
						this.alreadyChangePassword = true;
					}
				).catch(
					(error) => {
						this.setUpdatedFlagsToFalse();
						if (error.code === "auth/requires-recent-login") {
							this.relogindialog = true;
						}
					}
				);
			}
		},
		onEmailVerification() {
			this.emailVerified = db.auth.currentUser.emailVerified;
			if (this.emailVerified) {
				this.$store.commit("setUserVerified");
				this.setUpdatedFlagsToFalse();
				return;
			}
			this.$store.dispatch("sendVerificationEmail").then(
				() => {
					this.verificationEmailSent = true;
					this.alertUpdateText = "Please, check for the verification email in your inbox and click the link in that email to proceed!";
					this.alertColor = "success";
					this.relogindialog2 = true;
				}).catch(
				() => {
					this.setUpdatedFlagsToFalse();
				}
			);
		},
		onDismissed() {
			this.$store.dispatch("clearError");
		},
		onRelogin() {
			this.relogindialog = false;
			this.$store.dispatch("logout").then(
				() => {
					this.$router.push("/login");
				}
			);
		},
		onChooseToDeleteProfileImage() {
			if (this.photoURL !== "") {
				this.profimgdeletedialog = true;
			}
		},
		onDeleteProfileImage() {
			this.profimgdeletedialog = false;
			let extension = this.photoURL.substring(this.photoURL.lastIndexOf("."), this.photoURL.lastIndexOf(".") + 4);
			if (extension === ".jpe") {
				extension = ".jpeg";
			}

			this.$store.dispatch("deleteProfileImage", {
				userid: this.$store.getters.user.uid,
				ext: extension
			}).then(() => {
				this.photoURL = "";
				this.$store.commit("setUserPhotoURL", "");
				this.$store.commit("setImgLoading", false);
			});
		},
		onChooseProfileImage() {
			this.$refs.profileImgInput.click();
		},
		onFilePicked(event) {
			const file = event.target.files[0];
			let filename = file.name;
			if (filename.lastIndexOf(".") <= 0) {
				this.$store.commit("setError", new Error("Please choose a valid image file!"));
			}

			let extension = filename.substring(filename.lastIndexOf("."));

			var validFileType = ".jpg , .png , .jpeg";
			if (validFileType.toLowerCase().indexOf(extension) < 0) {
				this.$store.commit("setError", new Error("Please choose a valid image file! The supported file types are: .jpg, .png, .jpeg"));
				return false;
			}

			if (file.size > 50 * 1024) {
				this.$store.commit("setError", new Error("The image file size must be less than 50kb."));
				return false;
			}

			let photoURLSave = this.photoURL;

			const fileReader = new FileReader();
			const getMimetype = (signature) => {
				switch (signature) {
				case "89504E47":
					return "image/png";
				case "FFD8FFDB":
				case "FFD8FFE0":
					return "image/jpeg";
				default:
					return "Unknown filetype";
				}
			};

			new Promise(function(resolve, reject) {
				fileReader.onloadend = function(evt) {
					if (evt.target.readyState === FileReader.DONE) {
						let signbytes = evt.target.result;
						const uint = new Uint8Array(signbytes);
						let bytes = [];
						uint.forEach((byte) => {
							bytes.push(byte.toString(16));
						});
						const hex = bytes.join("").toUpperCase();
						const mime = getMimetype(hex);
						if (mime !== "Unknown filetype") {
							resolve();
						} else {
							reject(new Error("Unknown filetype signature error!"));
						}
					}
				};
			}).then(() => {
				fileReader.onloadend = null;
				fileReader.readAsDataURL(file);
				this.$store.dispatch("setProfileImage", {
					userid: this.$store.getters.user.uid,
					ext: extension,
					image: file
				}).then((metadata) => {
					this.$store.commit("setUserPhotoURL", metadata.downloadURLs[0]);
					this.photoURL = metadata.downloadURLs[0];
					this.$store.commit("setImgLoading", false);
				});
			}).catch((error) => {
				this.photoURL = photoURLSave;
				this.$store.commit("setError", error);
				return false;
			});

			fileReader.readAsArrayBuffer(file.slice(0, 4));
		}
	}
};
</script>

<style scoped>
	.btnprof {
		min-height: 5px;
		min-width: 5px;
		height: 20px;
		width: 25px;
	}
</style>
