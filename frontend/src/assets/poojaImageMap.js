import annaprashanImg from './poojas/annaprashan-puja.jpg'
import bhoomiPujaImg from './poojas/Bhoomi Puja.jpeg'
import brihaspatiVratImg from './poojas/Brihaspati Vrat Udyapan Puja.jpeg'
import durgaPujaImg from './poojas/Durga Puja.jpeg'
import ekadasiVratImg from './poojas/Ekadashi Vrat Udyapan Puja.jpeg'
import engagementImg from './poojas/engagement-puja.webp'
import fixMuhuratImg from './poojas/Fix Your Muhurat.webp'
import gandMoolImg from './poojas/Gand Mool Nakshatra Shanti Puja.jpeg'
import ganapathiImg from './poojas/ganapathi-puja.jpg'
import godhBharaiImg from './poojas/Godh Bharai Puja (Baby Shower).jpeg'
import grahasShantiImg from './poojas/Graha Shanti Puja.jpeg'
import grihaPraveshImg from './poojas/Griha Pravesh Puja.jpeg'
import haldiCeremonyImg from './poojas/Haldi Ceremony.jpeg'
import janamdinImg from './poojas/Janamdin Puja - Birthday Puja.jpeg'
import kuberUpasanaImg from './poojas/Kuber Upasana Puja.jpeg'
import lakshmiImg from './poojas/lakshmi-puja-bangalore.jpg'
import lalithaSahasranamImg from './poojas/Lalitha Sahasranam Puja.jpeg'
import mundanImg from './poojas/mundan-puja.jpg'
import murtiPranPratishta from './poojas/Murti Pran Pratishta At Home.jpeg'
import namkaranImg from './poojas/namkaran-puja.jpg'
import newVehicleImg from './poojas/New Vehicle Puja.jpeg'
import officeImg from './poojas/office-puja.jpg'
import punsavanImg from './poojas/Punsavan Sanskar.jpeg'
import rokaCeremonyImg from './poojas/Roka Ceremony.jpeg'
import rudrabhishekImg from './poojas/Rudrabhishek Puja.jpeg'
import saraswatiImg from './poojas/saraswati-puja.jpg'
import satyanarayanImg from './poojas/satyanarayan-puja-bangalore.jpg'
import shuddhikaranImg from './poojas/Shuddhikaran Puja.jpeg'
import solahSomvarImg from './poojas/Solah Somvar Udyapan Puja.jpeg'
import suryaPujaImg from './poojas/Surya Puja.jpeg'
import vastuShantiImg from './poojas/Vastu Shanti Puja.jpeg'
import vidyarambhamImg from './poojas/Vidyarambham (Patti Pujan).webp'
import vishwakarmaImg from './poojas/vishwakarma-puja.jpg'
import vivahImg from './poojas/Vivah (Marriage).jpeg'
import yagnopavitImg from './poojas/Yagnopavit Sanskar.jpeg'
import fallbackImg from './poojas/puja-ceremony.jpg'

