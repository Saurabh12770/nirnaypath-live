import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
import LearningContent from '../models/LearningContent.js';

const EXAM = 'UPSC';
const SUBJECT = 'History';

// ═══════════════════════════════════════════════════════════════════
// ANCIENT INDIA — MICRO CONCEPTS
// ═══════════════════════════════════════════════════════════════════
const ancientIndiaMicro = [
  // ── Prehistoric India ──
  {
    topic: 'Ancient India',
    subtopic: 'Paleolithic Age — Tools, Sites & Subsistence',
    introduction: 'The Paleolithic Age (Old Stone Age, ~500,000–10,000 BCE) marks the earliest phase of human habitation in the Indian subcontinent. Humans were food gatherers and hunters, relying entirely on stone tools for survival.',
    detailedExplanation: `## Paleolithic Age in India\n\n### 1. Chronology & Classification\nThe Paleolithic period is divided into three sub-phases:\n- **Lower Paleolithic (500,000–100,000 BCE)**: Characterized by hand axes, cleavers, and choppers. Key sites include **Bhimbetka (MP)**, **Attirampakkam (Tamil Nadu)**, and **Sohan Valley (Pakistan)**. Tools were crude and heavy.\n- **Middle Paleolithic (100,000–40,000 BCE)**: Marked by flake tools, scrapers, and borers. Found at **Nevasa (Maharashtra)**, **Didwana (Rajasthan)**, and **Bhimbetka**.\n- **Upper Paleolithic (40,000–10,000 BCE)**: Appearance of blades, burins, and bone tools. Sites include **Belan Valley (UP)**, **Kurnool Caves (AP)**, and **Renigunta (AP)**.\n\n### 2. Key Sites & Discoveries\n- **Bhimbetka Rock Shelters (MP)**: UNESCO World Heritage Site. Contains over 700 rock shelters with cave paintings depicting hunting scenes, animals, and human figures.\n- **Attirampakkam (TN)**: Excavated by Sharma and Pappu. Found Acheulian hand axes dating back 1.5 million years — among the oldest in South Asia.\n- **Hunsgi-Baichbal Valley (Karnataka)**: Rich concentration of Acheulian tools.\n\n### 3. Subsistence & Lifestyle\n- Humans lived in caves, rock shelters, and open-air sites near rivers.\n- Diet consisted of wild fruits, roots, nuts, and hunted animals.\n- Fire usage began in the Middle Paleolithic.\n- No knowledge of agriculture, pottery, or metals.`,
    concepts: ['Acheulian Culture', 'Hand Axe Technology', 'Rock Shelter Habitation', 'Food Gathering Economy'],
    importantFacts: [
      'Bhimbetka rock shelters in MP are a UNESCO World Heritage Site with 700+ painted shelters.',
      'Attirampakkam in Tamil Nadu has yielded Acheulian tools dated to ~1.5 million years ago.',
      'Lower Paleolithic tools were core tools (hand axes, cleavers); Upper Paleolithic tools were flake-based (blades, burins).',
      'Robert Bruce Foote is called the "Father of Indian Prehistory" — he discovered the first Paleolithic tool in India at Pallavaram (near Chennai) in 1863.',
      'No evidence of pottery, agriculture, or permanent settlement in the Paleolithic period.'
    ],
    examples: [
      'Bhimbetka cave painting of a bison hunt shows Upper Paleolithic social organization.',
      'The Sohan Valley (Soan culture) in present-day Pakistan represents the pebble-tool tradition distinct from the Acheulian.'
    ],
    tables: [{
      title: 'Paleolithic Sub-Phases — Comparison',
      headers: ['Phase', 'Period', 'Tool Types', 'Key Sites', 'Subsistence'],
      rows: [
        ['Lower Paleolithic', '500,000–100,000 BCE', 'Hand axes, cleavers, choppers', 'Bhimbetka, Attirampakkam, Hunsgi', 'Hunting & gathering'],
        ['Middle Paleolithic', '100,000–40,000 BCE', 'Flakes, scrapers, borers', 'Nevasa, Didwana, Bhimbetka', 'Hunting, possibly fire use'],
        ['Upper Paleolithic', '40,000–10,000 BCE', 'Blades, burins, bone tools', 'Belan Valley, Kurnool Caves', 'Hunting, cave paintings']
      ]
    }],
    revisionNotes: '* Remember: Lower = Core tools, Middle = Flake tools, Upper = Blade tools.\n* Robert Bruce Foote — first Paleolithic tool discovery, Pallavaram, 1863.\n* Bhimbetka — UNESCO site, cave paintings, MP.\n* Attirampakkam — oldest Acheulian in South Asia.\n* No pottery, agriculture, or metals in Paleolithic.',
    pyqs: [{
      question: { en: 'Robert Bruce Foote, who discovered the first Paleolithic tool in India, was originally:', hi: 'रॉबर्ट ब्रूस फूट, जिन्होंने भारत में पहला पुरापाषाण उपकरण खोजा, मूल रूप से थे:' },
      options: [
        { en: 'A geologist', hi: 'एक भूवैज्ञानिक' },
        { en: 'An archaeologist', hi: 'एक पुरातत्वविद्' },
        { en: 'A historian', hi: 'एक इतिहासकार' },
        { en: 'A botanist', hi: 'एक वनस्पतिशास्त्री' }
      ],
      answer: 0,
      explanation: { en: 'Robert Bruce Foote was a British geologist who worked with the Geological Survey of India and discovered the first Paleolithic tool (a hand axe) at Pallavaram near Chennai in 1863.', hi: 'रॉबर्ट ब्रूस फूट एक ब्रिटिश भूवैज्ञानिक थे जिन्होंने भारतीय भूवैज्ञानिक सर्वेक्षण के साथ काम किया और 1863 में चेन्नई के पास पल्लवरम में पहला पुरापाषाण उपकरण (हस्त कुठार) खोजा।' },
      year: 2019
    }]
  },
  {
    topic: 'Ancient India',
    subtopic: 'Mesolithic Age — Microlithic Revolution & Rock Art',
    introduction: 'The Mesolithic Age (Middle Stone Age, ~10,000–6,000 BCE) marks the transition from hunting-gathering to food production. Characterized by tiny stone tools called microliths and the earliest evidence of animal domestication in India.',
    detailedExplanation: `## Mesolithic Period in India\n\n### 1. Defining Features\n- **Microliths**: Small, geometric stone tools (triangles, trapezes, crescents) made from chalcedony, chert, and jasper. These were often hafted onto wooden/bone handles.\n- **Climate Change**: The end of the Ice Age brought warmer conditions, expanding forests and grasslands.\n- **Transition Economy**: While still primarily hunter-gatherers, evidence of early animal domestication (dog, sheep, goat) appears.\n\n### 2. Major Sites\n- **Bagor (Rajasthan)**: Largest Mesolithic site in India. Located on the Kothari River. Evidence of both hunting and early pastoral activity. Animal bones of cattle, sheep, and goat found.\n- **Adamgarh (MP)**: Rock paintings depicting domesticated animals — earliest evidence of animal domestication in India.\n- **Langhnaj (Gujarat)**: Human burials with grave goods — evidence of Mesolithic burial practices.\n- **Sarai Nahar Rai & Mahadaha (UP)**: Multiple human burials with ornaments. Evidence of settled community life.\n- **Chopani Mando (UP)**: Earliest evidence of use of pottery in a Mesolithic context.\n\n### 3. Rock Art\nMesolithic rock art is found extensively at **Bhimbetka**, **Adamgarh**, and **Raisen** (all in MP). Paintings depict hunting scenes, dancing, and animal herds using red, white, and green pigments made from iron oxide and lime.`,
    concepts: ['Microlithic Technology', 'Animal Domestication Origins', 'Mesolithic Burial Practices', 'Environmental Adaptation'],
    importantFacts: [
      'Bagor (Rajasthan) is the largest Mesolithic site in India.',
      'Adamgarh (MP) provides the earliest evidence of animal domestication in India.',
      'Langhnaj (Gujarat) is known for Mesolithic human burials with grave goods.',
      'Chopani Mando (UP) has the earliest evidence of pottery use in a Mesolithic context.',
      'Microliths were small geometric tools — triangles, crescents, trapezes — hafted onto handles.'
    ],
    examples: [
      'At Sarai Nahar Rai, multiple burials with ornaments suggest a settled Mesolithic community with social hierarchy.',
      'Bhimbetka rock paintings from the Mesolithic period show communal hunting of large animals like bison.'
    ],
    tables: [{
      title: 'Key Mesolithic Sites in India',
      headers: ['Site', 'State', 'Significance', 'Key Finds'],
      rows: [
        ['Bagor', 'Rajasthan', 'Largest Mesolithic site in India', 'Animal bones, microliths, pottery sherds'],
        ['Adamgarh', 'Madhya Pradesh', 'Earliest evidence of animal domestication', 'Rock paintings of domesticated animals'],
        ['Langhnaj', 'Gujarat', 'Mesolithic burials', 'Human skeletons with grave goods'],
        ['Sarai Nahar Rai', 'Uttar Pradesh', 'Settled community evidence', 'Multiple burials, bone ornaments'],
        ['Chopani Mando', 'Uttar Pradesh', 'Earliest Mesolithic pottery', 'Crude handmade pottery']
      ]
    }],
    revisionNotes: '* Microliths = Small geometric stone tools (triangles, crescents, trapezes).\n* Bagor = Largest Mesolithic site (Rajasthan).\n* Adamgarh = First animal domestication evidence (MP).\n* Chopani Mando = Earliest Mesolithic pottery (UP).\n* Langhnaj = Mesolithic burials (Gujarat).',
    pyqs: [{
      question: { en: 'Which of the following Mesolithic sites provides the earliest evidence of animal domestication in India?', hi: 'निम्नलिखित में से कौन सा मध्यपाषाण स्थल भारत में पशु पालन का सबसे प्रारंभिक साक्ष्य प्रदान करता है?' },
      options: [
        { en: 'Adamgarh', hi: 'आदमगढ़' },
        { en: 'Bagor', hi: 'बागोर' },
        { en: 'Langhnaj', hi: 'लांघनाज' },
        { en: 'Bhimbetka', hi: 'भीमबेटका' }
      ],
      answer: 0,
      explanation: { en: 'Adamgarh in Madhya Pradesh has rock paintings depicting domesticated animals, providing the earliest evidence of animal domestication in Indian prehistory.', hi: 'मध्य प्रदेश में आदमगढ़ में पालतू जानवरों को दर्शाने वाली शैल चित्रकारी है, जो भारतीय प्रागैतिहास में पशु पालन का सबसे प्रारंभिक साक्ष्य प्रदान करती है।' },
      year: 2020
    }]
  },
  {
    topic: 'Ancient India',
    subtopic: 'Neolithic Age — Agricultural Revolution & Earliest Settlements',
    introduction: 'The Neolithic Age (New Stone Age, ~7,000–1,000 BCE) witnessed the most transformative change in human history — the shift from food gathering to food production. The domestication of plants and animals led to permanent settlements, pottery, and the foundations of civilization.',
    detailedExplanation: `## Neolithic Revolution in India\n\n### 1. Agricultural Origins\nThe Neolithic period saw the independent development of agriculture in several parts of India:\n- **Mehrgarh (Balochistan)**: Oldest known Neolithic settlement in the subcontinent (~7000 BCE). Excavated by Jean-François Jarrige. Evidence of wheat, barley cultivation, and domestication of sheep and goats.\n- **Koldihwa & Mahagara (UP)**: Evidence of the earliest rice cultivation in the world (~6000 BCE).\n- **Chirand (Bihar)**: Neolithic site on the banks of the Ganga. Tools made of bone and antler found.\n\n### 2. Key Characteristics\n- **Polished Stone Tools**: Ground and polished axes (celts), adzes, and chisels replaced crude chipped tools.\n- **Pottery**: Handmade pottery appears — grey ware, black burnished ware.\n- **Settled Life**: Rectangular and circular mud houses. Pit dwellings at Burzahom (Kashmir).\n- **Domestication**: Cattle, sheep, goats, dogs. Cultivation of wheat, barley, rice, ragi.\n\n### 3. Regional Variation\n- **Northwest (Mehrgarh)**: Wheat & barley. Mud-brick houses. Earliest.\n- **Northeast India (Daojali Hading, Assam)**: Neolithic tools with unique cord-marked pottery.\n- **South India (Piklihal, Utnur, Paiyampalli)**: Ash mounds from cattle penning. Evidence of pastoral-agricultural economy.\n- **Kashmir (Burzahom, Gufkral)**: Pit dwellings, dog burials, bone tools. Unique burial of dog with master.`,
    concepts: ['Agricultural Revolution', 'Polished Stone Technology', 'Permanent Settlement', 'Regional Neolithic Cultures'],
    importantFacts: [
      'Mehrgarh (Balochistan) is the oldest Neolithic site in the subcontinent (~7000 BCE), excavated by Jean-François Jarrige.',
      'Koldihwa (UP) provides evidence of the earliest rice cultivation in the world.',
      'Burzahom (Kashmir) is known for pit dwellings and burial of dogs with their masters.',
      'Chirand (Bihar) is a major Neolithic site on the banks of the Ganga.',
      'Ash mounds in South Indian sites like Utnur and Piklihal suggest cattle penning and pastoral economy.'
    ],
    examples: [
      'At Burzahom, a famous pit shows a hunting scene engraved on stone — a man with a dog chasing a deer, with a sun and a possible meteor depicted.',
      'Mehrgarh shows continuous occupation from Neolithic to Chalcolithic, providing a complete transition sequence.'
    ],
    tables: [{
      title: 'Neolithic Sites Across India',
      headers: ['Region', 'Key Sites', 'Period', 'Crops/Animals', 'Special Features'],
      rows: [
        ['Northwest', 'Mehrgarh', '~7000 BCE', 'Wheat, barley, sheep, goat', 'Oldest Neolithic; mud-brick houses'],
        ['Gangetic Plains', 'Koldihwa, Chirand', '~6000 BCE', 'Rice, cattle', 'Earliest rice cultivation'],
        ['Kashmir', 'Burzahom, Gufkral', '~3000 BCE', 'Wheat, lentils, dogs', 'Pit dwellings; dog burials'],
        ['South India', 'Piklihal, Utnur, Paiyampalli', '~2500 BCE', 'Ragi, cattle, sheep', 'Ash mounds; pastoral economy'],
        ['Northeast', 'Daojali Hading', '~2500 BCE', 'Rice, yam', 'Cord-marked pottery; stone axes']
      ]
    }],
    revisionNotes: '* Mehrgarh = Oldest Neolithic (~7000 BCE, Balochistan).\n* Koldihwa = Earliest rice in world (UP).\n* Burzahom = Pit dwellings + dog burials (Kashmir).\n* Chirand = Neolithic on Ganga (Bihar).\n* South India ash mounds = Cattle penning evidence.',
    pyqs: [{
      question: { en: 'Which of the following is considered the oldest Neolithic settlement in the Indian subcontinent?', hi: 'भारतीय उपमहाद्वीप में सबसे प्राचीन नवपाषाण बस्ती निम्नलिखित में से कौन सी मानी जाती है?' },
      options: [
        { en: 'Mehrgarh', hi: 'मेहरगढ़' },
        { en: 'Burzahom', hi: 'बुर्जहोम' },
        { en: 'Chirand', hi: 'चिरांद' },
        { en: 'Koldihwa', hi: 'कोल्डिहवा' }
      ],
      answer: 0,
      explanation: { en: 'Mehrgarh in Balochistan (now Pakistan) is the oldest known Neolithic settlement (~7000 BCE), showing evidence of early farming and animal domestication.', hi: 'बलूचिस्तान (अब पाकिस्तान) में मेहरगढ़ सबसे प्राचीन ज्ञात नवपाषाण बस्ती (~7000 ई.पू.) है, जो प्रारंभिक कृषि और पशु पालन के साक्ष्य दिखाती है।' },
      year: 2018
    }]
  },
  {
    topic: 'Ancient India',
    subtopic: 'Chalcolithic Age — Copper-Stone Cultures of India',
    introduction: 'The Chalcolithic Age (Copper-Stone Age, ~3000–700 BCE) bridges the Neolithic and Iron Age. Communities used copper alongside stone tools, developed specialized pottery, and established farming villages across the Deccan and central India.',
    detailedExplanation: `## Chalcolithic Cultures of India\n\n### 1. Definition & Chronology\nThe term "Chalcolithic" derives from Greek *chalkos* (copper) + *lithos* (stone). This phase is marked by the use of copper along with microliths and polished stone tools. It roughly spans 3000–700 BCE across different regions.\n\n### 2. Major Chalcolithic Cultures\n- **Ahar-Banas Culture (Rajasthan, ~3000–1500 BCE)**: Sites include Ahar (Tambavati) and Gilund. Known for Black-and-Red Ware pottery. Evidence of copper smelting.\n- **Kayatha Culture (MP, ~2450–1700 BCE)**: Pre-Harappan culture with sturdy mud houses. Named after site Kayatha near Ujjain.\n- **Malwa Culture (MP, ~1700–1200 BCE)**: Largest Chalcolithic culture in India. Sites include Navdatoli, Eran, and Nagda. Fine painted pottery — the finest Chalcolithic pottery in India.\n- **Jorwe Culture (Maharashtra, ~1400–700 BCE)**: Sites include Jorwe, Nevasa, Daimabad, Inamgaon, and Prakash. Known for channel-spouted pots. Daimabad bronze figures (chariot with horses and elephants).\n- **Savalda Culture (Maharashtra)**: Overlaps with late Jorwe.\n\n### 3. Key Features\n- **Economy**: Agriculture-based (wheat, barley, rice, lentils). Animal husbandry (cattle, sheep, goat, buffalo).\n- **Technology**: Copper axes, rings, beads. Stone blades continued.\n- **Pottery**: Each culture had distinctive pottery — Black-and-Red Ware (Ahar), Painted pottery (Malwa), Channel-spouted (Jorwe).\n- **Social Structure**: Rural, egalitarian villages. No urban planning like Harappan cities.\n- **Burial Practices**: At Inamgaon, children were buried in urns within the house floor. Adults buried in north-south orientation.`,
    concepts: ['Copper-Stone Technology', 'Regional Chalcolithic Cultures', 'Black-and-Red Ware', 'Pre-Urban Rural Societies'],
    importantFacts: [
      'Malwa Culture is the largest Chalcolithic settlement in India with the finest painted pottery.',
      'Daimabad (Maharashtra) yielded famous bronze figures including a chariot drawn by horses — possibly linked to Harappan trade.',
      'At Inamgaon (Jorwe culture), a four-room house with an attached granary and child urn burials was found.',
      'Ahar is also known as Tambavati (copper town) due to evidence of extensive copper smelting.',
      'Chalcolithic people did NOT know iron — this distinguishes them from the later Iron Age cultures.'
    ],
    examples: [
      'The Daimabad bronze hoard contains a chariot with two yoked horses, a buffalo-rider figure, and an elephant — suggesting advanced metallurgical skill.',
      'At Inamgaon, the largest Chalcolithic burial site, an adult male was buried with a headless dog and bones of a bull placed near the skeleton.'
    ],
    tables: [{
      title: 'Major Chalcolithic Cultures of India',
      headers: ['Culture', 'Region', 'Period', 'Distinctive Pottery', 'Key Sites'],
      rows: [
        ['Ahar-Banas', 'Rajasthan', '3000–1500 BCE', 'Black-and-Red Ware', 'Ahar, Gilund'],
        ['Kayatha', 'Madhya Pradesh', '2450–1700 BCE', 'Painted & combed ware', 'Kayatha'],
        ['Malwa', 'Madhya Pradesh', '1700–1200 BCE', 'Finest painted pottery', 'Navdatoli, Eran, Nagda'],
        ['Jorwe', 'Maharashtra', '1400–700 BCE', 'Channel-spouted pots', 'Jorwe, Daimabad, Inamgaon'],
        ['Savalda', 'Maharashtra', '2200–2000 BCE', 'Coarse pottery', 'Savalda, Daimabad']
      ]
    }],
    revisionNotes: '* Malwa = Largest Chalcolithic culture, finest pottery.\n* Daimabad = Bronze hoard (chariot + horses).\n* Inamgaon = Child urn burials + largest Jorwe site.\n* Ahar = Tambavati = copper smelting (Rajasthan).\n* Chalcolithic = copper + stone, NO iron.',
    pyqs: [{
      question: { en: 'The Chalcolithic culture known for channel-spouted pottery is:', hi: 'नाली-मुख वाले मृद्भांड के लिए जानी जाने वाली ताम्रपाषाण संस्कृति है:' },
      options: [
        { en: 'Jorwe Culture', hi: 'जोर्वे संस्कृति' },
        { en: 'Malwa Culture', hi: 'मालवा संस्कृति' },
        { en: 'Kayatha Culture', hi: 'कायथा संस्कृति' },
        { en: 'Ahar Culture', hi: 'आहड़ संस्कृति' }
      ],
      answer: 0,
      explanation: { en: 'The Jorwe Culture of Maharashtra (1400–700 BCE) is distinctively identified by its channel-spouted pottery, found at sites like Jorwe, Inamgaon, and Daimabad.', hi: 'महाराष्ट्र की जोर्वे संस्कृति (1400–700 ई.पू.) को उसके नाली-मुख वाले मृद्भांड से विशिष्ट रूप से पहचाना जाता है, जो जोर्वे, इनामगांव और दैमाबाद जैसे स्थलों पर पाया जाता है।' },
      year: 2021
    }]
  },
  // ── IVC Deep Dive ──
  {
    topic: 'Ancient India',
    subtopic: 'Harappan Civilization — Urban Planning & Great Bath',
    introduction: 'The Harappan (Indus Valley) Civilization (~2600–1900 BCE) was one of the world\'s earliest urban civilizations. Its sophisticated town planning, with grid-patterned streets, advanced drainage systems, and monumental architecture like the Great Bath, set it apart from contemporary civilizations of Mesopotamia and Egypt.',
    detailedExplanation: `## Harappan Urban Planning\n\n### 1. Grid Pattern & Citadel-Lower Town Division\n- Cities were divided into two parts: an elevated **Citadel** (west) and a larger **Lower Town** (east).\n- Streets were laid in a **grid pattern** (north-south and east-west), intersecting at right angles.\n- The main streets were about 10 meters wide; lanes were 1.5–3 meters.\n- **Exception**: Lothal had no separate citadel — both parts were at ground level within a single enclosure.\n\n### 2. The Great Bath (Mohenjo-daro)\n- Dimensions: 12m long × 7m wide × 2.4m deep.\n- Made of baked bricks with a layer of **bitumen (natural tar)** for waterproofing.\n- Flanked by changing rooms. Steps on both ends for descent.\n- Believed to have been used for ritual bathing and purification ceremonies.\n- Excavated by **R.D. Banerji** in 1922.\n\n### 3. Drainage System\n- The most advanced drainage system of the ancient world.\n- Every house connected to street drains via terracotta pipes.\n- Covered drains along streets with manholes for inspection and cleaning.\n- Soak pits at intervals to filter solid waste.\n\n### 4. Building Materials\n- **Mohenjo-daro & Harappa**: Baked bricks in a standard ratio of 1:2:4 (thickness:width:length).\n- **Kalibangan**: Mud bricks used instead of baked bricks.\n- **Dholavira**: Built with local stone blocks rather than bricks.`,
    concepts: ['Grid Town Planning', 'Citadel-Lower Town Division', 'Great Bath Architecture', 'Hydraulic Engineering'],
    importantFacts: [
      'Harappan cities followed a grid pattern with streets at right angles — a feature not found in Mesopotamian cities.',
      'The Great Bath at Mohenjo-daro (12m × 7m × 2.4m) was waterproofed with bitumen.',
      'Standard brick ratio was 1:2:4 (height:width:length) — consistent across all Harappan sites.',
      'Lothal is unique for having no separate citadel; both parts were at ground level.',
      'Dholavira (Gujarat) used stone blocks instead of bricks and had 3 divisions (citadel, middle town, lower town) — unique tripartite division.'
    ],
    examples: [
      'The drainage system at Mohenjo-daro had covered main drains, household connections, and soak pits — more sophisticated than many modern Indian towns.',
      'Dholavira had large reservoirs carved from rock to store rainwater — evidence of advanced water management in an arid zone.'
    ],
    tables: [{
      title: 'Major Harappan Sites — Planning Features',
      headers: ['Site', 'State/Region', 'Excavator', 'Special Planning Feature'],
      rows: [
        ['Mohenjo-daro', 'Sindh (Pakistan)', 'R.D. Banerji (1922)', 'Great Bath; best drainage system'],
        ['Harappa', 'Punjab (Pakistan)', 'Daya Ram Sahni (1921)', 'Granary; working platform; coffin burial'],
        ['Lothal', 'Gujarat', 'S.R. Rao (1957)', 'Dockyard; no separate citadel; fire altars'],
        ['Dholavira', 'Gujarat', 'R.S. Bisht (1990)', 'Tripartite division; stone construction; signboard'],
        ['Kalibangan', 'Rajasthan', 'A. Ghosh & B.B. Lal', 'Ploughed field; fire altars; mud bricks']
      ]
    }],
    revisionNotes: '* Grid pattern = N-S & E-W streets at right angles.\n* Great Bath = 12×7×2.4m, bitumen waterproofing, Mohenjo-daro.\n* Brick ratio = 1:2:4 (universal).\n* Lothal = No separate citadel + dockyard.\n* Dholavira = 3-part division + stone blocks + signboard.\n* Kalibangan = Ploughed field + mud bricks.',
    pyqs: [{
      question: { en: 'Which Harappan site is known for its unique tripartite division of the settlement?', hi: 'किस हड़प्पा स्थल को बस्ती के अद्वितीय त्रिपक्षीय विभाजन के लिए जाना जाता है?' },
      options: [
        { en: 'Dholavira', hi: 'धोलावीरा' },
        { en: 'Mohenjo-daro', hi: 'मोहनजोदड़ो' },
        { en: 'Lothal', hi: 'लोथल' },
        { en: 'Kalibangan', hi: 'कालीबंगा' }
      ],
      answer: 0,
      explanation: { en: 'Dholavira in Gujarat\'s Kutch district is the only Harappan site with a tripartite division — Citadel, Middle Town, and Lower Town, along with multiple water reservoirs.', hi: 'गुजरात के कच्छ जिले में धोलावीरा एकमात्र हड़प्पा स्थल है जिसमें त्रिपक्षीय विभाजन है — गढ़, मध्य नगर, और निचला नगर, साथ ही कई जल जलाशय हैं।' },
      year: 2022
    }]
  },
  {
    topic: 'Ancient India',
    subtopic: 'Harappan Civilization — Seals, Script & Religion',
    introduction: 'The Harappan seals, undeciphered script, and religious practices provide crucial insights into the cultural and spiritual life of this ancient civilization. Over 3,500 seals have been discovered, most made of steatite, depicting animals, deities, and inscriptions.',
    detailedExplanation: `## Harappan Seals, Script & Religion\n\n### 1. Seals\n- Over **3,500 seals** recovered, mostly square or rectangular.\n- Material: Primarily **steatite** (soapstone); some copper, agate, and ivory.\n- Most common animal: **Unicorn bull** (one-horned bull). Others: elephant, rhinoceros, tiger, bison.\n- **Pashupati Seal (Mohenjo-daro)**: Shows a seated figure (possibly proto-Shiva) in yogic posture, surrounded by four animals — elephant, tiger, rhinoceros, and buffalo. Two deer at the feet.\n- **Persian Gulf seal at Lothal**: Evidence of trade with Mesopotamia.\n- Purpose: Trade identification, property marks, and possibly religious amulets.\n\n### 2. Script\n- **Undeciphered** to this day — written **boustrophedon** (right to left in one line, left to right in the next — debated).\n- About **400–450 signs** identified. Mostly on seals and pottery.\n- Longest inscription: ~26 signs (Dholavira signboard, 10 large signs).\n- **Not alphabetic** — likely **logo-syllabic** (a mix of ideograms and phonetic signs).\n- Attempts at decipherment: Asko Parpola (Dravidian hypothesis), Iravatham Mahadevan (Dravidian), S.R. Rao (Indo-Aryan).\n\n### 3. Religion\n- **Mother Goddess worship**: Numerous terracotta female figurines found — suggests fertility cult.\n- **Proto-Shiva (Pashupati)**: Horned deity in yogic pose.\n- **Animal worship**: Unicorn bull, humped bull; no horse representation.\n- **Tree worship**: Pipal tree depicted on seals.\n- **No temple structures** found — religion was likely domestic/ritualistic.\n- **Fire altars** found at Lothal and Kalibangan — possible Vedic connection.`,
    concepts: ['Steatite Seal Technology', 'Undeciphered Script', 'Proto-Shiva Worship', 'Mother Goddess Cult'],
    importantFacts: [
      'The Pashupati Seal from Mohenjo-daro depicts a horned figure in yogic posture surrounded by four animals — considered proto-Shiva.',
      'The Harappan script has ~400-450 signs and remains undeciphered — it is the longest undeciphered script of a literate civilization.',
      'The unicorn bull is the most frequently depicted animal on Harappan seals.',
      'No horse representation has been found on any Harappan seal — this distinguishes it from later Vedic culture.',
      'The Dholavira signboard has 10 large signs made of white inlay — possibly the earliest known signboard in the world.'
    ],
    examples: [
      'The Pashupati Seal has been compared to later Hindu depictions of Shiva as Pashupati (Lord of Animals), suggesting cultural continuity.',
      'A seal from Mohenjo-daro shows a figure fighting two tigers — reminiscent of the Mesopotamian hero Gilgamesh, suggesting cultural contact.'
    ],
    tables: [{
      title: 'Important Harappan Seals & Artifacts',
      headers: ['Artifact', 'Site', 'Description', 'Significance'],
      rows: [
        ['Pashupati Seal', 'Mohenjo-daro', 'Horned deity in yogic pose with 4 animals', 'Proto-Shiva; earliest Shaivite evidence'],
        ['Unicorn Seal', 'Multiple sites', 'One-horned bull with feeding trough', 'Most common seal; trade identity marker'],
        ['Dancing Girl', 'Mohenjo-daro', 'Bronze figurine of a girl in tribhanga pose', 'Lost-wax casting technique mastery'],
        ['Priest-King', 'Mohenjo-daro', 'Steatite bust with trefoil cloak', 'Only known representation of authority figure'],
        ['Dholavira Signboard', 'Dholavira', '10 large Harappan script signs', 'Possibly earliest signboard in history']
      ]
    }],
    revisionNotes: '* Pashupati Seal = Proto-Shiva, yogic pose, 4 animals (elephant, tiger, rhino, buffalo).\n* Unicorn bull = Most common seal animal.\n* Script = ~400-450 signs, undeciphered, logo-syllabic.\n* No horse on seals; no temples found.\n* Fire altars at Lothal & Kalibangan.\n* Dancing Girl = lost-wax technique (bronze).',
    pyqs: [{
      question: { en: 'Which of the following is correct about the Harappan script?', hi: 'हड़प्पा लिपि के बारे में निम्नलिखित में से कौन सा सही है?' },
      options: [
        { en: 'It has about 400-450 signs and remains undeciphered', hi: 'इसमें लगभग 400-450 चिह्न हैं और यह अभी तक अपठित है' },
        { en: 'It has been deciphered as an early form of Sanskrit', hi: 'इसे संस्कृत के प्रारंभिक रूप के रूप में पढ़ा गया है' },
        { en: 'It is purely alphabetic with 26 letters', hi: 'यह 26 अक्षरों के साथ पूर्णतः वर्णमाला आधारित है' },
        { en: 'It was written exclusively on copper plates', hi: 'यह विशेष रूप से ताम्रपत्रों पर लिखी गई थी' }
      ],
      answer: 0,
      explanation: { en: 'The Harappan script contains approximately 400-450 signs found on seals, pottery, and copper tablets. Despite numerous attempts by scholars like Asko Parpola and Iravatham Mahadevan, it remains undeciphered.', hi: 'हड़प्पा लिपि में लगभग 400-450 चिह्न हैं जो मुहरों, मृद्भांडों और ताम्र पट्टिकाओं पर पाए जाते हैं। अस्को पारपोला और इरावथम महादेवन जैसे विद्वानों के अनेक प्रयासों के बावजूद, यह अभी भी अपठित है।' },
      year: 2019
    }]
  },
  {
    topic: 'Ancient India',
    subtopic: 'Harappan Civilization — Economy, Trade & Crafts',
    introduction: 'The Harappan economy was based on agriculture, animal husbandry, and extensive long-distance trade. The civilization maintained trade contacts with Mesopotamia, the Persian Gulf, and Central Asia, exporting precious stones, ivory, and cotton textiles.',
    detailedExplanation: `## Harappan Economy & Trade\n\n### 1. Agriculture\n- Wheat, barley, peas, sesame, mustard were primary crops.\n- **Rice**: Evidence at Lothal and Rangpur (Gujarat) — debated.\n- **Cotton**: Harappans were the first to cultivate and weave cotton — Greeks called it *sindon* (from Sindh).\n- Irrigation through canals and flood-water harvesting.\n- **Ploughed field** discovered at Kalibangan — cross-ploughing pattern.\n\n### 2. Crafts & Industries\n- **Bead-making**: Chanhu-daro was a major bead-making center. Beads of carnelian, agate, lapis lazuli, and steatite.\n- **Shell working**: Nageshwar and Balakot were shell-working centers.\n- **Bronze casting**: Lost-wax (cire perdue) technique — Dancing Girl of Mohenjo-daro.\n- **Pottery**: Wheel-made, painted pottery — red or buff with black geometric designs.\n- **Weights & Measures**: Cubical chert weights in binary system (1, 2, 4, 8, 16...), later decimal. Standard measurement sticks found at Lothal.\n\n### 3. Trade Networks\n- **Mesopotamian trade**: Harappan seals found in Mesopotamian cities (Ur, Kish, Tell Asmar). The Mesopotamians called the Harappan region **Meluhha**.\n- **Shortughai (Afghanistan)**: Harappan outpost for accessing lapis lazuli from Badakhshan.\n- **Lothal dockyard**: Oldest artificial dockyard in the world — connected to Sabarmati river via channel.\n- **Internal trade**: Standardized weights and measures suggest regulated trade.\n- **No currency**: Trade was likely conducted through **barter** and sealed goods.`,
    concepts: ['Cotton Cultivation', 'Lost-Wax Casting', 'Mesopotamian Trade (Meluhha)', 'Binary Weight System'],
    importantFacts: [
      'Harappans were the first to cultivate and weave cotton — Greeks called it "sindon" from Sindh.',
      'The Mesopotamians referred to the Harappan civilization as "Meluhha" in their trade records.',
      'Lothal had the oldest known artificial dockyard in the world.',
      'Chanhu-daro was the primary bead-making center; Nageshwar and Balakot were shell-working centers.',
      'Weights followed a binary system (1, 2, 4, 8, 16...) using cubical chert stones.',
      'Shortughai in Afghanistan was a Harappan trading outpost for lapis lazuli access.'
    ],
    examples: [
      'A Harappan cylindrical seal found at Ur (Mesopotamia) confirms maritime trade links between the two civilizations.',
      'The trapezoidal dockyard at Lothal (214m × 36m) had an inlet channel and a spillway for water management.'
    ],
    tables: [{
      title: 'Harappan Trade Centers & Specializations',
      headers: ['Center', 'Location', 'Specialization', 'Key Evidence'],
      rows: [
        ['Lothal', 'Gujarat', 'Maritime trade, dockyard', 'Persian Gulf seal; rice husk'],
        ['Chanhu-daro', 'Sindh', 'Bead-making center', 'Carnelian, agate, lapis lazuli beads'],
        ['Nageshwar', 'Gujarat', 'Shell working', 'Conch shell artifacts'],
        ['Shortughai', 'Afghanistan', 'Lapis lazuli procurement', 'Harappan pottery in Central Asia'],
        ['Sutkagen-dor', 'Balochistan', 'Westernmost trade post', 'Near Makran coast; possible port']
      ]
    }],
    revisionNotes: '* First cotton cultivators — "sindon" (Greek name from Sindh).\n* Meluhha = Mesopotamian name for Harappan region.\n* Lothal = Oldest dockyard in the world.\n* Chanhu-daro = Bead center; Nageshwar = Shell center.\n* Weights = Binary system (cubical chert).\n* No coins — barter trade.\n* Shortughai = Afghan outpost for lapis lazuli.',
    pyqs: [{
      question: { en: 'Which ancient name did Mesopotamians use for the Harappan civilization?', hi: 'मेसोपोटामिया के लोग हड़प्पा सभ्यता के लिए किस प्राचीन नाम का उपयोग करते थे?' },
      options: [
        { en: 'Meluhha', hi: 'मेलुहा' },
        { en: 'Dilmun', hi: 'दिलमुन' },
        { en: 'Magan', hi: 'मगन' },
        { en: 'Elam', hi: 'एलाम' }
      ],
      answer: 0,
      explanation: { en: 'Mesopotamian cuneiform texts refer to the Indus Valley region as "Meluhha", while Dilmun was Bahrain and Magan was Oman — all part of the ancient maritime trade network.', hi: 'मेसोपोटामिया के कीलाकार ग्रंथ सिंधु घाटी क्षेत्र को "मेलुहा" के रूप में संदर्भित करते हैं, जबकि दिलमुन बहरीन था और मगन ओमान था — ये सभी प्राचीन समुद्री व्यापार नेटवर्क का हिस्सा थे।' },
      year: 2023
    }]
  },
  // ── Vedic Age ──
  {
    topic: 'Ancient India',
    subtopic: 'Rigvedic Society — Family, Varna & Pastoral Economy',
    introduction: 'The Early Vedic Period (~1500–1000 BCE) was centered around the Sapta Sindhu (Seven Rivers) region of Punjab. The Rig Veda, composed during this period, reveals a semi-nomadic pastoral society organized around clans (Jana), tribes (Vis), and families (Griha).',
    detailedExplanation: `## Rigvedic Social Structure\n\n### 1. Political Organization\n- **Rajan (King)**: Tribal chief, not hereditary initially. Protected the tribe (Jana) and cattle. Called *Gopati* (lord of cattle) and *Purandara* (destroyer of forts).\n- **Sabha**: Council of elders — more select, possibly judicial functions.\n- **Samiti**: General tribal assembly — broader participation, could elect/dethrone king.\n- **Senani**: Commander of forces. **Purohit**: Chief priest. **Gramani**: Village head.\n\n### 2. Social Structure\n- **Varna system** was flexible and occupation-based, NOT birth-based in the Rigvedic period.\n- The Purusha Sukta (Rig Veda 10.90) mentions four varnas — but this hymn is one of the latest additions.\n- **Family (Kula)** was patriarchal. **Grihastha** (householder) was the basic social unit.\n- Women had relatively high status — they could attend Sabha, choose husbands (Swayamvara), and compose hymns (Rishikas like Lopamudra, Vishvavara, Apala, Ghosa).\n- **No child marriage**; widow remarriage (Niyoga) was practiced.\n\n### 3. Economy\n- Primarily **pastoral** — cattle was the chief wealth. Wars (Gavishthi) were fought for cows.\n- **Cow (Go)** was sacred and the unit of value — *Duhitri* (daughter) literally means "one who milks."\n- Agriculture was secondary. Barley (*yava*) was the main crop.\n- **No coinage** — barter economy. Cow (Go) and gold ornament (Nishka) were exchange media.\n- Rivers: Sapta Sindhu region — Sindhu (Indus), Saraswati (most sacred, described as *naditama*), Vitasta (Jhelum), Asikni (Chenab), Parushni (Ravi), Vipasa (Beas), Shutudri (Sutlej).`,
    concepts: ['Tribal Polity (Jana)', 'Sabha-Samiti System', 'Pastoral Economy', 'Flexible Varna System'],
    importantFacts: [
      'The Sapta Sindhu (Seven Rivers) region in Punjab was the geographical core of Rigvedic civilization.',
      'Saraswati was called "naditama" (best of rivers) in the Rig Veda.',
      'Cattle was the chief wealth — wars for cattle were called "Gavishthi" (literally "search for cows").',
      'Women Rishikas who composed Vedic hymns include Lopamudra, Vishvavara, Apala, and Ghosa.',
      'The Purusha Sukta (RV 10.90) describing the four varnas is among the latest additions to the Rig Veda.',
      'There is no evidence of iron, rice, or wheat in the Rigvedic period.'
    ],
    examples: [
      'The Battle of Ten Kings (Dasharajña) described in RV Book 7 shows Sudas of the Bharata tribe defeating a coalition of ten tribal kings on the banks of river Parushni (Ravi).',
      'The term "Godhuli" (cow-dust time = evening) demonstrates the pastoral centrality of cattle in daily life.'
    ],
    tables: [{
      title: 'Rigvedic vs Later Vedic Society',
      headers: ['Feature', 'Rigvedic Period', 'Later Vedic Period'],
      rows: [
        ['Economy', 'Pastoral (cattle-based)', 'Agricultural (rice, wheat)'],
        ['Metal', 'Copper/Bronze (Ayas)', 'Iron (Shyama Ayas/Krishna Ayas)'],
        ['Varna', 'Flexible, occupation-based', 'Rigid, birth-based'],
        ['Women', 'High status, attended Sabha', 'Declining status'],
        ['Polity', 'Tribal, Sabha/Samiti powerful', 'Territorial kingdoms, king dominant'],
        ['Geography', 'Sapta Sindhu (Punjab)', 'Ganga-Yamuna Doab']
      ]
    }],
    revisionNotes: '* Rigvedic = Pastoral, cattle-based economy, Sapta Sindhu.\n* Saraswati = Naditama (best river).\n* Gavishthi = war for cows. Gopati = lord of cattle.\n* Women Rishikas: Lopamudra, Apala, Ghosa, Vishvavara.\n* Sabha = elite council. Samiti = general assembly.\n* Purusha Sukta (RV 10.90) = latest hymn on varnas.\n* Dasharajña = Battle of Ten Kings (RV Book 7).',
    pyqs: [{
      question: { en: 'In the Rigvedic period, which of the following terms referred to a war fought for cattle?', hi: 'ऋग्वैदिक काल में, निम्नलिखित में से कौन सा शब्द पशुओं के लिए लड़े गए युद्ध को संदर्भित करता था?' },
      options: [
        { en: 'Gavishthi', hi: 'गविष्टि' },
        { en: 'Samgrama', hi: 'संग्राम' },
        { en: 'Dharma Yuddha', hi: 'धर्म युद्ध' },
        { en: 'Ashvamedha', hi: 'अश्वमेध' }
      ],
      answer: 0,
      explanation: { en: 'Gavishthi literally means "search for cows" and refers to cattle raids and wars fought to capture bovine wealth, which was central to the Rigvedic pastoral economy.', hi: 'गविष्टि का शाब्दिक अर्थ है "गायों की खोज" और यह पशुधन छापों और युद्धों को संदर्भित करता है जो ऋग्वैदिक पशुपालन अर्थव्यवस्था के केंद्र बोवाइन संपत्ति पर कब्जा करने के लिए लड़े गए थे।' },
      year: 2017
    }]
  },
  {
    topic: 'Ancient India',
    subtopic: 'Later Vedic Period — Kingdoms, Rituals & Iron Age',
    introduction: 'The Later Vedic Period (~1000–600 BCE) saw expansion from Punjab to the Ganga-Yamuna Doab, the discovery of iron (Shyama/Krishna Ayas), the rise of territorial kingdoms, and an increasingly rigid varna system. The Sama, Yajur, and Atharva Vedas along with Brahmanas and Upanishads were composed during this era.',
    detailedExplanation: `## Later Vedic Transformations\n\n### 1. Geographical Expansion\n- Settlement shifted eastward from Sapta Sindhu to the **Ganga-Yamuna Doab** (Kuru-Panchala region).\n- The Painted Grey Ware (PGW) culture is archaeologically associated with Later Vedic settlements.\n- Rivers: Ganga and Yamuna became important; Saraswati declined.\n\n### 2. Political Changes\n- Tribal identity (Jana) gave way to **territorial kingdoms (Janapada)**.\n- King's power increased — royal consecration rituals became elaborate.\n- **Rajasuya**: Royal consecration sacrifice.\n- **Ashvamedha**: Horse sacrifice — assertion of imperial sovereignty.\n- **Vajapeya**: Chariot race ceremony — king's supremacy.\n- Sabha and Samiti lost power; became rubber stamps for the king.\n\n### 3. Iron & Economy\n- Iron (called **Shyama Ayas** or **Krishna Ayas** = black metal) enabled forest clearance and deep ploughing.\n- Agriculture became dominant — **rice** and **wheat** replaced barley.\n- Craft specialization increased: carpentry, metalwork, pottery, weaving.\n- **Nishka** became a standard unit of exchange (pre-coinage).\n\n### 4. Religion & Philosophy\n- Elaborate Vedic rituals performed by Brahmins gained dominance.\n- Priestly class demanded *dakshina* (gifts) — sometimes 1000 cows.\n- Upanishads emerged as a philosophical revolt against ritualism — emphasized **Atman-Brahman** unity, karma, and moksha.\n- Key Upanishads: Brihadaranyaka, Chandogya, Katha, Isha, Mundaka.`,
    concepts: ['Territorial Kingdoms (Janapada)', 'Iron Age Agriculture', 'Royal Sacrifices', 'Upanishadic Philosophy'],
    importantFacts: [
      'Iron was called Shyama Ayas or Krishna Ayas (black metal) in Later Vedic texts.',
      'Painted Grey Ware (PGW) culture is archaeologically associated with the Later Vedic period.',
      'Rajasuya (consecration), Ashvamedha (horse sacrifice), and Vajapeya (chariot race) were major Later Vedic rituals.',
      'Rice and wheat replaced barley as the principal crops during this period.',
      'The Upanishads represent a philosophical revolt against ritualism, emphasizing knowledge (Jnana) over ritual (Karma).',
      'The Kuru-Panchala region (Ganga-Yamuna Doab) became the political center.'
    ],
    examples: [
      'The Shatapatha Brahmana describes the legend of the flood and Manu — the Indian counterpart to Mesopotamian flood myths.',
      'The Brihadaranyaka Upanishad contains the dialogue between Yajnavalkya and Gargi Vachaknavi — a woman philosopher questioning the sage in a public debate.'
    ],
    tables: [{
      title: 'Later Vedic Texts — Classification',
      headers: ['Text Category', 'Examples', 'Content', 'Period'],
      rows: [
        ['Samhitas', 'Sama, Yajur, Atharva Veda', 'Hymns, chants, rituals, spells', '1000–800 BCE'],
        ['Brahmanas', 'Shatapatha, Aitareya', 'Ritual procedures and explanations', '800–600 BCE'],
        ['Aranyakas', 'Brihadaranyaka, Taittiriya', 'Forest texts — mystical interpretations', '800–600 BCE'],
        ['Upanishads', 'Chandogya, Katha, Isha', 'Philosophy — Atman, Brahman, Karma', '800–500 BCE']
      ]
    }],
    revisionNotes: '* Later Vedic = Ganga-Yamuna Doab, PGW culture.\n* Iron = Shyama/Krishna Ayas.\n* Rajasuya, Ashvamedha, Vajapeya = key rituals.\n* Rice + wheat replaced barley.\n* Upanishads = Atman-Brahman, philosophical revolt.\n* Women\'s status declined — could not attend Sabha.',
    pyqs: [{
      question: { en: 'The archaeological culture associated with the Later Vedic period is:', hi: 'उत्तर वैदिक काल से जुड़ी पुरातात्विक संस्कृति है:' },
      options: [
        { en: 'Painted Grey Ware (PGW)', hi: 'चित्रित धूसर मृद्भांड (PGW)' },
        { en: 'Ochre Coloured Pottery (OCP)', hi: 'गेरू रंग के मृद्भांड (OCP)' },
        { en: 'Northern Black Polished Ware (NBPW)', hi: 'उत्तरी काले पॉलिश किए मृद्भांड (NBPW)' },
        { en: 'Black and Red Ware (BRW)', hi: 'काले और लाल मृद्भांड (BRW)' }
      ],
      answer: 0,
      explanation: { en: 'Painted Grey Ware (PGW) culture (1100-500 BCE) is found in the Ganga-Yamuna Doab and is associated with Later Vedic settlements. NBPW is associated with the later Mahajanapada period.', hi: 'चित्रित धूसर मृद्भांड (PGW) संस्कृति (1100-500 ई.पू.) गंगा-यमुना दोआब में पाई जाती है और उत्तर वैदिक बस्तियों से जुड़ी है। NBPW बाद के महाजनपद काल से जुड़ा है।' },
      year: 2020
    }]
  },
  // ── Buddhism & Jainism ──
  {
    topic: 'Ancient India',
    subtopic: 'Sixteen Mahajanapadas — Geography, Polity & Magadha Rise',
    introduction: 'The 6th century BCE saw the emergence of 16 Mahajanapadas (great kingdoms/republics) across northern India. The Buddhist text Anguttara Nikaya lists these 16 states, among which Magadha eventually became the dominant power under the Haryanka, Shishunaga, and Nanda dynasties.',
    detailedExplanation: `## The Sixteen Mahajanapadas\n\n### 1. List & Geography\nThe 16 Mahajanapadas (from Anguttara Nikaya):\n1. **Anga** (East Bihar, capital: Champa)\n2. **Magadha** (South Bihar, capital: Rajagriha/Girivraj)\n3. **Vajji** (North Bihar, capital: Vaishali) — a Gana-Sangha (republic)\n4. **Malla** (Eastern UP, capitals: Kushinara & Pava) — a republic\n5. **Kashi** (Varanasi region)\n6. **Kosala** (Ayodhya region, capital: Shravasti)\n7. **Vatsa** (Allahabad region, capital: Kaushambi)\n8. **Chedi** (Bundelkhand, capital: Suktimati)\n9. **Kuru** (Delhi-Meerut, capital: Indraprastha)\n10. **Panchala** (Bareilly-Badaun, capitals: Ahichhatra & Kampilya)\n11. **Matsya** (Jaipur, capital: Viratanagara)\n12. **Shurasena** (Mathura region)\n13. **Assaka** (Godavari, capital: Potana/Potali) — only Mahajanapada south of Vindhyas\n14. **Avanti** (Malwa, capital: Ujjayini & Mahismati)\n15. **Gandhara** (NW Pakistan, capital: Taxila)\n16. **Kamboja** (Afghanistan, capital: Rajapura)\n\n### 2. Two Types of States\n- **Monarchies (Rajyas)**: Ruled by hereditary kings — Magadha, Kosala, Vatsa, Avanti.\n- **Republics (Gana-Sanghas)**: Ruled by oligarchic assemblies — Vajji, Malla, Kamboja.\n\n### 3. Rise of Magadha\n**Why Magadha became dominant:**\n- **Strategic location**: Control of trade routes along Ganga.\n- **Iron ore deposits**: In Rajgir hills — weapons and agricultural tools.\n- **Fertile alluvial soil**: Supported surplus agriculture.\n- **Aggressive rulers**: Bimbisara, Ajatashatru.\n- **First use of elephants** in warfare.\n- **Capital shift**: Rajagriha (fortified) → Pataliputra (strategic river confluence).`,
    concepts: ['Mahajanapada System', 'Monarchy vs Republic', 'Magadhan Imperialism', 'Iron Age Urbanization'],
    importantFacts: [
      'The 16 Mahajanapadas are listed in the Buddhist text Anguttara Nikaya.',
      'Assaka (on the Godavari) was the only Mahajanapada south of the Vindhyas.',
      'Vajji and Malla were Gana-Sanghas (republics/oligarchies), not monarchies.',
      'Magadha rose to dominance due to iron deposits, strategic location on the Ganga, and fertile soil.',
      'The four most powerful Mahajanapadas were Magadha, Kosala, Vatsa, and Avanti.',
      'Taxila (Gandhara) was a major center of learning, not a military power.'
    ],
    examples: [
      'The Vajjian confederacy, headquartered at Vaishali, was one of the world\'s earliest republics — Buddha praised its democratic practices as a model.',
      'Bimbisara of Magadha used matrimonial alliances (married princesses of Kosala, Vaishali, and Madra) to expand without war.'
    ],
    tables: [{
      title: 'Four Great Mahajanapadas — Comparison',
      headers: ['Mahajanapada', 'Capital', 'Type', 'Key Rulers', 'Claim to Fame'],
      rows: [
        ['Magadha', 'Rajagriha', 'Monarchy', 'Bimbisara, Ajatashatru', 'Eventually united all India'],
        ['Kosala', 'Shravasti', 'Monarchy', 'Prasenajit', 'Buddha\'s patron; absorbed Kashi'],
        ['Vatsa', 'Kaushambi', 'Monarchy', 'Udayana', 'Major trade center'],
        ['Avanti', 'Ujjayini', 'Monarchy', 'Pradyota', 'Controlled western trade routes']
      ]
    }],
    revisionNotes: '* 16 Mahajanapadas from Anguttara Nikaya.\n* Assaka = Only one south of Vindhyas (Godavari).\n* Vajji & Malla = Republics (Gana-Sanghas).\n* 4 powerful: Magadha, Kosala, Vatsa, Avanti.\n* Magadha dominance = iron + Ganga + fertile soil + elephants.\n* Bimbisara used matrimonial alliances.',
    pyqs: [{
      question: { en: 'Which of the following Mahajanapadas was the only one located south of the Vindhyas?', hi: 'निम्नलिखित में से कौन सा महाजनपद विंध्य के दक्षिण में स्थित एकमात्र था?' },
      options: [
        { en: 'Assaka', hi: 'अस्सक' },
        { en: 'Avanti', hi: 'अवंती' },
        { en: 'Chedi', hi: 'चेदि' },
        { en: 'Matsya', hi: 'मत्स्य' }
      ],
      answer: 0,
      explanation: { en: 'Assaka (Asmaka) was the only Mahajanapada situated south of the Vindhya Mountains, located on the banks of the Godavari river with its capital at Potana (Potali).', hi: 'अस्सक (अश्मक) विंध्य पर्वत के दक्षिण में स्थित एकमात्र महाजनपद था, जो गोदावरी नदी के तट पर पोटना (पोटली) राजधानी के साथ स्थित था।' },
      year: 2018
    }]
  },
  {
    topic: 'Ancient India',
    subtopic: 'Gautama Buddha — Life, Enlightenment & Core Teachings',
    introduction: 'Siddhartha Gautama (c. 563–483 BCE), born in the Shakya clan at Lumbini, renounced princely life to seek the truth about suffering. After attaining enlightenment at Bodh Gaya, he became the Buddha and taught the Middle Path, the Four Noble Truths, and the Eightfold Path for 45 years.',
    detailedExplanation: `## Life of Gautama Buddha\n\n### 1. Birth & Early Life\n- Born as **Siddhartha** in the Shakya clan at **Lumbini** (Nepal) in 563 BCE (traditional date).\n- Father: **Suddhodana** (elected chief of Shakya Gana-Sangha). Mother: **Mahamaya** (died 7 days after birth). Stepmother: **Mahapajapati Gautami**.\n- Wife: **Yashodhara**. Son: **Rahula**.\n- **Four Great Sights** (Chaturmahadarsana): An old man, a sick man, a dead body, and an ascetic — triggered his renunciation.\n- **Mahabhinishkramana** (Great Departure): Left palace at age 29.\n\n### 2. Spiritual Quest & Enlightenment\n- Studied under **Alara Kalama** (Sankhya philosophy) and **Uddaka Ramaputta** — found them insufficient.\n- Practiced extreme austerity for 6 years — rejected as futile.\n- Attained **Sambodhi (Enlightenment)** under a **Peepal tree (Bodhi tree)** at **Bodh Gaya** on the banks of river **Niranjana (Falgu)**. Age: 35.\n- Became **Tathagata** ("one who has found the truth").\n\n### 3. Core Teachings\n- **Middle Path (Madhyama Pratipada)**: Avoid both extreme indulgence and extreme asceticism.\n- **Four Noble Truths (Arya Satya)**:\n  1. Life is suffering (Dukkha)\n  2. Suffering has a cause — desire/craving (Tanha/Samudaya)\n  3. Suffering can end (Nirodha)\n  4. The path to end suffering is the Eightfold Path (Magga)\n- **Eightfold Path (Ashtangika Marga)**: Right View, Right Intention, Right Speech, Right Action, Right Livelihood, Right Effort, Right Mindfulness, Right Concentration.\n- **Dependent Origination (Pratityasamutpada)**: Everything arises in dependence upon conditions.\n- **Anatman (No-Self)**: Denied the existence of a permanent soul — key difference from Hinduism and Jainism.\n- **Rejected** caste system, Vedic rituals, and the authority of Brahmins.`,
    concepts: ['Four Noble Truths', 'Eightfold Path', 'Middle Path', 'Dependent Origination (Pratityasamutpada)'],
    importantFacts: [
      'Buddha was born at Lumbini, attained enlightenment at Bodh Gaya, gave his first sermon at Sarnath, and died at Kushinagar.',
      'The first sermon at Sarnath is called Dharmachakrapravartana (Turning of the Wheel of Law).',
      'Buddha denied the existence of a permanent soul (Anatman) — this distinguishes Buddhism from both Hinduism and Jainism.',
      'Buddha was silent on the question of God — neither affirmed nor denied.',
      'The Sangha (monastic order) was open to all castes — first organized monasticism in India.',
      'Mahapajapati Gautami was the first woman admitted to the Sangha (Bhikkhuni order).'
    ],
    examples: [
      'The Deer Park sermon at Sarnath (Dharmachakrapravartana) was given to the five ascetics (Panchavargiya Bhikshus) who had earlier abandoned Buddha.',
      'The Parable of the Poisoned Arrow: Buddha refused to answer metaphysical questions, comparing them to a man shot by an arrow who wants to know the arrow\'s maker instead of seeking treatment.'
    ],
    tables: [{
      title: 'Key Events in Buddha\'s Life',
      headers: ['Event', 'Place', 'Symbol', 'Significance'],
      rows: [
        ['Birth', 'Lumbini', 'Lotus & Bull', '563 BCE, Shakya clan'],
        ['Renunciation', 'Kapilavastu', 'Horse', 'Age 29, Mahabhinishkramana'],
        ['Enlightenment', 'Bodh Gaya', 'Bodhi Tree', 'Age 35, under Peepal tree'],
        ['First Sermon', 'Sarnath', 'Dharmachakra (Wheel)', 'Dharmachakrapravartana'],
        ['Death (Mahaparinirvana)', 'Kushinagar', 'Stupa', '483 BCE, age 80']
      ]
    }],
    revisionNotes: '* Born: Lumbini. Enlightenment: Bodh Gaya. First Sermon: Sarnath. Death: Kushinagar.\n* Four Noble Truths: Dukkha, Samudaya (Tanha), Nirodha, Magga.\n* Eightfold Path = Ashtangika Marga.\n* Anatman = No permanent soul (key difference from Hinduism).\n* First Sermon = Dharmachakrapravartana, 5 ascetics.\n* Mahapajapati Gautami = first Bhikkhuni.',
    pyqs: [{
      question: { en: 'Which of the following concepts distinguishes Buddhism from both Hinduism and Jainism?', hi: 'निम्नलिखित में से कौन सी अवधारणा बौद्ध धर्म को हिंदू धर्म और जैन धर्म दोनों से अलग करती है?' },
      options: [
        { en: 'Anatman (No-Self)', hi: 'अनात्मन (नो-सेल्फ)' },
        { en: 'Non-violence (Ahimsa)', hi: 'अहिंसा' },
        { en: 'Karma', hi: 'कर्म' },
        { en: 'Meditation', hi: 'ध्यान' }
      ],
      answer: 0,
      explanation: { en: 'The concept of Anatman (No-Self) — the denial of a permanent, unchanging soul — is unique to Buddhism. Both Hinduism (Atman) and Jainism (Jiva) believe in an eternal soul.', hi: 'अनात्मन (नो-सेल्फ) की अवधारणा — एक स्थायी, अपरिवर्तनीय आत्मा का खंडन — बौद्ध धर्म के लिए अद्वितीय है। हिंदू धर्म (आत्मन) और जैन धर्म (जीव) दोनों एक शाश्वत आत्मा में विश्वास करते हैं।' },
      year: 2022
    }]
  },
  {
    topic: 'Ancient India',
    subtopic: 'Mauryan Empire — Chandragupta, Chanakya & Administration',
    introduction: 'The Mauryan Empire (c. 321–185 BCE), founded by Chandragupta Maurya with the guidance of Chanakya (Kautilya), was the first empire to unify most of the Indian subcontinent. Kautilya\'s Arthashastra provides the most detailed account of Mauryan statecraft, espionage, and administration.',
    detailedExplanation: `## Mauryan Empire — Foundation & Administration\n\n### 1. Foundation by Chandragupta Maurya (321–297 BCE)\n- Overthrew the **Nanda dynasty** with the help of **Chanakya (Kautilya/Vishnugupta)**.\n- Defeated **Seleucus Nicator** (Alexander\'s general) in 305 BCE. Seleucus ceded eastern Afghanistan, Balochistan, and sent **Megasthenes** as ambassador to Pataliputra.\n- Treaty included a matrimonial alliance and 500 war elephants sent to Seleucus.\n- Capital: **Pataliputra** (modern Patna).\n\n### 2. Kautilya\'s Arthashastra\n- A treatise on **statecraft, economics, and military strategy**.\n- Describes the **Saptanga Theory** — 7 elements of the state: Swami (King), Amatya (Ministers), Janapada (Territory), Durga (Fort), Kosha (Treasury), Danda (Army), Mitra (Allies).\n- Advocates **espionage system** — extensive spy network for internal and external intelligence.\n- Concept of **Matsya Nyaya** (law of the fish) — without a strong ruler, the strong devour the weak.\n\n### 3. Administrative System\n- **Central Administration**: King was supreme. Assisted by Mantri Parishad (Council of Ministers).\n  - **Purohita**: Chief priest. **Senapati**: Commander. **Sannidhata**: Treasurer. **Samaharta**: Chief revenue collector.\n- **Provincial Administration**: Empire divided into provinces headed by **Kumara** (prince) or **Aryaputra**.\n  - Four provinces: Uttarapatha (Taxila), Avantipatha (Ujjain), Dakshinapatha (Suvarnagiri), Prachyapatha (Tosali).\n- **Revenue System**: Land tax was **1/6th of produce** (Bhaga). Other taxes: Senabhakta (army maintenance), Pindakara (village tax).\n- **Municipal Administration**: Megasthenes describes a 30-member committee divided into 6 boards of 5 managing: industry, foreigners, births/deaths, trade, manufactures, and tax collection.`,
    concepts: ['Saptanga Theory', 'Arthashastra', 'Centralized Bureaucracy', 'Espionage State'],
    importantFacts: [
      'Chandragupta Maurya defeated Seleucus Nicator in 305 BCE and received eastern Afghanistan and Balochistan.',
      'Megasthenes was the Greek ambassador to Pataliputra — his book "Indica" describes Mauryan society.',
      'Kautilya\'s Arthashastra describes the Saptanga Theory — 7 elements of a state.',
      'Land tax (Bhaga) was 1/6th of the agricultural produce.',
      'The empire was divided into 4 provinces: Taxila, Ujjain, Suvarnagiri, and Tosali.',
      'Chandragupta is believed to have converted to Jainism and fasted to death (Sallekhana) at Shravanabelagola (Karnataka).'
    ],
    examples: [
      'Megasthenes\' Indica describes Pataliputra as a magnificent city protected by a wooden palisade with 570 towers and 64 gates, surrounded by a deep moat.',
      'Kautilya\'s spy system included different categories of spies: Kapatika (fraudulent disciple), Udhasthita (recluse), Grihapatika (householder), Vaidehaka (merchant), and Tapasa (ascetic).'
    ],
    tables: [{
      title: 'Mauryan Provincial Administration',
      headers: ['Province', 'Capital', 'Region', 'Head'],
      rows: [
        ['Uttarapatha', 'Taxila', 'Northwest', 'Kumara/Viceroy'],
        ['Avantipatha', 'Ujjain', 'West', 'Kumara/Viceroy'],
        ['Dakshinapatha', 'Suvarnagiri', 'South', 'Kumara/Viceroy'],
        ['Prachyapatha', 'Tosali', 'East', 'Kumara/Viceroy'],
        ['Central', 'Pataliputra', 'Magadha', 'Emperor directly']
      ]
    }],
    revisionNotes: '* Chandragupta founded Mauryan Empire (321 BCE) with Chanakya.\n* Defeated Seleucus (305 BCE) — got Afghanistan, Balochistan + Megasthenes.\n* Arthashastra = Saptanga Theory (7 elements of state).\n* Matsya Nyaya = big fish eats small fish.\n* Land tax = 1/6th (Bhaga).\n* 4 provinces: Taxila, Ujjain, Suvarnagiri, Tosali.\n* Chandragupta → Jainism → Sallekhana at Shravanabelagola.',
    pyqs: [{
      question: { en: 'The "Saptanga Theory" of state described in the Arthashastra does NOT include which of the following?', hi: 'अर्थशास्त्र में वर्णित राज्य का "सप्तांग सिद्धांत" निम्नलिखित में से किसे शामिल नहीं करता?' },
      options: [
        { en: 'Dharma (Law)', hi: 'धर्म (कानून)' },
        { en: 'Kosha (Treasury)', hi: 'कोष (खजाना)' },
        { en: 'Danda (Army)', hi: 'दंड (सेना)' },
        { en: 'Mitra (Ally)', hi: 'मित्र (सहयोगी)' }
      ],
      answer: 0,
      explanation: { en: 'The Saptanga Theory includes: Swami (King), Amatya (Ministers), Janapada (Territory), Durga (Fort), Kosha (Treasury), Danda (Army), and Mitra (Allies). Dharma is not one of the seven elements.', hi: 'सप्तांग सिद्धांत में शामिल हैं: स्वामी (राजा), अमात्य (मंत्री), जनपद (क्षेत्र), दुर्ग (किला), कोष (खजाना), दंड (सेना), और मित्र (सहयोगी)। धर्म सात तत्वों में से एक नहीं है।' },
      year: 2019
    }]
  },
  {
    topic: 'Ancient India',
    subtopic: 'Emperor Ashoka — Dhamma, Edicts & Welfare State',
    introduction: 'Ashoka (r. 268–232 BCE), Chandragupta\'s grandson, is considered one of the greatest rulers in world history. After the devastating Kalinga War, he embraced Buddhism and propagated Dhamma (righteousness) through a network of inscriptions (edicts) across the empire — the first documented evidence of state welfare policy.',
    detailedExplanation: `## Ashoka & His Dhamma\n\n### 1. Kalinga War & Transformation\n- The **Kalinga War** (261 BCE) was fought to conquer Kalinga (modern Odisha).\n- **Rock Edict XIII** describes the horror: 100,000 killed, 150,000 deported, many times that number perished.\n- Ashoka was so horrified that he vowed to conquer by **Dhammavijaya** (victory through righteousness) instead of **Digvijaya** (military conquest).\n- He embraced Buddhism under the monk **Upagupta** (though his personal conversion may have been earlier, influenced by **Nigrodha/Moggaliputta Tissa**).\n\n### 2. Ashoka\'s Dhamma\n- Dhamma was NOT Buddhism — it was a **universal ethical code** for all subjects regardless of religion.\n- Core principles: Ahimsa (non-violence), respect for elders, generosity, truthfulness, tolerance of all religions.\n- **Dhamma Mahamattas**: Special officers appointed to propagate Dhamma.\n- **Ban on animal sacrifice** and regulated slaughter.\n- Established **hospitals for humans and animals**, rest houses, wells, and shade trees along roads.\n\n### 3. Edicts — Types & Locations\n- **14 Major Rock Edicts**: At Girnar (Gujarat), Dhauli & Jaugada (Odisha), Kalsi (Uttarakhand), Shahbazgarhi & Mansehra (Pakistan). Content: Dhamma policies, administrative reforms.\n- **7 Pillar Edicts**: At Topra, Meerut, Lauriya Nandangarh, Lauriya Araraj, Rampurva, Allahabad. Lion Capital at Sarnath is from Ashoka\'s pillar.\n- **Minor Rock Edicts**: Personal declarations, found at Maski, Gujarra, Bhabru/Bairat, Nittur, Udegolam.\n- **Cave Inscriptions**: Barabar Caves (Bihar) — given to Ajivika monks.\n- **Edict language**: Mostly **Prakrit in Brahmi script**. In NW: Kharoshthi. In Kandahar: Greek & Aramaic.\n\n### 4. Legacy\n- Ashoka\'s Lion Capital at Sarnath is India\'s national emblem.\n- The Ashoka Chakra (24-spoke wheel) appears on the Indian flag.\n- James Prinsep deciphered Brahmi script in 1837, unlocking Ashokan inscriptions.`,
    concepts: ['Dhamma (Universal Ethics)', 'Dhammavijaya', 'Edicts System', 'Welfare State Concept'],
    importantFacts: [
      'The Kalinga War (261 BCE) killed 100,000 and deported 150,000 according to Ashoka\'s own Rock Edict XIII.',
      'Ashoka\'s Dhamma was NOT Buddhism — it was a universal ethical code for all religions.',
      'Dhamma Mahamattas were special officers appointed to spread Dhamma among the people.',
      'James Prinsep deciphered the Brahmi script in 1837, making Ashokan inscriptions readable.',
      'The Ashoka Pillar at Sarnath (Lion Capital) is India\'s national emblem; the Ashoka Chakra is on the flag.',
      'Barabar Caves in Bihar were given by Ashoka to Ajivika monks — oldest surviving rock-cut caves in India.',
      'The name "Ashoka" was first identified on the Maski Rock Edict — before that he was known only as "Devanampiya Piyadasi."'
    ],
    examples: [
      'Rock Edict XIII at Dhauli uniquely replaces the Kalinga War description with a carved elephant — symbolizing peace — suggesting local sensitivity.',
      'The Greek-Aramaic bilingual edict at Kandahar (Afghanistan) demonstrates Ashoka\'s multicultural administrative approach.'
    ],
    tables: [{
      title: 'Ashoka\'s Edicts — Classification',
      headers: ['Type', 'Number', 'Key Locations', 'Primary Content'],
      rows: [
        ['Major Rock Edicts', '14', 'Girnar, Dhauli, Kalsi, Shahbazgarhi', 'Dhamma policies, Kalinga remorse'],
        ['Minor Rock Edicts', 'Multiple', 'Maski, Bhabru, Gujarra, Nittur', 'Personal conversion, Buddhist faith'],
        ['Pillar Edicts', '7', 'Topra, Meerut, Lauriya, Allahabad', 'Dhamma administration, punishments'],
        ['Cave Inscriptions', '3-4', 'Barabar Hills (Bihar)', 'Grants to Ajivika monks'],
        ['Special Edicts', '2', 'Dhauli, Jaugada (separate)', 'Instructions for Kalinga officials']
      ]
    }],
    revisionNotes: '* Kalinga War = 261 BCE, Rock Edict XIII = 100,000 killed.\n* Dhamma ≠ Buddhism; universal ethical code.\n* Dhamma Mahamattas = Dhamma propagation officers.\n* James Prinsep = Brahmi decipherment (1837).\n* Maski = first edict with name "Ashoka".\n* Sarnath Lion Capital = national emblem. Chakra = flag.\n* Barabar Caves = Ajivikas (oldest rock-cut caves).',
    pyqs: [{
      question: { en: 'The name "Ashoka" is specifically mentioned in which inscription?', hi: '"अशोक" नाम किस शिलालेख में विशेष रूप से उल्लिखित है?' },
      options: [
        { en: 'Maski Rock Edict', hi: 'मास्की शिलालेख' },
        { en: 'Girnar Rock Edict', hi: 'गिरनार शिलालेख' },
        { en: 'Dhauli Rock Edict', hi: 'धौली शिलालेख' },
        { en: 'Allahabad Pillar', hi: 'इलाहाबाद स्तंभ' }
      ],
      answer: 0,
      explanation: { en: 'The Maski Minor Rock Edict (Karnataka) was the first inscription where the name "Ashoka" was directly mentioned, identifying the "Devanampiya Piyadasi" of other edicts as Ashoka.', hi: 'मास्की लघु शिलालेख (कर्नाटक) पहला शिलालेख था जहां "अशोक" नाम सीधे उल्लिखित था, जिसने अन्य शिलालेखों के "देवानांप्रिय प्रियदर्शी" को अशोक के रूप में पहचाना।' },
      year: 2017
    }]
  },
  // ── Gupta Empire ──
  {
    topic: 'Ancient India',
    subtopic: 'Gupta Empire — Golden Age of India',
    introduction: 'The Gupta Period (c. 320–550 CE) is called the "Golden Age of India" for its unparalleled achievements in art, science, literature, mathematics, and astronomy. Founded by Sri Gupta, the empire reached its zenith under Chandragupta I, Samudragupta, and Chandragupta II (Vikramaditya).',
    detailedExplanation: `## Gupta Empire — Political History & Cultural Achievements\n\n### 1. Key Rulers\n- **Sri Gupta (c. 240–280 CE)**: Founded the dynasty. Minor chief in Magadha.\n- **Chandragupta I (320–335 CE)**: First great Gupta ruler. Married **Kumaradevi** of the Lichchhavi clan (Vaishali). Issued gold coins showing both king and queen. Started the **Gupta Era (320 CE)**.\n- **Samudragupta (335–375 CE)**: Greatest military genius. The **Allahabad Pillar Inscription** (Prayag Prashasti) by his court poet **Harisena** describes his conquests. Called the "Napoleon of India" by historian **V.A. Smith**. Was a patron of arts — played the veena (depicted on coins).\n- **Chandragupta II / Vikramaditya (375–415 CE)**: Defeated the Shakas of western India. Capital shifted to **Ujjain**. His court had the **Navaratnas** (Nine Gems) including **Kalidasa** (poet), **Varahamihira** (astronomer), **Dhanvantari** (physician), and **Amarasimha** (lexicographer).\n\n### 2. Cultural Golden Age\n- **Literature**: Kalidasa wrote *Abhijnana Shakuntalam*, *Raghuvamsham*, *Meghadutam*, *Kumarasambhavam*.\n- **Science**: Aryabhata wrote *Aryabhatiyam* — stated Earth rotates on its axis, calculated pi (π) = 3.1416, and the solar year = 365.358 days.\n- **Mathematics**: Concept of **zero** and **decimal system** developed. Brahmagupta later formalized.\n- **Astronomy**: Varahamihira wrote *Brihat Samhita* and *Pancha Siddhantika*.\n- **Medicine**: Sushruta Samhita (surgical text) and Charaka Samhita were compiled/refined.\n\n### 3. Art & Architecture\n- **Temple Architecture**: Dashavatara Temple (Deogarh), Vishnu Temple (Tigawa) — earliest structural Hindu temples.\n- **Painting**: Ajanta Cave paintings (particularly Caves 1, 2, 16, 17) reached their peak during Gupta period.\n- **Sculpture**: Sarnath Buddha (finest), Mathura School of Art — cream colored sandstone, transparent drapery.\n- **Iron Pillar of Delhi (Mehrauli)**: 7.2m tall, 6 tonnes, rust-free for 1600+ years — metallurgical marvel.`,
    concepts: ['Golden Age of India', 'Navaratna System', 'Scientific Revolution', 'Classical Sanskrit Literature'],
    importantFacts: [
      'The Gupta Era started in 320 CE with Chandragupta I\'s accession.',
      'Samudragupta is described in the Allahabad Pillar Inscription (by Harisena) — called "Napoleon of India" by V.A. Smith.',
      'Chandragupta II (Vikramaditya)\'s court had the Navaratnas including Kalidasa and Varahamihira.',
      'Aryabhata stated that the Earth rotates on its axis and calculated pi = 3.1416.',
      'The Iron Pillar at Mehrauli (Delhi) has not rusted for 1600+ years — evidence of advanced metallurgy.',
      'The Dashavatara Temple at Deogarh (UP) is among the earliest structural stone temples in India.',
      'Fa-Hien, the Chinese pilgrim, visited India during Chandragupta II\'s reign and described a peaceful, prosperous empire.'
    ],
    examples: [
      'Samudragupta\'s gold coins depict him playing the veena — evidence that the emperor was personally accomplished in music.',
      'Fa-Hien noted that people in the Gupta Empire did not eat onions, garlic, or meat, and that capital punishment was rare.'
    ],
    tables: [{
      title: 'Gupta Rulers — Chronological Summary',
      headers: ['Ruler', 'Period', 'Title/Epithet', 'Key Achievement'],
      rows: [
        ['Sri Gupta', '240–280 CE', 'Founder', 'Established Gupta lineage in Magadha'],
        ['Chandragupta I', '320–335 CE', 'Maharajadhiraja', 'Lichchhavi alliance; Gupta Era started'],
        ['Samudragupta', '335–375 CE', 'Napoleon of India', 'Military conquests; Allahabad Pillar'],
        ['Chandragupta II', '375–415 CE', 'Vikramaditya', 'Defeated Shakas; Navaratna court'],
        ['Kumaragupta I', '415–455 CE', 'Mahendraditya', 'Founded Nalanda University'],
        ['Skandagupta', '455–467 CE', 'Last great Gupta', 'Repelled Huna invasion temporarily']
      ]
    }],
    revisionNotes: '* Gupta Era = 320 CE. Founded by Sri Gupta.\n* Samudragupta = Allahabad Pillar (Harisena). "Napoleon of India" (V.A. Smith).\n* Chandragupta II = Vikramaditya, Navaratnas, defeated Shakas.\n* Aryabhata = Earth rotation, π=3.1416, Aryabhatiyam.\n* Kalidasa = Shakuntalam, Meghadutam, Raghuvamsham.\n* Iron Pillar = Mehrauli, rust-free 1600+ years.\n* Fa-Hien = Chinese pilgrim, Chandragupta II\'s time.',
    pyqs: [{
      question: { en: 'The Allahabad Pillar Inscription (Prayag Prashasti) was composed by:', hi: 'इलाहाबाद स्तंभ शिलालेख (प्रयाग प्रशस्ति) की रचना किसने की?' },
      options: [
        { en: 'Harisena', hi: 'हरिसेन' },
        { en: 'Kalidasa', hi: 'कालिदास' },
        { en: 'Banabhatta', hi: 'बाणभट्ट' },
        { en: 'Ravikirti', hi: 'रविकीर्ति' }
      ],
      answer: 0,
      explanation: { en: 'Harisena was the court poet of Samudragupta who composed the Prayag Prashasti (Allahabad Pillar Inscription), describing the military achievements and personality of the emperor.', hi: 'हरिसेन समुद्रगुप्त के दरबारी कवि थे जिन्होंने प्रयाग प्रशस्ति (इलाहाबाद स्तंभ शिलालेख) की रचना की, जो सम्राट की सैन्य उपलब्धियों और व्यक्तित्व का वर्णन करती है।' },
      year: 2020
    }]
  }
];

