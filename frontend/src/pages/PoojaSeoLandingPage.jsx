import { Link } from 'react-router-dom'
import Seo from '../components/Seo'

const SITE_URL = 'https://pujasamriddhi.com'

const satyanarayanBookingPage = {
  canonicalPath: '/satyanarayan-puja-booking',
  badge: 'Puja Booking Guide',
  title: 'Satyanarayan Puja Booking in Bangalore | Puja Samriddhi',
  heading: 'Satyanarayan Puja Booking',
  h1: 'Book Satyanarayan Puja with Experienced Pandit',
  description:
    'Book Satyanarayan Puja at home with experienced pandits, guided vidhi, and smooth online scheduling through Puja Samriddhi.',
  intro:
    'Satyanarayan Puja is one of the most widely performed Hindu rituals for family peace, prosperity, gratitude, and fulfillment of sankalp. Puja Samriddhi helps families book a trusted pandit online for complete Satyanarayan Puja support at home.',
  keywords: [
    'satyanarayan puja booking',
    'satyanarayan puja at home',
    'pandit for satyanarayan puja',
  ],
  searchTerm: 'Satyanarayan Puja',
  sections: [
    {
      title: 'Importance of Satyanarayan Puja',
      body:
        'This puja is dedicated to Lord Vishnu in the Satyanarayan form and is often performed to mark gratitude, family milestones, new beginnings, and a desire for harmony at home.',
      points: [
        'Commonly booked for griha pravesh, birthdays, anniversaries, and recovery after challenges',
        'Performed for blessings related to stability, peace, and spiritual merit',
      ],
    },
    {
      title: 'When to Perform',
      body:
        'Families usually choose Purnima, Ekadashi, auspicious Thursdays, or other convenient dates based on family availability and priest guidance.',
      points: [
        'Suitable for regular family puja as well as special occasions',
        'Can be performed at home with a simple setup and proper sankalp',
      ],
    },
    {
      title: 'Puja Procedure',
      body:
        'The ritual generally includes sankalp, Ganesh invocation, kalash sthapana, Lord Vishnu worship, Satyanarayan katha, aarti, and prasad distribution.',
      points: [
        'Pandit guidance helps families follow each step correctly',
        'Procedure can be adapted for home, apartment, or community settings',
      ],
    },
    {
      title: 'Benefits',
      body:
        'Satyanarayan Puja is believed to bring clarity, blessings, household peace, and a sense of devotional completion for the family.',
      points: [
        'Supports gratitude, devotion, and positive family energy',
        'Helpful for new phases, celebrations, and peaceful intention setting',
      ],
    },
    {
      title: 'Booking Process',
      body:
        'Puja Samriddhi makes booking simple with online scheduling, package visibility, and priest coordination support.',
      points: [
        'Choose the puja, select your date, and share location details',
        'Get priest support with transparent booking flow and follow-up help',
      ],
    },
  ],
  faqItems: [
    {
      question: 'Can Satyanarayan Puja be performed at home?',
      answer:
        'Yes. It is commonly performed at home with a simple altar setup, prasad, and guided ritual support from an experienced pandit.',
    },
    {
      question: 'How long does Satyanarayan Puja usually take?',
      answer:
        'The duration depends on the format and family participation, but most home bookings take a few hours including katha and aarti.',
    },
  ],
}

