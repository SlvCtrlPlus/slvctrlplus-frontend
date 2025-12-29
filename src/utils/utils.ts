import type {IntRangeDeviceAttribute, ListDeviceAttribute} from "@/model/devices/Device";

type StringKey<T> = Extract<keyof T, string>;

export const getTypedKeys = <T extends object>(obj: T): (StringKey<T>)[] => {
    return Object.keys(obj) as StringKey<T>[];
}

export const typedEntries = <T extends object>(obj: T): [keyof T, T[keyof T]][] => {
    return Object.entries(obj) as [keyof T, T[keyof T]][];
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