// ═══════════════════════════════════════════════════════════════════
// MEDIEVAL INDIA — MICRO CONCEPTS
// ═══════════════════════════════════════════════════════════════════
const medievalIndiaMicro = [
  {
    topic: 'Medieval India',
    subtopic: 'Delhi Sultanate — Slave Dynasty: Qutbuddin Aibak to Balban',
    introduction: 'The Slave Dynasty (1206–1290 CE) was the first dynasty of the Delhi Sultanate, founded by Qutbuddin Aibak, a former slave and general of Muhammad Ghori. This dynasty established Muslim political authority over northern India and laid the foundations for Delhi as a political capital.',
    detailedExplanation: `## The Slave Dynasty (Mamluk Dynasty)\n\n### 1. Key Rulers\n- **Qutbuddin Aibak (1206–1210)**: Former slave of Muhammad Ghori. Called **Lakh Bakhsh** (giver of lakhs) for his generosity. Built the **Quwwat-ul-Islam mosque** (first mosque in India) and started the **Qutub Minar** (completed by Iltutmish). Died while playing polo.\n- **Iltutmish (1211–1236)**: Consolidated the Sultanate. **Completed Qutub Minar**. Introduced the **silver tanka** and **copper jital** — first major currency reform. Received legitimacy from the **Caliph of Baghdad** (Abbasid Caliph). Nominated his daughter **Razia** as successor.\n- **Razia Sultana (1236–1240)**: First and only female ruler of the Delhi Sultanate. Discarded purdah, appeared in court without veil, rode elephants. Faced opposition from the **Chahalgani** (Group of Forty Turkish nobles). Killed in 1240.\n- **Balban (1266–1287)**: Established **Blood and Iron** policy. Introduced **Zaminbosi (prostration)** and **Paibos (kissing the feet)** to enhance royal prestige. Established the **Diwan-i-Arz (military department)**. Broke the power of the Chahalgani. Called himself **Zil-i-Ilahi** (Shadow of God).\n\n### 2. Administrative System\n- **Iqta System**: Land grants (iqtas) given to nobles (iqtadars/muqtis) in lieu of salary. They collected revenue and maintained troops. Not hereditary initially.\n- **Chahalgani**: Group of 40 Turkish slave-nobles who controlled politics — broken by Balban.\n\n### 3. Architecture\n- Qutub Minar: 72.5m, 5 storeys, built by Aibak (1 storey), completed by Iltutmish (3 storeys), repaired by Firoz Shah Tughlaq.\n- Quwwat-ul-Islam Mosque: Built using materials from 27 demolished Hindu-Jain temples.`,
    concepts: ['Mamluk Sultanate', 'Iqta System', 'Chahalgani Politics', 'Indo-Islamic Architecture Origins'],
    importantFacts: [
      'Qutbuddin Aibak was called "Lakh Bakhsh" for his generous grants.',
      'Iltutmish introduced the silver tanka and copper jital — standardizing Delhi Sultanate coinage.',
      'Razia Sultana was the first and only female ruler of the Delhi Sultanate (1236–1240).',
      'Balban introduced the concepts of Zaminbosi and Paibos to elevate royal dignity.',
      'The Qutub Minar is 72.5m tall with 5 storeys — started by Aibak, completed by Iltutmish.',
      'The Iqta system was a system of land revenue assignment, not land ownership.'
    ],
    examples: [
      'Iltutmish refused to grant asylum to Jalaluddin Mangbarni (Khwarezm prince fleeing Genghis Khan) to avoid a Mongol invasion — showing diplomatic pragmatism.',
      'Balban\'s spy system (Barid) infiltrated every household of the nobility — no noble could hold a feast without the sultan knowing.'
    ],
    tables: [{
      title: 'Slave Dynasty Rulers — Summary',
      headers: ['Ruler', 'Period', 'Title/Epithet', 'Key Contribution'],
      rows: [
        ['Qutbuddin Aibak', '1206–1210', 'Lakh Bakhsh', 'Started Qutub Minar; Quwwat-ul-Islam mosque'],
        ['Iltutmish', '1211–1236', 'Nasir Amir-ul-Muminin', 'Completed Qutub Minar; silver tanka; Caliph legitimacy'],
        ['Razia Sultana', '1236–1240', 'First female Sultan', 'Broke purdah convention'],
        ['Balban', '1266–1287', 'Zil-i-Ilahi', 'Blood & Iron policy; destroyed Chahalgani']
      ]
    }],
    revisionNotes: '* Aibak = Lakh Bakhsh, started Qutub Minar, polo death.\n* Iltutmish = Completed Qutub Minar, silver tanka, nominated Razia.\n* Razia = First female Sultan, opposed by Chahalgani.\n* Balban = Blood & Iron, Zaminbosi-Paibos, Zil-i-Ilahi.\n* Iqta = Land revenue assignment (not ownership).\n* Qutub Minar = 72.5m, 5 storeys.',
    pyqs: [{
      question: { en: 'Who among the following introduced the silver tanka and copper jital as currency in the Delhi Sultanate?', hi: 'दिल्ली सल्तनत में चांदी का टंका और तांबे का जीतल किसने प्रचलित किया?' },
      options: [
        { en: 'Iltutmish', hi: 'इल्तुतमिश' },
        { en: 'Qutbuddin Aibak', hi: 'कुतुबुद्दीन ऐबक' },
        { en: 'Balban', hi: 'बलबन' },
        { en: 'Alauddin Khalji', hi: 'अलाउद्दीन खिलजी' }
      ],
      answer: 0,
      explanation: { en: 'Iltutmish (1211–1236) introduced the silver tanka (approximately 175 grains) and copper jital, establishing the standard coinage system of the Delhi Sultanate.', hi: 'इल्तुतमिश (1211–1236) ने चांदी का टंका (लगभग 175 ग्रेन) और तांबे का जीतल प्रचलित किया, जिससे दिल्ली सल्तनत की मानक मुद्रा प्रणाली स्थापित हुई।' },
      year: 2021
    }]
  },
  {
    topic: 'Medieval India',
    subtopic: 'Alauddin Khalji — Market Reforms & Military Campaigns',
    introduction: 'Alauddin Khalji (r. 1296–1316) was the most powerful ruler of the Khalji Dynasty and arguably the Delhi Sultanate. He is renowned for his revolutionary market control system, his successful defense against Mongol invasions, and his military conquests that extended Sultanate authority to South India.',
    detailedExplanation: `## Alauddin Khalji\'s Reign\n\n### 1. Market Control System\nAlauddin established a rigorous **price control mechanism** — the first of its kind in medieval India:\n- Created **four separate markets**: Grain market (Mandi), Cloth market (Sarai Adl), Horse/cattle/slave market, and General market.\n- Appointed **Diwan-i-Riyasat** (Controller of Markets) and **Shahna-i-Mandi** (Market Superintendent).\n- Fixed prices for all essential commodities — grain, cloth, horses, cattle.\n- Maintained **Munhiyan (spies)** to report price violations.\n- Punishments for cheating: Cutting flesh from the body equal to the amount of grain hoarded.\n- Purpose: Maintain a large standing army cheaply (soldiers paid low but goods were cheap).\n\n### 2. Military Achievements\n- **Repelled 6 major Mongol invasions** (1299–1308).\n- Generals **Malik Kafur** and **Alp Khan** led campaigns.\n- **South Indian Conquests**: Malik Kafur\'s southern expedition (1309–1311) — conquered Devagiri (Yadavas), Warangal (Kakatiyas), Dwar Samudra (Hoysalas), and Madurai (Pandyas). Brought immense wealth.\n- Built **Alai Darwaza** (gateway to Qutub Minar complex) — finest example of Indo-Islamic architecture.\n- Built **Siri Fort** as the second city of Delhi to defend against Mongols.\n\n### 3. Revenue & Administrative Reforms\n- Imposed **50% land tax (Kharaj)** — highest in Sultanate history.\n- Introduced **Ghari (house tax)** and **Charai (grazing tax)** on Hindus.\n- Created a system of **Dagh (branding horses)** and **Chehra (descriptive roll of soldiers)** to prevent fraud.\n- Prohibited nobility from intermarriage, feasts, and conspiracy.`,
    concepts: ['Market Control System', 'Mongol Defense Strategy', 'Revenue Maximization', 'South Indian Expansion'],
    importantFacts: [
      'Alauddin Khalji established four regulated markets with fixed prices — the first systematic price control in Indian history.',
      'Diwan-i-Riyasat and Shahna-i-Mandi were officers of market regulation.',
      'Malik Kafur\'s southern expedition (1309–1311) conquered Devagiri, Warangal, Dwar Samudra, and Madurai.',
      'Alauddin imposed 50% Kharaj (land tax) — the highest in Delhi Sultanate history.',
      'Dagh (horse branding) and Chehra (soldier descriptive roll) prevented military fraud.',
      'He successfully repelled 6 major Mongol invasions between 1299 and 1308.'
    ],
    examples: [
      'Alauddin\'s grain price was fixed at 7 jitals per maund — merchants who overcharged had flesh cut equal to the excess grain.',
      'Malik Kafur brought back the famous Koh-i-Noor diamond from the Kakatiya treasury at Warangal (debated).'
    ],
    tables: [{
      title: 'Alauddin\'s Market Control System',
      headers: ['Market Type', 'Controller', 'Key Commodities', 'Enforcement'],
      rows: [
        ['Grain Market (Mandi)', 'Shahna-i-Mandi', 'Wheat, barley, rice, pulses', 'Fixed prices; spies (Munhiyan)'],
        ['Cloth Market (Sarai Adl)', 'Diwan-i-Riyasat', 'Textiles, silk, cotton', 'Quality checks; no overpricing'],
        ['Horse/Cattle/Slave Market', 'Special controllers', 'War horses, cattle, slaves', 'Dagh system for horses'],
        ['General Market', 'Various', 'Fruits, sugar, oil, daily goods', 'Spot checks by inspectors']
      ]
    }],
    revisionNotes: '* 4 markets: Grain, Cloth (Sarai Adl), Horse/Slave, General.\n* Diwan-i-Riyasat = Controller of Markets.\n* Shahna-i-Mandi = Market Superintendent.\n* Munhiyan = Market spies.\n* 50% Kharaj + Ghari + Charai.\n* Dagh = horse branding. Chehra = soldier roll.\n* Malik Kafur = South India expedition (1309–11).\n* Alai Darwaza = finest Indo-Islamic gateway.',
    pyqs: [{
      question: { en: 'Alauddin Khalji\'s system of "Dagh" and "Chehra" was related to:', hi: 'अलाउद्दीन खिलजी की "दाग" और "चेहरा" प्रणाली किससे संबंधित थी?' },
      options: [
        { en: 'Military administration', hi: 'सैन्य प्रशासन' },
        { en: 'Market regulation', hi: 'बाजार विनियमन' },
        { en: 'Revenue collection', hi: 'राजस्व संग्रह' },
        { en: 'Judicial system', hi: 'न्यायिक प्रणाली' }
      ],
      answer: 0,
      explanation: { en: 'Dagh (branding of horses) and Chehra (descriptive roll of soldiers) were military reforms introduced by Alauddin Khalji to prevent fraud such as presenting the same horse for multiple musters or hiring substitutes.', hi: 'दाग (घोड़ों पर दागना) और चेहरा (सैनिकों का विवरणात्मक रजिस्टर) अलाउद्दीन खिलजी द्वारा शुरू किए गए सैन्य सुधार थे ताकि एक ही घोड़े को कई बार प्रस्तुत करने या विकल्प भर्ती करने जैसी धोखाधड़ी को रोका जा सके।' },
      year: 2018
    }]
  },
  {
    topic: 'Medieval India',
    subtopic: 'Mughal Empire — Akbar\'s Administration & Din-i-Ilahi',
    introduction: 'Akbar (r. 1556–1605) is widely regarded as the greatest Mughal emperor. His administrative genius — including the Mansabdari system, revenue reforms under Todar Mal, and policy of Sulh-i-Kul (universal peace) — built a stable multi-religious empire that lasted two centuries.',
    detailedExplanation: `## Akbar\'s Administration\n\n### 1. Mansabdari System\n- Every official held a **mansab (rank)** with two designations:\n  - **Zat**: Personal rank/status\n  - **Sawar**: Number of horsemen the mansabdar was expected to maintain\n- Ranks ranged from 10 to 10,000 (later 12,000). Ranks above 5,000 reserved for princes.\n- Mansabs were **not hereditary** — appointed and removed by the emperor.\n- Payment: Through **jagir** (revenue assignment from a territory) or **naqdi** (cash).\n\n### 2. Revenue System — Todar Mal\'s Zabti/Dahsala\n- **Raja Todar Mal** implemented the **Zabti/Dahsala system** (1580):\n  - Land measured using the **Jarib (measuring chain)**.\n  - Revenue fixed based on **average production of last 10 years (Dahsala = 10-year average)**.\n  - Land classified into 4 categories: **Polaj** (cultivated every year), **Parauti** (fallow 1-2 years), **Chachar** (fallow 3-4 years), **Banjar** (fallow 5+ years).\n  - Revenue was **1/3 of average produce**, payable in cash.\n- Previously used **Karoris** (revenue collectors managing 1 crore dams each).\n\n### 3. Religious Policy\n- **Sulh-i-Kul** (Universal Peace/Tolerance): Respected all religions.\n- **Ibadat Khana** (House of Worship) at Fatehpur Sikri: Hosted debates among Hindus, Muslims, Christians, Jains, Zoroastrians.\n- **Din-i-Ilahi** (1582): A syncretic faith combining elements from multiple religions. Only 18 Hindus joined; most notable was **Birbal**. Not a forced state religion.\n- **Abolished Jizya** (1564) and **pilgrim tax** on Hindus.\n- **Mahzar/Infallibility Decree** (1579): Gave Akbar authority to settle religious disputes.\n\n### 4. Navaratnas (Nine Gems)\nAbul Fazl (historian), Faizi (poet), Tansen (musician), Birbal (wit), Raja Todar Mal (finance), Raja Man Singh (general), Abdul Rahim Khan-i-Khana (poet), Fakir Aziao-Din, Mullah Do-Piaza.`,
    concepts: ['Mansabdari System', 'Zabti/Dahsala Revenue', 'Sulh-i-Kul', 'Din-i-Ilahi'],
    importantFacts: [
      'The Mansabdari system used Zat (personal rank) and Sawar (cavalry obligation) designations.',
      'Todar Mal\'s Dahsala system fixed revenue based on 10-year average production.',
      'Land was classified as Polaj, Parauti, Chachar, and Banjar based on fertility/fallow period.',
      'Akbar abolished Jizya in 1564 and pilgrim tax on Hindus.',
      'Din-i-Ilahi (1582) was a syncretic faith — only Birbal was the notable Hindu convert.',
      'The Ibadat Khana at Fatehpur Sikri hosted inter-religious debates from 1575.',
      'Akbar\'s reign is recorded in Abul Fazl\'s Ain-i-Akbari and Akbarnama.'
    ],
    examples: [
      'Akbar married Rajput princess Jodha Bai (Mariam-uz-Zamani) from Amber — integrating Rajput rulers as Mansabdars without religious conversion.',
      'The Mahzar (1579) was signed by ulemas giving Akbar the authority to interpret Islamic law — effectively making him supreme in religious matters too.'
    ],
    tables: [{
      title: 'Todar Mal\'s Land Classification',
      headers: ['Category', 'Hindi Name', 'Definition', 'Revenue Implication'],
      rows: [
        ['Cultivated annually', 'Polaj', 'Land cultivated every season', 'Highest revenue rate'],
        ['Short fallow', 'Parauti', 'Left fallow for 1-2 years', 'Moderate rate'],
        ['Medium fallow', 'Chachar', 'Fallow for 3-4 years', 'Lower rate'],
        ['Long fallow', 'Banjar', 'Fallow for 5+ years', 'Minimal/no revenue']
      ]
    }],
    revisionNotes: '* Mansab = Zat (personal) + Sawar (cavalry). Not hereditary.\n* Dahsala = 10-year average; Zabti = measurement system.\n* Land: Polaj > Parauti > Chachar > Banjar.\n* Revenue = 1/3 of average produce in cash.\n* Sulh-i-Kul = Universal peace. Jizya abolished 1564.\n* Din-i-Ilahi (1582) = syncretic; only Birbal joined.\n* Navaratnas: Abul Fazl, Tansen, Birbal, Todar Mal, Man Singh.',
    pyqs: [{
      question: { en: 'Akbar\'s land revenue system "Dahsala" was based on:', hi: 'अकबर की भू-राजस्व प्रणाली "दहसाला" किस पर आधारित थी?' },
      options: [
        { en: 'Average produce of the last 10 years', hi: 'पिछले 10 वर्षों की औसत उपज' },
        { en: 'One-sixth of the current year\'s produce', hi: 'चालू वर्ष की उपज का छठा भाग' },
        { en: 'Fixed amount per bigha of land', hi: 'प्रति बीघा भूमि की निश्चित राशि' },
        { en: 'Auction of land to highest bidder', hi: 'सबसे अधिक बोली लगाने वाले को भूमि की नीलामी' }
      ],
      answer: 0,
      explanation: { en: 'The Dahsala system, implemented by Raja Todar Mal in 1580, fixed land revenue based on the average produce of the last 10 years, ensuring fair and predictable taxation.', hi: 'दहसाला प्रणाली, जो 1580 में राजा टोडर मल द्वारा लागू की गई, पिछले 10 वर्षों की औसत उपज के आधार पर भू-राजस्व निर्धारित करती थी, जिससे उचित और पूर्वानुमानित कराधान सुनिश्चित होता था।' },
      year: 2019
    }]
  },
  {
    topic: 'Medieval India',
    subtopic: 'Bhakti Movement — Major Saints & Philosophy',
    introduction: 'The Bhakti Movement (7th–17th century) was a revolutionary devotional movement that emphasized a direct personal relationship with God, bypassing caste hierarchies and priestly intermediaries. Originating in South India with the Alvars and Nayanars, it spread northward through saints like Kabir, Nanak, Tulsidas, and Mirabai.',
    detailedExplanation: `## The Bhakti Movement\n\n### 1. South Indian Origins\n- **Alvars** (12 Vaishnava saints): Composed devotional hymns in Tamil collected in the **Divya Prabandham** (Nalayira Divya Prabandham — 4000 verses). Key Alvars: Andal (only female Alvar), Nammalvar, Periyalvar.\n- **Nayanars** (63 Shaiva saints): Composed the **Tevaram** and **Tiruvachakam**. Key Nayanars: Appar, Sundarar, Sambandar, Manikkavachagar.\n- **Shankaracharya (8th century)**: Advaita (Non-dualism) — Brahman alone is real, world is Maya.\n- **Ramanujacharya (11th century)**: Vishishtadvaita (Qualified Non-dualism) — Brahman is real AND the world is real.\n- **Madhvacharya (13th century)**: Dvaita (Dualism) — God and soul are distinct.\n\n### 2. North Indian Bhakti Saints\n- **Kabir (1440–1518)**: Weaver-saint of Varanasi. Rejected both Hindu and Muslim rituals. Composed **dohas/sakhis** in Sadhukkadi (mixed language). His verses are in the **Bijak** and **Guru Granth Sahib**.\n- **Guru Nanak (1469–1539)**: Founder of Sikhism. Stressed **Naam Japna** (meditation), **Kirat Karo** (honest work), **Vand Chhako** (sharing). Composed **Japji Sahib**.\n- **Tulsidas (1532–1623)**: Wrote **Ramcharitmanas** in Awadhi (Hindi retelling of Ramayana).\n- **Mirabai (1498–1547)**: Rajput princess devoted to Krishna. Composed padavali (devotional songs).\n- **Surdas (1478–1583)**: Blind poet of Agra. **Sur Sagar** — 100,000 poems on Krishna\'s childhood (Vatsalya rasa).\n- **Chaitanya Mahaprabhu (1486–1534)**: Bengali Vaishnavite. Popularized **Sankirtan** (collective chanting). Founded the **Gaudiya Vaishnavism** tradition.`,
    concepts: ['Bhakti as Social Reform', 'Saguna vs Nirguna Bhakti', 'Vernacular Literature Movement', 'Anti-Caste Devotionalism'],
    importantFacts: [
      'The Alvars (12 Vaishnava saints) composed the Nalayira Divya Prabandham — 4000 verses in Tamil.',
      'Kabir rejected both Hindu and Muslim rituals and composed in Sadhukkadi language.',
      'Guru Nanak founded Sikhism with three core principles: Naam Japna, Kirat Karo, Vand Chhako.',
      'Tulsidas wrote Ramcharitmanas in Awadhi — the most popular Hindi retelling of the Ramayana.',
      'Chaitanya Mahaprabhu popularized Sankirtan (collective chanting) in Bengal.',
      'Shankaracharya = Advaita. Ramanuja = Vishishtadvaita. Madhva = Dvaita.'
    ],
    examples: [
      'Kabir\'s famous doha: "Pothi padh padh jag mua, pandit bhayo na koi / Dhai akshar prem ka, padhe so pandit hoi" — emphasizing love over bookish knowledge.',
      'Mirabai defied Rajput royal customs by singing and dancing publicly in devotion to Krishna — symbolizing Bhakti\'s challenge to social norms.'
    ],
    tables: [{
      title: 'Major Bhakti Saints — Comparison',
      headers: ['Saint', 'Period', 'Region', 'Deity/Focus', 'Major Work'],
      rows: [
        ['Kabir', '1440–1518', 'Varanasi', 'Nirguna (formless God)', 'Bijak, Sakhis'],
        ['Guru Nanak', '1469–1539', 'Punjab', 'Nirguna (Ek Onkar)', 'Japji Sahib'],
        ['Tulsidas', '1532–1623', 'Varanasi', 'Saguna (Rama)', 'Ramcharitmanas'],
        ['Mirabai', '1498–1547', 'Rajasthan', 'Saguna (Krishna)', 'Padavali'],
        ['Surdas', '1478–1583', 'Agra/Braj', 'Saguna (Krishna)', 'Sur Sagar'],
        ['Chaitanya', '1486–1534', 'Bengal', 'Saguna (Krishna)', 'Sankirtan tradition']
      ]
    }],
    revisionNotes: '* Alvars = 12 Vaishnava saints, Divya Prabandham. Andal = only female Alvar.\n* Nayanars = 63 Shaiva saints, Tevaram.\n* Shankara = Advaita. Ramanuja = Vishishtadvaita. Madhva = Dvaita.\n* Kabir = Nirguna, Bijak, dohas.\n* Nanak = Sikhism, Naam Japna/Kirat Karo/Vand Chhako.\n* Tulsidas = Ramcharitmanas (Awadhi).\n* Chaitanya = Sankirtan, Gaudiya Vaishnavism.',
    pyqs: [{
      question: { en: 'The concept of Vishishtadvaita (Qualified Non-dualism) was propounded by:', hi: 'विशिष्टाद्वैत (सविशेष अद्वैत) की अवधारणा किसने प्रतिपादित की?' },
      options: [
        { en: 'Ramanujacharya', hi: 'रामानुजाचार्य' },
        { en: 'Shankaracharya', hi: 'शंकराचार्य' },
        { en: 'Madhvacharya', hi: 'मध्वाचार्य' },
        { en: 'Nimbarkacharya', hi: 'निम्बार्काचार्य' }
      ],
      answer: 0,
      explanation: { en: 'Ramanujacharya (11th century) propounded Vishishtadvaita — the philosophy that Brahman is real and the world/individual souls are also real but dependent on Brahman.', hi: 'रामानुजाचार्य (11वीं शताब्दी) ने विशिष्टाद्वैत प्रतिपादित किया — वह दर्शन कि ब्रह्म सत्य है और जगत/व्यक्तिगत आत्माएं भी सत्य हैं लेकिन ब्रह्म पर निर्भर हैं।' },
      year: 2020
    }]
  }
];

