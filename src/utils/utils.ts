import type {BoolDeviceAttribute, FloatDeviceAttribute, IntDeviceAttribute, IntRangeDeviceAttribute, ListDeviceAttribute, StrDeviceAttribute} from '@/model/devices/Device';

type StringKey<T> = Extract<keyof T, string>;

export const getTypedKeys = <T extends object>(obj: T): (StringKey<T>)[] => {
    return Object.keys(obj) as StringKey<T>[];
}


export const deepMergeReactive = <T extends object>(target: T, source: Partial<T>): void => {
    for (const key of getTypedKeys(source)) {
        const sourceVal = source[key];
        const targetVal = target[key];

        if (Array.isArray(sourceVal)) {
            // Replace arrays entirely (not deep merge)
            (target as { [K in keyof T]: T[K] })[key] = sourceVal as T[typeof key];
        } else if (
            sourceVal &&
            typeof sourceVal === 'object' &&
            !Array.isArray(sourceVal) &&
            targetVal &&
            typeof targetVal === 'object' &&
            !Array.isArray(targetVal)
        ) {
            deepMergeReactive(targetVal, sourceVal as Partial<typeof targetVal>);
        } else if (sourceVal !== undefined) {
            (target as { [K in keyof T]: T[K] })[key] = sourceVal as T[typeof key];
        }
    }
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

export const isStringDeviceAttribute = (obj: object): obj is StrDeviceAttribute => {
    return hasType(obj, 'str') || hasType(obj, 'float') || hasType(obj, 'int');
}

export const isIntDeviceAttribute = (obj: object): obj is IntDeviceAttribute => {
    return hasType(obj, 'int');
}

export const isFloatDeviceAttribute = (obj: object): obj is FloatDeviceAttribute => {
    return hasType(obj, 'float');
}

export const isBoolDeviceAttribute = (obj: object): obj is BoolDeviceAttribute => {
    return hasType(obj, 'bool');
}

export const hasType = (obj: unknown, expectedType: string): boolean => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        obj.hasOwnProperty('type') &&
        (obj as { type?: string }).type === expectedType
    );
}
