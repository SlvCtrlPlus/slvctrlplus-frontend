<script setup lang="ts">
import { ref, watch } from 'vue';
import type {IntRangeDeviceAttribute} from "@/model/devices/Device";

interface Props {
  modelValue: number|undefined;
  attribute: IntRangeDeviceAttribute;
  disabled?: boolean;
  sliderDebounce?: number;
  inputDebounce?: number;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  sliderDebounce: 50,
  inputDebounce: 100
});

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

const localValue = ref<number|undefined>(props.modelValue);
const isActive = ref<boolean>(false);
let debounceTimer: number | undefined;

watch(() => props.modelValue, (newValue) => {
  if (!isActive.value) {
    localValue.value = undefined !== newValue ? newValue : props.attribute.min;
  }
});

const handleValueChange = (value: number, debounceMs: number): void => {
  localValue.value = value;

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  if (debounceMs === 0) {
    emit('update:modelValue', value);
  } else {
    debounceTimer = window.setTimeout(() => {
      emit('update:modelValue', value);
      debounceTimer = undefined;
    }, debounceMs);
  }
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
  <v-slider
      v-model="localValue"
      @update:modelValue="value => handleValueChange(value, sliderDebounce)"
      @start="handleStart"
      @end="handleEnd"
      :min="props.attribute.min"
      :max="props.attribute.max"
      :step="props.attribute.incrementStep ?? 1"
      color="primary"
      hide-details
      :disabled="disabled"
  >
    <template v-slot:append>
      <v-text-field
          v-model="localValue"
          @update:modelValue="value => handleValueChange(parseInt(value), inputDebounce)"
          @focus="handleStart"
          @blur="handleEnd"
          hide-details
          single-line
          :min="props.attribute.min"
          :max="props.attribute.max"
          density="compact"
          variant="outlined"
          type="number"
          style="width: 80px"
          :disabled="disabled"
      ></v-text-field>
    </template>
  </v-slider>
</template>
