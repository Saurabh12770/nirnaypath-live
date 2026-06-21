import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
import LearningContent from '../models/LearningContent.js';

const missingContent = [
  // ═══════════════════════════════════════════════════════════════════
  // UPSC (1 SUBTOPIC)
  // ═══════════════════════════════════════════════════════════════════
  {
    exam: 'UPSC',
    subject: 'Science & Technology',
    topic: 'Information Technology',
    subtopic: 'Artificial Intelligence — Concepts & Applications',
    introduction: 'Artificial Intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think like humans and mimic their actions. It encompasses machine learning, deep learning, natural language processing, and robotics, and finds applications across healthcare, finance, agriculture, and governance.',
    detailedExplanation: `## Artificial Intelligence (AI) — Comprehensive Guide

### 1. Definition and Historical Evolution
- **Artificial Intelligence**: A branch of computer science dealing with building smart machines capable of performing tasks that typically require human intelligence.
- **Father of AI**: **John McCarthy** coined the term "Artificial Intelligence" at the Dartmouth Conference in 1956.
- **Alan Turing**: Developed the **Turing Test** (1950) to evaluate whether a machine can exhibit intelligent behavior indistinguishable from a human.

### 2. Core Classification of AI
- **Based on Capabilities**:
  1. **Narrow AI (Weak AI)**: Programmed to perform single tasks (e.g., Apple's Siri, Google Search, chess playing engines, face recognition). Currently, all existing AI is Narrow AI.
  2. **General AI (Strong AI)**: Theoretical AI where a machine possesses intelligence equivalent to a human, capable of learning and solving any intellectual problem.
  3. **Super AI**: A hypothetical state where machine intelligence surpasses human intelligence across all domains.
- **Based on Functionality**:
  1. **Reactive Machines**: No memory, cannot use past experiences (e.g., Deep Blue).
  2. **Limited Memory**: Can use past data for a short period (e.g., self-driving cars).
  3. **Theory of Mind**: Theoretical machines that can understand human emotions, beliefs, and thoughts.
  4. **Self-Awareness**: Theoretical machines that possess self-consciousness.

### 3. Key Concepts & Technologies
- **Machine Learning (ML)**: A subset of AI that enables systems to learn from data and improve without explicit programming.
- **Deep Learning (DL)**: A subset of ML based on Artificial Neural Networks (ANNs) inspired by the human brain.
- **Natural Language Processing (NLP)**: Enables machines to understand, interpret, and manipulate human language.
- **Computer Vision**: Enables computers to derive meaningful information from digital images, videos, and visual inputs.

### 4. Applications of AI
- **Healthcare**: Disease detection, drug discovery, personalized medicine (e.g., IBM Watson).
- **Agriculture**: Precision farming, soil health monitoring, crop yield prediction, pest detection.
- **Finance**: Algorithmic trading, fraud detection, credit scoring.
- **Governance & Public Policy**: India's **National Strategy on AI (#AIforAll)** by NITI Aayog focuses on healthcare, agriculture, education, smart cities, and smart mobility.
- **National AI Portal of India**: A joint initiative by MeitY, NeGD, and NASSCOM.`,
    concepts: ['Turing Test', 'Machine Learning vs Deep Learning', 'Narrow vs General AI', 'National Strategy on AI'],
    importantFacts: [
      'John McCarthy coined the term "Artificial Intelligence" in 1956.',
      'The Turing Test was proposed by Alan Turing in 1950 to evaluate machine intelligence.',
      'All current AI implementations (like ChatGPT, Siri, Autonomous Vehicles) are classified as Weak/Narrow AI.',
      'NITI Aayog published the "National Strategy for Artificial Intelligence" in 2018 under the theme #AIforAll.'
    ],
    examples: [
      'Deep Blue: IBM\'s chess-playing reactive machine that defeated world champion Garry Kasparov in 1997.',
      'AlphaGo: A Google DeepMind program that defeated Go champion Lee Sedol in 2016 using deep neural networks.'
    ],
    tables: [{
      title: 'Machine Learning vs Deep Learning',
      headers: ['Parameter', 'Machine Learning', 'Deep Learning'],
      rows: [
        ['Data Requirements', 'Works well with small-to-medium datasets', 'Requires massive amounts of data to achieve high accuracy'],
        ['Hardware Dependencies', 'Can run on standard CPUs', 'Requires high-performance GPUs and TPU hardware'],
        ['Feature Extraction', 'Features must be manually identified and coded', 'Automatically extracts features from raw data'],
        ['Algorithm Structure', 'Linear regression, decision trees, support vector machines', 'Multi-layered Artificial Neural Networks (ANN)']
      ]
    }],
    revisionNotes: '* Coined by: John McCarthy (1956).\n* Turing Test (1950) = test of machine intelligence.\n* Weak AI = Narrow tasks. Strong AI = Human equivalent. Super AI = Exceeds human.\n* ML = Subset of AI; DL = Subset of ML using Neural Networks.\n* National Strategy on AI (NITI Aayog) = #AIforAll (Health, Agri, Education, Smart Cities).',
    pyqs: [{
      question: {
        en: 'With reference to "Artificial Intelligence", which of the following is/are considered subset(s) of AI?\n1. Machine Learning\n2. Deep Learning\n3. Internet of Things',
        hi: '"कृत्रिम बुद्धिमत्ता (Artificial Intelligence)" के संदर्भ में, निम्नलिखित में से किसे/किन्हें AI का सबसेट माना जाता है?\n1. मशीन लर्निंग\n2. डीप लर्निंग\n3. इंटरनेट ऑफ थिंग्स'
      },
      options: [
        { en: '1 and 2 only', hi: 'केवल 1 और 2' },
        { en: '2 and 3 only', hi: 'केवल 2 और 3' },
        { en: '1 and 3 only', hi: 'केवल 1 और 3' },
        { en: '1, 2 and 3', hi: '1, 2 और 3' }
      ],
      answer: 0,
      explanation: {
        en: 'Machine Learning and Deep Learning are subsets of Artificial Intelligence. Internet of Things (IoT) is a network of interconnected physical devices and is a separate technology, though AI can be integrated with it.',
        hi: 'मशीन लर्निंग और डीप लर्निंग कृत्रिम बुद्धिमत्ता (AI) के सबसेट हैं। इंटरनेट ऑफ थिंग्स (IoT) परस्पर जुड़े भौतिक उपकरणों का एक नेटवर्क है और यह एक अलग तकनीक है, हालांकि AI को इसके साथ एकीकृत किया जा सकता है।'
      },
      year: 2020
    }]
  },

  // ═══════════════════════════════════════════════════════════════════
  // BPSC (7 SUBTOPICS)
  // ═══════════════════════════════════════════════════════════════════
  {
    exam: 'BPSC',
    subject: 'History',
    topic: 'Ancient India',
    subtopic: 'Indus Valley Civilization',
    introduction: 'The Indus Valley Civilization (IVC), also known as the Harappan Civilization (2500 BCE - 1900 BCE), is one of the oldest bronze-age urban civilizations in the world. It is celebrated for its grid-based town planning, advanced drainage systems, and maritime trade, with significant historical interest for BPSC aspirants.',
    detailedExplanation: `## Indus Valley Civilization (IVC) — Complete Study

### 1. Geographical Spread and Key Sites
- **Discovery**: First discovered in 1921 at **Harappa** by **Daya Ram Sahni** under the guidance of **John Marshall** (Director-General of ASI).
- **Extent**: Spanned parts of modern-day Pakistan, Northwest India, extending from Manda (Jammu) in the north to Daimabad (Maharashtra) in the south, and Sutkagen Dor (Balochistan) in the west to Alamgirpur (UP) in the east.
- **Major Sites**:
  - **Harappa** (Ravi River): Granaries, bronze clay models, stone symbols.
  - **Mohenjo-daro** (Indus River): **Great Bath**, **Great Granary**, Bronze Dancing Girl statue, Bearded Priest.
  - **Lothal** (Bhagava River, Gujarat): World's oldest artificial dockyard, double burials, rice husk evidence.
  - **Kalibangan** (Ghaggar River, Rajasthan): Ploughed fields, fire altars.
  - **Chanhudaro** (Indus River): Only city without a citadel, bead-making factory.
  - **Dholavira** (Gujarat): Unique water-harvesting system, giant reservoir, three-tier town division.
  - **Banawali** (Haryana): Barley grains, terracotta plough model.

### 2. Town Planning & Urban Features
- **Grid System**: Streets cut each other at right angles, dividing the town into rectangular blocks.
- **Citadel**: Most cities divided into a fortified **Citadel** (west, higher ground, public buildings/elite residences) and a **Lower Town** (east, residential quarters for common people).
- **Building Materials**: Standardized burnt bricks (ratio 4:2:1) used instead of sun-dried bricks.
- **Drainage System**: Excellent underground drainage system. House drains connected to street drains, covered with stone slabs or bricks, with inspection manholes at regular intervals.

### 3. Economy & Trade
- **Agriculture**: Cultivated wheat, barley, peas, mustard, and cotton (first to produce cotton, called "Sindon" by Greeks).
- **Animal Husbandry**: Domesticated oxen, sheep, goats, buffaloes, and pigs. Knowledge of horses is debated (Surkotada has controversial horse skeletal remains).
- **Trade**: Active maritime trade with Mesopotamia (referred to IVC as "Meluha"), Bahrain, and Afghanistan. Main imports included copper (Khetri, Rajasthan), tin (Afghanistan), and lapis lazuli (Badakhshan).
- **Seals & Scripts**: Standardized steatite seals with animal motifs. Script was **pictographic** and remains **undeciphered** (written boustrophedon — right to left, then left to right).

### 4. Society, Religion, and Decline
- **Social Structure**: Highly stratified urban society led by a class of merchants or priests (no evidence of a monarchy or standing army).
- **Religious Practices**: Worshipped Mother Goddess, **Pasupati Mahadeva** (surrounded by elephant, tiger, rhino, buffalo, and deer), Peepal trees, and amulet usage suggests belief in ghosts/magic. No temples built.
- **Decline**: Multiple theories exist: Aryan Invasion (Mortimer Wheeler), Ecological imbalance/drying of rivers (Robert Raikes), Floods (Marshall).`,
    concepts: ['Town Planning & Grid System', 'Underground Drainage System', 'Boustrophedon Script', 'Mesopotamian Trade Links'],
    importantFacts: [
      'Harappa was discovered by Daya Ram Sahni in 1921 on the banks of the Ravi River.',
      'Mohenjo-daro means "Mound of the Dead" and contains the Great Bath.',
      'Lothal was a major port city with an artificial dockyard on the Bhagava River.',
      'Dholavira is divided into three parts and features a sophisticated water conservation system.',
      'The IVC script is pictographic and remains undeciphered.'
    ],
    examples: [
      'The bronze statue of a "Dancing Girl" found at Mohenjo-daro shows mastery over the lost-wax casting technique.',
      'Meluha trade records: Cuneiform tablets from Mesopotamia mention trade transactions with a place called Meluha, identified as the Indus region.'
    ],
    tables: [{
      title: 'Major IVC Sites, Discoverers, and Findings',
      headers: ['Site', 'River Bank', 'Discoverer / Year', 'Key Findings'],
      rows: [
        ['Harappa', 'Ravi', 'D.R. Sahni (1921)', 'Row of six granaries, coffin burial, copper chariot'],
        ['Mohenjo-daro', 'Indus', 'R.D. Banerji (1922)', 'Great Bath, Great Granary, Bronze Dancing Girl, Seal of Pasupati'],
        ['Lothal', 'Bhagava', 'S.R. Rao (1954)', 'Dockyard, double burial (male & female), terracotta horse model, fire altars'],
        ['Kalibangan', 'Ghaggar', 'A. Ghosh (1953)', 'Ploughed field surface, wooden drainage, camel bones, fire altars'],
        ['Dholavira', 'Luni', 'R.S. Bisht (1990)', 'Water reservoirs, unique signboard with 10 large characters, stadium']
      ]
    }],
    revisionNotes: '* Date: 2500 BCE - 1900 BCE.\n* First site: Harappa (D.R. Sahni, 1921). Mohenjo-daro (R.D. Banerji, 1922).\n* Grid Town Planning + Burnt Bricks + Covered Underground Drainage.\n* Port: Lothal. Water management: Dholavira. Ploughed field: Kalibangan.\n* Religion: Pasupati Mahadeva, Mother Goddess, Peepal. No temples.\n* Script: Pictographic, undeciphered, boustrophedon writing style.',
    pyqs: [{
      question: {
        en: 'At which of the following Harappan sites is an artificial dockyard found?',
        hi: 'निम्नलिखित में से किस हड़प्पा स्थल पर एक कृत्रिम गोदीवाड़ा (dockyard) पाया गया है?'
      },
      options: [
        { en: 'Harappa', hi: 'हड़प्पा' },
        { en: 'Mohenjo-daro', hi: 'मोहनजोदड़ो' },
        { en: 'Lothal', hi: 'लोथल' },
        { en: 'Dholavira', hi: 'धोलावीरा' }
      ],
      answer: 2,
      explanation: {
        en: 'Lothal, situated in Gujarat on the bank of the Bhagava River, was a vital port city of the Indus Valley Civilization. It contains a massive artificial brick dockyard that connects to the Gulf of Khambhat.',
        hi: 'लोथल, जो गुजरात में भोगवा नदी के तट पर स्थित है, सिंधु घाटी सभ्यता का एक महत्वपूर्ण बंदरगाह शहर था। यहाँ एक विशाल कृत्रिम ईंटों का गोदीवाड़ा (dockyard) है जो खंभात की खाड़ी से जुड़ता है।'
      },
      year: 2018
    }]
  },
  {
    exam: 'BPSC',
    subject: 'History',
    topic: 'Modern India',
    subtopic: 'Revolt of 1857',
    introduction: 'The Revolt of 1857, also known as the First War of Indian Independence, was a watershed event in Indian history. In Bihar, the rebellion was led by Babu Kunwar Singh of Jagdishpur, whose heroic resistance against British forces remains a central topic of study for the BPSC examination.',
    detailedExplanation: `## The Revolt of 1857 — National Context & Bihar's Role

### 1. Causes of the Revolt
- **Political Causes**: Lord Dalhousie's **Doctrine of Lapse** (annexation of Satara, Jaitpur, Sambalpur, Jhansi, Nagpur, and Oudh on grounds of misgovernance), Subsidiary Alliance, and termination of pensions.
- **Economic Causes**: Heavy land revenue settlements (Zamindari, Ryotwari, Mahalwari), destruction of traditional Indian handicraft and textile industries, and drain of wealth.
- **Socio-Religious Causes**: Interference in traditional practices (abolition of Sati in 1829, Widow Remarriage Act of 1856), taxing of temple/mosque lands, and rapid activities of Christian missionaries.
- **Military Causes**: Discrimination in pay/promotion, General Service Enlistment Act 1856 (required crossing sea, which orthodox Hindus considered loss of caste).
- **Immediate Cause**: Introduction of the **Enfield Rifle** with cartridges suspected of being greased with beef and pig fat, offending both Hindu and Muslim soldiers.

### 2. Onset and Spread
- **March 29, 1857**: **Mangal Pandey** of the 34th Native Infantry mutinied at Barrackpore (Bengal).
- **May 10, 1857**: The main outbreak began at **Meerut**, where soldiers marched to Delhi and declared Bahadur Shah Zafar as the Emperor of Hindustan.

### 3. Role of Bihar in the Revolt
- **Patna Uprising (July 3, 1857)**: Led by **Pir Ali**, a bookseller from Patna. He led an armed rebellion against Commissioner William Tayler. Pir Ali was captured and hanged along with 16 associates.
- **Danapur Mutiny (July 25, 1857)**: Three native regiments at Danapur cantonment revolted, crossed the Son River, and marched to Arrah, joining Babu Kunwar Singh.
- **Babu Kunwar Singh (Arrah/Jagdishpur)**:
  - An 80-year-old Zamindar of Jagdishpur (Bhojpur district).
  - Assumed leadership on **July 26, 1857**, and successfully liberated Arrah from British control.
  - Engaged British forces led by Captain Dunbar, defeating them near Arrah.
  - Wounded in the arm by a bullet, he amputated his own hand at the Ganga river and offered it to the river goddess.
  - Re-captured Jagdishpur on **April 23, 1858**, defeating Captain Le Grand. He died shortly after on **April 26, 1858**.
  - His brother, **Amar Singh**, continued the struggle using guerrilla warfare in the hills of Kaimur.
- **Other Centers in Bihar**: Gaya (prisoners released), Rohini (Deoghar — initial spark on June 12, where 5th Irregular Cavalry killed Lt. Norman and Sir Leslie), Muzaffarpur, and Bhagalpur.

### 4. Administrative Outcomes of the Revolt
- **Government of India Act 1858**: Ended the East India Company rule; power transferred to the British Crown.
- **Secretary of State for India**: Created as a cabinet post in Britain, assisted by a 15-member Council of India.
- **Governor-General to Viceroy**: The Governor-General was given the title of Viceroy (Lord Canning became the first Viceroy).
- **Army Reorganisation (Peel Commission)**: Increased proportion of European soldiers to Indian soldiers (2:1 in Bengal, 3:1 in Madras/Bombay). Segregated regiments based on "martial" and "non-martial" races.`,
    concepts: ['Doctrine of Lapse', 'Greased Cartridges Controversy', 'Babu Kunwar Singh\'s Campaign', 'Peel Commission'],
    importantFacts: [
      'The initial spark of the 1857 Revolt in Bihar occurred on June 12, 1857, at Rohini village (now in Jharkhand).',
      'Pir Ali, a bookseller, led the rebellion in Patna on July 3, 1857.',
      'Babu Kunwar Singh, the 80-year-old landlord of Jagdishpur, was the chief leader of the revolt in Bihar.',
      'Babu Kunwar Singh died on April 26, 1858, after defeating Captain Le Grand\'s forces.',
      'Amar Singh, brother of Kunwar Singh, led guerrilla warfare in Kaimur hills.',
      'Under the Government of India Act 1858, the title of Governor-General was changed to Viceroy.'
    ],
    examples: [
      'Babu Kunwar Singh\'s battle tactics: He utilized mobile combat and local knowledge of the terrain to repeatedly defeat superior British regiments led by Eyre, Dunbar, and Le Grand.',
      'William Tayler, Commissioner of Patna, arrested participant Wahhabi leaders of Patna preemptively in June 1857 to prevent them from organizing the revolt.'
    ],
    tables: [{
      title: 'Leaders of the 1857 Revolt at Key Centers',
      headers: ['Center', 'Indian Leader', 'British Commander who Suppressed'],
      rows: [
        ['Delhi', 'Bahadur Shah II / General Bakht Khan', 'John Nicholson, Hudson'],
        ['Kanpur', 'Nana Sahib / Tantia Tope / Azimullah Khan', 'Colin Campbell'],
        ['Lucknow', 'Begum Hazrat Mahal', 'Colin Campbell'],
        ['Jhansi', 'Rani Laxmibai', 'Hugh Rose'],
        ['Bihar (Arrah)', 'Babu Kunwar Singh / Amar Singh', 'William Tayler, Vincent Eyre, Le Grand'],
        ['Patna', 'Pir Ali', 'William Tayler'],
        ['Allahabad', 'Liaqat Ali', 'Colonel Oniel']
      ]
    }],
    revisionNotes: '* Causes: Doctrine of Lapse, Enfield Rifle, exploitation.\n* Bihar Spark: Rohini village (June 12, 1857).\n* Patna: Pir Ali (bookseller, July 3). Hanged by Tayler.\n* Arrah: Babu Kunwar Singh (Jagdishpur, age 80). Led Danapur mutineers.\n* Kunwar Singh defeated Dunbar & Le Grand. Amputated hand. Died April 26, 1858.\n* Brother Amar Singh = Kaimur Hills guerrilla warfare.\n* Result: Act of 1858. Crown rule. Viceroy title (Canning). Peel Commission.',
    pyqs: [{
      question: {
        en: 'Who led the Revolt of 1857 in Bihar?',
        hi: 'बिहार में 1857 के विद्रोह का नेतृत्व किसने किया था?'
      },
      options: [
        { en: 'Nana Sahib', hi: 'नाना साहिब' },
        { en: 'Babu Kunwar Singh', hi: 'बाबू कुंवर सिंह' },
        { en: 'Khan Bahadur Khan', hi: 'खान बहादुर खान' },
        { en: 'Tantia Tope', hi: 'तांत्या टोपे' }
      ],
      answer: 1,
      explanation: {
        en: 'Babu Kunwar Singh of Jagdishpur (Bhojpur) led the 1857 Revolt in Bihar. Despite being 80 years old, he showed immense bravery, organized rebel forces, and defeated the British in several encounters before his death.',
        hi: 'जगदीशपुर (भोजपुर) के बाबू कुंवर सिंह ने बिहार में 1857 के विद्रोह का नेतृत्व किया था। 80 वर्ष की आयु के होने के बावजूद, उन्होंने अत्यधिक वीरता दिखाई, विद्रोही सेना का संगठन किया और अपनी मृत्यु से पहले कई मुठभेड़ों में अंग्रेजों को हराया।'
      },
      year: 2022
    }]
  },
  {
    exam: 'BPSC',
    subject: 'Geography',
    topic: 'Indian Geography',
    subtopic: 'Physiographic Divisions of India',
    introduction: 'India\'s physiography is characterized by high geological diversity. It is divided into five distinct physiographic units: The Northern Mountains, the Great Plains, the Peninsular Plateau, the Coastal Plains, and the Islands. For Bihar state exams, understanding the transition from the Himalayas to the Gangetic plains is critical.',
    detailedExplanation: `## Physiographic Divisions of India — Structural & Regional Geography

### 1. The Northern Mountains (Himalayas)
- **Origin**: Formed during the Tertiary period by the collision of the Eurasian and Indo-Australian plates. Classified as young fold mountains.
- **Structural Ranges**:
  - **Trans-Himalayas**: Karakoram (K2), Ladakh, Zaskar, Kailash ranges.
  - **Greater Himalayas (Himadri)**: Highest continuous range (average height 6000m). Contains Mt. Everest, Kanchenjunga.
  - **Lesser Himalayas (Himachal)**: Includes Pir Panjal, Dhauladhar, Mussoorie, Mahabharat ranges. Major hill stations.
  - **Outer Himalayas (Shiwaliks)**: Youngest range composed of loose sediments. In Bihar, this extends as the **Someshwar Hills** in West Champaran district.

### 2. The Great Northern Plains
- **Origin**: Deposition of silt and alluvium by the Indus, Ganga, and Brahmaputra river systems in a foreland basin.
- **Zones from North to South**:
  - **Bhabar**: Gravel and pebble-strewn belt at the foot of Shiwaliks where rivers disappear.
  - **Terai**: Marshy, swampy region south of Bhabar where rivers re-emerge. Dense forests.
  - **Bhangar**: Older alluvium terraces. Contains calcareous clay nodules ("Kankar").
  - **Khadar**: Newer, highly fertile alluvium of floodplains, renewed annually by floods.
- **Bihar Plains**: Comprises North Bihar Plain (high flood risk, rivers like Koshi, Gandak) and South Bihar Plain (tilts towards Ganga, drier, rivers like Son, Punpun).

### 3. The Peninsular Plateau
- **Origin**: Oldest, most stable landmass in India, composed of ancient crystalline igneous and metamorphic rocks. Part of ancient Gondwanaland.
- **Major Subdivisions**:
  - **Central Highlands**: Malwa, Bundelkhand, Baghelkhand, and Chota Nagpur Plateaus. (South Bihar districts like Gaya, Nawada, Banka share boundaries with Chota Nagpur).
  - **Deccan Plateau**: Volcanic basaltic plateau south of Narmada. Includes Western Ghats (continuous, Sahyadri) and Eastern Ghats (discontinuous, lower elevation).

### 4. Coastal Plains & Islands
- **Coastal Plains**: Western Coastal Plain (narrow, submergent coastline: Konkan, Kanara, Malabar) vs Eastern Coastal Plain (wide, emergent coastline with deltas: Northern Circars, Coromandel).
- **Islands**: Andaman & Nicobar (volcanic, active volcano at Barren Island) vs Lakshadweep (coral origin, atolls).`,
    concepts: ['Himalayan Orogeny', 'Foreland Basin Deposition', 'Bhabar-Terai-Bhangar-Khadar Belt', 'Gondwanaland Geology'],
    importantFacts: [
      'The Himalayas are young fold mountains formed by convergent plate boundary collision.',
      'The Someshwar Range in West Champaran represents the Shiwalik range in Bihar.',
      'Khadar is the most fertile, newly deposited alluvial soil renewed by annual floods.',
      'Lakshadweep islands are formed of coral deposits (atolls), whereas Andaman & Nicobar are volcanic.',
      'The Chota Nagpur plateau touches the southern fringe of Bihar, bringing mineral deposits to districts like Rohtas and Jamui.'
    ],
    examples: [
      'Duns: Valleys like Dehradun and Harike-dun lie between the Shiwaliks and the Lesser Himalayas.',
      'The Koshi River (Sorrow of Bihar) changes courses frequently due to the massive silt load it deposits upon entering the flat Khadar plains of Bihar.'
    ],
    tables: [{
      title: 'Geographic Comparison of Western and Eastern Ghats',
      headers: ['Feature', 'Western Ghats (Sahyadris)', 'Eastern Ghats'],
      rows: [
        ['Continuity', 'Continuous, crossed only through passes (Thal, Bhor, Pal)', 'Discontinuous, highly dissected by east-flowing rivers'],
        ['Average Height', '900 – 1600 meters (Higher)', '600 meters (Lower)'],
        ['Highest Peak', 'Anamudi (2695 m) in Anamalai Hills', 'Jindhagada Peak (1690 m) / Mahendragiri'],
        ['Rainfall Type', 'Heavy orographic rainfall on western slopes', 'Moderate rainfall, mostly during retreating monsoon'],
        ['Rivers Origin', 'Source of major rivers: Godavari, Krishna, Kaveri', 'No major perennial rivers originate here']
      ]
    }],
    revisionNotes: '* Mountains: Trans-Himalayas, Himadri, Himachal, Shiwalik. (Bihar = Someshwar Hills).\n* Plains: Bhabar (gravel, rivers disappear) → Terai (marshy, re-emerge) → Bhangar (old alluvium, Kankar) → Khadar (new alluvium, fertile).\n* Plateau: Gondwanaland origin. Southern border of Bihar matches Chota Nagpur.\n* Coasts: West (narrow, Malabar/Konkan) vs East (wide, Coromandel).\n* Islands: Andaman (volcanic, active Barren Is.) vs Lakshadweep (coral).',
    pyqs: [{
      question: {
        en: 'Which part of the Shiwalik range lies in Bihar?',
        hi: 'शिवालिक श्रेणी का कौन सा भाग बिहार में स्थित है?'
      },
      options: [
        { en: 'Someshwar Range', hi: 'सोमेश्वर श्रेणी' },
        { en: 'Kaimur Plateau', hi: 'कैमूर पठार' },
        { en: 'Rajgir Hills', hi: 'राजगीर पहाड़ियाँ' },
        { en: 'Kharagpur Hills', hi: 'खड़गपुर पहाड़ियाँ' }
      ],
      answer: 0,
      explanation: {
        en: 'The Someshwar Range in West Champaran district represents the outermost Shiwalik range in Bihar. Kaimur Plateau is part of the Vindhyan range in southwestern Bihar, while Rajgir and Kharagpur hills are part of the ancient Peninsular plateau in southern Bihar.',
        hi: 'पश्चिम चंपारण जिले में स्थित सोमेश्वर श्रेणी बिहार में सबसे बाहरी शिवालिक श्रेणी का प्रतिनिधित्व करती है। कैमूर पठार दक्षिण-पश्चिमी बिहार में विंध्यन श्रेणी का हिस्सा है, जबकि राजगीर और खड़गपुर पहाड़ियाँ दक्षिणी बिहार में प्राचीन प्रायद्वीपीय पठार का हिस्सा हैं।'
      },
      year: 2021
    }]
  },
  {
    exam: 'BPSC',
    subject: 'Polity',
    topic: 'Indian Constitution',
    subtopic: 'Fundamental Rights — Articles 12–35',
    introduction: 'Fundamental Rights are enshrined in Part III of the Indian Constitution (Articles 12 to 35). They are justiciable, meaning citizens can directly approach the judiciary (Supreme Court via Article 32 or High Courts via Article 226) for their enforcement. Inspired by the US Bill of Rights, they form the cornerstone of democratic liberty in India.',
    detailedExplanation: `## Fundamental Rights (Part III) — Articles 12 to 35

### 1. General Provisions (Articles 12 & 13)
- **Article 12**: Defines "State" to include the Government and Parliament of India, state governments and legislatures, local authorities (municipalities, panchayats), and other statutory/non-statutory bodies (LIC, ONGC, GAIL).
- **Article 13**: Declares that all laws that are inconsistent with or in derogation of Fundamental Rights shall be void. This establishes the foundation of **Judicial Review**.

### 2. Six Groups of Fundamental Rights
- **Right to Equality (Articles 14–18)**:
  - **Article 14**: Equality before law and equal protection of laws.
  - **Article 15**: Prohibition of discrimination on grounds only of religion, race, caste, sex, or place of birth.
  - **Article 16**: Equality of opportunity in public employment.
  - **Article 17**: Abolition of untouchability.
  - **Article 18**: Abolition of titles (except military and academic).
- **Right to Freedom (Articles 19–22)**:
  - **Article 19**: Guarantees 6 democratic freedoms (speech & expression, assembly, association, movement, residence, profession).
  - **Article 20**: Protection in respect of conviction for offenses (no ex-post facto laws, no double jeopardy, no self-incrimination).
  - **Article 21**: Protection of life and personal liberty. Expansive interpretations have read in: right to privacy, clean water/air, livelihood, etc.
  - **Article 21A**: Right to free and compulsory education for children of age 6 to 14 years (inserted by 86th Amendment, 2002).
  - **Article 22**: Protection against arrest and detention in certain cases.
- **Right against Exploitation (Articles 23–24)**:
  - **Article 23**: Prohibition of traffic in human beings and forced labor (begar).
  - **Article 24**: Prohibition of employment of children (under 14 years) in factories, mines, and hazardous occupations.
- **Right to Freedom of Religion (Articles 25–28)**:
  - **Article 25**: Freedom of conscience and free profession, practice, and propagation of religion.
  - **Article 26**: Freedom to manage religious affairs.
  - **Article 27**: Freedom from payment of taxes for promotion of any particular religion.
  - **Article 28**: Freedom from attending religious instruction in certain educational institutions.
- **Cultural and Educational Rights (Articles 29–30)**:
  - **Article 29**: Protection of interests of minorities (language, script, culture).
  - **Article 30**: Right of minorities to establish and administer educational institutions.
- **Right to Constitutional Remedies (Article 32)**:
  - Empowers citizens to petition the Supreme Court for enforcement of rights.
  - Dr. B.R. Ambedkar called Article 32 the **"Heart and Soul of the Constitution"**.
  - The Supreme Court can issue 5 types of writs: **Habeas Corpus, Mandamus, Prohibition, Certiorari, and Quo Warranto**.

### 3. Key Legal Points & Amendments
- **Right to Property**: Originally a Fundamental Right (Article 19(1)(f) and Article 31). It was deleted by the **44th Amendment Act, 1978** and made a legal right under **Article 300A** in Part XII.
- **Suspension of Rights**: During a National Emergency (Article 352), all FRs can be suspended by Presidential order under Article 359, EXCEPT **Articles 20 and 21**, which can never be suspended. Article 19 is suspended automatically under Article 358 only in case of war/external aggression, not armed rebellion.`,
    concepts: ['Justiciability', 'Judicial Review (Article 13)', 'Due Process of Law vs Procedure Established by Law', 'Writ Jurisdiction'],
    importantFacts: [
      'Fundamental Rights are justiciable and guaranteed to all citizens, though some (Articles 15, 16, 19, 29, 30) are exclusive to citizens.',
      'The 44th Amendment (1978) abolished the Right to Property as a Fundamental Right.',
      'Articles 20 and 21 cannot be suspended under any emergency conditions.',
      'The Supreme Court (Article 32) and High Courts (Article 226) hold concurrent writ jurisdiction, though the High Court\'s writ power is broader (extends to non-FR cases).',
      'The 86th Constitutional Amendment (2002) added Article 21A, introducing the Right to Education.'
    ],
    examples: [
      'Maneka Gandhi Case (1978): The Supreme Court ruled that "procedure established by law" under Article 21 must be just, fair, and reasonable, incorporating the American concept of "due process of law."',
      'K.S. Puttaswamy Case (2017): A 9-judge bench of the SC unanimously declared the Right to Privacy as a fundamental right under Article 21.'
    ],
    tables: [{
      title: 'Five Types of Writs',
      headers: ['Writ', 'Literal Meaning', 'Target of Writ', 'Purpose'],
      rows: [
        ['Habeas Corpus', '"To have the body of"', 'Public authorities & private individuals', 'To release a person who has been detained unlawfully'],
        ['Mandamus', '"We command"', 'Public bodies, corporations, inferior courts, govt.', 'To compel a public official to perform their statutory duty'],
        ['Prohibition', '"To forbid"', 'Lower courts, judicial & quasi-judicial bodies', 'To prevent lower courts from exceeding their jurisdiction (preventive)'],
        ['Certiorari', '"To be certified"', 'Lower courts, judicial, quasi-judicial & administrative bodies', 'To quash an order already passed by a lower court/body (curative)'],
        ['Quo Warranto', '"By what authority?"', 'Public offices of a permanent character', 'To prevent illegal usurpation of a public office by a person']
      ]
    }],
    revisionNotes: '* Part III, Articles 12–35. Modeled on US Bill of Rights.\n* Justiciable. SC (Art 32) & HC (Art 226) enforce them.\n* Art 13 = Basis of Judicial Review.\n* Art 20 & 21 cannot be suspended during Emergency.\n* Right to Property (Art 31) removed by 44th Amendment (1978), now Art 300A (legal right).\n* Art 32 = Heart and Soul (Ambedkar). 5 writs.',
    pyqs: [{
      question: {
        en: 'Which of the following Fundamental Rights cannot be suspended during a National Emergency?',
        hi: 'राष्ट्रीय आपातकाल के दौरान निम्नलिखित में से कौन से मौलिक अधिकार निलंबित नहीं किए जा सकते?'
      },
      options: [
        { en: 'Articles 14 and 19', hi: 'अनुच्छेद 14 और 19' },
        { en: 'Articles 19 and 20', hi: 'अनुच्छेद 19 और 20' },
        { en: 'Articles 20 and 21', hi: 'अनुच्छेद 20 और 21' },
        { en: 'Articles 21 and 22', hi: 'अनुच्छेद 21 और 22' }
      ],
      answer: 2,
      explanation: {
        en: 'As per the 44th Amendment Act, 1978, the right to protection in respect of conviction for offenses (Article 20) and the right to life and personal liberty (Article 21) cannot be suspended even during a National Emergency declared under Article 352.',
        hi: '44वें संशोधन अधिनियम, 1978 के अनुसार, अपराधों के लिए दोषसिद्धि के संबंध में संरक्षण का अधिकार (अनुच्छेद 20) और प्राण एवं दैहिक स्वतंत्रता का अधिकार (अनुच्छेद 21) को अनुच्छेद 352 के तहत घोषित राष्ट्रीय आपातकाल के दौरान भी निलंबित नहीं किया जा सकता है।'
      },
      year: 2019
    }]
  },
  {
    exam: 'BPSC',
    subject: 'Polity',
    topic: 'Government Structure',
    subtopic: 'Parliament — Lok Sabha & Rajya Sabha',
    introduction: 'The Indian Parliament is a bicameral legislature consisting of the President, the Lok Sabha (House of the People), and the Rajya Sabha (Council of States). It is the supreme law-making body of the nation, operating under the parliamentary system of democracy.',
    detailedExplanation: `## Parliament — Composition, Powers, and Legislative Process

### 1. Composition of Parliament (Article 79)
- **The President**: Though not a member of either House, the President is an integral part of Parliament because no bill can become law without the President's assent.
- **Rajya Sabha (Council of States — Article 80)**:
  - **Maximum Strength**: 250 (238 representing States/UTs, 12 nominated by President for art, literature, science, social service).
  - **Elections**: Indirectly elected by the elected members of State Legislative Assemblies using proportional representation.
  - **Nature**: Permanent House, not subject to dissolution. Members have 6-year terms, with 1/3rd retiring every 2 years.
- **Lok Sabha (House of the People — Article 81)**:
  - **Maximum Strength**: 552 (originally 530 from States, 20 from UTs, 2 nominated Anglo-Indians. The Anglo-Indian nomination was abolished by the **104th Amendment Act, 2019**).
  - **Elections**: Directly elected by citizens on the basis of universal adult franchise (Article 326).
  - **Nature**: Normal term of 5 years, but can be dissolved earlier by the President on the advice of the Prime Minister.

### 2. Legislative Procedure
- **Ordinary Bills (Articles 107 & 108)**: Can be introduced in either House. Requires agreement of both Houses. In case of deadlock, the President can summon a **Joint Sitting (Article 108)**, presided over by the **Speaker of the Lok Sabha**.
- **Money Bills (Articles 109 & 110)**:
  - Can only be introduced in the Lok Sabha on the prior recommendation of the President.
  - The Speaker of the Lok Sabha has the sole authority to certify a bill as a Money Bill.
  - Rajya Sabha has limited powers: it can neither reject nor amend a Money Bill, and must return it to Lok Sabha within 14 days, with or without recommendations.
- **Financial Bills**: Categorized into Financial Bill (I) under Article 117(1) and Financial Bill (II) under Article 117(3).
- **Constitutional Amendment Bills (Article 368)**: Can be introduced in either House. Must be passed by each House separately by a special majority. **No joint sitting is allowed** for Constitutional Amendment Bills.

### 3. Special Powers of Rajya Sabha
- **Article 249**: Can pass a resolution (by 2/3rd majority of members present and voting) authorizing Parliament to make laws on a subject in the State List in national interest.
- **Article 312**: Can pass a resolution to create one or more new All-India Services common to the Union and the States.`,
    concepts: ['Bicameralism', 'Money Bill certification', 'Joint Sitting Mechanism', 'Special Powers of Rajya Sabha'],
    importantFacts: [
      'The Lok Sabha Speaker presides over a joint sitting of both Houses of Parliament.',
      'Money Bills are defined under Article 110 of the Constitution.',
      'Rajya Sabha has 12 nominated members, while Anglo-Indian nominations in Lok Sabha were removed by the 104th Amendment.',
      'A joint sitting cannot be held for Money Bills or Constitutional Amendment Bills.',
      'The quorum required to constitute a sitting of either House is 1/10th of the total members (Article 100).'
    ],
    examples: [
      'Joint Sittings: Convened only thrice in India\'s history: Dowry Prohibition Bill (1961), Banking Service Commission Repeal Bill (1978), and Prevention of Terrorism Act (POTA) (2002).',
      'Money Bill status: In 2016, the Aadhaar Act was passed as a Money Bill, which bypassed the legislative veto of the Rajya Sabha.'
    ],
    tables: [{
      title: 'Comparison of Lok Sabha and Rajya Sabha',
      headers: ['Parameter', 'Lok Sabha (Lower House)', 'Rajya Sabha (Upper House)'],
      rows: [
        ['Popular Name', 'House of the People / Lok Sabha', 'Council of States / Rajya Sabha'],
        ['Presiding Officer', 'Speaker (elected from within the House)', 'Vice-President of India (Ex-officio Chairman)'],
        ['Elected Strength', '543 (directly elected)', '233 (indirectly elected by state MLAs)'],
        ['Nominated Members', 'Nil (Anglo-Indian provision abolished)', '12 (nominated by the President)'],
        ['Quorum', '10% of total membership (~55 members)', '10% of total membership (~25 members)'],
        ['Money Bill Authority', 'Absolute power to pass; rejects or accepts Rajya Sabha amendments', 'No power to reject or amend; must return in 14 days']
      ]
    }],
    revisionNotes: '* Composition: President + Lok Sabha + Rajya Sabha (Art 79).\n* RS: Permanent, 250 max (238 elected + 12 nominated). 6-yr term, 1/3rd retire every 2 yrs.\n* LS: 5-yr term, 550 max (directly elected). Anglo-Indian seats removed by 104th Amendment.\n* Money Bill: Art 110. LS only. RS has 14 days max.\n* Joint Sitting: Art 108. Summoned by President, presided by LS Speaker. Not for Money/Amendment Bills.\n* Special RS powers: Art 249 (State List laws), Art 312 (All-India Services).',
    pyqs: [{
      question: {
        en: 'A Money Bill can be introduced only in:',
        hi: 'एक धन विधेयक केवल कहाँ पेश किया जा सकता है?'
      },
      options: [
        { en: 'Rajya Sabha', hi: 'राज्यसभा' },
        { en: 'Lok Sabha', hi: 'लोकसभा' },
        { en: 'Both Houses of Parliament', hi: 'संसद के दोनों सदन' },
        { en: 'Joint Sitting of Parliament', hi: 'संसद का संयुक्त सत्र' }
      ],
      answer: 1,
      explanation: {
        en: 'According to Article 109 of the Indian Constitution, a Money Bill cannot be introduced in the Rajya Sabha. It can only be introduced in the Lok Sabha on the prior recommendation of the President.',
        hi: 'भारतीय संविधान के अनुच्छेद 109 के अनुसार, धन विधेयक राज्यसभा में पेश नहीं किया जा सकता है। यह केवल राष्ट्रपति की पूर्व सिफारिश पर लोकसभा में ही पेश किया जा सकता है।'
      },
      year: 2020
    }]
  },
  {
    exam: 'BPSC',
    subject: 'General Science',
    topic: 'Physics',
    subtopic: 'Newton\'s Laws of Motion',
    introduction: 'Sir Isaac Newton formulated the three fundamental laws of motion in his work "Philosophiae Naturalis Principia Mathematica" in 1687. These laws define the relationship between a body, the forces acting upon it, and its motion in response to those forces.',
    detailedExplanation: `## Newton's Laws of Motion — Theoretical Mechanics

### 1. Newton's First Law of Motion (Law of Inertia)
- **Statement**: An object will remain at rest or in uniform motion in a straight line unless acted upon by an external unbalanced force.
- **Inertia**: The inherent property of a body to resist change in its state of rest or motion. Mass is the quantitative measure of inertia (higher mass = higher inertia).
- **Types of Inertia**:
  1. **Inertia of Rest**: Tendency to remain at rest (e.g., passengers fall backward when a bus starts suddenly; dust flies off a carpet when beaten with a stick).
  2. **Inertia of Motion**: Tendency to maintain uniform motion (e.g., passengers fall forward when a bus stops suddenly; an athlete runs some distance before taking a long jump).
  3. **Inertia of Direction**: Tendency to maintain direction of motion (e.g., umbrella shields from rain falling straight; passengers lean sideways when a car takes a sharp turn).

### 2. Newton's Second Law of Motion (Law of Force)
- **Statement**: The rate of change of momentum of a body is directly proportional to the applied force and takes place in the direction in which the force acts.
- **Concepts**:
  - Momentum (p) = Mass (m) * Velocity (v).
  - Force (F) is proportional to change in momentum over time (dp/dt).
  - From this we derive: Force = Mass * Acceleration (F = m * a).
- **Impulse**: A large force acting on a body for a short duration. Impulse = Force * Time = Change in momentum. (e.g., a cricket fielder pulls his hands backward while catching a ball to increase contact time, which reduces the impact force).

### 3. Newton's Third Law of Motion (Action-Reaction)
- **Statement**: To every action, there is always an equal and opposite reaction.
- **Key Characteristics**: Action and reaction act on **different bodies**, meaning they never cancel each other out. They occur simultaneously.
- **Applications**:
  - **Recoil of a Gun**: When a bullet is fired (action), the gun moves backward (reaction).
  - **Rocket Propulsion**: Escaping exhaust gases thrust downward (action), propelling the rocket upward (reaction).
  - **Swimming**: A swimmer pushes water backward (action), and the water pushes the swimmer forward (reaction).`,
    concepts: ['Inertia (Rest, Motion, Direction)', 'Linear Momentum (p = mv)', 'Force = m * a', 'Impulse and Contact Time', 'Action-Reaction Pairs'],
    importantFacts: [
      'Newton\'s first law defines force qualitatively, while the second law provides the quantitative definition (F = m * a).',
      'Inertia is directly proportional to the mass of the body.',
      'Action and reaction forces always act on two different bodies simultaneously.',
      'Jet engines and rockets work on the principle of Newton\'s third law and conservation of linear momentum.',
      'The SI unit of force is the Newton (N), where 1 N = 1 kg * m/s^2.'
    ],
    examples: [
      'Catching a ball: A cricket fielder pulls his hands back to increase the time of impact. Since Force = Change in momentum / Time, increasing time reduces the force experienced on his hands.',
      'Walking: When we walk, we push the ground backward with our foot (action), and the ground pushes us forward with an equal force (reaction).'
    ],
    tables: [{
      title: 'Comparison of Newton\'s Three Laws of Motion',
      headers: ['Law', 'Popular Name', 'Main Focus', 'Formula / Concept', 'Real-world Example'],
      rows: [
        ['First Law', 'Law of Inertia', 'Defines force qualitatively; explains state stability', 'Inertia (Rest, Motion, Direction)', 'Dust particles fly off a carpet when beaten with a stick'],
        ['Second Law', 'Law of Force', 'Quantifies force; relates force to acceleration', 'F = m * a', 'Fielder pulls hands back to catch a fast-moving cricket ball safely'],
        ['Third Law', 'Action-Reaction', 'Explains nature of interacting forces', 'F(action) = -F(reaction)', 'Propulsion of rockets; recoil action of a fired rifle']
      ]
    }],
    revisionNotes: '* First Law: Object resists change in state. Defines inertia. (e.g., passengers falling forward/backward).\n* Second Law: Rate of change of momentum proportional to force applied. F = ma. Defines force quantitatively.\n* Impulse = Force * Time = Change in momentum. (e.g., catching a ball).\n* Third Law: Every action has an equal and opposite reaction. Forces act on different bodies. (e.g., rocket, gun recoil, swimming).',
    pyqs: [{
      question: {
        en: 'The working principle of a rocket is based on which of the following?',
        hi: 'एक रॉकेट का कार्य सिद्धांत निम्नलिखित में से किस पर आधारित है?'
      },
      options: [
        { en: 'Newton\'s First Law of Motion', hi: 'न्यूटन का गति का पहला नियम' },
        { en: 'Newton\'s Second Law of Motion', hi: 'न्यूटन का गति का दूसरा नियम' },
        { en: 'Newton\'s Third Law of Motion', hi: 'न्यूटन का गति का तीसरा नियम' },
        { en: 'Kepler\'s Laws of Planetary Motion', hi: 'केप्लर के ग्रहों की गति के नियम' }
      ],
      answer: 2,
      explanation: {
        en: 'The propulsion of a rocket works on Newton\'s Third Law of Motion (Action and Reaction). The hot exhaust gases escaping through the nozzle at high speed exert a downward force (action), creating an equal and opposite upward thrust (reaction) that propels the rocket.',
        hi: 'रॉकेट का प्रणोदन न्यूटन के गति के तीसरे नियम (क्रिया और प्रतिक्रिया) पर काम करता है। नोजल के माध्यम से उच्च गति पर निकलने वाली गर्म निकास गैसें नीचे की ओर बल (क्रिया) लगाती हैं, जिससे एक समान और विपरीत ऊपर की ओर जोर (प्रतिक्रिया) बनता है जो रॉकेट को आगे बढ़ाता है।'
      },
      year: 2021
    }]
  },
  {
    exam: 'BPSC',
    subject: 'General Science',
    topic: 'Chemistry',
    subtopic: 'Acids, Bases & Salts',
    introduction: 'Acids, bases, and salts are fundamental categories of chemical compounds. They are distinguished by their taste, chemical behavior, reactions with indicators, and pH values, finding wide application in laboratory and industrial processes.',
    detailedExplanation: `## Acids, Bases & Salts — Chemical Properties & Concepts

### 1. Theories of Acids and Bases
- **Arrhenius Theory**:
  - **Acids**: Release hydrogen ions (H+ or hydronium ions H3O+) in aqueous solution.
  - **Bases**: Release hydroxide ions (OH-) in aqueous solution. Water-soluble bases are called **alkalis**.
- **Bronsted-Lowry Theory**:
  - **Acids**: Proton (H+) donors.
  - **Bases**: Proton (H+) acceptors.
- **Lewis Theory**:
  - **Acids**: Electron-pair acceptors (e.g., BF3, AlCl3).
  - **Bases**: Electron-pair donors (e.g., NH3, H2O).

### 2. Indicators & pH Scale
- **pH Scale**: Formulated by **S.P.L. Sorensen** in 1909. Measures hydrogen ion concentration: pH = -log[H+].
  - pH < 7: Acidic (lower pH = stronger acid).
  - pH = 7: Neutral (e.g., pure water).
  - pH > 7: Basic (higher pH = stronger base).
- **Indicators**: Substances that change color in acidic or basic media.
  - **Litmus**: Natural indicator from Lichen. Acid turns blue litmus red; Base turns red litmus blue.
  - **Phenolphthalein**: Acid = Colorless; Base = Pink.
  - **Methyl Orange**: Acid = Red; Base = Yellow.

### 3. Chemical Properties
- **Reaction with Metals**:
  - Acid + Metal -> Salt + Hydrogen gas (H2). Hydrogen burns with a 'pop' sound.
- **Neutralization Reaction**:
  - Acid + Base -> Salt + Water. Exothermic reaction.

### 4. Important Salts and Their Uses
- **Sodium Chloride (NaCl)**: Common salt, used in cooking, food preservation, and raw material for chemicals.
- **Bleaching Powder (CaOCl2)**: Calcium oxychloride. Prepared by reacting chlorine with dry slaked lime. Used for disinfecting drinking water and bleaching paper/textiles.
- **Baking Soda (NaHCO3)**: Sodium hydrogen carbonate. Prepared using Solvay process. Used in baking (releases CO2 gas making dough rise), antacids, and fire extinguishers.
- **Washing Soda (Na2CO3 * 10H2O)**: Sodium carbonate decahydrate. Used in glass, soap, and paper industries, and for removing permanent hardness of water.
- **Plaster of Paris (CaSO4 * 0.5H2O)**: Calcium sulphate hemihydrate. Prepared by heating gypsum at 373 K. Used for plastering fractured bones and making toys.`,
    concepts: ['Arrhenius, Bronsted & Lewis Theories', 'pH Scale Calculation', 'Natural & Synthetic Indicators', 'Preparation & Uses of Commercial Salts'],
    importantFacts: [
      'Sorensen introduced the pH scale in 1909.',
      'Strong acids ionize completely in water (e.g., HCl, HNO3, H2SO4); weak acids ionize partially (e.g., CH3COOH, H2CO3).',
      'Plaster of Paris turns into hard Gypsum upon mixing with water.',
      'Washing soda is chemically sodium carbonate decahydrate, used to remove permanent water hardness.',
      'Aqua Regia is a highly corrosive mixture of concentrated HCl and HNO3 in a 3:1 ratio, capable of dissolving gold and platinum.'
    ],
    examples: [
      'Bee sting: Injection of formic acid causes pain. Neutralized by rubbing mild bases like baking soda (NaHCO3).',
      'Antacid: Milk of Magnesia (Mg(OH)2) is a mild base taken to neutralize excess hydrochloric acid in the stomach causing acidity.'
    ],
    tables: [{
      title: 'Common Acid-Base Indicators and Color Changes',
      headers: ['Indicator', 'Original Color', 'Color in Acid', 'Color in Base'],
      rows: [
        ['Blue Litmus', 'Blue', 'Red', 'Blue (No Change)'],
        ['Red Litmus', 'Red', 'Red (No Change)', 'Blue'],
        ['Phenolphthalein', 'Colorless', 'Colorless', 'Pink'],
        ['Methyl Orange', 'Orange', 'Red/Pink', 'Yellow'],
        ['Turmeric Paste', 'Yellow', 'Yellow (No Change)', 'Reddish-brown']
      ]
    }],
    revisionNotes: '* Theories: Arrhenius (H+/OH-), Bronsted (proton donor/acceptor), Lewis (electron pair acceptor/donor).\n* pH = -log[H+]. Acid < 7, Neutral = 7, Base > 7.\n* Acid + Metal -> Salt + H2. Acid + Base -> Salt + H2O (Neutralization).\n* Bleaching Powder: CaOCl2 (disinfectant).\n* Baking Soda: NaHCO3 (antacid, baking).\n* Washing Soda: Na2CO3 * 10H2O (softens water).\n* Plaster of Paris: CaSO4 * 0.5H2O (casts, toys).\n* Aqua Regia: 3 HCl : 1 HNO3 (dissolves gold).',
    pyqs: [{
      question: {
        en: 'Which of the following is used to remove the permanent hardness of water?',
        hi: 'पानी की स्थायी कठोरता को दूर करने के लिए निम्नलिखित में से किसका उपयोग किया जाता है?'
      },
      options: [
        { en: 'Baking Soda', hi: 'बेकिंग सोडा' },
        { en: 'Washing Soda', hi: 'धोने का सोडा (वाशिंग सोडा)' },
        { en: 'Bleaching Powder', hi: 'ब्लीचिंग पाउडर' },
        { en: 'Plaster of Paris', hi: 'प्लास्टर ऑफ पेरिस' }
      ],
      answer: 1,
      explanation: {
        en: 'Washing soda (Sodium carbonate decahydrate, Na2CO3 * 10H2O) reacts with soluble calcium and magnesium chlorides and sulphates in hard water to form insoluble carbonates, thereby removing both temporary and permanent hardness of water.',
        hi: 'वाशिंग सोडा (सोडियम कार्बोनेट डेकाहाइड्रेट, Na2CO3 * 10H2O) कठोर जल में घुलनशील कैल्शियम और मैग्नीशियम क्लोराइड और सल्फेट्स के साथ अभिक्रिया करके अघुलनशील कार्बोनेट बनाता है, जिससे जल की अस्थायी और स्थायी दोनों प्रकार की कठोरता दूर हो जाती है।'
      },
      year: 2020
    }]
  },

  // ═══════════════════════════════════════════════════════════════════
  // RAILWAY (3 SUBTOPICS)
  // ═══════════════════════════════════════════════════════════════════
  {
    exam: 'Railway',
    subject: 'Mathematics',
    topic: 'Arithmetic & Algebra',
    subtopic: 'Number System',
    introduction: 'Number System is the foundation of mathematics, covering the classification of numbers, divisibility rules, remainders, and calculations. It is a highly emphasized topic in Railway exams like NTPC, Group D, and ALP.',
    detailedExplanation: `## Number System — Classification, Divisibility & Remainder Theorems

### 1. Classification of Numbers
- **Real Numbers**: All numbers representable on a number line.
  - **Rational Numbers**: Expressible as p/q where q is not 0 and p, q are integers.
  - **Irrational Numbers**: Cannot be expressed as p/q; non-terminating, non-repeating decimals (e.g., sqrt(2), pi, e).
- **Integers**: {..., -3, -2, -1, 0, 1, 2, 3, ...}.
- **Prime Numbers**: Numbers greater than 1 having exactly two factors (1 and itself). 2 is the only even prime number. Prime numbers up to 100 = 25.
- **Composite Numbers**: Numbers having more than two factors (e.g., 4, 6, 8, 9). 1 is neither prime nor composite.
- **Co-Prime Numbers**: Two numbers whose HCF is 1 (e.g., 8 and 15).

### 2. Divisibility Rules
- **Divisibility by 2**: Last digit is even (0, 2, 4, 6, 8).
- **Divisibility by 3**: Sum of digits is divisible by 3.
- **Divisibility by 4**: Number formed by last two digits is divisible by 4.
- **Divisibility by 5**: Last digit is 0 or 5.
- **Divisibility by 6**: Divisible by both 2 and 3.
- **Divisibility by 8**: Number formed by last three digits is divisible by 8.
- **Divisibility by 9**: Sum of digits is divisible by 9.
- **Divisibility by 11**: Difference between sum of digits at odd places and sum of digits at even places is either 0 or a multiple of 11.

### 3. Unit Digit and Remainders
- **Finding Unit Digit**: Cyclicity of unit digits.
  - Cyclicity of 0, 1, 5, 6 is 1 (always remain same).
  - Cyclicity of 4 and 9 is 2 (depends on odd/even power).
  - Cyclicity of 2, 3, 7, 8 is 4. Divide power by 4 and use remainder as new power.
- **Remainder Theorem**: If a mathematical expression is divided, simple modular arithmetic applies. Dividend = (Divisor * Quotient) + Remainder.`,
    concepts: ['Number Classification', 'Divisibility Rules (2 to 11)', 'Unit Digit Cyclicity Rules', 'Dividend-Divisor Relation'],
    importantFacts: [
      '2 is the smallest and only even prime number.',
      '1 is neither prime nor composite.',
      'Every natural number is an integer, but every integer is not a natural number.',
      'There are exactly 25 prime numbers between 1 and 100.',
      'To test if a number N is prime, check divisibility by primes less than sqrt(N).'
    ],
    examples: [
      'Find unit digit of 7^105: Cyclicity of 7 is 4. Divide power 105 by 4. Remainder is 1. Unit digit of 7^105 is same as 7^1 = 7.',
      'Test divisibility of 1331 by 11: Sum of odd place digits = 1+3=4. Sum of even place digits = 3+1=4. Difference = 4-4=0. So, 1331 is divisible by 11.'
    ],
    tables: [{
      title: 'Cyclicity of Unit Digits',
      headers: ['Digits', 'Cyclicity', 'Pattern of Power (Power % 4)'],
      rows: [
        ['0, 1, 5, 6', '1', 'Remain unchanged regardless of power'],
        ['4', '2', '4^1 -> 4, 4^2 -> 6 (Odd power -> 4, Even -> 6)'],
        ['9', '2', '9^1 -> 9, 9^2 -> 1 (Odd power -> 9, Even -> 1)'],
        ['2, 3, 7, 8', '4', 'Divide power by 4, find remainder r. Unit digit is digit raised to power r (if r=0, power is 4)']
      ]
    }],
    revisionNotes: '* Rational: p/q form. Irrational: sqrt(2), pi.\n* Smallest prime: 2. Prime 1-100 = 25.\n* Divisibility: 3 & 9 (sum of digits); 4 (last 2 digits); 8 (last 3 digits); 11 (difference of odd-even sums).\n* Unit digit: cyclicity of 2,3,7,8 is 4. Divide power by 4.\n* Dividend = (Divisor * Quotient) + Remainder.',
    pyqs: [{
      question: {
        en: 'What is the unit digit of (25)^6251 + (36)^528 + (73)^54?',
        hi: '(25)^6251 + (36)^528 + (73)^54 का इकाई का अंक क्या है?'
      },
      options: [
        { en: '4', hi: '4' },
        { en: '0', hi: '0' },
        { en: '2', hi: '2' },
        { en: '5', hi: '5' }
      ],
      answer: 1,
      explanation: {
        en: '1) Unit digit of 25^6251: Base ends in 5, so unit digit is 5.\n2) Unit digit of 36^528: Base ends in 6, so unit digit is 6.\n3) Unit digit of 73^54: Base ends in 3 (cyclicity 4). Power 54 % 4 = 2. Unit digit is 3^2 = 9.\nSum = 5 + 6 + 9 = 20. The unit digit of the sum is 0.',
        hi: '1) $25^{6251}$ का इकाई अंक: आधार 5 में समाप्त होता है, इसलिए इकाई अंक 5 है।\n2) $36^{528}$ का इकाई अंक: आधार 6 में समाप्त होता है, इसलिए इकाई अंक 6 है।\n3) $73^{54}$ का इकाई अंक: आधार 3 है (चक्रीयता 4)। घात $54 \% 4 = 2$। इकाई अंक $3^2 = 9$ है।\nयोग = $5 + 6 + 9 = 20$। योग का इकाई अंक 0 है।'
      },
      year: 2021
    }]
  },
  {
    exam: 'Railway',
    subject: 'Mathematics',
    topic: 'Arithmetic & Algebra',
    subtopic: 'Percentage',
    introduction: 'Percentage is a foundational arithmetic concept expressing a number as a fraction of 100. Mastery of percentage calculations, conversions, and changes is essential for solving Profit and Loss, SI-CI, and Data Interpretation questions in Railway exams.',
    detailedExplanation: `## Percentage — Calculations, Formulas, and Fractions

### 1. Basic Definition and Fraction Conversions
- **Percentage**: Derived from "per cent" meaning "for every 100". Denoted by "%".
- **To convert percentage to fraction**: Divide by 100 (e.g., 20% = 20/100 = 1/5).
- **To convert fraction to percentage**: Multiply by 100 (e.g., 1/4 * 100 = 25%).

### 2. Standard Percentage-Fraction Equivalence
Knowing fraction equivalents accelerates calculations:
- 1 = 100%
- 1/2 = 50%
- 1/3 = 33.33%
- 1/4 = 25%
- 1/5 = 20%
- 1/6 = 16.66%
- 1/8 = 12.5%
- 1/10 = 10%

### 3. Percentage Change and Product Consistency
- **Percentage Increase/Decrease**:
  - Percentage Increase = (Increase / Original Value) * 100
  - Percentage Decrease = (Decrease / Original Value) * 100
- **Successive Percentage Change**: If a value is changed by A% and then by B%, the net percentage change is given by:
  Net Change = A + B + (A * B)/100 %
  (Use negative sign for decrease/discount).
- **Product Consistency Rule**: If the price of a commodity increases by R%, the reduction in consumption required to keep expenditure constant is:
  Reduction = (R / (100 + R)) * 100%`,
    concepts: ['Fraction to Percentage Conversion', 'Percentage Change Formula', 'Successive Percentage Formula', 'Price-Consumption-Expenditure Relation'],
    importantFacts: [
      'Percentages are dimensionless ratio metrics.',
      'A successive increase of 20% and 10% is equivalent to a single net increase of 32%, not 30%.',
      'If A is 25% more than B, then B is 20% less than A.',
      'Converting percentages to fractions simplifies complex arithmetic calculation processes.'
    ],
    examples: [
      'If the price of sugar rises by 25%, by how much should consumption be reduced to keep expenditure same? Reduction = (25 / 125) * 100% = 20%.',
      'A salary is first increased by 10% and then decreased by 10%. Net change = +10 - 10 + (10 * -10)/100 = -1%. Salary decreased by 1%.'
    ],
    tables: [{
      title: 'Fraction to Percentage Equivalents',
      headers: ['Fraction', 'Percentage (Exact)', 'Percentage (Decimal approximation)'],
      rows: [
        ['1/2', '50%', '50%'],
        ['1/3', '33 1/3%', '33.33%'],
        ['1/4', '25%', '25%'],
        ['1/5', '20%', '20%'],
        ['1/6', '16 2/3%', '16.67%'],
        ['1/7', '14 2/7%', '14.28%'],
        ['1/8', '12 1/2%', '12.5%'],
        ['1/9', '11 1/9%', '11.11%'],
        ['1/11', '9 1/11%', '9.09%']
      ]
    }],
    revisionNotes: '* Percent = per 100. To fraction: divide by 100. To percent: multiply by 100.\n* Net change of A% and B% = A + B + (A * B)/100 %.\n* If price increases R%, consumption decrease for same expense = R/(100+R) * 100%.\n* If A is X% more than B, B is X/(100+X) * 100% less than A.',
    pyqs: [{
      question: {
        en: 'If the price of petrol increases by 20%, by what percent must a motorist reduce his consumption of petrol so that his expenditure does not increase?',
        hi: 'यदि पेट्रोल की कीमत में 20% की वृद्धि होती है, तो एक मोटर चालक को अपने पेट्रोल की खपत में कितने प्रतिशत की कमी करनी चाहिए ताकि उसका खर्च न बढ़े?'
      },
      options: [
        { en: '16.67%', hi: '16.67%' },
        { en: '20%', hi: '20%' },
        { en: '25%', hi: '25%' },
        { en: '15%', hi: '15%' }
      ],
      answer: 0,
      explanation: {
        en: 'Using the product consistency formula: Reduction in consumption = R / (100 + R) * 100% = 20 / 120 * 100% = 16.67%.',
        hi: 'उत्पाद स्थिरता सूत्र का उपयोग करते हुए: खपत में कमी = R/(100+R) * 100% = 20 / 120 * 100% = 16.67%।'
      },
      year: 2020
    }]
  },
  {
    exam: 'Railway',
    subject: 'Mathematics',
    topic: 'Arithmetic & Algebra',
    subtopic: 'Simple and Compound Interest',
    introduction: 'Interest calculation is a vital mercantile arithmetic topic. Simple Interest (SI) is calculated only on the principal amount, while Compound Interest (CI) is interest calculated on the principal plus accumulated interest. Railway exams consistently feature conceptual and calculation-heavy problems from this area.',
    detailedExplanation: `## Simple Interest (SI) and Compound Interest (CI) — Complete Theory

### 1. Simple Interest (SI)
- **Principal (P)**: The sum of money borrowed/lent.
- **Rate of Interest (R)**: Rate at which interest is calculated per annum.
- **Time (T)**: Duration for which money is borrowed/lent.
- **Simple Interest Formula**:
  SI = (P * R * T) / 100
- **Total Amount (A)**:
  A = P + SI = P * (1 + (R * T)/100)

### 2. Compound Interest (CI)
- **Compound Interest**: Calculated on the principal plus interest accrued over previous periods.
- **Compound Amount Formula (Annual Compounding)**:
  A = P * (1 + R/100)^n
  CI = A - P = P * ((1 + R/100)^n - 1)
  where n is the number of compounding years.
- **Compounding Frequency**:
  - **Half-Yearly**: Rate becomes R/2 %, Time becomes 2n.
    A = P * (1 + R/200)^(2n)
  - **Quarterly**: Rate becomes R/4 %, Time becomes 4n.
    A = P * (1 + R/400)^(4n)

### 3. Key Differences and Shortcuts
- **Difference between CI and SI for 2 years**:
  Difference (D2) = P * (R/100)^2
- **Difference between CI and SI for 3 years**:
  Difference (D3) = P * (R/100)^2 * ((300 + R)/100)`,
    concepts: ['Simple Interest Formula', 'Compound Interest Compounding Frequencies', 'Difference Formulas (D2 and D3)', 'Effective Rate of Interest'],
    importantFacts: [
      'For the first year (compounded annually), Simple Interest and Compound Interest are equal.',
      'Compound Interest grows exponentially, while Simple Interest grows linearly.',
      'Compounding half-yearly yields higher interest than annual compounding for the same nominal rate.'
    ],
    examples: [
      'Find the difference between SI and CI on Rs.10,000 for 2 years at 10% per annum: D2 = P * (R/100)^2 = 10000 * (10/100)^2 = Rs.100.',
      'A sum of money doubles itself in 5 years at simple interest. Find interest rate: A = 2P -> SI = P. P = (P * R * 5)/100 -> R = 100/5 = 20%.'
    ],
    tables: [{
      title: 'Simple Interest vs Compound Interest',
      headers: ['Parameter', 'Simple Interest (SI)', 'Compound Interest (CI)'],
      rows: [
        ['Interest Basis', 'Calculated on initial principal only', 'Calculated on principal + accumulated interest'],
        ['Principal Amount', 'Remains constant throughout the term', 'Changes every compounding period'],
        ['Growth Rate', 'Constant (Linear growth)', 'Increasing (Exponential growth)'],
        ['First Year Interest', 'Equal to CI (for annual compounding)', 'Equal to SI (for annual compounding)'],
        ['Formula for Amount', 'A = P(1 + RT/100)', 'A = P(1 + R/100)^n']
      ]
    }],
    revisionNotes: '* SI = PRT/100. Amount = P + SI.\n* CI Amount = P(1 + R/100)^n. CI = A - P.\n* Half-yearly: Rate = R/2, periods = 2n. Quarterly: Rate = R/4, periods = 4n.\n* Difference for 2 years: D2 = P(R/100)^2.\n* Difference for 3 years: D3 = P(R/100)^2 * ((300+R)/100).',
    pyqs: [{
      question: {
        en: 'A sum of money invested at compound interest doubles itself in 6 years. In how many years will it become 8 times itself at the same rate of interest?',
        hi: 'चक्रवृद्धि ब्याज पर निवेश की गई कोई राशि 6 वर्ष में दोगुनी हो जाती है। समान ब्याज दर पर यह कितने वर्षों में स्वयं की 8 गुना हो जाएगी?'
      },
      options: [
        { en: '12 years', hi: '12 वर्ष' },
        { en: '18 years', hi: '18 वर्ष' },
        { en: '24 years', hi: '24 वर्ष' },
        { en: '30 years', hi: '30 वर्ष' }
      ],
      answer: 1,
      explanation: {
        en: 'If a sum becomes 2 times in 6 years, then: 2^1 times in 6 years. 2^3 (8) times will take 3 * 6 = 18 years. (Since CI grows geometrically: P -> 2P -> 4P -> 8P, total time = 6 + 6 + 6 = 18 years).',
        hi: 'यदि कोई राशि 6 वर्षों में 2 गुनी हो जाती है, तो: 6 वर्षों में 2^1 गुना। 2^3 (8) गुना होने में 3 * 6 = 18 वर्ष लगेंगे। (चूंकि चक्रवृद्धि ब्याज ज्यामितीय रूप से बढ़ता है: P -> 2P -> 4P -> 8P, कुल समय = 6 + 6 + 6 = 18 वर्ष)।'
      },
      year: 2021
    }]
  },

  // ═══════════════════════════════════════════════════════════════════
  // SSC CGL (2 SUBTOPICS)
  // ═══════════════════════════════════════════════════════════════════
  {
    exam: 'SSC CGL',
    subject: 'Quantitative Aptitude',
    topic: 'Arithmetic',
    subtopic: 'Percentage',
    introduction: 'Percentage is a critical arithmetic topic in SSC CGL. Mastery of fractions, successive percentages, product-consumption equations, and election-based problems is key to scoring in Tier 1 and Tier 2.',
    detailedExplanation: `## Percentage — Advanced Theory and Concepts for SSC CGL

### 1. The Fraction-Percentage Concept
Using fractional ratios instead of decimals speeds up calculation:
- Value = Base * Percentage.
- To increase a number by x%, multiply it by (1 + x/100) or the corresponding fraction factor.
- To decrease a number by x%, multiply it by (1 - x/100).

### 2. Key Problem Models
- **Income-Expenditure-Savings Model**:
  Income = Expenditure + Savings
  - If income increases by x% and expenditure by y%, we calculate the savings increase using linear equations or allegation methods.
- **Election Models**:
  - Total Votes = Valid Votes + Invalid Votes.
  - Winner's Votes + Loser's Votes = Valid Votes.
- **Population Models**:
  - If population increases by R% annually, population after n years = P(1 + R/100)^n; population n years ago = P / (1 + R/100)^n.
- **Successive Change**: Net change = a + b + (a * b)/100. For three successive changes (a, b, c), use equivalent fraction multiplication.`,
    concepts: ['Fraction Multipliers', 'Income-Expenditure-Savings Equations', 'Election Vote Balance Model', 'Successive Increase/Decrease'],
    importantFacts: [
      'If price of an item increases by R%, consumption must decrease by R/(100+R) * 100% to keep expenditure constant.',
      'A successive discount of 20% and 10% is equal to a single discount of 28%.',
      'If A\'s income is x% more than B\'s, then B\'s income is x/(100+x) * 100% less than A\'s.'
    ],
    examples: [
      'In an election, 10% of voters did not cast votes, and 10% of votes cast were invalid. The winning candidate got 54% of valid votes and won by 1620 votes. Total voters: Valid votes = V. Winner - Loser = 54% - 46% = 8% of V = 1620 -> V = 20250. Votes cast = 20250 / 0.9 = 22500. Total registered voters = 25000.',
      'The price of petrol goes up by 15%. A driver wants to increase expenditure by only 9%. Find percentage reduction in petrol consumption: Expenditure index = 1.15 * Consumption = 1.09 -> Consumption = 1.09 / 1.15, which is a 5.22% reduction.'
    ],
    tables: [{
      title: 'Fraction and Percentage Conversions',
      headers: ['Fraction', 'Percentage', 'Decimal Equivalent'],
      rows: [
        ['1/3', '33 1/3%', '33.33%'],
        ['1/6', '16 2/3%', '16.67%'],
        ['1/8', '12 1/2%', '12.5%'],
        ['1/11', '9 1/11%', '9.09%'],
        ['1/12', '8 1/3%', '8.33%'],
        ['1/15', '6 2/3%', '6.67%'],
        ['1/20', '5%', '5.0%']
      ]
    }],
    revisionNotes: '* Net change of A% and B% = a + b + ab/100 %.\n* Price * Consumption = Expenditure. If expenditure is constant, price is inversely proportional to consumption.\n* Income = Expenditure + Savings.\n* In elections, validate invalid and non-cast votes carefully before applying candidate shares.',
    pyqs: [{
      question: {
        en: 'A\'s salary is 35% more than B\'s salary. By what percentage is B\'s salary less than A\'s salary? (Correct to one decimal place)',
        hi: 'A का वेतन B के वेतन से 35% अधिक है। B का वेतन A के वेतन से कितने प्रतिशत कम है? (एक दशमलव स्थान तक सही)'
      },
      options: [
        { en: '25.9%', hi: '25.9%' },
        { en: '35.0%', hi: '35.0%' },
        { en: '20.0%', hi: '20.0%' },
        { en: '27.3%', hi: '27.3%' }
      ],
      answer: 0,
      explanation: {
        en: 'Using the percentage comparison formula: Less percentage = R / (100 + R) * 100% = 35 / 135 * 100% = 25.92%.',
        hi: 'प्रतिशत तुलना सूत्र का उपयोग करते हुए: प्रतिशत कमी = R/(100+R) * 100% = 35 / 135 * 100% = 25.92%।'
      },
      year: 2022
    }]
  },
  {
    exam: 'SSC CGL',
    subject: 'English Language',
    topic: 'Vocabulary & Comprehension',
    subtopic: 'Cloze Test',
    introduction: 'A Cloze Test is a passage where certain words are omitted, and the student is asked to fill in the blanks using the options provided. It tests a candidate\'s vocabulary, understanding of grammar, sentence structure, and comprehension of the overall context.',
    detailedExplanation: `## Cloze Test — Strategies, Grammar and Contextual Clues

### 1. What is a Cloze Test?
A Cloze Test combines reading comprehension with grammatical and vocabulary skills. A passage is provided with 5 to 10 numbered blanks, and candidates must select the most appropriate word for each blank from four options.

### 2. Golden Rules to Solve Cloze Tests
- **Read the Entire Passage First**: Do not start filling blanks immediately. Read the passage once to understand the theme, tone (positive/negative/neutral), and tense (past/present/future).
- **Analyze the Blanks**: Identify what part of speech is missing (noun, pronoun, verb, adjective, adverb, preposition, or conjunction).
- **Look for Collocations**: Many words go together as standard collocations (e.g., "commit a crime," "pay attention," "cope with," "interested in").
- **Check Conjunctions/Transition Words**: Transition words give clues about sentence direction:
  - Contrast: *however, although, but, despite, yet*.
  - Addition: *furthermore, in addition, moreover, also*.
  - Cause & Effect: *therefore, as a result, because, thus, hence*.
- **Use Elimination Technique**: Eliminate options that do not fit grammatically (e.g., singular vs plural verbs, incorrect tense) or contextually (e.g., positive tone word needed but option is negative).
- **Re-read After Completion**: Re-read the completed passage to ensure it flows logically and grammatically.`,
    concepts: ['Theme and Tone Identification', 'Grammar Fit (Parts of Speech)', 'Collocations & Prepositions', 'Elimination Strategy'],
    importantFacts: [
      'Cloze tests constitute a significant portion (5 to 10 marks) of the English section in SSC CGL Tier 1 and Tier 2.',
      'Prepositional phrases (e.g., "abstain from," "good at") are highly tested in cloze tests.',
      'Maintaining the consistency of tenses throughout the passage is essential.'
    ],
    examples: [
      'Example: "She was so engrossed ______ her book that she did not hear the door bell." Options: (a) at, (b) in, (c) with, (d) on. Correct option is (b) because the verb "engrossed" collocates with the preposition "in".',
      'Tone shift: "The economic reforms were successful in urban regions; _______, they failed to yield results in rural areas." The blank needs a contrasting transition word like "however" or "nevertheless".'
    ],
    tables: [{
      title: 'Common Verb + Preposition Collocations in Cloze Tests',
      headers: ['Verb', 'Preposition', 'Meaning / Use Case'],
      rows: [
        ['Abide', 'by', 'Follow rules (e.g., abide by the law)'],
        ['Accuse', 'of', 'Charge with wrongdoing (e.g., accused of theft)'],
        ['Cope', 'with', 'Manage a difficult situation (not "cope up with")'],
        ['Refrain', 'from', 'Avoid doing something (e.g., refrain from smoking)'],
        ['Devoid', 'of', 'Lacking something (e.g., devoid of hope)'],
        ['Adapt', 'to', 'Adjust to new conditions (e.g., adapt to changes)']
      ]
    }],
    revisionNotes: '* Read the passage full first to grasp theme and tone.\n* Find the part of speech required for the blank.\n* Look for collocations and preposition rules (e.g., "prevent from").\n* Check transition markers (*but, therefore, however*) to determine context flow.\n* Eliminate grammatically invalid options.',
    pyqs: [{
      question: {
        en: 'Read the sentence and choose the correct word to fill in the blank:\n"The committee decided to ________ the meeting until next Monday due to lack of quorum."',
        hi: 'वाक्य को पढ़ें और रिक्त स्थान को भरने के लिए सही शब्द चुनें:\n"कोरम की कमी के कारण समिति ने बैठक को अगले सोमवार तक ________ करने का निर्णय लिया।"'
      },
      options: [
        { en: 'defer', hi: 'स्थगित करना (defer)' },
        { en: 'reject', hi: 'अस्वीकार करना (reject)' },
        { en: 'destroy', hi: 'नष्ट करना (destroy)' },
        { en: 'call', hi: 'बुलाना (call)' }
      ],
      answer: 0,
      explanation: {
        en: 'The word "defer" means to delay or postpone an action or event to a later time, which fits the context of rescheduling a meeting due to a lack of quorum. "Postpone" or "adjourn" are synonyms.',
        hi: 'शब्द "defer" का अर्थ किसी क्रिया या घटना को बाद के समय के लिए टालना या स्थगित करना है, जो कोरम की कमी के कारण बैठक को पुनर्निर्धारित करने के संदर्भ में फिट बैठता है।'
      },
      year: 2021
    }]
  },

  // ═══════════════════════════════════════════════════════════════════
  // SSC CHSL (14 SUBTOPICS)
  // ═══════════════════════════════════════════════════════════════════
  {
    exam: 'SSC CHSL',
    subject: 'Math',
    topic: 'Arithmetic Ability',
    subtopic: 'LCM and HCF',
    introduction: 'LCM (Least Common Multiple) and HCF (Highest Common Factor) are vital arithmetic concepts. LCM is the smallest common multiple of given numbers, while HCF is the largest common divisor. CHSL questions include basic calculations, fractional cases, and application word problems.',
    detailedExplanation: `## LCM and HCF — Core Arithmetic Concepts

### 1. Definitions and Methods
- **HCF (Highest Common Factor / GCD)**: The greatest number that divides each of the given numbers without leaving a remainder.
  - **Methods**: Prime Factorization (finding lowest power of common factors) or Division Method.
- **LCM (Least Common Multiple)**: The smallest positive integer that is divisible by all the given numbers.
  - **Methods**: Prime Factorization (highest power of all factors) or Common Division Method.

### 2. Important Formulas and Rules
- **Product Rule for Two Numbers**:
  HCF(A, B) * LCM(A, B) = A * B
  *(Note: This rule applies ONLY to two numbers, not three or more).*
- **LCM and HCF of Fractions**:
  - HCF of Fractions = HCF of Numerators / LCM of Denominators
  - LCM of Fractions = LCM of Numerators / HCF of Denominators
- **LCM and HCF of Decimals**: Convert decimals to like fractions and apply fractional rules.

### 3. Application Problems
- **Interval Problems**: Bell ringing or traffic light switching at different time intervals. The common time they ring/change together is the **LCM** of the intervals.
- **Tiling/Measurement Problems**: Finding the largest square tile size to fit a rectangular room. The size is the **HCF** of the room's length and width.
- **Remainder Scenarios**:
  - Find the largest number that divides X, Y, Z leaving remainder R in each case: Required number = HCF of (X-R, Y-R, Z-R).
  - Find the smallest number which when divided by X, Y, Z leaves remainder R in each case: Required number = LCM of (X, Y, Z) + R.`,
    concepts: ['Prime Factorization Method', 'Product Formula', 'Fractional HCF & LCM', 'Bell Ringing Applications', 'Remainder Problems'],
    importantFacts: [
      'The HCF of two co-prime numbers is always 1.',
      'The LCM of two co-prime numbers is their product.',
      'HCF of a set of numbers always divides their LCM.',
      'For three numbers A, B, C, LCM * HCF is not equal to A * B * C in general.'
    ],
    examples: [
      'Find LCM and HCF of 12 and 18: 12 = 2^2 * 3, 18 = 2 * 3^2. HCF = 2 * 3 = 6. LCM = 2^2 * 3^2 = 36. Check: 6 * 36 = 216; 12 * 18 = 216.',
      'Three bells toll together at intervals of 9, 12, and 15 minutes respectively. After what time will they toll together next? Take LCM of (9, 12, 15): LCM = 2^2 * 3^2 * 5 = 180 minutes (or 3 hours).'
    ],
    tables: [{
      title: 'HCF and LCM Formula Reference',
      headers: ['Type', 'HCF Formula', 'LCM Formula'],
      rows: [
        ['Integers', 'Product of lowest powers of common prime factors', 'Product of highest powers of all prime factors'],
        ['Fractions', 'HCF(Numerators) / LCM(Denominators)', 'LCM(Numerators) / HCF(Denominators)'],
        ['Co-prime Numbers', 'Always 1', 'Product of the two numbers'],
        ['General Property', 'Divides each number in the set', 'Is divisible by each number in the set']
      ]
    }],
    revisionNotes: '* HCF = largest common divisor; LCM = smallest common multiple.\n* HCF * LCM = Product of two numbers (Only for 2 numbers).\n* Fraction HCF = HCF(Num)/LCM(Den); Fraction LCM = LCM(Num)/HCF(Den).\n* Bell-tolling/lights-flashing = take LCM.\n* HCF of co-primes = 1; LCM of co-primes = their product.',
    pyqs: [{
      question: {
        en: 'The HCF of two numbers is 12 and their LCM is 72. If one of the numbers is 24, find the other number.',
        hi: 'दो संख्याओं का महत्तम समापवर्तक (HCF) 12 है और उनका लघुत्तम समापवर्त्य (LCM) 72 है। यदि इनमें से एक संख्या 24 है, तो दूसरी संख्या ज्ञात कीजिए।'
      },
      options: [
        { en: '36', hi: '36' },
        { en: '48', hi: '48' },
        { en: '18', hi: '18' },
        { en: '60', hi: '60' }
      ],
      answer: 0,
      explanation: {
        en: 'Using the formula: HCF * LCM = First Number * Second Number.\n12 * 72 = 24 * X -> X = (12 * 72)/24 = 36.',
        hi: 'सूत्र का उपयोग करते हुए: $\text{HCF} \times \text{LCM} = \text{पहली संख्या} \times \text{दूसरी संख्या}$।\n$12 \times 72 = 24 \times X \Rightarrow X = \frac{12 \times 72}{24} = 36$।'
      },
      year: 2022
    }]
  },
  {
    exam: 'SSC CHSL',
    subject: 'Math',
    topic: 'Arithmetic Ability',
    subtopic: 'Percentage',
    introduction: 'Percentage calculations express a fraction of 100 and serve as the basis for Profit/Loss, Interest, and Ratios. CHSL tests direct conversions, percentage comparisons, and consecutive adjustments.',
    detailedExplanation: `## Percentage Basics and Calculations

### 1. Basic Concepts
- A percentage represents a fraction with a denominator of 100.
- Multiply by 100 to convert a ratio to a percentage.
- Divide by 100 to convert a percentage back to a decimal or fraction.

### 2. Formulas
- Percent Change = (Change / Original Value) * 100%
- Net Successive Change = A + B + AB/100
- If A is x% more than B, then B is x/(100+x) * 100% less than A.
- If A is x% less than B, then B is x/(100-x) * 100% more than A.`,
    concepts: ['Fraction Conversion', 'Percent Increase & Decrease', 'Successive Change Formula'],
    importantFacts: [
      'Percentage points measure absolute difference, while percentage measures relative change.',
      'Successive increases of x% and y% result in a net increase of x+y+xy/100 %.'
    ],
    examples: [
      'If A\'s height is 20% less than B\'s, then B\'s height is 20/(100-20) * 100% = 25% more than A\'s.'
    ],
    tables: [{
      title: 'Common Percent-Fraction Equivalents',
      headers: ['Fraction', 'Percentage'],
      rows: [
        ['1/2', '50%'],
        ['1/4', '25%'],
        ['1/5', '20%'],
        ['1/10', '10%']
      ]
    }],
    revisionNotes: '* Basic conversions and successive formulas are vital.\n* Successive net change = A+B+AB/100 %.',
    pyqs: [{
      question: {
        en: 'If A\'s income is 25% more than B\'s, by what percentage is B\'s income less than A\'s?',
        hi: 'यदि A की आय B से 25% अधिक है, तो B की आय A से कितने प्रतिशत कम है?'
      },
      options: [
        { en: '20%', hi: '20%' },
        { en: '25%', hi: '25%' },
        { en: '15%', hi: '15%' },
        { en: '30%', hi: '30%' }
      ],
      answer: 0,
      explanation: {
        en: 'B\'s income is less by 25/(100+25) * 100% = 20%.',
        hi: 'B की आय A से कम है = 25/(100+25) * 100% = 20%।'
      },
      year: 2021
    }]
  },
  {
    exam: 'SSC CHSL',
    subject: 'Math',
    topic: 'Arithmetic Ability',
    subtopic: 'Simple and Compound Interest',
    introduction: 'Simple Interest (SI) is computed on the initial principal only. Compound Interest (CI) calculates interest on principal plus previous interest. SSC CHSL exams focus on formulas, multi-year differences, and half-yearly compounding.',
    detailedExplanation: `## Simple and Compound Interest Calculations

### 1. Simple Interest (SI)
- Formula: SI = (P * R * T) / 100
- Amount: A = P + SI

### 2. Compound Interest (CI)
- Amount: A = P(1 + R/100)^n
- Compound Interest: CI = A - P
- For half-yearly compounding: Rate = R/2, periods = 2n.

### 3. Difference Formula
- For 2 years: Difference (D2) = P(R/100)^2`,
    concepts: ['Simple Interest', 'Compound Interest Formulas', 'Compounding Frequencies'],
    importantFacts: [
      'Simple Interest increases by a fixed amount each year.',
      'Compound Interest increases at an increasing rate over time.'
    ],
    examples: [
      'SI on Rs. 5000 for 3 years at 10% p.a. is (5000 * 10 * 3) / 100 = Rs. 1500.'
    ],
    tables: [{
      title: 'SI vs CI Key Parameters',
      headers: ['Parameter', 'SI', 'CI'],
      rows: [
        ['Principal', 'Constant', 'Changes every period'],
        ['Interest Growth', 'Linear', 'Exponential']
      ]
    }],
    revisionNotes: '* SI = PRT/100.\n* CI Amount = P(1 + R/100)^n.\n* Difference for 2 years: D2 = P(R/100)^2.',
    pyqs: [{
      question: {
        en: 'Find the simple interest on Rs. 2000 at 5% per annum for 3 years.',
        hi: '₹2000 पर 5% प्रति वर्ष की दर से 3 वर्ष का साधारण ब्याज ज्ञात कीजिए।'
      },
      options: [
        { en: '₹300', hi: '₹300' },
        { en: '₹200', hi: '₹200' },
        { en: '₹400', hi: '₹400' },
        { en: '₹150', hi: '₹150' }
      ],
      answer: 0,
      explanation: {
        en: 'SI = (2000 * 5 * 3) / 100 = Rs. 300.',
        hi: 'साधारण ब्याज = (2000 * 5 * 3) / 100 = ₹300।'
      },
      year: 2022
    }]
  },
  {
    exam: 'SSC CHSL',
    subject: 'Math',
    topic: 'Arithmetic Ability',
    subtopic: 'Ratio and Proportion',
    introduction: 'Ratio is a comparison of two quantities of the same kind by division. Proportion is an equality of two ratios. Ratio and Proportion is a fundamental topic used extensively in Partnership, Mixture, and Age problems in CHSL.',
    detailedExplanation: `## Ratio and Proportion — Detailed Concept

### 1. Ratio
- Expressed as a:b or a/b. a is the antecedent, b is the consequent.
- Ratios remain unchanged if multiplied or divided by the same non-zero number.
- **Duplicate Ratio** of a:b is a^2:b^2. Sub-duplicate ratio is sqrt(a):sqrt(b).

### 2. Proportion
- Four numbers a, b, c, d are in proportion if a:b = c:d (written as a:b :: c:d).
- Product of extremes = Product of means (a * d = b * c).
- **Fourth Proportional** to a, b, c is x such that a/b = c/x -> x = bc/a.
- **Third Proportional** to a, b is x such that a/b = b/x -> x = b^2/a.
- **Mean Proportional** between a, b is sqrt(ab).

### 3. Rules of Proportion
- **Componendo**: If a/b = c/d, then (a+b)/b = (c+d)/d.
- **Dividendo**: If a/b = c/d, then (a-b)/b = (c-d)/d.
- **Componendo and Dividendo**: If a/b = c/d, then (a+b)/(a-b) = (c+d)/(c-d).`,
    concepts: ['Ratio Properties', 'Mean/Third/Fourth Proportional', 'Componendo & Dividendo Rule'],
    importantFacts: [
      'A ratio must compare quantities of identical units.',
      'If a/b = c/d, then ad = bc.',
      'The mean proportional between two numbers a and b is sqrt(ab).'
    ],
    examples: [
      'Find mean proportional between 9 and 16: Mean = sqrt(9 * 16) = sqrt(144) = 12.',
      'Find the third proportional to 4 and 6: x = 6^2 / 4 = 36 / 4 = 9.'
    ],
    tables: [{
      title: 'Proportional Terms Reference',
      headers: ['Term Type', 'Given Values', 'Formula'],
      rows: [
        ['Mean Proportional', 'a and b', 'x = sqrt(ab)'],
        ['Third Proportional', 'a and b', 'x = b^2 / a'],
        ['Fourth Proportional', 'a, b, and c', 'x = bc / a']
      ]
    }],
    revisionNotes: '* Ratio a:b = a/b.\n* Proportion a:b = c:d -> ad = bc.\n* Mean Proportional = sqrt(ab). Third Proportional = b^2/a. Fourth Proportional = bc/a.\n* Componendo & Dividendo: (a+b)/(a-b) = (c+d)/(c-d).',
    pyqs: [{
      question: {
        en: 'What is the mean proportional between 4 and 36?',
        hi: '4 और 36 के बीच मध्यानुपाती (mean proportional) क्या है?'
      },
      options: [
        { en: '12', hi: '12' },
        { en: '16', hi: '16' },
        { en: '20', hi: '20' },
        { en: '18', hi: '18' }
      ],
      answer: 0,
      explanation: {
        en: 'The mean proportional between two numbers a and b is given by sqrt(ab). So, mean proportional between 4 and 36 is sqrt(4 * 36) = sqrt(144) = 12.',
        hi: 'दो संख्याओं a और b के बीच मध्यानुपाती का सूत्र sqrt(ab) है। अतः 4 और 36 का मध्यानुपाती sqrt(4 * 36) = sqrt(144) = 12 है।'
      },
      year: 2021
    }]
  },
  {
    exam: 'SSC CHSL',
    subject: 'Math',
    topic: 'Arithmetic Ability',
    subtopic: 'Partnership',
    introduction: 'Partnership is a business association where two or more persons invest money to run a business. Profit is distributed based on the capital invested and the duration of investment. It is a highly scoring topic in CHSL.',
    detailedExplanation: `## Partnership — Capital, Time, and Profit Distribution

### 1. Types of Partnership
- **Simple Partnership**: Investments are made for the same time duration. Profit is shared directly in the ratio of capital investments.
- **Compound Partnership**: Investments are made for different time durations. Profit is shared in the ratio of the product of capital (C) and time (T).
  Ratio of Profit = (C1 * T1) : (C2 * T2) : (C3 * T3)

### 2. Types of Partners
- **Working Partner**: Who manages the business and may receive a salary or commission before the remaining profit is distributed.
- **Sleeping/Silent Partner**: Who only invests capital but does not manage business operations. They receive profits strictly according to the investment ratio.

### 3. Key Formulation
- Profit is directly proportional to Capital when Time is constant.
- Profit is directly proportional to Time when Capital is constant.
- Hence: Profit = Capital * Time.`,
    concepts: ['Simple vs Compound Partnership', 'Profit Ratio Calculation', 'Working Partner Salary Deductions'],
    importantFacts: [
      'If investment times are equal, the profit ratio matches the capital ratio.',
      'Active/working partners usually take a predefined percentage of profit first as management fee, then divide the rest.'
    ],
    examples: [
      'A and B invest Rs. 20,000 and Rs. 30,000 for 1 year. Profit ratio = 20000 : 30000 = 2:3.',
      'A invests Rs. 10,000 for 8 months and B invests Rs. 12,000 for 10 months. Profit ratio = (10000 * 8) : (12000 * 10) = 2:3.'
    ],
    tables: [{
      title: 'Partnership Profit Sharing Scenarios',
      headers: ['Scenario', 'Condition', 'Profit Ratio Formula'],
      rows: [
        ['Simple Partnership', 'Time is equal (T1 = T2)', 'P1 : P2 = C1 : C2'],
        ['Compound Partnership', 'Time is unequal (T1 != T2)', 'P1 : P2 = C1 T1 : C2 T2'],
        ['Capital Calculation', 'Profit and Time ratios known', 'C1 : C2 = (P1 / T1) : (P2 / T2)']
      ]
    }],
    revisionNotes: '* Profit = Capital * Time.\n* Simple Partnership: profit ratio = capital ratio.\n* Compound Partnership: profit ratio = (C1 * T1) : (C2 * T2).\n* Working partner\'s share/salary must be subtracted from total profit before dividing the remainder.',
    pyqs: [{
      question: {
        en: 'A and B started a business by investing Rs. 20,000 and Rs. 25,000 respectively. After 8 months, B left. If the total annual profit is Rs. 10,000, find B\'s share of profit.',
        hi: 'A और B ने क्रमशः ₹20,000 और ₹25,000 का निवेश करके एक व्यवसाय शुरू किया। 8 महीने बाद, B ने व्यवसाय छोड़ दिया। यदि कुल वार्षिक लाभ ₹10,000 है, तो लाभ में B का हिस्सा ज्ञात कीजिए।'
      },
      options: [
        { en: 'Rs. 4,545', hi: '₹4,545' },
        { en: 'Rs. 5,000', hi: '₹5,000' },
        { en: 'Rs. 4,000', hi: '₹4,000' },
        { en: 'Rs. 6,000', hi: '₹6,000' }
      ],
      answer: 0,
      explanation: {
        en: 'A\'s investment time = 12 months, B\'s = 8 months.\nRatio of Profit = (20000 * 12) : (25000 * 8) = 240,000 : 200,000 = 6:5.\nB\'s share of profit = 5/11 * 10,000 = Rs. 4,545.',
        hi: 'A के निवेश का समय = 12 महीने, B का = 8 महीने।\nलाभ का अनुपात = (20000 * 12) : (25000 * 8) = 240,000 : 200,000 = 6:5।\nB का हिस्सा = 5/11 * 10,000 = ₹4,545।'
      },
      year: 2022
    }]
  },
  {
    exam: 'SSC CHSL',
    subject: 'Math',
    topic: 'Arithmetic Ability',
    subtopic: 'Mixture and Alligation',
    introduction: 'Mixture deals with mixing two or more ingredients. Alligation is a mathematical shortcut rule that enables finding the ratio in which ingredients at different prices are mixed to produce a mixture at a given mean price.',
    detailedExplanation: `## Mixture & Alligation — Concepts & Formulas

### 1. Simple Mixtures
- **Concentration**: Ratio of the active component (e.g., milk) to the total volume (milk + water).
- **Replacement Formula**: If a container initially contains x units of liquid, and y units are taken out and replaced by water, after n operations:
  Quantity of pure liquid remaining = x * (1 - y/x)^n

### 2. Rule of Alligation
- It states that if two ingredients are mixed, then:
  Ratio of Cheaper : Dearer = (Dearer Price - Mean Price) : (Mean Price - Cheaper Price)
  Ratio of Cheaper : Dearer = (d - m) : (m - c)
- **Crucial Rule**: The mean price m must always lie between the cheaper price c and the dearer price d (c < m < d). All values must be in identical units.`,
    concepts: ['Mixture Composition Ratios', 'Rule of Alligation Framework', 'Repeated Replacement Formula'],
    importantFacts: [
      'Alligation can be applied to averages, profit/loss percentages, rates, and concentrations.',
      'Mean price is always the weighted average of the constituent prices.'
    ],
    examples: [
      'In what ratio must rice at Rs. 20/kg be mixed with rice at Rs. 28/kg to get a mixture worth Rs. 25/kg? Cheaper = 20, Dearer = 28, Mean = 25. Ratio = (28 - 25) : (25 - 20) = 3:5.',
      'From a cask of 80 liters of milk, 8 liters are removed and replaced with water. This process is repeated once more. Remaining pure milk = 80 * (1 - 8/80)^2 = 64.8 liters.'
    ],
    tables: [{
      title: 'Alligation Variable Mapping',
      headers: ['Term', 'Symbol', 'Description'],
      rows: [
        ['Cheaper Value', 'c', 'Cost price/rate of the lower valued component'],
        ['Dearer Value', 'd', 'Cost price/rate of the higher valued component'],
        ['Mean Value', 'm', 'Cost price/rate of the final mixture'],
        ['Cheaper Quantity', 'Q_c', 'Amount of cheaper item needed'],
        ['Dearer Quantity', 'Q_d', 'Amount of dearer item needed']
      ]
    }],
    revisionNotes: '* Alligation ratio: Cheaper/Dearer = (d - m)/(m - c).\n* Mean price must be between cheaper and dearer prices.\n* Replacement formula: Final Amount = Initial * (1 - replaced/total)^n.',
    pyqs: [{
      question: {
        en: 'In what ratio must tea worth Rs. 60 per kg be mixed with tea worth Rs. 65 per kg so that the mixture is worth Rs. 62 per kg?',
        hi: '₹60 प्रति किलोग्राम मूल्य वाली चाय को ₹65 प्रति किलोग्राम मूल्य वाली चाय के साथ किस अनुपात में मिलाया जाना चाहिए ताकि मिश्रण का मूल्य ₹62 प्रति किलोग्राम हो जाए?'
      },
      options: [
        { en: '3:2', hi: '3:2' },
        { en: '2:3', hi: '2:3' },
        { en: '4:1', hi: '4:1' },
        { en: '1:4', hi: '1:4' }
      ],
      answer: 0,
      explanation: {
        en: 'Using the rule of alligation: Cheaper (c) = 60, Dearer (d) = 65, Mean (m) = 62. Ratio = (65 - 62) : (62 - 60) = 3:2.',
        hi: 'मिश्रण नियम (alligation) का उपयोग करते हुए: सस्ती (c) = 60, महंगी (d) = 65, औसत (m) = 62। अनुपात = (65 - 62) : (62 - 60) = 3:2।'
      },
      year: 2020
    }]
  },
  {
    exam: 'SSC CHSL',
    subject: 'Math',
    topic: 'Arithmetic Ability',
    subtopic: 'Time and Work',
    introduction: 'Time and Work deals with the time taken to complete a task individually or collectively, and the efficiency of labor. Concepts of work equivalence, LCM methods, and wage distribution are frequently tested in CHSL.',
    detailedExplanation: `## Time and Work — Efficiency & Joint Efforts

### 1. Basic Principles
- **Inverse Relation**: Time taken (T) to complete a work is inversely proportional to the work efficiency (E) of a person.
  Work = Efficiency * Time
- If a person can do a piece of work in n days, then the person's 1 day's work = 1/n.

### 2. Standard Solving Methods
- **LCM Method**: Let A do work in x days, B in y days.
  - Assume Total Work = LCM of (x, y).
  - Efficiency of A = Total Work / x; Efficiency of B = Total Work / y.
  - Combined Time = Total Work / Combined Efficiency.
- **Formula Method**: Combined time of A and B working together = (x * y) / (x + y) days.

### 3. Advanced Concepts
- **Man-Days Equation (MDH Formula)**: If M1 men can do W1 work in D1 days working H1 hours, and M2 men can do W2 work in D2 days working H2 hours:
  (M1 * D1 * H1) / W1 = (M2 * D2 * H2) / W2
- **Wages Distribution**: Wages are distributed strictly in the ratio of the **work done** by individuals, which corresponds to the ratio of their efficiencies if they work for the same duration.`,
    concepts: ['Efficiency-Time Inversion', 'LCM Method for Time & Work', 'MDH Chain Rule Formula', 'Wage Distribution Rules'],
    importantFacts: [
      'If A is twice as efficient as B, then A takes half the time B takes to complete the same task.',
      'If A can do a task in X days and B in Y days, they complete it together in XY/(X+Y) days.'
    ],
    examples: [
      'A can do a work in 10 days and B in 15 days. Take LCM of 10 and 15 = 30 (Total Work). Efficiency of A = 3, B = 2. Combined time = 30 / 5 = 6 days.',
      '12 men can build a wall in 8 days. How many days will 16 men take? M1 * D1 = M2 * D2 -> 12 * 8 = 16 * D2 -> D2 = 6 days.'
    ],
    tables: [{
      title: 'Time and Work Method Comparison',
      headers: ['Method', 'Application Case', 'Benefit'],
      rows: [
        ['LCM Method', 'Multiple individuals with varying days', 'Avoids fractions, simplifies calculations'],
        ['MDH Chain Rule', 'Group of men working at specific hours/days', 'Direct substitution for complex group shifts'],
        ['Efficiency Ratio', 'Comparative speed given (e.g., A is 50% more efficient)', 'Converts efficiency directly into proportional work rates']
      ]
    }],
    revisionNotes: '* Efficiency = Work / Time. Efficiency is proportional to 1/Time.\n* LCM of days = Total Work. Calculate daily efficiency.\n* Combined Time = Total Work / Sum of Efficiencies.\n* MDH rule: M1*D1*H1/W1 = M2*D2*H2/W2.\n* Wages ratio = Ratio of work done.',
    pyqs: [{
      question: {
        en: 'A can complete a work in 12 days and B can do the same work in 18 days. If they work together, in how many days will they complete the work?',
        hi: 'A एक काम को 12 दिनों में पूरा कर सकता है और B उसी काम को 18 दिनों में पूरा कर सकता है। यदि वे एक साथ काम करते हैं, तो वे कितने दिनों में काम पूरा करेंगे?'
      },
      options: [
        { en: '7.2 days', hi: '7.2 दिन' },
        { en: '6 days', hi: '6 दिन' },
        { en: '8.4 days', hi: '8.4 दिन' },
        { en: '7.5 days', hi: '7.5 दिन' }
      ],
      answer: 0,
      explanation: {
        en: 'Using the combined work formula: Time = (X * Y) / (X + Y) = (12 * 18) / 30 = 7.2 days.',
        hi: 'संयुक्त कार्य सूत्र का उपयोग करते हुए: समय = (X * Y) / (X + Y) = (12 * 18) / 30 = 7.2 दिन।'
      },
      year: 2022
    }]
  },
  {
    exam: 'SSC CHSL',
    subject: 'Math',
    topic: 'Arithmetic Ability',
    subtopic: 'Time, Speed and Distance',
    introduction: 'Time, Speed and Distance (TSD) covers equations of motion, speed conversions, average speed, relative speed, train crossings, and river currents. It is a major quantitative section in CHSL.',
    detailedExplanation: `## Time, Speed and Distance — Core Kinematic Principles

### 1. Basic Formula and Conversions
- **Basic Equation**:
  Distance (D) = Speed (S) * Time (T)
- **Conversions**:
  - To convert km/h to m/s: Multiply by 5/18 (e.g., 36 km/h = 36 * 5/18 = 10 m/s).
  - To convert m/s to km/h: Multiply by 18/5 (e.g., 20 m/s = 20 * 18/5 = 72 km/h).

### 2. Average and Relative Speed
- **Average Speed**: Total distance divided by total time.
  - If a journey covers two equal distances at speeds x and y:
    Average Speed = 2xy / (x+y)
  - If three equal distances are covered at speeds x, y, z:
    Average Speed = 3xyz / (xy+yz+zx)
- **Relative Speed**:
  - Objects moving in **opposite directions**: Add speeds (S1 + S2).
  - Objects moving in **same direction**: Subtract speeds (S1 - S2, where S1 > S2).

### 3. Special Application Cases
- **Problems on Trains**:
  - Time taken to pass a stationary pole = Length of Train / Speed of Train.
  - Time taken to cross a platform of length L = (Length of Train + L) / Speed of Train.
- **Boats and Streams**:
  - Speed of boat in still water = u, Speed of stream = v.
  - **Downstream Speed (d)**: u + v.
  - **Upstream Speed (us)**: u - v.
  - u = (d + us) / 2, v = (d - us) / 2.`,
    concepts: ['Speed Conversion Factor', 'Average Speed for Equal Intervals', 'Relative Speed Directions', 'Train Crossing Scenarios', 'Upstream/Downstream Speeds'],
    importantFacts: [
      'Average speed is not the arithmetic mean of individual speeds.',
      'Relative speed is used when two objects move simultaneously.',
      'Downstream means moving with the stream flow; upstream means moving against it.'
    ],
    examples: [
      'A man travels at 60 km/h and returns at 40 km/h. Average speed = 2 * 60 * 40 / 100 = 48 km/h.',
      'A train 150m long crosses a platform 250m long at 72 km/h (20 m/s). Time taken = (150+250)/20 = 20 seconds.'
    ],
    tables: [{
      title: 'Boats and Streams Speed Formulas',
      headers: ['Condition', 'Speed Formula', 'Description'],
      rows: [
        ['Downstream Speed', 'd = u + v', 'Boat and stream move in same direction'],
        ['Upstream Speed', 'us = u - v', 'Boat moves against stream direction'],
        ['Boat Speed (Still Water)', 'u = (d + us) / 2', 'Derived from downstream and upstream speeds'],
        ['Stream Speed', 'v = (d - us) / 2', 'Rate of river flow']
      ]
    }],
    revisionNotes: '* D = S * T.\n* km/h -> m/s (mul 5/18); m/s -> km/h (mul 18/5).\n* Equal distances average speed = 2xy/(x+y).\n* Same direction: relative speed = S1 - S2; Opposite: S1 + S2.\n* Train crossing platform: distance = L_train + L_platform.\n* Boats: Downstream = u+v; Upstream = u-v.',
    pyqs: [{
      question: {
        en: 'A train 120 meters long passes a telegraph post in 6 seconds. Find the speed of the train in km/h.',
        hi: '120 मीटर लंबी एक ट्रेन एक टेलीग्राफ पोस्ट को 6 सेकंड में पार करती है। किमी/घंटा में ट्रेन की गति ज्ञात कीजिए।'
      },
      options: [
        { en: '72 km/h', hi: '72 किमी/घंटा' },
        { en: '60 km/h', hi: '60 किमी/घंटा' },
        { en: '80 km/h', hi: '80 किमी/घंटा' },
        { en: '54 km/h', hi: '54 किमी/घंटा' }
      ],
      answer: 0,
      explanation: {
        en: '1) Speed in m/s = Distance/Time = 120/6 = 20 m/s.\n2) Convert to km/h = 20 * 18/5 = 72 km/h.',
        hi: '1) गति (m/s में) = दूरी/समय = 120/6 = 20 m/s.\n2) किमी/घंटा में बदलें = 20 * 18/5 = 72 किमी/घंटा।'
      },
      year: 2022
    }]
  },
  {
    exam: 'SSC CHSL',
    subject: 'English',
    topic: 'Grammar and Vocabulary',
    subtopic: 'Fill in the Blanks',
    introduction: 'Fill in the Blanks questions test grammar rules, vocabulary strength, usage of idioms, and context clues. Candidates select the most appropriate option to complete a sentence logically and grammatically.',
    detailedExplanation: `## Fill in the Blanks — Grammar Rules and Strategies

### 1. Types of Fill in the Blanks
- **Grammar-Based**: Tests tenses, subject-verb agreement, prepositions, voice, or conjunctions.
- **Vocabulary-Based**: Tests words, synonyms, antonyms, or confused terms (e.g., accept/except, effect/affect).
- **Collocation-Based**: Tests standard word combinations.

### 2. Crucial Grammatical Clues
- **Subject-Verb Agreement**: Match singular subjects with singular verbs, plural with plural.
- **Tense Consistency**: Check tenses of surrounding clauses.
- **Prepositional Rules**: Certain words require specific prepositions:
  - "Accustomed **to**," "Conformed **to**," "Prevented **from**," "Abstain **from**."
- **Article Fit**: Pay attention to "a", "an", or "the" preceding the blank.

### 3. Step-by-Step Solving Approach
1. Read the sentence fully to understand the context.
2. Identify the part of speech required for the blank.
3. Check options for grammatical correctness.
4. Eliminate options that do not match the tone (positive/negative) of the sentence.`,
    concepts: ['Subject-Verb Agreement Fit', 'Contextual Vocabulary Choices', 'Fixed Preposition Application'],
    importantFacts: [
      'In CHSL, Fill in the Blanks questions check both functional grammar and vocabulary context.',
      'Pay special attention to phrasal verbs, as their meaning differs from simple verbs (e.g., "call off" vs "call on").'
    ],
    examples: [
      'Grammar blank: "Neither the teacher nor the students ______ present." Options: (a) was, (b) were. Correct: (b) were. Rule: When subjects are connected by "neither... nor", the verb agrees with the closer subject ("students").',
      'Vocabulary blank: "The heavy rains ______ the crop yield." Options: (a) effected, (b) affected. Correct: (b) affected. "Affect" is a verb meaning to influence; "effect" is typically a noun meaning result.'
    ],
    tables: [{
      title: 'Grammar Clue Examples for Fillers',
      headers: ['Clue Type', 'Sentence Structure', 'Grammar Rule Applied'],
      rows: [
        ['Prepositional', 'She is good _____ mathematics.', 'Adjective "good" takes preposition "at"'],
        ['Subject-Verb', 'Each of the girls ______ completed the task.', '"Each" is singular; takes singular verb "has"'],
        ['Conditional', 'If it rains, we _____ cancel the match.', 'First conditional takes simple present + future ("will")'],
        ['Confused Words', 'They got married in a ______ ceremony.', '"Quiet" (silent) vs "Quite" (very); correct is "quiet"']
      ]
    }],
    revisionNotes: '* Read full sentence before selecting.\n* Match subject and verb (singular/plural).\n* Use nearest subject rule for *neither...nor* / *either...or*.\n* Check fixed prepositions (*fond of*, *good at*).\n* Distinguish *affect* (verb) and *effect* (noun).',
    pyqs: [{
      question: {
        en: 'Choose the correct word to fill in the blank:\n"The officer was so ________ in his work that he did not notice the stranger entering the cabin."',
        hi: 'रिक्त स्थान को भरने के लिए सही शब्द चुनें:\n"अधिकारी अपने काम में इतना ________ था कि उसने केबिन में प्रवेश करने वाले अजनबी पर ध्यान नहीं दिया।"'
      },
      options: [
        { en: 'absorbed', hi: 'लीन (absorbed)' },
        { en: 'absent', hi: 'अनुपस्थित (absent)' },
        { en: 'distracted', hi: 'विचलित (distracted)' },
        { en: 'tired', hi: 'थका हुआ (tired)' }
      ],
      answer: 0,
      explanation: {
        en: 'The preposition "in" follows the word "absorbed" in this context ("absorbed in his work" means deeply engaged or interested). "Distracted" would take "by" or "from".',
        hi: 'इस संदर्भ में "absorbed" शब्द के बाद प्रीपोजिशन "in" आता है ("absorbed in his work" का अर्थ है काम में पूरी तरह से लीन होना)।'
      },
      year: 2021
    }]
  },
  {
    exam: 'SSC CHSL',
    subject: 'English',
    topic: 'Grammar and Vocabulary',
    subtopic: 'Spelling Correction',
    introduction: 'Spelling Correction evaluates a candidate\'s knowledge of English spelling rules, common prefixes/suffixes, and silent letters. It tests the ability to spot misspelled words in a list or within a sentence.',
    detailedExplanation: `## Spelling Correction Rules and Common Pitfalls

### 1. Key English Spelling Rules
- **The "I before E" rule**:
  - Write *i* before *e* except after *c*, or when sounded like "a" as in *neighbor* and *weigh*.
  - Examples: *Believe, Relief* (i before e); *Receive, Deceive* (e before i after c).
  - Exceptions: *Weird, Science, Height, Foreign*.
- **Adding Suffixes to Words Ending in "Y"**:
  - If a word ends in a consonant + *y*, change the *y* to *i* before adding a suffix (except -ing).
  - Examples: *Beauty + ful = Beautiful*, *Try + ed = Tried*.
- **Double the Consonant**:
  - For single-syllable words ending in consonant-vowel-consonant, double the final consonant before adding a suffix starting with a vowel.
  - Examples: *Run + ing = Running*, *Begin + er = Beginner*.

### 2. High-Frequency Misspelled Words
Many words are commonly misspelled due to silent letters, double letters, or variable pronunciations:
- **Double Consonant Pitfalls**: *Occurrence, Committee, Embarrass, Millennium, Accommodation, Possession, Harass*.
- **Silent Letters**: *Government, Environment, Maintenance, Pronunciation* (not pronounciation).
- **Vowel Swaps**: *Gauge, Liaison, Calendar, Separate* (not seperate).`,
    concepts: ['I before E Rule Exceptions', 'Suffix Addition Consonant Changes', 'Common Double Letter Pitfalls'],
    importantFacts: [
      'Spelling questions in CHSL usually ask to find the correctly spelled word or the misspelled word from a set of four.',
      'British English spellings are typically preferred in SSC exams over American variants.'
    ],
    examples: [
      'Double letter check: "Committee" has double m, double t, and double e. "Embarrass" has double r and double s.',
      'Incorrect pronunciation influence: People often write "pronounciation" because of the verb "pronounce". However, the correct noun spelling is "pronunciation".'
    ],
    tables: [{
      title: 'Frequently Tested Spelling Corrections',
      headers: ['Incorrect Spelling', 'Correct Spelling', 'Rule / Explanation'],
      rows: [
        ['seperate', 'separate', 'Contains "ar" in the middle, think of "a part"'],
        ['receive', 'receive', '"E" before "I" since it follows "C"'],
        ['accomodation', 'accommodation', 'Requires double "c" and double "m"'],
        ['occurred', 'occurred', 'Double "r" when adding suffix to single-stressed syllable'],
        ['goverment', 'government', 'Do not forget the silent "n" in the root word "govern"'],
        ['calender', 'calendar', 'Ends in "ar", used for dates']
      ]
    }],
    revisionNotes: '* Apply: "I before E except after C". (Exceptions: *weird, height*).\n* Double consonants: *committee* (m, t, e), *occurrence* (c, r), *embarrass* (r, s).\n* Remember silent letters: *government, environment*.\n* Common errors: *separate* (not seperate), *pronunciation* (not pronounciation).',
    pyqs: [{
      question: {
        en: 'Identify the correctly spelled word from the options:',
        hi: 'दिए गए विकल्पों में से सही वर्तनी (spelling) वाले शब्द की पहचान करें:'
      },
      options: [
        { en: 'Accomodation', hi: 'Accomodation' },
        { en: 'Accommodation', hi: 'Accommodation' },
        { en: 'Acomodation', hi: 'Acomodation' },
        { en: 'Accommodatione', hi: 'Accommodatione' }
      ],
      answer: 1,
      explanation: {
        en: 'The correct spelling is "Accommodation" which requires double \'c\' and double \'m\'. It refers to lodging or adjustments.',
        hi: 'सही वर्तनी "Accommodation" है, जिसमें डबल \'c\' और डबल \'m\' की आवश्यकता होती है।'
      },
      year: 2022
    }]
  },
  {
    exam: 'SSC CHSL',
    subject: 'English',
    topic: 'Grammar and Vocabulary',
    subtopic: 'One Word Substitution',
    introduction: 'One Word Substitution is a vocabulary-building exercise where a single word replaces a lengthy phrase or sentence. It tests a candidate\'s knowledge of root words, prefixes, and suffixes, and is highly scored in CHSL.',
    detailedExplanation: `## One Word Substitution — Roots, Prefixes & Suffixes

### 1. Importance of Root Words
Understanding root words allows you to deduce the meaning of multiple words:
- **-phobia** (Fear): *Acrophobia* (heights), *Claustrophobia* (confined places), *Hydrophobia* (water).
- **-cide** (Killing): *Patricide* (father), *Matricide* (mother), *Fratricide* (brother), *Regicide* (king).
- **-cracy / -archy** (Government/Rule): *Democracy* (people), *Autocracy* (one person), *Oligarchy* (few people), *Anarchy* (no law/government).
- **-logy** (Study of): *Biology* (life), *Anthropology* (humans), *Ornithology* (birds), *Entomology* (insects).

### 2. High-Frequency Categories
- **Words Relating to Beliefs / Mindsets**:
  - **Atheist**: A person who does not believe in the existence of God.
  - **Theist**: A person who believes in God.
  - **Agnostic**: A person skeptical about the existence of God.
  - **Optimist**: One who looks at the bright side of things.
  - **Pessimist**: One who looks at the dark side of things.
  - **Altruist**: A person who works for the welfare of others (philanthropist).
- **Words Relating to Habits & Lifestyles**:
  - **Teetotaler**: One who completely abstains from alcohol.
  - **Somnambulist**: One who walks in sleep.
  - **Gourmand**: A person who enjoys eating large amounts of food.
  - **Gourmet**: A connoisseur of good food.`,
    concepts: ['Root Word Analysis', 'Socio-Political Definitions', 'Mental Attitude Lexicon'],
    importantFacts: [
      'Root word analysis helps decode unfamiliar words in one-word substitution tasks.',
      'Distinguish between closely related words like "gourmand" (glutton) and "gourmet" (epicure/expert).'
    ],
    examples: [
      'Fear: "Claustrophobia" is derived from Latin "claustrum" (shut-in place) and Greek "phobos" (fear).',
      'Study: "Ornithology" is the scientific study of birds, where "ornitho-" is the root for bird.'
    ],
    tables: [{
      title: 'Common One Word Substitution Roots',
      headers: ['Root / Suffix', 'Meaning', 'Example Word', 'Example Meaning'],
      rows: [
        ['-cide', 'Killing / murder', 'Regicide', 'The action of killing a king'],
        ['-phobia', 'Extreme fear', 'Acrophobia', 'Extreme or irrational fear of heights'],
        ['-cracy', 'Type of government', 'Plutocracy', 'Government by the wealthy class'],
        ['Omni-', 'All / universal', 'Omniscient', 'Knowing everything; infinitely wise'],
        ['Phil-', 'Love / affinity', 'Philanthropist', 'One who loves humanity and performs charity'],
        ['Gamy-', 'Marriage', 'Polygamy', 'The practice of having more than one spouse']
      ]
    }],
    revisionNotes: '* Suffixes: -phobia (fear), -cide (killing), -cracy (government), -logy (study).\n* Agnostic = doubts God\'s existence. Atheist = denies God\'s existence.\n* Altruist = does good for others. Teetotaler = avoids alcohol.\n* Somnambulist = walks in sleep. Somniloquist = talks in sleep.',
    pyqs: [{
      question: {
        en: 'Choose the one word that can substitute the given phrase:\n"A person who completely abstains from alcohol."',
        hi: 'दिए गए वाक्यांश के लिए एक शब्द चुनें:\n"वह व्यक्ति जो शराब से पूरी तरह दूर रहता है।"'
      },
      options: [
        { en: 'Teetotaler', hi: 'मद्यत्यागी (Teetotaler)' },
        { en: 'Atheist', hi: 'नास्तिक (Atheist)' },
        { en: 'Somnambulist', hi: 'नींद में चलने वाला (Somnambulist)' },
        { en: 'Epicure', hi: 'स्वादलोलुप (Epicure)' }
      ],
      answer: 0,
      explanation: {
        en: 'A "Teetotaler" is a person who never drinks alcohol. "Atheist" does not believe in God, "Somnambulist" walks in sleep, and "Epicure" enjoys good food and drink.',
        hi: '"Teetotaler" वह व्यक्ति होता है जो कभी शराब नहीं पीता। "Atheist" भगवान में विश्वास नहीं करता, "Somnambulist" नींद में चलता है।'
      },
      year: 2021
    }]
  },
  {
    exam: 'SSC CHSL',
    subject: 'English',
    topic: 'Grammar and Vocabulary',
    subtopic: 'Active and Passive Voice',
    introduction: 'Active and passive voice represent different ways of structuring a sentence. In active voice, the subject performs the action; in passive voice, the subject receives the action. Changing voice is a major grammar section in CHSL.',
    detailedExplanation: `## Active & Passive Voice — Rules of Tense & Structure Transformation

### 1. Core Rule of Voice Transformation
- The object of the active verb becomes the subject of the passive verb.
- The subject of the active verb becomes the object of the passive verb, preceded by the preposition **"by"** (often omitted if the agent is obvious or unknown).
- The main verb is always converted to its **Past Participle (V3)** form, accompanied by an auxiliary verb (*be, is, am, are, was, were, been, being*) that matches the tense of the active sentence.

### 2. Tense Transformation Rules
- **Simple Present**: V1 / V1+s/es -> is/am/are + V3
  - *Active*: He writes a letter. -> *Passive*: A letter is written by him.
- **Present Continuous**: is/am/are + V1-ing -> is/am/are + being + V3
  - *Active*: She is reading a book. -> *Passive*: A book is being read by her.
- **Present Perfect**: has/have + V3 -> has/have + been + V3
  - *Active*: They have completed the project. -> *Passive*: The project has been completed by them.
- **Simple Past**: V2 -> was/were + V3
  - *Active*: She painted a picture. -> *Passive*: A picture was painted by her.
- **Past Continuous**: was/were + V1-ing -> was/were + being + V3
  - *Active*: He was driving a car. -> *Passive*: A car was being driven by him.
- **Simple Future**: will/shall + V1 -> will/shall + be + V3
  - *Active*: They will start a new business. -> *Passive*: A new business will be started by them.

### 3. Special Conversions
- **Imperative Sentences**:
  - *Active*: Close the door. -> *Passive*: Let the door be closed. / You are ordered to close the door.
- **Interrogative Sentences (with Who)**:
  - *Active*: Who wrote this book? -> *Passive*: By whom was this book written?`,
    concepts: ['Subject-Object Inversion', 'Auxiliary Verb Concord', 'Tense Mapping Rules', 'Imperative Voice Shifts'],
    importantFacts: [
      'In passive voice, the verb is always in the third form (Past Participle, V3).',
      'Intransitive verbs (verbs without an object, e.g., "go," "run") cannot be changed into passive voice.',
      'Future Continuous and all Perfect Continuous tenses have no standard passive voice form in traditional grammar.'
    ],
    examples: [
      'Who write: "Who broke the glass?" becomes "By whom was the glass broken?" in passive voice.',
      'Request: "Please help me." becomes "You are requested to help me." in passive voice.'
    ],
    tables: [{
      title: 'Tense Shifts in Voice Transformation',
      headers: ['Tense', 'Active Verb Form', 'Passive Verb Form'],
      rows: [
        ['Simple Present', 'write / writes', 'is / am / are + written'],
        ['Present Continuous', 'is / am / are + writing', 'is / am / are + being + written'],
        ['Present Perfect', 'has / have + written', 'has / have + been + written'],
        ['Simple Past', 'wrote', 'was / were + written'],
        ['Past Continuous', 'was / were + writing', 'was / were + being + written'],
        ['Simple Future', 'will write', 'will be + written']
      ]
    }],
    revisionNotes: '* Invert Subject and Object. Keep the tense identical.\n* Passive verb is always V3 (Past Participle).\n* Continuous tenses use "being". Perfect tenses use "been".\n* Imperative "Do it" -> "Let it be done".\n* "Who" changes to "By whom".\n* Intransitive verbs cannot be changed to passive.',
    pyqs: [{
      question: {
        en: 'Choose the correct passive form of the given sentence:\n"The manager rejected the proposal."',
        hi: 'दिए गए वाक्य का सही पैसिव (passive) रूप चुनें:\n"The manager rejected the proposal."'
      },
      options: [
        { en: 'The proposal is rejected by the manager.', hi: 'The proposal is rejected by the manager.' },
        { en: 'The proposal was rejected by the manager.', hi: 'The proposal was rejected by the manager.' },
        { en: 'The proposal had been rejected by the manager.', hi: 'The proposal had been rejected by the manager.' },
        { en: 'The proposal was being rejected by the manager.', hi: 'The proposal was being rejected by the manager.' }
      ],
      answer: 1,
      explanation: {
        en: 'The active sentence is in the Simple Past tense ("rejected", V2). The passive rule is: Object + was/were + V3 + by + Subject. So, "The proposal was rejected by the manager" is correct.',
        hi: 'सक्रिय वाक्य सामान्य भूतकाल (Simple Past) में है। पैसिव का नियम है: ऑब्जेक्ट + was/were + V3 + by + सब्जेक्ट। अतः "The proposal was rejected by the manager" सही है।'
      },
      year: 2021
    }]
  },
  {
    exam: 'SSC CHSL',
    subject: 'English',
    topic: 'Comprehension & Reading',
    subtopic: 'Cloze Test',
    introduction: 'A Cloze Test is a passage from which certain words are deleted. The student selects the correct option to fill in the blank to maintain grammatical and logical coherence.',
    detailedExplanation: `## Cloze Test — Contextual Reading & Grammar Rules

### 1. Strategy to Solve
- **Read the passage** to identify the central theme.
- **Examine the options** for grammatical and structural agreement.
- **Pay attention** to tense consistency and word collocations.

### 2. Practice Points
- Understand the role of prepositions, nouns, adjectives, and conjunctions in linking clauses.`,
    concepts: ['Reading Comprehension', 'Grammar Check', 'Transition Word Context'],
    importantFacts: [
      'Cloze tests in CHSL typically contain 5 blanks and cover general or narrative themes.',
      'Check if the blank precedes a preposition to use correct collocations.'
    ],
    examples: [
      'Preposition collocation: "She is dedicated _____ her work." Option "to" fits best.'
    ],
    tables: [{
      title: 'Common Prepositional Connectors',
      headers: ['Preposition', 'Collocating Words'],
      rows: [
        ['to', 'dedicated, committed, look forward, adapt'],
        ['from', 'refrain, abstain, prevent, prohibit'],
        ['with', 'cope, compatible, popular, coordinate']
      ]
    }],
    revisionNotes: '* Read full passage first.\n* Check grammar and tone agreement.\n* Use elimination strategy.',
    pyqs: [{
      question: {
        en: 'Identify the correct preposition for the blank: "He was accused ______ committing fraud."',
        hi: 'रिक्त स्थान के लिए सही प्रीपोजिशन की पहचान करें: "He was accused ______ committing fraud."'
      },
      options: [
        { en: 'of', hi: 'of' },
        { en: 'for', hi: 'for' },
        { en: 'with', hi: 'with' },
        { en: 'by', hi: 'by' }
      ],
      answer: 0,
      explanation: {
        en: 'The verb "accused" takes the preposition "of" (e.g., accused of something).',
        hi: '"accused" क्रिया के बाद प्रीपोजिशन "of" आता है।'
      },
      year: 2021
    }]
  },
  {
    exam: 'SSC CHSL',
    subject: 'General Awareness',
    topic: 'General Knowledge',
    subtopic: 'Indian Economy Basics',
    introduction: 'Indian Economy Basics covers structural sectors, national income measures, and key planning organizations. It is an essential component of the General Awareness section in CHSL.',
    detailedExplanation: `## Indian Economy Basics — Sectors & National Income

### 1. Sectors of the Economy
- **Primary Sector**: Direct exploitation of natural resources (e.g., Agriculture, Forestry, Fishing, Mining).
- **Secondary Sector**: Manufacturing and processing raw materials into finished goods (e.g., Factories, Construction, Energy generation).
- **Tertiary Sector**: Service sector providing support to primary and secondary sectors (e.g., Banking, IT, Education, Tourism, Healthcare).
- **Quaternary & Quinary Sectors**: Subsets of tertiary dealing with research, knowledge, and high-level decision-making.

### 2. National Income Metrics
- **Gross Domestic Product (GDP)**: Total monetary value of all finished goods and services produced within a country's geographic borders in a financial year.
- **Gross National Product (GNP)**: GDP + Net Factor Income from Abroad (NFIA). Measures income earned by citizens globally.
- **Net National Income at Factor Cost (NNP at FC)**: Also known as **National Income**. It is NNP at Market Price minus indirect taxes plus subsidies.

### 3. Economic Planning in India
- **Planning Commission**: Established in 1950, drafted 12 Five-Year Plans (1951 - 2017).
  - First Plan (1951-56): Based on **Harrod-Domar Model**, focused on agriculture.
  - Second Plan (1956-61): Based on **Mahalanobis Model**, focused on heavy industries.
- **NITI Aayog (National Institution for Transforming India)**:
  - Replaced the Planning Commission on **January 1, 2015**.
  - Serves as a policy think-tank of the Government of India, operating on principles of **cooperative federalism**.
  - Structure: Chairperson (Prime Minister), Vice-Chairperson, CEO, Governing Council (all State CMs & UT LGs).`,
    concepts: ['Three Sectors of Economy', 'GDP vs GNP vs NNP', 'Five Year Plans Models', 'NITI Aayog Structure'],
    importantFacts: [
      'The service sector (Tertiary) contributes the highest percentage to India\'s GDP, while the primary sector employs the largest share of the workforce.',
      'NITI Aayog was established on January 1, 2015, replacing the Planning Commission.',
      'National Income is calculated by the Central Statistics Office (CSO), now part of the National Statistical Office (NSO).',
      'The First Five-Year Plan focused on agricultural development.'
    ],
    examples: [
      'GNP calculation: If an Indian doctor works in the US and sends money home, this income is added to India\'s GNP but not GDP.',
      'Primary sector share: Approximately 45% of India\'s workforce is engaged in agriculture, yet it contributes only around 18% to the GDP.'
    ],
    tables: [{
      title: 'Three Main Sectors of Indian Economy',
      headers: ['Sector', 'Key Activities', 'GDP Contribution (~)', 'Employment Share (~)'],
      rows: [
        ['Primary', 'Agriculture, fishing, forestry, mining', '18%', '45% (Highest)'],
        ['Secondary', 'Manufacturing, construction, utilities', '28%', '25%'],
        ['Tertiary', 'Services, retail, IT, banking, education', '54% (Highest)', '30%']
      ]
    }],
    revisionNotes: '* Sectors: Primary (agri), Secondary (manufacturing), Tertiary (services).\n* GDP = within borders. GNP = GDP + NFIA (citizens).\n* National Income = NNP at Factor Cost.\n* Planning: 1st Plan (Harrod-Domar), 2nd Plan (Mahalanobis).\n* NITI Aayog: Est. Jan 1, 2015. Think-tank, cooperative federalism. PM is Chair.',
    pyqs: [{
      question: {
        en: 'Which organization replaced the Planning Commission of India?',
        hi: 'भारत के योजना आयोग को किस संगठन ने प्रतिस्थापित किया?'
      },
      options: [
        { en: 'NITI Aayog', hi: 'नीति आयोग' },
        { en: 'Finance Commission', hi: 'वित्त आयोग' },
        { en: 'National Development Council', hi: 'राष्ट्रीय विकास परिषद' },
        { en: 'National Statistical Office', hi: 'राष्ट्रीय सांख्यिकी कार्यालय' }
      ],
      answer: 0,
      explanation: {
        en: 'The Planning Commission of India, established in 1950, was replaced by the NITI Aayog (National Institution for Transforming India) on January 1, 2015, to serve as a policy think tank using a bottom-up cooperative federalism approach.',
        hi: '1950 में स्थापित भारत के योजना आयोग को 1-जनवरी-2015 को नीति आयोग (राष्ट्रीय भारत परिवर्तन संस्थान) द्वारा प्रतिस्थापित किया गया था, ताकि सहकारी संघवाद दृष्टिकोण का उपयोग करके नीति थिंक टैंक के रूप में कार्य किया जा सके।'
      },
      year: 2020
    }]
  }
];

