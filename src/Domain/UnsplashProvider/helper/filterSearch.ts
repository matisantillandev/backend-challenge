export const filterSearch = (list: any[], match: {}) => {
	const keys = Object.keys(match)
	const values = Object.values(match)

	for (let i = 0; i <= keys.length; i++) {
		return list.filter((item) => item[keys[i]] == values[i])
	}
}
