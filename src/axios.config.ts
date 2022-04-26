import axios from 'axios'

export const axiosConfig = axios.create({
	baseURL: 'https://api.unsplash.com/',
	headers: {
		Authorization: 'Client-ID ' + process.env.UNSPLASH_ACCESS_KEY,
	},
})
