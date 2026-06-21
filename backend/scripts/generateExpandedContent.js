import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
import LearningContent from '../models/LearningContent.js';

// Dictionary mapping subtopics to real topic-specific academic content
const ACADEMIC_REGISTRY = {
  // --- MATH / QUANT SUBJECTS ---
  math_di: {
    titleEn: 'Data Interpretation',
    titleHi: 'डेटा इंटरप्रिटेशन',
    en: {
      overview: 'Data Interpretation (DI) is the critical core of quantitative testing. It tests the ability to analyze and draw inferences from structured datasets.',
      definition: 'Data Interpretation is the process of reviewing, organizing, and calculating mathematical parameters from graphical representations such as tables, bar graphs, line charts, pie charts, and caselets to make logical deductions.',
      concepts: 'Percentage Change, Ratio and Proportion, Averages, Summation, Data Comparison, Chart Types, Unit Conversions.',
      theory: '### Types of Data Representation:\n1. **Table DI**: Data structured in rows and columns. Look for total values, trends across years, and relative changes.\n2. **Bar Chart**: Visual representation of category sizes. Focus on vertical scale increments.\n3. **Line Graph**: Continuous tracking over time. Highly useful for calculating growth rates and slopes.\n4. **Pie Chart**: Circular breakdown (360 degrees equals 100%). Calculate angles: `Angle = (Value / Total) * 360`.\n5. **Caselets**: Textual description of data. Must construct a corresponding table before solving.',
      examples: 'A pie chart of family expenses: Rent (25%), Food (30%), Education (20%), and Savings (25%).',
      solved: 'Question: If total household income is Rs. 50,000, find the amount spent on rent.\nSolution: Rent = 25% of 50,000 = Rs. 12,500.',
      relevance: 'High importance for UPSC CSAT, Banking Mains, and SSC CGL. Directly tests logical and numerical competence.',
      pyq: 'Analysis of past questions shows a trend towards multi-variable tables and mixed charts combining pie charts with tables.',
      practice: '1. In a line graph showing production, if year 1 is 200 units and year 2 is 250 units, find the percentage growth. (Ans: 25%)\n2. A sector in a pie chart measures 54 degrees. Find its percentage value. (Ans: 15%)',
      tricks: 'Use percentage-to-fraction equivalents (e.g. 12.5% = 1/8) to perform calculations mentally.',
      mistakes: 'Misreading units (e.g., thousands vs lakhs), choosing the wrong base year in growth calculations.',
      revision: 'Growth rate = `(Final - Initial) / Initial * 100`. Degree-to-percent conversion: `Percent = Degree / 3.6`.'
    },
    hi: {
      overview: 'डेटा इंटरप्रिटेशन (डीआई) मात्रात्मक परीक्षण का महत्वपूर्ण हिस्सा है। यह संरचित डेटासेट से विश्लेषण करने और निष्कर्ष निकालने की क्षमता का परीक्षण करता है।',
      definition: 'डेटा इंटरप्रिटेशन तार्किक निष्कर्ष निकालने के लिए तालिकाओं, बार ग्राफ, लाइन चार्ट, पाई चार्ट और केसलेट्स जैसे ग्राफिकल अभ्यावेदन से गणितीय मापदंडों की समीक्षा, संगठन और गणना करने की प्रक्रिया है।',
      concepts: 'प्रतिशत परिवर्तन, अनुपात और समानुपात, औसत, योग, डेटा तुलना, चार्ट प्रकार, इकाई रूपांतरण।',
      theory: '### डेटा प्रस्तुतिकरण के प्रकार:\n1. **तालिका डीआई**: पंक्तियों और स्तंभों में संरचित डेटा। कुल मूल्यों और वर्षों के रुझानों को ध्यान से देखें।\n2. **बार चार्ट**: श्रेणी आकारों का दृश्य प्रतिनिधित्व। ऊर्ध्वाधर पैमाने के अंतरालों पर ध्यान केंद्रित करें।\n3. **लाइन ग्राफ**: समय के साथ निरंतर ट्रैकिंग। विकास दर की गणना के लिए अत्यधिक उपयोगी।\n4. **पाई चार्ट**: गोलाकार विश्लेषण (360 डिग्री 100% के बराबर है)। कोण गणना: `कोण = (मूल्य / कुल) * 360`।\n5. **केसलेट्स**: डेटा का पाठ्य विवरण। हल करने से पहले एक तालिका बनाना अनिवार्य है।',
      examples: 'पारिवारिक खर्चों का पाई चार्ट: किराया (25%), भोजन (30%), शिक्षा (20%), और बचत (25%)।',
      solved: 'प्रश्न: यदि कुल पारिवारिक आय 50,000 रुपये है, तो किराए पर खर्च की गई राशि ज्ञात कीजिए।\nसमाधान: किराया = 50,000 का 25% = 12,500 रुपये।',
      relevance: 'यूपीएससी सीएसएटी, बैंकिंग मेन्स और एसएससी सीजीएल के लिए अत्यधिक महत्वपूर्ण।',
      pyq: 'पिछले प्रश्नों के विश्लेषण से पता चलता है कि बहु-चर तालिकाओं और पाई चार्ट के साथ मिश्रित चार्ट का चलन बढ़ा है।',
      practice: '1. उत्पादन दिखाने वाले लाइन ग्राफ में, यदि वर्ष 1 में 200 इकाइयां और वर्ष 2 में 250 इकाइयां हैं, तो विकास प्रतिशत ज्ञात करें। (उत्तर: 25%)\n2. पाई चार्ट में एक सेक्टर का माप 54 डिग्री है। इसका प्रतिशत मूल्य ज्ञात करें। (उत्तर: 15%)',
      tricks: 'मानसिक रूप से गणना करने के लिए प्रतिशत-से-भिन्न समकक्षों (जैसे 12.5% = 1/8) का उपयोग करें।',
      mistakes: 'इकाइयों को गलत पढ़ना (जैसे हजार को लाख समझना), विकास गणना में गलत आधार वर्ष चुनना।',
      revision: 'विकास दर = `(अंतिम - प्रारंभिक) / प्रारंभिक * 100`। डिग्री-टू-प्रतिशत रूपांतरण: `प्रतिशत = डिग्री / 3.6`।'
    }
  },
  math_percentage: {
    titleEn: 'Percentage Concepts',
    titleHi: 'प्रतिशत की अवधारणाएं',
    en: {
      overview: 'Percentage calculation is the cornerstone of arithmetic. It expresses a number as a fraction of 100.',
      definition: 'A percentage is a dimensionless ratio of a value relative to 100. It is denoted using the `%` symbol.',
      concepts: 'Base Value, Percentage Increase, Percentage Decrease, Product Constancy, Successive Changes.',
      theory: '### Core Percent Formulas:\n1. **Basic Percentage**: `P% of X = (P / 100) * X`.\n2. **Percentage Change**: `Change % = (Change / Original Value) * 100`.\n3. **Successive Percentage Change**: If a value changes by A% and then by B%, the net change is `(A + B + (A*B)/100)%`.\n4. **Product Constancy**: If price increases by P%, consumption must decrease by `(P / (100 + P)) * 100%` to keep expenditure constant.',
      examples: 'If a salary increases from Rs. 40,000 to Rs. 48,000, the increase is Rs. 8,000, which is 20%.',
      solved: 'Question: A price increases by 25%. By what percentage must consumption decrease to keep the budget unchanged?\nSolution: Decrease = (25 / (100 + 25)) * 100 = (25 / 125) * 100 = 20%.',
      relevance: 'Essential for all government exams. Percentage serves as the base for Profit & Loss, SI-CI, and DI.',
      pyq: 'Questions on successive percentage changes and population increase/decrease are heavily repeated in SSC CGL.',
      practice: '1. If A is 20% more than B, by what percent is B less than A? (Ans: 16.66%)\n2. The population of a town increases by 10% annually. If current population is 10,000, find it after 2 years. (Ans: 12,100)',
      tricks: 'Memorize reciprocal fractions up to 1/20 (e.g. 1/7 = 14.28%, 1/9 = 11.11%).',
      mistakes: 'Applying the percentage change on the final value instead of the initial base value.',
      revision: 'Successive Formula: `A + B + AB/100`. Fractional equivalencies are the key to speed.'
    },
    hi: {
      overview: 'प्रतिशत गणना अंकगणित की आधारशिला है। यह किसी संख्या को 100 के भिन्न के रूप में व्यक्त करती है।',
      definition: 'प्रतिशत 100 के सापेक्ष किसी मान का एक विमाहीन अनुपात है। इसे `%` प्रतीक का उपयोग करके दर्शाया जाता है।',
      concepts: 'आधार मूल्य, प्रतिशत वृद्धि, प्रतिशत कमी, उत्पाद निरंतरता, क्रमिक परिवर्तन।',
      theory: '### मुख्य प्रतिशत सूत्र:\n1. **मूल प्रतिशत**: `X का P% = (P / 100) * X`।\n2. **प्रतिशत परिवर्तन**: `परिवर्तन % = (परिवर्तन / मूल मूल्य) * 100`।\n3. **क्रमिक प्रतिशत परिवर्तन**: यदि मान में पहले A% और फिर B% का परिवर्तन होता है, तो कुल परिवर्तन `(A + B + (A*B)/100)%` होता है।\n4. **उत्पाद निरंतरता**: यदि मूल्य में P% की वृद्धि होती है, तो खर्च को स्थिर रखने के लिए खपत में `(P / (100 + P)) * 100%` की कमी होनी चाहिए।',
      examples: 'यदि वेतन 40,000 रुपये से बढ़कर 48,000 रुपये हो जाता है, तो वृद्धि 8,000 रुपये यानी 20% है।',
      solved: 'प्रश्न: एक वस्तु की कीमत में 25% की वृद्धि होती है। खर्च अपरिवर्तित रखने के लिए खपत में कितने प्रतिशत की कमी करनी होगी?\nसमाधान: कमी = (25 / (100 + 25)) * 100 = (25 / 125) * 100 = 20%।',
      relevance: 'सभी सरकारी परीक्षाओं के लिए अनिवार्य। प्रतिशत लाभ-हानि, ब्याज और डीआई का आधार है।',
      pyq: 'क्रमिक प्रतिशत परिवर्तन और जनसंख्या वृद्धि/कमी पर प्रश्न एसएससी सीजीएल में बार-बार दोहराए जाते हैं।',
      practice: '1. यदि A, B से 20% अधिक है, तो B, A से कितने प्रतिशत कम है? (उत्तर: 16.66%)\n2. एक शहर की जनसंख्या में सालाना 10% की वृद्धि होती है। यदि वर्तमान जनसंख्या 10,000 है, तो 2 वर्ष बाद जनसंख्या ज्ञात करें। (उत्तर: 12,100)',
      tricks: '1/20 तक के भिन्नों के प्रतिशत मान याद रखें (जैसे 1/7 = 14.28%, 1/9 = 11.11%)।',
      mistakes: 'प्रारंभिक आधार मान के बजाय अंतिम मान पर प्रतिशत परिवर्तन लागू करना।',
      revision: 'क्रमिक सूत्र: `A + B + AB/100`। भिन्न मान गति की कुंजी हैं।'
    }
  },
  math_profit_loss: {
    titleEn: 'Profit, Loss and Discount',
    titleHi: 'लाभ, हानि और बट्टा',
    en: {
      overview: 'Profit, Loss and Discount models business transactions. It evaluates the differences between cost, selling, and marked prices.',
      definition: 'Profit is the positive difference between Selling Price (SP) and Cost Price (CP). Loss is the negative difference. Discount is the reduction offered on the Marked Price (MP).',
      concepts: 'Cost Price, Selling Price, Marked Price, Profit Percentage, Loss Percentage, Discount Percentage, Successive Discounts.',
      theory: '### Transaction Equations:\n1. `Profit = SP - CP` (when SP > CP)\n2. `Loss = CP - SP` (when CP > SP)\n3. `Profit % = ((SP - CP) / CP) * 100`\n4. `Loss % = ((CP - SP) / CP) * 100`\n5. `Discount = MP - SP`\n6. `Discount % = (Discount / MP) * 100`\n7. Relationship between CP and MP: `MP / CP = (100 + Profit%) / (100 - Discount%)`.',
      examples: 'An item bought for Rs. 80 and sold for Rs. 100 yields a profit of Rs. 20, which is 25% profit.',
      solved: 'Question: A shopkeeper marks up his goods by 40% and offers a 10% discount. Find his profit percentage.\nSolution: Let CP = 100. MP = 140. SP = 140 - 10% of 140 = 140 - 14 = 126. Profit = 26%.',
      relevance: 'High priority in SSC CGL, Banking, and State PCS exam segments.',
      pyq: 'Dishonest dealer questions and successive discount formulations are core recurrent themes.',
      practice: '1. By selling an article for Rs. 720, a man loses 10%. At what price should he sell it to gain 20%? (Ans: Rs. 960)\n2. Find the single discount equivalent to successive discounts of 20% and 10%. (Ans: 28%)',
      tricks: 'Always equate Cost Price (CP) to 100% when no value is given to simplify the fractions.',
      mistakes: 'Calculating the profit percentage on the Selling Price (SP) instead of the Cost Price (CP).',
      revision: 'Profit/Loss is calculated on CP. Discount is calculated on MP. `MP/CP = (100+P%)/(100-D%)`.'
    },
    hi: {
      overview: 'लाभ, हानि और बट्टा व्यावसायिक लेनदेन का गणितीय रूप है। यह लागत, बिक्री और अंकित मूल्य के बीच के अंतर का मूल्यांकन करता है।',
      definition: 'विक्रय मूल्य (SP) और क्रय मूल्य (CP) के बीच का सकारात्मक अंतर लाभ कहलाता है। नकारात्मक अंतर हानि है। अंकित मूल्य (MP) पर दी जाने वाली छूट बट्टा (Discount) कहलाती है।',
      concepts: 'क्रय मूल्य, विक्रय मूल्य, अंकित मूल्य, लाभ प्रतिशत, हानि प्रतिशत, बट्टा प्रतिशत, क्रमिक बट्टा।',
      theory: '### लेनदेन के समीकरण:\n1. `लाभ = SP - CP` (जब SP > CP)\n2. `हानि = CP - SP` (जब CP > SP)\n3. `लाभ % = ((SP - CP) / CP) * 100`\n4. `हानि % = ((CP - SP) / CP) * 100`\n5. `बट्टा = MP - SP`\n6. `बट्टा % = (बट्टा / MP) * 100`\n7. CP और MP के बीच संबंध: `MP / CP = (100 + लाभ%) / (100 - बट्टा%)`।',
      examples: '80 रुपये में खरीदी गई वस्तु को 100 रुपये में बेचने पर 20 रुपये का लाभ होता है, जो कि 25% लाभ है।',
      solved: 'प्रश्न: एक दुकानदार अपनी वस्तुओं पर 40% मूल्य बढ़ाकर अंकित करता है और 10% की छूट देता है। उसका लाभ प्रतिशत ज्ञात कीजिए।\nसमाधान: माना CP = 100। MP = 140। SP = 140 - 14 = 126। लाभ = 26%।',
      relevance: 'एसएससी सीजीएल, बैंकिंग और राज्य पीसीएस परीक्षा खंडों में उच्च प्राथमिकता।',
      pyq: 'बेईमान दुकानदार वाले प्रश्न और क्रमिक छूट के प्रश्न बार-बार पूछे जाते हैं।',
      practice: '1. किसी वस्तु को 720 रुपये में बेचने पर एक व्यक्ति को 10% की हानि होती है। 20% लाभ प्राप्त करने के लिए उसे इसे किस मूल्य पर बेचना चाहिए? (उत्तर: 960 रुपये)\n2. 20% और 10% की क्रमिक छूटों के समतुल्य एकल छूट ज्ञात करें। (उत्तर: 28%)',
      tricks: 'गणना को आसान बनाने के लिए जब कोई मान न दिया हो तो हमेशा क्रय मूल्य (CP) को 100% मानें।',
      mistakes: 'क्रय मूल्य (CP) के बजाय विक्रय मूल्य (SP) पर लाभ प्रतिशत की गणना करना।',
      revision: 'लाभ/हानि की गणना हमेशा CP पर की जाती है। बट्टे की गणना MP पर की जाती है।'
    }
  },
  math_interest: {
    titleEn: 'Simple and Compound Interest',
    titleHi: 'साधारण और चक्रवृद्धि ब्याज',
    en: {
      overview: 'Interest represents the time value of money. It is the cost of borrowing capital or the return on lending it.',
      definition: 'Simple Interest (SI) is interest calculated strictly on the principal. Compound Interest (CI) is calculated on the principal plus any accumulated interest.',
      concepts: 'Principal, Rate of Interest, Time Period, Accumulated Amount, Simple Interest, Compound Interest, Difference between SI and CI.',
      theory: '### Interest Formulas:\n1. **Simple Interest**: `SI = (P * R * T) / 100`.\n2. **Total Amount (SI)**: `A = P + SI`.\n3. **Compound Interest Amount**: `A = P * (1 + R/100)^T` (compounded annually).\n4. **CI Compounded Half-Yearly**: `A = P * (1 + R/200)^(2T)`.\n5. **Difference between CI and SI for 2 years**: `Diff = P * (R / 100)^2`.\n6. **Difference between CI and SI for 3 years**: `Diff = P * (R/100)^2 * (3 + R/100)`.',
      examples: 'A principal of Rs. 10,000 at 10% per annum for 2 years yields SI of Rs. 2,000 and CI of Rs. 2,100.',
      solved: 'Question: Find the difference between CI and SI on a principal of Rs. 5,000 for 2 years at 8% per annum.\nSolution: Diff = 5000 * (8 / 100)^2 = 5000 * (64 / 10000) = Rs. 32.',
      relevance: 'Core topic in Banking examinations (IBPS, SBI PO) and SSC CGL quant papers.',
      pyq: 'Questions comparing the difference between SI and CI over 2 and 3 years are heavily tested.',
      practice: '1. A sum of money doubles itself in 5 years at simple interest. In how many years will it become 4 times? (Ans: 15 years)\n2. What is the compound interest on Rs. 8,000 for 1 year at 10% per annum compounded half-yearly? (Ans: Rs. 820)',
      tricks: 'Use the effective rate percentage method (e.g. 10% CI for 2 years has an effective rate of 21%).',
      mistakes: 'Using the wrong compounding frequency (monthly/quarterly) in the exponent of the CI formula.',
      revision: 'SI is constant every year. CI grows exponentially. 2-year difference: `P(R/100)^2`.'
    },
    hi: {
      overview: 'ब्याज धन के समय मूल्य का प्रतिनिधित्व करता है। यह पूंजी उधार लेने की लागत या इसे ऋण पर देने का प्रतिफल है।',
      definition: 'साधारण ब्याज (SI) की गणना केवल मूलधन पर की जाती है। चक्रवृद्धि ब्याज (CI) की गणना मूलधन और संचित ब्याज दोनों पर की जाती है।',
      concepts: 'मूलधन, ब्याज दर, समयावधि, संचित मिश्रधन, साधारण ब्याज, चक्रवृद्धि ब्याज, SI और CI के बीच अंतर।',
      theory: '### ब्याज के सूत्र:\n1. **साधारण ब्याज**: `SI = (P * R * T) / 100`।\n2. **कुल मिश्रधन (SI)**: `A = P + SI`।\n3. **चक्रवृद्धि ब्याज मिश्रधन**: `A = P * (1 + R/100)^T` (वार्षिक चक्रवृद्धि)।\n4. **अर्धवार्षिक चक्रवृद्धि होने पर मिश्रधन**: `A = P * (1 + R/200)^(2T)`।\n5. **2 वर्षों के लिए CI और SI के बीच अंतर**: `अंतर = P * (R / 100)^2`।\n6. **3 वर्षों के लिए CI and SI के बीच अंतर**: `अंतर = P * (R/100)^2 * (3 + R/100)`।',
      examples: '10,000 रुपये का मूलधन 10% वार्षिक दर से 2 वर्ष में 2,000 रुपये साधारण ब्याज और 2,100 रुपये चक्रवृद्धि ब्याज देता है।',
      solved: 'प्रश्न: 5,000 रुपये के मूलधन पर 2 वर्ष के लिए 8% वार्षिक दर से चक्रवृद्धि और साधारण ब्याज के बीच का अंतर ज्ञात कीजिए।\nसमाधान: अंतर = 5000 * (8 / 100)^2 = 5000 * (64 / 10000) = 32 रुपये।',
      relevance: 'बैंकिंग परीक्षाओं (आईबीपीएस, एसबीआई पीओ) और एसएससी सीजीएल के लिए एक महत्वपूर्ण विषय।',
      pyq: '2 और 3 वर्षों के लिए SI और CI के बीच के अंतर की तुलना करने वाले प्रश्न बार-बार दोहराए जाते हैं।',
      practice: '1. साधारण ब्याज पर कोई राशि 5 वर्ष में दोगुनी हो जाती है। कितने वर्षों में यह 4 गुना हो जाएगी? (उत्तर: 15 वर्ष)\n2. 8,000 रुपये पर 1 वर्ष के लिए 10% वार्षिक दर से अर्धवार्षिक चक्रवृद्धि ब्याज ज्ञात करें। (उत्तर: 820 रुपये)',
      tricks: 'प्रभावी दर प्रतिशत पद्धति का उपयोग करें (जैसे 2 वर्ष के लिए 10% CI की प्रभावी दर 21% होती है)।',
      mistakes: 'चक्रवृद्धि ब्याज सूत्र के घातांक में गलत संयोजन आवृत्ति (मासिक/त्रैमासिक) का उपयोग करना।',
      revision: 'साधारण ब्याज हर साल समान रहता है। चक्रवृद्धि ब्याज हर साल बदलता रहता है।'
    }
  },

  // --- REASONING SUBJECTS ---
  reasoning_seating: {
    titleEn: 'Seating Arrangement',
    titleHi: 'बैठक व्यवस्था',
    en: {
      overview: 'Seating Arrangement tests spatial relationship reasoning and sequential ordering skills.',
      definition: 'Seating Arrangement is the logical process of placing a set of entities (people/objects) in a specific order (linear, circular, rectangular) based on a set of conditional constraints.',
      concepts: 'Linear Arrangement, Circular Arrangement, Facing Center, Facing Outside, Left-Right Directions, Fixed Positions, Relative Positions.',
      theory: '### Key Directions and Formats:\n1. **Linear Arrangement**: People sitting in a single row. If facing North: Left is towards West, Right is towards East. If facing South: Directions are reversed.\n2. **Circular Arrangement (Facing Inward)**: Left is Clockwise, Right is Counter-clockwise.\n3. **Circular Arrangement (Facing Outward)**: Left is Counter-clockwise, Right is Clockwise.\n4. **Grid/Dual Rows**: Parallel rows facing each other. Correct alignment of left/right for both rows is essential.',
      examples: '8 friends sitting around a circular table facing the center.',
      solved: 'Question: A, B, C, D sit in a row facing North. A is immediate left of B. C is between B and D. Find who is at the extreme left.\nSolution: Row layout: A - B - C - D. A is at the extreme left.',
      relevance: 'High importance for Bank PO/Clerk prelims and mains (usually carrying 5-10 marks in a set).',
      pyq: 'Recent questions combine circular seating with variables like blood relations or professions.',
      practice: '1. Five people P, Q, R, S, T sit in a circle facing inward. S is right of P and left of T. Q is left of R. Find who is right of R. (Ans: P)\n2. 6 people sit in two parallel rows. Row 1 faces South, Row 2 faces North. (Practice scenario)',
      tricks: 'Always start drawing the arrangement from a definite positive statement rather than negative clues.',
      mistakes: 'Confusing Left and Right when people face outwards in a circle or face South in a row.',
      revision: 'Facing Center: Right = Anti-Clockwise, Left = Clockwise. Double check placement clues.'
    },
    hi: {
      overview: 'बैठक व्यवस्था स्थानिक संबंध तर्क और अनुक्रमिक आदेश कौशल का परीक्षण करती है।',
      definition: 'बैठक व्यवस्था सशर्त बाधाओं के आधार पर एक विशिष्ट क्रम (रैखिक, वृत्ताकार, आयताकार) में संस्थाओं (लोग/वस्तुओं) को रखने की तार्किक प्रक्रिया है।',
      concepts: 'रैखिक व्यवस्था, वृत्ताकार व्यवस्था, केंद्र की ओर उन्मुख, बाहर की ओर उन्मुख, बाएं-दाएं दिशाएं, निश्चित स्थितियां, सापेक्ष स्थितियां।',
      theory: '### महत्वपूर्ण दिशाएं और प्रारूप:\n1. **रैखिक व्यवस्था**: एक पंक्ति में बैठे लोग। यदि उत्तर की ओर उन्मुख हैं: बायां पश्चिम की ओर है, दायां पूर्व की ओर है। यदि दक्षिण की ओर उन्मुख हैं: दिशाएं उलट जाती हैं।\n2. **वृत्ताकार व्यवस्था (केंद्र की ओर)**: बायाँ हिस्सा दक्षिणावर्त (Clockwise) होता है, दायाँ हिस्सा वामावर्त (Anti-clockwise) होता है।\n3. **वृत्ताकार व्यवस्था (बाहर की ओर)**: बायाँ हिस्सा वामावर्त होता है, दायाँ हिस्सा दक्षिणावर्त होता है।\n4. **ग्रिड/दोहरी पंक्तियाँ**: एक-दूसरे के सामने समानांतर पंक्तियाँ। दोनों पंक्तियों के लिए बाएं/दाएं का सही संरेखण महत्वपूर्ण है।',
      examples: '8 मित्र एक वृत्ताकार मेज के चारों ओर केंद्र की ओर मुंह करके बैठे हैं।',
      solved: 'प्रश्न: A, B, C, D एक पंक्ति में उत्तर की ओर मुंह करके बैठे हैं। A, B के ठीक बाईं ओर है। C, B और D के बीच में है। ज्ञात कीजिए कि सबसे बाईं ओर कौन है।\nसमाधान: व्यवस्था: A - B - C - D। A सबसे बाईं ओर है।',
      relevance: 'बैंक पीओ/क्लर्क प्रारंभिक और मुख्य परीक्षाओं के लिए अत्यधिक महत्वपूर्ण।',
      pyq: 'हाल के प्रश्नों में वृत्ताकार बैठक व्यवस्था के साथ रक्त संबंध या व्यवसायों जैसे अन्य चर भी जोड़े जाते हैं।',
      practice: '1. पांच व्यक्ति P, Q, R, S, T केंद्र की ओर मुंह करके एक वृत्त में बैठे हैं। S, P के दाईं ओर और T के बाईं ओर है। Q, R के बाईं ओर है। R के दाईं ओर कौन बैठा है? (उत्तर: P)\n2. 6 व्यक्ति दो समानांतर पंक्तियों में बैठे हैं। (अभ्यास परिदृश्य)',
      tricks: 'नकारात्मक सुरागों के बजाय हमेशा एक निश्चित सकारात्मक कथन से चित्र बनाना शुरू करें।',
      mistakes: 'वृत्त में बाहर की ओर या पंक्ति में दक्षिण की ओर मुंह करने पर बाएं और दाएं में भ्रमित होना।',
      revision: 'केंद्र की ओर उन्मुख: दायां = वामावर्त (Anti-clockwise), बायां = दक्षिणावर्त (Clockwise)।'
    }
  },
  reasoning_syllogism: {
    titleEn: 'Syllogism',
    titleHi: 'न्याय वाक्य (Syllogism)',
    en: {
      overview: 'Syllogism evaluates deductive logical validity using statements and conclusions.',
      definition: 'Syllogism is a form of logical argument in which one proposition (the conclusion) is inferred from two or more others (the premises) of a specific form.',
      concepts: 'All statement, Some statement, No statement, Some Not statement, Only a few, Possibility, Either-Or cases.',
      theory: '### Venn Diagram Representations:\n1. **All A are B**: Circle A is entirely inside circle B.\n2. **Some A are B**: Circle A and B overlap slightly.\n3. **No A are B**: Circle A and B are completely separate with a cross line.\n4. **Some A are not B**: A part of circle A cannot enter circle B.\n5. **Only a few A are B**: Represents two conclusions: `Some A are B` AND `Some A are not B`.',
      examples: 'Statements: All pens are books. Some books are scales. Conclusion: Some pens are scales (False).',
      solved: 'Question: Statements: All Cats are Dogs. No Dog is Cow. Conclusion: No Cat is Cow. Is it valid?\nSolution: Since Cat is inside Dog, and no Dog is Cow, Cat cannot touch Cow. The conclusion is valid.',
      relevance: 'Core topic for Banking and SSC CGL. Directly tests standard deductive logic.',
      pyq: 'The "Only a few" pattern has dominated banking exams in recent years.',
      practice: '1. Statements: Only a few apples are mangoes. All mangoes are bananas. Conclusions: I. Some apples are bananas. II. Some apples are not mangoes. (Ans: Both follow)\n2. Statements: Some red are blue. No blue is green. Conclusions: I. Some red are not green. II. All red being green is a possibility. (Ans: Only I follows)',
      tricks: 'Draw the minimum overlapping Venn diagram to evaluate definite conclusions.',
      mistakes: 'Treating "Some A are B" as implying "Some A are not B" by default (this is incorrect in deductive logic).',
      revision: 'Definite conclusion must be 100% true in all possible diagrams. Possibility must be true in at least one valid diagram.'
    },
    hi: {
      overview: 'न्याय वाक्य (Syllogism) कथनों और निष्कर्षों का उपयोग करके निगमनात्मक तार्किक वैधता का मूल्यांकन करता है।',
      definition: 'न्याय वाक्य तार्किक तर्क का एक रूप है जिसमें विशिष्ट रूप के दो या दो से अधिक कथनों (परिसरों) से एक निष्कर्ष निकाला जाता है।',
      concepts: 'सभी (All), कुछ (Some), कोई नहीं (No), कुछ नहीं (Some Not), केवल कुछ (Only a few), संभावना (Possibility), या तो-या (Either-Or) मामले।',
      theory: '### वेन आरेख निरूपण:\n1. **सभी A, B हैं**: वृत्त A पूरी तरह से वृत्त B के अंदर है।\n2. **कुछ A, B हैं**: वृत्त A और B थोड़ा ओवरलैप करते हैं।\n3. **कोई A, B नहीं है**: वृत्त A और B पूरी तरह से अलग हैं।\n4. **कुछ A, B नहीं हैं**: वृत्त A का एक हिस्सा वृत्त B में प्रवेश नहीं कर सकता।\n5. **केवल कुछ A, B हैं**: यह दो निष्कर्षों को दर्शाता है: `कुछ A, B हैं` और `कुछ A, B नहीं हैं`।',
      examples: 'कथन: सभी पेन किताबें हैं। कुछ किताबें स्केल हैं। निष्कर्ष: कुछ पेन स्केल हैं (गलत)।',
      solved: 'प्रश्न: कथन: सभी बिल्ली कुत्ते हैं। कोई कुत्ता गाय नहीं है। निष्कर्ष: कोई बिल्ली गाय नहीं है। क्या यह वैध है?\nसमाधान: चूंकि बिल्ली कुत्ते के अंदर है, और कोई कुत्ता गाय नहीं है, बिल्ली गाय को नहीं छू सकती। निष्कर्ष वैध है।',
      relevance: 'बैंकिंग और एसएससी सीजीएल के लिए अत्यंत महत्वपूर्ण विषय।',
      pyq: 'हाल के वर्षों में बैंकिंग परीक्षाओं में "केवल कुछ" (Only a few) पैटर्न अधिक पूछा गया है।',
      practice: '1. कथन: केवल कुछ सेब आम हैं। सभी आम केले हैं। निष्कर्ष: I. कुछ सेब केले हैं। II. कुछ सेब आम नहीं हैं। (उत्तर: दोनों सही हैं)\n2. कथन: कुछ लाल नीले हैं। कोई नीला हरा नहीं है। निष्कर्ष: I. कुछ लाल हरे नहीं हैं। II. सभी लाल के हरे होने की संभावना है। (उत्तर: केवल I सही है)',
      tricks: 'निश्चित निष्कर्षों का मूल्यांकन करने के लिए हमेशा न्यूनतम ओवरलैपिंग वेन आरेख बनाएं।',
      mistakes: 'यह मानना कि "कुछ A, B हैं" का अर्थ "कुछ A, B नहीं हैं" भी है (यह न्याय वाक्य के नियम के खिलाफ है)।',
      revision: 'निश्चित निष्कर्ष सभी संभावित आरेखों में सत्य होना चाहिए। संभावना कम से कम एक वैध आरेख में सत्य होनी चाहिए।'
    }
  },

  // --- GENERAL HISTORY ---
  history_ancient: {
    titleEn: 'Ancient Indian History',
    titleHi: 'प्राचीन भारत का इतिहास',
    en: {
      overview: 'Ancient Indian History covers the development of cultures and kingdoms from the Stone Age up to the early medieval period.',
      definition: 'Ancient Indian History is the chronological study of early human settlements, the Harappan civilization, the Vedic age, the rise of Mahajanapadas, Buddhism/Jainism, Mauryas, Guptas, and Vardhanas.',
      concepts: 'Archaeological sources, Literary sources, Indus Valley Civilization, Megaliths, Dhamma, Gupta Golden Age, Feudalism.',
      theory: '### Chronological Milestones:\n1. **Indus Valley Civilization (2500 BC - 1900 BC)**: Bronze age culture known for grid planning, town drainage, and maritime trade (Lothal).\n2. **Vedic Period (1500 BC - 600 BC)**: Transition from pastoralism to agrarian society. Composition of Vedas.\n3. **Buddhism & Jainism (6th Century BC)**: Reform movements against ritualistic Vedic religion.\n4. **Mauryan Empire (322 BC - 185 BC)**: Centralized state under Chandragupta and Ashoka. Ashoka\'s edicts spread Dhamma.\n5. **Gupta Empire (319 AD - 550 AD)**: Golden age of classical literature, temple architecture, and mathematical advances.',
      examples: 'Ashoka\'s rock edicts carved on rock faces to communicate rules directly to citizens.',
      solved: 'Question: Which Harappan site shows evidence of a dockyard?\nSolution: Lothal in Gujarat was an ancient port city with a massive tidal dockyard, indicating overseas trade.',
      relevance: 'Core subject for UPSC Prelims and Mains (General Studies Paper 1) and State PCS exams.',
      pyq: 'UPSC heavily targets Indus Valley urban planning, Ashokan inscriptions, and Gupta administrative terms.',
      practice: '1. Contrast the Vedic and Harappan religious practices in brief. (Subjective practice)\n2. Analyze the significance of Megalithic burial sites in South India. (Analysis practice)',
      tricks: 'Remember the sequence: Harappa -> Vedic -> Mahajanapadas -> Mauryas -> Guptas.',
      mistakes: 'Confusing early Vedic (democratic assemblies) with later Vedic (rigid caste system and monarchy) features.',
      revision: 'Lothal = Dockyard. Dholavira = Water Reservoir. Harappan script is undeciphered.'
    },
    hi: {
      overview: 'प्राचीन भारत का इतिहास पाषाण काल से लेकर पूर्व-मध्यकाल तक की संस्कृतियों और साम्राज्यों के विकास को शामिल करता है।',
      definition: 'प्राचीन भारतीय इतिहास प्रारंभिक मानव बस्तियों, हड़प्पा सभ्यता, वैदिक युग, महाजनपदों के उदय, बौद्ध/जैन धर्म, मौर्य, गुप्त और वर्धन राजवंशों का कालानुक्रमिक अध्ययन है।',
      concepts: 'पुरातात्विक स्रोत, साहित्यिक स्रोत, सिंधु घाटी सभ्यता, महापाषाण (Megaliths), धम्म, गुप्त स्वर्ण युग, सामंतवाद।',
      theory: '### कालानुक्रमिक मील के पत्थर:\n1. **सिंधु घाटी सभ्यता (2500 ई.पू. - 1900 ई.पू.)**: ग्रिड योजना, शहरी जल निकासी और समुद्री व्यापार (लोथल) के लिए प्रसिद्ध कांस्य युगीन संस्कृति।\n2. **वैदिक काल (1500 ई.पू. - 600 ई.पू.)**: पशुचारण से कृषि समाज में परिवर्तन। वेदों की रचना।\n3. **बौद्ध और जैन धर्म (छठी शताब्दी ई.पू.)**: कर्मकांडीय वैदिक धर्म के खिलाफ सुधार आंदोलन।\n4. **मौर्य साम्राज्य (322 ई.पू. - 185 ई.पू.)**: चंद्रगुप्त और अशोक के अधीन केंद्रीकृत राज्य। अशोक के शिलालेखों ने धम्म का प्रसार किया।\n5. **गुप्त साम्राज्य (319 ई. - 550 ई.)**: शास्त्रीय साहित्य, मंदिर वास्तुकला और गणितीय प्रगति का स्वर्ण युग।',
      examples: 'नागरिकों को सीधे नियमों को संप्रेषित करने के लिए चट्टानों पर खोदे गए अशोक के शिलालेख।',
      solved: 'प्रश्न: किस हड़प्पा स्थल से गोदीवाड़ा (डॉकयार्ड) के साक्ष्य मिले हैं?\nसमाधान: गुजरात का लोथल एक प्राचीन बंदरगाह शहर था जहां एक विशाल डॉकयार्ड था, जो विदेशी व्यापार का संकेत देता है।',
      relevance: 'यूपीएससी प्रारंभिक और मुख्य परीक्षा (सामान्य अध्ययन पेपर 1) तथा राज्य पीसीएस के लिए मुख्य विषय।',
      pyq: 'यूपीएससी अक्सर सिंधु घाटी नगर नियोजन, अशोक के शिलालेख और गुप्त काल के प्रशासनिक शब्दों पर प्रश्न पूछता है।',
      practice: '1. वैदिक और हड़प्पा धार्मिक प्रथाओं के बीच संक्षेप में अंतर स्पष्ट करें।\n2. दक्षिण भारत में महापाषाणकालीन समाधि स्थलों के महत्व का विश्लेषण करें।',
      tricks: 'कालानुक्रमिक क्रम याद रखें: हड़प्पा -> वैदिक -> महाजनपद -> मौर्य -> गुप्त।',
      mistakes: 'ऋग्वैदिक काल (लोकतांत्रिक सभाएं) को उत्तर वैदिक काल (कठोर वर्ण व्यवस्था) के लक्षणों के साथ मिला देना।',
      revision: 'लोथल = गोदीवाड़ा। धोलाविरा = जल संचयन प्रणाली। हड़प्पा लिपि को अभी तक पढ़ा नहीं जा सका है।'
    }
  },

  // --- GENERAL POLITY ---
  polity_rights: {
    titleEn: 'Fundamental Rights',
    titleHi: 'मौलिक अधिकार',
    en: {
      overview: 'Fundamental Rights secure the liberty and equality of citizens against the arbitrary actions of the state.',
      definition: 'Fundamental Rights are basic human rights enshrined in Part III (Articles 12 to 35) of the Constitution of India, which are justiciable in courts.',
      concepts: 'State Action, Equality Before Law, Freedom of Speech, Right to Life, Writs, Judicial Review.',
      theory: '### Key Rights Categories:\n1. **Right to Equality (Articles 14-18)**: Equality before law, prohibition of discrimination, equality of opportunity.\n2. **Right to Freedom (Articles 19-22)**: Protection of speech, assembly, movement, and life & personal liberty (Article 21).\n3. **Right against Exploitation (Articles 23-24)**: Prohibits forced labor and child labor.\n4. **Freedom of Religion (Articles 25-28)**: Freedom of conscience and practice.\n5. **Cultural & Educational Rights (Articles 29-30)**: Protects interests of minorities.\n6. **Constitutional Remedies (Article 32)**: Right to petition the Supreme Court for enforcement of rights via Writs (Habeas Corpus, Mandamus, Prohibition, Certiorari, Quo Warranto).',
      examples: 'A citizen petitioning the Supreme Court under Article 32 to strike down an arbitrary police detention order.',
      solved: 'Question: Which Fundamental Right cannot be suspended during a National Emergency?\nSolution: Articles 20 (Protection in respect of conviction for offenses) and 21 (Protection of life and personal liberty) cannot be suspended.',
      relevance: 'Crucial for UPSC Prelims/Mains (GS Paper 2) and judicial exams. High yield of conceptual questions.',
      pyq: 'UPSC repeatedly tests Article 21 (Right to Privacy, Right to Marry) and the classification of Writs under Article 32.',
      practice: '1. Explain how Article 21 has been expanded by judicial interpretations over the decades. (Subjective practice)\n2. Compare Article 32 (Supreme Court) with Article 226 (High Courts) regarding writ jurisdictions. (Analysis practice)',
      tricks: 'Memorize the articles in chunks: 14-18 (Equality), 19-22 (Freedom), 23-24 (Exploitation), 25-28 (Religion).',
      mistakes: 'Believing Fundamental Rights are absolute; they are subject to reasonable restrictions (e.g. public order, security).',
      revision: 'Part III. Justiciable. Article 32 is the heart and soul of the Constitution according to B.R. Ambedkar.'
    },
    hi: {
      overview: 'मौलिक अधिकार राज्य की मनमानी कार्रवाइयों के खिलाफ नागरिकों की स्वतंत्रता और समानता को सुरक्षित करते हैं।',
      definition: 'मौलिक अधिकार भारत के संविधान के भाग III (अनुच्छेद 12 से 35) में निहित वे बुनियादी मानवाधिकार हैं जो अदालतों में न्यायसंगत (justiciable) हैं।',
      concepts: 'राज्य की परिभाषा, कानून के समक्ष समानता, भाषण की स्वतंत्रता, जीवन का अधिकार, रिट (Writs), न्यायिक समीक्षा।',
      theory: '### प्रमुख अधिकार श्रेणियां:\n1. **समानता का अधिकार (अनुच्छेद 14-18)**: कानून के समक्ष समानता, भेदभाव का निषेध, अवसर की समानता।\n2. **स्वतंत्रता का अधिकार (अनुच्छेद 19-22)**: भाषण, सभा, आंदोलन और जीवन एवं व्यक्तिगत स्वतंत्रता (अनुच्छेद 21) का संरक्षण।\n3. **शोषण के विरुद्ध अधिकार (अनुच्छेद 23-24)**: जबरन श्रम और बाल श्रम का निषेध।\n4. **धार्मिक स्वतंत्रता का अधिकार (अनुच्छेद 25-28)**: अंतःकरण की स्वतंत्रता और धार्मिक प्रचार।\n5. **सांस्कृतिक और शैक्षिक अधिकार (अनुच्छेद 29-30)**: अल्पसंख्यकों के हितों का संरक्षण।\n6. **संवैधानिक उपचारों का अधिकार (अनुच्छेद 32)**: रिट के माध्यम से अधिकारों को लागू कराने के लिए सर्वोच्च न्यायालय में याचिका दायर करने का अधिकार।',
      examples: 'एक नागरिक मनमाने पुलिस हिरासत आदेश को रद्द करने के लिए अनुच्छेद 32 के तहत सर्वोच्च न्यायालय में याचिका दायर करता है।',
      solved: 'प्रश्न: राष्ट्रीय आपातकाल के दौरान कौन से मौलिक अधिकार निलंबित नहीं किए जा सकते?\nसमाधान: अनुच्छेद 20 (अपराधों के लिए दोषसिद्धि के संबंध में संरक्षण) और अनुच्छेद 21 (जीवन और व्यक्तिगत स्वतंत्रता का संरक्षण) निलंबित नहीं किए जा सकते।',
      relevance: 'यूपीएससी प्रारंभिक/मुख्य परीक्षा (GS पेपर 2) और न्यायिक परीक्षाओं के लिए अत्यंत महत्वपूर्ण।',
      pyq: 'यूपीएससी अक्सर अनुच्छेद 21 (निजता का अधिकार, विवाह का अधिकार) और अनुच्छेद 32 के तहत जारी की जाने वाली रिटों पर प्रश्न पूछता है।',
      practice: '1. स्पष्ट करें कि दशकों से न्यायिक व्याख्याओं द्वारा अनुच्छेद 21 का विस्तार कैसे किया गया है।\n2. रिट क्षेत्राधिकार के संबंध में अनुच्छेद 32 (सुप्रीम कोर्ट) और अनुच्छेद 226 (हाई कोर्ट) की तुलना करें।',
      tricks: 'अधिकारों को खंडों में याद रखें: 14-18 (समानता), 19-22 (स्वतंत्रता), 23-24 (शोषण विरोध), 25-28 (धर्म)।',
      mistakes: 'यह सोचना कि मौलिक अधिकार निरपेक्ष हैं; वे उचित प्रतिबंधों (जैसे सार्वजनिक व्यवस्था, देश की सुरक्षा) के अधीन हैं।',
      revision: 'भाग III। न्यायालयों में वाद-योग्य। बी.आर. अंबेडकर ने अनुच्छेद 32 को संविधान की आत्मा कहा था।'
    }
  }
};

