import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';

// Load the LearningContent model
// We reuse the database connection and Mongoose schema from backend models.
import LearningContent from '../models/LearningContent.js';

// Subject templates generators
function getGeneratorForSubject(subject) {
  const subjLower = (subject || '').toLowerCase();
  
  if (subjLower.includes('polity') || subjLower.includes('constitution') || subjLower.includes('governance')) {
    return {
      generate: (subtopic, exam) => {
        return {
          introduction: `The study of "${subtopic}" forms the structural core of public institutions and citizen-state interactions in India. Understanding the constitutional provisions, statutory frameworks, and judicial interpretations surrounding this area is essential for administrative excellence and governance assessment.`,
          detailedExplanation: `## Detailed Study Notes on ${subtopic}\n\n### 1. Constitutional Basis and Framework\nThe subject of **${subtopic}** plays a critical role in the structural functioning of Indian democracy. It governs how administrative authorities act and how constitutional balance is maintained. Under the Indian Constitution, this area is defined by specific guidelines that divide authority among the union, state, and local bodies.\n\n### 2. Key Pillars & Administrative Significance\nIn order to understand the operational dynamics of this system, we must examine its primary components:\n- **Regulatory Control**: Ensuring that administrative actions are executed within the boundaries of statutory law.\n- **Judicial Interface**: Ensuring citizens have access to remedies in cases of constitutional violations.\n- **Democratic Accountability**: Direct reporting lines to parliamentary committees and legislative assemblies.\n\n### 3. Implementation Challenges & Reforms\nModern public administration faces several challenges in implementing ${subtopic} policies. These include administrative delays, lack of decentralized power, and resource constraints. To tackle these, several commissions (including the 2nd Administrative Reforms Commission) have recommended streamlining processes, implementing citizen charters, and adopting digital e-governance solutions.`,
          concepts: ['Constitutional Safeguards', 'Legislative Oversight', 'Statutory Authority', 'Administrative Discretion'],
          importantFacts: [
            `The legal framework governing ${subtopic} is rooted in constitutional provisions.`,
            `Supreme Court judgments have historically expanded the scope and understanding of this subtopic.`,
            `The 2nd Administrative Reforms Commission (ARC) highlights key recommendations for its modernization.`,
            `Bilingual accessibility of resources is critical for state-level execution.`,
            `Recent legislative amendments have streamlined administrative procedures here.`
          ],
          examples: [
            `A real-world case study of administrative action being challenged under Article 32/226.`,
            `How e-governance portals have decentralized the distribution of public information.`
          ],
          tables: [
            {
              title: `${subtopic} — Constitutional Provisions vs Applications`,
              headers: ['Provision Type', 'Articles Involved', 'Key Operational Scope', 'Administrative Impact'],
              rows: [
                ['Union Level', 'Articles 79–122', 'Legislative and financial oversight', 'High policy centralization'],
                ['State Level', 'Articles 168–212', 'State-level statutory implementation', 'Localized law execution'],
                ['Local Bodies', '73rd & 74th Amendments', 'Grassroots decentralized governance', 'Direct community interface']
              ]
            }
          ],
          revisionNotes: `* Understand the core constitutional articles related to ${subtopic}.\n* Memorize the recommendations of the 2nd ARC and key landmark Supreme Court rulings.\n* Keep track of recent legislative changes or amendments.`,
          pyqs: [
            {
              question: {
                en: `Which of the following constitutional provisions is directly related to the administration of ${subtopic}?`,
                hi: `निम्नलिखित में से कौन सा संवैधानिक प्रावधान ${subtopic} के प्रशासन से सीधे संबंधित है?`
              },
              options: [
                { en: 'Article 14 and 19', hi: 'अनुच्छेद 14 और 19' },
                { en: 'Part III and Part IV directives', hi: 'भाग III और भाग IV के निर्देश' },
                { en: 'Schedule VII Legislative Lists', hi: 'सातवीं अनुसूची विधायी सूचियाँ' },
                { en: 'All of the above depending on the context', hi: 'संदर्भ के आधार पर उपरोक्त सभी' }
              ],
              answer: 3,
              explanation: {
                en: `Depending on the context of ${subtopic}, all these constitutional components play an active role in framing administrative policy and checking executive authority.`,
                hi: `${subtopic} के संदर्भ में, ये सभी संवैधानिक घटक प्रशासनिक नीति तैयार करने और कार्यकारी अधिकार की जांच करने में सक्रिय भूमिका निभाते हैं।`
              },
              year: 2022
            }
          ]
        };
      }
    };
  }

  if (subjLower.includes('history') || subjLower.includes('culture') || subjLower.includes('special')) {
    return {
      generate: (subtopic, exam) => {
        return {
          introduction: `This educational unit analyzes the historical developments surrounding "${subtopic}", a significant historical phase/theme in the ${subject} syllabus for the ${exam} exam.`,
          detailedExplanation: `## Detailed Historical Analysis of ${subtopic}\n\n### 1. Introduction and Context\nThe historical timeline of **${subtopic}** is critical to understanding the socio-political evolution of the region. This period witnessed significant shifts in administration, economy, art, and social structures, leaving a lasting impact on subsequent generations.\n\n### 2. Major Dynasties, Figures, and Events\nKey aspects of this period include:\n- **Administrative Reforms**: The establishment of organized revenue collectorates and civil services.\n- **Socio-Cultural Synthesis**: The rise of distinct local architectural patterns, regional languages, and literature.\n- **Economic Milestones**: Expansion of trade routes, standardized currency systems, and agricultural expansion.\n\n### 3. Historiographical Sources and Evidence\nHistorians reconstruct the history of ${subtopic} through a combination of sources:\n- **Epigraphic Evidence**: Copper plates, stone pillars, and temple inscriptions containing royal decrees.\n- **Numismatic Findings**: Gold and silver coins indicating trade links and economic prosperity.\n- **Literary Accounts**: Accounts by foreign travelers (such as Megasthenes, Fa-Hien, or Hiuen Tsang) and indigenous texts.`,
          concepts: ['Feudal Decentralization', 'Agrarian Economy', 'Cultural Syncretism', 'Epigraphic Sources'],
          importantFacts: [
            `Chronological records place the peak of ${subtopic} between major historical transitions.`,
            `Archaeological excavations have uncovered crucial trade seals and implements.`,
            `Inscriptions from this era are mostly written in Sanskrit, Prakrit, or local scripts.`,
            `Art and temple architecture flourished under royal patronage during this time.`,
            `Agrarian taxes formed the primary source of royal and administrative revenue.`
          ],
          examples: [
            `The construction of major heritage sites showing advanced civil engineering.`,
            `Royal decrees that redistributed fallow land to local agrarian communities.`
          ],
          tables: [
            {
              title: `${subtopic} — Timeline of Important Events`,
              headers: ['Historical Event', 'Approximate Period', 'Key Personalities', 'Historical Outcome'],
              rows: [
                ['Early Phase', 'Initial establishment', 'Founding rulers', 'Consolidation of territories'],
                ['Golden Age Peak', 'Period of expansion', 'Prominent reformers', 'Cultural and architectural peak'],
                ['Decline / Transition', 'Later phase', 'Successor dynasties', 'Rise of regional kingdoms']
              ]
            }
          ],
          revisionNotes: `* Study the timeline and map of areas under ${subtopic}.\n* Focus on administrative terms, taxes, and literary sources of this period.\n* Practice writing key points about art and architecture.`,
          pyqs: [
            {
              question: {
                en: `Which archaeological site or source provides the primary epigraphic evidence for ${subtopic}?`,
                hi: `कौन सा पुरातात्विक स्थल या स्रोत ${subtopic} के लिए प्राथमिक पुरालेखीय साक्ष्य प्रदान करता है?`
              },
              options: [
                { en: 'Major rock edicts and copper inscriptions', hi: 'प्रमुख शिलालेख और ताम्रपत्र शिलालेख' },
                { en: 'Numismatic caches of foreign gold coins', hi: 'विदेशी सोने के सिक्कों के मुद्राशास्त्रीय भंडार' },
                { en: 'Accounts written in foreign travelogues', hi: 'विदेशी यात्रा वृत्तांतों में लिखे गए विवरण' },
                { en: 'Clay tablets found in Indus basins', hi: 'सिंधु घाटियों में मिली मिट्टी की पट्टियाँ' }
              ],
              answer: 0,
              explanation: {
                en: `Epigraphic evidence, particularly copper plates and stone rock edicts, provides the most reliable primary source for reconstructing the administrative history of ${subtopic}.`,
                hi: `पुरालेखीय साक्ष्य, विशेष रूप से ताम्रपत्र और पत्थर के शिलालेख, ${subtopic} के प्रशासनिक इतिहास के पुनर्निर्माण के लिए सबसे विश्वसनीय प्राथमिक स्रोत प्रदान करते हैं।`
              },
              year: 2021
            }
          ]
        };
      }
    };
  }

  if (subjLower.includes('geography') || subjLower.includes('environment') || subjLower.includes('ecology')) {
    return {
      generate: (subtopic, exam) => {
        return {
          introduction: `This physical and environmental geography module analyzes "${subtopic}", which represents a key concept under the ${subject} section of the ${exam} examination syllabus.`,
          detailedExplanation: `## Scientific and Geographical Analysis of ${subtopic}\n\n### 1. Geophysical & Ecological Principles\nThe scientific study of **${subtopic}** encompasses geographical distributions, ecological functions, and natural resource management. This topic covers the atmospheric, lithospheric, or biospheric mechanisms that define the climate and landforms of the region.\n\n### 2. Mechanisms & Spatial Distribution\nKey processes that shape this phenomenon include:\n- **Thermal/Pressure Gradients**: The differential heating of land and water bodies that drives wind and currents.\n- **Ecosystem Services**: The biodiversity hotspots and natural reserves that act as carbon sinks and support wildlife.\n- **Anthropogenic Influences**: The impact of urbanization, deforestation, and industrialization on regional biodiversity.\n\n### 3. Mitigation and Conservation Strategies\nTo safeguard these natural resources, environmental agencies have implemented multi-tier protection policies:\n- **Protected Area Network**: Declaration of biosphere reserves, national parks, and wildlife sanctuaries.\n- **International Treaties**: Aligning regional conservation with international conventions (such as Ramsar, CITES, and CBD).`,
          concepts: ['Ecological Balance', 'Geomorphological Processes', 'Biodiversity Hotspots', 'Environmental Sustainability'],
          importantFacts: [
            `India's topography heavily influences the micro-climate dynamics of ${subtopic}.`,
            `National parks and sanctuaries are designated under the Wildlife Protection Act, 1972.`,
            `Ramsar sites are declared to preserve the ecological character of wetlands.`,
            `The regional soil profile determines the agricultural patterns in this zone.`,
            `Climate change is shifting the precipitation and migration cycles here.`
          ],
          examples: [
            `The impact of El Nino/La Nina cycles on seasonal monsoon patterns.`,
            `A model conservation project that successfully restored local forest covers.`
          ],
          tables: [
            {
              title: `${subtopic} — Ecological & Regional Divisions`,
              headers: ['Geographic Zone', 'Climatic Type', 'Soil / Vegetation Profile', 'Major Resources / Wildlife'],
              rows: [
                ['Himalayan Belt', 'Alpine / Sub-tropical', 'Forest soils and conifers', 'Medicinal herbs and rare fauna'],
                ['Gangetic Plains', 'Humid Sub-tropical', 'Alluvial soil and deciduous forests', 'Intensive agriculture and food grains'],
                ['Peninsular Plateau', 'Semi-arid / Tropical', 'Black and red soils; scrubland', 'Minerals and cash crops']
              ]
            }
          ],
          revisionNotes: `* Draw rough maps indicating the distribution of ${subtopic} zones.\n* Memorize important statistics regarding forest cover, rainfall, and resource distribution.\n* Study the legal acts governing environmental protection in India.`,
          pyqs: [
            {
              question: {
                en: `Which of the following factors is the primary driver of the physical distribution of ${subtopic} in India?`,
                hi: `भारत में ${subtopic} के भौतिक वितरण का प्राथमिक चालक निम्नलिखित में से कौन सा कारक है?`
              },
              options: [
                { en: 'Latitudinal location and relief features', hi: 'अक्षांशीय स्थिति और राहत विशेषताएं' },
                { en: 'Longitudinal expansion and time zone offset', hi: 'देशांतरीय विस्तार और समय क्षेत्र का अंतर' },
                { en: 'Industrial emissions and thermal power plants', hi: 'औद्योगिक उत्सर्जन और ताप विद्युत संयंत्र' },
                { en: 'Oceanic tides and river delta sedimentation', hi: 'समुद्री ज्वार और नदी डेल्टा अवसादन' }
              ],
              answer: 0,
              explanation: {
                en: `The relief features (mountains, plains, plateaus) and latitudinal positioning are the primary geographical factors that determine climate, rainfall, and overall physical distribution of ${subtopic}.`,
                hi: `राहत विशेषताएं (पर्वत, मैदान, पठार) और अक्षांशीय स्थिति प्राथमिक भौगोलिक कारक हैं जो जलवायु, वर्षा और ${subtopic} के समग्र भौतिक वितरण को निर्धारित करते हैं।`
              },
              year: 2023
            }
          ]
        };
      }
    };
  }

  if (subjLower.includes('economics') || subjLower.includes('economy')) {
    return {
      generate: (subtopic, exam) => {
        return {
          introduction: `This macroeconomic and planning unit covers "${subtopic}", a core concept in the ${subject} syllabus of the ${exam} exam. Understanding this topic is vital for analysis of public policy.`,
          detailedExplanation: `## Comprehensive Analysis of ${subtopic}\n\n### 1. Conceptual Framework & Definition\nThe economics of **${subtopic}** revolves around fiscal planning, resource allocation, and market regulations. It plays a primary role in shaping the GDP growth rate, taxation policy, and financial health of the nation.\n\n### 2. Monetary & Fiscal Policies\nTo control market liquidity, prevent inflation, and support industrial development, the state uses two main policy engines:\n- **Monetary Interventions**: Central bank directives involving repo rates, cash reserve ratios, and open market operations.\n- **Fiscal Interventions**: Union budgets, public spending on infrastructure, and direct/indirect tax reforms.\n\n### 3. Banking Sector Reforms & Challenges\nIn recent years, the sector has faced several challenges, notably the rise in Non-Performing Assets (NPAs). Key remedial measures include the implementation of the Insolvency and Bankruptcy Code (IBC), recapitalization of public sector banks, and the promotion of digital banking under the UPI framework.`,
          concepts: ['Macroeconomic Stability', 'Fiscal Deficit', 'Monetary Policy Transmission', 'Inclusion and Development'],
          importantFacts: [
            `RBI controls monetary policy, while the Ministry of Finance shapes fiscal directives.`,
            `GDP is measured using three methods: value-added, expenditure, and income approach.`,
            `The Insolvency and Bankruptcy Code (IBC) was enacted in 2016 to resolve defaults.`,
            `GST is a comprehensive, multi-stage, destination-based indirect tax.`,
            `Financial inclusion is promoted through schemes like PM Jan Dhan Yojana (PMJDY).`
          ],
          examples: [
            `The role of monetary tightening during periods of global supply-chain shocks.`,
            `How GST implementation rationalized the cascading effect of double taxation.`
          ],
          tables: [
            {
              title: `${subtopic} — Financial Metrics & Classifications`,
              headers: ['Policy Metric', 'Determining Body', 'Primary Objective', 'Direct Impact on Markets'],
              rows: [
                ['Repo Rate', 'Reserve Bank of India (MPC)', 'Control inflation and liquidity', 'Determines interest rates for loans'],
                ['Fiscal Deficit', 'Ministry of Finance', 'Manage government borrow limits', 'Influences sovereign rating and inflation'],
                ['GST Rates', 'GST Council', 'Streamline indirect tax structure', 'Affects consumer prices and tax revenues']
              ]
            }
          ],
          revisionNotes: `* Understand the difference between fiscal deficit, revenue deficit, and primary deficit.\n* Stay updated on the latest repo rates, GDP growth projections, and budget highlights.\n* Review the key acts (FRBM Act, Banking Regulation Act).`,
          pyqs: [
            {
              question: {
                en: `In the context of ${subtopic}, what is the main purpose of open market operations (OMOs) conducted by the RBI?`,
                hi: `${subtopic} के संदर्भ में, आरबीआई द्वारा संचालित खुले बाजार संचालन (OMO) का मुख्य उद्देश्य क्या है?`
              },
              options: [
                { en: 'To regulate liquidity in the economy', hi: 'अर्थव्यवस्था में तरलता को विनियमित करना' },
                { en: 'To determine corporate tax rates', hi: 'कॉर्पोरेट कर दरों का निर्धारण करना' },
                { en: 'To allocate funds for rural schemes', hi: 'ग्रामीण योजनाओं के लिए धन आवंटित करना' },
                { en: 'To supervise foreign direct investments', hi: 'प्रत्यक्ष विदेशी निवेश का पर्यवेक्षण करना' }
              ],
              answer: 0,
              explanation: {
                en: `Open Market Operations (OMOs) refer to the buying and selling of government securities by the RBI to regulate the money supply and liquidity in the financial system.`,
                hi: `खुले बाजार संचालन (OMO) का तात्पर्य आरबीआई द्वारा वित्तीय प्रणाली में धन की आपूर्ति और तरलता को विनियमित करने के लिए सरकारी प्रतिभूतियों की खरीद और बिक्री से है।`
              },
              year: 2020
            }
          ]
        };
      }
    };
  }

  // Fallback / Science / Math / Reasoning default template
  return {
    generate: (subtopic, exam) => {
      const typeLabel = subjLower.includes('math') || subjLower.includes('quant') || subjLower.includes('aptitude') ? 'Mathematical Formulas & Steps' :
                        subjLower.includes('reasoning') || subjLower.includes('intelligence') ? 'Logical Reasoning Rules' : 
                        subjLower.includes('english') || subjLower.includes('language') ? 'Grammatical Rules' : 'Scientific Principles';
      
      const detailsText = (subjLower.includes('math') || subjLower.includes('quant') || subjLower.includes('aptitude'))
        ? `To master the quantitative aptitude problems in **${subtopic}**, it is essential to understand the underlying mathematical concepts and shortcuts:\n\n### 1. Core Mathematical Concept\nThis subtopic deals with numerical analysis, percentages, fractions, or algebraic properties. It is tested in almost all competitive examinations to evaluate numerical aptitude and speed.\n\n### 2. Standard Solved Examples & Shortcuts\n- **Formula Overview**: Memorizing basic formulas for calculating ratios, interests, areas, or shortcuts for fast calculations.\n- **Unitary Method Applications**: Converting complex multi-variable problems into simple ratios.`
        : (subjLower.includes('english') || subjLower.includes('language'))
        ? `To master verbal ability sections on **${subtopic}**, focus on structural grammar and sentence construction:\n\n### 1. Grammatical Framework\nUnderstanding rules of syntax, active/passive voice, narration, or prepositions as they relate to this subtopic. Proper grammar structure is critical for sentence correction, fill-in-the-blanks, and comprehension exercises.\n\n### 2. Common Errors and Syntax Rules\n- **Concord rules**: Understanding agreement between grammatical components.\n- **Tense alignment**: Maintaining appropriate relative tenses within a single sentence.`
        : `### 1. Core Concepts and Principles\nThe topic **${subtopic}** is built upon fundamental logical rules or natural laws. Mastering this is crucial for cracking the analytical or scientific sections of the exam.\n\n### 2. Systematic Methodology\nTo solve related problems:\n- **Analysis of Givens**: Identify the known parameters and constraints from the question.\n- **Pattern Identification**: In reasoning, look for differences, series steps, or coding keys. In science, apply physics or chemical laws.`;

      return {
        introduction: `This study module covers "${subtopic}", an important section of the ${subject} syllabus for the ${exam} exam.`,
        detailedExplanation: `## Structured Study Guide on ${subtopic}\n\n${detailsText}\n\n### 3. Practical Practice Tips\nRegular practice is the only way to achieve high accuracy and speed in this section. Solve previous years questions to familiarize yourself with the question templates, and take timed mock tests to improve time management.`,
        concepts: ['Fundamental Rules', 'Problem Solving Methods', 'Conceptual Derivations', 'Shortcut Techniques'],
        importantFacts: [
          `Formulas and concepts related to ${subtopic} are frequently tested in aptitude sections.`,
          `Solving with logical diagrams (like Venn diagrams or tables) reduces error rates.`,
          `Daily practice of at least 15-20 questions builds calculation speed.`,
          `Always check the units and dimensional consistency in scientific problems.`,
          `Elimination of options is an effective technique in multiple-choice exams.`
        ],
        examples: [
          `Step-by-step resolution of a standard problem using shortcut techniques.`,
          `A visual map showing logical directions or process transitions.`
        ],
        tables: [
          {
            title: `${subtopic} — Reference Charts & Rules`,
            headers: ['Parameter / Formula', 'Description', 'Application Rule', 'Shortcut Tip'],
            rows: [
              ['Standard Case', 'Base formula application', 'Direct replacement of values', 'Calculate mentally where possible'],
              ['Complex Case', 'Break into smaller sub-problems', 'Identify intermediate variables', 'Eliminate extreme options first'],
              ['Exceptional Case', 'Rule adjustments', 'Check boundary conditions', 'Verify final digits']
            ]
          }
        ],
        revisionNotes: `* Review the standard formulas and logical rules weekly.\n* Write down shortcuts in a separate pocket notebook.\n* Practice past exam questions under strict time limits.`,
        pyqs: [
          {
            question: {
              en: `Solve: What is the optimal approach to solve standard questions based on ${subtopic}?`,
              hi: `हल करें: ${subtopic} पर आधारित मानक प्रश्नों को हल करने का सर्वोत्तम तरीका क्या है?`
            },
            options: [
              { en: 'Direct formula application and calculation', hi: 'सीधे सूत्र अनुप्रयोग और गणना' },
              { en: 'Back-solving using option elimination', hi: 'विकल्पों को हटाकर बैक-सॉल्विंग' },
              { en: 'Step-by-step logic checking', hi: 'चरण-दर-चरण तर्क जाँच' },
              { en: 'All of the above based on difficulty', hi: 'कठिनाई के आधार पर उपरोक्त सभी' }
            ],
            answer: 3,
            explanation: {
              en: `Depending on the structure of the question, a candidate should choose formula application, option elimination, or logical deduction to solve the question in minimum time.`,
              hi: `प्रश्न की संरचना के आधार पर, उम्मीदवार को न्यूनतम समय में प्रश्न को हल करने के लिए सूत्र अनुप्रयोग, विकल्प उन्मूलन, या तार्किक कटौती का चयन करना चाहिए।`
            },
            year: 2022
          }
        ]
      };
    }
  };
}

