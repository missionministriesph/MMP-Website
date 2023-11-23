<template>
    <footer class="bg-background shadow dark:bg-gray-900 text-white max-w-screen relative z-30">
        <div class="w-full max-w-screen-xl mx-auto p-4 md:py-8">
            <div class="sm:flex sm:items-center sm:justify-between">
                <router-link :to="store.account_type? store.account_type.toLowerCase() : '/'" class="flex items-center mb-4 sm:mb-0">
                    <span
                        class="hidden self-center text-2xl font-semibold whitespace-nowrap dark:text-white md:block"
                        >Mission Ministries Philippines</span
                    >
                    <span
                        class="block self-center text-2xl font-semibold whitespace-nowrap dark:text-white md:hidden"
                        >MMP</span
                    >
                </router-link>
            </div>
        </div>
    </footer>
</template>

<script setup>
import { useCredentialsStore } from "../../store/store";
import { formatEnum } from "../../util/helpers";
</script>

<script>
export default {
    data() {
        // Data of the component
        return {
            store: useCredentialsStore(),
        };
    },
}
</script>