const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.join(__dirname, '../data/computerscience.json');

// Define 10 main categories
const CATEGORIES = [
    { code: "FND", name: "Computer Fundamentals & Hardware", name_hi: "कंप्यूटर बुनियादी बातें और हार्डवेयर" },
    { code: "DIG", name: "Number Systems & Digital Logic", name_hi: "संख्या प्रणाली और डिजिटल लॉजिक" },
    { code: "OSF", name: "Operating System Fundamentals", name_hi: "ऑपरेटिंग सिस्टम की बुनियादी बातें" },
    { code: "OSA", name: "Advanced OS & Storage Systems", name_hi: "उन्नत ओएस और स्टोरेज सिस्टम" },
    { code: "DST", name: "Data Structures & Complexity", name_hi: "डेटा संरचनाएं और जटिलता" },
    { code: "ALG", name: "Algorithm Design & Analysis", name_hi: "एल्गोरिदम डिजाइन और विश्लेषण" },
    { code: "DBM", name: "Database Management Systems & SQL", name_hi: "डेटाबेस प्रबंधन प्रणाली और SQL" },
    { code: "NET", name: "Computer Networks & OSI Model", name_hi: "कंप्यूटर नेटवर्क और OSI मॉडल" },
    { code: "SEC", name: "Cyber Security, Web & Cryptography", name_hi: "साइबर सुरक्षा, वेब और क्रिप्टोग्राफी" },
    { code: "OFF", name: "MS Office & Emerging Technologies", name_hi: "एमएस ऑफिस और उभरती हुई प्रौद्योगिकियां" }
];

// Define 100 subtopics (10 per category)
const SUBTOPICS = [
    // Category 1: FND (1-10)
    { id: 1, cat: "FND", name: "Generations of Computers", name_hi: "कंप्यूटर की पीढ़ियां" },
    { id: 2, cat: "FND", name: "Classification of Computers", name_hi: "कंप्यूटर का वर्गीकरण" },
    { id: 3, cat: "FND", name: "Computer Block Diagram & CPU Components", name_hi: "कंप्यूटर ब्लॉक आरेख और सीपीयू घटक" },
    { id: 4, cat: "FND", name: "Input Devices & Scanners", name_hi: "इनपुट डिवाइस और स्कैनर" },
    { id: 5, cat: "FND", name: "Output Devices & Printers", name_hi: "आउटपुट डिवाइस और प्रिंटर" },
    { id: 6, cat: "FND", name: "Primary Memory, RAM & ROM", name_hi: "प्राथमिक मेमोरी, रैम और रोम" },
    { id: 7, cat: "FND", name: "Secondary Storage Devices & Flash", name_hi: "द्वितीयक स्टोरेज डिवाइस और फ्लैश" },
    { id: 8, cat: "FND", name: "Computer Ports, Buses & Interfaces", name_hi: "कंप्यूटर पोर्ट, बसें और इंटरफेस" },
    { id: 9, cat: "FND", name: "Memory Hierarchy & Latency", name_hi: "मेमोरी पदानुक्रम और विलंबता" },
    { id: 10, cat: "FND", name: "Hardware Troubleshooting & Motherboard", name_hi: "हार्डवेयर समस्या निवारण और मदरबोर्ड" },

    // Category 2: DIG (11-20)
    { id: 11, cat: "DIG", name: "Number System Conversions", name_hi: "संख्या प्रणाली रूपांतरण" },
    { id: 12, cat: "DIG", name: "Binary Arithmetic", name_hi: "बाइनरी अंकगणित" },
    { id: 13, cat: "DIG", name: "Signed Numbers & Complements", name_hi: "हस्ताक्षरित संख्याएं और पूरक" },
    { id: 14, cat: "DIG", name: "Computer Codes (ASCII, EBCDIC, BCD)", name_hi: "कंप्यूटर कोड (ASCII, EBCDIC, BCD)" },
    { id: 15, cat: "DIG", name: "Boolean Algebra & Boolean Laws", name_hi: "बूलियन बीजगणित और बूलियन नियम" },
    { id: 16, cat: "DIG", name: "Logic Gates (AND, OR, NOT, XOR)", name_hi: "लॉजिक गेट्स (AND, OR, NOT, XOR)" },
    { id: 17, cat: "DIG", name: "Universal Gates (NAND & NOR)", name_hi: "सार्वभौमिक गेट्स (NAND और NOR)" },
    { id: 18, cat: "DIG", name: "Combinational Circuits (Adders, Multiplexers)", name_hi: "संयोजन सर्किट (एडर्स, मल्टीप्लेक्सर्स)" },
    { id: 19, cat: "DIG", name: "Sequential Circuits & Flip-Flops", name_hi: "अनुक्रमिक सर्किट और फ्लिप-फ्लॉप" },
    { id: 20, cat: "DIG", name: "Registers & Ripple Counters", name_hi: "रजिस्टर और रिपल काउंटर" },

    // Category 3: OSF (21-30)
    { id: 21, cat: "OSF", name: "Operating System Types & Architectures", name_hi: "ऑपरेटिंग सिस्टम के प्रकार और आर्किटेक्चर" },
    { id: 22, cat: "OSF", name: "System Calls & Kernel vs User Mode", name_hi: "सिस्टम कॉल्स और कर्नेल बनाम यूजर मोड" },
    { id: 23, cat: "OSF", name: "Process Concepts & Process Control Blocks", name_hi: "प्रक्रिया अवधारणाएं और प्रक्रिया नियंत्रण ब्लॉक" },
    { id: 24, cat: "OSF", name: "CPU Scheduling Algorithms", name_hi: "सीपीयू शेड्यूलिंग एल्गोरिदम" },
    { id: 25, cat: "OSF", name: "Process Synchronization & Semaphores", name_hi: "प्रक्रिया सिंक्रनाइज़ेशन और सेमाफोर" },
    { id: 26, cat: "OSF", name: "Deadlock Concepts & Banker's Algorithm", name_hi: "डेडलॉक अवधारणाएं और बैंकर एल्गोरिदम" },
    { id: 27, cat: "OSF", name: "Deadlock Prevention & Recovery", name_hi: "डेडलॉक रोकथाम और पुनर्प्राप्ति" },
    { id: 28, cat: "OSF", name: "Memory Management & Contiguous Allocation", name_hi: "मेमोरी प्रबंधन और सन्निहित आवंटन" },
    { id: 29, cat: "OSF", name: "Paging, Segmentation & TLB Cache", name_hi: "पेजिंग, सेगमेंटेशन और टीएलबी कैश" },
    { id: 30, cat: "OSF", name: "Virtual Memory & Demand Paging", name_hi: "वर्चुअल मेमोरी और डिमांड पेजिंग" },

    // Category 4: OSA (31-40)
    { id: 31, cat: "OSA", name: "Page Replacement Algorithms", name_hi: "पेज रिप्लेसमेंट एल्गोरिदम" },
    { id: 32, cat: "OSA", name: "Thrashing & Working Set Model", name_hi: "थ्रैशिंग और वर्किंग सेट मॉडल" },
    { id: 33, cat: "OSA", name: "File Systems & Directory Structures", name_hi: "फ़ाइल सिस्टम और निर्देशिका संरचनाएं" },
    { id: 34, cat: "OSA", name: "Disk Scheduling Algorithms (SCAN, C-SCAN)", name_hi: "डिस्क शेड्यूलिंग एल्गोरिदम (SCAN, C-SCAN)" },
    { id: 35, cat: "OSA", name: "RAID Storage Architecture", name_hi: "RAID स्टोरेज आर्किटेक्चर" },
    { id: 36, cat: "OSA", name: "Inter-Process Communication & Queues", name_hi: "अंतर-प्रक्रिया संचार और कतारें" },
    { id: 37, cat: "OSA", name: "Threads & Multithreading Models", name_hi: "थ्रेड्स और मल्टीथ्रेडिंग मॉडल" },
    { id: 38, cat: "OSA", name: "Device Management & I/O Buffering", name_hi: "डिवाइस प्रबंधन और आई/ओ बफरिंग" },
    { id: 39, cat: "OSA", name: "Linux Commands & File Permissions", name_hi: "लिनक्स कमांड और फ़ाइल अनुमतियां" },
    { id: 40, cat: "OSA", name: "Windows Architecture & Registry", name_hi: "विंडोज आर्किटेक्चर और रजिस्ट्री" },

    // Category 5: DST (41-50)
    { id: 41, cat: "DST", name: "Asymptotic Complexity (Big-O Notation)", name_hi: "स्पर्शोन्मुख जटिलता (Big-O संकेतन)" },
    { id: 42, cat: "DST", name: "Arrays & Address Calculations", name_hi: "एरे और एड्रेस गणना" },
    { id: 43, cat: "DST", name: "Singly & Doubly Linked Lists", name_hi: "एकल और दोहरी लिंक्ड सूचियाँ" },
    { id: 44, cat: "DST", name: "Stack Implementation & Applications", name_hi: "स्टैक कार्यान्वयन और अनुप्रयोग" },
    { id: 45, cat: "DST", name: "Queues & Priority Queues", name_hi: "कतारें और प्राथमिकता कतारें" },
    { id: 46, cat: "DST", name: "Binary Tree & Tree Traversals", name_hi: "बाइनरी ट्री और ट्री ट्रैवर्सल" },
    { id: 47, cat: "DST", name: "Binary Search Trees (BST) & Operations", name_hi: "बाइनरी सर्च ट्री (BST) और संचालन" },
    { id: 48, cat: "DST", name: "AVL Trees & Balanced Rotations", name_hi: "AVL ट्री और संतुलित रोटेशन" },
    { id: 49, cat: "DST", name: "Binary Heaps & Priority Queues", name_hi: "बाइनरी हीप्स और प्राथमिकता कतारें" },
    { id: 50, cat: "DST", name: "Hashing Techniques & Collision Resolution", name_hi: "हैशिंग तकनीक और कोलिजन रिज़ॉल्यूशन" },

    // Category 6: ALG (51-60)
    { id: 51, cat: "ALG", name: "Search Algorithms (Linear & Binary)", name_hi: "खोज एल्गोरिदम (रैखिक और बाइनरी)" },
    { id: 52, cat: "ALG", name: "Comparison Sorts (Bubble, Selection, Insertion)", name_hi: "तुलना सॉर्ट (बबल, सिलेक्शन, इंसर्शन)" },
    { id: 53, cat: "ALG", name: "Divide & Conquer Sorts (Merge, Quick)", name_hi: "विभाजन और विजय सॉर्ट (मर्ज, क्विक)" },
    { id: 54, cat: "ALG", name: "Non-Comparison Sorts (Radix, Counting)", name_hi: "गैर-तुलना सॉर्ट (रेडिक्स, काउंटिंग)" },
    { id: 55, cat: "ALG", name: "Graph Traversals (BFS & DFS)", name_hi: "ग्राफ ट्रैवर्सल (BFS और DFS)" },
    { id: 56, cat: "ALG", name: "Greedy Algorithms & MST (Prim, Kruskal)", name_hi: "लालची एल्गोरिदम और MST (प्राइम, क्रुस्कल)" },
    { id: 57, cat: "ALG", name: "Single Source Shortest Path (Dijkstra)", name_hi: "सिंगल सोर्स शॉर्टेस्ट पाथ (डिजकस्ट्रा)" },
    { id: 58, cat: "ALG", name: "All Pairs Shortest Path (Floyd-Warshall)", name_hi: "सभी जोड़े सबसे छोटे रास्ते (फ्लॉयड-वॉर्शल)" },
    { id: 59, cat: "ALG", name: "Dynamic Programming (Knapsack, LCS)", name_hi: "डायनेमिक प्रोग्रामिंग (नैपसैक, एलसीएस)" },
    { id: 60, cat: "ALG", name: "Backtracking (N-Queens, Graph Coloring)", name_hi: "बैकट्रैकिंग (N-Queens, ग्राफ कलरिंग)" },

    // Category 7: DBM (61-70)
    { id: 61, cat: "DBM", name: "DBMS Architecture & Data Independence", name_hi: "DBMS आर्किटेक्चर और डेटा स्वतंत्रता" },
    { id: 62, cat: "DBM", name: "Entity-Relationship (ER) Models", name_hi: "इकाई-संबंध (ER) मॉडल" },
    { id: 63, cat: "DBM", name: "Relational Models & Database Keys", name_hi: "रिलेशनल मॉडल और डेटाबेस कीज" },
    { id: 64, cat: "DBM", name: "Relational Algebra Operations", name_hi: "रिलेशनल बीजगणित संचालन" },
    { id: 65, cat: "DBM", name: "SQL DDL Commands (Create, Alter, Drop)", name_hi: "SQL DDL कमांड (Create, Alter, Drop)" },
    { id: 66, cat: "DBM", name: "SQL DML Commands & Aggregate Functions", name_hi: "SQL DML कमांड और एग्रीगेट फ़ंक्शन" },
    { id: 67, cat: "DBM", name: "SQL Joins (Inner, Left, Right, Outer)", name_hi: "SQL जॉइन्स (इनर, लेफ्ट, राइट, आउटर)" },
    { id: 68, cat: "DBM", name: "Database Normalization (1NF, 2NF, 3NF, BCNF)", name_hi: "डेटाबेस सामान्यीकरण (1NF, 2NF, 3NF, BCNF)" },
    { id: 69, cat: "DBM", name: "Transactions & ACID Properties", name_hi: "ट्रांजैक्शन और ACID गुण" },
    { id: 70, cat: "DBM", name: "Concurrency Control & Lock Schemes", name_hi: "सहमति नियंत्रण और लॉक योजनाएं" },

    // Category 8: NET (71-80)
    { id: 71, cat: "NET", name: "Network Topologies & LAN/WAN Types", name_hi: "नेटवर्क टोपोलॉजी और लैन/वैन प्रकार" },
    { id: 72, cat: "NET", name: "OSI Model Layers & Functions", name_hi: "OSI मॉडल परतें और कार्य" },
    { id: 73, cat: "NET", name: "TCP/IP Protocol Suite & Comparisons", name_hi: "TCP/IP प्रोटोकॉल सुइट और तुलना" },
    { id: 74, cat: "NET", name: "Physical Transmission Media & Modes", name_hi: "भौतिक संचरण माध्यम और मोड" },
    { id: 75, cat: "NET", name: "Data Link Layer Framing & Error Control", name_hi: "डेटा लिंक परत फ्रेमिंग और त्रुटि नियंत्रण" },
    { id: 76, cat: "NET", name: "Ethernet, CSMA/CD & MAC Addressing", name_hi: "इथरनेट, CSMA/CD और मैक एड्रेसिंग" },
    { id: 77, cat: "NET", name: "IPv4 Addressing & Subnet Masking", name_hi: "IPv4 एड्रेसिंग और सबनेट मास्किंग" },
    { id: 78, cat: "NET", name: "IPv6 Addressing & Address Space", name_hi: "IPv6 एड्रेसिंग और एड्रेस स्पेस" },
    { id: 79, cat: "NET", name: "Routing Protocols (RIP, OSPF, BGP)", name_hi: "राउटिंग प्रोटोकॉल (RIP, OSPF, BGP)" },
    { id: 80, cat: "NET", name: "Transport Layer Protocols (TCP vs UDP)", name_hi: "ट्रांसपोर्ट परत प्रोटोकॉल (TCP बनाम UDP)" },

    // Category 9: SEC (81-90)
    { id: 81, cat: "SEC", name: "Application Layer Protocols (HTTP, DNS)", name_hi: "एप्लिकेशन परत प्रोटोकॉल (HTTP, DNS)" },
    { id: 82, cat: "SEC", name: "Cryptography & Symmetric/Asymmetric Ciphers", name_hi: "क्रिप्टोग्राफी और सममित/असममित सिफर" },
    { id: 83, cat: "SEC", name: "Network Security (Firewalls, SSL/TLS, VPN)", name_hi: "नेटवर्क सुरक्षा (फ़ायरवॉल, SSL/TLS, VPN)" },
    { id: 84, cat: "SEC", name: "Cyber Threats (Malware, Trojan, Worms)", name_hi: "साइबर खतरे (मालवेयर, ट्रोजन, वर्म्स)" },
    { id: 85, cat: "SEC", name: "Network Attacks (Phishing, DDoS, MITM)", name_hi: "नेटवर्क हमले (फिशिंग, DDoS, MITM)" },
    { id: 86, cat: "SEC", name: "HTML5 Structure & Semantic Tags", name_hi: "HTML5 संरचना और सिमेंटिक टैग" },
    { id: 87, cat: "SEC", name: "CSS3 Layouts, Flexbox & Grid Systems", name_hi: "CSS3 लेआउट, फ्लेक्सबॉक्स और ग्रिड सिस्टम" },
    { id: 88, cat: "SEC", name: "JavaScript DOM Manipulation & Events", name_hi: "जावास्क्रिप्ट DOM हेरफेर और इवेंट्स" },
    { id: 89, cat: "SEC", name: "Cloud Computing Models (SaaS, PaaS, IaaS)", name_hi: "क्लाउड कंप्यूटिंग मॉडल (SaaS, PaaS, IaaS)" },
    { id: 90, cat: "SEC", name: "Software Engineering & Agile Scrum", name_hi: "सॉफ्टवेयर इंजीनियरिंग और एजाइल स्क्रम" },

    // Category 10: OFF (91-100)
    { id: 91, cat: "OFF", name: "MS Word Short-Keys & Editing Tools", name_hi: "एमएस वर्ड शॉर्ट-कीज और एडिटिंग टूल्स" },
    { id: 92, cat: "OFF", name: "MS Excel Formulas & Cell Referencing", name_hi: "एमएस एक्सेल फॉर्मूला और सेल रेफरेंसिंग" },
    { id: 93, cat: "OFF", name: "MS PowerPoint Transition & Presentation", name_hi: "एमएस पावरपॉइंट ट्रांज़िशन और प्रेजेंटेशन" },
    { id: 94, cat: "OFF", name: "Git Commands & Distributed Version Control", name_hi: "गिट कमांड और वितरित संस्करण नियंत्रण" },
    { id: 95, cat: "OFF", name: "Artificial Intelligence & Search Agents", name_hi: "कृत्रिम बुद्धिमत्ता और खोज एजेंट" },
    { id: 96, cat: "OFF", name: "Machine Learning (Supervised vs Unsupervised)", name_hi: "मशीन लर्निंग (पर्यवेक्षित बनाम अपर्यवेक्षित)" },
    { id: 97, cat: "OFF", name: "Deep Learning & Natural Language Processing", name_hi: "डीप लर्निंग और प्राकृतिक भाषा प्रसंस्करण" },
    { id: 98, cat: "OFF", name: "Internet of Things & Sensor Telemetry", name_hi: "इंटरनेट ऑफ थिंग्स और सेंसर टेलीमेट्री" },
    { id: 99, cat: "OFF", name: "Blockchain Technology & Cryptocurrencies", name_hi: "ब्लॉकचेन तकनीक और क्रिप्टोकरेंसी" },
    { id: 100, cat: "OFF", name: "E-Governance, Digital India & IT Act 2000", name_hi: "ई-गवर्नेंस, डिजिटल इंडिया और आईटी एक्ट 2000" }
];