const grihaPraveshPage = {
  canonicalPath: '/griha-pravesh-puja',
  badge: 'Housewarming Ritual',
  title: 'Griha Pravesh Puja Booking in Bangalore | Puja Samriddhi',
  heading: 'Griha Pravesh Puja',
  h1: 'Book Griha Pravesh Puja with Experienced Pandit',
  description:
    'Book Griha Pravesh Puja online for housewarming rituals, muhurat guidance, and experienced pandit support with Puja Samriddhi.',
  intro:
    'Griha Pravesh Puja marks the spiritual entry into a new home. Families perform it to purify the space, invoke blessings, and begin living in the house with auspicious energy and peace.',
  keywords: [
    'griha pravesh puja',
    'house warming puja pandit',
    'griha pravesh muhurat',
  ],
  searchTerm: 'Griha Pravesh',
  sections: [
    {
      title: 'Meaning of Griha Pravesh',
      body:
        'The puja is performed before or during entry into a new house to honor Vastu principles, divine energies, and household protection.',
      points: [
        'Seen as a sacred beginning for family life in the new space',
        'Often includes Vastu and Graha Shanti elements',
      ],
    },
    {
      title: 'Types of Griha Pravesh',
      body:
        'Traditionally, the ritual may vary for newly built homes, renovated homes, or re-entry after a period of vacancy or repairs.',
      points: [
        'New home entry usually includes full puja and homam',
        'Procedure can be adjusted based on family tradition and pandit advice',
      ],
    },
    {
      title: 'Ritual Process',
      body:
        'A typical Griha Pravesh includes Ganesh Puja, Vastu Shanti, kalash entry, homam, and blessings for prosperity and well-being.',
      points: [
        'Cow milk boiling, kalash placement, and doorway rituals are often included',
        'Pandit support ensures proper sequencing and mantra recitation',
      ],
    },
    {
      title: 'Items Required',
      body:
        'Families usually arrange coconut, mango leaves, kalash, flowers, rice, ghee, camphor, fruits, and other puja samagri recommended by the priest.',
      points: [
        'Samagri list can vary based on region and ritual complexity',
        'Puja Samriddhi can help you prepare before the ceremony date',
      ],
    },
    {
      title: 'Booking Pandit Online',
      body:
        'Online booking makes it easier to plan the housewarming date, confirm priest availability, and manage rituals on time.',
      points: [
        'Helpful for apartment moves, gated communities, and city schedules',
        'Clear package selection reduces last-minute confusion',
      ],
    },
  ],
  faqItems: [
    {
      question: 'Do I need a muhurat for Griha Pravesh?',
      answer:
        'Families usually prefer an auspicious muhurat. The priest can guide based on date, time, and family tradition.',
    },
    {
      question: 'Can Griha Pravesh Puja be done in flats and apartments?',
      answer:
        'Yes. The ritual is commonly performed in apartments with a setup adapted for the available space and building rules.',
    },
  ],
}

const ganeshAtHomePage = {
  canonicalPath: '/ganesh-puja-at-home',
  badge: 'Home Puja Service',
  title: 'Ganesh Puja Booking in Bangalore | Puja Samriddhi',
  heading: 'Ganesh Puja at Home',
  h1: 'Book Ganesh Puja with Experienced Pandit',
  description:
    'Book Ganesh Puja at home with a trusted pandit for new beginnings, family blessings, and obstacle removal through Puja Samriddhi.',
  intro:
    'Lord Ganesha is worshipped before major rituals, new ventures, housewarming ceremonies, and milestone events. Ganesh Puja at home is a simple and powerful way to begin auspicious work with divine blessings.',
  keywords: [
    'ganesh puja booking',
    'ganesh puja at home',
    'ganpati puja pandit',
  ],
  searchTerm: 'Ganesh Puja',
  sections: [
    {
      title: 'Importance of Lord Ganesha',
      body:
        'Lord Ganesha is traditionally invoked as Vighnaharta, the remover of obstacles, and is worshipped before starting important tasks or family ceremonies.',
      points: [
        'Popular for office opening, new home entry, and business launch',
        'Often the first ritual performed before larger pujas',
      ],
    },
    {
      title: 'Puja Steps',
      body:
        'The ritual usually includes sankalp, Ganesh avahan, offerings, mantra chanting, aarti, and prasad.',
      points: [
        'Can be completed as a standalone puja or part of another ceremony',
        'Pandit guidance helps families follow the vidhi correctly',
      ],
    },
    {
      title: 'Benefits',
      body:
        'Ganesh Puja is believed to support smooth beginnings, mental clarity, success, and blessings for the family or business.',
      points: [
        'Favored before new commitments or financial decisions',
        'Creates a devotional and positive atmosphere at home',
      ],
    },
    {
      title: 'Puja Samagri List',
      body:
        'Common items include durva grass, modak or sweets, flowers, coconut, incense, lamp, kumkum, and fruits.',
      points: [
        'Required items may vary by family tradition',
        'A pandit can share the exact list before the booking date',
      ],
    },
  ],
  faqItems: [
    {
      question: 'Is Ganesh Puja suitable before housewarming or business opening?',
      answer:
        'Yes. It is one of the most commonly booked rituals before entering a new house or beginning a new venture.',
    },
    {
      question: 'Can I book only Ganesh Puja without a larger ceremony?',
      answer:
        'Yes. Many families book Ganesh Puja as a standalone home ritual for blessings and obstacle removal.',
    },
  ],
}

