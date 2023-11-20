<script setup>
import { formatDate, formatName, formatEnum, addUnique } from "@/util/helpers";
import MessagePopup from "../../common/MessagePopup.vue";
import LoadingSpinner from "../../common/LoadingSpinner.vue";
import PromptPopup from "../../common/PromptPopup.vue";
</script>

<template>
    <LoadingSpinner v-if="!render" />
    <div v-else class="overflow-x-auto shadow-md rounded-lg overflow-y-auto">
        <div class="grid">
            <button
                @click="update()"
                type="button"
                class="ml-auto mb-2 w-15 h-13 px-5 py-2 text-base font-medium text-center text-white bg-highlight rounded-lg hover:bg-highlight_hover"
            >
                Save
            </button>
        </div>
        <div class="overflow-x-auto shadow-md rounded-lg overflow-y-auto max-h-96">
            <table class="w-full text-gray-500 dark:text-gray-400 md:text-xl text-center">
                <thead
                    class="text-xs text-white uppercase bg-highlight dark:bg-gray-700 dark:text-gray-400 sticky top-0"
                >
                    <tr>
                        <th scope="col" class="px-6 py-3">ID Number</th>
                        <th scope="col" class="px-6 py-3">Name</th>
                        <th scope="col" class="px-6 py-3">Date Requested</th>
                        <th scope="col" class="px-6 py-3">Status</th>
                        <th scope="col" class="px-6 py-3 text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-if="facultyArray === null || facultyArray.length === 0"
                        class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        <th
                            scope="row"
                            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                            No Teachers Found
                        </th>
                    </tr>
                    <tr
                        v-for="(teacher, index) in facultyArray"
                        class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        <th
                            scope="row"
                            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                            {{ teacher.teacher_id }}
                        </th>

                        <th
                            scope="row"
                            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                            {{ formatName(teacher.last_name, teacher.first_name) }}
                        </th>
                        <th
                            scope="row"
                            class="px-6 py-3 font-medium"
                            v-if="teacher.status === 'FOR_APPROVAL'"
                        >
                            {{ formatDate(teacher.created_at) }}
                        </th>
                        <th scope="row" class="px-6 py-3 font-medium" v-else>
                            {{ formatDate(teacher.created_at) }}
                        </th>

                        <th
                            scope="row"
                            class="px-6 py-3"
                            v-if="['ACTIVE', 'INACTIVE'].includes(teacher.status)"
                        >
                            <select
                                :class="{
                                    'text-edited': teacher.status !== baseDataArray[index].status,
                                }"
                                @change="addUnique(editedIndices, index)"
                                v-model="teacher.status"
                            >
                                <option
                                    :selected="status === teacher.status"
                                    v-for="status in ['ACTIVE', 'INACTIVE']"
                                    :value="status"
                                >
                                    {{ formatEnum(status) }}
                                </option>
                            </select>
                        </th>
                        <th scope="row" class="px-6 py-3 font-medium text-lg" v-else>
                            {{ formatEnum(teacher.status) }}
                        </th>

                        <td class="px-6 py-4" v-if="teacher.status === 'FOR_APPROVAL'">
                            <button
                                @click="
                                    accept(
                                        teacher.teacher_id,
                                        formatName(teacher.last_name, teacher.first_name),
                                        index
                                    )
                                "
                                type="button"
                                class="xl:w-auto w-full mr-3 mb-3 xl:mb-0 text-white bg-highlight hover:bg-highlight_hover focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600 whitespace-pre-line"
                            >
                                Accept
                            </button>
                            <button
                                @click="
                                    reject(
                                        teacher.teacher_id,
                                        formatName(teacher.last_name, teacher.first_name),
                                        index
                                    )
                                "
                                type="button"
                                class="xl:w-auto w-full mr-3 mb-3 md:mb-0 text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600 whitespace-pre-line"
                            >
                                Reject
                            </button>
                        </td>
                        <td class="px-6 py-4" v-else>
                            <button
                                @click="deleteTeacher(teacher.teacher_id, index)"
                                type="button"
                                class="xl:w-auto w-full mr-3 mb-3 md:mb-0 text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600 whitespace-pre-line"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <MessagePopup
        v-if="showUpdatePopup"
        :title="title"
        :description="description"
        :accepted="acception"
        exit-text="Close"
        @on-exit="showUpdatePopup = false"
    />

    <MessagePopup
        v-if="showErrorPopup"
        title="Update Failed"
        description="Something went wrong with executing the update"
        exit-text="Close"
        @on-exit="showErrorPopup = false"
    />

    <MessagePopup
        v-if="editErrorPopup"
        title="Update Failed"
        :description="`Something went wrong with executing the update on the following teachers: ${erroredEdits}`"
        :accepted="false"
        exit-text="Close"
        @on-exit="showErrorPopup = false"
    />

    <PromptPopup
        v-if="currentPopup === 'delete-confirmation'"
        title="Are You Sure You Want to Delete This Teacher?"
        description="Please make sure you want to delete this teacher. This action cannot be undone."
        confirm-text="Yes, I'm sure"
        exit-text="No, cancel"
        @on-confirm="runDelete()"
        @on-exit="currentPopup = null"
    />
