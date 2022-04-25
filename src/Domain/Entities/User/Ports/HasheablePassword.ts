export default interface HashablePassword {
	hashPassword(
		pass: string
	): Promise<string>
}
