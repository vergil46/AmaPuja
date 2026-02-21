import annaprashanImg from './poojas/annaprashan-puja.jpg'
import engagementImg from './poojas/engagement-puja-optimized.webp'
import ganapathiImg from './poojas/ganapathi-puja.jpg'
import grihaPraveshImg from './poojas/griha-pravesh.jpg'
import lakshmiImg from './poojas/lakshmi-puja.jpg'
import mundanImg from './poojas/mundan-puja.jpg'
import namkaranImg from './poojas/namkaran-puja.jpg'
import officeImg from './poojas/office-puja.jpg'
import saraswatiImg from './poojas/saraswati-puja.jpg'
import satyanarayanImg from './poojas/satyanarayan-puja.jpg'
import vishwakarmaImg from './poojas/vishwakarma-puja.jpg'
import fallbackImg from './poojas/puja-ceremony.jpg'

const poojaImageMap = {
  'Annaprashan Puja': annaprashanImg,
  Annaprasana: annaprashanImg,
  'Onnoprashon (Mukhe Bhaat)': annaprashanImg,
  'Engagement Puja – Nirbandha': engagementImg,
  'Engagement Puja - Nirbandha': engagementImg,
  'Engagement Puja - Sagai': engagementImg,
  'Ganapathi Puja': ganapathiImg,
  'Ganesh Puja': ganapathiImg,
  'Griha Pravesh (Gruha Pratistha)': grihaPraveshImg,
  'Griha Pravesh': grihaPraveshImg,
  'Gruhapravesha Pooja': grihaPraveshImg,
  'Janma Chuti Poka (Mundan)': mundanImg,
  'Mundan Or Chudakarana Ceremony': mundanImg,
  'Lakshmi Puja': lakshmiImg,
  'Laxmi Puja': lakshmiImg,
  'Mahalaxmi Puja': lakshmiImg,
  'Namkaran Puja (Ekoisia)': namkaranImg,
  'Namkaran Puja': namkaranImg,
  Namakarana: namkaranImg,
  'Office/Shop Opening Puja': officeImg,
  'Office Opening Puja': officeImg,
  'Saraswati Puja': saraswatiImg,
  'Satyanarayan Puja': satyanarayanImg,
  'Vishwakarma Puja': vishwakarmaImg,
}

const normalizeTitle = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

const normalizedPoojaImageMap = Object.entries(poojaImageMap).reduce((acc, [title, image]) => {
  acc[normalizeTitle(title)] = image
  return acc
}, {})

export const getPoojaImage = (title, apiImage) =>
  poojaImageMap[title] || normalizedPoojaImageMap[normalizeTitle(title)] || apiImage || fallbackImg
