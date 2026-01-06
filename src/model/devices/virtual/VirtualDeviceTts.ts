import type Device from "../Device";
import type { BoolDeviceAttribute, StrDeviceAttribute } from "../Device";

type VirtualDeviceTtsAttributes = {
  text: StrDeviceAttribute;
  queuing: BoolDeviceAttribute;
}

export type VirtualDeviceTts = Device<VirtualDeviceTtsAttributes>;
