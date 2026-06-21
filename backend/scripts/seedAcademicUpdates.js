import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import LearningContent from '../models/LearningContent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';

const contentData = [
  {
    exam: 'BPSC',
    subject: 'history',
    topic: 'Bihar Special',
    subtopic: 'Folk Art — Madhubani Painting',
    introduction: 'Madhubani painting, also known as Mithila painting, is a traditional folk art style originating from the Mithila region of Bihar. It is characterized by vibrant colors, geometric patterns, double outlines, and themes drawn from Hindu mythology, nature, and social events. It represents a vital aspect of regional cultural history and Bihar certification exams.',
    concepts: [
      'Ritualistic origin (Bhitti Chitra & Aipan)',
      'Double-line mapping & natural color pigmentation',
      'Stylistic division: Kohbar, Bharni, Katchni, Tantrik, Gobar',
      'Matriarchal transition to paper canvas'
    ],
    importantFacts: [
      'Initially painted on mud walls (Bhitti Chitra) and floors (Aripana / Aipan) during festivals.',
      'Transitioned to paper in the late 1960s due to a massive drought in Mithila, encouraged by Lalit Narayan Mishra and Bhaskar Kulkarni.',
      'Awarded the Geographical Indication (GI) status in 2005 for its unique regional heritage.',
      'Key pioneer artists include Jagdamba Devi (first National Award winner), Mahasundari Devi, and Sita Devi.'
    ],
    examples: [
      'The Kohbar Ghar mural depicts a central lotus pond surrounded by fish and bamboo, representing fertility and marriage.',
      'Bharni style represents high-caste Hindu stories completely filled with rich colors like red and yellow.'
    ],
    tables: [
      {
        title: 'Styles of Madhubani Painting / मधुबनी चित्रकला की शैलियाँ',
        headers: ['Style Name / शैली', 'Primary Medium & Technique / माध्यम और तकनीक', 'Key Themes / मुख्य विषय'],
        rows: [
          ['Bharni / भरनी', 'Double outlines, filled with vibrant primary colors', 'Mythological scenes of Ram, Krishna, Durga'],
          ['Katchni / कचनी', 'Fine line-work and hatching, monochromatic styling', 'Nature, flora, fauna, minimal coloring'],
          ['Tantrik / तांत्रिक', 'Yantra diagrams, spiritual motifs, geometric structures', 'Tantric iconography and cosmic principles'],
          ['Gobar / गोबर', 'Cow dung wash background, earthy red and black colors', 'Daily life scenes, tribal and local folklore'],
          ['Kohbar / कोहबर', 'Painted in the nuptial chamber on mud walls', 'Symbols of fertility, union, and marital bliss']
        ]
      }
    ],
    revisionNotes: 'Madhubani GI Tag: 2005. Mithila region. Pioneers: Jagdamba Devi, Mahasundari Devi, Sita Devi. Styles: Bharni (color), Katchni (line), Gobar (cow dung). Features: Double border, filled gaps (using flowers/birds), natural dyes (indigo, turmeric).',
    pyqs: [
      {
        question: {
          en: 'In which year did Madhubani Painting receive the Geographical Indication (GI) tag?',
          hi: 'मधुबनी चित्रकला को किस वर्ष भौगोलिक संकेतक (GI) टैग प्राप्त हुआ?'
        },
        options: [
          { en: '2001', hi: '2001' },
          { en: '2005', hi: '2005' },
          { en: '2010', hi: '2010' },
          { en: '2015', hi: '2015' }
        ],
        answer: 1,
        explanation: {
          en: 'Madhubani painting was awarded the Geographical Indication status in 2005 to preserve its traditional Mithila roots.',
          hi: 'मधुबनी चित्रकला को इसके पारंपरिक मिथिला मूल को संरक्षित करने के लिए वर्ष 2005 में भौगोलिक संकेतक का दर्जा प्रदान किया गया था।'
        },
        year: 2018
      }
    ],
    detailedExplanation: `### 1. Introduction & Overview / प्रस्तावना और अवलोकन
**English:** Madhubani Painting, historically termed Mithila Painting, is an ancient indigenous folk art practiced in the Mithila region of Bihar and Nepal. It is celebrated globally for its striking geometric details, two-dimensional flat structures, double borders, and organic color palettes.
**हिंदी:** मधुबनी चित्रकला, जिसे ऐतिहासिक रूप से मिथिला चित्रकला कहा जाता है, बिहार के मिथिला क्षेत्र और नेपाल में प्रचलित एक प्राचीन स्वदेशी लोक कला है। यह अपने ज्यामितीय विवरण, द्वि-आयामी सपाट संरचनाओं, दोहरी रेखाओं और प्राकृतिक रंगों के लिए विश्व स्तर पर प्रसिद्ध है।

### 2. Historical Context & Background / ऐतिहासिक पृष्ठभूमि
**English:** According to local beliefs, the origin of Mithila art traces back to the Ramayana era, when King Janaka commissioned local women to paint the walls of Pataliputra and Mithila for the marriage of Princess Sita to Lord Rama. For centuries, it survived as a domestic art passed down from mothers to daughters.
**हिंदी:** स्थानीय मान्यताओं के अनुसार, मिथिला कला की उत्पत्ति रामायण काल ​​से मानी जाती है, जब राजा जनक ने राजकुमारी सीता के भगवान राम से विवाह के लिए स्थानीय महिलाओं को दीवारों को चित्रित करने का आदेश दिया था। सदियों तक यह माताओं से पुत्रियों में स्थानांतरित होने वाली एक घरेलू कला के रूप में जीवित रही।

### 3. Core Concepts & Definitions / मुख्य अवधारणाएँ और परिभाषाएँ
**English:** The art features two primary divisions: **Bhitti Chitra** (wall paintings on mud plaster) and **Aripana / Aipan** (floor drawings using rice paste). The paintings leave no empty spaces; gaps are filled with motifs of flowers, birds, and animals representing nature.
**हिंदी:** इस कला के दो प्राथमिक भाग हैं: **भित्ति चित्र** (मिट्टी के प्लास्टर पर दीवार चित्र) और **अरिपना / ऐपन** (चावल के पेस्ट का उपयोग करके फर्श पर चित्र)। चित्र में कोई खाली जगह नहीं छोड़ी जाती; खाली स्थानों को फूलों, पक्षियों और जानवरों के चित्रों से भरा जाता है।

### 4. Deep Academic Explanation / विस्तृत शैक्षणिक व्याख्या
**English:** Traditional paintings utilize natural pigment colors extracted from plants and minerals. For example, black is sourced from soot and cow dung, yellow from turmeric, blue from indigo, and red from saffron or clay. Bamboo twigs and matchsticks wrapped in cotton act as brushes.
**हिंदी:** पारंपरिक चित्रों में पौधों और खनिजों से निकाले गए प्राकृतिक रंगों का उपयोग किया जाता है। उदाहरण के लिए, कालिख और गोबर से काला, हल्दी से पीला, नील से नीला, और केसर या मिट्टी से लाल रंग प्राप्त किया जाता है। बांस की टहनियों और सूती कपड़े से ब्रश बनाया जाता है।

### 5. Key Conceptual Pillars / मुख्य वैचारिक स्तंभ
**English:** The stylistic transition from ritual caste-based divisions (like the colorful Bharni of Kayasthas and fine Katchni of Brahmins) to a unified contemporary platform highlights the democratizing force of the art.
**हिंदी:** कर्मकांडीय जाति-आधारित शैलियों (जैसे कायस्थों की रंगीन भरनी और ब्राह्मणों की बारीक कचनी) से एक एकीकृत समकालीन मंच में संक्रमण इस कला की लोकतांत्रिक भावना को दर्शाता है।

### 6. NCERT Connections & Foundations / एनसीईआरटी संबंध और बुनियादी बातें
**English:** Mapped with Class XII Fine Arts NCERT, this module addresses the socio-economic transition from domestic wall paintings to premium paper canvases in 1967.
**हिंदी:** कक्षा XII ललित कला एनसीईआरटी के साथ मैप किया गया यह मॉड्यूल, 1967 में घरेलू दीवार चित्रों से प्रीमियम पेपर कैनवास में सामाजिक-आर्थिक संक्रमण को दर्शाता है।

### 7. Advanced Analytical Insights / उन्नत विश्लेषणात्मक अंतर्दृष्टि
**English:** Scholars point out that Mithila art acted as a tool for feminist expression and political protest in Bihar. In 2012, women painted regional trees with images of Hindu deities to prevent local deforestation, combining art with eco-activism.
**हिंदी:** विद्वानों का मानना है कि मिथिला कला ने बिहार में नारीवादी अभिव्यक्ति और राजनीतिक विरोध के उपकरण के रूप में काम किया। 2012 में, महिलाओं ने पेड़ों की कटाई को रोकने के लिए उन पर हिंदू देवी-देवताओं के चित्र बनाए, जिससे कला को पर्यावरण सक्रियता से जोड़ा गया।

### 8. Real-world Examples & Case Studies / वास्तविक उदाहरण और केस स्टडीज
**English:** The Madhubani Railway Station in Bihar was completely decorated by over 225 local artists with traditional paintings, representing a modern public showcase of folk heritage.
**हिंदी:** बिहार के मधुबनी रेलवे स्टेशन को 225 से अधिक स्थानीय कलाकारों ने पारंपरिक चित्रों से सजाया था, जो लोक विरासत के आधुनिक सार्वजनिक प्रदर्शन का एक जीवंत उदाहरण है।

### 9. Bilingual Key Terms Glossary / द्विभाषी प्रमुख शब्दावली
**English:** 
- *Aripana*: Traditional floor art.
- *Bhitti Chitra*: Clay wall murals.
- *Pithar*: Wet rice paste used for drawing.
**हिंदी:** 
- *अरिपना*: पारंपरिक फर्श कला।
- *भित्ति चित्र*: मिट्टी की दीवारों पर बने भित्ति चित्र।
- *पिठार*: चित्र बनाने के लिए उपयोग किया जाने वाला गीला चावल का पेस्ट।

### 10. Exam Strategy & Weightage Analysis / परीक्षा रणनीति और अंक विश्लेषण
**English:** Bihar-specific PSC (BPSC) exams routinely ask about the role of pioneer women artists and styles (Bharni vs Katchni). Memorizing artists like Ganga Devi and Mahasundari Devi is critical for GS Paper I.
**हिंदी:** बीपीएससी परीक्षाओं में मुख्य रूप से अग्रणी महिला कलाकारों और शैलियों (भरनी बनाम कचनी) की भूमिका के बारे में प्रश्न पूछे जाते हैं। जीएस पेपर I के लिए गंगा देवी और महासुंदरी देवी जैसे कलाकारों को याद रखना महत्वपूर्ण है।

### 11. Quick-Recall Revision Summary / त्वरित-स्मरण पुनरावलोकन सारांश
**English:** Mithila art uses double borders, natural colors, fine line work, and depicts mythological figures alongside plants and animals. GI Tag was awarded in 2005.
**हिंदी:** मिथिला कला दोहरी सीमाओं, प्राकृतिक रंगों, बारीक रेखाओं का उपयोग करती है और पौधों और जानवरों के साथ पौराणिक आकृतियों को दर्शाती है। 2005 में जीआई टैग प्रदान किया गया था।

### 12. Bilingual Comparative Analysis / द्विभाषी तुलनात्मक विश्लेषण
**English:** Unlike Warli painting of Maharashtra (which uses simple geometric white shapes), Madhubani is highly polychromatic with complex depictions.
**हिंदी:** महाराष्ट्र की वारली चित्रकला (जो सरल ज्यामितीय सफेद आकृतियों का उपयोग करती है) के विपरीत, मधुबनी चित्रकला अत्यधिक रंगीन और जटिल चित्रण वाली है।

### 13. Related Subjects & Interdisciplinary Links / संबंधित विषय और अंतःविषय संबंध
**English:** Connects directly to Medieval Bihar history, regional trade networks, and modern tourism economics.
**हिंदी:** सीधे मध्यकालीन बिहार के इतिहास, क्षेत्रीय व्यापार नेटवर्क और आधुनिक पर्यटन अर्थशास्त्र से जुड़ता है।`
  },
  {
    exam: 'UPSC',
    subject: 'Polity',
    topic: 'Indian Constitution',
    subtopic: 'Preamble of the Indian Constitution',
    introduction: 'The Preamble to the Indian Constitution is the introductory statement that sets out the ideals, principles, source of authority, and key objectives of the Constitution. Based on the Objective Resolution of Jawaharlal Nehru, it serves as the key to the minds of the makers of the Constitution.',
    concepts: [
      'Objective Resolution of 1946',
      'Sovereign, Socialist, Secular, Democratic, Republic',
      'Justice, Liberty, Equality, Fraternity',
      'Amendment via Article 368 (Keshvananda Bharati rule)'
    ],
    importantFacts: [
      'Adopted on 26th November 1949 by the Constituent Assembly.',
      'Amended only once in 1976 by the 42nd Amendment Act, which added: Socialist, Secular, and Integrity.',
      'N.A. Palkhivala called the Preamble the Identity Card of the Constitution.',
      'K.M. Munshi described it as the Horoscope of our sovereign democratic republic.'
    ],
    examples: [
      'In the Berubari Union Case (1960), the Supreme Court ruled the Preamble is NOT a part of the Constitution.',
      'In the Kesavananda Bharati Case (1973), the Supreme Court reversed its stance, ruling it IS a part and can be amended except the Basic Structure.'
    ],
    tables: [
      {
        title: 'Key Cases Relating to Preamble / प्रस्तावना से संबंधित महत्वपूर्ण न्यायिक मामले',
        headers: ['Case Name / मामला', 'Year / वर्ष', 'Supreme Court Verdict / उच्चतम न्यायालय का निर्णय'],
        rows: [
          ['Berubari Union Case', '1960', 'Preamble is not a part of the Constitution; cannot be used to limit powers'],
          ['Kesavananda Bharati Case', '1973', 'Preamble is an integral part of the Constitution and can be amended under Article 368'],
          ['SR Bommai Case', '1994', 'Secularism in the Preamble is a part of the basic structure of the Constitution'],
          ['LIC of India Case', '1995', 'Preamble is an internal part of the Constitution but is not directly enforceable in courts']
        ]
      }
    ],
    revisionNotes: 'Preamble: Key keywords in order: Sovereign, Socialist, Secular, Democratic, Republic. Amended by 42nd Amendment (1976) adding Socialist, Secular, Integrity. Not enforceable in court of law.',
    pyqs: [
      {
        question: {
          en: 'The Preamble to the Constitution of India is:',
          hi: 'भारत के संविधान की प्रस्तावना:'
        },
        options: [
          { en: 'A part of the Constitution but has no legal effect', hi: 'संविधान का भाग है किंतु कोई कानूनी प्रभाव नहीं रखती' },
          { en: 'Not a part of the Constitution and has no legal effect', hi: 'संविधान का भाग नहीं है और कोई कानूनी प्रभाव नहीं रखती' },
          { en: 'A part of the Constitution and has the same legal effect as any other part', hi: 'संविधान का भाग है और इसका वही कानूनी प्रभाव है जो किसी अन्य भाग का है' },
          { en: 'A part of the Constitution but has no legal effect independently of other parts', hi: 'संविधान का भाग है किंतु अन्य भागों से स्वतंत्र होकर इसका कोई कानूनी प्रभाव नहीं है' }
        ],
        answer: 3,
        explanation: {
          en: 'The Supreme Court in Kesavananda Bharati and LIC of India cases confirmed it is a part of the Constitution, but it does not have independent legal enforceability.',
          hi: 'उच्चतम न्यायालय ने केशवानंद भारती और एलआईसी मामलों में पुष्टि की कि यह संविधान का हिस्सा है, लेकिन स्वतंत्र रूप से लागू करने योग्य नहीं है।'
        },
        year: 2020
      }
    ],
    detailedExplanation: `### 1. Introduction & Overview / प्रस्तावना और अवलोकन
**English:** The Preamble is the prefix and introductory page of the Indian Constitution, outlining the aspirations of the citizens. It serves as a philosophical guide, indicating the source of authority of the state.
**हिंदी:** प्रस्तावना भारतीय संविधान का आमुख और परिचयात्मक पृष्ठ है, जो नागरिकों की आकांक्षाओं को रेखांकित करता है। यह एक दार्शनिक मार्गदर्शक के रूप में कार्य करता है, जो राज्य के अधिकार के स्रोत को दर्शाता है।

### 2. Historical Context & Background / ऐतिहासिक पृष्ठभूमि
**English:** The Preamble is based on the 'Objective Resolution', drafted and moved by Pandit Jawaharlal Nehru on December 13, 1946, and unanimously adopted by the Constituent Assembly on January 22, 1947.
**हिंदी:** प्रस्तावना 'उद्देश्य प्रस्ताव' पर आधारित है, जिसे 13 दिसंबर 1946 को पंडित जवाहरलाल नेहरू द्वारा तैयार और पेश किया गया था, और 22 जनवरी 1947 को संविधान सभा द्वारा सर्वसम्मति से अपनाया गया था।

### 3. Core Concepts & Definitions / मुख्य अवधारणाएँ और परिभाषाएँ
**English:** The text states that the Constitution derives its authority from **"We, the People of India"**. It declares India to be Sovereign, Socialist, Secular, Democratic, and a Republic.
**हिंदी:** पाठ में कहा गया है कि संविधान अपना अधिकार **"हम, भारत के लोग"** से प्राप्त करता है। यह भारत को संप्रभु, समाजवादी, पंथनिरपेक्ष, लोकतांत्रिक, और गणराज्य घोषित करता है।

### 4. Deep Academic Explanation / विस्तृत शैक्षणिक व्याख्या
**English:** Key terms include:
- **Sovereign**: Absolute independence, free from external control.
- **Socialist**: Democratic socialism aimed at ending poverty and inequality.
- **Secular**: Equal respect and protection for all religions.
- **Democratic**: Representative government elected by adult franchise.
- **Republic**: Head of state is elected, not hereditary.
**हिंदी:** प्रमुख शब्दों में शामिल हैं:
- **संप्रभु**: पूर्ण स्वतंत्रता, बाहरी नियंत्रण से मुक्त।
- **समाजवादी**: लोकतांत्रिक समाजवाद जिसका उद्देश्य गरीबी और असमानता को समाप्त करना है।
- **पंथनिरपेक्ष**: सभी धर्मों के प्रति समान सम्मान और संरक्षण।
- **लोकतांत्रिक**: वयस्क मताधिकार द्वारा चुनी गई प्रतिनिधि सरकार।
- **गणराज्य**: राज्य का प्रमुख निर्वाचित होता है, वंशानुगत नहीं।

### 5. Key Conceptual Pillars / मुख्य वैचारिक स्तंभ
**English:** The goals are: **Justice** (Social, Economic, Political); **Liberty** (Thought, Expression, Belief, Faith, Worship); **Equality** (Status and Opportunity); and **Fraternity** (assuring dignity of individual and unity/integrity of Nation).
**हिंदी:** लक्ष्य हैं: **न्याय** (सामाजिक, आर्थिक, राजनीतिक); **स्वतंत्रता** (विचार, अभिव्यक्ति, विश्वास, धर्म, उपासना); **समता** (प्रतिष्ठा और अवसर की); और **बंधुता** (व्यक्ति की गरिमा और राष्ट्र की एकता/अखंडता सुनिश्चित करने वाली)।

### 6. NCERT Connections & Foundations / एनसीईआरटी संबंध और बुनियादी बातें
**English:** Under Class XI Polity NCERT (Indian Constitution at Work), the Preamble summarizes the foundational values of democratic design.
**हिंदी:** कक्षा XI राजनीति विज्ञान एनसीईआरटी (कार्य में भारतीय संविधान) के तहत, प्रस्तावना लोकतांत्रिक संरचना के बुनियादी मूल्यों को संक्षेप में प्रस्तुत करती है।

### 7. Advanced Analytical Insights / उन्नत विश्लेषणात्मक अंतर्दृष्टि
**English:** The Preamble is non-justiciable. Courts cannot enforce its goals directly, but it acts as a key to interpreting ambiguous constitutional articles.
**हिंदी:** प्रस्तावना गैर-न्यायसंगत है। न्यायालय इसके लक्ष्यों को सीधे लागू नहीं कर सकते, लेकिन यह अस्पष्ट संवैधानिक अनुच्छेदों की व्याख्या करने में एक कुंजी का कार्य करती है।

### 8. Real-world Examples & Case Studies / वास्तविक उदाहरण और Case Studies
**English:** The addition of "Socialist" and "Secular" in 1976 was interpreted by the Supreme Court in the *SR Bommai* case to show that secularism was always inherent in the constitutional fabric.
**हिंदी:** 1976 में "समाजवादी" और "पंथनिरपेक्ष" शब्दों को जोड़ने की व्याख्या उच्चतम न्यायालय ने *एस.आर. बोम्मई* मामले में की, जिससे यह स्पष्ट हुआ कि धर्मनिरपेक्षता हमेशा से संवैधानिक ताने-बाने में अंतर्निहित थी।

### 9. Bilingual Key Terms Glossary / द्विभाषी प्रमुख शब्दावली
**English:** 
- *Fraternity*: Brotherhood.
- *Justiciable*: Enforceable in a court of law.
- *Secularism*: Separation of state and religion.
**हिंदी:** 
- *बंधुता*: भाईचारा।
- *वादयोग्य*: न्यायालय में प्रवर्तनीय।
- *पंथनिरपेक्षता*: राज्य और धर्म का पृथक्करण।

### 10. Exam Strategy & Weightage Analysis / परीक्षा रणनीति और अंक विश्लेषण
**English:** UPSC routinely tests the order of keywords and cases. The Keshvananda decision represents a fundamental concept for Civil Services GS Paper II.
**हिंदी:** संघ लोक सेवा आयोग (UPSC) नियमित रूप से प्रस्तावना के शब्दों के क्रम और न्यायिक मामलों का परीक्षण करता है। केशवानंद भारती निर्णय जीएस पेपर II के लिए एक बुनियादी अवधारणा है।

### 11. Quick-Recall Revision Summary / त्वरित-स्मरण पुनरावलोकन सारांश
**English:** Based on Objective Resolution. Amended once (42nd Amendment, 1976). Part of the basic structure. Not enforceable.
**हिंदी:** उद्देश्य प्रस्ताव पर आधारित। एक बार संशोधित (42वां संशोधन, 1976)। बुनियादी ढांचे का हिस्सा। न्यायालय में गैर-प्रवर्तनीय।

### 12. Bilingual Comparative Analysis / द्विभाषी तुलनात्मक विश्लेषण
**English:** Derived its philosophy from the US Constitution, but the ideals of Justice, Liberty, Equality, and Fraternity were inspired by the French Revolution.
**हिंदी:** इसकी दर्शन अमेरिकी संविधान से प्रेरित है, लेकिन न्याय, स्वतंत्रता, समता और बंधुता के आदर्श फ्रांसीसी क्रांति से प्रेरित थे।

### 13. Related Subjects & Interdisciplinary Links / संबंधित विषय और अंतःविषय संबंध
**English:** Mapped to Fundamental Rights, DPSP, and Constitutional History.
**हिंदी:** मौलिक अधिकारों, राज्य के नीति निर्देशक तत्वों (DPSP) और संवैधानिक इतिहास से सीधे जुड़ता है।`
  },
  {
    exam: 'UPSC',
    subject: 'Polity',
    topic: 'Indian Constitution',
    subtopic: 'Right to Equality (Articles 14–18)',
    introduction: 'The Right to Equality is a foundational pillar of the Indian democratic framework. Spanning Articles 14 to 18, it ensures that all citizens are treated equally under the law, preventing state discrimination and promoting social inclusion.',
    concepts: [
      'Equality before law (British origin)',
      'Equal protection of laws (US origin)',
      'Reasonable classification test',
      'Abolition of Untouchability (Article 17)',
      'Reservation guidelines under Article 15 & 16'
    ],
    importantFacts: [
      'Article 14 combines two distinct doctrines: negative concept of equality before law and positive concept of equal protection.',
      'Article 15 prohibits discrimination on only 5 grounds: religion, race, caste, sex, or place of birth.',
      'Article 17 is absolute; untouchability is abolished in any form and its practice is a punishable offence.',
      'Article 18 bans the state from conferring titles, but military and academic distinctions are exempted.'
    ],
    examples: [
      'The supreme court in Anwar Ali Sarkar (1952) established that the state can classify subjects for lawmaking, provided it passes the rational nexus test.',
      'Reservations for EWS (103rd Amendment) were upheld under Article 15(6) and 16(6) in the Janhit Abhiyan Case (2022).'
    ],
    tables: [
      {
        title: 'Articles of Right to Equality / समानता के अधिकार के अनुच्छेद',
        headers: ['Article / अनुच्छेद', 'Constitutional Mandate / संवैधानिक अधिदेश', 'Exceptions & Provisos / अपवाद और प्रावधान'],
        rows: [
          ['Article 14', 'Equality before law & equal protection of laws', 'Presidential immunities (Art 361), diplomatic immunity'],
          ['Article 15', 'Prohibition of discrimination on 5 specific grounds', 'Special provisions for women, children, and backward classes (EWS/OBC)'],
          ['Article 16', 'Equality of opportunity in public employment', 'Reservations for backward classes, residence criteria in state jobs'],
          ['Article 17', 'Abolition of Untouchability', 'No exceptions. Absolute in nature.'],
          ['Article 18', 'Abolition of titles', 'Military and academic titles are allowed (e.g. Bharat Ratna is not a title)']
        ]
      }
    ],
    revisionNotes: 'Equality: Art 14 (rule of law), Art 15 (no discrimination), Art 16 (employment opportunity), Art 17 (untouchability abolition - absolute), Art 18 (abolition of titles). Art 15 & 16 modified by 103rd Amendment for EWS.',
    pyqs: [
      {
        question: {
          en: 'Which Article of the Constitution of India abolishes Untouchability?',
          hi: 'भारत के संविधान का कौन सा अनुच्छेद अस्पृश्यता का उन्मूलन करता है?'
        },
        options: [
          { en: 'Article 15', hi: 'अनुच्छेद 15' },
          { en: 'Article 16', hi: 'अनुच्छेद 16' },
          { en: 'Article 17', hi: 'अनुच्छेद 17' },
          { en: 'Article 18', hi: 'अनुच्छेद 18' }
        ],
        answer: 2,
        explanation: {
          en: 'Article 17 of the Constitution of India explicitly abolishes untouchability and makes its practice a punishable offence.',
          hi: 'भारत के संविधान का अनुच्छेद 17 स्पष्ट रूप से अस्पृश्यता का उन्मूलन करता है और इसके आचरण को एक दंडनीय अपराध घोषित करता है।'
        },
        year: 2020
      }
    ],
    detailedExplanation: `### 1. Introduction & Overview / प्रस्तावना और अवलोकन
**English:** The Right to Equality (Articles 14–18) represents one of the core fundamental rights of the Indian Constitution, acting as the foundation of social democracy and civil liberties.
**हिंदी:** समानता का अधिकार (अनुच्छेद 14–18) भारतीय संविधान के मूल अधिकारों में से एक है, जो सामाजिक लोकतंत्र और नागरिक स्वतंत्रता के आधार के रूप में कार्य करता है।

### 2. Historical Context & Background / ऐतिहासिक पृष्ठभूमि
**English:** Influenced by the Universal Declaration of Human Rights and the historical caste-based social stratification of India, the makers of the Constitution designed these articles to eliminate systemic discrimination.
**हिंदी:** मानव अधिकारों की सार्वभौम घोषणा और भारत के ऐतिहासिक जाति-आधारित सामाजिक स्तरीकरण से प्रभावित होकर, संविधान निर्माताओं ने प्रणालीगत भेदभाव को समाप्त करने के लिए इन अनुच्छेदों को तैयार किया।

### 3. Core Concepts & Definitions / मुख्य अवधारणाएँ और परिभाषाएँ
**English:** Article 14 ensures that "the State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India."
**हिंदी:** अनुच्छेद 14 यह सुनिश्चित करता है कि "राज्य भारत के राज्यक्षेत्र में किसी व्यक्ति को विधि के समक्ष समता से या विधियों के समान संरक्षण से वंचित नहीं करेगा।"

### 4. Deep Academic Explanation / विस्तृत शैक्षणिक व्याख्या
**English:** 
- **Equality before Law**: A negative concept of British origin, meaning no individual is above the law.
- **Equal Protection of Laws**: A positive concept of American origin, meaning equal treatment under equal circumstances.
**हिंदी:** 
- **विधि के समक्ष समता**: ब्रिटिश मूल की एक नकारात्मक अवधारणा, जिसका अर्थ है कि कोई भी व्यक्ति कानून से ऊपर नहीं है।
- **विधियों का समान संरक्षण**: अमेरिकी मूल की एक सकारात्मक अवधारणा, जिसका अर्थ है समान परिस्थितियों में समान व्यवहार।

### 5. Key Conceptual Pillars / मुख्य वैचारिक स्तंभ
**English:** The doctrine of reasonable classification prevents class legislation, requiring a rational nexus between the classification and the object sought by the law.
**हिंदी:** तार्किक वर्गीकरण का सिद्धांत वर्ग विधान को रोकता है, जिसके लिए वर्गीकरण और कानून द्वारा प्राप्त किए जाने वाले उद्देश्य के बीच एक तर्कसंगत संबंध होना आवश्यक है।

### 6. NCERT Connections & Foundations / एनसीईआरटी संबंध और बुनियादी बातें
**English:** Mapped to Class XI Indian Constitution at Work, detail study of Fundamental Rights.
**हिंदी:** कक्षा XI कार्य में भारतीय संविधान के अंतर्गत, मौलिक अधिकारों का विस्तृत अध्ययन।

### 7. Advanced Analytical Insights / उन्नत विश्लेषणात्मक अंतर्दृष्टि
**English:** The expansion of Article 14 in the *E.P. Royappa* case established that equality is dynamic and "anti-arbitrariness" is its core indicator.
**हिंदी:** *ई.पी. रोयप्पा* मामले में अनुच्छेद 14 के विस्तार ने यह स्थापित किया कि समता एक गतिशील अवधारणा है और "मनमानापन का विरोध" इसका मूल संकेतक है।

### 8. Real-world Examples & Case Studies / वास्तविक उदाहरण और Case Studies
**English:** Landmark judgment *Indra Sawhney* (1992) restricted total reservations to 50% and introduced the concept of the "creamy layer" to ensure fair distribution.
**हिंदी:** ऐतिहासिक निर्णय *इन्द्रा साहनी* (1992) ने कुल आरक्षण को 50% तक सीमित कर दिया और निष्पक्ष वितरण सुनिश्चित करने के लिए "क्रिमी लेयर" की अवधारणा पेश की।

### 9. Bilingual Key Terms Glossary / द्विभाषी प्रमुख शब्दावली
**English:** 
- *Class Legislation*: Law that discriminates between classes arbitrarily.
- *Untouchability*: Social practice of ostracism based on birth.
**हिंदी:** 
- *वर्ग विधान*: वह कानून जो वर्गों के बीच मनमाने ढंग से भेदभाव करता है।
- *अस्पृश्यता*: जन्म के आधार पर सामाजिक बहिष्कार की प्रथा।

### 10. Exam Strategy & Weightage Analysis / परीक्षा रणनीति और अंक विश्लेषण
**English:** Questions on reservation articles (15 and 16) and their amendments (103rd, etc.) are highly recurring in CSE Prelims.
**हिंदी:** आरक्षण से संबंधित अनुच्छेदों (15 और 16) और उनके संशोधनों (103वें, आदि) पर प्रश्न सिविल सेवा प्रारंभिक परीक्षा में अत्यधिक पूछे जाते हैं।

### 11. Quick-Recall Revision Summary / त्वरित-स्मरण पुनरावलोकन सारांश
**English:** Articles 14–18. Art 14 (Equality/Protection), Art 15 (No discrimination), Art 16 (Job opportunity), Art 17 (Untouchability banned), Art 18 (No titles).
**हिंदी:** अनुच्छेद 14–18। अनु 14 (समता/संरक्षण), अनु 15 (कोई भेदभाव नहीं), अनु 16 (रोजगार अवसर), अनु 17 (अस्पृश्यता समाप्त), अनु 18 (उपाधियों का अंत)।

### 12. Bilingual Comparative Analysis / द्विभाषी तुलनात्मक विश्लेषण
**English:** Unlike the absolute nature of Article 17, Articles 15 and 16 contain specific enabling clauses to support affirmative action.
**हिंदी:** अनुच्छेद 17 की निरपेक्ष प्रकृति के विपरीत, अनुच्छेद 15 और 16 में सकारात्मक कार्रवाई का समर्थन करने के लिए विशिष्ट सक्षम खंड शामिल हैं।

### 13. Related Subjects & Interdisciplinary Links / संबंधित विषय और अंतःविषय संबंध
**English:** Connects to social justice, constitutional history, and human rights charters.
**हिंदी:** सामाजिक न्याय, संवैधानिक इतिहास और मानवाधिकार चार्टर से सीधे जुड़ता है।`
  },
  {
    exam: 'UPSC',
    subject: 'history',
    topic: 'Modern India',
    subtopic: 'Revolt of 1857 — Causes, Spread & Aftermath',
    introduction: 'The Revolt of 1857, also known as the Sepoy Mutiny or the First War of Indian Independence, was a widespread armed rebellion against the rule of the British East India Company. It marks a crucial turning point in the administrative and political history of modern India.',
    concepts: [
      'Imperialistic expansion policies',
      'Economic drain and agrarian distress',
      'Enfield Rifle cartridge dispute (Greased cartridges)',
      'Crown takeover (Act of 1858)'
    ],
    importantFacts: [
      'Began on 10th May 1857 at Meerut, with soldiers marching to Delhi.',
      'Mangal Pandey of the 34th Native Infantry revolted earlier at Barrackpore on 29th March 1857.',
      'Lord Canning was the Governor-General of India during the revolt.',
      'The British Parliament passed the Government of India Act 1858, ending the East India Company rule.'
    ],
    examples: [
      'Babu Kunwar Singh led the rebellion in Jagdishpur, Bihar, at the age of 80, showing brilliant military campaigns.',
      'Rani Laxmibai of Jhansi fought against the Annexation under the Doctrine of Lapse, dying on the battlefield.'
    ],
    tables: [
      {
        title: 'Centers of Revolt and Leaders / विद्रोह के केंद्र और नेता',
        headers: ['Center of Revolt / केंद्र', 'Indian Leader / भारतीय नेता', 'British Officer who Suppressed / दमनकर्ता ब्रिटिश अधिकारी'],
        rows: [
          ['Delhi', 'Bahadur Shah II / General Bakht Khan', 'John Nicholson / Hudson'],
          ['Kanpur', 'Nana Sahib / Tatya Tope', 'Colin Campbell'],
          ['Jhansi', 'Rani Laxmibai', 'Hugh Rose'],
          ['Lucknow', 'Begum Hazrat Mahal', 'Colin Campbell'],
          ['Jagdishpur (Bihar)', 'Kunwar Singh / Amar Singh', 'William Taylor / Vincent Eyre']
        ]
      }
    ],
    revisionNotes: 'Revolt 1857: Began Meerut May 10. Immediate cause: Greased cartridges. Gov Gen: Canning. Bihar leader: Kunwar Singh. Result: Act of 1858, Crown rule established, Secretary of State office created.',
    pyqs: [
      {
        question: {
          en: 'Who among the following was the leader of the Revolt of 1857 in Arrah, Bihar?',
          hi: 'निम्नलिखित में से कौन बिहार के आरा में 1857 के विद्रोह के नेता थे?'
        },
        options: [
          { en: 'Nana Sahib', hi: 'नाना साहिब' },
          { en: 'Kunwar Singh', hi: 'कुंवर सिंह' },
          { en: 'Khan Bahadur Khan', hi: 'खान बहादुर खान' },
          { en: 'Tantia Tope', hi: 'तात्या टोपे' }
        ],
        answer: 1,
        explanation: {
          en: 'Kunwar Singh, a local zamindar of Jagdishpur near Arrah, Bihar, led the 1857 rebellion in Bihar with outstanding courage.',
          hi: 'बिहार के आरा के पास जगदीशपुर के एक स्थानीय जमींदार कुंवर सिंह ने बिहार में 1857 के विद्रोह का नेतृत्व उत्कृष्ट साहस के साथ किया था।'
        },
        year: 2015
      }
    ],
    detailedExplanation: `### 1. Introduction & Overview / प्रस्तावना और अवलोकन
**English:** The Revolt of 1857 was the first major challenge to the British East India Company\'s hegemony in India, uniting sepoys, peasants, and local rulers in a massive armed conflict.
**हिंदी:** 1857 का विद्रोह भारत में ब्रिटिश ईस्ट इंडिया कंपनी के आधिपत्य के लिए पहली बड़ी चुनौती था, जिसने सिपाहियों, किसानों और स्थानीय शासकों को एक बड़े सशस्त्र संघर्ष में एकजुट किया।

### 2. Historical Context & Background / ऐतिहासिक पृष्ठभूमि
**English:** One hundred years of economic exploitation, political annexation, and social reforms by the British had built a massive wave of resentment among all sections of Indian society.
**हिंदी:** अंग्रेजों द्वारा सौ वर्षों के आर्थिक शोषण, राजनीतिक विलय और सामाजिक सुधारों ने भारतीय समाज के सभी वर्गों में भारी असंतोष पैदा कर दिया था।

### 3. Core Concepts & Definitions / मुख्य अवधारणाएँ और परिभाषाएँ
**English:** The rebellion was characterized by the Hindu-Muslim unity, where Hindu and Muslim sepoys declared Bahadur Shah Zafar as the Emperor of Hindustan.
**हिंदी:** इस विद्रोह की विशेषता हिंदू-मुस्लिम एकता थी, जहां हिंदू और मुस्लिम सिपाहियों ने बहादुर शाह जफर को हिंदुस्तान का सम्राट घोषित किया था।

### 4. Deep Academic Explanation / विस्तृत शैक्षणिक व्याख्या
**English:** The causes were:
- **Political**: Doctrine of Lapse and Subsidiary Alliance.
- **Economic**: Land revenue systems (Ryotwari, Mahalwari) ruined peasants.
- **Social**: Enactment of widow remarriage and ban on Sati created fear of forced religious conversion.
- **Military**: Discrimination in pay, overseas service travel (crossing seas broke caste rules).
**हिंदी:** इसके कारण थे:
- **राजनीतिक**: हड़प नीति (Doctrine of Lapse) और सहायक संधि।
- **आर्थिक**: भू-राजस्व प्रणालियों (रैयतवाड़ी, महालवाड़ी) ने किसानों को बर्बाद कर दिया।
- **सामाजिक**: विधवा पुनर्विवाह कानून और सती प्रथा पर प्रतिबंध ने जबरन धर्म परिवर्तन का भय पैदा किया।
- **सैन्य**: वेतन में भेदभाव, समुद्र पार सेवा यात्रा (समुद्र पार करने से जाति नियम टूटते थे)।

### 5. Key Conceptual Pillars / मुख्य वैचारिक स्तंभ
**English:** The immediate spark was the introduction of the Enfield Rifle. The paper cartridges had to be bitten off, and rumors spread that they were greased with cow and pig fat.
**हिंदी:** तात्कालिक कारण एनफील्ड राइफल का परिचय था। इसके कारतूसों को दांत से काटना पड़ता था, और अफवाह फैल गई कि वे गाय और सूअर की चर्बी से ग्रीस किए गए थे।

### 6. NCERT Connections & Foundations / एनसीईआरटी संबंध और बुनियादी बातें
**English:** Direct mapping with Class XII NCERT - Themes in Indian History (Part III), Chapter on Rebels and the Raj.
**हिंदी:** कक्षा XII एनसीईआरटी - भारतीय इतिहास के विषय (भाग III), विद्रोहियों और राज पर अध्याय के साथ सीधा संबंध।

### 7. Advanced Analytical Insights / उन्नत विश्लेषणात्मक अंतर्दृष्टि
**English:** Historians debate its nature. British writers called it a mere "Sepoy Mutiny," while V.D. Savarkar termed it the "First War of Indian Independence."
**हिंदी:** इतिहासकार इसके स्वरूप पर बहस करते हैं। ब्रिटिश लेखकों ने इसे केवल "सिपाही म्यूटिनी" कहा, जबकि वी.डी. सावरकर ने इसे "भारतीय स्वतंत्रता का पहला युद्ध" कहा।

### 8. Real-world Examples & Case Studies / वास्तविक उदाहरण और Case Studies
**English:** Bihar became a key center of revolt under Babu Kunwar Singh, who defeated British troops repeatedly in Jagdishpur, Azamgarh, and Ghazipur.
**हिंदी:** बाबू कुंवर सिंह के नेतृत्व में बिहार विद्रोह का एक प्रमुख केंद्र बन गया, जिन्होंने जगदीशपुर, आजमगढ़ और गाजीपुर में ब्रिटिश सेना को बार-बार हराया।

### 9. Bilingual Key Terms Glossary / द्विभाषी प्रमुख शब्दावली
**English:** 
- *Sepoy*: Indian soldier in British army.
- *Doctrine of Lapse*: Annexation policy if ruler died without male heir.
**हिंदी:** 
- *सिपाही*: ब्रिटिश सेना में भारतीय सैनिक।
- *हड़प नीति*: यदि शासक बिना पुरुष उत्तराधिकारी के मर जाता था, तो राज्य का विलय करने की नीति।

### 10. Exam Strategy & Weightage Analysis / परीक्षा रणनीति और अंक विश्लेषण
**English:** Core areas to focus on are Centers of Revolt, leadership, causes of failure, and the administrative shift under the Act of 1858.
**हिंदी:** ध्यान केंद्रित करने वाले मुख्य क्षेत्र विद्रोह के केंद्र, नेतृत्व, विफलता के कारण और 1858 के अधिनियम के तहत प्रशासनिक बदलाव हैं।

### 11. Quick-Recall Revision Summary / त्वरित-स्मरण पुनरावलोकन सारांश
**English:** Meerut May 10, Lord Canning, end of EIC, Government of India Act 1858, Queen Victoria's Proclamation.
**हिंदी:** मेरठ 10 मई, लॉर्ड कैनिंग, ईस्ट इंडिया कंपनी का अंत, भारत सरकार अधिनियम 1858, महारानी विक्टोरिया की उद्घोषणा।

### 12. Bilingual Comparative Analysis / द्विभाषी तुलनात्मक विश्लेषण
**English:** Unlike later movements led by Gandhi, the 1857 revolt was violent and lacked a centralized leadership or a clear post-revolt political vision.
**हिंदी:** गांधी के नेतृत्व वाले बाद के आंदोलनों के विपरीत, 1857 का विद्रोह हिंसक था और इसमें केंद्रीय नेतृत्व या स्पष्ट राजनीतिक विजन की कमी थी।

### 13. Related Subjects & Interdisciplinary Links / संबंधित विषय और अंतःविषय संबंध
**English:** Connects to colonial economy, military reforms, and rise of modern nationalism.
**हिंदी:** औपनिवेशिक अर्थव्यवस्था, सैन्य सुधारों और आधुनिक राष्ट्रवाद के उदय से जुड़ता है।`
  },
  {
    exam: 'BPSC',
    subject: 'history',
    topic: 'Bihar Special',
    subtopic: 'Freedom Movement in Bihar — Key Figures',
    introduction: 'Bihar played a legendary role in India\'s freedom struggle. From hosting the first satyagraha of Mahatma Gandhi in Champaran in 1917, Bihar produced national leaders who shaped the socialist, agrarian, and constitutional landscape of independent India.',
    concepts: [
      'Champaran Satyagraha leadership',
      'Babu Kunwar Singh military genius in 1857',
      'Swami Sahajanand peasant mobilization',
      'JP Narayan and the socialist struggle'
    ],
    importantFacts: [
      'Babu Kunwar Singh of Jagdishpur was the oldest general of the 1857 rebellion, fighting at the age of 80.',
      'Raj Kumar Shukla visited Mahatma Gandhi in Lucknow in 1916 to persuade him to study the indigo farmers plight in Champaran.',
      'Dr. Rajendra Prasad served as the president of the Constituent Assembly and became the first President of India.',
      'Swami Sahajanand Saraswati formed the Bihar Provincial Kisan Sabha in 1929.'
    ],
    examples: [
      'During the Quit India Movement in 1942, Jayaprakash Narayan escaped from Hazaribagh Jail to lead the underground Azad Dasta resistance.',
      'Shri Krishna Sinha and Anugrah Narayan Sinha led the Salt Satyagraha and civil disobedience movements in Bihar.'
    ],
    tables: [
      {
        title: 'Key Freedom Leaders of Bihar / बिहार के प्रमुख स्वतंत्रता सेनानी',
        headers: ['Leader Name / नेता', 'Key Movement / मुख्य आंदोलन', 'Major Contribution / मुख्य योगदान'],
        rows: [
          ['Babu Kunwar Singh', 'Revolt of 1857', 'Led armed uprising against British in Jagdishpur/Arrah'],
          ['Raj Kumar Shukla', 'Champaran Satyagraha (1917)', 'Persuaded Mahatma Gandhi to visit Champaran to stop indigo oppression'],
          ['Dr. Rajendra Prasad', 'Non-Cooperation, Civil Disobedience', 'Organizer of Champaran satyagraha, first President of India'],
          ['Swami Sahajanand', 'Peasant Movement (Kisan Sabha)', 'Mobilized farmers against zamindari oppression, All India Kisan Sabha founder'],
          ['Jayaprakash Narayan', 'Quit India (1942), JP Movement', 'Formed Azad Dasta underground resistance, led Total Revolution']
        ]
      }
    ],
    revisionNotes: 'Bihar Leaders: 1857 = Kunwar Singh. Champaran link = Raj Kumar Shukla. First Prez = Rajendra Prasad. Kisan Sabha = Swami Sahajanand. Azad Dasta = JP Narayan. First CM = Shri Krishna Sinha.',
    pyqs: [
      {
        question: {
          en: 'Who among the following invited Mahatma Gandhi to Champaran, Bihar?',
          hi: 'निम्नलिखित में से किसने महात्मा गांधी को चंपारण, बिहार आने के लिए आमंत्रित किया था?'
        },
        options: [
          { en: 'Dr. Rajendra Prasad', hi: 'डॉ. राजेंद्र प्रसाद' },
          { en: 'Raj Kumar Shukla', hi: 'राज कुमार शुक्ल' },
          { en: 'Mazhar-ul-Haque', hi: 'मज़हर-उल-हक़' },
          { en: 'J.B. Kripalani', hi: 'जे.बी. कृपलानी' }
        ],
        answer: 1,
        explanation: {
          en: 'Raj Kumar Shukla, a local indigo cultivator, met Mahatma Gandhi during the Lucknow session of Congress in 1916 and persuaded him to visit Champaran.',
          hi: 'स्थानीय नील उत्पादक राज कुमार शुक्ल ने 1916 में कांग्रेस के लखनऊ अधिवेशन के दौरान महात्मा गांधी से मुलाकात की और उन्हें चंपारण आने के लिए राजी किया।'
        },
        year: 2019
      }
    ],
    detailedExplanation: `### 1. Introduction & Overview / प्रस्तावना और अवलोकन
**English:** Bihar served as the laboratory for Mahatma Gandhi\'s Satyagraha. The region gave rise to iconic leaders whose roles were instrumental in national, peasant, and socialist struggles.
**हिंदी:** बिहार ने महात्मा गांधी के सत्याग्रह के लिए एक प्रयोगशाला के रूप में कार्य किया। इस क्षेत्र ने ऐसे प्रतिष्ठित नेताओं को जन्म दिया जिनकी भूमिकाएं राष्ट्रीय, किसान और समाजवादी संघर्षों में महत्वपूर्ण थीं।

### 2. Historical Context & Background / ऐतिहासिक पृष्ठभूमि
**English:** From the early resistance of Kunwar Singh in 1857 to the Champaran struggle against British Indigo planters, Bihar remained at the forefront of anti-colonial movements.
**हिंदी:** 1857 में कुंवर सिंह के शुरुआती प्रतिरोध से लेकर ब्रिटिश नील उत्पादकों के खिलाफ चंपारण संघर्ष तक, बिहार ब्रिटिश विरोधी आंदोलनों में हमेशा आगे रहा।

### 3. Core Concepts & Definitions / मुख्य अवधारणाएँ और परिभाषाएँ
**English:** Key struggles include the **Agrarian Mobilization** by Swami Sahajanand and the **Underground Socialist Resistance (Azad Dasta)** formed during the Quit India Movement.
**हिंदी:** प्रमुख संघर्षों में स्वामी सहजानंद द्वारा किया गया **किसान आंदोलन** और भारत छोड़ो आंदोलन के दौरान गठित **भूमिगत समाजवादी प्रतिरोध (आजाद दस्ता)** शामिल हैं।

### 4. Deep Academic Explanation / विस्तृत शैक्षणिक व्याख्या
**English:** Detailed leaders contributions:
- **Babu Kunwar Singh**: Displayed outstanding guerilla tactics, defeating British forces across Jagdishpur.
- **Raj Kumar Shukla**: Represented the agrarian voice, bringing national focus to peasant exploitation.
- **Dr. Rajendra Prasad**: Academic mastermind and peaceful organizer who unified Bihar\'s freedom efforts.
- **Jayaprakash Narayan**: Unified youth and introduced socialist principles into the national movement.
**हिंदी:** विस्तृत नेताओं का योगदान:
- **बाबू कुंवर सिंह**: जगदीशपुर में ब्रिटिश सेना को हराते हुए उत्कृष्ट गुरिल्ला युद्ध रणनीति का प्रदर्शन किया।
- **राज कुमार शुक्ल**: कृषि जगत की आवाज का प्रतिनिधित्व किया, जिससे किसानों के शोषण पर राष्ट्रीय ध्यान आकर्षित हुआ।
- **डॉ. राजेंद्र प्रसाद**: एक अकादमिक विचारक और शांतिपूर्ण संगठक जिन्होंने बिहार के स्वतंत्रता प्रयासों को एकजुट किया।
- **जयप्रकाश नारायण**: युवाओं को एकजुट किया और राष्ट्रीय आंदोलन में समाजवादी सिद्धांतों को शामिल किया।

### 5. Key Conceptual Pillars / मुख्य वैचारिक स्तंभ
**English:** Peasant empowerment and land reforms were central to Bihar\'s struggle, led by Swami Sahajanand Saraswati to fight zamindari exploitation.
**हिंदी:** जमींदारी शोषण के खिलाफ लड़ने के लिए स्वामी सहजानंद सरस्वती के नेतृत्व में किसान सशक्तिकरण और भूमि सुधार बिहार के स्वतंत्रता संघर्ष के केंद्र में थे।

### 6. NCERT Connections & Foundations / एनसीईआरटी संबंध और बुनियादी बातें
**English:** Mapped with Class XII Modern Indian History, chapters on Nationalism and Mahatma Gandhi.
**हिंदी:** कक्षा XII आधुनिक भारतीय इतिहास, राष्ट्रवाद और महात्मा गांधी पर अध्यायों के साथ संबंध।

### 7. Advanced Analytical Insights / उन्नत विश्लेषणात्मक अंतर्दृष्टि
**English:** Scholars emphasize that Bihar\'s freedom struggle was distinct due to its organic links with peasant grievances and class struggle, which later influenced the land reforms of post-independent India.
**हिंदी:** विद्वान इस बात पर जोर देते हैं कि बिहार का स्वतंत्रता संघर्ष किसान शिकायतों और वर्ग संघर्ष के साथ अपने जैविक संबंधों के कारण विशिष्ट था, जिसने बाद में स्वतंत्र भारत के भूमि सुधारों को प्रभावित किया।

### 8. Real-world Examples & Case Studies / वास्तविक उदाहरण और Case Studies
**English:** The escape of JP Narayan from Hazaribagh Central Jail on Diwali night in 1942 to organize the Azad Dasta resistance stands as a legendary act of underground rebellion.
**हिंदी:** 1942 में दिवाली की रात आजाद दस्ता प्रतिरोध को संगठित करने के लिए हजारीबाग सेंट्रल जेल से जेपी नारायण का भाग निकलना, भूमिगत विद्रोह का एक ऐतिहासिक उदाहरण है।

### 9. Bilingual Key Terms Glossary / द्विभाषी प्रमुख शब्दावली
**English:** 
- *Azad Dasta*: Underground guerrilla resistance group.
- *Kisan Sabha*: Peasant organization.
**हिंदी:** 
- *आजाद दस्ता*: भूमिगत गुरिल्ला प्रतिरोध समूह।
- *किसान सभा*: किसान संगठन।

### 10. Exam Strategy & Weightage Analysis / परीक्षा रणनीति और अंक विश्लेषण
**English:** BPSC exams regularly ask detailed questions about local leaders, dates of formation, and specific events in Bihar.
**हिंदी:** बीपीएससी परीक्षाओं में नियमित रूप से स्थानीय नेताओं, गठन की तारीखों और बिहार की विशिष्ट घटनाओं के बारे में प्रश्न पूछे जाते हैं।

### 11. Quick-Recall Revision Summary / त्वरित-स्मरण पुनरावलोकन सारांश
**English:** Kunwar Singh 1857, Raj Kumar Shukla 1917, Rajendra Prasad Constituent Assembly, Sahajanand Kisan Sabha, JP Narayan Azad Dasta.
**हिंदी:** कुंवर सिंह 1857, राज कुमार शुक्ल 1917, राजेंद्र प्रसाद संविधान सभा, सहजानंद किसान सभा, जेपी नारायण आजाद दस्ता।

### 12. Bilingual Comparative Analysis / द्विभाषी तुलनात्मक विश्लेषण
**English:** Unlike other states where urban elites led the Congress movement, Bihar\'s movement was heavily anchored by rural peasants and socialist leaders.
**हिंदी:** अन्य राज्यों के विपरीत जहाँ शहरी अभिजात वर्ग ने कांग्रेस आंदोलन का नेतृत्व किया, बिहार का आंदोलन ग्रामीण किसानों और समाजवादी नेताओं द्वारा गहराई से संचालित था।

### 13. Related Subjects & Interdisciplinary Links / संबंधित विषय और अंतःविषय संबंध
**English:** Links to modern land tenancy laws, peasant history, and post-independent Indian politics.
**हिंदी:** आधुनिक भूमि किरायेदारी कानूनों, किसान इतिहास और स्वतंत्र्योत्तर भारतीय राजनीति से जुड़ता है।`
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB at', MONGO_URI);
    
    for (const data of contentData) {
      const updated = await LearningContent.findOneAndUpdate(
        { subtopic: data.subtopic },
        data,
        { new: true, upsert: true }
      );
      console.log(`Upserted LearningContent for exam=${updated.exam}, subject=${updated.subject}, subtopic="${updated.subtopic}"`);
    }
    
    console.log('Academic updates seeded successfully.');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
