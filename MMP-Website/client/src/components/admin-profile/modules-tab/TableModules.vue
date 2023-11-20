<script setup>
import { formatDate, formatName, formatEnum, addUnique } from "@/util/helpers";
import MessagePopup from "../../common/MessagePopup.vue";
import LoadingSpinner from "../../common/LoadingSpinner.vue";
</script>

<template>
    <LoadingSpinner v-if="!render" />
    <div v-else class="overflow-x-auto shadow-md rounded-lg overflow-y-auto max-h-96">
        <table class="w-full text-gray-500 dark:text-gray-400 md:text-xl text-center min-w-[1400px]">
            <thead
                class="text-xs text-white uppercase bg-highlight dark:bg-gray-700 dark:text-gray-400 sticky top-0"
            >
                <tr>
                    <th scope="col" class="px-6 py-3">Module Name</th>
                    <th scope="col" class="px-6 py-3">Teacher Assigned</th>
                    <th scope="col" class="px-6 py-3">Program</th>
                    <th scope="col" class="px-6 py-3">Session 1</th>
                    <th scope="col" class="px-6 py-3 text-center">Session 2</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-if="moduleArray === null || moduleArray.length === 0"
                    class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                    <th
                        scope="row"
                        class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                        No Modules Found
                    </th>
                </tr>
                <tr
                    v-for="(module, index) in moduleArray"
                    :key="index"
                    class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                    <td
                        class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                        {{ module.module_name }}
                    </td>
                    <td
                        class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                        <!-- Dropdown for Teachers -->
                        <select
                            :class="{
                                'text-edited':
                                    baseModuleArray[index].teacher.teacher_id !==
                                    moduleArray[index].teacher.teacher_id,
                            }"
                            @change="addUnique(editedIndices, index)"
                            v-model="module.teacher.teacher_id"
                        >
                            <option
                                v-for="teacher in teacherArray"
                                :value="teacher.teacher_id"
                                :selected="teacher.teacher_id === module.teacher.teacher_id"
                            >
                                {{ formatName(teacher.last_name, teacher.first_name) }}
                            </option>
                        </select>
                    </td>
                    <td class="px-6 py-3 font-medium">
                        {{ getProgram(module.program) }}
                    </td>
                    <td class="px-6 py-3 font-medium">
                        {{ formatDate(module.session_1) }}
                    </td>
                    <td class="px-6 py-3 font-medium">
                        {{ formatDate(module.session_2) }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="flex items-center justify-center">
        <button
            @click="addNewModule"
            class="w-40 py-3 mt-5 mr-2 text-base font-medium text-center text-white bg-highlight rounded-lg hover:bg-highlight_hover"
        >
            Add New
        </button>
        <button
            @click="update()"
            class="w-40 py-3 mt-5 text-highlight font-medium text-center bg-white border-2 border-highlight rounded-lg hover:border-highlight_hover hover:bg-highlight_hover hover:text-white"
        >
            Save Changes
        </button>
    </div>

    <MessagePopup
        v-if="showUpdatePopup"
        title="Assignment Successful"
        description="Assigning of teachers was successfully executed"
        :accepted="true"
        exit-text="Close"
        @on-exit="showUpdatePopup = false"
    />

    <MessagePopup
        v-if="editErrorPopup"
        title="Update Failed"
        :description="`Something went wrong with executing the update. Please try again.`"
        :accepted="false"
        exit-text="Close"
        @on-exit="showErrorPopup = false"
    />

</template>

<script>
export default {
    data() {
        return {
            // Render
            render: false,
            // Data
            moduleArray: null,
            baseModuleArray: null,
            teacherArray: null,
            editedIndices: [],
            errorCount: 0,
            // Popups
            editErrorPopup: false,
            showUpdatePopup: false,
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
                    this.moduleArray = data;
                    this.baseModuleArray = JSON.parse(JSON.stringify(this.moduleArray));
                })
                // If unsuccessful
                .catch((error) => {
                    console.log(error);
                });
        },
        async getAllTeachers() {
            await this.$axios
                .get("/teachers")
                // If successful
                .then(({ data }) => {
                    // Store data
                    this.teacherArray = data;
                })
                // If unsuccessful
                .catch((error) => {
                    console.log(error);
                });
        },
        update() {
            this.errorCount = 0;

            this.editedIndices.forEach(async (index) => {
                await this.$axios
                    .patch(
                        `/modules/teacher/${this.moduleArray[index].module_name}/${this.moduleArray[index].school_year}`,
                        {
                            teacher_id: this.moduleArray[index].teacher.teacher_id,
                        }
                    )
                    .catch((error) => {
                        this.errorCount++;
                    });
            });

            if (this.errorCount > 0) {
                this.editErrorPopup = true;
            } else {
                this.showUpdatePopup = true;
            }
            this.baseModuleArray = JSON.parse(JSON.stringify(this.moduleArray));
        },
        getProgram(program) {
            return formatEnum(program);
        },
        // Add new module
        addNewModule() {
            // Create a new module object with default values or empty strings
            const newModule = {
                module_name: "",
                teacher: {
                    last_name: "",
                    first_name: "",
                },
                program: "",
                session_1: "",
                session_2: "",
            };

            // Add the new module to the moduleArray
            this.moduleArray.push(newModule);
        },
    },
    async created() {
        await this.getAllModules().then(() => {
            this.render = true;
        });
        await this.getAllTeachers();
    },
};
</script>