const navagrahaPage = {
  canonicalPath: '/navagraha-puja',
  badge: 'Graha Shanti Service',
  title: 'Navagraha Puja Booking in Bangalore | Puja Samriddhi',
  heading: 'Navagraha Puja',
  h1: 'Book Navagraha Puja with Experienced Pandit',
  description:
    'Book Navagraha Puja for graha shanti, dosha relief, and balanced planetary blessings with guided online pandit support.',
  intro:
    'Navagraha Puja is performed to seek harmony from the nine planetary influences in Vedic astrology. Families book this ritual when they want graha shanti, spiritual balance, and support during difficult planetary periods.',
  keywords: [
    'navagraha puja',
    'graha shanti puja',
    'navagraha homam',
  ],
  searchTerm: 'Navagraha Puja',
  sections: [
    {
      title: 'What is Navagraha Puja',
      body:
        'This puja honors Surya, Chandra, Mangal, Budh, Guru, Shukra, Shani, Rahu, and Ketu through mantra, offerings, and priest-led worship.',
      points: [
        'Chosen for graha dosha concerns and astrological remedies',
        'Often performed with homam or extended shanti rituals',
      ],
    },
    {
      title: 'When to Perform',
      body:
        'Families usually book Navagraha Puja after horoscope guidance, before important decisions, or during periods of stress linked to planetary transitions.',
      points: [
        'Helpful before marriage, relocation, or major financial steps',
        'Can be performed as a focused graha shanti ritual at home',
      ],
    },
    {
      title: 'Benefits',
      body:
        'The puja is believed to support mental peace, smoother progress, and relief from challenging astrological influences.',
      points: [
        'Encourages balance, focus, and spiritual confidence',
        'Often booked when families seek structured remedy support',
      ],
    },
    {
      title: 'Puja Procedure',
      body:
        'The process may include sankalp, navagraha invocation, mantra chanting, offerings to each graha, homam, and final blessings.',
      points: [
        'Priest guidance is useful for correct sequence and samagri preparation',
        'Procedure can vary with regional customs and remedy requirements',
      ],
    },
  ],
  faqItems: [
    {
      question: 'Is Navagraha Puja the same as Graha Shanti Puja?',
      answer:
        'They are closely related. Navagraha Puja focuses on the nine grahas and is often part of a broader Graha Shanti remedy approach.',
    },
    {
      question: 'Can Navagraha Puja be performed at home?',
      answer:
        'Yes. Many families perform it at home with proper priest guidance, setup, and homam arrangements when needed.',
    },
  ],
}

