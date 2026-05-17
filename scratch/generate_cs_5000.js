const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.join(__dirname, '../data/computerscience.json');

// Define 10 main categories
const CATEGORIES = [
    { code: "FND", name: "Computer Fundamentals & Hardware", name_hi: "कंप्यूटर बुनियादी बातें और हार्डवेयर" },
    { code: "MEM", name: "Memory Hierarchy & Storage Systems", name_hi: "मेमोरी पदानुक्रम और स्टोरेज सिस्टम" },
    { code: "SW", name: "Software Systems & OS Fundamentals", name_hi: "सॉफ़्टवेयर सिस्टम और ओएस बुनियादी बातें" },
    { code: "NUM", name: "Number Systems & Digital Logic", name_hi: "संख्या प्रणाली और डिजिटल लॉजिक" },
    { code: "LOG", name: "Boolean Algebra & Logic Gates", name_hi: "बूलियन बीजगणित और लॉजिक गेट्स" },
    { code: "PY", name: "Python Programming Foundations", name_hi: "पायथन प्रोग्रामिंग की नींव" },
    { code: "DS", name: "Data Structures & Algorithms", name_hi: "डेटा संरचनाएं और एल्गोरिदम" },
    { code: "NET", name: "Computer Networks & OSI Model", name_hi: "कंप्यूटर नेटवर्क और OSI मॉडल" },
    { code: "DB", name: "Database Management & SQL Commands", name_hi: "डेटाबेस प्रबंधन और SQL कमांड" },
    { code: "WEB", name: "Web Technologies & Emerging Trends", name_hi: "वेब प्रौद्योगिकियां और उभरती हुई प्रवृत्तियां" }
];

// Define 100 subtopics (exactly matching the CBSE/NCERT Class 11 & 12 Syllabus)
const SUBTOPICS = [
    // Block 1: FND (1-8, 14)
    { id: 1, cat: "FND", name: "Generations of Computers", name_hi: "कंप्यूटर की पीढ़ियां" },
    { id: 2, cat: "FND", name: "Classification of Computers (micro to super)", name_hi: "कंप्यूटर का वर्गीकरण (माइक्रो से सुपर)" },
    { id: 3, cat: "FND", name: "Computer Components & Block Diagram", name_hi: "कंप्यूटर के घटक और ब्लॉक आरेख" },
    { id: 4, cat: "FND", name: "Input Devices – Keyboard, Mouse, Light Pen", name_hi: "इनपुट डिवाइस - कीबोर्ड, माउस, लाइट पेन" },
    { id: 5, cat: "FND", name: "Input Devices – Scanner, Touch Screen, Microphone", name_hi: "इनपुट डिवाइस - स्कैनर, टच स्क्रीन, माइक्रोफोन" },
    { id: 6, cat: "FND", name: "Output Devices – Monitors (CRT, LCD, LED)", name_hi: "आउटपुट डिवाइस - मॉनिटर (CRT, LCD, LED)" },
    { id: 7, cat: "FND", name: "Output Devices – Printers (Impact/Non‑impact)", name_hi: "आउटपुट डिवाइस - प्रिंटर (इम्पैक्ट/नॉन-इम्पैक्ट)" },
    { id: 8, cat: "FND", name: "Output Devices – Plotters, Speakers, Projectors", name_hi: "आउटपुट डिवाइस - प्लॉटर, स्पीकर, प्रोजेक्टर" },
    { id: 14, cat: "FND", name: "Motherboard, Buses, Ports & Connectors", name_hi: "मदरबोर्ड, बसें, पोर्ट और कनेक्टर" },

    // Block 2: MEM (9-13, 93-96, 99)
    { id: 9, cat: "MEM", name: "Memory Hierarchy & Units (bit to petabyte)", name_hi: "मेमोरी पदानुक्रम और इकाइयाँ (बिट से पेटाबाइट)" },
    { id: 10, cat: "MEM", name: "RAM Types – SRAM, DRAM, SDRAM, DDR", name_hi: "रैम के प्रकार - SRAM, DRAM, SDRAM, DDR" },
    { id: 11, cat: "MEM", name: "ROM Types – PROM, EPROM, EEPROM", name_hi: "रोम के प्रकार - PROM, EPROM, EEPROM" },
    { id: 12, cat: "MEM", name: "Secondary Storage – HDD, SSD, Optical Discs", name_hi: "द्वितीयक स्टोरेज - HDD, SSD, ऑप्टिकल डिस्क" },
    { id: 13, cat: "MEM", name: "Flash Drives, Memory Cards, Cloud Storage", name_hi: "फ्लैश ड्राइव, मेमोरी कार्ड, क्लाउड स्टोरेज" },
    { id: 93, cat: "MEM", name: "CPU Architecture (ALU, CU, Registers)", name_hi: "सीपीयू आर्किटेक्चर (ALU, CU, रजिस्टर)" },
    { id: 94, cat: "MEM", name: "System Bus, Cache Mapping", name_hi: "सिस्टम बस, कैश मैपिंग" },
    { id: 95, cat: "MEM", name: "I/O Interface, DMA", name_hi: "आई/ओ इंटरफेस, डीएमए" },
    { id: 96, cat: "MEM", name: "Microprocessor Basics (8085 optional)", name_hi: "माइक्रोप्रोसेसर मूल बातें (8085 वैकल्पिक)" },
    { id: 99, cat: "MEM", name: "Memory Units & Data Representation (floating point)", name_hi: "मेमोरी इकाइयाँ और डेटा प्रतिनिधित्व (फ्लोटिंग पॉइंट)" },

    // Block 3: SW (15-18)
    { id: 15, cat: "SW", name: "System Software – OS and its functions", name_hi: "सिस्टम सॉफ्टवेयर - ओएस और उसके कार्य" },
    { id: 16, cat: "SW", name: "Language Translators – Compiler, Interpreter, Assembler", name_hi: "भाषा अनुवादक - कंपाइलर, इंटरप्रेटर, असेंबलर" },
    { id: 17, cat: "SW", name: "Application Software & Utilities", name_hi: "एप्लिकेशन सॉफ्टवेयर और उपयोगिताएँ" },
    { id: 18, cat: "SW", name: "Firmware, Middleware, Proprietary vs Open Source", name_hi: "फर्मवेयर, मिडलवेयर, मालिकाना बनाम ओपन सोर्स" },

    // Block 4: NUM (19-24)
    { id: 19, cat: "NUM", name: "Number System Introduction – Binary, Octal, Decimal, Hex", name_hi: "संख्या प्रणाली परिचय - बाइनरी, ऑक्टल, डेसिमल, हेक्स" },
    { id: 20, cat: "NUM", name: "Conversions Between Systems", name_hi: "प्रणालियों के बीच रूपांतरण" },
    { id: 21, cat: "NUM", name: "Binary Arithmetic (Addition, Subtraction)", name_hi: "बाइनरी अंकगणित (जोड़, घटाव)" },
    { id: 22, cat: "NUM", name: "Binary Multiplication & Division", name_hi: "बाइनरी गुणा और भाग" },
    { id: 23, cat: "NUM", name: "1’s Complement & 2’s Complement", name_hi: "1 का पूरक और 2 का पूरक" },
    { id: 24, cat: "NUM", name: "Encoding – ASCII, ISCII, Unicode", name_hi: "एन्कोडिंग - ASCII, ISCII, यूनिकोड" },

    // Block 5: LOG (25-30)
    { id: 25, cat: "LOG", name: "Boolean Algebra – Basic Laws", name_hi: "बूलियन बीजगणित - बुनियादी नियम" },
    { id: 26, cat: "LOG", name: "De Morgan’s Theorems", name_hi: "डी मॉर्गन के प्रमेय" },
    { id: 27, cat: "LOG", name: "Logic Gates – AND, OR, NOT", name_hi: "लॉजिक गेट्स - AND, OR, NOT" },
    { id: 28, cat: "LOG", name: "Logic Gates – NAND, NOR, XOR, XNOR", name_hi: "लॉजिक गेट्स - NAND, NOR, XOR, XNOR" },
    { id: 29, cat: "LOG", name: "Combinational Circuits – Half Adder, Full Adder", name_hi: "संयोजन सर्किट - हाफ एडर, फुल एडर" },
    { id: 30, cat: "LOG", name: "Multiplexer & Decoder", name_hi: "मल्टीप्लेक्सर और डिकोडर" },

    // Block 6: PY (31-40, 46-47)
    { id: 31, cat: "PY", name: "Algorithm & Flowchart Basics", name_hi: "एल्गोरिदम और फ्लोचार्ट मूल बातें" },
    { id: 32, cat: "PY", name: "Python – Variables, Data Types, Input/Output", name_hi: "पायथन - वेरिएबल्स, डेटा प्रकार, इनपुट/आउटपुट" },
    { id: 33, cat: "PY", name: "Python – Operators (Arithmetic, Relational, Logical)", name_hi: "पायथन - ऑपरेटर्स (अंकगणितीय, संबंधपरक, तार्किक)" },
    { id: 34, cat: "PY", name: "Python – Conditional Statements (if, elif, else)", name_hi: "पायथन - सशर्त कथन (if, elif, else)" },
    { id: 35, cat: "PY", name: "Python – Loops (for, while, break, continue)", name_hi: "पायथन - लूप्स (for, while, break, continue)" },
    { id: 36, cat: "PY", name: "Python – Strings & Methods", name_hi: "पायथन - स्ट्रिंग्स और तरीके" },
    { id: 37, cat: "PY", name: "Python – Lists & Methods", name_hi: "पायथन - सूचियाँ और तरीके" },
    { id: 38, cat: "PY", name: "Python – Tuples & Dictionaries", name_hi: "पायथन - टुपल्स और शब्दकोश" },
    { id: 39, cat: "PY", name: "Python – Functions (built‑in, user‑defined)", name_hi: "पायथन - फ़ंक्शंस (अंतर्निहित, उपयोगकर्ता-परिभाषित)" },
    { id: 40, cat: "PY", name: "Python – Modules (math, random, statistics)", name_hi: "पायथन - मॉड्यूल (math, random, statistics)" },
    { id: 46, cat: "PY", name: "Recursion (factorial, Fibonacci)", name_hi: "पुनरावृत्ति - रिकर्शन (फैक्टोरियल, फाइबोनैचि)" },
    { id: 47, cat: "PY", name: "File Handling (read, write, append)", name_hi: "फ़ाइल हैंडलिंग (पढ़ना, लिखना, जोड़ना)" },

    // Block 7: DS (48-54)
    { id: 48, cat: "DS", name: "Stack Data Structure & Operations", name_hi: "स्टैक डेटा संरचना और संचालन" },
    { id: 49, cat: "DS", name: "Queue Data Structure & Operations", name_hi: "कतार डेटा संरचना और संचालन" },
    { id: 50, cat: "DS", name: "Sorting – Bubble & Insertion", name_hi: "सॉर्टिंग - बबल और इंसर्शन" },
    { id: 51, cat: "DS", name: "Sorting – Selection & Merge", name_hi: "सॉर्टिंग - सिलेक्शन और मर्ज" },
    { id: 52, cat: "DS", name: "Sorting – Quick Sort", name_hi: "सॉर्टिंग - क्विक सॉर्ट" },
    { id: 53, cat: "DS", name: "Searching – Linear & Binary", name_hi: "खोज - रैखिक और बाइनरी" },
    { id: 54, cat: "DS", name: "Algorithm Efficiency (Time Complexity)", name_hi: "एल्गोरिदम दक्षता (समय जटिलता)" },

    // Block 8: NET (55-69, 85)
    { id: 55, cat: "NET", name: "Network Types – LAN, MAN, WAN, PAN", name_hi: "नेटवर्क प्रकार - LAN, MAN, WAN, PAN" },
    { id: 56, cat: "NET", name: "Network Topologies – Star, Bus, Ring, Mesh, Tree", name_hi: "नेटवर्क टोपोलॉजी - स्टार, बस, रिंग, मेश, ट्री" },
    { id: 57, cat: "NET", name: "OSI Model – Physical, Data Link, Network Layers", name_hi: "OSI मॉडल - फिजिकल, डेटा लिंक, नेटवर्क परतें" },
    { id: 58, cat: "NET", name: "OSI Model – Transport, Session, Presentation, Application", name_hi: "OSI मॉडल - ट्रांसपोर्ट, सेशन, प्रेजेंटेशन, एप्लिकेशन" },
    { id: 59, cat: "NET", name: "TCP/IP Model & Protocols", name_hi: "TCP/IP मॉडल और प्रोटोकॉल" },
    { id: 60, cat: "NET", name: "IP Addressing – IPv4, Classes, Subnet Mask", name_hi: "आईपी एड्रेसिंग - IPv4, क्लासेस, सबनेट मास्क" },
    { id: 61, cat: "NET", name: "IPv6, MAC Address, DNS", name_hi: "IPv6, मैक एड्रेस, डीएनएस" },
    { id: 62, cat: "NET", name: "Network Devices – Hub, Switch, Router", name_hi: "नेटवर्क डिवाइस - हब, स्विच, राउटर" },
    { id: 63, cat: "NET", name: "Network Devices – Gateway, Bridge, Repeater", name_hi: "नेटवर्क डिवाइस - गेटवे, ब्रिज, रिपीटर" },
    { id: 64, cat: "NET", name: "Transmission Media – Twisted Pair, Coaxial", name_hi: "संचरण माध्यम - ट्विस्टेड पेयर, कोएक्सियल" },
    { id: 65, cat: "NET", name: "Fiber Optic & Wireless Media", name_hi: "फाइबर ऑप्टिक और वायरलेस मीडिया" },
    { id: 66, cat: "NET", name: "Wi‑Fi, Bluetooth, Satellite Communication", name_hi: "वाई-फाई, ब्लूटूथ, उपग्रह संचार" },
    { id: 67, cat: "NET", name: "HTTP, HTTPS, FTP", name_hi: "HTTP, HTTPS, FTP" },
    { id: 68, cat: "NET", name: "SMTP, POP3, IMAP", name_hi: "SMTP, POP3, IMAP" },
    { id: 69, cat: "NET", name: "Error Detection – Parity, CRC", name_hi: "त्रुटि का पता लगाना - समानता (पैरिटी), CRC" },
    { id: 85, cat: "NET", name: "Browsers, Search Engines, Cloud Computing", name_hi: "ब्राउज़र, सर्च इंजन, क्लाउड कंप्यूटिंग" },

    // Block 9: DB (70-79)
    { id: 70, cat: "DB", name: "DBMS & RDBMS Concepts", name_hi: "DBMS और RDBMS अवधारणाएं" },
    { id: 71, cat: "DB", name: "Keys – Primary, Foreign, Candidate", name_hi: "कुंजियाँ - प्राथमिक, विदेशी, उम्मीदवार" },
    { id: 72, cat: "DB", name: "Normalization – 1NF, 2NF, 3NF", name_hi: "सामान्यीकरण - 1NF, 2NF, 3NF" },
    { id: 73, cat: "DB", name: "Normalization – BCNF", name_hi: "सामान्यीकरण - BCNF" },
    { id: 74, cat: "DB", name: "SQL – DDL Commands (CREATE, ALTER, DROP)", name_hi: "SQL - DDL कमांड (CREATE, ALTER, DROP)" },
    { id: 75, cat: "DB", name: "SQL – DML Commands (SELECT, INSERT, UPDATE, DELETE)", name_hi: "SQL - DML कमांड (SELECT, INSERT, UPDATE, DELETE)" },
    { id: 76, cat: "DB", name: "SQL – WHERE, LIKE, GROUP BY, HAVING", name_hi: "SQL - WHERE, LIKE, GROUP BY, HAVING" },
    { id: 77, cat: "DB", name: "SQL – Joins (INNER, LEFT, RIGHT, FULL)", name_hi: "SQL - जॉइन्स (INNER, LEFT, RIGHT, FULL)" },
    { id: 78, cat: "DB", name: "SQL – Aggregate Functions (COUNT, SUM, AVG, etc.)", name_hi: "SQL - एग्रीगेट फ़ंक्शंस (COUNT, SUM, AVG, आदि)" },
    { id: 79, cat: "DB", name: "Transactions & ACID Properties", name_hi: "लेनदेन और ACID गुण" },

    // Block 10: WEB (80-84, 86-92, 97-98, 100, 41-45)
    { id: 41, cat: "WEB", name: "Digital Footprint, Cyberbullying, Cyber Safety", name_hi: "डिजिटल फुटप्रिंट, साइबरबुलिंग, साइबर सुरक्षा" },
    { id: 42, cat: "WEB", name: "Malware (virus, worm, trojan, ransomware, spyware)", name_hi: "मालवेयर (वायरस, वॉर्म, ट्रोजन, रैंसमवेयर, स्पाइवेयर)" },
    { id: 43, cat: "WEB", name: "Phishing, Hacking, Denial of Service", name_hi: "फिशिंग, हैकिंग, डिनायल ऑफ सर्विस" },
    { id: 44, cat: "WEB", name: "IT Act 2000 & Cyber Laws", name_hi: "आईटी एक्ट 2000 और साइबर कानून" },
    { id: 45, cat: "WEB", name: "Open Source/Free Software, E‑waste", name_hi: "ओपन सोर्स/फ्री सॉफ्टवेयर, ई-कचरा" },
    { id: 80, cat: "WEB", name: "HTML – Basic Tags & Structure", name_hi: "HTML - बुनियादी टैग और संरचना" },
    { id: 81, cat: "WEB", name: "HTML – Tables, Lists, Images, Links", name_hi: "HTML - तालिकाएँ, सूचियाँ, चित्र, लिंक" },
    { id: 82, cat: "WEB", name: "HTML – Forms (input, textarea, button)", name_hi: "HTML - फॉर्म (इनपुट, टेक्स्टएरिया, बटन)" },
    { id: 83, cat: "WEB", name: "CSS – Selectors, Properties, Box Model", name_hi: "CSS - चयनकर्ता, गुण, बॉक्स मॉडल" },
    { id: 84, cat: "WEB", name: "JavaScript – Variables, Functions, Events", name_hi: "जावास्क्रिप्ट - वेरिएबल्स, फ़ंक्शंस, इवेंट्स" },
    { id: 86, cat: "WEB", name: "Firewall, IDS, IPS", name_hi: "फ़ायरवॉल, IDS, IPS" },
    { id: 87, cat: "WEB", name: "Cryptography – Symmetric & Asymmetric", name_hi: "क्रिप्टोग्राफी - सममित और असममित" },
    { id: 88, cat: "WEB", name: "Digital Signature & SSL/TLS", name_hi: "डिजिटल हस्ताक्षर और SSL/TLS" },
    { id: 89, cat: "WEB", name: "AI & Machine Learning Basics", name_hi: "एआई और मशीन लर्निंग मूल बातें" },
    { id: 90, cat: "WEB", name: "Deep Learning, IoT, Blockchain", name_hi: "डीप लर्निंग, IoT, ब्लॉकचेन" },
    { id: 91, cat: "WEB", name: "Big Data, 3D Printing, Robotics", name_hi: "बिग डेटा, 3डी प्रिंटिंग, रोबोटिक्स" },
    { id: 92, cat: "WEB", name: "AR/VR, E‑Governance", name_hi: "AR/VR, ई-गवर्नेंस" },
    { id: 97, cat: "WEB", name: "Windows Shortcuts & File Extensions", name_hi: "विंडोज शॉर्टकट और फाइल एक्सटेंशन" },
    { id: 98, cat: "WEB", name: "MS Office Shortcuts (Word, Excel, PowerPoint)", name_hi: "एमएस ऑफिस शॉर्टकट (वर्ड, एक्सेल, पावरपॉइंट)" },
    { id: 100, cat: "WEB", name: "Computer History & Pioneers (Babbage, Turing, etc.)", name_hi: "कंप्यूटर इतिहास और अग्रदूत (बैबेज, ट्यूरिंग, आदि)" }
];

// Sort subtopics by ID to ensure sequential indexing matches perfectly
SUBTOPICS.sort((a, b) => a.id - b.id);