// ═══════════════════════════════════════════════════════════════════
// MODERN INDIA — MICRO CONCEPTS
// ═══════════════════════════════════════════════════════════════════
const modernIndiaMicro = [
  {
    topic: 'Modern India',
    subtopic: 'Revolt of 1857 — Causes, Leaders & Aftermath',
    introduction: 'The Revolt of 1857 (also called the First War of Independence, Sepoy Mutiny, or Great Rebellion) was the first large-scale armed uprising against British rule. Triggered by the introduction of the Enfield rifle cartridges greased with animal fat, it had deep political, economic, social, and military roots.',
    detailedExplanation: `## The Revolt of 1857\n\n### 1. Causes\n**Political**: Doctrine of Lapse (Dalhousie), annexation of Awadh (1856), disrespect to Mughal Emperor.\n**Economic**: Drain of wealth, destruction of handicrafts, exploitative revenue policies, ruin of zamindars.\n**Military**: Indian soldiers (sepoys) were discriminated — lower pay, no promotion, overseas service (crossing the sea violated caste).\n**Social/Religious**: Reforms seen as attacks on religion — Sati abolition, widow remarriage, English education.\n**Immediate cause**: Introduction of **Enfield rifles** with cartridges greased with cow and pig fat — offensive to both Hindus and Muslims.\n\n### 2. Key Leaders & Centers\n- **Mangal Pandey**: First martyr. Shot British officers at Barrackpore on March 29, 1857. Hanged on April 8, 1857.\n- **Meerut**: Revolt started on **May 10, 1857**. Sepoys marched to Delhi.\n- **Delhi**: **Bahadur Shah Zafar II** declared titular emperor by rebels. Real command under **General Bakht Khan**.\n- **Kanpur**: Led by **Nana Sahib** (adopted son of Peshwa Baji Rao II). His general was **Tantia Tope**.\n- **Lucknow (Awadh)**: Led by **Begum Hazrat Mahal** in the name of her minor son Birjis Qadr.\n- **Jhansi**: Led by **Rani Lakshmibai**. Fought alongside Tantia Tope. Died in battle at Gwalior (June 17, 1858).\n- **Bihar**: Led by **Kunwar Singh** of Jagdishpur — an 80-year-old zamindar.\n\n### 3. Suppression & Aftermath\n- Revolt suppressed by mid-1858. Delhi recaptured by **John Nicholson** (September 1857).\n- **Government of India Act 1858**: East India Company abolished. Crown took direct control.\n- **Queen Victoria\'s Proclamation** (November 1858): Promised religious tolerance, no annexation by lapse, equal treatment.\n- Indian Councils Act 1861 introduced limited Indian representation.\n- The **Indian Army was reorganized** — increased British:Indian ratio, artillery kept exclusively with British.`,
    concepts: ['First War of Independence', 'Doctrine of Lapse', 'Queen Victoria\'s Proclamation', 'Army Reorganization'],
    importantFacts: [
      'Mangal Pandey was the first martyr of 1857 — attacked British officers at Barrackpore on March 29, 1857.',
      'The revolt formally began at Meerut on May 10, 1857, when sepoys marched to Delhi.',
      'Bahadur Shah Zafar II was declared the nominal leader by the rebels at Delhi.',
      'Rani Lakshmibai of Jhansi died fighting at Gwalior on June 17, 1858.',
      'The Government of India Act 1858 ended Company rule and established direct Crown rule.',
      'Kunwar Singh of Jagdishpur (Bihar) was the oldest leader of the revolt at nearly 80 years.',
      'Queen Victoria\'s Proclamation of 1858 promised no further annexation and religious neutrality.'
    ],
    examples: [
      'Bahadur Shah Zafar was exiled to Rangoon (Myanmar) after the revolt where he died in 1862 — his poetry from exile reflects the pathos of the last Mughal.',
      'Tantia Tope was betrayed by Man Singh (a feudal chief) and executed by the British in 1859.'
    ],
    tables: [{
      title: 'Revolt of 1857 — Key Centers & Leaders',
      headers: ['Center', 'Leader', 'British Commander Against', 'Outcome'],
      rows: [
        ['Delhi', 'Bahadur Shah Zafar / Bakht Khan', 'John Nicholson', 'Recaptured Sept 1857; Zafar exiled'],
        ['Kanpur', 'Nana Sahib / Tantia Tope', 'Colin Campbell', 'Recaptured Dec 1857; Nana fled'],
        ['Lucknow', 'Begum Hazrat Mahal', 'Colin Campbell', 'Recaptured March 1858; Begum fled to Nepal'],
        ['Jhansi', 'Rani Lakshmibai', 'Hugh Rose', 'Fell March 1858; Rani died at Gwalior'],
        ['Bihar', 'Kunwar Singh', 'William Taylor', 'Kunwar Singh died April 1858']
      ]
    }],
    revisionNotes: '* Immediate cause = Enfield rifle cartridges (cow+pig fat).\n* Started: Meerut, May 10, 1857.\n* Mangal Pandey = first martyr (Barrackpore, March 29).\n* Leaders: Zafar (Delhi), Nana Sahib (Kanpur), Begum Hazrat Mahal (Lucknow), Lakshmibai (Jhansi), Kunwar Singh (Bihar).\n* 1858 Act = Company abolished, Crown rule.\n* Victoria\'s Proclamation = religious neutrality + no more Lapse.',
    pyqs: [{
      question: { en: 'Which of the following was NOT a center of the 1857 Revolt?', hi: '1857 के विद्रोह का केंद्र निम्नलिखित में से कौन नहीं था?' },
      options: [
        { en: 'Madras', hi: 'मद्रास' },
        { en: 'Kanpur', hi: 'कानपुर' },
        { en: 'Lucknow', hi: 'लखनऊ' },
        { en: 'Jhansi', hi: 'झांसी' }
      ],
      answer: 0,
      explanation: { en: 'The Revolt of 1857 was mainly confined to northern and central India. Madras (Chennai), Bombay, and Bengal remained largely unaffected due to different military compositions and political dynamics.', hi: '1857 का विद्रोह मुख्य रूप से उत्तर और मध्य भारत तक सीमित था। मद्रास (चेन्नई), बंबई और बंगाल अलग-अलग सैन्य संरचना और राजनीतिक गतिशीलता के कारण काफी हद तक अप्रभावित रहे।' },
      year: 2021
    }]
  },
  {
    topic: 'Modern India',
    subtopic: 'Indian National Congress — Moderates, Extremists & the Split',
    introduction: 'The Indian National Congress (INC), founded in 1885 by A.O. Hume, became the primary vehicle for India\'s freedom struggle. Its early history was defined by the ideological clash between Moderates (who favored constitutional agitation) and Extremists (who demanded direct action and Swaraj).',
    detailedExplanation: `## Congress: Moderates vs Extremists\n\n### 1. Foundation & Early Phase (1885–1905)\n- Founded by **Allan Octavian Hume** (retired British ICS officer) on **December 28, 1885** in Bombay.\n- First President: **W.C. Bonnerjee** (Womesh Chandra Bonnerjee).\n- **Safety Valve Theory**: Hume wanted to channel Indian frustration through constitutional means to prevent a revolution.\n\n### 2. Moderates (1885–1905)\n- **Leaders**: Dadabhai Naoroji, Gopal Krishna Gokhale, Pherozeshah Mehta, Surendranath Banerjee, M.G. Ranade.\n- **Methods**: Petitions, prayers, memorials to the British government. "Political mendicancy" (begging politics).\n- **Key Contributions**:\n  - Dadabhai Naoroji\'s **"Drain of Wealth" theory** — calculated that £200–300 million was drained annually from India.\n  - Gokhale founded the **Servants of India Society** (1905).\n  - R.C. Dutt wrote *Economic History of India* proving economic exploitation.\n\n### 3. Extremists (1905–1919)\n- **Leaders**: Bal Gangadhar Tilak, Bipin Chandra Pal, Lala Lajpat Rai (**"Lal-Bal-Pal"**).\n- **Methods**: Boycott, swadeshi, national education, passive resistance.\n- **Tilak\'s famous quote**: "Swaraj is my birthright, and I shall have it!"\n- Tilak organized **Ganapati** and **Shivaji festivals** to mobilize masses.\n- Published **Kesari** (Marathi) and **Mahratta** (English) newspapers.\n\n### 4. Surat Split (1907)\n- Congress split at the **Surat Session (1907)** over the presidency of Rashbehari Ghosh.\n- Extremists wanted complete independence; Moderates wanted dominion status.\n- Tilak was arrested and imprisoned (1908–1914) in Mandalay, Burma.\n- Reunited at the **Lucknow Pact (1916)** — Congress-Muslim League alliance.`,
    concepts: ['Drain of Wealth Theory', 'Safety Valve Theory', 'Swaraj Ideology', 'Congress Unification'],
    importantFacts: [
      'INC was founded on December 28, 1885 in Bombay by A.O. Hume; first president was W.C. Bonnerjee.',
      'Dadabhai Naoroji\'s Drain of Wealth theory estimated £200-300 million was drained from India annually.',
      'Bal Gangadhar Tilak\'s famous slogan: "Swaraj is my birthright, and I shall have it!"',
      'The Surat Split (1907) divided Congress into Moderates and Extremists.',
      'The Lucknow Pact (1916) reunited Congress and forged an alliance with the Muslim League.',
      'Tilak was called "Lokmanya" (accepted by the people) and was imprisoned at Mandalay (1908–1914).'
    ],
    examples: [
      'Dadabhai Naoroji, called the "Grand Old Man of India", was elected to the British Parliament from Central Finsbury in 1892 — the first Indian/Asian to serve in the House of Commons.',
      'The Swadeshi Movement (1905-1908) following the Partition of Bengal was the first mass movement led by Extremists — involving boycott of British goods and promotion of indigenous products.'
    ],
    tables: [{
      title: 'Moderates vs Extremists — Comparison',
      headers: ['Feature', 'Moderates', 'Extremists'],
      rows: [
        ['Period', '1885–1905', '1905–1919'],
        ['Leaders', 'Naoroji, Gokhale, Mehta', 'Tilak, Pal, Lajpat Rai'],
        ['Methods', 'Petitions, prayers, resolutions', 'Boycott, swadeshi, passive resistance'],
        ['Goal', 'Dominion status/self-governance', 'Complete Swaraj/independence'],
        ['Base', 'Educated elite', 'Masses and students'],
        ['View of British', 'Just but uninformed', 'Exploitative and unjust']
      ]
    }],
    revisionNotes: '* INC = Dec 28, 1885, Bombay, A.O. Hume. 1st Pres = W.C. Bonnerjee.\n* Moderates: Naoroji (Drain theory), Gokhale (Servants of India).\n* Extremists: Tilak ("Swaraj is my birthright"), Pal, Lajpat Rai.\n* Surat Split = 1907. Lucknow Pact = 1916 (reunion + ML alliance).\n* Safety Valve Theory = Hume\'s motive to prevent revolution.',
    pyqs: [{
      question: { en: 'The Drain of Wealth theory was propounded by:', hi: 'धन निकासी सिद्धांत किसने प्रतिपादित किया?' },
      options: [
        { en: 'Dadabhai Naoroji', hi: 'दादाभाई नौरोजी' },
        { en: 'R.C. Dutt', hi: 'आर.सी. दत्त' },
        { en: 'Gopal Krishna Gokhale', hi: 'गोपाल कृष्ण गोखले' },
        { en: 'Mahatma Gandhi', hi: 'महात्मा गांधी' }
      ],
      answer: 0,
      explanation: { en: 'Dadabhai Naoroji, known as the "Grand Old Man of India", propounded the Drain of Wealth theory in his book "Poverty and Un-British Rule in India" (1901), calculating that Britain drained £200-300 million annually from India.', hi: 'दादाभाई नौरोजी, जिन्हें "भारत के महान वृद्ध" कहा जाता है, ने अपनी पुस्तक "पॉवर्टी एंड अन-ब्रिटिश रूल इन इंडिया" (1901) में धन निकासी सिद्धांत प्रतिपादित किया, यह गणना करते हुए कि ब्रिटेन भारत से वार्षिक £200-300 मिलियन का निकासी करता था।' },
      year: 2022
    }]
  },
  {
    topic: 'Modern India',
    subtopic: 'Mahatma Gandhi — Non-Cooperation to Quit India',
    introduction: 'Mahatma Gandhi (1869–1948) transformed India\'s freedom struggle from an elite movement to a mass revolution through his philosophy of Satyagraha (truth-force), Ahimsa (non-violence), and Swaraj (self-rule). His major movements — Non-Cooperation, Civil Disobedience, and Quit India — mobilized millions of ordinary Indians.',
    detailedExplanation: `## Gandhi\'s Major Movements\n\n### 1. Non-Cooperation Movement (1920–1922)\n- **Launched**: At Nagpur session (December 1920) after failure of Khilafat grievances and Jallianwala Bagh massacre.\n- **Program**: Boycott of titles, legislatures, courts, schools, foreign cloth. Promotion of khadi, swadeshi, national schools.\n- **Khilafat Alliance**: Gandhi supported Muslim demand to restore the Ottoman Caliph\'s authority — first Hindu-Muslim unity in national movement.\n- **Suspended**: After **Chauri Chaura incident** (February 5, 1922) — mob burned 22 police officers. Gandhi called off the movement citing violence.\n\n### 2. Civil Disobedience Movement (1930–1934)\n- **Trigger**: British rejection of the Nehru Report\'s demand for Dominion Status. Congress declared **Purna Swaraj** (Complete Independence) on **January 26, 1930** (Independence Day).\n- **Dandi March**: March 12 – April 6, 1930. Gandhi walked 385 km from Sabarmati Ashram to Dandi (Gujarat) with 78 followers to break the **Salt Law** — making salt from seawater.\n- **Impact**: Mass civil disobedience across India. 80,000+ arrested. Women participated for the first time in large numbers.\n- **Gandhi-Irwin Pact (March 1931)**: Gandhi agreed to attend Round Table Conference; government released political prisoners.\n\n### 3. Quit India Movement (August 8, 1942)\n- **August 8, 1942**: All India Congress Committee (AICC) at Bombay passed the Quit India Resolution.\n- **Gandhi\'s call**: "Do or Die" (Karo ya Maro).\n- **Government response**: Arrested all top leaders immediately — Gandhi, Nehru, Patel, Azad jailed.\n- **Leaderless movement**: Spontaneous underground resistance led by **Aruna Asaf Ali**, **Ram Manohar Lohia**, **Jayaprakash Narayan**.\n- **Parallel Governments**: Set up in Satara (Maharashtra), Ballia (UP), Midnapore (Bengal).\n- Suppressed by 1944 but demonstrated that British rule was untenable.`,
    concepts: ['Satyagraha Philosophy', 'Hindu-Muslim Unity', 'Salt Satyagraha', 'Do or Die Movement'],
    importantFacts: [
      'Non-Cooperation was suspended after the Chauri Chaura incident (Feb 5, 1922) where 22 police officers were killed.',
      'Purna Swaraj (Complete Independence) was declared on January 26, 1930 — later adopted as Republic Day.',
      'Gandhi\'s Dandi March (March 12 – April 6, 1930) covered 385 km with 78 followers.',
      'The Gandhi-Irwin Pact (1931) was the first agreement between the Indian National Congress and the British government as equals.',
      'Quit India Movement (August 8, 1942) — "Do or Die" call. All leaders arrested immediately.',
      'Aruna Asaf Ali hoisted the Congress flag at the Gowalia Tank Maidan (August Kranti Maidan) in Bombay during Quit India.',
      'Parallel governments were set up at Satara, Ballia, and Midnapore during the Quit India Movement.'
    ],
    examples: [
      'During the Salt March, when Gandhi picked up a lump of natural salt at Dandi on April 6, 1930, he said: "With this, I am shaking the foundations of the British Empire."',
      'The underground radio station "Congress Radio" operated during Quit India — Usha Mehta ran it from Bombay until her arrest.'
    ],
    tables: [{
      title: 'Gandhi\'s Major Movements — Comparison',
      headers: ['Movement', 'Period', 'Trigger', 'Program', 'End/Outcome'],
      rows: [
        ['Non-Cooperation', '1920–1922', 'Jallianwala Bagh + Khilafat', 'Boycott, khadi, swadeshi', 'Suspended: Chauri Chaura (1922)'],
        ['Civil Disobedience', '1930–1934', 'Purna Swaraj resolution', 'Salt March, tax refusal', 'Gandhi-Irwin Pact (1931)'],
        ['Quit India', '1942', 'Failure of Cripps Mission', '"Do or Die", underground resistance', 'Suppressed 1944; showed British exit inevitable']
      ]
    }],
    revisionNotes: '* Non-Cooperation (1920) = Boycott + Khilafat. Chauri Chaura (Feb 5, 1922) = suspended.\n* Purna Swaraj = Jan 26, 1930 (now Republic Day).\n* Dandi March = 385 km, 78 followers, March 12–April 6, 1930.\n* Gandhi-Irwin Pact = 1931.\n* Quit India = Aug 8, 1942. "Do or Die." Aruna Asaf Ali hoisted flag.\n* Parallel govts: Satara, Ballia, Midnapore.\n* Congress Radio = Usha Mehta.',
    pyqs: [{
      question: { en: 'The Quit India Resolution was passed at which session of the Indian National Congress?', hi: 'भारत छोड़ो प्रस्ताव भारतीय राष्ट्रीय कांग्रेस के किस अधिवेशन में पारित हुआ?' },
      options: [
        { en: 'Bombay Session, 1942', hi: 'बंबई अधिवेशन, 1942' },
        { en: 'Lahore Session, 1929', hi: 'लाहौर अधिवेशन, 1929' },
        { en: 'Tripuri Session, 1939', hi: 'त्रिपुरी अधिवेशन, 1939' },
        { en: 'Calcutta Session, 1920', hi: 'कलकत्ता अधिवेशन, 1920' }
      ],
      answer: 0,
      explanation: { en: 'The Quit India Resolution was passed by the AICC on August 8, 1942 at the Bombay session (Gowalia Tank Maidan, now August Kranti Maidan).', hi: 'भारत छोड़ो प्रस्ताव 8 अगस्त 1942 को बंबई अधिवेशन (गोवालिया टैंक मैदान, अब अगस्त क्रांति मैदान) में एआईसीसी द्वारा पारित किया गया था।' },
      year: 2019
    }]
  }
];