const rudrabhishekPage = {
  canonicalPath: '/rudrabhishek-puja',
  badge: 'Shiva Worship Ritual',
  title: 'Rudrabhishek Puja Booking in Bangalore | Puja Samriddhi',
  heading: 'Rudrabhishek Puja',
  h1: 'Book Rudrabhishek Puja with Experienced Pandit',
  description:
    'Book Rudrabhishek Puja for Lord Shiva worship, abhishek vidhi, and spiritual blessings with experienced pandit support.',
  intro:
    'Rudrabhishek Puja is a powerful Shiva ritual performed with sacred offerings, Vedic chanting, and devotion. Families book it for peace, protection, strength, and spiritual upliftment.',
  keywords: [
    'rudrabhishek puja',
    'shiva abhishek puja',
    'rudrabhishek benefits',
  ],
  searchTerm: 'Rudrabhishek Puja',
  sections: [
    {
      title: 'Importance of Rudrabhishek',
      body:
        'The ritual is dedicated to Lord Shiva and is valued for its devotional intensity, mantra power, and spiritual depth.',
      points: [
        'Often performed for peace, protection, and inner strength',
        'Considered especially auspicious during Shravan and on Mondays',
      ],
    },
    {
      title: 'Ritual Process',
      body:
        'The puja typically involves sankalp, Shiva linga abhishek with sacred substances, Rudram chanting, offerings, and aarti.',
      points: [
        'Milk, curd, honey, water, bilva leaves, and flowers are commonly used',
        'The process can be simple or elaborate depending on family preference',
      ],
    },
    {
      title: 'Best Days for Puja',
      body:
        'Mondays, Pradosh, Maha Shivaratri, Shravan month, and other spiritually significant dates are popular choices.',
      points: [
        'Families also book on birthdays, anniversaries, and recovery milestones',
        'Pandit guidance can help select a suitable day and timing',
      ],
    },
  ],
  faqItems: [
    {
      question: 'Can Rudrabhishek Puja be performed at home?',
      answer:
        'Yes. It can be arranged at home with an appropriate Shiva setup and the required abhishek samagri.',
    },
    {
      question: 'What is the main purpose of Rudrabhishek?',
      answer:
        'Families usually perform it for peace, divine grace, protection, and spiritual strength through Shiva worship.',
    },
  ],
}

const lakshmiForWealthPage = {
  canonicalPath: '/lakshmi-puja-for-wealth',
  badge: 'Prosperity Puja',
  title: 'Lakshmi Puja Booking in Bangalore | Puja Samriddhi',
  heading: 'Lakshmi Puja for Wealth',
  h1: 'Book Lakshmi Puja with Experienced Pandit',
  description:
    'Book Lakshmi Puja for prosperity, Diwali worship, and family blessings with guided priest support from Puja Samriddhi.',
  intro:
    'Lakshmi Puja is dedicated to Goddess Lakshmi, who represents wealth, abundance, auspiciousness, and household prosperity. Families commonly book this puja during Diwali, Fridays, and major new beginnings.',
  keywords: [
    'lakshmi puja',
    'dhan lakshmi puja',
    'diwali lakshmi puja',
  ],
  searchTerm: 'Lakshmi Puja',
  sections: [
    {
      title: 'Importance of Goddess Lakshmi',
      body:
        'Lakshmi worship is associated with prosperity, purity, grace, and the well-being of the household.',
      points: [
        'Commonly performed during Diwali and festive family observances',
        'Also booked for shop opening, office entry, and financial milestones',
      ],
    },
    {
      title: 'Puja Benefits',
      body:
        'The ritual is believed to invite abundance, stability, positive energy, and devotional focus into the home or business.',
      points: [
        'Encourages gratitude and disciplined worship',
        'Supports a calm and auspicious family atmosphere',
      ],
    },
    {
      title: 'Puja Procedure',
      body:
        'The process may include kalash preparation, Lakshmi invocation, offerings, mantra chanting, aarti, and prasad.',
      points: [
        'Can be adapted for homes, offices, and festive gatherings',
        'Families usually prepare diyas, flowers, sweets, and clean altar space',
      ],
    },
  ],
  faqItems: [
    {
      question: 'When is Lakshmi Puja usually performed?',
      answer:
        'Diwali is the most popular occasion, though many families also book Lakshmi Puja on Fridays and other auspicious dates.',
    },
    {
      question: 'Can Lakshmi Puja be done for business spaces?',
      answer:
        'Yes. Families and business owners often perform Lakshmi Puja in shops and offices for prosperity and blessings.',
    },
  ],
}

