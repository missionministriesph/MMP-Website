<script setup>
// Store
import { useCredentialsStore } from "../../../store/store";
// Components
import ModuleCard from "../../common/ModuleCard.vue";
import LoadingSpinner from "../../common/LoadingSpinner.vue";
// Helpers
import { downloadZIP } from "../../../util/helpers";
// Emits
defineEmits(["select-module"]);
</script>

<template>
    <LoadingSpinner v-if="!render" />
    <div v-else
        class="w-full">
        <h1 class="text-4xl font-bold mb-4">Modules</h1>
        <div class="grid grid-cols-1 mb-5 gap-4 lg:grid-cols-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 align-center">
            <div v-if="modulesArray === null || modulesArray.length === 0">
                <ModuleCard module-name="No modules being taught" module-description="-" />
            </div>
            <div v-for="module in modulesArray">
                <button class="w-full h-auto"
                    @click="
                        $emit('select-module', {
                            module_name: module.details.module_name,
                            school_year: module.school_year,
                        })
                    "
                >
                    <ModuleCard
                        :module-name="`${module.details.module_name} ${module.school_year}`"
                        :module-description="module.details.description"
                    />
                </button>
            </div>
        </div>
        <div
            class="w-full bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 px-7 py-5 mb-5"
        >
            <h2 class="text-2xl font-semibold mb-1">Download</h2>
            <div class="mb-5">
                <button
                    @click="downloadDatabase"
                    type="button"
                    class="w-full sm:w-auto ml-auto mr-10 md:px-10 px-3 py-3 mt-5 text-base font-medium text-center text-white bg-highlight rounded-lg hover:bg-highlight_hover"
                >
                    Download All Module Enrollments Data (.zip)
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // Render
            render: false,
            // Store
            store: useCredentialsStore(),
            // Data
            modulesArray: null,
            selectedModuleName: null,
            selectedModuleYear: null,
        };
    },
    methods: {
        // Get all modules teacher teaches
        async getAllModules() {
            await this.$axios
                .get(`/modules/`)
                // If successful
                .then(({ data }) => {
                    // Store data
                    this.modulesArray = data;
                })
                // If unsuccessful
                .catch((error) => {
                    console.log(error);
                });
        },
        async downloadDatabase() {
            await this.$axios
                .get(`/download/modules`)
                // If successful
                .then(({ data }) => {
                    // Download data
                    downloadZIP(data, "modules data.zip");
                })
                // If unsuccessful
                .catch((error) => {
                    console.log(error);
                });
        },
    },
    async created() {
        await this.getAllModules()
            .then(() => {
                this.render = true;
            });
    },
};
</script>