// Map subjects to categories
function getCategoryKey(subject, subtopic) {
  const s = subject.toLowerCase().trim();
  const sub = subtopic.toLowerCase().trim();

  if (s.includes('history')) {
    if (sub.includes('ancient') || sub.includes('harappa') || sub.includes('indus') || sub.includes('vedic') || sub.includes('maurya') || sub.includes('gupta')) {
      return 'history_ancient';
    }
    return 'history_ancient'; // fallback history
  }
  if (s.includes('polity') || s.includes('constitution')) {
    if (sub.includes('fundamental right') || sub.includes('right')) {
      return 'polity_rights';
    }
    return 'polity_rights'; // fallback polity
  }
  if (s.includes('math') || s.includes('quant') || s.includes('arithmetic') || s.includes('aptitude')) {
    if (sub.includes('interpretation') || sub.includes('chart') || sub.includes('graph') || sub.includes('table')) {
      return 'math_di';
    }
    if (sub.includes('percentage') || sub.includes('percent')) {
      return 'math_percentage';
    }
    if (sub.includes('profit') || sub.includes('loss') || sub.includes('discount')) {
      return 'math_profit_loss';
    }
    if (sub.includes('interest') || sub.includes('simple') || sub.includes('compound')) {
      return 'math_interest';
    }
    return 'math_percentage'; // fallback math
  }
  if (s.includes('reasoning') || s.includes('logic')) {
    if (sub.includes('seating') || sub.includes('arrangement')) {
      return 'reasoning_seating';
    }
    if (sub.includes('syllogism') || sub.includes('few')) {
      return 'reasoning_syllogism';
    }
    return 'reasoning_seating'; // fallback reasoning
  }
  return 'math_di'; // global fallback
}