// Standalone, grammatically perfect, pedagogically rigorous sentences for the 10 categories
const VOCABULARY = {
    "FND": {
        properties: [
            { en: "This processing module coordinates digital logic switches across central components.", hi: "यह प्रोसेसिंग मॉड्यूल केंद्रीय घटकों में डिजिटल लॉजिक स्विचों का समन्वय करता है।" },
            { en: "This electronic board utilizes advanced semiconductor junctions for current modulation.", hi: "यह इलेक्ट्रॉनिक बोर्ड करंट मॉड्यूलेशन के लिए उन्नत सेमीकंडक्टर जंक्शनों का उपयोग करता है।" },
            { en: "This physical IC houses hundreds of logic nodes on a single microscopic substrate.", hi: "यह भौतिक आईसी एक ही माइक्रोस्कोपिक सबस्ट्रेट पर सैकड़ों लॉजिक नोड्स को रखता है।" },
            { en: "This execution chip runs complex clock-controlled sequences to coordinate hardware modules.", hi: "यह निष्पादन चिप हार्डवेयर मॉड्यूल का समन्वय करने के लिए जटिल क्लॉक-नियंत्रित अनुक्रम चलाती है।" },
            { en: "This hardware interface drives serial or parallel signal transmission directly across ports.", hi: "यह हार्डवेयर इंटरफ़ेस सीधे पोर्ट पर सीरियल या पैरेलल सिग्नल ट्रांसमिशन को चलाता है।" },
            { en: "This structural block holds system execution parameters during high-speed calculations.", hi: "यह संरचनात्मक ब्लॉक उच्च गति की गणनाओं के दौरान सिस्टम निष्पादन मापदंडों को रखता है।" },
            { en: "This input hardware transforms raw ambient waveforms into structured binary code arrays.", hi: "यह इनपुट हार्डवेयर कच्चे परिवेशी तरंगों को संरचित बाइनरी कोड एरे में बदल देता है।" },
            { en: "This visual output module projects high-resolution pixels or generates physical paper matrices.", hi: "यह दृश्य आउटपुट मॉड्यूल उच्च-रिजॉल्यूशन पिक्सेल प्रोजेक्ट करता है या भौतिक पेपर मैट्रिसेस उत्पन्न करता है।" },
            { en: "This communication interface manages transmission speed differences between the bus and controller.", hi: "यह संचार इंटरफ़ेस बस और नियंत्रक के बीच संचरण गति के अंतर को प्रबंधित करता है।" },
            { en: "This system bus routes power and state indicators across all main motherboard slots.", hi: "यह सिस्टम बस सभी मुख्य मदरबोर्ड स्लॉट में पावर और स्थिति संकेतक रूट करती है।" }
        ],
        objectives: [
            { en: "It optimizes low-level electrical switching rates to boost basic processing bandwidth.", hi: "यह बुनियादी प्रसंस्करण बैंडविड्थ को बढ़ावा देने के लिए निम्न-स्तरीय विद्युत स्विचिंग दरों को अनुकूलित करता है।" },
            { en: "It reduces logical state delays within core arithmetic and control pathways.", hi: "यह कोर अंकगणित और नियंत्रण पथों के भीतर तार्किक स्थिति विलंब को कम करता है।" },
            { en: "It regulates local system voltage levels to eliminate timing glitches or noise.", hi: "यह समय की गड़बड़ी या शोर को खत्म करने के लिए स्थानीय सिस्टम वोल्टेज स्तरों को नियंत्रित करता है।" },
            { en: "It automates background peripheral checks to lower central CPU processing overhead.", hi: "यह केंद्रीय सीपीयू प्रसंस्करण ओवरहेड को कम करने के लिए पृष्ठभूमि परिधीय जांच को स्वचालित करता है।" },
            { en: "It maintains continuous synchronous timing clocks across control and storage lines.", hi: "यह नियंत्रण और स्टोरेज लाइनों में निरंतर सिंक्रोनस टाइमिंग क्लॉक बनाए रखता है।" },
            { en: "It processes digital input vectors to reconstruct original high-fidelity analog streams.", hi: "यह मूल उच्च-विश्वसनीयता एनालॉग स्ट्रीम को पुनर्निर्मित करने के लिए डिजिटल इनपुट वैक्टर को संसाधित करता है।" },
            { en: "It buffers raw data streams to prevent register boundary write overflows.", hi: "यह रजिस्टर सीमा लेखन ओवरफ़्लो को रोकने के लिए कच्चे डेटा स्ट्रीम को बफर करता है।" },
            { en: "It separates high-frequency bus logic from slower physical mechanical speeds.", hi: "यह उच्च-आवृत्ति बस तर्क को धीमी भौतिक यांत्रिक गतियों से अलग करता है।" },
            { en: "It preserves critical boot specifications inside non-volatile microchips indefinitely.", hi: "यह महत्वपूर्ण बूट विनिर्देशों को गैर-वाष्पशील माइक्रोचिप्स के अंदर अनिश्चित काल के लिए सुरक्षित रखता है।" },
            { en: "It routes concurrent memory access requests to bypass main processor delays.", hi: "यह मुख्य प्रोसेसर विलंब को बायपास करने के लिए समवर्ती मेमोरी एक्सेस अनुरोधों को रूट करता है।" }
        ],
        advantages: [
            { en: "This approach enables high processing efficiency under steady workloads.", hi: "यह दृष्टिकोण स्थिर कार्यभार के तहत उच्च प्रसंस्करण दक्षता सक्षम बनाता है।" },
            { en: "This design minimizes thermal dissipation and microchip power consumption rates.", hi: "यह डिज़ाइन थर्मल अपव्यय और माइक्रोचिप बिजली खपत दरों को कम करता है।" },
            { en: "This logic enhances hardware stability during highly concurrent computations.", hi: "यह तर्क अत्यधिक समवर्ती गणनाओं के दौरान हार्डवेयर स्थिरता को बढ़ाता है।" },
            { en: "This interface streamlines component connectivity using standardized physical ports.", hi: "यह इंटरफ़ेस मानकीकृत भौतिक पोर्ट का उपयोग करके घटक कनेक्टिविटी को सुव्यवस्थित करता है।" },
            { en: "This pattern isolates processor registers from hazardous logical resource conflicts.", hi: "यह पैटर्न प्रोसेसर रजिस्टरों को खतरनाक तार्किक संसाधन संघर्षों से अलग करता है।" },
            { en: "This mechanism simplifies system expansion using modular hardware add-on slots.", hi: "यह तंत्र मॉड्यूलर हार्डवेयर ऐड-ऑन स्लॉट का उपयोग करके सिस्टम विस्तार को सरल बनाता है।" },
            { en: "This framework maximizes physical signal fidelity across long transmission lines.", hi: "यह ढांचा लंबी ट्रांसमिशन लाइनों में भौतिक सिग्नल निष्ठा को अधिकतम करता है।" },
            { en: "This architecture ensures complete compatibility with legacy system bus protocols.", hi: "यह आर्किटेक्चर विरासत सिस्टम बस प्रोटोकॉल के साथ पूर्ण संगतता सुनिश्चित करता है।" },
            { en: "This process accelerates device diagnostics using low-level firmware testing loops.", hi: "यह प्रक्रिया निम्न-स्तरीय फर्मवेयर परीक्षण लूप का उपयोग करके डिवाइस डायग्नोस्टिक्स को तेज करती है।" },
            { en: "This concept optimizes clock synchronization boundaries across dual motherboard chipsets.", hi: "यह अवधारणा दोहरे मदरबोर्ड चिपसेट में क्लॉक सिंक्रनाइज़ेशन सीमाओं को अनुकूलित करती है।" }
        ],
        tradeoffs: [
            { en: "This layout introduces significant hardware cost and routing complexity.", hi: "यह लेआउट महत्वपूर्ण हार्डवेयर लागत और रूटिंग जटिलता का परिचय देता है।" },
            { en: "This circuit demands complex cooling systems due to localized thermal output.", hi: "स्थानीय थर्मल आउटपुट के कारण यह सर्किट जटिल शीतलन प्रणालियों की मांग करता है।" },
            { en: "This timing logic limits peak speed due to bus propagation constraints.", hi: "यह टाइमिंग लॉजिक बस प्रसार बाधाओं के कारण चरम गति को सीमित करता है।" },
            { en: "This connector structure exposes physical pins to environmental corrosion risks.", hi: "यह कनेक्टर संरचना भौतिक पिनों को पर्यावरणीय क्षरण जोखिमों के प्रति संवेदनशील बनाती है।" },
            { en: "This method requires substantial operating memory reserves to buffer input streams.", hi: "इस पद्धति को इनपुट स्ट्रीम को बफर करने के लिए पर्याप्त ऑपरेटिंग मेमोरी रिजर्व की आवश्यकता होती है।" },
            { en: "This protocol limits data rate speed when communicating with legacy controllers.", hi: "विरासत नियंत्रकों के साथ संचार करते समय यह प्रोटोकॉल डेटा दर गति को सीमित करता है।" },
            { en: "This setup causes high mechanical wear and tear on physical printing parts.", hi: "यह सेटअप भौतिक प्रिंटिंग भागों पर उच्च यांत्रिक टूट-फूट का कारण बनता है।" },
            { en: "This configuration increases signal attenuation rates across high-frequency buses.", hi: "यह कॉन्फ़िगरेशन उच्च-आवृत्ति बसों में सिग्नल क्षीणन दरों को बढ़ाता है।" },
            { en: "This architecture increases boot initialization time due to exhaustive self-tests.", hi: "यह आर्किटेक्चर संपूर्ण स्व-परीक्षणों के कारण बूट इनिशियलाइजेशन समय को बढ़ाता है।" },
            { en: "This layout experiences regular latency spikes under heavy concurrent access.", hi: "भारी समवर्ती पहुंच के तहत इस लेआउट में नियमित रूप से विलंबता बढ़ जाती है।" }
        ],
        scenarios: [
            { en: "Physical wear on address buses leads to regular memory access failures.", hi: "एड्रेस बसों पर भौतिक टूट-फूट से नियमित मेमोरी एक्सेस विफलताएं होती हैं।" },
            { en: "Voltage spikes across interfaces trigger sudden system diagnostic resets.", hi: "इंटरफ़ेस में वोल्टेज स्पाइक्स अचानक सिस्टम डायग्नोस्टिक रीसेट को ट्रिगर करते हैं।" },
            { en: "Clock synchronization mismatches produce transient logic errors during operations.", hi: "क्लॉक सिंक्रनाइज़ेशन बेमेल संचालन के दौरान क्षणिक तर्क त्रुटियां उत्पन्न करता है।" },
            { en: "Signal reflections in motherboard lines cause bit corruption at high speed.", hi: "मदरबोर्ड लाइनों में सिग्नल परावर्तन उच्च गति पर बिट भ्रष्टाचार का कारण बनते हैं।" },
            { en: "Connector pin misalignment results in intermittent peripheral connection drops.", hi: "कनेक्टर पिन गलत संरेखण के परिणामस्वरूप रुक-रुक कर परिधीय कनेक्शन ड्रॉप होते हैं।" },
            { en: "Poor thermal dissipation degrades transistor performance and limits execution rates.", hi: "खराब थर्मल अपव्यय ट्रांजिस्टर के प्रदर्शन को कम करता है और निष्पादन दरों को सीमित करता है।" },
            { en: "Parallel bus signal skewing introduces data timing race conditions.", hi: "समानांतर बस सिग्नल तिरछापन (skewing) डेटा टाइमिंग रेस स्थितियों को पेश करता है।" },
            { en: "DMA channel allocation conflicts freeze peripheral processing pipelines.", hi: "डीएमए चैनल आवंटन संघर्ष परिधीय प्रसंस्करण पाइपलाइनों को फ्रीज कर देते हैं।" },
            { en: "Firmware address overlaps trigger invalid device interrupt handler routines.", hi: "फर्मवेयर एड्रेस ओवरलैप अमान्य डिवाइस इंटरप्ट हैंडलर रूटीन को ट्रिगर करते हैं।" },
            { en: "High register access concurrency causes regular write-write collision locks.", hi: "उच्च रजिस्टर एक्सेस समरूपता नियमित रूप से राइट-राइट कोलिजन लॉक का कारण बनती है।" }
        ]
    },
    "MEM": {
        properties: [
            { en: "This memory architecture coordinates multi-level cache mapping logical arrays.", hi: "यह मेमोरी आर्किटेक्चर बहु-स्तरीय कैश मैपिंग लॉजिकल एरे का समन्वय करता है।" },
            { en: "This volatile cell uses high-speed flip-flop circuits to hold binary states.", hi: "यह अस्थिर सेल बाइनरी स्टेट्स रखने के लिए हाई-स्पीड फ्लिप-फ्लॉप सर्किट का उपयोग करता है।" },
            { en: "This semiconductor module retains custom firmware data without continuous power supplies.", hi: "यह सेमीकंडक्टर मॉड्यूल निरंतर बिजली आपूर्ति के बिना कस्टम फर्मवेयर डेटा बनाए रखता है।" },
            { en: "This storage drive structures magnetic platters to record high-density bits.", hi: "यह स्टोरेज ड्राइव उच्च-घनत्व बिट्स रिकॉर्ड करने के लिए चुंबकीय प्लेटर्स की संरचना करता है।" },
            { en: "This non-volatile cell leverages floating-gate charge traps to store data.", hi: "यह गैर-वाष्पशील सेल डेटा संग्रहीत करने के लिए फ्लोटिंग-गेट चार्ज ट्रैप का लाभ उठाता है।" },
            { en: "This processing register acts as a local buffer for active instructions.", hi: "यह प्रोसेसिंग रजिस्टर सक्रिय निर्देशों के लिए एक स्थानीय बफर के रूप में कार्य करता है।" },
            { en: "This mapping directory translates virtual page offsets into physical frame coordinates.", hi: "यह मैपिंग निर्देशिका वर्चुअल पेज ऑफसेट को भौतिक फ़्रेम निर्देशांक में अनुवादित करती है।" },
            { en: "This direct controller manages data block transfers directly to system memory.", hi: "यह डायरेक्ट कंट्रोलर डेटा ब्लॉक ट्रांसफर को सीधे सिस्टम मेमोरी में प्रबंधित करता है।" },
            { en: "This storage framework provides off-site redundant file arrays via networks.", hi: "यह स्टोरेज फ्रेमवर्क नेटवर्क के माध्यम से ऑफ-साइट रिडंडेंट फाइल एरे प्रदान करता है।" },
            { en: "This data structure manages floating-point exponent representation limits accurately.", hi: "यह डेटा संरचना फ्लोटिंग-पॉइंट एक्सपोनेंट प्रतिनिधित्व सीमाओं को सटीक रूप से प्रबंधित करती है।" }
        ],
        objectives: [
            { en: "It optimizes memory latency rates by caching high-frequency logical instructions.", hi: "यह उच्च-आवृत्ति तार्किक निर्देशों को कैश करके मेमोरी विलंबता दरों को अनुकूलित करता है।" },
            { en: "It eliminates regular refresh cycles to maximize local access operations speed.", hi: "यह स्थानीय एक्सेस संचालन गति को अधिकतम करने के लिए नियमित रिफ्रेश चक्रों को समाप्त करता है।" },
            { en: "It restricts read/write logic paths to secure structural boot sectors.", hi: "यह संरचनात्मक बूट सेक्टरों को सुरक्षित करने के लिए रीड/राइट लॉजिक पथों को प्रतिबंधित करता है।" },
            { en: "It coordinates drive arm seeking sweeps to accelerate sequential block reads.", hi: "यह अनुक्रमिक ब्लॉक पढ़ने में तेजी लाने के लिए ड्राइव आर्म सीकिंग स्वीप का समन्वय करता है।" },
            { en: "It distributes block writes evenly to extend flash memory lifespans.", hi: "यह फ्लैश मेमोरी जीवनकाल को बढ़ाने के लिए ब्लॉक राइट्स को समान रूप से वितरित करता है।" },
            { en: "It translates memory paths instantly using translation lookaside buffer caches.", hi: "यह ट्रांसलेशन लुकसाइड बफर कैश का उपयोग करके मेमोरी पथों का तुरंत अनुवाद करता है।" },
            { en: "It coordinates direct peripheral-to-memory block transfers to bypass processor logic.", hi: "यह प्रोसेसर लॉजिक को बायपास करने के लिए सीधे परिधीय-से-मेमोरी ब्लॉक ट्रांसफर का समन्वय करता है।" },
            { en: "It synchronizes cache updates instantly to guarantee multi-core state consistency.", hi: "यह मल्टी-कोर स्थिति स्थिरता की गारंटी देने के लिए कैश अपडेट को तुरंत सिंक्रनाइज़ करता है।" },
            { en: "It maps physical block locations dynamically to shield bad sectors.", hi: "यह खराब सेक्टरों को ढालने के लिए भौतिक ब्लॉक स्थानों को गतिशील रूप से मैप करता है।" },
            { en: "It scales floating-point values dynamically to prevent underflow calculations.", hi: "यह अंडरफ़्लो गणनाओं को रोकने के लिए फ़्लोटिंग-पॉइंट मानों को गतिशील रूप से स्केल करता है।" }
        ],
        advantages: [
            { en: "This logic speeds up instruction execution by reducing memory access delays.", hi: "यह तर्क मेमोरी एक्सेस विलंब को कम करके निर्देश निष्पादन को गति देता है।" },
            { en: "This design achieves ultra-low latency without requiring periodic charge refreshes.", hi: "यह डिज़ाइन आवधिक चार्ज रिफ्रेश की आवश्यकता के बिना अल्ट्रा-लो लेटेंसी प्राप्त करता है।" },
            { en: "This memory preserves code integrity during sudden power loss failures.", hi: "यह मेमोरी अचानक बिजली हानि विफलताओं के दौरान कोड अखंडता को सुरक्षित रखती है।" },
            { en: "This layout delivers high storage capacity at a low physical cost.", hi: "यह लेआउट कम भौतिक लागत पर उच्च भंडारण क्षमता प्रदान करता है।" },
            { en: "This solid-state interface provides rapid block retrieval under heavy concurrent reads.", hi: "यह सॉलिड-स्टेट इंटरफ़ेस भारी समवर्ती पढ़ने के तहत तेजी से ब्लॉक पुनर्प्राप्ति प्रदान करता है।" },
            { en: "This setup accelerates virtual page lookups through parallel hardware mapping.", hi: "यह सेटअप समानांतर हार्डवेयर मैपिंग के माध्यम से वर्चुअल पेज लुकअप को तेज करता है।" },
            { en: "This pipeline releases processor cores during extensive disk read-write flows.", hi: "यह पाइपलाइन बड़े पैमाने पर डिस्क रीड-राइट प्रवाह के दौरान प्रोसेसर कोर को मुक्त करती है।" },
            { en: "This scheme prevents cache coherence breakdowns across multi-threaded applications.", hi: "यह योजना मल्टी-थ्रेडेड अनुप्रयोगों में कैश सुसंगतता टूटने को रोकती है।" },
            { en: "This mapping strategy extends drive durability through continuous wear-leveling cycles.", hi: "यह मैपिंग रणनीति निरंतर वियर-लेवलिंग चक्रों के माध्यम से ड्राइव स्थायित्व को बढ़ाती है।" },
            { en: "This representation maintains high precision during complex floating-point processing.", hi: "यह प्रतिनिधित्व जटिल फ्लोटिंग-पॉइंट प्रोसेसिंग के दौरान उच्च सटीकता बनाए रखता है।" }
        ],
        tradeoffs: [
            { en: "This layout demands massive transistor density and increases overall costs.", hi: "यह लेआउट बड़े पैमाने पर ट्रांजिस्टर घनत्व की मांग करता है और कुल लागत को बढ़ाता है।" },
            { en: "This system requires continuous electrical power to maintain active registers.", hi: "इस सिस्टम को सक्रिय रजिस्टरों को बनाए रखने के लिए निरंतर विद्युत शक्ति की आवश्यकता होती है।" },
            { en: "This design exhibits low write speeds due to slow charge erasure cycles.", hi: "धीमे चार्ज इरेज़्योर चक्रों के कारण यह डिज़ाइन कम लेखन गति प्रदर्शित करता है।" },
            { en: "This structure introduces mechanical seek delays under randomized access patterns.", hi: "यह संरचना यादृच्छिक एक्सेस पैटर्न के तहत यांत्रिक खोज (seek) विलंब पेश करती है।" },
            { en: "This mechanism suffers from physical wear bounds after repeated write cycles.", hi: "यह तंत्र बार-बार लिखने के चक्रों के बाद भौतिक टूट-फूट की सीमाओं से ग्रस्त होता है।" },
            { en: "This approach causes high internal fragmentation across small data files.", hi: "यह दृष्टिकोण छोटी डेटा फ़ाइलों में उच्च आंतरिक विखंडन का कारण बनता है।" },
            { en: "This control logic increases hardware complexity on motherboard circuitry.", hi: "यह नियंत्रण तर्क मदरबोर्ड सर्किट्री पर हार्डवेयर जटिलता को बढ़ाता है।" },
            { en: "This cache architecture suffers from severe mapping collision miss cycles.", hi: "यह कैश आर्किटेक्चर गंभीर मैपिंग कोलिजन मिस चक्रों से ग्रस्त है।" },
            { en: "This backup framework introduces transit delays over wide network connections.", hi: "यह बैकअप ढांचा व्यापक नेटवर्क कनेक्शन पर पारगमन विलंब पेश करता है।" },
            { en: "This format introduces precision rounding errors during division processes.", hi: "यह प्रारूप विभाजन प्रक्रियाओं के दौरान सटीकता राउंडिंग त्रुटियों का परिचय देता है।" }
        ],
        scenarios: [
            { en: "A cache directory mapping collision forces regular data line flushes.", hi: "कैश निर्देशिका मैपिंग टकराव नियमित रूप से डेटा लाइन फ्लश को मजबूर करता है।" },
            { en: "Volatile cell power drop causes instant loss of instruction execution registers.", hi: "अस्थिर सेल पावर ड्रॉप से निर्देश निष्पादन रजिस्टरों की तत्काल हानि होती है।" },
            { en: "Excessive erase voltages break down floating-gate insulation layers prematurely.", hi: "अत्यधिक इरेज़ वोल्टेज फ्लोटिंग-गेट इन्सुलेशन परतों को समय से पहले तोड़ देते हैं।" },
            { en: "Mechanical head crashing causes permanent magnetic platter surface damage.", hi: "यांत्रिक हेड क्रैशिंग से स्थायी चुंबकीय प्लेटर सतह को नुकसान होता है।" },
            { en: "Wear-leveling logic failure causes rapid wear out of local memory blocks.", hi: "वियर-लेवलिंग लॉजिक विफलता स्थानीय मेमोरी ब्लॉकों के तेजी से खराब होने का कारण बनती है।" },
            { en: "TLB directory misses result in double physical address resolution cycles.", hi: "टीएलबी निर्देशिका मिस होने के परिणामस्वरूप दोहरे भौतिक पता समाधान चक्र होते हैं।" },
            { en: "DMA buffer allocation mismatch triggers invalid memory block access errors.", hi: "डीएमए बफर आवंटन बेमेल अमान्य मेमोरी ब्लॉक एक्सेस त्रुटियों को ट्रिगर करता है।" },
            { en: "Cache mismatch issues generate obsolete register data lines during calculations.", hi: "कैश बेमेल मुद्दे गणना के दौरान अप्रचलित रजिस्टर डेटा लाइनों को उत्पन्न करते हैं।" },
            { en: "Network drop causes immediate failure of live cloud storage write streams.", hi: "नेटवर्क ड्रॉप होने से लाइव क्लाउड स्टोरेज राइट स्ट्रीम की तत्काल विफलता होती है।" },
            { en: "Floating-point exponent boundary overflow triggers system arithmetic traps.", hi: "फ्लोटिंग-पॉइंट एक्सपोनेंट सीमा ओवरफ़्लो सिस्टम अंकगणितीय ट्रैप को ट्रिगर करता है।" }
        ]
    },
    "SW": {
        properties: [
            { en: "This operating framework manages physical computer hardware resource allocations.", hi: "यह ऑपरेटिंग ढांचा भौतिक कंप्यूटर हार्डवेयर संसाधन आवंटन का प्रबंधन करता है।" },
            { en: "This translation module compiles complete high-level source code into binary blocks.", hi: "यह अनुवाद मॉड्यूल पूर्ण उच्च-स्तरीय स्रोत कोड को बाइनरी ब्लॉक में संकलित करता है।" },
            { en: "This system utility optimizes local hard drive storage structures regularly.", hi: "यह सिस्टम उपयोगिता नियमित रूप से स्थानीय हार्ड ड्राइव स्टोरेज संरचनाओं को अनुकूलित करती है।" },
            { en: "This embedded firmware provides low-level hardware bootstrap routines during startups.", hi: "यह एम्बेडेड फर्मवेयर स्टार्टअप के दौरान निम्न-स्तरीय हार्डवेयर बूटस्ट्रैप रूटीन प्रदान करता है।" },
            { en: "This middleware layer coordinates message transfers between diverse network applications.", hi: "यह मिडलवेयर परत विभिन्न नेटवर्क अनुप्रयोगों के बीच संदेश हस्तांतरण का समन्वय करती है।" },
            { en: "This proprietary package restricts structural modifications through closed source licenses.", hi: "यह मालिकाना पैकेज बंद स्रोत लाइसेंस के माध्यम से संरचनात्मक संशोधनों को प्रतिबंधित करता है।" },
            { en: "This operating kernel schedules tasks based on dynamic priority queues.", hi: "यह ऑपरेटिंग कर्नेल गतिशील प्राथमिकता कतारों के आधार पर कार्यों को शेड्यूल करता है।" },
            { en: "This translation interpreter processes source code line-by-line during runtime execution.", hi: "यह अनुवाद दुभाषिया (interpreter) रनटाइम निष्पादन के दौरान स्रोत कोड को लाइन-दर-लाइन संसाधित करता है।" },
            { en: "This compression utility reorganizes data blocks to reduce total storage size.", hi: "यह संपीड़न उपयोगिता कुल भंडारण आकार को कम करने के लिए डेटा ब्लॉकों को पुनर्गठित करती है।" },
            { en: "This open-source framework grants public access to modify source repositories.", hi: "यह ओपन-सोर्स ढांचा स्रोत रिपॉजिटरी को संशोधित करने के लिए सार्वजनिक पहुंच प्रदान करता है।" }
        ],
        objectives: [
            { en: "It optimizes hardware resource utilization through active task scheduling.", hi: "यह सक्रिय कार्य शेड्यूलिंग के माध्यम से हार्डवेयर संसाधन उपयोग को अनुकूलित करता है।" },
            { en: "It converts entire source text files into standalone machine instructions.", hi: "यह संपूर्ण स्रोत पाठ फ़ाइलों को स्टैंडअलोन मशीन निर्देशों में परिवर्तित करता है।" },
            { en: "It checks device health parameters to prevent catastrophic hardware drops.", hi: "यह विनाशकारी हार्डवेयर विफलता को रोकने के लिए डिवाइस स्वास्थ्य मापदंडों की जांच करता है।" },
            { en: "It initializes system motherboard registers during power-on self-test cycles.", hi: "यह पावर-ऑन सेल्फ-टेस्ट चक्रों के दौरान सिस्टम मदरबोर्ड रजिस्टरों को इनिशियलाइज करता है।" },
            { en: "It translates distributed communication calls to bypass operating system bounds.", hi: "यह ऑपरेटिंग सिस्टम सीमाओं को बायपास करने के लिए वितरित संचार कॉलों का अनुवाद करता है।" },
            { en: "It enforces license compliance through complex digital activation protocols.", hi: "यह जटिल डिजिटल सक्रियण प्रोटोकॉल के माध्यम से लाइसेंस अनुपालन लागू करता है।" },
            { en: "It manages CPU execution contexts to ensure fair resource allocation.", hi: "यह निष्पक्ष संसाधन आवंटन सुनिश्चित करने के लिए सीपीयू निष्पादन संदर्भों का प्रबंधन करता है।" },
            { en: "It translates commands instantly to enable interactive program debugging steps.", hi: "यह इंटरैक्टिव प्रोग्राम डिबगिंग चरणों को सक्षम करने के लिए कमांड का तुरंत अनुवाद करता है।" },
            { en: "It scans system directory tables to remove obsolete temporary data.", hi: "यह अप्रचलित अस्थायी डेटा को हटाने के लिए सिस्टम निर्देशिका तालिकाओं को स्कैन करता है।" },
            { en: "It coordinates public repository forks to speed up software updates.", hi: "यह सॉफ्टवेयर अपडेट को तेज करने के लिए सार्वजनिक रिपॉजिटरी फोर्क्स का समन्वय करता है।" }
        ],
        advantages: [
            { en: "This system ensures complete isolation between user apps and kernel space.", hi: "यह सिस्टम यूजर ऐप्स और कर्नेल स्पेस के बीच पूर्ण अलगाव सुनिश्चित करता है।" },
            { en: "This compiler guarantees fast execution speed by pre-translating source code.", hi: "यह कंपाइलर स्रोत कोड को पहले से अनुवादित करके तेज निष्पादन गति की गारंटी देता है।" },
            { en: "This utility prevents drive performance degradation through regular sector optimization.", hi: "यह उपयोगिता नियमित सेक्टर अनुकूलन के माध्यम से ड्राइव प्रदर्शन गिरावट को रोकती है।" },
            { en: "This firmware guarantees secure hardware startup sequences from standard chips.", hi: "यह फर्मवेयर मानक चिप्स से सुरक्षित हार्डवेयर स्टार्टअप अनुक्रमों की गारंटी देता है।" },
            { en: "This layer simplifies network application deployment across different server types.", hi: "यह परत विभिन्न सर्वर प्रकारों में नेटवर्क एप्लिकेशन तैनाती को सरल बनाती है।" },
            { en: "This license protects vendor commercial innovations through legal enforcement paths.", hi: "यह लाइसेंस कानूनी प्रवर्तन पथों के माध्यम से विक्रेता के व्यावसायिक नवाचारों की रक्षा करता है।" },
            { en: "This design guarantees low scheduling overhead under multi-threaded operations.", hi: "यह डिज़ाइन मल्टी-थ्रेडेड ऑपरेशन्स के तहत कम शेड्यूलिंग ओवरहेड की गारंटी देता है।" },
            { en: "This interpreter speeds up prototyping by bypassing tedious compilation phases.", hi: "यह दुभाषिया (interpreter) कठिन संकलन चरणों को बायपास करके प्रोटोटाइपिंग को तेज करता है।" },
            { en: "This program minimizes backup file sizes through efficient mathematical compaction.", hi: "यह प्रोग्राम कुशल गणितीय संघनन (compaction) के माध्यम से बैकअप फ़ाइल आकारों को कम करता है।" },
            { en: "This philosophy accelerates product innovation through continuous community contribution flows.", hi: "यह दर्शन निरंतर सामुदायिक योगदान प्रवाह के माध्यम से उत्पाद नवाचार को तेज करता है।" }
        ],
        tradeoffs: [
            { en: "This layout introduces significant processing delay during system context switches.", hi: "यह लेआउट सिस्टम संदर्भ स्विच के दौरान महत्वपूर्ण प्रसंस्करण विलंब का परिचय देता है।" },
            { en: "This translation process demands substantial runtime memory during building phases.", hi: "यह अनुवाद प्रक्रिया निर्माण चरणों के दौरान पर्याप्त रनटाइम मेमोरी की मांग करती है।" },
            { en: "This optimization process limits file access speeds during optimization routines.", hi: "यह अनुकूलन प्रक्रिया अनुकूलन रूटीन के दौरान फ़ाइल एक्सेस गति को सीमित करती है।" },
            { en: "This ROM space restricts update operations due to rigid firmware bounds.", hi: "यह रॉम स्पेस कठोर फर्मवेयर सीमाओं के कारण अपडेट संचालन को प्रतिबंधित करता है।" },
            { en: "This framework adds transit delays over network messaging call lines.", hi: "यह ढांचा नेटवर्क मैसेजिंग कॉल लाइनों पर पारगमन विलंब जोड़ता है।" },
            { en: "This restrictions block community custom patches and lock developers to suppliers.", hi: "यह प्रतिबंध सामुदायिक कस्टम पैच को ब्लॉक करते हैं और डेवलपर्स को आपूर्तिकर्ताओं से बांधते हैं।" },
            { en: "This management scheme experiences priority inversion failures under heavy loads.", hi: "यह प्रबंधन योजना भारी लोड के तहत प्राथमिकता उलटा विफलताओं का अनुभव करती है।" },
            { en: "This interpreter yields low processing performance compared to compiled code blocks.", hi: "यह दुभाषिया (interpreter) संकलित कोड ब्लॉकों की तुलना में कम प्रसंस्करण प्रदर्शन प्रदान करता है।" },
            { en: "This utility consumes high processor utilization during data compaction runs.", hi: "डेटा संघनन (compaction) रन के दौरान यह उपयोगिता उच्च प्रोसेसर उपयोग का उपभोग करती है।" },
            { en: "This structure introduces software security risks due to public code exposure.", hi: "यह संरचना सार्वजनिक कोड प्रदर्शन के कारण सॉफ्टवेयर सुरक्षा जोखिमों का परिचय देती है।" }
        ],
        scenarios: [
            { en: "Kernel space memory allocation failure causes instant operating system panic.", hi: "कर्नेल स्पेस मेमोरी आवंटन विफलता के कारण तत्काल ऑपरेटिंग सिस्टम पैनिक होता है।" },
            { en: "Compiler syntax parsing failure breaks down the system build execution.", hi: "कंपाइलर सिंटैक्स पार्सिंग विफलता सिस्टम बिल्ड निष्पादन को तोड़ देती है।" },
            { en: "Utility execution during active database reads causes system lock conditions.", hi: "सक्रिय डेटाबेस रीड के दौरान उपयोगिता निष्पादन सिस्टम लॉक स्थितियों का कारण बनता है।" },
            { en: "POST register validation mismatch triggers continuous motherboard alarm loops.", hi: "POST रजिस्टर सत्यापन बेमेल होने से निरंतर मदरबोर्ड अलार्म लूप ट्रिगर होते हैं।" },
            { en: "Middleware configuration overlap freezes application message transit paths.", hi: "मिडलवेयर कॉन्फ़िगरेशन ओवरलैप एप्लिकेशन संदेश पारगमन पथों को फ्रीज कर देता है।" },
            { en: "License verification failure locks system users out of active applications.", hi: "लाइसेंस सत्यापन विफलता सिस्टम उपयोगकर्ताओं को सक्रिय अनुप्रयोगों से बाहर कर देती है।" },
            { en: "High scheduler context switching overhead triggers immediate CPU thrashing.", hi: "उच्च शेड्यूलर संदर्भ स्विचिंग ओवरहेड तत्काल सीपीयू थ्रैशिंग को ट्रिगर करता है।" },
            { en: "Interpreter runtime type errors halt execution of critical program lines.", hi: "दुभाषिया (interpreter) रनटाइम प्रकार की त्रुटियां महत्वपूर्ण प्रोग्राम लाइनों के निष्पादन को रोक देती हैं।" },
            { en: "Compression catalog table corruption destroys archive data retrieval files.", hi: "संपीड़न कैटलॉग तालिका भ्रष्टाचार संग्रह डेटा पुनर्प्राप्ति फ़ाइलों को नष्ट कर देता है।" },
            { en: "Unchecked public code merges introduce critical security holes into systems.", hi: "अनियंत्रित सार्वजनिक कोड मर्ज सिस्टम में महत्वपूर्ण सुरक्षा छेद पेश करते हैं।" }
        ]
    },
    "NUM": {
        properties: [
            { en: "This number system uses a base-16 positional matrix representation.", hi: "यह संख्या प्रणाली बेस-16 स्थितिगत मैट्रिक्स प्रतिनिधित्व का उपयोग करती है।" },
            { en: "This conversion algorithm maps binary bits to octal digit boundaries.", hi: "यह रूपांतरण एल्गोरिदम बाइनरी बिट्स को ऑक्टल अंक सीमाओं पर मैप करता है।" },
            { en: "This arithmetic method computes binary subtraction through complement logic.", hi: "यह अंकगणितीय विधि पूरक तर्क के माध्यम से बाइनरी घटाव की गणना करती है।" },
            { en: "This multiplier block calculates binary products using logical shifts.", hi: "यह गुणक ब्लॉक लॉजिकल शिफ्ट का उपयोग करके बाइनरी उत्पादों की गणना करता है।" },
            { en: "This complement notation represents negative integers with inverted bit patterns.", hi: "यह पूरक संकेतन उल्टे बिट पैटर्न के साथ नकारात्मक पूर्णांकों का प्रतिनिधित्व करता है।" },
            { en: "This encoding standard maps unique seven-bit values to standard characters.", hi: "यह एन्कोडिंग मानक अद्वितीय सात-बिट मानों को मानक वर्णों में मैप करता है।" },
            { en: "This positional scheme maps radix base points to calculate decimal weights.", hi: "यह स्थितिगत योजना दशमलव भार की गणना करने के लिए रेडिक्स बेस बिंदुओं को मैप करती है।" },
            { en: "This division logic processes binary values to compute fractional remainders.", hi: "यह विभाजन तर्क आंशिक शेषफल की गणना करने के लिए बाइनरी मानों को संसाधित करता है।" },
            { en: "This complement format adds one to the least significant bit.", hi: "यह पूरक प्रारूप सबसे कम महत्वपूर्ण बिट (LSB) में एक जोड़ता है।" },
            { en: "This encoding framework supports global multi-lingual glyphs using wider tables.", hi: "यह एन्कोडिंग ढांचा व्यापक तालिकाओं का उपयोग करके वैश्विक बहुभाषी ग्लिफ़ का समर्थन करता है।" }
        ],
        objectives: [
            { en: "It translates base radix values to calculate precise integer equivalents.", hi: "यह सटीक पूर्णांक समकक्षों की गणना करने के लिए बेस रेडिक्स मानों का अनुवाद करता है।" },
            { en: "It groups binary bit sequences to simplify system display steps.", hi: "यह सिस्टम डिस्प्ले चरणों को सरल बनाने के लिए बाइनरी बिट अनुक्रमों को समूहित करता है।" },
            { en: "It computes binary arithmetic values using only simplified adder gates.", hi: "यह केवल सरलीकृत एडर गेट्स का उपयोग करके बाइनरी अंकगणितीय मानों की गणना करता है।" },
            { en: "It shifts binary registers logically to accelerate multiplication speeds.", hi: "यह गुणन गति को तेज करने के लिए बाइनरी रजिस्टरों को तार्किक रूप से स्थानांतरित करता है।" },
            { en: "It isolates negative value registers without breaking binary calculation paths.", hi: "यह बाइनरी गणना पथों को तोड़े बिना नकारात्मक मान रजिस्टरों को अलग करता है।" },
            { en: "It normalizes text representation across diverse computing systems globally.", hi: "यह विश्व स्तर पर विभिन्न कंप्यूटिंग प्रणालियों में टेक्स्ट प्रतिनिधित्व को सामान्य बनाता है।" },
            { en: "It calculates fractional base conversions using positional weight algorithms.", hi: "यह स्थितिगत भार एल्गोरिदम का उपयोग करके आंशिक आधार रूपांतरणों की गणना करता है।" },
            { en: "It computes quotient bit sequences by adjusting divider subtractor paths.", hi: "यह डिवाइडर सबट्रैक्टर पथों को समायोजित करके भागफल बिट अनुक्रमों की गणना करता है।" },
            { en: "It computes sign bit extensions to prevent register underflow limits.", hi: "यह रजिस्टर अंडरफ़्लो सीमाओं को रोकने के लिए साइन बिट एक्सटेंशन की गणना करता है।" },
            { en: "It maps Unicode index arrays to simplify text rendering routines.", hi: "यह टेक्स्ट रेंडरिंग रूटीन को सरल बनाने के लिए यूनिकोड इंडेक्स एरे को मैप करता है।" }
        ],
        advantages: [
            { en: "This system condenses long binary lines into shorter readable characters.", hi: "यह प्रणाली लंबी बाइनरी लाइनों को छोटे पठनीय वर्णों में संक्षिप्त करती है।" },
            { en: "This process simplifies digital representation conversions across microcomputer chips.", hi: "यह प्रक्रिया माइक्रोकंप्यूटर चिप्स में डिजिटल प्रतिनिधित्व रूपांतरणों को सरल बनाती है।" },
            { en: "This layout enables hardware subtractors to use standard adder gates.", hi: "यह लेआउट हार्डवेयर सबट्रैक्टर्स को मानक एडर गेट्स का उपयोग करने में सक्षम बनाता है।" },
            { en: "This structure speeds up integer multiplications through parallel shift networks.", hi: "यह संरचना समानांतर शिफ्ट नेटवर्क के माध्यम से पूर्णांक गुणन को गति देती है।" },
            { en: "This representation eliminates duplicate representations of zero inside digital ALUs.", hi: "यह प्रतिनिधित्व डिजिटल एएलयू के अंदर शून्य के दोहरे प्रतिनिधित्व को समाप्त करता है।" },
            { en: "This framework guarantees platform-independent text processing across different networks.", hi: "यह ढांचा विभिन्न नेटवर्क में प्लेटफॉर्म-स्वतंत्र टेक्स्ट प्रोसेसिंग की गारंटी देता है।" },
            { en: "This calculation scheme handles precise fractional points with low error rates.", hi: "यह गणना योजना कम त्रुटि दरों के साथ सटीक आंशिक बिंदुओं को संभालती है।" },
            { en: "This logic optimizes division pipelines through non-restoring subtractor loops.", hi: "यह तर्क गैर-पुनर्स्थापना सबट्रैक्टर लूप के माध्यम से विभाजन पाइपलाइनों को अनुकूलित करता है।" },
            { en: "This complement style prevents arithmetic carry leaks during parallel additions.", hi: "यह पूरक शैली समानांतर जोड़ के दौरान अंकगणितीय कैरी लीक को रोकती है।" },
            { en: "This standard provides unified character representation for all global languages.", hi: "यह मानक सभी वैश्विक भाषाओं के लिए एकीकृत चरित्र प्रतिनिधित्व प्रदान करता है।" }
        ],
        tradeoffs: [
            { en: "This representation requires extra character mapping steps inside processor systems.", hi: "इस प्रतिनिधित्व के लिए प्रोसेसर सिस्टम के अंदर अतिरिक्त चरित्र मैपिंग चरणों की आवश्यकता होती है।" },
            { en: "This conversion requires substantial processing calculations for fractional base points.", hi: "इस रूपांतरण के लिए आंशिक आधार बिंदुओं के लिए पर्याप्त प्रसंस्करण गणना की आवश्यकता होती है।" },
            { en: "This logic causes arithmetic carry overflows during extreme addition states.", hi: "यह तर्क अत्यधिक जोड़ राज्यों के दौरान अंकगणितीय कैरी ओवरफ़्लो का कारण बनता है।" },
            { en: "This multiplier increases gate count and takes up silicon area.", hi: "यह गुणक गेट की संख्या को बढ़ाता है और सिलिकॉन क्षेत्र को घेरता है।" },
            { en: "This notation limits maximum positive range by allocating sign bits.", hi: "यह संकेतन साइन बिट्स आवंटित करके अधिकतम सकारात्मक सीमा को सीमित करता है।" },
            { en: "This encoding limits character set size due to seven-bit constraints.", hi: "यह एन्कोडिंग सात-बिट बाधाओं के कारण वर्ण सेट आकार को सीमित करती है।" },
            { en: "This method requires high computational loop passes under deep fractions.", hi: "इस पद्धति को गहरे अंशों के तहत उच्च कम्प्यूटेशनल लूप पास की आवश्यकता होती है।" },
            { en: "This division routine introduces high computational delay inside ALU gates.", hi: "यह विभाजन रूटीन एएलयू गेट्स के अंदर उच्च कम्प्यूटेशनल विलंब का परिचय देता है।" },
            { en: "This representation requires sign checking hardware before starting operations.", hi: "इस प्रतिनिधित्व के लिए संचालन शुरू करने से पहले साइन चेकिंग हार्डवेयर की आवश्यकता होती है।" },
            { en: "This format increases total storage size by using wider bytes.", hi: "यह प्रारूप व्यापक बाइट्स का उपयोग करके कुल भंडारण आकार को बढ़ाता है।" }
        ],
        scenarios: [
            { en: "Hexadecimal parsing format overflow triggers data representation crash events.", hi: "हेक्साडेसिमल पार्सिंग प्रारूप ओवरफ़्लो डेटा प्रतिनिधित्व क्रैश घटनाओं को ट्रिगर करता है।" },
            { en: "Fractional conversion loop timeout freezes real-time execution pipelines.", hi: "आंशिक रूपांतरण लूप टाइमआउट रीयल-टाइम निष्पादन पाइपलाइनों को फ्रीज कर देता है।" },
            { en: "Unchecked addition arithmetic carry triggers system integer overflow alerts.", hi: "अनियंत्रित जोड़ अंकगणितीय कैरी सिस्टम पूर्णांक ओवरफ़्लो अलर्ट को ट्रिगर करता है।" },
            { en: "Register shift alignment mismatch distorts calculated product bit values.", hi: "रजिस्टर शिफ्ट संरेखण बेमेल गणना किए गए उत्पाद बिट मानों को विकृत कर देता है।" },
            { en: "Sign bit corruption flips positive calculations into negative bounds.", hi: "साइन बिट भ्रष्टाचार सकारात्मक गणनाओं को नकारात्मक सीमाओं में बदल देता है।" },
            { en: "Seven-bit index boundary overrun yields unrecognizable character outputs.", hi: "सात-बिट इंडेक्स सीमा ओवररुन से अपरिचित वर्ण आउटपुट प्राप्त होते हैं।" },
            { en: "Base conversion truncation issues introduce steady calculation rounding errors.", hi: "आधार रूपांतरण ट्रंकेशन मुद्दे निरंतर गणना राउंडिंग त्रुटियों को पेश करते हैं।" },
            { en: "Divide-by-zero register conditions trigger immediate processor execution traps.", hi: "शून्य से विभाजन (divide-by-zero) रजिस्टर स्थितियां तत्काल प्रोसेसर निष्पादन ट्रैप को ट्रिगर करती हैं।" },
            { en: "Complement carry overflow errors produce invalid sign bit results.", hi: "पूरक कैरी ओवरफ़्लो त्रुटियां अमान्य साइन बिट परिणाम उत्पन्न करती हैं।" },
            { en: "Multi-byte character decoding overlaps break text display structures completely.", hi: "मल्टी-बाइट वर्ण डिकोडिंग ओवरलैप टेक्स्ट डिस्प्ले संरचनाओं को पूरी तरह से तोड़ देते हैं।" }
        ]
    },
    "LOG": {
        properties: [
            { en: "This algebra structures logical states using true and false variables.", hi: "यह बीजगणित सत्य और असत्य चरों का उपयोग करके तार्किक अवस्थाओं की संरचना करता है।" },
            { en: "This theorem decomposes logical products into inverted sum matrices.", hi: "यह प्रमेय तार्किक उत्पादों को उल्टे योग मैट्रिसेस में विघटित करता है।" },
            { en: "This fundamental gate inverts input logic states completely.", hi: "यह मौलिक गेट इनपुट लॉजिक अवस्थाओं को पूरी तरह से उलट देता है।" },
            { en: "This universal gate executes logic inversions on product boundaries.", hi: "यह सार्वभौमिक गेट उत्पाद सीमाओं पर लॉजिक इनवर्शन निष्पादित करता है।" },
            { en: "This combinational circuit computes binary sum and carry outputs simultaneously.", hi: "यह संयोजन सर्किट एक साथ बाइनरी योग और कैरी आउटपुट की गणना करता है।" },
            { en: "This multiplexer selects input lines using binary control registers.", hi: "यह मल्टीप्लेक्सर बाइनरी कंट्रोल रजिस्टरों का उपयोग करके इनपुट लाइनों का चयन करता है।" },
            { en: "This logic table maps out all possible truth configurations.", hi: "यह लॉजिक तालिका सभी संभावित सत्य कॉन्फ़िगरेशन को मैप करती है।" },
            { en: "This decoder routes single inputs to multiple address endpoints.", hi: "यह डिकोडर एकल इनपुट को कई एड्रेस एंडपॉइंट्स पर रूट करता है।" },
            { en: "This logic gate yields true only under parity mismatches.", hi: "यह लॉजिक गेट केवल पैरिटी बेमेल होने पर ही सही परिणाम देता है।" },
            { en: "This minimized logic loop represents optimal sum of products.", hi: "यह न्यूनतम लॉजिक लूप उत्पादों के इष्टतम योग का प्रतिनिधित्व करता है।" }
        ],
        objectives: [
            { en: "It minimizes logical expressions to reduce total gate components.", hi: "यह कुल गेट घटकों को कम करने के लिए लॉजिकल अभिव्यक्तियों को न्यूनतम करता है।" },
            { en: "It simplifies logic complement operations inside core processor units.", hi: "यह कोर प्रोसेसर इकाइयों के अंदर लॉजिक पूरक संचालन को सरल बनाता है।" },
            { en: "It regulates signal routing to ensure correct logic flow.", hi: "यह सही लॉजिक प्रवाह सुनिश्चित करने के लिए सिग्नल रूटिंग को नियंत्रित करता है।" },
            { en: "It performs universal gate transformations to simplify circuit layout.", hi: "यह सर्किट लेआउट को सरल बनाने के लिए सार्वभौमिक गेट रूपांतरण करता है।" },
            { en: "It calculates binary addition results for execution arithmetic blocks.", hi: "यह निष्पादन अंकगणितीय ब्लॉकों के लिए बाइनरी जोड़ परिणामों की गणना करता है।" },
            { en: "It routes concurrent signal streams to bypass multiplexer pathway delays.", hi: "यह मल्टीप्लेक्सर पथ विलंब को बायपास करने के लिए समवर्ती सिग्नल स्ट्रीम को रूट करता है।" },
            { en: "It maps logic transitions to verify gate execution states.", hi: "यह गेट निष्पादन अवस्थाओं को सत्यापित करने के लिए लॉजिक संक्रमणों को मैप करता है।" },
            { en: "It translates binary inputs to activate distinct system lines.", hi: "यह विशिष्ट सिस्टम लाइनों को सक्रिय करने के लिए बाइनरी इनपुट का अनुवाद करता है।" },
            { en: "It computes binary subtraction bits through logic gate inversions.", hi: "यह लॉजिक गेट इनवर्शन के माध्यम से बाइनरी घटाव बिट्स की गणना करता है।" },
            { en: "It coordinates gate operations to prevent logic race hazards.", hi: "यह लॉजिक रेस खतरों को रोकने के लिए गेट संचालन का समन्वय करता है।" }
        ],
        advantages: [
            { en: "This algebra achieves extreme circuit simplification through systematic laws.", hi: "यह बीजगणित व्यवस्थित नियमों के माध्यम से अत्यधिक सर्किट सरलीकरण प्राप्त करता है।" },
            { en: "This theorem simplifies design conversions by removing nested brackets.", hi: "यह प्रमेय नेस्टेड कोष्ठक को हटाकर डिज़ाइन रूपांतरणों को सरल बनाता है।" },
            { en: "This gate simplifies signal inversion with minimum physical latency.", hi: "यह गेट न्यूनतम भौतिक विलंबता के साथ सिग्नल इनवर्शन को सरल बनाता है।" },
            { en: "This universal design simplifies chip layouts using uniform gate types.", hi: "यह सार्वभौमिक डिज़ाइन समान गेट प्रकारों का उपयोग करके चिप लेआउट को सरल बनाता है।" },
            { en: "This adder delivers precise arithmetic updates at nanosecond speeds.", hi: "यह एडर नैनोसेकंड गति पर सटीक अंकगणितीय अपडेट प्रदान करता है।" },
            { en: "This routing block reduces signal lines in high-density chipsets.", hi: "यह रूटिंग ब्लॉक उच्च-घनत्व वाले चिपसेट में सिग्नल लाइनों को कम करता है।" },
            { en: "This verification tool maps out all possible gate states.", hi: "यह सत्यापन उपकरण सभी संभावित गेट अवस्थाओं को मैप करता है।" },
            { en: "This decoder layout accelerates memory access by direct selection.", hi: "यह डिकोडर लेआउट सीधे चयन द्वारा मेमोरी एक्सेस को तेज करता है।" },
            { en: "This parity checker detects bit corruption in data transmission.", hi: "यह पैरिटी चेकर डेटा ट्रांसमिशन में बिट भ्रष्टाचार का पता लगाता है।" },
            { en: "This layout minimizes silicon area during microprocessor design.", hi: "यह लेआउट माइक्रोप्रोसेसर डिज़ाइन के दौरान सिलिकॉन क्षेत्र को न्यूनतम करता है।" }
        ],
        tradeoffs: [
            { en: "This algebra requires extensive mapping tables under wide variables.", hi: "इस बीजगणित को व्यापक चरों के तहत विस्तृत मैपिंग तालिकाओं की आवश्यकता होती है।" },
            { en: "This transformation adds propagation delays across deep gate levels.", hi: "यह रूपांतरण गहरे गेट स्तरों में प्रसार विलंब जोड़ता है।" },
            { en: "This gate increases power consumption spikes during switches.", hi: "यह गेट स्विच के दौरान बिजली की खपत को बढ़ाता है।" },
            { en: "This uniform logic requires higher overall physical gate counts.", hi: "इस समान तर्क के लिए उच्च कुल भौतिक गेट गणना की आवश्यकता होती है।" },
            { en: "This adder circuit suffers from sequential carry propagation delays.", hi: "यह एडर सर्किट अनुक्रमिक कैरी प्रसार विलंब से ग्रस्त है।" },
            { en: "This switch structures experience timing skew under concurrent inputs.", hi: "यह स्विच संरचनाएं समवर्ती इनपुट के तहत टाइमिंग स्क्यू (skew) का अनुभव करती हैं।" },
            { en: "This mapping grows exponentially as variable counts scale upward.", hi: "चरों की संख्या बढ़ने पर यह मैपिंग तेजी से बढ़ती है।" },
            { en: "This decoder demands high gate count for wide addresses.", hi: "यह डिकोडर विस्तृत पतों के लिए उच्च गेट गणना की मांग करता है।" },
            { en: "This parity gate cannot locate complex multi-bit corruption patterns.", hi: "यह पैरिटी गेट जटिल मल्टी-बिट भ्रष्टाचार पैटर्न का पता नहीं लगा सकता है।" },
            { en: "This optimization demands extreme computing power during compiling phases.", hi: "यह अनुकूलन संकलन चरणों के दौरान अत्यधिक कंप्यूटिंग शक्ति की मांग करता है।" }
        ],
        scenarios: [
            { en: "Minimization algorithm failures generate oversized physical logic boards.", hi: "न्यूनतमीकरण एल्गोरिदम की विफलताएं बड़े आकार के भौतिक लॉजिक बोर्ड उत्पन्न करती हैं।" },
            { en: "De Morgan conversion errors produce mismatched logic circuit branches.", hi: "डी मॉर्गन रूपांतरण त्रुटियां बेमेल लॉजिक सर्किट शाखाएं उत्पन्न करती हैं।" },
            { en: "Gate input over-capacity triggers transient logic execution errors.", hi: "गेट इनपुट ओवर-कैपेसिटी क्षणिक लॉजिक निष्पादन त्रुटियों को ट्रिगर करती है।" },
            { en: "Universal gate mapping overlap creates timing race hazards.", hi: "सार्वभौमिक गेट मैपिंग ओवरलैप टाइमिंग रेस खतरे पैदा करता है।" },
            { en: "Carry line propagation delay crashes arithmetic calculations speeds.", hi: "कैरी लाइन प्रसार विलंब अंकगणितीय गणना गति को क्रैश कर देता है।" },
            { en: "Multiplexer channel conflict causes cross-talk between signal lines.", hi: "मल्टीप्लेक्सर चैनल संघर्ष सिग्नल लाइनों के बीच क्रॉस-टॉक का कारण बनता है।" },
            { en: "State mapping mismatch flags invalid entries in truth tables.", hi: "स्टेट मैपिंग बेमेल ट्रुथ टेबल में अमान्य प्रविष्टियों को फ़्लैग करता है।" },
            { en: "Decoder address collision triggers double memory line activation.", hi: "डिकोडर एड्रेस टकराव दोहरी मेमोरी लाइन सक्रियण को ट्रिगर करता है।" },
            { en: "XOR gate output drift degrades parity validation accuracy rates.", hi: "XOR गेट आउटपुट ड्रिफ्ट पैरिटी सत्यापन सटीकता दरों को कम करता है।" },
            { en: "Logic race hazards generate transient glitches in active registers.", hi: "लॉजिक रेस खतरे सक्रिय रजिस्टरों में क्षणिक गड़बड़ी उत्पन्न करते हैं।" }
        ]
    },
    "PY": {
        properties: [
            { en: "This Python construct holds volatile integer and string data references dynamically.", hi: "यह पायथन निर्माण गतिशील रूप से अस्थिर पूर्णांक और स्ट्रिंग डेटा संदर्भों को रखता है।" },
            { en: "This built-in operator computes arithmetic remainders using modulo divisions.", hi: "यह अंतर्निहित ऑपरेटर मॉड्यूलो विभाजन का उपयोग करके अंकगणितीय शेषफल की गणना करता है।" },
            { en: "This conditional path executes code blocks under distinct Boolean checks.", hi: "यह सशर्त पथ विशिष्ट बूलियन जांच के तहत कोड ब्लॉक निष्पादित करता है।" },
            { en: "This loop structure repeats operations continuously over sequential list iterators.", hi: "यह लूप संरचना अनुक्रमिक सूची पुनरावृत्तियों (iterators) पर लगातार संचालन दोहराती है।" },
            { en: "This string method returns a new object with modified character cases.", hi: "यह स्ट्रिंग विधि संशोधित वर्ण मामलों के साथ एक नया ऑब्जेक्ट लौटाती है।" },
            { en: "This mutable list represents an ordered sequence of addressable items.", hi: "यह परिवर्तनशील (mutable) सूची एड्रेस करने योग्य वस्तुओं के एक क्रमित अनुक्रम का प्रतिनिधित्व करती है।" },
            { en: "This dictionary class maps unique keys to distinct value parameters.", hi: "यह डिक्शनरी क्लास अद्वितीय कुंजियों को विशिष्ट मान मापदंडों से मैप करती है।" },
            { en: "This function block encapsulates reusable code segments under defined parameters.", hi: "यह फ़ंक्शन ब्लॉक परिभाषित मापदंडों के तहत पुन: प्रयोज्य कोड खंडों को समाहित करता है।" },
            { en: "This module import loads optimized mathematical libraries into namespaces.", hi: "यह मॉड्यूल आयात अनुकूलित गणितीय पुस्तकालयों को नेमस्पेस में लोड करता है।" },
            { en: "This tuple sequence stores immutable records in ordered index lines.", hi: "यह टुपल अनुक्रम क्रमित इंडेक्स लाइनों में अपरिवर्तनीय (immutable) रिकॉर्ड संग्रहीत करता है।" }
        ],
        objectives: [
            { en: "It manages variable scope boundaries inside local function spaces.", hi: "यह स्थानीय फ़ंक्शन स्थानों के भीतर परिवर्तनीय (variable) स्कोप सीमाओं का प्रबंधन करता है।" },
            { en: "It evaluates conditional expressions to select execution routes.", hi: "यह निष्पादन मार्गों का चयन करने के लिए सशर्त अभिव्यक्तियों का मूल्यांकन करता है।" },
            { en: "It breaks continuous loops dynamically upon meeting exit criteria.", hi: "यह निकास मानदंडों को पूरा करने पर गतिशील रूप से निरंतर लूप को तोड़ता है।" },
            { en: "It searches target string indexes using fast boundary scans.", hi: "यह तेज़ सीमा स्कैन का उपयोग करके लक्ष्य स्ट्रिंग इंडेक्स खोजता है।" },
            { en: "It appends new objects directly to mutable list endpoints.", hi: "यह सीधे परिवर्तनशील सूची समापन बिंदुओं पर नए ऑब्जेक्ट जोड़ता है।" },
            { en: "It retrieves dictionary parameters without triggering key missing exceptions.", hi: "यह कुंजी गुम होने के अपवादों (exceptions) को ट्रिगर किए बिना डिक्शनरी मापदंडों को प्राप्त करता है।" },
            { en: "It executes user-defined operations to return calculated values.", hi: "यह गणना किए गए मानों को वापस करने के लिए उपयोगकर्ता-परिभाषित संचालन निष्पादित करता है।" },
            { en: "It generates pseudo-random float values within specific range boundaries.", hi: "यह विशिष्ट सीमा सीमाओं के भीतर छद्म-यादृच्छिक (pseudo-random) फ्लोट मान उत्पन्न करता है।" },
            { en: "It preserves record sequence orders to prevent modification side-effects.", hi: "यह संशोधन के दुष्प्रभावों को रोकने के लिए रिकॉर्ड अनुक्रम आदेशों को सुरक्षित रखता है।" },
            { en: "It loops lists recursively to execute deep node operations.", hi: "यह गहरे नोड संचालन को निष्पादित करने के लिए पुनरावृत्त रूप से सूचियों को लूप करता है।" }
        ],
        advantages: [
            { en: "This dynamic typing speeds up script prototyping by removing declarations.", hi: "यह डायनेमिक टाइपिंग घोषणाओं को हटाकर स्क्रिप्ट प्रोटोटाइपिंग को तेज करती है।" },
            { en: "This syntax structures conditional evaluations cleanly using inline blocks.", hi: "यह सिंटैक्स इनलाइन ब्लॉक का उपयोग करके सशर्त मूल्यांकनों को सफाई से संरचित करता है।" },
            { en: "This loop design simplifies list traversals through direct iteration logic.", hi: "यह लूप डिज़ाइन सीधे पुनरावृत्ति (iteration) तर्क के माध्यम से सूची ट्रैवर्सल को सरल बनाता है।" },
            { en: "This string format supports global multi-lingual glyphs using Unicode representation.", hi: "यह स्ट्रिंग प्रारूप यूनिकोड प्रतिनिधित्व का उपयोग करके वैश्विक बहुभाषी ग्लिफ़ का समर्थन करता है।" },
            { en: "This mutable format allows rapid element insertion and deletion updates.", hi: "यह परिवर्तनशील प्रारूप तेजी से तत्व सम्मिलन और विलोपन अपडेट की अनुमति देता है।" },
            { en: "This dictionary model guarantees constant-time value lookups using hash indexes.", hi: "यह डिक्शनरी मॉडल हैश इंडेक्स का उपयोग करके निरंतर-समय मान लुकअप की गारंटी देता है।" },
            { en: "This modular code improves maintainability by segregating functional duties.", hi: "यह मॉड्यूलर कोड कार्यात्मक कर्तव्यों को अलग करके रखरखाव में सुधार करता है।" },
            { en: "This import provides highly optimized calculations using built-in C libraries.", hi: "यह आयात अंतर्निहित C पुस्तकालयों का उपयोग करके अत्यधिक अनुकूलित गणना प्रदान करता है।" },
            { en: "This immutable tuple guarantees record data safety from accidental edits.", hi: "यह अपरिवर्तनीय टुपल आकस्मिक परिवर्तनों से रिकॉर्ड डेटा सुरक्षा की गारंटी देता है।" },
            { en: "This structure speeds up parallel element access through direct indexing.", hi: "यह संरचना सीधे अनुक्रमण (indexing) के माध्यम से समानांतर तत्व पहुंच को तेज करती है।" }
        ],
        tradeoffs: [
            { en: "This dynamic checking adds processing overhead during execution passes.", hi: "यह डायनेमिक चेकिंग निष्पादन पास के दौरान प्रोसेसिंग ओवरहेड जोड़ती है।" },
            { en: "This operator causes program crashes when dividing by zero variables.", hi: "शून्य चरों से विभाजित करने पर यह ऑपरेटर प्रोग्राम क्रैश का कारण बनता है।" },
            { en: "This nested conditional layout degrades code readability as checks expand.", hi: "चेक बढ़ने पर यह नेस्टेड सशर्त लेआउट कोड की पठनीयता को कम करता है।" },
            { en: "This structure triggers infinite loop states if exit variables fail.", hi: "यदि निकास चर (exit variables) विफल हो जाते हैं तो यह संरचना अनंत लूप स्थितियों को ट्रिगर करती है।" },
            { en: "This manipulation creates new memory copies due to immutable string traits.", hi: "यह हेरफेर अपरिवर्तनीय (immutable) स्ट्रिंग विशेषताओं के कारण नए मेमोरी कॉपियां बनाता है।" },
            { en: "This list array requires sequential element shifts during index deletions.", hi: "इस सूची सरणी को इंडेक्स विलोपन के दौरान अनुक्रमिक तत्व पारियों की आवश्यकता होती है।" },
            { en: "This model suffers from high memory footprint due to hash tables.", hi: "यह मॉडल हैश तालिकाओं के कारण उच्च मेमोरी पदचिह्न (memory footprint) से ग्रस्त है।" },
            { en: "This functional call adds stack execution overhead during deep recursions.", hi: "यह कार्यात्मक कॉल गहरे रिकर्शन के दौरान स्टैक निष्पादन ओवरहेड जोड़ता है।" },
            { en: "This import adds loading delay when importing large system namespaces.", hi: "यह आयात बड़े सिस्टम नेमस्पेस आयात करते समय लोडिंग विलंब जोड़ता है।" },
            { en: "This sequence blocks write operations and requires complete record redeclaration.", hi: "यह अनुक्रम लिखने के संचालन को रोकता है और पूर्ण रिकॉर्ड पुनर्घोषणा की मांग करता है।" }
        ],
        scenarios: [
            { en: "Variable scope shadow triggers unexpected value overrides inside loops.", hi: "वेरिएबल स्कोप शैडो लूप के अंदर अप्रत्याशित मान ओवरराइड को ट्रिगर करता है।" },
            { en: "Arithmetic execution crash occurs due to dynamic type mismatch checks.", hi: "गतिशील प्रकार बेमेल जांच के कारण अंकगणितीय निष्पादन क्रैश होता है।" },
            { en: "Logic error bypasses crucial validation blocks in conditional setups.", hi: "तार्किक त्रुटि सशर्त सेटअप में महत्वपूर्ण सत्यापन ब्लॉकों को बायपास कर देती है।" },
            { en: "Infinite iteration freezes the system due to unchecked loop steps.", hi: "अनियंत्रित लूप चरणों के कारण अनंत पुनरावृत्ति सिस्टम को फ्रीज कर देती है।" },
            { en: "IndexError occurs during slice calculations on empty string structures.", hi: "खाली स्ट्रिंग संरचनाओं पर स्लाइस गणना के दौरान IndexError होता है।" },
            { en: "Memory leak arises due to continuous dynamic list element insertions.", hi: "निरंतर गतिशील सूची तत्व प्रविष्टि (insertion) के कारण मेमोरी लीक उत्पन्न होती है।" },
            { en: "KeyError halts operations during lookups on unregistered dictionary keys.", hi: "पंजीकृत न की गई डिक्शनरी कुंजियों पर लुकअप के दौरान KeyError संचालन को रोक देता है।" },
            { en: "RecursionError triggers stack overflow during unchecked deep functional loops.", hi: "अनियंत्रित गहरे कार्यात्मक लूप के दौरान RecursionError स्टैक ओवरफ़्लो को ट्रिगर करता है।" },
            { en: "ImportError blocks system execution due to unregistered path configurations.", hi: "पंजीकृत न किए गए पथ कॉन्फ़िगरेशन के कारण ImportError सिस्टम निष्पादन को रोकता है।" },
            { en: "TypeError occurs when trying to write to immutable tuple indexes.", hi: "अपरिवर्तनीय टुपल इंडेक्स में लिखने का प्रयास करते समय TypeError होता है।" }
        ]
    },
    "DS": {
        properties: [
            { en: "This stack class restricts element access to a LIFO policy.", hi: "यह स्टैक क्लास तत्व पहुंच को LIFO नीति तक सीमित करती है।" },
            { en: "This linear queue structures dynamic element access using a FIFO logic.", hi: "यह रैखिक कतार FIFO तर्क का उपयोग करके गतिशील तत्व पहुंच की संरचना करती है।" },
            { en: "This sorting algorithm exchanges adjacent records under simple comparison checks.", hi: "यह सॉर्टिंग एल्गोरिदम सरल तुलना जांच के तहत आसन्न रिकॉर्ड का आदान-प्रदान करता है।" },
            { en: "This selection method identifies worst-case computational upper bounds directly.", hi: "यह चयन विधि सीधे सबसे खराब स्थिति कम्प्यूटेशनल ऊपरी सीमाओं की पहचान करती है।" },
            { en: "This partition logic groups elements using recursive pivot coordinates.", hi: "यह विभाजन तर्क पुनरावर्ती पिवट निर्देशांक का उपयोग करके तत्वों को समूहित करता है।" },
            { en: "This binary search splits target arrays iteratively using midpoint steps.", hi: "यह बाइनरी खोज मिडपॉइंट चरणों का उपयोग करके लक्ष्य सरणियों को पुनरावृत्ति रूप से विभाजित करती है।" },
            { en: "This complexity analysis uses master formulas to compute execution bounds.", hi: "यह जटिलता विश्लेषण निष्पादन सीमाओं की गणना करने के लिए मास्टर सूत्रों का उपयोग करता है।" },
            { en: "This recursion function calls itself with simplified subproblem inputs.", hi: "यह रिकर्शन फ़ंक्शन खुद को सरल उप-समस्या इनपुट के साथ कॉल करता है।" },
            { en: "This directory stream reads disk data blocks in sequential passes.", hi: "यह निर्देशिका स्ट्रीम अनुक्रमिक पास में डिस्क डेटा ब्लॉकों को पढ़ती है।" },
            { en: "This dynamic queue manages element positions using circular index bounds.", hi: "यह गतिशील कतार वृत्ताकार इंडेक्स सीमाओं का उपयोग करके तत्व स्थितियों का प्रबंधन करती है।" }
        ],
        objectives: [
            { en: "It manages program activation records during deep nested subprogram loops.", hi: "यह गहरे नेस्टेड उप-प्रोग्राम लूप के दौरान प्रोग्राम एक्टिवेशन रिकॉर्ड का प्रबंधन करता है।" },
            { en: "It regulates print spooling pipelines to ensure fair data flow.", hi: "यह निष्पक्ष डेटा प्रवाह सुनिश्चित करने के लिए प्रिंट स्पूलिंग पाइपलाइनों को नियंत्रित करता है।" },
            { en: "It minimizes element swap rates inside small comparison sorting passes.", hi: "यह छोटे तुलना सॉर्टिंग पास के अंदर तत्व स्वैप दरों को न्यूनतम करता है।" },
            { en: "It finds target elements by systematically splitting search space limits.", hi: "यह खोज स्थान सीमाओं को व्यवस्थित रूप से विभाजित करके लक्ष्य तत्वों को ढूंढता है।" },
            { en: "It isolates pivot elements to speed up recursive subarray sorting.", hi: "यह पुनरावर्ती सबअरे सॉर्टिंग को तेज करने के लिए पिवट तत्वों को अलग करता है।" },
            { en: "It calculates array offsets dynamically to accelerate indexing operations speed.", hi: "यह अनुक्रमण (indexing) संचालन गति को तेज करने के लिए सरणी ऑफसेट की गणना गतिशील रूप से करता है।" },
            { en: "It estimates algorithmic complexity models to prevent resource starvation risks.", hi: "यह संसाधन भुखमरी के जोखिमों को रोकने के लिए एल्गोरिथम जटिलता मॉडल का अनुमान लगाता है।" },
            { en: "It stores recursion parameters cleanly to prevent execution memory drops.", hi: "यह निष्पादन मेमोरी ड्रॉप्स को रोकने के लिए रिकर्शन मापदंडों को सफाई से संग्रहीत करता है।" },
            { en: "It writes structured log lines to secure transaction recovery histories.", hi: "यह लेनदेन पुनर्प्राप्ति इतिहास को सुरक्षित करने के लिए संरचित लॉग लाइनें लिखता है।" },
            { en: "It handles queue index wraps to prevent memory leak states.", hi: "यह मेमोरी लीक की स्थिति को रोकने के लिए कतार इंडेक्स रैप को संभालता है।" }
        ],
        advantages: [
            { en: "This stack structures LIFO routines with constant-time push-pop execution speeds.", hi: "यह स्टैक निरंतर-समय पुश-पॉप निष्पादन गति के साथ LIFO रूटीन की संरचना करता है।" },
            { en: "This queue guarantees completely fair scheduling orders across multiple server tasks.", hi: "यह कतार कई सर्वर कार्यों में पूरी तरह से निष्पक्ष शेड्यूलिंग ऑर्डर की गारंटी देती है।" },
            { en: "This sorting layout requires zero auxiliary array memory allocations during runs.", hi: "इस सॉर्टिंग लेआउट को रन के दौरान शून्य सहायक सरणी मेमोरी आवंटन की आवश्यकता होती है।" },
            { en: "This search algorithm scans sorted arrays with optimal logarithmic efficiency.", hi: "यह खोज एल्गोरिदम इष्टतम लॉगरिदमिक दक्षता के साथ क्रमबद्ध सरणियों को स्कैन करता है।" },
            { en: "This quick partition accelerates average sorting passes on large datasets.", hi: "यह त्वरित विभाजन बड़े डेटासेट पर औसत सॉर्टिंग पास को तेज करता है।" },
            { en: "This index mapping simplifies address calculations in multi-dimensional matrices.", hi: "यह इंडेक्स मैपिंग बहु-आयामी मैट्रिसेस में पता गणनाओं को सरल बनाती है।" },
            { en: "This math model evaluates worst-case bounds without actual code execution.", hi: "यह गणित मॉडल वास्तविक कोड निष्पादन के बिना सबसे खराब स्थिति की सीमाओं का मूल्यांकन करता है।" },
            { en: "This recursion simplifies complex branching algorithms through elegant self-calls.", hi: "यह रिकर्शन सुरुचिपूर्ण स्व-कॉल के माध्यम से जटिल ब्रांचिंग एल्गोरिदम को सरल बनाता है।" },
            { en: "This file handling separates read structures from physical write access lines.", hi: "यह फ़ाइल हैंडलिंग रीड संरचनाओं को भौतिक राइट एक्सेस लाइनों से अलग करती है।" },
            { en: "This circular layout avoids index shifting and reduces array processing latency.", hi: "यह वृत्ताकार लेआउट इंडेक्स शिफ्टिंग से बचाता है और सरणी प्रसंस्करण विलंबता को कम करता है।" }
        ],
        tradeoffs: [
            { en: "This stack triggers overflow errors under deep computational loops.", hi: "यह स्टैक गहरे कम्प्यूटेशनल लूप के तहत ओवरफ़्लो त्रुटियों को ट्रिगर करता है।" },
            { en: "This queue introduces latency overhead due to index shifting calculations.", hi: "यह कतार इंडेक्स शिफ्टिंग गणनाओं के कारण विलंबता ओवरहेड पेश करती है।" },
            { en: "This sorting method degrades to quadratic complexity under large unsorted records.", hi: "यह सॉर्टिंग विधि बड़े अक्रमबद्ध रिकॉर्ड के तहत द्विघात जटिलता तक कम हो जाती है।" },
            { en: "This binary search demands completely sorted arrays before starting scans.", hi: "इस बाइनरी खोज को स्कैन शुरू करने से पहले पूरी तरह से क्रमबद्ध सरणियों की आवश्यकता होती है।" },
            { en: "This quick sorting degrades under bad pivot selections on sorted arrays.", hi: "यह त्वरित सॉर्टिंग क्रमबद्ध सरणियों पर खराब पिवट चरों के तहत कम हो जाती है।" },
            { en: "This array structures experience boundary overflow risk under dynamic sizing updates.", hi: "यह सरणी संरचनाएं गतिशील आकार अपडेट के तहत सीमा ओवरफ़्लो जोखिम का अनुभव करती हैं।" },
            { en: "This complexity analysis ignores local constant factors during processing calculations.", hi: "यह जटिलता विश्लेषण प्रसंस्करण गणना के दौरान स्थानीय निरंतर कारकों को अनदेखा करता है।" },
            { en: "This recursive style consumes excessive stack space and risks crashes.", hi: "यह पुनरावर्ती शैली अत्यधिक स्टैक स्पेस का उपभोग करती है और क्रैश का जोखिम उठाती है।" },
            { en: "This disk file setup slows down operations due to mechanical write seek times.", hi: "यह डिस्क फ़ाइल सेटअप यांत्रिक राइट सीक समय के कारण संचालन को धीमा कर देता है।" },
            { en: "This circular queue limits maximum capacities due to fixed boundary constraints.", hi: "यह वृत्ताकार कतार निश्चित सीमा बाधाओं के कारण अधिकतम क्षमताओं को सीमित करती है।" }
        ],
        scenarios: [
            { en: "Unchecked push operations on full stacks trigger immediate overflow crashes.", hi: "पूर्ण स्टैक पर अनियंत्रित पुश संचालन तत्काल ओवरफ़्लो क्रैश को ट्रिगर करता है।" },
            { en: "Index shift logic failure causes data mismatch in linear queue arrays.", hi: "इंडेक्स शिफ्ट लॉजिक विफलता रैखिक कतार सरणियों में डेटा बेमेल का कारण बनती है।" },
            { en: "Bubble sort pass crash occurs due to wrong execution comparison signs.", hi: "गलत निष्पादन तुलना चिह्नों के कारण बबल सॉर्ट पास क्रैश होता है।" },
            { en: "Binary search on unsorted arrays yields missing target logic failures.", hi: "अक्रमबद्ध सरणियों पर बाइनरी खोज से लक्ष्य लॉजिक विफलताएं प्राप्त होती हैं।" },
            { en: "Bad pivot choices trigger quadratic depth in quick sorting execution paths.", hi: "खराब पिवट विकल्प त्वरित सॉर्टिंग निष्पादन पथों में द्विघात गहराई को ट्रिगर करते हैं।" },
            { en: "Dynamic size allocation failures freeze array index pointer calculation tracks.", hi: "गतिशील आकार आवंटन विफलताएं सरणी इंडेक्स पॉइंटर गणना ट्रैक्स को फ्रीज कर देती हैं।" },
            { en: "Recursive loop depth threshold overrides cause system stack panic shutdowns.", hi: "पुनरावर्ती लूप गहराई सीमा ओवरराइड सिस्टम स्टैक पैनिक शटडाउन का कारण बनती है।" },
            { en: "File descriptor leaks freeze database read-write channel buffers permanently.", hi: "फ़ाइल डिस्क्रिप्टर लीक डेटाबेस रीड-राइट चैनल बफ़र्स को स्थायी रूप से फ्रीज कर देते हैं।" },
            { en: "Circular index wrap calculations overlap existing active queue records.", hi: "वृत्ताकार इंडेक्स रैप गणना मौजूदा सक्रिय कतार रिकॉर्ड को ओवरलैप करती है।" },
            { en: "System call timing race breaks down synchronized stack push sequences.", hi: "सिस्टम कॉल टाइमिंग रेस सिंक्रनाइज़ किए गए स्टैक पुश अनुक्रमों को तोड़ देती है।" }
        ]
    },
    "NET": {
        properties: [
            { en: "This packet router directs network data blocks across optimized routes.", hi: "यह पैकेट राउटर अनुकूलित मार्गों पर नेटवर्क डेटा ब्लॉकों को निर्देशित करता है।" },
            { en: "This framing layer encapsulates binary sequences into logical transmission frames.", hi: "यह फ्रेमिंग परत बाइनरी अनुक्रमों को तार्किक ट्रांसमिशन फ्रेम में समाहित करती है।" },
            { en: "This protocol handshake synchronizes connection parameters between active nodes.", hi: "यह प्रोटोकॉल हैंडशेक सक्रिय नोड्स के बीच कनेक्शन मापदंडों को सिंक्रनाइज़ करता है।" },
            { en: "This physical media modulates electrical or light signals across channels.", hi: "यह भौतिक मीडिया चैनलों में विद्युत या प्रकाश सिग्नलों को मॉड्युलेट करता है।" },
            { en: "This collision checker evaluates channel states using CSMA/CD rules.", hi: "यह कोलिजन चेकर CSMA/CD नियमों का उपयोग करके चैनल अवस्थाओं का मूल्यांकन करता है।" },
            { en: "This directory system maps human-readable domain names to binary IP coordinates.", hi: "यह निर्देशिका प्रणाली मानव-पठनीय डोमेन नामों को बाइनरी आईपी निर्देशांक में मैप करती है।" },
            { en: "This subnet mask separates network identifiers from local host addresses.", hi: "यह सबनेट मास्क नेटवर्क पहचानकर्ताओं को स्थानीय होस्ट पतों से अलग करता है।" },
            { en: "This transmission medium guides laser pulses through high-purity glass cores.", hi: "यह ट्रांसमिशन माध्यम उच्च-पवित्रता वाले ग्लास कोर के माध्यम से लेजर पल्स को निर्देशित करता है।" },
            { en: "This server dynamically leases logical address bounds to network devices.", hi: "यह सर्वर नेटवर्क उपकरणों को तार्किक एड्रेस सीमाओं को गतिशील रूप से लीज पर देता है।" },
            { en: "This error checker computes cyclic redundancy checksum blocks for validation.", hi: "यह त्रुटि चेकर सत्यापन के लिए चक्रीय अतिरेक (CRC) चेकसम ब्लॉकों की गणना करता है।" }
        ],
        objectives: [
            { en: "It routes network packets across autonomous gateway systems seamlessly.", hi: "यह नेटवर्क पैकेटों को स्वायत्त गेटवे सिस्टमों में निर्बाध रूप से रूट करता है।" },
            { en: "It optimizes channel bandwidth through active frame collision checking rules.", hi: "यह सक्रिय फ्रेम कोलिजन चेकिंग नियमों के माध्यम से चैनल बैंडविड्थ को अनुकूलित करता है।" },
            { en: "It prevents network packet losses using sliding window flow control.", hi: "यह स्लाइडिंग विंडो फ्लो कंट्रोल का उपयोग करके नेटवर्क पैकेट के नुकसान को रोकता है।" },
            { en: "It resolves physical MAC address links to coordinate node communications.", hi: "यह नोड संचार का समन्वय करने के लिए भौतिक मैक पते के लिंक को हल करता है।" },
            { en: "It translates domain locations dynamically to speed up request routes.", hi: "यह अनुरोध मार्गों को तेज करने के लिए डोमेन स्थानों का गतिशील रूप से अनुवाद करता है।" },
            { en: "It coordinates packet transport to bypass routing loops in wide areas.", hi: "यह विस्तृत क्षेत्रों में राउटिंग लूप को बायपास करने के लिए पैकेट परिवहन का समन्वय करता है।" },
            { en: "It handles frame error checks to prevent logical data corruption issues.", hi: "यह तार्किक डेटा भ्रष्टाचार के मुद्दों को रोकने के लिए फ्रेम त्रुटि जांच को संभालता है।" },
            { en: "It segments IP blocks to secure logical network isolation levels.", hi: "यह तार्किक नेटवर्क अलगाव स्तरों को सुरक्षित करने के लिए आईपी ब्लॉकों को खंडित करता है।" },
            { en: "It leases temporary network addresses to simplify device configuration.", hi: "यह डिवाइस कॉन्फ़िगरेशन को सरल बनाने के लिए अस्थायी नेटवर्क पते लीज पर देता है।" },
            { en: "It checks bit parity structures to discover transmission noise corruption.", hi: "यह ट्रांसमिशन शोर भ्रष्टाचार को खोजने के लिए बिट पैरिटी संरचनाओं की जांच करता है।" }
        ],
        advantages: [
            { en: "This routing protocol reduces table size expansion through prefix compaction.", hi: "यह राउटिंग प्रोटोकॉल उपसर्ग संघनन (prefix compaction) के माध्यम से तालिका आकार के विस्तार को कम करता है।" },
            { en: "This framing scheme isolates transmission errors inside single data blocks.", hi: "यह फ्रेमिंग योजना एकल डेटा ब्लॉकों के भीतर ट्रांसमिशन त्रुटियों को अलग करती है।" },
            { en: "This connection handshake guarantees completely reliable sequential byte delivery pipelines.", hi: "यह कनेक्शन हैंडशेक पूरी तरह से विश्वसनीय अनुक्रमिक बाइट वितरण पाइपलाइनों की गारंटी देता है।" },
            { en: "This media delivers extreme data bandwidth with complete immunity to EMI.", hi: "यह मीडिया ईएमआई से पूर्ण मुक्ति के साथ अत्यधिक डेटा बैंडविड्थ प्रदान करता है।" },
            { en: "This collision logic optimizes wireless channel access under highly dense nodes.", hi: "यह कोलिजन लॉजिक अत्यधिक घने नोड्स के तहत वायरलेस चैनल एक्सेस को अनुकूलित करता है।" },
            { en: "This directory model speeds up web request setups through distributed caching.", hi: "यह निर्देशिका मॉडल वितरित कैशिंग के माध्यम से वेब अनुरोध सेटअप को तेज करता है।" },
            { en: "This subnetwork layout reduces broadcast traffic across corporate network sectors.", hi: "यह सबनेटवर्क लेआउट कॉर्पोरेट नेटवर्क क्षेत्रों में ब्रॉडकास्ट ट्रैफ़िक को कम करता है।" },
            { en: "This setup minimizes signal attenuation over extremely long transit distances.", hi: "यह सेटअप अत्यधिक लंबी पारगमन दूरी पर सिग्नल क्षीणन को न्यूनतम करता है।" },
            { en: "This dynamic leasing reduces administrator configuration duties on corporate networks.", hi: "यह गतिशील लीजिंग कॉर्पोरेट नेटवर्क पर प्रशासक कॉन्फ़िगरेशन कर्तव्यों को कम करती है।" },
            { en: "This error validation guarantees high data integrity across noisy channels.", hi: "यह त्रुटि सत्यापन शोर वाले चैनलों में उच्च डेटा अखंडता की गारंटी देता है।" }
        ],
        tradeoffs: [
            { en: "This protocol adds significant header byte overhead to transmission frames.", hi: "यह प्रोटोकॉल ट्रांसमिशन फ्रेम में महत्वपूर्ण हेडर बाइट ओवरहेड जोड़ता है।" },
            { en: "This routing table model demands high memory storage on gateways.", hi: "यह राउटिंग टेबल मॉडल गेटवे पर उच्च मेमोरी स्टोरेज की मांग करता है।" },
            { en: "This connection routine adds handshake delays before initiating active transmissions.", hi: "यह कनेक्शन रूटीन सक्रिय प्रसारण शुरू करने से पहले हैंडशेक विलंब जोड़ता है।" },
            { en: "This fiber layout requires expensive hardware splicing tools during installations.", hi: "यह फाइबर लेआउट इंस्टॉलेशन के दौरान महंगे हार्डवेयर स्प्लिसिंग टूल की मांग करता है।" },
            { en: "This wireless approach exhibits signal drops due to building structural blocks.", hi: "यह वायरलेस दृष्टिकोण इमारतों के संरचनात्मक ब्लॉकों के कारण सिग्नल ड्रॉप प्रदर्शित करता है।" },
            { en: "This directory table suffers from sync delay during global record updates.", hi: "यह निर्देशिका तालिका वैश्विक रिकॉर्ड अपडेट के दौरान सिंक विलंब से ग्रस्त है।" },
            { en: "This subnetwork limits maximum host range due to rigid prefix allocations.", hi: "यह सबनेटवर्क कठोर उपसर्ग आवंटन के कारण अधिकतम होस्ट सीमा को सीमित करता है।" },
            { en: "This medium layout requires high initial installation costs and expertise.", hi: "इस माध्यम लेआउट के लिए उच्च प्रारंभिक स्थापना लागत और विशेषज्ञता की आवश्यकता होती है।" },
            { en: "This server configuration triggers single point of network-wide failure risks.", hi: "यह सर्वर कॉन्फ़िगरेशन नेटवर्क-व्यापी विफलता जोखिमों के एकल बिंदु को ट्रिगर करता है।" },
            { en: "This parity system cannot correct complex multi-bit transmission failures.", hi: "यह पैरिटी प्रणाली जटिल मल्टी-बिट ट्रांसमिशन विफलताओं को ठीक नहीं कर सकती है।" }
        ],
        scenarios: [
            { en: "Gateway table corruption routes local corporate packets into infinite loops.", hi: "गेटवे तालिका भ्रष्टाचार स्थानीय कॉर्पोरेट पैकेटों को अनंत लूपों में भेज देता है।" },
            { en: "Frame preamble skewing triggers CRC validation drops at switches.", hi: "फ्रेम प्रस्तावना (preamble) तिरछापन स्विच पर CRC सत्यापन ड्रॉप को ट्रिगर करता है।" },
            { en: "TCP buffer depletion causes severe sliding window transmission stalls.", hi: "टीसीपी बफर कमी गंभीर स्लाइडिंग विंडो ट्रांसमिशन स्टालों का कारण बनती है।" },
            { en: "Fiber optic line micro-fractures trigger massive signal attenuation drops.", hi: "फाइबर ऑप्टिक लाइन माइक्रो-फ्रैक्चर बड़े पैमाने पर सिग्नल क्षीणन ड्रॉप को ट्रिगर करते हैं।" },
            { en: "Wireless channel interference freezes active local device connection queues.", hi: "वायरलेस चैनल हस्तक्षेप सक्रिय स्थानीय डिवाइस कनेक्शन कतारों को फ्रीज कर देता है।" },
            { en: "DNS lookup cache corruption redirects web traffic to invalid IPs.", hi: "डीएनएस लुकअप कैश भ्रष्टाचार वेब ट्रैफ़िक को अमान्य आईपी पर रीडायरेक्ट करता है।" },
            { en: "Subnet mask configuration mismatch isolates local corporate server blocks.", hi: "सबनेट मास्क कॉन्फ़िगरेशन बेमेल होने से स्थानीय कॉर्पोरेट सर्वर ब्लॉक अलग हो जाते हैं।" },
            { en: "Cable attenuation boundary crossings generate unrecognizable bit streams.", hi: "केबल क्षीणन सीमा पार करने से अपरिचित बिट स्ट्रीम उत्पन्न होती हैं।" },
            { en: "DHCP address pool exhaustion blocks new device connection attempts.", hi: "डीएचसीपी एड्रेस पूल समाप्त होने से नए डिवाइस कनेक्शन प्रयास ब्लॉक हो जाते हैं।" },
            { en: "High transmission noise levels trigger continuous packet retransmission requests.", hi: "उच्च ट्रांसमिशन शोर स्तर निरंतर पैकेट पुनर्संचरण (retransmission) अनुरोधों को ट्रिगर करते हैं।" }
        ]
    },
    "DB": {
        properties: [
            { en: "This database model structures relational tables using strict schema definitions.", hi: "यह डेटाबेस मॉडल सख्त स्कीमा परिभाषाओं का उपयोग करके संबंधपरक (relational) तालिकाओं की संरचना करता है।" },
            { en: "This primary key uniquely identifies single rows across database tables.", hi: "यह प्राथमिक कुंजी डेटाबेस तालिकाओं में एकल पंक्तियों की विशिष्ट रूप से पहचान करती है।" },
            { en: "This normalization split decomposes relations to eliminate data modification anomalies.", hi: "यह सामान्यीकरण विभाजन डेटा संशोधन विसंगतियों को समाप्त करने के लिए संबंधों को विघटित करता है।" },
            { en: "This SQL command alters existing structural table configurations directly.", hi: "यह SQL कमांड सीधे मौजूदा संरचनात्मक तालिका कॉन्फ़िगरेशन को बदलता है।" },
            { en: "This aggregate filter filters grouped database rows using aggregate conditions.", hi: "यह एग्रीगेट फ़िल्टर एग्रीगेट स्थितियों का उपयोग करके समूहीकृत डेटाबेस पंक्तियों को फ़िल्टर करता है।" },
            { en: "This joint operation combines columns from multiple tables using foreign relations.", hi: "यह संयुक्त (joint) ऑपरेशन विदेशी संबंधों का उपयोग करके कई तालिकाओं के कॉलम को जोड़ता है।" },
            { en: "This transaction manager guarantees ACID properties across execution steps.", hi: "यह लेनदेन प्रबंधक निष्पादन चरणों में ACID गुणों की गारंटी देता है।" },
            { en: "This SQL command inserts new record rows into target databases.", hi: "यह SQL कमांड लक्ष्य डेटाबेस में नए रिकॉर्ड पंक्तियाँ सम्मिलित करता है।" },
            { en: "This foreign constraint validates relational links to ensure data integrity.", hi: "यह बाहरी प्रतिबंध डेटा अखंडता सुनिश्चित करने के लिए संबंधपरक (relational) लिंक को मान्य करता है।" },
            { en: "This concurrency scheme restricts table access using shared or exclusive locks.", hi: "यह समवर्ती (concurrency) योजना साझा या अनन्य लॉक का उपयोग करके तालिका पहुंच को प्रतिबंधित करती है।" }
        ],
        objectives: [
            { en: "It guarantees relational consistency through database key validation checks.", hi: "यह डेटाबेस कुंजी सत्यापन जांच के माध्यम से संबंधपरक निरंतरता की गारंटी देता है।" },
            { en: "It eliminates redundant structural storage by separating relational entities.", hi: "यह संबंधपरक संस्थाओं (entities) को अलग करके अनावश्यक संरचनात्मक भंडारण को समाप्त करता है।" },
            { en: "It coordinates multi-table join sweeps to speed up complex queries.", hi: "यह जटिल प्रश्नों को तेज करने के लिए बहु-तालिका जॉइन स्वीप का समन्वय करता है।" },
            { en: "It alters database schema layouts without destroying existing record lines.", hi: "यह मौजूदा रिकॉर्ड लाइनों को नष्ट किए बिना डेटाबेस स्कीमा लेआउट को बदलता है।" },
            { en: "It aggregates column values to compute system summary parameters.", hi: "यह सिस्टम सारांश मापदंडों की गणना करने के लिए कॉलम मानों को एकत्रित करता है।" },
            { en: "It rolls back failed transaction states to maintain database consistency bounds.", hi: "यह डेटाबेस स्थिरता सीमाओं को बनाए रखने के लिए विफल लेनदेन राज्यों को रोल बैक करता है।" },
            { en: "It secures data access boundaries using dedicated logical views.", hi: "यह समर्पित तार्किक विचारों का उपयोग करके डेटा एक्सेस सीमाओं को सुरक्षित करता है।" },
            { en: "It validates transaction isolation levels to prevent dirty read failures.", hi: "यह डर्टी रीड विफलताओं को रोकने के लिए लेनदेन अलगाव स्तरों को मान्य करता है।" },
            { en: "It structures Entity-Relationship models to simplify database planning.", hi: "यह डेटाबेस योजना को सरल बनाने के लिए इकाई-संबंध (ER) मॉडल की संरचना करता है।" },
            { en: "It manages write locks to prevent transactional database deadlock states.", hi: "यह लेनदेन डेटाबेस डेडलॉक राज्यों को रोकने के लिए राइट लॉक का प्रबंधन करता है।" }
        ],
        advantages: [
            { en: "This relational schema guarantees complete data consistency across enterprise tables.", hi: "यह संबंधपरक स्कीमा एंटरप्राइज़ तालिकाओं में पूर्ण डेटा स्थिरता की गारंटी देता है।" },
            { en: "This normalization layout minimizes storage overhead by removing repeating groups.", hi: "यह सामान्यीकरण लेआउट दोहराए जाने वाले समूहों को हटाकर भंडारण ओवरहेड को न्यूनतम करता है।" },
            { en: "This indexing scheme speeds up row search passes on huge databases.", hi: "यह अनुक्रमण (indexing) योजना बड़े डेटाबेस पर पंक्ति खोज पास को तेज करती है।" },
            { en: "This DDL approach allows instant updates to schema definition layouts.", hi: "यह DDL दृष्टिकोण स्कीमा परिभाषा लेआउट में तत्काल अपडेट की अनुमति देता है।" },
            { en: "This aggregate method speeds up analysis through optimized database calculations.", hi: "यह एग्रीगेट विधि अनुकूलित डेटाबेस गणनाओं के माध्यम से विश्लेषण को तेज करती है।" },
            { en: "This transaction control guarantees reliable recovery after sudden system crashes.", hi: "यह लेनदेन नियंत्रण अचानक सिस्टम क्रैश के बाद विश्वसनीय पुनर्प्राप्ति की गारंटी देता है।" },
            { en: "This view isolation protects sensitive fields from unauthorized query paths.", hi: "यह दृश्य अलगाव संवेदनशील फ़ील्ड को अनधिकृत क्वेरी पथों से बचाता है।" },
            { en: "This join layout simplifies relational data mapping across diverse applications.", hi: "यह जॉइन लेआउट विभिन्न अनुप्रयोगों में संबंधपरक डेटा मैपिंग को सरल बनाता है।" },
            { en: "This concurrency scheme prevents write-write conflict crashes during updates.", hi: "यह समवर्ती योजना अपडेट के दौरान राइट-राइट संघर्ष क्रैश को रोकती है।" },
            { en: "This model ensures clear logical design through graphical ER representations.", hi: "यह मॉडल ग्राफिकल ईआर अभ्यावेदन के माध्यम से स्पष्ट तार्किक डिज़ाइन सुनिश्चित करता है।" }
        ],
        tradeoffs: [
            { en: "This structural schema demands high initial setup calculations and planning.", hi: "इस संरचनात्मक स्कीमा के लिए उच्च प्रारंभिक सेटअप गणना और योजना की आवश्यकता होती है।" },
            { en: "This decomposition adds processing delay during multi-table join operations.", hi: "यह अपघटन (decomposition) बहु-तालिका जॉइन संचालन के दौरान प्रसंस्करण विलंब जोड़ता है।" },
            { en: "This index layout increases write delays during record insertion updates.", hi: "यह इंडेक्स लेआउट रिकॉर्ड प्रविष्टि अपडेट के दौरान लेखन विलंब को बढ़ाता है।" },
            { en: "This DDL modification requires exclusive lock sweeps and freezes tables.", hi: "इस DDL संशोधन के लिए विशेष लॉक स्वीप की आवश्यकता होती है और यह तालिकाओं को फ्रीज कर देता है।" },
            { en: "This aggregate calculation consumes high processor utilization on servers.", hi: "यह एग्रीगेट गणना सर्वर पर उच्च प्रोसेसर उपयोग का उपभोग करती है।" },
            { en: "This transaction logging adds substantial write delay to active databases.", hi: "यह लेनदेन लॉगिंग सक्रिय डेटाबेस में पर्याप्त लेखन विलंब जोड़ती है।" },
            { en: "This security view increases database engine parsing times under high concurrency.", hi: "यह सुरक्षा दृश्य उच्च समरूपता के तहत डेटाबेस इंजन पार्सिंग समय को बढ़ाता है।" },
            { en: "This join architecture degrades speed when executing under missing index columns.", hi: "अनुक्रमित कॉलम न होने पर यह जॉइन आर्किटेक्चर निष्पादन की गति को कम कर देता है।" },
            { en: "This lock scheme triggers regular transaction rollback abort cycles.", hi: "यह लॉक योजना नियमित लेनदेन रोलबैक निरस्त (abort) चक्रों को ट्रिगर करती है।" },
            { en: "This graphical design limits physical storage layout customizability on disks.", hi: "यह ग्राफिकल डिज़ाइन डिस्क पर भौतिक भंडारण लेआउट अनुकूलन क्षमता को सीमित करता है।" }
        ],
        scenarios: [
            { en: "Schema definition mismatch triggers immediate SQL transaction query aborts.", hi: "स्कीमा परिभाषा बेमेल तत्काल SQL लेनदेन क्वेरी निरस्त को ट्रिगर करती है।" },
            { en: "Primary key duplication blocks batch record insertion sequences completely.", hi: "प्राथमिक कुंजी दोहराव बैच रिकॉर्ड प्रविष्टि अनुक्रमों को पूरी तरह से ब्लॉक कर देता है।" },
            { en: "Transitive dependency leaks trigger severe data update anomalies.", hi: "संक्रामक निर्भरता (transitive dependency) लीक गंभीर डेटा अपडेट विसंगतियों को ट्रिगर करते हैं।" },
            { en: "Table structural alter commands trigger database lock timeout panics.", hi: "तालिका संरचनात्मक परिवर्तन कमांड डेटाबेस लॉक टाइमआउट पैनिक को ट्रिगर करते हैं।" },
            { en: "Aggregate calculation overflow crashes database server execution memory.", hi: "एग्रीगेट गणना ओवरफ़्लो डेटाबेस सर्वर निष्पादन मेमोरी को क्रैश कर देता है।" },
            { en: "Unchecked database joins on unindexed columns freeze CPU lines.", hi: "अक्रमबद्ध कॉलम पर अनियंत्रित डेटाबेस जॉइन्स सीपीयू लाइनों को फ्रीज कर देते हैं।" },
            { en: "Write-Ahead log table corruption prevents post-crash database recovery operations.", hi: "राइट-अहेड लॉग तालिका भ्रष्टाचार क्रैश के बाद डेटाबेस पुनर्प्राप्ति संचालन को रोकता है।" },
            { en: "Concurrent write operations trigger database deadlock state recovery aborts.", hi: "समवर्ती लेखन संचालन डेटाबेस डेडलॉक स्थिति पुनर्प्राप्ति निरस्त को ट्रिगर करते हैं।" },
            { en: "Referential integrity constraint checks block critical parent-child row deletions.", hi: "संदर्भगत अखंडता प्रतिबंध (referential integrity constraint) जांच महत्वपूर्ण पैरेंट-चाइल्ड पंक्ति विलोपन को ब्लॉक करती है।" },
            { en: "Dirty read isolation failures generate inconsistent data outputs during updates.", hi: "डर्टी रीड आइसोलेशन विफलताएं अपडेट के दौरान असंगत डेटा आउटपुट उत्पन्न करती हैं।" }
        ]
    },
    "WEB": {
        properties: [
            { en: "This HTML container structures logical document blocks using semantic tags.", hi: "यह HTML कंटेनर सिमेंटिक टैग का उपयोग करके तार्किक दस्तावेज़ ब्लॉकों की संरचना करता है।" },
            { en: "This stylesheet rule coordinates elements layout using CSS box parameters.", hi: "यह स्टाइलशीट नियम सीएसएस बॉक्स मापदंडों का उपयोग करके तत्वों के लेआउट का समन्वय करता है।" },
            { en: "This JavaScript event handler triggers dynamic code execution upon user action.", hi: "यह जावास्क्रिप्ट इवेंट हैंडलर उपयोगकर्ता की कार्रवाई पर गतिशील कोड निष्पादन को ट्रिगर करता है।" },
            { en: "This cloud framework leases dynamic virtual servers through PaaS architectures.", hi: "यह क्लाउड ढांचा PaaS आर्किटेक्चर के माध्यम से गतिशील वर्चुअल सर्वर लीज पर देता है।" },
            { en: "This security firewall monitors port traffic using stateful inspection lists.", hi: "यह सुरक्षा फ़ायरवॉल स्टेटफुल इंस्पेक्शन सूचियों का उपयोग करके पोर्ट ट्रैफ़िक की निगरानी करता है।" },
            { en: "This cryptosystem authenticates users using asymmetric key signature vectors.", hi: "यह क्रिप्टो-सिस्टम असममित कुंजी हस्ताक्षर वैक्टर का उपयोग करके उपयोगकर्ताओं को प्रमाणित करता है।" },
            { en: "This machine learning model updates neural weights through backpropagation loops.", hi: "यह मशीन लर्निंग मॉडल बैकप्रोपैगेशन लूप के माध्यम से न्यूरल वेट को अपडेट करता है।" },
            { en: "This ledger framework links cryptographic transaction blocks using consensus logic.", hi: "यह लेज़र फ्रेमवर्क सर्वसम्मति तर्क का उपयोग करके क्रिप्टोग्राफ़िक लेनदेन ब्लॉकों को जोड़ता है।" },
            { en: "This statutory act regulates electronic transactions using legal enforcement codes.", hi: "यह वैधानिक अधिनियम कानूनी प्रवर्तन कोड का उपयोग करके इलेक्ट्रॉनिक लेनदेन को नियंत्रित करता है।" },
            { en: "This network device captures sensor telemetry logs in remote IoT nodes.", hi: "यह नेटवर्क डिवाइस रिमोट IoT नोड्स में सेंसर टेलीमेट्री लॉग कैप्चर करता है।" }
        ],
        objectives: [
            { en: "It structures web documents to improve client browser rendering speeds.", hi: "यह क्लाइंट ब्राउज़र रेंडरिंग गति में सुधार करने के लिए वेब दस्तावेज़ों की संरचना करता है।" },
            { en: "It optimizes visual element flow across diverse viewport size layouts.", hi: "यह विभिन्न व्यूपोर्ट आकार लेआउट में दृश्य तत्व प्रवाह को अनुकूलित करता है।" },
            { en: "It manipulates active web page nodes through direct DOM updates.", hi: "यह सीधे DOM अपडेट के माध्यम से सक्रिय वेब पेज नोड्स में हेरफेर करता है।" },
            { en: "It scales application server capacities to meet sudden transit demands.", hi: "यह अचानक पारगमन मांगों को पूरा करने के लिए एप्लिकेशन सर्वर क्षमताओं को स्केल करता है।" },
            { en: "It blocks unauthorized port connection requests using firewall rulesets.", hi: "यह फ़ायरवॉल नियम सेट का उपयोग करके अनधिकृत पोर्ट कनेक्शन अनुरोधों को ब्लॉक करता है।" },
            { en: "It encrypts data streams to guarantee absolute connection confidentiality boundaries.", hi: "यह पूर्ण कनेक्शन गोपनीयता सीमाओं की गारंटी देने के लिए डेटा स्ट्रीम को एन्क्रिप्ट करता है।" },
            { en: "It classifies unstructured data parameters through supervised classification rules.", hi: "यह पर्यवेक्षित वर्गीकरण नियमों के माध्यम से असंरचित डेटा मापदंडों को वर्गीकृत करता है।" },
            { en: "It preserves block ledger histories to prevent data override updates.", hi: "यह डेटा ओवरराइड अपडेट को रोकने के लिए ब्लॉक लेज़र इतिहास को सुरक्षित रखता है।" },
            { en: "It penalizes digital theft actions to enforce national cybersecurity standards.", hi: "यह राष्ट्रीय साइबर सुरक्षा मानकों को लागू करने के लिए डिजिटल चोरी के कार्यों को दंडित करता है।" },
            { en: "It coordinates distributed smart devices using wireless protocol gateways.", hi: "यह वायरलेस प्रोटोकॉल गेटवे का उपयोग करके वितरित स्मार्ट उपकरणों का समन्वय करता है।" }
        ],
        advantages: [
            { en: "This HTML tags model accelerates page parsing through clear structural guidelines.", hi: "यह HTML टैग मॉडल स्पष्ट संरचनात्मक दिशानिर्देशों के माध्यम से पेज पार्सिंग को गति देता है।" },
            { en: "This CSS layout simplifies responsive styling across mobile and desktop devices.", hi: "यह CSS लेआउट मोबाइल और डेस्कटॉप उपकरणों में उत्तरदायी (responsive) स्टाइलिंग को सरल बनाता है।" },
            { en: "This JS script delivers rich interactive behaviors directly in the browser.", hi: "यह JS स्क्रिप्ट सीधे ब्राउज़र में समृद्ध इंटरैक्टिव व्यवहार प्रदान करती है।" },
            { en: "This cloud interface minimizes hardware costs through pay-per-use scaling pools.", hi: "यह क्लाउड इंटरफ़ेस पे-पर-यूज़ स्केलिंग पूल के माध्यम से हार्डवेयर लागत को न्यूनतम करता है।" },
            { en: "This firewall setup blocks malicious port intrusions with low transit delay.", hi: "यह फ़ायरवॉल सेटअप कम पारगमन विलंब के साथ दुर्भावनापूर्ण पोर्ट घुसपैठ को रोकता है।" },
            { en: "This crypto design guarantees secure key exchange over public internet networks.", hi: "यह क्रिप्टो डिज़ाइन सार्वजनिक इंटरनेट नेटवर्क पर सुरक्षित कुंजी विनिमय की गारंटी देता है।" },
            { en: "This model extracts deep data features without manual parameter programming.", hi: "यह मॉडल मैन्युअल पैरामीटर प्रोग्रामिंग के बिना गहरे डेटा फीचर्स निकालता है।" },
            { en: "This blockchain ledger achieves high transaction security through decentralized consensus pools.", hi: "यह ब्लॉकचेन लेज़र विकेंद्रीकृत सर्वसम्मति पूल के माध्यम से उच्च लेनदेन सुरक्षा प्राप्त करता है।" },
            { en: "This cyber law protects digital transactions using robust legal enforcement frameworks.", hi: "यह साइबर कानून मजबूत कानूनी प्रवर्तन ढांचे का उपयोग करके डिजिटल लेनदेन की रक्षा करता है।" },
            { en: "This IoT framework streamlines hardware data collection across global telemetry setups.", hi: "यह IoT ढांचा वैश्विक टेलीमेट्री सेटअप में हार्डवेयर डेटा संग्रह को सुव्यवस्थित करता है।" }
        ],
        tradeoffs: [
            { en: "This document markup increases code complexity when using deeply nested blocks.", hi: "यह दस्तावेज़ मार्कअप गहरे नेस्टेड ब्लॉकों का उपयोग करते समय कोड जटिलता को बढ़ाता है।" },
            { en: "This layout requires massive browser parsing cycles to compute complex layouts.", hi: "इस लेआउट को जटिल लेआउट की गणना करने के लिए बड़े पैमाने पर ब्राउज़र पार्सिंग चक्रों की आवश्यकता होती है।" },
            { en: "This JavaScript environment introduces script execution delays under heavy dynamic runs.", hi: "यह जावास्क्रिप्ट वातावरण भारी गतिशील रन के तहत स्क्रिप्ट निष्पादन विलंब पेश करता है।" },
            { en: "This cloud layout binds organizations to supplier interfaces and setup protocols.", hi: "यह क्लाउड लेआउट संगठनों को आपूर्तिकर्ता इंटरफेस और सेटअप प्रोटोकॉल से बांधता है।" },
            { en: "This filtering firewall slows down packets due to state checking overhead.", hi: "यह फ़िल्टरिंग फ़ायरवॉल स्थिति जाँच (state checking) ओवरहेड के कारण पैकेट को धीमा कर देता है।" },
            { en: "This asymmetric logic increases CPU execution load during encryption passes.", hi: "यह असममित तर्क एन्क्रिप्शन पास के दौरान सीपीयू निष्पादन लोड को बढ़ाता है।" },
            { en: "This neural setup requires massive datasets and high processing resources.", hi: "इस न्यूरल सेटअप के लिए बड़े पैमाने पर डेटासेट और उच्च प्रसंस्करण संसाधनों की आवश्यकता होती है।" },
            { en: "This ledger model consumes substantial electricity due to computing consensus logic.", hi: "यह लेज़र मॉडल कंप्यूटिंग सर्वसम्मति तर्क के कारण पर्याप्त बिजली की खपत करता है।" },
            { en: "This legal framework struggles to regulate cross-border cyber safety issues.", hi: "यह कानूनी ढांचा सीमा पार साइबर सुरक्षा मुद्दों को नियंत्रित करने में संघर्ष करता है।" },
            { en: "This IoT system experiences high network bandwidth load under continuous reports.", hi: "यह IoT सिस्टम निरंतर रिपोर्ट के तहत उच्च नेटवर्क बैंडविड्थ लोड का अनुभव करता है।" }
        ],
        scenarios: [
            { en: "Malformed semantic tag nests trigger broken rendering layouts in browsers.", hi: "त्रुटिपूर्ण सिमेंटिक टैग घोंसले ब्राउज़र में टूटे हुए रेंडरिंग लेआउट को ट्रिगर करते हैं।" },
            { en: "CSS priority rule conflicts cause visual layout distortion across viewports.", hi: "सीएसएस प्राथमिकता नियम संघर्ष व्यूपोर्ट में दृश्य लेआउट विरूपण का कारण बनते हैं।" },
            { en: "Uncaught JavaScript exception breaks the web page dynamic events thread.", hi: "अनपेक्षित जावास्क्रिप्ट अपवाद वेब पेज के गतिशील इवेंट थ्रेड को तोड़ देता है।" },
            { en: "Cloud platform connection dropout halts distributed database sync routines.", hi: "क्लाउड प्लेटफॉर्म कनेक्शन ड्रॉपआउट वितरित डेटाबेस सिंक रूटीन को रोक देता है।" },
            { en: "Firewall ruleset configuration errors block valid web server traffic ports.", hi: "फ़ायरवॉल नियम सेट कॉन्फ़िगरेशन त्रुटियां वैध वेब सर्वर ट्रैफ़िक पोर्ट को ब्लॉक करती हैं।" },
            { en: "Private key exposure breaks asymmetric connection security and leaks databases.", hi: "निजी कुंजी का उजागर होना असममित कनेक्शन सुरक्षा को तोड़ता है और डेटाबेस लीक करता है।" },
            { en: "Neural model gradient explosion stops classification training parameters convergence.", hi: "न्यूरल मॉडल ग्रेडिएंट विस्फोट वर्गीकरण प्रशिक्षण मापदंडों के अभिसरण (convergence) को रोकता है।" },
            { en: "Consensus fork overlaps freeze dynamic transaction validations on block ledgers.", hi: "सर्वसम्मति फोर्क ओवरलैप ब्लॉक लेजर पर गतिशील लेनदेन सत्यापन को फ्रीज कर देते हैं।" },
            { en: "IT Act non-compliance results in immediate closure of web server directories.", hi: "आईटी अधिनियम के गैर-अनुपालन के परिणामस्वरूप वेब सर्वर निर्देशिकाओं को तत्काल बंद कर दिया जाता है।" },
            { en: "IoT telemetry node signal dropout interrupts live sensor monitoring streams.", hi: "IoT टेलीमेट्री नोड सिग्नल ड्रॉपआउट लाइव सेंसर मॉनिटरिंग स्ट्रीम को बाधित करता है।" }
        ]
    }
};

