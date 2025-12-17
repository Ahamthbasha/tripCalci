import { Model, Document } from "mongoose";
import { IGenericRepo } from "./interface/IGenericRepo";

export class GenericRepo<T extends Document> implements IGenericRepo<T> {
  constructor(private model: Model<T>) {}

  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id);
  }

  async findOne(filter: Partial<T>): Promise<T | null> {
    return await this.model.findOne(filter as any);
  }

  async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data);
    return await document.save();
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return result !== null;
  }

  async findAll(filter?: Partial<T>): Promise<T[]> {
    return await this.model.find((filter as any) || {});
  }
}