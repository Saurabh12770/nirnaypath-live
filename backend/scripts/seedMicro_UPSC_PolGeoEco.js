import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
import LearningContent from '../models/LearningContent.js';

// ═══════════════════════════════════════════════════════════════════
// UPSC POLITY — DEEP MICRO CONCEPTS
// ═══════════════════════════════════════════════════════════════════
const polityMicro = [
  {
    exam: 'UPSC', subject: 'Polity', topic: 'Indian Constitution',
    subtopic: 'Making of the Constitution — Constituent Assembly Debates',
    introduction: 'The Constituent Assembly of India, formed under the Cabinet Mission Plan (1946), took 2 years, 11 months, and 18 days to draft the world\'s longest written constitution. Understanding the key debates — on federalism, fundamental rights, language, and minority protections — is essential for UPSC.',
    detailedExplanation: `## The Constituent Assembly\n\n### 1. Formation & Composition\n- Formed under the **Cabinet Mission Plan (1946)**. Total members: **389** (reduced to 299 after Partition).\n- Elected by **provincial legislatures** through indirect election. NOT by universal adult franchise.\n- **Dr. Rajendra Prasad**: Permanent Chairman (elected Dec 11, 1946).\n- **Dr. B.R. Ambedkar**: Chairman of the **Drafting Committee** (7 members).\n- **B.N. Rau**: Constitutional Advisor (not a member but prepared the initial draft).\n\n### 2. Key Committees\n- **Drafting Committee** (Ambedkar): Prepared the actual draft.\n- **Union Powers Committee** (Jawaharlal Nehru): Division of powers.\n- **Fundamental Rights Committee** (Sardar Patel): Defined fundamental rights.\n- **Minorities Committee** (H.C. Mukherjee): Minority safeguards.\n- **Provincial Constitution Committee** (Sardar Patel).\n\n### 3. Key Debates\n- **Preamble**: "We, the People of India" — debated whether India should be a republic or retain ties to the British Crown.\n- **Fundamental Rights vs DPSP**: Ambedkar argued for justiciable rights; others wanted social welfare principles to be binding too.\n- **Official Language**: Intense debate between Hindi and English. **Munshi-Ayyangar Formula** — Hindi in Devanagari as official language; English to continue for 15 years.\n- **Uniform Civil Code**: Debated but placed in DPSP (Article 44) — not made justiciable.\n\n### 4. Timeline\n- First session: **December 9, 1946**. Temporary chairman: **Sachchidananda Sinha**.\n- Objectives Resolution by Nehru: **December 13, 1946**.\n- Constitution adopted: **November 26, 1949** (now **Constitution Day**).\n- Came into force: **January 26, 1950** (Republic Day — chosen to honor the 1930 Purna Swaraj declaration).`,
    concepts: ['Cabinet Mission Plan', 'Drafting Committee', 'Objectives Resolution', 'Borrowed Features'],
    importantFacts: [
      'The Constituent Assembly had 389 members initially, reduced to 299 after Partition.',
      'Dr. B.R. Ambedkar was Chairman of the 7-member Drafting Committee.',
      'B.N. Rau was the Constitutional Advisor who prepared the initial draft — he was not an elected member.',
      'The Constituent Assembly took 2 years, 11 months, and 18 days to complete the Constitution.',
      'Constitution adopted on November 26, 1949 (Constitution Day); came into force on January 26, 1950 (Republic Day).',
      'The Objectives Resolution moved by Nehru on December 13, 1946 became the basis of the Preamble.',
      'Sachchidananda Sinha was the first temporary chairman of the Constituent Assembly.'
    ],
    examples: [
      'Ambedkar, while presenting the Draft Constitution, said: "However good a Constitution may be, it is sure to turn out bad because those who are called to work it happen to be a bad lot."',
      'The choice of January 26 as Republic Day honors the original Independence Day declared by Congress on January 26, 1930 (Purna Swaraj Day).'
    ],
    tables: [{
      title: 'Key Committees of the Constituent Assembly',
      headers: ['Committee', 'Chairman', 'Function'],
      rows: [
        ['Drafting Committee', 'Dr. B.R. Ambedkar', 'Drafted the Constitution'],
        ['Union Powers Committee', 'Jawaharlal Nehru', 'Division of powers between Centre & States'],
        ['Fundamental Rights Committee', 'Sardar Patel', 'Defined Fundamental Rights'],
        ['Minorities Committee', 'H.C. Mukherjee', 'Safeguards for minorities'],
        ['Rules of Procedure Committee', 'Dr. Rajendra Prasad', 'Procedural rules for Assembly']
      ]
    }],
    revisionNotes: '* Cabinet Mission Plan (1946) → Constituent Assembly.\n* 389 members → 299 after Partition.\n* Ambedkar = Drafting Committee Chairman.\n* B.N. Rau = Constitutional Advisor (not member).\n* Objectives Resolution = Nehru, Dec 13, 1946.\n* Adopted: Nov 26, 1949. Enforced: Jan 26, 1950.\n* Sachchidananda Sinha = first temp chairman.',
    pyqs: [{
      question: { en: 'Who was the Constitutional Advisor to the Constituent Assembly?', hi: 'संविधान सभा के संवैधानिक सलाहकार कौन थे?' },
      options: [
        { en: 'B.N. Rau', hi: 'बी.एन. राव' },
        { en: 'Dr. B.R. Ambedkar', hi: 'डॉ. बी.आर. अंबेडकर' },
        { en: 'K.M. Munshi', hi: 'के.एम. मुंशी' },
        { en: 'Alladi Krishnaswami Ayyar', hi: 'अल्लादी कृष्णस्वामी अय्यर' }
      ],
      answer: 0,
      explanation: { en: 'B.N. Rau (Benegal Narsing Rau) served as the Constitutional Advisor who prepared the initial draft of the Constitution. He was not an elected member of the Assembly but played a crucial advisory role.', hi: 'बी.एन. राव (बेनेगल नरसिंग राव) ने संवैधानिक सलाहकार के रूप में कार्य किया जिन्होंने संविधान का प्रारंभिक मसौदा तैयार किया। वे सभा के निर्वाचित सदस्य नहीं थे लेकिन उन्होंने एक महत्वपूर्ण सलाहकार भूमिका निभाई।' },
      year: 2021
    }]
  },
  {
    exam: 'UPSC', subject: 'Polity', topic: 'Indian Constitution',
    subtopic: 'Preamble — Philosophy & Key Amendments',
    introduction: 'The Preamble to the Indian Constitution declares India as a Sovereign, Socialist, Secular, Democratic Republic and pledges justice, liberty, equality, and fraternity to all citizens. It is the philosophical foundation of the Constitution and reflects the Objectives Resolution moved by Nehru.',
    detailedExplanation: `## The Preamble\n\n### 1. Full Text (Post-42nd Amendment)\n"WE, THE PEOPLE OF INDIA, having solemnly resolved to constitute India into a SOVEREIGN SOCIALIST SECULAR DEMOCRATIC REPUBLIC and to secure to all its citizens:\nJUSTICE, social, economic and political;\nLIBERTY of thought, expression, belief, faith and worship;\nEQUALITY of status and of opportunity;\nand to promote among them all FRATERNITY assuring the dignity of the individual and the unity and integrity of the Nation;\nIN OUR CONSTITUENT ASSEMBLY this twenty-sixth day of November, 1949, do HEREBY ADOPT, ENACT AND GIVE TO OURSELVES THIS CONSTITUTION."\n\n### 2. Key Terms Explained\n- **Sovereign**: India is internally and externally supreme — no external authority above.\n- **Socialist** (added by 42nd Amendment, 1976): Democratic socialism — mixed economy, not state socialism. India follows a middle path.\n- **Secular** (added by 42nd Amendment, 1976): State treats all religions equally — no state religion. Different from Western secularism (complete separation).\n- **Democratic**: Rule of the people through elected representatives.\n- **Republic**: Head of state (President) is elected, not hereditary.\n\n### 3. Legal Status\n- **Berubari Union Case (1960)**: SC said the Preamble is NOT part of the Constitution.\n- **Kesavananda Bharati Case (1973)**: SC overruled Berubari. The Preamble IS part of the Constitution and reflects the "basic structure."\n- The Preamble **cannot be used to override the explicit provisions** of the Constitution, but it can be used to interpret ambiguous provisions.\n- The Preamble can be **amended** under Article 368 (as was done by the 42nd Amendment), but the "basic structure" elements of the Preamble cannot be destroyed.`,
    concepts: ['Sovereign Republic', 'Secularism (Indian Model)', 'Basic Structure Doctrine', 'Kesavananda Bharati'],
    importantFacts: [
      '"Socialist" and "Secular" were added to the Preamble by the 42nd Amendment Act, 1976.',
      'The Berubari Union Case (1960) held the Preamble was NOT part of the Constitution.',
      'The Kesavananda Bharati Case (1973) overruled Berubari and declared the Preamble IS part of the Constitution.',
      'Indian secularism means "equal respect for all religions" — different from Western "separation of Church and State."',
      'The Preamble begins with "We, the People of India" — indicating popular sovereignty.',
      'The date in the Preamble is November 26, 1949 — the day the Constitution was adopted.'
    ],
    examples: [
      'The 42nd Amendment (1976) during the Emergency changed "sovereign democratic republic" to "sovereign SOCIALIST SECULAR democratic republic" — Indira Gandhi\'s government added these words.',
      'In S.R. Bommai vs Union of India (1994), the Supreme Court held that secularism is a basic feature of the Constitution and cannot be amended.'
    ],
    tables: [{
      title: 'Sources of Key Preamble Concepts',
      headers: ['Concept', 'Inspired By', 'Constitutional Provision'],
      rows: [
        ['Sovereign', 'Independence movement', 'Articles 1, 51A'],
        ['Socialist', '42nd Amendment (1976)', 'DPSP Articles 38, 39'],
        ['Secular', '42nd Amendment (1976)', 'Articles 25–28'],
        ['Democratic', 'British parliamentary model', 'Articles 326, 79–122'],
        ['Republic', 'French Republic model', 'Article 52–62 (President)'],
        ['Justice', 'Russian Revolution', 'FRs + DPSP combined']
      ]
    }],
    revisionNotes: '* Original Preamble = Sovereign Democratic Republic.\n* 42nd Amendment (1976) added "Socialist" and "Secular".\n* Berubari (1960) = Preamble NOT part of Constitution.\n* Kesavananda (1973) = Preamble IS part of Constitution.\n* Indian secularism = equal respect, not separation.\n* Preamble can be amended (Art 368) but basic structure preserved.',
    pyqs: [{
      question: { en: 'The words "Socialist" and "Secular" were added to the Preamble by:', hi: '"समाजवादी" और "धर्मनिरपेक्ष" शब्द प्रस्तावना में किसके द्वारा जोड़े गए?' },
      options: [
        { en: '42nd Amendment Act, 1976', hi: '42वां संशोधन अधिनियम, 1976' },
        { en: '44th Amendment Act, 1978', hi: '44वां संशोधन अधिनियम, 1978' },
        { en: '1st Amendment Act, 1951', hi: 'पहला संशोधन अधिनियम, 1951' },
        { en: '73rd Amendment Act, 1992', hi: '73वां संशोधन अधिनियम, 1992' }
      ],
      answer: 0,
      explanation: { en: 'The 42nd Constitutional Amendment Act, 1976 (during the Emergency under Indira Gandhi) added the words "Socialist" and "Secular" to the Preamble, changing it from "Sovereign Democratic Republic" to "Sovereign Socialist Secular Democratic Republic."', hi: '42वां संवैधानिक संशोधन अधिनियम, 1976 (इंदिरा गांधी के तहत आपातकाल के दौरान) ने प्रस्तावना में "समाजवादी" और "धर्मनिरपेक्ष" शब्द जोड़े, इसे "संप्रभु लोकतांत्रिक गणराज्य" से "संप्रभु समाजवादी धर्मनिरपेक्ष लोकतांत्रिक गणराज्य" में बदल दिया।' },
      year: 2018
    }]
  },
  {
    exam: 'UPSC', subject: 'Polity', topic: 'Indian Constitution',
    subtopic: 'Fundamental Rights — Articles 14 to 32 (Complete Guide)',
    introduction: 'Fundamental Rights (Part III, Articles 12–35) are justiciable rights guaranteed by the Constitution that protect individuals against state action. They are modeled on the American Bill of Rights and can be enforced through the Supreme Court (Article 32) and High Courts (Article 226).',
    detailedExplanation: `## Fundamental Rights — Detailed Analysis\n\n### 1. Right to Equality (Articles 14–18)\n- **Article 14**: Equality before law + Equal protection of laws. Based on British "Rule of Law" (Dicey) and American 14th Amendment.\n- **Article 15**: Prohibition of discrimination on grounds of religion, race, caste, sex, place of birth. Article 15(3)-(5) allow special provisions for women, children, SEBCs, SCs/STs.\n- **Article 16**: Equal opportunity in public employment. Reservations permitted under 16(4), 16(4A) (promotions for SCs/STs), 16(4B) (carry forward).\n- **Article 17**: Abolition of Untouchability. Untouchability is an offense under the Protection of Civil Rights Act, 1955.\n- **Article 18**: Abolition of titles (except military/academic). Indians cannot accept foreign titles without President\'s consent.\n\n### 2. Right to Freedom (Articles 19–22)\n- **Article 19**: 6 freedoms — (a) Speech & expression, (b) Assembly, (c) Association, (d) Movement, (e) Residence, (f) Profession. Originally 7 — Article 19(1)(f) Right to Property was removed by the 44th Amendment, 1978.\n- **Article 20**: Protection against conviction — no ex post facto law, no double jeopardy, no self-incrimination. CANNOT be suspended even during Emergency.\n- **Article 21**: Right to Life & Personal Liberty — "No person shall be deprived of his life or personal liberty except according to procedure established by law." The most expansive Article — SC has read into it: right to livelihood, privacy, education, clean environment, shelter, speedy trial, dignity.\n- **Article 21A** (86th Amendment, 2002): Right to Education — free and compulsory for children aged 6–14.\n- **Article 22**: Protection against arrest & detention — right to be informed of grounds, right to consult a lawyer, production before magistrate within 24 hours.\n\n### 3. Right to Constitutional Remedies (Article 32)\n- **Article 32**: Right to move the Supreme Court for enforcement of FRs.\n- Ambedkar called it the **"Heart and Soul of the Constitution."**\n- 5 types of writs: **Habeas Corpus** (produce the body), **Mandamus** (command to perform duty), **Prohibition** (stop lower court), **Certiorari** (quash lower court order), **Quo Warranto** (by what authority?).`,
    concepts: ['Justiciable Rights', 'Rule of Law', 'Article 21 Expansion', 'Writ Jurisdiction'],
    importantFacts: [
      'Article 32 was called the "Heart and Soul of the Constitution" by Dr. B.R. Ambedkar.',
      'Articles 20 and 21 cannot be suspended even during a National Emergency (Article 359).',
      'Right to Property was removed from Fundamental Rights by the 44th Amendment (1978) — now a legal right under Article 300A.',
      'Article 21 has been expanded to include right to privacy (Puttaswamy case, 2017), right to livelihood, dignity, and clean environment.',
      'Article 21A (Right to Education) was added by the 86th Amendment (2002) for children aged 6-14.',
      'Five writs: Habeas Corpus, Mandamus, Prohibition, Certiorari, Quo Warranto.'
    ],
    examples: [
      'In Maneka Gandhi vs Union of India (1978), SC held that Article 21 requires not just "procedure established by law" but "due process of law" — the procedure must be just, fair, and reasonable.',
      'In Vishaka vs State of Rajasthan (1997), SC read sexual harassment guidelines into Article 21 (right to work with dignity) — later codified as the POSH Act, 2013.'
    ],
    tables: [{
      title: 'Five Writs Under Article 32/226',
      headers: ['Writ', 'Meaning', 'Issued Against', 'Purpose'],
      rows: [
        ['Habeas Corpus', 'Produce the body', 'Any authority (public/private)', 'Release unlawfully detained person'],
        ['Mandamus', 'We command', 'Public authority/officer', 'Compel performance of public duty'],
        ['Prohibition', 'To forbid', 'Lower court/tribunal', 'Stop exceeding jurisdiction'],
        ['Certiorari', 'To be certified', 'Lower court/tribunal', 'Quash an order already passed'],
        ['Quo Warranto', 'By what authority?', 'Person holding public office', 'Challenge legality of office-holding']
      ]
    }],
    revisionNotes: '* Art 14 = Equality before law + Equal protection.\n* Art 17 = Abolition of untouchability.\n* Art 19 = 6 freedoms (originally 7; property removed by 44th Amendment).\n* Art 20-21 = Cannot be suspended during Emergency.\n* Art 21 = Life & liberty; expanded: privacy, livelihood, dignity.\n* Art 21A = RTE, 6-14 years (86th Amendment, 2002).\n* Art 32 = "Heart and Soul" (Ambedkar). 5 writs.\n* Maneka Gandhi case = due process of law.',
    pyqs: [{
      question: { en: 'Which Article of the Indian Constitution was described by Dr. Ambedkar as the "Heart and Soul of the Constitution"?', hi: 'भारतीय संविधान के किस अनुच्छेद को डॉ. अंबेडकर ने "संविधान की आत्मा" कहा था?' },
      options: [
        { en: 'Article 32', hi: 'अनुच्छेद 32' },
        { en: 'Article 14', hi: 'अनुच्छेद 14' },
        { en: 'Article 19', hi: 'अनुच्छेद 19' },
        { en: 'Article 21', hi: 'अनुच्छेद 21' }
      ],
      answer: 0,
      explanation: { en: 'Dr. B.R. Ambedkar called Article 32 (Right to Constitutional Remedies) the "Heart and Soul of the Constitution" because it provides the mechanism to enforce all other Fundamental Rights through the Supreme Court.', hi: 'डॉ. बी.आर. अंबेडकर ने अनुच्छेद 32 (संवैधानिक उपचारों का अधिकार) को "संविधान की आत्मा" कहा क्योंकि यह सर्वोच्च न्यायालय के माध्यम से अन्य सभी मौलिक अधिकारों को लागू करने का तंत्र प्रदान करता है।' },
      year: 2022
    }]
  },
  {
    exam: 'UPSC', subject: 'Polity', topic: 'Parliament & Legislature',
    subtopic: 'Parliament — Lok Sabha & Rajya Sabha (Complete Structure)',
    introduction: 'The Indian Parliament is the supreme legislative body, consisting of the President and two Houses — Lok Sabha (House of the People) and Rajya Sabha (Council of States). Together, they represent the sovereignty of the people and the federal nature of the Indian Union.',
    detailedExplanation: `## Structure of Parliament\n\n### 1. Lok Sabha (Lower House)\n- **Maximum strength**: 552 (530 from states, 20 from UTs, 2 nominated Anglo-Indians — removed by 104th Amendment, 2020).\n- **Current strength**: 543 elected members.\n- **Term**: 5 years. Can be dissolved earlier by the President.\n- **Speaker**: Presiding officer. Elected from among members. Votes only in case of a tie (casting vote).\n- **Quorum**: 1/10th of total membership.\n- **Money Bills**: Can only be introduced in Lok Sabha (Article 109). Rajya Sabha can only recommend changes within 14 days.\n\n### 2. Rajya Sabha (Upper House)\n- **Maximum strength**: 250 (238 elected by state legislatures + 12 nominated by President for expertise in literature, science, art, social service).\n- **Permanent body**: Cannot be dissolved. Members serve 6-year terms; 1/3rd retire every 2 years.\n- **Chairman**: Vice President of India (ex-officio). Does NOT vote in first instance; has casting vote.\n- **Special Powers**: Can pass a resolution under **Article 249** to allow Parliament to legislate on State List subjects in national interest (requires 2/3 majority). Can create **All-India Services** under Article 312.\n\n### 3. Joint Session (Article 108)\n- Called by the President when there is a deadlock between the two Houses on an ordinary bill.\n- Presided by the **Speaker of Lok Sabha**.\n- Only 3 Joint Sessions held so far: Dowry Prohibition Bill (1961), Banking Service Commission Bill (1978), POTA (2002).\n- Joint Session CANNOT be called for Money Bills or Constitutional Amendment Bills.`,
    concepts: ['Bicameralism', 'Money Bill Procedure', 'Joint Session', 'Parliamentary Sovereignty'],
    importantFacts: [
      'Lok Sabha has a maximum strength of 552 (530 states + 20 UTs + 2 nominated — Anglo-Indian provision removed by 104th Amendment).',
      'Rajya Sabha is a permanent body — it cannot be dissolved. 1/3rd of members retire every 2 years.',
      'Money Bills can only be introduced in Lok Sabha; Rajya Sabha must return them within 14 days.',
      'Only 3 Joint Sessions of Parliament have been held so far: 1961, 1978, and 2002.',
      'Article 249 allows Rajya Sabha to authorize Parliament to legislate on State List subjects (2/3 majority needed).',
      'Article 312 allows Rajya Sabha to create new All-India Services.'
    ],
    examples: [
      'The POTA (Prevention of Terrorism Act) 2002 was passed in a Joint Session because Rajya Sabha rejected it while Lok Sabha passed it.',
      'The Speaker of Lok Sabha does not vote ordinarily — Om Birla, the current Speaker, would only vote in case of a tie.'
    ],
    tables: [{
      title: 'Lok Sabha vs Rajya Sabha — Comparison',
      headers: ['Feature', 'Lok Sabha', 'Rajya Sabha'],
      rows: [
        ['Max Strength', '552 (now 543 elected)', '250 (238 elected + 12 nominated)'],
        ['Term', '5 years (dissolvable)', '6 years (permanent, 1/3 retire every 2 years)'],
        ['Presiding Officer', 'Speaker', 'Vice President (Chairman)'],
        ['Money Bills', 'Can introduce and pass', 'Can only recommend (14 days)'],
        ['No-Confidence Motion', 'Can pass (against government)', 'Cannot pass'],
        ['Special Power', 'Budget approval', 'Art 249 (State List), Art 312 (All-India Services)']
      ]
    }],
    revisionNotes: '* LS max = 552 (543 currently). RS max = 250.\n* LS = 5 years. RS = permanent, 6-year terms.\n* Money Bill = LS only. RS has 14 days.\n* Joint Session = Speaker presides. Only 3 so far.\n* Art 249 = RS can authorize Parliament on State List (2/3).\n* Art 312 = RS can create All-India Services.\n* 104th Amendment (2020) = removed Anglo-Indian nomination.',
    pyqs: [{
      question: { en: 'How many times has a Joint Session of Parliament been convened in India so far?', hi: 'भारत में अब तक संसद का संयुक्त सत्र कितनी बार बुलाया गया है?' },
      options: [
        { en: 'Three times', hi: 'तीन बार' },
        { en: 'Five times', hi: 'पांच बार' },
        { en: 'Once', hi: 'एक बार' },
        { en: 'Never', hi: 'कभी नहीं' }
      ],
      answer: 0,
      explanation: { en: 'Joint Sessions have been convened three times: for the Dowry Prohibition Bill (1961), Banking Service Commission Repeal Bill (1978), and POTA (2002).', hi: 'संयुक्त सत्र तीन बार बुलाए गए हैं: दहेज निषेध विधेयक (1961), बैंकिंग सेवा आयोग निरसन विधेयक (1978), और पोटा (2002) के लिए।' },
      year: 2020
    }]
  },
  {
    exam: 'UPSC', subject: 'Polity', topic: 'Executive & Judiciary',
    subtopic: 'Supreme Court — Composition, Jurisdiction & Landmark Cases',
    introduction: 'The Supreme Court of India, established under Articles 124–147 of the Constitution, is the highest court of appeal, the protector of Fundamental Rights, and the guardian of the Constitution. Its power of judicial review and the "basic structure" doctrine make it one of the most powerful apex courts in the world.',
    detailedExplanation: `## Supreme Court of India\n\n### 1. Composition\n- Currently **34 judges** (Chief Justice + 33 other judges). Originally 8 (CJI + 7). Strength increased by Parliament.\n- **Appointment**: By the President on the recommendation of the **Collegium** (CJI + 4 senior-most judges) — established by the Second (1993) and Third (1998) Judges Cases.\n- **NJAC** (National Judicial Appointments Commission, 99th Amendment) was struck down as unconstitutional in **2015** — SC held it violated judicial independence.\n- **Qualification**: Must be a citizen of India + either a High Court judge for 5 years, or an advocate of HC for 10 years, or a distinguished jurist.\n- **Retirement age**: 65 years.\n\n### 2. Jurisdiction\n- **Original Jurisdiction (Art 131)**: Disputes between Centre and States, or between States. NOT available for ordinary citizens.\n- **Writ Jurisdiction (Art 32)**: Enforce Fundamental Rights through 5 writs.\n- **Appellate Jurisdiction**: Appeals from High Courts in constitutional, civil, and criminal matters.\n- **Advisory Jurisdiction (Art 143)**: President can seek SC\'s opinion on questions of law or fact. Opinion is NOT binding on the President.\n- **Court of Record (Art 129)**: Records are evidence; can punish for contempt.\n\n### 3. Landmark Doctrines\n- **Basic Structure Doctrine (Kesavananda Bharati, 1973)**: Parliament can amend any part of the Constitution but CANNOT destroy its basic structure (federalism, secularism, democracy, judicial review, rule of law).\n- **Due Process of Law (Maneka Gandhi, 1978)**: Article 21 requires procedure to be just, fair, and reasonable.\n- **Right to Privacy (K.S. Puttaswamy, 2017)**: Privacy is a fundamental right under Article 21.\n- **Collegium System**: Second Judges Case (1993) — CJI has primacy in judicial appointments. Third Judges Case (1998) — Collegium = CJI + 4 senior judges.`,
    concepts: ['Judicial Review', 'Basic Structure Doctrine', 'Collegium System', 'PIL Jurisprudence'],
    importantFacts: [
      'The Supreme Court currently has 34 judges (CJI + 33). Originally it had 8.',
      'The Collegium system (CJI + 4 senior judges) recommends judicial appointments — established by the Second Judges Case (1993).',
      'NJAC (99th Amendment) was struck down in 2015 as it violated judicial independence.',
      'The Basic Structure Doctrine was established in Kesavananda Bharati vs State of Kerala (1973).',
      'Article 143 provides for Advisory Jurisdiction — SC\'s opinion is NOT binding on the President.',
      'SC retirement age is 65; HC retirement age is 62.',
      'The first CJI was Justice H.J. Kania (1950).'
    ],
    examples: [
      'In Golak Nath vs State of Punjab (1967), SC held that Parliament cannot amend Fundamental Rights — this was later overruled by the 24th Amendment and Kesavananda Bharati case.',
      'PIL (Public Interest Litigation) was introduced by Justice P.N. Bhagwati and Justice V.R. Krishna Iyer in the 1980s — allowing any person to approach the court on behalf of those who cannot.'
    ],
    tables: [{
      title: 'Supreme Court — Types of Jurisdiction',
      headers: ['Type', 'Article', 'Nature', 'Key Feature'],
      rows: [
        ['Original', 'Art 131', 'Centre-State, State-State disputes', 'Not for individual citizens'],
        ['Writ', 'Art 32', 'Enforcement of Fundamental Rights', '5 writs; "Heart and Soul"'],
        ['Appellate', 'Art 132–136', 'Appeals from High Courts', 'Constitutional, civil, criminal'],
        ['Advisory', 'Art 143', 'Presidential reference', 'Opinion NOT binding'],
        ['Review', 'Art 137', 'Review own judgments', 'Limited grounds']
      ]
    }],
    revisionNotes: '* SC = 34 judges. CJI + 33. Retirement at 65.\n* Collegium = CJI + 4 seniors (2nd Judges Case, 1993).\n* NJAC (99th Amendment) struck down 2015.\n* Basic Structure = Kesavananda (1973).\n* Art 131 = Original (Centre-State). Art 32 = Writs. Art 143 = Advisory.\n* First CJI = H.J. Kania.\n* PIL introduced by Bhagwati & Krishna Iyer.',
    pyqs: [{
      question: { en: 'The National Judicial Appointments Commission (NJAC) was struck down by the Supreme Court because:', hi: 'राष्ट्रीय न्यायिक नियुक्ति आयोग (NJAC) को सर्वोच्च न्यायालय ने किस कारण रद्द किया?' },
      options: [
        { en: 'It violated the independence of the judiciary', hi: 'यह न्यायपालिका की स्वतंत्रता का उल्लंघन करता था' },
        { en: 'It was not passed by the required majority', hi: 'यह आवश्यक बहुमत से पारित नहीं हुआ था' },
        { en: 'It violated Article 14', hi: 'यह अनुच्छेद 14 का उल्लंघन करता था' },
        { en: 'It was a Money Bill', hi: 'यह एक धन विधेयक था' }
      ],
      answer: 0,
      explanation: { en: 'The Supreme Court struck down the NJAC (99th Amendment) in 2015 holding that it violated the basic structure of the Constitution by compromising the independence of the judiciary, as it gave non-judicial members a role in judicial appointments.', hi: 'सर्वोच्च न्यायालय ने 2015 में NJAC (99वां संशोधन) को यह कहते हुए रद्द कर दिया कि यह गैर-न्यायिक सदस्यों को न्यायिक नियुक्तियों में भूमिका देकर न्यायपालिका की स्वतंत्रता से समझौता करके संविधान की मूल संरचना का उल्लंघन करता था।' },
      year: 2019
    }]
  }
];

