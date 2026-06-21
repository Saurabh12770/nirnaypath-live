import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import LearningContent from '../models/LearningContent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';

// ─── DEEP CONTENT DATA ────────────────────────────────────────────────────────
const contentData = [

  // ══════════════════════════════════════════════════════════
  // HISTORY — ANCIENT INDIA
  // ══════════════════════════════════════════════════════════
  {
    exam: 'UPSC',
    subject: 'History',
    topic: 'Ancient India',
    subtopic: 'Mahajanapadas & Rise of Magadha',
    introduction: 'The Mahajanapadas were sixteen powerful kingdoms and oligarchic republics that existed in the Indian subcontinent from the 6th to 4th century BCE. Among these, Magadha emerged as the most powerful and eventually formed the basis of the first great empire of India.',
    concepts: [
      'Sixteen Mahajanapadas and their locations',
      'Oligarchic republics (Ganas/Sanghas) vs monarchies',
      'Rise of Magadha under Haryanka, Shishunaga, Nanda, and Maurya dynasties',
      'Role of Iron Age technology in empire-building',
      'Bimbisara\'s diplomatic marriages and military expansion'
    ],
    importantFacts: [
      'The 16 Mahajanapadas are listed in Buddhist texts: Anguttara Nikaya and Jain text Bhagavati Sutra.',
      'Vajji (Vaishali) was the world\'s first known republic — a confederacy of Licchavis.',
      'Magadha had four geographical advantages: fertile Gangetic plains, iron-rich Chota Nagpur, strategic rivers, and forests for elephants.',
      'Bimbisara (Haryanka dynasty) was the first king to have a standing army and diplomatic matrimonial alliances.',
      'Ajatashatru built Rajgir fort and founded Pataliputra to shift capital closer to the Ganga.',
      'The Nanda dynasty was the first non-Kshatriya (Shudra origin) dynasty to rule Magadha.'
    ],
    examples: [
      'Vajji Sangha of Vaishali — a republican confederation where decisions were made by elected representatives (Ganapati).',
      'Bimbisara married the Kosala princess Kosaladevi and received Kashi village as dowry — a classic example of matrimonial diplomacy.'
    ],
    tables: [
      {
        title: 'Key Mahajanapadas and Their Capitals',
        headers: ['Mahajanapada', 'Capital City', 'Region (Modern)', 'Type of Govt'],
        rows: [
          ['Magadha', 'Rajgriha (later Pataliputra)', 'Bihar', 'Monarchy'],
          ['Kosala', 'Shravasti', 'Eastern UP', 'Monarchy'],
          ['Vatsa', 'Kaushambi', 'Allahabad, UP', 'Monarchy'],
          ['Avanti', 'Ujjaini / Mahishmati', 'Madhya Pradesh', 'Monarchy'],
          ['Vajji', 'Vaishali', 'North Bihar', 'Republic (Sangha)'],
          ['Malla', 'Kushinara / Pawa', 'Eastern UP', 'Republic (Sangha)'],
          ['Kuru', 'Indraprastha', 'Delhi / Haryana', 'Oligarchic Republic'],
          ['Gandhara', 'Taxila', 'Pakistan (NWFP)', 'Monarchy']
        ]
      }
    ],
    revisionNotes: 'Mnemonic for 16 Mahajanapadas: "ABCK MMKK PVAC SSCC" — Anga, Baji (Vajji), Chedi, Kasi, Kosala, Magadha, Malla, Matsya, Kuru, Kamboja, Panchala, Vatsa, Avanti, Chedi, Surasena, Gandhara. Rise of Magadha: Haryanka → Shishunaga → Nanda → Maurya. Key rivers: Ganga + Son (at Pataliputra confluence).',
    pyqs: [
      {
        question: { en: 'Which of the following is considered to be the world\'s first republic?', hi: 'निम्नलिखित में से किसे विश्व का प्रथम गणराज्य माना जाता है?' },
        options: [
          { en: 'Sparta', hi: 'स्पार्टा' },
          { en: 'Athens', hi: 'एथेंस' },
          { en: 'Vaishali', hi: 'वैशाली' },
          { en: 'Taxila', hi: 'तक्षशिला' }
        ],
        answer: 2,
        explanation: { en: 'Vaishali (Vajji Sangha / Licchavi Republic) is considered the world\'s first republic, predating Greek city-states. It had a democratically elected assembly and council of 7707 Rajas.', hi: 'वैशाली (वज्जि संघ / लिच्छवी गणराज्य) को विश्व का प्रथम गणराज्य माना जाता है, जो यूनानी नगर-राज्यों से पुराना है। इसमें 7707 राजाओं की लोकतांत्रिक रूप से निर्वाचित परिषद थी।' },
        year: 2018
      }
    ],
    detailedExplanation: `### 1. Introduction & Overview / प्रस्तावना और अवलोकन
**English:** The Mahajanapadas (literally "great realms") emerged after the decline of the Vedic tribal polity around 600 BCE. The expansion of agriculture, iron technology, and trade led to the formation of complex state systems.
**हिंदी:** महाजनपद (शाब्दिक अर्थ "महान राज्य") वैदिक जनजातीय राजव्यवस्था के पतन के बाद लगभग 600 ईसा पूर्व उभरे। कृषि, लौह प्रौद्योगिकी और व्यापार के विस्तार ने जटिल राज्य व्यवस्थाओं का निर्माण किया।

### 2. Historical Context / ऐतिहासिक पृष्ठभूमि
**English:** The Later Vedic Period saw the shift from tribal Janapadas to full territorial kingdoms. Iron ploughshares allowed dense forest clearance in the Gangetic plains, creating surplus agricultural production and supporting large populations and armies.
**हिंदी:** परवर्ती वैदिक काल में जनजातीय जनपदों से पूर्ण क्षेत्रीय राज्यों में परिवर्तन देखा गया। लोहे के हल से गंगा के मैदानों में घने जंगलों की सफाई संभव हुई, जिससे कृषि उत्पादन में वृद्धि हुई।

### 3. Core Concepts / मुख्य अवधारणाएँ
**English:** Two forms of governance existed: (1) Monarchies (Raja-dominated kingdoms like Magadha, Kosala) where hereditary kings held supreme power; (2) Oligarchic Republics (Gana-Sanghas like Vajji, Malla, Kuru) where power was shared among a clan-based oligarchy.
**हिंदी:** दो प्रकार की शासन प्रणालियाँ थीं: (1) राजतंत्र (मगध, कोसल जैसे राजा-प्रधान राज्य) जहाँ वंशानुगत राजाओं के पास सर्वोच्च शक्ति थी; (2) कुलीनतंत्र गणराज्य (वज्जि, मल्ल, कुरु जैसे गण-संघ) जहाँ शक्ति कुल-आधारित अभिजात वर्ग में बंटी थी।

### 4. Deep Academic Explanation / विस्तृत शैक्षणिक व्याख्या
**English:** Magadha's rise was due to strategic advantages: (a) Located at the confluence of Ganga and Son rivers enabling control of river trade, (b) Rich deposits of iron ore in nearby Chota Nagpur plateau allowing superior weaponry, (c) Elephants from Vindhya forests giving military supremacy, (d) Fertile alluvial soil supporting large tax revenues.
**हिंदी:** मगध का उदय रणनीतिक लाभों के कारण हुआ: (a) गंगा और सोन नदियों के संगम पर स्थित होने से नदी व्यापार पर नियंत्रण, (b) निकटवर्ती छोटा नागपुर पठार में लौह अयस्क के समृद्ध भंडार से श्रेष्ठ हथियार, (c) विंध्य वनों से हाथी देकर सैन्य श्रेष्ठता, (d) उपजाऊ जलोढ़ मिट्टी से बड़े कर राजस्व का समर्थन।

### 5. Key Conceptual Pillars / मुख्य वैचारिक स्तंभ
**English:** The Nanda dynasty is significant as the first non-Kshatriya rulers of Magadha. Dhana Nanda (last Nanda ruler) alienated Brahmins and Kshatriyas with excessive taxation — creating conditions for the Mauryan revolution.
**हिंदी:** नंद वंश महत्वपूर्ण है क्योंकि यह मगध के पहले गैर-क्षत्रिय शासक थे। धन नंद (अंतिम नंद शासक) ने अत्यधिक करों से ब्राह्मणों और क्षत्रियों को नाराज किया — जिसने मौर्य क्रांति की परिस्थितियाँ बनाईं।

### 6. NCERT Connections / एनसीईआरटी संबंध
**English:** Covered in Class VI NCERT "Our Pasts — Part I", Chapter 5 "Kingdoms, Kings and an Early Republic." Core for UPSC GS Paper I Ancient History.
**हिंदी:** कक्षा VI एनसीईआरटी "हमारे अतीत — भाग I", अध्याय 5 "राज्य, राजा और एक आरंभिक गणतंत्र" में शामिल। UPSC GS पेपर I प्राचीन इतिहास के लिए मुख्य।

### 7. Advanced Analytical Insights / उन्नत विश्लेषणात्मक अंतर्दृष्टि
**English:** The success of monarchies over republics in the Mahajanapada era reflects a structural lesson: large professional standing armies (funded by agricultural surplus taxation) outcompeted citizen-militias of republics in prolonged warfare.
**हिंदी:** महाजनपद युग में राजतंत्रों की गणराज्यों पर सफलता एक संरचनात्मक सबक दर्शाती है: (कृषि अधिशेष कराधान से वित्त पोषित) बड़ी पेशेवर स्थायी सेनाओं ने लंबे युद्धों में गणराज्यों की नागरिक-सेनाओं को पराजित किया।

### 8. Real-world Examples / वास्तविक उदाहरण
**English:** Ajatashatru's war with Vajji (483–468 BCE) lasted 16 years. He used two military innovations: a war chariot with catapult (Mahashilakantaka) and a stone-throwing machine (Rathamusal) — the first recorded use of siege machinery in Indian history.
**हिंदी:** वज्जि के साथ अजातशत्रु का युद्ध (483-468 ईसा पूर्व) 16 वर्षों तक चला। उसने दो सैन्य नवाचारों का उपयोग किया: एक युद्ध रथ पर कैटापल्ट (महाशिलाकंटका) और एक पत्थर फेंकने की मशीन (रथमुसल) — भारतीय इतिहास में घेराबंदी मशीनरी का पहला दर्ज उपयोग।

### 9. Bilingual Key Terms / द्विभाषी प्रमुख शब्दावली
**English:** *Gana-Sangha* = Oligarchic republic; *Gramini* = Village headman; *Senapati* = Army chief; *Vrajapati* = Administrator of pasture lands.
**हिंदी:** *गण-संघ* = कुलीनतंत्र गणराज्य; *ग्रामणी* = ग्राम प्रधान; *सेनापति* = सेना प्रमुख; *व्रजपति* = चरागाह भूमि का प्रशासक।

### 10. Exam Strategy / परीक्षा रणनीति
**English:** UPSC frequently tests (1) which Mahajanapada was a republic, (2) geographical location of capitals, (3) reasons for Magadha's success. Match-the-following and assertion-reason questions are common.
**हिंदी:** UPSC प्रायः परीक्षण करता है (1) कौन सा महाजनपद गणराज्य था, (2) राजधानियों की भौगोलिक स्थिति, (3) मगध की सफलता के कारण। मिलान और कारण-कथन प्रश्न सामान्य हैं।

### 11. Quick-Recall Revision Summary / त्वरित-स्मरण पुनरावलोकन सारांश
**English:** 16 Mahajanapadas, 6th-4th century BCE. Vaishali = first republic. Magadha advantages: Iron + Elephants + Rivers + Fertile soil. Dynasties: Haryanka → Shishunaga → Nanda → Maurya.
**हिंदी:** 16 महाजनपद, 6ठी-4ठी शताब्दी ईसा पूर्व। वैशाली = प्रथम गणराज्य। मगध के लाभ: लोहा + हाथी + नदियाँ + उपजाऊ मिट्टी। वंश: हर्यंक → शिशुनाग → नंद → मौर्य।

### 12. Bilingual Comparative Analysis / द्विभाषी तुलनात्मक विश्लेषण
**English:** Unlike Greek city-states (Polis) which were small urban units, Mahajanapadas were large agricultural territories. Vajji's republic is geographically and constitutionally comparable to the Athenian democracy but predates it by about 100 years.
**हिंदी:** यूनानी नगर-राज्यों (पोलिस) के विपरीत जो छोटी शहरी इकाइयाँ थीं, महाजनपद बड़े कृषि क्षेत्र थे। वज्जि का गणराज्य भौगोलिक और संवैधानिक रूप से एथेनियाई लोकतंत्र से तुलनीय है, लेकिन उससे लगभग 100 वर्ष पुराना है।

### 13. Related Subjects / संबंधित विषय
**English:** Links to Polity (constitutional history), Economics (agrarian taxation), and World History (Greek city-states contemporaneous comparison).
**हिंदी:** राजव्यवस्था (संवैधानिक इतिहास), अर्थशास्त्र (कृषि कराधान) और विश्व इतिहास (यूनानी नगर-राज्यों की समकालीन तुलना) से जुड़ता है।`
  },

  // ══════════════════════════════════════════════════════════
  // HISTORY — MODERN INDIA
  // ══════════════════════════════════════════════════════════
  {
    exam: 'UPSC',
    subject: 'History',
    topic: 'Modern India',
    subtopic: 'Non-Cooperation Movement 1920–22',
    introduction: 'The Non-Cooperation Movement (1920–1922) was a landmark mass movement led by Mahatma Gandhi, marking the first large-scale participation of Indian masses in the independence struggle. It represented the beginning of Gandhian mass politics in India.',
    concepts: [
      'Gandhian philosophy of Satyagraha and non-violence',
      'Boycott of British institutions (courts, councils, schools)',
      'Swadeshi movement revival and khadi promotion',
      'Suspension due to Chauri Chaura violence (February 1922)',
      'Mobilization of peasants, Muslims (Khilafat) and urban elites together'
    ],
    importantFacts: [
      'Launched on 1st August 1920 — the same day Bal Gangadhar Tilak died.',
      'The movement merged with the Khilafat Movement led by Ali Brothers (Muhammad Ali & Shaukat Ali).',
      'Gandhi returned his Kaiser-i-Hind medal, Boer War medal, and Zulu Campaign medal to protest.',
      'The movement was suspended on 12 February 1922 after the Chauri Chaura incident (UP) where a mob burned a police station killing 22 constables.',
      'C.R. Das and Motilal Nehru led the Swarajya Party after suspension, choosing to enter legislatures.',
      'The movement saw participation of: students, lawyers, peasants, merchants, and women for the first time.'
    ],
    examples: [
      'Alibaba Ghani Fida Ali Khan led a massive bonfire of British textiles and liquor in Bombay in January 1921.',
      'Subhash Chandra Bose resigned from the Indian Civil Service examination to join the movement — a symbolic act that inspired thousands of students.'
    ],
    tables: [
      {
        title: 'Key Events of Non-Cooperation Movement',
        headers: ['Date', 'Event', 'Significance'],
        rows: [
          ['Aug 1, 1920', 'Movement officially launched by Gandhi', 'Coincided with Tilak\'s death — symbolic shift of leadership'],
          ['Sep 1920', 'Nagpur Congress Session approves NCM', 'First Congress approval of mass civil disobedience as policy'],
          ['Nov 1921', 'Visit of Prince of Wales — nationwide hartals', 'Showed scale of mass participation'],
          ['Feb 1922', 'Chauri Chaura incident, UP', 'Gandhi suspends movement unilaterally'],
          ['Mar 1922', 'Gandhi arrested; sentenced to 6 years', 'Gandhi\'s first imprisonment under British India']
        ]
      }
    ],
    revisionNotes: 'NCM: 1920-22. Launched Aug 1, 1920. Merged with Khilafat. Suspended due to Chauri Chaura (Feb 1922). Result: Swarajya Party formed (C.R. Das + Motilal Nehru). Key quote: Gandhi called Chauri Chaura "a sudden upheaval of the mass mind." UPSC tip: NCM is different from Civil Disobedience Movement (1930).',
    pyqs: [
      {
        question: { en: 'What was the immediate cause for the suspension of the Non-Cooperation Movement?', hi: 'असहयोग आंदोलन को स्थगित करने का तत्काल कारण क्या था?' },
        options: [
          { en: 'Arrest of Gandhi', hi: 'गांधी की गिरफ्तारी' },
          { en: 'Chauri Chaura incident', hi: 'चौरी-चौरा घटना' },
          { en: 'Khilafat Movement failure', hi: 'खिलाफत आंदोलन की विफलता' },
          { en: 'Government\'s Montague-Chelmsford Reforms', hi: 'सरकार के मॉन्टेग्यू-चेम्सफोर्ड सुधार' }
        ],
        answer: 1,
        explanation: { en: 'On February 5, 1922, a police station at Chauri Chaura (Gorakhpur, UP) was set ablaze by a mob of protesters, killing 22 policemen. Gandhi, committed to non-violence, immediately suspended the movement.', hi: '5 फरवरी 1922 को चौरी-चौरा (गोरखपुर, यूपी) में प्रदर्शनकारियों की भीड़ ने एक थाने में आग लगा दी, जिसमें 22 पुलिसकर्मी मारे गए। अहिंसा के प्रति प्रतिबद्ध गांधी ने तुरंत आंदोलन स्थगित कर दिया।' },
        year: 2019
      }
    ],
    detailedExplanation: `### 1. Introduction / प्रस्तावना
**English:** The Non-Cooperation Movement was Gandhi's first nationwide mass campaign against British rule, combining the Khilafat issue (Muslims protesting British treatment of the Ottoman Caliph) with Indian national demands.
**हिंदी:** असहयोग आंदोलन ब्रिटिश शासन के खिलाफ गांधी का पहला राष्ट्रव्यापी जन अभियान था, जिसमें खिलाफत मुद्दे (ऑटोमन खलीफा के ब्रिटिश व्यवहार का मुस्लिम विरोध) को भारतीय राष्ट्रीय मांगों के साथ जोड़ा गया था।

### 2. Historical Context / ऐतिहासिक पृष्ठभूमि
**English:** Three triggers made 1920 the perfect storm: (1) Jallianwala Bagh Massacre (April 1919) — 379+ killed, devastating faith in British justice; (2) Rowlatt Act 1919 — allowed detention without trial; (3) Punjab wrongs — floggings and crawling orders that humiliated thousands.
**हिंदी:** तीन कारणों ने 1920 को एक तूफानी वर्ष बनाया: (1) जलियाँवाला बाग हत्याकांड (अप्रैल 1919) — 379+ लोग मारे गए, ब्रिटिश न्याय में विश्वास नष्ट हुआ; (2) रौलेट अधिनियम 1919 — बिना मुकदमे के नजरबंदी की अनुमति; (3) पंजाब के अत्याचार — कोड़े और रेंगने के आदेश जिसने हजारों को अपमानित किया।

### 3. Programme of the Movement / आंदोलन का कार्यक्रम
**English:** Gandhi's four-stage programme: (1) Surrender of titles and honorary posts; (2) Boycott of civil services, army, police, courts, legislative councils; (3) Boycott of government schools and colleges; (4) Boycott of foreign goods and promotion of swadeshi.
**हिंदी:** गांधी का चार-चरणीय कार्यक्रम: (1) उपाधियों और मानद पदों का समर्पण; (2) नागरिक सेवाओं, सेना, पुलिस, न्यायालयों, विधान परिषदों का बहिष्कार; (3) सरकारी स्कूलों और कॉलेजों का बहिष्कार; (4) विदेशी वस्तुओं का बहिष्कार और स्वदेशी को बढ़ावा।

### 4. Khilafat Merger / खिलाफत विलय
**English:** Gandhi saw the Khilafat cause (protecting the Ottoman Caliph's status, which the British were threatening post-WWI) as a Hindu-Muslim unity opportunity. He called Khilafat leaders Ali Brothers (Mohammad Ali and Shaukat Ali) natural allies. This merger is historically significant as the first major Hindu-Muslim joint political campaign.
**हिंदी:** गांधी ने खिलाफत उद्देश्य (प्रथम विश्व युद्ध के बाद ब्रिटिश द्वारा खतरे में डाले जा रहे ऑटोमन खलीफा की स्थिति की रक्षा) को हिंदू-मुस्लिम एकता के अवसर के रूप में देखा। उन्होंने खिलाफत नेताओं अली बंधुओं को स्वाभाविक सहयोगी कहा।

### 5. Suspension & Consequences / स्थगन और परिणाम
**English:** The suspension on 12 February 1922 was controversial — many Congress leaders like Subhash Chandra Bose and Motilal Nehru privately disagreed with Gandhi. However, the movement had achieved: (a) Politicization of the peasantry, (b) Spread of Congress organization to rural India, (c) Economic blow to British textile imports.
**हिंदी:** 12 फरवरी 1922 को स्थगन विवादास्पद था — कई कांग्रेस नेताओं जैसे सुभाष चंद्र बोस और मोतीलाल नेहरू ने निजी तौर पर गांधी से असहमति जताई। हालाँकि, आंदोलन ने हासिल किया: (a) किसानों का राजनीतिकरण, (b) ग्रामीण भारत तक कांग्रेस संगठन का विस्तार, (c) ब्रिटिश कपड़ा आयात को आर्थिक झटका।

### 6-13. [Continued academic sections...]
**English:** The NCM demonstrated that mass civil disobedience was a viable political tool. It shifted the Indian National Congress from an elite debating club to a mass organization with four lakh members by 1921.
**हिंदी:** असहयोग आंदोलन ने प्रदर्शित किया कि जन सविनय अवज्ञा एक व्यावहारिक राजनीतिक उपकरण था। इसने भारतीय राष्ट्रीय कांग्रेस को एक अभिजात बहस क्लब से 1921 तक चार लाख सदस्यों वाले जन संगठन में बदल दिया।`
  },

  // ══════════════════════════════════════════════════════════
  // POLITY — PARLIAMENT
  // ══════════════════════════════════════════════════════════
  {
    exam: 'UPSC',
    subject: 'Polity',
    topic: 'Parliament & Legislature',
    subtopic: 'Parliament — Lok Sabha & Rajya Sabha',
    introduction: 'The Indian Parliament is a bicameral legislature consisting of the President of India and two Houses: the Lok Sabha (House of the People) and the Rajya Sabha (Council of States). It is the supreme legislative body of the Union, vested with powers to make, amend, and repeal laws.',
    concepts: [
      'Bicameral legislature structure and rationale',
      'Composition, election, and qualification for both Houses',
      'Powers of Parliament: Legislative, Executive, Financial, Constituent, Judicial',
      'Lok Sabha vs Rajya Sabha — comparative powers',
      'Joint sitting of Parliament under Article 108'
    ],
    importantFacts: [
      'Lok Sabha: Maximum 552 members (530 from states + 20 from UTs + 2 Anglo-Indian nominated — but 2020 abolished Anglo-Indian nomination).',
      'Rajya Sabha: Maximum 250 members (238 elected + 12 nominated by President for expertise in arts, science, literature, social service).',
      'Lok Sabha term: 5 years (can be dissolved early). Rajya Sabha is a permanent body — 1/3 members retire every 2 years.',
      'Money Bills can be introduced only in Lok Sabha. Rajya Sabha can only delay them by 14 days.',
      'Minimum age: Lok Sabha — 25 years; Rajya Sabha — 30 years.',
      'The quorum for each House is 1/10th of the total membership.'
    ],
    examples: [
      'The Constitution (61st Amendment) Act 1988 reduced the voting age from 21 to 18 years — passed in a joint sitting.',
      'The Dowry Prohibition Act 1961 passed through Parliament demonstrates lawmaking process for social reform.'
    ],
    tables: [
      {
        title: 'Lok Sabha vs Rajya Sabha — Key Comparison',
        headers: ['Feature', 'Lok Sabha', 'Rajya Sabha'],
        rows: [
          ['Other Name', 'House of People / Lower House', 'Council of States / Upper House'],
          ['Max Strength', '552 members', '250 members'],
          ['Elected by', 'Direct election by voters (Universal Adult Franchise)', 'Indirect election by State Legislative Assemblies'],
          ['Term', '5 years (can be dissolved)', 'Permanent body; 6-yr terms, 1/3 retire every 2 yrs'],
          ['Min Age', '25 years', '30 years'],
          ['Presides', 'Speaker (elected by members)', 'Vice President (ex-officio Chairman)'],
          ['Money Bills', 'Can introduce & pass', 'Can only delay by 14 days'],
          ['No-Confidence', 'Can pass a no-confidence motion', 'Cannot pass no-confidence motion']
        ]
      }
    ],
    revisionNotes: 'Lok Sabha = Lower + Elected directly + 25 yrs min age + 5 yr term + Speaker + Money Bills origin. Rajya Sabha = Upper + Elected indirectly by State Assemblies + 30 yrs min age + Permanent + VP Chairman. Joint sitting under Article 108 presided by Speaker of Lok Sabha.',
    pyqs: [
      {
        question: { en: 'Which of the following can introduce a Money Bill in the Indian Parliament?', hi: 'निम्नलिखित में से कौन भारतीय संसद में धन विधेयक पेश कर सकता है?' },
        options: [
          { en: 'Either House of Parliament', hi: 'संसद का कोई भी सदन' },
          { en: 'Only Lok Sabha', hi: 'केवल लोक सभा' },
          { en: 'Only Rajya Sabha', hi: 'केवल राज्य सभा' },
          { en: 'Only the President', hi: 'केवल राष्ट्रपति' }
        ],
        answer: 1,
        explanation: { en: 'Under Article 109, a Money Bill can only be introduced in the Lok Sabha. Rajya Sabha can neither introduce nor amend a Money Bill — it can only make recommendations or delay it for 14 days.', hi: 'अनुच्छेद 109 के अंतर्गत, धन विधेयक केवल लोक सभा में ही पेश किया जा सकता है। राज्य सभा न तो धन विधेयक पेश कर सकती है और न ही संशोधित कर सकती है — वह केवल सिफारिशें कर सकती है या इसे 14 दिनों के लिए रोक सकती है।' },
        year: 2017
      }
    ],
    detailedExplanation: `### 1. Introduction / प्रस्तावना
**English:** The Indian Parliament derives its authority from the Constitution (Part V, Articles 79–122). It reflects the Westminster model of parliamentary democracy adopted from the United Kingdom.
**हिंदी:** भारतीय संसद को संविधान (भाग V, अनुच्छेद 79-122) से अपना अधिकार प्राप्त होता है। यह यूनाइटेड किंगडम से अपनाई गई वेस्टमिंस्टर संसदीय लोकतंत्र प्रणाली को दर्शाता है।

### 2. Powers of Parliament / संसद की शक्तियाँ
**English:** Parliament holds five major categories of power: (1) Legislative — makes laws on Union List subjects; (2) Executive — controls the Council of Ministers through Question Hour and no-confidence motions; (3) Financial — approves budget and controls public expenditure; (4) Constituent — amends the Constitution under Article 368; (5) Judicial — impeaches the President, Vice President, and Supreme Court judges.
**हिंदी:** संसद के पास पाँच प्रमुख शक्तियाँ हैं: (1) विधायी — संघ सूची के विषयों पर कानून बनाती है; (2) कार्यपालिका — प्रश्नकाल और अविश्वास प्रस्तावों के माध्यम से मंत्रिपरिषद को नियंत्रित करती है; (3) वित्तीय — बजट को मंजूरी देती है और सार्वजनिक व्यय को नियंत्रित करती है; (4) संविधान संशोधन — अनुच्छेद 368 के तहत संविधान में संशोधन करती है; (5) न्यायिक — राष्ट्रपति, उपराष्ट्रपति और सर्वोच्च न्यायालय के न्यायाधीशों का महाभियोग चलाती है।

### 3. Sessions of Parliament / संसद के सत्र
**English:** Parliament meets in three sessions: Budget Session (Feb–May), Monsoon Session (July–Aug), Winter Session (Nov–Dec). The gap between two sessions cannot exceed 6 months (Article 85).
**हिंदी:** संसद तीन सत्रों में मिलती है: बजट सत्र (फरवरी-मई), मानसून सत्र (जुलाई-अगस्त), शीतकालीन सत्र (नवंबर-दिसंबर)। दो सत्रों के बीच का अंतर 6 माह से अधिक नहीं हो सकता (अनुच्छेद 85)।

### 4-13. [Continued sections...]
**English:** The anti-defection law (10th Schedule, added by 52nd Amendment 1985) prevents members from switching parties without losing membership, strengthening parliamentary stability.
**हिंदी:** दल-बदल विरोधी कानून (10वीं अनुसूची, 52वें संशोधन 1985 द्वारा जोड़ी गई) सदस्यों को सदस्यता खोए बिना दल बदलने से रोकता है, जिससे संसदीय स्थिरता मजबूत होती है।`
  },

  // ══════════════════════════════════════════════════════════
  // POLITY — CONSTITUTIONAL BODIES
  // ══════════════════════════════════════════════════════════
  {
    exam: 'UPSC',
    subject: 'Polity',
    topic: 'Constitutional Bodies',
    subtopic: 'Election Commission of India',
    introduction: 'The Election Commission of India (ECI) is an autonomous constitutional body responsible for administering Union and State election processes. Established under Article 324 of the Constitution, it ensures free and fair elections — the bedrock of democratic governance.',
    concepts: [
      'Constitutional status under Article 324',
      'Chief Election Commissioner and Election Commissioners',
      'Model Code of Conduct (MCC) — enforcement and limitations',
      'ECI powers: superintendence, direction, and control of elections',
      'Delimitation and electoral roll management'
    ],
    importantFacts: [
      'ECI was established on 25 January 1950 — celebrated as National Voters\' Day.',
      'Originally a single-member body; became three-member body (Chief EC + 2 ECs) since 1989.',
      'Chief Election Commissioner cannot be removed except by impeachment — same procedure as Supreme Court judge.',
      'Election Commissioner can be removed on recommendation of the Chief Election Commissioner.',
      'T.N. Seshan (CEC 1990–96) is credited with transforming ECI into a powerful institution through strict enforcement.',
      'Model Code of Conduct comes into effect from the date of election announcement and remains till result declaration.'
    ],
    examples: [
      'The 2024 Lok Sabha election was conducted across 7 phases covering 543 constituencies — the largest democratic exercise in human history.',
      'ECI\'s use of Electronic Voting Machines (EVMs) since 1982 (in Kerala by-election) modernized Indian elections.'
    ],
    tables: [
      {
        title: 'Comparison of ECI Powers vs Limitations',
        headers: ['Area', 'Power of ECI', 'Limitations / Constraints'],
        rows: [
          ['Election Schedule', 'Sole authority to announce and schedule elections', 'Cannot change constitutional provisions on elections'],
          ['Candidate Vetting', 'Can disqualify on procedural grounds', 'Cannot examine criminal antecedents beyond SC directions'],
          ['Model Code', 'Enforces MCC through advisories and notices', 'MCC has no statutory backing — moral authority only'],
          ['Political Parties', 'Registers and recognizes parties; allocates symbols', 'Cannot ban parties — only courts can deregister'],
          ['Voter Rolls', 'Prepares and maintains electoral rolls', 'Depends on state governments for ground logistics']
        ]
      }
    ],
    revisionNotes: 'ECI: Article 324. Established Jan 25, 1950 = National Voters\' Day. Multi-member since 1989. CEC removal = Impeachment (like SC judge). EC removal = on CEC recommendation. T.N. Seshan — reformed ECI. MCC = no statutory backing but moral authority.',
    pyqs: [
      {
        question: { en: 'Under which Article of the Indian Constitution is the Election Commission of India established?', hi: 'भारत के संविधान के किस अनुच्छेद के तहत भारत निर्वाचन आयोग की स्थापना की गई है?' },
        options: [
          { en: 'Article 315', hi: 'अनुच्छेद 315' },
          { en: 'Article 324', hi: 'अनुच्छेद 324' },
          { en: 'Article 356', hi: 'अनुच्छेद 356' },
          { en: 'Article 370', hi: 'अनुच्छेद 370' }
        ],
        answer: 1,
        explanation: { en: 'Article 324 of the Constitution vests the superintendence, direction, and control of the preparation of electoral rolls and the conduct of all elections to Parliament, State Legislatures, and offices of the President and Vice-President in the Election Commission of India.', hi: 'संविधान का अनुच्छेद 324 मतदाता सूचियों की तैयारी की अधीक्षण, निर्देशन और नियंत्रण तथा संसद, राज्य विधानमंडलों और राष्ट्रपति और उपराष्ट्रपति के कार्यालयों के सभी चुनावों के संचालन को भारत निर्वाचन आयोग में निहित करता है।' },
        year: 2021
      }
    ],
    detailedExplanation: `### 1. Introduction / प्रस्तावना
**English:** The Election Commission of India is a permanent constitutional body. It administers elections for the Lok Sabha, Rajya Sabha, State Legislative Assemblies, Legislative Councils, and the offices of President and Vice President.
**हिंदी:** भारत निर्वाचन आयोग एक स्थायी संवैधानिक निकाय है। यह लोक सभा, राज्य सभा, राज्य विधान सभाओं, विधान परिषदों और राष्ट्रपति एवं उपराष्ट्रपति के कार्यालयों के चुनावों का प्रशासन करता है।

### 2. Composition and Appointment / संरचना और नियुक्ति
**English:** The ECI consists of the Chief Election Commissioner (CEC) and such number of Election Commissioners as the President may fix. The President appoints all members. The Constitution does not prescribe the qualifications or tenure — these are determined by Parliament through legislation.
**हिंदी:** भारत निर्वाचन आयोग में मुख्य निर्वाचन आयुक्त (CEC) और उतने ही निर्वाचन आयुक्त होते हैं जितने राष्ट्रपति नियत करे। राष्ट्रपति सभी सदस्यों की नियुक्ति करता है।

### 3. Independence Mechanisms / स्वतंत्रता तंत्र
**English:** Independence of ECI is ensured through: (a) CEC's removal only by impeachment like SC judges; (b) Service conditions cannot be varied to CEC's disadvantage after appointment; (c) ECI has suo-motu powers during election period.
**हिंदी:** ECI की स्वतंत्रता सुनिश्चित की जाती है: (a) CEC को केवल SC न्यायाधीशों की तरह महाभियोग द्वारा हटाया जा सकता है; (b) नियुक्ति के बाद CEC की सेवा शर्तों को उनके नुकसान में नहीं बदला जा सकता; (c) ECI के पास चुनाव अवधि के दौरान स्वतः संज्ञान की शक्तियाँ हैं।

### 4-13. [Continued sections...]
**English:** The Election Commission represents the guardian of democratic processes. Its decisions, while occasionally challenged in court, form the backbone of India's democratic credibility globally.
**हिंदी:** निर्वाचन आयोग लोकतांत्रिक प्रक्रियाओं का संरक्षक है। इसके निर्णय, हालांकि कभी-कभी अदालत में चुनौती दिए जाते हैं, वैश्विक स्तर पर भारत की लोकतांत्रिक विश्वसनीयता की रीढ़ बनते हैं।`
  },

  // ══════════════════════════════════════════════════════════
  // GEOGRAPHY — PHYSICAL
  // ══════════════════════════════════════════════════════════
  {
    exam: 'UPSC',
    subject: 'Geography',
    topic: 'Physical Geography',
    subtopic: 'Plate Tectonics — Theory & Evidence',
    introduction: 'Plate Tectonics is the fundamental geological theory explaining the movement of Earth\'s lithospheric plates over the asthenosphere. It unifies our understanding of earthquakes, volcanoes, mountain building, and the distribution of continents and oceans.',
    concepts: [
      'Lithosphere divided into major and minor tectonic plates',
      'Types of plate boundaries: convergent, divergent, transform',
      'Continental drift theory (Wegener) as precursor',
      'Seafloor spreading and paleomagnetism as evidence',
      'Hotspots and mantle plumes'
    ],
    importantFacts: [
      'The theory was developed in the 1960s by synthesizing Wegener\'s continental drift (1912) with seafloor spreading evidence.',
      'There are 7 major plates: African, Antarctic, Eurasian, Indo-Australian, North American, Pacific, South American.',
      'The Pacific Plate is the largest tectonic plate.',
      'The Indo-Australian plate is moving northward at ~5 cm/year, causing the Himalayas to rise by ~5 mm annually.',
      'Mid-Ocean Ridges are divergent boundaries where seafloor spreading occurs — the Atlantic Ocean widens by 2.5 cm/year.',
      'The Ring of Fire (Pacific) contains 75% of world\'s volcanoes and 90% of world\'s earthquakes.'
    ],
    examples: [
      'The collision of the Indian Plate with the Eurasian Plate ~50 million years ago formed the Himalayan mountain range.',
      'The East African Rift Valley is a divergent boundary where the African continent is splitting — eventually forming a new ocean.'
    ],
    tables: [
      {
        title: 'Types of Plate Boundaries and Examples',
        headers: ['Boundary Type', 'Plates Movement', 'Landforms Created', 'Example'],
        rows: [
          ['Convergent (Ocean-Ocean)', 'Two oceanic plates collide', 'Island arcs, oceanic trenches', 'Japan (Pacific + Philippine Plate)'],
          ['Convergent (Ocean-Continent)', 'Oceanic subducts under continental', 'Fold mountains + Volcanoes + Trenches', 'Andes Mts (Nazca + S.American)'],
          ['Convergent (Continent-Continent)', 'Two continental plates collide', 'High fold mountains (no subduction)', 'Himalayas (Indian + Eurasian)'],
          ['Divergent', 'Plates move apart', 'Mid-ocean ridges, rift valleys', 'Mid-Atlantic Ridge (NAmer + Eurasian)'],
          ['Transform', 'Plates slide past each other', 'Fault lines, earthquakes', 'San Andreas Fault (Pacific + N.American)']
        ]
      }
    ],
    revisionNotes: 'Plate Tectonics: Lithosphere over Asthenosphere. 7 major plates. Pacific = largest. Types: Convergent (collision), Divergent (separation), Transform (sliding). Himalayas = Continental-Continental convergent. Ring of Fire = Pacific = 75% volcanoes + 90% earthquakes. Seafloor spreading evidence: paleomagnetism + age of oceanic crust.',
    pyqs: [
      {
        question: { en: 'The concept of "Continental Drift" was proposed by which scientist?', hi: '"महाद्वीपीय विस्थापन" की अवधारणा किस वैज्ञानिक ने प्रस्तुत की थी?' },
        options: [
          { en: 'Harry Hess', hi: 'हैरी हेस' },
          { en: 'Alfred Wegener', hi: 'अल्फ्रेड वेगनर' },
          { en: 'Arthur Holmes', hi: 'आर्थर होम्स' },
          { en: 'J. Tuzo Wilson', hi: 'जे. टुजो विल्सन' }
        ],
        answer: 1,
        explanation: { en: 'Alfred Wegener, a German meteorologist, proposed the Continental Drift Theory in 1912 in his book "The Origin of Continents and Oceans." He suggested that all continents were once united as Pangaea.', hi: 'जर्मन मौसम विज्ञानी अल्फ्रेड वेगनर ने 1912 में अपनी पुस्तक "महाद्वीपों और महासागरों की उत्पत्ति" में महाद्वीपीय विस्थापन सिद्धांत प्रस्तुत किया। उनका सुझाव था कि सभी महाद्वीप कभी पैंजिया के रूप में एकजुट थे।' },
        year: 2016
      }
    ],
    detailedExplanation: `### 1. Introduction / प्रस्तावना
**English:** Plate Tectonics is Earth's grand unifying theory, explaining why the map of the world looks the way it does, why certain regions experience earthquakes, why some areas have volcanoes, and why mountains exist where they do.
**हिंदी:** प्लेट टेक्टोनिक्स पृथ्वी का महान एकीकरण सिद्धांत है, जो बताता है कि विश्व का नक्शा ऐसा क्यों दिखता है, कुछ क्षेत्रों में भूकंप क्यों आते हैं, कुछ स्थानों पर ज्वालामुखी क्यों हैं, और पहाड़ कहाँ हैं।

### 2. From Wegener to Plate Tectonics / वेगनर से प्लेट टेक्टोनिक्स तक
**English:** Wegener's 1912 evidence for continental drift: (a) Jigsaw fit of continents (especially Africa-South America), (b) Same fossil species on different continents (Glossopteris plant, Mesosaurus reptile), (c) Matching rock strata across oceans, (d) Evidence of glaciation in tropical regions. However, Wegener couldn't explain the mechanism.
**हिंदी:** महाद्वीपीय विस्थापन के लिए वेगनर का 1912 का साक्ष्य: (a) महाद्वीपों का जिग्सा फिट (विशेष रूप से अफ्रीका-दक्षिण अमेरिका), (b) विभिन्न महाद्वीपों पर समान जीवाश्म प्रजातियाँ, (c) महासागरों में मिलान करने वाली चट्टान की परतें, (d) उष्णकटिबंधीय क्षेत्रों में हिमनद का साक्ष्य।

### 3. Evidence for Plate Tectonics / प्लेट टेक्टोनिक्स के साक्ष्य
**English:** Post-WWII ocean floor mapping by Harry Hess revealed mid-ocean ridges. Paleomagnetism showed symmetrical magnetic striping on both sides of ridges — confirming seafloor spreading. Drilling revealed oceanic crust gets older away from ridges.
**हिंदी:** द्वितीय विश्व युद्ध के बाद हैरी हेस द्वारा समुद्र तल मानचित्रण ने मध्य-महासागर कटकों को प्रकट किया। पुरा-चुंबकत्व ने कटकों के दोनों किनारों पर सममित चुंबकीय पट्टियाँ दिखाईं — जिसने समुद्र तल प्रसार की पुष्टि की।

### 4. Indian Subcontinent & Plate Tectonics / भारतीय उपमहाद्वीप और प्लेट टेक्टोनिक्स
**English:** The Indian subcontinent broke away from Gondwanaland ~140 million years ago and drifted northward across the ancient Tethys Sea. Its collision with the Eurasian plate ~50-40 million years ago uplifted the Himalayas. The Tethys Sea sediments form the limestone found at Himalayan peaks.
**हिंदी:** भारतीय उपमहाद्वीप ~140 मिलियन वर्ष पहले गोंडवानालैंड से अलग हुआ और प्राचीन टेथिस सागर के पार उत्तर की ओर बहा। ~50-40 मिलियन वर्ष पहले यूरेशियन प्लेट से इसकी टक्कर ने हिमालय को ऊँचा किया।

### 5-13. [Summary sections...]
**English:** Understanding plate tectonics is critical for UPSC Geography. Key exam questions test: type of boundary forming Himalayas (continental-continental convergent), Ring of Fire location (Pacific), and evidence for the theory (paleomagnetism, fossil distribution).
**हिंदी:** UPSC भूगोल के लिए प्लेट टेक्टोनिक्स को समझना महत्वपूर्ण है। मुख्य परीक्षा प्रश्न परीक्षण करते हैं: हिमालय बनाने वाली सीमा का प्रकार (महाद्वीप-महाद्वीप अभिसारी), रिंग ऑफ फायर स्थान (प्रशांत), और सिद्धांत के साक्ष्य।`
  },

  // ══════════════════════════════════════════════════════════
  // GEOGRAPHY — INDIAN GEOGRAPHY
  // ══════════════════════════════════════════════════════════
  {
    exam: 'UPSC',
    subject: 'Geography',
    topic: 'Indian Geography',
    subtopic: 'Indian Monsoon — Onset, Withdrawal & El Nino',
    introduction: 'The Indian Monsoon is the seasonal reversal of winds that brings the majority of India\'s annual rainfall. It is the lifeline of Indian agriculture and the Indian economy, directly influencing the livelihoods of over 600 million farmers.',
    concepts: [
      'Southwest monsoon (June–September) and Northeast monsoon (October–December)',
      'Differential heating of land and sea as primary driver',
      'ITCZ (Inter-Tropical Convergence Zone) migration',
      'El Niño Southern Oscillation (ENSO) and its impact on Indian monsoon',
      'Arabian Sea branch vs Bay of Bengal branch'
    ],
    importantFacts: [
      'The Southwest Monsoon normally arrives at Kerala (Thiruvananthapuram) around June 1, advancing to Delhi by June 29.',
      'The Arabian Sea Branch gives heavy rainfall to the Western Ghats (Mahabaleshwar: 6,250 mm/year) while creating a rain shadow on the Deccan Plateau.',
      'Mawsynram (Meghalaya) receives the world\'s highest rainfall (~11,872 mm/year) due to funneling effect of topography.',
      'El Niño years (warm Pacific waters) typically cause drought in India; La Niña years cause excess rainfall.',
      'The retreat of Southwest Monsoon begins from Rajasthan by September and completes withdrawal by October 15.',
      'India gets 70–90% of its annual rainfall during the Southwest Monsoon (June–September).'
    ],
    examples: [
      '1997-98 El Niño was one of the strongest in the 20th century, causing severe drought in Rajasthan and UP.',
      'The 2019 monsoon was delayed by 7 days (arriving June 8 instead of June 1) due to a weak El Niño in the Pacific.'
    ],
    tables: [
      {
        title: 'Monsoon Branches — Arabian Sea vs Bay of Bengal',
        headers: ['Feature', 'Arabian Sea Branch', 'Bay of Bengal Branch'],
        rows: [
          ['Source', 'Arabian Sea', 'Bay of Bengal'],
          ['Direction', 'Northward → Western India', 'Northwestward → Northeast India'],
          ['Arrival', 'Kerala (June 1)', 'Andaman (May 20), NE India (June 1)'],
          ['Heavy Rainfall Zones', 'Western Ghats, Mumbai, Goa', 'Northeast India, West Bengal, Odisha'],
          ['Rain Shadow Created', 'Deccan Plateau, Leeward side of Ghats', 'Rajasthan (after passing through plains)'],
          ['Dominant at', 'Western coast and peninsular India', 'Eastern India and Gangetic plains']
        ]
      }
    ],
    revisionNotes: 'SW Monsoon: June–Sep. Arrives Kerala June 1. Arabian Sea branch → Western Ghats rain. Bay of Bengal branch → NE India + Gangetic plains. El Niño = warm Pacific = India drought. La Niña = cool Pacific = India floods. Mawsynram = world\'s highest rainfall. Retreat: from Rajasthan (Sep) → complete by Oct 15.',
    pyqs: [
      {
        question: { en: 'Which of the following is NOT a correct effect of El Niño on Indian monsoon?', hi: 'निम्नलिखित में से कौन सा भारतीय मानसून पर अल नीनो का सही प्रभाव नहीं है?' },
        options: [
          { en: 'Weak or deficient monsoon rainfall', hi: 'कमजोर या अपर्याप्त मानसून वर्षा' },
          { en: 'Higher probability of drought in India', hi: 'भारत में सूखे की अधिक संभावना' },
          { en: 'Above-normal rainfall in western Pacific', hi: 'पश्चिमी प्रशांत में सामान्य से अधिक वर्षा' },
          { en: 'Excess flooding in the Indian subcontinent', hi: 'भारतीय उपमहाद्वीप में अत्यधिक बाढ़' }
        ],
        answer: 3,
        explanation: { en: 'El Niño is associated with weaker Indian monsoon, drought conditions, and deficient rainfall — not excess flooding. Excess flooding is associated with La Niña. El Niño causes excess rainfall in western Pacific (Peru, Ecuador) while India experiences drought.', hi: 'अल नीनो कमजोर भारतीय मानसून, सूखे और कमजोर वर्षा से जुड़ा है — अत्यधिक बाढ़ से नहीं। अत्यधिक बाढ़ ला नीना से जुड़ी है। अल नीनो पश्चिमी प्रशांत में अत्यधिक वर्षा का कारण बनता है जबकि भारत में सूखा पड़ता है।' },
        year: 2020
      }
    ],
    detailedExplanation: `### 1. Introduction / प्रस्तावना
**English:** The word "Monsoon" is derived from the Arabic word "Mausim" meaning season. The Indian monsoon is driven by the differential heating between the Indian subcontinent (which heats up rapidly) and the Indian Ocean.
**हिंदी:** "मानसून" शब्द अरबी शब्द "मौसिम" से लिया गया है जिसका अर्थ है मौसम। भारतीय मानसून भारतीय उपमहाद्वीप (जो तेजी से गर्म होता है) और हिंद महासागर के बीच अंतर ताप द्वारा संचालित होता है।

### 2. Mechanism / तंत्र
**English:** In summer, the landmass heats up faster than the ocean. This creates a low-pressure zone over India and a high-pressure zone over the Indian Ocean. Moist ocean air rushes in to fill the vacuum — bringing monsoon rains. This is reversed in winter (NE monsoon).
**हिंदी:** गर्मियों में, भूमि महासागर की तुलना में तेजी से गर्म होती है। इससे भारत पर निम्न दाब क्षेत्र और हिंद महासागर पर उच्च दाब क्षेत्र बनता है। नम समुद्री हवा रिक्तता भरने के लिए अंदर आती है — मानसून वर्षा लाती है।

### 3. ITCZ Role / ITCZ की भूमिका
**English:** The Inter-Tropical Convergence Zone (ITCZ) is a belt of low pressure near the equator where trade winds from both hemispheres meet. In summer, ITCZ shifts northward over India (up to 20°-25°N), which is a key trigger for the onset of Southwest Monsoon.
**हिंदी:** अंतर-उष्णकटिबंधीय अभिसरण क्षेत्र (ITCZ) भूमध्य रेखा के पास एक निम्न दाब पट्टी है जहाँ दोनों गोलार्धों से व्यापारिक हवाएँ मिलती हैं। गर्मियों में, ITCZ भारत के ऊपर उत्तर की ओर (20°-25°N तक) खिसकती है, जो दक्षिण-पश्चिम मानसून की शुरुआत के लिए एक प्रमुख ट्रिगर है।

### 4-13. [Continued academic sections...]
**English:** El Niño occurs every 2-7 years when Pacific Ocean temperatures rise abnormally. The Walker Circulation (east-west pressure difference in Pacific) weakens, reducing convection over Indian Ocean and weakening monsoon. Indian drought probability increases by 60% in strong El Niño years.
**हिंदी:** अल नीनो हर 2-7 वर्षों में तब होता है जब प्रशांत महासागर का तापमान असामान्य रूप से बढ़ जाता है। वॉकर सर्कुलेशन (प्रशांत में पूर्व-पश्चिम दबाव अंतर) कमजोर होता है, हिंद महासागर पर संवहन कम होता है और मानसून कमजोर होता है।`
  },

  // ══════════════════════════════════════════════════════════
  // ECONOMICS — MACROECONOMICS
  // ══════════════════════════════════════════════════════════
  {
    exam: 'UPSC',
    subject: 'Economics',
    topic: 'Macroeconomics',
    subtopic: 'Inflation — Types, Measurement (CPI, WPI) & Control',
    introduction: 'Inflation is the sustained increase in the general price level of goods and services, resulting in a decrease in purchasing power of money. Managing inflation is a central objective of monetary policy in India, primarily through the Reserve Bank of India\'s policy rate decisions.',
    concepts: [
      'Types: Demand-pull, Cost-push, Structural, Imported, Stagflation',
      'Measurement: Consumer Price Index (CPI) and Wholesale Price Index (WPI)',
      'Headline vs Core Inflation',
      'RBI\'s Inflation Targeting Framework (ITF) — 4% ± 2%',
      'Repo Rate as primary tool to control inflation'
    ],
    importantFacts: [
      'India adopted the Flexible Inflation Targeting Framework (FIT) in 2016 under RBI Amendment Act.',
      'CPI is the key inflation indicator for RBI\'s monetary policy (replaced WPI as headline measure in 2014).',
      'CPI target: 4% with upper tolerance of 6% and lower tolerance of 2%.',
      'If CPI stays above 6% for 3 consecutive quarters, RBI must submit a report to Government explaining reasons.',
      'WPI measures inflation at the producer/wholesale level; CPI measures at the consumer/retail level.',
      'India has two types of CPI: CPI-Urban + CPI-Rural, combined into CPI-Combined (released by MoSPI).'
    ],
    examples: [
      'In 2022, Russia-Ukraine war caused global energy and food price surge, pushing India\'s CPI above 7% (exceeding the 6% upper band).',
      'RBI raised repo rate from 4% (April 2022) to 6.5% (February 2023) — 250 bps increase — to control post-COVID inflation.'
    ],
    tables: [
      {
        title: 'CPI vs WPI — Key Differences',
        headers: ['Feature', 'CPI (Consumer Price Index)', 'WPI (Wholesale Price Index)'],
        rows: [
          ['Measures', 'Retail/Consumer level price changes', 'Wholesale/Producer level price changes'],
          ['Base Year', '2012', '2011-12'],
          ['Released by', 'MoSPI (Ministry of Statistics)', 'DPIIT (Department for Promotion of Industry)'],
          ['Components', 'Food (45.86%), Housing, Fuel, Misc', 'Primary articles, Fuel, Manufactured goods'],
          ['Policy Use', 'RBI monetary policy target', 'Industrial input cost tracking'],
          ['Frequency', 'Monthly', 'Monthly'],
          ['Services', 'Included (housing, education, health)', 'Not included (only goods)']
        ]
      }
    ],
    revisionNotes: 'Inflation types: Demand-pull (excess demand), Cost-push (supply shock), Stagflation (inflation + recession). CPI = RBI target (4% ± 2%). WPI = wholesale. Repo rate = key tool. If CPI > 6% for 3 quarters → RBI must report to govt. India FIT adopted 2016.',
    pyqs: [
      {
        question: { en: 'If the inflation rate is measured using the Wholesale Price Index, then which of the following is a limitation of this method?', hi: 'यदि थोक मूल्य सूचकांक का उपयोग करके मुद्रास्फीति की दर मापी जाती है, तो निम्नलिखित में से इस पद्धति की कौन सी सीमा है?' },
        options: [
          { en: 'It excludes the prices of food items', hi: 'यह खाद्य पदार्थों की कीमतों को बाहर करता है' },
          { en: 'It does not capture prices of services', hi: 'यह सेवाओं की कीमतों को शामिल नहीं करता' },
          { en: 'It measures only rural price levels', hi: 'यह केवल ग्रामीण मूल्य स्तर को मापता है' },
          { en: 'It is not computed monthly', hi: 'इसकी गणना मासिक आधार पर नहीं की जाती' }
        ],
        answer: 1,
        explanation: { en: 'WPI measures price changes at the wholesale/producer level and covers only goods (food, fuel, manufactured products). It does NOT include services like health, education, rent — which form a significant portion of household expenditure. This is why CPI has replaced WPI as the headline inflation measure.', hi: 'WPI थोक/उत्पादक स्तर पर मूल्य परिवर्तन को मापता है और केवल वस्तुओं को शामिल करता है। इसमें स्वास्थ्य, शिक्षा, किराया जैसी सेवाएँ शामिल नहीं हैं — जो घरेलू व्यय का एक महत्वपूर्ण हिस्सा हैं।' },
        year: 2022
      }
    ],
    detailedExplanation: `### 1. Introduction / प्रस्तावना
**English:** Inflation erodes the purchasing power of money — meaning the same amount of money buys fewer goods over time. For India's 1.4 billion people, especially the poor who spend 50%+ of income on food, inflation is a matter of daily survival.
**हिंदी:** मुद्रास्फीति धन की क्रय शक्ति को क्षीण करती है — अर्थात समय के साथ एक ही राशि से कम वस्तुएँ खरीदी जा सकती हैं।

### 2. Types of Inflation / मुद्रास्फीति के प्रकार
**English:** (1) Demand-Pull: "Too much money chasing too few goods" — caused by rising aggregate demand (e.g., post-COVID stimulus). (2) Cost-Push: Supply shock raises production costs — war, oil price spike. (3) Structural: Supply-side bottlenecks in developing economies — poor infrastructure, agricultural inefficiencies. (4) Stagflation: Simultaneous high inflation + high unemployment + slow growth (1970s oil crisis).
**हिंदी:** (1) माँग-प्रेरित: "कम वस्तुओं के पीछे बहुत अधिक पैसा" — बढ़ती कुल माँग से। (2) लागत-प्रेरित: आपूर्ति झटका उत्पादन लागत बढ़ाता है। (3) संरचनात्मक: विकासशील अर्थव्यवस्थाओं में आपूर्ति-पक्ष बाधाएँ। (4) स्टैगफ्लेशन: उच्च मुद्रास्फीति + उच्च बेरोजगारी + धीमी वृद्धि।

### 3. Measurement / मापन
**English:** India measures inflation through two main indices: (a) CPI — measures average price change experienced by consumers (households). Weight: Food = 45.86%, Fuel = 6.84%, Housing = 10.07%. (b) WPI — tracks wholesale trading price of 697 commodities in 3 categories.
**हिंदी:** भारत दो मुख्य सूचकांकों से मुद्रास्फीति मापता है: (a) CPI — उपभोक्ताओं द्वारा अनुभव किया गया औसत मूल्य परिवर्तन। भार: खाद्य = 45.86%, ईंधन = 6.84%। (b) WPI — 3 श्रेणियों में 697 वस्तुओं की थोक व्यापार कीमत।

### 4-13. [Continued sections...]
**English:** RBI's primary tool is the Repo Rate — the rate at which RBI lends to commercial banks. Higher repo → banks borrow less → credit squeeze → less money in economy → lower demand → lower inflation.
**हिंदी:** RBI का प्राथमिक उपकरण रेपो दर है — वह दर जिस पर RBI वाणिज्यिक बैंकों को उधार देता है। उच्च रेपो → बैंक कम उधार लेते हैं → ऋण संकुचन → अर्थव्यवस्था में कम पैसा → कम माँग → कम मुद्रास्फीति।`
  },

  // ══════════════════════════════════════════════════════════
  // ECONOMICS — INDIAN ECONOMY
  // ══════════════════════════════════════════════════════════
  {
    exam: 'UPSC',
    subject: 'Economics',
    topic: 'Indian Economy',
    subtopic: 'Poverty — Measurement & Poverty Line',
    introduction: 'Poverty is a state of deprivation in which individuals or households lack the resources to meet basic needs — food, clothing, shelter, healthcare, and education. Understanding how India measures and addresses poverty is central to UPSC Economics and Social Justice.',
    concepts: [
      'Absolute vs Relative Poverty',
      'Poverty Line concept and calorie-based measurement',
      'Key committees: Tendulkar (2009), Rangarajan (2014)',
      'Multidimensional Poverty Index (MPI) — NITI Aayog approach',
      'Major anti-poverty programmes: MGNREGA, PM-KISAN, PMAY'
    ],
    importantFacts: [
      'The Tendulkar Committee (2009) measured poverty using monthly per capita consumption expenditure: ₹816 (rural) and ₹1,000 (urban).',
      'The Rangarajan Committee (2014) revised the poverty line upward: ₹972 (rural) and ₹1,407 (urban) per capita per month.',
      'India\'s poverty rate fell from 29.5% (2012, Tendulkar) to about 15% by 2019 according to World Bank estimates.',
      'NITI Aayog\'s National MPI 2023 reported 11.28% of India\'s population as multidimensionally poor.',
      'India lifted 415 million people out of poverty between 2005-06 and 2019-21 (UNDP report).',
      'Gini Coefficient measures income inequality: India\'s Gini stands at ~0.35 (moderate inequality).'
    ],
    examples: [
      'MGNREGA (2005) guarantees 100 days of wage employment/year to rural households — India\'s largest rural employment scheme with ₹89,400 crore outlay in 2023-24.',
      'PM Jan Dhan Yojana (2014) opened 50+ crore bank accounts, reducing financial exclusion as a dimension of poverty.'
    ],
    tables: [
      {
        title: 'Poverty Line Evolution in India',
        headers: ['Committee / Year', 'Poverty Line Rural', 'Poverty Line Urban', 'BPL Population'],
        rows: [
          ['Alagh Committee (1979)', 'Based on 2400 calories/day', 'Based on 2100 calories/day', '~48% (1973-74)'],
          ['Lakdawala Committee (1993)', 'State-specific adjustments', 'State-specific adjustments', '35.97% (1993-94)'],
          ['Tendulkar Committee (2009)', '₹816/month per capita', '₹1,000/month per capita', '29.5% (2011-12)'],
          ['Rangarajan Committee (2014)', '₹972/month per capita', '₹1,407/month per capita', '29.5–38% debate'],
          ['NITI MPI (2023)', 'Multidimensional (10 indicators)', 'Multidimensional (10 indicators)', '11.28% (2019-21)']
        ]
      }
    ],
    revisionNotes: 'Poverty Line: Tendulkar = ₹816 rural / ₹1000 urban. Rangarajan = ₹972 rural / ₹1407 urban. India MPI 2023 = 11.28%. 415 mn lifted out of poverty (2005-19). MGNREGA = 100 days employment guarantee. Gini = income inequality measure (0 = perfect equality, 1 = perfect inequality).',
    pyqs: [
      {
        question: { en: 'What is "Multidimensional Poverty Index" based on?', hi: '"बहुआयामी गरीबी सूचकांक" किस पर आधारित है?' },
        options: [
          { en: 'Only per capita income', hi: 'केवल प्रति व्यक्ति आय' },
          { en: 'Calorie intake and income', hi: 'कैलोरी ग्रहण और आय' },
          { en: 'Multiple deprivations in health, education, and living standards', hi: 'स्वास्थ्य, शिक्षा और जीवन स्तर में बहुआयामी अभाव' },
          { en: 'Only monthly household expenditure', hi: 'केवल मासिक घरेलू व्यय' }
        ],
        answer: 2,
        explanation: { en: 'The Multidimensional Poverty Index (MPI) captures deprivations across three dimensions: Health (nutrition, child mortality), Education (years of schooling, school attendance), and Living Standards (cooking fuel, sanitation, drinking water, electricity, housing, assets).', hi: 'बहुआयामी गरीबी सूचकांक (MPI) तीन आयामों में अभावों को मापता है: स्वास्थ्य (पोषण, शिशु मृत्यु), शिक्षा (स्कूली शिक्षा के वर्ष, स्कूल उपस्थिति), और जीवन स्तर (खाना पकाने का ईंधन, स्वच्छता, पेयजल, बिजली, आवास, संपत्ति)।' },
        year: 2023
      }
    ],
    detailedExplanation: `### 1. Introduction / प्रस्तावना
**English:** Poverty in India is not just about income — it is about access to nutrition, education, sanitation, energy, and dignity. India's approach to poverty measurement has evolved from pure calorie-based benchmarks to multidimensional frameworks.
**हिंदी:** भारत में गरीबी केवल आय के बारे में नहीं है — यह पोषण, शिक्षा, स्वच्छता, ऊर्जा और सम्मान तक पहुँच के बारे में है।

### 2. Absolute vs Relative Poverty / निरपेक्ष बनाम सापेक्ष गरीबी
**English:** Absolute Poverty means failing to meet a minimum standard of living (food, clothing, shelter). It is measured against a fixed poverty line. Relative Poverty means being poor compared to others in society — measured as earning below 60% of median income. India primarily uses absolute poverty measurement.
**हिंदी:** निरपेक्ष गरीबी का अर्थ है न्यूनतम जीवन स्तर (भोजन, कपड़ा, आश्रय) को पूरा करने में विफलता। सापेक्ष गरीबी का अर्थ है समाज के अन्य लोगों की तुलना में गरीब होना।

### 3-13. [Continued sections...]
**English:** India's poverty reduction story is remarkable — from 45% in 1993-94 to 11.28% (MPI) in 2019-21. However, challenges remain: rural-urban divide, regional disparities (Bihar and UP have highest MPI poverty rates), and climate-linked livelihood vulnerabilities.
**हिंदी:** भारत की गरीबी कमी की कहानी उल्लेखनीय है — 1993-94 में 45% से 2019-21 में 11.28% (MPI) तक। हालाँकि, चुनौतियाँ बनी हैं: शहरी-ग्रामीण विभाजन, क्षेत्रीय असमानताएँ।`
  },

  // ══════════════════════════════════════════════════════════
  // ENVIRONMENT — ECOSYSTEMS
  // ══════════════════════════════════════════════════════════
  {
    exam: 'UPSC',
    subject: 'Environment & Ecology',
    topic: 'Ecosystems & Biodiversity',
    subtopic: 'Biodiversity Hotspots — India\'s Hotspots',
    introduction: 'Biodiversity Hotspots are biogeographic regions with exceptional concentrations of endemic species and significant habitat loss. The concept was introduced by Norman Myers in 1988. India is home to four of the world\'s 36 recognized biodiversity hotspots.',
    concepts: [
      'Criteria for Hotspot designation: ≥1,500 endemic plant species + ≥70% habitat loss',
      'India\'s four hotspots: Western Ghats, Eastern Himalayas, Indo-Burma, Sundaland',
      'Biodiversity types: Genetic, Species, Ecosystem diversity',
      'IUCN Red List threat categories',
      'In-situ vs Ex-situ conservation strategies'
    ],
    importantFacts: [
      'To qualify as a hotspot, an area must contain ≥1,500 endemic vascular plant species AND have lost ≥70% of original habitat.',
      'India\'s Western Ghats has 5,000+ plant species (1,700+ endemic) and is home to 139 amphibian species — 75% are endemic.',
      'Eastern Himalayas (including Sikkim, Assam, Meghalaya) hosts 163 globally threatened species.',
      'The Indo-Burma hotspot covers Myanmar, Thailand, China (Yunnan), and NE India.',
      'Sundaland (Nicobar Islands) is India\'s smallest represented hotspot region.',
      'India has 106 National Parks and 565 Wildlife Sanctuaries covering about 5.03% of total geographic area.'
    ],
    examples: [
      'Silent Valley National Park (Kerala, Western Ghats) was saved from a hydropower project in 1983 due to biodiversity campaigns — protecting the last undisturbed tropical rainforest in southern India.',
      'Nanda Devi Biosphere Reserve (Himalayas) was inscribed as a UNESCO World Heritage Site for its pristine alpine ecosystems.'
    ],
    tables: [
      {
        title: 'India\'s Four Biodiversity Hotspots',
        headers: ['Hotspot', 'States Covered', 'Key Endemics', 'Major Threats'],
        rows: [
          ['Western Ghats', 'Kerala, Tamil Nadu, Karnataka, Goa, Maharashtra', '5,000+ plants, Lion-tailed macaque, Nilgiri tahr', 'Agriculture, urbanization, mining'],
          ['Eastern Himalayas', 'Sikkim, Assam, Arunachal Pradesh', 'Red panda, Snow leopard, Golden langur', 'Shifting cultivation, infrastructure'],
          ['Indo-Burma', 'Manipur, Mizoram, Nagaland', 'Brow-antlered deer (Sangai), Irrawaddy dolphin', 'Deforestation, dam construction'],
          ['Sundaland (Nicobar)', 'Andaman & Nicobar Islands', 'Nicobar megapode, saltwater crocodile', 'Tourism, invasive species']
        ]
      }
    ],
    revisionNotes: 'Hotspot criteria: ≥1500 endemic plants + ≥70% habitat loss. India has 4 hotspots: Western Ghats (richest), Eastern Himalayas, Indo-Burma, Sundaland (Nicobar). Norman Myers coined "biodiversity hotspot" in 1988. Western Ghats = largest hotspot in India by endemic species. 36 hotspots globally covering just 2.4% of Earth\'s land area but hosting 60% of all species.',
    pyqs: [
      {
        question: { en: 'Which of the following is NOT one of India\'s recognized biodiversity hotspots?', hi: 'निम्नलिखित में से कौन सा भारत के मान्यता प्राप्त जैव विविधता हॉटस्पॉट में से एक नहीं है?' },
        options: [
          { en: 'Western Ghats', hi: 'पश्चिमी घाट' },
          { en: 'Eastern Himalayas', hi: 'पूर्वी हिमालय' },
          { en: 'Gangetic Plains', hi: 'गांगेय मैदान' },
          { en: 'Indo-Burma region', hi: 'इंडो-बर्मा क्षेत्र' }
        ],
        answer: 2,
        explanation: { en: 'India\'s four biodiversity hotspots are: (1) Western Ghats, (2) Eastern Himalayas, (3) Indo-Burma, (4) Sundaland (representing the Nicobar Islands). The Gangetic Plains are NOT a biodiversity hotspot — they are degraded agricultural landscapes.', hi: 'भारत के चार जैव विविधता हॉटस्पॉट हैं: (1) पश्चिमी घाट, (2) पूर्वी हिमालय, (3) इंडो-बर्मा, (4) सुंडालैंड (निकोबार द्वीप)। गांगेय मैदान जैव विविधता हॉटस्पॉट नहीं हैं।' },
        year: 2019
      }
    ],
    detailedExplanation: `### 1. Introduction / प्रस्तावना
**English:** Earth's biological diversity is not uniformly distributed. Certain small areas contain disproportionately large numbers of species and endemics. These "hotspots" are Earth's most biologically rich and most threatened ecosystems.
**हिंदी:** पृथ्वी की जैविक विविधता समान रूप से वितरित नहीं है। कुछ छोटे क्षेत्रों में असमान रूप से बड़ी संख्या में प्रजातियाँ और स्थानिक हैं।

### 2. Hotspot Criteria / हॉटस्पॉट मानदंड
**English:** Norman Myers' 1988 definition required two conditions: (1) Exceptionally high endemism — at least 1,500 endemic vascular plant species (0.5% of world's 300,000 plant species); (2) Threat — having lost at least 70% of original habitat. Both conditions must be met simultaneously.
**हिंदी:** नॉर्मन मायर्स की 1988 की परिभाषा के लिए दो शर्तें आवश्यक थीं: (1) असाधारण उच्च स्थानिकता — कम से कम 1,500 स्थानिक संवहनी पौधों की प्रजातियाँ; (2) खतरा — कम से कम 70% मूल आवास खो चुका हो।

### 3. Western Ghats / पश्चिमी घाट
**English:** The Western Ghats extend over 1,600 km from Gujarat to Kerala. It contains 5,000 species of flowering plants (38% endemic), 508 bird species, 179 amphibian species (75% endemic), 288 freshwater fish species. Key protected areas: Silent Valley, Agasthyamalai, Periyar Tiger Reserve.
**हिंदी:** पश्चिमी घाट गुजरात से केरल तक 1,600 किमी में फैला है। इसमें फूलदार पौधों की 5,000 प्रजातियाँ (38% स्थानिक), 508 पक्षी प्रजातियाँ, 179 उभयचर प्रजातियाँ (75% स्थानिक) हैं।

### 4-13. [Continued academic sections...]
**English:** Conservation strategies for hotspots include in-situ (protecting habitat in its natural location — national parks, biosphere reserves) and ex-situ (removing organisms from natural habitat — zoos, gene banks, botanical gardens). India is one of 17 megadiverse countries in the world.
**हिंदी:** हॉटस्पॉट के लिए संरक्षण रणनीतियों में स्व-स्थाने (प्राकृतिक स्थान पर आवास की रक्षा) और बाह्य-स्थाने (प्राकृतिक आवास से जीवों को हटाना — चिड़ियाघर, जीन बैंक) शामिल हैं।`
  },

  // ══════════════════════════════════════════════════════════
  // ENVIRONMENT — CLIMATE CHANGE
  // ══════════════════════════════════════════════════════════
  {
    exam: 'UPSC',
    subject: 'Environment & Ecology',
    topic: 'Environmental Issues',
    subtopic: 'Climate Change — Greenhouse Effect & Global Warming',
    introduction: 'Climate Change refers to long-term alterations in temperature, precipitation, wind patterns, and other aspects of Earth\'s climate system. The primary driver is the enhanced Greenhouse Effect caused by anthropogenic emissions of greenhouse gases (GHGs), particularly CO₂, CH₄, N₂O, and F-gases.',
    concepts: [
      'Natural vs Enhanced Greenhouse Effect',
      'Key greenhouse gases: CO₂, CH₄, N₂O, CFCs, Water Vapor',
      'Global Warming Potential (GWP) — CO₂ as baseline',
      'IPCC reports and temperature targets',
      'India\'s NDC (Nationally Determined Contribution) commitments'
    ],
    importantFacts: [
      'Earth\'s average temperature has risen by approximately 1.1°C above pre-industrial levels (1850–1900 baseline) as of 2023.',
      'CO₂ concentration has risen from 280 ppm (pre-industrial) to over 421 ppm in 2023.',
      'Methane (CH₄) has 28x more Global Warming Potential than CO₂ over 100 years; N₂O has 273x.',
      'IPCC AR6 (2022) warns that 1.5°C threshold could be crossed by mid-2030s under current emission trends.',
      'India\'s NDC: Reduce emissions intensity of GDP by 45% by 2030 vs 2005; achieve 50% cumulative electric power capacity from non-fossil sources by 2030.',
      'India declared Net Zero by 2070 at COP26 (Glasgow, 2021).'
    ],
    examples: [
      'The Gangotri Glacier (source of Ganga) has retreated by over 22 km since 1780 — accelerating at 22 m/year due to global warming.',
      'Cyclone Amphan (2020) — one of the strongest in Bay of Bengal history — attributed to warmer Indian Ocean sea surface temperatures.'
    ],
    tables: [
      {
        title: 'Major Greenhouse Gases and Properties',
        headers: ['Gas', 'Main Source', 'Global Warming Potential (100 yr)', 'Atmospheric Lifetime'],
        rows: [
          ['CO₂', 'Fossil fuels, deforestation', '1 (baseline)', '20–200 years'],
          ['CH₄ (Methane)', 'Livestock, rice paddies, landfills, natural gas', '28', '12 years'],
          ['N₂O', 'Agriculture (fertilizers), combustion', '273', '114 years'],
          ['HFCs', 'Refrigerants, air conditioning', '12,000–14,800', 'Decades'],
          ['SF₆', 'Electrical equipment', '22,800', '3,200 years'],
          ['Water Vapor', 'Evaporation', 'Not counted (feedback)', 'Days']
        ]
      }
    ],
    revisionNotes: 'Current warming: +1.1°C. CO₂: 421 ppm (pre-industrial: 280). GWP: CO₂=1, CH₄=28, N₂O=273. Paris Agreement: limit warming to 1.5°C/2°C. India NDC: 45% emission intensity reduction by 2030. Net Zero: 2070. IPCC = scientific body (not UN govt body). COP = Conference of Parties under UNFCCC.',
    pyqs: [
      {
        question: { en: 'Which greenhouse gas has the highest Global Warming Potential (GWP) over 100 years?', hi: '100 वर्षों में सबसे अधिक ग्लोबल वार्मिंग पोटेंशियल (GWP) किस ग्रीनहाउस गैस का है?' },
        options: [
          { en: 'Carbon Dioxide (CO₂)', hi: 'कार्बन डाइऑक्साइड (CO₂)' },
          { en: 'Methane (CH₄)', hi: 'मीथेन (CH₄)' },
          { en: 'Sulphur Hexafluoride (SF₆)', hi: 'सल्फर हेक्साफ्लोराइड (SF₆)' },
          { en: 'Nitrous Oxide (N₂O)', hi: 'नाइट्रस ऑक्साइड (N₂O)' }
        ],
        answer: 2,
        explanation: { en: 'Sulphur Hexafluoride (SF₆) has a GWP of 22,800 over 100 years — the highest of any greenhouse gas. It is used in electrical switchgear. However, CO₂ is the most impactful because of its volume in the atmosphere.', hi: 'सल्फर हेक्साफ्लोराइड (SF₆) का 100 वर्षों में GWP 22,800 है — किसी भी ग्रीनहाउस गैस में सबसे अधिक। लेकिन CO₂ वायुमंडल में अपनी मात्रा के कारण सबसे अधिक प्रभावशाली है।' },
        year: 2018
      }
    ],
    detailedExplanation: `### 1. Introduction / प्रस्तावना
**English:** The natural greenhouse effect is essential for life — without it, Earth's average temperature would be -18°C instead of +15°C. Human activities have enhanced this effect by adding GHGs at rates far exceeding natural absorption capacity.
**हिंदी:** प्राकृतिक ग्रीनहाउस प्रभाव जीवन के लिए आवश्यक है — इसके बिना, पृथ्वी का औसत तापमान +15°C के बजाय -18°C होता। मानव गतिविधियों ने प्राकृतिक अवशोषण क्षमता से कहीं अधिक दर पर GHG जोड़कर इस प्रभाव को बढ़ाया है।

### 2. Mechanism / तंत्र
**English:** Solar radiation (shortwave) passes through atmosphere and warms Earth's surface. Earth emits longwave (infrared) radiation back. GHGs trap this outgoing radiation — re-radiating heat back to Earth (like a blanket). More GHGs = thicker blanket = more warming.
**हिंदी:** सौर विकिरण (लघु तरंग) वायुमंडल से गुजरता है और पृथ्वी की सतह को गर्म करता है। पृथ्वी दीर्घ तरंग (अवरक्त) विकिरण वापस उत्सर्जित करती है। GHG इस बाहर जाने वाले विकिरण को फँसाती हैं — गर्मी को वापस पृथ्वी पर विकिरित करती हैं।

### 3-13. [Continued sections...]
**English:** India's vulnerability: 700 million+ people depend on climate-sensitive sectors (agriculture, forestry, fisheries). Sea-level rise threatens 7,516 km of coastline. Himalayan glacier melt threatens water security of 500 million people. IPCC AR6 identifies India as a climate hotspot.
**हिंदी:** भारत की संवेदनशीलता: 700 मिलियन+ लोग जलवायु-संवेदनशील क्षेत्रों (कृषि, वानिकी, मत्स्य पालन) पर निर्भर हैं। समुद्र स्तर वृद्धि 7,516 किमी तट को खतरा देती है।`
  },

  // ══════════════════════════════════════════════════════════
  // SCIENCE & TECHNOLOGY — SPACE
  // ══════════════════════════════════════════════════════════
  {
    exam: 'UPSC',
    subject: 'Science & Technology',
    topic: 'Space Technology',
    subtopic: 'Chandrayaan Missions — 1, 2 & 3',
    introduction: 'The Chandrayaan missions are India\'s flagship lunar exploration programme by ISRO. These missions have established India as a major space power, with Chandrayaan-3 making India the first country to land near the lunar south pole.',
    concepts: [
      'Chandrayaan-1: First lunar orbiter — discovered water molecules on moon',
      'Chandrayaan-2: Orbiter (operational) + Vikram lander (crashed) + Pragyan rover',
      'Chandrayaan-3: Successful soft landing at lunar south pole (August 23, 2023)',
      'Scientific objectives: lunar geology, water-ice detection, south pole characterization',
      'India\'s position as 4th nation to achieve soft lunar landing'
    ],
    importantFacts: [
      'Chandrayaan-1 (Oct 2008): India\'s first lunar mission. MIP (Moon Impact Probe) confirmed presence of water molecules on moon surface. Lasted 312 days.',
      'Chandrayaan-2 (July 2019): Orbiter (still active) + Vikram lander crash-landed. Pragyan rover never deployed. Orbiter is mapping Moon with 8 instruments.',
      'Chandrayaan-3 (Aug 23, 2023): Vikram-3 lander + Pragyan rover successfully landed at 69°S latitude — first ever soft landing at lunar south pole.',
      'Chandrayaan-3 carried instruments detecting sulphur, aluminium, calcium, iron, chromium, titanium, manganese, silicon, and oxygen on lunar surface.',
      'India became the 4th country to achieve soft lunar landing (after USSR, USA, China) and the ONLY country to land at the south pole.',
      'Propulsion module of Chandrayaan-3 orbited the Moon and later performed a unique maneuver to Earth orbit — demonstrating technology for future sample return missions.'
    ],
    examples: [
      'The Mini-SAR instrument on Chandrayaan-1 detected more than 600 million metric tonnes of water-ice in permanently shadowed craters at the lunar north pole.',
      'Chandrayaan-3\'s RAMBHA-LP (Radio Anatomy of Moon Bound Hypersensitive ionosphere and Atmosphere) measured plasma density near the lunar surface for the first time.'
    ],
    tables: [
      {
        title: 'Chandrayaan Missions — Key Comparison',
        headers: ['Mission', 'Launch Date', 'Objectives', 'Key Achievement', 'Status'],
        rows: [
          ['Chandrayaan-1', 'Oct 22, 2008', 'Lunar orbiter + impact probe', 'Discovered water molecules on Moon', 'Completed (312 days)'],
          ['Chandrayaan-2', 'Jul 22, 2019', 'Orbiter + Vikram lander + Pragyan rover', 'Orbiter still active; Lander crash-landed', 'Orbiter operational; Lander failed'],
          ['Chandrayaan-3', 'Jul 14, 2023', 'Soft landing at south pole + surface exploration', 'First soft landing at lunar south pole; confirmed sulphur', 'Mission completed successfully']
        ]
      }
    ],
    revisionNotes: 'Chandrayaan-1: 2008, water on moon, MIP. Chandrayaan-2: 2019, lander crashed, orbiter active. Chandrayaan-3: Aug 23, 2023, first lunar south pole landing. Instruments: LIBS (Laser Spectrometer), RAMBHA-LP, ChaSTE. India = 4th nation soft landing. Budget: Chandrayaan-3 cost ₹615 crore.',
    pyqs: [
      {
        question: { en: 'Chandrayaan-3 made India the first country to land near which part of the Moon?', hi: 'चंद्रयान-3 ने भारत को चंद्रमा के किस भाग के पास उतरने वाला पहला देश बनाया?' },
        options: [
          { en: 'North Pole', hi: 'उत्तरी ध्रुव' },
          { en: 'Equatorial region', hi: 'भूमध्यरेखीय क्षेत्र' },
          { en: 'South Pole', hi: 'दक्षिणी ध्रुव' },
          { en: 'Dark side (Far side)', hi: 'अंधेरा पक्ष (दूर का पक्ष)' }
        ],
        answer: 2,
        explanation: { en: 'Chandrayaan-3\'s Vikram lander made a successful soft landing on August 23, 2023 at the lunar south pole region (69°S latitude). This made India the first country in the world to achieve a soft landing near the lunar south pole, which is of scientific interest due to the presence of permanently shadowed craters believed to contain water-ice.', hi: 'चंद्रयान-3 के विक्रम लैंडर ने 23 अगस्त 2023 को चंद्रमा के दक्षिणी ध्रुव क्षेत्र (69°S अक्षांश) पर सफलतापूर्वक सॉफ्ट लैंडिंग की। इससे भारत चंद्रमा के दक्षिणी ध्रुव के पास सॉफ्ट लैंडिंग करने वाला दुनिया का पहला देश बन गया।' },
        year: 2024
      }
    ],
    detailedExplanation: `### 1. Introduction / प्रस्तावना
**English:** The Moon is humanity's gateway to deep space exploration. India's Chandrayaan programme is part of ISRO's long-term vision of making India a leading spacefaring nation, with ambitions for human spaceflight (Gaganyaan) and a lunar space station by 2040.
**हिंदी:** चंद्रमा मानवता का गहरे अंतरिक्ष अन्वेषण का प्रवेश द्वार है। भारत का चंद्रयान कार्यक्रम ISRO की दीर्घकालिक दृष्टि का हिस्सा है।

### 2. Chandrayaan-1 Legacy / चंद्रयान-1 की विरासत
**English:** The mini Moon Impact Probe (MIP) was released from Chandrayaan-1 on November 14, 2008 (Nehru's birthday) and hit the Moon's surface at the South Pole Aitken Basin. Its mass spectrometer detected water molecules just before impact — a historic discovery that changed our understanding of the Moon.
**हिंदी:** मिनी मून इम्पैक्ट प्रोब (MIP) को 14 नवंबर 2008 (नेहरू के जन्मदिन) को चंद्रयान-1 से छोड़ा गया था और यह साउथ पोल ऐटकेन बेसिन में चंद्रमा की सतह से टकराया। इसके मास स्पेक्ट्रोमीटर ने टकराने से ठीक पहले पानी के अणुओं का पता लगाया।

### 3. Why South Pole? / दक्षिणी ध्रुव क्यों?
**English:** The lunar south pole has permanently shadowed craters (PSRs) that never receive sunlight. ISRO/NASA data suggests these craters contain water-ice deposits estimated at 600 million+ metric tonnes. Water-ice can be used for future human habitation (drinking, oxygen generation, rocket fuel via hydrogen electrolysis).
**हिंदी:** चंद्रमा के दक्षिणी ध्रुव में स्थायी रूप से छायांकित क्रेटर हैं जिन्हें कभी सूर्यप्रकाश नहीं मिलता। ISRO/NASA के डेटा से पता चलता है कि इन क्रेटरों में 600 मिलियन+ मीट्रिक टन जल-बर्फ के भंडार हैं।

### 4-13. [Continued sections...]
**English:** Chandrayaan-3's LIBS (Laser-Induced Breakdown Spectroscopy) confirmed the first in-situ detection of sulphur on the lunar surface — which cannot be detected from orbit. This opens new avenues for understanding volcanic activity on the early Moon. India's space budget of $1.5 billion/year is the most cost-efficient major space programme globally.
**हिंदी:** चंद्रयान-3 के LIBS ने चंद्रमा की सतह पर सल्फर का पहला इन-सिटु पता लगाने की पुष्टि की — जिसे कक्षा से नहीं देखा जा सकता। भारत का $1.5 बिलियन/वर्ष का अंतरिक्ष बजट विश्व स्तर पर सबसे अधिक लागत-कुशल प्रमुख अंतरिक्ष कार्यक्रम है।`
  },

  // ══════════════════════════════════════════════════════════
  // SCIENCE — BIOLOGY & HEALTH
  // ══════════════════════════════════════════════════════════
  {
    exam: 'UPSC',
    subject: 'Science & Technology',
    topic: 'Biology & Health',
    subtopic: 'Biotechnology — GMOs & Applications',
    introduction: 'Biotechnology is the application of biological systems, living organisms, or their derivatives to develop products and processes for specific use. Modern biotechnology includes genetic engineering, recombinant DNA technology, tissue culture, and bioinformatics — with applications in agriculture, medicine, and environment.',
    concepts: [
      'Recombinant DNA technology — restriction enzymes + plasmid vectors',
      'GMO (Genetically Modified Organisms) — Bt cotton, Golden Rice',
      'CRISPR-Cas9 — gene editing precision tool',
      'Biopharmaceuticals — insulin, vaccines via genetic engineering',
      'India\'s regulatory framework: GEAC (Genetic Engineering Appraisal Committee)'
    ],
    importantFacts: [
      'Bt cotton is India\'s only commercially approved GM crop (since 2002). It expresses Bacillus thuringiensis toxin, killing bollworm pests.',
      'Bt Brinjal (Baingan) was approved for commercial cultivation in Bangladesh (2013) but remains pending in India due to controversies.',
      'CRISPR-Cas9 was discovered by Jennifer Doudna and Emmanuelle Charpentier (2012 Nobel Prize in Chemistry 2020).',
      'India produces Recombinant Human Insulin since the 1990s — cheaper than animal-derived insulin for diabetics.',
      'Golden Rice contains beta-carotene (Vitamin A precursor) introduced from daffodil and soil bacterium genes.',
      'The Genetic Engineering Appraisal Committee (GEAC) under MoEFCC is the apex regulatory body for GM approvals in India.'
    ],
    examples: [
      'Bt cotton adoption (2002–present) in India increased cotton yield by 24% and reduced pesticide use by 40% in the first decade.',
      'COVID-19 mRNA vaccines (Pfizer-BioNTech, Moderna) represent the fastest-ever vaccine development using genetic technology.'
    ],
    tables: [
      {
        title: 'Key Biotechnology Applications and Examples',
        headers: ['Application Area', 'Technology', 'Example Product', 'Benefit'],
        rows: [
          ['Agriculture', 'Genetic Engineering (Bt gene)', 'Bt Cotton (India)', 'Pest resistance, reduced pesticide use'],
          ['Medicine', 'Recombinant DNA', 'Human Insulin', 'Cheaper, non-allergenic diabetes treatment'],
          ['Medicine', 'mRNA Technology', 'COVID-19 vaccines', 'Rapid vaccine development'],
          ['Gene Editing', 'CRISPR-Cas9', 'Sickle cell cure (2023)', 'Targeted gene therapy'],
          ['Nutrition', 'Transgenic plant', 'Golden Rice', 'Vitamin A deficiency reduction'],
          ['Environment', 'Bioremediation', 'Oil-eating bacteria', 'Petroleum spill cleanup']
        ]
      }
    ],
    revisionNotes: 'Bt cotton: only GM crop approved in India (2002). GEAC = regulatory body under MoEFCC. CRISPR = gene scissors (Doudna + Charpentier, Nobel 2020). Golden Rice = Vitamin A. mRNA vaccines = COVID-19. Bioremediation = using organisms to clean pollution. GM crop concerns: biodiversity, monopoly, food safety.',
    pyqs: [
      {
        question: { en: 'In the context of biotechnology, which of the following statements is correct about Bt crops?', hi: 'जैव प्रौद्योगिकी के संदर्भ में, Bt फसलों के बारे में निम्नलिखित में से कौन सा कथन सही है?' },
        options: [
          { en: 'The "Bt" refers to Biotechnology', hi: '"Bt" जैव प्रौद्योगिकी को संदर्भित करता है' },
          { en: 'Bt toxin is a protein that is harmful to humans', hi: 'Bt टॉक्सिन एक प्रोटीन है जो मनुष्यों के लिए हानिकारक है' },
          { en: 'Bt toxin gene is derived from Bacillus thuringiensis', hi: 'Bt टॉक्सिन जीन बैसिलस थुरिंजिएन्सिस से प्राप्त किया गया है' },
          { en: 'Bt crops are naturally resistant to all insects', hi: 'Bt फसलें स्वाभाविक रूप से सभी कीड़ों के प्रति प्रतिरोधी हैं' }
        ],
        answer: 2,
        explanation: { en: '"Bt" stands for Bacillus thuringiensis — a naturally occurring soil bacterium that produces a protein (Cry protein) toxic to certain insects. The gene for this protein is inserted into the crop plant. The protein is harmless to mammals (including humans) as their gut cannot activate it, unlike insect guts.', hi: '"Bt" बैसिलस थुरिंजिएन्सिस के लिए है — एक प्राकृतिक रूप से पाया जाने वाला मिट्टी का जीवाणु जो कुछ कीड़ों के लिए विषाक्त प्रोटीन (Cry प्रोटीन) उत्पन्न करता है।' },
        year: 2016
      }
    ],
    detailedExplanation: `### 1. Introduction / प्रस्तावना
**English:** Biotechnology sits at the intersection of biology and technology, manipulating living systems to solve human problems. India's National Biotechnology Development Strategy (2021-25) aims to make India a top-5 biotech destination globally.
**हिंदी:** जैव प्रौद्योगिकी जीव विज्ञान और प्रौद्योगिकी के प्रतिच्छेदन पर है, मानव समस्याओं को हल करने के लिए जीवित प्रणालियों में हेरफेर करती है।

### 2. Genetic Engineering Tools / आनुवंशिक इंजीनियरिंग उपकरण
**English:** The key tool is recombinant DNA technology: (1) Restriction enzymes ("molecular scissors") cut DNA at specific sequences; (2) Ligase ("molecular glue") joins DNA fragments; (3) Plasmid/viral vectors carry foreign genes into host cells; (4) Host cells (bacteria, yeast, plant cells) express the foreign gene to produce protein.
**हिंदी:** मुख्य उपकरण पुनः संयोजक DNA प्रौद्योगिकी है: (1) प्रतिबंध एंजाइम ("आणविक कैंची") विशिष्ट अनुक्रमों पर DNA काटते हैं; (2) लिगेज ("आणविक गोंद") DNA टुकड़ों को जोड़ता है; (3) प्लास्मिड/वायरल वेक्टर विदेशी जीन को मेजबान कोशिकाओं में ले जाते हैं।

### 3-13. [Continued sections...]
**English:** India's biotech sector was worth $80 billion in 2023 and is projected to reach $300 billion by 2030. Hyderabad is called "Genome Valley" — the biotech hub of India with 40% of India's biotech companies. Key firms: Biocon (insulin), Serum Institute (vaccines), Bharat Biotech (Covaxin).
**हिंदी:** भारत का जैव प्रौद्योगिकी क्षेत्र 2023 में $80 बिलियन का था और 2030 तक $300 बिलियन तक पहुँचने का अनुमान है। हैदराबाद को "जीनोम वैली" कहा जाता है — भारत का जैव प्रौद्योगिकी केंद्र।`
  },

  // ══════════════════════════════════════════════════════════
  // POLITY — DPSP
  // ══════════════════════════════════════════════════════════
  {
    exam: 'UPSC',
    subject: 'Polity',
    topic: 'Indian Constitution',
    subtopic: 'Directive Principles of State Policy (DPSP)',
    introduction: 'Directive Principles of State Policy (DPSP), enshrined in Part IV (Articles 36–51) of the Indian Constitution, are guidelines to the central and state governments for establishing a just society. They are non-justiciable (not enforceable in courts) but fundamental to governance, complementing Fundamental Rights.',
    concepts: [
      'Non-justiciable nature vs Fundamental Rights (justiciable)',
      'Three categories: Socialistic (Art 38, 39, 41-43A), Gandhian (Art 40, 43, 46-47), Liberal-Intellectual (Art 44-45, 48A, 51)',
      'Conflict between FRs and DPSPs — constitutional evolution',
      'Article 39A — Free legal aid, Article 44 — Uniform Civil Code',
      'Implementation through legislation: MGNREGA, RTE, NFSA'
    ],
    importantFacts: [
      'DPSPs are borrowed from the Irish Constitution (1937), which in turn borrowed from Spain\'s 1931 Constitution.',
      'Dr. Ambedkar called DPSPs "novel features" of the Constitution — a socio-economic Magna Carta.',
      'Granville Austin called FRs + DPSPs the "conscience of the Constitution."',
      'In Minerva Mills Case (1980), SC held that harmony between FRs and DPSPs is part of the Basic Structure.',
      'The 42nd Amendment (1976) gave DPSPs precedence over FRs (under Articles 14 and 19) — reversed by Minerva Mills.',
      'Article 44 (Uniform Civil Code) remains the most politically debated DPSP, yet unimplemented at national level.'
    ],
    examples: [
      'Right to Education Act (2009) was enacted to fulfill Art 45 DPSP (free and compulsory education for children).',
      'MGNREGA (2005) implemented Art 41 (right to work) and Art 43 (living wage) DPSPs.'
    ],
    tables: [
      {
        title: 'Key DPSPs and Their Implementation',
        headers: ['Article', 'DPSP Directive', 'Category', 'Implemented Via'],
        rows: [
          ['Art 38', 'State shall promote welfare of people; reduce inequalities', 'Socialistic', 'Planning Commission / NITI Aayog'],
          ['Art 39', 'Equal pay for equal work; prevent concentration of wealth', 'Socialistic', 'Labour laws, Equal Remuneration Act 1976'],
          ['Art 39A', 'Free legal aid to the poor', 'Liberal', 'Legal Services Authorities Act 1987'],
          ['Art 40', 'Organize village panchayats', 'Gandhian', '73rd Amendment 1992 (Panchayati Raj)'],
          ['Art 44', 'Uniform Civil Code', 'Liberal-Intellectual', 'Not yet implemented at national level'],
          ['Art 45', 'Free and compulsory education', 'Socialistic', 'Right to Education Act 2009 (Art 21A)'],
          ['Art 48A', 'Protect environment and wildlife', 'Liberal', 'Environment Protection Act 1986'],
          ['Art 51', 'Promote international peace', 'Liberal-Intellectual', 'India\'s foreign policy commitments']
        ]
      }
    ],
    revisionNotes: 'DPSP: Part IV, Articles 36-51. Non-justiciable (unlike FRs). Categories: Socialistic (38, 39, 41-43A), Gandhian (40, 43, 46-47), Liberal (44-45, 48A, 51). Source: Irish Constitution. Minerva Mills (1980) = harmony between FRs + DPSPs is basic structure. Famous DPSP: Art 44 (UCC), Art 45 (education — became FR via 86th Amendment + RTE Act).',
    pyqs: [
      {
        question: { en: 'Which of the following is a Directive Principle of State Policy in the Indian Constitution that is NOT yet implemented as a law?', hi: 'निम्नलिखित में से कौन सा भारतीय संविधान में राज्य के नीति निर्देशक तत्व है जिसे अभी तक कानून के रूप में लागू नहीं किया गया है?' },
        options: [
          { en: 'Free Legal Aid (Article 39A)', hi: 'निःशुल्क कानूनी सहायता (अनुच्छेद 39A)' },
          { en: 'Panchayati Raj (Article 40)', hi: 'पंचायती राज (अनुच्छेद 40)' },
          { en: 'Uniform Civil Code (Article 44)', hi: 'समान नागरिक संहिता (अनुच्छेद 44)' },
          { en: 'Equal Pay for Equal Work (Article 39)', hi: 'समान कार्य के लिए समान वेतन (अनुच्छेद 39)' }
        ],
        answer: 2,
        explanation: { en: 'Article 44 directs the state to "endeavour to secure for the citizens a Uniform Civil Code throughout the territory of India." It remains the most contested DPSP — unimplemented nationally due to religious and political sensitivities. Goa has a UCC (inherited from Portuguese rule) as the only state-level implementation.', hi: 'अनुच्छेद 44 राज्य को "भारत के समस्त राज्यक्षेत्र में नागरिकों के लिए एक समान नागरिक संहिता प्राप्त कराने का प्रयास करने" का निर्देश देता है। धार्मिक और राजनीतिक संवेदनशीलताओं के कारण यह राष्ट्रीय स्तर पर अभी भी अनुपयोगी है।' },
        year: 2022
      }
    ],
    detailedExplanation: `### 1. Introduction / प्रस्तावना
**English:** DPSPs define the positive obligations of the state — what the government SHOULD do (as opposed to Fundamental Rights which define what the government CANNOT do). Together, they create a comprehensive constitutional framework for governance.
**हिंदी:** DPSP राज्य के सकारात्मक दायित्वों को परिभाषित करते हैं — सरकार को क्या करना चाहिए (मौलिक अधिकारों के विपरीत जो परिभाषित करते हैं कि सरकार क्या नहीं कर सकती)।

### 2. FRs vs DPSPs Conflict / FRs बनाम DPSPs संघर्ष
**English:** The tension between Fundamental Rights (justiciable) and DPSPs (non-justiciable) has shaped Indian constitutional jurisprudence: (a) Champakam Dorairajan (1951) — FRs prevail over DPSPs; (b) Golak Nath (1967) — Parliament cannot amend FRs; (c) Kesavananda Bharati (1973) — Parliament can amend FRs but not Basic Structure; (d) Minerva Mills (1980) — FRs and DPSPs must be harmonious.
**हिंदी:** मौलिक अधिकारों (वादयोग्य) और DPSP (गैर-वादयोग्य) के बीच तनाव ने भारतीय संवैधानिक न्यायशास्त्र को आकार दिया है।

### 3-13. [Continued sections...]
**English:** DPSPs represent the "positive" vision of democracy — ensuring not just freedom from oppression but access to dignified life. India's welfare state legislation (MGNREGA, RTE, NFSA) demonstrates that DPSPs, despite being non-justiciable, have significant transformative impact when implemented.
**हिंदी:** DPSP लोकतंत्र की "सकारात्मक" दृष्टि का प्रतिनिधित्व करते हैं — केवल उत्पीड़न से स्वतंत्रता नहीं बल्कि सम्मानजनक जीवन तक पहुँच सुनिश्चित करना।`
  }

];

// ─── SEED FUNCTION ────────────────────────────────────────────────────────────
async function seed() {
  try {
    console.log(`\n🔌 Connecting to MongoDB: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected.\n');

    let upserted = 0;
    let failed = 0;

    for (const data of contentData) {
      try {
        const updated = await LearningContent.findOneAndUpdate(
          { subtopic: data.subtopic },
          { $set: data },
          { new: true, upsert: true, runValidators: true }
        );
        console.log(`✅ Upserted: [${updated.exam}] ${updated.subject} → "${updated.subtopic}"`);
        upserted++;
      } catch (err) {
        console.error(`❌ Failed: "${data.subtopic}" — ${err.message}`);
        failed++;
      }
    }

    console.log(`\n════════════════════════════════════`);
    console.log(`📚 SEED COMPLETE`);
    console.log(`   ✅ Upserted : ${upserted}`);
    console.log(`   ❌ Failed   : ${failed}`);
    console.log(`   📖 Total    : ${contentData.length}`);
    console.log(`════════════════════════════════════\n`);

  } catch (error) {
    console.error('❌ Fatal seeding error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

seed();
