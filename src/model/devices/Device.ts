type DeviceAttributes = Record<string, DeviceAttribute | undefined>

export type DeviceAttributeModifier = 'ro' | 'rw' | 'wo';
export type DeviceAttributeType = 'bool' | 'list' | 'str' | 'float' | 'int' | 'range';
export type DeviceAttributeValue = string | number | boolean | undefined;

export type DeviceData<D extends Device> = {
   [K in keyof D['attributes']]: D['attributes'][K] extends { value: infer V } ? V : never
};

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

export interface StrDeviceAttribute<V extends string|undefined = string|undefined> extends DeviceAttribute<V> {

}

export interface BoolDeviceAttribute<V extends boolean|undefined = boolean|undefined> extends DeviceAttribute<V> {

}

export interface ListDeviceAttribute<IKey extends number|string, IValue extends number|string> extends DeviceAttribute<IKey> {
   values: Record<IKey, IValue>;
}

export default interface Device<T extends DeviceAttributes = DeviceAttributes> {
   deviceId: string;
   deviceName: string;
   deviceModel: string;
   type: string;
   connectedSince: string;
   lastRefresh: string;
   receiveUpdates: boolean;
   attributes: T;
}
