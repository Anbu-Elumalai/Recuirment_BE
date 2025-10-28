import { Db, ObjectId } from "mongodb";
import History from "../../app/model/historyTrack";

class HistoryTracking {
  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  /**
   * Deep diff between old and new data
   */
  private deepDiff(
    oldData: any,
    newData: any,
    path: string[] = []
  ): Record<string, { oldValue: any; newValue: any }> {
    const changes: Record<string, { oldValue: any; newValue: any }> = {};

    // Primitives or nulls
    if (
      typeof oldData !== "object" ||
      typeof newData !== "object" ||
      oldData === null ||
      newData === null
    ) {
      if (JSON.stringify(oldData) !== JSON.stringify(newData)) {
        changes[path.join(".")] = { oldValue: oldData, newValue: newData };
      }
      return changes;
    }

    // Arrays
    if (Array.isArray(oldData) && Array.isArray(newData)) {
      if (JSON.stringify(oldData) !== JSON.stringify(newData)) {
        changes[path.join(".")] = { oldValue: oldData, newValue: newData };
      }
      return changes;
    }

    // Nested objects
    const keys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
    for (const key of keys) {
      Object.assign(
        changes,
        this.deepDiff(oldData[key], newData[key], [...path, key])
      );
    }

    return changes;
  }

  /**
   * Compare old and new data, and save changed fields into History
   */
  async tracking(
    modelName: string,
    id: string,
    updatedData: any,
    createdBy: string,
    groupingId: string
  ) {
    try {
      const existingDoc = await this.db
        .collection(modelName)
        .findOne({ _id: new ObjectId(id) });

      if (!existingDoc) return null;

      const diffs = this.deepDiff(existingDoc, updatedData);
      if (Object.keys(diffs).length === 0) return null; // no changes

      // Convert to array format for schema
      const changedFields = Object.entries(diffs).map(([field, values]) => ({
        field,
        oldValue: values.oldValue,
        newValue: values.newValue,
      }));

      // Save in History collection
      await History.create({
        modelName,
        modelId: id,
        changedFields,
        createdBy: new ObjectId(createdBy),
        groupingId: new ObjectId(groupingId),
      });

      return 
    } catch (error) {
      console.error("Error in tracking:", error);
    }
  }
}

export function newHistoryTrackRegister(db: Db) {
  return new HistoryTracking(db);
}
