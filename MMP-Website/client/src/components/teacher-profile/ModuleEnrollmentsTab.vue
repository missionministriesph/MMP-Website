<script setup>
// Components
import MessagePopup from "../../components/common/MessagePopup.vue";
import PromptPopup from "../../components/common/PromptPopup.vue";
import LoadingSpinner from "../../components/common/LoadingSpinner.vue";
// Helpers
import { formatName, addUnique, formatText } from "../../util/helpers";
// Props
defineProps({
    moduleName: String,
    schoolYear: Number,
});
// Emits
defineEmits(["on-back"]);
</script>

<template>
    <LoadingSpinner v-if="!render" />
    <div v-else class="w-full grid">
        <button
            @click="$emit('on-back')"
            type="button"
            class="mr-auto mb-1 w-21 h-12 px-10 py-3 text-base font-medium text-center text-white bg-highlight rounded-lg hover:bg-highlight_hover"
        >
            Back
        </button>
        <div class="sm:flex justify-between">
            <div>
                <h1 class="text-4xl font-bold mb-4">{{ moduleName }} {{ schoolYear }}</h1>
                <h2 class="text-2xl font-semibold mb-4">Students</h2>
            </div>
            <div class="grid">
                <button
                    v-if="!editMode"
                    @click="switchToEditMode()"
                    type="button"
                    class="ml-auto mb-3 sm:mb-1 w-21 h-12 px-10 py-3 text-base font-medium text-center text-white bg-highlight rounded-lg hover:bg-highlight_hover"
                >
                    Edit
                </button>
            </div>
            <div v-if="editMode" class="ml-auto grid grid-cols-2 gap-2">
                <button
                    @click="currentPopup = 'cancel'"
                    type="button"
                    class="mb-1 w-21 h-12 md:px-8 lg:px-10 py-3 text-base font-medium text-center text-white bg-highlight rounded-lg hover:bg-highlight_hover"
                >
                    Cancel
                </button>
                <button
                    @click="saveChanges()"
                    type="button"
                    class="lg:ml-10 mb-1 w-21 h-12 md:px-1 lg:px-10 py-3 text-base font-medium text-center text-white bg-highlight rounded-lg hover:bg-highlight_hover"
                >
                    Save Changes
                </button>
            </div>
        </div>
        <div class="grid">
            <div class="overflow-x-auto shadow-md rounded-lg w-full">
                <table class="w-full text-gray-500 text-xl text-center">
                    <thead class="sticky top-0 text-xs text-white uppercase bg-highlight">
                        <tr>
                            <th scope="col" class="px-6 py-3">Student ID</th>
                            <th scope="col" class="px-6 py-3">Name</th>
                            <th scope="col" class="px-6 py-3">Grade</th>
                            <th scope="col" class="px-6 py-3">Absences</th>
                            <th scope="col" class="px-6 py-3 text-center">Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-if="
                                moduleEnrollmentArray === null || moduleEnrollmentArray.length === 0
                            "
                            class="bg-white border-b hover:bg-gray-300"
                        >
                            <th
                                id="student-id"
                                scope="row"
                                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                            >
                                No Enrolled Students
                            </th>
                            <th id="name" scope="row" class="px-6 py-3 font-medium">-</th>
                            <th
                                id="student-grade"
                                scope="row"
                                class="px-6 py-3 font-medium"
                                contenteditable="true"
                            >
                                -
                            </th>
                            <th id="absences" scope="row" class="px-6 py-3 font-medium">-</th>
                            <th id="remarks" scope="row" class="px-6 py-3 font-medium">-</th>
                        </tr>
                        <tr
                            v-for="(enrollment, index) in moduleEnrollmentArray"
                            class="bg-white border-b hover:bg-gray-300"
                        >
                            <th
                                id="student-id"
                                scope="row"
                                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                            >
                                {{ enrollment.student.student_id }}
                            </th>
                            <th id="name" scope="row" class="px-6 py-3 font-medium">
                                {{
                                    formatName(
                                        enrollment.student.last_name,
                                        enrollment.student.first_name
                                    )
                                }}
                            </th>
                            <th>
                                <input
                                    @change="editGrade(enrollment.grade, index)"
                                    v-model="moduleEnrollmentArray[index].grade"
                                    :disabled="!editMode"
                                    id="student-grade"
                                    scope="row"
                                    class="bg-inherit font-medium text-gray-500 text-xl text-center"
                                />
                                <div class="input-errors" v-if="errors.grades[parseInt(index)]">
                                    <div class="block mb-2 text-sm font-medium text-highlight">
                                        {{ errors.grades[parseInt(index)] }}
                                    </div>
                                </div>
                            </th>
                            <th>
                                <input
                                    @change="editAbsences(enrollment.no_of_absences, index)"
                                    v-model="moduleEnrollmentArray[index].no_of_absences"
                                    :disabled="!editMode"
                                    id="absences"
                                    scope="row"
                                    class="bg-inherit font-medium text-gray-500 text-xl text-center"
                                />
                                <div class="input-errors" v-if="errors.absences[parseInt(index)]">
                                    <div class="block mb-2 text-sm font-medium text-highlight">
                                        {{ errors.absences[parseInt(index)] }}
                                    </div>
                                </div>
                            </th>
                            <th>
                                <input
                                    @change="editRemarks(index)"
                                    v-model="moduleEnrollmentArray[index].remarks"
                                    :disabled="!editMode"
                                    id="remarks"
                                    scope="row"
                                    class="bg-inherit font-medium text-gray-500 text-xl text-center"
                                    :placeholder="formatText(enrollment.remarks)"
                                />
                            </th>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <br />
        <button
            class="ml-auto mb-1 w-21 h-12 px-10 py-3 text-base font-medium text-center text-white bg-highlight rounded-lg hover:bg-highlight_hover"
            @click="exportData()"
        >
            Export Data
        </button>
    </div>

    <!-- DOWNLOAD -->
    <a id="download" :hidden="true" :download="moduleName + '-' + schoolYear"></a>

    <MessagePopup
        v-if="currentPopup === 'invalid-inputs'"
        title="Invalid Inputs."
        description="Please follow the form guides."
        exit-text="Close"
        @on-exit="currentPopup = null"
    />

    <PromptPopup
        v-if="currentPopup === 'confirmation'"
        title="Are You Sure You Want to Save Changes?"
        description="Please review your changes before saving."
        confirm-text="Yes, I'm sure"
        exit-text="No, cancel"
        @on-confirm="updateEnrollments()"
        @on-exit="currentPopup = null"
    />

    <PromptPopup
        v-if="currentPopup === 'cancel'"
        title="Are You Sure You Want to Discard Changes?"
        description="This action cannot be undone."
        confirm-text="Yes, I'm sure"
        exit-text="No, cancel"
        @on-confirm="cancelChanges()"
        @on-exit="currentPopup = null"
    />

    <MessagePopup
        v-if="currentPopup === 'success'"
        title="Updated Student Records!"
        description="Student records have been successfully updated."
        accepted="true"
        exit-text="Close"
        @on-exit="currentPopup = null"
    />

    <MessagePopup
        v-if="currentPopup === 'error'"
        title="Something went wrong."
        description="Please try again."
        exit-text="Close"
        @on-exit="currentPopup = null"
    />

    <MessagePopup
        v-if="currentPopup === 'editing-error'"
        title="You are still in edit mode."
        description="Please exit edit mode before trying again."
        exit-text="Close"
        @on-exit="currentPopup = null"
    />

    <MessagePopup
        v-if="currentPopup === 'empty-array-error'"
        title="There is nothing to export."
        description="There are no student records available for exporting."
        exit-text="Close"
        @on-exit="currentPopup = null"
    />