// ═══════════════════════════════════════════════════════════════════
// WORLD HISTORY — MICRO CONCEPTS
// ═══════════════════════════════════════════════════════════════════
const worldHistoryMicro = [
  {
    topic: 'World History',
    subtopic: 'French Revolution — Causes, Estates & Key Events',
    introduction: 'The French Revolution (1789–1799) was one of the most transformative events in world history. It ended the French monarchy, established republican principles, and introduced concepts of liberty, equality, and fraternity that influenced democratic movements worldwide, including India\'s freedom struggle.',
    detailedExplanation: `## The French Revolution\n\n### 1. Causes\n- **Social**: The Three Estates system — First Estate (Clergy, ~130,000), Second Estate (Nobility, ~350,000), and Third Estate (Bourgeoisie, Workers, Peasants, ~25 million) paid all taxes but had no political power.\n- **Economic**: Financial bankruptcy from wars (Seven Years War, American Revolution support). Bread prices soared. Louis XVI\'s extravagance at Versailles.\n- **Intellectual**: Enlightenment thinkers — **Voltaire** (attacked Church), **Rousseau** (Social Contract — popular sovereignty), **Montesquieu** (separation of powers in *The Spirit of Laws*).\n- **Political**: Absolute monarchy of Louis XVI. No Estates-General convened since 1614.\n\n### 2. Key Events\n- **May 5, 1789**: Estates-General convened at Versailles.\n- **June 17, 1789**: Third Estate declared itself the **National Assembly**.\n- **June 20, 1789**: **Tennis Court Oath** — vowed not to disperse until a constitution was written.\n- **July 14, 1789**: **Storming of the Bastille** — symbolizing the fall of royal tyranny. Now France\'s national day.\n- **August 26, 1789**: **Declaration of the Rights of Man and Citizen** — "Men are born and remain free and equal in rights."\n- **1791**: First French Constitution — constitutional monarchy.\n- **January 21, 1793**: **Louis XVI executed** by guillotine.\n- **1793–1794**: **Reign of Terror** under **Robespierre** and the Jacobins — ~17,000 executed.\n- **1799**: **Napoleon Bonaparte** seized power through a coup (18 Brumaire).`,
    concepts: ['Enlightenment Philosophy', 'Three Estates System', 'Declaration of Rights', 'Reign of Terror'],
    importantFacts: [
      'The Third Estate constituted 97% of France\'s population but bore all tax burdens.',
      'The Storming of the Bastille on July 14, 1789 is France\'s national day.',
      'The Declaration of the Rights of Man (August 26, 1789) proclaimed that "Men are born and remain free and equal in rights."',
      'The Reign of Terror (1793–1794) under Robespierre resulted in approximately 17,000 executions.',
      'Montesquieu\'s "Spirit of Laws" influenced the separation of powers in the US Constitution.',
      'Napoleon seized power in 1799, ending the revolution and beginning the Napoleonic era.'
    ],
    examples: [
      'The Tennis Court Oath demonstrated the revolutionary spirit — deputies of the Third Estate swore to create a constitution even against royal opposition.',
      'Marie Antoinette\'s alleged remark "Let them eat cake" (likely apocryphal) became a symbol of royal disconnect from common suffering.'
    ],
    tables: [{
      title: 'French Revolution — Timeline of Key Events',
      headers: ['Date', 'Event', 'Significance'],
      rows: [
        ['May 5, 1789', 'Estates-General convened', 'First meeting since 1614'],
        ['July 14, 1789', 'Storming of the Bastille', 'Symbolic fall of monarchy'],
        ['August 26, 1789', 'Declaration of Rights', 'Foundation of democratic principles'],
        ['Jan 21, 1793', 'Louis XVI executed', 'End of monarchy'],
        ['1793–1794', 'Reign of Terror', '~17,000 executed under Robespierre'],
        ['Nov 9, 1799', 'Napoleon\'s coup (18 Brumaire)', 'End of revolution; rise of Napoleon']
      ]
    }],
    revisionNotes: '* Three Estates: Clergy + Nobility + Common People.\n* Enlightenment: Voltaire (Church critic), Rousseau (Social Contract), Montesquieu (separation of powers).\n* Bastille = July 14, 1789 (national day).\n* Declaration of Rights = Aug 26, 1789.\n* Reign of Terror = Robespierre, Jacobins.\n* Napoleon\'s coup = 1799 (18 Brumaire).',
    pyqs: [{
      question: { en: 'The concept of "Separation of Powers" that influenced the French Revolution was propounded by:', hi: '"शक्तियों के पृथक्करण" की अवधारणा जिसने फ्रांसीसी क्रांति को प्रभावित किया, किसने प्रतिपादित की?' },
      options: [
        { en: 'Montesquieu', hi: 'मॉन्टेस्क्यू' },
        { en: 'Voltaire', hi: 'वोल्टेयर' },
        { en: 'Rousseau', hi: 'रूसो' },
        { en: 'Diderot', hi: 'डिडरो' }
      ],
      answer: 0,
      explanation: { en: 'Montesquieu proposed the separation of powers into Legislative, Executive, and Judicial branches in his work "The Spirit of Laws" (1748), which profoundly influenced both the French and American revolutions.', hi: 'मॉन्टेस्क्यू ने अपनी कृति "द स्पिरिट ऑफ लॉज" (1748) में शक्तियों को विधायी, कार्यकारी और न्यायिक शाखाओं में विभाजित करने का प्रस्ताव दिया, जिसने फ्रांसीसी और अमेरिकी दोनों क्रांतियों को गहराई से प्रभावित किया।' },
      year: 2020
    }]
  },
  {
    topic: 'World History',
    subtopic: 'Industrial Revolution — Britain, Technology & Social Impact',
    introduction: 'The Industrial Revolution (c. 1760–1840) began in Britain and transformed human society from agrarian to industrial. New inventions in textiles, steam power, iron smelting, and transportation created factory systems, urbanization, and the modern capitalist economy, while also generating new forms of labor exploitation.',
    detailedExplanation: `## The Industrial Revolution\n\n### 1. Why Britain First?\n- **Agricultural Revolution**: Enclosure Movement freed labor from farms. Crop rotation (Jethro Tull\'s seed drill) increased food production.\n- **Capital**: Colonial profits (from India, Americas) provided investment capital.\n- **Resources**: Abundant coal and iron deposits.\n- **Geography**: Island nation with natural harbors, navigable rivers, and canals.\n- **Political stability**: Constitutional monarchy, rule of law, patent system protecting inventions.\n\n### 2. Key Inventions\n- **Textile Industry**: John Kay\'s Flying Shuttle (1733), James Hargreaves\' Spinning Jenny (1764), Richard Arkwright\'s Water Frame (1769), Edmund Cartwright\'s Power Loom (1785).\n- **Steam Power**: James Watt\'s improved **steam engine** (1769) — the defining technology. Applied to factories, mines, and later railways.\n- **Iron & Steel**: Abraham Darby\'s coke smelting. Henry Bessemer\'s converter (1856) made cheap steel possible.\n- **Transportation**: George Stephenson\'s **Rocket** (1829) — first practical railway locomotive. First railway: Stockton to Darlington (1825).\n\n### 3. Social Impact\n- **Urbanization**: Migration from villages to factory towns (Manchester, Birmingham, Leeds). Slums, overcrowding, pollution.\n- **Factory System**: 14–16 hour workdays. Child labor in mines and factories.\n- **Class Division**: Rise of industrial bourgeoisie (factory owners) and proletariat (workers).\n- **Trade Unionism**: Workers organized for better wages and conditions.\n- **Marxism**: Karl Marx and Friedrich Engels wrote *The Communist Manifesto* (1848), analyzing class struggle and predicting proletarian revolution.`,
    concepts: ['Factory System', 'Steam Power Revolution', 'Enclosure Movement', 'Proletariat vs Bourgeoisie'],
    importantFacts: [
      'James Watt\'s improved steam engine (1769) was the defining technology of the Industrial Revolution.',
      'The first railway line was Stockton to Darlington (1825) in England.',
      'The Enclosure Movement drove peasants off common lands, creating a pool of factory workers.',
      'Karl Marx and Engels published The Communist Manifesto in 1848, analyzing industrial capitalism.',
      'Britain\'s colonial profits from India and the Americas provided the capital for industrialization.',
      'The Factory Act of 1833 was the first law limiting child labor in British factories.'
    ],
    examples: [
      'Manchester, called "Cottonopolis," grew from 25,000 people in 1772 to over 300,000 by 1850 — a 12-fold increase driven by cotton mills.',
      'The Luddite Movement (1811–1816) saw workers smashing machines they believed were destroying their livelihoods — an early form of labor protest.'
    ],
    tables: [{
      title: 'Key Inventions of the Industrial Revolution',
      headers: ['Invention', 'Inventor', 'Year', 'Impact'],
      rows: [
        ['Spinning Jenny', 'James Hargreaves', '1764', 'Multiplied thread production'],
        ['Water Frame', 'Richard Arkwright', '1769', 'Factory-based spinning'],
        ['Steam Engine (improved)', 'James Watt', '1769', 'Powered factories, mines, railways'],
        ['Power Loom', 'Edmund Cartwright', '1785', 'Mechanized weaving'],
        ['Railway Locomotive', 'George Stephenson', '1825/1829', 'Revolutionized transport']
      ]
    }],
    revisionNotes: '* Britain first: Coal, iron, colonies, political stability, Enclosure Movement.\n* Steam engine = James Watt (1769).\n* First railway = Stockton-Darlington (1825). Rocket = Stephenson (1829).\n* Social: Urbanization, child labor, class division.\n* Marx + Engels = Communist Manifesto (1848).\n* Factory Act 1833 = first child labor law.',
    pyqs: [{
      question: { en: 'The first successful railway line in the world was opened between:', hi: 'विश्व में पहली सफल रेलवे लाइन किनके बीच शुरू की गई?' },
      options: [
        { en: 'Stockton and Darlington', hi: 'स्टॉकटन और डार्लिंगटन' },
        { en: 'Manchester and Liverpool', hi: 'मैनचेस्टर और लिवरपूल' },
        { en: 'London and Birmingham', hi: 'लंदन और बर्मिंघम' },
        { en: 'Paris and Versailles', hi: 'पेरिस और वर्साय' }
      ],
      answer: 0,
      explanation: { en: 'The Stockton and Darlington Railway, opened on September 27, 1825, was the world\'s first public railway to use steam locomotives for both freight and passenger service.', hi: 'स्टॉकटन और डार्लिंगटन रेलवे, 27 सितंबर 1825 को शुरू, विश्व की पहली सार्वजनिक रेलवे थी जिसने माल और यात्री सेवा दोनों के लिए भाप इंजनों का उपयोग किया।' },
      year: 2019
    }]
  }
];