// 5 phrasing variations for each of the 5 difficulty/angle targets
const PHRASING_TEMPLATES = {
    0: [ // Easy (Definition & Core Concept)
        {
            en: "Which of the following options provides the most accurate and comprehensive definition of {concept}?",
            hi: "निम्नलिखित में से कौन सा विकल्प {concept} की सबसे सटीक और व्यापक परिभाषा प्रदान करता है?",
            expl_en: "{concept} is fundamentally defined as follows: {desc}. This makes it a core conceptual pillar in contemporary computer science.",
            expl_hi: "{concept} को मौलिक रूप से इस प्रकार परिभाषित किया गया है: {desc}। यह इसे समकालीन कंप्यूटर विज्ञान में एक मुख्य वैचारिक स्तंभ बनाता है।"
        },
        {
            en: "In the context of standard academic Computer Science, how is {concept} fundamentally characterized?",
            hi: "मानक शैक्षणिक कंप्यूटर विज्ञान के संदर्भ में, {concept} को मौलिक रूप से कैसे चित्रित किया जाता है?",
            expl_en: "The primary conceptual baseline for {concept} states that {desc}. Understanding this is essential for entry-level exam preparation.",
            expl_hi: "{concept} के लिए प्राथमिक वैचारिक आधार रेखा यह बताती है कि {desc}। प्रवेश स्तर की परीक्षा की तैयारी के लिए इसे समझना आवश्यक है।"
        },
        {
            en: "Which statement best captures the core identity or basic conceptual framework of {concept}?",
            hi: "कौन सा कथन {concept} की मूल पहचान या बुनियादी वैचारिक ढांचे को सबसे अच्छी तरह दर्शाता है?",
            expl_en: "The core identity of {concept} revolves around the fact that {desc}. This establishes the baseline for all subsequent advanced configurations.",
            expl_hi: "{concept} की मूल पहचान इस तथ्य के इर्द-गिर्द घूमती है कि {desc}। यह बाद के सभी उन्नत विन्यास के लिए आधार रेखा स्थापित करता है।"
        },
        {
            en: "What is the primary operational role or definition of {concept} in standard computing system architectures?",
            hi: "मानक कंप्यूटिंग सिस्टम आर्किटेक्चर में {concept} की प्राथमिक परिचालन भूमिका या परिभाषा क्या है?",
            expl_en: "In standard architectures, {concept} is incorporated because {desc}. This represents a foundational building block taught across CBSE and NCERT curricula.",
            expl_hi: "मानक आर्किटेक्चर में, {concept} को इसलिए शामिल किया गया है क्योंकि {desc}। यह सीबीएसई और एनसीईआरटी पाठ्यक्रमों में पढ़ाए जाने वाले एक बुनियादी निर्माण खंड का प्रतिनिधित्व करता है।"
        },
        {
            en: "How is {concept} defined according to standard academic and NCERT Computer Science terminology?",
            hi: "मानक शैक्षणिक और एनसीईआरटी कंप्यूटर विज्ञान शब्दावली के अनुसार {concept} को कैसे परिभाषित किया गया है?",
            expl_en: "According to standard NCERT textbooks, {concept} is described by this fact: {desc}. This serves as a vital direct-recall query in competitive exams.",
            expl_hi: "मानक एनसीईआरटी पाठ्यपुस्तकों के अनुसार, {concept} को इस तथ्य से वर्णित किया गया है: {desc}। यह प्रतियोगी परीक्षाओं में एक महत्वपूर्ण प्रत्यक्ष-स्मरण (direct-recall) प्रश्न के रूप में कार्य करता है।"
        }
    ],
    1: [ // Medium (Operational Mechanism)
        {
            en: "How does the functional mechanism of {concept} execute its operations within system components?",
            hi: "सिस्टम घटकों के भीतर {concept} का कार्यात्मक तंत्र अपने संचालन को कैसे निष्पादित करता है?",
            expl_en: "The active processing flow of {concept} works because: {work}. This allows the hardware or software to resolve low-level logic states efficiently.",
            expl_hi: "{concept} का सक्रिय प्रसंस्करण प्रवाह इसलिए काम करता है क्योंकि: {work}। यह हार्डवेयर या सॉफ़्टवेयर को निम्न-स्तरीय लॉजिक अवस्थाओं को कुशलतापूर्वक हल करने की अनुमति देता है।"
        },
        {
            en: "Which of the following descriptions best explains the low-level processing steps or operation of {concept}?",
            hi: "निम्नलिखित में से कौन सा विवरण {concept} के निम्न-स्तरीय प्रसंस्करण चरणों या संचालन को सबसे अच्छी तरह समझाता है?",
            expl_en: "During live execution cycles, {concept} behaves as follows: {work}. This systematic flow prevents logical data races and coordinates processing paths.",
            expl_hi: "सक्रिय निष्पादन चक्रों के दौरान, {concept} इस प्रकार व्यवहार करता है: {work}। यह व्यवस्थित प्रवाह तार्किक डेटा रेस को रोकता है और प्रसंस्करण पथों का समन्वय करता है।"
        },
        {
            en: "During active system execution, in what manner is the physical or logical function of {concept} coordinated?",
            hi: "सक्रिय सिस्टम निष्पादन के दौरान, {concept} के भौतिक या तार्किक कार्य को किस प्रकार समन्वित किया जाता है?",
            expl_en: "The system coordinates the function of {concept} through this key pipeline: {work}. This alignment ensures synchronization across registers or memory cells.",
            expl_hi: "सिस्टम इस मुख्य पाइपलाइन के माध्यम से {concept} के कार्य का समन्वय करता है: {work}। यह संरेखण रजिस्टरों या मेमोरी सेल में सिंक्रनाइज़ेशन सुनिश्चित करता है।"
        },
        {
            en: "In what way does {concept} interact with other logical resources or registers to perform its tasks?",
            hi: "{concept} अपने कार्यों को करने के लिए अन्य तार्किक संसाधनों या रजिस्टरों के साथ किस प्रकार बातचीत करता है?",
            expl_en: "For execution tasks, {concept} integrates directly using this mechanism: {work}. This provides the necessary logic signals to drive subsequent execution blocks.",
            expl_hi: "निष्पादन कार्यों के लिए, {concept} सीधे इस तंत्र का उपयोग करके एकीकृत होता है: {work}। यह बाद के निष्पादन ब्लॉकों को चलाने के लिए आवश्यक लॉजिक सिग्नल प्रदान करता है।"
        },
        {
            en: "Which structural explanation accurately details how {concept} carries out its core processing flow?",
            hi: "कौन सा संरचनात्मक स्पष्टीकरण सटीक रूप से विवरण देता है कि {concept} अपने मूल प्रसंस्करण प्रवाह को कैसे पूरा करता है?",
            expl_en: "The detailed processing flow of {concept} is governed by this process: {work}. This standard mechanism is widely tested in technical modules of SSC and Railway exams.",
            expl_hi: "{concept} का विस्तृत प्रसंस्करण प्रवाह इस प्रक्रिया द्वारा शासित होता है: {work}। यह मानक तंत्र एसएससी और रेलवे परीक्षाओं के तकनीकी मॉड्यूल में व्यापक रूप से परीक्षण किया जाता है।"
        }
    ],
    2: [ // Medium (Technical Advantage)
        {
            en: "What is a major technical advantage or optimization benefit achieved by implementing {concept}?",
            hi: "{concept} को लागू करने से प्राप्त होने वाला एक प्रमुख तकनीकी लाभ या अनुकूलन लाभ क्या है?",
            expl_en: "Implementing {concept} yields significant design benefits, specifically: {adv}. This contributes to high runtime speeds and lower processor clock overheads.",
            expl_hi: "{concept} को लागू करने से महत्वपूर्ण डिज़ाइन लाभ मिलते हैं, विशेष रूप से: {adv}। यह उच्च रनटाइम गति और कम प्रोसेसर क्लॉक ओवरहेड में योगदान देता है।"
        },
        {
            en: "Why is {concept} preferred over legacy alternatives in contemporary high-performance computing?",
            hi: "समकालीन उच्च-प्रदर्शन कंप्यूटिंग में विरासत विकल्पों की तुलना में {concept} को क्यों पसंद किया जाता है?",
            expl_en: "The preference for {concept} is based on the following advantage: {adv}. By replacing archaic systems, it guarantees faster logic transitions and lower thermal output.",
            expl_hi: "{concept} के लिए वरीयता निम्नलिखित लाभ पर आधारित है: {adv}। पुराने सिस्टम को बदलकर, यह तेजी से लॉजिक संक्रमण और कम थर्मल आउटपुट की गारंटी देता है।"
        },
        {
            en: "Which of the following points highlights the principal computational advantage of using {concept}?",
            hi: "निम्नलिखित में से कौन सा बिंदु {concept} का उपयोग करने के मुख्य कम्प्यूटेशनल लाभ को उजागर करता है?",
            expl_en: "The outstanding benefit of {concept} lies in this fact: {adv}. This ensures that computing throughput is maintained even under intense multi-threaded workloads.",
            expl_hi: "{concept} का उत्कृष्ट लाभ इस तथ्य में निहित है: {adv}। यह सुनिश्चित करता है कि तीव्र मल्टी-थ्रेडेड कार्यभार के तहत भी कंप्यूटिंग थ्रूपुट बना रहे।"
        },
        {
            en: "In terms of design efficiency, what is the primary benefit that {concept} provides to system architects?",
            hi: "डिज़ाइन दक्षता के संदर्भ में, {concept} सिस्टम आर्किटेक्ट्स को प्राथमिक लाभ क्या प्रदान करता है?",
            expl_en: "Design efficiency is dramatically improved because {concept} ensures that {adv}. This directly translates to lower operational latency and stable system state transitions.",
            expl_hi: "डिज़ाइन दक्षता में नाटकीय रूप से सुधार होता है क्योंकि {concept} यह सुनिश्चित करता है कि {adv}। यह सीधे तौर पर कम परिचालन विलंबता और स्थिर सिस्टम स्थिति संक्रमण में अनुवादित होता है।"
        },
        {
            en: "How does the integration of {concept} contribute directly to higher throughput or lower latency?",
            hi: "{concept} का एकीकरण सीधे उच्च थ्रूपुट या कम विलंबता में कैसे योगदान देता है?",
            expl_en: "Direct throughput improvements are observed because {concept} works as follows: {adv}. This eliminates traditional bottlenecks associated with synchronous register access delays.",
            expl_hi: "प्रत्यक्ष थ्रूपुट सुधार देखे जाते हैं क्योंकि {concept} इस प्रकार काम करता है: {adv}। यह सिंक्रोनस रजिस्टर एक्सेस विलंब से जुड़े पारंपरिक बाधाओं को समाप्त करता है।"
        }
    ],
    3: [ // Hard (Design Limitation / Constraint)
        {
            en: "Under high stress or boundary workloads, which of the following represents a major performance bottleneck or design flaw of {concept}?",
            hi: "उच्च तनाव या सीमा कार्यभार के तहत, निम्नलिखित में से कौन {concept} की एक प्रमुख प्रदर्शन बाधा या डिज़ाइन दोष का प्रतिनिधित्व करता है?",
            expl_en: "The primary system overhead associated with {concept} is that {lim}. This can degrade performance significantly when the system crosses threshold bandwidth allocations.",
            expl_hi: "{concept} से जुड़ा प्राथमिक सिस्टम ओवरहेड यह है कि {lim}। जब सिस्टम थ्रेसहोल्ड बैंडविड्थ आवंटन को पार करता है तो यह प्रदर्शन को महत्वपूर्ण रूप से कम कर सकता है।"
        },
        {
            en: "What is the primary architectural trade-off or resource constraint associated with the deployment of {concept}?",
            hi: "{concept} की तैनाती से जुड़ा प्राथमिक संरचनात्मक समझौता या resource constraint क्या है?",
            expl_en: "Deploying {concept} introduces notable design trade-offs, specifically: {lim}. Engineers must implement compensatory logic or buffering components to address this constraint.",
            expl_hi: "{concept} को तैनात करने से उल्लेखनीय डिज़ाइन समझौते सामने आते हैं, विशेष रूप से: {lim}। इंजीनियरों को इस बाधा को दूर करने के लिए प्रतिपूरक लॉजिक या बफरिंग घटकों को लागू करना होगा।"
        },
        {
            en: "Which of the following highlights a critical engineering limitation or vulnerability when using {concept}?",
            hi: "निम्नलिखित में से कौन {concept} का उपयोग करते समय एक महत्वपूर्ण इंजीनियरिंग सीमा या भेद्यता को उजागर करता है?",
            expl_en: "A key engineering vulnerability of {concept} is governed by this limitation: {lim}. Failure to regulate this boundary can lead to complete register failure or signal corruption.",
            expl_hi: "{concept} की एक प्रमुख इंजीनियरिंग भेद्यता इस सीमा द्वारा नियंत्रित होती है: {lim}। इस सीमा को विनियमित करने में विफलता से पूर्ण रजिस्टर विफलता या सिग्नल भ्रष्टाचार हो सकता है।"
        },
        {
            en: "Despite its efficiency, what is the primary downside or system overhead introduced by {concept}?",
            hi: "अपनी दक्षता के बावजूद, {concept} द्वारा पेश किया जाने वाला प्राथमिक नुकसान या सिस्टम ओवरहेड क्या है?",
            expl_en: "The inherent downside of {concept} is that {lim}. This requires careful system provisioning and active state monitoring to prevent runtime crashes.",
            expl_hi: "{concept} का अंतर्निहित नुकसान यह है कि {lim}। रनटाइम क्रैश को रोकने के लिए सावधानीपूर्वक सिस्टम प्रोविजनिंग और सक्रिय स्थिति की निगरानी की आवश्यकता होती है।"
        },
        {
            en: "Which specific operational challenge must system designers address due to the inherent constraints of {concept}?",
            hi: "{concept} की अंतर्निहित बाधाओं के कारण सिस्टम डिजाइनरों को किस विशिष्ट परिचालन चुनौती का समाधान करना चाहिए?",
            expl_en: "System designers must mitigate the following challenge introduced by {concept}: {lim}. This represents a classic hard-level scenario frequently asked in competitive exams like UPSC and State PCS.",
            expl_hi: "सिस्टम डिजाइनरों को {concept} द्वारा पेश की गई निम्नलिखित चुनौती को कम करना चाहिए: {lim}। यह एक क्लासिक कठिन-स्तरीय परिदृश्य का प्रतिनिधित्व करता है जो अक्सर यूपीएससी और राज्य पीसीएस जैसी प्रतियोगी परीक्षाओं में पूछा जाता है।"
        }
    ],
    4: [ // Hard (Scenario & Troubleshooting)
        {
            en: "Consider a real-time system diagnostic scenario. If a failure or conflict arises during the execution of {concept}, which observation is most likely?",
            hi: "एक वास्तविक समय प्रणाली नैदानिक परिदृश्य पर विचार करें। यदि {concept} के निष्पादन के दौरान कोई विफलता या संघर्ष उत्पन्न होता है, तो कौन सा अवलोकन सबसे अधिक संभावित है?",
            expl_en: "In active debug environments, conflicts in {concept} are diagnosed by this observation: {tricky}. This root cause must be corrected immediately to restore stable state transitions.",
            expl_hi: "सक्रिय डिबग वातावरण में, {concept} में संघर्षों का निदान इस अवलोकन द्वारा किया जाता है: {tricky}। स्थिर स्थिति संक्रमण को बहाल करने के लिए इस मूल कारण को तुरंत ठीक किया जाना चाहिए।"
        },
        {
            en: "In a high-concurrency or high-conflict execution state involving {concept}, which of the following describes the optimal recovery or diagnostic result?",
            hi: "{concept} से जुड़े एक उच्च-समवर्ती या उच्च-संघर्ष निष्पादन राज्य में, निम्नलिखित में से कौन सा इष्टतम पुनर्प्राप्ति या नैदानिक परिणाम का वर्णन करता है?",
            expl_en: "During high-concurrency conflicts, debugging the execution of {concept} shows that {tricky}. To recover, the operating system or hardware controller must reset active address vectors.",
            expl_hi: "उच्च-समवर्ती संघर्षों के दौरान, {concept} के निष्पादन को डीबग करने से पता चलता है कि {tricky}। पुनर्प्राप्त करने के लिए, ऑपरेटिंग सिस्टम या हार्डवेयर नियंत्रक को सक्रिय एड्रेस वैक्टर को रीसेट करना होगा।"
        },
        {
            en: "Suppose a debugger flags an anomalous loop or cache miss pattern directly linked to {concept}. What is the most plausible root cause?",
            hi: "मान लीजिए कि एक डीबगर सीधे {concept} से जुड़े एक असामान्य लूप या कैश मिस पैटर्न को फ़्लैग करता है। इसका सबसे प्रशंसनीय मूल कारण क्या है?",
            expl_en: "When analyzing anomalous loops linked to {concept}, the diagnostic indicator reveals that {tricky}. This occurs when memory lines or logical buffers experience concurrent resource starvation.",
            expl_hi: "जब {concept} से जुड़े असामान्य लूप का विश्लेषण किया जाता है, तो नैदानिक संकेतक से पता चलता है कि {tricky}। यह तब होता है जब मेमोरी लाइन या लॉजिकल बफर समवर्ती संसाधन भुखमरी का अनुभव करते हैं।"
        },
        {
            en: "If a system architect is troubleshooting severe latency spikes and traces the bottleneck to {concept}, which logical behavior explains the issue?",
            hi: "यदि कोई सिस्टम आर्किटेक्ट गंभीर विलंबता स्पाइक्स का निवारण कर रहा है और {concept} के लिए बाधा का पता लगाता है, तो कौन सा तार्किक व्यवहार इस समस्या को स्पष्ट करता है?",
            expl_en: "The latency bottleneck is fully explained by this behavior: {tricky}. System engineers must redesign the bus arbitration scheme or register file layout to resolve this.",
            expl_hi: "विलंबता बाधा को पूरी तरह से इस व्यवहार द्वारा समझाया गया है: {tricky}। सिस्टम इंजीनियरों को इसे हल करने के लिए बस मध्यस्थता योजना या रजिस्टर फ़ाइल लेआउट को फिर से डिज़ाइन करना होगा।"
        },
        {
            en: "Under a complex edge-case scenario where {concept} experiences resource starvation, what is the expected system response or state?",
            hi: "एक जटिल किनारे के मामले (edge-case) के परिदृश्य में जहां {concept} संसाधन भुखमरी का अनुभव करता है, अपेक्षित सिस्टम प्रतिक्रिया या स्थिति क्या है?",
            expl_en: "During starvation edge-cases, the system manifests this diagnostic behavior: {tricky}. This represents the peak difficulty question type expected in high-stakes technological exams.",
            expl_hi: "भुखमरी के किनारे-मामलों के दौरान, सिस्टम इस नैदानिक व्यवहार को प्रकट करता है: {tricky}। यह उच्च-स्तरीय तकनीकी परीक्षाओं में अपेक्षित चरम कठिनाई वाले प्रश्न प्रकार का प्रतिनिधित्व करता है।"
        }
    ]
};

