import type Device from "../Device";
import type { BoolDeviceAttribute, IntDeviceAttribute, StrDeviceAttribute } from "../Device";

type VirtualDeviceTtsAttributes = {
  text: StrDeviceAttribute;
  queuing: BoolDeviceAttribute;
  queueLength: IntDeviceAttribute;
  speaking: BoolDeviceAttribute;
}

export type VirtualDeviceTts = Device<VirtualDeviceTtsAttributes>;