// ═══════════════════════════════════════════════════════════════════
// UPSC GEOGRAPHY — DEEP MICRO CONCEPTS
// ═══════════════════════════════════════════════════════════════════
const geographyMicro = [
  {
    exam: 'UPSC', subject: 'Geography', topic: 'Indian Geography',
    subtopic: 'Physiographic Divisions of India — Complete Overview',
    introduction: 'India\'s physiography is classified into five major divisions: The Northern Mountains (Himalayas), The Northern Plains, The Peninsular Plateau, The Coastal Plains, and The Islands. Each division has distinct geological origins, terrain characteristics, and economic significance.',
    detailedExplanation: `## Five Major Physiographic Divisions\n\n### 1. The Northern Mountains (Himalayas)\n- Formed by the collision of the **Indo-Australian Plate** and the **Eurasian Plate** (convergent boundary).\n- Three parallel ranges: **Greater Himalayas (Himadri)** — average height 6,000m (Everest, K2, Kanchenjunga); **Lesser Himalayas (Himachal)** — 1,000–4,500m (Pir Panjal, Dhaula Dhar, Mahabharat); **Outer Himalayas (Shiwaliks)** — 600–1,500m (youngest; composed of unconsolidated sediments).\n- **Duns**: Flat-bottomed valleys between Shiwaliks and Lesser Himalayas (e.g., Dehradun, Patlidun).\n- Key passes: Karakoram Pass (highest motorable road), Rohtang La, Banihal Pass, Zoji La, Nathula, Lipulekh.\n\n### 2. The Northern Plains\n- Formed by **alluvial deposits** of the Indus, Ganga, and Brahmaputra river systems.\n- Sub-divisions: **Bhabar** (pebble zone at foothills, rivers disappear underground), **Terai** (marshy, swampy — rivers re-emerge), **Bhangar** (older alluvium, contains kankar nodules), **Khadar** (newer alluvium, fertile floodplains — renewed annually).\n- Length: ~2,400 km; width: 150–300 km.\n- Extremely flat — gradient of 1m per 5.6 km.\n\n### 3. The Peninsular Plateau\n- One of the **oldest landmasses** — part of the ancient Gondwanaland.\n- Two sub-divisions: **Central Highlands** (north of Narmada — includes Malwa Plateau, Bundelkhand, Chota Nagpur) and **Deccan Plateau** (south of Narmada — triangular, tilts eastward).\n- **Western Ghats**: Average 900–1,600m. Higher than Eastern Ghats. Continuous except at **Palghat Gap** (between Nilgiris and Anamalai).\n- **Eastern Ghats**: Discontinuous. Lower. Cut by rivers like Godavari, Krishna, Kaveri.\n\n### 4. Coastal Plains\n- **Western Coast**: Narrow. Sub-divided into Konkan (Mumbai–Goa), Kanara (Goa–Mangalore), Malabar (Mangalore–Kanyakumari).\n- **Eastern Coast**: Wider. Sub-divided into Coromandel (TN), Northern Circars (AP), and Utkal (Odisha).\n- **Chilika Lake** (Odisha): Largest brackish water lagoon in Asia.\n\n### 5. Islands\n- **Andaman & Nicobar**: 572 islands. Part of a submerged mountain chain. **Barren Island** — only active volcano in India.\n- **Lakshadweep**: 36 coral islands. Part of Reunion Hotspot chain.`,
    concepts: ['Plate Tectonics & Himalayas', 'Alluvial Plains Formation', 'Gondwanaland Heritage', 'Coastal Geomorphology'],
    importantFacts: [
      'The Himalayas were formed by the collision of Indo-Australian and Eurasian plates — still rising at ~5mm per year.',
      'Bhabar (pebble zone) → Terai (marshy) → Bhangar (old alluvium) → Khadar (new alluvium, most fertile).',
      'Western Ghats are continuous except at Palghat Gap; they are higher than Eastern Ghats.',
      'Chilika Lake (Odisha) is the largest brackish water lagoon in Asia.',
      'Barren Island (Andaman) is the only active volcano in India.',
      'The Deccan Plateau tilts from west to east — so most peninsular rivers flow eastward (Godavari, Krishna, Kaveri).'
    ],
    examples: [
      'The Palghat Gap (24 km wide) between the Nilgiri and Anamalai Hills connects Kerala and Tamil Nadu and significantly influences weather patterns.',
      'The flat gradient of the Northern Plains (1m per 5.6 km) causes extensive flooding during monsoons, especially in Bihar and eastern UP.'
    ],
    tables: [{
      title: 'Five Physiographic Divisions of India',
      headers: ['Division', 'Geological Origin', 'Major Features', 'Economic Importance'],
      rows: [
        ['Northern Mountains', 'Plate collision (fold mountains)', '3 ranges: Himadri, Himachal, Shiwaliks', 'Hydropower, timber, tourism'],
        ['Northern Plains', 'Alluvial deposition', 'Bhabar, Terai, Bhangar, Khadar', 'Most fertile agricultural zone'],
        ['Peninsular Plateau', 'Gondwanaland (oldest)', 'Central Highlands + Deccan Plateau', 'Minerals, black soil (cotton)'],
        ['Coastal Plains', 'Wave deposition + emergence', 'Western (narrow) + Eastern (wide)', 'Fishing, ports, rice cultivation'],
        ['Islands', 'Volcanic + coral', 'A&N (volcanic) + Lakshadweep (coral)', 'Strategic defense, coconut, fishing']
      ]
    }],
    revisionNotes: '* 5 divisions: Mountains, Plains, Plateau, Coastal, Islands.\n* Himalayas: Himadri > Himachal > Shiwaliks.\n* Plains: Bhabar → Terai → Bhangar → Khadar.\n* Western Ghats > Eastern Ghats (height). Palghat Gap = break.\n* Deccan tilts east → rivers flow east.\n* Barren Island = only active volcano (Andaman).\n* Chilika = largest brackish lagoon (Asia).',
    pyqs: [{
      question: { en: 'Which of the following is the correct sequence from north to south in the Northern Plains?', hi: 'उत्तरी मैदानों में उत्तर से दक्षिण तक सही क्रम कौन सा है?' },
      options: [
        { en: 'Bhabar → Terai → Bhangar → Khadar', hi: 'भाबर → तराई → भांगर → खादर' },
        { en: 'Terai → Bhabar → Khadar → Bhangar', hi: 'तराई → भाबर → खादर → भांगर' },
        { en: 'Khadar → Bhangar → Terai → Bhabar', hi: 'खादर → भांगर → तराई → भाबर' },
        { en: 'Bhangar → Khadar → Bhabar → Terai', hi: 'भांगर → खादर → भाबर → तराई' }
      ],
      answer: 0,
      explanation: { en: 'From north (foothills) to south: Bhabar (pebble zone, rivers disappear) → Terai (marshy, rivers re-emerge) → Bhangar (older alluvium with kankar) → Khadar (newer alluvium, most fertile flood plains).', hi: 'उत्तर (तलहटी) से दक्षिण: भाबर (कंकड़ क्षेत्र, नदियां लुप्त) → तराई (दलदली, नदियां पुनः प्रकट) → भांगर (पुरानी जलोढ़, कंकर सहित) → खादर (नई जलोढ़, सबसे उपजाऊ बाढ़ मैदान)।' },
      year: 2021
    }]
  },
  {
    exam: 'UPSC', subject: 'Geography', topic: 'Indian Geography',
    subtopic: 'Indian Monsoon — Mechanism, Onset & El Niño Impact',
    introduction: 'The Indian monsoon is one of the most studied weather phenomena globally. It brings 75% of India\'s annual rainfall between June and September, making it critical for agriculture, water resources, and the overall economy. Understanding its mechanism, jet stream dynamics, and ENSO impact is essential for UPSC.',
    detailedExplanation: `## Indian Monsoon System\n\n### 1. Mechanism\n- **Differential heating**: Land heats faster than the sea in summer, creating a low-pressure zone over northwest India (Thar Desert) and a high-pressure zone over the Indian Ocean.\n- **Shift of ITCZ**: The Inter-Tropical Convergence Zone shifts northward over the Ganga Plain during summer, attracting moisture-laden SE Trade Winds from the Southern Hemisphere.\n- **Cross-equatorial flow**: SE Trade Winds cross the equator, deflect rightward due to **Coriolis Force**, and become the **SW Monsoon winds**.\n- **Role of Jet Streams**: The **Sub-Tropical Westerly Jet Stream (STJ)** moves northward of the Himalayas in summer, allowing the monsoon to advance. The **Tropical Easterly Jet (TEJ)** over the peninsula drives the monsoon rainfall.\n- **Somali Jet / Low-Level Jet**: Strong cross-equatorial winds from East Africa (Somali coast) bring moisture to the western coast of India.\n\n### 2. Onset & Advance\n- **Onset**: Around **June 1** in Kerala. Called the "burst of monsoon" — sudden onset with heavy rain.\n- **Two branches**: Arabian Sea Branch (hits Western Ghats first) and Bay of Bengal Branch (hits NE India).\n- **Covers entire India by July 15** (approximately 45 days from onset).\n- **Withdrawal**: Begins September 1 from northwest India. Completes by December from Tamil Nadu coast.\n- **Retreating monsoon**: Gives rainfall to Tamil Nadu (October–December) via NE monsoon.\n\n### 3. El Niño & La Niña\n- **El Niño (ENSO)**: Warming of Pacific Ocean near Peru. Weakens the Walker Circulation. Results in **weaker monsoon** and **drought** in India (e.g., 2009 drought — El Niño year).\n- **La Niña**: Cooling of Pacific. Strengthens Walker Circulation. Results in **stronger/excess monsoon** rainfall.\n- **Indian Ocean Dipole (IOD)**: Temperature gradient in the Indian Ocean. Positive IOD can counteract El Niño and bring good monsoon.\n- **Madden-Julian Oscillation (MJO)**: 30–60 day oscillation affecting active and break phases of monsoon.`,
    concepts: ['ITCZ Migration', 'Jet Stream Dynamics', 'ENSO Effect on India', 'Monsoon Branches'],
    importantFacts: [
      'The Indian monsoon brings approximately 75% of India\'s total annual rainfall (June-September).',
      'Monsoon onset is typically around June 1 in Kerala; it covers all of India by approximately July 15.',
      'El Niño weakens the Indian monsoon, often causing drought. La Niña strengthens it.',
      'The Indian Ocean Dipole (positive phase) can counteract the negative effects of El Niño on the monsoon.',
      'Mawsynram (Meghalaya) receives the highest average annual rainfall in the world (~11,872 mm).',
      'Tamil Nadu gets most of its rain from the retreating NE monsoon (October-December), not the SW monsoon.'
    ],
    examples: [
      'The 2009 Indian drought was caused by a strong El Niño event — monsoon rainfall was 22% below normal, severely affecting agriculture.',
      'Cherrapunji once held the record for highest annual rainfall but Mawsynram now receives more — both in the Khasi Hills of Meghalaya, demonstrating orographic rainfall.'
    ],
    tables: [{
      title: 'Monsoon Branches — Comparison',
      headers: ['Feature', 'Arabian Sea Branch', 'Bay of Bengal Branch'],
      rows: [
        ['Origin', 'Arabian Sea high-pressure zone', 'Bay of Bengal high-pressure zone'],
        ['First Hit', 'Western Ghats (Kerala, June 1)', 'NE India (Assam, June 5-7)'],
        ['Rainfall Pattern', 'Western coast orographic rain', 'NE India, Eastern coast, Ganga plains'],
        ['Obstructed By', 'Western Ghats', 'Himalayas (causes heavy rain in NE)'],
        ['Contribution', '~35% of total monsoon', '~65% of total monsoon']
      ]
    }],
    revisionNotes: '* 75% annual rain = SW monsoon (June-September).\n* Onset = June 1 (Kerala). Full coverage by July 15.\n* Two branches: Arabian Sea (35%) + Bay of Bengal (65%).\n* El Niño = weak monsoon/drought. La Niña = strong monsoon.\n* IOD (positive) can counter El Niño.\n* Tamil Nadu = NE monsoon (Oct-Dec).\n* Mawsynram = highest rainfall in world (Meghalaya).',
    pyqs: [{
      question: { en: 'Which of the following phenomena can counteract the negative impact of El Niño on the Indian monsoon?', hi: 'निम्नलिखित में से कौन सी घटना भारतीय मानसून पर एल नीनो के नकारात्मक प्रभाव को कम कर सकती है?' },
      options: [
        { en: 'Positive Indian Ocean Dipole', hi: 'सकारात्मक हिंद महासागर द्विध्रुव' },
        { en: 'Western Disturbance', hi: 'पश्चिमी विक्षोभ' },
        { en: 'Arctic Oscillation', hi: 'आर्कटिक दोलन' },
        { en: 'Southern Annular Mode', hi: 'दक्षिणी वलयाकार मोड' }
      ],
      answer: 0,
      explanation: { en: 'A positive Indian Ocean Dipole (warmer western Indian Ocean, cooler eastern) strengthens the monsoon flow towards India, potentially counteracting the weakening effect of El Niño.', hi: 'सकारात्मक हिंद महासागर द्विध्रुव (गर्म पश्चिमी हिंद महासागर, ठंडा पूर्वी) भारत की ओर मानसून प्रवाह को मजबूत करता है, जो एल नीनो के कमजोर प्रभाव को संभावित रूप से कम कर सकता है।' },
      year: 2023
    }]
  }
];

