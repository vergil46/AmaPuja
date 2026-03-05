const fs = require('fs')
const path = require('path')

const structuredDataPath = path.join(__dirname, 'poojas-structured-data.js')
const poojas = require(structuredDataPath)

const commonHomeItemsNote =
	'Puja Samagries like Haldi, Abeer, Gulal, Mango leaves, Tulasi, Darba, Kalash, Beetle Leaves, Beetle Nuts, Havan Sticks, Samidha, Havan Kund, Dravyas, Kapda, Ghee etc. will be brought by us. Yajaman has to keep house items like Vessels, Oil Lamps, Mats, Bowls, Chowki, Plates, Prasad, Photos etc you will be receiving a detailed to do list after booking.'

const commonGrihaNote =
	'Puja Samagries like Haldi, Abeer, Gulal, Mango leaves, Tulasi, Darba, Kalasha, Vastra, Navadhanya, Beetle Leaves, Beetle Nuts, Homam Sticks, Samidha, Havan Kund, Dravyas, Kapda Ghee etc. will be brought by us. Yajaman has to keep house items like Gas stove, Vessels, Bhoji daan, Oil Lamps, Mats, Bowls, Chowki, Plates, Photos etc you will be receiving detailed to do list after booking.'

const updates = {
	annaprashan_puja: {
		title: 'Annaprashan Puja',
		description:
			'Annaprashan is the ceremony where the baby is introduced to solid foods preferably Sweet/Milk Rice for the first time. The puja is performed to bestow a very healthy and prosperous life for the baby.',
		packages: [
			{
				name: 'Standard',
				price: 4000,
				includesSamagri: true,
				pandits: '1 Panditji + All Puja Samagries',
				procedure: [
					'Ghata Sthapana',
					'Sankalpa',
					'Ganapathi Panchdevta Puja',
					'Matrugana Puja',
					'Havan',
					'Annaprashan',
					'Neivedhya',
					'Aarti',
					'Pushpanjali',
					'Bhojya daana',
				],
				inclusions: ['Dakshina', 'All Pooja Materials'],
				addOns: [
					{ name: 'Flowers & Fruits', price: 1000 },
					{ name: 'Satyanarayan Katha', price: 1700 },
				],
				note: commonHomeItemsNote,
			},
		],
	},
	engagement_puja: {
		title: 'Engagement Puja',
		description:
			'Engagement or Nirbandha is an occasion where there is a formal agreement to get married and families announce the same to society. It is also known as the betrothal ceremony, Sagai, Ring ceremony, Nishchitartham, Roka, Chunni, etc.',
		packages: [
			{
				name: 'Standard',
				price: 4000,
				includesSamagri: true,
				pandits: '1 Panditji + Puja Samagries',
				procedure: [
					'Ghata Sthapana',
					'Mangalastaka',
					'Ganapathi Panchdevta Puja',
					'Both Parents Sankalpa',
					'Pushpanjali',
					'Satya Patha',
					'Kanya Agamana',
					'Ring Exchange',
				],
				inclusions: ['Dakshina', 'All Puja Samagries'],
				addOns: [{ name: 'Flowers and Fruits', price: 1000 }],
			},
		],
	},
	ganapathi_puja: {
		title: 'Ganapathi Puja',
		description:
			'Ganapathi Puja is performed for Lord Ganapathi who removes all the obstacles and negative energies. This puja bestows a person with victory, brings harmony to the family, and helps to attain success in life.',
		packages: [
			{
				name: 'Standard',
				price: 5200,
				includesSamagri: true,
				pandits: '1 Panditji + Pooja Samagries',
				procedure: [
					'Ghata Sthapana',
					'Sankalpa',
					'Ganapathi Puja',
					'Panchdevata Puja',
					'Ganapathi Devata Avahan',
					'Bhog Neivedhya',
					'Aarti',
					'Pushpanjali',
					'Prasad Sevan',
				],
				inclusions: ['Dakshina', 'Puja Samagries'],
				addOns: [
					{ name: 'Flowers & Fruits', price: 1000 },
					{ name: 'Havan', price: 100 },
				],
			},
		],
	},
	griha_pravesh: {
		title: 'Griha Pravesh',
		description:
			'Griha Pravesh also known as Gruha Pratistha is the set of Pujas and rituals that are performed before a person starts to live in a new house. It is the process of cleansing the new house with Vedic mantras to make it peaceful and to live happily.',
		packages: [
			{
				name: 'Economy',
				price: 7200,
				includesSamagri: true,
				pandits: '1 Panditji + All Puja Samagries',
				description:
					'Basic Griha Pravesh Puja goes on for 1:30-2 hrs. Recommended for those looking for Simple, Short Puja or Puja for rented home.',
				procedure: [
					'Ghata sthapana',
					'Dwarapal Puja',
					'Surya puja',
					'Panchagavya Sinchana',
					'Ganapati Ghata Puja',
					'Navagraha Mandal Puja',
					'Durga Madhava Puja',
					'Naryana Lakshmivardhani Ghata Puja .',
					'Vrindavati Puja',
					'Vastu Puja',
					'Havan',
					'Gruha pravesh',
					'Aarti and Pushpanjali',
				],
				inclusions: ['Dakshina', 'All Puja Samagries'],
				addOns: [
					{ name: 'Flowers & Fruits', price: 1500 },
					{ name: 'Satyanarayan Katha', price: 1500 },
				],
				note: commonGrihaNote,
			},
			{
				name: 'Standard',
				price: 11000,
				includesSamagri: true,
				pandits: '2 Panditjis + All Puja Samagries',
				description:
					'In Standard Griha Pravesh Puja 1 main panditji and 1 assistant panditji will be there, More number of pujas will be performed and more number of mandals are drawn, total pooja goes on for 2:30- 3:00 hours.',
				procedure: [
					'Ghata sthapana',
					'Dwarapal Puja',
					'Guru Puja',
					'Surya puja',
					'Matru pitru Puja',
					'Purohit varan',
					'Saptadhanya Abhimantrita',
					'Panchagavya Sinchana',
					'Ganapati Ghata Puja',
					'Brahma Mandal Puja',
					'Savitri Puja',
					'Navagraha Mandal Puja',
					'Dashadikpal Mandal Puja',
					'Astadasha Matrika Puja',
					'Durga Madhava Puja',
					'Naryana Lakshmivardhani Ghata Puja.',
					'Vrindavati Puja',
					'Vastu Mandal Puja',
					'Vishwakarma Puja',
					'Havan',
					'Gruha pravesh',
					'Aarti and Pushpanjali',
				],
				inclusions: ['Dakshina', 'All Puja Samagries'],
				addOns: [
					{ name: 'Flowers & Fruits', price: 2000 },
					{ name: 'Satyanarayan Katha', price: 1500 },
				],
				note: commonGrihaNote,
			},
		],
	},
	janma_chuti_poka_mundan: {
		title: 'Janma Chuti Poka (Mundan)',
		description:
			'Mundan Ceremony is performed for the child, the hairs are shaved to signify freedom from the past and moving into the new life. Chudakarana is done to ensure the baby grows as a healthy and spiritual individual who is free from sins and also to attain the goodness of life.',
		packages: [
			{
				name: 'Standard',
				price: 3500,
				includesSamagri: true,
				pandits: '1 Panditji + Puja Samagri',
				procedure: [
					'Swastivachanam',
					'Sankalp',
					'Gauri Ganesh Puja',
					'Panchdevata Puja',
					'Chudakaran Puja',
					'Bhog Neivedhya',
					'Pushpanjali',
					'Prasad Sevan',
				],
				inclusions: ['Dakshina', 'All Puja Samagries'],
				addOns: [
					{ name: 'Fruits & Flowers', price: 1000 },
					{ name: 'Havan', price: 800 },
				],
			},
		],
	},
	lakshmi_puja: {
		title: 'Lakshmi Puja',
		description:
			'Lakshmi Puja is performed to gain, conserve the existing wealth, and also to achieve financial stability by appeasing Goddess Laxmi, the Goddess of wealth and prosperity.',
		packages: [
			{
				name: 'Standard',
				price: 4000,
				includesSamagri: true,
				pandits: '1 Panditji + Puja Samagries',
				procedure: [
					'Kaya Shudhi',
					'Ghata Sthapana',
					'Sankalpa',
					'Ganapathi Panchdevta Puja',
					'Brahama Savitri matrigana mandal Puja',
					'Narayan Vardhani Ghata Puja',
					'Lakshmi Ghata puja',
					'Neivedhya, Aarti',
					'Pushpanjali and Bhojyadana',
				],
				inclusions: ['Dakshina', 'All Puja Samagries'],
				addOns: [
					{ name: 'Flowers & Fruits', price: 1000 },
					{ name: 'Havan', price: 1000 },
				],
			},
		],
	},
	namkaran_puja_ekoisia: {
		title: 'Namkaran Puja (Ekoisia)',
		description:
			'Namkaran is the naming ceremony of the child, it is very important as it\'s the first ceremony of a child\'s life. Its also known as Ekoisia or Ekusia. Satyanarayan Katha and havan are performed for the well-being of the child to get all the blessings for a healthy and happy life.',
		packages: [
			{
				name: 'Standard',
				price: 5200,
				includesSamagri: true,
				pandits: '1 Panditji + All Puja Samagries',
				procedure: [
					'Ghata Sthapana',
					'Sankalpa',
					'Ganapathi Panchdevta Puja',
					'Navagraha Mandala Puja',
					'Narayan Puja',
					'Satyanarayan Katha',
					'Havan',
					'Neivedhya',
					'Aarti',
					'Pushpanjali',
					'Namakaran',
					'Bhojya daana',
				],
				inclusions: ['Dakshina', 'All Puja Samagries'],
				addOns: [{ name: 'Flowers & Fruits', price: 1000 }],
				note: commonHomeItemsNote,
			},
		],
	},
	office_opening_puja: {
		title: 'Office/Shop Opening Puja',
		description:
			'In the New building or Place, many negative dosh and effects exist. By performing Office Opening Puja, blessings of Lord Ganesha and Mata Lakshmi are invoked to negate the power or influence of negative energies and bring in success in the business.',
		packages: [
			{
				name: 'Standard',
				price: 4300,
				includesSamagri: true,
				pandits: '1 Panditji + All Pooja Samagries',
				procedure: [
					'Ganapathi Puja',
					'Lakshmi Puja',
					'Vastu Puja',
					'Vishnu Puja',
					'Navagraha Puja',
					'Dwarpal Puja',
					'Dasadikpal Puja',
					'Havan',
					'Pushpanjali',
					'Neivedhya',
					'Aarti',
					'Prasad Vitran',
				],
				inclusions: ['Dakshina', 'All Puja Samagries'],
				addOns: [{ name: 'Flowers & Fruits', price: 1000 }],
				note: commonHomeItemsNote,
			},
		],
	},
	saraswati_puja: {
		title: 'Saraswati Puja',
		description:
			'Mata Saraswati is the deity of intelligence, wisdom, arts, music, memory power, and other soft skills. This havan relieves people from mental pressure. It improves concentration, memory power, focus, and the ability to understand complex things.',
		packages: [
			{
				name: 'Standard',
				price: 4300,
				includesSamagri: true,
				pandits: '1 Panditji + Pooja Samagries',
				procedure: [
					'Ghata Sthapana',
					'Sankalpa',
					'Ganapathi Puja',
					'Panchdevata Puja',
					'Saraswati Devi Avahan',
					'Bhog Neivedhya',
					'Aarti',
					'Pushpanjali',
					'Prasad Sevan',
				],
				inclusions: ['Dakshina', 'Puja Samagries'],
				addOns: [
					{ name: 'Flowers & Fruits', price: 1000 },
					{ name: 'Havan', price: 1000 },
				],
			},
		],
	},
	satyanarayan_puja: {
		title: 'Satyanarayan Puja',
		description:
			'Satyanarayan Puja is performed to remove all the obstacles and negative energies and gives victory or success. It acquires wealth and prosperity and brings harmony to the family and success in life.',
		packages: [
			{
				name: 'Standard',
				price: 4000,
				includesSamagri: true,
				pandits: '1 Panditji + All Pooja Samagries',
				procedure: [
					'Ganapathi Puja',
					'Varun Puja',
					'Narayan Puja',
					'Pachdevta Puja',
					'Navagraha Puja',
					'Asthadasha Matrika Puja',
					'Satyanarayan Katha Shravan',
					'Havan',
					'Pushpanjali',
					'Neivedhya',
					'Aarti',
					'Prasad Vitran',
				],
				inclusions: ['Dakshina', 'All Puja Samagries'],
				addOns: [{ name: 'Flowers & Fruits', price: 1000 }],
				note:
					'Puja Samagries like Haldi, Abeer, Gulal, Mango leaves, Tulasi, Darba, Kalash, Beetle Leaves, Beetle Nuts, Havan Sticks, Samidha, Havan Kund, Dravyas, Kapda, Ghee etc. will be brought by us. Yajaman has to keep house items like Vessels, Oil Lamps, Mats, Bowls, Chowki, Plates, Prasad, Photos, Bhojya daan ( Raw Rice, dal, vegetable etc.) you will be receiving detailed to do list after booking.',
			},
		],
	},
	vishwakarma_puja: {
		title: 'Vishwakarma Puja',
		description:
			'Lord Vishwakarma is the chief deity of all architects and craftsmen also known as Devashilpi. This puja is performed to please Lord Vishwakarma and get his blessings for a happy and wealthy life.',
		packages: [
			{
				name: 'Standard',
				price: 4000,
				includesSamagri: true,
				pandits: '1 Panditji + Puja Samagries',
				procedure: [
					'Kaya Shudhi',
					'Ghata Sthapana',
					'Sankalpa',
					'Ganapathi Panchdevta Puja',
					'Narayan Vardhani Ghata Puja',
					'Vishwakarma puja',
					'Neivedhya, Aarti',
					'Pushpanjali and Bhojyadana',
				],
				inclusions: ['Dakshina', 'All Puja Samagries'],
				addOns: [
					{ name: 'Flowers & Fruits', price: 1000 },
					{ name: 'Havan', price: 1000 },
				],
			},
		],
	},
}