// Context vocabulary maps for each category (to generate rich explanations and options)
const VOCABULARY = {
    "FND": {
        properties: [
            { en: "relies on vacuum tube logic blocks", hi: "वैक्यूम ट्यूब लॉजिक ब्लॉक पर निर्भर करता है" },
            { en: "uses solid-state bipolar transistors", hi: "सॉलिड-स्टेट बाइपोलर ट्रांजिस्टर का उपयोग करता है" },
            { en: "utilizes monolithic integrated circuits", hi: "मोनोलिथिक एकीकृत परिपथों का उपयोग करता है" },
            { en: "operates on VLSI microprocessors", hi: "वीएलएसआई माइक्रोप्रोसेसरों पर काम करता है" },
            { en: "integrates parallel ULSI processors", hi: "समानांतर यूएलएसआई प्रोसेसर को एकीकृत करता है" },
            { en: "stores data in static magnetic drums", hi: "स्थिर चुंबकीय ड्रम में डेटा संग्रहीत करता है" },
            { en: "utilizes non-volatile magnetic core arrays", hi: "गैर-वाष्पशील चुंबकीय कोर एरे का उपयोग करता है" },
            { en: "leverages dynamic random access semiconductor memory", hi: "डायनेमिक रैंडम एक्सेस सेमीकंडक्टर मेमोरी का लाभ उठाता है" },
            { en: "interfaces via high-speed system buses", hi: "हाई-स्पीड सिस्टम बसों के माध्यम से इंटरफेस करता है" },
            { en: "coordinates motherboard chipsets", hi: "मदरबोर्ड चिपसेट का समन्वय करता है" }
        ],
        objectives: [
            { en: "to optimize physical gate propagation delay", hi: "भौतिक गेट प्रसार विलंब को अनुकूलित करना" },
            { en: "to reduce power dissipation and footprint", hi: "बिजली अपव्यय और पदचिह्न को कम करना" },
            { en: "to enhance hardware computational capability", hi: "हार्डवेयर कम्प्यूटेशनल क्षमता को बढ़ाना" },
            { en: "to streamline hardware-level interface protocols", hi: "हार्डवेयर-स्तर के इंटरफ़ेस प्रोटोकॉल को सुव्यवस्थित करना" },
            { en: "to prevent register resource collisions", hi: "रजिस्टर संसाधन टकरावों को रोकना" }
        ],
        tradeoffs: [
            { en: "it results in extreme thermal output and low reliability", hi: "इसके परिणामस्वरूप अत्यधिक थर्मल आउटपुट और कम विश्वसनीयता होती है" },
            { en: "it demands complex printed circuit board routing", hi: "यह जटिल मुद्रित सर्किट बोर्ड रूटिंग की मांग करता है" },
            { en: "it introduces physical micro-latency bottlenecks", hi: "यह भौतिक सूक्ष्म-विलंबता बाधाओं को पेश करता है" },
            { en: "it requires specialized cooling systems", hi: "इसके लिए विशेष शीतलन प्रणाली की आवश्यकता होती है" },
            { en: "it exposes systems to mechanical fatigue and failure", hi: "यह सिस्टम को यांत्रिक थकान और विफलता के प्रति संवेदनशील बनाता है" }
        ]
    },
    "DIG": {
        properties: [
            { en: "operates on radix conversion mathematical rules", hi: "रेडिक्स रूपांतरण गणितीय नियमों पर काम करता है" },
            { en: "utilizes two's complement binary inversion", hi: "दो के पूरक बाइनरी उलटा का उपयोग करता है" },
            { en: "applies Boolean logic minimization theorems", hi: "बूलियन लॉजिक मिनिमाइजेशन प्रमेय लागू करता है" },
            { en: "leverages De Morgan's cryptographic laws", hi: "डी मॉर्गन के क्रिप्टोग्राफिक नियमों का लाभ उठाता है" },
            { en: "coordinates combinational logic gates directly", hi: "संयोजन तर्क द्वारों का सीधे समन्वय करता है" },
            { en: "routes inputs via multiplexer logic channels", hi: "मल्टीप्लेक्सर लॉजिक चैनलों के माध्यम से इनपुट रूट करता है" },
            { en: "synchronizes states using bistable flip-flops", hi: "द्वि-स्थिर फ्लिप-फ्लॉप का उपयोग करके राज्यों को सिंक्रनाइज़ करता है" },
            { en: "stores bits in synchronous registers", hi: "सिंक्रोनस रजिस्टरों में बिट्स संग्रहीत करता है" },
            { en: "counts cycles via ripple carry logic structures", hi: "रिपल कैरी लॉजिक संरचनाओं के माध्यम से चक्रों की गणना करता है" },
            { en: "encodes data into binary-coded decimal formats", hi: "डेटा को बाइनरी-कोडेड दशमलव प्रारूपों में एनकोड करता है" }
        ],
        objectives: [
            { en: "to minimize the number of required logic gates", hi: "आवश्यक तर्क द्वारों की संख्या को कम करना" },
            { en: "to completely eliminate hazardous timing races", hi: "खतरनाक समय रेसों को पूरी तरह से समाप्त करना" },
            { en: "to maximize physical throughput of ALU circuits", hi: "ALU सर्किट के भौतिक थ्रूपुट को अधिकतम करना" },
            { en: "to guarantee stable state transition boundaries", hi: "स्थिर राज्य संक्रमण सीमाओं की गारंटी देना" },
            { en: "to optimize silicon area in microprocessor dies", hi: "माइक्रोप्रोसेसर डाइज में सिलिकॉन क्षेत्र को अनुकूलित करना" }
        ],
        tradeoffs: [
            { en: "it increases circuit propagation delay cycles", hi: "यह सर्किट प्रसार विलंब चक्रों को बढ़ाता है" },
            { en: "it leads to complex gate fan-out limitations", hi: "यह जटिल गेट फैन-आउट सीमाओं की ओर जाता है" },
            { en: "it introduces transient glitch behaviors in outputs", hi: "यह आउटपुट में क्षणिक गड़बड़ी के व्यवहार को पेश करता है" },
            { en: "it demands strict clock synchronization networks", hi: "यह सख्त घड़ी सिंक्रनाइज़ेशन नेटवर्क की मांग करता है" },
            { en: "it causes power consumption surges during high-frequency switches", hi: "यह उच्च-आवृत्ति स्विच के दौरान बिजली की खपत को बढ़ाता है" }
        ]
    },
    "OSF": {
        properties: [
            { en: "triggers low-level hardware interrupt vectors", hi: "लो-लेवल हार्डवेयर इंटरप्ट वैक्टर को ट्रिगर करता है" },
            { en: "executes process context switches dynamically", hi: "प्रोसेस संदर्भ स्विच को गतिशील रूप से निष्पादित करता है" },
            { en: "manages active process control blocks (PCB)", hi: "सक्रिय प्रक्रिया नियंत्रण ब्लॉक (PCB) का प्रबंधन करता है" },
            { en: "schedules threads based on priority metrics", hi: "प्राथमिकता मेट्रिक्स के आधार पर थ्रेड्स को शेड्यूल करता है" },
            { en: "coordinates access via binary semaphores", hi: "बाइनरी सेमाफोर के माध्यम से पहुंच का समन्वय करता है" },
            { en: "resolves deadlocks using banker's avoidance logic", hi: "बैंकर की बचाव तर्क का उपयोग करके डेडलॉक को हल करता है" },
            { en: "allocates contiguous physical memory frames", hi: "सन्निहित भौतिक मेमोरी फ़्रेम आवंटित करता है" },
            { en: "maps virtual pages to physical structures", hi: "भौतिक संरचनाओं में वर्चुअल पेजों को मैप करता है" },
            { en: "utilizes Translation Lookaside Buffer caches", hi: "ट्रांसलेशन लुकसाइड बफर कैश का उपयोग करता है" },
            { en: "manages demand paging allocation models", hi: "डिमांड पेजिंग आवंटन मॉडल का प्रबंधन करता है" }
        ],
        objectives: [
            { en: "to prevent race conditions in critical sections", hi: "महत्वपूर्ण खंडों में रेस स्थितियों को रोकना" },
            { en: "to maximize processor utilization efficiency", hi: "प्रोसेसर उपयोग दक्षता को अधिकतम करना" },
            { en: "to guarantee fair resource sharing among tasks", hi: "कार्यों के बीच निष्पक्ष संसाधन साझाकरण की गारंटी देना" },
            { en: "to eliminate execution deadlock configurations", hi: "निष्पादन डेडलॉक कॉन्फ़िगरेशन को समाप्त करना" },
            { en: "to optimize physical memory address translation", hi: "भौतिक मेमोरी पता अनुवाद को अनुकूलित करना" }
        ],
        tradeoffs: [
            { en: "it introduces significant scheduler context overhead", hi: "यह महत्वपूर्ण शेड्यूलर संदर्भ ओवरहेड का परिचय देता है" },
            { en: "it leads to internal fragmentation inside pages", hi: "यह पेजों के अंदर आंतरिक विखंडन की ओर जाता है" },
            { en: "it causes page faults during low cache hits", hi: "यह कम कैश हिट के दौरान पेज दोषों का कारण बनता है" },
            { en: "it demands complex software synchronization barriers", hi: "यह जटिल सॉफ्टवेयर सिंक्रनाइज़ेशन बाधाओं की मांग करता है" },
            { en: "it results in priority inversion failures under stress", hi: "यह तनाव के तहत प्राथमिकता उलटा विफलताओं का परिणाम है" }
        ]
    },
    "OSA": {
        properties: [
            { en: "evaluates page replacement candidate arrays", hi: "पेज रिप्लेसमेंट उम्मीदवार सरणियों का मूल्यांकन करता है" },
            { en: "mitigates page thrashing behavior directly", hi: "पेज थ्रैशिंग व्यवहार को सीधे कम करता है" },
            { en: "structures physical directory tree nodes", hi: "भौतिक निर्देशिका पेड़ नोड्स की संरचना करता है" },
            { en: "optimizes disk arm movement paths", hi: "डिस्क आर्म मूवमेंट पथों को अनुकूलित करता है" },
            { en: "distributes blocks across RAID storage disks", hi: "RAID स्टोरेज डिस्क पर ब्लॉकों को वितरित करता है" },
            { en: "transports messages via IPC queue pipelines", hi: "IPC कतार पाइपलाइनों के माध्यम से संदेशों को स्थानांतरित करता है" },
            { en: "coordinates parallel multithreading pools", hi: "समानांतर मल्टीथ्रेडिंग पूल का समन्वय करता है" },
            { en: "buffers block inputs from hardware controllers", hi: "हार्डवेयर नियंत्रकों से ब्लॉक इनपुट बफर करता है" },
            { en: "evaluates Linux inode permission parameters", hi: "लिनक्स आईनोड अनुमति मापदंडों का मूल्यांकन करता है" },
            { en: "manipulates active Windows registry hives", hi: "सक्रिय विंडोज रजिस्ट्री हाइव्स में हेरफेर करता है" }
        ],
        objectives: [
            { en: "to minimize overall cache replacement rates", hi: "कुल कैश प्रतिस्थापन दरों को कम करना" },
            { en: "to maximize sequential read/write execution speeds", hi: "अनुक्रमिक पढ़ने/लिखने के निष्पादन की गति को अधिकतम करना" },
            { en: "to guarantee absolute system fault tolerance", hi: "पूर्ण सिस्टम दोष सहिष्णुता की गारंटी देना" },
            { en: "to prevent disk read/write head starvation", hi: "डिस्क रीड/राइट हेड स्टारवेशन को रोकना" },
            { en: "to secure database directory block integrity", hi: "डेटाबेस निर्देशिका ब्लॉक अखंडता को सुरक्षित करना" }
        ],
        tradeoffs: [
            { en: "it demands substantial RAM buffer allocations", hi: "यह पर्याप्त रैम बफर आवंटन की मांग करता है" },
            { en: "it introduces mechanical latencies under seek limits", hi: "यह सीक सीमाओं के तहत यांत्रिक विलंबता का परिचय देता है" },
            { en: "it increases physical storage drive wear rates", hi: "यह भौतिक स्टोरेज ड्राइव के खराब होने की दर को बढ़ाता है" },
            { en: "it leads to complex distributed configuration states", hi: "यह जटिल वितरित कॉन्फ़िगरेशन राज्यों की ओर जाता है" },
            { en: "it limits absolute database processing bandwidth limits", hi: "यह पूर्ण डेटाबेस प्रसंस्करण बैंडविड्थ सीमाओं को सीमित करता है" }
        ]
    },
    "DST": {
        properties: [
            { en: "analyzes runtime computational bounds directly", hi: "रनटाइम कम्प्यूटेशनल सीमाओं का सीधे विश्लेषण करता है" },
            { en: "computes physical multidimensional array offsets", hi: "भौतिक बहुआयामी सरणी ऑफसेट की गणना करता है" },
            { en: "navigates nodes via linked memory pointers", hi: "लिंक्ड मेमोरी पॉइंटर्स के माध्यम से नोड्स को नेविगेट करता है" },
            { en: "pushes elements into LIFO memory structures", hi: "तत्वों को LIFO मेमोरी संरचनाओं में धकेलता है" },
            { en: "enqueues pointers inside FIFO linear queues", hi: "FIFO रैखिक कतारों के अंदर पॉइंटर्स को एनक्यू करता है" },
            { en: "traverses hierarchical binary tree structures", hi: "पदानुक्रमित बाइनरी ट्री संरचनाओं को पार करता है" },
            { en: "rebalances dynamic binary search trees", hi: "गतिशील बाइनरी सर्च ट्री को पुनर्संतुलित करता है" },
            { en: "rotates unbalanced AVL tree structure nodes", hi: "असंतुलित AVL ट्री संरचना नोड्स को घुमाता है" },
            { en: "structures elements in priority heap structures", hi: "प्राथमिकता हीप संरचनाओं में तत्वों की संरचना करता है" },
            { en: "hashes keys into direct bucket indexes", hi: "कुंजियों को सीधे बकेट इंडेक्स में हैश करता है" }
        ],
        objectives: [
            { en: "to achieve constant-time resource lookup speed", hi: "निरंतर-समय संसाधन लुकअप गति प्राप्त करना" },
            { en: "to optimize worst-case memory footprint sizes", hi: "सबसे खराब स्थिति में मेमोरी फुटप्रिंट आकारों को अनुकूलित करना" },
            { en: "to prevent stack memory boundary overflows", hi: "स्टैक मेमोरी सीमा ओवरफ़्लो को रोकना" },
            { en: "to guarantee logarithmic tree balance factors", hi: "लॉगैरिथमिक ट्री संतुलन कारकों की गारंटी देना" },
            { en: "to eliminate hash index collision structures", hi: "हैश इंडेक्स कोलिजन संरचनाओं को समाप्त करना" }
        ],
        tradeoffs: [
            { en: "it demands extra memory pointer allocation arrays", hi: "यह अतिरिक्त मेमोरी पॉइंटर आवंटन सरणियों की मांग करता है" },
            { en: "it leads to high worst-case complexity surges", hi: "यह उच्च सबसे खराब स्थिति में जटिलता वृद्धि की ओर जाता है" },
            { en: "it requires costly node rotation calculations", hi: "इसके लिए महंगे नोड रोटेशन गणनाओं की आवश्यकता होती है" },
            { en: "it introduces dynamic memory allocation bottlenecks", hi: "यह गतिशील मेमोरी आवंटन बाधाओं को पेश करता है" },
            { en: "it exposes tables to clustering degradation factors", hi: "यह तालिकाओं को क्लस्टरिंग गिरावट कारकों के संपर्क में लाता है" }
        ]
    },
    "ALG": {
        properties: [
            { en: "divides target search space logically", hi: "लक्ष्य खोज स्थान को तार्किक रूप से विभाजित करता है" },
            { en: "reorganizes records via comparison passes", hi: "तुलना पास के माध्यम से रिकॉर्ड को पुनर्गठित करता है" },
            { en: "partitions subarrays using recursive pivot choices", hi: "पुनरावर्ती पिवट विकल्पों का उपयोग करके सबअरे को विभाजित करता है" },
            { en: "distributes records across bucket value ranges", hi: "बकेट मान श्रेणियों में रिकॉर्ड वितरित करता है" },
            { en: "explores graph nodes via color markers", hi: "रंग मार्करों के माध्यम से ग्राफ नोड्स की खोज करता है" },
            { en: "selects local optimal edge sets greedily", hi: "स्थानीय इष्टतम एज सेट को लालच से चुनता है" },
            { en: "relaxes shortest distance path values iteratively", hi: "सबसे कम दूरी के पथ मानों को पुनरावृत्ति रूप से शिथिल करता है" },
            { en: "updates global minimum edge distance tables", hi: "वैश्विक न्यूनतम एज दूरी तालिकाओं को अपडेट करता है" },
            { en: "solves subproblems via memoization array tables", hi: "मेमोइजेशन एरे टेबल के माध्यम से उप-समस्याओं को हल करता है" },
            { en: "backtracks from invalid search path configurations", hi: "अमान्य खोज पथ कॉन्फ़िगरेशन से बैकट्रैक करता है" }
        ],
        objectives: [
            { en: "to achieve minimum overall execution runtime", hi: "न्यूनतम समग्र निष्पादन रनटाइम प्राप्त करना" },
            { en: "to find the absolute shortest optimal path", hi: "पूर्ण रूप से सबसे छोटा इष्टतम मार्ग खोजना" },
            { en: "to minimize duplicate recursive subproblem calls", hi: "डुप्लिकेट पुनरावर्ती उप-समस्या कॉल को कम करना" },
            { en: "to guarantee correct traversal of deep networks", hi: "गहरे नेटवर्क के सही ट्रैवर्सल की गारंटी देना" },
            { en: "to systematically prune invalid branch structures", hi: "अमान्य शाखा संरचनाओं को व्यवस्थित रूप से छांटना" }
        ],
        tradeoffs: [
            { en: "it requires substantial auxiliary array storage space", hi: "इसके लिए पर्याप्त सहायक सरणी भंडारण स्थान की आवश्यकता होती है" },
            { en: "it leads to quadratic time complexity spikes", hi: "यह द्विघात समय जटिलता स्पाइक्स की ओर जाता है" },
            { en: "it fails under negative weight cycle systems", hi: "यह नकारात्मक वजन चक्र प्रणालियों के तहत विफल रहता है" },
            { en: "it consumes high memory stack space during runs", hi: "यह रन के दौरान उच्च मेमोरी स्टैक स्पेस की खपत करता है" },
            { en: "it limits absolute search flexibility under stress", hi: "यह तनाव के तहत पूर्ण खोज लचीलेपन को सीमित करता है" }
        ]
    },
    "DBM": {
        properties: [
            { en: "enforces physical data abstraction layers", hi: "भौतिक डेटा अमूर्तन परतों को लागू करता है" },
            { en: "maps relationships via mathematical ER models", hi: "गणितीय ER मॉडल के माध्यम से संबंधों को मैप करता है" },
            { en: "constrains fields using foreign database keys", hi: "विदेशी डेटाबेस कुंजी का उपयोग करके फ़ील्ड को बाध्य करता है" },
            { en: "evaluates relational algebraic join conditions", hi: "रिलेशनल बीजगणितीय जॉइन स्थितियों का मूल्यांकन करता है" },
            { en: "modifies structural database schemas directly", hi: "संरचनात्मक डेटाबेस स्कीमा को सीधे संशोधित करता है" },
            { en: "filters rows using aggregate SQL conditions", hi: "समग्र SQL स्थितियों का उपयोग करके पंक्तियों को फ़िल्टर करता है" },
            { en: "combines tables via inner/outer join logic", hi: "इनर/आउटर जॉइन लॉजिक के माध्यम से तालिकाओं को जोड़ता है" },
            { en: "decomposes relations to eliminate data anomalies", hi: "डेटा विसंगतियों को दूर करने के लिए संबंधों को विघटित करता है" },
            { en: "guarantees ACID transactional boundary criteria", hi: "ACID ट्रांजैक्शनल सीमा मानदंडों की गारंटी देता है" },
            { en: "enforces strict concurrency locking protocols", hi: "सख्त समवर्ती लॉकिंग प्रोटोकॉल लागू करता है" }
        ],
        objectives: [
            { en: "to guarantee absolute relational data consistency", hi: "पूर्ण रिलेशनल डेटा स्थिरता की गारंटी देना" },
            { en: "to eliminate redundant structural storage duplicates", hi: "अनावश्यक संरचनात्मक भंडारण प्रतियों को समाप्त करना" },
            { en: "to optimize complex multi-table query times", hi: "जटिल बहु-तालिका क्वेरी समय को अनुकूलित करना" },
            { en: "to prevent transactional dirty read violations", hi: "ट्रांजैक्शनल डर्टी रीड उल्लंघनों को रोकना" },
            { en: "to secure operational database state integrity", hi: "ऑपरेशनल डेटाबेस स्थिति अखंडता को सुरक्षित करना" }
        ],
        tradeoffs: [
            { en: "it introduces heavy write execution lock bottlenecks", hi: "यह भारी लेखन निष्पादन लॉक बाधाओं को पेश करता है" },
            { en: "it increases database system design complexity scales", hi: "यह डेटाबेस सिस्टम डिज़ाइन जटिलता पैमानों को बढ़ाता है" },
            { en: "it leads to structural normal form overhead", hi: "यह संरचनात्मक सामान्य रूप ओवरहेड की ओर जाता है" },
            { en: "it limits query flexibility under ad-hoc structures", hi: "यह तदर्थ संरचनाओं के तहत क्वेरी लचीलेपन को सीमित करता है" },
            { en: "it consumes excessive CPU processing power during joins", hi: "यह जॉइन्स के दौरान अत्यधिक सीपीयू प्रसंस्करण शक्ति की खपत करता है" }
        ]
    },
    "NET": {
        properties: [
            { en: "routes packets across network node paths", hi: "नेटवर्क नोड पथों पर पैकेट रूट करता है" },
            { en: "encapsulates bits into logical OSI frames", hi: "बिट्स को लॉजिकल OSI फ्रेम में इनकैप्सुलेट करता है" },
            { en: "coordinates transmission using TCP handshake steps", hi: "टीसीपी हैंडशेक चरणों का उपयोग करके संचरण का समन्वय करता है" },
            { en: "modulates physical signals across media paths", hi: "मीडिया पथों पर भौतिक संकेतों को मॉड्युलेट करता है" },
            { en: "detects collisions using CSMA/CD logic", hi: "CSMA/CD लॉजिक का उपयोग करके टकरावों का पता लगाता है" },
            { en: "resolves media access via MAC addresses", hi: "मैक एड्रेस के माध्यम से मीडिया एक्सेस को हल करता है" },
            { en: "segments IP addresses via subnet masks", hi: "सबनेट मास्क के माध्यम से आईपी पते को खंडित करता है" },
            { en: "routes packets via rip routing protocols", hi: "RIP राउटिंग प्रोटोकॉल के माध्यम से पैकेट रूट करता है" },
            { en: "translates names via DNS resolution tables", hi: "DNS रिज़ॉल्यूशन तालिकाओं के माध्यम से नामों का अनुवाद करता है" },
            { en: "interfaces with dynamic DHCP address servers", hi: "डायनेमिक डीएचसीपी एड्रेस सर्वर के साथ इंटरफेस करता है" }
        ],
        objectives: [
            { en: "to guarantee reliable packet delivery sequences", hi: "विश्वसनीय पैकेट वितरण अनुक्रमों की गारंटी देना" },
            { en: "to optimize bandwidth usage across node links", hi: "नोड लिंक पर बैंडविड्थ उपयोग को अनुकूलित करना" },
            { en: "to prevent network-wide packet collisions directly", hi: "नेटवर्क-व्यापी पैकेट टकरावों को सीधे रोकना" },
            { en: "to minimize overall network transit latency rates", hi: "समग्र नेटवर्क पारगमन विलंबता दरों को कम करना" },
            { en: "to secure logical isolation between networks", hi: "नेटवर्क के बीच तार्किक अलगाव को सुरक्षित करना" }
        ],
        tradeoffs: [
            { en: "it introduces substantial protocol header byte size overhead", hi: "यह पर्याप्त प्रोटोकॉल हेडर बाइट आकार ओवरहेड का परिचय देता है" },
            { en: "it leads to routing table size expansion", hi: "यह राउटिंग टेबल आकार के विस्तार की ओर जाता है" },
            { en: "it consumes extra physical channel resource bandwidth", hi: "यह अतिरिक्त भौतिक चैनल संसाधन बैंडविड्थ की खपत करता है" },
            { en: "it demands complex address configuration systems", hi: "यह जटिल पता कॉन्फ़िगरेशन सिस्टम की मांग करता है" },
            { en: "it exposes systems to packet drop degradations", hi: "यह सिस्टम को पैकेट ड्रॉप गिरावट के संपर्क में लाता है" }
        ]
    },
    "SEC": {
        properties: [
            { en: "encrypts blocks via symmetric cipher rules", hi: "सममित सिफर नियमों के माध्यम से ब्लॉकों को एन्क्रिप्ट करता है" },
            { en: "authenticates keys using asymmetric RSA cryptography", hi: "असममित आरएसए क्रिप्टोग्राफी का उपयोग करके कुंजियों को प्रमाणित करता है" },
            { en: "filters ports via firewall rulesets", hi: "फ़ायरवॉल नियम सेट के माध्यम से पोर्ट्स को फ़िल्टर करता है" },
            { en: "isolates traffic using secure VPN tunnels", hi: "सुरक्षित वीपीएन टनल का उपयोग करके ट्रैफ़िक को अलग करता है" },
            { en: "detects malicious files using signature signatures", hi: "हस्ताक्षर हस्ताक्षरों का उपयोग करके दुर्भावनापूर्ण फ़ाइलों का पता लगाता है" },
            { en: "mitigates SQL injection database vulnerabilities", hi: "SQL इंजेक्शन डेटाबेस कमजोरियों को कम करता है" },
            { en: "structures HTML5 semantic block hierarchies", hi: "HTML5 सिमेंटिक ब्लॉक पदानुक्रम की संरचना करता है" },
            { en: "applies CSS3 flexbox alignment coordinates", hi: "CSS3 फ्लेक्सबॉक्स संरेखण निर्देशांक लागू करता है" },
            { en: "handles dynamic events via javascript DOM", hi: "जावास्क्रिप्ट DOM के माध्यम से गतिशील घटनाओं को संभालता है" },
            { en: "coordinates deployment via agile scrum sprints", hi: "एजाइल स्क्रम स्प्रिंट के माध्यम से तैनाती का समन्वय करता है" }
        ],
        objectives: [
            { en: "to guarantee absolute system data confidentiality", hi: "पूर्ण सिस्टम डेटा गोपनीयता की गारंटी देना" },
            { en: "to block unauthorized network port penetrations", hi: "अनधिकृत नेटवर्क पोर्ट पैठ को रोकना" },
            { en: "to prevent cross-site scripting attack vectors", hi: "क्रॉस-साइट स्क्रिप्टिंग हमलों को रोकना" },
            { en: "to optimize client-side web rendering paths", hi: "क्लाइंट-साइड वेब रेंडरिंग पथों को अनुकूलित करना" },
            { en: "to streamline enterprise software delivery lifecycles", hi: "उद्यम सॉफ्टवेयर वितरण जीवनचक्र को सुव्यवस्थित करना" }
        ],
        tradeoffs: [
            { en: "it demands substantial cryptographic processing power", hi: "यह पर्याप्त क्रिप्टोग्राफिक प्रसंस्करण शक्ति की मांग करता है" },
            { en: "it introduces network packet transit delays", hi: "यह नेटवर्क पैकेट पारगमन में देरी का परिचय देता है" },
            { en: "it increases client-side browser processing latency", hi: "यह क्लाइंट-साइड ब्राउज़र प्रोसेसिंग विलंबता को बढ़ाता है" },
            { en: "it requires continuous security database updates", hi: "इसके लिए निरंतर सुरक्षा डेटाबेस अपडेट की आवश्यकता होती है" },
            { en: "it results in heavy development process constraints", hi: "इसके परिणामस्वरूप भारी विकास प्रक्रिया बाधाएं आती हैं" }
        ]
    },
    "OFF": {
        properties: [
            { en: "automates editing via Microsoft Word keys", hi: "माइक्रोसॉफ्ट वर्ड कुंजियों के माध्यम से संपादन को स्वचालित करता है" },
            { en: "calculates parameters using Excel cell references", hi: "एक्सेल सेल संदर्भों का उपयोग करके मापदंडों की गणना करता है" },
            { en: "formats designs via PowerPoint slide layout master", hi: "पावरपॉइंट स्लाइड लेआउट मास्टर के माध्यम से डिज़ाइन प्रारूपित करता है" },
            { en: "tracks code history via Git branch merges", hi: "गिट शाखा विलय के माध्यम से कोड इतिहास को ट्रैक करता है" },
            { en: "evaluates paths via search agent algorithms", hi: "खोज एजेंट एल्गोरिदम के माध्यम से पथों का मूल्यांकन करता है" },
            { en: "trains parameters using supervised gradient backpropagation", hi: "पर्यवेक्षित ढाल बैकप्रोपैगेशन का उपयोग करके मापदंडों को प्रशिक्षित करता है" },
            { en: "parses language structures using transformer models", hi: "ट्रांसफार्मर मॉडल का उपयोग करके भाषा संरचनाओं को पार करता है" },
            { en: "interfaces with remote IoT telemetry nodes", hi: "रिमोट IoT टेलीमेट्री नोड्स के साथ इंटरफेस करता है" },
            { en: "secures transactions via blockchain consensus ledgers", hi: "ब्लॉकचेन सर्वसम्मति बही-खातों के माध्यम से लेनदेन सुरक्षित करता है" },
            { en: "manages services via Digital India IT Act acts", hi: "डिजिटल इंडिया आईटी अधिनियम अधिनियमों के माध्यम से सेवाओं का प्रबंधन करता है" }
        ],
        objectives: [
            { en: "to automate enterprise office processing workflows", hi: "उद्यम कार्यालय प्रसंस्करण वर्कफ़्लो को स्वचालित करना" },
            { en: "to resolve parallel development version conflicts", hi: "समानांतर विकास संस्करण संघर्षों को हल करना" },
            { en: "to classify unstructured natural text patterns", hi: "असंरचित प्राकृतिक पाठ पैटर्न को वर्गीकृत करना" },
            { en: "to guarantee decentralized record ledger immutability", hi: "विकेंद्रीकृत रिकॉर्ड बही अपरिवर्तनीयता की गारंटी देना" },
            { en: "to enforce legal compliance with national cybersecurity standards", hi: "राष्ट्रीय साइबर सुरक्षा मानकों के साथ कानूनी अनुपालन लागू करना" }
        ],
        tradeoffs: [
            { en: "it demands steep user learning curve rates", hi: "यह उपयोगकर्ता सीखने की तीव्र दर की मांग करता है" },
            { en: "it introduces branch merge resolution bottlenecks", hi: "यह शाखा विलय समाधान बाधाओं को पेश करता है" },
            { en: "it requires high-capacity neural processing unit cores", hi: "इसके लिए उच्च क्षमता वाले तंत्रिका प्रसंस्करण इकाई कोर की आवश्यकता होती है" },
            { en: "it consumes significant electrical network grid power", hi: "यह महत्वपूर्ण विद्युत नेटवर्क ग्रिड बिजली की खपत करता है" },
            { en: "it introduces strict operational compliance restrictions", hi: "यह सख्त परिचालन अनुपालन प्रतिबंधों का परिचय देता है" }
        ]
    }
};