</template>

<script>
export default {
    data() {
        return {
            // Render
            render: false,
            // Data
            facultyArray: null,
            // Popups
            title: String,
            description: String,
            acception: Boolean,
            showErrorPopup: false,
            showUpdatePopup: false,
            editErrorPopup: false,
            currentPopup: null,
            //Constants
            statuses: ["ACTIVE", "INACTIVE", "REJECTED", "FOR_APPROVAL"],
            //Handlers
            editedIndices: [],
            erroredEdits: [],
            //Copy of array
            baseDataArray: null,
            //Deletion data
            activeId: null,
            activeIndex: null,
        };
    },
    methods: {
        // Get Faculty
        async getFaculty() {
            // Call get all teachers api endpoint
            await this.$axios
                .get(`/teachers/`)
                // If successful
                .then(({ data }) => {
                    // Store data
                    this.facultyArray = data;
                    this.baseDataArray = JSON.parse(JSON.stringify(this.facultyArray));
                })
                // If unsuccessful
                .catch((error) => {
                    console.log(error);
                });
        },
        update() {
            this.erroredEdits = [];

            this.editedIndices.forEach(async (index) => {
                await this.$axios
                    .patch(`/teachers/status/${this.facultyArray[index].teacher_id}`, {
                        status: this.facultyArray[index].status,
                    })
                    .then(async () => {
                        await this.$axios
                            .get(`/teachers/${this.facultyArray[index].teacher_id}`)
                            .then(({ data }) => (this.facultyArray[index] = data));
                    })
                    .catch((error) => {
                        this.erroredEdits.push(this.facultyArray[index].teacher_id);
                    });
            });

            this.editedIndices = [];

            if (this.erroredEdits.length > 0) {
                this.editErrorPopup = true;
            } else {
                this.title = "Successfully saved all changes.";
                this.description = "The statuses have been successfully changed.";
                this.acception = true;
                this.showUpdatePopup = true;
            }

            this.baseDataArray = JSON.parse(JSON.stringify(this.facultyArray));
        },
        deleteTeacher(teacher_id, index) {
            this.currentPopup = "delete-confirmation";
            this.activeId = teacher_id;
            this.activeIndex = index;
        },
        async runDelete() {
            await this.$axios
                .delete(`/teachers/${this.activeId}`)
                .then(() => {
                    this.currentPopup = null;
                    this.facultyArray.splice(this.activeIndex, 1);
                    this.baseDataArray = JSON.parse(JSON.stringify(this.facultyArray));
                })
                .catch((error) => {
                    this.showErrorPopup = true;
                });
        },
        getID(teacher_id) {
            return teacher_id;
        },
        getTitle(accepted) {
            if (accepted) {
                return "Teacher successfully accepted";
            } else {
                return "Teacher successfully rejected";
            }
        },
        getDescription(accepted, teacher_id, name) {
            if (accepted) {
                return `Teacher ${name} with ID: ${teacher_id} has been successfully accepted`;
            } else {
                return `Teacher ${name} with ID: ${teacher_id} has been rejected`;
            }
        },
        accept(teacher_id, name, index) {
            this.title = this.getTitle(true);
            this.description = this.getDescription(true, teacher_id, name);
            this.acception = true;
            this.updateTeacherStatus(teacher_id, "ACTIVE", index);
        },
        reject(teacher_id, name, index) {
            this.title = this.getTitle(false);
            this.description = this.getDescription(false, teacher_id, name);
            this.acception = false;
            this.updateTeacherStatus(teacher_id, "REJECTED", index);
        },
        async updateTeacherStatus(teacher_id, status, index) {
            await this.$axios
                .patch(`/teachers/status/${teacher_id}`, {
                    status: status,
                })
                .then(({ data }) => {
                    this.showUpdatePopup = true;
                })
                .then(async () => {
                    await this.$axios
                        .get(`/teachers/${teacher_id}`)
                        .then(({ data }) => (this.facultyArray[index] = data));
                })
                .catch((error) => {
                    this.showErrorPopup = true;
                });
        },
    },
    async created() {
        await this.getFaculty().then(() => {
            this.render = true;
        });
    },
};
</script>