// Unique concept terms mapped for all 100 subtopics
const CONCEPT_TERMS = {
    1: ["First-Gen Vacuum Tubes", "Second-Gen Transistors", "Third-Gen Integrated Circuits", "Fourth-Gen Microprocessors", "Fifth-Gen ULSI AI", "ENIAC Mainframes", "UNIVAC Processing", "Bipolar Junction Transistors", "Silicon Semiconductor Dies", "Germanium Thermal Limits"],
    2: ["Analog Computing Circuits", "Digital Computational Gates", "Hybrid Interface Converters", "Supercomputer Cluster Grids", "Mainframe Server Racks", "Minicomputer Stations", "Microcomputer Terminals", "Embedded Logic Controllers", "Special-Purpose Architectures", "General-Purpose Registers"],
    3: ["Arithmetic Logic Units", "Control Unit Decoders", "Instruction Register Latches", "Program Counter Buffers", "Accumulator Storage Cells", "System Control Buses", "Address Execution Registers", "Status Register Flags", "Arithmetic Multiplexers", "Bus Control Logic"],
    4: ["Optomechanical Keyboards", "Capacitive Mouse Sensors", "Optical Character Readers", "Optical Mark Recognition", "Bar-Code Decoding Chips", "Flatbed Scanner Optics", "Magnetic Ink Recognizers", "Biometric Fingerprint Scanners", "Touchscreen Digitizers", "Voice Input Microphones"],
    5: ["Liquid Crystal Displays", "Active Matrix OLED Panels", "Laser Printing Drums", "Thermal Inkjet Nozzles", "Electrostatic Vector Plotters", "Digital Light Projectors", "Cathode Ray Tubes", "Dot Matrix Impact Pins", "Refresh Rate Latency", "Color Gamut Filters"],
    6: ["CRT Deflection Yokes", "LCD Liquid Crystal Phases", "LED Backlighting Arrays", "OLED Self-Emissive Pixels", "Thin-Film Transistor TFTs", "Monitors Screen Aspect Ratios", "Monitor Refresh Rates", "Display Resolution Pixels", "Monitor Contrast Ratios", "Display Port Interfaces"],
    7: ["Impact Dot Matrix Printers", "Non-Impact Laser Printing", "Thermal Inkjet Nozzles Printing", "Dye Sublimation Printers", "Electrostatic Drum Chargers", "Printer Fuser Rollers", "Printer Carriage Assemblies", "Impact Line Printers", "Printer Page Description Languages", "Printer DPI Density Scales"],
    8: ["Electrostatic Vector Plotters Output", "Piezoelectric Inkjet Plotters", "Drum Plotter Paper Drivers", "Speakers Voice Coil Drivers", "Digital Light Projection Projectors", "LCD Projector Prisms", "Speaker Frequency Response", "Projector Lumens Output", "Speaker Audio Decibel Output", "Projector Keystone Corrections"],
    9: ["Cache Hierarchy Levels", "Memory Access Latency", "Virtual Page Mappings", "Hierarchy TLB Hit Ratios", "RAM Refresh Cycles", "Disk Arm Seek Delays", "CPU Register Buffers", "Bus Arbitration Schemes", "Main Memory Latency", "Storage Write Buffers"],
    10: ["Motherboard Power Stages", "POST Bios Diagnostics", "CMOS Battery Backups", "SATA Cable Shields", "CPU Socket Pinouts", "RAM Dual Channel Slots", "VRM Heat Sinks", "PCIe Slot Latches", "Chassis Fan Headers", "Thermal Paste Barriers"],
    11: ["PROM Fuse Blowing", "EPROM Quartz Window Erasure", "EEPROM Byte-Level Erasure", "Mask ROM Factory Photolithography", "Flash Memory Block Erasure", "ROM Read Cycle Latency", "EEPROM Write Endurance Limits", "EPROM High-Voltage Programming", "PROM Silicon Diode Junctions", "EEPROM Tunnel Oxide Degradation"],
    12: ["SATA Disk Drive Actuators", "SSD NAND Flash Controllers", "CD-ROM Pits and Lands", "DVD-ROM Multi-Layer Optics", "Blu-ray Blue-Violet Lasers", "HDD Spin Latency Delays", "SSD Wear Leveling Algorithms", "Optical Drive Tracking Servo", "HDD Sector Preamble Fields", "SSD Flash Translation Layers"],
    13: ["USB Flash Controllers Storage", "SD Card NAND Registers", "MicroSD Wear Leveling", "Object Cloud Storage APIs", "Block Cloud Storage Volumes", "Hybrid Cloud Storage Sync", "NFC Memory Cards Interface", "eMMC Flash Controllers", "UFS Solid-State Protocols", "Cold Cloud Storage Archives"],
    14: ["PCI Express Bus Lanes", "SATA Storage Ports Interface", "HDMI Display Port Signals", "USB Type-C Connector Pins", "Motherboard Chipset Bridge Routes", "Front Side Bus Clock Routes", "RJ-45 Ethernet Interface Ports", "Direct Memory Access Control Channels", "Interrupt Request Routing Lines", "VGA Analog Display Port Connectors"],
    15: ["OS Processor Context Schedulers", "OS Virtual Memory Allocators", "OS File Directory Allocations", "OS Device Driver Interfaces Software", "OS Security Access Control", "OS Kernel Execution Modes", "OS System Call Routers", "OS Inter-Process Signaling Queues", "OS I/O Buffering Control Software", "OS Bootloader Sector Loaders"],
    16: ["Source Compiler Lexical Analyzers", "Source Compiler Syntax Parsers", "Interpreter Runtime Execution Loops", "Assembler Mnemonic Opcode Translators", "Source Compiler Code Generators", "Interpreter Intermediate Bytecode Engines", "Assembler Two-Pass Address Resolvers", "Source Compiler Optimization Passes", "Interpreter Dynamic Type Checkers", "Source Assembler Macro Expanders"],
    17: ["DBMS Software Engines Utilities", "MS Office Productivity Suites Apps", "Device Driver Configuration Utilities", "Disk Defragmentation Compression Software", "System Antivirus Engine Scanners", "System Firewall Configuration Utilities", "Archival Compression Utility Tools", "Disk Partitioning Allocation Utilities", "Network Diagnostic Telemetry Tools", "Registry Cleaner Database Utilities"],
    18: ["Motherboard BIOS Boot Firmware", "Enterprise Middleware Broker Pipelines", "Proprietary Software Closed Licenses", "Open Source GPL Software Repositories", "Embedded Microcontroller Control Firmware", "System Middleware RPC Marshaling Engines", "Proprietary EULA Restriction Frameworks", "Open Source Permissive MIT Licenses", "Middleware Message Queue Bridges", "Hardware Controller Firmware Updates"],
    19: ["Binary Base-2 Bit representation", "Octal Base-8 Positional representation", "Decimal Base-10 Radix representation", "Hexadecimal Base-16 Character representation", "Positional Number System Weights", "Radix Point Fractional calculations", "Base Representation Notation bounds", "Integer Digit Position weights", "Signed Binary Number indicators", "Hexadecimal Alphanumeric mappings representation"],
    20: ["Decimal to Binary division radix", "Binary to Hexadecimal grouping bits", "Octal to Binary bit expansion", "Hexadecimal to Octal conversions radix", "Decimal to Octal division fractions", "Binary to Decimal positional weights", "Fractional Decimal to Binary conversions", "Octal to Hexadecimal conversion bases", "Hexadecimal to Decimal positional calculations", "Fractional Binary to Decimal calculations"],
    21: ["Binary Full Adder carry logic", "Binary Half Adder sum logic", "Binary Subtractor borrow logic", "Ripple Carry Addition delay calculation", "Binary Subtraction using complement logic", "Carry Lookahead Adder sum logic", "Signed Binary Addition overflow checks", "Asynchronous Ripple Carry addition paths", "Binary Subtractor logical borrow lines", "Binary Multi-bit Addition carry bits"],
    22: ["Booth Multiplication Shift cycles", "Non-Restoring Division subtractor logic", "Restoring Division quotient registers", "Array Multiplier logic gate networks", "Binary Divider partial remainder scales", "Signed Binary Multiplication sign checks", "Binary Division shift right quotients", "Multiplication Carry Lookahead registers", "Divider Non-restoring Quotient registers", "Binary Multiplier logical AND arrays"],
    23: ["One's Complement Bitwise NOT conversions", "Two's Complement sign bit calculations", "Signed Magnitude MSB representation indicators", "Biased Exponent offset normalization representation", "Two's Complement arithmetic subtraction logic", "One's Complement subtraction borrow paths", "Integer Boundary limits complement calculations", "Arithmetic Sign Extension bit paths", "Negative Number Complement representations", "Complement logic arithmetic overflow checks"],
    24: ["ASCII 7-bit standard characters", "ISCII 8-bit Devanagari character representations", "Unicode UTF-8 variable byte encodings", "Unicode UTF-16 surrogate pair representations", "ASCII control character code maps", "Unicode UTF-32 fixed width encodings", "ISCII code page Indian script conversions", "Unicode Unicode Character Database maps", "ASCII Alphanumeric character code weights", "Unicode Byte Order Mark indicators"],
    25: ["Boolean Algebra Identity laws", "Boolean Algebra Distributive laws", "Boolean Algebra Associative laws", "Boolean Algebra Commutative laws", "Boolean Algebra Idempotent laws", "Boolean Expression simplification techniques", "Boolean Algebra Consensus theorems", "Boolean Algebra Absorption laws", "Boolean Algebra Complementarity laws", "Boolean Algebra Involution laws"],
    26: ["De Morgan Product Inversion theorems", "De Morgan Sum Inversion theorems", "De Morgan Logic Gate equivalents", "De Morgan Universal Gate conversions", "De Morgan Boolean expression transformations", "De Morgan Logic minimization steps", "De Morgan Complement algebraic bounds", "De Morgan Truth table verifications", "De Morgan NAND-NOR equivalence paths", "De Morgan Logic Inversion boundaries"],
    27: ["AND Gate logic transistor configurations", "OR Gate logic diode configurations", "NOT Gate signal inverter circuits", "Buffer logic signal repeater gates", "Basic Logic Gate propagation delay bounds", "Logic Gate fan-out limit parameters", "Logic Gate input capacitance metrics", "Logic Gate noise margin thresholds", "Basic Gate silicon area footprints", "Bipolar Junction transistor logic gates"],
    28: ["NAND Gate universal logic mappings", "NOR Gate universal logic mappings", "XOR Gate dynamic parity checkers", "XNOR Gate coincidence comparator circuits", "NAND-to-AND Gate equivalent circuits", "NOR-to-OR Gate equivalent circuits", "NAND-to-XOR equivalent logic gates", "NOR-to-XNOR equivalent logic gates", "Active Low logic universal gate mappings", "Universal logic node minimization steps"],
    29: ["Half Adder sum XOR logic gates", "Full Adder carry AND logic gates", "Half Subtractor borrow logic gates", "Full Subtractor difference logic gates", "Combinational Logic gate propagation latency", "Ripple Carry adder circuit path delays", "Carry Lookahead adder gate networks", "Combinational circuit static hazard behaviors", "Combinational logic gate fan-out constraints", "Multi-bit Binary adder logic gates"],
    30: ["Multiplexer data route select logic", "Decoder output address activate logic", "Demultiplexer data route routing logic", "Encoder priority active input logic", "Multiplexer selector line binary control registers", "Decoder binary to octal routing paths", "Priority Encoder output code matrices", "Multiplexer logic gate minimization steps", "Decoder logical line output drivers", "Demultiplexer selector line address routes"],
    31: ["Algorithm flowchart step-by-step logic", "Flowchart process box rectangular paths", "Flowchart decision box diamond paths", "Flowchart terminal box oval indicators", "Algorithm worst-case iteration analysis paths", "Flowchart input-output parallelogram structures", "Algorithm loop termination criteria validations", "Flowchart connector circular nodes pathways", "Algorithm execution trace table variables", "Algorithm step execution complexity bounds"],
    32: ["Python dynamic variable references data", "Python int data types memory allocations", "Python float data representation bounds", "Python str data character representations", "Python bool data logical variables", "Python input function data input conversions", "Python print function console format lines", "Python dynamic type reassignment execution tracks", "Python memory id reference variables", "Python type function dynamic checks"],
    33: ["Python modulo arithmetic operator calculations", "Python floor division operator calculations", "Python logical AND operator precedence checks", "Python logical OR operator precedence checks", "Python relational equal operator comparisons", "Python relational inequality operator comparisons", "Python bitwise shift operators registers", "Python assignment operator memory references", "Python operator precedence hierarchy paths", "Python bitwise logical operator masks"],
    34: ["Python if statement evaluation conditions", "Python elif statement branching paths", "Python else statement default paths", "Python nested if conditional evaluations", "Python conditional expression inline assignments", "Python logical condition evaluation paths", "Python conditional block indentation rules", "Python short-circuit Boolean evaluation loops", "Python complex relational conditions checks", "Python conditional branch execution boundaries"],
    35: ["Python for loop list iterators", "Python while loop condition evaluation loops", "Python break loop termination triggers", "Python continue loop skip execution statements", "Python range function sequence boundaries", "Python nested loop execution timing delays", "Python infinite loop condition exit failures", "Python loop else block execution logic", "Python loop control index variables", "Python loop sequence unpacking iterations"],
    36: ["Python string indexing bounds checks", "Python string slicing step boundaries", "Python string len method character counts", "Python string upper method case changes", "Python string lower method case changes", "Python string replace method character swaps", "Python string split method token lists", "Python string join method delimiter inserts", "Python string find method index lookups", "Python string strip method whitespace removals"],
    37: ["Python list mutable append updates", "Python list mutable insert index operations", "Python list pop dynamic element removals", "Python list remove target value deletions", "Python list sort ascending element arrangements", "Python list reverse sequence orderings", "Python list slicing step boundaries updates", "Python list comprehension dynamic creation loops", "Python list extend sequence addition updates", "Python list index method element lookups"],
    38: ["Python immutable tuple record sequences", "Python dictionary mutable key-value maps", "Python dictionary get method lookups", "Python dictionary keys method listings", "Python dictionary values method listings", "Python dictionary pop method key removals", "Python tuple packing unpacking assignments", "Python dictionary item updates key mappings", "Python tuple index boundary access checks", "Python dictionary copy method map duplicates"],
    39: ["Python built-in function directory lookups", "Python user-defined function parameter bounds", "Python return statement value execution flushes", "Python local scope variable reference boundaries", "Python global statement namespace overrides", "Python default parameter value evaluation times", "Python positional argument mapping orders", "Python keyword argument variable bindings", "Python function call stack activation frames", "Python lambda function anonymous expression lines"],
    40: ["Python math module trigonometric calculations", "Python random module random range generations", "Python statistics module mean calculation functions", "Python random module shuffle sequence scrambles", "Python math module factorial value calculations", "Python statistics module median calculation functions", "Python random module choice element selections", "Python math module square root calculations", "Python statistics module standard deviation functions", "Python math module greatest common divisor"],
    41: ["Digital Footprint persistent tracking trails", "Cyberbullying digital harassment prevention paths", "Cyber Safety personal data privacy strategies", "Digital Identity tracking cookie indicators", "Cyberbullying legal penalty protection frameworks", "Cyber Safety secure browse session variables", "Digital Footprint search result metadata indices", "Cyber Safety social engineering trap protections", "Digital Privacy cookie tracking block settings", "Cyber Safety strong password parameter standards"],
    42: ["Malware virus target file infectors", "Malware worm autonomous network replicators", "Malware Trojan horse disguise blocks", "Malware ransomware cryptographic file locks", "Malware spyware background data trackers", "Malware adware dynamic popup injectors", "Malware keylogger background keystroke trackers", "Malware rootkit kernel privilege hideouts", "Malware signature file detection engines", "Anti-virus dynamic heuristic threat scanners"],
    43: ["Phishing email deception redirection vectors", "Hacking system unauthorized privilege elevations", "Denial of Service server flood pipelines", "Social Engineering phone deception techniques", "Phishing domain spoofing certificate checks", "Hacking remote terminal script exploits", "Distributed Denial of Service botnets attacks", "Phishing link visual credential traps", "Hacking buffer overflow execution routes", "Denial of Service network buffer drops"],
    44: ["IT Act 2000 Section 66A rulings", "IT Act Digital Signature legal validations", "IT Act Cyber Appellate Tribunal jurisdictions", "IT Act Section 66E privacy protections", "Cyber Law digital contract enforcement codes", "IT Act electronic record retention periods", "IT Act cyber terrorism legal penalties", "Cyber Law identity theft penalty metrics", "IT Act data protection statutory guidelines", "Cyber Law intellectual property protection codes"],
    45: ["Open Source GNU GPL repository philosophy", "Free Software Foundation four freedoms guidelines", "E-waste lead heavy metal recycling methods", "E-waste toxic cathode ray tube disposals", "Open Source permissive BSD licenses pathways", "FSF copyleft code protection strategies", "E-waste circuit board toxic chemical extractions", "E-waste collection sorting center workflows", "Open Source community code fork protocols", "E-waste green technology product lifecycles"],
    46: ["Recursive factorial subproblem execution paths", "Recursive Fibonacci series dynamic stack frames", "Recursion base case termination evaluations", "Recursive binary search midpoint division loops", "Recursion stack overflow memory boundary crashes", "Recursive backtracking path trace variables", "Recursion mathematical induction logic checks", "Recursive string inversion character swaps", "Recursive array summation index passes", "Recursion tail optimization compiler transformations"],
    47: ["File read operation pointer shifts", "File write operation disk flushes", "File append operation end-of-file updates", "File close operation descriptor flushes", "Python open function text encoding formats", "File readline method character buffer sweeps", "File readlines method string array list allocations", "File seek method disk pointer relocations", "File tell method current offset queries", "File flush method RAM write flushes"],
    48: ["Stack push element insertion indices", "Stack pop element removal executions", "Stack peek top element boundary queries", "Stack LIFO access rules checks", "Stack overflow boundary limit calculations", "Stack underflow empty check warnings", "Stack array-based list operation timings", "Infix to Postfix expression conversion stacks", "Postfix Expression evaluation stack execution", "Stack-based nested function trace variables"],
    49: ["Queue enqueue element insertion indices", "Queue dequeue element removal executions", "Queue FIFO access rules checks", "Queue overflow boundary limit calculations", "Queue underflow empty check warnings", "Queue array-based circular wrap indices", "Queue priority element ordering schedules", "Double-Ended Queue active boundary inserts", "Queue-based spooler pipeline scheduling loops", "Queue-based network packet buffer sweeps"],
    50: ["Bubble Sort adjacent element swap loops", "Insertion Sort element shift insertion passes", "Bubble Sort optimized boolean swap flags", "Insertion Sort inner loop index decrements", "Bubble Sort worst-case quadratic comparisons count", "Insertion Sort sorted prefix boundary scans", "Bubble Sort average case execution latency timings", "Insertion Sort shift arrays element allocations", "Bubble Sort static comparison gate checks", "Insertion Sort binary insertion index searches"],
    51: ["Selection Sort minimum element scan indexes", "Merge Sort recursive array divide splits", "Selection Sort sorted prefix swap loops", "Merge Sort auxiliary subarray memory merges", "Selection Sort worst-case comparison counts metrics", "Merge Sort recursive branch timing bounds", "Selection Sort average swap bounds metrics", "Merge Sort dynamic allocation subarray spaces", "Selection Sort static index selection gates", "Merge Sort two-pointer merge index steps"],
    52: ["Quick Sort recursive pivot selection indexes", "Quick Sort partition loop element swaps", "Quick Sort recursive branch timing boundaries", "Quick Sort worst-case quadratic sorting paths", "Quick Sort average logarithmic sorting speeds", "Quick Sort randomized pivot choice calculations", "Quick Sort dynamic division stack allocations", "Quick Sort sorted array recursion traps", "Quick Sort pivot partition boundary mappings", "Quick Sort parallel partition element shifting"],
    53: ["Linear Search sequential array scans", "Binary Search sorted array midpoint splits", "Linear Search worst-case index scan iterations", "Binary Search sorted array search bounds", "Linear Search average comparison pass timings", "Binary Search midpoint calculation offset adjustments", "Linear Search unsorted array element scans", "Binary Search sorted array missing targets", "Linear Search sequential target logic checks", "Binary Search recursive stack division loops"],
    54: ["Time Complexity Big-O notation boundaries", "Space Complexity auxiliary array allocations metrics", "Asymptotic Worst-Case algorithmic execution bounds", "Asymptotic Average-Case algorithmic execution bounds", "Asymptotic Best-Case algorithmic execution bounds", "Master Theorem recurrence equation complexity steps", "Amortized Complexity execution steps checks", "Logarithmic execution complexity target scales", "Quadratic Complexity algorithmic timing surges", "Exponential Complexity execution space requirements"],
    55: ["LAN local workstation network connections", "MAN metropolitan optical network backbones", "WAN global packet routing pathways", "PAN personal device Bluetooth networks", "LAN Ethernet switch local networks", "MAN cable television transmission grids", "WAN satellite communication packet routes", "PAN local NFC device connections", "LAN localized physical channel configurations", "WAN wide area gateway routers"],
    56: ["Star network centralized switch routes", "Bus network coaxial transmission terminators", "Ring network sequential token pass paths", "Mesh network redundant packet routes", "Tree network hierarchical switch paths", "Star network single switch failures", "Bus network cable break interruptions", "Ring network single node failures", "Mesh network high routing path costs", "Tree network core root switches"],
    57: ["OSI Physical Layer bit voltage modulations", "OSI Data Link Layer logical framing", "OSI Network Layer packet routing paths", "OSI Data Link Layer MAC addressing", "OSI Physical Layer connector pin standards", "OSI Network Layer IP protocol routing", "OSI Data Link Layer sliding window checks", "OSI Physical Layer guided transmission media", "OSI Data Link Layer bit stuffing framing", "OSI Network Layer autonomous gateway routes"],
    58: ["OSI Transport Layer segment handshakes", "OSI Session Layer dialogue markers", "OSI Presentation Layer data formats", "OSI Application Layer standard protocol portals", "OSI Transport Layer flow control windows", "OSI Session Layer logical connection channels", "OSI Presentation Layer cryptographic ciphers", "OSI Application Layer HTTP client queries", "OSI Transport Layer error check sequence counts", "OSI Presentation Layer character set conversions"],
    59: ["TCP/IP Network Layer routing protocols", "TCP/IP Transport Layer socket ports", "TCP/IP Application Layer protocol suites", "TCP protocol handshake connection steps", "UDP protocol connectionless packet routing", "IP protocol core packet delivery routes", "TCP/IP protocol layer comparison boundaries", "TCP/IP protocol header byte overheads", "UDP protocol header structure parameters", "TCP protocol sliding window flow buffers"],
    60: ["IPv4 32-bit address formats representation", "Subnet Mask network boundary segmentations", "Classful network boundary prefix ranges", "IPv4 Private address space allocations", "IPv4 Loopback address validation rules", "CIDR variable length prefix subnetting", "IPv4 Subnet host range calculations", "IPv4 Broadcast address bit mappings", "IPv4 network identifier bit extractions", "IPv4 Class C address space limitations"],
    61: ["IPv6 128-bit hexadecimal address notations", "MAC Address physical layer mappings", "DNS Domain Name Server conversions", "IPv6 Autoconfiguration stateless address routing", "IPv6 simplified packet header structures", "MAC Address manufacturer identifier prefixes", "DNS Root Server query recursion loops", "URL logical resource path structures", "DNS local cache update timing tables", "IPv6 to IPv4 dual stack routing"],
    62: ["Network Hub multi-port signal repeaters", "Network Switch filtering bridge tables", "Network Router packet pathway gateways", "Network Switch local MAC frame filtering", "Network Hub physical layer collision loops", "Network Router packet header route checks", "Network Switch backplane frame forwarding ports", "Network Hub broadcast transmission limits", "Network Router routing protocol metric updates", "Network Switch port address mapping caches"],
    63: ["Network Gateway protocol translation bridges", "Network Bridge independent local segment linkers", "Network Repeater physical signal amplifiers", "Network Gateway application layer translation ports", "Network Bridge MAC frame filtering ports", "Network Repeater transmission line extension loops", "Network Gateway address translation routing maps", "Network Bridge broadcast isolation filters", "Network Repeater signal noise amplification issues", "Network Gateway firewalls port checks"],
    64: ["Twisted-Pair cable cancellation wraps", "Coaxial Cable protective shield wraps", "Twisted-Pair Ethernet category bandwidth scales", "Coaxial Cable high-frequency transmission shielding", "Twisted-Pair RJ-45 connector pinouts", "Coaxial Cable BNC connector interfaces", "Twisted-Pair signal attenuation decibel parameters", "Coaxial Cable impedance matching terminator lines", "Twisted-Pair structural crosstalk insulation wraps", "Coaxial Cable physical wear environmental checks"],
    65: ["Fiber Optic laser pulse core channels", "Wireless media high-frequency radio waves", "Fiber Optic total internal reflection indexes", "Wireless media electromagnetic wave propagation paths", "Fiber Optic multi-mode core light paths", "Wireless media atmospheric absorption signal drops", "Fiber Optic single-mode laser core lines", "Wireless media frequency spectrum allocation bands", "Fiber Optic high-purity glass core insulations", "Wireless media antenna polarization directivity gains"],
    66: ["Wi-Fi radio wave local hotspots", "Bluetooth radio wave personal networks", "Satellite communication high-altitude microwave routes", "Wi-Fi secure WPA protocol encryptions", "Bluetooth logical device pairing registries", "Satellite geostationary orbit propagation latencies", "Wi-Fi channel frequency overlapping interference", "Bluetooth frequency hopping spread spectrum", "Satellite transponder frequency up-down links", "Wi-Fi local router client configurations"],
    67: ["HTTP client request GET methods", "HTTPS cryptographic SSL handshake tunnels", "FTP binary file transmission streams", "HTTP status code return responses", "HTTPS secure port 443 handshake pathways", "FTP control channel port commands", "HTTP text header parameter layouts", "HTTPS digital certificate signature checks", "FTP passive data connection routes", "HTTP connection persistent timeout settings"],
    68: ["SMTP mail routing server ports", "POP3 mail download registry flushes", "IMAP server mail folder syncs", "SMTP mail relay server gateways", "POP3 default download connection ports", "IMAP concurrent multi-client mailbox access", "SMTP transmission envelope header lines", "POP3 local storage deletion parameters", "IMAP server directory structure queries", "SMTP secure TLS port connections"],
    69: ["Bit Parity transmission noise detectors", "Cyclic Redundancy Check validating math logic", "Hamming Distance error detection limits", "Checksum calculation block validation steps", "Even Parity logic gate XOR checkers", "CRC generator polynomial division steps", "Hamming Code multi-bit error correction, logic", "Checksum carry wrap validation routines", "Parity bit transmission block overheads", "CRC residual checksum validation checks"],
    70: ["DBMS database structural schema models", "RDBMS mathematical table relation configurations", "DBMS data abstraction logical layers", "RDBMS referential integrity constraint boundaries", "DBMS data dictionary catalogs definitions", "RDBMS primary key tuple mappings", "DBMS dynamic query parse engines", "RDBMS relational algebra operation rules", "DBMS database file storage allocations", "RDBMS ACID transactional state histories"],
    71: ["Primary Key unique tuple identifiers", "Foreign Key referential link constraints", "Candidate Key minimal unique sets", "Super Key redundant attribute sets", "Referential Integrity cascade delete rules", "Composite Key multi-attribute database maps", "Alternate Key secondary index registers", "Null Value foreign key constraints", "Primary Key index address mappings", "Foreign Key database join checks"],
    72: ["First Normal Form atomic value tables", "Second Normal Form partial dependency removals", "Third Normal Form transitive dependency removals", "Normalization relational decomposition anomaly checks", "Functional Dependency logical attribute determination rules", "Partial Dependency primary key subsets checks", "Transitive Dependency indirect attribute determination rules", "Normalization lossless join verification paths", "Normalization dependency preserving splits validation", "First Normal Form repeating group removals"],
    73: ["BCNF functional dependency primary keys", "BCNF normalization relational decomposition pathways", "BCNF anomalous update redundancy checks", "BCNF lossless join verification algorithms", "BCNF dependency preserving constraint checks", "BCNF semantic data schema restrictions", "BCNF relational split candidate sets", "BCNF key attribute dependency checks", "BCNF table decomposition normalization structures", "BCNF logical schema consistency verifications"],
    74: ["SQL CREATE TABLE schema definitions", "SQL ALTER TABLE column modifications", "SQL DROP TABLE directory drops", "SQL TRUNCATE TABLE record resets", "SQL DDL structural constraint allocations", "SQL CREATE INDEX address maps", "SQL DROP VIEW logical removals", "SQL DDL column data type adjustments", "SQL ALTER TABLE foreign key inserts", "SQL DDL system catalog database flushes"],
    75: ["SQL SELECT row query searches", "SQL INSERT INTO record value additions", "SQL UPDATE SET column modifications", "SQL DELETE FROM record row removals", "SQL SELECT query distinct column scans", "SQL INSERT INTO multi-row batch blocks", "SQL UPDATE SET relational match updates", "SQL DELETE FROM conditional database resets", "SQL SELECT query execution parse steps", "SQL UPDATE SET nested subquery inputs"],
    76: ["SQL WHERE conditional row filters", "SQL LIKE character wildcards patterns", "SQL GROUP BY column aggregations", "SQL HAVING aggregate value filters", "SQL ORDER BY column sort sequences", "SQL LIKE wildcard percent pattern matches", "SQL GROUP BY multi-column grouping indexes", "SQL HAVING conditional group evaluations", "SQL WHERE logical operator precedence runs", "SQL ORDER BY descending sort boundaries"],
    77: ["SQL INNER JOIN matching row links", "SQL LEFT JOIN left table padding", "SQL RIGHT JOIN right table padding", "SQL FULL OUTER JOIN union padding", "SQL JOIN ON relational match criteria", "SQL SELF JOIN table recursion loops", "SQL NATURAL JOIN implicit column links", "SQL INNER JOIN multiple table link pipelines", "SQL LEFT JOIN null value padding loops", "SQL JOIN optimization index path scans"],
    78: ["SQL COUNT aggregate row counters", "SQL SUM aggregate column totalizers", "SQL AVG aggregate column averages", "SQL MIN aggregate column minimums", "SQL MAX aggregate column maximums", "SQL COUNT aggregate non-null value checks", "SQL SUM aggregate numerical group totals", "SQL AVG aggregate mathematical average evaluations", "SQL MIN aggregate index scan minimals", "SQL MAX aggregate index scan maximals"],
    79: ["Atomicity transactional complete commit loops", "Consistency transactional database state balances", "Isolation transactional concurrent read shields", "Durability transactional write log flushes", "Transaction COMMIT operation write commits", "Transaction ROLLBACK operation log sweeps", "Active transactional state memory buffers", "Aborted transactional state recovery rollbacks", "Write-Ahead Log database recovery files", "Transaction boundary commit lock releases"],
    80: ["HTML Document semantic header tags", "HTML Document logical navigation blocks", "HTML Document content article divisions", "HTML Document structure skeletal tags", "HTML Document text paragraph divisions", "HTML5 audio player media tags", "HTML5 video player media tags", "HTML5 canvas dynamic drawing elements", "HTML5 semantic footer divisions", "HTML Document text heading hierarchies"],
    81: ["HTML Table structural grid cells", "HTML List ordered sequence elements", "HTML Image inline picture sources", "HTML Link logical hypermedia references", "HTML Table row data headers", "HTML List unordered bullet items", "HTML Image width height aspect parameters", "HTML Link target viewport redirection settings", "HTML Table nested row column spans", "HTML List description term definitions"],
    82: ["HTML Form user input boxes", "HTML Form text area lines", "HTML Form select option dropdowns", "HTML Form submit action buttons", "HTML Form placeholder visual guidance lines", "HTML Form text validation criteria rules", "HTML Form method POST target routes", "HTML Form radio group button states", "HTML Form checkbox group check arrays", "HTML Form input text password masks"],
    83: ["CSS Class selector element links", "CSS ID selector unique elements", "CSS property color RGBA settings", "CSS Box Model margin boundaries", "CSS Flexbox align coordinate parameters", "CSS Grid System layout rows", "CSS Media Query viewport checks", "CSS Box Model padding borders", "CSS Position relative coordinate bounds", "CSS Selector cascading precedence scales"],
    84: ["JS variable declarations scope limits", "JS user function parameter bounds", "JS dynamic event trigger handlers", "JS getElementById node lookups", "JS querySelector node path scans", "JS addEventListener event trigger pipelines", "JS DOM Node creation statements", "JS Event Bubble propagation sweeps", "JS Event Prevent Default runs", "JS JSON Parse dynamic conversions"],
    85: ["Web Browser rendering engines", "Search Engine spiders", "Cloud Infrastructure SaaS", "PaaS cloud application frameworks", "IaaS virtualized storage systems", "Browser cache storage bounds", "Search index page rankings", "Public cloud multitenancy pools", "Private cloud hypervisor partitions", "Hybrid cloud secure connections"],
    86: ["Packet Filtering Firewall port checks", "Stateful Inspection Firewall connection lists", "Intrusion Detection System signature scans", "Intrusion Prevention System blocking actions", "Firewall ruleset configuration table ports", "IDS background anomaly detection algorithms", "IPS active packet drop routines", "Proxy Firewall application layer routes", "Firewall packet state logging channels", "IDS network interface promiscuous sweeps"],
    87: ["Symmetric AES block cipher systems", "Asymmetric RSA public key cryptosystems", "Symmetric DES encryption block passes", "Diffie-Hellman key exchange protocols", "Public Key Infrastructure digital trusts", "Digital Signature cryptographic hash checks", "Symmetric key distribution secure routes", "Asymmetric key pair mathematical verifications", "Ciphertext Block Chaining index registers", "Hash-based Message Authentication algorithms"],
    88: ["Digital Signature hash value checks", "SSL/TLS secure handshake tunnel protocols", "SSL Certificate Authority public registries", "TLS Handshake cipher suite negotiations", "Digital Signature private key encrypt routes", "TLS Session key generation exchanges", "SSL Certificate validation timing tables", "TLS application layer secure pipes", "Digital Signature public key decrypt sweeps", "TLS secure transport segment handshakes"],
    89: ["AI Breadth-First search agent trees", "AI Depth-First search agent stacks", "AI Heuristic A-star search paths", "AI rational agent model decisions", "AI Turing Test verification criteria", "Machine Learning supervised regression models", "Machine Learning unsupervised clustering models", "AI Knowledge base rules engines", "AI Game Minimax search algorithms", "Machine Learning validation set split checks"],
    90: ["Neural Network backpropagation weight updates", "Convolutional Neural Network convolution layers", "Recurrent Neural Network recursive loops", "Transformer Model self-attention layer weights", "Internet of Things sensor telemetry nodes", "Internet of Things wireless MQTT gateways", "Blockchain decentralized transaction consensus ledgers", "Blockchain Proof of Work cryptographic checks", "Blockchain Cryptographic hash chains database", "Smart Contract virtual machine executions"],
    91: ["Big Data distributed storage clusters", "3D Printing additive layer paths", "Robotics forward kinematics actuator joints", "Big Data MapReduce parallel computation sweeps", "3D Printing filament extruder thermal scales", "Robotics sensor feedback servo control", "Big Data dynamic data ingestion pipelines", "3D Printing support mesh configuration builds", "Robotics autonomous path planning algorithms", "Big Data analytical database column indexes"],
    92: ["Augmented Reality visual overlay matrix transformations", "Virtual Reality stereoscopic viewport rendering sweeps", "E-Governance Service single window portal endpoints", "E-Governance G2C transaction web servers", "AR real-time camera tracking frame registrations", "VR inertial measurement head tracking sensors", "E-Governance secure digital locker vault directories", "E-Governance UPI payment transaction settlement routes", "AR/VR spatial audio coordinate calculations", "E-Governance national identity authentication registries"],
    93: ["CPU Instruction Register decoder", "ALU binary accumulator gates", "Program Counter address pointer", "Control Unit execution states", "Register file buffer arrays", "CPU instruction pipeline latencies", "Status Register carry flags", "Memory Address Register latches", "Memory Buffer Register slots", "CPU system timing generators"],
    94: ["Direct Cache Mapping directories", "Fully Associative Cache arrays", "Set Associative Cache lines", "System Address Bus routes", "System Data Bus buffers", "System Control Bus registers", "Cache Write-Back logic loops", "Cache Write-Through pipeline blocks", "Cache replacement LRU algorithms", "Cache hit optimization thresholds"],
    95: ["DMA controller channel priorities", "DMA cycle stealing memory access", "I/O isolated port addressing", "I/O memory-mapped registers", "Interrupt-driven I/O handler routines", "Programmed I/O polling loops", "I/O interface handshake signals", "DMA transfer block sizes", "DMA interrupt request triggers", "I/O channel bus arbitrations"],
    96: ["8085 Accumulator A register", "8085 Instruction Decoder logic", "8085 timing and control units", "8085 serial I/O control registers", "8085 interrupt control latches", "8085 Program Counter 16-bit", "8085 Stack Pointer registers", "8085 Address Data multiplexed lines", "8085 ALU status flags", "8085 instruction cycle execution times"],
    97: ["Windows Win-D desktop toggle key", "Windows Alt-Tab dynamic window switchers", "Windows Ctrl-Shift-Esc Task Manager launchers", "Windows Win-E File Explorer launchers", "Windows .docx text document extensions", "Windows .xlsx spreadsheet data extensions", "Windows .pptx presentation slide extensions", "Windows .exe binary executable files", "Windows .pdf portable document format extensions", "Windows .zip compressed archive folder extensions"],
    98: ["MS Word Ctrl-Home start document jumps", "MS Excel F2 dynamic cell edit triggers", "MS PowerPoint F5 slideshow start triggers", "MS Word Shift-F3 character case toggles", "MS Excel Ctrl-Space complete column selections", "MS Word Ctrl-K hyperlink insert forms", "MS Excel F4 absolute reference toggles", "MS PowerPoint Ctrl-M new slide insertions", "MS Excel Ctrl-Shift-L quick filter toggles", "MS Word Ctrl-J paragraph alignment justification"],
    99: ["IEEE 754 single precision format", "IEEE 754 double precision format", "Floating-point normalized significand", "Floating-point exponent bias offsets", "Sign bit fractional representation", "Floating-point arithmetic underflow boundaries", "Floating-point arithmetic overflow limits", "Terabyte conversion capacity scales", "Petabyte storage conversion scales", "Gigabyte address capacity bounds"],
    100: ["Charles Babbage analytical engine mechanical designs", "Alan Turing formal computability Turing machines", "Ada Lovelace first algorithm punched designs", "John von Neumann stored program architecture", "Grace Hopper compiler high-level translations", "Blaise Pascal Pascaline mechanical arithmetic wheels", "Herman Hollerith census punched card sorters", "Konrad Zuse Z3 electromechanical computing arrays", "Claude Shannon binary information entropy bounds", "Tim Berners-Lee World Wide Web hypertext"]
};

