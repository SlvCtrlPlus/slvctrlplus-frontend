import type Device from '../Device';
import type { BoolDeviceAttribute, StrDeviceAttribute } from '../Device';

export type DeviceAiroticAttributes = {
    restColor: StrDeviceAttribute,
    breathInColor: StrDeviceAttribute,
    resetColors: BoolDeviceAttribute,
    reboot: BoolDeviceAttribute,
};

export type DeviceAirotic = Device<DeviceAiroticAttributes>;