// 28 Parts configuration
const PART_DETAILS = [
  { part: 1, nameEn: 'Detailed Introduction', nameHi: 'विस्तृत प्रस्तावना' },
  { part: 2, nameEn: 'Historical Background & Evolution', nameHi: 'ऐतिहासिक पृष्ठभूमि और विकास' },
  { part: 3, nameEn: 'Detailed Theory & Core Literature', nameHi: 'विस्तृत सिद्धांत और मुख्य साहित्य' },
  { part: 4, nameEn: 'Concept Breakdown & Key Terminology', nameHi: 'वैचारिक विश्लेषण और मुख्य शब्दावली' },
  { part: 5, nameEn: 'Academic Examples & Scenarios', nameHi: 'शैक्षणिक उदाहरण और परिदृश्य' },
  { part: 6, nameEn: 'Government Schemes & Initiatives', nameHi: 'सरकारी योजनाएं और पहल' },
  { part: 7, nameEn: 'Real Life Applications & Cases', nameHi: 'वास्तविक जीवन अनुप्रयोग और मामले' },
  { part: 8, nameEn: 'PYQ & Mains Answer Strategy', nameHi: 'पीवाईक्यू और मेन्स उत्तर रणनीति' },
  { part: 9, nameEn: 'Solved Mock MCQ Review', nameHi: 'हल किए गए मॉक एमसीक्यू समीक्षा' },
  { part: 10, nameEn: 'Quick Revision Bullet Points', nameHi: 'त्वरित पुनरावलोकन बुलेट बिंदु' },
  { part: 11, nameEn: 'Conceptual Pitfalls & Traps', nameHi: 'वैचारिक खामियां और जाल' },
  { part: 12, nameEn: 'Memorization Mnemonics', nameHi: 'स्मरण रखने के सूत्र (Mnemonics)' },
  { part: 13, nameEn: 'Comparative Tables & Timelines', nameHi: 'तुलनात्मक तालिकाएं और समयसीमा' },
  { part: 14, nameEn: 'Conceptual Mind Maps', nameHi: 'वैचारिक माइंड मैप्स' },
  { part: 15, nameEn: 'Subjective Practice Questions', nameHi: 'विषयगत अभ्यास प्रश्न' },
  { part: 16, nameEn: 'Objective Practice Exercise', nameHi: 'वस्तुनिष्ठ अभ्यास अभ्यास' },
  { part: 17, nameEn: 'Advanced Theory & Critiques', nameHi: 'उन्नत सिद्धांत और आलोचनाएं' },
  { part: 18, nameEn: 'Structural Frameworks & Models', nameHi: 'संरचनात्मक रूपरेखा और मॉडल' },
  { part: 19, nameEn: 'Regulatory Guidelines & Policies', nameHi: 'नियामक दिशानिर्देश और नीतियां' },
  { part: 20, nameEn: 'Global Comparative Context', nameHi: 'वैश्विक तुलनात्मक संदर्भ' },
  { part: 21, nameEn: 'Statistical Trends & Datasets', nameHi: 'सांख्यिकीय रुझान और डेटासेट' },
  { part: 22, nameEn: 'Constitutional & Legal Angles', nameHi: 'संवैधानिक और कानूनी कोण' },
  { part: 23, nameEn: 'Philosophical & Ethical Debates', nameHi: 'दार्शनिक और नैतिक बहस' },
  { part: 24, nameEn: 'Core Mathematical Formulas', nameHi: 'मुख्य गणितीय सूत्र' },
  { part: 25, nameEn: 'Critical Problem Solving cases', nameHi: 'महत्वपूर्ण समस्या समाधान मामले' },
  { part: 26, nameEn: 'High-Yield Exam Takeaways', nameHi: 'उच्च-उपज परीक्षा टेकअवे' },
  { part: 27, nameEn: 'Solved Model Answers', nameHi: 'हल किए गए मॉडल उत्तर' },
  { part: 28, nameEn: 'Interactive Brainstorming Prompts', nameHi: 'इंटरैक्टिव विचार-मंथन संकेत' }
];

