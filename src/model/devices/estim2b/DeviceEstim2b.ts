import type Device from "../Device";
import type {
    BoolDeviceAttribute,
    IntRangeDeviceAttribute,
    ListDeviceAttribute,
    StrDeviceAttribute
} from "../Device";

export type PowerLevelDeviceEStim2bAttributes = {
    channelALevel: IntRangeDeviceAttribute,
    channelBLevel: IntRangeDeviceAttribute,
};

export type PatternDeviceEStim2bAttributes = {
    pulseFrequency: IntRangeDeviceAttribute,
    pulsePwm?: IntRangeDeviceAttribute,
};

export type DeviceEstim2bAttributes = {
    mode: ListDeviceAttribute<number, string>,
    channelsJoined: BoolDeviceAttribute,
    highPowerMode: BoolDeviceAttribute,
    batteryStatus: StrDeviceAttribute,
} & PowerLevelDeviceEStim2bAttributes & PatternDeviceEStim2bAttributes;

export type DeviceEstim2b = Device<DeviceEstim2bAttributes>;