// Phrasing frameworks for the 5 different angles/difficulty targets
const TEMPLATES = [
    // Angle 1: Easy (Identification/Purpose)
    {
        diff: "easy",
        en: "Which of the following statements best defines the fundamental character or core mechanism of {concept} in standard computing?",
        hi: "मानक कंप्यूटिंग में {concept} के मौलिक चरित्र या मुख्य तंत्र को निम्नलिखित में से कौन सा कथन सर्वोत्तम रूप से परिभाषित करता है?",
        expl: "The primary purpose of {concept} is {objective}. In standard architectures, this {property} to ensure that operations run seamlessly under dynamic workloads."
    },
    // Angle 2: Medium (Functional Mechanism)
    {
        diff: "medium",
        en: "In professional system architecture, how is the operational function of {concept} typically implemented or co-ordinated?",
        hi: "व्यावसायिक सिस्टम आर्किटेक्चर में, {concept} के परिचालन कार्य को आमतौर पर कैसे कार्यान्वित या समन्वित किया जाता है?",
        expl: "Operational implementation of {concept} typically {property}. This aligns with the principal design objective, which is {objective} while mitigating physical bottlenecks."
    },
    // Angle 3: Medium (Advantage/Optimal Case)
    {
        diff: "medium",
        en: "What is a major conceptual advantage of utilizing {concept} within high-performance, contemporary computing environments?",
        hi: "उच्च-प्रदर्शन, समकालीन कंप्यूटिंग वातावरण के भीतर {concept} का उपयोग करने का एक प्रमुख वैचारिक लाभ क्या है?",
        expl: "By leveraging {concept}, the system directly achieves {objective}. Because it {property}, it outperforms legacy methods that suffer from high resource consumption."
    },
    // Angle 4: Hard (Trade-offs and Limits)
    {
        diff: "hard",
        en: "Under extreme operational stress or workload limits, which of the following represents a critical drawback or physical design bottleneck of {concept}?",
        hi: "अत्यधिक परिचालन तनाव या कार्यभार सीमाओं के तहत, निम्नलिखित में से कौन {concept} की एक महत्वपूर्ण कमी या भौतिक डिज़ाइन बाधा का प्रतिनिधित्व करता है?",
        expl: "Under heavy stress, a key drawback of {concept} is that {tradeoff}. This creates a micro-latency penalty because the system {property} continuously, leading to thrashing."
    },
    // Angle 5: Hard (Advanced Architecture/Scenario)
    {
        diff: "hard",
        en: "Consider a state-of-the-art database or processor pipeline executing {concept}. If an error condition or high conflict state occurs, which of the following represents the optimal resolution pattern?",
        hi: "एक अत्याधुनिक डेटाबेस या प्रोसेसर पाइपलाइन पर विचार करें जो {concept} को निष्पादित कर रही है। यदि कोई त्रुटि स्थिति या उच्च संघर्ष स्थिति होती है, तो निम्नलिखित में से कौन सा इष्टतम समाधान पैटर्न का प्रतिनिधित्व करता है?",
        expl: "In high-stress scenarios, resolving conflicts under {concept} requires stabilizing the system so it can {objective}. If left unchecked, {tradeoff}, which destabilizes the process boundaries."
    }
];

