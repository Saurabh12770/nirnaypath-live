// Targeted subtopic mapper seeder
// Maps questions from existing DB to syllabus-aligned subtopics for BPSC, Railway, SSC CGL, SSC CHSL, State PCS, UPSC, Banking
// This is a SUBTOPIC NORMALIZATION script — it creates correctly tagged questions for all missing subtopic slots.

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
import Question from '../models/Question.js';

// ═══════════════════════════════════════════════════════════════════
// HAND-CRAFTED TARGETED QUESTIONS FOR SYLLABUS SUBTOPIC ALIGNMENT
// These fill the normalization gaps: subtopics exist in the syllabus
// but have no questions tagged to them in the DB.
// ═══════════════════════════════════════════════════════════════════

const targetedQuestions = [
  // ═══════════════════════════════
  // BPSC — Bihar Special Subtopics
  // ═══════════════════════════════
  {
    exam: 'BPSC', subject: 'Bihar Special', topic: 'Bihar History', subtopic: 'Ancient Bihar — Magadha Empire & Pataliputra',
    difficulty: 'easy',
    question: { en: 'Pataliputra, the capital of the Magadha Empire, is identified with which modern city?', hi: 'मगध साम्राज्य की राजधानी पाटलिपुत्र किस आधुनिक शहर के साथ पहचानी जाती है?' },
    options: [{ en: 'Gaya', hi: 'गया' }, { en: 'Patna', hi: 'पटना' }, { en: 'Nalanda', hi: 'नालंदा' }, { en: 'Rajgir', hi: 'राजगीर' }],
    answer: 1,
    explanation: { en: 'Pataliputra, the grand capital of the Mauryan Empire, corresponds to modern-day Patna in Bihar.', hi: 'मौर्य साम्राज्य की भव्य राजधानी पाटलिपुत्र आधुनिक बिहार के पटना शहर से मेल खाती है।' }
  },
  {
    exam: 'BPSC', subject: 'Bihar Special', topic: 'Bihar History', subtopic: 'Buddhist & Jain Heritage in Bihar',
    difficulty: 'easy',
    question: { en: 'Which site in Bihar is considered the place where Lord Buddha attained enlightenment?', hi: 'बिहार में कौन सा स्थल भगवान बुद्ध की ज्ञान प्राप्ति का स्थान माना जाता है?' },
    options: [{ en: 'Vaishali', hi: 'वैशाली' }, { en: 'Nalanda', hi: 'नालंदा' }, { en: 'Bodh Gaya', hi: 'बोधगया' }, { en: 'Pawapuri', hi: 'पावापुरी' }],
    answer: 2,
    explanation: { en: 'Lord Buddha attained enlightenment (Nirvana) under the Bodhi tree at Bodh Gaya in Bihar.', hi: 'भगवान बुद्ध ने बिहार के बोधगया में बोधि वृक्ष के नीचे ज्ञान (निर्वाण) प्राप्त किया था।' }
  },
  {
    exam: 'BPSC', subject: 'Bihar Special', topic: 'Bihar History', subtopic: 'Nalanda & Vikramashila Universities',
    difficulty: 'medium',
    question: { en: 'Nalanda University was founded by which Gupta ruler?', hi: 'नालंदा विश्वविद्यालय की स्थापना किस गुप्त शासक ने की थी?' },
    options: [{ en: 'Chandragupta II', hi: 'चंद्रगुप्त द्वितीय' }, { en: 'Kumaragupta I', hi: 'कुमारगुप्त प्रथम' }, { en: 'Samudragupta', hi: 'समुद्रगुप्त' }, { en: 'Skandagupta', hi: 'स्कंदगुप्त' }],
    answer: 1,
    explanation: { en: 'Nalanda University was founded by Kumaragupta I of the Gupta Dynasty in the 5th century CE.', hi: 'नालंदा विश्वविद्यालय की स्थापना 5वीं शताब्दी ईस्वी में गुप्त वंश के कुमारगुप्त प्रथम ने की थी।' }
  },
  {
    exam: 'BPSC', subject: 'Bihar Special', topic: 'Bihar History', subtopic: 'Indigo Revolt (Champaran) & Gandhiji',
    difficulty: 'easy',
    question: { en: 'In which year did Mahatma Gandhi launch the Champaran Satyagraha in Bihar?', hi: 'महात्मा गांधी ने बिहार में चंपारण सत्याग्रह किस वर्ष शुरू किया था?' },
    options: [{ en: '1905', hi: '1905' }, { en: '1915', hi: '1915' }, { en: '1917', hi: '1917' }, { en: '1919', hi: '1919' }],
    answer: 2,
    explanation: { en: 'Gandhi launched the Champaran Satyagraha in 1917 against the exploitation of indigo farmers by British planters in Champaran, Bihar. It was Gandhi\'s first major satyagraha in India.', hi: 'गांधी ने 1917 में बिहार के चंपारण में ब्रिटिश बागान मालिकों द्वारा नील किसानों के शोषण के खिलाफ चंपारण सत्याग्रह शुरू किया। यह भारत में गांधी का पहला प्रमुख सत्याग्रह था।' }
  },
  {
    exam: 'BPSC', subject: 'Bihar Special', topic: 'Bihar History', subtopic: 'Bihar Reorganisation — Formation of Jharkhand',
    difficulty: 'easy',
    question: { en: 'On which date was the state of Jharkhand carved out of Bihar?', hi: 'किस तारीख को झारखंड राज्य को बिहार से अलग किया गया था?' },
    options: [{ en: '1 November 2000', hi: '1 नवंबर 2000' }, { en: '15 November 2000', hi: '15 नवंबर 2000' }, { en: '26 January 2001', hi: '26 जनवरी 2001' }, { en: '9 November 2000', hi: '9 नवंबर 2000' }],
    answer: 1,
    explanation: { en: 'Jharkhand was carved out of southern Bihar as a separate state on November 15, 2000, on the birthday of tribal icon Birsa Munda.', hi: 'झारखंड को 15 नवंबर 2000 को, आदिवासी नायक बिरसा मुंडा की जयंती पर, दक्षिणी बिहार से अलग करके एक अलग राज्य बनाया गया था।' }
  },

  // ═══════════════════════════════════════
  // SSC CHSL — Reasoning Subtopics (Missing)
  // ═══════════════════════════════════════
  {
    exam: 'SSC CHSL', subject: 'Reasoning', topic: 'Verbal Reasoning', subtopic: 'Classification & Odd One Out',
    difficulty: 'easy',
    question: { en: 'Which of the following does NOT belong to the group: Rose, Lotus, Tulip, Mango?', hi: 'निम्नलिखित में से कौन सा समूह में नहीं आता: गुलाब, कमल, ट्यूलिप, आम?' },
    options: [{ en: 'Rose', hi: 'गुलाब' }, { en: 'Lotus', hi: 'कमल' }, { en: 'Tulip', hi: 'ट्यूलिप' }, { en: 'Mango', hi: 'आम' }],
    answer: 3,
    explanation: { en: 'Rose, Lotus, and Tulip are all flowers. Mango is a fruit, not a flower. Hence, Mango is the odd one out.', hi: 'गुलाब, कमल और ट्यूलिप सभी फूल हैं। आम एक फल है, फूल नहीं। इसलिए, आम अलग श्रेणी का है।' }
  },
  {
    exam: 'SSC CHSL', subject: 'Reasoning', topic: 'Verbal Reasoning', subtopic: 'Number and Alphabet Series',
    difficulty: 'medium',
    question: { en: 'Find the missing number in the series: 2, 6, 12, 20, 30, ?', hi: 'श्रृंखला में लुप्त संख्या ज्ञात करें: 2, 6, 12, 20, 30, ?' },
    options: [{ en: '38', hi: '38' }, { en: '40', hi: '40' }, { en: '42', hi: '42' }, { en: '44', hi: '44' }],
    answer: 2,
    explanation: { en: 'The pattern is n×(n+1): 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42. The missing number is 42.', hi: 'पैटर्न n×(n+1) है: 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42। लुप्त संख्या 42 है।' }
  },
  {
    exam: 'SSC CHSL', subject: 'Reasoning', topic: 'Verbal Reasoning', subtopic: 'Direction Sense Test',
    difficulty: 'easy',
    question: { en: 'Rajesh walks 10 km North, then turns right and walks 5 km. Then he turns right and walks 10 km. In which direction is he from the starting point?', hi: 'राजेश 10 किमी उत्तर चलता है, फिर दाएं मुड़कर 5 किमी चलता है। फिर वह दाएं मुड़कर 10 किमी चलता है। वह शुरुआती बिंदु से किस दिशा में है?' },
    options: [{ en: 'East', hi: 'पूर्व' }, { en: 'West', hi: 'पश्चिम' }, { en: 'North', hi: 'उत्तर' }, { en: 'South', hi: 'दक्षिण' }],
    answer: 0,
    explanation: { en: 'Starting → 10km North → turn right (East) → 5km East → turn right (South) → 10km South. Final position is 5km East of start. So he is East of the starting point.', hi: 'शुरुआत → 10 किमी उत्तर → दाएं मुड़ें (पूर्व) → 5 किमी पूर्व → दाएं मुड़ें (दक्षिण) → 10 किमी दक्षिण। अंतिम स्थिति शुरुआत से 5 किमी पूर्व में है। इसलिए वह प्रारंभिक बिंदु से पूर्व में है।' }
  },
  {
    exam: 'SSC CHSL', subject: 'Math', topic: 'Arithmetic Ability', subtopic: 'Number System',
    difficulty: 'easy',
    question: { en: 'Which of the following is a prime number?', hi: 'निम्नलिखित में से कौन सी एक अभाज्य संख्या है?' },
    options: [{ en: '21', hi: '21' }, { en: '35', hi: '35' }, { en: '43', hi: '43' }, { en: '49', hi: '49' }],
    answer: 2,
    explanation: { en: '43 is a prime number. 21 = 3×7, 35 = 5×7, 49 = 7×7. 43 has no factors other than 1 and itself.', hi: '43 एक अभाज्य संख्या है। 21 = 3×7, 35 = 5×7, 49 = 7×7। 43 के 1 और स्वयं के अलावा कोई गुणनखंड नहीं हैं।' }
  },
  {
    exam: 'SSC CHSL', subject: 'Reasoning', topic: 'Non-Verbal Reasoning', subtopic: 'Mirror and Water Images',
    difficulty: 'easy',
    question: { en: 'In a mirror image, if the time shows 8:30, what is the actual time?', hi: 'दर्पण प्रतिबिंब में, यदि समय 8:30 दिखाता है, तो वास्तविक समय क्या है?' },
    options: [{ en: '3:30', hi: '3:30' }, { en: '3:00', hi: '3:00' }, { en: '8:30', hi: '8:30' }, { en: '3:35', hi: '3:35' }],
    answer: 0,
    explanation: { en: 'To find the actual time from mirror image, subtract the mirror time from 11:60. 11:60 - 8:30 = 3:30. The actual time is 3:30.', hi: 'दर्पण प्रतिबिंब से वास्तविक समय ज्ञात करने के लिए, दर्पण समय को 11:60 से घटाएं। 11:60 - 8:30 = 3:30। वास्तविक समय 3:30 है।' }
  },

  // ═══════════════════════════════════════
  // Railway — Missing Subtopics
  // ═══════════════════════════════════════
  {
    exam: 'Railway', subject: 'Reasoning', topic: 'General Intelligence & Reasoning', subtopic: 'Coding-Decoding',
    difficulty: 'easy',
    question: { en: 'In a code language, BOOK is written as CPPL. How is DOOR written?', hi: 'एक कूट भाषा में, BOOK को CPPL लिखा जाता है। DOOR को कैसे लिखा जाएगा?' },
    options: [{ en: 'EPPS', hi: 'EPPS' }, { en: 'EQPS', hi: 'EQPS' }, { en: 'EPPR', hi: 'EPPR' }, { en: 'FQPS', hi: 'FQPS' }],
    answer: 0,
    explanation: { en: 'Each letter is shifted by +1: B→C, O→P, O→P, K→L. So D→E, O→P, O→P, R→S. DOOR = EPPS.', hi: 'प्रत्येक अक्षर को +1 से स्थानांतरित किया जाता है: B→C, O→P, O→P, K→L। तो D→E, O→P, O→P, R→S। DOOR = EPPS।' }
  },
  {
    exam: 'Railway', subject: 'Math', topic: 'Quantitative Aptitude', subtopic: 'Decimals and Fractions',
    difficulty: 'easy',
    question: { en: 'What is 0.25 × 0.04?', hi: '0.25 × 0.04 = ?' },
    options: [{ en: '0.01', hi: '0.01' }, { en: '0.1', hi: '0.1' }, { en: '0.001', hi: '0.001' }, { en: '1.00', hi: '1.00' }],
    answer: 0,
    explanation: { en: '0.25 × 0.04 = 25/100 × 4/100 = 100/10000 = 0.01.', hi: '0.25 × 0.04 = 25/100 × 4/100 = 100/10000 = 0.01।' }
  },
  {
    exam: 'Railway', subject: 'Reasoning', topic: 'General Intelligence & Reasoning', subtopic: 'Mathematical Operations',
    difficulty: 'medium',
    question: { en: 'If + means ×, × means ÷, ÷ means –, and – means +, then what is 8 + 4 × 2 ÷ 3 – 1?', hi: 'यदि + का अर्थ ×, × का अर्थ ÷, ÷ का अर्थ –, और – का अर्थ + है, तो 8 + 4 × 2 ÷ 3 – 1 = ?' },
    options: [{ en: '14', hi: '14' }, { en: '16', hi: '16' }, { en: '12', hi: '12' }, { en: '15', hi: '15' }],
    answer: 1,
    explanation: { en: 'Substituting: 8 × 4 ÷ 2 – 3 + 1 = 8 × 2 – 3 + 1 = 16 – 3 + 1 = 14. Wait: 8 × 4 = 32, 32 ÷ 2 = 16, 16 – 3 = 13, 13 + 1 = 14. Answer is 14.', hi: 'प्रतिस्थापित करने पर: 8 × 4 ÷ 2 – 3 + 1 = 32 ÷ 2 – 3 + 1 = 16 – 3 + 1 = 14।' }
  },

  // ═══════════════════════════════════════
  // SSC CGL — Missing Reasoning Subtopics
  // ═══════════════════════════════════════
  {
    exam: 'SSC CGL', subject: 'Reasoning', topic: 'General Intelligence', subtopic: 'Analogy — Word & Letter Based',
    difficulty: 'easy',
    question: { en: 'Doctor : Hospital :: Teacher : ?', hi: 'डॉक्टर : अस्पताल :: शिक्षक : ?' },
    options: [{ en: 'Book', hi: 'किताब' }, { en: 'School', hi: 'स्कूल' }, { en: 'Student', hi: 'छात्र' }, { en: 'Education', hi: 'शिक्षा' }],
    answer: 1,
    explanation: { en: 'Doctor works in a Hospital. Similarly, a Teacher works in a School. The analogy relates a professional to their workplace.', hi: 'डॉक्टर अस्पताल में काम करता है। इसी प्रकार, एक शिक्षक स्कूल में काम करता है। सादृश्यता एक पेशेवर को उनके कार्यस्थल से जोड़ती है।' }
  },
  {
    exam: 'SSC CGL', subject: 'Reasoning', topic: 'General Intelligence', subtopic: 'Classification — Odd One Out',
    difficulty: 'easy',
    question: { en: 'Which is the odd one out: Saturn, Earth, Moon, Jupiter?', hi: 'कौन सा अलग है: शनि, पृथ्वी, चंद्रमा, बृहस्पति?' },
    options: [{ en: 'Saturn', hi: 'शनि' }, { en: 'Earth', hi: 'पृथ्वी' }, { en: 'Moon', hi: 'चंद्रमा' }, { en: 'Jupiter', hi: 'बृहस्पति' }],
    answer: 2,
    explanation: { en: 'Saturn, Earth, and Jupiter are all planets in the Solar System. Moon is a natural satellite (of Earth), not a planet.', hi: 'शनि, पृथ्वी और बृहस्पति सौरमंडल के ग्रह हैं। चंद्रमा एक प्राकृतिक उपग्रह (पृथ्वी का) है, ग्रह नहीं।' }
  },
  {
    exam: 'SSC CGL', subject: 'Reasoning', topic: 'General Intelligence', subtopic: 'Series — Number & Letter Series',
    difficulty: 'medium',
    question: { en: 'Find the missing term: A, D, G, J, ?', hi: 'लुप्त पद ज्ञात कीजिए: A, D, G, J, ?' },
    options: [{ en: 'L', hi: 'L' }, { en: 'M', hi: 'M' }, { en: 'N', hi: 'N' }, { en: 'K', hi: 'K' }],
    answer: 1,
    explanation: { en: 'A (+3) D (+3) G (+3) J (+3) M. Each letter advances by 3 positions: A=1, D=4, G=7, J=10, M=13.', hi: 'A (+3) D (+3) G (+3) J (+3) M। प्रत्येक अक्षर 3 स्थान आगे बढ़ता है: A=1, D=4, G=7, J=10, M=13।' }
  },
  {
    exam: 'SSC CGL', subject: 'Reasoning', topic: 'General Intelligence', subtopic: 'Direction & Distance',
    difficulty: 'medium',
    question: { en: 'A man walks 15 km west, then 12 km north, then 15 km east. How far is he from the starting point?', hi: 'एक आदमी 15 किमी पश्चिम, फिर 12 किमी उत्तर, फिर 15 किमी पूर्व चलता है। वह प्रारंभिक बिंदु से कितनी दूर है?' },
    options: [{ en: '10 km', hi: '10 किमी' }, { en: '12 km', hi: '12 किमी' }, { en: '15 km', hi: '15 किमी' }, { en: '27 km', hi: '27 किमी' }],
    answer: 1,
    explanation: { en: 'The east-west displacement cancels out (15W – 15E = 0). Only the 12 km north displacement remains. So he is 12 km from starting point.', hi: 'पूर्व-पश्चिम विस्थापन रद्द हो जाता है (15W – 15E = 0)। केवल 12 किमी उत्तर का विस्थापन बचता है। इसलिए वह प्रारंभिक बिंदु से 12 किमी दूर है।' }
  },

  // ═══════════════════════════════════════
  // Banking — Missing Reasoning Subtopics
  // ═══════════════════════════════════════
  {
    exam: 'Banking', subject: 'Reasoning', topic: 'Logical & Analytical Reasoning', subtopic: 'Seating Arrangement (Linear, Circular, Square)',
    difficulty: 'medium',
    question: { en: 'In a row of 5 persons A, B, C, D, E: A is to the left of B. C is to the right of B. D is between A and B. E is at the right end. Who is at the left end?', hi: '5 व्यक्तियों A, B, C, D, E की एक पंक्ति में: A, B के बाईं ओर है। C, B के दाईं ओर है। D, A और B के बीच में है। E दाईं छोर पर है। बाईं छोर पर कौन है?' },
    options: [{ en: 'A', hi: 'A' }, { en: 'B', hi: 'B' }, { en: 'D', hi: 'D' }, { en: 'E', hi: 'E' }],
    answer: 0,
    explanation: { en: 'Arrangement from left to right: A, D, B, C, E. So A is at the left end.', hi: 'बाएं से दाएं व्यवस्था: A, D, B, C, E। इसलिए A बाईं छोर पर है।' }
  },
  {
    exam: 'Banking', subject: 'Reasoning', topic: 'Logical & Analytical Reasoning', subtopic: 'Blood Relations & Coded Family Trees',
    difficulty: 'medium',
    question: { en: 'A + B means A is the mother of B. A – B means A is the husband of B. A × B means A is the brother of B. If P + Q – R, how is P related to R?', hi: 'A + B का अर्थ है A, B की माँ है। A – B का अर्थ है A, B का पति है। A × B का अर्थ है A, B का भाई है। यदि P + Q – R है, तो P का R से क्या संबंध है?' },
    options: [{ en: 'Mother-in-law', hi: 'सास' }, { en: 'Mother', hi: 'माँ' }, { en: 'Sister-in-law', hi: 'भाभी' }, { en: 'Wife', hi: 'पत्नी' }],
    answer: 0,
    explanation: { en: 'P + Q: P is the mother of Q. Q – R: Q is the husband of R. So P is the mother of Q who is the husband of R, making P the mother-in-law of R.', hi: 'P + Q: P, Q की माँ है। Q – R: Q, R का पति है। तो P, Q की माँ है जो R का पति है, इसलिए P, R की सास है।' }
  },
  {
    exam: 'Banking', subject: 'Reasoning', topic: 'Logical & Analytical Reasoning', subtopic: 'Syllogism (Only/Few concepts)',
    difficulty: 'medium',
    question: { en: 'Statements: All cats are dogs. All dogs are animals. Conclusion I: All cats are animals. Conclusion II: Some animals are cats. Which conclusions follow?', hi: 'कथन: सभी बिल्लियाँ कुत्ते हैं। सभी कुत्ते जानवर हैं। निष्कर्ष I: सभी बिल्लियाँ जानवर हैं। निष्कर्ष II: कुछ जानवर बिल्लियाँ हैं। कौन से निष्कर्ष निकलते हैं?' },
    options: [{ en: 'Only I', hi: 'केवल I' }, { en: 'Only II', hi: 'केवल II' }, { en: 'Both I and II', hi: 'I और II दोनों' }, { en: 'Neither', hi: 'न तो I न II' }],
    answer: 2,
    explanation: { en: 'All cats are dogs + All dogs are animals → All cats are animals (Conclusion I follows). Since all cats are animals, some animals must be cats (Conclusion II follows by conversion).', hi: 'सभी बिल्लियाँ कुत्ते हैं + सभी कुत्ते जानवर हैं → सभी बिल्लियाँ जानवर हैं (निष्कर्ष I मान्य)। चूँकि सभी बिल्लियाँ जानवर हैं, कुछ जानवर बिल्लियाँ होनी चाहिए (निष्कर्ष II परिवर्तन से मान्य)।' }
  },

  // ═══════════════════════════════════════
  // UPSC — Syllabus-aligned subtopic questions
  // ═══════════════════════════════════════
  {
    exam: 'UPSC', subject: 'History', topic: 'Ancient India', subtopic: 'Prehistoric India & Stone Age',
    difficulty: 'medium',
    question: { en: 'In which of the following periods did the use of microliths begin in India?', hi: 'भारत में माइक्रोलिथ का उपयोग निम्नलिखित में से किस काल में शुरू हुआ?' },
    options: [{ en: 'Lower Palaeolithic', hi: 'निम्न पुरापाषाण काल' }, { en: 'Upper Palaeolithic', hi: 'उच्च पुरापाषाण काल' }, { en: 'Mesolithic', hi: 'मध्यपाषाण काल' }, { en: 'Neolithic', hi: 'नवपाषाण काल' }],
    answer: 2,
    explanation: { en: 'Microliths (small stone blades) are characteristic of the Mesolithic Period (10,000–6,000 BCE). This period is marked by hunter-gatherer lifestyle, cave art, and use of tiny geometric stone tools.', hi: 'माइक्रोलिथ (छोटे पत्थर के ब्लेड) मध्यपाषाण काल (10,000–6,000 ईसा पूर्व) की विशेषता हैं। यह काल शिकारी-संग्रहकर्ता जीवनशैली, गुफा चित्रकला और छोटे ज्यामितीय पत्थर के औजारों के उपयोग से चिह्नित है।' }
  },
  {
    exam: 'UPSC', subject: 'History', topic: 'Ancient India', subtopic: 'Mahajanapadas & Rise of Magadha',
    difficulty: 'medium',
    question: { en: 'Which of the following Mahajanapadas is known as the world\'s first republic?', hi: 'निम्नलिखित में से किस महाजनपद को विश्व का प्रथम गणराज्य माना जाता है?' },
    options: [{ en: 'Magadha', hi: 'मगध' }, { en: 'Vatsa', hi: 'वत्स' }, { en: 'Vajji', hi: 'वज्जि' }, { en: 'Kosala', hi: 'कोसल' }],
    answer: 2,
    explanation: { en: 'Vajji (or Vrijji) Confederacy, with its capital at Vaishali, is considered the world\'s first republic. It was a confederacy of eight clans, governed by a democratic assembly rather than hereditary monarchy.', hi: 'वज्जि (या वृज्जि) संघ, जिसकी राजधानी वैशाली थी, को विश्व का प्रथम गणराज्य माना जाता है। यह आठ कुलों का एक संघ था, जिस पर वंशानुगत राजतंत्र के बजाय एक लोकतांत्रिक सभा द्वारा शासन किया जाता था।' }
  },
  {
    exam: 'UPSC', subject: 'History', topic: 'Ancient India', subtopic: 'Mauryan Empire — Chandragupta & Ashoka',
    difficulty: 'easy',
    question: { en: 'Which Greek ambassador\'s account provides crucial information about the Mauryan administration?', hi: 'किस यूनानी राजदूत के विवरण में मौर्य प्रशासन के बारे में महत्वपूर्ण जानकारी मिलती है?' },
    options: [{ en: 'Fa-Hien', hi: 'फाह्यान' }, { en: 'Hiuen Tsang', hi: 'ह्वेनसांग' }, { en: 'Megasthenes', hi: 'मेगस्थनीज' }, { en: 'Al-Beruni', hi: 'अल-बेरूनी' }],
    answer: 2,
    explanation: { en: 'Megasthenes was the Greek ambassador in the court of Chandragupta Maurya. His book "Indica" is an invaluable source of information on Mauryan social and administrative organization.', hi: 'मेगस्थनीज चंद्रगुप्त मौर्य के दरबार में यूनानी राजदूत थे। उनकी पुस्तक "इंडिका" मौर्य सामाजिक और प्रशासनिक संगठन की जानकारी का एक अमूल्य स्रोत है।' }
  },
  {
    exam: 'UPSC', subject: 'History', topic: 'Ancient India', subtopic: 'Buddhism — Buddha\'s Life and Teachings',
    difficulty: 'easy',
    question: { en: 'The Four Noble Truths of Buddhism are related to:', hi: 'बौद्ध धर्म के चार आर्य सत्य किससे संबंधित हैं?' },
    options: [{ en: 'Nature of the universe', hi: 'ब्रह्मांड की प्रकृति' }, { en: 'The nature and cessation of suffering', hi: 'दुःख की प्रकृति और उसका निवारण' }, { en: 'The path to moksha', hi: 'मोक्ष का मार्ग' }, { en: 'Social equality', hi: 'सामाजिक समानता' }],
    answer: 1,
    explanation: { en: 'The Four Noble Truths (Chatur Arya Satya) teach that: (1) Life is suffering (Dukkha), (2) Suffering has a cause (craving/tanha), (3) Suffering can be ended, and (4) The Eightfold Path leads to the end of suffering.', hi: 'चार आर्य सत्य यह सिखाते हैं: (1) जीवन दुःखमय है (दुःख), (2) दुःख का एक कारण है (तृष्णा/तण्हा), (3) दुःख को समाप्त किया जा सकता है, और (4) अष्टमार्ग दुःख के अंत की ओर ले जाता है।' }
  },

  // ═══════════════════════════════════════
  // State PCS — Missing Subtopics
  // ═══════════════════════════════════════
  {
    exam: 'State PCS', subject: 'State GK', topic: 'State History', subtopic: 'Ancient & Medieval History of the State',
    difficulty: 'medium',
    question: { en: 'Which ancient dynasty is historically associated with the early urbanization of north India and is linked to the State PCS syllabus?', hi: 'कौन सा प्राचीन राजवंश ऐतिहासिक रूप से उत्तर भारत के प्रारंभिक शहरीकरण से जुड़ा है और राज्य पीसीएस पाठ्यक्रम से जुड़ा है?' },
    options: [{ en: 'Maurya Dynasty', hi: 'मौर्य वंश' }, { en: 'Gupta Dynasty', hi: 'गुप्त वंश' }, { en: 'Harsha Empire', hi: 'हर्ष साम्राज्य' }, { en: 'All of the above are relevant to different states', hi: 'उपरोक्त सभी विभिन्न राज्यों के लिए प्रासंगिक हैं' }],
    answer: 3,
    explanation: { en: 'State PCS exams require knowledge of local ancient and medieval history. Depending on the state, different dynasties — Mauryas, Guptas, Harsha, or medieval sultanates — are relevant to the history syllabus.', hi: 'राज्य पीसीएस परीक्षाओं के लिए स्थानीय प्राचीन और मध्यकालीन इतिहास का ज्ञान आवश्यक है। राज्य के आधार पर, विभिन्न राजवंश — मौर्य, गुप्त, हर्ष, या मध्यकालीन सल्तनतें — इतिहास के पाठ्यक्रम के लिए प्रासंगिक हैं।' }
  },
  {
    exam: 'State PCS', subject: 'State GK', topic: 'State Culture', subtopic: 'Folk Art, Painting, Music, and Dance Forms',
    difficulty: 'easy',
    question: { en: 'Which classical dance form, recognized by the Sangeet Natak Akademi, originated in Uttar Pradesh?', hi: 'संगीत नाटक अकादमी द्वारा मान्यता प्राप्त कौन सा शास्त्रीय नृत्य रूप उत्तर प्रदेश में उत्पन्न हुआ?' },
    options: [{ en: 'Bharatanatyam', hi: 'भरतनाट्यम' }, { en: 'Kathak', hi: 'कथक' }, { en: 'Odissi', hi: 'ओडिसी' }, { en: 'Kuchipudi', hi: 'कुचिपुड़ी' }],
    answer: 1,
    explanation: { en: 'Kathak is the classical dance form that originated in the temples of North India, particularly Uttar Pradesh. It evolved through the devotional storytelling (katha) tradition and later flourished at Lucknow and Jaipur courts.', hi: 'कथक वह शास्त्रीय नृत्य रूप है जो उत्तर भारत के मंदिरों में विशेष रूप से उत्तर प्रदेश में उत्पन्न हुआ। यह भक्तिपूर्ण कहानी कहने (कथा) की परंपरा के माध्यम से विकसित हुआ और बाद में लखनऊ और जयपुर दरबारों में फला-फूला।' }
  }
];

async function seed() {
  console.log('\n======================================================');
  console.log('  TARGETED SUBTOPIC NORMALIZATION SEEDER');
  console.log('======================================================\n');

  console.log(`🔌 Connecting to: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected.\n');

  let inserted = 0;
  let skipped = 0;

  for (const q of targetedQuestions) {
    try {
      const exists = await Question.findOne({
        exam: q.exam,
        subtopic: q.subtopic,
        'question.en': q.question.en
      });

      if (exists) {
        skipped++;
        continue;
      }

      await Question.create(q);
      inserted++;
    } catch (err) {
      console.error(`❌ Failed to insert: ${q.subtopic} — ${err.message}`);
    }
  }

  console.log(`\n📊 NORMALIZATION SEEDING COMPLETE`);
  console.log(`  ✅ Inserted: ${inserted} targeted questions`);
  console.log(`  ⏭️ Skipped (already exist): ${skipped}`);
  console.log('======================================================\n');

  await mongoose.disconnect();
  console.log('🔌 Disconnected.');
}

seed().catch(console.error);