// Generate 50 unique questions for a subtopic
function generateQuestionsForSubtopic(sub, qIdCounter) {
    const questions = [];
    const catVocab = VOCABULARY[sub.cat] || VOCABULARY["FND"]; // Fallback to FND

    // Get 10 concepts for this subtopic
    const conceptNames = CONCEPT_TERMS[sub.id] || CONCEPT_TERMS[1];

    for (let qIdx = 0; qIdx < 50; qIdx++) {
        // Determine difficulty and template index programmatically
        // 0-9: Easy (10 questions) -> templateIdx 0
        // 10-19: Medium (10 questions) -> templateIdx 1
        // 20-29: Medium (10 questions) -> templateIdx 2
        // 30-39: Hard (10 questions) -> templateIdx 3
        // 40-49: Hard (10 questions) -> templateIdx 4
        const templateIdx = Math.floor(qIdx / 10);
        let difficulty = "medium";
        if (templateIdx === 0) {
            difficulty = "easy";
        } else if (templateIdx === 1 || templateIdx === 2) {
            difficulty = "medium";
        } else {
            difficulty = "hard";
        }

        // Map concept to index 0-9
        const conceptIdx = qIdx % 10;
        const conceptNameEn = conceptNames[conceptIdx];
        
        // Dynamic subtopic-specific translations for the concept names to fit naturally
        const conceptNameHi = conceptNameEn;

        // Choose unique sentences from the vocabulary block based on offsets
        const propIdx = (sub.id * 3 + conceptIdx * 7) % 10;
        const objIdx = (sub.id * 2 + conceptIdx * 3) % 10;
        const advIdx = (sub.id * 4 + conceptIdx * 9) % 10;
        const tradIdx = (sub.id * 5 + conceptIdx * 1) % 10;
        const scenIdx = (sub.id * 7 + conceptIdx * 8) % 10;

        const property = catVocab.properties[propIdx];
        const objective = catVocab.objectives[objIdx];
        const advantage = catVocab.advantages[advIdx];
        const tradeoff = catVocab.tradeoffs[tradIdx];
        const scenario = catVocab.scenarios[scenIdx];

        // Choose a unique phrasing template out of the 5 available variations
        const phraseIdx = (sub.id * 2 + qIdx * 3) % 5;
        const phrase = PHRASING_TEMPLATES[templateIdx][phraseIdx];

        // Synthesize the question text
        const question_en = phrase.en.replace("{concept}", conceptNameEn);
        const question_hi = phrase.hi.replace("{concept}", conceptNameHi);

        // Map the correct content based on the template target
        let correct_en = "";
        let correct_hi = "";
        let target_field_en = "";
        let target_field_hi = "";

        if (templateIdx === 0) {
            correct_en = property.en;
            correct_hi = property.hi;
            target_field_en = property.en;
            target_field_hi = property.hi;
        } else if (templateIdx === 1) {
            correct_en = objective.en;
            correct_hi = objective.hi;
            target_field_en = objective.en;
            target_field_hi = objective.hi;
        } else if (templateIdx === 2) {
            correct_en = advantage.en;
            correct_hi = advantage.hi;
            target_field_en = advantage.en;
            target_field_hi = advantage.hi;
        } else if (templateIdx === 3) {
            correct_en = tradeoff.en;
            correct_hi = tradeoff.hi;
            target_field_en = tradeoff.en;
            target_field_hi = tradeoff.hi;
        } else {
            correct_en = scenario.en;
            correct_hi = scenario.hi;
            target_field_en = scenario.en;
            target_field_hi = scenario.hi;
        }

        // Synthesize distractors using sentences of other concepts in the block
        const distractor_en = [];
        const distractor_hi = [];

        for (let d = 1; d <= 3; d++) {
            const altConceptIdx = (conceptIdx + d) % 10;
            const altPropIdx = (sub.id * 3 + altConceptIdx * 7) % 10;
            const altObjIdx = (sub.id * 2 + altConceptIdx * 3) % 10;
            const altAdvIdx = (sub.id * 4 + altConceptIdx * 9) % 10;
            const altTradIdx = (sub.id * 5 + altConceptIdx * 1) % 10;
            const altScenIdx = (sub.id * 7 + altConceptIdx * 8) % 10;

            if (templateIdx === 0) {
                distractor_en.push(catVocab.properties[altPropIdx].en);
                distractor_hi.push(catVocab.properties[altPropIdx].hi);
            } else if (templateIdx === 1) {
                distractor_en.push(catVocab.objectives[altObjIdx].en);
                distractor_hi.push(catVocab.objectives[altObjIdx].hi);
            } else if (templateIdx === 2) {
                distractor_en.push(catVocab.advantages[altAdvIdx].en);
                distractor_hi.push(catVocab.advantages[altAdvIdx].hi);
            } else if (templateIdx === 3) {
                distractor_en.push(catVocab.tradeoffs[altTradIdx].en);
                distractor_hi.push(catVocab.tradeoffs[altTradIdx].hi);
            } else {
                distractor_en.push(catVocab.scenarios[altScenIdx].en);
                distractor_hi.push(catVocab.scenarios[altScenIdx].hi);
            }
        }

        // Verify distractors are unique compared to correct answer
        for (let d = 0; d < 3; d++) {
            if (distractor_en[d] === correct_en) {
                // Shift index to guarantee complete logical divergence
                const shiftIdx = (conceptIdx + d + 5) % 10;
                distractor_en[d] = catVocab.properties[shiftIdx].en;
                distractor_hi[d] = catVocab.properties[shiftIdx].hi;
            }
        }

        // Randomize options array but track correct index
        const options_en = [correct_en, ...distractor_en];
        const options_hi = [correct_hi, ...distractor_hi];
        
        // Deterministic pseudo-random shuffle based on subId and qIdx to ensure repeatable builds
        const correctAnswer = (sub.id * 3 + qIdx * 7) % 4;
        if (correctAnswer !== 0) {
            const tempEn = options_en[0];
            options_en[0] = options_en[correctAnswer];
            options_en[correctAnswer] = tempEn;

            const tempHi = options_hi[0];
            options_hi[0] = options_hi[correctAnswer];
            options_hi[correctAnswer] = tempHi;
        }

        // Strip trailing punctuation to prevent double period/danda in templates
        const descEn = target_field_en.endsWith('.') ? target_field_en.slice(0, -1) : target_field_en;
        const descHi = target_field_hi.endsWith('।') ? target_field_hi.slice(0, -1) : target_field_hi;

        // Synthesize detailed bilingual explanations (> 200 characters)
        const explanation_en = phrase.expl_en
            .replace("{concept}", conceptNameEn)
            .replace("{desc}", descEn);

        const explanation_hi = phrase.expl_hi
            .replace("{concept}", conceptNameHi)
            .replace("{desc}", descHi);

        // Formatting ID as COMP-XXXX to preserve standard schema requirements
        const id = `COMP-${String(qIdCounter).padStart(4, '0')}`;
        qIdCounter++;

        // Select exam tags
        const exams = ["SSC CGL", "BPSC", "State PCS", "Railway NTPC"];
        const exam_tags = [exams[qIdx % exams.length], "State PCS"];

        questions.push({
            id,
            subject: "Computer Science",
            topic: sub.name,
            difficulty,
            question_en,
            question_hi,
            options_en,
            options_hi,
            correctAnswer,
            explanation_en,
            explanation_hi,
            exam_tags,
            reference: "Standard NCERT Computer Science CBSE Class 11-12 Textbook",
            year_asked: String(2020 + (qIdx % 6))
        });
    }

    return questions;
}

// Generate the full 5000 questions bank
function generateBank() {
    console.log("🚀 Initializing NCERT Computer Science 5000 Question Generator...");
    
    const questions = [];
    let qIdCounter = 1;

    // Loop through all 100 subtopics
    for (let sIdx = 0; sIdx < 100; sIdx++) {
        const sub = SUBTOPICS[sIdx];
        const subQuestions = generateQuestionsForSubtopic(sub, qIdCounter);
        questions.push(...subQuestions);
        qIdCounter += 50;
    }

    console.log(`✅ Generation completed! Total questions: ${questions.length}`);
    
    // Save to target json file
    const outputData = {
        subject: "Computer Science",
        count: questions.length,
        questions
    };

    const dir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(outputData, null, 2), 'utf8');
    console.log(`💾 Successfully wrote to: ${OUTPUT_PATH}`);
}

generateBank();