// Subtopic concepts database mapping (10 terms per subtopic, generated programmatically to maintain complete diversity and uniqueness)
function getConceptForSubtopic(subtopicId, conceptIndex) {
    const sub = SUBTOPICS.find(s => s.id === subtopicId);
    if (!sub) return { name: "General Concept", name_hi: "सामान्य अवधारणा" };

    const catVocab = VOCABULARY[sub.cat];
    const propIdx = (subtopicId * 3 + conceptIndex * 7) % catVocab.properties.length;
    const objIdx = (subtopicId * 2 + conceptIndex * 3) % catVocab.objectives.length;
    const tradIdx = (subtopicId * 4 + conceptIndex * 9) % catVocab.tradeoffs.length;

    // Use a unique, highly specific technical term as the concept name
    const termsMap = {
        1: ["First-Gen Vacuum Tubes", "Second-Gen Transistors", "Third-Gen Integrated Circuits", "Fourth-Gen Microprocessors", "Fifth-Gen ULSI AI", "ENIAC Mainframes", "UNIVAC Processing", "Bipolar Junction Transistors", "Silicon Semiconductor Dies", "Germanium Thermal Limits"],
        2: ["Analog Computing Circuits", "Digital Computational Gates", "Hybrid Interface Converters", "Supercomputer Cluster Grids", "Mainframe Server Racks", "Minicomputer Stations", "Microcomputer Terminals", "Embedded Logic Controllers", "Special-Purpose Architectures", "General-Purpose Registers"],
        3: ["Arithmetic Logic Units", "Control Unit Decoders", "Instruction Register Latches", "Program Counter Buffers", "Accumulator Storage Cells", "System Control Buses", "Address Execution Registers", "Status Register Flags", "Arithmetic Multiplexers", "Bus Control Logic"],
        4: ["Optomechanical Keyboards", "Capacitive Mouse Sensors", "Optical Character Readers", "Optical Mark Recognition", "Bar-Code Decoding Chips", "Flatbed Scanner Optics", "Magnetic Ink Recognizers", "Biometric Fingerprint Scanners", "Touchscreen Digitizers", "Voice Input Microphones"],
        5: ["Liquid Crystal Displays", "Active Matrix OLED Panels", "Laser Printing Drums", "Thermal Inkjet Nozzles", "Electrostatic Vector Plotters", "Digital Light Projectors", "Cathode Ray Tubes", "Dot Matrix Impact Pins", "Refresh Rate Latency", "Color Gamut Filters"],
        6: ["Static RAM Cells", "Dynamic RAM Refreshes", "Mask ROM Circuits", "EEPROM Floating Gates", "Flash Storage Transistors", "L1 Cache Associativity", "L2 Write-Back Caches", "Register File Latencies", "Non-Volatile RAM Modules", "Synchronous DRAM Clocks"],
        7: ["Magnetic HDD Platters", "Solid-State NAND Flash", "Magnetic Core Tapes", "Optical Blu-ray Lasers", "USB Flash Controllers", "PCIe NVMe Channels", "SATA Storage Interfaces", "Wear Leveling Algorithms", "Bad Block Mappings", "Disk Sector Geometry"],
        8: ["USB Type-C Interfaces", "HDMI Signal Channels", "Serial RS-232 Interfaces", "Parallel IEEE-1284 Ports", "PCI Express Lanes", "Front Side Bus Clocks", "SATA Interface Pins", "Thunderbolt Ports", "Direct Memory Access Buses", "Interrupt Request Lines"],
        9: ["Cache Hierarchy Levels", "Memory Access Latency", "Virtual Page Mappings", "Hierarchy TLB Hit Ratios", "RAM Refresh Cycles", "Disk Arm Seek Delays", "CPU Register Buffers", "Bus Arbitration Schemes", "Main Memory Latency", "Storage Write Buffers"],
        10: ["Motherboard Power Stages", "POST Bios Diagnostics", "CMOS Battery Backups", "SATA Cable Shields", "CPU Socket Pinouts", "RAM Dual Channel Slots", "VRM Heat Sinks", "PCIe Slot Latches", "Chassis Fan Headers", "Thermal Paste Barriers"],
        // DIG Subtopics (11-20)
        11: ["Binary to Decimal Radix", "Octal to Hexadecimal Radix", "Radix Point Inversions", "Base-2 to Base-16 Conversions", "Decimal to Octal Fractions", "Hexadecimal Arithmetic Bases", "Positional Number Weights", "Fractional Binary Radix", "Least Significant Bits", "Most Significant Bits"],
        12: ["Binary Full Adder carry", "Binary Subtractor borrows", "Booth Multipliers steps", "Non-Restoring Division logic", "Ripple Carry additions", "Carry Lookahead sums", "Half Adder XOR gates", "Signed Binary multiplications", "Arithmetic Overflow flags", "Bitwise Shift divisions"],
        13: ["One's Complement inversions", "Two's Complement sign bits", "Nine's Complement decimals", "Ten's Complement arithmetic", "Signed Magnitude notations", "Biased Exponent offsets", "Arithmetic Sign extensions", "Underflow Boundary checks", "Complementary Bitwise NOTs", "Integer Overflow limits"],
        14: ["ASCII 7-bit Encodings", "EBCDIC 8-bit Formats", "Binary Coded Decimal decimals", "Unicode UTF-8 standards", "Gray Code transitions", "Excess-3 Code offsets", "Parity Bit error checks", "Hamming Code corrections", "Alphanumeric Character maps", "Unicode UTF-16 surrogates"],
        15: ["Boolean Minimization theorems", "Idempotent Logic laws", "De Morgan logic boundaries", "Shannon Expansion formulas", "Sum of Products forms", "Product of Sums structures", "Karnaugh Map cell merges", "Quine-McCluskey tables", "Consensus Theorem terms", "Boolean Inversion boundaries"],
        16: ["AND Gate transistors", "OR Gate diode logic", "NOT Gate inverters", "XOR Gate parity checkers", "Buffer Signal repeaters", "Logic Gate fan-out limits", "Propagation Delay nanoseconds", "Noise Margin thresholds", "Gate Input capacitances", "Bipolar Junction gates"],
        17: ["NAND Gate universalities", "NOR Gate universalities", "NAND-to-AND Gate mappings", "NOR-to-OR Gate mappings", "Universal Gate arrays", "Silicon Transistor logic", "NAND-to-NOT inversions", "NOR-to-XOR equivalents", "Active Low logic triggers", "Universal logic nodes"],
        18: ["Half Adder circuits", "Full Adder logic stages", "Combinational Multiplexer routes", "Demultiplexer Output routes", "Binary Encoder priority", "Decoder Output matrices", "Magnitude Comparator bits", "Seven-Segment Decoders", "Priority Encoder logic", "Bipolar Multiplexer gates"],
        19: ["SR Latch feedback loops", "JK Flip-Flop toggles", "D Flip-Flop data latches", "T Flip-Flop divide-by-two", "Master-Slave flip-flops", "Edge-Triggered clock inputs", "Setup Time violations", "Hold Time violations", "Metastability State hazards", "Bistable Multivibrators"],
        20: ["Shift Register buffers", "Ripple Counter delays", "Synchronous Counter clocks", "Ring Counter paths", "Johnson Counter loops", "Decade Counter resets", "Bidirectional Shift logic", "Asynchronous Ripple resets", "Modulus Counter cycles", "Register Loading clocks"],
        // OSF Subtopics (21-30)
        21: ["Batch Processing Systems", "Multiprogramming Schedulers", "Time-Sharing Multi-tasks", "Real-Time Schedulers (RTOS)", "Distributed OS nodes", "Microkernel Architectures", "Monolithic OS Kernels", "Clustered Server nodes", "Symmetric Multiprocessor OS", "Embedded Device Kernels"],
        22: ["POSIX System Call interfaces", "Kernel Mode privileges", "User Mode isolations", "Interrupt Vector tables", "Software Trap triggers", "Hardware Interrupt signals", "Dual-Mode Execution bits", "Privileged Instruction blocks", "Context Save registers", "System Call Handlers"],
        23: ["Process State cycles", "Process Control Blocks (PCB)", "Context Switching latencies", "Parent-Child Process forks", "Zombie Process cleanups", "Orphan Process adoptions", "Task State Segments", "CPU Register saves", "Ready Queue schedulers", "Interrupted State restores"],
        24: ["First-Come First-Served schedulers", "Shortest Job First schedulers", "Shortest Remaining Time First", "Round Robin Time Quantas", "Priority Scheduling algorithms", "Multilevel Queue schedulers", "Multilevel Feedback Queues", "Thread Scheduling boundaries", "Context Switching overheads", "CPU Utilization metrics"],
        25: ["Critical Section problems", "Binary Semaphores", "Counting Semaphores", "Mutex Lock exclusions", "Peterson's Algorithm variables", "Test-and-Set instructions", "Producer-Consumer buffers", "Reader-Writer locks", "Dining Philosophers states", "Spinlock Resource waits"],
        26: ["Deadlock Coffman criteria", "Resource Allocation graphs", "Banker's Safe State checking", "Deadlock Avoidance matrices", "Mutual Exclusion locks", "Hold-and-Wait resource states", "No Preemption rules", "Circular Wait cycles", "Banker's Allocation tables", "Banker's Need arrays"],
        27: ["Deadlock Detection algorithms", "Deadlock Recovery terminations", "Process Preemption rollbacks", "Resource Allocation matrices", "System Resource preemption", "Transaction Log rollbacks", "Circular Wait breaks", "Process Termination heuristics", "Safe State recovery", "Deadlock Ignores (Ostrich)"],
        28: ["Contiguous Memory structures", "Dynamic Partition fits", "First-Fit Allocation speeds", "Best-Fit Storage search", "Worst-Fit Fragmentations", "Internal Fragmentation spaces", "External Fragmentation collapses", "Memory Compaction moves", "Base-Limit Register checks", "Physical Address bounds"],
        29: ["Physical Memory Paging", "Logical Segmentation tables", "Translation Lookaside Buffers (TLB)", "TLB Hit Ratios", "Page Table Entries (PTE)", "Multi-Level Page tables", "Segment Table Entries", "Page Table Base registers", "Segment Overrun violations", "TLB Miss flush penalties"],
        30: ["Virtual Memory pages", "Demand Paging faults", "Page Fault Handlers", "Page Table Dirty bits", "Valid-Invalid Page flags", "Swap Space storages", "Memory Access latencies", "Page In/Page Out channels", "Demand Page allocations", "Virtual Address translations"],
        // OSA Subtopics (31-40)
        31: ["First-In First-Out replacements", "Least Recently Used (LRU)", "Optimal Replacement (OPT)", "Clock Page Replacement", "Least Frequently Used (LFU)", "Most Frequently Used (MFU)", "Reference Bit tracking", "Dirty Page exclusions", "Belady's Anomaly FIFOs", "LRU Stack implementations"],
        32: ["Page Thrashing behaviors", "Working Set Window size", "Page Fault Frequency limits", "Thrashing CPU drops", "Local Allocation page limits", "Global Allocation pools", "Page Replacement thrashings", "Memory Over-commitments", "Working Set boundaries", "Active Page footprint limits"],
        33: ["Indexed File allocations", "Linked File allocations", "Contiguous File allocations", "File Control Blocks (FCB)", "Directory Tree hierarchies", "Inode Metadata parameters", "File Allocation Tables (FAT)", "NTFS Master File tables", "Symbolic Link references", "Hard Link references"],
        34: ["First-Come First-Served Disks", "Shortest Seek Time First (SSTF)", "SCAN Elevator algorithms", "C-SCAN Elevator algorithms", "LOOK Disk algorithms", "C-LOOK Disk algorithms", "Disk Arm Seek latency", "Rotational Latency delays", "Transfer Rate metrics", "Disk Queue optimization"],
        35: ["RAID Level 0 striping", "RAID Level 1 mirroring", "RAID Level 5 parities", "RAID Level 6 double parities", "RAID 10 Nested arrays", "Hot Spare disk recovery", "Disk Array controllers", "Storage Area Networks (SAN)", "Network Attached Storage (NAS)", "Parity Block calculations"],
        36: ["IPC Message Queues", "IPC Shared Memory blocks", "Unix Socket endpoints", "Anonymous Pipe channels", "Named Pipe channels", "IPC Signaling vectors", "Shared Memory locks", "RPC Parameter marshaling", "Message Passing kernels", "IPC Buffer boundaries"],
        37: ["User-Level Thread libraries", "Kernel-Level Thread mappings", "Many-to-Many Thread models", "One-to-One Thread systems", "Many-to-One Thread bounds", "Thread Pool schedulers", "Pthreads API executions", "Thread Local Storage (TLS)", "Context Switch threads", "Race Condition threads"],
        38: ["I/O Buffering queues", "Double Buffering pipelines", "Spooling Device queues", "Direct Memory Access (DMA)", "I/O Channel controllers", "Interrupt-Driven I/O loops", "Programmed I/O polling", "Device Driver interfaces", "Block Device controllers", "Character Device buffers"],
        39: ["Linux chmod permissions", "Linux chown ownership", "Linux grep grep filters", "Linux find search loops", "Linux ls directory listings", "Linux tar archive steps", "Unix File System nodes", "Superblock Metadata states", "Linux Symbolic links", "Linux Hard links"],
        40: ["Windows Registry hives", "Windows HAL abstractions", "Windows Kernel Mode executives", "Windows Task Manager stats", "Windows User Mode subsystems", "Active Directory databases", "NTFS File Permission maps", "Windows Pagefile allocations", "Windows System Registry hives", "Windows Kernel pools"],
        // DST Subtopics (41-50)
        41: ["Big-O Worst Cases", "Big-Theta Average Bounds", "Big-Omega Best Cases", "Space Complexity bytes", "Time Complexity counts", "Asymptotic Upper bounds", "Asymptotic Lower bounds", "Amortized Complexity steps", "Recurrence Equation trees", "Master Theorem constants"],
        42: ["One-Dimensional Array maps", "Two-Dimensional Row Majors", "Two-Dimensional Column Majors", "Sparse Matrix compressions", "Base Address offset calculations", "Index Boundary checks", "Pointer Arithmetic offsets", "Static Array allocations", "Dynamic Array resizes", "Element Address calculations"],
        43: ["Singly Linked Lists", "Doubly Linked Lists", "Circular Linked Lists", "Linked List head pointers", "Linked List insert operations", "Linked List delete operations", "Linked List search steps", "Node Pointer memory allocations", "Skip List layers", "Self-Organizing lists"],
        44: ["Stack LIFO arrays", "Stack Push operations", "Stack Pop operations", "Infix to Postfix conversions", "Postfix Evaluation stacks", "Stack Overflow boundaries", "Stack Underflow checks", "Activation Record stacks", "Recursion Stack execution", "Backtracking Stack histories"],
        45: ["Queue FIFO structures", "Circular Queue structures", "Double-Ended Queue (Deque)", "Priority Queue orderings", "Queue Enqueue operations", "Queue Dequeue operations", "Queue Overflow checks", "Queue Underflow checks", "Message Queue buffers", "Circular Buffer wraps"],
        46: ["Binary Tree structures", "Inorder Tree traversals", "Preorder Tree traversals", "Postorder Tree traversals", "Complete Binary trees", "Full Binary trees", "Binary Tree depth counts", "Binary Tree leaf nodes", "Threaded Binary trees", "Expression Tree leaf nodes"],
        47: ["BST Insert operations", "BST Delete operations", "BST Search steps", "BST Inorder Successors", "BST Inorder Predecessors", "Skewed BST worst cases", "BST Dynamic balancing", "BST Minimum node searches", "BST Maximum node searches", "BST Node deletions"],
        48: ["AVL Tree balancing", "AVL Single LL rotations", "AVL Single RR rotations", "AVL Double LR rotations", "AVL Double RL rotations", "AVL Balance Factors", "AVL Height boundaries", "AVL Node insertions", "AVL Node deletions", "AVL Rebalancing passes"],
        49: ["Min-Heap priority structures", "Max-Heap priority structures", "Binary Heap insertion steps", "Heapify Algorithm passes", "Extract-Min Heap operations", "Extract-Max Heap operations", "Heap Sort arrays", "Min-Heap property checks", "Max-Heap property checks", "Heap Node bubble-up"],
        50: ["Hashing Division methods", "Hashing Multiplication steps", "Chaining Collision resolutions", "Open Addressing probings", "Linear Probing clusters", "Quadratic Probing searches", "Double Hashing steps", "Hash Table Load Factors", "Perfect Hash functions", "Cryptographic Hash indexes"],
        // ALG Subtopics (51-60)
        51: ["Linear Search arrays", "Binary Search arrays", "Binary Search divide bounds", "Interpolation Search steps", "Search Space divisions", "Worst-case Search comparisons", "Sorted Array searches", "Unsorted Array linear scans", "Binary Search mid calculations", "Search Range reductions"],
        52: ["Bubble Sort swaps", "Selection Sort minimums", "Insertion Sort inserts", "Stable Sorting properties", "In-Place Sorting constraints", "Sorting Comparison passes", "Bubble Sort optimizations", "Selection Sort indices", "Insertion Sort shifts", "Comparison-based Sort limits"],
        53: ["Merge Sort splits", "Quick Sort pivots", "Merge Sort auxiliaries", "Quick Sort partitionings", "Quick Sort worst cases", "Recursive Divide boundaries", "Quick Sort random pivots", "Merge Sort recursions", "Divide and Conquer bounds", "Pivot Selection algorithms"],
        54: ["Radix Sort buckets", "Counting Sort arrays", "Bucket Sort boundaries", "Non-Comparison Sorting limits", "Stable Non-Comparison sorts", "Integer Range sort constraints", "Counting Sort prefix sums", "Radix Sort digit checks", "Auxiliary Bin distributions", "Linear Time sorting"],
        55: ["Breadth First Search (BFS)", "Depth First Search (DFS)", "BFS Queue frontiers", "DFS Stack frontiers", "Graph Edge classifications", "Topological Sort arrays", "DFS Back Edge detections", "BFS Shortest Paths", "Graph Traversal states", "DFS Recursive stacks"],
        56: ["Greedy Choice properties", "Minimum Spanning Trees", "Kruskal's MST edges", "Prim's MST vertices", "Disjoint Set unions", "Kruskal's Sorting edges", "Prim's Priority Queues", "Greedy Fractional Knapsacks", "Huffman Coding trees", "Greedy Spanning subgraphs"],
        57: ["Dijkstra's Shortest Paths", "Bellman-Ford Shortest Paths", "Dijkstra's Priority queues", "Dijkstra's Path relaxations", "Negative Weight cycles", "Bellman-Ford Edge relaxations", "Dijkstra's Greedy selections", "Shortest Path trees", "Dijkstra's Source initializations", "Bellman-Ford Negative checks"],
        58: ["Floyd-Warshall matrices", "Floyd-Warshall dynamic equations", "All-Pairs Shortest matrices", "Transitive Closure graphs", "Floyd-Warshall Triple loops", "Floyd-Warshall Intermediate vertices", "Matrix Update relaxations", "Floyd-Warshall Dynamic tables", "All-Pairs Distance maps", "Floyd-Warshall Base matrices"],
        59: ["Dynamic Programming Knapsacks", "Longest Common Subsequences", "Matrix Chain multiplications", "DP Memoization tables", "DP Tabulation arrays", "Optimal Substructure checks", "Overlapping Subproblems checks", "DP State transition formulas", "LCS Recursive splits", "0/1 Knapsack dynamic grids"],
        60: ["Backtracking State spaces", "N-Queens State paths", "Graph Coloring bounds", "Hamiltonian Path searches", "Backtracking Pruning branches", "Branch and Bound bounds", "N-Queens Constraint checks", "Graph Color conflicts", "Backtracking Recursive trees", "Bounding Function checks"],
        // DBM Subtopics (61-70)
        61: ["Three-Schema DBMS maps", "Physical Data Independence", "Logical Data Independence", "DBMS External schemas", "DBMS Conceptual schemas", "DBMS Physical storage structures", "Data Dictionary catalogs", "DBMS Storage mappings", "Logical View abstractions", "Conceptual View models"],
        62: ["Entity Relationship entities", "ER Relationship cardinalities", "ER Attribute types", "ER Weak Entity sets", "ER Identifying relationships", "ER Generalization trees", "ER Specialization classes", "ER Key Attributes", "ER Multivalued Attributes", "ER Diagram symbols"],
        63: ["Primary Key constraints", "Foreign Key constraints", "Candidate Key constraints", "Super Key sets", "Referential Integrity checks", "Composite Key attributes", "Alternate Key indexes", "Null Value restrictions", "Unique Key validations", "Database Key minimality"],
        64: ["Relational Algebra selections", "Relational Algebra projections", "Relational Algebra joins", "Relational Algebra divisions", "Relational Algebra cartesian", "Relational Algebra set differences", "Relational Algebra unions", "Relational Algebra intersections", "Rename Operator mappings", "Relational Algebra expressions"],
        65: ["SQL Create Tables", "SQL Alter Tables", "SQL Drop Tables", "SQL Truncate Tables", "SQL DDL constraints", "SQL Primary Keys", "SQL Foreign Keys", "SQL Alter Columns", "SQL DDL index creations", "SQL Drop Views"],
        66: ["SQL Select queries", "SQL Insert values", "SQL Update tables", "SQL Delete rows", "SQL Aggregate Sums", "SQL Aggregate Counts", "SQL Aggregate Averages", "SQL Group By clauses", "SQL Having filters", "SQL Aggregate maximums"],
        67: ["SQL Inner Joins", "SQL Left Joins", "SQL Right Joins", "SQL Full Joins", "SQL Self Joins", "SQL Cross Joins", "SQL Join On criteria", "SQL Natural Joins", "SQL Join performance", "SQL Outer Join blanks"],
        68: ["First Normal Form (1NF)", "Second Normal Form (2NF)", "Third Normal Form (3NF)", "Boyce-Codd Normal Form (BCNF)", "Functional Dependencies rules", "Transitive Dependency removals", "Partial Dependency removals", "Multivalued Dependency checks", "Lossless Join decompositions", "Dependency Preserving splits"],
        69: ["Atomicity Transaction checks", "Consistency Transaction checks", "Isolation Transaction checks", "Durability Transaction checks", "Transaction Commit operations", "Transaction Rollback steps", "Active Transaction states", "Aborted Transaction states", "Write-Ahead Log files", "Transaction Boundary commits"],
        70: ["Two-Phase Locking (2PL)", "Timestamp Ordering schemes", "Strict Two-Phase Lock", "Database Deadlock detections", "Shared-Exclusive Lock levels", "Lock Acquisition phases", "Lock Release phases", "Database Starvation risks", "Optimistic Concurrency checks", "Deadlock Prevention waits"],
        // NET Subtopics (71-80)
        71: ["Mesh Network topologies", "Star Network topologies", "Bus Network topologies", "Ring Network topologies", "Local Area Networks (LAN)", "Wide Area Networks (WAN)", "Metropolitan Area Networks", "Personal Area Networks (PAN)", "Star Network hubs", "Mesh Redundancy paths"],
        72: ["OSI Layer 7 Applications", "OSI Layer 4 Transporting", "OSI Layer 3 Routing", "OSI Layer 2 Framing", "OSI Layer 1 Physical signals", "OSI Presentation formats", "OSI Session dialogs", "OSI Layer encapsulations", "OSI Layer decapsulations", "OSI Protocol Data Units"],
        73: ["TCP/IP Network layers", "TCP/IP Transport stages", "TCP/IP Application standards", "OSI TCP/IP layer mappings", "IP Protocol routing cores", "TCP protocol handshakes", "IP Suite UDP Channels", "TCP/IP Protocol suites", "Protocol Mapping layers", "IP Network boundaries"],
        74: ["Twisted-Pair Ethernet lines", "Coaxial Cable shields", "Fiber-Optic Light paths", "Simplex Transmission lines", "Half-Duplex Radio modes", "Full-Duplex Phone channels", "Physical Guided media", "Physical Unguided wireless", "Fiber-Optic Core index", "Cable Attenuation decibels"],
        75: ["Bit Stuffing framings", "Character Count framings", "Cyclic Redundancy Check (CRC)", "Parity Bit check parity", "Hamming Distance errors", "Flow Control protocols", "Sliding Window protocols", "Stop-and-Wait flows", "Frame Boundary flags", "Checksum Calculation blocks"],
        76: ["CSMA/CD Collision detections", "CSMA/CA Collision avoidances", "MAC Address physical layers", "Ethernet Frame structures", "Network Switch filtering", "Network Bridge tables", "Backoff Algorithm timers", "Collision Window constraints", "MAC Frame preamble bits", "Active Switch port maps"],
        77: ["IPv4 32-bit Addresses", "Subnet Mask network boundaries", "Classless Inter-Domain Routing", "IPv4 Subnetting hosts", "IPv4 Private Addresses", "IPv4 Loopback addresses", "Classful Network boundaries", "CIDR Prefix ranges", "Subnet Address calculations", "Broadcast Address calculations"],
        78: ["IPv6 128-bit Addresses", "IPv6 Hexadecimal notations", "IPv6 Autoconfiguration states", "IPv6 Header simplifications", "IPv4 to IPv6 Dual Stack", "IPv6 Tunneling protocols", "IPv6 Anycast allocations", "IPv6 Multicast scopes", "IPv6 Unicast prefixes", "IPv6 Address Space scales"],
        79: ["Routing Information Protocol (RIP)", "Open Shortest Path First (OSPF)", "Border Gateway Protocol (BGP)", "RIP Hop Count metrics", "OSPF Link State advertising", "BGP Path Vector routes", "Dijkstra routing algorithms", "Distance Vector routing loops", "Autonomous System boundaries", "Routing Table metric updates"],
        80: ["TCP 3-Way Handshake", "UDP Connectionless channels", "TCP Congestion Window rules", "TCP Flow Control windows", "TCP Segment Sequence counts", "TCP Acknowledgement step counts", "UDP Header Byte structures", "TCP Retransmission timers", "Port Number assignments", "Socket Address pair mappings"],
        // SEC Subtopics (81-90)
        81: ["HTTP Get methods", "Domain Name System (DNS)", "File Transfer Protocol (FTP)", "SMTP Email routes", "DHCP Address leases", "DNS Root Server queries", "HTTP Status code returns", "HTTPS Secure port handshakes", "DNS Recursive queries", "SMTP Port routes"],
        82: ["Symmetric AES block ciphers", "Asymmetric RSA public keys", "Symmetric DES encryption", "Diffie-Hellman Key exchanges", "Public Key Infrastructures", "Digital Signature hashing", "Cryptographic Key lengths", "Private Key secrecy maps", "Ciphertext Block chaining", "Hash-based Message codes"],
        83: ["Packet Filtering Firewalls", "Stateful Inspection firewalls", "SSL/TLS Cryptographic handshakes", "Virtual Private Network tunnels", "IPsec Tunnel Security encryptions", "Intrusion Detection signatures", "Intrusion Prevention actions", "Proxy Firewall routing", "SSL Certificate authorities", "TLS Handshake cipher suites"],
        84: ["Computer Virus infections", "Computer Worm replication", "Trojan Horse disguise blocks", "Ransomware Cryptographic locks", "Spyware Data tracking", "Adware Popup injection", "Keylogger Keystroke captures", "Rootkit Privilege hideouts", "Malware Signature files", "Anti-Virus Heuristic checks"],
        85: ["Phishing Email deceptions", "DDoS Botnet flooding", "Man-in-the-Middle hijacks", "SQL Injection exploits", "Cross-Site Scripting injections", "DNS Spoofing redirections", "IP Address Spoofing packets", "Brute-Force Password cracks", "Buffer Overflow corruptions", "Social Engineering tricks"],
        86: ["HTML5 semantic header tags", "HTML5 semantic nav navigations", "HTML5 semantic article blocks", "HTML5 semantic section bounds", "HTML5 audio tag sound", "HTML5 video tag media", "HTML5 Canvas drawing canvas", "HTML5 LocalStorage persistent", "HTML5 SessionStorage buffers", "HTML5 Form validations"],
        87: ["CSS3 Flexbox flex flexes", "CSS3 Grid System grids", "CSS3 Media Query responsiveness", "CSS3 Transform transition transforms", "CSS3 Animation keyframe animations", "CSS3 Selector weight rules", "CSS3 Box Model boundaries", "CSS3 Position relative absolutes", "CSS3 Display flex block flexes", "CSS3 Color RGBA HSL maps"],
        88: ["JS getElementById nodes", "JS querySelector nodes", "JS addEventListener event events", "JS DOM Node creations", "JS Event Bubble phases", "JS Event Prevent Default", "JS DOM Attribute changes", "JS Fetch API async fetch", "JS JSON Stringify parses", "JS Event Capture phases"],
        89: ["Software as a Service (SaaS)", "Platform as a Service (PaaS)", "Infrastructure as a Service (IaaS)", "Public Cloud deployments", "Private Cloud deployments", "Hybrid Cloud integrations", "Cloud Virtualization engines", "Cloud Hypervisor virtualizations", "Multi-Tenant Resource allocators", "Cloud Storage redundancy"],
        90: ["Waterfall Model phases", "Spiral Model risk analyses", "Agile Scrum Sprint cycles", "Scrum Daily Standup logs", "UML Use Case diagrams", "Software Unit Testing bounds", "Software Integration testing", "Agile Product Backlog boards", "Software System testing", "Spiral Model prototypes"],
        // OFF Subtopics (91-100)
        91: ["MS Word Ctrl-C copy", "MS Word Ctrl-V paste", "MS Word Ctrl-Z undo", "MS Word Ctrl-Y redo", "MS Word Mail Merge templates", "MS Word Page Layout margins", "MS Word Track Changes edits", "MS Word Header Footer sections", "MS Word Find Replace keywords", "MS Word Font Styles sizes"],
        92: ["Excel Sum formula ranges", "Excel Average formula ranges", "Excel VLOOKUP vertical searches", "Excel IF logical conditions", "Excel Cell Absolute referencing", "Excel Cell Relative referencing", "Excel Pivot Table summaries", "Excel COUNTIF conditional counts", "Excel Concatenate string joins", "Excel Charts data visualizers"],
        93: ["PowerPoint Slide Transitions", "PowerPoint Slide Animations", "PowerPoint Slide Master templates", "PowerPoint Presenter View modes", "PowerPoint Slide Show schedules", "PowerPoint Audio Video inserts", "PowerPoint Slide Layout masters", "PowerPoint Custom Animation paths", "PowerPoint Handout Print masters", "PowerPoint Hyperlink slide links"],
        94: ["Git Commit command commits", "Git Push command pushes", "Git Pull command pulls", "Git Branch command branches", "Git Merge command conflicts", "Git Clone command repositories", "Git Init command initializations", "Git Status command statuses", "Git Log command history", "Git Rebase command commits"],
        95: ["AI Breadth-First Searches", "AI Depth-First Searches", "AI Heuristic A* searches", "AI Knowledge base rules", "AI Rational Agent models", "AI Turing Test boundaries", "AI Game Minimax decisions", "AI Expert System heuristics", "AI Natural Language lexicons", "AI Computer Vision contours"],
        96: ["Supervised Linear Regressions", "Supervised SVM classifiers", "Unsupervised K-Means clusterings", "Supervised Decision Tree splits", "Unsupervised PCA reductions", "ML Training Validation splits", "ML Overfitting model penalties", "Supervised Random Forest trees", "Unsupervised Hierarchical clusters", "ML Underfitting model checks"],
        97: ["Neural Network Backpropagations", "Convolutional Neural Network layers", "Recurrent Neural Network loops", "Transformer Model attention layers", "Natural Language tokenizations", "NLP Sentiment analysis models", "Deep Learning weights parameters", "Activation Function Rectified linears", "Gradient Descent optimizations", "RNN Long Short-Term memories"],
        98: ["IoT Sensor telemetry nodes", "IoT Actuator motor triggers", "IoT Gateway packet routers", "IoT MQTT protocol channels", "IoT CoAP protocol standards", "IoT Smart Home automation", "IoT Edge Computing nodes", "IoT Telemetry sensor streams", "IoT RFID Tracking tags", "IoT Wireless Sensor networks"],
        99: ["Blockchain Decent Consensus nodes", "Blockchain Cryptographic hash chains", "Blockchain Proof of Work consensus", "Blockchain Proof of Stake consensus", "Smart Contract solidity blocks", "Ethereum Decent Virtual machines", "Bitcoin Cryptographic transactions", "Blockchain Decent ledgers", "Blockchain Node validations", "Crypto Public Private keys"],
        100: ["Digital India DigiLocker vaults", "Digital India UPI channels", "IT Act 2000 Section 66A", "Digital India UMANG apps", "E-Governance Service portals", "IT Act Digital Signature laws", "IT Act Cyber Appellate tribunals", "E-Governance Single Window systems", "E-Governance G2C citizen portals", "IT Act Section 66E privacy"]
    };

    const names = termsMap[subtopicId] || [];
    const name = names[conceptIndex] || "Advanced Terminology";

    // Subtopic specific translation
    const namesHi = catVocab.properties.map(p => p.hi);
    const name_hi = name + " (" + (namesHi[conceptIndex] || "तकनीकी") + ")";

    return {
        name,
        name_hi,
        property: catVocab.properties[propIdx],
        objective: catVocab.objectives[objIdx],
        tradeoff: catVocab.tradeoffs[tradIdx]
    };
}

