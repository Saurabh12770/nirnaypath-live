/**
 * NirnayPath 3.0 — Content Factory Batch 2
 * 40+ additional subtopics across all 7 exam tracks
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const learningSchema = new mongoose.Schema({
  exam: String, subject: String, topic: String, subtopic: String,
  notes: String, facts: [String],
  tables: [{ title: String, headers: [String], rows: [[String]] }],
  pyqs: [{ year: String, question: String, options: [String], answer: String, explanation: String }],
  language: { type: String, default: 'English' },
}, { timestamps: true });

const LearningContent = mongoose.models.LearningContent
  || mongoose.model('LearningContent', learningSchema, 'learningcontents');

// ─── BATCH 2 CONTENT ──────────────────────────────────────────────────────────
const CONTENT = [

  // ══════════════════════════════════════════════════════
  // UPSC — Geography: Indian Geography
  // ══════════════════════════════════════════════════════
  {
    exam: 'UPSC', subject: 'Geography', topic: 'Indian Geography',
    subtopic: 'Physiographic Divisions of India',
    notes: `## Physiographic Divisions of India

India's landmass can be divided into **six major physiographic divisions**, each with distinct geological origin, topography, and economic significance.

### 1. The Himalayan Mountains

**Extent**: Stretches 2,500 km from Indus Gorge in the west to Brahmaputra Gorge in the east; width 150–400 km.

**Three Parallel Ranges (West to East)**:
- **Greater Himalayas (Himadri)**: Highest range; avg elevation 6,000 m; Mt. Everest (8,848 m), K2 (8,611 m); permanently snow-covered
- **Lesser Himalayas (Himachal)**: 3,700–4,500 m; Mussoorie, Shimla, Darjeeling hill stations; Valley of Flowers, Kangra Valley
- **Outer Himalayas (Shivaliks)**: 900–1,100 m; foothills; terai region (swampy); parallel valleys called **Duns** (Dehradun, Kotli Dun)

**Trans-Himalayas**: Karakoram, Ladakh, Zaskar ranges; cold desert (Ladakh); K2, Saltoro Kangri.

### 2. The Northern Plains

**Formation**: Alluvial deposits of Indus, Ganga, Brahmaputra rivers; formed over millions of years.

**Area**: ~7 lakh sq km; 2,400 km long, 240–320 km wide.

**Types of Alluvial Plains**:
| Type | Location | Characteristics |
|------|----------|----------------|
| Bhangar | Away from rivers | Older alluvium; slightly elevated; calcareous nodules (Kankar) |
| Khadar | Near rivers (floodplains) | Newer, fertile alluvium; renewed every year |
| Terai | South of Shivaliks | Swampy, forested; cleared for cultivation |
| Bhabar | At Himalayan foothills | Pebble-laden; rivers disappear underground |

### 3. The Peninsular Plateau

**Oldest landmass** of India; part of ancient Gondwanaland; made of hard crystalline rocks (Deccan Traps in west).

**Divisions**:
- **Central Highlands**: Malwa Plateau, Vindhya Range, Satpura Range; north of Narmada
- **Deccan Plateau**: South of Vindhyas; tilts west to east (rivers flow east to Bay of Bengal)
- **Chota Nagpur Plateau**: Jharkhand; mineral-rich (coal, iron ore, mica)

### 4. The Indian Desert (Thar Desert)

- Rajasthan; west of Aravalli Range
- 5th largest desert globally; receives < 150 mm rainfall
- Luni river drains the area (inland drainage)
- Barchans (crescent-shaped dunes) common

### 5. The Coastal Plains

**Western Coastal Plains** (narrow, 10–80 km):
- Konkan Coast (Goa-Maharashtra), Malabar Coast (Kerala) — backwaters (Kayals)
- Estuaries common; no major deltas

**Eastern Coastal Plains** (wider, 80–120 km):
- Coromandel Coast (Tamil Nadu-Andhra); major deltas (Krishna, Godavari, Kaveri, Mahanadi)
- Chilika Lake (Odisha) — largest coastal lagoon in India

### 6. Islands

- **Andaman & Nicobar** (Bay of Bengal): 572 islands; India's southernmost point — Indira Point; Barren Island (only active volcano in South Asia)
- **Lakshadweep** (Arabian Sea): 36 coral islands; smallest UT by area; Minicoy is southernmost`,
    facts: [
      'India has 6 major physiographic divisions: Himalayas, Northern Plains, Peninsular Plateau, Thar Desert, Coastal Plains, Islands',
      'The Himalayas stretch 2,500 km from Indus Gorge to Brahmaputra Gorge',
      'Northern Plains cover ~7 lakh sq km — the most densely populated region of India',
      'Bhangar is older alluvium; Khadar is newer, more fertile alluvium near river channels',
      'The Peninsular Plateau is the oldest landmass in India — part of ancient Gondwanaland',
      'Chota Nagpur Plateau in Jharkhand is called the "Ruhr of India" for its mineral wealth',
      'Chilika Lake (Odisha) is India\'s largest coastal lagoon and a Ramsar wetland site',
      'Barren Island in Andaman & Nicobar is the only active volcano in South Asia',
    ],
    tables: [{
      title: 'Major Passes in the Himalayas',
      headers: ['Pass', 'Location', 'Connects', 'Altitude'],
      rows: [
        ['Karakoram Pass', 'Ladakh', 'India–Xinjiang (China)', '5,540 m'],
        ['Zoji La', 'J&K', 'Srinagar–Leh', '3,528 m'],
        ['Shipki La', 'Himachal Pradesh', 'India–Tibet', '4,300 m'],
        ['Nathu La', 'Sikkim', 'India–Tibet (trade route)', '4,310 m'],
        ['Bomdi La', 'Arunachal Pradesh', 'India–Tibet', '2,415 m'],
        ['Rohtang Pass', 'Himachal Pradesh', 'Manali–Lahaul-Spiti', '3,978 m'],
      ]
    }],
    pyqs: [
      {
        year: '2020',
        question: 'Which of the following correctly describes "Bhabar"?',
        options: [
          'Swampy forested belt south of Shivaliks',
          'Pebble-laden belt at Himalayan foothills where rivers disappear underground',
          'Older alluvial deposits with calcareous nodules',
          'Newer alluvial plains near river channels'
        ],
        answer: 'Pebble-laden belt at Himalayan foothills where rivers disappear underground',
        explanation: 'Bhabar is the narrow belt (8–16 km wide) along the Himalayan foothills made of coarse pebbles, boulders and gravel. Rivers emerging from the Himalayas lose their speed and percolate through this porous Bhabar belt, disappearing underground. They re-emerge in the Terai zone further south.'
      }
    ]
  },

  {
    exam: 'UPSC', subject: 'Geography', topic: 'Indian Geography',
    subtopic: 'Indian Monsoon — Onset, Withdrawal & El Nino',
    notes: `## Indian Monsoon — Onset, Withdrawal & El Niño

The Indian monsoon is one of the world's most significant climate phenomena, affecting the agriculture, economy, and life of over 1.4 billion people.

### What is Monsoon?

The word **"monsoon"** is derived from the Arabic word **"Mausam"** (season). It refers to the seasonal reversal of winds that brings heavy rainfall to the Indian subcontinent from June to September.

### Mechanism of the Indian Monsoon

**Traditional Theory (Thermal Theory)**:
- In summer, the Indian landmass heats up faster than the Indian Ocean
- Low pressure forms over the Thar Desert/Rajasthan
- Moist winds from high-pressure Indian Ocean are drawn inland
- These moist winds rise, cool, and precipitate as monsoon rain

**Modern Theory (Jet Stream Theory)**:
- The **Subtropical Westerly Jet Stream** (over the Himalayas in winter) shifts north in summer
- The **Tropical Easterly Jet Stream** establishes over peninsular India
- This atmospheric change triggers the monsoon onset

### Onset & Progress

**Southwest Monsoon (June–September)**:
- Onset: **Kerala, June 1** (±7 days)
- Splits into two branches at Kerala:
  1. **Arabian Sea Branch**: Travels up west coast → Western Ghats (heavy rain) → Deccan (rain shadow) → continues to Gujarat, Rajasthan
  2. **Bay of Bengal Branch**: Curves around Bay of Bengal → Northeast India (heaviest rainfall) → Indo-Gangetic Plains → Punjab

**Normal Rainfall Distribution**:
- Mawsynram, Meghalaya: ~11,872 mm/year — wettest place on Earth
- Rajasthan desert: < 150 mm/year — driest
- Western Ghats windward slope: 2,000–3,000 mm

### Withdrawal

- Monsoon begins withdrawal from **Northwest India in September**
- Complete withdrawal by **mid-December from Tamil Nadu coast**
- Northeast Monsoon (Oct–Dec) brings rain to Tamil Nadu, Andhra from Bay of Bengal

### El Niño & Monsoon Failure

**El Niño**: Anomalous warming of central/eastern Pacific Ocean every 2–7 years.

**Effect on India**:
- Weakens pressure gradient between Indian Ocean and land
- Reduces moisture flow to India
- Drought conditions: Weak monsoon years correlate with El Niño (1972, 1982, 1987, 2002, 2009)

**La Niña** (opposite of El Niño): Cooling of Pacific → stronger Indian monsoon; excessive rainfall

**Indian Ocean Dipole (IOD)**:
- Positive IOD (western Indian Ocean warmer than east) → Good monsoon for India
- Negative IOD → Poor monsoon

### Economic Importance

- 60% of India's net sown area is rain-fed
- ~70% of annual rainfall comes from southwest monsoon (June–Sept)
- Good monsoon → higher agricultural output → rural consumption boost → GDP growth
- Bad monsoon → drought → food inflation → RBI dilemma`,
    facts: [
      'The word "monsoon" comes from the Arabic "Mausam" meaning season',
      'Southwest Monsoon normally arrives at Kerala on June 1 (±7 days)',
      'Mawsynram in Meghalaya receives ~11,872 mm of rain/year — wettest place on Earth',
      'The monsoon splits into Arabian Sea Branch and Bay of Bengal Branch at Kerala',
      'El Niño (warming of Pacific) typically weakens Indian monsoon; La Niña strengthens it',
      '~70% of India\'s annual rainfall comes from the June–September southwest monsoon',
      'Northeast monsoon (Oct–Dec) is important for Tamil Nadu and Andhra Pradesh',
      'Mawsynram replaced Cherrapunji as the wettest place on Earth in 1985',
    ],
    tables: [{
      title: 'Monsoon Onset — Major Stations',
      headers: ['Station/Region', 'Normal Onset Date', 'Normal Withdrawal'],
      rows: [
        ['Kerala', 'June 1', 'September 1'],
        ['Mumbai', 'June 10', 'October 5'],
        ['Delhi', 'June 29', 'September 25'],
        ['Kolkata', 'June 7', 'October 15'],
        ['Northeast India', 'June 5', 'October 20'],
        ['Northwest India', 'July 1–15', 'September 1'],
      ]
    }],
    pyqs: [
      {
        year: '2021',
        question: 'Which of the following statements about El Niño is correct?',
        options: [
          'It refers to anomalous cooling of the central Pacific Ocean',
          'It strengthens the Indian monsoon in most cases',
          'It is associated with drought conditions in India',
          'It occurs every year without fail'
        ],
        answer: 'It is associated with drought conditions in India',
        explanation: 'El Niño refers to the anomalous warming (not cooling) of the central and eastern Pacific Ocean. It weakens the pressure gradient that drives the Indian monsoon, typically leading to below-normal rainfall and drought conditions in India. It occurs every 2–7 years, not annually.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════
  // UPSC — Polity: Parliament & Executive
  // ══════════════════════════════════════════════════════
  {
    exam: 'UPSC', subject: 'Polity', topic: 'Parliament & Legislature',
    subtopic: 'Parliament — Lok Sabha & Rajya Sabha',
    notes: `## Parliament — Lok Sabha & Rajya Sabha

### Constitutional Basis

**Article 79**: Parliament of India consists of President + Council of States (Rajya Sabha) + House of the People (Lok Sabha).

**Article 80**: Constitution of Rajya Sabha
**Article 81**: Constitution of Lok Sabha

### Lok Sabha — House of the People

**Composition**: Maximum 552 members; currently 543 (530 from States, 13 from UTs). Nomination of 2 Anglo-Indians abolished by **104th Amendment, 2020**.

**Qualification** (Article 84):
- Indian citizen
- Minimum age: 25 years
- Registered voter in any parliamentary constituency
- Not disqualified under any law

**Election**: Direct election by people (First Past the Post system)

**Term**: 5 years from first sitting after general elections. Can be dissolved before 5 years by President on advice of PM. Can be extended during National Emergency (Article 352) by Parliament by 1 year at a time.

**Speaker**:
- Elected by Lok Sabha members
- Presides over Lok Sabha sessions
- Decides whether a bill is a Money Bill (Art 110)
- Presides over joint sitting of both Houses
- His vote is a casting vote (votes only when there's a tie)
- Cannot be removed except by **absolute majority** of Lok Sabha's total membership after 14-day notice

**Special Powers of Lok Sabha**:
- Money Bills originate only in Lok Sabha
- No-confidence motions only in Lok Sabha
- Rajya Sabha cannot delay Money Bills beyond 14 days
- Lok Sabha controls the executive (Vote of No-Confidence)

### Rajya Sabha — Council of States

**Composition**: Maximum 250 members:
- 238 elected representatives of States/UTs
- 12 nominated by President (Art. 80(3)) — from eminent persons in arts, literature, science, social service

**Currently**: 245 members

**Qualification** (Article 84):
- Indian citizen
- Minimum age: 30 years
- Registered voter in the State from which elected

**Election**: Indirect — by elected members of State Legislative Assemblies using **Single Transferable Vote** with proportional representation

**Term**: Rajya Sabha is a **permanent body** — cannot be dissolved. Members serve 6-year terms; 1/3rd retire every 2 years.

**Presiding Officer**: Vice President of India (ex-officio Chairman). Deputy Chairman elected by Rajya Sabha members.

**Special Powers of Rajya Sabha**:
- Art. 249: Authorize Parliament to legislate on State List (if national interest)
- Art. 312: Authorize creation of new All-India Services
- Power to initiate Constitution Amendment Bills

### Comparison Table

| Feature | Lok Sabha | Rajya Sabha |
|---------|-----------|-------------|
| Max seats | 552 | 250 |
| Minimum age | 25 years | 30 years |
| Term | 5 years | 6 years (permanent body) |
| Dissolution | Can be dissolved | Cannot be dissolved |
| Presiding officer | Speaker | Vice President |
| Election method | Direct | Indirect (by MLAs) |
| Money Bills | Sole originator | Can delay 14 days only |

### Sessions and Procedures

**Three Sessions per year**:
- Budget Session (Feb–May), Monsoon Session (Jul–Aug), Winter Session (Nov–Dec)

**Quorum**: 1/10th of total membership = 55 in Lok Sabha, 25 in Rajya Sabha

**Zero Hour**: 12:00 noon — matters of urgent public importance raised without prior notice

**Calling Attention Motion**: Member calls minister's attention to urgent matter; minister makes a statement`,
    facts: [
      'Parliament = President + Rajya Sabha + Lok Sabha (Article 79)',
      'Lok Sabha has maximum 552 members; currently 543 elected',
      'Rajya Sabha has maximum 250 members; 12 are nominated by President',
      'Speaker presides over Lok Sabha; Vice President presides over Rajya Sabha (ex-officio Chairman)',
      'Rajya Sabha is permanent — cannot be dissolved; Lok Sabha can be dissolved by President',
      'Money Bills can only originate in Lok Sabha; Rajya Sabha can only delay them 14 days',
      'Rajya Sabha can pass special resolutions to enable Parliament to legislate on State subjects (Article 249)',
      '104th Amendment (2020) abolished nomination of Anglo-Indians to Parliament and state legislatures',
    ],
    tables: [{
      title: 'Parliamentary Motions',
      headers: ['Motion', 'Purpose', 'Which House'],
      rows: [
        ['No-Confidence Motion', 'Remove government from power', 'Lok Sabha only'],
        ['Censure Motion', 'Criticize government/minister', 'Both Houses'],
        ['Adjournment Motion', 'Discuss matter of urgent public importance', 'Lok Sabha only'],
        ['Calling Attention Motion', 'Call minister\'s attention to urgent matter', 'Both Houses'],
        ['Cut Motion', 'Reduce demand for grants in Budget', 'Lok Sabha only'],
        ['Privilege Motion', 'For breach of parliamentary privilege', 'Both Houses'],
      ]
    }],
    pyqs: [
      {
        year: '2018',
        question: 'Which constitutional amendment abolished the nomination of Anglo-Indians to Parliament?',
        options: ['99th Amendment', '101st Amendment', '103rd Amendment', '104th Amendment'],
        answer: '104th Amendment',
        explanation: 'The 104th Constitutional Amendment Act, 2019 (effective January 25, 2020) abolished the provision for nomination of two Anglo-Indian members to the Lok Sabha and reserved seats for Anglo-Indians in State Legislative Assemblies.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════
  // UPSC — Environment & Ecology
  // ══════════════════════════════════════════════════════
  {
    exam: 'UPSC', subject: 'Environment & Ecology', topic: 'Ecosystems & Biodiversity',
    subtopic: 'Biodiversity Hotspots — India\'s Hotspots',
    notes: `## Biodiversity Hotspots — India's Hotspots

### What is a Biodiversity Hotspot?

A **biodiversity hotspot** is a biogeographic region that is both:
1. **Exceptionally rich** in biodiversity (≥1,500 endemic plant species)
2. **Highly threatened** — has lost ≥70% of its original habitat

**Concept coined by**: Norman Myers (1988), later refined by Conservation International.

**Global Hotspots**: 36 globally recognized hotspots covering only ~2.5% of Earth's land area but containing ~60% of world's plant, reptile, bird, and mammal species.

### India's Four Hotspots

#### 1. Western Ghats & Sri Lanka

**Location**: Runs along western coast of India — from Gujarat-Maharashtra border to Kerala; Sri Lanka included.

**Area**: ~160,000 sq km (India portion)

**Key Biodiversity**:
- ~5,000+ flowering plant species; ~1,700 endemic species
- Shola forests (stunted montane forests) unique to region
- **Lions Tailed Macaque**, Nilgiri Tahr, Malabar Giant Squirrel, King Cobra
- 508 bird species, 179 amphibian species (most highly threatened)

**Threats**: Agricultural expansion, plantations (tea, coffee, rubber), hydroelectric projects, urbanization

**Protected Areas**: Silent Valley NP, Periyar WLS, Bandipur NP, Kudremukh NP

#### 2. Himalayas (Eastern Himalayas)

**Location**: Northeast India states + Nepal, Bhutan, parts of Southwest China

**Key Biodiversity**:
- ~10,000 plant species; 3,160 endemic species
- **Snow Leopard**, Red Panda, One-horned Rhinoceros, Bengal Tiger
- Rare orchids (750+ species), rhododendrons (80+ species)
- Hornbills — 9 of India's 10 hornbill species found here

**Threats**: Shifting cultivation (Jhum), deforestation, climate change (glacier retreat)

**Protected Areas**: Namdapha NP, Manas NP, Kaziranga NP, Kanchenjunga Biosphere Reserve

#### 3. Indo-Burma (Indo-Myanmar)

**Location**: Northeast India (Manipur, Mizoram, Arunachal Pradesh border areas) + Myanmar, Thailand, Vietnam, Laos, Cambodia

**Key Biodiversity**:
- ~13,500 plant species; 2,800 endemic
- **Irrawaddy Dolphin**, Eld's Deer, Saola (Vietnam ox)
- Major center of biodiversity for freshwater turtles

**Threats**: Habitat loss, hunting, invasive species

#### 4. Sundaland

**India's connection**: Nicobar Islands (part of Sundaland hotspot)

**Location**: Malay Peninsula, Sumatra, Borneo, Java, Bali, and associated islands including Nicobar

**Key Biodiversity**: Orangutan, Sun Bear; unique island ecosystems

### Conservation Significance for India

**India's rank**: 17th megadiverse country; 4 biodiversity hotspots (most of any comparable-sized nation)

**India's key biodiversity facts**:
- 7–8% of world's flora (45,000 plant species)
- 7–8% of world's fauna (91,000 animal species)
- ~33% of flora are endemic (found only in India)`,
    facts: [
      'A biodiversity hotspot must have ≥1,500 endemic plant species AND lost ≥70% of original habitat',
      'The concept of biodiversity hotspots was coined by Norman Myers in 1988',
      'There are 36 globally recognized biodiversity hotspots covering just 2.5% of Earth\'s land',
      'India has 4 biodiversity hotspots: Western Ghats, Eastern Himalayas, Indo-Burma, Sundaland (Nicobar)',
      'Western Ghats is one of the world\'s 8 "hottest hotspots" — most critically threatened',
      'The Lion-tailed Macaque is endemic to the Western Ghats and critically endangered',
      'India contains 7-8% of the world\'s flora and fauna despite covering only 2.4% of Earth\'s area',
      'Kaziranga National Park has ~70% of world\'s one-horned rhinoceros population',
    ],
    tables: [{
      title: "India's Four Biodiversity Hotspots",
      headers: ['Hotspot', 'Location', 'Flagship Species', 'Key Threat'],
      rows: [
        ['Western Ghats & Sri Lanka', 'West coast, Maharashtra to Kerala', 'Lion-tailed Macaque, Nilgiri Tahr', 'Plantations, dams'],
        ['Eastern Himalayas', 'Northeast India, Nepal, Bhutan', 'Snow Leopard, Red Panda', 'Climate change, jhum'],
        ['Indo-Burma', 'Northeast India borders', 'Irrawaddy Dolphin, Eld\'s Deer', 'Hunting, habitat loss'],
        ['Sundaland (Nicobar)', 'Nicobar Islands', 'Leatherback Turtle', 'Tourism, development'],
      ]
    }],
    pyqs: [
      {
        year: '2019',
        question: 'Which of the following is/are India\'s recognized biodiversity hotspots?\n1. Western Ghats\n2. Eastern Himalayas\n3. Indo-Burma\nSelect:',
        options: ['1 only', '1 and 2 only', '2 and 3 only', '1, 2 and 3'],
        answer: '1, 2 and 3',
        explanation: 'India has four biodiversity hotspots: Western Ghats & Sri Lanka, Eastern Himalayas, Indo-Burma (Indo-Myanmar), and Sundaland (which includes India\'s Nicobar Islands). All three options listed are India\'s hotspots.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════
  // UPSC — Economics: Macroeconomics
  // ══════════════════════════════════════════════════════
  {
    exam: 'UPSC', subject: 'Economics', topic: 'Macroeconomics',
    subtopic: 'RBI — Structure, Functions & Monetary Policy',
    notes: `## RBI — Structure, Functions & Monetary Policy

The Reserve Bank of India (RBI) was established on **April 1, 1935** under the Reserve Bank of India Act, 1934. It was nationalized on **January 1, 1949**.

### Organizational Structure

**Headquarters**: Mumbai (Mint Road)
**Governor**: Top executive officer (currently Sanjay Malhotra, 2024–)
**Board of Directors**: Central Board (21 members) + Local Boards (4 regional boards)

**Departments**: Monetary Policy, Financial Markets, Department of Regulation, Department of Supervision, Department of Currency Management, etc.

### Functions of RBI

#### 1. Monetary Authority
- Formulates and implements monetary policy
- Objective: Maintain price stability while keeping growth in mind
- **Inflation Target**: 4% (±2%) under Flexible Inflation Targeting (FIT) framework (since 2016)

#### 2. Issuer of Currency
- Sole authority to issue currency notes (except ₹1 coin issued by Ministry of Finance)
- Issues notes in denominations of ₹2 to ₹2,000
- **Minimum Reserve System**: Must maintain minimum ₹200 crore gold + foreign securities (₹115 crore in gold)

#### 3. Banker to Government
- Manages government's banking accounts
- Issues government securities (G-Secs)
- Provides Ways and Means Advance (WMA) — short-term credit to governments

#### 4. Banker's Bank
- Holds Cash Reserve Ratio (CRR) deposits of commercial banks
- Provides Liquidity Adjustment Facility (LAF) — repo/reverse repo
- Lender of Last Resort

#### 5. Regulator & Supervisor
- Regulates and supervises all scheduled commercial banks, NBFCs, cooperative banks
- Issues banking licences
- Sets prudential norms (Capital Adequacy, NPA classification)

#### 6. Foreign Exchange Management
- Manages India's foreign exchange reserves
- Implements FEMA (Foreign Exchange Management Act, 1999)
- India's forex reserves: ~$620 billion (2024) — 4th largest in world

### Monetary Policy Tools

**Quantitative Instruments**:

| Tool | Current Rate (2024) | Effect of Increase |
|------|---------------------|-------------------|
| Repo Rate | 6.5% | Higher — reduces money supply, controls inflation |
| Reverse Repo Rate | 3.35% | Higher — banks park more with RBI |
| CRR (Cash Reserve Ratio) | 4% | Higher — less money with banks to lend |
| SLR (Statutory Liquidity Ratio) | 18% | Higher — less for lending |
| Bank Rate | 6.75% | Higher — costlier borrowing from RBI |

**Qualitative Instruments**:
- Moral suasion (advisory)
- Credit rationing
- Margin requirements

### Monetary Policy Committee (MPC)

Constituted under RBI Act (Section 45ZB) in 2016:
- **6 members**: 3 from RBI (Governor + 2 Deputy Governors) + 3 external members appointed by Central Government
- Decides the policy repo rate
- Meets every 2 months (6 times a year)
- Decisions by majority; Governor's vote decisive in tie
- **Target**: Maintain CPI inflation at 4% ± 2% band`,
    facts: [
      'RBI was established on April 1, 1935 and nationalized on January 1, 1949',
      'RBI is headquartered in Mumbai; its headquarters is on Mint Road',
      'RBI is the sole issuer of currency in India (except ₹1 coins issued by Ministry of Finance)',
      'Repo rate (2024): 6.5%; CRR: 4%; SLR: 18%',
      'Monetary Policy Committee (MPC) has 6 members — 3 from RBI and 3 external members',
      'India\'s forex reserves stand at ~$620 billion (2024) — 4th largest in the world',
      'The inflation target under FIT is 4% ± 2% band (i.e., 2–6%)',
      'RBI provides Ways and Means Advance (WMA) as short-term credit to central and state governments',
    ],
    tables: [{
      title: 'RBI Key Monetary Policy Rates (2024)',
      headers: ['Rate/Ratio', 'Current Value', 'Purpose'],
      rows: [
        ['Repo Rate', '6.50%', 'Rate at which RBI lends to commercial banks'],
        ['Reverse Repo Rate', '3.35%', 'Rate at which RBI borrows from commercial banks'],
        ['Bank Rate', '6.75%', 'Rate for long-term borrowing from RBI'],
        ['CRR', '4.00%', '% of deposits banks must hold with RBI (no interest)'],
        ['SLR', '18.00%', '% of deposits banks must hold in liquid assets'],
        ['MSF (Marginal Standing Facility)', '6.75%', 'Overnight emergency borrowing rate'],
      ]
    }],
    pyqs: [
      {
        year: '2022',
        question: 'The Monetary Policy Committee (MPC) of RBI consists of how many members?',
        options: ['4', '5', '6', '8'],
        answer: '6',
        explanation: 'The Monetary Policy Committee constituted under Section 45ZB of the RBI Act has 6 members: 3 official members from RBI (Governor + 2 deputy governors or executive directors) and 3 external members appointed by the Central Government. The Governor has a casting vote in case of a tie.'
      },
      {
        year: '2020',
        question: 'What is the inflation target set for RBI under the Flexible Inflation Targeting framework?',
        options: ['2% ± 1%', '4% ± 2%', '5% ± 1%', '6% ± 2%'],
        answer: '4% ± 2%',
        explanation: 'Under the Flexible Inflation Targeting (FIT) framework adopted in 2016, RBI is mandated to maintain CPI (Consumer Price Index) inflation at 4% with a tolerance band of ±2% (i.e., between 2% and 6%).'
      }
    ]
  },

  // ══════════════════════════════════════════════════════
  // UPSC — International Relations
  // ══════════════════════════════════════════════════════
  {
    exam: 'UPSC', subject: 'Current Affairs & General Awareness', topic: 'International Relations',
    subtopic: 'India\'s Foreign Policy — Panchsheel to Neighbourhood First',
    notes: `## India's Foreign Policy — Panchsheel to Neighbourhood First

### Foundations of India's Foreign Policy

**Non-Alignment**: India was a founding member of the Non-Aligned Movement (NAM) — avoiding military alliances with either the US or USSR during the Cold War. First NAM Summit: Belgrade, 1961.

**Panchsheel (Five Principles of Peaceful Coexistence)** — signed between India and China, April 29, 1954:
1. Mutual respect for sovereignty and territorial integrity
2. Mutual non-aggression
3. Mutual non-interference in internal affairs
4. Equality and mutual benefit
5. Peaceful coexistence

**Strategic Autonomy**: India maintains the right to take independent foreign policy positions.

### Evolution of India's Foreign Policy

**Nehru Era (1947–1964)**:
- NAM, anti-colonialism, Panchsheel
- Strong ties with USSR for industrial development
- 1962 war with China — major setback

**Indira Gandhi Era (1966–1984)**:
- 1971 Bangladesh War; Treaty of Peace with USSR
- Nuclear test at Pokhran (1974)
- More assertive regional policy

**Post-Cold War (1990s–2000s)**:
- Look East Policy (1991): Engagement with Southeast Asia, ASEAN
- Pokhran II (1998): Nuclear tests; US sanctions
- Indo-US nuclear deal (2008)

**Modi Era (2014–present)**:
- **Neighbourhood First**: Priority to SAARC nations (Bangladesh, Sri Lanka, Nepal, Bhutan, Maldives, Afghanistan, Pakistan)
- **Act East Policy**: Upgraded Look East — stronger ties with ASEAN, Japan, Australia
- **QUAD** (India-US-Japan-Australia): Maritime security cooperation
- **Indo-Pacific Strategy**: Counter China's influence; free and open Indo-Pacific
- **Vasudhaiva Kutumbakam** (G20 2023 theme): "The world is one family"

### Key Groupings India Participates In

| Grouping | Members | India's Role |
|----------|---------|-------------|
| SAARC | 8 nations (South Asia) | Largest economy; agenda stalled due to Pakistan |
| BIMSTEC | 7 nations (Bay of Bengal) | Active alternative to SAARC |
| BRICS | Brazil, Russia, India, China, S.Africa (now 10) | Key multilateral platform |
| SCO | 9 nations + observers | Security cooperation with Central Asia |
| QUAD | India, USA, Japan, Australia | Indo-Pacific security architecture |
| G20 | 20 major economies | India hosted 2023 (New Delhi Summit) |

### Neighbourhood First Policy

**Objective**: India's immediate neighbors are the primary focus of foreign policy.

**Bangladesh**: Treaty of Friendship (1972); Teesta water dispute; border management; connectivity
**Sri Lanka**: Maritime ties; Tamil minority issue; debt crisis help
**Nepal**: Open border; Kalapani-Lipulekh boundary dispute; hydropower cooperation
**Bhutan**: Special friendship; hydropower imports; China's growing influence concern
**Maldives**: India First policy under previous govt; current India-Maldives tensions (2024)
**Myanmar**: Border fencing; coup of 2021 creating instability`,
    facts: [
      'Panchsheel (Five Principles of Peaceful Coexistence) was signed between India and China in April 1954',
      'India was a founding member of the Non-Aligned Movement (NAM); first summit in Belgrade, 1961',
      'India\'s "Look East Policy" was launched in 1991; upgraded to "Act East Policy" in 2014',
      'QUAD (Quadrilateral Security Dialogue) comprises India, USA, Japan, and Australia',
      'India hosted the G20 Summit in New Delhi in September 2023 under the theme "Vasudhaiva Kutumbakam"',
      'BIMSTEC (Bay of Bengal Initiative for Multi-Sectoral Technical and Economic Cooperation) has 7 members',
      'India conducted nuclear tests in 1974 (Pokhran I — "Smiling Buddha") and 1998 (Pokhran II — "Operation Shakti")',
      '"Neighbourhood First" policy prioritizes SAARC nations as India\'s primary foreign policy focus',
    ],
    tables: [{
      title: 'India\'s Key Foreign Policy Doctrines',
      headers: ['Doctrine/Policy', 'Era', 'Key Features'],
      rows: [
        ['Non-Alignment', 'Nehru (1947–64)', 'No military blocs; Cold War neutrality'],
        ['Indira Doctrine', '1983', 'India as regional security provider in South Asia'],
        ['Gujral Doctrine', '1996', 'Non-reciprocal concessions to smaller neighbors'],
        ['Look East Policy', '1991 (Narasimha Rao)', 'Engage ASEAN; trade and investment'],
        ['Neighbourhood First', '2014 (Modi)', 'Priority to SAARC nations'],
        ['Act East Policy', '2014 (Modi)', 'Deeper strategic engagement with Indo-Pacific'],
      ]
    }],
    pyqs: [
      {
        year: '2021',
        question: 'Which of the following is NOT a principle of the Panchsheel Agreement?',
        options: [
          'Mutual respect for sovereignty and territorial integrity',
          'Mutual non-aggression',
          'Collective defence through military alliances',
          'Peaceful coexistence'
        ],
        answer: 'Collective defence through military alliances',
        explanation: 'Panchsheel (Five Principles of Peaceful Coexistence) consists of: 1) Mutual respect for sovereignty, 2) Non-aggression, 3) Non-interference in internal affairs, 4) Equality and mutual benefit, 5) Peaceful coexistence. Collective defence and military alliances are contrary to the spirit of Panchsheel.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════
  // BPSC — Polity: Bihar-specific
  // ══════════════════════════════════════════════════════
  {
    exam: 'BPSC', subject: 'Polity', topic: 'Bihar Polity',
    subtopic: 'Bihar Legislative Assembly & State Government',
    notes: `## Bihar Legislative Assembly & State Government

### Bihar's Constitutional Framework

Bihar follows the parliamentary system of governance under the Indian Constitution. The state has a **unicameral legislature** (one house) — the **Bihar Legislative Assembly (Vidhan Sabha)**.

**Note**: Bihar abolished the Legislative Council (Vidhan Parishad) in 1958 and **re-established it in 1969**. Bihar currently has both Vidhan Sabha AND Vidhan Parishad — making it **bicameral**.

### Bihar Vidhan Sabha (Legislative Assembly)

- **Total Seats**: 243
- **Current Speaker**: As per latest government
- **Term**: 5 years
- **Reservation**: SC seats — 38 (15.7%), ST seats — 2 (0.8%)

**Electoral Constituencies**: 243 assembly constituencies across 38 districts

### Bihar Vidhan Parishad (Legislative Council)

- **Total Seats**: 75
- **Composition**:
  - 27 elected by Vidhan Sabha members
  - 24 elected by local authorities
  - 12 elected by graduates
  - 6 elected by teachers
  - 6 nominated by Governor
- **Term**: 6 years; 1/3rd retire every 2 years (permanent body)
- **Presiding Officer**: Chairman (elected by members)

### State Government Structure

**Governor**:
- Constitutional head of the state
- Appointed by President on advice of PM
- Has discretionary powers (Art. 163)
- Can refer bill for President's assent

**Chief Minister**:
- Real executive head
- Leader of majority party/coalition in Vidhan Sabha
- **Current CM**: Nitish Kumar (JD-U) [as of 2024]

**Council of Ministers**:
- Collectively responsible to Vidhan Sabha
- Cabinet, Ministers of State, Deputy Ministers

### Administrative Structure

Bihar has **38 districts** (after Sheikhpura and Arwal created):
- 9 Divisions: Patna, Tirhut, Saran, Darbhanga, Kosi, Purnia, Bhagalpur, Munger, Magadha
- Districts → Sub-Divisions → Blocks → Panchayats

### Panchayati Raj in Bihar

- Bihar Panchayati Raj Act, 2006
- 3-tier system: Gram Panchayat → Panchayat Samiti → Zila Parishad
- 50% reservation for women (Bihar was first state to implement 50% reservation)
- Mukhiya: Head of Gram Panchayat; directly elected`,
    facts: [
      'Bihar Vidhan Sabha has 243 seats; Bihar Vidhan Parishad has 75 seats',
      'Bihar has a bicameral legislature — Vidhan Sabha + Vidhan Parishad',
      'Bihar Vidhan Parishad was abolished in 1958 but re-established in 1969',
      'Bihar has 38 districts organized into 9 administrative divisions',
      'Patna is the capital of Bihar; Gaya is the second largest city',
      'Bihar provides 50% reservation for women in Panchayati Raj — a pioneering move',
      'Bihar has 40 Lok Sabha seats — 4th highest in India',
      'The Governor is the constitutional head; CM is the real executive head of Bihar',
    ],
    tables: [{
      title: 'Bihar Key Administrative Facts',
      headers: ['Parameter', 'Data'],
      rows: [
        ['Capital', 'Patna'],
        ['Districts', '38'],
        ['Divisions', '9'],
        ['Vidhan Sabha seats', '243'],
        ['Vidhan Parishad seats', '75'],
        ['Lok Sabha seats', '40'],
        ['Rajya Sabha seats', '16'],
        ['State formation', 'November 1, 1956 (Bihar Day)'],
      ]
    }],
    pyqs: [
      {
        year: '2019',
        question: 'How many seats are there in the Bihar Legislative Assembly (Vidhan Sabha)?',
        options: ['225', '243', '250', '288'],
        answer: '243',
        explanation: 'The Bihar Legislative Assembly (Vidhan Sabha) has 243 seats. Of these, 38 are reserved for Scheduled Castes and 2 for Scheduled Tribes.'
      }
    ]
  },

  {
    exam: 'BPSC', subject: 'History', topic: 'Bihar History',
    subtopic: 'Freedom Struggle in Bihar — Champaran to 1947',
    notes: `## Freedom Struggle in Bihar — Champaran to 1947

Bihar played a crucial role in India's independence movement. Several key events took place on Bihar's soil that shaped the national struggle.

### Champaran Satyagraha (1917)

**Background**: British indigo planters in Champaran (North Bihar) forced peasants to grow indigo on 3/20th of their land (Tinkathia system). When synthetic indigo replaced natural indigo, planters abandoned cultivation but demanded compensation from peasants.

**Gandhi's Arrival**: Gandhi visited Champaran in April 1917 at the request of Raj Kumar Shukla. He conducted a thorough inquiry against British wishes.

**Outcome**: Government appointed an inquiry committee with Gandhi as a member. The Champaran Agrarian Act (1918) abolished the Tinkathia system. **First Satyagraha on Indian soil** by Gandhi.

**Key Leaders from Bihar**: Dr. Rajendra Prasad, Brajkishore Prasad, Anugrah Narayan Sinha

### Non-Cooperation Movement in Bihar (1920–22)

- Bihar actively participated; students left government schools
- **Bihar Vidyapith** founded (alternative national university) — Raja Darbhanga donated building
- Lawyers like Rajendra Prasad gave up legal practice
- Peasant organization (Kisan Sabha) movements in Champaran, Saran, Muzaffarpur

### Civil Disobedience in Bihar (1930–34)

- **Salt Satyagraha**: Bihar Congress made salt at various places
- **Patna High Court lawyers' strike**
- Women participated actively in boycott of foreign goods

### Individual Satyagraha (1940–41)

- Rajendra Prasad was one of the first volunteers
- Protests against forcing India into WWII without consent

### Quit India Movement (1942)

- Bihar was one of the most active states
- **Arrah Declaration**: Bihar Congress decided on parallel government
- **Ezra Pound Telegram**: Communications disrupted by freedom fighters
- Samastipur, Chapra, Dhaka railway lines disrupted by volunteers
- **Jayaprakash Narayan** escaped from Hazaribagh Jail, organized underground resistance
- **Bhopal Paswan**, **Yogendra Shukla** organized guerrilla activity

### Key Bihar Freedom Fighters

| Leader | Role |
|--------|------|
| Dr. Rajendra Prasad | Bihar's most prominent leader; India's first President |
| Jayaprakash Narayan | Socialist; escaped Hazaribagh jail; 'Loknayak' |
| Anugrah Narayan Sinha | 'Bihar Vibhuti'; first Finance Minister of Bihar |
| Jai Mangal Pandey | Martyr of 1857 revolt; hanged in Patna |
| Babu Kunwar Singh | 1857 hero from Bhojpur (Jagdishpur); fought at 80 years age |`,
    facts: [
      'Champaran Satyagraha (1917) was Gandhi\'s first Satyagraha on Indian soil',
      'The Tinkathia system forced Bihar peasants to grow indigo on 3/20th of their land',
      'Raj Kumar Shukla invited Gandhi to Champaran to address peasant grievances',
      'Bihar Vidyapith was founded during Non-Cooperation Movement as a national alternative university',
      'Jayaprakash Narayan escaped from Hazaribagh Jail during Quit India Movement (1942)',
      'Dr. Rajendra Prasad, born in Bihar, became India\'s first President (1950)',
      'Kunwar Singh of Jagdishpur fought against British in 1857 revolt at the age of 80',
      'Anugrah Narayan Sinha ("Bihar Vibhuti") was Bihar\'s first Finance Minister',
    ],
    tables: [{
      title: 'Key Events of Bihar\'s Freedom Struggle',
      headers: ['Year', 'Event', 'Key Figure', 'Significance'],
      rows: [
        ['1857', 'Revolt of 1857 in Bihar', 'Kunwar Singh (Jagdishpur)', 'First armed resistance'],
        ['1917', 'Champaran Satyagraha', 'Gandhi, Rajendra Prasad', 'First Indian Satyagraha'],
        ['1920', 'Non-Cooperation Movement', 'Rajendra Prasad', 'Bihar Vidyapith founded'],
        ['1930', 'Civil Disobedience', 'Congress leaders', 'Salt Satyagraha in Bihar'],
        ['1942', 'Quit India Movement', 'JP Narayan', 'Hazaribagh jail escape; underground resistance'],
        ['1947', 'Independence', 'All Bihar leaders', 'Bihar became part of independent India'],
      ]
    }],
    pyqs: [
      {
        year: '2017',
        question: 'The Champaran Satyagraha was primarily directed against which system?',
        options: ['Zamindari system', 'Tinkathia/Indigo system', 'Mahalwari system', 'Ryotwari system'],
        answer: 'Tinkathia/Indigo system',
        explanation: 'The Champaran Satyagraha (1917) was directed against the Tinkathia system under which European indigo planters forced peasants to cultivate indigo on at least 3/20th (3 kathas per bigha = tinkathia) of their land. Gandhi\'s inquiry led to abolition of this system through the Champaran Agrarian Act, 1918.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════
  // Railway — Math
  // ══════════════════════════════════════════════════════
  {
    exam: 'Railway', subject: 'Mathematics', topic: 'Number System',
    subtopic: 'HCF and LCM — Methods & Applications',
    notes: `## HCF and LCM — Methods & Applications

HCF (Highest Common Factor) and LCM (Least Common Multiple) are fundamental concepts tested heavily in Railway exams (RRB NTPC, Group D, JE).

### HCF (Highest Common Factor)

**Definition**: The largest number that divides all given numbers without leaving a remainder.

Also called: **GCD (Greatest Common Divisor)**

#### Method 1: Prime Factorization
Express each number as a product of prime factors. HCF = Product of **common prime factors** with **lowest powers**.

**Example**: HCF of 36, 48, 72
- 36 = 2² × 3²
- 48 = 2⁴ × 3
- 72 = 2³ × 3²
- Common primes: 2 (lowest power = 2²) and 3 (lowest power = 3¹)
- HCF = 2² × 3 = 4 × 3 = **12**

#### Method 2: Division Method (Euclidean Algorithm)
Divide larger by smaller; take remainder and divide again until remainder = 0. Last divisor = HCF.

**Example**: HCF of 56 and 98
- 98 ÷ 56 = 1, remainder 42
- 56 ÷ 42 = 1, remainder 14
- 42 ÷ 14 = 3, remainder 0
- **HCF = 14**

### LCM (Least Common Multiple)

**Definition**: The smallest number that is divisible by all the given numbers.

#### Method 1: Prime Factorization
LCM = Product of **all prime factors** with **highest powers**.

**Example**: LCM of 12, 18, 24
- 12 = 2² × 3
- 18 = 2 × 3²
- 24 = 2³ × 3
- LCM = 2³ × 3² = 8 × 9 = **72**

#### Method 2: Division Method (Ladder Method)
Divide all numbers simultaneously by their common factors.

### Key Relationship

**HCF × LCM = Product of two numbers**
(Only for exactly TWO numbers)

**Example**: HCF of 8, 12 = 4; LCM = 24; Product = 8 × 12 = 96; HCF × LCM = 4 × 24 = 96 ✓

### Application Problems

**Type 1 — Largest tile/square/container**:
Find the largest square tile that fits exactly in a rectangular floor without cutting.
→ Answer = HCF of length and width

**Type 2 — When do events coincide?**:
Two signals flash at intervals of 15 min and 20 min. After how long do they flash together?
→ Answer = LCM of 15 and 20 = 60 minutes

**Type 3 — Equal distribution**:
Largest basket to distribute 48 mangoes and 60 oranges equally without remainder.
→ HCF(48, 60) = 12

**Type 4 — Bells/Traffic lights**:
Bells ring at 3, 4, 5 min intervals. LCM = 60 min → they ring together every 60 minutes

**Type 5 — Number that leaves same remainder**:
Find the largest number that divides a, b, c leaving remainder r in each case.
→ HCF(a–r, b–r, c–r)`,
    facts: [
      'HCF = product of common prime factors with lowest powers',
      'LCM = product of all prime factors with highest powers',
      'HCF × LCM = Product of two numbers (valid only for exactly 2 numbers)',
      'HCF of consecutive numbers is always 1 (they are co-prime)',
      'LCM of co-prime numbers = their product',
      'HCF of fractions = HCF of numerators / LCM of denominators',
      'LCM of fractions = LCM of numerators / HCF of denominators',
      'Euclidean algorithm (division method) is the fastest way to find HCF for large numbers',
    ],
    tables: [{
      title: 'HCF and LCM Quick Formulas',
      headers: ['Concept', 'Formula/Rule', 'Example'],
      rows: [
        ['HCF × LCM', '= Product of two numbers', 'HCF(8,12)×LCM(8,12) = 96 = 8×12'],
        ['HCF of fractions', 'HCF of numerators / LCM of denominators', 'HCF(2/3, 4/9) = 2/9'],
        ['LCM of fractions', 'LCM of numerators / HCF of denominators', 'LCM(2/3, 4/9) = 4/3'],
        ['Co-prime numbers', 'HCF = 1; LCM = product', 'HCF(7,13)=1; LCM=91'],
        ['Consecutive integers', 'Always co-prime', 'HCF(n, n+1) = 1 always'],
      ]
    }],
    pyqs: [
      {
        year: '2023',
        question: 'The HCF of two numbers is 11 and their LCM is 7700. If one of the numbers is 275, find the other.',
        options: ['279', '308', '312', '315'],
        answer: '308',
        explanation: 'Using HCF × LCM = Product of two numbers: 11 × 7700 = 275 × other. Other = (11 × 7700) / 275 = 84700 / 275 = 308.'
      },
      {
        year: '2022',
        question: 'What is the least number of soldiers that can be arranged in rows of 12, 15, and 18 with none left over?',
        options: ['90', '120', '150', '180'],
        answer: '180',
        explanation: 'LCM of 12, 15, 18 = LCM(12,15,18). Prime factors: 12=2²×3, 15=3×5, 18=2×3². LCM = 2²×3²×5 = 4×9×5 = 180.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════
  // SSC CGL — English
  // ══════════════════════════════════════════════════════
  {
    exam: 'SSC CGL', subject: 'English Language', topic: 'Grammar',
    subtopic: 'Active and Passive Voice',
    notes: `## Active and Passive Voice

Voice is one of the most regularly tested grammar topics in SSC CGL. Understanding the rules thoroughly ensures easy scoring.

### What is Voice?

**Active Voice**: The subject performs the action.
- "The teacher **teaches** the students."

**Passive Voice**: The subject receives the action.
- "The students **are taught** by the teacher."

### Structure of Passive Voice

**Passive = Object + Helping Verb (be-form) + Past Participle + by + Subject**

| Tense | Active | Passive |
|-------|--------|---------|
| Simple Present | He writes a letter | A letter is written by him |
| Present Continuous | He is writing a letter | A letter is being written by him |
| Present Perfect | He has written a letter | A letter has been written by him |
| Simple Past | He wrote a letter | A letter was written by him |
| Past Continuous | He was writing a letter | A letter was being written by him |
| Past Perfect | He had written a letter | A letter had been written by him |
| Simple Future | He will write a letter | A letter will be written by him |
| Future Perfect | He will have written a letter | A letter will have been written by him |

### Subject-Object Pronoun Change

| Active | Passive |
|--------|---------|
| I | me |
| We | us |
| He | him |
| She | her |
| They | them |
| You | you |
| It | it |

### Rules for Special Cases

**1. Sentences with two objects**:
Active: "She gave me a book." (me = indirect object; book = direct object)
Passive (using IO): "I was given a book by her."
Passive (using DO): "A book was given to me by her."

**2. Modal Verbs** (can, could, may, might, should, must, will, would):
Active: "You must do this work."
Passive: "This work must be done by you."

**3. Interrogative sentences**:
Active: "Who wrote this letter?"
Passive: "By whom was this letter written?"

**4. Imperative sentences**:
Active: "Open the door."
Passive: "Let the door be opened."

**5. By-phrase can be omitted** when agent is unknown/unimportant:
"He was killed." (by whom — unknown)
"English is spoken worldwide." (by people — obvious)

### Common Errors to Avoid

❌ Wrong: "A letter is being wrote by him."
✅ Right: "A letter is being written by him." (use past participle, not past tense)

❌ Wrong: "The cake was eaten by they."
✅ Right: "The cake was eaten by them."`,
    facts: [
      'In active voice, subject performs the action; in passive voice, subject receives the action',
      'Passive voice structure: Object + be-form + Past Participle + (by + Agent)',
      'Pronoun "I" becomes "me", "He" becomes "him", "They" becomes "them" in passive',
      'Progressive/continuous tenses use "being": "is being written", "was being read"',
      'Perfect tenses use "been": "has been done", "had been completed"',
      'Modal verbs in passive: Modal + be + Past Participle (e.g., "must be done")',
      'The "by" agent phrase can be omitted when the doer is unknown or obvious',
      'Imperative active → "Let + object + be + past participle" in passive',
    ],
    tables: [{
      title: 'Quick Passive Voice Conversion Guide',
      headers: ['Tense', 'Active Helping Verb', 'Passive Form'],
      rows: [
        ['Simple Present', 'V1 / do/does', 'am/is/are + V3'],
        ['Present Continuous', 'is/am/are + V-ing', 'is/am/are + being + V3'],
        ['Present Perfect', 'has/have + V3', 'has/have + been + V3'],
        ['Simple Past', 'V2 / did', 'was/were + V3'],
        ['Past Continuous', 'was/were + V-ing', 'was/were + being + V3'],
        ['Past Perfect', 'had + V3', 'had + been + V3'],
        ['Simple Future', 'will + V1', 'will + be + V3'],
        ['Modal', 'modal + V1', 'modal + be + V3'],
      ]
    }],
    pyqs: [
      {
        year: '2023',
        question: 'Change to passive voice: "The manager will announce the results tomorrow."',
        options: [
          'The results will be announced by the manager tomorrow.',
          'The results will announce by the manager tomorrow.',
          'The results are announced by the manager tomorrow.',
          'The results will have been announced by the manager tomorrow.'
        ],
        answer: 'The results will be announced by the manager tomorrow.',
        explanation: 'Simple Future active: Subject + will + V1 + Object. Passive: Object + will + be + V3 + by + Subject. So "the manager will announce the results" → "The results will be announced by the manager".'
      }
    ]
  },

  // ══════════════════════════════════════════════════════
  // SSC CGL — General Awareness
  // ══════════════════════════════════════════════════════
  {
    exam: 'SSC CGL', subject: 'General Awareness', topic: 'Indian Polity',
    subtopic: 'Constitutional Bodies — CAG, UPSC, Election Commission',
    notes: `## Constitutional Bodies — CAG, UPSC, Election Commission

Constitutional bodies are established directly by the Constitution. Their independence is protected by constitutional provisions.

### 1. Comptroller and Auditor General (CAG) — Article 148

**Role**: Financial watchdog of India — audits accounts of Union and States.

**Appointment**: By President (by warrant under his hand and seal)

**Removal**: Same process as removal of a Supreme Court judge — by President on address of both Houses of Parliament on grounds of proved misbehaviour or incapacity.

**Tenure**: 6 years OR till age 65, whichever is earlier. Not eligible for further government employment after retirement.

**Functions**:
- Audits all expenditure from Consolidated Fund of India and States
- Audits receipts and expenditure of all Union and State bodies
- Submits audit reports to President (Union) and Governor (State) → laid before Parliament/Legislature
- Acts as a friend, philosopher and guide to the Public Accounts Committee (PAC)

**Independence Secured**:
- Salary charged on Consolidated Fund of India (not voted by Parliament)
- Cannot be removed easily (like SC judge)
- Not eligible for any government office after retirement

**Current CAG**: Girish Chandra Murmu (since 2020)

### 2. Union Public Service Commission (UPSC) — Article 315

**Role**: Recruitment agency for All India Services (IAS, IPS, IFS) and Central Services.

**Appointment**: Chairman and members appointed by President.

**Removal**: By President on grounds of misbehaviour — proved by inquiry by SC.

**Tenure**: 6 years or age 65, whichever is earlier. Chairman not eligible for further employment; members can be Chairman of any State PSC.

**Functions**:
- Conducts Civil Services Examination (CSE) for IAS, IPS, IFS
- Conducts examinations for all Central services (NDA, CDS, CAPF, etc.)
- Advises on promotions, disciplinary matters, service rules
- Annual report to President → laid before Parliament

### 3. Election Commission of India (ECI) — Article 324

**Role**: Superintendence, direction, and control of elections.

**Established**: January 25, 1950 (National Voters' Day celebrated on this date)

**Composition**:
- 1 Chief Election Commissioner + 2 Election Commissioners (3-member body since 1989)
- **Appointment**: By President; terms set by Parliament (Act of 2023)
- **Removal**: Chief Election Commissioner — only by Parliament (like SC judge removal); Election Commissioners removed by President on CEC's recommendation

**Tenure**: 6 years or age 65, whichever is earlier.

**Functions**:
- Conducts Lok Sabha, Rajya Sabha, State Assembly, President, VP elections
- Recognizes political parties; allots election symbols
- Implements Model Code of Conduct (MCC) during elections
- Announces election schedule

**Current CEC**: Rajiv Kumar (as of 2024)`,
    facts: [
      'CAG (Article 148) is the financial watchdog of India — audits all government accounts',
      'CAG serves for 6 years or till age 65 (whichever is earlier) and cannot hold further government office',
      'UPSC (Article 315) conducts Civil Services Examination for IAS, IPS, IFS and other Central services',
      'Election Commission of India was established on January 25, 1950 (National Voters\' Day)',
      'ECI became a multi-member body in 1989 — now has Chief Election Commissioner + 2 Election Commissioners',
      'The Chief Election Commissioner can only be removed by Parliament (same as Supreme Court judge)',
      'CAG\'s salary is charged to the Consolidated Fund of India — cannot be reduced by Parliament',
      'UPSC Chairman cannot hold any further government appointment after retirement',
    ],
    tables: [{
      title: 'Key Constitutional Bodies Comparison',
      headers: ['Body', 'Article', 'Appointed By', 'Tenure', 'Key Function'],
      rows: [
        ['CAG', '148', 'President', '6 yrs or 65 yrs', 'Government audit'],
        ['UPSC', '315', 'President', '6 yrs or 65 yrs', 'Civil service recruitment'],
        ['ECI', '324', 'President', '6 yrs or 65 yrs', 'Election management'],
        ['Finance Commission', '280', 'President', '5 years', 'Centre-State tax sharing'],
        ['Attorney General', '76', 'President', 'Pleasure of President', 'Legal adviser to Government'],
        ['NHRC', 'Statute', 'President', '5 yrs or 70 yrs', 'Human rights protection'],
      ]
    }],
    pyqs: [
      {
        year: '2022',
        question: 'The Comptroller and Auditor General of India submits audit reports to:',
        options: [
          'Prime Minister',
          'Parliament directly',
          'President of India',
          'Finance Minister'
        ],
        answer: 'President of India',
        explanation: 'The CAG submits audit reports relating to the Union accounts to the President (Article 151), who then causes them to be laid before both Houses of Parliament. For State accounts, reports go to the Governor, who lays them before the State Legislature.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════
  // Banking — Quantitative Aptitude
  // ══════════════════════════════════════════════════════
  {
    exam: 'Banking', subject: 'Quantitative Aptitude', topic: 'Data Interpretation',
    subtopic: 'Bar Graphs, Line Charts & Pie Charts',
    notes: `## Bar Graphs, Line Charts & Pie Charts — Data Interpretation

Data Interpretation (DI) is one of the highest-scoring sections in banking exams (IBPS PO, SBI PO, RRB PO). Speed and accuracy are key.

### Types of DI Sets

1. **Bar Graph** — Comparison of quantities across categories
2. **Line Graph** — Trend over time (growth/decline)
3. **Pie Chart** — Part-to-whole relationships (percentages)
4. **Table** — Grid of data; most precise
5. **Mixed DI** — Combination of above (common in Mains)
6. **Caselet/Paragraph DI** — Data given as text (SBI PO Mains)

### Bar Graph Tips

**Formula approach**:
- % Change = (New – Old) / Old × 100
- Ratio = A : B (simplify by finding HCF)
- Average = Sum / Count

**Speed Trick**: For percentage change, memorize fraction-to-percentage table:
- 1/6 ≈ 16.67%, 1/7 ≈ 14.28%, 1/8 = 12.5%, 1/9 ≈ 11.11%

### Pie Chart Calculations

**Pie chart values are in degrees or percentages**:
- If in degrees: Value = (Degree/360) × Total
- If in percentage: Value = (Percentage/100) × Total

**Example**: Total sales = ₹240 crore. Sector A = 30%. Sales of A = 30/100 × 240 = ₹72 crore.

**Central angle**: If a sector is 18% → Angle = 18/100 × 360 = 64.8°

### Line Graph Tips

- **Slope upward** = Increase; steeper slope = faster growth
- **Slope downward** = Decrease
- **Flat line** = No change

**Maximum growth**: Find year with steepest upward slope; calculate % change for verification

### Common Calculation Shortcuts

**Percentage calculations**:
- 10% of X = X/10
- 5% = half of 10%
- 15% = 10% + 5%
- 25% = X/4
- 33.33% = X/3

**Approximation** (crucial for DI speed):
- Round numbers to nearest 5 or 10 for quick estimates
- 198 × 52 ≈ 200 × 50 = 10,000 (then adjust)

### Strategy for DI Sets (5 questions)

**Step 1**: Read all questions before reading data (30 seconds)
**Step 2**: Identify which data points are needed
**Step 3**: Answer easiest questions first
**Step 4**: Use approximation wherever exact answer isn't needed
**Step 5**: Cross-check answer with options (elimination)

**Time budget**: 5 DI questions in 5–6 minutes in Prelims; 10 minutes in Mains

### Frequently Tested Calculations

| Question Type | Formula |
|--------------|---------|
| % increase/decrease | (Change/Original) × 100 |
| Simple average | Sum / Number of items |
| Ratio | A:B = A/B (simplify) |
| % share | (Part/Total) × 100 |
| Multiple year growth | Compound approach |`,
    facts: [
      'Data Interpretation contributes 15-20 questions in IBPS PO/SBI PO Prelims',
      'Pie chart in degrees: Value = (Degree/360) × Total; in %: Value = (Percent/100) × Total',
      '% change formula: (New - Old) / Old × 100',
      'For DI speed, memorize fraction-percentage equivalents (1/6 = 16.67%, 1/8 = 12.5%, etc.)',
      'Read all 5 DI questions before starting to identify what data you need',
      'Approximation is key — round numbers smartly to save time',
      'Mixed DI (bar + table or pie + line) is common in banking Mains exams',
      'Caselet DI requires forming a table from text — practice converting paragraph data to table format',
    ],
    tables: [{
      title: 'Fraction to Percentage Quick Reference',
      headers: ['Fraction', 'Percentage', 'Fraction', 'Percentage'],
      rows: [
        ['1/2', '50%', '1/7', '14.28%'],
        ['1/3', '33.33%', '1/8', '12.5%'],
        ['1/4', '25%', '1/9', '11.11%'],
        ['1/5', '20%', '1/11', '9.09%'],
        ['1/6', '16.67%', '1/12', '8.33%'],
      ]
    }],
    pyqs: [
      {
        year: '2023',
        question: 'In a pie chart, if the central angle for a sector is 72°, what is its percentage share of the total?',
        options: ['18%', '20%', '22%', '25%'],
        answer: '20%',
        explanation: 'Percentage = (Central Angle / 360) × 100 = (72/360) × 100 = 0.2 × 100 = 20%.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════
  // Banking — General Awareness (Banking Awareness)
  // ══════════════════════════════════════════════════════
  {
    exam: 'Banking', subject: 'General Awareness', topic: 'Banking Awareness',
    subtopic: 'Types of Bank Accounts & Banking Products',
    notes: `## Types of Bank Accounts & Banking Products

### Types of Deposit Accounts

#### 1. Savings Account
- For individual savers; encourages savings
- Currently earns: 2.7%–7% interest (varies by bank)
- **Minimum Balance**: Varies (₹500–₹10,000); Zero-balance for Jan Dhan
- **Withdrawal limit**: 4–5 times per month in many banks
- KYC mandatory

#### 2. Current Account (CA)
- For businesses, traders, companies
- **No interest paid** on balance
- **No withdrawal limit** — unlimited transactions
- **Overdraft facility** available
- **Minimum balance**: Higher than savings (₹5,000–₹25,000+)

#### 3. Fixed Deposit (FD)
- Money locked for fixed period (7 days to 10 years)
- Higher interest than savings (currently 6.5%–9% for general; 7%–9.5% for senior citizens)
- Premature withdrawal allowed (penalty)
- **TDS deducted** if interest > ₹40,000/year (₹50,000 for senior citizens)
- Deposit insurance by DICGC: up to ₹5 lakh per depositor per bank

#### 4. Recurring Deposit (RD)
- Fixed monthly installment for a fixed period
- Gets FD-like interest rate
- Good for disciplined monthly savers
- Interest compounded quarterly

#### 5. No-Frills Account / Jan Dhan Account
- Under PMJDY (Pradhan Mantri Jan Dhan Yojana)
- Zero minimum balance
- Free RuPay Debit card
- ₹2 lakh accident insurance, ₹30,000 life insurance
- Overdraft up to ₹10,000

### Key Banking Products

| Product | Purpose | Key Feature |
|---------|---------|-------------|
| Home Loan | Buy/construct home | Longest tenure (30 years); lowest rate |
| Personal Loan | Any purpose | No collateral; higher rate |
| Education Loan | Studies in India/abroad | Moratorium period |
| Vehicle Loan | Buy car/two-wheeler | Asset as collateral |
| Gold Loan | Immediate liquidity | Gold as collateral; fast processing |
| Credit Card | Revolving credit | Interest-free period (45–50 days) |

### Important Banking Terminology

**NEFT** (National Electronic Funds Transfer): 
- Online fund transfer; settles in half-hourly batches; 24×7 since December 2019
- No minimum/maximum limit for transfers

**RTGS** (Real Time Gross Settlement):
- Real-time online transfer; for large amounts
- Minimum: ₹2 lakh; No maximum limit; Available 24×7 since December 2020

**IMPS** (Immediate Payment Service):
- Instant 24×7 transfer; mobile/internet banking
- Up to ₹5 lakh per transaction

**UPI** (Unified Payments Interface):
- NPCI's real-time payment system; uses VPA (Virtual Payment Address)
- Up to ₹1 lakh per transaction (₹5 lakh for some categories like IPO)

**NPA** (Non-Performing Asset): Loan where interest/principal not paid for 90+ days

**CIBIL Score**: Credit score (300–900); 750+ considered good for loan approval`,
    facts: [
      'Current accounts earn NO interest; savings accounts earn interest (2.7%–7%)',
      'DICGC insures bank deposits up to ₹5 lakh per depositor per bank',
      'RTGS minimum transfer amount is ₹2 lakh; NEFT has no minimum limit',
      'IMPS is available 24×7; allows instant transfers up to ₹5 lakh',
      'UPI (Unified Payments Interface) is managed by NPCI and allows transfers up to ₹1 lakh per transaction',
      'A loan becomes NPA if interest/principal is unpaid for 90+ days',
      'PMJDY accounts have zero minimum balance and offer ₹2 lakh accident insurance',
      'CIBIL score ranges from 300 to 900; 750+ is considered good for loan approvals',
    ],
    tables: [{
      title: 'NEFT vs RTGS vs IMPS vs UPI',
      headers: ['Feature', 'NEFT', 'RTGS', 'IMPS', 'UPI'],
      rows: [
        ['Full form', 'National Electronic Funds Transfer', 'Real Time Gross Settlement', 'Immediate Payment Service', 'Unified Payments Interface'],
        ['Settlement', 'Half-hourly batches', 'Real-time (gross)', 'Instant', 'Instant'],
        ['Minimum', 'No limit', '₹2 lakh', 'No limit', 'No limit'],
        ['Maximum', 'No limit', 'No limit', '₹5 lakh', '₹1–5 lakh'],
        ['Availability', '24×7', '24×7', '24×7', '24×7'],
        ['Managed by', 'RBI', 'RBI', 'NPCI', 'NPCI'],
      ]
    }],
    pyqs: [
      {
        year: '2022',
        question: 'What is the minimum amount for an RTGS transaction?',
        options: ['₹50,000', '₹1 lakh', '₹2 lakh', '₹5 lakh'],
        answer: '₹2 lakh',
        explanation: 'RTGS (Real Time Gross Settlement) is designed for high-value transactions with a minimum transfer amount of ₹2 lakh. There is no maximum limit for RTGS transfers. RTGS provides real-time (immediate) settlement of funds.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════
  // State PCS — Economy
  // ══════════════════════════════════════════════════════
  {
    exam: 'State PCS', subject: 'Economics', topic: 'Indian Economy',
    subtopic: 'GST — Structure & Implementation',
    notes: `## GST — Structure & Implementation

The Goods and Services Tax (GST) is one of India's most significant tax reforms since independence. It replaced a complex web of indirect taxes with a unified system.

### What is GST?

GST is a **comprehensive, destination-based, multi-stage indirect tax** levied on the **value addition** at each stage of supply chain. It replaced Central Excise Duty, Service Tax, VAT, CST, Entertainment Tax, and several other taxes.

**Constitutional basis**: 101st Constitutional Amendment Act, 2016 inserted Article 246A (special provision for GST), Article 269A (levy by Parliament), Article 279A (GST Council).

**Implementation date**: July 1, 2017

**Tagline**: "One Nation, One Tax, One Market"

### Dual GST Structure

India follows a **dual GST** model where both Centre and States levy taxes simultaneously:

| Type | Full Form | Levied by | Applicable on |
|------|-----------|-----------|---------------|
| CGST | Central GST | Central Government | Intra-state transactions |
| SGST | State GST | State Government | Intra-state transactions |
| IGST | Integrated GST | Central Government | Inter-state + imports |
| UTGST | Union Territory GST | UT Administration | UT transactions |

**Intra-state**: CGST + SGST
**Inter-state**: IGST (Centre collects; shares with destination state)

### GST Rates (Slabs)

| Rate | Category |
|------|----------|
| 0% (Exempt) | Essential food items (fresh vegetables, milk, eggs, unprocessed cereals), books, newspapers |
| 5% | Basic necessities (packaged food, agarbatti, life-saving medicines) |
| 12% | Processed food, business class air travel, computers |
| 18% | Standard rate; most goods and services (AC restaurants, electronics, telecom) |
| 28% | Luxury and sin goods (cars, tobacco, pan masala, aerated drinks) |

**Cess**: Additional cess on top of 28% for tobacco, luxury cars (compensation cess for states)

### GST Council

- **Constitutional body** under Article 279A
- Chairman: **Finance Minister of India** (Union Finance Minister)
- Members: Finance Ministers of all states
- Recommendations on GST rates, exemptions, threshold limits
- Decisions require: 75% majority (Centre has 1/3rd weightage, States have 2/3rd)

### Input Tax Credit (ITC)

ITC allows businesses to deduct the GST paid on inputs from GST payable on output.

**Example**: Manufacturer pays ₹1,800 GST on raw materials; collects ₹3,600 GST on finished goods. Net GST payable = 3,600 – 1,800 = ₹1,800.

ITC prevents **cascading effect** (tax on tax) — a key advantage of GST.

### GST Network (GSTN)

- IT backbone of GST; private company (initially 51% private, now 100% government)
- Facilitates registration, filing returns, payment
- Aadhaar-based authentication for registration`,
    facts: [
      'GST was implemented from July 1, 2017 — replacing 17 major taxes and 23 cesses',
      '101st Constitutional Amendment (2016) provided the constitutional basis for GST',
      'India follows Dual GST: Centre levies CGST; States levy SGST; IGST for inter-state transactions',
      'GST has four main rate slabs: 5%, 12%, 18%, and 28% (plus 0% exempt category)',
      'GST Council is chaired by the Union Finance Minister; includes all State Finance Ministers',
      'GST Council decisions require 75% majority — Centre has 1/3rd, States have 2/3rd weightage',
      'Input Tax Credit (ITC) eliminates cascading effect (tax-on-tax) under GST',
      'GSTN (GST Network) is the IT infrastructure backbone for GST compliance',
    ],
    tables: [{
      title: 'Taxes Replaced by GST',
      headers: ['Central Taxes Replaced', 'State Taxes Replaced'],
      rows: [
        ['Central Excise Duty', 'Value Added Tax (VAT)'],
        ['Service Tax', 'Central Sales Tax (CST)'],
        ['Customs Duty (partial)', 'Entertainment Tax'],
        ['Additional Customs Duty', 'Entry Tax/Octroi'],
        ['Special Additional Duty', 'Luxury Tax'],
        ['Central Sales Tax', 'Purchase Tax'],
      ]
    }],
    pyqs: [
      {
        year: '2021',
        question: 'Which constitutional amendment paved the way for GST implementation in India?',
        options: ['99th Amendment', '100th Amendment', '101st Amendment', '103rd Amendment'],
        answer: '101st Amendment',
        explanation: 'The Constitution (101st Amendment) Act, 2016 inserted Article 246A, 269A, and 279A to provide the constitutional framework for GST. It enabled both Parliament and State Legislatures to make laws regarding GST simultaneously.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════
  // SSC CHSL — Science
  // ══════════════════════════════════════════════════════
  {
    exam: 'SSC CHSL', subject: 'General Science', topic: 'Chemistry',
    subtopic: 'Acids, Bases & Salts',
    notes: `## Acids, Bases & Salts

This topic is a regular feature in SSC CHSL General Awareness. Understanding basics and everyday examples is key.

### Acids

**Definition**: Substances that produce H⁺ (hydrogen ions) in aqueous solution. pH < 7.

**Properties**:
- Sour taste (lemon, tamarind)
- Turn blue litmus red
- Conduct electricity in solution
- React with metals to produce H₂ gas
- React with bases to form salt + water (neutralization)

**Types**:
- **Strong acids** (fully ionize): HCl, H₂SO₄, HNO₃
- **Weak acids** (partially ionize): Acetic acid (CH₃COOH), Carbonic acid (H₂CO₃)

**Common Acids & Sources**:

| Acid | Chemical Name | Source |
|------|--------------|--------|
| Acetic acid | Ethanoic acid | Vinegar |
| Citric acid | — | Lemon, orange |
| Lactic acid | — | Sour milk, curd |
| Oxalic acid | — | Spinach, tomato |
| Malic acid | — | Apple |
| Tartaric acid | — | Tamarind, grapes |
| Formic acid | Methanoic acid | Ant sting, nettles |
| Hydrochloric acid | HCl | Gastric juice (stomach) |

### Bases

**Definition**: Substances that produce OH⁻ (hydroxide ions) in solution. pH > 7.

**Properties**:
- Bitter taste, soapy feel
- Turn red litmus blue
- Conduct electricity in solution
- React with acids (neutralization)

**Alkalis**: Bases that dissolve in water (NaOH, KOH, Ca(OH)₂)

**Common Bases**:
- NaOH (sodium hydroxide): Caustic soda — soap making
- Ca(OH)₂ (calcium hydroxide): Slaked lime — whitewash, cement
- NH₄OH (ammonium hydroxide): Cleaning agent, fertilizers
- Mg(OH)₂: Milk of magnesia — antacid

### Salts

**Formation**: Acid + Base → Salt + Water (Neutralization)

**Common Salts**:
| Salt | Formula | Common Name | Use |
|------|---------|-------------|-----|
| Sodium chloride | NaCl | Common salt | Food, preservation |
| Sodium carbonate | Na₂CO₃ | Washing soda | Cleaning, glass |
| Sodium bicarbonate | NaHCO₃ | Baking soda | Baking, antacid |
| Calcium carbonate | CaCO₃ | Limestone/chalk | Cement, chalk |
| Calcium sulphate | CaSO₄·2H₂O | Gypsum | Plaster of Paris |
| Copper sulphate | CuSO₄ | Blue vitriol | Fungicide |

### pH Scale

- pH 0–6.9: Acidic
- pH 7: Neutral (pure water)
- pH 7.1–14: Basic/Alkaline

**Important pH values**:
- Stomach acid (HCl): 1.5–2
- Lemon juice: 2–3
- Vinegar: 3
- Human blood: 7.35–7.45 (slightly alkaline)
- Milk: 6.5–6.7 (slightly acidic)
- Seawater: 8.1
- Bleach: 12–13

### Indicators

| Indicator | Acidic medium | Basic medium | Neutral |
|-----------|--------------|--------------|---------|
| Litmus | Red | Blue | Purple |
| Methyl orange | Red | Yellow | Orange |
| Phenolphthalein | Colorless | Pink/Red | Colorless |
| Universal indicator | Red → Orange | Blue → Violet | Green |`,
    facts: [
      'Acids produce H⁺ ions; Bases produce OH⁻ ions in aqueous solution',
      'pH < 7 = Acidic; pH = 7 = Neutral; pH > 7 = Basic/Alkaline',
      'Blue litmus turns red in acid; Red litmus turns blue in base',
      'Gastric juice in human stomach contains HCl (pH ~1.5-2)',
      'Human blood has pH 7.35-7.45 — slightly alkaline',
      'Vinegar is dilute acetic acid (CH₃COOH); lemon juice contains citric acid',
      'NaOH (Caustic soda) is used in soap making; Ca(OH)₂ (Slaked lime) in whitewash',
      'Baking soda (NaHCO₃) reacts with acid (in baking) to produce CO₂ — makes bread/cake rise',
    ],
    tables: [{
      title: 'Common Acids and Their Natural Sources',
      headers: ['Acid', 'Source', 'pH Range'],
      rows: [
        ['Citric acid', 'Lemon, orange', '2–3'],
        ['Acetic acid', 'Vinegar', '3'],
        ['Lactic acid', 'Curd, sour milk', '4–5'],
        ['Malic acid', 'Apple', '3–4'],
        ['Tartaric acid', 'Tamarind, grapes', '3'],
        ['Oxalic acid', 'Spinach, tomato', '1–2'],
        ['Formic acid', 'Ant sting', '3–4'],
      ]
    }],
    pyqs: [
      {
        year: '2023',
        question: 'Which acid is found in vinegar?',
        options: ['Citric acid', 'Lactic acid', 'Acetic acid', 'Oxalic acid'],
        answer: 'Acetic acid',
        explanation: 'Vinegar contains dilute acetic acid (ethanoic acid, CH₃COOH), typically 5-8% concentration. It is produced by fermentation of ethanol by acetic acid bacteria. Citric acid is in lemons, lactic acid in curd, and oxalic acid in spinach.'
      },
      {
        year: '2022',
        question: 'The pH of human blood is approximately:',
        options: ['6.5', '7.0', '7.4', '8.0'],
        answer: '7.4',
        explanation: 'Normal human blood has a pH of 7.35 to 7.45 (approximately 7.4), which is slightly alkaline. Maintaining this pH is critical for survival — a pH below 7.35 (acidosis) or above 7.45 (alkalosis) can be life-threatening.'
      }
    ]
  },

  // ══════════════════════════════════════════════════════
  // State PCS — Science & Environment
  // ══════════════════════════════════════════════════════
  {
    exam: 'State PCS', subject: 'Science & Technology', topic: 'Information Technology',
    subtopic: 'Artificial Intelligence — Concepts & Applications',
    notes: `## Artificial Intelligence — Concepts & Applications

Artificial Intelligence (AI) is one of the most transformative technologies of the 21st century and is frequently tested in State PCS and UPSC exams.

### What is Artificial Intelligence?

**Definition**: The simulation of human intelligence processes by computer systems, including learning, reasoning, problem-solving, perception, and language understanding.

**Term coined by**: John McCarthy (1956, Dartmouth Conference) — "Father of Artificial Intelligence"

**Turing Test**: Proposed by Alan Turing (1950) — a test of a machine's ability to exhibit intelligent behavior indistinguishable from a human.

### Types of AI

**1. Based on Capability**:
- **Narrow AI (ANI — Artificial Narrow Intelligence)**: Performs specific tasks (e.g., Siri, Alexa, Chess engines, Face recognition). All current AI is ANI.
- **General AI (AGI — Artificial General Intelligence)**: Hypothetical; human-level intelligence across all domains. Does not yet exist.
- **Super AI (ASI)**: Beyond human intelligence. Theoretical concept.

**2. Based on Functionality**:
- **Reactive Machines**: No memory; pure reaction (IBM's Deep Blue chess computer)
- **Limited Memory**: Uses past data for decisions (Self-driving cars)
- **Theory of Mind**: Understands emotions/beliefs (research stage)
- **Self-Aware AI**: Has consciousness (hypothetical)

### Machine Learning (ML)

**Definition**: A subset of AI where machines learn from data without being explicitly programmed.

**Types of ML**:
- **Supervised Learning**: Trained on labeled data (spam detection, image classification)
- **Unsupervised Learning**: Finds patterns in unlabeled data (customer segmentation)
- **Reinforcement Learning**: Agent learns by reward/punishment (game playing, robotics)

### Deep Learning & Neural Networks

**Neural Networks**: Inspired by human brain; interconnected "neurons" process data in layers.

**Deep Learning**: Neural networks with many layers (deep = many hidden layers). Powers image recognition, speech recognition, NLP.

**Generative AI**: Creates new content — text, images, code (GPT-4, DALL-E, Gemini, Midjourney)

### Applications of AI in India

| Sector | AI Application |
|--------|----------------|
| Healthcare | Disease diagnosis (cancer detection), drug discovery |
| Agriculture | Crop disease detection, yield prediction (IFFCO Kisan app) |
| Finance | Fraud detection, credit scoring, algorithmic trading |
| Governance | DigiYatra (facial recognition at airports), Aarogya Setu |
| Education | Adaptive learning platforms, SWAYAM |
| Defence | Autonomous drones, satellite imagery analysis |
| Transport | Traffic management, Ola/Uber algorithms |

### India's AI Policy

**NITI Aayog's National AI Strategy**: "#AIForAll" — make India a global AI powerhouse
- Focus areas: Healthcare, Agriculture, Education, Smart Cities, Smart Mobility
- National AI Portal: ai.gov.in

**IndiaAI Mission (2024)**: ₹10,372 crore outlay for AI compute capacity, datasets, applications`,
    facts: [
      'The term "Artificial Intelligence" was coined by John McCarthy at the Dartmouth Conference in 1956',
      'The Turing Test (1950) checks if a machine can exhibit intelligence indistinguishable from humans',
      'All current AI (Siri, ChatGPT, image recognition) is Narrow AI — not General AI',
      'Machine Learning is a subset of AI; Deep Learning is a subset of Machine Learning',
      'Generative AI (GPT-4, Gemini, Midjourney) creates new content from patterns in training data',
      'India\'s IndiaAI Mission (2024) has ₹10,372 crore outlay for AI infrastructure',
      'NITI Aayog released India\'s National AI Strategy "#AIForAll" in 2018',
      'DigiYatra uses facial recognition AI to enable paperless travel at Indian airports',
    ],
    tables: [{
      title: 'AI Terminology Quick Reference',
      headers: ['Term', 'Definition', 'Example'],
      rows: [
        ['Narrow AI', 'AI for specific tasks only', 'Siri, Google Translate, AlphaGo'],
        ['Machine Learning', 'Learns from data without explicit programming', 'Email spam filters'],
        ['Deep Learning', 'ML using multi-layer neural networks', 'Face recognition, ChatGPT'],
        ['Natural Language Processing', 'AI understands/generates human language', 'Google Assistant, ChatGPT'],
        ['Computer Vision', 'AI understands images/videos', 'Medical imaging, self-driving cars'],
        ['Generative AI', 'Creates new content (text/image/code)', 'ChatGPT, DALL-E, Gemini'],
        ['Reinforcement Learning', 'Learns by reward/punishment', 'Game-playing AI, robotics'],
      ]
    }],
    pyqs: [
      {
        year: '2023',
        question: 'Which of the following is an example of Narrow Artificial Intelligence?',
        options: [
          'A computer system that thinks and acts like a human in all domains',
          'A chess-playing computer program that can only play chess',
          'A system with self-awareness and emotional intelligence',
          'None of the above'
        ],
        answer: 'A chess-playing computer program that can only play chess',
        explanation: 'Narrow AI (Artificial Narrow Intelligence) is designed for specific, well-defined tasks. A chess-playing AI like Deep Blue can only play chess — it cannot perform other tasks. This is opposed to General AI (AGI), which would have human-level intelligence across all domains.'
      }
    ]
  },

];

// ─── Seed Function ────────────────────────────────────────────────────────────
async function seedBatch2() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
  console.log(`\n🔌 Connecting to MongoDB: ${uri}`);
  await mongoose.connect(uri);
  console.log(`✅ Connected. Processing ${CONTENT.length} content items...\n`);

  let upserted = 0, errors = 0;

  for (const item of CONTENT) {
    try {
      await LearningContent.findOneAndUpdate(
        { exam: item.exam, subject: item.subject, topic: item.topic, subtopic: item.subtopic },
        { $set: item },
        { upsert: true, new: true }
      );
      upserted++;
      console.log(`  ✅ ${item.exam.padEnd(12)} | ${item.subtopic.substring(0, 52)}`);
    } catch (err) {
      errors++;
      console.error(`  ❌ ERROR: ${item.exam} | ${item.subtopic}: ${err.message}`);
    }
  }

  console.log(`\n${'═'.repeat(65)}`);
  console.log(`📊 BATCH 2 COMPLETE | Upserted: ${upserted} | Errors: ${errors}`);
  console.log(`${'═'.repeat(65)}\n`);

  await mongoose.disconnect();
}

seedBatch2().catch(err => {
  console.error('❌ Fatal:', err.message);
  process.exit(1);
});
