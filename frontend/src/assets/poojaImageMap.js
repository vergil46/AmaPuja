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
  'Engagement Puja – Nirbandha': engagementImg,
  'Engagement Puja - Nirbandha': engagementImg,
  'Ganapathi Puja': ganapathiImg,
  'Griha Pravesh (Gruha Pratistha)': grihaPraveshImg,
  'Janma Chuti Poka (Mundan)': mundanImg,
  'Lakshmi Puja': lakshmiImg,
  'Namkaran Puja (Ekoisia)': namkaranImg,
  'Office/Shop Opening Puja': officeImg,
  'Saraswati Puja': saraswatiImg,
  'Satyanarayan Puja': satyanarayanImg,
  'Vishwakarma Puja': vishwakarmaImg,
}

export const getPoojaImage = (title, apiImage) => poojaImageMap[title] || apiImage || fallbackImg