const panditNearMePage = {
  canonicalPath: '/pandit-near-me',
  badge: 'Online Priest Search',
  title: 'Pandit Near Me | Book Trusted Pandit Online - Puja Samriddhi',
  heading: 'Pandit Near Me',
  description:
    'Find and book a trusted pandit online for home puja, housewarming, Graha Shanti, wedding rituals, and family ceremonies with Puja Samriddhi.',
  intro:
    'Searching for a pandit near me usually means you need reliable priest support without uncertain calls and last-minute confusion. Puja Samriddhi helps families book a trusted pandit online with better clarity on rituals, service coverage, and ceremony planning.',
  keywords: [
    'pandit near me',
    'online pandit booking',
    'hindu priest near me',
  ],
  searchTerm: 'Pandit',
  sections: [
    {
      title: 'Introduction',
      body:
        'Puja Samriddhi connects families with experienced pandits for home rituals, milestone ceremonies, and festive worship through a simple booking experience.',
      points: [
        'Useful for city families who need dependable scheduling support',
        'Designed for home puja planning without unclear local coordination',
      ],
    },
    {
      title: 'Why Book Pandit Online',
      body:
        'Online booking saves time and helps you compare puja options, confirm priest availability, and prepare before the ritual date.',
      points: [
        'Reduces uncertainty around timing and ritual requirements',
        'Makes follow-up and support easier for busy families',
      ],
    },
    {
      title: 'Puja Services Available',
      body:
        'Families commonly book Griha Pravesh, Satyanarayan Puja, Ganesh Puja, Lakshmi Puja, Rudrabhishek, marriage rituals, and Vastu-related services.',
      points: [
        'Home ceremonies and festive rituals are both supported',
        'Service availability can vary by city and priest schedule',
      ],
    },
    {
      title: 'Benefits of Booking Through Puja Samriddhi',
      body:
        'Puja Samriddhi gives families a more structured way to plan rituals with better visibility into services and support.',
      points: [
        'Simple browsing, online inquiry flow, and priest coordination support',
        'Helpful for planned ceremonies as well as urgent family needs',
      ],
    },
  ],
  faqItems: [
    {
      question: 'Can I book a pandit online for home puja?',
      answer:
        'Yes. You can browse services, choose a suitable puja, and use Puja Samriddhi to plan the booking flow online.',
    },
    {
      question: 'What types of puja can I book through Puja Samriddhi?',
      answer:
        'Popular bookings include Satyanarayan Puja, Griha Pravesh, Ganesh Puja, Lakshmi Puja, Rudrabhishek, marriage rituals, and Vastu-related pujas.',
    },
  ],
}