// ═══════════════════════════════════════════════════════════════════
// UPSC ECONOMICS — DEEP MICRO CONCEPTS
// ═══════════════════════════════════════════════════════════════════
const economicsMicro = [
  {
    exam: 'UPSC', subject: 'Economics', topic: 'Macroeconomics',
    subtopic: 'RBI — Monetary Policy, Repo Rate & Inflation Targeting',
    introduction: 'The Reserve Bank of India (RBI), established in 1935 under the RBI Act 1934, is India\'s central bank. It formulates monetary policy, regulates banks, manages foreign exchange, and issues currency. Since 2016, the Monetary Policy Committee (MPC) determines the key policy rates to maintain price stability.',
    detailedExplanation: `## RBI & Monetary Policy\n\n### 1. RBI Overview\n- Established: **April 1, 1935** under the RBI Act, 1934.\n- Nationalized: **January 1, 1949**.\n- Headquarters: **Mumbai** (Mint Road).\n- Current Governor (as of 2024): **Shaktikanta Das**.\n- Functions: Banker to the government, banker's bank, issuer of currency (except coins and ₹1 note — issued by Ministry of Finance), foreign exchange management.\n\n### 2. Monetary Policy Instruments\n**Quantitative (General):**\n- **Repo Rate**: Rate at which RBI lends short-term money to commercial banks. Currently ~6.5% (2024). INCREASE → tighter liquidity → controls inflation.\n- **Reverse Repo Rate**: Rate at which RBI borrows from commercial banks. Lower than repo. INCREASE → absorbs liquidity.\n- **CRR (Cash Reserve Ratio)**: Percentage of deposits banks MUST keep with RBI as cash. Currently ~4.5%. No interest earned.\n- **SLR (Statutory Liquidity Ratio)**: Percentage of deposits banks must invest in approved securities (gold, government bonds). Currently ~18%.\n- **Open Market Operations (OMO)**: RBI buys/sells government securities to inject/absorb liquidity.\n- **MSF (Marginal Standing Facility)**: Emergency borrowing window for banks at Repo + 0.25%.\n\n**Qualitative (Selective):**\n- Margin requirements, credit rationing, moral suasion, direct action.\n\n### 3. Monetary Policy Committee (MPC)\n- Established by the **RBI Act Amendment, 2016** (Section 45ZB).\n- **6 members**: 3 from RBI (including Governor as chairman) + 3 external members appointed by Central Government.\n- Target: **CPI inflation at 4%** with a tolerance band of **+/- 2%** (i.e., 2%–6%).\n- Meets at least **4 times a year**. Decisions by **majority vote**. Governor has **casting vote** in case of tie.\n- If inflation exceeds 6% for 3 consecutive quarters, MPC must explain to the government.`,
    concepts: ['Monetary Policy Framework', 'Inflation Targeting', 'Liquidity Management', 'MPC Structure'],
    importantFacts: [
      'RBI was established on April 1, 1935 and nationalized on January 1, 1949.',
      'The MPC has 6 members (3 RBI + 3 external) and targets CPI inflation at 4% (±2%).',
      'Repo Rate is the primary policy rate — currently ~6.5% (2024).',
      'CRR deposits with RBI earn NO interest; SLR investments are in government securities.',
      'The ₹1 note and all coins are issued by the Ministry of Finance, not RBI.',
      'The Governor of RBI has a casting vote in MPC decisions in case of a tie.',
      'If inflation exceeds 6% for 3 consecutive quarters, MPC must send a report to the government.'
    ],
    examples: [
      'During COVID-19, RBI cut the Repo Rate from 5.15% to 4% (lowest ever) to stimulate economic activity and support growth.',
      'In OMOs, when RBI buys government securities from banks, it injects cash into the banking system — increasing liquidity and lowering interest rates.'
    ],
    tables: [{
      title: 'RBI Monetary Policy Instruments',
      headers: ['Instrument', 'Current Rate/Ratio', 'Effect When Increased', 'Used To'],
      rows: [
        ['Repo Rate', '~6.5%', 'Tightens liquidity, raises lending rates', 'Control inflation'],
        ['Reverse Repo', '~3.35%', 'Absorbs excess liquidity from banks', 'Reduce money supply'],
        ['CRR', '~4.5%', 'Less money available for lending', 'Control credit creation'],
        ['SLR', '~18%', 'More funds locked in govt securities', 'Ensure bank solvency'],
        ['OMO (Buy)', 'Variable', 'Injects cash, increases liquidity', 'Stimulate economy'],
        ['MSF', 'Repo + 0.25%', 'Emergency overnight borrowing', 'Short-term liquidity crunch']
      ]
    }],
    revisionNotes: '* RBI est. = April 1, 1935. Nationalized = Jan 1, 1949. HQ = Mumbai.\n* MPC = 6 members (3 RBI + 3 govt). CPI target = 4% (±2%).\n* Repo = RBI lends to banks. Reverse Repo = RBI borrows from banks.\n* CRR = cash with RBI (no interest). SLR = govt securities.\n* ₹1 note + coins = Ministry of Finance.\n* OMO = buy/sell govt securities for liquidity.\n* Inflation > 6% for 3 quarters → MPC explains to govt.',
    pyqs: [{
      question: { en: 'The Monetary Policy Committee (MPC) of RBI targets which inflation index?', hi: 'RBI की मौद्रिक नीति समिति (MPC) किस मुद्रास्फीति सूचकांक को लक्षित करती है?' },
      options: [
        { en: 'Consumer Price Index (CPI)', hi: 'उपभोक्ता मूल्य सूचकांक (CPI)' },
        { en: 'Wholesale Price Index (WPI)', hi: 'थोक मूल्य सूचकांक (WPI)' },
        { en: 'GDP Deflator', hi: 'जीडीपी अपस्फीतिकारक' },
        { en: 'Producer Price Index (PPI)', hi: 'उत्पादक मूल्य सूचकांक (PPI)' }
      ],
      answer: 0,
      explanation: { en: 'Since 2016, the MPC officially targets CPI (Consumer Price Index) inflation at 4% with a tolerance band of ±2% (i.e., between 2% and 6%).', hi: '2016 से, MPC आधिकारिक रूप से CPI (उपभोक्ता मूल्य सूचकांक) मुद्रास्फीति को 4% पर ±2% की सहनशीलता सीमा (यानी 2% और 6% के बीच) के साथ लक्षित करती है।' },
      year: 2022
    }]
  }
];


// ═══════════════════════════════════════════════════════════════════
// SEEDER FUNCTION
// ═══════════════════════════════════════════════════════════════════
async function seed() {
  console.log(`\n${'═'.repeat(60)}`);
  console.log('  UPSC POLITY + GEOGRAPHY + ECONOMICS MICRO SEEDER');
  console.log(`${'═'.repeat(60)}\n`);
  console.log(`🔌 Connecting to: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected.\n');

  const allMicro = [...polityMicro, ...geographyMicro, ...economicsMicro];

  console.log(`📚 Total micro-concepts to seed: ${allMicro.length}`);

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of allMicro) {
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
      console.log(`  ✅ [${item.subject}] ${item.subtopic}`);
    } catch (err) {
      failed++;
      console.error(`  ❌ Failed: ${item.subtopic} — ${err.message}`);
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📊 SEEDING COMPLETE`);
  console.log(`  ✅ Inserted: ${inserted}`);
  console.log(`  ⏭️ Skipped: ${skipped}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`${'═'.repeat(60)}\n`);

  await mongoose.disconnect();
  console.log('🔌 Disconnected.');
}

seed().catch(console.error);
