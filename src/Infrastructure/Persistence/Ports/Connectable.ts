import { connect } from "mongoose";

export default interface Connectable {
	connect(database: string): Promise<void>
}