// ═══════════════════════════════════════════════════════════════════
// SEEDER FUNCTION
// ═══════════════════════════════════════════════════════════════════
async function seed() {
  console.log(`\n${'═'.repeat(60)}`);
  console.log('  UPSC HISTORY — MICRO CONCEPT EXPANSION SEEDER');
  console.log(`${'═'.repeat(60)}\n`);
  console.log(`🔌 Connecting to: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected.\n');

  const allMicro = [
    ...ancientIndiaMicro,
    ...medievalIndiaMicro,
    ...modernIndiaMicro,
    ...worldHistoryMicro
  ];

  console.log(`📚 Total micro-concepts to seed: ${allMicro.length}`);

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of allMicro) {
    try {
      const exists = await LearningContent.findOne({
        exam: EXAM,
        subject: SUBJECT,
        topic: item.topic,
        subtopic: item.subtopic
      });

      if (exists) {
        skipped++;
        continue;
      }

      await LearningContent.create({
        exam: EXAM,
        subject: SUBJECT,
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
      if (inserted % 5 === 0) {
        console.log(`  ✅ Inserted ${inserted} micro-concepts...`);
      }
    } catch (err) {
      failed++;
      console.error(`  ❌ Failed: ${item.subtopic} — ${err.message}`);
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📊 SEEDING COMPLETE`);
  console.log(`  ✅ Inserted: ${inserted}`);
  console.log(`  ⏭️ Skipped (existing): ${skipped}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`${'═'.repeat(60)}\n`);

  await mongoose.disconnect();
  console.log('🔌 Disconnected.');
}

seed().catch(console.error);
