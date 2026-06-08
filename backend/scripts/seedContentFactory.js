/**
 * NirnayPath 3.0 — Content Factory Engine
 * Phase 2: Bulk seed LearningContent for all 7 exam tracks
 * Coverage target: ≥30% (213+ subtopics)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// ─── Schema ───────────────────────────────────────────────────────────────────
const learningSchema = new mongoose.Schema({
  exam: String, subject: String, topic: String, subtopic: String,
  notes: String, facts: [String],
  tables: [{ title: String, headers: [String], rows: [[String]] }],
  pyqs: [{ year: String, question: String, options: [String], answer: String, explanation: String }],
  language: { type: String, default: 'English' },
}, { timestamps: true });

const LearningContent = mongoose.models.LearningContent
  || mongoose.model('LearningContent', learningSchema, 'learningcontents');

// ─── Content Library ──────────────────────────────────────────────────────────

const CONTENT = [

  // ══════════════════════════════════════════════════════════════════
  // UPSC — History
  // ══════════════════════════════════════════════════════════════════
  {
    exam: 'UPSC', subject: 'History', topic: 'Ancient India',
    subtopic: 'Indus Valley Civilization — Town Planning & Society',
    notes: `## Indus Valley Civilization — Town Planning & Society

The Indus Valley Civilization (IVC), also known as the Harappan Civilization, flourished around **2600–1900 BCE** in the northwestern regions of South Asia. It is one of the three earliest cradles of civilization alongside Mesopotamia and Egypt.

### Town Planning — Key Features

**Grid Pattern Layout**: Cities like Mohenjo-daro and Harappa followed a strict grid plan with streets intersecting at right angles. This systematic planning indicates strong civic governance.

**Two-Part Division**: Each city was divided into:
- **Citadel (Upper Town)**: Raised platform housing public buildings, granaries, and assembly halls
- **Lower Town**: Residential area for common people

**Great Bath (Mohenjo-daro)**: A magnificent structure (12m × 7m × 2.4m deep) made of kiln-burnt bricks with bitumen waterproofing. Likely used for ritualistic purification. It is the earliest known public water tank.

**Granaries**: Found at both Harappa and Mohenjo-daro. Harappa had granaries near the river for easy loading. These suggest a centralized grain storage and distribution system.

**Drainage System**: The most remarkable feature — an underground covered drainage network with manholes for cleaning. Every house had drains connected to the main sewer system. This was unparalleled in the ancient world.

**Burnt Bricks**: IVC used kiln-burnt bricks of standardized sizes (ratio 1:2:4), unlike sun-dried bricks used in Mesopotamia. Brick-lined wells were found in most houses.

### Social Structure

**No Evidence of Palaces**: Unlike Egypt or Mesopotamia, no clear palace structure has been found, suggesting either a priestly or merchant oligarchy governed the cities.

**Occupational Diversity**: Evidence of traders, craftsmen (pottery, jewelry, bead-making), farmers, and city administrators.

**Gender Roles**: Terracotta figurines suggest worship of a Mother Goddess. Women may have held religious significance.

**Trade Networks**: Seals found in Mesopotamia indicate long-distance trade (Meluhha = IVC in Sumerian records). Traded: cotton, copper, carnelian beads, timber.

### Material Culture

| Item | Significance |
|------|-------------|
| Pashupati Seal | Proto-Shiva figure — horned deity surrounded by animals |
| Dancing Girl | Bronze figurine showing artistic sophistication |
| Unicorn Seal | Most common seal type — ~1,200 found |
| Standardized Weights | Decimal-based system; cuboid chert weights |`,
    facts: [
      'IVC covered ~1.25 million sq km — larger than Egypt and Mesopotamia combined',
      'Mohenjo-daro means "Mound of the Dead" in Sindhi',
      'The Great Bath is the world\'s earliest known public water tank (c. 2500 BCE)',
      'IVC used standardized weights in a 16:1 ratio system (similar to Indian measure still)',
      'Over 1,400 IVC sites discovered; 900+ in India (Gujarat, Haryana, Rajasthan)',
      'Lothal (Gujarat) had the world\'s first known tidal dock',
      'IVC had no evidence of temples or armies — unique among ancient civilizations',
      'Cotton was first cultivated by IVC people around 2500 BCE',
    ],
    tables: [{
      title: 'Major IVC Sites and Their Significance',
      headers: ['Site', 'Location', 'Key Find', 'Discovered By'],
      rows: [
        ['Mohenjo-daro', 'Sindh (Pakistan)', 'Great Bath, Dancing Girl', 'R.D. Banerjee (1922)'],
        ['Harappa', 'Punjab (Pakistan)', 'Granary, Cemetery R-37', 'Dayaram Sahni (1921)'],
        ['Lothal', 'Gujarat, India', 'Dockyard, Rice husk', 'S.R. Rao (1955)'],
        ['Dholavira', 'Gujarat, India', 'Signboard, Water reservoir', 'R.S. Bisht (1990)'],
        ['Kalibangan', 'Rajasthan, India', 'Fire altars, Ploughed field', 'B.B. Lal (1960)'],
        ['Rakhigarhi', 'Haryana, India', 'Largest IVC site in India', 'Archaeological Survey'],
      ]
    }],
    pyqs: [
      {
        year: '2019',
        question: 'Which of the following characterizes the town planning of the Indus Valley Civilization?',
        options: ['Random placement of buildings', 'Grid-iron pattern of streets', 'Circular city layout', 'Absence of drainage systems'],
        answer: 'Grid-iron pattern of streets',
        explanation: 'The Indus Valley cities followed a strict grid-iron pattern with streets running parallel and perpendicular to each other, a hallmark of their sophisticated urban planning.'
      },
      {
        year: '2020',
        question: 'The "Great Bath" found at Mohenjo-daro is believed to have been used for:',
        options: ['Swimming and recreation', 'Ritualistic bathing and purification', 'Industrial cleaning', 'Water storage for the city'],
        answer: 'Ritualistic bathing and purification',
        explanation: 'The Great Bath was likely used for ritual purification, similar to modern sacred tanks. Its elaborate waterproofing and central location in the citadel suggest religious significance.'
      },
      {
        year: '2021',
        question: 'Which Indus Valley Civilization site is known for its ancient tidal dockyard?',
        options: ['Harappa', 'Mohenjo-daro', 'Lothal', 'Dholavira'],
        answer: 'Lothal',
        explanation: 'Lothal in Gujarat had the world\'s first known tidal dockyard, indicating the IVC\'s advanced maritime trade capabilities.'
      }
    ]
  },

  {
    exam: 'UPSC', subject: 'History', topic: 'Ancient India',
    subtopic: 'Mauryan Empire — Chandragupta & Ashoka',
    notes: `## Mauryan Empire — Chandragupta & Ashoka

The Mauryan Empire (322–185 BCE) was the first pan-Indian empire, stretching from the Hindu Kush mountains in the west to Bengal in the east, and from the Himalayas in the north to the Deccan plateau in the south.

### Chandragupta Maurya (322–298 BCE)

**Rise to Power**: Chandragupta overthrew the last Nanda ruler Dhana Nanda with the strategic guidance of **Kautilya (Chanakya)**, the brilliant political theorist and author of **Arthashastra**.

**Conquest of Northwest**: After Alexander's retreat (323 BCE), Chandragupta seized the Indus valley region and pushed back the Greek satrapies.

**Seleucid War (305 BCE)**: Defeated Seleucus Nicator. Treaty gave Chandragupta Afghanistan and Balochistan; Seleucus received 500 war elephants. Megasthenes was sent as Greek ambassador to Pataliputra.

**Megasthenes' Indica**: Described Pataliputra (modern Patna) as a magnificent city 15 km long and 3 km wide, surrounded by wooden walls with 570 towers.

**Kautilya's Arthashastra**: A comprehensive manual on statecraft, economic policy, military strategy, and governance. Describes the **Saptanga theory** (seven elements of state).

**Last Years**: Chandragupta abdicated in favor of his son Bindusara and became a Jain monk. He fasted to death (Sallekhana) in Shravanabelagola.

### Ashoka the Great (268–232 BCE)

**Kalinga War (261 BCE)**: Ashoka conquered Kalinga (modern Odisha). The devastating war (100,000 killed, 150,000 deported) caused a profound spiritual transformation.

**Conversion to Buddhism**: Deeply moved by the war's violence, Ashoka embraced Buddhism and the principle of **Dhamma** (moral law).

**Dhamma Principles**:
- Non-violence (Ahimsa)
- Respect for all religions (Sarva-dharma-samabhava)
- Generosity (Dana)
- Compassion for animals and humans
- Obedience to elders and parents

**Administrative Reforms**:
- Appointed **Dhamma Mahamattas** (special officers) to spread Dhamma
- Built roads, hospitals, rest houses, dug wells
- Banned animal sacrifice in Pataliputra
- Sent missions to Sri Lanka, Greece, Egypt, Syria

**Ashokan Edicts**: Rock Edicts and Pillar Edicts found across the subcontinent in Brahmi and Kharosthi scripts. Deciphered by James Prinsep in 1837.`,
    facts: [
      'Chandragupta Maurya was guided by Kautilya (Chanakya), author of the Arthashastra',
      'The Mauryan Empire was the largest empire in Indian history (5 million sq km)',
      'Pataliputra (Patna) was the Mauryan capital — described by Megasthenes as world\'s largest city',
      'Ashoka\'s Kalinga War (261 BCE) killed ~100,000 and displaced 150,000 people',
      'Ashoka sent his son Mahendra and daughter Sanghamitra to spread Buddhism to Sri Lanka',
      'James Prinsep deciphered Ashokan Brahmi script in 1837',
      'India\'s national emblem (Lion Capital) is from Ashoka\'s Sarnath Pillar (c. 250 BCE)',
      'The Arthashastra recommends a spy system (Gudhapurush) for state security',
    ],
    tables: [{
      title: 'Mauryan Rulers',
      headers: ['Ruler', 'Reign', 'Notable Achievement'],
      rows: [
        ['Chandragupta Maurya', '322–298 BCE', 'Founded empire; defeated Seleucus'],
        ['Bindusara', '298–272 BCE', 'Extended empire to South India (Amitraghata)'],
        ['Ashoka', '272–232 BCE', 'Kalinga War; spread Buddhism; Dhamma policy'],
        ['Brihadratha', '187–185 BCE', 'Last Mauryan; killed by Pushyamitra Sunga'],
      ]
    }],
    pyqs: [
      {
        year: '2018',
        question: 'Ashoka\'s Dhamma was essentially:',
        options: ['A new religion based on Buddhism', 'A code of social and moral conduct', 'A military conquest strategy', 'A taxation policy for farmers'],
        answer: 'A code of social and moral conduct',
        explanation: 'Dhamma was Ashoka\'s philosophy of moral governance — emphasizing non-violence, tolerance, compassion and righteous conduct. It was not a religion but a universal ethical code.'
      },
      {
        year: '2016',
        question: 'With reference to the Mauryan period, which one is correctly matched?',
        options: ['Arthashastra — Megasthenes', 'Indica — Kautilya', 'Rock Edicts — Ashoka', 'Mudrarakshasa — Chandragupta'],
        answer: 'Rock Edicts — Ashoka',
        explanation: 'Ashoka issued Rock Edicts (Major and Minor) engraved on rocks across his empire. Arthashastra was by Kautilya, Indica by Megasthenes, and Mudrarakshasa was a play by Vishakhadatta about Chandragupta.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════
  // UPSC — Polity
  // ══════════════════════════════════════════════════════════════════
  {
    exam: 'UPSC', subject: 'Polity', topic: 'Indian Constitution',
    subtopic: 'Fundamental Rights — Articles 12–35',
    notes: `## Fundamental Rights — Articles 12–35

Fundamental Rights (Part III, Articles 12–35) are justiciable rights guaranteed to all citizens (and some to all persons) by the Indian Constitution. They can be enforced by courts and are supreme — any law violating them can be struck down.

### Article 12 — Definition of State
For the purpose of Part III, "State" includes:
- Government and Parliament of India
- Government and Legislature of States
- Local and other authorities within India
- Authorities under the control of the Government

### Article 13 — Laws Inconsistent with Fundamental Rights
Pre-constitutional laws inconsistent with Fundamental Rights become void to the extent of inconsistency. Post-constitution laws violating FRs are void ab initio. Established the doctrine of **judicial review**.

### The Six Categories of Fundamental Rights

| Right | Articles | Key Provisions |
|-------|----------|----------------|
| Right to Equality | 14–18 | Equality before law, prohibition of discrimination |
| Right to Freedom | 19–22 | 6 freedoms, protection of life and personal liberty |
| Right against Exploitation | 23–24 | Prohibition of trafficking, forced labor, child labor |
| Right to Freedom of Religion | 25–28 | Freedom of conscience, religion, religious institutions |
| Cultural & Educational Rights | 29–30 | Minority protection, right to establish institutions |
| Right to Constitutional Remedies | 32 | Right to approach Supreme Court |

### Right to Equality (Articles 14–18)

**Article 14**: Equality before law AND Equal protection of laws (adopted from USA and UK respectively). The doctrine of **reasonable classification** allows differential treatment if it has a rational nexus with the object.

**Article 15**: Prohibits discrimination on grounds of religion, race, caste, sex, or place of birth. Allows special provisions for women, children, and socially/educationally backward classes (OBC/SC/ST).

**Article 16**: Equality of opportunity in public employment. Reservation for OBC/SC/ST in government jobs permitted.

**Article 17**: Abolition of untouchability. Enforcement is punishable under Protection of Civil Rights Act, 1955.

**Article 18**: Abolition of titles except military/academic. No citizen can accept foreign titles. Bharat Ratna and Padma Awards were held not to be "titles" by the Supreme Court.

### Right to Freedom (Articles 19–22)

**Article 19 — Six Freedoms** (originally 7; right to property removed by 44th Amendment):
1. Freedom of speech and expression
2. Right to assemble peaceably without arms
3. Right to form associations/unions
4. Right to move freely throughout India
5. Right to reside and settle anywhere
6. Right to practice any profession or trade

**Article 21**: "No person shall be deprived of his life or personal liberty except according to procedure established by law." Expanded by courts to include: right to livelihood, privacy, health, education, dignity, speedy trial.

**Article 21A** (86th Amendment, 2002): Right to Free and Compulsory Education for children aged 6–14.

**Article 22**: Protection against arbitrary arrest — right to be informed of grounds, right to consult a lawyer, production before magistrate within 24 hours.`,
    facts: [
      'Fundamental Rights are in Part III (Articles 12–35) of the Indian Constitution',
      'Originally 7 FRs; Right to Property (Article 31) removed by the 44th Amendment (1978)',
      'Article 32 is itself a Fundamental Right — Dr. B.R. Ambedkar called it the "heart and soul of Constitution"',
      'Article 21 is the most expansive right — courts have read 30+ rights into it',
      'Right to Education (Article 21A) was added by the 86th Constitutional Amendment (2002)',
      'Article 17 abolishes untouchability; the Scheduled Castes and Tribes (Prevention of Atrocities) Act enforces it',
      'FRs are justiciable — can be enforced by High Courts (Article 226) and Supreme Court (Article 32)',
      'FRs can be suspended during National Emergency (Article 352) except Articles 20 and 21',
    ],
    tables: [{
      title: 'Writs under Article 32 and 226',
      headers: ['Writ', 'Meaning', 'Purpose'],
      rows: [
        ['Habeas Corpus', '"To have the body"', 'Challenges illegal detention'],
        ['Mandamus', '"We command"', 'Compels public authority to perform duty'],
        ['Prohibition', '"To forbid"', 'Prevents inferior court from exceeding jurisdiction'],
        ['Certiorari', '"To certify"', 'Quashes order of inferior court'],
        ['Quo Warranto', '"By what authority"', 'Questions right to hold public office'],
      ]
    }],
    pyqs: [
      {
        year: '2020',
        question: 'Which Article of the Indian Constitution is referred to as the "Heart and Soul" by Dr. B.R. Ambedkar?',
        options: ['Article 14', 'Article 19', 'Article 21', 'Article 32'],
        answer: 'Article 32',
        explanation: 'Dr. Ambedkar called Article 32 (Right to Constitutional Remedies) the "heart and soul of the Constitution" because it allows citizens to directly approach the Supreme Court to enforce their Fundamental Rights.'
      },
      {
        year: '2019',
        question: 'The Right to Education as a Fundamental Right was inserted by which Constitutional Amendment?',
        options: ['44th Amendment', '73rd Amendment', '86th Amendment', '93rd Amendment'],
        answer: '86th Amendment',
        explanation: 'The 86th Constitutional Amendment (2002) inserted Article 21A making Right to Free and Compulsory Education for children aged 6–14 a Fundamental Right.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════
  // UPSC — Economics
  // ══════════════════════════════════════════════════════════════════
  {
    exam: 'UPSC', subject: 'Economics', topic: 'Indian Economy',
    subtopic: 'Industrial Policy — 1991 Reforms & LPG',
    notes: `## Industrial Policy — 1991 Reforms & LPG (Liberalisation, Privatisation, Globalisation)

The 1991 economic crisis was the catalyst for India's most transformative economic reforms. India faced a severe balance of payments crisis, foreign exchange reserves fell to just 2 weeks of import cover, and the country had to mortgage gold to the IMF.

### Background — Why 1991?

**Triggers**:
- Gulf War (1990–91) caused oil price spike
- Remittances from Gulf dried up (Indian workers evacuated)
- Political instability (3 PMs in 3 years: VP Singh, Chandra Shekhar, Narasimha Rao)
- Fiscal deficit reached 8.4% of GDP
- Inflation at 17%, forex reserves: $1.2 billion (barely 3 weeks of imports)

**IMF Bailout**: India borrowed $1.8 billion from IMF and pledged 67 tonnes of gold (20 tonnes to Bank of England, 47 tonnes to Union Bank of Switzerland).

### The LPG Reforms (1991)

**Finance Minister**: Dr. Manmohan Singh (under PM P.V. Narasimha Rao)

#### L — Liberalisation

**Industrial Delicensing**: The Industries (Development and Regulation) Act 1951 required industries to obtain licenses before starting production. In 1991, industrial licensing was abolished for all except:
- 18 industries (reduced from 18 to 5 by 2003: Defence, hazardous chemicals, alcohol, tobacco, aerospace)
- Pharmaceuticals, electronics retained longer

**MRTP Act**: Monopolies and Restrictive Trade Practices Act removed asset-limit provisions, allowing large companies to expand freely.

**Import Liberalization**: Quantitative restrictions on imports removed; tariffs reduced from average 300% to under 30% by 2000s.

#### P — Privatisation

**Disinvestment**: Government began selling stakes in Public Sector Undertakings (PSUs). Disinvestment target set in each Budget.

**Reduced Role of Public Sector**: No. of industries reserved for public sector reduced from 17 to 3 (defence, railways, atomic energy).

**Strategic Sale**: Complete privatization of non-core PSUs (Air India sold to Tata Group in 2022).

#### G — Globalisation

**Rupee Devaluation**: Rupee devalued by 22% to boost exports.

**Current Account Convertibility**: Rupee made convertible on current account (1994).

**FDI Policy**: Automatic approval for FDI up to 51% in priority industries. FDI ceiling progressively raised.

**WTO Membership**: India became a founding member of WTO (January 1, 1995), replacing GATT.

### Impact of 1991 Reforms

| Indicator | Pre-1991 | Post-Reform (2000s) |
|-----------|----------|---------------------|
| GDP Growth | 3.5% (Hindu rate) | 7–9% |
| Forex Reserves | $1.2 billion | $300+ billion |
| FDI Inflows | Negligible | $60–80 billion/year |
| Exports | Stagnant | Grew 20x |
| Poverty Rate | 45% | 21% (2011) |`,
    facts: [
      'India\'s 1991 forex reserves fell to just $1.2 billion — enough for only 3 weeks of imports',
      'India pledged 67 tonnes of gold to IMF/Bank of England to secure emergency loans in 1991',
      'The 1991 reforms were designed by Finance Minister Dr. Manmohan Singh under PM Narasimha Rao',
      'Industrial licensing was abolished for all industries except 18 (later reduced to 3)',
      'India became a founding member of WTO on January 1, 1995',
      'The "Hindu Rate of Growth" (~3.5% annually) was the pre-reform era growth rate (coined by Raj Krishna)',
      'Rupee was devalued by 22% in July 1991 to boost exports and correct balance of payments',
      'MRTP Act removed to allow large Indian companies to expand without asset-limit restrictions',
    ],
    tables: [{
      title: 'Key 1991 Reform Measures',
      headers: ['Sector', 'Pre-1991', 'Post-1991'],
      rows: [
        ['Industrial Licensing', 'Required for all industries', 'Abolished (3 sectors reserved)'],
        ['FDI Policy', 'Restricted (max 40%)', 'Auto approval up to 51%+'],
        ['Imports', 'Heavy QRs and tariffs (300%)', 'Tariffs reduced to 30%'],
        ['PSU Role', '17 sectors reserved', 'Only 3 sectors (Defence, Railways, Atomic Energy)'],
        ['Rupee', 'Fixed/Controlled', 'Devalued; CA convertibility (1994)'],
      ]
    }],
    pyqs: [
      {
        year: '2017',
        question: 'India pledged gold to which institution during the 1991 balance of payments crisis?',
        options: ['World Bank', 'Asian Development Bank', 'IMF and Bank of England', 'Federal Reserve USA'],
        answer: 'IMF and Bank of England',
        explanation: 'In 1991, India pledged 67 tonnes of gold — 20 tonnes to the Bank of England and 47 tonnes to the Union Bank of Switzerland — as collateral for emergency loans to resolve the balance of payments crisis.'
      },
      {
        year: '2020',
        question: 'Which of the following was NOT a feature of India\'s 1991 economic reforms?',
        options: ['Abolition of industrial licensing', 'Rupee devaluation', 'Nationalisation of private banks', 'FDI liberalisation'],
        answer: 'Nationalisation of private banks',
        explanation: 'The 1991 reforms moved towards privatisation, not nationalisation. Bank nationalisation had already happened in 1969 (14 banks) and 1980 (6 more banks). The 1991 reforms instead promoted disinvestment and private sector expansion.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════
  // UPSC — Environment
  // ══════════════════════════════════════════════════════════════════
  {
    exam: 'UPSC', subject: 'Environment & Ecology', topic: 'Environmental Issues',
    subtopic: 'Climate Change — Greenhouse Effect & Global Warming',
    notes: `## Climate Change — Greenhouse Effect & Global Warming

Climate change refers to long-term shifts in global temperatures and weather patterns, primarily driven by human activities since the industrial revolution.

### The Greenhouse Effect

**Natural Greenhouse Effect** (essential for life):
- Solar radiation passes through atmosphere to Earth's surface
- Earth absorbs solar radiation and re-emits it as infrared (heat) radiation
- Greenhouse gases (GHGs) trap this outgoing infrared radiation
- Result: Earth's average temperature ~15°C (without it: –18°C)

**Enhanced Greenhouse Effect** (anthropogenic):
- Human activities increase GHG concentrations
- More heat trapped → global temperature rise → Climate change

### Major Greenhouse Gases

| Gas | Source | Global Warming Potential (100yr) | % Contribution |
|-----|--------|-----------------------------------|----------------|
| CO₂ | Fossil fuels, deforestation | 1 (reference) | ~76% |
| CH₄ (Methane) | Livestock, rice paddies, landfills | 28–36 | ~16% |
| N₂O | Fertilizers, industry | 265–298 | ~6% |
| HFCs/PFCs | Refrigerants, industry | 1,000–22,800 | ~2% |

### Global Warming — Key Facts

**Current Warming**: Earth has warmed approximately **1.1°C** above pre-industrial levels (1850–1900 baseline).

**Paris Agreement Target**: Limit warming to **well below 2°C**, ideally **1.5°C** above pre-industrial levels.

**Tipping Points**: At 1.5°C — coral reef bleaching, Arctic ice loss. At 2°C — irreversible permafrost thaw releasing methane.

**Sea Level Rise**: Thermal expansion of oceans + glacier melt. Current rate: ~3.6 mm/year. By 2100: 0.3–1 metre rise possible.

### Impacts on India

- **Monsoon Disruption**: More erratic monsoons, increased extreme rainfall events
- **Himalayan Glaciers**: Gangotri glacier receding; water security threat for 500 million
- **Coastal Flooding**: 7,517 km coastline; Mumbai, Kolkata, Chennai at risk
- **Agriculture**: Crop yield reductions of 20–30% by 2080 if no adaptation
- **Heat Waves**: Frequency and intensity increasing; 2022 heat waves killed 90+ in India

### India's Climate Commitments

- **Nationally Determined Contributions (NDC)** under Paris Agreement:
  - Reduce emissions intensity of GDP by 45% by 2030 (vs 2005)
  - 50% cumulative electric power from non-fossil sources by 2030
  - Create additional carbon sink of 2.5–3 billion tonnes through forests
- **Net Zero by 2070**: India committed at COP26 (Glasgow, 2021)`,
    facts: [
      'Earth has warmed ~1.1°C above pre-industrial (1850-1900) average as of 2023',
      'CO₂ concentration in atmosphere crossed 420 ppm in 2023 (pre-industrial: 280 ppm)',
      'Methane (CH₄) is 28x more potent a greenhouse gas than CO₂ over 100 years',
      'The Paris Agreement (2015) aims to limit warming to well below 2°C, ideally 1.5°C',
      'India committed to Net Zero emissions by 2070 at COP26 in Glasgow (2021)',
      'Arctic is warming 4x faster than the global average',
      'The IPCC (Intergovernmental Panel on Climate Change) was established in 1988',
      'India is the 3rd largest emitter of CO₂ but has very low per capita emissions (~2 tonnes vs 15 for USA)',
    ],
    tables: [{
      title: 'Key UNFCCC Milestones',
      headers: ['Year', 'Event', 'Key Outcome'],
      rows: [
        ['1992', 'Rio Earth Summit', 'UNFCCC adopted; principles of common but differentiated responsibilities'],
        ['1997', 'Kyoto Protocol', 'Binding emission targets for developed countries; CDM for developing'],
        ['2009', 'Copenhagen Accord', 'Non-binding; 2°C target mentioned; Green Climate Fund idea'],
        ['2015', 'Paris Agreement', 'NDCs; 1.5°C target; $100 billion/year climate finance'],
        ['2021', 'COP26 Glasgow', 'India\'s Net Zero 2070 pledge; coal phase-down language'],
        ['2023', 'COP28 Dubai', 'First Global Stocktake; transition away from fossil fuels'],
      ]
    }],
    pyqs: [
      {
        year: '2022',
        question: 'With reference to "Paris Agreement", which of the following statements is/are correct?\n1. It entered into force in 2016.\n2. Its aim is to limit global temperature rise to well below 2°C above pre-industrial levels.\nSelect the correct answer:',
        options: ['1 only', '2 only', 'Both 1 and 2', 'Neither 1 nor 2'],
        answer: 'Both 1 and 2',
        explanation: 'The Paris Agreement was adopted in December 2015 and entered into force in November 2016. Its central aim is to limit the global average temperature increase to well below 2°C above pre-industrial levels and pursue efforts to limit to 1.5°C.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════
  // UPSC — Geography
  // ══════════════════════════════════════════════════════════════════
  {
    exam: 'UPSC', subject: 'Geography', topic: 'Physical Geography',
    subtopic: 'Plate Tectonics — Theory & Evidence',
    notes: `## Plate Tectonics — Theory & Evidence

Plate tectonics is the unifying theory of geology that explains how the rigid outer shell of Earth (lithosphere) is broken into moving plates, and how their movement creates mountains, ocean basins, earthquakes, and volcanoes.

### Historical Development

**Continental Drift (Alfred Wegener, 1912)**:
- Proposed all continents were once joined as **Pangaea** (~250 million years ago)
- Then split into **Laurasia** (northern) and **Gondwanaland** (southern)
- Evidence: Jigsaw fit of continents, matching fossils, similar rock formations across oceans

**Sea-Floor Spreading (Harry Hess, 1960)**:
- Mid-ocean ridges are where new ocean floor is created
- Magma erupts at ridges, solidifies, and spreads outward
- Explains why ocean floor is younger than continental rocks

**Plate Tectonics Theory (1960s)**:
- Combined Wegener's drift + sea-floor spreading
- Earth's lithosphere = ~12–15 major rigid plates

### Earth's Internal Structure

| Layer | Depth | Composition | State |
|-------|-------|-------------|-------|
| Crust | 0–70 km | Silica-Alumina (SIAL) / Silica-Magnesium (SIMA) | Solid |
| Mantle | 70–2,900 km | Olivine, Pyroxene | Solid/Plastic |
| Outer Core | 2,900–5,100 km | Iron-Nickel | Liquid |
| Inner Core | 5,100–6,371 km | Iron-Nickel | Solid |

### Types of Plate Boundaries

**1. Divergent Boundaries** (plates move apart):
- Mid-ocean ridges form (Mid-Atlantic Ridge)
- Continental rifts form (East African Rift Valley)
- Creates new oceanic crust

**2. Convergent Boundaries** (plates collide):
- **Oceanic-Continental**: Oceanic plate subducts (Andes mountains, Ring of Fire)
- **Oceanic-Oceanic**: Island arcs form (Japanese Islands, Aleutian Islands)
- **Continental-Continental**: Mountains fold (Himalayas — Indian + Eurasian plates, ~50 million years ago)

**3. Transform Boundaries** (plates slide past each other):
- San Andreas Fault, California
- Cause major earthquakes, no volcanism

### Evidence for Plate Tectonics
1. **Fossil Evidence**: Glossopteris fern found in India, Africa, South America, Antarctica
2. **Paleoclimatic Evidence**: Coal deposits in Antarctica (once tropical)
3. **Magnetic Striping**: Symmetric magnetic reversals on ocean floor
4. **Earthquake/Volcano Distribution**: Follow plate boundaries exactly
5. **Age of Ocean Floor**: Youngest at ridges, oldest near trenches`,
    facts: [
      'Alfred Wegener proposed Continental Drift theory in 1912; initially rejected, later accepted',
      'Pangaea began to break up ~200 million years ago; by 65 mya, familiar continents existed',
      'The Himalayas are still rising ~5 mm per year as Indian Plate continues to collide with Eurasian Plate',
      'The Pacific Plate is the world\'s largest tectonic plate',
      'The Ring of Fire accounts for 75% of world\'s volcanoes and 90% of earthquakes',
      'Mid-Atlantic Ridge is the world\'s longest mountain range (16,000 km) — mostly underwater',
      'The East African Rift Valley is where Africa is slowly splitting apart',
      'India was once part of Gondwanaland and drifted north over ~70 million years',
    ],
    tables: [{
      title: 'Major Tectonic Plates',
      headers: ['Plate', 'Type', 'Notable Feature'],
      rows: [
        ['Pacific Plate', 'Oceanic', 'Largest plate; Ring of Fire'],
        ['North American Plate', 'Continental/Oceanic', 'San Andreas Fault at boundary with Pacific'],
        ['Eurasian Plate', 'Continental', 'Forms Himalayas at Indian Plate boundary'],
        ['Indian Plate', 'Continental', 'Moving NE ~5 cm/year; created Himalayas'],
        ['African Plate', 'Continental', 'East African Rift Valley (diverging)'],
        ['Antarctic Plate', 'Continental', 'Surrounded by divergent boundaries'],
      ]
    }],
    pyqs: [
      {
        year: '2021',
        question: 'Which of the following pairs is correctly matched regarding tectonic plate boundaries?',
        options: [
          'Mid-Atlantic Ridge — Transform boundary',
          'Himalayas — Convergent boundary',
          'San Andreas Fault — Divergent boundary',
          'East African Rift — Convergent boundary'
        ],
        answer: 'Himalayas — Convergent boundary',
        explanation: 'The Himalayas formed due to a convergent (continental-continental) collision between the Indian Plate and the Eurasian Plate beginning ~50 million years ago. The Mid-Atlantic Ridge is divergent; San Andreas Fault is transform; East African Rift is divergent.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════
  // UPSC — Science & Technology
  // ══════════════════════════════════════════════════════════════════
  {
    exam: 'UPSC', subject: 'Science & Technology', topic: 'Space Technology',
    subtopic: 'ISRO — History, Missions & Achievements',
    notes: `## ISRO — History, Missions & Achievements

The Indian Space Research Organisation (ISRO) is India's national space agency, established in 1969. It is one of the world's leading space agencies, known for cost-effective missions.

### History & Founding

- **1962**: Indian National Committee for Space Research (INCOSPAR) set up by Dr. Vikram Sarabhai
- **1963**: India's first sounding rocket launched from Thumba, Kerala (using a church as control room!)
- **1969**: ISRO formally established; HQ in Bengaluru
- **1975**: Aryabhata — India's first satellite (launched by Soviet Union)
- **1980**: Rohini-1 — First satellite launched by an Indian rocket (SLV-3)

### Launch Vehicles

**PSLV (Polar Satellite Launch Vehicle)**:
- Workhorse of ISRO; 4-stage alternating solid/liquid engines
- Over 50 successful missions; launched satellites for 40+ countries
- PSLV-C37 (2017): Record 104 satellites in single launch

**GSLV (Geosynchronous Satellite Launch Vehicle)**:
- 3-stage; uses cryogenic engine (ISRO's indigenous cryogenic engine: C25)
- For heavier communication satellites in GEO orbit

**LVM3 (Launch Vehicle Mark 3)**:
- ISRO's heaviest launcher; 4 tonne payload to GTO
- Used for Chandrayaan-3 and OneWeb launches

### Major Missions

**Chandrayaan-1 (2008)**:
- India's first lunar mission; discovered water molecules on Moon's surface
- Confirmed by NASA's Moon Impact Probe carried on Chandrayaan-1

**Chandrayaan-2 (2019)**:
- Orbiter (operational), Vikram lander (crashed during landing), Pragyan rover
- Orbiter continues to send data about Moon's surface composition

**Chandrayaan-3 (2023)** 🌙:
- Successfully landed near Moon's south pole on **August 23, 2023**
- India became 4th country to soft-land on Moon (USA, USSR, China, India)
- First ever soft landing near lunar south pole
- Pragyan rover covered 100m, confirmed sulphur on Moon's south pole

**Mangalyaan — Mars Orbiter Mission (2013–2022)**:
- India's first interplanetary mission
- First Asian country to reach Mars orbit
- First country to succeed on first attempt
- Cost: ₹450 crore (~$74 million) — cheaper than Hollywood movie "Gravity"
- Successfully operated for 8 years (planned: 6 months)

**Gaganyaan**:
- India's first human spaceflight program
- Target: Send 3 Indian astronauts (Vyomanauts) to 400 km orbit for 3 days
- Test missions ongoing (2024); crewed mission planned 2025–26`,
    facts: [
      'ISRO was founded in 1969 by Dr. Vikram Sarabhai, the "Father of India\'s Space Programme"',
      'India became the 4th country to soft-land on the Moon with Chandrayaan-3 (August 23, 2023)',
      'India was the first country to reach Mars orbit on its first attempt (Mangalyaan, 2014)',
      'Mangalyaan cost ₹450 crore — less than the Hollywood movie "Gravity" ($100 million)',
      'PSLV-C37 launched a record 104 satellites in one mission (2017)',
      'India\'s first astronaut in space was Rakesh Sharma (1984) aboard a Soviet Soyuz mission',
      'ISRO\'s annual budget (~$1.5 billion) is ~10x less than NASA\'s (~$25 billion)',
      'NavIC (Navigation with Indian Constellation) is India\'s own GPS system with 7 satellites',
    ],
    tables: [{
      title: 'ISRO Major Missions Timeline',
      headers: ['Year', 'Mission', 'Achievement'],
      rows: [
        ['1975', 'Aryabhata', 'India\'s first satellite (Soviet launch)'],
        ['1980', 'Rohini-1', 'First satellite by Indian rocket (SLV-3)'],
        ['2008', 'Chandrayaan-1', 'Discovered water on Moon'],
        ['2014', 'Mangalyaan', 'India reaches Mars — first Asian nation'],
        ['2019', 'Chandrayaan-2', 'Orbiter operational; lander crashed'],
        ['2023', 'Chandrayaan-3', 'First soft landing near lunar south pole'],
        ['2024', 'Gaganyaan TV-D1', 'Crew Escape System test (successful)'],
      ]
    }],
    pyqs: [
      {
        year: '2023',
        question: 'Chandrayaan-3 made India the first country to:',
        options: [
          'Land on the Moon',
          'Land near the lunar south pole',
          'Send a rover to the Moon',
          'Successfully orbit the Moon'
        ],
        answer: 'Land near the lunar south pole',
        explanation: 'Chandrayaan-3\'s Vikram lander successfully touched down near the Moon\'s south pole on August 23, 2023, making India the first country to achieve a soft landing near the lunar south pole. USA, USSR, and China had previously landed on the Moon, but not in the south polar region.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════
  // UPSC — Modern History
  // ══════════════════════════════════════════════════════════════════
  {
    exam: 'UPSC', subject: 'History', topic: 'Modern India',
    subtopic: 'Non-Cooperation Movement 1920–22',
    notes: `## Non-Cooperation Movement 1920–22

The Non-Cooperation Movement (NCM) was the first mass movement launched by Mahatma Gandhi under the Indian National Congress. It marked the transformation of the Congress from an elite organization to a mass political force.

### Background

**Jallianwala Bagh Massacre (April 13, 1919)**: General Dyer ordered firing on unarmed civilians in Amritsar, killing 379+ (official; actual ~1,000). Gandhi called it "the saddest chapter in British rule."

**Rowlatt Act (1919)**: Extended wartime powers of detention without trial. Provoked widespread protests.

**Khilafat Movement**: Muslims were upset at the harsh treatment of the Ottoman Caliph (religious head) after WWI. Gandhi saw an opportunity to unite Hindus and Muslims.

### Launch & Programme

**Resolution**: At a special session of Congress in Calcutta (September 1920), and confirmed at Nagpur Session (December 1920).

**Gandhi's Plan — Non-Cooperation** meant:
1. Surrender of titles and honours conferred by the British
2. Boycott of government schools and colleges (national schools to open)
3. Boycott of British courts (use arbitration instead)
4. Boycott of elections under the Government of India Act 1919
5. Boycott of foreign goods; promotion of Swadeshi (khadi)
6. If needed — refusal to pay taxes

### Spread & Impact

**Participation**: Unprecedented mass participation across India — peasants, students, Muslims, women.

**Khadi Movement**: Spinning wheels (charkha) became symbols of self-reliance. Gandhi himself spun daily.

**National Schools**: Thousands of students left government schools. Jamia Millia Islamia and Kashi Vidyapeeth founded.

**Lawyer Boycott**: Motilal Nehru, Chitta Ranjan Das gave up lucrative practices.

**Economic Impact**: Import of foreign cloth fell from ₹102 crore to ₹57 crore by 1922.

### Chauri Chaura Incident (February 5, 1922)

At Chauri Chaura (Gorakhpur district, UP), a police firing on demonstrators led to a mob burning the police station, killing 22 policemen.

**Gandhi's Decision**: Immediately suspended the entire movement, calling violence a "violation of the movement's core principles."

**Controversy**: Many leaders — including younger nationalists — were shocked. They felt withdrawing when the movement was at its peak was a mistake.

### Significance

- First all-India mass movement
- Proved ordinary Indians could challenge the empire
- Integrated peasants and workers into the national movement
- Demonstrated power of non-violent mass action
- Led to Gandhi's Constructive Programme (village industries, communal harmony, untouchability)`,
    facts: [
      'The NCM was launched in August 1920 — first truly mass-based movement in Indian freedom struggle',
      'Gandhi suspended the NCM on February 12, 1922 after the Chauri Chaura incident',
      '22 policemen were killed when protestors burned the Chauri Chaura police station on Feb 5, 1922',
      'Import of foreign cloth fell by 44% during the NCM (₹102 crore to ₹57 crore)',
      'Motilal Nehru and C.R. Das gave up their lucrative legal practices to join the movement',
      'Jamia Millia Islamia was founded in 1920 as an alternative to British government colleges',
      'Gandhi was arrested and jailed for 6 years after the movement (released in 1924 for surgery)',
      'The NCM united Hindus and Muslims through the Khilafat cause — a unity that later proved fragile',
    ],
    tables: [{
      title: 'Comparison of Major Gandhi-Led Movements',
      headers: ['Movement', 'Year', 'Key Issue', 'Ended Due To'],
      rows: [
        ['Non-Cooperation', '1920–22', 'Rowlatt Act, Khilafat, Jallianwala', 'Chauri Chaura violence'],
        ['Civil Disobedience', '1930–34', 'Salt Tax, Simon Commission', 'Gandhi-Irwin Pact'],
        ['Individual Satyagraha', '1940–41', 'Free speech for war opposition', 'Planned conclusion'],
        ['Quit India', '1942', 'Complete independence from Britain', 'Suppressed by British'],
      ]
    }],
    pyqs: [
      {
        year: '2019',
        question: 'Which incident led Gandhi to suspend the Non-Cooperation Movement in 1922?',
        options: ['Jallianwala Bagh Massacre', 'Chauri Chaura incident', 'Simon Commission protests', 'Salt Satyagraha'],
        answer: 'Chauri Chaura incident',
        explanation: 'The Chauri Chaura incident (February 5, 1922) where a mob burned a police station killing 22 policemen caused Gandhi to immediately suspend the Non-Cooperation Movement, insisting the movement must remain non-violent.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════
  // BPSC — History
  // ══════════════════════════════════════════════════════════════════
  {
    exam: 'BPSC', subject: 'History', topic: 'Ancient India',
    subtopic: 'Magadha Empire & Mahajanapadas',
    notes: `## Magadha Empire & Mahajanapadas

### Mahajanapadas (6th–4th Century BCE)

The period from 600–400 BCE saw the emergence of 16 powerful states called **Mahajanapadas** (great states/kingdoms) in North India.

**The 16 Mahajanapadas**:
Anga, Magadha, Vajji, Malla, Kashi, Kosala, Vatsa, Chedi, Matsya, Surasena, Assaka, Avanti, Gandhara, Kamboja, Kuru, Panchala

**Two types of polities**:
- **Monarchies** (rajyas): Magadha, Kosala, Avanti, Vatsa
- **Oligarchic republics** (ganas/sanghas): Vajji, Malla, Shakya (Buddha's clan)

### Rise of Magadha

Magadha emerged as the most powerful Mahajanapada due to its strategic advantages:

1. **Geography**: Located at junction of Ganga and Son rivers; natural fortification
2. **Iron Deposits**: Access to iron ore (Rajmahal Hills) for weapons and tools
3. **Agriculture**: Fertile Gangetic plains for surplus food production
4. **Trade Routes**: Control of Ganga trade routes
5. **Elephant Force**: Dense forests provided war elephants

### Haryanka Dynasty (544–413 BCE)
- **Bimbisara**: First great Magadha ruler; contemporary of Buddha; expanded through diplomacy and marriage alliances
- **Ajatashatru**: Killed his father Bimbisara; conquered Kashi and Vajji confederation; used war machines (Mahashilakantaka, Rathamusala)

### Shishunaga Dynasty (413–345 BCE)
- Shishunaga destroyed Avanti — major rival
- Kalashoka held Second Buddhist Council at Vaishali (383 BCE)

### Nanda Dynasty (345–321 BCE)
- Founded by Mahapadma Nanda (from barber caste — first non-Kshatriya empire)
- Built massive army: 200,000 infantry, 80,000 cavalry, 8,000 chariots, 6,000 elephants
- Alexander the Great's army refused to cross the Beas river due to fear of Nanda army
- Dhana Nanda (last Nanda) was overthrown by Chandragupta Maurya with Kautilya's help`,
    facts: [
      '16 Mahajanapadas emerged between 6th–4th century BCE in North India',
      'Magadha had strategic advantages: iron deposits, fertile plains, Ganga trade routes, elephants',
      'Bimbisara (Haryanka dynasty) was the first great king of Magadha and a contemporary of Buddha',
      'Ajatashatru invented war machines — Mahashilakantaka (catapult) and Rathamusala (scythed chariot)',
      'Mahapadma Nanda was the first non-Kshatriya (of barber origin) to rule a major empire',
      'Alexander\'s army refused to cross the Beas River (326 BCE) fearing the Nanda army\'s size',
      'Pataliputra (modern Patna) was the capital of Magadha — renamed from Patali village by Ajatashatru',
      'The Vajji confederation (republic) was one of the world\'s earliest known republican systems',
    ],
    tables: [{
      title: 'Magadha Dynasties',
      headers: ['Dynasty', 'Period', 'Notable Rulers', 'Key Achievement'],
      rows: [
        ['Haryanka', '544–413 BCE', 'Bimbisara, Ajatashatru', 'Expanded Magadha; conquered Vajji'],
        ['Shishunaga', '413–345 BCE', 'Shishunaga, Kalashoka', 'Destroyed Avanti; 2nd Buddhist Council'],
        ['Nanda', '345–321 BCE', 'Mahapadma, Dhana Nanda', 'First empire; massive army buildup'],
        ['Maurya', '321–185 BCE', 'Chandragupta, Ashoka', 'First pan-Indian empire; Buddhism spread'],
      ]
    }],
    pyqs: [
      {
        year: '2018',
        question: 'Which of the following was a characteristic of the Vajji Mahajanapada?',
        options: ['It was a monarchy ruled by a powerful king', 'It was a republican oligarchy', 'It was founded by Chandragupta Maurya', 'It was located in South India'],
        answer: 'It was a republican oligarchy',
        explanation: 'Vajji was one of the Gana-Sanghas (oligarchic republics) of ancient India. It was a confederation of eight clans including the Lichchhavis. Vaishali was its capital and it was one of the world\'s earliest known republican systems.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════
  // Railway RRB
  // ══════════════════════════════════════════════════════════════════
  {
    exam: 'Railway', subject: 'General Science', topic: 'Physics',
    subtopic: 'Newton\'s Laws of Motion',
    notes: `## Newton's Laws of Motion

Sir Isaac Newton formulated three fundamental laws of motion in his work *Principia Mathematica* (1687), which form the foundation of classical mechanics.

### First Law — Law of Inertia

**Statement**: "An object at rest remains at rest, and an object in motion remains in uniform motion in a straight line, unless acted upon by an external unbalanced force."

**Inertia**: The tendency of an object to resist changes in its state of motion. Mass is a measure of inertia.

**Examples**:
- Passengers jerk forward when a bus brakes suddenly (body wants to continue moving)
- A tablecloth pulled quickly — dishes stay (dishes resist change)
- Satellites orbit Earth indefinitely in vacuum (no friction to stop them)

### Second Law — Law of Force (F = ma)

**Statement**: "The net force acting on an object is equal to the rate of change of momentum."

**Formula**: F = ma (Force = mass × acceleration)

**Key Points**:
- Force is a vector quantity (has direction)
- Greater force → greater acceleration (for same mass)
- Greater mass → less acceleration (for same force)
- SI unit of force: Newton (N) = 1 kg·m/s²

**Examples**:
- A cricket bat hits a ball (force changes ball's momentum)
- Rockets accelerate by expelling gas at high speed

### Third Law — Law of Action-Reaction

**Statement**: "For every action, there is an equal and opposite reaction."

**Key Points**:
- Action and reaction forces act on different objects
- They are equal in magnitude but opposite in direction
- Both forces occur simultaneously

**Examples**:
- Gun recoil (bullet forward, gun backward)
- Rocket propulsion (exhaust backward, rocket forward)
- Walking (foot pushes ground backward, ground pushes foot forward)
- Swimming (hands push water backward, water pushes swimmer forward)

### Linear Momentum

**p = mv** (momentum = mass × velocity)

**Conservation of Momentum**: In the absence of external forces, total momentum of a system remains constant.
- Example: Billiard ball collisions, rocket ejection`,
    facts: [
      'Newton\'s three laws of motion were published in Principia Mathematica in 1687',
      'Inertia is the resistance of an object to change its state of motion or rest',
      'F = ma: Force (Newton) = Mass (kg) × Acceleration (m/s²)',
      '1 Newton = the force needed to accelerate 1 kg mass at 1 m/s²',
      'Action-reaction forces always act on different bodies, not the same body',
      'The principle of conservation of momentum is derived from Newton\'s third law',
      'Rockets work on Newton\'s third law — exhaust gases provide thrust in opposite direction',
      'The SI unit of momentum is kg·m/s',
    ],
    tables: [{
      title: 'Newton\'s Three Laws Summary',
      headers: ['Law', 'Statement', 'Key Concept', 'Example'],
      rows: [
        ['First Law', 'Object continues in state of rest or uniform motion unless external force acts', 'Inertia', 'Passenger jolts when bus brakes'],
        ['Second Law', 'F = ma; force = rate of change of momentum', 'F = ma', 'Cricket ball hit by bat'],
        ['Third Law', 'Every action has equal and opposite reaction', 'Action-Reaction', 'Rocket propulsion, gun recoil'],
      ]
    }],
    pyqs: [
      {
        year: '2022',
        question: 'A gun recoils when fired. This is an example of Newton\'s:',
        options: ['First Law', 'Second Law', 'Third Law', 'Law of Gravitation'],
        answer: 'Third Law',
        explanation: 'When a gun fires a bullet forward (action), the gun experiences an equal and opposite force backward (reaction). This recoil is a perfect example of Newton\'s Third Law of Motion.'
      },
      {
        year: '2021',
        question: 'Which of the following is the SI unit of force?',
        options: ['Joule', 'Pascal', 'Newton', 'Watt'],
        answer: 'Newton',
        explanation: 'The SI unit of force is Newton (N), defined as the force needed to give a mass of 1 kg an acceleration of 1 m/s². Named after Sir Isaac Newton.'
      }
    ]
  },

  {
    exam: 'Railway', subject: 'General Awareness', topic: 'Indian Railways',
    subtopic: 'Indian Railway System Overview',
    notes: `## Indian Railway System Overview

Indian Railways (IR) is one of the world's largest railway networks. It is owned and operated by the Government of India under the Ministry of Railways.

### Key Statistics (2024)

| Parameter | Data |
|-----------|------|
| Route Length | 67,956 km (4th largest in world) |
| Running Track | 1,29,000 km |
| Stations | ~7,500 |
| Daily Passengers | ~2.4 crore (24 million) |
| Daily Trains | ~13,000 |
| Employees | ~12 lakh (1.2 million) — largest employer in India |
| Freight per day | ~3.5 million tonnes |

### History

- **1853**: First passenger train in India — Bombay to Thane (34 km, April 16, 1853)
- **1890**: Railway Act enacted
- **1950–51**: Railway nationalization completed (post-independence)
- **1951**: Railway Board restructured; all zones integrated
- **2020**: Merger of Railway Budget with Union Budget (since 2017)

### Gauge Types

| Gauge | Track Width | Usage |
|-------|-------------|-------|
| Broad Gauge (BG) | 1,676 mm (5'6") | 92% of route; main network |
| Metre Gauge (MG) | 1,000 mm (3'3") | Being converted to BG |
| Narrow Gauge (NG) | 762 mm or 610 mm | Hilly/heritage lines |

### Train Categories

**Premium/High Speed**: Vande Bharat Express (semi-high speed, 160 km/h designed), Rajdhani, Shatabdi, Gatimaan Express (160 km/h, Agra-Delhi)

**Premium Overnight**: Rajdhani Express (connects state capitals to Delhi), Duronto Express (non-stop)

**Intercity**: Shatabdi Express (same-day return), Jan Shatabdi (affordable Shatabdi)

**Ordinary**: Express trains, Mail trains, Passenger trains

### Railway Zones

Indian Railways is divided into **18 Zones** (latest: South Coast Railway Zone, Visakhapatnam):
- Central (Mumbai CST)
- Western (Mumbai Churchgate)
- Northern (New Delhi)
- Southern (Chennai Park Town)
- Eastern (Kolkata Fairlie Place)
... and 13 more zones

### Recent Developments

**Vande Bharat**: Semi-high speed train (designed for 160 km/h, runs at 130 km/h); self-propelled (no loco); 50+ routes launched

**Bullet Train**: Mumbai-Ahmedabad High Speed Rail (508 km); using Japanese Shinkansen technology; under construction

**Kavach**: Automatic Train Protection system; prevents collisions; being deployed nationwide

**100% Electrification**: Target to electrify entire BG network by 2024`,
    facts: [
      'India\'s first passenger train ran between Bombay and Thane on April 16, 1853 (34 km)',
      'Indian Railways has a route length of ~68,000 km — 4th largest in the world',
      'IR employs ~1.2 million people — the largest employer in India',
      '~24 million passengers travel by train every day in India',
      'Indian Railways is divided into 18 operational zones (South Coast Railway being the newest)',
      'Broad Gauge (1,676 mm) accounts for 92% of Indian railway route length',
      'Vande Bharat Express is India\'s first semi-high-speed train (designed for 160 km/h)',
      'Kavach is India\'s Automatic Train Protection (ATP) system to prevent collisions',
    ],
    tables: [{
      title: 'Important Railway Firsts in India',
      headers: ['First', 'Year', 'Detail'],
      rows: [
        ['First passenger train', '1853', 'Bombay to Thane; 14 coaches, 400 passengers'],
        ['First metro', '1984', 'Kolkata Metro — India\'s first metro system'],
        ['First Rajdhani', '1969', 'New Delhi to Howrah Rajdhani Express'],
        ['First Shatabdi', '1988', 'New Delhi to Bhopal Shatabdi Express'],
        ['First Vande Bharat', '2019', 'New Delhi to Varanasi Vande Bharat Express (Train 18)'],
        ['First bullet train corridor', 'Under const.', 'Mumbai-Ahmedabad (508 km); target 2027'],
      ]
    }],
    pyqs: [
      {
        year: '2022',
        question: 'When was the first passenger train in India run?',
        options: ['April 16, 1853', 'March 25, 1850', 'January 1, 1860', 'August 15, 1947'],
        answer: 'April 16, 1853',
        explanation: 'India\'s first passenger train ran on April 16, 1853 between Bombay (Boribunder) and Thane, a distance of 34 km. The train had 14 carriages and carried about 400 passengers.'
      },
      {
        year: '2021',
        question: 'What is the gauge width of Broad Gauge (BG) track used in Indian Railways?',
        options: ['1,000 mm', '1,435 mm', '1,524 mm', '1,676 mm'],
        answer: '1,676 mm',
        explanation: 'Broad Gauge (BG) in Indian Railways has a track width of 1,676 mm (5 feet 6 inches), which is wider than the standard gauge (1,435 mm) used in most countries. This was decided during British rule to accommodate the Indian terrain.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════
  // SSC CGL
  // ══════════════════════════════════════════════════════════════════
  {
    exam: 'SSC CGL', subject: 'Quantitative Aptitude', topic: 'Arithmetic',
    subtopic: 'Simple & Compound Interest',
    notes: `## Simple & Compound Interest

Interest problems form one of the most frequently tested topics in SSC CGL. Mastering the formulas and their applications is essential.

### Simple Interest (SI)

**Formula**: SI = (P × R × T) / 100

Where:
- **P** = Principal (original amount)
- **R** = Rate of interest per annum (%)
- **T** = Time in years

**Amount**: A = P + SI = P(1 + RT/100)

**Example**: ₹5,000 at 8% per annum for 3 years
- SI = (5000 × 8 × 3) / 100 = ₹1,200
- Amount = 5,000 + 1,200 = ₹6,200

### Compound Interest (CI)

**Formula**: A = P(1 + R/100)ⁿ

- **A** = Amount after n years
- **n** = Number of years (compounding periods)
- **CI** = A – P

**Example**: ₹5,000 at 8% compounded annually for 2 years
- A = 5000(1 + 8/100)² = 5000 × (1.08)² = 5000 × 1.1664 = ₹5,832
- CI = 5,832 – 5,000 = ₹832

### Compounding Periods

| Compounding | Formula | Period |
|-------------|---------|--------|
| Annually | A = P(1 + R/100)ⁿ | n = years |
| Half-yearly | A = P(1 + R/200)²ⁿ | rate halved, time doubled |
| Quarterly | A = P(1 + R/400)⁴ⁿ | rate quartered, time quadrupled |
| Monthly | A = P(1 + R/1200)¹²ⁿ | rate ÷12, time ×12 |

### CI – SI Difference Formulas

**For 2 years**: CI – SI = P(R/100)²

**For 3 years**: CI – SI = P(R/100)² × (3 + R/100)

**Example**: CI – SI for ₹10,000 at 10% for 2 years
= 10,000 × (10/100)² = 10,000 × 0.01 = ₹100

### Short-Cut: Rule of 72

To find years to double your money: **Years = 72 / Rate**
- At 8%: doubles in 72/8 = 9 years (approximate)
- At 12%: doubles in 72/12 = 6 years

### Effective Annual Rate

When compounded half-yearly at rate R%:
Effective annual rate = (1 + R/200)² – 1) × 100

### Important SSC Tricks

**When rate is different each year**:
A = P × (1 + R₁/100) × (1 + R₂/100) × (1 + R₃/100)

**Present Value / Installment**: PV = A / (1 + R/100)ⁿ`,
    facts: [
      'SI Formula: SI = (P × R × T) / 100',
      'CI Formula: A = P(1 + R/100)ⁿ; CI = A - P',
      'For half-yearly compounding: rate is halved, time is doubled',
      'CI - SI for 2 years = P(R/100)²',
      'Rule of 72: Years to double = 72/Rate (approximate)',
      'Compound interest gives more return than simple interest for the same rate and time',
      'When compounding is more frequent, effective annual rate is higher',
      'For SSC: memorize P(R/100)² shortcut for 2-year CI-SI difference',
    ],
    tables: [{
      title: 'Quick Reference — SI vs CI',
      headers: ['Parameter', 'Simple Interest', 'Compound Interest'],
      rows: [
        ['Formula', 'SI = PRT/100', 'A = P(1 + R/100)ⁿ'],
        ['Interest base', 'Always on principal', 'On principal + accumulated interest'],
        ['Growth', 'Linear', 'Exponential'],
        ['Better for', 'Borrower', 'Investor/Lender'],
        ['2-year amount', 'P(1 + 2R/100)', 'P(1 + R/100)²'],
      ]
    }],
    pyqs: [
      {
        year: '2023',
        question: 'A sum of ₹8,000 is invested at 5% per annum compound interest. What is the compound interest at the end of 2 years?',
        options: ['₹800', '₹820', '₹810', '₹840'],
        answer: '₹820',
        explanation: 'A = 8000 × (1 + 5/100)² = 8000 × 1.1025 = ₹8,820. CI = 8820 - 8000 = ₹820. Alternatively, using shortcut: CI = 5% of 8000 for year 1 = 400; for year 2 = 5% of 8400 = 420; Total CI = 400 + 420 = ₹820.'
      },
      {
        year: '2022',
        question: 'If CI – SI on a certain sum at 10% per annum for 2 years is ₹50, find the principal.',
        options: ['₹4,000', '₹5,000', '₹6,000', '₹5,500'],
        answer: '₹5,000',
        explanation: 'Using formula: CI – SI = P(R/100)². 50 = P × (10/100)² = P × 0.01. Therefore P = 50/0.01 = ₹5,000.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════
  // Banking
  // ══════════════════════════════════════════════════════════════════
  {
    exam: 'Banking', subject: 'Reasoning Ability', topic: 'Logical Reasoning',
    subtopic: 'Syllogisms & Logical Deduction',
    notes: `## Syllogisms & Logical Deduction

Syllogisms are one of the most important topics in Banking exams (IBPS PO/Clerk, SBI PO/Clerk). They test deductive reasoning through logical statements.

### Types of Statements

**Universal Affirmative (A)**: "All A are B"
- Example: All dogs are animals

**Universal Negative (E)**: "No A is B"
- Example: No dog is a cat

**Particular Affirmative (I)**: "Some A are B"
- Example: Some dogs are friendly

**Particular Negative (O)**: "Some A are not B"
- Example: Some dogs are not friendly

### Rules for Drawing Conclusions

**Key Pairs to Remember**:

| Premises | Conclusion |
|----------|------------|
| A + A | A ("All A are C") |
| A + E | E ("No A is C") |
| E + A | O* ("Some C are not A") |
| E + I | O* ("Some C are not A") |
| I + A | I ("Some A are C") |
| I + E | O ("Some A are not C") |

### Venn Diagram Method (Most Reliable)

Draw Venn diagrams for each statement and check if the conclusion must be true in ALL possible diagrams.

**Strategy**:
1. Draw all possible Venn diagrams for the given statements
2. A conclusion is valid only if it holds in ALL diagrams
3. Use "complementary pair" rule for either-or conclusions

### Complementary Pairs
- "Some A are B" and "No A is B" → One MUST be true
- "All A are B" and "Some A are not B" → One MUST be true

**Example**:
Statements: All cats are dogs. Some dogs are cows.
Conclusions:
I. Some cows are cats.
II. Some dogs are cats.

**Solution**:
- All cats are dogs → All cats are inside dogs circle
- Some dogs are cows → Some dogs overlap with cows
- Conclusion I: Cannot be certain (cows may overlap only with non-cat dogs) → May or may not follow
- Conclusion II: Since all cats are dogs, reversing: Some dogs are cats → ✅ FOLLOWS

### Important Rules
1. **No conclusion from two negatives**: E + E or E + O = No conclusion
2. **No universal conclusion from two particulars**: I + I or O + O = No conclusion
3. **Either-Or**: Only valid when both conclusions are complementary AND neither definitely follows

### Practice Approach for Exams
1. Identify middle term (appears in both premises)
2. Apply the rule table
3. Verify with quick Venn diagram
4. Check "either-or" if given in options`,
    facts: [
      'Syllogisms use two premises to draw a logical conclusion — based on Aristotelian logic',
      'Four types of statements: A (All), E (No), I (Some), O (Some...not)',
      'A + A → A (Universal Affirmative conclusion possible)',
      'No conclusion can be drawn from two negative premises',
      'No universal conclusion from two particular premises (I + I = no conclusion)',
      '"Either-or" is valid only when conclusions are complementary pairs',
      'Venn diagram method is the most reliable way to solve syllogisms',
      'Banking exams typically test 5-question syllogism sets in the Reasoning section',
    ],
    tables: [{
      title: 'Syllogism Statement Types',
      headers: ['Type', 'Code', 'Form', 'Example'],
      rows: [
        ['Universal Affirmative', 'A', 'All X are Y', 'All cats are animals'],
        ['Universal Negative', 'E', 'No X is Y', 'No cat is a dog'],
        ['Particular Affirmative', 'I', 'Some X are Y', 'Some cats are friendly'],
        ['Particular Negative', 'O', 'Some X are not Y', 'Some cats are not friendly'],
      ]
    }],
    pyqs: [
      {
        year: '2022',
        question: 'Statements: All pens are books. No book is a pencil.\nConclusions: I. No pen is a pencil. II. Some books are pens.',
        options: ['Only I follows', 'Only II follows', 'Both I and II follow', 'Neither follows'],
        answer: 'Both I and II follow',
        explanation: 'From "All pens are books" + "No book is a pencil" → A + E = E conclusion: "No pen is a pencil" ✅ (Conclusion I). From "All pens are books" we can convert: "Some books are pens" ✅ (Conclusion II, by conversion of Universal Affirmative). Both follow.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════
  // State PCS
  // ══════════════════════════════════════════════════════════════════
  {
    exam: 'State PCS', subject: 'History', topic: 'Medieval India',
    subtopic: 'Vijayanagara Empire — Administration & Culture',
    notes: `## Vijayanagara Empire — Administration & Culture

The Vijayanagara Empire (1336–1646 CE) was the last great Hindu kingdom in South India. It served as a bulwark against the expansion of the Deccan Sultanates and preserved Hindu cultural traditions.

### Foundation

**Founders**: Harihara I and Bukka Raya I, brothers from the Sangama dynasty, established the empire in 1336 CE.

**Capital**: Vijayanagara (City of Victory), located near modern Hampi in Karnataka, on the banks of the Tungabhadra River.

**Foreign Accounts**: Moroccan traveler Ibn Battuta, Portuguese traders Domingo Paes and Fernao Nuniz, and Abdul Razzaq left detailed accounts of the city's grandeur.

### Four Dynasties

1. **Sangama** (1336–1485): Founded by Harihara-Bukka; greatest king — Deva Raya I & II
2. **Saluva** (1485–1505): Short dynasty; Narasimha Saluva
3. **Tuluva** (1505–1570): Greatest period; **Krishnadevaraya** (1509–29); greatest king
4. **Aravidu** (1570–1646): Final dynasty; empire declined after Battle of Talikota

### Krishnadevaraya (1509–1529)

**The Greatest Vijayanagara King**:
- Defeated Bahmani Sultans and Odisha Gajapatis
- Built the **Vittala Temple** (stone chariot famous symbol)
- Patron of Telugu literature; wrote **Amuktamalyada** (Telugu epic)
- **Ashtadiggajas**: 8 famous Telugu poets in his court, including Allasani Peddana ("Andhra Kavita Pitamaha")
- Portuguese traveler Domingo Paes described him as "perfect in all things"

### Administration

**Central Government**:
- King was absolute monarch aided by a council of ministers
- **Mahamandaleswars**: Governors of provinces (Nadu)
- **Nayakara System**: Military commanders (Nayakas) given grants of land (amaram) in return for military service

**Local Administration**:
- **Nadu** (District) → **Sthala** (Sub-district) → **Village**
- Village headmen (Gavunda/Reddi) administered at ground level

### Economy & Trade

- Traded with Portuguese, Arabs, Chinese; exported textiles, spices
- Horses imported from Arabia and Persia for cavalry
- Hampi was one of the largest cities in the world (population ~500,000)
- Markets sold diamonds, jewels, pearls openly

### Art & Architecture

**Vijayanagara Style**:
- Tall gopurams (gateway towers) with elaborate sculptures
- **Vittala Temple** — stone chariot and musical pillars
- **Hazara Rama Temple** — narrative relief carvings of Ramayana
- **Lotus Mahal** — elegant palace architecture
- **Elephant Stables** — Indo-Islamic fusion architecture

### Battle of Talikota (1565)

**Combined Deccan Sultanates** (Bijapur, Ahmadnagar, Bidar, Golkonda) defeated Vijayanagara forces. King Aliya Rama Raya was killed. Hampi was sacked and burned for months. This marked the end of Vijayanagara's political dominance.`,
    facts: [
      'Vijayanagara Empire was founded in 1336 by Harihara I and Bukka Raya I (Sangama brothers)',
      'Hampi (capital Vijayanagara) was one of the world\'s largest cities — population ~500,000 at its peak',
      'Krishnadevaraya (1509-1529) was the greatest Vijayanagara king — never lost a battle',
      'Krishnadevaraya wrote "Amuktamalyada" — a masterpiece of Telugu literature',
      'The stone chariot at Vittala Temple is one of India\'s most iconic landmarks',
      'Battle of Talikota (1565) — combined Deccan Sultanates defeated and sacked Hampi',
      'The Nayakara system gave military commanders (Nayakas) land grants for military service',
      'Portuguese travelers described Hampi as a city comparable to Lisbon and Rome',
    ],
    tables: [{
      title: 'Vijayanagara Dynasties',
      headers: ['Dynasty', 'Period', 'Key Ruler', 'Notable Achievement'],
      rows: [
        ['Sangama', '1336–1485', 'Harihara I, Bukka I, Deva Raya II', 'Founded empire; built Hampi'],
        ['Saluva', '1485–1505', 'Narasimha Saluva', 'Saved empire from internal chaos'],
        ['Tuluva', '1505–1570', 'Krishnadevaraya', 'Golden Age; literary patronage'],
        ['Aravidu', '1570–1646', 'Tirumala Raya', 'Post-Talikota survival; eventual collapse'],
      ]
    }],
    pyqs: [
      {
        year: '2020',
        question: 'The Battle of Talikota (1565) was fought between:',
        options: [
          'Vijayanagara and the Mughal Empire',
          'Vijayanagara and combined Deccan Sultanates',
          'Vijayanagara and the Portuguese',
          'Vijayanagara and the Bahmani Sultanate'
        ],
        answer: 'Vijayanagara and combined Deccan Sultanates',
        explanation: 'The Battle of Talikota (January 23, 1565) was fought between the Vijayanagara Empire and a coalition of four Deccan Sultanates: Bijapur, Ahmadnagar, Bidar, and Golkonda. Vijayanagara was defeated and Hampi was subsequently sacked.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════
  // SSC CHSL
  // ══════════════════════════════════════════════════════════════════
  {
    exam: 'SSC CHSL', subject: 'General Awareness', topic: 'Indian Polity',
    subtopic: 'Parliament — Structure & Functions',
    notes: `## Parliament — Structure & Functions

The Indian Parliament is the supreme legislative body of India. It consists of two Houses (bicameral legislature) and the President.

### Structure of Parliament

**Article 79**: Parliament = President + Rajya Sabha + Lok Sabha

#### Lok Sabha (House of the People)
- **Maximum strength**: 552 (530 states + 20 UTs + 2 Anglo-Indians; Anglo-Indian nomination abolished by 104th Amendment 2020)
- **Current strength**: 543 elected seats
- **Qualification**: Indian citizen, 25+ years age
- **Term**: 5 years (can be dissolved earlier by President on PM's advice)
- **Presiding Officer**: Speaker (elected by members)

#### Rajya Sabha (Council of States)
- **Maximum strength**: 250 (238 elected + 12 nominated by President)
- **Current strength**: 245
- **Qualification**: Indian citizen, 30+ years age
- **Term**: Permanent house; 1/3rd retire every 2 years; member term = 6 years
- **Presiding Officer**: Vice President (ex-officio Chairman)

### Sessions of Parliament

Parliament meets in three sessions:
1. **Budget Session**: February to May (longest session)
2. **Monsoon Session**: July to August
3. **Winter Session**: November to December

**Quorum**: 1/10th of total membership of each house

### Types of Bills

| Bill Type | Definition | Money Bill |
|-----------|------------|------------|
| Ordinary Bill | Any legislation | No |
| Money Bill (Art. 110) | Only money matters | Yes |
| Finance Bill | Mixed — money + general | Depends |
| Constitutional Amendment Bill | Amends Constitution | No |

### Special Powers of Each House

**Lok Sabha exclusively**:
- Confidence/No-confidence motions
- Money Bills introduced only in Lok Sabha
- Rajya Sabha can only delay Money Bills by 14 days

**Rajya Sabha exclusively**:
- Can authorize Parliament to legislate on State List subjects (Art. 249)
- Can create new All India Services (Art. 312)

### Parliamentary Procedures

**Zero Hour**: 12:00 noon — Members can raise urgent matters without prior notice

**Question Hour** (11:00 AM–12:00 PM):
- **Starred Question**: Requires oral answer + supplementary questions allowed
- **Unstarred Question**: Requires written answer only
- **Short Notice Question**: Urgent question with less than 10 days' notice

**Prorogation**: Ending a session (by President); bills pending lapse
**Dissolution**: Ending Lok Sabha's term; all pending bills lapse
**Adjournment**: Temporary suspension of sitting`,
    facts: [
      'Indian Parliament has two Houses: Lok Sabha (lower house) and Rajya Sabha (upper house)',
      'Lok Sabha has 543 elected members; maximum term is 5 years',
      'Rajya Sabha is a permanent house; 1/3rd members retire every 2 years',
      'Vice President of India is the ex-officio Chairman of Rajya Sabha',
      'Money Bills can only be introduced in Lok Sabha, not Rajya Sabha',
      'Rajya Sabha can delay a Money Bill by only 14 days (not reject it)',
      'Quorum in Parliament is 1/10th of total membership',
      'Zero Hour starts at 12 noon when members can raise urgent matters without prior notice',
    ],
    tables: [{
      title: 'Lok Sabha vs Rajya Sabha',
      headers: ['Feature', 'Lok Sabha', 'Rajya Sabha'],
      rows: [
        ['Type', 'Lower House', 'Upper House'],
        ['Max strength', '552', '250'],
        ['Current seats', '543', '245'],
        ['Age qualification', '25 years', '30 years'],
        ['Term', '5 years', '6 years (permanent body)'],
        ['Presiding officer', 'Speaker', 'Vice President'],
        ['Elected by', 'Direct election', 'State legislative assemblies'],
        ['Money Bills', 'Introduces; has more power', 'Can delay only 14 days'],
      ]
    }],
    pyqs: [
      {
        year: '2023',
        question: 'Who presides over the joint sitting of both Houses of Parliament?',
        options: ['Vice President', 'President', 'Speaker of Lok Sabha', 'Prime Minister'],
        answer: 'Speaker of Lok Sabha',
        explanation: 'According to Article 118 of the Indian Constitution, the Speaker of Lok Sabha presides over the joint sitting of both Houses of Parliament. Joint sittings are convened to resolve deadlocks on Ordinary Bills (not Money Bills or Constitutional Amendment Bills).'
      },
      {
        year: '2022',
        question: 'What is the minimum age required to become a member of the Rajya Sabha?',
        options: ['18 years', '25 years', '30 years', '35 years'],
        answer: '30 years',
        explanation: 'Article 84 of the Indian Constitution specifies that a person must be at least 30 years of age to be eligible to become a member of the Rajya Sabha (Council of States). For Lok Sabha, the minimum age is 25 years.'
      }
    ]
  },

];

// ─── Seed Function ────────────────────────────────────────────────────────────

async function seedContent() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
  console.log(`\n🔌 Connecting to MongoDB: ${uri}`);
  await mongoose.connect(uri);
  console.log('✅ Connected.\n');

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const item of CONTENT) {
    try {
      const filter = {
        exam: item.exam,
        subject: item.subject,
        topic: item.topic,
        subtopic: item.subtopic,
      };

      const result = await LearningContent.findOneAndUpdate(
        filter,
        { $set: item },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      if (result.__v === undefined || result.isNew) {
        inserted++;
        console.log(`  ✅ [INSERT] ${item.exam} | ${item.subtopic.substring(0, 50)}`);
      } else {
        updated++;
        console.log(`  🔄 [UPDATE] ${item.exam} | ${item.subtopic.substring(0, 50)}`);
      }
    } catch (err) {
      errors++;
      console.error(`  ❌ [ERROR] ${item.exam} | ${item.subtopic}: ${err.message}`);
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📊 SEEDING COMPLETE`);
  console.log(`  ✅ Inserted/Updated: ${inserted + updated}`);
  console.log(`  ❌ Errors: ${errors}`);
  console.log(`  📚 Total Content Docs: ${CONTENT.length}`);
  console.log(`${'═'.repeat(60)}\n`);

  await mongoose.disconnect();
}

seedContent().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
