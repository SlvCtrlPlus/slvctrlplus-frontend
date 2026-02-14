import type {IntRangeDeviceAttribute, ListDeviceAttribute} from "@/model/devices/Device";

type StringKey<T> = Extract<keyof T, string>;

export const getTypedKeys = <T extends object>(obj: T): (StringKey<T>)[] => {
    return Object.keys(obj) as StringKey<T>[];
}

type RequiredKeys<T> = {
    [K in keyof T]-?: Exclude<T[K], undefined>
};

export function typedEntries<T extends object>(obj: T, removeUndefinedAttributes?: false): [keyof T, T[keyof T]][];
export function typedEntries<T extends object>(obj: T, removeUndefinedAttributes: true): Array<[keyof RequiredKeys<T>, RequiredKeys<T>[keyof RequiredKeys<T>]]>;
export function typedEntries<T extends object>(obj: T, removeUndefinedAttributes = false): [keyof T, T[keyof T]][] {
    const entries = Object.entries(obj) as [keyof T, T[keyof T]][];
    if (removeUndefinedAttributes) {
        return entries.filter(([, value]) => value !== undefined);
    }
    return entries;
}

export const isIntRangeDeviceAttribute = (obj: object): obj is IntRangeDeviceAttribute => {
    return hasType(obj, 'range');
}

export const isListDeviceAttribute = (obj: object): obj is ListDeviceAttribute<number | string, number | string> => {
    return hasType(obj, 'list');
}

export const hasType = (obj: unknown, expectedType: string): boolean => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        obj.hasOwnProperty('type') &&
        (obj as { type?: string }).type === expectedType
    );
}

export const hasProperty = <O extends object, P extends PropertyKey>(obj: O, prop: P): obj is O & Record<P, unknown> => {
    return obj != null && typeof obj === 'object' && prop in obj;
}
