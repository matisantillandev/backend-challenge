export default interface IsableMatch {
	isMatch(
		loginPass: string,
		userPass: string
	): Promise<Boolean>
}
