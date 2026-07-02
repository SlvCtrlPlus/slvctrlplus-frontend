import type { BoolDeviceAttribute, FloatDeviceAttribute, StrDeviceAttribute, WirelessDevice } from '../Device';

export type DeviceAiroticAttributes = {
    restColor: StrDeviceAttribute,
    breathInColor: StrDeviceAttribute,
    resetColors: BoolDeviceAttribute,
    reboot: BoolDeviceAttribute,
    breathsPerMin: FloatDeviceAttribute,
};

export type DeviceAirotic = WirelessDevice<DeviceAiroticAttributes>;
