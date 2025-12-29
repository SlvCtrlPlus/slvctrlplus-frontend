<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useFullscreen, useWakeLock } from "@vueuse/core";
import {VirtualDeviceDisplay} from "@/model/devices/virtual/VirtualDeviceDisplay";

type TimerId = ReturnType<typeof setTimeout>;

interface Props {
  device: VirtualDeviceDisplay;
}

const props = defineProps<Props>();

const displayHtml = computed(() => {
  if (undefined === props.device.attributes.content.value) {
    return "";
  }
  return props.device.attributes.content.value;
});

const fullscreenElement = ref<HTMLElement | null>(null);

const { isFullscreen, toggle } = useFullscreen(fullscreenElement);
const icon = computed<string>(() =>
  isFullscreen.value ? "mdi-fullscreen-exit" : "mdi-fullscreen"
);

// useWakeLock
const {
  isSupported,
  isActive,
  request: requestWakeLock,
  release: releaseWakeLock,
} = useWakeLock();

watch(isFullscreen, (newVal) => {
  if (!newVal && isActive.value) {
    console.log(`Release wake lock because fullscreen was exited (esc key)`);
    releaseWakeLock();
  }
  updateCursorVisibility();
});

const toggleFullscreen = (toggle: () => Promise<void>) => {
  if (!fullscreenElement.value) {
    return;
  }

  if (isFullscreen.value) {
    // Exit fullscreen and release wake lock
    console.log(`Exit fullscreen and release wake lock`);
    toggle();
    if (isActive.value) {
      releaseWakeLock();
    }
  } else {
    // Enter fullscreen and request wake lock
    console.log(`Enter fullscreen and request wake lock`);
    toggle();
    if (isSupported.value) {
      requestWakeLock('screen');
    } else {
      console.warn("Wake Lock API is not supported on this browser.");
    }
  }
};

const CONTROLS_HIDE_DELAY = 1500; // 5 seconds
const controlsVisible = ref<boolean>(false);
const controlsCurrentlyHovered = ref<boolean>(false);
const isMouseInWrapper = ref<boolean>(false);
let hideControlsTimeout: TimerId | undefined = undefined;

function showControls(): void {
  if (!isMouseInWrapper.value) return;

  controlsVisible.value = true;
  clearTimeout(hideControlsTimeout);
  if (!controlsCurrentlyHovered.value) {
    hideControlsTimeout = setTimeout(hideControls, CONTROLS_HIDE_DELAY);
  }
  updateCursorVisibility();
}

// Add a new debounced function for resetting the hide timer:
const resetHideTimer = debounce((): void => {
  if (controlsVisible.value && !controlsCurrentlyHovered.value) {
    clearTimeout(hideControlsTimeout);
    hideControlsTimeout = setTimeout(hideControls, CONTROLS_HIDE_DELAY);
  }
}, 200);

function hideControls(): void {
  controlsVisible.value = false;
  clearTimeout(hideControlsTimeout);
  updateCursorVisibility();
}

function onWrapperMouseEnter(): void {
  if (isMouseInWrapper.value) {
    return;
  }

  isMouseInWrapper.value = true;
  showControls();
}

function onWrapperMouseLeave(): void {
  isMouseInWrapper.value = false;
  hideControls();
}

function onWrapperMouseMove(): void {
  showControls();
  resetHideTimer();
}

function onControlsMouseEnter(): void {
  controlsCurrentlyHovered.value = true;
  clearTimeout(hideControlsTimeout);
  updateCursorVisibility();
}

function onControlsMouseLeave() {
  controlsCurrentlyHovered.value = false;
  if (isMouseInWrapper.value) {
    hideControlsTimeout = setTimeout(hideControls, CONTROLS_HIDE_DELAY);
  } else {
    hideControls();
  }
}

function updateCursorVisibility() {
  if (!fullscreenElement.value) {
    return;
  }

  if (
    isFullscreen.value &&
    !controlsVisible.value &&
    !controlsCurrentlyHovered.value
  ) {
    fullscreenElement.value.style.cursor = "none";
  } else {
    fullscreenElement.value.style.cursor = "auto";
  }
}

function debounce<T extends unknown[]>(
  func: (...args: T) => void,
  wait: number
) {
  let timeout: TimerId | undefined;
  return function executedFunction(...args: T) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
</script>

<template>
  <div
    class="wrapper"
    ref="fullscreenElement"
    @pointerenter="onWrapperMouseEnter"
    @pointerleave="onWrapperMouseLeave"
    @pointermove="onWrapperMouseMove"
  >
    <div
      class="display content text-h4 bg-grey-darken-3"
      v-html="displayHtml"
    />
    <div
      v-show="controlsVisible || controlsCurrentlyHovered"
      class="controls"
      @mouseenter="onControlsMouseEnter"
      @mouseleave="onControlsMouseLeave"
    >
      <v-icon
        class="fullscreen-toggle"
        title="view in full screen"
        @click="toggleFullscreen(toggle)"
        >{{ icon }}</v-icon
      >
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  height: 100%;
  position: relative;
}

.wrapper .controls {
  position: absolute;
  bottom: 0;
}

.controls {
  background: rgba(0, 0, 0, 0.5);
  padding: 0.5em;
  width: 100%;
}

.display {
  display: flex;
  height: 100%;
  min-height: 250px;
  padding: 0;
}

.display:-webkit-full-screen,
.display:-moz-full-screen,
.display:-ms-fullscreen,
.display:fullscreen {
  width: 100%;
  height: 100%;
}

.fullscreen-toggle {
  cursor: pointer;
}
</style>