</template>

<script>
export default {
    data() {
        return {
            // Render
            render: false,
            // Mode
            editMode: false,
            // Data
            moduleEnrollmentArray: null,
            changedIndices: [],
            backupEnrollmentsArray: [],
            // Errors
            errors: {
                grades: {},
                absences: {},
            },
            // Popups
            currentPopup: null,
        };
    },
    methods: {
        // Get info of a module
        async getModuleEnrollments() {
            await this.$axios
                .get(`/module_enrollments/enrollments/${this.moduleName}/${this.schoolYear}`)
                // If successful
                .then(({ data }) => {
                    // Store data
                    this.moduleEnrollmentArray = data;
                })
                // If unsuccessful
                .catch((error) => {
                    console.log(error);
                });
        },
        switchToEditMode() {
            this.editMode = true;
            this.backupEnrollmentsArray = JSON.parse(JSON.stringify(this.moduleEnrollmentArray));
        },
        editGrade(grade, index) {
            const formattedGrade = parseFloat(grade).toFixed(2).toString();
            if (this.validateGrade(formattedGrade, index)) {
                this.moduleEnrollmentArray[index].grade = formattedGrade;
                addUnique(this.changedIndices, index);
            }
        },
        editAbsences(absences, index) {
            const formattedAbsences = parseFloat(absences).toFixed(0);
            if (this.validateAbsences(formattedAbsences, index)) {
                this.moduleEnrollmentArray[index].no_of_absences = formattedAbsences;
                addUnique(this.changedIndices, index);
            }
        },
        editRemarks(index) {
            addUnique(this.changedIndices, index);
        },
        cancelChanges() {
            this.editMode = false;
            this.moduleEnrollmentArray = JSON.parse(JSON.stringify(this.backupEnrollmentsArray));
            this.changedIndices = [];
            this.errors = {
                grades: {},
                absences: {},
            };
            this.currentPopup = null;
        },
        saveChanges() {
            if (this.validate()) {
                this.currentPopup = "confirmation";
            } else {
                this.currentPopup = "invalid-inputs";
            }
        },
        async updateEnrollments() {
            for (let index = 0; index < this.changedIndices.length; index++) {
                const value = this.changedIndices[index];
                await this.$axios
                    .patch(
                        `module_enrollments/grade/${this.moduleEnrollmentArray[value].student.student_id}/${this.moduleName}/${this.schoolYear}`,
                        {
                            grade: this.moduleEnrollmentArray[value].grade,
                            no_of_absences: this.moduleEnrollmentArray[value].no_of_absences,
                            remarks: this.moduleEnrollmentArray[value].remarks,
                        }
                    )
                    // If successful
                    .then(() => {
                        // Remove index from changedIndices
                        this.changedIndices.splice(index, 1);
                        // If last index
                        if (index === this.changedIndices.length - 1) {
                            // Get updated enrollments
                            this.getModuleEnrollments();
                        }
                    })
                    .then(() => {
                        this.currentPopup = "success";
                        this.editMode = false;
                    })
                    // If unsuccessful
                    .catch((error) => {
                        this.currentPopup = "error";
                        return;
                    });
            }
        },
        // Validators
        validate() {
            // Validate form for all enrollments added
            this.changedIndices.forEach((index) => {
                this.validateGrade(this.moduleEnrollmentArray[index].grade, index);
                this.validateAbsences(this.moduleEnrollmentArray[index].no_of_absences, index);
            });

            // Check if there are errors
            if (
                Object.keys(this.errors).every((key) => Object.keys(this.errors[key]).length === 0)
            ) {
                return true;
            } else {
                return false;
            }
        },
        validateGrade(grade, index) {
            const validGrades = [
                "1.00",
                "1.25",
                "1.50",
                "1.75",
                "2.00",
                "2.25",
                "2.50",
                "2.75",
                "3.00",
                "5.00",
                "INC",
            ];

            if (!validGrades.includes(grade)) {
                this.errors["grades"][parseInt(index)] =
                    "Invalid Grade Format! Valid Formats: [1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 5.00, INC]";
            } else {
                delete this.errors["grades"][parseInt(index)];
                return true;
            }
            return false;
        },
        validateAbsences(absences, index) {
            if (isNaN(absences)) {
                this.errors["absences"][parseInt(index)] = "Number of Absences must be a number!";
            } else if (absences < 0 || absences > 2) {
                this.errors["absences"][parseInt(index)] =
                    "Number of Absences must be between 0 and 2!";
            } else {
                delete this.errors["absences"][parseInt(index)];
                return true;
            }
            return false;
        },
        //Export
        exportData() {
            if (this.editMode) {
                this.currentPopup = "editing-error";
                return;
            }

            if (this.moduleEnrollmentArray?.length < 1) {
                this.currentPopup = "empty-array-error";
                return;
            }

            let csvData = "Student ID, Last Name, First Name, Middle Name, Grade, Absences\n";

            this.moduleEnrollmentArray.forEach((entry) => {
                csvData += `${entry.student.student_id}, ${entry.student.last_name}, ${entry.student.first_name}, ${entry.student.middle_name}, ${entry.grade}, ${entry.no_of_absences} \r\n`;
            });

            const csvContent = "data:text/csv;charset=utf-8," + csvData;
            const downloadElement = document.getElementById("download");

            downloadElement.setAttribute("href", encodeURI(csvContent));
            downloadElement.click();
        },
    },
    async created() {
        await this.getModuleEnrollments().then(() => {
            this.render = true;
        });
    },
};
</script>