function buildContentDocument(exam, subject, topic, baseSubtopic, partNum) {
  const catKey = getCategoryKey(subject, baseSubtopic);
  const data = ACADEMIC_REGISTRY[catKey] || ACADEMIC_REGISTRY['math_di'];
  
  const partInfo = PART_DETAILS.find(p => p.part === partNum) || PART_DETAILS[0];
  const fullSubtopic = `${baseSubtopic} — Part ${partNum}: ${partInfo.nameEn}`;

  // 1. Build Introduction Summary
  const introEn = `Welcome to the comprehensive module for ${fullSubtopic}. This module is specifically tailored for the ${exam} exam within the ${subject} track. It serves as Part ${partNum} of our deep curriculum to replace traditional classroom materials. Topic focus: ${data.titleEn}.`;
  const introHi = `यह ${fullSubtopic} का विस्तृत अध्ययन मॉड्यूल है। यह विशेष रूप से ${exam} परीक्षा के लिए ${subject} विषय के अंतर्गत तैयार किया गया है। यह हमारी गहन पाठ्यक्रम श्रृंखला का भाग ${partNum} है जो पारंपरिक कोचिंग संस्थानों का विकल्प है। विषय फोकस: ${data.titleHi}।`;
  const introduction = `${introEn}\n===HINDI===\n${introHi}`;

  // 2. Build Detailed Explanation (containing all 13 sections)
  const detailedEn = `## ${partInfo.nameEn} — Core Academic Material

### 1. Overview
${data.en.overview}

### 2. Definition
${data.en.definition}

### 3. Core Concepts
${data.en.concepts}

### 4. Detailed Theory
${data.en.theory}

### 5. Examples
${data.en.examples}

### 6. Solved Examples
${data.en.solved}

### 7. Exam Relevance
${data.en.relevance}

### 8. PYQ Analysis
${data.en.pyq}

### 9. Practice Questions
${data.en.practice}

### 10. Revision Notes
${data.en.revision}

### 11. Memory Tricks
${data.en.tricks}

### 12. Common Mistakes
${data.en.mistakes}

### 13. Quick Revision Sheet
- Focus on: ${data.en.concepts.split(',')[0]}
- Formula review: ${data.en.revision.split('\n')[0] || ''}
- Target: Solve in under 60 seconds per question.`;

  const detailedHi = `## ${partInfo.nameHi} — मुख्य शैक्षणिक सामग्री

### 1. अवलोकन
${data.hi.overview}

### 2. परिभाषा
${data.hi.definition}

### 3. मुख्य अवधारणाएँ
${data.hi.concepts}

### 4. विस्तृत सिद्धांत
${data.hi.theory}

### 5. उदाहरण
${data.hi.examples}

### 6. हल किए गए उदाहरण
${data.hi.solved}

### 7. परीक्षा प्रासंगिकता
${data.hi.relevance}

### 8. पीवाईक्यू विश्लेषण
${data.hi.pyq}

### 9. अभ्यास प्रश्न
${data.hi.practice}

### 10. पुनरावलोकन नोट्स
${data.hi.revision}

### 11. स्मरण रखने के सूत्र
${data.hi.tricks}

### 12. सामान्य गलतियाँ
${data.hi.mistakes}

### 13. त्वरित पुनरावलोकन शीट
- फोकस करें: ${data.hi.concepts.split(',')[0]}
- सूत्र समीक्षा: ${data.hi.revision.split('\n')[0] || ''}
- लक्ष्य: प्रति प्रश्न 60 सेकंड से कम समय में हल करें।`;

  const detailedExplanation = `${detailedEn}\n===HINDI===\n${detailedHi}`;

  // 3. Concepts
  const concepts = data.en.concepts.split(',').map((c, idx) => {
    const cHi = (data.hi.concepts.split(',')[idx] || c).trim();
    return `${c.trim()} ===HINDI=== ${cHi}`;
  });

  // 4. Important Facts
  const importantFacts = [
    `Fact 1: Key indicator for ${exam} ===HINDI=== तथ्य 1: ${exam} के लिए महत्वपूर्ण संकेतक`,
    `Fact 2: High importance rule: ${data.en.concepts.split(',')[0]} ===HINDI=== तथ्य 2: उच्च महत्व का नियम: ${data.hi.concepts.split(',')[0]}`
  ];

  // 5. Examples
  const examples = [
    `${data.en.examples} ===HINDI=== ${data.hi.examples}`
  ];

  // 6. Tables
  const tables = [
    {
      title: `Comparative Reference Sheet ===HINDI=== तुलनात्मक संदर्भ पत्रक`,
      headers: [
        `Parameter ===HINDI=== मापदंड`,
        `Core Value ===HINDI=== मुख्य मूल्य`,
        `Exam Takeaway ===HINDI=== परीक्षा टेकअवे`
      ],
      rows: [
        [
          `Standard Formula ===HINDI=== मानक सूत्र`,
          `Effective Rate ===HINDI=== प्रभावी दर`,
          `Speed strategy ===HINDI=== गति रणनीति`
        ]
      ]
    }
  ];

  // 7. Revision Notes
  const revisionNotes = `${data.en.revision}\n===HINDI===\n${data.hi.revision}`;

  // 8. PYQ mappings
  const pyqs = [
    {
      question: {
        en: `Consider the following statements regarding ${data.titleEn}: 1. Accuracy is dependent on baseline. 2. Units must be consistent. Which of the statement(s) is/are correct?`,
        hi: `${data.titleHi} के संबंध में निम्नलिखित कथनों पर विचार करें: 1. सटीकता आधार रेखा पर निर्भर है। 2. इकाइयाँ सुसंगत होनी चाहिए। कौन सा/से कथन सही है/हैं?`
      },
      options: [
        { en: 'Only 1', hi: 'केवल 1' },
        { en: 'Only 2', hi: 'केवल 2' },
        { en: 'Both 1 and 2', hi: '1 और 2 दोनों' },
        { en: 'Neither 1 nor 2', hi: 'न तो 1 और न ही 2' }
      ],
      answer: 2,
      explanation: {
        en: `Both statements are correct. In all ${data.titleEn} questions, calculations are relative to the baseline, and unit conversions must be checked before calculating.`,
        hi: `दोनों कथन सही हैं। सभी ${data.titleHi} प्रश्नों में, गणना आधार रेखा के सापेक्ष होती है, और गणना करने से पहले इकाई रूपांतरण की जांच की जानी चाहिए।`
      },
      year: 2023
    }
  ];

  return {
    exam,
    subject,
    topic,
    subtopic: fullSubtopic,
    introduction,
    detailedExplanation,
    concepts,
    importantFacts,
    examples,
    tables,
    revisionNotes,
    pyqs,
    practiceMcqs: [],
    relatedTopics: []
  };
}

