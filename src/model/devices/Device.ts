export type DeviceAttributes = Record<string, DeviceAttribute | undefined>;

export type DeviceAttributeModifier = 'ro' | 'rw' | 'wo';
export type DeviceAttributeType = 'bool' | 'list' | 'str' | 'float' | 'int' | 'range';
export type DeviceAttributeValue = string | number | boolean | undefined;

export type DeviceStatus = 'READY' | 'BUSY' | 'ERROR';

export type DeviceError = {
   reason: string;
   occurredAt: Date;
}

export interface DeviceAttribute<V extends DeviceAttributeValue = DeviceAttributeValue> {
   name: string;
   label?: string;
   type: DeviceAttributeType;
   modifier: DeviceAttributeModifier;
   value: V;
}

export interface IntDeviceAttribute<V extends number|undefined = number|undefined> extends DeviceAttribute<V> {
   uom?: string;
}

export interface IntRangeDeviceAttribute<V extends number|undefined = number|undefined> extends IntDeviceAttribute<V> {
   min: number;
   max: number;
   incrementStep: number;
}

export type StrDeviceAttribute<V extends string|undefined = string|undefined> = DeviceAttribute<V>;

export type BoolDeviceAttribute<V extends boolean|undefined = boolean|undefined> = DeviceAttribute<V>;

export interface ListDeviceAttribute<IKey extends number|string, IValue extends number|string> extends DeviceAttribute<IKey> {
   values: { key: IKey, value: IValue }[];
}

export default interface Device<T extends DeviceAttributes = DeviceAttributes> {
   deviceId: string;
   deviceName: string;
   deviceModel: string;
   type: string;
   state: DeviceStatus;
   errorInfo: DeviceError | undefined;
   connectedSince: string;
   lastRefresh: string;
   receiveUpdates: boolean;
   attributes: T;
}