const summary = {
	updated: 0,
	missingKeys: [],
}

Object.entries(updates).forEach(([key, payload]) => {
	const target = poojas.find((item) => item.key === key)
	if (!target) {
		summary.missingKeys.push(key)
		return
	}

	target.availableLanguages = Array.from(new Set([...(target.availableLanguages || []), 'odia']))

	target.title = {
		odia: payload.title,
		hindi: target.title?.hindi || '',
		kannada: target.title?.kannada || '',
		bengali: target.title?.bengali || '',
	}

	target.description = {
		odia: {
			short: payload.description,
			full: payload.description,
		},
		hindi: target.description?.hindi || { short: '', full: '' },
		kannada: target.description?.kannada || { short: '', full: '' },
		bengali: target.description?.bengali || { short: '', full: '' },
	}

	target.pricing = {
		odia: {
			packages: payload.packages,
			addOns: [],
		},
		hindi: target.pricing?.hindi || { packages: [], addOns: [] },
		kannada: target.pricing?.kannada || { packages: [], addOns: [] },
		bengali: target.pricing?.bengali || { packages: [], addOns: [] },
	}

	summary.updated += 1
})

const output = `module.exports = ${JSON.stringify(poojas, null, 2)}\n`
fs.writeFileSync(structuredDataPath, output, 'utf8')

console.log(`Updated ${summary.updated} Odia entries.`)
if (summary.missingKeys.length > 0) {
	console.log('Missing keys:', summary.missingKeys.join(', '))
}