async function seed() {
  console.log('\n═'.repeat(60));
  console.log('  NIRNAYPATH MASTER SEEDER — FILLING REMAINING GAPS');
  console.log('═'.repeat(60) + '\n');

  console.log(`🔌 Connecting to: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected.\n');

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of missingContent) {
    try {
      const exists = await LearningContent.findOne({
        exam: item.exam,
        subject: item.subject,
        topic: item.topic,
        subtopic: item.subtopic
      });

      if (exists) {
        skipped++;
        continue;
      }

      await LearningContent.create({
        exam: item.exam,
        subject: item.subject,
        topic: item.topic,
        subtopic: item.subtopic,
        introduction: item.introduction,
        detailedExplanation: item.detailedExplanation,
        concepts: item.concepts,
        importantFacts: item.importantFacts,
        examples: item.examples,
        tables: item.tables,
        revisionNotes: item.revisionNotes,
        pyqs: item.pyqs,
        practiceMcqs: []
      });

      inserted++;
      console.log(`  ✅ [${item.exam}] [${item.subject}] ${item.subtopic}`);
    } catch (err) {
      failed++;
      console.error(`  ❌ Failed: [${item.exam}] ${item.subtopic} — ${err.message}`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`📊 SEEDING COMPLETE`);
  console.log(`  ✅ Inserted: ${inserted}`);
  console.log(`  ⏭️ Skipped: ${skipped}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log('═'.repeat(60) + '\n');

  await mongoose.disconnect();
  console.log('🔌 Disconnected.');
}

seed().catch(console.error);