const onlinePanditBookingPage = {
  canonicalPath: '/online-pandit-booking',
  badge: 'Booking Platform',
  title: 'Online Pandit Booking | Book Priest for Puja',
  heading: 'Online Pandit Booking',
  description:
    'Book a pandit online for home puja, priest support, and Hindu ritual services with a simple booking experience from Puja Samriddhi.',
  intro:
    'Online pandit booking helps families plan rituals more confidently by reducing scheduling confusion and making priest support easier to access. Puja Samriddhi is built to make that process more reliable.',
  keywords: [
    'book pandit online',
    'hindu priest booking',
    'online puja services',
  ],
  searchTerm: 'Pandit',
  sections: [
    {
      title: 'Why Book Pandit Online',
      body:
        'Families increasingly prefer online booking because it offers better visibility into services, timing, and ceremony planning.',
      points: [
        'Useful for working families and planned city ceremonies',
        'Reduces dependency on uncertain local calls and referrals',
      ],
    },
    {
      title: 'How Puja Samriddhi Works',
      body:
        'Browse services, identify the puja you need, submit the date and location, and coordinate the next steps through the platform flow.',
      points: [
        'Designed for easier planning and clearer next steps',
        'Helps you move from inquiry to ceremony with less friction',
      ],
    },
    {
      title: 'Available Pujas',
      body:
        'The platform supports home pujas, festive rituals, marriage ceremonies, naming rituals, housewarming pujas, and other family observances.',
      points: [
        'Popular searches include Satyanarayan, Ganesh, Lakshmi, Griha Pravesh, and Vastu pujas',
        'Different ceremony types can be explored from the service catalog',
      ],
    },
  ],
  faqItems: [
    {
      question: 'What does online pandit booking include?',
      answer:
        'It typically includes service selection, scheduling flow, location sharing, and priest coordination for the chosen ritual.',
    },
    {
      question: 'Is online pandit booking useful for house pujas?',
      answer:
        'Yes. It is especially useful for home ceremonies where timing, preparation, and priest arrival need clearer coordination.',
    },
  ],
}

const marriagePujaPage = {
  canonicalPath: '/marriage-puja',
  badge: 'Wedding Ritual Service',
  title: 'Marriage Puja Booking in Bangalore | Puja Samriddhi',
  heading: 'Marriage Puja',
  h1: 'Book Marriage Puja with Experienced Pandit',
  description:
    'Book pandit support for marriage puja, Hindu wedding rituals, and sacred ceremony guidance with Puja Samriddhi.',
  intro:
    'Marriage rituals hold deep spiritual meaning in Hindu tradition. Families book marriage puja support to ensure the ceremony follows proper vidhi, mantras, and key wedding samskara steps.',
  keywords: [
    'marriage puja',
    'hindu wedding rituals',
    'marriage pandit',
  ],
  searchTerm: 'Marriage',
  sections: [
    {
      title: 'Importance of Marriage Rituals',
      body:
        'The wedding ceremony is seen as a sacred union, not just a social event. Rituals mark vows, responsibility, and spiritual partnership.',
      points: [
        'Ceremonies vary across regional traditions but share sacred intent',
        'A pandit helps maintain the proper structure and significance of the rituals',
      ],
    },
    {
      title: 'Wedding Puja Steps',
      body:
        'Marriage puja can include Ganesh invocation, kanyadaan, mangal pheras, saptapadi, havan, blessings, and concluding rituals.',
      points: [
        'The exact process depends on family custom and sampradaya',
        'Advance planning is helpful because weddings involve multiple moving parts',
      ],
    },
  ],
  faqItems: [
    {
      question: 'Can marriage rituals be customized for family tradition?',
      answer:
        'Yes. Wedding rituals often vary by region, language, and family custom, and pandit guidance helps structure them accordingly.',
    },
    {
      question: 'Should wedding puja planning be done in advance?',
      answer:
        'Yes. Early planning helps coordinate dates, ceremony steps, and priest requirements for a smoother wedding schedule.',
    },
  ],
}

