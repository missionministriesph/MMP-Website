<script setup>
import { formatDate, formatName, formatEnum, addUnique } from "@/util/helpers";
import MessagePopup from "../../common/MessagePopup.vue";
import LoadingSpinner from "../../common/LoadingSpinner.vue";
import PromptPopup from "../../common/PromptPopup.vue";
defineEmits(["delete"]);
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
        <table class="w-full text-gray-500 dark:text-gray-400 text-xl text-center">
            <thead
                class="text-xs text-white uppercase bg-highlight dark:bg-gray-700 dark:text-gray-400 sticky top-0"
            >
                <tr>
                    <th scope="col" class="px-6 py-3">ID Number</th>
                    <th scope="col" class="px-6 py-3">Name</th>
                    <th scope="col" class="px-6 py-3">Date Enrolled</th>
                    <th scope="col" class="px-6 py-3">Status</th>
                    <th scope="col" class="px-6 py-3 text-center">Action</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-if="studentArray === null || studentArray.length === 0"
                    class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                    <th
                        scope="row"
                        class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                        No Students Found
                    </th>
                </tr>
                <tr
                    v-for="(student, index) in studentArray"
                    class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                    <th
                        scope="row"
                        class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                        {{ student.student_id }}
                    </th>
                    <th
                        scope="row"
                        class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                        {{ formatName(student.last_name, student.first_name) }}
                    </th>
                    <th
                        scope="row"
                        class="px-6 py-3 font-medium"
                        v-if="student.status === 'FOR_APPROVAL'"
                    >
                        {{ formatDate(student.created_at) }}
                    </th>
                    <th scope="row" class="px-6 py-3 font-medium" v-else>
                        {{ formatDate(student.created_at) }}
                    </th>

          <th
            scope="row"
            class="px-6 py-3"
            v-if="
              ['ACTIVE', 'GRADUATED', 'WITHDRAWN', 'REJECTED'].includes(
                student.status
              )
            "
          >
            <select
              :class="{
                'text-edited': student.status !== baseDataArray[index].status,
              }"
              @change="addUnique(editedIndices, index)"
              v-model="student.status"
            >
              <option
                :selected="status === student.status"
                v-for="status in [
                  'ACTIVE',
                  'GRADUATED',
                  'WITHDRAWN',
                  'REJECTED',
                ]"
                :value="status"
              >
                {{ formatEnum(status) }}
              </option>
            </select>
          </th>
          <th scope="row" class="px-6 py-3 font-medium" v-else>
            {{ formatEnum(student.status) }}
          </th>

                    <td class="px-6 py-4" v-if="student.status === 'FOR_APPROVAL'">
                        <button
                            @click="
                                accept(
                                    student.student_id,
                                    formatName(student.last_name, student.first_name),
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
                                    student.student_id,
                                    formatName(student.last_name, student.first_name),
                                    index
                                )
                            "
                            type="button"
                            class="xl:w-auto w-full w-43.5 mr-3 mb-3 md:mb-0 text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600 whitespace-pre-line"
                        >
                            Reject
                        </button>
                    </td>
                    <td class="px-6 py-4" v-else>
                        <button
                            @click="deleteStudent(student.student_id, index)"
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
    :description="`Something went wrong with executing the update on the following students: ${erroredEdits}`"
    :accepted="false"
    exit-text="Close"
    @on-exit="showErrorPopup = false"
  />

  <PromptPopup
    v-if="currentPopup === 'delete-confirmation'"
    title="Are You Sure You Want to Delete This Student?"
    description="Please make sure you want to delete this student. This action cannot be undone."
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
      studentArray: null,
      // Popups
      title: String,
      description: String,
      acception: Boolean,
      showErrorPopup: false,
      showUpdatePopup: false,
      editErrorPopup: false,
      currentPopup: null,
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
    async getStudents() {
      // Call get all students api endpoint
      await this.$axios
        .get(`/students/`)
        // If successful
        .then(({ data }) => {
          // Store data
          this.studentArray = data;
          this.baseDataArray = JSON.parse(JSON.stringify(this.studentArray));
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
                    .patch(`/students/status/${this.studentArray[index].student_id}`, {
                        status: this.studentArray[index].status,
                    })
                    .then(async () => {
                        await this.$axios
                            .get(`/students/id/${this.studentArray[index].student_id}`)
                            .then(({ data }) => (this.studentArray[index] = data));
                    })
                    .catch((error) => {
                        this.erroredEdits.push(this.studentArray[index].student_id);
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

      this.baseDataArray = JSON.parse(JSON.stringify(this.studentArray));
    },
    deleteStudent(student_id, index) {
      this.currentPopup = "delete-confirmation";
      this.activeId = student_id;
      this.activeIndex = index;
    },
    async runDelete() {
      await this.$axios
        .delete(`/students/${this.activeId}`)
        .then(() => {
          this.currentPopup = null;
          this.studentArray.splice(this.activeIndex, 1);
          this.baseDataArray = JSON.parse(JSON.stringify(this.studentArray));
          this.$emit("delete");
        })
        .catch((error) => {
          this.showErrorPopup = true;
        });
    },
    getTitle(accepted) {
      if (accepted) {
        return "Student successfully accepted";
      } else {
        return "Student successfully rejected";
      }
    },
    getDescription(accepted, student_id, name) {
      if (accepted) {
        return `Student ${name} with ID: ${student_id} has been successfully accepted`;
      } else {
        return `Student ${name} with ID: ${student_id} has been rejected`;
      }
    },
    getColor(accepted) {
      if (accepted) {
        return "green";
      } else {
        return "red";
      }
    },
    accept(student_id, name, index) {
      this.title = this.getTitle(true);
      this.description = this.getDescription(true, student_id, name);
      this.acception = true;
      this.updateStudentStatus(student_id, "ACTIVE", index);
    },
    reject(student_id, name, index) {
      this.title = this.getTitle(false);
      this.description = this.getDescription(false, student_id, name);
      this.color = this.getColor(false);
      this.updateStudentStatus(student_id, "REJECTED", index);
    },
    async updateStudentStatus(student_id, status, index) {
      await this.$axios
        .patch(`/students/status/${student_id}`, {
          status: status,
        })
        .then(({ data }) => {
          this.showUpdatePopup = true;
        })
        .then(async () => {
          await this.$axios
            .get(`/students/id/${student_id}`)
            .then(({ data }) => (this.studentArray[index] = data));
        })
        .catch((error) => {
          this.showErrorPopup = true;
        });
    },
  },
  async created() {
    await this.getStudents().then(() => {
      this.render = true;
    });
  },
};
</script>
