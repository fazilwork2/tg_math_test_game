import { UUIDV4 } from "sequelize";
import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "users" })
export class User extends Model {
  @Column({ type: DataType.UUID, defaultValue: UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.BIGINT, unique: true, field: "chat_id" })
  declare chat_id: number;

  @Column({ type: DataType.STRING, allowNull: false, field: "user_name" })
  declare userName: string;

  @Column({ type: DataType.INTEGER, allowNull: true, field: "last_answer" })
  declare lastAnswer: number | null;

  @Column({defaultValue:0})
  declare scrol:number
}
