<script setup lang="ts">
import {inject} from "vue";
import {NNotificationProvider} from 'naive-ui'

const provides = inject('provides')!

</script>

<template>
    <n-notification-provider>
        <component :is="provides.component"></component>
    </n-notification-provider>
</template>