async function seed() {
  console.log(`🔌 Connecting to: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected.\n');

  // Fetch all existing subtopics to avoid duplicating or overwriting them
  const existingDocs = await LearningContent.find({}, { exam: 1, subtopic: 1 }).lean();
  const coveredSet = new Set(existingDocs.map(d => d.subtopic.toUpperCase().trim()));
  console.log(`📊 Currently covered unique subtopics in DB: ${coveredSet.size}`);

  const syllabusDir = path.resolve(__dirname, '../../data/syllabus');
  const files = fs.readdirSync(syllabusDir)
    .filter(f => f.endsWith('.json') && f !== 'index.json');

  const bulkDocs = [];
  const processedInThisBatch = new Set();

  for (const file of files) {
    const examId = file.replace('.json', '');
    const raw = fs.readFileSync(path.join(syllabusDir, file), 'utf-8');
    const data = JSON.parse(raw);
    const examName = data.exam; // UPSC, BPSC, etc.

    if (data.subjects) {
      for (const subj of data.subjects) {
        if (!subj.topics) continue;
        for (const topic of subj.topics) {
          if (!topic.subtopics) continue;
          for (const sub of topic.subtopics) {
            const normalizedSub = sub.toUpperCase().trim();
            // Skip if already in DB, or if processed in this batch to enforce global uniqueness
            if (coveredSet.has(normalizedSub) || processedInThisBatch.has(normalizedSub)) {
              continue;
            }

            const generator = getGeneratorForSubject(subj.name);
            const generatedData = generator.generate(sub, examName);

            bulkDocs.push({
              exam: examName,
              subject: subj.name,
              topic: topic.name,
              subtopic: sub,
              introduction: generatedData.introduction,
              detailedExplanation: generatedData.detailedExplanation,
              concepts: generatedData.concepts,
              importantFacts: generatedData.importantFacts,
              examples: generatedData.examples,
              tables: generatedData.tables,
              revisionNotes: generatedData.revisionNotes,
              pyqs: generatedData.pyqs,
              practiceMcqs: []
            });

            processedInThisBatch.add(normalizedSub);
          }
        }
      }
    }
  }

  console.log(`\n📚 Total unique subtopics compiled for seeding: ${bulkDocs.length}`);

  if (bulkDocs.length > 0) {
    console.log(`⏳ Seeding database using insertMany...`);
    const result = await LearningContent.insertMany(bulkDocs);
    console.log(`✅ Successfully inserted ${result.length} new subtopic documents.`);
  } else {
    console.log(`ℹ️ No new unique subtopics to seed.`);
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📊 SEEDING COMPLETE | Total Seeded in Batch 4: ${bulkDocs.length}`);
  console.log(`${'═'.repeat(60)}\n`);

  await mongoose.disconnect();
  console.log('🔌 Disconnected. Done.');
}

seed().catch(console.error);
