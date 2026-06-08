import mongoose from 'mongoose';
import dotenv from 'dotenv';
import LearningContent from '../models/LearningContent.js';
import Question from '../models/Question.js';

dotenv.config();

const contentData = [
  {
    exam: 'UPSC',
    subject: 'History',
    topic: 'Ancient India',
    subtopic: 'Indus Valley Civilization',
    introduction: 'The Indus Valley Civilization (IVC) was a Bronze Age civilization in the northwestern regions of South Asia, lasting from 3300 BCE to 1300 BCE, and in its mature form from 2600 BCE to 1900 BCE.',
    detailedExplanation: `### Discovery and Geographical Spread
The Indus Valley Civilization was discovered in 1921 at Harappa (Punjab, Pakistan) by Daya Ram Sahni, and in 1922 at Mohenjo-daro (Sindh, Pakistan) by R.D. Banerji. It covered parts of Punjab, Sindh, Balochistan, Gujarat, Rajasthan, Haryana, and Western Uttar Pradesh. The civilization was bordered by Sutkagendor (Balochistan) in the West, Alamgirpur (UP) in the East, Manda (Jammu) in the North, and Daimabad (Maharashtra) in the South.

### Advanced Urban Planning and Civic Architecture
One of the defining features of IVC was its grid system of town planning:
- **Citadel and Lower Town:** Cities were divided into two main parts. The Citadel, built on an elevated mud-brick platform, contained administrative and religious structures (e.g., the Great Bath, Granaries). The Lower Town contained residential dwellings for common citizens.
- **Drainage System:** An advanced underground drainage network connected every house to a street drain. Drains were constructed of burnt bricks and covered with stone slabs or bricks, featuring manholes for regular inspection and cleaning.
- **Burnt Brick Construction:** Standardization of brick sizes (ratio 4:2:1 for length, breadth, and thickness) is observed across all major cities, demonstrating central planning.

### Economy, Trade, and Agriculture
The economy was highly diversified, based on agriculture, animal husbandry, crafts, and trade:
- **Agriculture:** Major crops included wheat, barley, mustard, sesame, peas, and cotton (Harappans were the first to produce cotton). Ploughed fields were discovered at Kalibangan.
- **Trade:** Flourishing trade routes connected Mesopotamia, Persia, Oman, and Afghanistan. Lothal served as a major seaport and dockyard.
- **Seals and Script:** Thousands of steatite seals with animal motifs (like the unicorn and humped bull) and a pictographic script were used. The script remains undeciphered and was written in a boustrophedon style (alternating directions).

### Religion, Art, and Decline
- **Religious Practices:** Evidence of nature worship, animal worship (humped bull), and worship of a Mother Goddess and a male deity identified as Pashupati (proto-Shiva) on seals.
- **Art:** Notable artifacts include the bronze "Dancing Girl" from Mohenjo-daro, the steatite "Bearded Priest" bust, and terracotta toys.
- **Decline:** The civilization experienced a gradual decline around 1900 BCE. Major proposed causes include tectonic shifts, climate change, drying up of the Ghaggar-Hakra river, and flooding.`,
    concepts: [
      'Citadel vs Lower Town spatial segregation',
      'Standardized brick dimensions (4:2:1) indicating central administration',
      'Decentralized yet uniform sanitation infrastructure',
      'Boustrophedon writing script'
    ],
    importantFacts: [
      'Lothal was the only Harappan port town with a massive tidal dockyard.',
      'Dholavira in Gujarat is famous for its sophisticated water harvesting reservoirs and a large stadium.',
      'Mohenjo-daro features the Great Bath and a Great Granary.',
      'Kalibangan in Rajasthan has evidence of the earliest ploughed field and fire altars.',
      'Chanhudaro was the only city without a citadel and acted as a bead-making factory.'
    ],
    examples: [
      'The Great Bath of Mohenjo-daro demonstrates advanced waterproofing using gypsum and bitumen.',
      'Seals found in Mesopotamia containing Harappan inscriptions confirm maritime trade links.'
    ],
    tables: [
      {
        title: 'Key Indus Valley Sites and Discoveries',
        headers: ['Site Name', 'Location / River', 'Key Archeological Discoveries'],
        rows: [
          ['Harappa', 'Ravi River (Punjab, Pak)', 'Row of six granaries, coffin burials, copper scale'],
          ['Mohenjo-daro', 'Indus River (Sindh, Pak)', 'Great Bath, Great Granary, Bronze Dancing Girl, Pashupati Seal'],
          ['Lothal', 'Bhogava River (Gujarat, Ind)', 'Artificial Dockyard, double burial, fire altars, chess board'],
          ['Kalibangan', 'Ghaggar River (Rajasthan, Ind)', 'Earliest ploughed field, wooden drainage, fire altars'],
          ['Dholavira', 'Luni River (Gujarat, Ind)', 'Three-tier city planning, water reservoirs, sign board']
        ]
      }
    ],
    revisionNotes: 'Focus Areas: Bronze Age civilization; Pictographic, undeciphered script; No temples found; Iron was NOT known to Harappans; Lothal = Port; Dholavira = Reservoirs; Chanhudaro = No citadel.',
    pyqs: [
      {
        question: {
          en: 'Which of the following Harappan sites has yielded evidence of a dockyard?',
          hi: 'निम्नलिखित में से किस हड़प्पा स्थल से गोदीवाड़ा (डॉकयार्ड) के साक्ष्य मिले हैं?'
        },
        options: [
          { en: 'Harappa', hi: 'हड़प्पा' },
          { en: 'Lothal', hi: 'लोथल' },
          { en: 'Mohenjo-daro', hi: 'मोहनजोदड़ो' },
          { en: 'Banawali', hi: 'बनावली' }
        ],
        answer: 1,
        explanation: {
          en: 'Lothal is located on the bank of the Bhogava river in Gujarat and contains an artificial brick basin identified as a dockyard.',
          hi: 'लोथल गुजरात में भोगवा नदी के तट पर स्थित है और इसमें एक कृत्रिम ईंट बेसिन है जिसे गोदीवाड़ा (डॉकयार्ड) के रूप में पहचाना जाता है।'
        },
        year: 2017
      }
    ]
  },
  {
    exam: 'UPSC',
    subject: 'History',
    topic: 'Ancient India',
    subtopic: 'Vedic Period',
    introduction: 'The Vedic Period (c. 1500 – c. 500 BCE) marks the composition of the Vedas and the foundation of Hindu social and religious systems in India.',
    detailedExplanation: `### Classification of the Vedic Age
The Vedic Period is divided into two distinct epochs:
1. **Early Vedic Period / Rigvedic Period (1500 – 1000 BCE):** Nomadic pastoral economy centered around the Sapta-Sindhu (Seven Rivers) region. Society was tribal, organized into clans called *Ganas* or *Vis*.
2. **Later Vedic Period (1000 – 500 BCE):** Sedentary agricultural economy that expanded into the Gangetic Plains. Transition from tribal chiefdoms to territorial kingdoms (*Janapadas*). Use of Iron (known as *Syama Ayas*) became widespread.

### Social and Political Institutions
- **Polity:** The tribal chief was called *Rajan*. His power was checked by assemblies like *Sabha* (council of elders) and *Samiti* (general assembly). In the later Vedic period, these assemblies lost power to hereditary kings.
- **Social Structure:** Rigvedic society was egalitarian, and women held a respectable position (attending Sabha meetings, composing hymns). However, the later Vedic period saw the consolidation of the Varna System (Brahmana, Kshatriya, Vaishya, Shudra) based on birth, and deterioration in the status of women.
- **Gotra Institution:** Introduced in the later Vedic period, regulating marriages within clans.

### Vedic Literature
Vedic literature is classified into:
- **Shruti (Hearing):** Deemed eternal and divine. Includes Vedas, Brahmanas, Aranyakas, and Upanishads.
- **Smriti (Remembered):** Human compositions. Includes Vedangas, Puranas, Epics (Ramayana, Mahabharata), and Dharmashastras.`,
    concepts: [
      'Transition from pastoral nomadism to settled agriculture',
      'Rigvedic tribal democracy (Sabha & Samiti)',
      'Development of the Varna System and division of labor',
      'Upanishadic philosophy of Atman and Brahman'
    ],
    importantFacts: [
      'Rigveda is the oldest religious text in the world, containing 1028 hymns organized in 10 Mandalas.',
      'The famous Gayatri Mantra is found in the 3rd Mandala of the Rigveda, composed by Vishvamitra.',
      'The battle of ten kings (Dasarajna Battle) was fought on the banks of Parushni (Ravi) river.',
      'Iron was discovered around 1000 BCE, aiding forest clearance in the Gangetic plains.',
      'Satyameva Jayate is taken from the Mundaka Upanishad.'
    ],
    examples: [
      'Rigvedic wealth was measured in cows (Gau/Gavisthi), indicating the pastoral nature of the early economy.',
      'The Purusha Sukta hymn in the 10th Mandala of Rigveda provides the first mention of the four-fold Varna system.'
    ],
    tables: [
      {
        title: 'Rigvedic Rivers and Their Modern Names',
        headers: ['Rigvedic Name', 'Modern Name', 'Significance'],
        rows: [
          ['Sindhu', 'Indus', 'Most frequently mentioned river'],
          ['Sarasvati', 'Ghaggar-Hakra (dry)', 'Most sacred river (Nadi-tarna)'],
          ['Parushni', 'Ravi', 'Site of the Battle of Ten Kings'],
          ['Vipasa', 'Beas', 'Eastern boundary of the Rigvedic settlement'],
          ['Vitasta', 'Jhelum', 'Known to the Greeks as Hydaspes']
        ]
      }
    ],
    revisionNotes: 'Quick Recall: Rigvedic = Pastoral, egalitarian, Sabha/Samiti, Copper (Ayas); Later Vedic = Settled agriculture, rigid Varna, territorial kingdoms, Iron (Syama Ayas), Upanishads.',
    pyqs: [
      {
        question: {
          en: 'The national motto of India, "Satyameva Jayate", is inscribed below the Emblem of India. From which text is it taken?',
          hi: 'भारत का राष्ट्रीय आदर्श वाक्य, "सत्यमेव जयते", भारत के प्रतीक चिन्ह के नीचे उत्कीर्ण है। यह किस ग्रंथ से लिया गया है?'
        },
        options: [
          { en: 'Katha Upanishad', hi: 'कठ उपनिषद' },
          { en: 'Mundaka Upanishad', hi: 'मुंडक उपनिषद' },
          { en: 'Chhandogya Upanishad', hi: 'छांदोग्य उपनिषद' },
          { en: 'Rigveda', hi: 'ऋग्वेद' }
        ],
        answer: 1,
        explanation: {
          en: '"Satyameva Jayate" (Truth alone triumphs) is a mantra from the Mundaka Upanishad.',
          hi: '"सत्यमेव जयते" (सत्य की ही विजय होती है) मुंडक उपनिषद का एक मंत्र है।'
        },
        year: 2014
      }
    ]
  },
  {
    exam: 'UPSC',
    subject: 'History',
    topic: 'Ancient India',
    subtopic: 'Maurya Empire',
    introduction: 'The Maurya Empire (322 – 185 BCE) was the first major empire in Indian history, unifying the majority of the Indian subcontinent under a centralized administration.',
    detailedExplanation: `### Establishment and Consolidation
Founded by Chandragupta Maurya in 322 BCE after overthrowing Dhana Nanda (Nanda Dynasty) with the help of his mentor Chanakya (Kautilya). Chandragupta defeated Seleucus Nicator in 305 BCE, expanding the empire into Afghanistan and Balochistan. 
- **Bindusara:** Succeeded Chandragupta, expanded the empire into Central India and was known to the Greeks as Amitraghata (Slayer of enemies).
- **Ashoka the Great:** The most famous Mauryan ruler. Following the Kalinga War in 261 BCE, which caused massive bloodshed, Ashoka renounced physical conquest (*Bherighosha*) and adopted cultural/ethical conquest (*Dhammaghosha*). He converted to Buddhism under Upagupta.

### Mauryan Administration and Kautilya\'s Arthashastra
The Mauryan state was highly centralized with a vast bureaucratic apparatus:
- **Central Administration:** The King was the center of power, supported by the Mantriparishad. Supervised by key officers called *Tirthas* and *Adhyakshas* (superintendents).
- **Espionage:** A highly organized spy network (*Gudha-purushas*) operated throughout the empire.
- **Municipal Administration:** As described by Megasthenes (Greek ambassador) in his book *Indica*, Pataliputra was governed by a municipal commission of 30 members divided into 6 committees of 5 members each.

### Ashokan Dhamma and Edicts
Ashokan Dhamma was not a new religion but a code of moral conduct:
- **Major Rock Edicts (14):** Prescribed peace, animal conservation, tolerance, and respect.
- **Pillar Edicts (7):** Promoted civic duties and ethical life.
- **Languages Used:** Prakrit (written in Brahmi and Kharosthi scripts), Greek, and Aramaic.`,
    concepts: [
      'Centralized bureaucracy and spy networks',
      'Transition from militarism to ethical governance (Dhamma)',
      'State intervention in trade and standard weights',
      'Art as a tool for political and social communication'
    ],
    importantFacts: [
      'Megasthenes visited the court of Chandragupta Maurya and wrote "Indica".',
      'Ashoka was referred to as "Devanampriya" (Beloved of the Gods) and "Priyadasi" (He who looks with kindness).',
      'Kalinga War took place in the 9th year of Ashoka\'s coronation, described in Major Rock Edict XIII.',
      'Sanchi Stupa and the Lion Capital at Sarnath were constructed during Ashoka\'s reign.',
      'Mauryan art is characterized by highly polished monolithic sandstone pillars.'
    ],
    examples: [
      'The Junagadh Rock Inscription of Rudradaman mentions the construction of Sudarshana Lake by Chandragupta\'s governor Pusyagupta.',
      'Ashoka dispatched his children Mahindra and Sanghamitta to Sri Lanka to propagate Buddhism.'
    ],
    tables: [
      {
        title: 'Key Mauryan Administrative Officers',
        headers: ['Officer Title', 'Administrative Department', 'Functions'],
        rows: [
          ['Sannidhata', 'Treasury & Accounts', 'Chief Treasurer'],
          ['Samaharta', 'Revenue Assessment', 'Collector-General of revenue'],
          ['Dharmasthiya', 'Judiciary', 'Civil Court Judge'],
          ['Kantakasodhana', 'Judiciary', 'Criminal Court Judge'],
          ['Dhamma Mahamattas', 'Morals and Welfare', 'Officers appointed to propagate Dhamma']
        ]
      }
    ],
    revisionNotes: 'Exam Focus: Chandragupta (Founder) -> Bindusara -> Ashoka (Dhamma). Arthashastra (Kautilya) + Indica (Megasthenes). Rock Edict XIII = Kalinga war. Sarnath Pillar = National Emblem.',
    pyqs: [
      {
        question: {
          en: 'In which of the following relief sculpture inscriptions is "Ranyo Ashoka" (King Ashoka) mentioned along with the stone portrait of Ashoka?',
          hi: 'निम्नलिखित में से किस राहत मूर्तिकला शिलालेख में "राव्यो अशोक" (राजा अशोक) का उल्लेख अशोक के पत्थर के चित्र के साथ किया गया है?'
        },
        options: [
          { en: 'Kanaganahalli', hi: 'कनगनहल्ली' },
          { en: 'Sanchi', hi: 'सांची' },
          { en: 'Shahbazgarhi', hi: 'शाहबाजगढ़ी' },
          { en: 'Sohgaura', hi: 'सोहगौरा' }
        ],
        answer: 0,
        explanation: {
          en: 'The Kanaganahalli inscription in Karnataka features a portrait of Ashoka labeled "Ranyo Ashoka" in Brahmi script.',
          hi: 'कर्नाटक में कंगनहल्ली शिलालेख में ब्राह्मी लिपि में "रण्यो अशोक" अंकित अशोक का एक चित्र है।'
        },
        year: 2019
      }
    ]
  },
  {
    exam: 'UPSC',
    subject: 'History',
    topic: 'Ancient India',
    subtopic: 'Gupta Empire',
    introduction: 'The Gupta Empire (c. 319 – 543 CE) ruled northern and central India, ushering in the Golden Age of Indian Art, Science, Literature, and Mathematics.',
    detailedExplanation: `### Expansion and Political Integration
Founded by Sri Gupta, but the first powerful ruler was Chandragupta I (319–335 CE), who assumed the title Maharajadhiraja.
- **Samudragupta (335–375 CE):** Termed the 'Napoleon of India' by V.A. Smith due to his brilliant military campaigns. His conquests are detailed in the Allahabad Pillar inscription (Prashasti) written by his court poet Harishena.
- **Chandragupta II (Vikramaditya) (375–415 CE):** Defeated the Shakas of western India, annexing Gujarat. His court was adorned by the *Navaratnas* (Nine Gems), including Kalidasa and Varahamihira. Faxian (Fa-Hien), a Chinese Buddhist traveler, visited India during his reign.
- **Kumargupta I:** Founded the famous Nalanda University.

### Cultural and Scientific Achievements
The Gupta period is renowned for its cultural zenith:
- **Literature:** Kalidasa wrote masterpieces like *Shakuntala*, *Meghaduta*, and *Raghuvamsa*. Visakhadatta wrote *Mudrarakshasa*.
- **Science and Math:** Aryabhata wrote *Aryabhatiya*, detailing the concept of zero, decimal system, and the earth\'s rotation around the sun. Varahamihira wrote *Brihatsamhita*. Sushruta wrote *Sushruta Samhita* (on surgery).
- **Art and Architecture:** The period saw the birth of temple architecture in northern India (Nagara style). Notable examples include the Dashavatara Temple at Deogarh. Stunning murals at Ajanta (caves 16 & 17) were painted during this era.`,
    concepts: [
      'Decentralization of power and growth of feudal land grants',
      'Formalization of the Nagara temple architecture style',
      'Peak of Sanskrit court literature and classical drama',
      'Mathematical breakthroughs in heliocentrism and zero'
    ],
    importantFacts: [
      'Gupta rulers issued the largest number of gold coins (known as Dinars) in ancient India.',
      'Mehrauli Iron Pillar (Delhi) stands rust-free for 1600+ years, dedicated to King Chandra (Chandragupta II).',
      'The practice of Sati is first recorded in the Eran Inscription of Madhya Pradesh (510 CE) during Gupta rule.',
      'Huna invasions during the reign of Skandagupta weakened the empire, leading to its collapse.',
      'Gupta kings patronized Bhagavatism (Vaishnavism) and adopted the Garuda symbol.'
    ],
    examples: [
      'The Iron Pillar of Mehrauli showcases the advanced metallurgy of the Gupta period.',
      'The Ajanta Cave paintings depict Jataka stories, showcasing fluid brushwork and natural dyes.'
    ],
    tables: [
      {
        title: 'Navaratnas (Nine Gems) of Chandragupta II',
        headers: ['Scholar Name', 'Field of Expertise', 'Famous Work'],
        rows: [
          ['Kalidasa', 'Sanskrit Drama and Poetry', 'Abhijnanasakuntalam, Meghadutam'],
          ['Amarasimha', 'Lexicographer / Grammarian', 'Amarakosha'],
          ['Varahamihira', 'Astronomy & Astrology', 'Pancha-Siddhantika, Brihatsamhita'],
          ['Dhanvantari', 'Medicine / Ayurveda', 'Ayurveda Shastra'],
          ['Veraprasada', 'Grammarian', 'Vyakarana treatises']
        ]
      }
    ],
    revisionNotes: 'Exam Pointer: Samudragupta = Allahabad Pillar (Harishena); Chandragupta II = Navaratnas, Fa-Hien, Shaka defeat; Kumargupta = Nalanda; Skandagupta = Huna invasions. Nagara temples start here.',
    pyqs: [
      {
        question: {
          en: 'With reference to the scientific progress of ancient India, which of the statements given below are correct? 1. Different kinds of specialized surgical instruments were in common use by the 1st century AD. 2. Transplant of internal organs in the human body was well known by the beginning of the 3rd century AD. 3. The concept of sine of an angle was known in the 5th century AD. 4. The concept of cyclic quadrilaterals was known in the 7th century AD.',
          hi: 'प्राचीन भारत की वैज्ञानिक प्रगति के संदर्भ में, नीचे दिए गए कथनों में से कौन से सही हैं? 1. पहली शताब्दी ईस्वी तक विभिन्न प्रकार के विशेष शल्य चिकित्सा उपकरणों का सामान्य उपयोग होता था। 2. तीसरी शताब्दी ईस्वी की शुरुआत तक मानव शरीर में आंतरिक अंगों का प्रत्यारोपण अच्छी तरह से ज्ञात था। 3. कोण के साइन (sine) की अवधारणा 5वीं शताब्दी ईस्वी में ज्ञात थी। 4. चक्रीय चतुर्भुज की अवधारणा 7वीं शताब्दी ईस्वी में ज्ञात थी।'
        },
        options: [
          { en: '1 and 2 only', hi: 'केवल 1 और 2' },
          { en: '3 and 4 only', hi: 'केवल 3 और 4' },
          { en: '1, 3 and 4 only', hi: '1, 3 और 4 केवल' },
          { en: '1, 2, 3 and 4', hi: '1, 2, 3 और 4' }
        ],
        answer: 2,
        explanation: {
          en: 'Statements 1, 3 and 4 are correct. Surgical instruments were detailed in Sushruta Samhita. Aryabhata introduced sine functions. Brahmagupta discussed cyclic quadrilaterals. Organ transplant (stmt 2) was NOT known in ancient India.',
          hi: 'कथन 1, 3 और 4 सही हैं। सुश्रुत संहिता में शल्य चिकित्सा उपकरणों का विवरण दिया गया था। आर्यभट्ट ने साइन फ़ंक्शन पेश किए। ब्रह्मगुप्त ने चक्रीय चतुर्भुजों पर चर्चा की। प्राचीन भारत में अंग प्रत्यारोपण (कथन 2) ज्ञात नहीं था।'
        },
        year: 2012
      }
    ]
  },
  {
    exam: 'UPSC',
    subject: 'History',
    topic: 'Medieval India',
    subtopic: 'Delhi Sultanate',
    introduction: 'The Delhi Sultanate (1206 – 1526 CE) refers to the five successive dynasties of Turkic, Afghan, and Persian origin that ruled from Delhi, establishing Islamic administrative systems in India.',
    detailedExplanation: `### The Five Dynasties of Delhi
The Delhi Sultanate comprises five distinct dynasties:
1. **Slave/Mamluk Dynasty (1206–1290):** Founded by Qutb-ud-din Aibak, a general of Muhammad Ghori. Notable rulers include Iltutmish (who introduced Chahalgani/Corp of Forty and Iqta systems) and Razia Sultana (first female ruler).
2. **Khalji Dynasty (1290–1320):** Founded by Jalaluddin Khalji. The most famous ruler was Alauddin Khalji, who instituted price controls, market regulations, and standing army reforms.
3. **Tughlaq Dynasty (1320–1414):** Founded by Ghiyasuddin Tughlaq. Muhammad bin Tughlaq is famous for his controversial experiments like shifting the capital to Daulatabad and introducing token currency. Firuz Shah Tughlaq is known for building canals, hospitals, and charity departments.
4. **Sayyid Dynasty (1414–1451):** Established by Khizr Khan.
5. **Lodi Dynasty (1451–1526):** Founded by Bahlul Lodi. Sikandar Lodi founded Agra. Ibrahim Lodi was defeated by Babur in the First Battle of Panipat (1526), ending the Sultanate.

### Alauddin Khalji\'s Market Reforms
To maintain a large standing army to defend against Mongol invasions, Alauddin Khalji introduced:
- **Price Control:** Fixed prices for all essential commodities like foodgrains, horses, cattle, and cloth.
- **Market Officers:** Appointed controllers called *Shahna-i-Mandi* to prevent hoarding and cheating.
- **Branding of Horses:** Introduced *Dagh* (branding of horses) and *Chehra* (descriptive roll of soldiers) systems.

### Administration & Nobility
The administration was centralized under the Sultan. Main departments included:
- *Diwan-i-Wizarat* (Finance department headed by Wazir)
- *Diwan-i-Arz* (Military department headed by Ariz-i-Mamalik)
- *Diwan-i-Insha* (State correspondence)
- *Diwan-i-Risalat* (Foreign/Religious affairs)`,
    concepts: [
      'The Iqta System (land assignments for civil/military service)',
      'Alauddin Khalji\'s agrarian and price control systems',
      'Muhammad bin Tughlaq\'s administrative shifts and currency reforms',
      'Indo-Islamic architectural synthesis (arches, domes, minarets)'
    ],
    importantFacts: [
      'Qutb Minar construction was started by Qutb-ud-din Aibak and completed by Iltutmish.',
      'Sizda and Paibos (prostration and kissing the feet of the king) were introduced by Ghiyasuddin Balban.',
      'Amir Khusrau, known as the "Parrot of India" (Tuti-e-Hind), served under seven Sultans.',
      'Ibn Battuta, a Moroccan traveler, visited India during the reign of Muhammad bin Tughlaq and wrote "Rihla".',
      'Agra city was founded by Sikandar Lodi in 1504.'
    ],
    examples: [
      'The Alai Darwaza, built by Alauddin Khalji, displays early true arches and dome construction in India.',
      'Muhammad bin Tughlaq\'s token bronze currency failed because the state could not prevent widespread counterfeiting.'
    ],
    tables: [
      {
        title: 'Major Departments in Delhi Sultanate',
        headers: ['Department Name', 'Function / Activity', 'Created / Developed By'],
        rows: [
          ['Diwan-i-Arz', 'Military Department', 'Balban'],
          ['Diwan-i-Mustakhraj', 'Revenue Arrears', 'Alauddin Khalji'],
          ['Diwan-i-Kohi', 'Agricultural Development', 'Muhammad bin Tughlaq'],
          ['Diwan-i-Khairat', 'Charity & Welfare', 'Firuz Shah Tughlaq'],
          ['Diwan-i-Bundagan', 'Slaves Department', 'Firuz Shah Tughlaq']
        ]
      }
    ],
    revisionNotes: 'Sultanate Dynasties: Slave -> Khalji -> Tughlaq -> Sayyid -> Lodi. Iltutmish = Iqta + Chahalgani. Alauddin = Market reforms + Dagh. Muhammad bin Tughlaq = Token coin + Daulatabad. Ibrahim Lodi = Panipat 1526 defeat.',
    pyqs: [
      {
        question: {
          en: 'Which Sultan of Delhi established a separate department (Diwan-i-Kohi) to improve agriculture?',
          hi: 'दिल्ली के किस सुल्तान ने कृषि में सुधार के लिए एक अलग विभाग (दीवान-ए-कोही) की स्थापना की?'
        },
        options: [
          { en: 'Alauddin Khalji', hi: 'अलाउद्दीन खिलजी' },
          { en: 'Muhammad bin Tughlaq', hi: 'मोहम्मद बिन तुगलक' },
          { en: 'Firuz Shah Tughlaq', hi: 'फिरोज शाह तुगलक' },
          { en: 'Balban', hi: 'बलबन' }
        ],
        answer: 1,
        explanation: {
          en: 'Muhammad bin Tughlaq created Diwan-i-Kohi to promote state-controlled agricultural loans and crop rotation.',
          hi: 'मोहम्मद बिन तुगलक ने राज्य-नियंत्रित कृषि ऋण और फसल चक्र को बढ़ावा देने के लिए दीवान-ए-कोही का निर्माण किया।'
        },
        year: 2018
      }
    ]
  },
  {
    exam: 'UPSC',
    subject: 'History',
    topic: 'Modern India',
    subtopic: 'Revolt of 1857',
    introduction: 'The Revolt of 1857, also known as the Sepoy Mutiny or the First War of Independence, was a major rebellion against East India Company rule in northern and central India.',
    detailedExplanation: `### Background and Multiple Causes
The rebellion was the culmination of accumulated grievances against British policies:
- **Political Causes:** Lord Dalhousie\'s *Doctrine of Lapse* (annexing Jhansi, Satara, Sambalpur) and the annexation of Awadh in 1856 on charges of maladministration created deep resentment among Indian rulers.
- **Economic Causes:** High land revenue systems (Permanent, Ryotwari, Mahalwari), heavy taxation, and destruction of traditional Indian handicraft industries ruined peasants and artisans.
- **Social and Religious Causes:** British reforms like the abolition of Sati (1829), promotion of Western education, and activities of Christian missionaries caused fear of forced conversions.
- **Military Causes:** Low salaries, discrimination against Indian sepoys compared to British counterparts, and the General Service Enlistment Act of 1856 (mandating overseas deployment, which crossed religious taboos).

### The Immediate Cause and Outbreak
The spark was the introduction of the *Enfield Rifle*, whose cartridges were rumoured to be greased with beef and pork fat. Soldiers had to bite off the paper cartridge cover, offending both Hindus and Muslims.
- **March 29, 1857:** Mangal Pandey of the 34th Native Infantry at Barrackpore revolted and fired at his British officers.
- **May 10, 1857:** The main rebellion broke out at Meerut when sepoys marched to Delhi, declared Bahadur Shah Zafar as the Emperor of Hindustan, and initiated the uprising.

### Major Centers and Leadership
The revolt was concentrated in North and Central India:
- **Delhi:** Bahadur Shah Zafar (nominally) and General Bakht Khan (military lead).
- **Kanpur:** Nana Sahib (adopted son of Peshwa Baji Rao II), Tantia Tope, and Azimullah.
- **Lucknow:** Begum Hazrat Mahal of Awadh.
- **Jhansi:** Rani Lakshmibai.
- **Bihar:** Kunwar Singh of Jagdishpur.

### Suppression and Aftermath
The revolt was suppressed by British officers like John Nicholson (Delhi), Colin Campbell (Kanpur, Lucknow), and Hugh Rose (Jhansi).
- **Government of India Act 1858:** Abolished East India Company rule, transferring administration directly to the British Crown.
- **Secretary of State for India:** Created as a cabinet post in London, while the Governor-General was designated the Viceroy (Lord Canning was the first).
- **Army Restructuring:** The Peel Commission recommended increasing the proportion of European soldiers and recruiting from "martial races" (Gurkhas, Sikhs).`,
    concepts: [
      'Accumulated anti-colonial grievances vs immediate triggers',
      'Failure of localized coordination and national integration',
      'Transition from Company rule to direct Crown rule',
      'Divide and Rule military restructuring'
    ],
    importantFacts: [
      'Lord Canning was the Governor-General during the Revolt of 1857.',
      'Kunwar Singh, an 80-year-old landlord of Jagdishpur, Bihar, fought heroic battles and remained undefeated.',
      'Sir Hugh Rose described Rani Lakshmibai as "the best and bravest military leader of the rebels".',
      'The educated Indian middle class and major princely states (Gwalior, Hyderabad) remained loyal to the British.',
      'Tantia Tope was captured and executed in April 1859, marking the end of the revolt.'
    ],
    examples: [
      'The proclamation of Bahadur Shah Zafar as emperor showed a symbolic desire to restore pre-British political unity.',
      'British reliance on Sikh and Gurkha troops to suppress the rebellion led to their designation as "martial races".'
    ],
    tables: [
      {
        title: 'Revolt Centers and British Officers Who Suppressed Them',
        headers: ['Center of Revolt', 'Indian Leader', 'British Officer in Charge'],
        rows: [
          ['Delhi', 'Bahadur Shah II / Bakht Khan', 'John Nicholson, Hudson'],
          ['Kanpur', 'Nana Sahib, Tantia Tope', 'Colin Campbell'],
          ['Lucknow', 'Begum Hazrat Mahal', 'Colin Campbell, Henry Havelock'],
          ['Jhansi', 'Rani Lakshmibai', 'Hugh Rose'],
          ['Bihar (Jagdishpur)', 'Kunwar Singh', 'William Taylor, Vincent Eyre']
        ]
      }
    ],
    revisionNotes: 'Must remember: Canning was Governor-General. 1858 Act ended Company rule. Viceroy post created. Doctrine of Lapse abolished. Nana Sahib = Kanpur; Begum Hazrat = Lucknow; Kunwar Singh = Bihar; Rani Lakshmibai = Jhansi.',
    pyqs: [
      {
        question: {
          en: 'With reference to the Revolt of 1857, who among the following was betrayed by a friend, captured and put to death by the British?',
          hi: '1857 के विद्रोह के संदर्भ में, निम्नलिखित में से किसे एक मित्र ने धोखा दिया, गिरफ्तार किया गया और अंग्रेजों द्वारा मार दिया गया?'
        },
        options: [
          { en: 'Nana Sahib', hi: 'नाना साहिब' },
          { en: 'Kunwar Singh', hi: 'कुंवर सिंह' },
          { en: 'Khan Bahadur Khan', hi: 'खान बहादुर खान' },
          { en: 'Tantia Tope', hi: 'तांत्या टोपे' }
        ],
        answer: 3,
        explanation: {
          en: 'Tantia Tope was betrayed by Mansingh, a feudatory chief of Gwalior, and captured by the British in the forests of Aroni, leading to his execution.',
          hi: 'तांत्या टोपे को ग्वालियर के एक सामंती प्रमुख मानसिंह ने धोखा दिया था, और अंग्रेजों ने उन्हें अरण्य के जंगलों में पकड़ लिया था, जिसके बाद उन्हें फांसी दे दी गई थी।'
        },
        year: 2011
      }
    ]
  },
  {
    exam: 'UPSC',
    subject: 'History',
    topic: 'Modern India',
    subtopic: 'Partition of Bengal and Swadeshi Movement',
    introduction: 'The Partition of Bengal (1905) and the subsequent Swadeshi Movement marked the beginning of modern organized mass nationalism in India, introducing boycott and self-reliance campaigns.',
    detailedExplanation: `### The Partition Plan (1905)
Announced by Viceroy Lord Curzon in July 1905 and implemented on October 16, 1905.
- **Official Reason:** Bengal was too large to be administered efficiently by a single Lieutenant Governor.
- **Real Motive:** Bengal was the nerve-center of Indian nationalism. The partition aimed to divide the population along communal lines (Muslim-majority East Bengal vs Hindu-majority West Bengal) and reduce Bengalis to a minority in their own state.

### Anti-Partition Movement & Rise of Swadeshi
The announcement sparked immediate protests led by moderates like Surendranath Banerjea, K.K. Mitra, and Ananda Mohan Bose.
- **October 16, 1905:** Declared a day of national mourning. People kept fasts, marched in processions singing "Vande Mataram", and tied Rakhi on each other's wrists as a symbol of unity.
- **Swadeshi and Boycott Resolution:** Passed at the Town Hall of Calcutta on August 7, 1905. The movement focused on using indigenous goods (*Swadeshi*) and boycotting British goods, schools, and courts.

### Extremist Leadership and Expansion
Extremists like Bal Gangadhar Tilak, Bipin Chandra Pal, Lala Lajpat Rai (Lal-Bal-Pal), and Aurobindo Ghosh advocated expanding the movement beyond Bengal and converting it into a full political struggle for *Swaraj* (Self-rule).
- **National Education:** National Council of Education was set up in 1906, establishing Bengal National College.
- **Swadeshi Enterprises:** Setting up of Swadeshi steam navigation companies, textile mills, soap factories, and banks (e.g., Bengal Chemicals by Prafulla Chandra Ray).`,
    concepts: [
      'Divide and Rule administrative policies',
      'Economic nationalism through Swadeshi enterprise',
      'The strategy of boycott and passive resistance',
      'Ideological split between Moderates and Extremists (Surat Split 1907)'
    ],
    importantFacts: [
      'Lord Curzon was the Viceroy who partitioned Bengal.',
      'Vande Mataram (written by Bankim Chandra Chattopadhyay) became the theme song of the movement.',
      'Rabindranath Tagore composed "Amar Shonar Bangla" (now Bangladesh\'s national anthem) during this movement.',
      'The Swadeshi Movement led to the Surat Split of the Indian National Congress in 1907 between Moderates and Extremists.',
      'The Partition of Bengal was annulled in 1911 by Lord Hardinge at the Delhi Durbar.'
    ],
    examples: [
      'The establishment of Bengal Chemicals Pharmaceutical Works by Acharya Prafulla Chandra Ray showed practical economic Swadeshi.',
      'Student participation in boycotting government colleges led to the Carlyle Circular, penalizing schools that took part in politics.'
    ],
    tables: [
      {
        title: 'Swadeshi Movement Leaders and Areas of Operation',
        headers: ['Nationalist Leader', 'Primary Region of Activity', 'Key Contribution'],
        rows: [
          ['Bal Gangadhar Tilak', 'Bombay & Poona', 'Organized Shivaji and Ganpati festivals to raise nationalism'],
          ['Lala Lajpat Rai & Ajit Singh', 'Punjab', 'Led agrarian agitation and Swadeshi lectures'],
          ['Syed Haider Raza', 'Delhi', 'Led Swadeshi campaigns among the masses'],
          ['Chidambaram Pillai', 'Madras Presidency (Tuticorin)', 'Founded the Swadeshi Steam Navigation Company'],
          ['Aurobindo Ghosh', 'Bengal / National', 'Editor of Bande Mataram journal, advocated passive resistance']
        ]
      }
    ],
    revisionNotes: 'Partition announced: July 1905; Implemented: 16 Oct 1905. Curzon = Viceroy. Swadeshi resolution: 7 Aug 1905 (Town Hall Calcutta). Reversal of Partition: 1911 by Lord Hardinge. Resulted in Surat Split (1907).',
    pyqs: [
      {
        question: {
          en: 'Which of the following books/writings inspired Swadeshi activists and contained the song Vande Mataram?',
          hi: 'निम्नलिखित में से किस पुस्तक/लेखन ने स्वदेशी कार्यकर्ताओं को प्रेरित किया और उसमें वंदे मातरम गीत शामिल था?'
        },
        options: [
          { en: 'Gitanjali', hi: 'गीतांजलि' },
          { en: 'Anandamath', hi: 'आनंदमठ' },
          { en: 'Satyarth Prakash', hi: 'सत्यार्थ प्रकाश' },
          { en: 'Gora', hi: 'गोरा' }
        ],
        answer: 1,
        explanation: {
          en: 'The national song "Vande Mataram" is part of Bankim Chandra Chattopadhyay\'s novel "Anandamath", published in 1882.',
          hi: 'राष्ट्रीय गीत "वंदे मातरम" बंकिम चंद्र चट्टोपाध्याय के 1882 में प्रकाशित उपन्यास "आनंदमठ" का हिस्सा है।'
        },
        year: 2015
      }
    ]
  },
  {
    exam: 'UPSC',
    subject: 'Polity',
    topic: 'Indian Governance',
    subtopic: 'Preamble of the Constitution',
    introduction: 'The Preamble is the introductory statement of the Constitution of India, setting out the ideals, objectives, principles, source of authority, and date of adoption of the constitution.',
    detailedExplanation: `### Origin and Objectives Resolution
The Preamble is based on the **Objectives Resolution** drafted and moved by Jawaharlal Nehru in the Constituent Assembly on December 13, 1946, and unanimously adopted on January 22, 1947.

### Key Ingredients of the Preamble
The Preamble reveals four main components:
1. **Source of Authority:** The Preamble states that the Constitution derives its authority from the people of India ("We, the People of India").
2. **Nature of Indian State:** Declares India to be a **Sovereign, Socialist, Secular, Democratic, Republican** polity.
3. **Objectives of the Constitution:** Specifies Justice, Liberty, Equality, and Fraternity as the core objectives.
4. **Date of Adoption:** November 26, 1949.

### Key Terms Explained
- **Sovereign:** Absolute independent authority, free from external control.
- **Socialist:** Democratic socialism aiming to end poverty, disease, and inequality (added by the 42nd Amendment).
- **Secular:** The state has no official religion and treats all religions equally (added by the 42nd Amendment).
- **Democratic:** Rule of law based on popular sovereignty.
- **Republic:** The head of state (President) is elected, not hereditary.

### Is Preamble Part of the Constitution?
The legal status of the Preamble evolved through landmark Supreme Court cases:
- **Berubari Union Case (1960):** SC ruled that Preamble is a key to open the minds of the makers, but it is **not** a part of the Constitution.
- **Kesavananda Bharati Case (1973):** SC rejected the earlier opinion and held that the Preamble **is** a part of the Constitution. It can be amended under Article 368, but its "Basic Structure" cannot be altered.
- **LIC of India Case (1995):** SC reiterated that the Preamble is an integral part of the Constitution.`,
    concepts: [
      'Popular sovereignty ("We, the People")',
      'The difference between state religion, secularism, and anti-religious states',
      'Justiciability of the Preamble (it is non-justiciable in courts)',
      'Basic Structure Doctrine and Preamble amendment boundaries'
    ],
    importantFacts: [
      'The Preamble has been amended only ONCE so far, by the 42nd Constitutional Amendment Act (1976).',
      'The 42nd Amendment added three new words: "Socialist", "Secular", and "Integrity".',
      'The ideals of Liberty, Equality, and Fraternity were borrowed from the French Revolution.',
      'The ideal of Justice (Social, Economic, and Political) was borrowed from the Russian Revolution (1917).',
      'K.M. Munshi called the Preamble the "Horoscope of our sovereign democratic republic".'
    ],
    examples: [
      'The Supreme Court in the SR Bommai Case (1994) cited the Preamble to establish Secularism as part of the Basic Structure.',
      'Unlike the main articles, the Preamble cannot be directly enforced in a court of law to obtain remedies (Non-justiciability).'
    ],
    tables: [
      {
        title: 'Core Terms and Constitutional Status Summary',
        headers: ['Core Value', 'Source / Borrowed From', 'Amendability / Judicial Status'],
        rows: [
          ['Sovereign, Democratic, Republic', 'Original 1950 Draft', 'Part of Basic Structure, cannot be destroyed'],
          ['Socialist, Secular, Integrity', '42nd Amendment (1976)', 'Added to expand social welfare and communal harmony'],
          ['Justice (Social, Economic, Political)', 'Russian Revolution', 'Achieved through DPSP and Fundamental Rights'],
          ['Liberty, Equality, Fraternity', 'French Revolution', 'Implemented via Articles 14 to 21']
        ]
      }
    ],
    revisionNotes: 'Preamble Summary: Based on Nehru\'s Objectives Resolution. Part of Constitution (Kesavananda 1973). Amended once (42nd Amendment 1976) adding Socialist, Secular, Integrity. Non-justiciable.',
    pyqs: [
      {
        question: {
          en: 'What was the exact constitutional status of India on 26th January 1950?',
          hi: '26 जनवरी 1950 को भारत की वास्तविक संवैधानिक स्थिति क्या थी?'
        },
        options: [
          { en: 'A Democratic Republic', hi: 'एक लोकतांत्रिक गणराज्य' },
          { en: 'A Sovereign Democratic Republic', hi: 'एक संप्रभु लोकतांत्रिक गणराज्य' },
          { en: 'A Sovereign Secular Democratic Republic', hi: 'एक संप्रभु धर्मनिरपेक्ष लोकतांत्रिक गणराज्य' },
          { en: 'A Sovereign Socialist Secular Democratic Republic', hi: 'एक संप्रभु समाजवादी धर्मनिरपेक्ष लोकतांत्रिक गणराज्य' }
        ],
        answer: 1,
        explanation: {
          en: 'On Jan 26, 1950, the words "Socialist" and "Secular" were not present. India was a "Sovereign Democratic Republic". Those words were added later in 1976.',
          hi: '26 जनवरी 1950 को "समाजवादी" और "धर्मनिरपेक्ष" शब्द मौजूद नहीं थे। भारत एक "संप्रभु लोकतांत्रिक गणराज्य" था। इन शब्दों को बाद में 1976 में जोड़ा गया।'
        },
        year: 2021
      }
    ]
  },
  {
    exam: 'UPSC',
    subject: 'Polity',
    topic: 'Indian Governance',
    subtopic: 'Fundamental Rights (Part III)',
    introduction: 'Fundamental Rights are enshrined in Part III of the Constitution of India (Articles 12 to 35), acting as a charter of liberties protecting citizens from state overreach.',
    detailedExplanation: `### Nature and Classification
Fundamental Rights (FRs) are guaranteed to all citizens. They are called "fundamental" because they are guaranteed and protected by the Constitution, the fundamental law of the land, and are essential for the all-round development of individuals.
- **Justiciable:** Individuals can move the Supreme Court (under Article 32) or High Courts (under Article 226) directly if their FRs are violated.
- **Not Absolute:** Subject to reasonable restrictions imposed by the State (e.g., public order, security, morality).
- **Suspension:** Can be suspended during a National Emergency, except the rights guaranteed by Articles 20 and 21.

### The Six Groups of Fundamental Rights
Originally, the Constitution provided for seven FRs, but the Right to Property (Article 31) was deleted by the 44th Amendment in 1978 and made a legal right under Article 300A. The remaining six are:
1. **Right to Equality (Articles 14–18):** Equality before law, prohibition of discrimination, equality of opportunity, abolition of untouchability, and titles.
2. **Right to Freedom (Articles 19–22):** Six freedoms (speech, assembly, association, movement, residence, profession), protection in conviction, protection of life and personal liberty, and right to education.
3. **Right against Exploitation (Articles 23–24):** Prohibition of human trafficking and forced labor (*begar*), prohibition of child labor in factories.
4. **Right to Freedom of Religion (Articles 25–28):** Freedom of conscience, profession, practice, and propagation of religion; freedom to manage religious affairs.
5. **Cultural and Educational Rights (Articles 29–30):** Protection of language, script, and culture of minorities; right of minorities to establish educational institutions.
6. **Right to Constitutional Remedies (Article 32):** Right to move the SC for enforcement of rights using writs.

### Article 21: Life and Personal Liberty
Article 21 states: "No person shall be deprived of his life or personal liberty except according to procedure established by law." The Supreme Court in the *Maneka Gandhi Case (1978)* expanded Article 21 to include "Due Process of Law" and read several rights into it, such as the Right to Privacy, Right to Clean Environment, and Right to Speedy Trial.`,
    concepts: [
      'Justiciability and judicial review under Article 13',
      'Equality before Law (British) vs Equal Protection of Law (American)',
      'Procedure established by Law vs Due Process of Law',
      'The writ jurisdiction of Supreme Court (Art 32) and High Courts (Art 226)'
    ],
    importantFacts: [
      'Fundamental Rights are borrowed from the Constitution of the USA (Bill of Rights).',
      'Part III of the Constitution is described as the Magna Carta of India.',
      'Article 32 was described by Dr. B.R. Ambedkar as the "Heart and Soul of the Constitution".',
      'Rights available ONLY to citizens of India: Articles 15, 16, 19, 29, and 30.',
      'Rights available to both citizens and foreigners (except enemy aliens): Articles 14, 20, 21, 21A, 22, 23, 24, 25, 26, 27, and 28.'
    ],
    examples: [
      'The Supreme Court in K.S. Puttaswamy Case (2017) declared the Right to Privacy as an intrinsic part of Article 21.',
      'The enforcement of Habeas Corpus to release a person illegally detained by state police.'
    ],
    tables: [
      {
        title: 'Types of Writs Under Article 32',
        headers: ['Writ Name', 'Literal Meaning', 'Issued Against', 'Purpose'],
        rows: [
          ['Habeas Corpus', '"To have the body of"', 'Public authorities & private individuals', 'To release a person detained illegally'],
          ['Mandamus', '"We command"', 'Public officials, lower courts, corporations', 'To perform a mandatory public duty'],
          ['Prohibition', '"To forbid"', 'Judicial and quasi-judicial bodies', 'To prevent lower courts from exceeding jurisdiction'],
          ['Certiorari', '"To be certified"', 'Judicial, quasi-judicial, & administrative bodies', 'To quash the order of a lower court'],
          ['Quo-Warranto', '"By what authority?"', 'Public offices of permanent character', 'To prevent illegal usurpation of a public office']
        ]
      }
    ],
    revisionNotes: 'FR Summary: Part III, Articles 12-35. Borrowed from USA. Justiciable. Article 19 = 6 freedoms. Articles 20 & 21 cannot be suspended during emergency. Right to Property is now legal right (Art 300A). Art 32 = writs.',
    pyqs: [
      {
        question: {
          en: 'Which Article of the Constitution of India safeguards one\'s right to marry the person of one\'s choice?',
          hi: 'भारत के संविधान का कौन सा अनुच्छेद किसी व्यक्ति को अपनी पसंद के व्यक्ति से विवाह करने के अधिकार की रक्षा करता है?'
        },
        options: [
          { en: 'Article 19', hi: 'अनुच्छेद 19' },
          { en: 'Article 21', hi: 'अनुच्छेद 21' },
          { en: 'Article 25', hi: 'अनुच्छेद 25' },
          { en: 'Article 29', hi: 'अनुच्छेद 29' }
        ],
        answer: 1,
        explanation: {
          en: 'The right to marry a person of one\'s choice is integral to the right to life and personal liberty under Article 21, as ruled by the Supreme Court in the Hadiya Case (2018).',
          hi: 'अपनी पसंद के व्यक्ति से शादी करने का अधिकार अनुच्छेद 21 के तहत जीवन और व्यक्तिगत स्वतंत्रता के अधिकार का अभिन्न अंग है, जैसा कि सुप्रीम कोर्ट ने हादिया मामले (2018) में फैसला सुनाया था।'
        },
        year: 2019
      }
    ]
  },
  {
    exam: 'UPSC',
    subject: 'Polity',
    topic: 'Indian Governance',
    subtopic: 'Directive Principles of State Policy (Part IV)',
    introduction: 'The Directive Principles of State Policy (DPSP) are guidelines contained in Part IV of the Constitution (Articles 36 to 51) that the State must keep in mind while formulating policies and enacting laws.',
    detailedExplanation: `### Nature and Objective
Directive Principles represent the socio-economic goals that the constitution-makers wanted India to achieve:
- **Non-Justiciable:** Unlike Fundamental Rights, DPSPs are not enforceable by courts (Article 37). A citizen cannot sue the government if it fails to provide work or equal pay.
- **Instrument of Instructions:** They serve as active recommendations to legislature and executive branches.
- **Aim:** To establish a **Welfare State** and promote socio-economic justice, unlike Fundamental Rights which establish political democracy.

### Classification of Directive Principles
Although the Constitution does not classify DPSPs, they are categorized into three broad types based on their content:
1. **Socialistic Principles (Articles 38, 39, 39A, 41, 42, 43, 43A, 47):** Aim to secure welfare, equal distribution of resources, right to work, humane working conditions, and living wages.
2. **Gandhian Principles (Articles 40, 43, 43B, 46, 47, 48):** Reflect Gandhi\'s reconstruction program, including organizing village panchayats, promoting cottage industries, banning intoxicating drinks, and prohibiting slaughter of cows.
3. **Liberal-Intellectual Principles (Articles 44, 45, 48, 48A, 49, 50, 51):** Focus on a Uniform Civil Code, free early childhood education, protecting the environment, separating the judiciary from the executive, and promoting international peace.

### DPSP vs Fundamental Rights Conflict
The conflict between Part III and Part IV was resolved by the Supreme Court in various cases:
- *Champakam Dorairajan Case (1951):* FRs are superior, and DPSPs act as subsidiary.
- *Golaknath Case (1967):* FRs are sacrosanct and cannot be amended to implement DPSPs.
- *Minerva Mills Case (1980):* The Constitution is founded on the bedrock of the balance between Part III (FRs) and Part IV (DPSPs). They are like two wheels of a chariot.`,
    concepts: [
      'Concept of a Welfare State vs Laissez-faire Police State',
      'Non-justiciability and the legislative discretion of the State',
      'Harmonious construction between Part III and Part IV',
      'Uniform Civil Code debates under Article 44'
    ],
    importantFacts: [
      'DPSPs are borrowed from the Constitution of Ireland (which in turn borrowed them from Spain).',
      'Article 37 declares that these principles are fundamental in the governance of the country.',
      'Article 39A (Free Legal Aid) and Article 43A (Workers participation in management) were added by the 42nd Amendment (1976).',
      'Article 45 was modified by the 86th Amendment (2002), making elementary education a Fundamental Right under Article 21A.',
      'Article 40 directs the State to organize village panchayats.'
    ],
    examples: [
      'The Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA) implements Article 41 (Right to work).',
      'Maternity Benefit Act implements Article 42 (Humane conditions of work and maternity relief).'
    ],
    tables: [
      {
        title: 'Important DPSP Articles and Key Directions',
        headers: ['Article No.', 'Category', 'Key Directive / Provision'],
        rows: [
          ['Article 39A', 'Socialistic', 'Equal justice and free legal aid to the poor'],
          ['Article 40', 'Gandhian', 'Organization of village panchayats as units of self-government'],
          ['Article 44', 'Liberal-Intellectual', 'Secure a Uniform Civil Code (UCC) for all citizens'],
          ['Article 48A', 'Liberal-Intellectual', 'Protection and improvement of environment, forests, and wildlife'],
          ['Article 50', 'Liberal-Intellectual', 'Separation of judiciary from the executive in public services']
        ]
      }
    ],
    revisionNotes: 'DPSP Summary: Part IV, Articles 36-51. Borrowed from Ireland. Non-justiciable but fundamental to governance. Aim: Welfare State. Balance with FRs = Minerva Mills (1980). Article 44 = UCC. Article 50 = Sep of Judiciary.',
    pyqs: [
      {
        question: {
          en: 'Under the Constitution of India, promotion of international peace and security is included in the:',
          hi: 'भारत के संविधान के अंतर्गत, अंतर्राष्ट्रीय शांति और सुरक्षा को बढ़ावा देना किसमें शामिल है?'
        },
        options: [
          { en: 'Preamble to the Constitution', hi: 'संविधान की प्रस्तावना' },
          { en: 'Directive Principles of State Policy', hi: 'राज्य के नीति निर्देशक सिद्धांत' },
          { en: 'Fundamental Duties', hi: 'मौलिक कर्तव्य' },
          { en: 'Ninth Schedule', hi: 'नौवीं अनुसूची' }
        ],
        answer: 1,
        explanation: {
          en: 'Article 51 of the Constitution, which is a Directive Principle of State Policy (DPSP), directs the State to promote international peace and security.',
          hi: 'संविधान का अनुच्छेद 51, जो राज्य के नीति निर्देशक सिद्धांत (DPSP) का हिस्सा है, राज्य को अंतर्राष्ट्रीय शांति और सुरक्षा को बढ़ावा देने का निर्देश देता है।'
        },
        year: 2014
      }
    ]
  },
  {
    exam: 'UPSC',
    subject: 'Geography',
    topic: 'Physical Geography',
    subtopic: 'Physical Divisions of India',
    introduction: 'India has a diverse landscape divided into six main physiographic divisions, shaped by geological structures and tectonic activities.',
    detailedExplanation: `### The Six Physiographic Divisions of India
India can be divided into the following physiographic units:
1. **The Northern Mountains (Himalayas):** Young fold mountains stretching from the Indus to the Brahmaputra. Divided into Trans-Himalayas, Greater Himalayas (Himadri), Lesser Himalayas (Himachal), and Outer Himalayas (Shiwaliks). Created by the collision of the Indo-Australian plate with the Eurasian plate.
2. **The Northern Plains:** Formed by the alluvial deposits of the Indus, Ganga, and Brahmaputra rivers. Divided from north to south into:
   - *Bhabar:* Pebble-studded belt where streams disappear.
   - *Terai:* Marshy, swampy, and heavily forested region.
   - *Bhangar:* Older, elevated alluvium containing Kankar (calcareous deposits).
   - *Khadar:* Newer, highly fertile floodplains.
3. **The Peninsular Plateau:** The oldest and most stable landmass of India, composed of igneous and metamorphic rocks. Divided into Central Highlands (Malwa, Vindhyas) and Deccan Plateau (delineated by Western Ghats/Sahyadris and Eastern Ghats).
4. **The Indian Desert (Thar):** Located west of the Aravali hills, characterized by low rainfall (<150 mm/year) and arid vegetation.
5. **The Coastal Plains:** Narrow coastal strips along the Arabian Sea (Western Coast: Konkan, Kanara, Malabar) and Bay of Bengal (Eastern Coast: Northern Circars, Coromandel Coast).
6. **The Islands:** Andaman and Nicobar Islands in the Bay of Bengal (volcanic origin, split by Ten Degree Channel) and Lakshadweep Islands in the Arabian Sea (coral origin).`,
    concepts: [
      'Plate tectonics and the collision forming Himalayas',
      'Alluvium sorting in Bhabar, Terai, Bhangar, Khadar',
      'Western Ghats (continuous, higher) vs Eastern Ghats (discontinuous, lower)',
      'Volcanic vs Coral island geomorphology'
    ],
    importantFacts: [
      'K2 (Godwin Austen) is the highest peak in India, located in the Karakoram range.',
      'Anamudi (2,695 m) in Kerala is the highest peak of the Peninsular Plateau and Western Ghats.',
      'The Western Ghats are older than the Himalayas and are recognized as a UNESCO World Heritage biodiversity hotspot.',
      'The Ten Degree Channel separates the Andaman Islands from the Nicobar Islands.',
      'Majuli in Assam is the largest river island in the world, formed by the Brahmaputra river.'
    ],
    examples: [
      'The presence of marine fossils in the Himalayas proves they rose from the ancient Tethys Sea.',
      'The Deccan Trap was formed by volcanic fissure eruptions during the Cretaceous period.'
    ],
    tables: [
      {
        title: 'Key Mountain Passes of India',
        headers: ['Pass Name', 'State / UT', 'Connects / Route'],
        rows: [
          ['Zoji La', 'Ladakh', 'Srinagar to Leh'],
          ['Shipki La', 'Himachal Pradesh', 'HP to Tibet (Sutlej gorge)'],
          ['Nathu La', 'Sikkim', 'Sikkim to Tibet (Chumbi Valley)'],
          ['Bomdi La', 'Arunachal Pradesh', 'Arunachal to Lhasa (Tibet)'],
          ['Thal Ghat', 'Maharashtra', 'Mumbai to Nashik (Western Ghats)']
        ]
      }
    ],
    revisionNotes: 'Physiography Summary: 6 divisions. Himalayas = young fold. Plains = Bhabar (pebbles), Terai (marsh), Bhangar (old alluvium), Khadar (new alluvium). Western Ghats = continuous. Eastern Ghats = broken. 10 Degree Channel = Andaman & Nicobar.',
    pyqs: [
      {
        question: {
          en: 'When you travel in Himalayas, you will see which of the following? 1. Deep gorges. 2. U-turn river courses. 3. Parallel mountain ranges. 4. Steep gradients causing landslips.',
          hi: 'जब आप हिमालय में यात्रा करेंगे, तो आप निम्नलिखित में से क्या देखेंगे? 1. गहरे खड्डे। 2. यू-टर्न नदी मार्ग। 3. समानांतर पर्वत श्रृंखलाएं। 4. भूस्खलन का कारण बनने वाली तीव्र ढलानें।'
        },
        options: [
          { en: '1 and 2 only', hi: 'केवल 1 और 2' },
          { en: '1, 2 and 3 only', hi: '1, 2 और 3 केवल' },
          { en: '3 and 4 only', hi: 'केवल 3 और 4' },
          { en: '1, 2, 3 and 4', hi: '1, 2, 3 और 4' }
        ],
        answer: 3,
        explanation: {
          en: 'All four phenomena are characteristic of the young age of the Himalayas, which are tectonic fold mountains experiencing uplift and river erosion.',
          hi: 'ये चारों घटनाएं हिमालय की युवावस्था की विशेषता हैं, जो उत्थान और नदी अपरदन का अनुभव करने वाले विवर्तनिक वलित पर्वत हैं।'
        },
        year: 2012
      }
    ]
  },
  {
    exam: 'BPSC',
    subject: 'State GK',
    topic: 'Bihar History',
    subtopic: 'Ancient Bihar (Mahajanapadas & Magadha)',
    introduction: 'Bihar was the seat of major ancient Indian empires and religious movements, acting as the political center of Magadha.',
    detailedExplanation: `### The Mahajanapadas of Bihar
During the 6th century BCE, the Anguttara Nikaya (Buddhist text) mentions 16 Mahajanapadas. Three were located in Bihar:
1. **Magadha (Patna, Gaya, Nalanda):** Succeeded in establishing the first pan-Indian empire.
2. **Anga (Bhagalpur, Munger):** Capital was Champa. Annexed into Magadha by Bimbisara.
3. **Vajji (Vaishali):** A confederacy of eight clans, of which the Lichchhavis were the most prominent. It was the world\'s first republic.

### The Magadha Empire Dynasties
- **Haryanka Dynasty:** Founded by **Bimbisara** (544–492 BCE), who used matrimonial alliances and conquest (annexing Anga). His son **Ajatashatru** built the fort of Rajgriha and Patali village (later Pataliputra).
- **Shishunaga Dynasty:** Shifted the capital temporarily to Vaishali and defeated Avanti.
- **Nanda Dynasty:** Mahapadma Nanda was a powerful ruler (known as Ekarat / Ugrasena). The last ruler, Dhana Nanda, was defeated by Chandragupta Maurya.
- **Maurya Dynasty:** Established centralized empire with Pataliputra as capital.

### Religious Movements
- **Buddhism:** Gautama Buddha attained Enlightenment at Bodh Gaya under the Bodhi tree. The First Buddhist Council was held at Rajgriha (483 BCE) under Ajatashatru.
- **Jainism:** Lord Mahavira (24th Tirthankara) was born at Kundagram (Vaishali) and attained Nirvana at Pawapuri (Nalanda).`,
    concepts: [
      'Matrimonial alliances as statecraft (Bimbisara)',
      'The republic structure of Lichchhavis',
      'Geographical advantages of Magadha (iron mines, natural defenses of Rajgir)'
    ],
    importantFacts: [
      'The world\'s first republic was established in Vaishali by the Lichchhavis.',
      'Udayin, a Haryanka ruler, founded Pataliputra and shifted the capital there from Rajgriha.',
      'Bimbisara was a contemporary of both Buddha and Mahavira.',
      'Nalanda University was established during the Gupta period by Kumargupta I.',
      'Vikramashila University was founded by Dharmapala of the Pala Dynasty.'
    ],
    examples: [
      'Magadha used war elephants on a large scale for the first time in Indian warfare due to their abundance in local forests.'
    ],
    tables: [
      {
        title: 'Buddhist Councils Held in Bihar',
        headers: ['Council', 'Year', 'Location', 'Patron Ruler', 'President'],
        rows: [
          ['1st Council', '483 BCE', 'Rajgriha (Sattapanni Cave)', 'Ajatashatru', 'Mahakashyapa'],
          ['2nd Council', '383 BCE', 'Vaishali', 'Kalashoka', 'Sabakami'],
          ['3rd Council', '250 BCE', 'Pataliputra', 'Ashoka', 'Moggaliputta Tissa']
        ]
      }
    ],
    revisionNotes: 'BPSC Focus: 3 Mahajanapadas in Bihar = Magadha, Anga, Vajji. Capital Patliputra founded by Udayin. first Buddhist Council at Rajgir, second at Vaishali, third at Patliputra. Mahavira Nirvana = Pawapuri.',
    pyqs: [
      {
        question: {
          en: 'Which ruler of Magadha founded Pataliputra and made it his capital?',
          hi: 'मगध के किस शासक ने पाटलिपुत्र की स्थापना की और इसे अपनी राजधानी बनाया?'
        },
        options: [
          { en: 'Bimbisara', hi: 'बिंबिसार' },
          { en: 'Ajatashatru', hi: 'अजातशत्रु' },
          { en: 'Udayin', hi: 'उदयन' },
          { en: 'Shishunaga', hi: 'शिशुनाग' }
        ],
        answer: 2,
        explanation: {
          en: 'Udayin, son of Ajatashatru, founded Pataliputra at the confluence of the Ganga and Son rivers and transferred the capital from Rajgriha.',
          hi: 'अजातशत्रु के पुत्र उदयन ने गंगा और सोन नदियों के संगम पर पाटलिपुत्र की स्थापना की और राजधानी को राजगृह से स्थानांतरित कर दिया।'
        },
        year: 2020
      }
    ]
  },
  {
    exam: 'BPSC',
    subject: 'State GK',
    topic: 'Bihar Geography',
    subtopic: 'River Systems of Bihar',
    introduction: 'The river system of Bihar is dominated by the Ganga and its tributaries, dividing the state into North and South Bihar plains.',
    detailedExplanation: `### The Ganga River in Bihar
The Ganga enters Bihar near Chausa (Buxar) and flows from west to east for about 445 km, dividing the state into two unequal halves. It discharges into West Bengal.

### North Bihar Rivers (Himalayan Origin)
These are perennial, snow-fed rivers carrying high silt and frequently causing floods:
- **Ghaghara:** Enters Bihar at Saran, joins Ganga near Revelganj.
- **Gandak:** Enters Bihar at Valmikinagar (Paschim Champaran), joins Ganga near Sonepur (Patna).
- **Burhi Gandak:** Flows parallel to Gandak, originates in Someshwar Hills.
- **Bagmati:** Originates in Nepal, joins Kosi.
- **Kosi (Sorrow of Bihar):** Famous for shifting its course. It is formed by seven streams (Saptakoshi) in Nepal and joins Ganga at Kursela (Kathihar).
- **Mahananda:** Originates in Darjeeling hills, joins Ganga in West Bengal.

### South Bihar Rivers (Peninsular Origin)
These are rain-fed, seasonal rivers flowing from the Chhota Nagpur Plateau:
- **Karmanasa:** Deemed unholy, joins Ganga near Chausa.
- **Son:** Originates at Amarkantak (MP), enters Bihar at Rohtas, joins Ganga near Maner (Patna).
- **Punpun:** Originates in Palamu (Jharkhand), joins Ganga near Fatuha.
- **Phalgu:** Flows past Gaya, sacred for Pinda Dan. Formed by Lilajan and Mohana rivers.
- **Kiul:** Originates in Giridih (Jharkhand), joins Ganga near Lakhisarai.`,
    concepts: [
      'Perennial vs Ephemeral drainage systems',
      'The geomorphology of meanders and oxbow lakes in North Bihar',
      'Causes of Kosi floods (extreme siltation and channel shifting)'
    ],
    importantFacts: [
      'The Ganga river flows through 12 districts of Bihar, with Patna having the longest stretch.',
      'The Kosi river is called the "Sorrow of Bihar" (Bihar ka Shok) due to its frequent course shifting and devastating floods.',
      'The Sone river is the largest southern tributary of the Ganga in Bihar.',
      'Valmiki National Park is located along the banks of the Gandak river in West Champaran.',
      'Mahatma Gandhi Setu over the Ganga connects Patna with Hajipur.'
    ],
    examples: [
      'The Phalgu river is seasonal and flows underground at Gaya, where Hindus offer pind-daan on its dry sandy bed.'
    ],
    tables: [
      {
        title: 'Tributaries of the Ganga in Bihar',
        headers: ['River Name', 'Originating Place', 'Confluence Point with Ganga in Bihar'],
        rows: [
          ['Gandak', 'Tibet/Nepal Himalayas', 'Sonepur / Hajipur'],
          ['Son', 'Amarkantak Hills (MP)', 'Maner (Patna)'],
          ['Kosi', 'Gosainthan (Tibet/Nepal)', 'Kursela (Katihar)'],
          ['Punpun', 'Palamu Plateau (Jharkhand)', 'Fatuha (Patna)'],
          ['Ghaghara', 'Mapchachungo Glacier (Tibet)', 'Chapi / Revelganj (Saran)']
        ]
      }
    ],
    revisionNotes: 'BPSC Geography: Ganga length in Bihar = 445 km. North rivers = perennial, cause floods (Kosi = Sorrow of Bihar). South rivers = seasonal, peninsular. Son joins at Maner. Punpun joins at Fatuha.',
    pyqs: [
      {
        question: {
          en: 'Which of the following rivers is known as the "Sorrow of Bihar"?',
          hi: 'निम्नलिखित में से किस नदी को "बिहार का शोक" कहा जाता है?'
        },
        options: [
          { en: 'Gandak', hi: 'गंडक' },
          { en: 'Son', hi: 'सोन' },
          { en: 'Kosi', hi: 'कोसी' },
          { en: 'Bagmati', hi: 'बागमती' }
        ],
        answer: 2,
        explanation: {
          en: 'Kosi river is called the Sorrow of Bihar because of its unstable nature and high rate of silt deposition, leading to sudden floods.',
          hi: 'कोसी नदी को बिहार का शोक कहा जाता है क्योंकि इसकी अस्थिर प्रकृति और गाद जमा होने की उच्च दर के कारण अचानक बाढ़ आ जाती है।'
        },
        year: 2021
      }
    ]
  },
  {
    exam: 'SSC CGL',
    subject: 'Math',
    topic: 'Arithmetic Ability',
    subtopic: 'Number System',
    introduction: 'The Number System is the foundation of quantitative aptitude, dealing with classifications of numbers, divisibility rules, unit digits, and remainders.',
    detailedExplanation: `### Classification of Numbers
Numbers are classified into:
- **Real Numbers:** Rational (can be written as $p/q$, e.g., $2/3$, $-5$) and Irrational (non-repeating non-terminating decimals, e.g., $\\sqrt{2}$, $\\pi$).
- **Integers:** Negative integers, Zero, and Positive integers (Natural Numbers).
- **Prime Numbers:** Numbers with exactly two distinct factors (1 and itself). 2 is the only even prime number. 1 is neither prime nor composite.
- **Co-Prime Numbers:** Pairs of numbers whose Highest Common Factor (HCF) is 1 (e.g., $8$ and $15$).

### Divisibility Rules
- **2, 4, 8:** Last digit even, last 2 digits divisible by 4, last 3 digits divisible by 8.
- **3, 9:** Sum of digits divisible by 3 or 9.
- **5, 10:** Last digit 0/5, last digit 0.
- **6:** Divisible by both 2 and 3.
- **11:** Difference between the sum of digits at odd places and even places is 0 or a multiple of 11.

### Concepts of Unit Digit and Cyclicity
The unit digit of a number raised to a power repeats in a cyclical pattern of 4:
- $0, 1, 5, 6$ have a cyclicity of 1 (always end in same digit).
- $4, 9$ have a cyclicity of 2 ($4^{\\text{odd}} \\to 4$, $4^{\\text{even}} \\to 6$; $9^{\\text{odd}} \\to 9$, $9^{\\text{even}} \\to 1$).
- $2, 3, 7, 8$ have a cyclicity of 4. Divide the exponent by 4 and use the remainder.

### Remainder Theorem
If a number $N$ is divided by $D$, the remainder can be calculated using Euler\'s Theorem or Fermat\'s Little Theorem.
- **Fermat\'s Theorem:** $\\frac{a^{p-1}}{p}$ leaves a remainder of $1$, where $p$ is a prime number and $a, p$ are co-prime.`,
    concepts: [
      'Prime factorization and counting factors',
      'Divisibility checks for composite numbers like 72 and 88',
      'Unit digit calculations using cyclicity',
      'Remainder calculation of large powers'
    ],
    importantFacts: [
      'To find the number of factors of $N = p^a \\cdot q^b \\cdot r^c$, use formula: $(a+1)(b+1)(c+1)$.',
      'Sum of first $n$ natural numbers $= \\frac{n(n+1)}{2}$.',
      'Sum of squares of first $n$ natural numbers $= \\frac{n(n+1)(2n+1)}{6}$.',
      'The product of two numbers is equal to the product of their HCF and LCM ($A \\times B = \\text{HCF} \\times \\text{LCM}$).',
      '0 is an even integer.'
    ],
    examples: [
      'Find the unit digit of $237^{143}$. The base unit digit is 7 (cyclicity 4). Exponent $143 \\pmod 4 = 3$. So $7^3 = 343$, unit digit is 3.',
      'Check if $348216$ is divisible by $11$. Sum of odd places $= 3+8+1 = 12$. Sum of even places $= 4+2+6 = 12$. Difference $= 12 - 12 = 0$. Yes, it is divisible.'
    ],
    tables: [
      {
        title: 'Cyclicity of Numbers (0-9)',
        headers: ['Digit', 'Cyclicity', 'Pattern of Unit Digits'],
        rows: [
          ['0, 1, 5, 6', '1', 'Always ends in [0, 1, 5, 6]'],
          ['4', '2', '4 (odd power), 6 (even power)'],
          ['9', '2', '9 (odd power), 1 (even power)'],
          ['2', '4', '2, 4, 8, 6 (repeats)'],
          ['3', '4', '3, 9, 7, 1 (repeats)'],
          ['7', '4', '7, 9, 3, 1 (repeats)'],
          ['8', '4', '8, 4, 2, 6 (repeats)']
        ]
      }
    ],
    revisionNotes: 'Formulas: HCF x LCM = Product of numbers. Factors count: add 1 to exponents and multiply. Unit digit cyclicity: power mod 4. Divisibility of 11: odd sum - even sum = 0 or 11k.',
    pyqs: [
      {
        question: {
          en: 'If a 9-digit number 985x3678y is divisible by 72, then the value of (4x - 3y) is:',
          hi: 'यदि एक 9-अंकीय संख्या 985x3678y, 72 से विभाज्य है, तो (4x - 3y) का मान है:'
        },
        options: [
          { en: '4', hi: '4' },
          { en: '5', hi: '5' },
          { en: '6', hi: '6' },
          { en: '8', hi: '8' }
        ],
        answer: 0,
        explanation: {
          en: 'For divisibility by 72, the number must be divisible by both 8 and 9. For divisibility by 8, last 3 digits "78y" must be div by 8 -> y = 4. For div by 9, sum of digits (9+8+5+x+3+6+7+8+4 = 50+x) must be div by 9 -> x = 4. Thus, (4(4) - 3(4)) = 16 - 12 = 4.',
          hi: '72 से विभाज्यता के लिए, संख्या 8 और 9 दोनों से विभाज्य होनी चाहिए। 8 से विभाज्यता के लिए, अंतिम 3 अंक "78y" 8 से विभाज्य होने चाहिए -> y = 4. 9 से विभाज्यता के लिए, अंकों का योग (9+8+5+x+3+6+7+8+4 = 50+x) 9 से विभाज्य होना चाहिए -> x = 4। इस प्रकार, (4(4) - 3(4)) = 16 - 12 = 4।'
        },
        year: 2019
      }
    ]
  },
  {
    exam: 'SSC CGL',
    subject: 'Reasoning',
    topic: 'Verbal Reasoning',
    subtopic: 'Coding-Decoding',
    introduction: 'Coding-Decoding tests a candidate\'s ability to decipher a rule or pattern governing letters, numbers, or words and apply it to a new word.',
    detailedExplanation: `### Standard Coding Types
Coding-Decoding questions can be broadly grouped into:
1. **Letter Coding:** Letters of a word are replaced by other letters according to a specific pattern (e.g., +1 shift, reverse letters, opposite letters).
2. **Number/Symbol Coding:** A word is assigned numerical values. It could be direct replacement or mathematical operations on alphabetical positions (e.g., sum of place values, product of place values).
3. **Substitution/Fictitious Language Coding (Chinese Coding):** Group of words is coded as a group of symbols/codes. Common words are identified across sentences to decode individual words.

### Alphabet Positions and Opposites
To solve questions quickly, candidates must memorize the positional values of English alphabets:
- **Left to Right (A=1, Z=26):** Use the mnemonic **EJOTY** ($E=5, J=10, O=15, T=20, Y=25$).
- **Right to Left (Z=1, A=26):** Positional Value from Right $= 27 - \\text{Positional Value from Left}$.
- **Opposite Pairs:** The sum of opposite letters is always 27 ($A+Z=27$, $B+Y=27$, $C+X=27$). Memorize using terms: **A**z**Z**, **B**o**Y**, **C**u**X**, **D**e**W**, **L****O****V****E** ($L \\leftrightarrow O, V \\leftrightarrow E$).`,
    concepts: [
      'Letter shifting (+n, -n, cross shifting)',
      'Reverse alphabetical position values',
      'Frequency matching in fictitious codes',
      'Opposite letter pairings'
    ],
    importantFacts: [
      'A to M are the first 13 letters (first half), and N to Z are the second 13 (second half).',
      'The opposite of any letter can be found by subtracting its position value from 27.',
      'In coding questions, look for vowel-only shifts or consonant-only shifts as advanced patterns.'
    ],
    examples: [
      'If "CAT" is coded as "24267", it is coded using opposite letter positions ($C=24$, $A=26$, $T=7$ from right).',
      'If "SIGHT" is coded as "FVTHG", opposite letters are used ($S \\leftrightarrow H$, $I \\leftrightarrow R$, $G \\leftrightarrow T$, $H \\leftrightarrow S$, $T \\leftrightarrow G$) but in reverse order.'
    ],
    tables: [
      {
        title: 'Alphabet Position Values and Opposites',
        headers: ['Letter', 'Left-to-Right Value', 'Opposite Letter', 'Right-to-Left Value'],
        rows: [
          ['A', '1', 'Z', '26'],
          ['B', '2', 'Y', '25'],
          ['E', '5', 'V', '22'],
          ['J', '10', 'Q', '17'],
          ['O', '15', 'L', '12'],
          ['T', '20', 'G', '7'],
          ['Y', '25', 'B', '2']
        ]
      }
    ],
    revisionNotes: 'Position Memorization: EJOTY (5,10,15,20,25). Opposite sum = 27. Opposite pairs: AZ, BY, CX, DW, EV, FU, GT, HS, IR, JQ, KP, LO, MN.',
    pyqs: [
      {
        question: {
          en: 'In a certain code language, "POND" is written as "RSTL". How is "HEAR" written in that code language?',
          hi: 'एक निश्चित कोड भाषा में, "POND" को "RSTL" लिखा जाता है। उसी कोड भाषा में "HEAR" कैसे लिखा जाएगा?'
        },
        options: [
          { en: 'JIGZ', hi: 'JIGZ' },
          { en: 'JHGZ', hi: 'JHGZ' },
          { en: 'JKGZ', hi: 'JKGZ' },
          { en: 'JIGY', hi: 'JIGY' }
        ],
        answer: 0,
        explanation: {
          en: 'Pattern: P(+2)->R, O(+3)->S, N(+6)->T, D(+8)->L. Similarly, H(+2)->J, E(+4)->I, A(+6)->G, R(+8)->Z. Note: increment is +2, +4, +6, +8 (even numbers). Wait: P(16)+2=18(R), O(15)+4=19(S), N(14)+6=20(T), D(4)+8=12(L). Correct increment is even numbers (+2, +4, +6, +8). Applied to HEAR: H(8)+2=J, E(5)+4=I, A(1)+6=G, R(18)+8=26(Z). Result is JIGZ.',
          hi: 'पैटर्न: P(+2)->R, O(+4)->S, N(+6)->T, D(+8)->L. इसी प्रकार, H(+2)->J, E(+4)->I, A(+6)->G, R(+8)->Z. यहाँ वृद्धि सम संख्याएँ (+2, +4, +6, +8) हैं। HEAR पर लागू करने पर: JIGZ मिलता है।'
        },
        year: 2020
      }
    ]
  },
  {
    exam: 'Railway',
    subject: 'Science',
    topic: 'General Science (up to 10th Standard CBSE)',
    subtopic: "Physics Basics (Motion, Force, Work, Energy, Gravity, Light, Electricity)",
    introduction: 'Physics forms an important segment of the General Science section in Railway exams, covering mechanics, thermodynamics, wave optics, and basic electricity.',
    detailedExplanation: `### Newton\'s Laws of Motion
Mechanics deals with the motion of bodies under the action of forces:
- **First Law (Law of Inertia):** A body remains in a state of rest or uniform motion in a straight line unless acted upon by an external unbalanced force. *Inertia* is a measure of mass.
- **Second Law (Law of Force):** The rate of change of momentum of a body is directly proportional to the applied force and takes place in the direction of the force ($F = ma$, where $F$ is force, $m$ is mass, $a$ is acceleration).
- **Third Law (Action and Reaction):** To every action, there is an equal and opposite reaction (e.g., recoil of a gun, jet propulsion).

### Work, Energy, and Power
- **Work:** Work is done when a force acting on a body produces displacement ($W = Fs \\cos \\theta$). SI unit is Joule.
- **Energy:** Capacity to do work. Exists as Kinetic Energy ($KE = \\frac{1}{2}mv^2$) and Potential Energy ($PE = mgh$).
- **Power:** Rate of doing work ($P = W/t$). SI unit is Watt. $1 \\text{ Horsepower (HP)} = 746 \\text{ Watts}$.

### Gravity
- **Universal Law of Gravitation:** Every particle attracts every other particle with a force $F = G \\frac{m_1 m_2}{r^2}$.
- **Acceleration due to Gravity ($g$):** $g = 9.8 \\text{ m/s}^2$ at the Earth\'s surface. $g$ decreases with altitude and depth, is zero at the center of the earth, and maximum at the poles.`,
    concepts: [
      'Concept of Inertia (Rest, Motion, Direction)',
      'Conservation of Linear Momentum',
      'Conservative vs Non-conservative forces',
      'Relationship between Work and Mechanical Energy'
    ],
    importantFacts: [
      'Mass is constant everywhere, but Weight ($W=mg$) varies as gravity changes.',
      'Escape velocity of Earth is $11.2 \\text{ km/s}$.',
      'The value of Universal Gravitational Constant $G = 6.67 \\times 10^{-11} \\text{ N m}^2/\\text{kg}^2$.',
      'A light year is a unit of distance, equal to $9.46 \\times 10^{15} \\text{ meters}$.',
      'Kinetic energy of a body becomes 4 times if its velocity is doubled.'
    ],
    examples: [
      'A passenger falls forward when a moving bus brakes suddenly due to inertia of motion.',
      'A swimmer pushes the water backwards (action) to move forward (reaction).'
    ],
    tables: [
      {
        title: 'SI Units of Key Physical Quantities',
        headers: ['Physical Quantity', 'SI Unit Name', 'Symbol', 'Equivalent Base Units'],
        rows: [
          ['Force', 'Newton', 'N', 'kg m/s²'],
          ['Work / Energy', 'Joule', 'J', 'N m / kg m² s⁻²'],
          ['Power', 'Watt', 'W', 'J/s'],
          ['Pressure', 'Pascal', 'Pa', 'N/m²'],
          ['Frequency', 'Hertz', 'Hz', 's⁻¹']
        ]
      }
    ],
    revisionNotes: 'Newton 1st Law = Inertia. 2nd Law = F=ma. 3rd Law = Action/Reaction. KE = 0.5 mv^2. PE = mgh. 1 HP = 746 W. Escape velocity = 11.2 km/s. Gravity: max at poles, min at equator, zero at center.',
    pyqs: [
      {
        question: {
          en: 'A body is rolling down a hill. What kind of energy does it possess?',
          hi: 'एक पिंड पहाड़ी से नीचे लुढ़क रहा है। इसमें किस प्रकार की ऊर्जा है?'
        },
        options: [
          { en: 'Only Kinetic Energy', hi: 'केवल गतिज ऊर्जा' },
          { en: 'Only Potential Energy', hi: 'केवल स्थितिज ऊर्जा' },
          { en: 'Both Kinetic and Potential Energy', hi: 'गतिज और स्थितिज ऊर्जा दोनों' },
          { en: 'Chemical Energy', hi: 'रासायनिक ऊर्जा' }
        ],
        answer: 2,
        explanation: {
          en: 'Since the body is rolling down, it has velocity (Kinetic Energy) and is still at some height above the ground (Potential Energy). Therefore, it possesses both.',
          hi: 'चूंकि पिंड नीचे लुढ़क रहा है, इसलिए इसमें वेग (गतिज ऊर्जा) है और यह अभी भी जमीन से कुछ ऊंचाई पर है (स्थितिज ऊर्जा)। इसलिए, इसमें दोनों हैं।'
        },
        year: 2018
      }
    ]
  },
  {
    exam: 'Railway',
    subject: 'Science',
    topic: 'General Science (up to 10th Standard CBSE)',
    subtopic: 'Chemistry Basics (Elements, Compounds, Chemical Reactions, Acids & Bases, Periodic Table)',
    introduction: 'Basic Chemistry covers classification of matter, properties of elements, periodic table trends, and chemical reactions.',
    detailedExplanation: `### Matter and its Classifications
Matter is anything that occupies space and has mass.
- **Element:** Substance composed of only one type of atom (e.g., Gold, Oxygen).
- **Compound:** Substance composed of two or more elements chemically combined in a fixed ratio (e.g., $H_2O$, $CO_2$).
- **Mixture:** Physical combination of two or more substances (e.g., air, brass). Can be Homogeneous (uniform composition) or Heterogeneous.

### Modern Periodic Table
Designed by Henry Moseley, based on **Atomic Number** ($Z$).
- **Structure:** 18 vertical columns called **Groups** and 7 horizontal rows called **Periods**.
- **Trends in Periodic Table (Left to Right across a Period):**
  - *Atomic Size:* Decreases (due to increase in effective nuclear charge).
  - *Ionization Energy:* Increases.
  - *Electronegativity:* Increases.
  - *Metallic Character:* Decreases.
- **Trends (Top to Bottom in a Group):**
  - *Atomic Size:* Increases (due to addition of new shells).
  - *Metallic Character:* Increases.

### Acids, Bases, and Salts
- **Acids:** Turn blue litmus red, have pH < 7, and release $H^+$ ions in water (e.g., $HCl, H_2SO_4$).
- **Bases:** Turn red litmus blue, have pH > 7, feel soapy, and release $OH^-$ ions in water (e.g., $NaOH, Ca(OH)_2$).
- **pH Scale:** Introduced by Sorensen, ranges from 0 to 14. Neutral is 7.`,
    concepts: [
      'Chemical change vs Physical change',
      'Periodic trends of atomic radius and metallic nature',
      'Arrhenius vs Bronsted-Lowry definition of acids/bases',
      'Neutralization reactions forming salts'
    ],
    importantFacts: [
      'Mercury (Hg) is the only metal that is liquid at room temperature.',
      'Bromine (Br) is the only non-metal that is liquid at room temperature.',
      'Helium has the highest ionization energy among all elements.',
      'Fluorine is the most electronegative element in the periodic table.',
      'pH of human blood is slightly basic, around 7.4.'
    ],
    examples: [
      'Rusting of iron is a chemical change because it forms a new substance (hydrated iron oxide).',
      'Adding baking soda (sodium bicarbonate) to neutralize bee sting acid.'
    ],
    tables: [
      {
        title: 'Common Chemicals and Their IUPAC Names',
        headers: ['Common Name', 'Chemical Name', 'Chemical Formula'],
        rows: [
          ['Baking Soda', 'Sodium Bicarbonate', 'NaHCO₃'],
          ['Washing Soda', 'Sodium Carbonate Decahydrate', 'Na₂CO₃·10H₂O'],
          ['Bleaching Powder', 'Calcium Oxychloride', 'CaOCl₂'],
          ['Plaster of Paris', 'Calcium Sulphate Hemihydrate', 'CaSO₄·½H₂O'],
          ['Gypsum', 'Calcium Sulphate Dihydrate', 'CaSO₄·2H₂O']
        ]
      }
    ],
    revisionNotes: 'Chemistry Basics: Moseley designed Modern Periodic Table (Atomic No.). Acids: pH < 7. Bases: pH > 7. Liquid Metal = Hg; Liquid Non-metal = Br. Blood pH = 7.4. Baking Soda = NaHCO3.',
    pyqs: [
      {
        question: {
          en: 'What is the chemical name of Baking Soda?',
          hi: 'बेकिंग सोडा का रासायनिक नाम क्या है?'
        },
        options: [
          { en: 'Sodium Carbonate', hi: 'सोडियम कार्बोनेट' },
          { en: 'Sodium Bicarbonate', hi: 'सोडियम बाइकार्बोनेट' },
          { en: 'Calcium Chloride', hi: 'कैल्शियम क्लोराइड' },
          { en: 'Sodium Hydroxide', hi: 'सोडियम हाइड्रोक्साइड' }
        ],
        answer: 1,
        explanation: {
          en: 'Baking Soda is Sodium Bicarbonate (NaHCO3), while Washing Soda is Sodium Carbonate (Na2CO3).',
          hi: 'बेकिंग सोडा सोडियम बाइकार्बोनेट (NaHCO3) है, जबकि वाशिंग सोडा सोडियम कार्बोनेट (Na2CO3) है।'
        },
        year: 2019
      }
    ]
  },
  {
    exam: 'Railway',
    subject: 'Science',
    topic: 'General Science (up to 10th Standard CBSE)',
    subtopic: 'Life Sciences (Cell Structure, Human Systems, Plant Kingdom, Genetics, Diseases & Health)',
    introduction: 'Life Sciences or Biology studies living organisms, covering cell biology, human anatomy, plant physiology, and human health.',
    detailedExplanation: `### The Cell: Structure and Organelles
The cell is the basic structural and functional unit of life, discovered by Robert Hooke in 1665:
- **Mitochondria:** Powerhouse of the cell, generates energy in the form of ATP through cellular respiration. Has its own DNA.
- **Ribosomes:** Site of protein synthesis.
- **Lysosomes:** Suicide bags of the cell, containing hydrolytic enzymes to digest waste.
- **Nucleus:** Controller of the cell, contains genetic material (DNA).
- **Plastids (Chloroplasts):** Present only in plant cells, site of photosynthesis.

### Human Body Systems
- **Circulatory System:** Headed by the Heart. Humans have a 4-chambered heart. Arteries carry oxygenated blood away from the heart (except Pulmonary Artery). Veins carry deoxygenated blood to the heart (except Pulmonary Vein).
- **Digestive System:** Starts in mouth (saliva breaks down starch) -> Stomach (HCl digests proteins) -> Small Intestine (complete digestion and absorption of nutrients).
- **Nervous System:** Brain and spinal cord. Neuron is the basic functional unit.

### Human Diseases and Nutrition
Diseases are classified into infectious (caused by pathogens) and non-infectious:
- **Viruses:** Influenza, COVID-19, Dengue, Polio, AIDS.
- **Bacteria:** Tuberculosis, Cholera, Typhoid, Tetanus.
- **Protozoa:** Malaria (transmitted by female Anopheles mosquito), Kala-azar.
- **Vitamins:** Essential organic compounds. Deficiency of Vitamin A causes night blindness, Vitamin B1 causes beriberi, Vitamin C causes scurvy, and Vitamin D causes rickets.`,
    concepts: [
      'Prokaryotic vs Eukaryotic cell structure',
      'Double circulation of blood in human heart',
      'Role of enzymes in human digestion',
      'Viral vs Bacterial pathogen reproduction'
    ],
    importantFacts: [
      'Mitochondria and Chloroplasts are semi-autonomous organelles containing their own DNA and ribosomes.',
      'Sinoatrial (SA) node is the natural pacemaker of the human heart.',
      'The largest gland in the human body is the Liver.',
      'Double helix structure of DNA was proposed by Watson and Crick.',
      'Vitamin B and C are water-soluble; Vitamins A, D, E, and K are fat-soluble.'
    ],
    examples: [
      'Active transport of sodium ions across nerve cells requires ATP generated by mitochondria.',
      'Plasmodium parasite causes malaria, utilizing red blood cells to multiply.'
    ],
    tables: [
      {
        title: 'Vitamins and Deficiency Diseases',
        headers: ['Vitamin Name', 'Chemical Name', 'Deficiency Disease'],
        rows: [
          ['Vitamin A', 'Retinol', 'Night Blindness / Xerophthalmia'],
          ['Vitamin B1', 'Thiamine', 'Beriberi'],
          ['Vitamin C', 'Ascorbic Acid', 'Scurvy (bleeding gums)'],
          ['Vitamin D', 'Calciferol', 'Rickets (bone softening)'],
          ['Vitamin K', 'Phylloquinone', 'Delayed blood clotting']
        ]
      }
    ],
    revisionNotes: 'Life Sciences Focus: Mitochondria = ATP power. Lysosome = suicide bag. DNA = double helix. Liver = largest gland. Water-soluble vitamins = B, C. Vector for Malaria = female Anopheles.',
    pyqs: [
      {
        question: {
          en: 'Which cell organelle is known as the "Powerhouse of the cell"?',
          hi: 'किस कोशिकांग को "कोशिका का पावरहाउस" कहा जाता है?'
        },
        options: [
          { en: 'Golgi Apparatus', hi: 'गोल्गी तंत्र' },
          { en: 'Mitochondria', hi: 'माइटोकॉन्ड्रिया' },
          { en: 'Ribosome', hi: 'राइबोसोम' },
          { en: 'Lysosome', hi: 'लाइसोसोम' }
        ],
        answer: 1,
        explanation: {
          en: 'Mitochondria generates energy in the form of ATP, which is why it is called the Powerhouse of the cell.',
          hi: 'माइटोकॉन्ड्रिया एटीपी के रूप में ऊर्जा उत्पन्न करता है, यही कारण है कि इसे कोशिका का पावरहाउस कहा जाता है।'
        },
        year: 2018
      }
    ]
  },
  {
    exam: 'Banking',
    subject: 'General Awareness',
    topic: 'Banking & Financial Awareness',
    subtopic: 'Reserve Bank of India (RBI) & Monetary Policy',
    introduction: 'The Reserve Bank of India (RBI) is the central bank of India, regulating the banking system and formulating monetary policy to control inflation and credit.',
    detailedExplanation: `### Establishment and History of RBI
Established on **April 1, 1935**, under the Reserve Bank of India Act, 1934, based on the recommendations of the **Hilton Young Commission**.
- **Nationalization:** RBI was nationalized on January 1, 1949.
- **Headquarters:** Initially in Kolkata, shifted permanently to Mumbai in 1937.
- **First Governor:** Sir Osborne Smith. First Indian Governor was Sir C.D. Deshmukh.

### Core Functions of RBI
1. **Monetary Authority:** Formulates and implements Monetary Policy.
2. **Regulator of Financial System:** Prescribes parameters for commercial banks (licensing, branch expansion, liquidity of assets).
3. **Issuer of Currency:** Issues all currency notes except one-rupee notes and coins (issued by Ministry of Finance).
4. **Banker to Government:** Manages government deposits and public debt.
5. **Banker\'s Bank:** Holds reserves of commercial banks and acts as the "Lender of Last Resort".

### Monetary Policy Instruments
RBI uses quantitative and qualitative tools to control money supply and inflation:
- **Repo Rate:** Rate at which RBI lends money to commercial banks against government securities. Lowering repo rate stimulates growth; raising it controls inflation.
- **Reverse Repo Rate:** Rate at which RBI borrows money from commercial banks.
- **Cash Reserve Ratio (CRR):** Percentage of net demand and time liabilities (NDTL) that commercial banks must keep with RBI in cash. No interest is paid on this.
- **Statutory Liquidity Ratio (SLR):** Percentage of NDTL that banks must maintain in liquid assets (gold, cash, approved securities) with themselves.
- **Marginal Standing Facility (MSF):** Penal rate at which banks can borrow overnight from RBI by dipping into their SLR quota.`,
    concepts: [
      'Credit control through interest rate adjustments',
      'The composition of Monetary Policy Committee (MPC)',
      'Difference between CRR and SLR requirements',
      'Lender of last resort function'
    ],
    importantFacts: [
      'The Monetary Policy Committee (MPC) has 6 members (3 from RBI, 3 appointed by Government) and is headed by the RBI Governor.',
      'RBI publishes reports like the Financial Stability Report and Monetary Policy Report.',
      'The financial year of RBI is from April 1 to March 31 (aligned since 2020; previously July to June).',
      'One rupee notes bear the signature of the Finance Secretary of India, not the RBI Governor.',
      'The logo of RBI features a Tiger and a Palm tree.'
    ],
    examples: [
      'If inflation is high, the MPC increases the Repo Rate (tight monetary policy) to make loans expensive, reducing spending.',
      'A bank facing severe liquidity crisis borrows funds overnight through MSF at a rate higher than the Repo rate.'
    ],
    tables: [
      {
        title: 'Key Monetary Policy Rates and Terms',
        headers: ['Policy Tool', 'Type of Tool', 'Primary Objective / Mechanism'],
        rows: [
          ['Repo Rate', 'Quantitative', 'Rate at which banks borrow from RBI; controls credit cost'],
          ['Reverse Repo', 'Quantitative', 'Rate at which RBI absorbs excess liquidity from banks'],
          ['CRR', 'Quantitative', 'Cash reserves with RBI; directly reduces lending capacity'],
          ['SLR', 'Quantitative', 'Liquid assets with bank itself; ensures safety and government funding'],
          ['Moral Suasion', 'Qualitative', 'Informal requests and warnings by RBI to commercial banks']
        ]
      }
    ],
    revisionNotes: 'RBI Summary: Est 1 April 1935 (Hilton Young). Nationalized 1949. Issues notes (>1 Re). 1 Re note signed by Finance Secretary. MPC has 6 members. Repo = lending rate to banks; Reverse Repo = borrowing from banks. CRR = cash with RBI; SLR = liquid assets with bank.',
    pyqs: [
      {
        question: {
          en: 'If the RBI decides to adopt an expansionist monetary policy, which of the following would it NOT do? 1. Cut and optimize the Statutory Liquidity Ratio. 2. Increase the Marginal Standing Facility Rate. 3. Cut the Bank Rate and Repo Rate.',
          hi: 'यदि आरबीआई एक विस्तारवादी मौद्रिक नीति अपनाने का निर्णय लेता है, तो वह निम्नलिखित में से क्या नहीं करेगा? 1. वैधानिक तरलता अनुपात में कटौती और अनुकूलन करना। 2. सीमांत स्थायी सुविधा दर में वृद्धि करना। 3. बैंक दर और रेपो दर में कटौती करना।'
        },
        options: [
          { en: '1 and 2 only', hi: 'केवल 1 और 2' },
          { en: '2 only', hi: 'केवल 2' },
          { en: '1 and 3 only', hi: 'केवल 1 और 3' },
          { en: '1, 2 and 3', hi: '1, 2 और 3' }
        ],
        answer: 1,
        explanation: {
          en: 'An expansionist policy aims to increase money supply. RBI cuts rates (SLR, Bank Rate, Repo Rate) to make credit cheaper. It would NOT increase MSF rate (stmt 2), as that would make credit more expensive.',
          hi: 'एक विस्तारवादी नीति का उद्देश्य धन आपूर्ति को बढ़ाना है। आरबीआई ऋण को सस्ता बनाने के लिए दरों (SLR, बैंक दर, रेपो दर) में कटौती करता है। यह MSF दर (कथन 2) में वृद्धि नहीं करेगा, क्योंकि इससे ऋण अधिक महंगा हो जाएगा।'
        },
        year: 2020
      }
    ]
  }
];

const seed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    console.log('Seeding rich learning content...');
    
    for (const item of contentData) {
      console.log(`Processing subtopic: ${item.subtopic} (${item.exam} - ${item.subject})`);
      
      // Find matching practice MCQs to link to this content
      const matchingQuestions = await Question.find({
        exam: item.exam,
        subject: new RegExp(`^${item.subject}$`, 'i'),
        topic: new RegExp(`^${item.topic}$`, 'i')
      }).limit(5);

      item.practiceMcqs = matchingQuestions.map(q => q._id);
      
      // Upsert based on the unique subtopic field
      await LearningContent.findOneAndUpdate(
        { subtopic: item.subtopic },
        item,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    
    console.log('Seeding completed successfully.');
    await mongoose.disconnect();
    console.log('Database disconnected.');
  } catch (error) {
    console.error('Error seeding learning content:', error);
    process.exit(1);
  }
};

seed();
