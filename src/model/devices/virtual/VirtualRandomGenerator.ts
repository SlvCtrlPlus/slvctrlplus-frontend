import type Device from "../Device";
import type { IntDeviceAttribute } from "../Device";

type VirtualDeviceRandomGeneratorAttributes = {
  value: IntDeviceAttribute;
}

export type VirtualDeviceRandomGenerator = Device<VirtualDeviceRandomGeneratorAttributes>;
