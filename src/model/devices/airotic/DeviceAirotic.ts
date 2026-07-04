import type { BoolDeviceAttribute, FloatDeviceAttribute, StrDeviceAttribute, WirelessDevice } from '../Device';

export type DeviceAiroticAttributes = {
    restColor: StrDeviceAttribute,
    breathInColor: StrDeviceAttribute,
    resetColors: BoolDeviceAttribute,
    reboot: BoolDeviceAttribute,
    breathsPerMin: FloatDeviceAttribute,
    bpmTrend: StrDeviceAttribute<'up' | 'down' | 'stable' | undefined>,
};

export type DeviceAirotic = WirelessDevice<DeviceAiroticAttributes>;
