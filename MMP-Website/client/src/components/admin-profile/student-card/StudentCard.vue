<script setup>
// Components
import ModulePaymentsTable from "./ModulePaymentsTable.vue";
import LoadingSpinner from "../../common/LoadingSpinner.vue";
// Popups
import MessagePopup from "../../common/MessagePopup.vue";
import PromptPopup from "../../common/PromptPopup.vue";
import PaymentInputPopup from "../../common/PaymentInputPopup.vue";
import EditPaymentPopup from "../../common/EditPaymentPopup.vue";
// Helpers
import { formatEnum, downloadCSV, downloadZIP, duplicate } from "../../../util/helpers";
// Props
defineProps({
    studentId: String,
});
// Emits
defineEmits(["on-back"]);
</script>

<template>
    <LoadingSpinner v-if="!render" />
    <div v-else class="grid w-full">
        <button
            @click="$emit('on-back')"
            type="button"
            class="mr-auto mb-1 w-21 h-12 px-10 py-3 text-base font-medium text-center text-white bg-highlight rounded-lg hover:bg-highlight_hover"
        >
            Back
        </button>
        <div class="md:flex justify-between">
            <h1 class="text-4xl font-bold mb-4">Student Information</h1>
            <div class="grid">
                <button
                    v-if="!editMode"
                    @click="switchToEditMode()"
                    type="button"
                    class="ml-auto mb-1 w-21 h-12 px-10 py-3 text-base font-medium text-center text-white bg-highlight rounded-lg hover:bg-highlight_hover"
                >
                    Edit
                </button>
            </div>
            <div v-if="editMode" class="ml-auto grid grid-cols-2 gap-2">
                <button
                    @click="currentPopup = 'cancel'"
                    type="button"
                    class="mb-1 w-21 h-12 px-4 md:px-10 py-3 text-sm font-medium text-center text-white bg-highlight rounded-lg hover:bg-highlight_hover"
                >
                    Cancel
                </button>
                <button
                    @click="saveChanges()"
                    type="button"
                    class="md:ml-10 mb-1 w-30 h-12 px-4 md:px-10 py-3 text-sm font-medium text-center text-white bg-highlight rounded-lg hover:bg-highlight_hover"
                >
                    Save Changes
                </button>
            </div>
        </div>
        <div
            class="w-full bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 px-7 py-5 mb-5 overflow-x-auto"
        >
            <h2 class="text-2xl font-semibold mb-5">Personal Information</h2>
            <div class="w-full grid lg:grid-cols-2 lg:gap-10">
                <div class="grid md:grid-cols-3">
                    <div class="mb-6">
                        <div class="block mb-1 font-medium text-gray-900 dark:text-white">
                            First Name
                        </div>
                        <input
                            type="text"
                            v-model="student.first_name"
                            :disabled="!editMode"
                            placeholder="First Name"
                            :class="{
                                '-m-2 border-0': !editMode,
                                'border-gray-200 shadow-sm': editMode,
                            }"
                            class="bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                            autocomplete="off"
                        />
                        <div class="input-errors" v-if="errors.first_name">
                            <div class="block mb-2 text-sm font-medium text-highlight">
                                {{ errors.first_name }}
                            </div>
                        </div>
                    </div>
                    <div class="mb-6">
                        <div class="block mb-1 font-medium text-gray-900 dark:text-white">
                            Middle Name
                        </div>
                        <input
                            type="text"
                            v-model="student.middle_name"
                            :disabled="!editMode"
                            placeholder="Middle Name"
                            :class="{
                                '-m-2 border-0': !editMode,
                                'border-gray-200 shadow-sm': editMode,
                            }"
                            class="bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                            autocomplete="off"
                        />
                        <div class="input-errors" v-if="errors.middle_name">
                            <div class="block mb-2 text-sm font-medium text-highlight">
                                {{ errors.middle_name }}
                            </div>
                        </div>
                    </div>
                    <div class="mb-6">
                        <div class="block mb-1 font-medium text-gray-900 dark:text-white">
                            Last Name
                        </div>
                        <input
                            type="text"
                            v-model="student.last_name"
                            :disabled="!editMode"
                            placeholder="Last Name"
                            :class="{
                                '-m-2 border-0': !editMode,
                                'border-gray-200 shadow-sm': editMode,
                            }"
                            class="bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                            autocomplete="off"
                        />
                        <div class="input-errors" v-if="errors.last_name">
                            <div class="block mb-2 text-sm font-medium text-highlight">
                                {{ errors.last_name }}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mb-6">
                    <div class="block mb-1 font-medium text-gray-900 dark:text-white">Address</div>
                    <input
                        type="text"
                        v-model="student.address"
                        :disabled="!editMode"
                        placeholder="Address"
                        :class="{
                            '-m-2 border-0': !editMode,
                            'border-gray-200 shadow-sm': editMode,
                        }"
                        class="bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        autocomplete="off"
                    />
                    <div class="input-errors" v-if="errors.address">
                        <div class="block mb-2 text-sm font-medium text-highlight">
                            {{ errors.address }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="grid md:grid-cols-3">
                <div class="mb-6">
                    <div class="block mb-1 font-medium text-gray-900 dark:text-white">
                        Date of Birth
                    </div>
                    <input
                        type="date"
                        :value="new Date(student.birthdate).toJSON().substring(0, 10)"
                        @input="student.birthdate = new Date($event.target.value)"
                        :disabled="!editMode"
                        :class="{
                            '-m-2 border-0': !editMode,
                            'border-gray-200 shadow-sm': editMode,
                        }"
                        class="bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    />
                    <div class="input-errors" v-if="errors.birthdate">
                        <div class="block mb-2 text-sm font-medium text-highlight">
                            {{ errors.birthdate }}
                        </div>
                    </div>
                </div>
                <div class="mb-6">
                    <div class="block mb-1 font-medium text-gray-900 dark:text-white">
                        Place of Birth
                    </div>
                    <input
                        type="text"
                        v-model="student.birthplace"
                        :disabled="!editMode"
                        placeholder="Birthplace"
                        :class="{
                            '-m-2 border-0': !editMode,
                            'border-gray-200 shadow-sm': editMode,
                        }"
                        class="bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        autocomplete="off"
                    />
                    <div class="input-errors" v-if="errors.birthplace">
                        <div class="block mb-2 text-sm font-medium text-highlight">
                            {{ errors.birthplace }}
                        </div>
                    </div>
                </div>
                <div class="mb-6">
                    <div class="block mb-1 font-medium text-gray-900 dark:text-white">
                        Nationality
                    </div>
                    <input
                        type="text"
                        v-model="student.nationality"
                        :disabled="!editMode"
                        placeholder="Nationality"
                        :class="{
                            '-m-2 border-0': !editMode,
                            'border-gray-200 shadow-sm': editMode,
                        }"
                        class="bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        autocomplete="off"
                    />
                    <div class="input-errors" v-if="errors.nationality">
                        <div class="block mb-2 text-sm font-medium text-highlight">
                            {{ errors.nationality }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="grid md:grid-cols-3">
                <div class="mb-6">
                    <div class="block mb-1 font-medium text-gray-900 dark:text-white">Gender</div>
                    <p v-if="!editMode" class="block text-sm">{{ formatEnum(student.gender) }}</p>
                    <select
                        v-if="editMode"
                        v-model="student.gender"
                        :disabled="!editMode"
                        class="shadow-sm bg-gray-100 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHERS">Others</option>
                    </select>
                    <div class="input-errors" v-if="errors.gender">
                        <div class="block mb-2 text-sm font-medium text-highlight">
                            {{ errors.gender }}
                        </div>
                    </div>
                </div>
                <div class="mb-6">
                    <div class="block mb-1 font-medium text-gray-900 dark:text-white">
                        Civil Status
                    </div>
                    <p v-if="!editMode" class="block text-sm">
                        {{ formatEnum(student.civil_status) }}
                    </p>
                    <select
                        v-if="editMode"
                        v-model="student.civil_status"
                        :disabled="!editMode"
                        class="shadow-sm bg-gray-100 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    >
                        <option value="SINGLE">Single</option>
                        <option value="MARRIED">Married</option>
                        <option value="WIDOWED">Widowed</option>
                        <option value="ANNULLED">Annulled</option>
                    </select>
                    <div class="input-errors" v-if="errors.civil_status">
                        <div class="block mb-2 text-sm font-medium text-highlight">
                            {{ errors.civil_status }}
                        </div>
                    </div>
                </div>
                <div class="mb-6">
                    <div class="block mb-1 font-medium text-gray-900 dark:text-white">
                        No. of Children
                    </div>
                    <input
                        type="number"
                        v-model="student.no_of_children"
                        :disabled="!editMode"
                        placeholder="Number of Children"
                        :class="{
                            '-m-2 border-0': !editMode,
                            'border-gray-200 shadow-sm': editMode,
                        }"
                        class="bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        autocomplete="off"
                    />
                    <div class="input-errors" v-if="errors.no_of_children">
                        <div class="block mb-2 text-sm font-medium text-highlight">
                            {{ errors.no_of_children }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="grid md:grid-cols-3">
                <div class="mb-6">
                    <div class="block mb-1 font-medium text-gray-900 dark:text-white">School</div>
                    <input
                        type="text"
                        v-model="student.school"
                        :disabled="!editMode"
                        placeholder="School"
                        :class="{
                            '-m-2 border-0': !editMode,
                            'border-gray-200 shadow-sm': editMode,
                        }"
                        class="bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        autocomplete="off"
                    />
                    <div class="input-errors" v-if="errors.school">
                        <div class="block mb-2 text-sm font-medium text-highlight">
                            {{ errors.school }}
                        </div>
                    </div>
                </div>
                <div class="mb-6">
                    <div class="block mb-1 font-medium text-gray-900 dark:text-white">Admin</div>
                    <input
                        type="text"
                        v-model="student.admin"
                        :disabled="!editMode"
                        placeholder="Admin"
                        :class="{
                            '-m-2 border-0': !editMode,
                            'border-gray-200 shadow-sm': editMode,
                        }"
                        class="bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        autocomplete="off"
                    />
                    <div class="input-errors" v-if="errors.admin">
                        <div class="block mb-2 text-sm font-medium text-highlight">
                            {{ errors.admin }}
                        </div>
                    </div>
                </div>
                <div class="mb-6">
                    <div class="flex">
                        <input
                            type="checkbox"
                            v-model="student.is_partner_school"
                            :disabled="!editMode"
                            class="mr-2 mt-1 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <div class="block mb-1 font-medium text-gray-900 dark:text-white">
                            Partner School or Organization of MMP
                        </div>
                    </div>
                    <div class="input-errors" v-if="errors.is_partner_school">
                        <div class="block mb-2 text-sm font-medium text-highlight">
                            {{ errors.is_partner_school }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="mb-6">
                <div class="block mb-1 font-medium text-gray-900 dark:text-white">Occupation</div>
                <input
                    type="text"
                    v-model="student.occupation"
                    :disabled="!editMode"
                    placeholder="Occupation"
                    :class="{
                        '-m-2 border-0': !editMode,
                        'border-gray-200 shadow-sm': editMode,
                    }"
                    class="bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    autocomplete="off"
                />
                <div class="input-errors" v-if="errors.occupation">
                    <div class="block mb-2 text-sm font-medium text-highlight">
                        {{ errors.occupation }}
                    </div>
                </div>
            </div>
            <div class="grid md:grid-cols-2">
                <div class="mb-6">
                    <div class="block mb-1 font-medium text-gray-900 dark:text-white">Church</div>
                    <input
                        type="text"
                        v-model="student.church"
                        :disabled="!editMode"
                        placeholder="Church"
                        :class="{
                            '-m-2 border-0': !editMode,
                            'border-gray-200 shadow-sm': editMode,
                        }"
                        class="bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        autocomplete="off"
                    />
                    <div class="input-errors" v-if="errors.church">
                        <div class="block mb-2 text-sm font-medium text-highlight">
                            {{ errors.church }}
                        </div>
                    </div>
                </div>
                <div class="mb-6">
                    <div class="block mb-1 font-medium text-gray-900 dark:text-white">Pastor</div>
                    <input
                        type="text"
                        v-model="student.pastor"
                        :disabled="!editMode"
                        placeholder="Pastor"
                        :class="{
                            '-m-2 border-0': !editMode,
                            'border-gray-200 shadow-sm': editMode,
                        }"
                        class="bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        autocomplete="off"
                    />
                    <div class="input-errors" v-if="errors.pastor">
                        <div class="block mb-2 text-sm font-medium text-highlight">
                            {{ errors.pastor }}
                        </div>
                    </div>
                </div>
            </div>
            <h5 class="text-lg font-medium mb-1">Educational Attainment</h5>
            <div class="grid xl:grid-cols-4">
                <div class="mb-6">
                    <div class="block mb-1 font-medium text-gray-900 dark:text-white">
                        High School
                    </div>
                    <input
                        type="text"
                        v-model="student.highschool"
                        :disabled="!editMode"
                        placeholder="High School"
                        :class="{
                            '-m-2 border-0': !editMode,
                            'border-gray-200 shadow-sm': editMode,
                        }"
                        class="bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        autocomplete="off"
                    />
                    <div class="input-errors" v-if="errors.highschool">
                        <div class="block mb-2 text-sm font-medium text-highlight">
                            {{ errors.highschool }}
                        </div>
                    </div>
                </div>
                <div class="mb-6">
                    <div class="block mb-1 font-medium text-gray-900 dark:text-white">
                        College School
                    </div>
                    <input
                        type="text"
                        v-model="student.college"
                        :disabled="!editMode"
                        placeholder="College School"
                        :class="{
                            '-m-2 border-0': !editMode,
                            'border-gray-200 shadow-sm': editMode,
                        }"
                        class="bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        autocomplete="off"
                    />
                    <div class="input-errors" v-if="errors.college">
                        <div class="block mb-2 text-sm font-medium text-highlight">
                            {{ errors.college }}
                        </div>
                    </div>
                </div>
                <div class="mb-6">
                    <div class="block mb-1 font-medium text-gray-900 dark:text-white">
                        College Course
                    </div>
                    <input
                        type="text"
                        v-model="student.college_course"
                        :disabled="!editMode"
                        placeholder="College Course"
                        :class="{
                            '-m-2 border-0': !editMode,
                            'border-gray-200 shadow-sm': editMode,
                        }"
                        class="bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        autocomplete="off"
                    />
                    <div class="input-errors" v-if="errors.college_course">
                        <div class="block mb-2 text-sm font-medium text-highlight">
                            {{ errors.college_course }}
                        </div>
                    </div>
                </div>
                <div class="mb-6">
                    <div class="block mb-1 font-medium text-gray-900 dark:text-white">
                        Graduate School
                    </div>
                    <input
                        type="text"
                        v-model="student.graduate"
                        :disabled="!editMode"
                        placeholder="Graduate School"
                        :class="{
                            '-m-2 border-0': !editMode,
                            'border-gray-200 shadow-sm': editMode,
                        }"
                        class="bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        autocomplete="off"
                    />
                    <div class="input-errors" v-if="errors.graduate">
                        <div class="block mb-2 text-sm font-medium text-highlight">
                            {{ errors.graduate }}
                        </div>
                    </div>
                </div>
                <div class="mb-6">
                    <div class="block mb-1 font-medium text-gray-900 dark:text-white">
                        Graduate Course
                    </div>
                    <input
                        type="text"
                        v-model="student.graduate_course"
                        :disabled="!editMode"
                        placeholder="Graduate Course"
                        :class="{
                            '-m-2 border-0': !editMode,
                            'border-gray-200 shadow-sm': editMode,
                        }"
                        class="bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        autocomplete="off"
                    />
                    <div class="input-errors" v-if="errors.graduate_course">
                        <div class="block mb-2 text-sm font-medium text-highlight">
                            {{ errors.graduate_course }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div
            class="w-full bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 px-7 py-5 mb-5"
        >
            <h2 class="text-2xl font-semibold mb-5">Contact Details</h2>
            <div class="grid xl:grid-cols-3">
                <div class="mb-6">
                    <div class="block mb-1 font-medium text-gray-900 dark:text-white">
                        Mobile Number
                    </div>
                    <input
                        type="text"
                        v-model="student.mobile_number"
                        :disabled="!editMode"
                        placeholder="Mobile Number"
                        :class="{
                            '-m-2 border-0': !editMode,
                            'border-gray-200 shadow-sm': editMode,
                        }"
                        class="bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        autocomplete="off"
                    />
                    <div class="input-errors" v-if="errors.mobile_number">
                        <div class="block mb-2 text-sm font-medium text-highlight">
                            {{ errors.mobile_number }}
                        </div>
                    </div>
                </div>
                <div class="mb-6">
                    <div class="block mb-1 font-medium text-gray-900 dark:text-white">Landline</div>
                    <input
                        type="number"
                        v-model="student.landline"
                        :disabled="!editMode"
                        placeholder="Landline"
                        :class="{
                            '-m-2 border-0': !editMode,
                            'border-gray-200 shadow-sm': editMode,
                        }"
                        class="bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        autocomplete="off"
                    />
                    <div class="input-errors" v-if="errors.landline">
                        <div class="block mb-2 text-sm font-medium text-highlight">
                            {{ errors.landline }}
                        </div>
                    </div>
                </div>
                <div class="mb-6">
                    <div class="block mb-1 font-medium text-gray-900 dark:text-white">Email</div>
                    <input
                        type="text"
                        v-model="student.email"
                        :disabled="!editMode"
                        placeholder="Email"
                        :class="{
                            '-m-2 border-0': !editMode,
                            'border-gray-200 shadow-sm': editMode,
                        }"
                        class="bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        autocomplete="off"
                    />
                    <div class="input-errors" v-if="errors.email">
                        <div class="block mb-2 text-sm font-medium text-highlight">
                            {{ errors.email }}
                        </div>
                    </div>
                </div>
            </div>
            <h4 class="text-lg font-medium mb-1">Emergency Contact</h4>
            <div class="grid xl:grid-cols-3">
                <div class="mb-6">
                    <div class="block mb-1 font-medium text-gray-900 dark:text-white">Name</div>
                    <input
                        type="text"
                        v-model="student.emergency_name"
                        :disabled="!editMode"
                        placeholder="Emergency Name"
                        :class="{
                            '-m-2 border-0': !editMode,
                            'border-gray-200 shadow-sm': editMode,
                        }"
                        class="bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        autocomplete="off"
                    />
                    <div class="input-errors" v-if="errors.emergency_name">
                        <div class="block mb-2 text-sm font-medium text-highlight">
                            {{ errors.emergency_name }}
                        </div>
                    </div>
                </div>
                <div class="mb-6">
                    <div class="block mb-1 font-medium text-gray-900 dark:text-white">Address</div>
                    <input
                        type="text"
                        v-model="student.emergency_address"
                        :disabled="!editMode"
                        placeholder="Emergency Address"
                        :class="{
                            '-m-2 border-0': !editMode,
                            'border-gray-200 shadow-sm': editMode,
                        }"
                        class="bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        autocomplete="off"
                    />
                    <div class="input-errors" v-if="errors.emergency_address">
                        <div class="block mb-2 text-sm font-medium text-highlight">
                            {{ errors.emergency_address }}
                        </div>
                    </div>
                </div>
                <div class="mb-6">
                    <div class="block mb-1 font-medium text-gray-900 dark:text-white">
                        Mobile Number
                    </div>
                    <input
                        type="string"
                        v-model="student.emergency_mobile_number"
                        :disabled="!editMode"
                        placeholder="Emergency Mobile Number"
                        :class="{
                            '-m-2 border-0': !editMode,
                            'border-gray-200 shadow-sm': editMode,
                        }"
                        class="bg-gray-100 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        autocomplete="off"
                    />
                    <div class="input-errors" v-if="errors.emergency_mobile_number">
                        <div class="block mb-2 text-sm font-medium text-highlight">
                            {{ errors.emergency_mobile_number }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div
            class="w-full bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 px-7 py-5 mb-5"
        >
            <h2 class="text-2xl font-semibold mb-1">Reason for Enrollment</h2>
            <div class="mb-5 mt-5">
                <textarea
                    id="message"
                    rows="10"
                    class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Write here..."
                    v-model="student.essay"
                    :disabled="!editMode"
                ></textarea>
                <div class="input-errors" v-if="errors.essay">
                    <div class="block mb-2 text-sm font-medium text-highlight">
                        {{ errors.essay }}
                    </div>
                </div>
            </div>
        </div>
        <div
            class="w-full bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 px-7 py-5 mb-5"
        >
            <h2 class="text-2xl font-semibold mb-1">Module Payments</h2>
            <div class="mb-5 mt-5 grid">
                <ModulePaymentsTable
                    :finance_info="finance_info"
                    :student_id="studentId"
                    @add-success="getBills()"
                    @delete-success="getBills()"
                />
                <div class="sm:flex sm:justify-center block mt-5">
                    <button
                        class="w-full sm:w-auto text-base font-medium text-center text-white bg-highlight rounded-lg hover:bg-highlight_hover px-4 py-2 sm:mx-6 my-5 sm:my-0"
                        @click="currentPopup = 'addPayment'"
                    >
                        Add Payment
                    </button>
                    <button
                        class="w-full sm:w-auto text-base font-medium text-center text-white bg-highlight rounded-lg hover:bg-highlight_hover px-4 py-2 sm:mx-6"
                        @click="editPayment()"
                    >
                        Edit Payment
                    </button>
                </div>
            </div>
        </div>
        <div
            class="w-full bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 px-7 py-5 mb-5"
        >
            <h2 class="text-2xl font-semibold mb-1">Download</h2>
            <div class="mb-5">
                <button
                    type="button"
                    @click="downloadStudentData()"
                    class="w-full sm:w-auto ml-auto mr-10 md:px-10 px-3 py-3 mt-5 text-base font-medium text-center text-white bg-highlight rounded-lg hover:bg-highlight_hover"
                >
                    Download All Data of Student (.csv)
                </button>
            </div>
        </div>
    </div>

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
        @on-confirm="updateStudent()"
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
        :accepted="true"
        exit-text="Close"
        @on-exit="currentPopup = null"
    />

    <PromptPopup
        v-if="currentPopup === 'delete-confirmation'"
        title="Are You Sure You Want to Delete This Payment?"
        description="Please make sure you want to delete this payment. This action cannot be undone."
        confirm-text="Yes, I'm sure"
        exit-text="No, cancel"
        @on-confirm="deletePayment(selectedPayment)"
        @on-exit="currentPopup = null"
    />

    <MessagePopup
        v-if="currentPopup === 'add'"
        title="Added Payment!"
        description="Payment has been successfully added."
        :accepted="true"
        exit-text="Close"
        @on-exit="currentPopup = null"
    />

    <MessagePopup
        v-if="currentPopup === 'edit'"
        title="Edited Payment!"
        description="Payment has been successfully edited."
        :accepted="true"
        exit-text="Close"
        @on-exit="currentPopup = null"
    />

    <MessagePopup
        v-if="currentPopup === 'delete'"
        title="Deleted Payment!"
        description="Payment has been successfully deleted."
        :accepted="true"
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

    <PaymentInputPopup
        v-if="currentPopup === 'addPayment'"
        :bills="bills"
        :student_id="studentId"
        @on-exit="currentPopup = null"
        @success="addSuccess()"
        @fail="currentPopup = 'error'"
    />

    <EditPaymentPopup
        v-if="currentPopup === 'editPayment'"
        :payments="payments"
        @on-exit="currentPopup = null"
        @success="editSuccess()"
        @delete="
            (or_no) => {
                selectedPayment = or_no;
                currentPopup = 'delete-confirmation';
            }
        "
        @fail="currentPopup = 'error'"
    />
</template>

<script>
// kayo na bahala i aint readin allat
export default {
    data() {
        return {
            // Render
            render: false,
            // Edit Mode
            editMode: false,
            // Student
            student: {},
            backupStudent: {},
            finance_info: {},
            selectedPayment: null,
            // Errors
            errors: {},
            // Popups
            currentPopup: null,
            //Data
            bills: null,
            payments: null,
        };
    },
    computed: {
        first_name() {
            return this.student.first_name;
        },
        last_name() {
            return this.student.last_name;
        },
        middle_name() {
            return this.student.middle_name;
        },
        email() {
            return this.student.email;
        },
        address() {
            return this.student.address;
        },
        mobile_number() {
            return this.student.mobile_number;
        },
        landline() {
            return this.student.landline;
        },
        birthdate() {
            return this.student.birthdate;
        },
        birthplace() {
            return this.student.birthplace;
        },
        nationality() {
            return this.student.nationality;
        },
        gender() {
            return this.student.gender;
        },
        civil_status() {
            return this.student.civil_status;
        },
        no_of_children() {
            return this.student.no_of_children;
        },
        occupation() {
            return this.student.occupation;
        },
        school() {
            return this.student.school;
        },
        admin() {
            return this.student.admin;
        },
        is_partner_school() {
            return this.student.is_partner_school;
        },
        church() {
            return this.student.church;
        },
        pastor() {
            return this.student.pastor;
        },
        gradeschool() {
            return this.student.gradeschool;
        },
        highschool() {
            return this.student.highschool;
        },
        college() {
            return this.student.college;
        },
        college_course() {
            return this.student.college_course;
        },
        graduate() {
            return this.student.graduate;
        },
        graduate_course() {
            return this.student.graduate_course;
        },
        others() {
            return this.student.others;
        },
        essay() {
            return this.student.essay;
        },
        emergency_name() {
            return this.student.emergency_name;
        },
        emergency_address() {
            return this.student.emergency_address;
        },
        emergency_mobile_number() {
            return this.student.emergency_mobile_number;
        },
        track() {
            return this.student.track;
        },
    },
    methods: {
        // Get student info
        async getStudentInfo() {
            await this.$axios
                .get(`/students/id/${this.studentId}`)
                .then(({ data }) => {
                    this.student = data;
                })
                .catch((error) => {
                    console.log(error);
                });

            await this.$axios
                .get(`/module_enrollments/balance/${this.studentId}`)
                .then(({ data }) => {
                    this.finance_info = data;
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        // update student's finance info
        async updateFinanceInfo() {
            await this.$axios
                .get(`/module_enrollments/balance/${this.studentId}`)
                .then(({ data }) => {
                    this.finance_info = data;
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        async addSuccess() {
            this.currentPopup = "add";
            await this.updateFinanceInfo();
        },
        async editSuccess() {
            this.currentPopup = "edit";
            await this.updateFinanceInfo();
        },
        switchToEditMode() {
            this.editMode = true;
            this.backupStudent = duplicate(this.student);
        },
        cancelChanges() {
            this.editMode = false;
            this.student = duplicate(this.backupStudent);
            this.errors = {};
            this.currentPopup = null;
        },
        saveChanges() {
            if (this.validate()) {
                this.currentPopup = "confirmation";
            } else {
                this.currentPopup = "invalid-inputs";
            }
        },
        // Delete payment based on OR number
        async deletePayment(or_no) {
            await this.$axios
                .delete(`/payments/${or_no}`)
                .then(() => {
                    this.currentPopup = "delete";
                })
                .catch((error) => {
                    this.currentPopup = "error";
                });
            await this.updateFinanceInfo();
        },
        async updateStudent() {
            // Set password to default
            this.student.password = "password";
            await this.$axios
                .patch(`/students/${this.studentId}`, this.student)
                // If successful
                .then(() => {
                    this.getStudentInfo();
                })
                .then(() => {
                    this.currentPopup = "success";
                    this.editMode = false;
                })
                // If unsuccessful
                .catch((error) => {
                    console.log(error);
                    this.currentPopup = "error";
                    return;
                });
        },
        async getBills() {
            this.bills = [];

            await this.updateFinanceInfo();

            this.finance_info.forEach((element) => {
                if (element.bill !== null) {
                    this.bills.push(element.bill);
                }
            });
        },
        async getPayments() {
            this.payments = [];

            await this.getBills();

            this.bills.forEach((element) => {
                if (element.payments.length > 0) {
                    element.payments.forEach((payment) => {
                        this.payments.push(payment);
                    });
                }
            });

            return this.payments;
        },
        async editPayment() {
            await this.getPayments();
            this.currentPopup = "editPayment";
        },
        // Download
        async downloadStudentData() {
            if (this.editMode) {
                this.currentPopup = "editing-error";
                return;
            }

            await this.$axios
                .get(`/download/student/${this.studentId}`)
                // If successful
                .then(({ data }) => {
                    downloadZIP(
                        data,
                        `${this.student.student_id} ${this.student.first_name} ${this.student.last_name} - Student Data.zip`
                    );
                })
                // If unsuccessful
                .catch((error) => {
                    console.log(error);
                });
        },
        // Validators
        validate() {
            // validate the student data and return true or false
            this.validateFirstName();
            this.validateLastName();
            this.validateMiddleName();
            this.validateEmail();
            this.validateTrack();
            this.validateAddress();
            this.validateMobileNumber();
            this.validateLandline();
            this.validateBirthdate();
            this.validateBirthplace();
            this.validateNationality();
            this.validateGender();
            this.validateCivilStatus();
            this.validateNoOfChildren();
            this.validateOccupation();
            this.validateSchool();
            this.validateAdmin();
            this.validateIsPartner();
            this.validateChurch();
            this.validatePastor();
            this.validateGradeschool();
            this.validateHighschool();
            this.validateCollege();
            this.validateGraduate();
            this.validateCollegeCourse();
            this.validateGraduateCourse();
            this.validateOthers();
            this.validateEssay();
            this.validateEmergencyName();
            this.validateEmergencyAddress();
            this.validateEmergencyNumber();

            if (Object.keys(this.errors).length === 0) { // if no errors, return true
                return true;
            } else {
                return false;
            }
        },
        validateFirstName() {
            if (/\d/.test(this.student.first_name)) {
                this.errors["first_name"] = "First name must not contain numbers!";
            } else if (this.student.first_name.length < 2 || this.student.first_name.length > 50) {
                this.errors["first_name"] = "First name must be between 2 and 50 characters!";
            } else {
                delete this.errors["first_name"];
            }
        },
        validateLastName() {
            if (/\d/.test(this.student.last_name)) {
                this.errors["last_name"] = "First name must not contain numbers!";
            } else if (this.student.last_name.length < 2 || this.student.last_name.length > 50) {
                this.errors["last_name"] = "Last name must be between 2 and 50 characters!";
            } else {
                delete this.errors["last_name"];
            }
        },
        validateMiddleName() {
            if (this.student.middle_name.length === 0) {
                delete this.errors["middle_name"];
                return;
            }
            if (/\d/.test(this.student.middle_name)) {
                this.errors["middle_name"] = "First name must not contain numbers!";
            } else if (
                this.student.middle_name.length < 2 ||
                this.student.middle_name.length > 50
            ) {
                this.errors["middle_name"] = "Middle name must be between 2 and 50 characters!";
            } else {
                delete this.errors["middle_name"];
            }
        },
        validateEmail() {
            const emailPattern =
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (emailPattern.test(this.student.email) === false) {
                this.errors["email"] = "Must be an email!";
            } else {
                delete this.errors["email"];
            }
        },
        validateAddress() {
            if (this.student.address.length < 2 || this.student.address.length > 150) {
                this.errors["address"] = "Address must be between 2 and 150 characters!";
            } else {
                delete this.errors["address"];
            }
        },
        validateMobileNumber() {
            const mobilePattern = /^09[0-9]{9}$/;
            if (mobilePattern.test(this.student.mobile_number) === false) {
                this.errors["mobile_number"] = "Must be a valid Philippine mobile number";
            } else {
                delete this.errors["mobile_number"];
            }
        },
        validateLandline() {
            const landlinePattern = /^[0-9]{8}$/;
            if (landlinePattern.test(this.student.landline) === false) {
                this.errors["landline"] = "Must be a valid landline number";
            } else {
                delete this.errors["landline"];
            }
        },
        validateBirthdate() {
            if (Date.parse(this.student.birthdate) === NaN) {
                this.errors["birthdate"] = "Must be a valid date";
            } else {
                delete this.errors["birthdate"];
            }
        },
        validateBirthplace() {
            if (this.student.birthplace.length < 2 || this.student.birthplace.length > 150) {
                this.errors["birthplace"] = "Birthplace must be between 2 and 150 characters!";
            } else {
                delete this.errors["birthplace"];
            }
        },
        validateNationality() {
            if (/\d/.test(this.student.nationality)) {
                this.errors["nationality"] = "First name must not contain numbers!";
            } else if (
                this.student.nationality.length < 2 ||
                this.student.nationality.length > 150
            ) {
                this.errors["nationality"] = "Nationality must be between 2 and 50 characters!";
            } else {
                delete this.errors["nationality"];
            }
        },
        validateGender() {
            if (!["MALE", "FEMALE", "OTHERS"].includes(this.student.gender)) {
                this.errors["gender"] = "Gender must be male, female, or others";
            } else {
                delete this.errors["gender"];
            }
        },
        validateCivilStatus() {
            if (!["SINGLE", "MARRIED", "WIDOWED", "ANNULLED"].includes(this.student.civil_status)) {
                this.errors["civil_status"] =
                    "Civil status must be single, married, widowed, or annulled";
            } else {
                delete this.errors["civil_status"];
            }
        },
        validateNoOfChildren() {
            // Check if is number
            if (isNaN(this.student.no_of_children)) {
                this.errors["no_of_children"] = "Number of children must be a number";
            } else if (this.student.no_of_children < 0 || this.student.no_of_children > 99) {
                this.errors["no_of_children"] = "Number of children must be between 0 and 99";
            } else {
                delete this.errors["no_of_children"];
            }
        },
        validateOccupation() {
            if (this.student.occupation.length < 2 || this.student.occupation.length > 30) {
                this.errors["occupation"] = "Occupation should be between 2 and 30 characters long";
            } else {
                delete this.errors["occupation"];
            }
        },
        validateSchool() {
            if (this.student.school.length < 2 || this.student.school.length > 30) {
                this.errors["school"] = "School name should be between 2 and 30 characters long";
            } else {
                delete this.errors["school"];
            }
        },
        validateAdmin() {
            if (/\d/.test(this.student.admin)) {
                this.errors["admin"] = "Admin name must not have numbers";
            } else if (this.student.admin.length < 2 || this.student.admin.length > 150) {
                this.errors["admin"] = "Admin name should be between 2 and 150 characters long";
            } else {
                delete this.errors["admin"];
            }
        },
        validateIsPartner() {
            if (
                this.student.is_partner_school !== true &&
                this.student.is_partner_school !== false
            ) {
                this.errors["is_partner_school"] = "Is partner school must be true or false";
            } else {
                delete this.errors["is_partner_school"];
            }
        },
        validateChurch() {
            if (this.student.church.length < 2 || this.student.church.length > 150) {
                this.errors["church"] = "Church should be between 2 and 150 characters long";
            } else {
                delete this.errors["church"];
            }
        },
        validatePastor() {
            if (/\d/.test(this.student.pastor)) {
                this.errors["pastor"] = "Pastor name must not have numbers";
            } else if (this.student.pastor.length < 2 || this.student.pastor.length > 150) {
                this.errors["pastor"] = "Pastor name should be between 2 and 150 characters long";
            } else {
                delete this.errors["pastor"];
            }
        },
        validateGradeschool() {
            if (this.student.gradeschool.length > 50) {
                this.errors["gradeschool"] =
                    "Gradeschool name should be less than 50 characters long";
                this.student.gradeschool_completed = false;
            } else {
                delete this.errors["gradeschool"];
                if (this.student.gradeschool.length > 0) {
                    this.student.gradeschool_completed = true;
                } else {
                    this.student.gradeschool_completed = false;
                }
            }
        },
        validateHighschool() {
            if (this.student.highschool.length === 0) {
                delete this.errors["highschool"];
                this.student.highschool_completed = false;
                return;
            }
            if (this.student.highschool.length > 50) {
                this.errors["highschool"] =
                    "Highschool name should be less than 50 characters long";
                this.student.highschool_completed = false;
            } else if (!this.student.gradeschool_completed) {
                this.errors["highschool"] = "Gradeschool name should be filled up";
                this.student.highschool_completed = false;
            } else {
                delete this.errors["highschool"];
                if (this.student.highschool.length > 0) {
                    this.student.highschool_completed = true;
                } else {
                    this.student.highschool_completed = false;
                }
            }
        },
        validateCollege() {
            if (this.student.college.length === 0) {
                delete this.errors["college"];
                this.student.college_completed = false;
                return;
            }
            if (this.student.college.length > 50) {
                this.errors["college"] = "College name should be less than 50 characters long";
                this.student.college_completed = false;
            } else if (!this.student.gradeschool_completed) {
                this.errors["college"] = "Gradeschool name should be filled up";
                this.student.college_completed = false;
            } else if (!this.student.highschool_completed) {
                this.errors["college"] = "Highschool name should be filled up";
                this.student.college_completed = false;
            } else if (
                this.student.college.length > 0 &&
                this.student.college_course.length === 0
            ) {
                this.errors["college_course"] = "Please put your college course";
                this.student.college_completed = false;
            } else {
                this.student.college_completed = true;
                delete this.errors["college"];
            }
        },
        validateCollegeCourse() {
            if (this.student.college.length === 0 && this.student.college_course.length === 0) {
                delete this.errors["college_course"];
                return;
            }
            if (this.student.college_course.length > 50) {
                this.errors["college_course"] =
                    "College course name should be less than 50 characters long";
            } else if (
                this.student.college_course.length > 0 &&
                this.student.college.length === 0
            ) {
                this.errors["college_course"] = "Please put your college name";
            } else {
                delete this.errors["college_course"];
            }
        },
        validateGraduate() {
            if (this.student.graduate.length === 0) {
                delete this.errors["graduate"];
                this.student.graduate_completed = false;
                return;
            }
            if (this.student.graduate.length > 50) {
                this.errors["graduate"] =
                    "Graduate school name should be less than 50 characters long";
                this.student.graduate_completed = false;
            } else if (!this.student.gradeschool_completed) {
                this.errors["graduate"] = "Gradeschool name should be filled up";
                this.student.graduate_completed = false;
            } else if (!this.student.highschool_completed) {
                this.errors["graduate"] = "Highschool name should be filled up";
                this.student.graduate_completed = false;
            } else if (!this.student.college_completed) {
                this.errors["graduate"] = "College name and course should be filled up";
                this.student.graduate_completed = false;
            } else if (
                this.student.graduate.length > 0 &&
                this.student.graduate_course.length === 0
            ) {
                this.errors["graduate_course"] = "Please put your graduate school course";
                this.student.graduate_completed = false;
            } else {
                delete this.errors["graduate"];
                this.student.graduate_completed = true;
            }
        },
        validateGraduateCourse() {
            if (this.student.graduate_course.length === 0 && this.student.graduate.length === 0) {
                delete this.errors["graduate_course"];
                return;
            }
            if (this.student.graduate_course.length > 50) {
                this.errors["graduate_course"] =
                    "Graduate course name should be less than 50 characters long";
            } else if (
                this.student.graduate.length > 0 &&
                this.student.graduate_course.length === 0
            ) {
                this.errors["graduate_course"] = "Please put your graduate school course";
            } else if (
                this.student.graduate_course.length > 0 &&
                this.student.graduate.length === 0
            ) {
                this.errors["graduate_course"] = "Please put your graduate school name";
            } else {
                delete this.errors["graduate_course"];
            }
        },
        validateTrack() {
            if (!["ADMIN", "TEACHER", "BOTH"].includes(this.student.track)) {
                this.errors["track"] = "Track must be admin, teacher, or both";
            } else {
                delete this.errors["track"];
            }
        },
        validateOthers() {
            if (this.student.others.length > 200) {
                this.errors["others"] = "Others should be less than 200 characters long";
            } else {
                delete this.errors["others"];
            }
        },
        validateEssay() {
            if (this.student.essay.length < 1) {
                this.errors["essay"] = "Essay is required";
            } else {
                delete this.errors["essay"];
            }
        },
        validateEmergencyName() {
            if (this.student.emergency_name.length > 150) {
                this.errors["emergency_name"] =
                    "Emergency name should be less than 150 characters long";
            } else if (/\d/.test(this.student.emergency_name)) {
                this.errors["emergency_name"] = "Emergency name should not have any numbers";
            } else if (this.student.emergency_name.length < 1) {
                this.errors["emergency_name"] = "Emergency name should not be empty";
            } else {
                delete this.errors["emergency_name"];
            }
        },
        validateEmergencyAddress() {
            if (this.student.emergency_address.length > 150) {
                this.errors["emergency_address"] =
                    "Emergency address should be less than 150 characters long";
            } else if (this.student.emergency_address.length < 1) {
                this.errors["emergency_address"] = "Emergency address should not be empty";
            } else {
                delete this.errors["emergency_address"];
            }
        },
        validateEmergencyNumber() {
            const mobilePattern = /^09[0-9]{9}$/;
            if (mobilePattern.test(this.student.emergency_mobile_number) === false) {
                this.errors["emergency_mobile_number"] = "Must be a valid Philippine mobile number";
            } else {
                delete this.errors["emergency_mobile_number"];
            }
        },
    },
    watch: {
        first_name() {
            this.validateFirstName();
        },
        last_name() {
            this.validateLastName();
        },
        middle_name() {
            this.validateMiddleName();
        },
        email() {
            this.validateEmail();
        },
        address() {
            this.validateAddress();
        },
        mobile_number() {
            this.validateMobileNumber();
        },
        landline() {
            this.validateLandline();
        },
        birthdate() {
            this.validateBirthdate();
        },
        birthplace() {
            this.validateBirthplace();
        },
        nationality() {
            this.validateNationality();
        },
        gender() {
            this.validateGender();
        },
        civil_status() {
            this.validateCivilStatus();
        },
        no_of_children() {
            this.validateNoOfChildren();
        },
        occupation() {
            this.validateOccupation();
        },
        school() {
            this.validateSchool();
        },
        admin() {
            this.validateAdmin();
        },
        is_partner_school() {
            this.validateIsPartner();
        },
        church() {
            this.validateChurch();
        },
        pastor() {
            this.validatePastor();
        },
        gradeschool() {
            this.validateGradeschool();
            this.validateHighschool();
            this.validateCollege();
            this.validateGraduate();
            this.validateCollegeCourse();
            this.validateGraduateCourse();
        },
        highschool() {
            this.validateGradeschool();
            this.validateHighschool();
            this.validateCollege();
            this.validateGraduate();
            this.validateCollegeCourse();
            this.validateGraduateCourse();
        },
        college() {
            this.validateGradeschool();
            this.validateHighschool();
            this.validateCollege();
            this.validateGraduate();
            this.validateCollegeCourse();
            this.validateGraduateCourse();
        },
        college_course() {
            this.validateCollege();
            this.validateCollegeCourse();
            this.validateGraduate();
            this.validateGraduateCourse();
        },
        graduate() {
            this.validateGradeschool();
            this.validateHighschool();
            this.validateCollege();
            this.validateGraduate();
            this.validateCollegeCourse();
            this.validateGraduateCourse();
        },
        graduate_course() {
            this.validateGraduate();
            this.validateGraduateCourse();
        },
        others() {
            this.validateOthers();
        },
        essay() {
            this.validateEssay();
        },
        emergency_name() {
            this.validateEmergencyName();
        },
        emergency_address() {
            this.validateEmergencyAddress();
        },
        emergency_mobile_number() {
            this.validateEmergencyNumber();
        },
        track() {
            this.validateTrack();
        },
    },
    async created() {
        await this.getStudentInfo().then(() => {
            this.render = true;
        });

        await this.getBills();
    },
};
</script>

<style scoped>
input {
    background-color: white;
}
</style>
