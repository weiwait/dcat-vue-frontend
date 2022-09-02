<script setup lang="ts">
import {inject} from "vue";
import {NNotificationProvider, NConfigProvider, zhCN, dateZhCN} from 'naive-ui'

const provides = inject('provides')!

</script>

<template>
    <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
        <n-notification-provider>
            <component :is="provides.component"></component>
        </n-notification-provider>
    </n-config-provider>
</template>