const vastuShantiPage = {
  canonicalPath: '/vastu-shanti-puja',
  badge: 'Vastu Remedy Ritual',
  title: 'Vastu Shanti Puja Booking in Bangalore | Puja Samriddhi',
  heading: 'Vastu Shanti Puja',
  h1: 'Book Vastu Shanti Puja with Experienced Pandit',
  description:
    'Book Vastu Shanti Puja for vastu dosha remedies, home energy balance, and guided ritual support through Puja Samriddhi.',
  intro:
    'Vastu Shanti Puja is performed to calm negative spatial influences, purify the home, and invite peaceful energy into the property. Families often book it during house entry, renovations, or after experiencing persistent imbalance in the space.',
  keywords: [
    'vastu shanti puja',
    'vastu dosha puja',
    'vastu puja at home',
  ],
  searchTerm: 'Vastu Shanti Puja',
  sections: [
    {
      title: 'What is Vastu Dosha',
      body:
        'Vastu dosha refers to an imbalance in the spatial or energetic arrangement of the home according to Vastu principles.',
      points: [
        'Families may seek remedy during new home entry or after repeated obstacles',
        'The ritual is often combined with Griha Pravesh or Graha Shanti elements',
      ],
    },
    {
      title: 'Benefits of Vastu Puja',
      body:
        'The puja is believed to support peace, positivity, and a spiritually grounded start in the property.',
      points: [
        'Encourages a calm environment for family life and work',
        'Useful for homes, offices, shops, and renovated spaces',
      ],
    },
    {
      title: 'Puja Process',
      body:
        'The procedure can include sankalp, Ganesh worship, Vastu devata invocation, homam, offerings, and concluding blessings.',
      points: [
        'Ritual detail depends on the space and family requirement',
        'Pandit coordination helps with samagri and ceremony sequencing',
      ],
    },
  ],
  faqItems: [
    {
      question: 'When is Vastu Shanti Puja usually performed?',
      answer:
        'It is commonly performed before occupying a new property, after major renovation, or when families want a Vastu remedy ritual for the space.',
    },
    {
      question: 'Can Vastu Shanti Puja be combined with housewarming?',
      answer:
        'Yes. Many families combine it with Griha Pravesh for a more complete new-home ritual.',
    },
  ],
}

const pageContent = {
  'pandit-near-me': panditNearMePage,
  'satyanarayan-puja-booking': satyanarayanBookingPage,
  'satyanarayan-puja': {
    ...satyanarayanBookingPage,
    canonicalPath: '/satyanarayan-puja',
    title: 'Satyanarayan Puja in Bangalore | Puja Samriddhi',
    heading: 'Satyanarayan Puja',
    h1: 'Book Satyanarayan Puja with Experienced Pandit',
  },
  'griha-pravesh-puja': grihaPraveshPage,
  'ganesh-puja-at-home': ganeshAtHomePage,
  'ganesh-puja': {
    ...ganeshAtHomePage,
    canonicalPath: '/ganesh-puja',
    title: 'Ganesh Puja in Bangalore | Puja Samriddhi',
    heading: 'Ganesh Puja',
    h1: 'Book Ganesh Puja with Experienced Pandit',
  },
  'navagraha-puja': navagrahaPage,
  'rudrabhishek-puja': rudrabhishekPage,
  rudrabhishek: {
    ...rudrabhishekPage,
    canonicalPath: '/rudrabhishek',
    title: 'Rudrabhishek in Bangalore | Puja Samriddhi',
    heading: 'Rudrabhishek',
    h1: 'Book Rudrabhishek Puja with Experienced Pandit',
  },
  'lakshmi-puja-for-wealth': lakshmiForWealthPage,
  'lakshmi-puja': {
    ...lakshmiForWealthPage,
    canonicalPath: '/lakshmi-puja',
    title: 'Lakshmi Puja in Bangalore | Puja Samriddhi',
    heading: 'Lakshmi Puja',
    h1: 'Book Lakshmi Puja with Experienced Pandit',
  },
  'online-pandit-booking': onlinePanditBookingPage,
  'marriage-puja': marriagePujaPage,
  'vastu-shanti-puja': vastuShantiPage,
}

const buildStructuredData = (content, canonical) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: content.heading,
      description: content.description,
      url: canonical,
      serviceType: content.heading,
      provider: {
        '@type': 'Organization',
        name: 'Puja Samriddhi',
        url: SITE_URL,
      },
      areaServed: [
        {
          '@type': 'City',
          name: 'Bangalore',
        },
        {
          '@type': 'City',
          name: 'Bhubaneswar',
        },
      ],
      keywords: content.keywords.join(', '),
    },
    {
      '@type': 'FAQPage',
      mainEntity: content.faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
  ],
})