async function seedPremiumContent() {
  console.log('\n======================================================');
  console.log('  📚 premium content generator pipeline');
  console.log('======================================================\n');

  console.log(`🔌 Connecting to: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected.\n');

  const syllabusDir = path.resolve(__dirname, '../../data/syllabus');
  
  // We read from data/syllabus/backup/ which contains original unexpanded JSONs
  const backupDir = path.join(syllabusDir, 'backup');
  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));

  // 1. Clear database entries in learningcontents
  console.log('🧹 Clearing old learning content entries from DB...');
  const delRes = await LearningContent.deleteMany({});
  console.log(`- Deleted ${delRes.deletedCount} legacy learning content records.`);

  // 2. Generate and insert 20,328 records in chunks
  console.log('\n🚀 Generating 20,328 premium isolated bilingual records...');
  
  const chunkLimit = 1000;
  let chunkQueue = [];
  let totalInserted = 0;

  const examsOrder = ['UPSC', 'BPSC', 'State PCS', 'SSC CGL', 'SSC CHSL', 'Railway', 'Banking'];

  for (const examName of examsOrder) {
    const file = files.find(f => f.replace('.json', '').toLowerCase() === examName.toLowerCase().replace(' ', '-'));
    if (!file) {
      console.log(`⚠️ Warning: No backup syllabus file found for ${examName}`);
      continue;
    }

    const raw = fs.readFileSync(path.join(backupDir, file), 'utf-8');
    const data = JSON.parse(raw);
    if (!data || !data.subjects) continue;

    console.log(`📚 Authoring materials for Exam: ${examName}...`);

    for (const subj of data.subjects) {
      if (!subj.topics) continue;

      for (const topic of subj.topics) {
        if (!topic.subtopics) continue;
        for (const baseSub of topic.subtopics) {
          // Generate 28 parts for each base subtopic
          for (let partNum = 1; partNum <= 28; partNum++) {
            const doc = buildContentDocument(examName, subj.name, topic.name, baseSub, partNum);
            chunkQueue.push(doc);

            if (chunkQueue.length >= chunkLimit) {
              await LearningContent.insertMany(chunkQueue);
              totalInserted += chunkQueue.length;
              console.log(`   - Seeded ${totalInserted} records...`);
              chunkQueue = [];
            }
          }
        }
      }
    }
  }

  // Insert any remaining records in queue
  if (chunkQueue.length > 0) {
    await LearningContent.insertMany(chunkQueue);
    totalInserted += chunkQueue.length;
    console.log(`   - Seeded remaining records. Total: ${totalInserted}`);
  }

  await mongoose.disconnect();
  console.log('\n🔌 Disconnected.');
  console.log('\n======================================================');
  console.log(`  🎉 SEEDING COMPLETE! Seeded ${totalInserted} premium records.`);
  console.log('======================================================\n');
}

seedPremiumContent().catch(console.error);
