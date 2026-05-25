<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  modelValue: string | number | undefined;
  type?: 'text' | 'number';
  disabled?: boolean;
  debounceMs?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  debounceMs: 200,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const localValue = ref<string | number | undefined>(props.modelValue);
const isActive = ref<boolean>(false);
let debounceTimer: number | undefined;

watch(
  () => props.modelValue,
  (newValue) => {
    if (!isActive.value) {
      localValue.value = newValue;
    }
  }
);

const emitValue = (value: string | number): void => {
  emit('update:modelValue', value);
};

const handleValueChange = (value: string | number): void => {
  localValue.value = value;

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  if (props.debounceMs === 0) {
    emitValue(value);
    return;
  }

  debounceTimer = window.setTimeout(() => {
    emitValue(value);
    debounceTimer = undefined;
  }, props.debounceMs);
};

const handleStart = (): void => {
  isActive.value = true;
};

const handleEnd = (): void => {
  setTimeout(() => {
    isActive.value = false;
  }, 100);
};
</script>

<template>
  <v-text-field
    :model-value="localValue"
    :type="props.type"
    @update:modelValue="value => value !== null ? handleValueChange(value) : undefined"
    @focus="handleStart"
    @blur="handleEnd"
    :disabled="disabled"
  ></v-text-field>
</template>