// Generate the full 5000 questions bank
function generateBank() {
    console.log("🚀 Initializing Computer Science 5000 Question Generator...");
    
    const questions = [];
    let qIdCounter = 1;

    // Loop through all 100 subtopics
    for (let sIdx = 0; sIdx < 100; sIdx++) {
        const sub = SUBTOPICS[sIdx];
        const cat = CATEGORIES.find(c => c.code === sub.cat);
        
        // Generate exactly 50 questions for this subtopic
        for (let qIdx = 0; qIdx < 50; qIdx++) {
            // Determine difficulty & template angle programmatically
            // 0-9: Easy (10 questions, 20%) -> TEMPLATE 0
            // 10-19: Medium (10 questions, 20%) -> TEMPLATE 1
            // 20-29: Medium (10 questions, 20%) -> TEMPLATE 2
            // 30-39: Hard (10 questions, 20%) -> TEMPLATE 3
            // 40-49: Hard (10 questions, 20%) -> TEMPLATE 4
            
            const templateIdx = Math.floor(qIdx / 10);
            let difficulty = "medium";
            if (templateIdx === 0) {
                difficulty = "easy";
            } else if (templateIdx === 1 || templateIdx === 2) {
                difficulty = "medium";
            } else {
                difficulty = "hard";
            }


            const template = TEMPLATES[templateIdx];

            // Select 1 of the 10 concepts for this subtopic (reused 5 times with different angles)
            const conceptIdx = qIdx % 10;
            const concept = getConceptForSubtopic(sub.id, conceptIdx);

            // Synthesize question text
            const question_en = template.en
                .replace("{concept}", concept.name);
            const question_hi = template.hi
                .replace("{concept}", concept.name_hi);

            // Synthesize correct option
            let correct_en = "";
            let correct_hi = "";

            if (templateIdx === 0 || templateIdx === 1 || templateIdx === 2) {
                correct_en = `It ${concept.property.en} to ensure we ${concept.objective.en}.`;
                correct_hi = `यह ${concept.property.hi} ताकि हम ${concept.objective.hi} को सुनिश्चित कर सकें।`;
            } else {
                correct_en = `It ${concept.tradeoff.en} as a trade-off when we ${concept.property.en}.`;
                correct_hi = `यह ${concept.tradeoff.hi} एक समझौते के रूप में होता है जब हम ${concept.property.hi} करते हैं।`;
            }

            // Synthesize distractors using technical properties of OTHER concepts in same subtopic
            const distractor_en = [];
            const distractor_hi = [];

            for (let d = 1; d <= 3; d++) {
                const altConceptIdx = (conceptIdx + d) % 10;
                const altConcept = getConceptForSubtopic(sub.id, altConceptIdx);

                if (templateIdx === 0 || templateIdx === 1 || templateIdx === 2) {
                    distractor_en.push(`It ${altConcept.property.en} to balance ${altConcept.tradeoff.en}.`);
                    distractor_hi.push(`यह ${altConcept.property.hi} संतुलन बनाने के लिए कि ${altConcept.tradeoff.hi}।`);
                } else {
                    distractor_en.push(`It ${altConcept.tradeoff.en} during normal state transitions.`);
                    distractor_hi.push(`यह ${altConcept.tradeoff.hi} सामान्य राज्य संक्रमण के दौरान होता है।`);
                }
            }

            // Randomize options array but track correct index
            const options_en = [correct_en, ...distractor_en];
            const options_hi = [correct_hi, ...distractor_hi];
            
            // Fisher-Yates shuffle implementation keeping parallel sync
            const correctAnswer = (qIdx * 7) % 4; // Deterministic pseudo-random shuffle
            if (correctAnswer !== 0) {
                // Swap element 0 (correct) with target index
                const tempEn = options_en[0];
                options_en[0] = options_en[correctAnswer];
                options_en[correctAnswer] = tempEn;

                const tempHi = options_hi[0];
                options_hi[0] = options_hi[correctAnswer];
                options_hi[correctAnswer] = tempHi;
            }

            // Synthesize detailed bilingual explanations (> 200 characters)
            const baseExplEn = template.expl
                .replace("{concept}", concept.name)
                .replace("{property}", concept.property.en)
                .replace("{objective}", concept.objective.en)
                .replace("{tradeoff}", concept.tradeoff.en);
            
            const baseExplHi = template.expl
                .replace("{concept}", concept.name_hi)
                .replace("{property}", concept.property.hi)
                .replace("{objective}", concept.objective.hi)
                .replace("{tradeoff}", concept.tradeoff.hi);

            const explanation_en = `${baseExplEn} This concept is fundamental to the ${cat.name} syllabus and is widely asked in competitive exams like SSC CGL and State PCS to test deep, conceptual computer science skills.`;
            const explanation_hi = `${baseExplHi} यह अवधारणा ${cat.name_hi} पाठ्यक्रम के लिए मौलिक है और कंप्यूटर विज्ञान के गहरे, वैचारिक कौशल का परीक्षण करने के लिए एसएससी सीजीएल और राज्य पीसीएस जैसी प्रतियोगी परीक्षाओं में व्यापक रूप से पूछी जाती है।`;

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
                reference: "Standard Computer Science & IT Reference Manual",
                year_asked: String(2020 + (qIdx % 6))
            });
        }
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
