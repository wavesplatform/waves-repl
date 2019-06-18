import { TList, TPrimitive, TStruct, TStructField, TType, TUnion } from '@waves/ride-js';

export const isPrimitive = (item: TType): item is TPrimitive => typeof item === 'string';
export const isStruct = (item: TType): item is TStruct => typeof item === 'object' && 'typeName' in item;
export const isList = (item: TType): item is TList => typeof item === 'object' && 'listOf' in item;
export const isUnion = (item: TType): item is TUnion => Array.isArray(item);

export const getTypeDoc = (item: TStructField, isRec?: Boolean): string => {
    const type = item.type;
    let typeDoc = 'Unknown';
    try {
        switch (true) {
            case isPrimitive(type):
                typeDoc = type as string;
                break;
            case isStruct(type):
                typeDoc = isRec ? (type as TStruct).typeName :
                    `${(type as TStruct).typeName}{` + (type as TStruct).fields
                        .map((v) => `${v.name}: ${getTypeDoc(v, true)}`).join(', ') + '}';
                break;
            case isUnion(type):
                console.log(type);
                typeDoc = isRec
                    ? (type as TUnion).map(field => isStruct(field) ? field.typeName : field).join('|')
                    : (type as TUnion).map(field => isStruct(field) ? getTypeDoc({
                        name: field.typeName,
                        type: field
                    }) : field).join(' | ');

                break;
            case isList(type):
                typeDoc = `LIST[ ${((type as TList).listOf as TStruct).typeName || (type as TList).listOf}]`;
                break;
        }
    }catch (e) {
    }
    return typeDoc;
};