const poojaImageMap = {
	Aksharabhyasa: vidyarambhamImg,
	'Annaprashan Puja': annaprashanImg,
	'Annaprashan Pooja': annaprashanImg,
	'Annaprasana (Onnoprashon)': annaprashanImg,
	Annaprasana: annaprashanImg,
	'Onnoprashon (Mukhe Bhaat)': annaprashanImg,
	'Bhima Ratha Shanti (70th Birthday)': janamdinImg,
	'Bhoomi Puja': bhoomiPujaImg,
	'Brihaspati Vrat Udyapan': brihaspatiVratImg,
	'Brihaspati Vrat Udyapan Puja': brihaspatiVratImg,
	'Chaula or Chudakarma': mundanImg,
	'Devata Kalyanotsavam': murtiPranPratishta,
	'Durga Puja': durgaPujaImg,
	'Ekadashi Vrat Udyapan': ekadasiVratImg,
	'Ekadashi Vrat Udyapan Puja': ekadasiVratImg,
	'Engagement Puja': engagementImg,
	'Engagement Puja – Nirbandha': engagementImg,
	'Engagement Puja - Nirbandha': engagementImg,
	'Engagement Puja – Sagai': engagementImg,
	'Engagement Puja - Sagai': engagementImg,
	'Fix Your Muhurat': fixMuhuratImg,
	'Fix Your Muhurtha': fixMuhuratImg,
	'Gand Mool Nakshatra Shanti Puja': gandMoolImg,
	'Ganapathi Puja': ganapathiImg,
	'Ganesh Puja': ganapathiImg,
	'Ganpathi puja': ganapathiImg,
	'Godh Bharai (Baby Shower)': godhBharaiImg,
	'Godh Bharai Puja (Baby Shower)': godhBharaiImg,
	'Graha Shanti Puja': grahasShantiImg,
	'Griha Pravesh (Gruha Pratistha)': grihaPraveshImg,
	'Griha Pravesh': grihaPraveshImg,
	'Griho Probesh': grihaPraveshImg,
	'Gruhapravesha Pooja': grihaPraveshImg,
	'Haldi Ceremony': haldiCeremonyImg,
	'Janamdin Puja (Birthday Puja)': janamdinImg,
	'Janamdin Puja - Birthday Puja': janamdinImg,
	'Karna Vedhana': namkaranImg,
	'Janma Chuti Poka (Mundan)': mundanImg,
	'Mundan Or Chudakarana Ceremony': mundanImg,
	'Kuber Upasana Puja': kuberUpasanaImg,
	'Lakshmi Puja': lakshmiImg,
	'Laxmi Puja': lakshmiImg,
	'laxmi puja': lakshmiImg,
	'Mahalaxmi Puja': lakshmiImg,
	'Lalitha Sahasranam Puja': lalithaSahasranamImg,
	'Lalitha Sahasranamam Puja': lalithaSahasranamImg,
	Marriage: vivahImg,
	'Murti Pran Pratishta': murtiPranPratishta,
	'Murti Pran Pratishta At Home': murtiPranPratishta,
	'Murti Pran Pratistha At Home': murtiPranPratishta,
	'Namkaran (Ekoisia)': namkaranImg,
	'Namkaran Puja (Ekoisia)': namkaranImg,
	'Namkaran Puja': namkaranImg,
	'namkaran puja(ekosia)': namkaranImg,
	Namakarana: namkaranImg,
	'New Vehicle Puja': newVehicleImg,
	Nischitartha: engagementImg,
	'Office/Shop Opening Puja': officeImg,
	'Office Opening Puja': officeImg,
	'office/shop opening puja': officeImg,
	'Punsavan Sanskar': punsavanImg,
	'Roka Ceremony': rokaCeremonyImg,
	'Rudrabhishek Puja': rudrabhishekImg,
	'Saraswati Puja': saraswatiImg,
	'Sashtiapthapoorthi (60th Birthday)': janamdinImg,
	'Sathabhishekam (80th birthday)': janamdinImg,
	'Satyanarayan Puja': satyanarayanImg,
	Seemantha: punsavanImg,
	'Shuddhikaran Puja': shuddhikaranImg,
	'Solah Somvar Udyapan': solahSomvarImg,
	'Solah Somvar Udyapan Puja': solahSomvarImg,
	'Surya Puja': suryaPujaImg,
	Upakarma: yagnopavitImg,
	Upanayan: yagnopavitImg,
	Upanayana: yagnopavitImg,
	'Vastu Shanti Puja': vastuShantiImg,
	'Vidyarambham (Patti Pujan)': vidyarambhamImg,
	'Vishwakarma Puja': vishwakarmaImg,
	'Vivah (Marriage)': vivahImg,
	'Yagnopavit Sanskar (Bratabandha)': yagnopavitImg,
	'Yagnopavit Sanskar (Upanayan Sanskar)': yagnopavitImg,
	'Yagnopavit Sanskar': yagnopavitImg,
}

const normalizeTitle = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

const normalizedPoojaImageMap = Object.entries(poojaImageMap).reduce((acc, [title, image]) => {
	acc[normalizeTitle(title)] = image
	return acc
}, {})

export const getPoojaImage = (title, apiImage) =>
	poojaImageMap[title] || normalizedPoojaImageMap[normalizeTitle(title)] || apiImage || fallbackImg
