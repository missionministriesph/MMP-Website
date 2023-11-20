<script setup>
// Helpers
import { formatName } from "../../../util/helpers";
import LoadingSpinner from "../../common/LoadingSpinner.vue";
// Props
defineProps({
    filter: {
        type: String,
        required: true,
    },
    selectedModule: {
        type: String,
        required: false,
    },
});
// Emits
defineEmits(["select-student"]);
</script>

<template>
    <LoadingSpinner v-if="!render" />
    <div v-else class="overflow-x-auto shadow-md rounded-lg overflow-y-auto max-h-96">
        <table class="w-full text-gray-500 dark:text-gray-400 text-xl text-center">
            <thead
                class="text-xs text-white uppercase bg-highlight dark:bg-gray-700 dark:text-gray-400 sticky top-0"
            >
                <tr>
                    <th scope="col" class="px-6 py-3">ID Number</th>
                    <th scope="col" class="px-6 py-3 text-center">Student Name</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-if="studentArray?.length === 0"
                    class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                    <th
                        scope="row"
                        class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                        No Students Found
                    </th>
                    <td class="px-6 py-4">-</td>
                </tr>
                <tr
                    v-else
                    v-for="student in studentArray"
                    @click="$emit('select-student', student.student_id)"
                    class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                    <th
                        scope="row"
                        class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                        {{ student.student_id }}
                    </th>
                    <td class="px-6 py-4">
                        {{ formatName(student.first_name, student.last_name) }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // Render
            render: false,
            // Data
            studentArray: null,
        };
    },
    methods: {
        async getStudentArray() {
            console.log(this.filter);
            switch (this.filter) {
                case "All Students":
                    this.getAllStudents();
                    break;
                case "Currently Enrolled Students":
                    this.getInProgressStudents();
                    break;
                case "Incomplete Students":
                    this.getUnpaidStudents();
                    break;
                case "Module Specific":
                    this.getModuleSpecificStudents();
                    break;
            }
        },
        async getAllStudents() {
            await this.$axios
                .get(`/students/id_name`)
                // If successful
                .then(({ data }) => {
                    // Store data
                    this.studentArray = data;
                })
                // If unsuccessful
                .catch((error) => {
                    console.log(error);
                });
        },
        async getInProgressStudents() {
            // Get all students
            await this.$axios
                .get(`/students/in_progress`)
                // If successful
                .then(({ data }) => {
                    // Store data
                    this.studentArray = data;
                })
                // If unsuccessful
                .catch((error) => {
                    console.log(error);
                });
        },
        async getUnpaidStudents() {
            // Get all students
            await this.$axios
                .get(`/students/unpaid_bills`)
                // If successful
                .then(({ data }) => {
                    // Store data
                    console.table(data);
                    this.studentArray = data;
                })
                // If unsuccessful
                .catch((error) => {
                    console.log(error);
                });
        },
        async getModuleSpecificStudents() {
            console.log(this.selectedModule);
            await this.$axios
                .get(`/students/module/${this.selectedModule}`) // If successful
                .then(({ data }) => {
                    // Store data
                    console.table(data);
                    this.studentArray = data;
                })
                // If unsuccessful
                .catch((error) => {
                    console.log(error);
                });
        },
    },
    watch: {
        async filter() {
            await this.getStudentArray().then(() => {
                this.render = true;
            });
        },
        async selectedModule() {
            await this.getStudentArray().then(() => {
                this.render = true;
            });
        },
    },
    async created() {
        await this.getStudentArray().then(() => {
            this.render = true;
        });
    },
};
</script>
