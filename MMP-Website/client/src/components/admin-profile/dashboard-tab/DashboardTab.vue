<script setup>
import FacultyTable from "./FacultyTable.vue";
import TranscriptTable from "./TranscriptTable.vue";
import StudentsTable from "./StudentsTable.vue";
import EnrollmentsTable from "./EnrollmentsTable.vue";
</script>

<template>
    <div class="w-full">
        <h1 class="text-4xl font-bold mb-4">Dashboard</h1>
        <h2 class="text-2xl font-semibold mb-4">Faculty</h2>
        <div class="grid">
            <FacultyTable />
        </div>
        <br /><br />
        <h2 class="text-2xl font-semibold mb-4">Students</h2>
        <div class="grid">
            <StudentsTable @delete="refreshToggle = !refreshToggle" />
        </div>
        <br /><br />
        <h2 class="text-2xl font-semibold mb-4">Transcript</h2>
        <div class="grid">
            <TranscriptTable :refresh-toggle="refreshToggle" />
        </div>
        <br /><br />
        <h2 class="text-2xl font-semibold mb-4">Enrollments</h2>
        <div class="grid">
            <EnrollmentsTable />
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            refreshToggle: true,
        };
    },
};
</script>
