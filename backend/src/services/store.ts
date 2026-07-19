import { isDatabaseReady } from "../config/db";

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function toPlainObject(doc: any) {
  if (!doc) return null;
  if (typeof doc.toObject === "function") {
    return doc.toObject();
  }
  return cloneValue(doc);
}

export function createResourceStore<T extends { id?: string; _id?: string }>(model: any, seed: T[] = []) {
  let memory = cloneValue(seed);

  const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return {
    async list(filter: Record<string, any> = {}) {
      if (isDatabaseReady() && model) {
        const items = await model.find(filter).sort({ createdAt: -1 });
        return items.map(toPlainObject);
      }
      const entries = memory.filter((item) => {
        return Object.entries(filter).every(([key, value]) => item[key as keyof T] === value);
      });
      return cloneValue(entries);
    },

    async findById(id: string) {
      if (isDatabaseReady() && model) {
        const doc = await model.findOne({ $or: [{ id }, { _id: id }] });
        return toPlainObject(doc);
      }
      const found = memory.find((item) => item.id === id || item._id === id);
      return found ? cloneValue(found) : null;
    },

    async create(payload: T) {
      const record: any = cloneValue(payload);
      if (!record.id && !record._id) {
        record.id = generateId();
      }
      if (isDatabaseReady() && model) {
        const doc = await model.create(record);
        return toPlainObject(doc);
      }
      memory = [record, ...memory];
      return cloneValue(record);
    },

    async update(id: string, patch: Partial<T>) {
      if (isDatabaseReady() && model) {
        const doc = await model.findOneAndUpdate({ $or: [{ id }, { _id: id }] }, { ...patch }, { new: true, upsert: false });
        return toPlainObject(doc);
      }
      const index = memory.findIndex((item) => item.id === id || item._id === id);
      if (index === -1) return null;
      memory[index] = { ...(memory[index] as any), ...(patch as any) };
      return cloneValue(memory[index]);
    },

    async remove(id: string) {
      if (isDatabaseReady() && model) {
        const doc = await model.findOneAndDelete({ $or: [{ id }, { _id: id }] });
        return toPlainObject(doc);
      }
      const index = memory.findIndex((item) => item.id === id || item._id === id);
      if (index === -1) return null;
      const [removed] = memory.splice(index, 1);
      return cloneValue(removed);
    },

    async replaceAll(nextItems: T[]) {
      memory = cloneValue(nextItems);
      return cloneValue(memory);
    },
  };
}