function PoojaSeoLandingPage({ slug }) {
  const content = pageContent[slug]

  if (!content) {
    return null
  }

  const canonical = `${SITE_URL}${content.canonicalPath || `/${slug}`}`
  const servicesSearchLink = `/services?search=${encodeURIComponent(content.searchTerm || content.heading)}`
  const structuredData = buildStructuredData(content, canonical)

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <Seo
        title={content.title}
        description={content.description}
        canonical={canonical}
        keywords={content.keywords}
        structuredData={structuredData}
      />

      <p className="text-sm font-semibold uppercase tracking-widest text-[#FF6F00]">{content.badge}</p>
      <h1 className="mt-2 text-3xl font-extrabold text-[#333333] sm:text-4xl">{content.h1 || content.heading}</h1>
      <p className="mt-4 max-w-4xl text-base leading-relaxed text-[#333333]/84 sm:text-lg">{content.description}</p>
      <p className="mt-3 max-w-4xl text-base leading-relaxed text-[#333333]/84">{content.intro}</p>

      <div className="mt-6 flex flex-wrap gap-2.5">
        {content.keywords.map((keyword) => (
          <span
            key={keyword}
            className="rounded-full border border-[#FFE0A3] bg-[#FFF8E1] px-3 py-1 text-sm font-medium text-[#D84315]"
          >
            {keyword}
          </span>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to={servicesSearchLink}
          className="rounded-xl bg-linear-to-r from-[#D84315] via-[#FF6F00] to-[#FF8F00] px-5 py-3 text-sm font-semibold text-white transition hover:from-[#C63B12] hover:via-[#F57C00] hover:to-[#FB8C00]"
        >
          View Packages
        </Link>
        <Link
          to="/services"
          className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-[#333333] transition hover:bg-stone-50"
        >
          Browse All Services
        </Link>
      </div>

      <div className="mt-10 space-y-4">
        {content.sections.map((section) => (
          <article key={section.title} className="rounded-2xl border border-[#FFE0A3] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#333333] sm:text-2xl">{section.title}</h2>
            <p className="mt-3 text-base leading-relaxed text-[#333333]/84">{section.body}</p>
            {Array.isArray(section.points) && section.points.length > 0 && (
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[#333333]/84 sm:text-base">
                {section.points.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#FF6F00]" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>

      <div className="mt-10 rounded-3xl border border-[#FFE0A3] bg-linear-to-br from-[#FFF8E1] via-[#FFF3C4] to-[#FFF9EE] px-6 py-8 text-[#333333] shadow-lg sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#FF6F00]">Book With Puja Samriddhi</p>
        <h2 className="mt-2 text-2xl font-bold text-[#333333] sm:text-3xl">Plan your puja with clearer steps and faster support</h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#333333]/84 sm:text-lg">
          Choose the ritual you need, check packages, and move forward with an easier priest booking flow for your family ceremony.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to={servicesSearchLink}
            className="rounded-xl bg-linear-to-r from-[#D84315] via-[#FF6F00] to-[#FF8F00] px-5 py-3 text-sm font-semibold text-white transition hover:from-[#C63B12] hover:via-[#F57C00] hover:to-[#FB8C00]"
          >
            Check {content.searchTerm || content.heading} Packages
          </Link>
          <Link
            to="/contact"
            className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-[#333333] transition hover:bg-white/70"
          >
            Contact Booking Support
          </Link>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold text-[#333333] sm:text-3xl">Frequently Asked Questions</h2>
        <div className="mt-5 space-y-3">
          {content.faqItems.map((item) => (
            <article key={item.question} className="rounded-2xl border border-[#FFE0A3] bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-[#333333] sm:text-lg">{item.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#333333]/84 sm:text-base">{item.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PoojaSeoLandingPage
