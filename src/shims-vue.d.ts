declare module '*.vue';
declare module '*.js';
import type { AppSocket } from '@/types/socket';

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $socket: AppSocket;
  }
}
