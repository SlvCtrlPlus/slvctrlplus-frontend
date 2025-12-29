import type Device from "../Device";
import type { StrDeviceAttribute } from "../Device";

type VirtualDeviceDisplayAttributes = {
    content: StrDeviceAttribute;
}

export type VirtualDeviceDisplay = Device<VirtualDeviceDisplayAttributes>;
