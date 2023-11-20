<template>
    <div
        class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700"
    >
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1
                class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white"
            >
                Sign In
            </h1>
            <form class="space-y-4 md:space-y-6" action="#" v-on:submit.prevent="onSubmit">
                <div>
                    <label
                        for="id"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                        ID Number</label
                    >
                    <input
                        type="text"
                        name="id"
                        id="id"
                        autocomplete="on"
                        class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                        placeholder="20XX-XXX-XXX"
                        v-model="user_id"
                    />
                    <div class="input-errors" v-if="errors['id']">
                        <div class="block mb-2 text-sm font-medium text-highlight">
                            {{ errors["id"] }}
                        </div>
                    </div>
                </div>
                <div>
                    <label
                        for="password"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >Password</label
                    >
                    <input
                        type="password"
                        name="password"
                        id="password"
                        placeholder="••••••••"
                        autocomplete="on"
                        class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                        v-model="password"
                    />
                </div>
                <div class="flex items-center justify-between sm:flex-row flex-col gap-5">
                    <div class="flex items-start">
                        <div class="flex items-center h-5">
                            <input
                                id="remember"
                                aria-describedby="remember"
                                type="checkbox"
                                class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300"
                                checked
                                @click="rememberMe = !rememberMe"
                            />
                        </div>
                        <div class="ml-3 text-sm">
                            <label for="remember" class="text-gray-500 dark:text-gray-300"
                                >Remember me</label
                            >
                        </div>
                    </div>
                    <a
                        href="#"
                        class="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500"
                        >Forgot password?</a
                    >
                </div>
                <button
                    type="submit"
                    class="w-full text-white bg-highlight hover:bg-highlight_hover focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                    @click="submitForm()"
                >
                    Sign in
                </button>
            </form>
            <br />
            <!-- add clickable text "Enroll as Student"-->
            <div class="flex justify-between flex-row gap-5">
                <router-link
                    to="/student/signup"
                    class="text-md font-semibold hover:underline hover:decoration-2 cursor-pointer"
                >
                    Enroll as Student
                </router-link>
                <router-link
                    to="/teacher/signup"
                    class="text-md font-semibold hover:underline hover:decoration-2 cursor-pointer"
                >
                    Sign Up as Faculty
                </router-link>
            </div>
        </div>
    </div>

    <MessagePopup
        v-if="showInvalidPopup"
        title="Invalid Login Credentials."
        description="Please follow the form guides."
        exit-text="Close"
        @on-exit="showInvalidPopup = false"
    />

    <MessagePopup
        v-if="showErrorPopup"
        title="Failed to Login"
        description="Please ensure that Admin has verified your account."
        exit-text="Close"
        @on-exit="showErrorPopup = false"
    />
</template>

<script setup>
import MessagePopup from "../../components/common/MessagePopup.vue";
import { useCredentialsStore } from "../../store/store";
</script>

<script>
// Export component script
export default {
    data() {
        // Data of the component
        return {
            // Form data
            user_id: "",
            password: "",
            rememberMe: true,
            errors: {},
            // Popups
            showInvalidPopup: false,
            showErrorPopup: false,
        };
    },
    methods: {
        // Methods of the component
        // Submit form
        async submitForm() {
            // Validate form
            if (this.validate()) {
                // Login user
                await this.login();
            } else {
                this.showInvalidPopup = true;
            }
        },
        // Login User
        async login() {
            const store = useCredentialsStore();
            // Call login api endpoint
            await this.$axios
                .post(`/auth/login`, {
                    user_id: this.user_id,
                    password: this.password,
                    rememberMe: this.rememberMe,
                })
                // If successful
                .then((data) => {
                    const { token, account_type, user, user_id } = data.data;
                    store.login(token, account_type, user, user_id);
                    //Change the authorization headers of axios
                    this.$axios.defaults.headers["Authorization"] = `Bearer ${store.token}`;
                })
                .then(() => {
                    if (store.isLoggedIn) {
                        // Redirect to designated profile page
                        if (store.account_type === "admin") {
                            this.$router.push("/admin");
                        } else if (store.account_type === "teacher") {
                            this.$router.push("/teacher");
                        } else if (store.account_type === "student") {
                            this.$router.push("/student");
                        }
                    }
                })
                // If unsuccessful
                .catch((error) => {
                    console.log(error);
                    this.showErrorPopup = true;
                });
        },
        // Validators
        validate() {
            // Validate form
            this.validateUserID();

            if (Object.keys(this.errors).length === 0) {
                return true;
            } else {
                return false;
            }
        },
        validateUserID() {
            const idRegex = /20\d{2}-\d{3}-\d{3}/;
            if (idRegex.test(this.user_id) !== true) {
                this.errors["id"] = "Invalid ID format";
            } else {
                delete this.errors["id"];
            }
        },
    },
    watch: {
        user_id() {
            this.validateUserID();
        },
    },
};
</script>
