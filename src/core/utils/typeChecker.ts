import { TList, TPrimitive, TStruct, TType, TUnion } from '@waves/ride-js';

export const isPrimitive = (item: TType): item is TPrimitive => typeof item === 'string';
export const isStruct = (item: TType): item is TStruct => typeof item === 'object' && 'typeName' in item;
export const isList = (item: TType): item is TList => typeof item === 'object' && 'listOf' in item;
export const isUnion = (item: TType): item is TUnion => Array.isArray(item);

export const getTypeDoc = (name: string, type: TType, isRec?: Boolean): string => {
    let typeDoc = 'Unknown';
    try {
        switch (true) {
            case isPrimitive(type):
                typeDoc = type as string;
                break;
            case isStruct(type):
                typeDoc = isRec ? name || 'object' :
                    `${name}{` + (type as TStruct).fields
                        .map((v) => `${v.name}: ${getTypeDoc(v.name, v.type, true)}`).join(', ') + '}';
                break;
            case isUnion(type):
                typeDoc = (type as TUnion).map(field => isStruct(field)
                    ? getTypeDoc(field.typeName, field, isRec)
                    : getTypeDoc('', field, isRec)
                ).join(' | ');

                break;
            case isList(type):
                typeDoc = `LIST[ ${((type as TList).listOf as TStruct).typeName || (type as TList).listOf}]`;
                break;
        }
    } catch (e) {
        console.log(e);
    }
    return typeDoc;
};
