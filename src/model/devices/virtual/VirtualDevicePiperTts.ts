import type Device from "../Device";
import type { BoolDeviceAttribute, StrDeviceAttribute } from "../Device";

type VirtualDevicePiperTtsAttributes = {
  text: StrDeviceAttribute;
  queuing: BoolDeviceAttribute;
}

export type VirtualDevicePiperTts = Device<VirtualDevicePiperTtsAttributes>;
