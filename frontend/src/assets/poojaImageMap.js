import fallbackImg from './poojas/puja-ceremony.jpg'

export const getPoojaImage = (...args) => args[1] || fallbackImg
