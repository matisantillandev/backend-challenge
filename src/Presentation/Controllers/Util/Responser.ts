import { injectable } from "inversify";
import Responseable from "@Presentation/Controllers/Responseable";

@injectable()
export default class Responser implements Responseable {
	public res: { 
		result: any
		message: string
		status: number
		error: any
	}
}
