export type SerializablePrimitive = string | number | boolean | null | undefined;
export type SerializableArray = Array<SerializablePrimitive | SerializableRecord | SerializableArray>;
export type SerializableRecord = {
    [field: string]: SerializablePrimitive | SerializableArray | SerializableRecord;
};
export type Serializable = SerializablePrimitive | SerializableRecord | SerializableArray;
