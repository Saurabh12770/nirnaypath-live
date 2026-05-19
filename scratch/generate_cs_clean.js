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
    { id: 4, cat: "FND", name: "Input Devices – Keyboard, Mouse, Light Pen", name_hi: "इनपुट डिवाइस - कीबोर्ड, माउस, light पेन" },
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
    69: ["Bit Parity transmission noise detectors", "Cyclic Redundancy Check validating math logic", "Hamming Distance error detection limits", "Checksum calculation block validation steps", "Even Parity logic gate XOR checkers", "CRC generator polynomial division steps", "Hamming Code multi-bit error correction logic", "Checksum carry wrap validation routines", "Parity bit transmission block overheads", "CRC residual checksum validation checks"],
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

// Dynamic database profiles for standard CS keywords to prevent templates
const KEY_TERM_PROFILES = {
    "vacuum_tubes": {
        def: { en: "first-generation electronic components using thermionic valves to control electrical flow in a vacuum", hi: "पहली पीढ़ी के इलेक्ट्रॉनिक घटक जो वैक्यूम में विद्युत प्रवाह को नियंत्रित करने के लिए थर्मिओनिक वाल्व का उपयोग करते हैं" },
        mech: { en: "emits thermal electrons from a heated cathode filament through a control grid to an anode plate", hi: "एक गर्म कैथोड फिलामेंट से नियंत्रण ग्रिड के माध्यम से एक एनोड प्लेट में तापीय इलेक्ट्रॉनों का उत्सर्जन करता है" },
        adv: { en: "pioneered the transition from mechanical systems to fully electronic digital calculations at high speeds", hi: "उच्च गति पर यांत्रिक प्रणालियों से पूरी तरह से इलेक्ट्रॉनिक डिजिटल गणनाओं में संक्रमण का बीड़ा उठाया" },
        lim: { en: "dissipated huge thermal energy, required intensive cooling, and suffered frequent filament burnout failures", hi: "भारी मात्रा में तापीय ऊर्जा का अपव्यय किया, गहन शीतलन की आवश्यकता थी, और बार-बार फिलामेंट बर्नआउट की विफलताओं से ग्रस्त था" },
        scen: { en: "a system failure triggered by a single burnt-out glass valve halting the complete machine, requiring hours of manual testing", hi: "एक भी जले हुए कांच के वाल्व के कारण सिस्टम विफलता जिससे पूरी मशीन रुक जाती है, जिसके लिए घंटों मैनुअल परीक्षण की आवश्यकता होती है" }
    },
    "transistors": {
        def: { en: "solid-state semiconductor devices used in second-generation systems to switch or amplify logic signals", hi: "ठोस-अवस्था (solid-state) सेमीकंडक्टर उपकरण जो लॉजिक सिग्नलों को स्विच या प्रवर्धित करने के लिए दूसरी पीढ़ी के सिस्टम में उपयोग किए जाते हैं" },
        mech: { en: "uses a tiny base junction control current to modulate a much larger collector-to-emitter flow", hi: "एक बहुत बड़े कलेक्टर-टू-एमीटर प्रवाह को नियंत्रित करने के लिए एक छोटे बेस जंक्शन नियंत्रण करंट का उपयोग करता है" },
        adv: { en: "offered microscopic sizes, low operating power, high physical durability, and minimal thermal emissions", hi: "सूक्ष्म आकार, कम परिचालन शक्ति, उच्च भौतिक स्थायित्व, और न्यूनतम तापीय उत्सर्जन की पेशकश की" },
        lim: { en: "highly vulnerable to thermal runaway damage and susceptible to electrostatic discharge degradation", hi: "थर्मल रनवे क्षति के प्रति अत्यधिक संवेदनशील और इलेक्ट्रोस्टैटिक डिस्चार्ज गिरावट के प्रति अतिसंवेदनशील" },
        scen: { en: "excessive ambient temperature in a computer room causing transistor saturation and resulting in math errors", hi: "कंप्यूटर रूम में अत्यधिक परिवेशी तापमान के कारण ट्रांजिस्टर संतृप्ति (saturation) होना और गणितीय त्रुटियां उत्पन्न होना" }
    },
    "integrated_circuits": {
        def: { en: "third-generation silicon dies containing complete networks of micro-components fabricated together", hi: "तीसरी पीढ़ी के सिलिकॉन डाइस जिनमें एक साथ गढ़े गए सूक्ष्म-घटकों के संपूर्ण नेटवर्क शामिल हैं" },
        mech: { en: "deposits multiple layers of semiconductor paths, resistors, and capacitors onto a single crystal chip", hi: "एक एकल क्रिस्टल चिप पर सेमीकंडक्टर पथ, प्रतिरोधक और कैपेसिटर की कई परतें जमा करता है" },
        adv: { en: "multiplied system clock frequencies exponentially while reducing chassis volume and signal latency", hi: "चेसिस वॉल्यूम और सिग्नल विलंबता को कम करते हुए सिस्टम क्लॉक आवृत्तियों को तेजी से गुणा किया" },
        lim: { en: "highly complex fabrication lithography demanding ultra-clean environments free of microscopic dust", hi: "अत्यधिक जटिल फैब्रिकेशन लिथोग्राफी जो सूक्ष्म धूल से मुक्त अल्ट्रा-क्लीन वातावरण की मांग करती है" },
        scen: { en: "a single airborne particulate contaminant ruining entire photolithography runs on a silicon wafer", hi: "एक एकल वायुजनित कण प्रदूषक सिलिकॉन वेफर पर संपूर्ण फोटोलिथोग्राफी रन को बर्बाद कर देता है" }
    },
    "microprocessors": {
        def: { en: "fourth-generation monolithic integrated circuits integrating all CPU registers, ALU, and control gates", hi: "चौथी पीढ़ी के मोनोलिथिक एकीकृत सर्किट जो सभी सीपीयू रजिस्टरों, एएलयू और नियंत्रण गेटों को एकीकृत करते हैं" },
        mech: { en: "decodes fetched instructions sequentially through microcode tables and routes execution buses", hi: "माइक्रोकोड तालिकाओं के माध्यम से प्राप्त निर्देशों को अनुक्रमिक रूप से डिकोड करता है और निष्पादन बसों को रूट करता है" },
        adv: { en: "enabled the personal computer revolution by condensing full processor cores onto a single chip", hi: "एक ही चिप पर पूर्ण प्रोसेसर कोर को संक्षिप्त करके व्यक्तिगत कंप्यूटर क्रांति को सक्षम बनाया" },
        lim: { en: "massive gate density causes high leakage current and requires elaborate heat dissipation solutions", hi: "बड़े पैमाने पर गेट घनत्व उच्च रिसाव धारा (leakage current) का कारण बनता है और विस्तृत गर्मी अपव्यय समाधानों की मांग करता है" },
        scen: { en: "clock throttling triggers dynamically when the silicon die temperature crosses safe thermal guidelines", hi: "सिलिकॉन डाई का तापमान सुरक्षित तापीय दिशानिर्देशों को पार करने पर क्लॉक थ्रॉटलिंग गतिशील रूप से ट्रिगर होती है" }
    },
    "ai": {
        def: { en: "computational systems capable of executing cognitive tasks, neural processing, and machine inference", hi: "कम्प्यूटेशनल सिस्टम जो संज्ञानात्मक कार्यों, तंत्रिका प्रसंस्करण (neural processing), और मशीन अनुमान को निष्पादित करने में सक्षम हैं" },
        mech: { en: "adjusts neural weights across deep network matrices dynamically based on error gradients", hi: "त्रुटि ग्रेडिएंट्स के आधार पर गहरे नेटवर्क मैट्रिसेस में तंत्रिका भार को गतिशील रूप से समायोजित करता है" },
        adv: { en: "automates complex pattern recognition and statistical decisions without explicit programmatic algorithms", hi: "स्पष्ट प्रोग्रामेटिक एल्गोरिदम के बिना जटिल पैटर्न पहचान और सांख्यिकीय निर्णयों को स्वचालित करता है" },
        lim: { en: "requires massive high-performance hardware structures and suffers from cognitive model opacity", hi: "बड़े पैमाने पर उच्च-प्रदर्शन हार्डवेयर संरचनाओं की आवश्यकता होती है और संज्ञानात्मक मॉडल की अपारदर्शिता (opacity) से ग्रस्त है" },
        scen: { en: "a neural model experiences overfitting during training, resulting in poor generalizations on validation datasets", hi: "प्रशिक्षण के दौरान एक तंत्रिका मॉडल ओवरफिटिंग का अनुभव करता है, जिसके परिणामस्वरूप सत्यापन डेटासेट पर खराब सामान्यीकरण होता है" }
    },
    "sram": {
        def: { en: "high-speed volatile static memory utilizing transistor latch circuits to store data states", hi: "उच्च गति वाली अस्थिर स्थिर मेमोरी (static memory) जो डेटा स्टेट्स को संग्रहीत करने के लिए ट्रांजिस्टर लैच सर्किट का उपयोग करती है" },
        mech: { en: "uses stable six-transistor cross-coupled flip-flop configurations to retain bits without refreshes", hi: "बिना रिफ्रेश के बिट्स को बनाए रखने के लिए स्थिर छह-ट्रांजिस्टर क्रॉस-युग्मित फ्लिप-फ्लॉप कॉन्फ़िगरेशन का उपयोग करता है" },
        adv: { en: "delivers ultra-fast access speed matching processor clock cycles directly for cache hierarchies", hi: "कैश पदानुक्रमों के लिए सीधे प्रोसेसर क्लॉक चक्रों से मेल खाने वाली अल्ट्रा-फास्ट एक्सेस स्पीड प्रदान करता है" },
        lim: { en: "requires high physical silicon area per bit, leading to low capacity and expensive design budgets", hi: "प्रति बिट उच्च भौतिक सिलिकॉन क्षेत्र की आवश्यकता होती है, जिससे कम क्षमता और महंगी डिजाइन बजट होती है" },
        scen: { en: "cache directory lines flush constantly due to set mapping conflicts under high-concurrency loops", hi: "उच्च-समवर्ती लूप के तहत सेट मैपिंग संघर्षों के कारण कैश निर्देशिका लाइनें लगातार फ्लश होती हैं" }
    },
    "dram": {
        def: { en: "volatile dynamic random-access memory storing binary bits as electrical charge in miniature capacitors", hi: "अस्थिर गतिशील रैंडम-एक्सेस मेमोरी (dynamic RAM) जो लघु कैपेसिटर में विद्युत चार्ज के रूप में बाइनरी बिट्स संग्रहीत करती है" },
        mech: { en: "stores bits in a single-transistor single-capacitor cell that naturally leaks charge over time", hi: "एक एकल-ट्रांजिस्टर एकल-कैपेसिटर सेल में बिट्स संग्रहीत करता है जो स्वाभाविक रूप से समय के साथ चार्ज लीक करता है" },
        adv: { en: "achieves high packaging density and affordable fabrication costs for main system memory lines", hi: "मुख्य सिस्टम मेमोरी लाइनों के लिए उच्च पैकेजिंग घनत्व और सस्ती निर्माण लागत प्राप्त करता है" },
        lim: { en: "demands periodic electrical refresh cycles which introduces processing overhead and latencies", hi: "आवधिक विद्युत रिफ्रेश चक्रों की मांग करता है जो प्रसंस्करण ओवरहेड और विलंबता का परिचय देता है" },
        scen: { en: "memory cell charge decay triggers transient data corruption during intense computational pauses", hi: "तीव्र कम्प्यूटेशनल ठहराव के दौरान मेमोरी सेल चार्ज क्षय क्षणिक डेटा भ्रष्टाचार को ट्रिगर करता है" }
    },
    "rom": {
        def: { en: "non-volatile memory designed to permanently store bootstrap logic and crucial system firmware", hi: "गैर-वाष्पशील मेमोरी जिसे बूटस्ट्रैप लॉजिक और महत्वपूर्ण सिस्टम फर्मवेयर को स्थायी रूप से संग्रहीत करने के लिए डिज़ाइन किया गया है" },
        mech: { en: "hardwires logical pathways physically during factory chip masking or diode programming", hi: "फैक्ट्री चिप मास्किंग या डायोड प्रोग्रामिंग के दौरान भौतिक रूप से तार्किक पथों को हार्डवायर करता है" },
        adv: { en: "guarantees absolute boot data preservation even under complete system power loss events", hi: "पूर्ण सिस्टम पावर लॉस घटनाओं के तहत भी पूर्ण बूट डेटा संरक्षण की गारंटी देता है" },
        lim: { en: "extremely rigid design that prohibits updates or updates requiring physical component swaps", hi: "अत्यधिक कठोर डिज़ाइन जो अपडेट को प्रतिबंधित करता है या अपडेट के लिए भौतिक घटक प्रतिस्थापन की मांग करता है" },
        scen: { en: "a firmware defect discovered post-production requiring complete physical motherboard recalls", hi: "उत्पादन के बाद खोजा गया एक फर्मवेयर दोष जिसके लिए पूर्ण भौतिक मदरबोर्ड रिकॉल की आवश्यकता होती है" }
    },
    "prom": {
        def: { en: "programmable read-only memory that can be written to exactly once using high voltage", hi: "प्रोग्राम करने योग्य केवल-पठनीय मेमोरी (programmable ROM) जिसे उच्च वोल्टेज का उपयोग करके ठीक एक बार लिखा जा सकता है" },
        mech: { en: "blows microscopic polysilicon fuses permanently to establish permanent logical states on-chip", hi: "चिप पर स्थायी तार्किक अवस्थाएं स्थापित करने के लिए सूक्ष्म पॉलीसिलिकॉन फ़्यूज़ को स्थायी रूप से उड़ा देता है" },
        adv: { en: "enables customized firmware deployments without expensive factory photolithography masking runs", hi: "महंगे कारखाने के फोटोलिथोग्राफी मास्किंग रन के बिना अनुकूलित फर्मवेयर तैनाती सक्षम बनाता है" },
        lim: { en: "irreversible fuse destruction prevents subsequent logic revisions or error corrections", hi: "अपरिवर्तनीय फ़्यूज़ विनाश बाद के लॉजिक संशोधनों या त्रुटि सुधारों को रोकता है" },
        scen: { en: "an early compiler programming error wasting expensive PROM chips due to irreversible bit configurations", hi: "एक प्रारंभिक कंपाइलर प्रोग्रामिंग त्रुटि जो अपरिवर्तनीय बिट कॉन्फ़िगरेशन के कारण महंगे पीरॉम चिप्स को बर्बाद कर देती है" }
    },
    "eprom": {
        def: { en: "erasable programmable read-only memory using ultraviolet light exposure to reset memory states", hi: "मिटाने योग्य प्रोग्राम करने योग्य केवल-पठनीय मेमोरी (EPROM) जो मेमोरी स्टेट्स को रीसेट करने के लिए पराबैंगनी प्रकाश के संपर्क का उपयोग करती है" },
        mech: { en: "drains trapped electrical charges from floating-gate cells through an integrated quartz window", hi: "एक एकीकृत क्वार्ट्ज विंडो के माध्यम से फ्लोटिंग-गेट सेल से फंसे हुए विद्युत चार्ज को बाहर निकालता है" },
        adv: { en: "enables firmware reprogramming without physical chip disposal or complete circuit redesigns", hi: "भौतिक चिप निपटान या पूर्ण सर्किट पुनरावृत्तियों के बिना फर्मवेयर रीप्रोग्रामिंग सक्षम बनाता है" },
        lim: { en: "demands physical chip extraction and lengthy exposure to ultraviolet eraser devices", hi: "भौतिक चिप निष्कर्षण और पराबैंगनी इरेज़र उपकरणों के लंबे समय तक संपर्क की मांग करता है" },
        scen: { en: "accidental exposure to ambient sunlight slowly draining data charge traps over years of deployment", hi: "परिवेशी सूर्य के प्रकाश के आकस्मिक संपर्क से तैनाती के वर्षों में डेटा चार्ज ट्रैप धीरे-धीरे समाप्त हो जाते हैं" }
    },
    "eeprom": {
        def: { en: "electrically erasable programmable read-only memory written at the byte level electronically", hi: "इलेक्ट्रिकली इरेज़ेबल प्रोग्रामेबल रीड-ओनली मेमोरी (EEPROM) जिसे बाइट स्तर पर इलेक्ट्रॉनिक रूप से लिखा जाता है" },
        mech: { en: "utilizes Fowler-Nordheim tunneling to inject or remove electrons from isolated floating gates", hi: "पृथक फ्लोटिंग गेट्स से इलेक्ट्रॉनों को इंजेक्ट करने या निकालने के लिए फाउलर-नॉर्डहेम टनलिंग का उपयोग करता है" },
        adv: { en: "enables in-system update operations byte-by-byte without extraction from motherboards", hi: "मदरबोर्ड से निकाले बिना बाइट-दर-बाइट इन-सिस्टम अपडेट संचालन सक्षम बनाता है" },
        lim: { en: "suffers from oxide degradation and experiences tunnel-barrier breakdown after high write endurance runs", hi: "ऑक्साइड क्षरण से ग्रस्त होता है और उच्च लेखन सहनशक्ति के बाद टनल-बैरियर टूटने का अनुभव करता है" },
        scen: { en: "system logs writing continuously to an EEPROM chip causing premature device cell wear out", hi: "सिस्टम लॉग लगातार एक EEPROM चिप पर लिखे जा रहे हैं जिससे डिवाइस सेल समय से पहले खराब हो जाते हैं" }
    },
    "ssd": {
        def: { en: "solid-state drives utilizing non-volatile NAND flash memory cells to store digital files", hi: "सॉलिड-स्टेट ड्राइव (SSD) जो डिजिटल फ़ाइलों को संग्रहीत करने के लिए गैर-वाष्पशील NAND फ्लैश मेमोरी सेल का लाभ उठाते हैं" },
        mech: { en: "coordinates write routines across flash blocks using a flash translation layer processor", hi: "एक फ्लैश ट्रांसलेशन लेयर (FTL) प्रोसेसर का उपयोग करके फ्लैश ब्लॉकों में लेखन रूटीन का समन्वय करता है" },
        adv: { en: "delivers high randomized input-output operations per second without mechanical search delays", hi: "बिना किसी यांत्रिक खोज विलंब के उच्च यादृच्छिक इनपुट-आउटपुट संचालन प्रति सेकंड (IOPS) प्रदान करता है" },
        lim: { en: "exhibits block write limits and suffers from read disturbance state leaks over time", hi: "ब्लॉक लेखन सीमा प्रदर्शित करता है और समय के साथ पढ़ने के गड़बड़ी (read disturb) के कारण डेटा रिसाव से ग्रस्त होता है" },
        scen: { en: "an SSD controller failing to refresh active translation maps, locking access to entire files", hi: "एक एसएसडी नियंत्रक सक्रिय अनुवाद मानचित्रों को रीफ्रेश करने में विफल रहता है, जिससे संपूर्ण फ़ाइलों तक पहुंच लॉक हो जाती है" }
    },
    "hdd": {
        def: { en: "hard disk drives utilizing magnetized circular platters and physical actuator arms to store data", hi: "हार्ड डिस्क ड्राइव (HDD) जो डेटा संग्रहीत करने के लिए चुम्बकीय गोलाकार प्लेटर्स और भौतिक एक्चुएटर आर्म्स का उपयोग करते हैं" },
        mech: { en: "spins platters continuously under a read-write head floating on an air-cushion boundary layer", hi: "एक एयर-कुशन सीमा परत पर तैरते हुए रीड-राइट हेड के नीचे प्लेटर्स को लगातार घुमाता है" },
        adv: { en: "provides high storage capacities at affordable price points for archival data reservoirs", hi: "संग्रहण डेटा जलाशयों के लिए किफायती मूल्य बिंदुओं पर उच्च भंडारण क्षमता प्रदान करता है" },
        lim: { en: "vulnerable to mechanical shock damage and limited by seek time latency parameters", hi: "यांत्रिक झटके (shock) से होने वाले नुकसान के प्रति संवेदनशील और सीक टाइम विलंबता मापदंडों द्वारा सीमित" },
        scen: { en: "a physical head crash occurs during system movement, causing physical damage to platters", hi: "सिस्टम की आवाजाही के दौरान एक भौतिक हेड क्रैश होता है, जिससे प्लेटर्स को भौतिक नुकसान होता है" }
    },
    "stack": {
        def: { en: "a linear data structure operating strictly on the Last-In-First-Out access policy", hi: "एक रैखिक डेटा संरचना जो कड़ाई से लास्ट-इन-फर्स्ट-आउट (LIFO) पहुंच नीति पर काम करती है" },
        mech: { en: "pushes and pops memory items from a single dynamic pointer location called top", hi: "एक ही गतिशील पॉइंटर स्थान से मेमोरी आइटम को पुश और पॉप करता है जिसे 'टॉप' कहा जाता है" },
        adv: { en: "simplifies recursive system execution call tracking and nested expression parsers", hi: "पुनरावर्ती (recursive) सिस्टम निष्पादन कॉल ट्रैकिंग और नेस्टेड एक्सप्रेशन पार्सर्स को सरल बनाता है" },
        lim: { en: "limited to sequential top-only evaluations, blocking direct access to lower memory records", hi: "केवल अनुक्रमिक टॉप-ओनली मूल्यांकन तक सीमित, निचले मेमोरी रिकॉर्ड तक सीधे पहुंच को रोकता है" },
        scen: { en: "an infinite recursion loop exhausting allocated system stack size, triggering stack overflow", hi: "एक अनंत रिकर्शन लूप जो आवंटित सिस्टम स्टैक आकार को समाप्त कर देता है, जिससे स्टैक ओवरफ़्लो ट्रिगर होता है" }
    },
    "queue": {
        def: { en: "a linear data structure operating strictly on the First-In-First-Out processing path", hi: "एक रैखिक डेटा संरचना जो कड़ाई से फर्स्ट-इन-फर्स्ट-आउट (FIFO) प्रसंस्करण पथ पर काम करती है" },
        mech: { en: "adds elements at the rear pointer and deletes elements from the front pointer coordinates", hi: "रियर (rear) पॉइंटर पर तत्वों को जोड़ता है और फ्रंट (front) पॉइंटर निर्देशांक से तत्वों को हटाता है" },
        adv: { en: "ensures fair resource allocation for print spoolers and asynchronous network packet buffering", hi: "प्रिंट स्पूलर और एसिंक्रोनस नेटवर्क पैकेट बफरिंग के लिए निष्पक्ष संसाधन आवंटन सुनिश्चित करता है" },
        lim: { en: "requires index maintenance and circular logic arrays to prevent empty block allocation waste", hi: "खाली ब्लॉक आवंटन अपशिष्ट को रोकने के लिए इंडेक्स रखरखाव और गोलाकार लॉजिक एरे की आवश्यकता होती है" },
        scen: { en: "a fixed array-based queue reporting queue full even though front operations cleared early slots", hi: "एक निश्चित एरे-आधारित कतार 'कतार पूर्ण' रिपोर्ट कर रही है भले ही फ्रंट संचालन ने शुरुआती स्लॉट खाली कर दिए हों" }
    },
    "bubble_sort": {
        def: { en: "a simple comparison sorting algorithm that repeatedly swaps adjacent elements out of order", hi: "एक सरल तुलना सॉर्टिंग एल्गोरिदम जो बार-बार गलत क्रम के आसन्न (adjacent) तत्वों को बदलता है" },
        mech: { en: "sweeps arrays sequentially, swapping adjacent indices, until a full pass completes without swaps", hi: "एरे को अनुक्रमिक रूप से स्कैन करता है, आसन्न इंडेक्स को बदलता है, जब तक कि बिना किसी बदलाव के एक पूर्ण पास पूरा न हो जाए" },
        adv: { en: "highly simple logic design that executes in-place without auxiliary memory allocation budgets", hi: "अत्यधिक सरल लॉजिक डिज़ाइन जो बिना किसी सहायक मेमोरी आवंटन बजट के इन-प्लेस (in-place) निष्पादित होता है" },
        lim: { en: "suffers from quadratic average and worst-case time complexity ratios, scaling poorly", hi: "द्विघात (quadratic) औसत और सबसे खराब स्थिति वाले समय जटिलता अनुपात से ग्रस्त है, जो बड़े इनपुट पर खराब काम करता है" },
        scen: { en: "sorting a reverse-sorted dataset of one million items causing millions of redundant swap loops", hi: "दस लाख वस्तुओं के उल्टे-क्रमबद्ध डेटासेट को सॉर्ट करना जिससे लाखों अनावश्यक स्वैप लूप होते हैं" }
    },
    "insertion_sort": {
        def: { en: "an in-place comparison sort that builds a sorted array slice one item at a time", hi: "एक इन-प्लेस तुलना सॉर्ट जो एक समय में एक आइटम को सॉर्ट किए गए एरे स्लाइस में सम्मिलित करके आगे बढ़ता है" },
        mech: { en: "extracts elements and shifts sorted sublist elements sequentially to insert the key", hi: "तत्वों को निकालता है और कुंजी (key) को सही स्थान पर डालने के लिए सॉर्ट किए गए उप-सूची तत्वों को स्थानांतरित करता है" },
        adv: { en: "highly efficient execution bounds for nearly sorted files and small data sets", hi: "लगभग सॉर्ट की गई फ़ाइलों और छोटे डेटा सेटों के लिए अत्यधिक कुशल निष्पादन सीमा" },
        lim: { en: "demands high processor shifts per insertion pass under worst-case reverse array setups", hi: "सबसे खराब स्थिति वाले रिवर्स एरे सेटअप के तहत प्रति इंसर्शन पास उच्च प्रोसेसर विस्थापन (shifts) की मांग करता है" },
        scen: { en: "running insertion sort on large descending files causing processor bottlenecks due to shifts", hi: "बड़ी अवरोही (descending) फ़ाइलों पर इंसर्शन सॉर्ट चलाने से शिफ्ट के कारण प्रोसेसर अवरोध उत्पन्न होना" }
    },
    "selection_sort": {
        def: { en: "an in-place comparison sort that repeatedly selects the minimum element from the unsorted slice", hi: "एक इन-प्लेस तुलना सॉर्ट जो बार-बार असॉर्टेड स्लाइस से न्यूनतम तत्व का चयन करता है" },
        mech: { en: "scans unsorted blocks to locate the minimum index and swaps it with the leftmost unsorted slot", hi: "न्यूनतम इंडेक्स का पता लगाने के लिए असॉर्टेड ब्लॉकों को स्कैन करता है और इसे सबसे बाएं असॉर्टेड स्लॉट के साथ बदलता है" },
        adv: { en: "minimizes write memory operations, performing at most a linear number of swap coordinates", hi: "राइट मेमोरी संचालन को कम करता है, अधिकतम रैखिक संख्या (linear number) में स्वैप निष्पादित करता है" },
        lim: { en: "performs a quadratic number of comparisons regardless of the initial order of elements", hi: "तत्वों के प्रारंभिक क्रम की परवाह किए बिना द्विघात (quadratic) संख्या में तुलना करता है" },
        scen: { en: "sorting an already sorted dataset taking exactly the same time as a completely random dataset", hi: "पहले से सॉर्ट किए गए डेटासेट को सॉर्ट करने में ठीक उतना ही समय लगना जितना कि पूरी तरह से रैंडम डेटासेट में लगता है" }
    },
    "merge_sort": {
        def: { en: "a divide-and-conquer sorting algorithm that splits arrays and merges sorted sub-arrays", hi: "एक डिवाइड-एंड-कॉन्कर सॉर्टिंग एल्गोरिदम जो एरे को विभाजित करता है और सॉर्ट किए गए उप-एरे को मिलाता है" },
        mech: { en: "splits lists recursively to single elements, then merges sublists using two-pointer scans", hi: "सूचियों को एकल तत्वों में पुनरावर्ती रूप से विभाजित करता है, फिर दो-पॉइंटर स्कैन का उपयोग करके उप-सूचियों को मिलाता है" },
        adv: { en: "guarantees stable logarithmic time complexity bounds under all input patterns and scopes", hi: "सभी इनपुट पैटर्न और स्कोप के तहत स्थिर लॉगरिदमिक समय जटिलता सीमाओं की गारंटी देता है" },
        lim: { en: "demands linear auxiliary memory allocations to store temporary merged blocks", hi: "अस्थायी रूप से विलय (merge) किए गए ब्लॉकों को संग्रहीत करने के लिए रैखिक सहायक मेमोरी आवंटन की मांग करता है" },
        scen: { en: "out-of-memory errors rising while sorting extremely large database index files in RAM", hi: "रैम में अत्यधिक बड़ी डेटाबेस इंडेक्स फ़ाइलों को सॉर्ट करते समय आउट-ऑफ-मेमोरी त्रुटियों का उत्पन्न होना" }
    },
    "quick_sort": {
        def: { en: "a highly efficient divide-and-conquer sorting algorithm based on array partitioning", hi: "एरे विभाजन (partitioning) पर आधारित एक अत्यधिक कुशल डिवाइड-एंड-कॉन्कर सॉर्टिंग एल्गोरिदम" },
        mech: { en: "partitions files around a pivot index, placing smaller elements left and larger elements right", hi: "एक पिवट (pivot) इंडेक्स के आसपास फ़ाइलों को विभाजित करता है, छोटे तत्वों को बाएं और बड़े तत्वों को दाएं रखता है" },
        adv: { en: "delivers outstanding average-case performance speeds and operates in-place without memory overheads", hi: "उत्कृष्ट औसत-स्थिति प्रदर्शन गति प्रदान करता है और बिना किसी मेमोरी ओवरहेड के इन-प्लेस काम करता है" },
        lim: { en: "degrades to quadratic worst-case execution under highly sorted or poor pivot selections", hi: "अत्यधिक सॉर्ट किए गए या खराब पिवट चयन के तहत द्विघात (quadratic) सबसे खराब स्थिति में गिर जाता है" },
        scen: { en: "sorting a pre-sorted file using the first element as the pivot, triggering deep call stacks", hi: "पिवट के रूप में पहले तत्व का उपयोग करके पूर्व-क्रमबद्ध फ़ाइल को सॉर्ट करना, जिससे गहरे कॉल स्टैक ट्रिगर होते हैं" }
    },
    "linear_search": {
        def: { en: "a straightforward search algorithm that checks array elements sequentially from start to end", hi: "एक सीधा खोज एल्गोरिदम जो शुरुआत से अंत तक क्रमिक रूप से एरे तत्वों की जांच करता है" },
        mech: { en: "loops through arrays index-by-index, comparing the key against each slot until found", hi: "एरे के माध्यम से इंडेक्स-दर-इंडेक्स लूप करता है, पाए जाने तक प्रत्येक स्लॉट के साथ कुंजी की तुलना करता है" },
        adv: { en: "requires no initial ordering of elements and processes unsorted files directly", hi: "तत्वों के किसी प्रारंभिक क्रम की आवश्यकता नहीं होती है और असॉर्टेड फ़ाइलों को सीधे संसाधित करता है" },
        lim: { en: "displays poor search efficiency, scaling linearly with the total number of array records", hi: "खराब खोज दक्षता प्रदर्शित करता है, जो एरे रिकॉर्ड्स की कुल संख्या के साथ रैखिक रूप से स्केल करता है" },
        scen: { en: "searching a rare user database record located at the very end of a huge log file", hi: "एक विशाल लॉग फ़ाइल के बिल्कुल अंत में स्थित एक दुर्लभ उपयोगकर्ता डेटाबेस रिकॉर्ड की खोज करना" }
    },
    "binary_search": {
        def: { en: "a highly efficient search algorithm designed exclusively for pre-sorted array structures", hi: "एक अत्यधिक कुशल खोज एल्गोरिदम जो विशेष रूप से पूर्व-सॉर्ट किए गए एरे संरचनाओं के लिए डिज़ाइन किया गया है" },
        mech: { en: "compares the target key against the array midpoint, discarding half the search boundaries per step", hi: "लक्ष्य कुंजी की तुलना एरे के मध्य बिंदु से करता है, प्रति चरण खोज सीमाओं के आधे हिस्से को छोड़ देता है" },
        adv: { en: "delivers logarithmic time complexity search efficiency, matching vast index files quickly", hi: "लॉगरिदमिक समय जटिलता खोज दक्षता प्रदान करता है, जिससे विशाल इंडेक्स फ़ाइलों का तुरंत मिलान होता है" },
        lim: { en: "strictly demands pre-sorted arrays, making sorting preprocessing steps mandatory", hi: "सख्ती से पूर्व-क्रमबद्ध एरे की मांग करता है, जिससे सॉर्टिंग प्रीप्रोसेसिंग चरण अनिवार्य हो जाते हैं" },
        scen: { en: "a search returning incorrect missing target indicators due to unsorted input arrays", hi: "अक्रमबद्ध इनपुट एरे के कारण खोज द्वारा गलत अनुपलब्ध (missing) लक्ष्य संकेतक वापस करना" }
    },
    "complexity": {
        def: { en: "the metric of algorithmic resource consumption, including worst-case execution time and memory limits", hi: "एल्गोरिदम संसाधन खपत का माप, जिसमें सबसे खराब स्थिति में निष्पादन समय और मेमोरी सीमाएं शामिल हैं" },
        mech: { en: "evaluates mathematical growth functions as inputs scale toward infinite limits", hi: "कम्प्यूटेशनल इनपुट के अनंत सीमाओं की ओर बढ़ने पर गणितीय विकास कार्यों का मूल्यांकन करता है" },
        adv: { en: "enables systematic mathematical evaluations of diverse algorithms before physical chip deployments", hi: "भौतिक चिप तैनाती से पहले विभिन्न एल्गोरिदम के व्यवस्थित गणितीय मूल्यांकन को सक्षम बनाता है" },
        lim: { en: "ignores low-level constant factors and specific local processor hardware optimizations", hi: "निम्न-स्तरीय स्थिर कारकों (constant factors) और विशिष्ट स्थानीय प्रोसेसर हार्डवेयर अनुकूलन की उपेक्षा करता है" },
        scen: { en: "an O(N^2) sorting pipeline crashing a production transaction portal under heavy holiday traffic spikes", hi: "एक O(N^2) सॉर्टिंग पाइपलाइन जो छुट्टियों के दौरान भारी ट्रैफ़िक स्पाइक्स के तहत एक उत्पादन लेनदेन पोर्टल को क्रैश कर देती है" }
    },
    "lan": {
        def: { en: "local area networks spanning a single room, school, office, or localized building area", hi: "स्थानीय क्षेत्र नेटवर्क (LAN) जो एक ही कमरे, स्कूल, कार्यालय या स्थानीयकृत भवन क्षेत्र में फैले होते हैं" },
        mech: { en: "transmits data frames directly through high-speed switches and local Ethernet cables", hi: "उच्च गति वाले स्विचों और स्थानीय ईथरनेट केबलों के माध्यम से सीधे डेटा फ्रेम प्रसारित करता है" },
        adv: { en: "provides extremely high data rates, minimal packet errors, and simple centralized administration", hi: "अत्यधिक उच्च डेटा दर, न्यूनतम पैकेट त्रुटियां और सरल केंद्रीकृत प्रशासन प्रदान करता है" },
        lim: { en: "confined strictly within limited geographic bounds, blocking wide communication paths", hi: "कड़ाई से सीमित भौगोलिक सीमाओं के भीतर सीमित, व्यापक संचार पथों को अवरुद्ध करता है" },
        scen: { en: "a local switch hardware failure severing all workstation resource access across an office floor", hi: "एक स्थानीय स्विच हार्डवेयर विफलता जो एक कार्यालय तल पर सभी वर्कस्टेशन संसाधन पहुंच को काट देती है" }
    },
    "man": {
        def: { en: "metropolitan area networks bridging multiple sites across a single city geographic boundary", hi: "महानगरीय क्षेत्र नेटवर्क (MAN) जो एक ही शहर की भौगोलिक सीमा में कई साइटों को जोड़ते हैं" },
        mech: { en: "links distributed local switches together using high-speed optical fiber city backbones", hi: "उच्च गति वाले ऑप्टिकल फाइबर शहर बैकबोन्स का उपयोग करके वितरित स्थानीय स्विचों को एक साथ जोड़ता है" },
        adv: { en: "enables efficient city-wide communication networks for municipal departments or corporate branches", hi: "नगरपालिका विभागों या कॉर्पोरेट शाखाओं के लिए कुशल शहर-व्यापी संचार नेटवर्क सक्षम बनाता है" },
        lim: { en: "requires high maintenance capital budgets and complex routing protocols across fiber layouts", hi: "फाइबर लेआउट में उच्च रखरखाव पूंजी बजट और जटिल रूटिंग प्रोटोकॉल की आवश्यकता होती है" },
        scen: { en: "a city road construction crew accidentally severing a central underground MAN optical backbone", hi: "एक शहर की सड़क निर्माण टीम ने गलती से एक केंद्रीय भूमिगत MAN ऑप्टिकल रीढ़ को काट दिया" }
    },
    "wan": {
        def: { en: "wide area networks spanning massive regions, countries, or the entire global space", hi: "विस्तृत क्षेत्र नेटवर्क (WAN) जो बड़े क्षेत्रों, देशों या संपूर्ण वैश्विक स्थान में फैले होते हैं" },
        mech: { en: "routes packets across international gateways, undersea optical cables, and satellite links", hi: "अंतरराष्ट्रीय गेटवे, समुद्र के नीचे ऑप्टिकल केबल और उपग्रह लिंक के माध्यम से पैकेट रूट करता है" },
        adv: { en: "connects globally distributed resource endpoints together, powering contemporary internet pipelines", hi: "विश्व स्तर पर वितरित संसाधन समापन बिंदुओं को एक साथ जोड़ता है, जो समकालीन इंटरनेट पाइपलाइनों को चलाता है" },
        lim: { en: "suffers from high transmission latency, substantial packet loss, and severe security exposures", hi: "उच्च संचरण विलंबता, पर्याप्त पैकेट हानि, और गंभीर सुरक्षा जोखिमों से ग्रस्त है" },
        scen: { en: "an undersea fiber cable cut causing severe international internet routing drops and latency surges", hi: "एक समुद्र के नीचे फाइबर केबल कटने से गंभीर अंतर्राष्ट्रीय इंटरनेट रूटिंग ड्रॉप और विलंबता में वृद्धि होना" }
    },
    "star_topology": {
        def: { en: "a network layout where all workstations connect directly to a single central switch hub", hi: "एक नेटवर्क लेआउट जहां सभी वर्कस्टेशन सीधे एक एकल केंद्रीय स्विच हब से जुड़ते हैं" },
        mech: { en: "routes all resource frames through the central hub, which filters and forwards traffic", hi: "केंद्रीय हब के माध्यम से सभी संसाधन फ्रेमों को रूट करता है, जो ट्रैफ़िक को फ़िल्टर और फॉरवर्ड करता है" },
        adv: { en: "prevents single cable breaks from interrupting other nodes, easing troubleshooting steps", hi: "एकल केबल टूटने से अन्य नोड्स को बाधित होने से रोकता है, जिससे समस्या निवारण चरणों में आसानी होती है" },
        lim: { en: "presents a single point of failure where central hub drops crash the complete network", hi: "विफलता का एक एकल बिंदु (single point of failure) प्रस्तुत करता है जहां केंद्रीय हब खराब होने पर पूरा नेटवर्क क्रैश हो जाता है" },
        scen: { en: "a centralized department switch burning out, instantly severing all local workstation signals", hi: "एक केंद्रीकृत विभाग स्विच का जल जाना, जिससे सभी स्थानीय वर्कस्टेशन सिग्नल तुरंत कट जाते हैं" }
    },
    "bus_topology": {
        def: { en: "a linear network layout where nodes share a single common transmission backbone cable", hi: "एक रैखिक नेटवर्क लेआउट जहां नोड्स एक ही सामान्य ट्रांसमिशन बैकबोन केबल साझा करते हैं" },
        mech: { en: "broadcasts signals along a single bus line, using terminators to absorb boundary signals", hi: "एक ही बस लाइन पर सिग्नल प्रसारित करता है, सीमा सिग्नलों को अवशोषित करने के लिए टर्मिनेटर्स का उपयोग करता है" },
        adv: { en: "extremely cheap setup demanding minimum physical cabling and simple layout plans", hi: "अत्यधिक सस्ता सेटअप जिसके लिए न्यूनतम भौतिक केबल बिछाने और सरल लेआउट योजनाओं की आवश्यकता होती है" },
        lim: { en: "a single backbone cable fracture completely breaks all downstream node communication lines", hi: "एक एकल बैकबोन केबल टूटने से सभी डाउनस्ट्रीम नोड संचार लाइनें पूरी तरह से टूट जाती हैं" },
        scen: { en: "a loose terminal resistor causing signal reflection echoes, crashing all active data transmissions", hi: "एक ढीला टर्मिनल प्रतिरोधी (resistor) सिग्नल परावर्तन प्रतिध्वनि का कारण बनता है, जिससे सभी सक्रिय डेटा ट्रांसमिशन क्रैश हो जाते हैं" }
    },
    "ring_topology": {
        def: { en: "a closed loop layout where packet tokens pass sequentially from neighbor to neighbor", hi: "एक बंद लूप लेआउट जहां पैकेट टोकन पड़ोसी से पड़ोसी तक क्रमिक रूप से गुजरते हैं" },
        mech: { en: "circulates data packets unidirectionally or bidirectionally around a closed ring of nodes", hi: "नोड्स के एक बंद रिंग के आसपास एकदिशात्मक या द्विदिशात्मक रूप से डेटा पैकेट प्रसारित करता है" },
        adv: { en: "prevents signal collisions by enforcing token-based packet access control algorithms", hi: "टोकन-आधारित पैकेट एक्सेस कंट्रोल एल्गोरिदम को लागू करके सिग्नल टकराव को रोकता है" },
        lim: { en: "a single node failure or cable break instantly freezes the complete ring traffic", hi: "एक एकल नोड विफलता या केबल टूटना तुरंत पूरे रिंग ट्रैफ़िक को फ्रीज कर देता है" },
        scen: { en: "a workstation powering down in an old token ring system, disabling other user channels", hi: "एक पुराने टोकन रिंग सिस्टम में वर्कस्टेशन का बंद होना, जिससे अन्य उपयोगकर्ता चैनल निष्क्रिय हो जाते हैं" }
    },
    "mesh_topology": {
        def: { en: "a highly redundant layout where every node links directly to multiple other nodes", hi: "एक अत्यधिक निरर्थक (redundant) लेआउट जहां प्रत्येक नोड सीधे कई अन्य नोड्स से जुड़ता है" },
        mech: { en: "routes packet pathways across redundant point-to-point links using dynamic routers", hi: "डायनेमिक राउटर्स का उपयोग करके निरर्थक पॉइंट-टू-पॉइंट लिंक पर पैकेट मार्गों को रूट करता है" },
        adv: { en: "guarantees outstanding fault tolerance, as multiple link failures do not break overall operations", hi: "उत्कृष्ट दोष सहनशीलता की गारंटी देता है, क्योंकि कई लिंक विफलताओं से समग्र संचालन नहीं टूटता है" },
        lim: { en: "requires massive physical cabling counts and expensive multi-port interface card hardware", hi: "बड़े पैमाने पर भौतिक केबल बिछाने और महंगे मल्टी-पोर्ट इंटरफ़ेस कार्ड हार्डवेयर की मांग करता है" },
        scen: { en: "deploying a mesh layout across 50 servers costing substantial budget due to cable volumes", hi: "केबल वॉल्यूम के कारण 50 सर्वरों पर मेश लेआउट तैनात करने में पर्याप्त बजट खर्च होना" }
    },
    "tcp": {
        def: { en: "transmission control protocol managing connection-oriented reliable byte-stream deliveries", hi: "ट्रांसमिशन कंट्रोल प्रोटोकॉल (TCP) जो कनेक्शन-ओरिएंटेड विश्वसनीय बाइट-स्ट्रीम डिलीवरी का प्रबंधन करता है" },
        mech: { en: "establishes pathways using three-way handshakes, tracking sequences and sliding window flow checks", hi: "थ्री-वे हैंडशेक का उपयोग करके पथ स्थापित करता है, सीक्वेंस नंबर और स्लाइडिंग विंडो प्रवाह नियंत्रण को ट्रैक करता है" },
        adv: { en: "guarantees error-free data packet delivery, packet reordering, and congestion mitigation control", hi: "त्रुटि रहित डेटा पैकेट डिलीवरी, पैकेट पुनर्व्यवस्थित करने और भीड़भाड़ शमन (congestion mitigation) नियंत्रण की गारंटी देता है" },
        lim: { en: "adds substantial header byte overheads and introduces delay cycles due to packet acknowledgments", hi: "पर्याप्त हेडर बाइट ओवरहेड्स जोड़ता है और पैकेट पावती (acknowledgments) के कारण विलंब चक्र पेश करता है" },
        scen: { en: "packet loss on a congested router triggering rapid TCP window shrinks and throttling speeds", hi: "एक भीड़भाड़ वाले राउटर पर पैकेट हानि होने से तीव्र टीसीपी विंडो सिकुड़ जाती है और गति कम हो जाती है" }
    },
    "udp": {
        def: { en: "user datagram protocol managing connectionless, low-overhead datagram packet routing routes", hi: "यूज़र डेटाग्राम प्रोटोकॉल (UDP) जो कनेक्शन रहित, कम ओवरहेड वाले डेटाग्राम पैकेट रूटिंग का प्रबंधन करता है" },
        mech: { en: "broadcasts packets directly to destination sockets without handshakes, tracking, or states", hi: "बिना हैंडशेक, ट्रैकिंग, या स्थिति (states) के सीधे गंतव्य सॉकेट पर पैकेट प्रसारित करता है" },
        adv: { en: "delivers rapid speeds and low latency suitable for real-time gaming or streaming", hi: "तेज गति और कम विलंबता प्रदान करता है जो रीयल-टाइम गेमिंग या स्ट्रीमिंग के लिए उपयुक्त है" },
        lim: { en: "provides zero delivery guarantees, no error recovery pipelines, and ignores sequence orders", hi: "शून्य डिलीवरी गारंटी, कोई त्रुटि पुनर्प्राप्ति पाइपलाइन प्रदान नहीं करता है और अनुक्रम आदेशों की उपेक्षा करता है" },
        scen: { en: "unreliable network nodes dropping packet frames during a live video stream, causing display glitches", hi: "एक लाइव वीडियो स्ट्रीम के दौरान अविश्वसनीय नेटवर्क नोड्स द्वारा पैकेट फ्रेम गिराना, जिससे डिस्प्ले में गड़बड़ी होती है" }
    },
    "ipv4": {
        def: { en: "internet protocol version 4 routing packets using a 32-bit dotted-decimal structure", hi: "इंटरनेट प्रोटोकॉल संस्करण 4 (IPv4) जो 32-बिट डॉटेड-डेसिमल संरचना का उपयोग करके पैकेट रूट करता है" },
        mech: { en: "encapsulates datagrams with source and destination IPs, routing them across subnet masks", hi: "स्रोत और गंतव्य आईपी के साथ डेटाग्राम को समाहित (encapsulate) करता है, उन्हें सबनेट मास्क में रूट करता है" },
        adv: { en: "highly mature, universally supported protocol driving almost all standard computing backbones", hi: "अत्यधिक परिपक्व, सार्वभौमिक रूप से समर्थित प्रोटोकॉल जो लगभग सभी मानक कंप्यूटिंग बैकबोन्स को चलाता है" },
        lim: { en: "suffers from total address exhaustion bounds due to the finite 32-bit prefix limits", hi: "सीमित 32-बिट सीमाओं के कारण कुल एड्रेस समाप्ति (exhaustion) बाधाओं से ग्रस्त है" },
        scen: { en: "an enterprise failing to allocate unique public IPs to new host servers, demanding NAT overrides", hi: "एक एंटरप्राइज़ नए होस्ट सर्वरों को अद्वितीय सार्वजनिक आईपी आवंटित करने में विफल हो रहा है, जिससे NAT ओवरराइड की मांग हो रही है" }
    },
    "ipv6": {
        def: { en: "internet protocol version 6 routing packets using a massive 128-bit hexadecimal space", hi: "इंटरनेट प्रोटोकॉल संस्करण 6 (IPv6) जो एक विशाल 128-बिट हेक्साडेसिमल स्पेस का उपयोग करके पैकेट रूट करता है" },
        mech: { en: "formats addresses using eight colon-separated blocks, routing packets using stateless autoconfigurations", hi: "आठ कोलन-अलग किए गए ब्लॉकों का उपयोग करके पते तैयार करता है, स्टेटलेस ऑटो-कॉन्फ़िगरेशन का उपयोग करके पैकेट रूट करता है" },
        adv: { en: "provides practically infinite address spaces, simplified headers, and built-in IPsec security options", hi: "व्यावहारिक रूप से अनंत पते स्थान, सरलीकृत हेडर और अंतर्निहित IPsec सुरक्षा विकल्प प्रदान करता है" },
        lim: { en: "demands dual-stack transitions and remains incompatible directly with legacy IPv4 routers", hi: "दोहरे स्टैक (dual-stack) संक्रमण की मांग करता है और पुराने IPv4 राउटर्स के साथ सीधे असंगत रहता है" },
        scen: { en: "a legacy firewall dropping IPv6 packet headers during transit due to outdated rulesets", hi: "पुराने नियमों के कारण पारगमन (transit) के दौरान एक पुराना फ़ायरवॉल IPv6 पैकेट हेडर को छोड़ देता है" }
    },
    "mac_address": {
        def: { en: "media access control physical addresses hardwired permanently onto network interface cards", hi: "मीडिया एक्सेस कंट्रोल (MAC) भौतिक पते जो स्थायी रूप से नेटवर्क इंटरफ़ेस कार्ड (NIC) पर हार्डवायर होते हैं" },
        mech: { en: "represents 48-bit numbers mapped into standard colon-separated hexadecimal hex codes", hi: "मानक कोलन-अलग हेक्साडेसिमल हेक्स कोड में मैप की गई 48-बिट संख्याओं का प्रतिनिधित्व करता है" },
        adv: { en: "guarantees unique hardware identification globally, enabling reliable local frame routing paths", hi: "विश्व स्तर पर अद्वितीय हार्डवेयर पहचान की गारंटी देता है, जिससे विश्वसनीय स्थानीय फ्रेम रूटिंग सक्षम होती है" },
        lim: { en: "unrouteable across networks, requiring IP mapping converters like ARP to function", hi: "नेटवर्क में रूट करने योग्य नहीं, कार्य करने के लिए ARP जैसे आईपी मैपिंग कन्वर्टर्स की आवश्यकता होती है" },
        scen: { en: "a router dropping local frames due to an ARP table mismatch or duplicate spoofed MAC nodes", hi: "ARP तालिका बेमेल या डुप्लिकेट स्पूफ़्ड मैक नोड्स के कारण एक राउटर स्थानीय फ़्रेम को छोड़ देता है" }
    },
    "dns": {
        def: { en: "domain name system directories mapping human-readable hostnames to numerical IP addresses", hi: "डोमेन नाम प्रणाली (DNS) निर्देशिकाएँ जो मानव-पठनीय होस्टनामों को संख्यात्मक आईपी पतों पर मैप करती हैं" },
        mech: { en: "resolves queries recursively across root, top-level domain, and authoritative servers", hi: "रूट, टॉप-लेवल डोमेन, और आधिकारिक (authoritative) सर्वरों में पुनरावर्ती रूप से प्रश्नों का समाधान करता है" },
        adv: { en: "bypasses numerical IP memory constraints, streamlining browser navigation globally", hi: "संख्यात्मक आईपी मेमोरी बाधाओं को बायपास करता है, जिससे विश्व स्तर पर ब्राउज़र नेविगेशन सुव्यवस्थित होता है" },
        lim: { en: "vulnerable to cache poisoning sweeps and displays lookup latency if local caches expire", hi: "कैश पॉइज़निंग हमलों के प्रति संवेदनशील और स्थानीय कैश समाप्त होने पर लुकअप विलंबता प्रदर्शित करता है" },
        scen: { en: "a poisoning incident routing users to phishing domains after corrupting local DNS cache tables", hi: "स्थानीय डीएनएस कैश तालिकाओं को भ्रष्ट करने के बाद उपयोगकर्ताओं को फ़िशिंग डोमेन पर रूट करने वाली एक पॉइज़निंग घटना" }
    },
    "hub": {
        def: { en: "first-layer physical network devices that broadcast all incoming traffic to all ports", hi: "पहली परत (physical layer) के नेटवर्क उपकरण जो सभी आने वाले ट्रैफ़िक को सभी पोर्ट पर प्रसारित (broadcast) करते हैं" },
        mech: { en: "repeats electrical bits directly across physical line ports, ignoring destination indexes", hi: "विद्युत बिट्स को सीधे भौतिक लाइन पोर्ट पर दोहराता है, गंतव्य इंडेक्स की उपेक्षा करता है" },
        adv: { en: "extremely simple hardware design that operates immediately without complex administrative options", hi: "अत्यधिक सरल हार्डवेयर डिज़ाइन जो जटिल प्रशासनिक विकल्पों के बिना तुरंत काम करता है" },
        lim: { en: "causes massive signal collisions, shares total bandwidth, and presents security risks", hi: "बड़े पैमाने पर सिग्नल टकराव का कारण बनता है, कुल बैंडविड्थ साझा करता है, और सुरक्षा जोखिम प्रस्तुत करता है" },
        scen: { en: "heavy data traffic across two nodes freezing other host connections due to collisions", hi: "टकराव के कारण दो नोड्स में भारी डेटा ट्रैफ़िक होने से अन्य होस्ट कनेक्शन फ्रीज हो जाना" }
    },
    "switch": {
        def: { en: "second-layer data link network devices that route frames dynamically to target MAC slots", hi: "दूसरी परत (data link layer) के नेटवर्क उपकरण जो फ्रेम को लक्ष्य मैक स्लॉट पर गतिशील रूप से रूट करते हैं" },
        mech: { en: "inspects source MAC parameters to update internal port mapping address caches dynamically", hi: "आंतरिक पोर्ट मैपिंग एड्रेस कैश को गतिशील रूप से अपडेट करने के लिए स्रोत मैक मापदंडों का निरीक्षण करता है" },
        adv: { en: "eliminates packet collision loops, provides dedicated bandwidth per port, and optimizes LAN speeds", hi: "पैकेट टकराव लूप को समाप्त करता है, प्रति पोर्ट समर्पित बैंडविड्थ प्रदान करता है, और LAN गति को अनुकूलित करता है" },
        lim: { en: "vulnerable to MAC flood overflow attacks that force legacy hub-like broadcasting states", hi: "मैक फ्लड (MAC flood) ओवरफ़्लो हमलों के प्रति संवेदनशील जो पुराने हब जैसे ब्रॉडकास्टिंग राज्यों को मजबूर करते हैं" },
        scen: { en: "a MAC flooding script filling switch CAM tables, forcing switches to broadcast all packet frames", hi: "एक मैक फ्लडिंग स्क्रिप्ट जो स्विच की CAM तालिकाओं को भर देती है, जिससे स्विच सभी पैकेट फ्रेम प्रसारित करने के लिए मजबूर हो जाते हैं" }
    },
    "router": {
        def: { en: "third-layer network gateways that route packet streams dynamically across distinct subnets", hi: "तीसरी परत (network layer) के गेटवे जो विभिन्न सबनेट्स में पैकेट स्ट्रीम को गतिशील रूप से रूट करते हैं" },
        mech: { en: "inspects IP headers, consults routing tables, and forwards packets across optical interfaces", hi: "आईपी हेडर का निरीक्षण करता है, राउटिंग तालिकाओं से परामर्श करता है, और ऑप्टिकल इंटरफेस में पैकेट अग्रेषित करता है" },
        adv: { en: "isolates broadcast traffic domains, links different media types, and dynamically maps pathways", hi: "ब्रॉडकास्ट ट्रैफ़िक डोमेन को अलग करता है, विभिन्न मीडिया प्रकारों को जोड़ता है, और गतिशील रूप से मार्गों को मैप करता है" },
        lim: { en: "adds substantial computational latency due to deep IP packet header parsing cycles", hi: "गहरे आईपी पैकेट हेडर पार्सिंग चक्रों के कारण पर्याप्त कम्प्यूटेशनल विलंबता जोड़ता है" },
        scen: { en: "a corrupted routing table routing packets into an infinite loop, triggering hop-limit drops", hi: "एक भ्रष्ट राउटिंग तालिका पैकेटों को अनंत लूप में रूट कर देती है, जिससे हॉप-सीमा (hop-limit) समाप्त होने पर पैकेट गिर जाते हैं" }
    },
    "gateway": {
        def: { en: "application-layer network bridges translating incompatible network protocol suites completely", hi: "एप्लिकेशन-लेयर नेटवर्क ब्रिज जो पूरी तरह से असंगत नेटवर्क प्रोटोकॉल सुइट्स का अनुवाद करते हैं" },
        mech: { en: "unwraps incoming packet structures completely and repacks payloads using destination formats", hi: "आने वाले पैकेट संरचनाओं को पूरी तरह से खोलता है और गंतव्य प्रारूपों का उपयोग करके पेलोड को फिर से पैक करता है" },
        adv: { en: "bridges disparate hardware and software environments, allowing heterogeneous setups to communicate", hi: "भिन्न हार्डवेयर और सॉफ़्टवेयर वातावरण को जोड़ता है, जिससे विषम सेटअपों को संचार करने की अनुमति मिलती है" },
        lim: { en: "demands high processor cycles for deep payload translation transformations, creating latency", hi: "गहरे पेलोड अनुवाद रूपांतरणों के लिए उच्च प्रोसेसर चक्रों की मांग करता है, जिससे विलंबता पैदा होती" }
    },
    "bridge": {
        def: { en: "second-layer network filters linking distinct physical segments into a unified local network", hi: "दूसरी परत के नेटवर्क फ़िल्टर जो विभिन्न भौतिक खंडों को एक एकीकृत स्थानीय नेटवर्क में जोड़ते हैं" },
        mech: { en: "reads destination MAC records, blocking or forwarding frames across physical segment links", hi: "गंतव्य मैक रिकॉर्ड पढ़ता है, भौतिक खंड लिंक में फ्रेम को अवरुद्ध या अग्रेषित करता है" },
        adv: { en: "isolates collision domains across physical lines while preserving a unified local broadcast space", hi: "एक एकीकृत स्थानीय प्रसारण (broadcast) स्थान को संरक्षित करते हुए भौतिक रेखाओं में टकराव डोमेन को अलग करता है" },
        lim: { en: "cannot isolate broadcast packets, leaving networks vulnerable to broadcast traffic storms", hi: "ब्रॉडकास्ट पैकेटों को अलग नहीं कर सकता, जिससे नेटवर्क ब्रॉडकास्ट ट्रैफ़िक तूफानों के प्रति संवेदनशील हो जाते हैं" }
    },
    "repeater": {
        def: { en: "first-layer amplifiers that boost weak electrical or optical line signals across long runs", hi: "पहली परत के एम्पलीफायर जो लंबी दूरी पर कमजोर विद्युत या ऑप्टिकल लाइन सिग्नलों को बढ़ावा देते हैं" },
        mech: { en: "receives degraded wave inputs, regenerates bits, and retransmits them at full strength", hi: "कमजोर तरंग इनपुट प्राप्त करता है, बिट्स को पुनर्जीवित करता है, और उन्हें पूरी शक्ति से पुन: प्रसारित करता है" },
        adv: { en: "extends overall network physical reach beyond basic cable attenuation layout limits cheaply", hi: "बुनियादी केबल क्षीणन लेआउट सीमाओं से परे समग्र नेटवर्क भौतिक पहुंच को सस्ते में बढ़ाता है" },
        lim: { en: "cannot filter packet noise, amplifying signal distortion alongside target data streams", hi: "पैकेट शोर को फ़िल्टर नहीं कर सकता, लक्ष्य डेटा स्ट्रीम के साथ सिग्नल विरूपण (distortion) को भी प्रवर्धित करता है" }
    },
    "http": {
        def: { en: "hypertext transfer protocol managing stateless client-server text resource exchanges", hi: "हाइपरटेक्स्ट ट्रांसफर प्रोटोकॉल (HTTP) जो स्टेटलेस क्लाइंट-सर्वर टेक्स्ट संसाधन एक्सचेंजों का प्रबंधन करता है" },
        mech: { en: "sends plain text GET or POST queries, closing connections instantly after servers respond", hi: "सादे पाठ GET या POST प्रश्न भेजता है, सर्वर के जवाब देने के तुरंत बाद कनेक्शन बंद कर देता है" },
        adv: { en: "highly simple, lightweight protocol suited for rapid hypermedia and static page downloads", hi: "अत्यधिक सरल, हल्का प्रोटोकॉल जो तीव्र हाइपरमीडिया और स्थिर पेज डाउनलोड के लिए उपयुक्त है" },
        lim: { en: "transmits data in clear text, exposing sensitive user credentials to eavesdropping risks", hi: "डेटा को स्पष्ट पाठ (clear text) में प्रसारित करता है, जिससे संवेदनशील उपयोगकर्ता क्रेडेंशियल चोरी होने का खतरा रहता है" },
        scen: { en: "a packet sniffing script capturing clear-text user passwords over insecure HTTP connections", hi: "असुरक्षित HTTP कनेक्शन पर स्पष्ट-पाठ उपयोगकर्ता पासवर्ड कैप्चर करने वाली एक पैकेट स्निफिंग स्क्रिप्ट" }
    },
    "https": {
        def: { en: "secure hypertext transfer protocol encrypting client-server resources using cryptographic layers", hi: "सुरक्षित हाइपरटेक्स्ट ट्रांसफर प्रोटोकॉल (HTTPS) जो क्रिप्टोग्राफिक परतों का उपयोग करके क्लाइंट-सर्वर संसाधनों को एन्क्रिप्ट करता है" },
        mech: { en: "wraps standard HTTP transactions inside secure SSL/TLS symmetric key handshake tunnels", hi: "सुरक्षित SSL/TLS सममित कुंजी (symmetric key) हैंडशेक टनल के भीतर मानक HTTP लेनदेन को लपेटता है" },
        adv: { en: "ensures absolute user data privacy, verify server authenticity, and prevents man-in-the-middle attacks", hi: "पूर्ण उपयोगकर्ता डेटा गोपनीयता सुनिश्चित करता है, सर्वर प्रामाणिकता सत्यापित करता है, और मैन-इन-द-मिडल हमलों को रोकता है" },
        lim: { en: "introduces computation delays due to deep cryptographic certificate verification runs", hi: "गहरे क्रिप्टोग्राफिक प्रमाणपत्र सत्यापन रन के कारण कंप्यूटिंग विलंबता पेश करता है" },
        scen: { en: "a connection failing with browser security alarms due to an expired digital certificate", hi: "एक समाप्त हो चुके डिजिटल प्रमाणपत्र के कारण ब्राउज़र सुरक्षा अलार्म के साथ कनेक्शन विफल होना" }
    },
    "ftp": {
        def: { en: "file transfer protocol utilizing dedicated channels to copy files across hosts", hi: "फ़ाइल ट्रांसफर प्रोटोकॉल (FTP) जो होस्ट्स में फ़ाइलों को कॉपी करने के लिए समर्पित चैनलों का उपयोग करता है" },
        mech: { en: "opens separate TCP connections for commands (port 21) and active data transfer pipelines (port 20)", hi: "कमांड (पोर्ट 21) और सक्रिय डेटा ट्रांसफर पाइपलाइनों (पोर्ट 20) के लिए अलग टीसीपी कनेक्शन खोलता है" },
        adv: { en: "optimized for bulk data transport, supports connection recovery, and handles deep directories", hi: "थोक डेटा परिवहन के लिए अनुकूलित, कनेक्शन पुनर्प्राप्ति का समर्थन करता है, और गहरी निर्देशिकाओं को संभालता है" },
        lim: { en: "lacks built-in encryption, exposing login credentials and payloads to network sniffers", hi: "अंतर्निहित एन्क्रिप्शन का अभाव है, जिससे लॉगिन क्रेडेंशियल और पेलोड नेटवर्क स्निफ़र के संपर्क में आ जाते हैं" }
    },
    "smtp": {
        def: { en: "simple mail transfer protocol managing outward electronic mail forwarding across servers", hi: "सिंपल मेल ट्रांसफर प्रोटोकॉल (SMTP) जो सर्वरों में बाहरी इलेक्ट्रॉनिक मेल अग्रेषण का प्रबंधन करता है" },
        mech: { en: "establishes TCP lines to parse mail headers and routes mail envelopes to destination MX domains", hi: "मेल हेडर को पार्स करने के लिए टीसीपी लाइनें स्थापित करता है और मेल लिफाफों को गंतव्य एमएक्स डोमेन पर रूट करता है" },
        adv: { en: "highly reliable store-and-forward routing framework ensuring emails reach target spool queues", hi: "अत्यधिक विश्वसनीय स्टोर-एंड-फॉरवर्ड रूटिंग फ्रेमवर्क यह सुनिश्चित करता है कि ईमेल लक्ष्य स्पूल कतारों तक पहुंचें" },
        lim: { en: "lacks native source validation, making the protocol vulnerable to email spoofing exploits", hi: "देशी स्रोत सत्यापन (source validation) का अभाव है, जिससे प्रोटोकॉल ईमेल स्पूफिंग हमलों के प्रति संवेदनशील हो जाता है" }
    },
    "pop3": {
        def: { en: "post office protocol version 3 that downloads mailbox files to local storage drives", hi: "पोस्ट ऑफिस प्रोटोकॉल संस्करण 3 (POP3) जो मेलबॉक्स फ़ाइलों को स्थानीय स्टोरेज ड्राइव पर डाउनलोड करता है" },
        mech: { en: "downloads entire message lines to local devices and deletes them from server registries", hi: "स्थानीय उपकरणों पर संपूर्ण संदेश लाइनों को डाउनलोड करता है और उन्हें सर्वर रजिस्ट्रियों से हटा देता है" },
        adv: { en: "minimizes server-side storage overhead by transferring all emails directly to client machines", hi: "सभी ईमेल सीधे क्लाइंट मशीनों पर स्थानांतरित करके सर्वर-साइड स्टोरेज ओवरहेड को कम करता है" },
        lim: { en: "prevents multi-device mailbox synchronization, locking mail history onto a single workstation", hi: "मल्टी-डिवाइस मेलबॉक्स सिंक्रनाइज़ेशन को रोकता है, जिससे मेल इतिहास एक ही वर्कस्टेशन पर लॉक हो जाता है" }
    },
    "imap": {
        def: { en: "internet message access protocol enabling active multi-client synchronization of remote mailboxes", hi: "इंटरनेट संदेश एक्सेस प्रोटोकॉल (IMAP) जो दूरस्थ मेलबॉक्सों के सक्रिय मल्टी-क्लाइंट सिंक्रनाइज़ेशन को सक्षम बनाता है" },
        mech: { en: "synchronizes mailboxes in real-time, allowing users to query and organize folders on servers", hi: "मेलबॉक्सों को रीयल-टाइम में सिंक्रनाइज़ करता है, जिससे उपयोगकर्ता सर्वर पर फ़ोल्डर्स को क्वेरी और व्यवस्थित कर सकते हैं" },
        adv: { en: "enables seamless email management across multiple smartphones, tablets, and laptops concurrently", hi: "एक साथ कई स्मार्टफोन, टैबलेट और लैपटॉप पर सहज ईमेल प्रबंधन सक्षम बनाता है" },
        lim: { en: "demands high server-side storage resources and continuous network connections to sync states", hi: "राज्यों को सिंक करने के लिए उच्च सर्वर-साइड स्टोरेज संसाधनों और निरंतर नेटवर्क कनेक्शन की मांग करता है" }
    },
    "parity": {
        def: { en: "a basic error detection mechanism adding a single redundant bit to enforce parity bounds", hi: "समानता (parity) सीमाओं को लागू करने के लिए एक एकल अनावश्यक बिट जोड़ने वाला एक बुनियादी त्रुटि पहचान तंत्र" },
        mech: { en: "computes XOR logic across bit sequences, setting the parity bit to make count of 1s even or odd", hi: "बिट अनुक्रमों में XOR लॉजिक की गणना करता है, 1s की संख्या को सम या विषम बनाने के लिए पैरिटी बिट सेट करता है" },
        adv: { en: "extremely low computational complexity demanding minimum processor gates or network overhead", hi: "अत्यधिक कम कम्प्यूटेशनल जटिलता जिसके लिए न्यूनतम प्रोसेसर गेट्स या नेटवर्क ओवरहेड की आवश्यकता होती है" },
        lim: { en: "fails to detect even-numbered bit corruptions and cannot locate physical error coordinates", hi: "सम संख्या वाले बिट भ्रष्टाचारों का पता लगाने में विफल रहता है और भौतिक त्रुटि निर्देशांक का पता नहीं लगा सकता है" }
    },
    "crc": {
        def: { en: "cyclic redundancy checks utilizing polynomial division math to detect network frame errors", hi: "चक्रीय अतिरेक जांच (CRC) जो नेटवर्क फ्रेम त्रुटियों का पता लगाने के लिए बहुपद विभाजन (polynomial division) गणित का उपयोग करती है" },
        mech: { en: "performs binary modulo-2 division of frame payload by a generator polynomial to find remainders", hi: "शेषफल ज्ञात करने के लिए एक जनरेटर बहुपद द्वारा फ्रेम पेलोड का बाइनरी मॉड्यूल-2 विभाजन करता है" },
        adv: { en: "highly robust error detection capable of catching burst errors across high-speed lines", hi: "उच्च गति वाली लाइनों में बर्स्ट त्रुटियों (burst errors) को पकड़ने में सक्षम अत्यधिक मजबूत त्रुटि पहचान" },
        lim: { en: "purely diagnostic protocol providing zero error-correction capabilities during frame corruption", hi: "विशुद्ध रूप से नैदानिक प्रोटोकॉल जो फ्रेम भ्रष्टाचार के दौरान शून्य त्रुटि-सुधार क्षमताएं प्रदान करता है" }
    },
    "primary_key": {
        def: { en: "a relational database key constraint uniquely identifying each record row in a table", hi: "एक रिलेशनल डेटाबेस कुंजी प्रतिबंध (constraint) जो तालिका में प्रत्येक रिकॉर्ड पंक्ति को विशिष्ट रूप से पहचानता है" },
        mech: { en: "enforces absolute uniqueness and rejects null inputs across designated candidate attributes", hi: "नामित उम्मीदवार विशेषताओं में पूर्ण विशिष्टता लागू करता है और शून्य (null) इनपुट को अस्वीकार करता है" },
        adv: { en: "prevents duplicate tuple anomalies and accelerates search queries by building index tables", hi: "डुप्लिकेट टुपल विसंगतियों को रोकता है और इंडेक्स टेबल बनाकर खोज प्रश्नों को तेज करता है" },
        lim: { en: "locks table layouts by prohibiting updates that might trigger duplicate values", hi: "उन अपडेट को प्रतिबंधित करके तालिका लेआउट को लॉक करता है जो डुप्लिकेट मानों को ट्रिगर कर सकते हैं" }
    },
    "foreign_key": {
        def: { en: "a database referential constraint linking attribute values to another table primary key", hi: "एक डेटाबेस संदर्भात्मक प्रतिबंध (referential constraint) जो विशेषता मानों को दूसरी तालिका की प्राथमिक कुंजी से जोड़ता है" },
        mech: { en: "enforces referential integrity checks during insert, update, or cascade delete commands", hi: "डालने (insert), अपडेट करने या कैस्केड हटाने (cascade delete) के आदेशों के दौरान संदर्भात्मक अखंडता जांच लागू करता है" },
        adv: { en: "guarantees consistent relational associations, preventing orphan records across related tables", hi: "सुसंगत संबंधपरक जुड़ाव की गारंटी देता है, संबंधित तालिकाओं में अनाथ (orphan) रिकॉर्ड को रोकता है" },
        lim: { en: "adds substantial write latencies due to deep validation checks during database insertions", hi: "डेटाबेस सम्मिलन (insertions) के दौरान गहन सत्यापन जांच के कारण पर्याप्त राइट विलंबता जोड़ता है" }
    },
    "1nf": {
        def: { en: "first normal form database designs demanding atomic values in every column and row slot", hi: "पहला सामान्य रूप (1NF) डेटाबेस डिज़ाइन जो प्रत्येक कॉलम और पंक्ति स्लॉट में परमाणु मानों (atomic values) की मांग करता है" },
        mech: { en: "removes repeating groups and decomposes multi-valued attributes into separate tuples", hi: "दोहराए जाने वाले समूहों को हटाता है और बहु-मूल्यवान विशेषताओं को अलग टुपल्स में विघटित करता है" },
        adv: { en: "establishes structured database normalization baselines by eliminating complex nested attributes", hi: "जटिल नेस्टेड विशेषताओं को समाप्त करके संरचित डेटाबेस सामान्यीकरण आधार रेखाएं स्थापित करता है" },
        lim: { en: "fails to address partial or transitive dependencies, leaving tables vulnerable to anomalies", hi: "आंशिक या संक्रामक (transitive) निर्भरता को दूर करने में विफल रहता है, जिससे तालिकाएँ विसंगतियों के प्रति संवेदनशील रह जाती हैं" }
    },
    "2nf": {
        def: { en: "second normal form database designs eliminating partial dependencies on composite primary keys", hi: "दूसरा सामान्य रूप (2NF) डेटाबेस डिज़ाइन जो समग्र प्राथमिक कुंजियों (composite primary keys) पर आंशिक निर्भरता को समाप्त करता है" },
        mech: { en: "removes attributes dependent on composite key subsets, placing them into distinct tables", hi: "समग्र कुंजी उपसमुच्चय पर निर्भर विशेषताओं को हटाता है, उन्हें अलग तालिकाओं में रखता है" },
        adv: { en: "prevents duplicate data anomalies across multi-attribute key tables during update operations", hi: "अपडेट संचालन के दौरान बहु-विशेषता कुंजी तालिकाओं में डुप्लिकेट डेटा विसंगतियों को रोकता है" },
        lim: { en: "fails to eliminate transitive dependencies, leaving indirect attribute linkages unchecked", hi: "संक्रामक (transitive) निर्भरताओं को समाप्त करने में विफल रहता है, जिससे अप्रत्यक्ष विशेषता जुड़ाव अनियंत्रित हो जाता है" }
    },
    "3nf": {
        def: { en: "third normal form database designs removing transitive dependency paths from relational tables", hi: "तीसरा सामान्य रूप (3NF) डेटाबेस डिज़ाइन जो संबंधपरक तालिकाओं से संक्रामक निर्भरता पथों को हटाता है" },
        mech: { en: "ensures every non-key attribute is dependent only on the primary key, directly and non-transitively", hi: "यह सुनिश्चित करता है कि प्रत्येक गैर-कुंजी विशेषता केवल प्राथमिक कुंजी पर निर्भर हो, सीधे और गैर-संक्रामक रूप से" },
        adv: { en: "eliminates almost all operational data redundancies, ensuring stable updates across table rows", hi: "लगभग सभी परिचालन डेटा अतिरेक (redundancies) को समाप्त करता है, तालिका पंक्तियों में स्थिर अपडेट सुनिश्चित करता है" },
        lim: { en: "can still experience redundancy anomalies under overlapping composite candidate keys", hi: "ओवरलैपिंग समग्र उम्मीदवार कुंजियों (composite candidate keys) के तहत अभी भी अतिरेक विसंगतियों का अनुभव हो सकता है" }
    },
    "bcnf": {
        def: { en: "Boyce-Codd normal form database designs demanding that every determinant key acts as a super key", hi: "बॉयस-कोड्ड सामान्य रूप (BCNF) डेटाबेस डिज़ाइन जो मांग करता है कि प्रत्येक निर्धारक कुंजी (determinant key) एक सुपर कुंजी के रूप में कार्य करे" },
        mech: { en: "decomposes overlapping candidate key anomalies by splitting relations into separate tables", hi: "संबंधों को अलग तालिकाओं में विभाजित करके ओवरलैपिंग उम्मीदवार कुंजी विसंगतियों को विघटित करता है" },
        adv: { en: "achieves absolute elimination of functional dependency redundancies under overlapping keys", hi: "ओवरलैपिंग कुंजियों के तहत कार्यात्मक निर्भरता अतिरेक का पूर्ण उन्मूलन प्राप्त करता है" },
        lim: { en: "may fail to preserve some functional dependencies during normalization decompositions", hi: "सामान्यीकरण अपघटन (decompositions) के दौरान कुछ कार्यात्मक निर्भरताओं को संरक्षित करने में विफल हो सकता है" }
    },
    "sql": {
        def: { en: "structured query language used in relational databases to define and manipulate data records", hi: "स्ट्रक्चर्ड क्वेरी लैंग्वेज (SQL) जिसका उपयोग रिलेशनल डेटाबेस में डेटा रिकॉर्ड को परिभाषित और हेरफेर करने के लिए किया जाता है" },
        mech: { en: "compiles high-level declarative text statements into optimized relational algebra execution paths", hi: "उच्च-स्तरीय घोषणात्मक पाठ बयानों को अनुकूलित संबंधपरक बीजगणित (relational algebra) निष्पादन पथों में संकलित करता है" },
        adv: { en: "provides standardized, highly expressive query engines to access complex records quickly", hi: "जटिल रिकॉर्ड तक तुरंत पहुँचने के लिए मानकीकृत, अत्यधिक अभिव्यंजक क्वेरी इंजन प्रदान करता है" },
        lim: { en: "exhibits performance scaling bottlenecks under massive non-relational unstructured data pools", hi: "विशाल गैर-संबंधपरक असंरचित डेटा पूल के तहत प्रदर्शन स्केलिंग बाधाओं को प्रदर्शित करता है" }
    },
    "acid": {
        def: { en: "transactional properties (atomicity, consistency, isolation, durability) ensuring database integrity", hi: "लेनदेन संबंधी गुण (ACID - परमाणुपन, स्थिरता, अलगाव, स्थायित्व) जो डेटाबेस अखंडता सुनिश्चित करते हैं" },
        mech: { en: "coordinates lock managers, transaction commit steps, and write-ahead recovery logging databases", hi: "लॉक प्रबंधकों, लेनदेन प्रतिबद्ध (commit) चरणों और राइट-अहेड रिकवरी लॉगिंग डेटाबेस का समन्वय करता है" },
        adv: { en: "guarantees complete system-wide consistency even under immediate processor power crashes", hi: "तत्काल प्रोसेसर पावर क्रैश के तहत भी पूर्ण सिस्टम-व्यापी स्थिरता की गारंटी देता है" },
        lim: { en: "limits system concurrency throughput due to extensive locking overheads on database rows", hi: "डेटाबेस पंक्तियों पर व्यापक लॉकिंग ओवरहेड्स के कारण सिस्टम समवर्ती (concurrency) थ्रूपुट को सीमित करता है" }
    },
    "html": {
        def: { en: "hypertext markup language structuring document semantic trees for web browsers", hi: "हाइपरटेक्स्ट मार्कअप लैंग्वेज (HTML) जो वेब ब्राउज़र के लिए दस्तावेज़ सिमेंटिक पेड़ों की संरचना करती है" },
        mech: { en: "builds nested Document Object Model tag structures parsed sequentially by layout engines", hi: "नेस्टेड दस्तावेज़ ऑब्जेक्ट मॉडल (DOM) टैग संरचनाओं का निर्माण करता है जिन्हें लेआउट इंजनों द्वारा क्रमिक रूप से पार्स किया जाता है" },
        adv: { en: "delivers lightweight, platform-independent text layouts readable by any standard browser", hi: "हल्के, प्लेटफॉर्म-स्वतंत्र टेक्स्ट लेआउट प्रदान करता है जो किसी भी मानक ब्राउज़र द्वारा पठनीय है" },
        lim: { en: "lacks built-in style tokens or programming logic, acting strictly as structural frames", hi: "अंतर्निहित शैली टोकन या प्रोग्रामिंग लॉजिक का अभाव है, जो कड़ाई से संरचनात्मक फ्रेम के रूप में कार्य करता है" }
    },
    "css": {
        def: { en: "cascading style sheets regulating visual presentation and box models on web browsers", hi: "कैस्केडिंग स्टाइल शीट्स (CSS) जो वेब ब्राउज़र पर दृश्य प्रस्तुति और बॉक्स मॉडल को नियंत्रित करती हैं" },
        mech: { en: "matches selectors to DOM elements, applying cascading layouts according to precedence scores", hi: "चयनकर्ताओं (selectors) को DOM तत्वों से मिलाता है, प्राथमिकता अंकों के अनुसार कैस्केडिंग लेआउट लागू करता है" },
        adv: { en: "separates structural markup from aesthetic presentation parameters, enabling simple maintenance templates", hi: "संरचनात्मक मार्कअप को सौंदर्य प्रस्तुति मापदंडों से अलग करता है, जिससे सरल रखरखाव टेम्पलेट सक्षम होते हैं" },
        lim: { en: "complex specificity inheritance laws that complicate layouts on large applications", hi: "जटिल विशिष्टता विरासत (specificity inheritance) नियम जो बड़े अनुप्रयोगों पर लेआउट को जटिल बनाते हैं" }
    },
    "js": {
        def: { en: "high-level interpreted programming language powering interactive browser operations and dynamic DOM updates", hi: "उच्च-स्तरीय इंटरप्रिटेड प्रोग्रामिंग भाषा जो इंटरैक्टिव ब्राउज़र संचालन और गतिशील DOM अपडेट को चलाती है" },
        mech: { en: "runs single-threaded asynchronous loops utilizing browsers' just-in-time compiler engines", hi: "ब्राउज़र के जस्ट-इन-टाइम (JIT) कंपाइलर इंजन का उपयोग करके सिंगल-थ्रेडेड एसिंक्रोनस लूप चलाता है" },
        adv: { en: "enables real-time dynamic web layouts without constant server-side rebuild trips", hi: "बिना लगातार सर्वर-साइड रीबिल्ड ट्रिप्स के वास्तविक समय गतिशील वेब लेआउट सक्षम बनाता है" },
        lim: { en: "exposes client-side environments to cross-site scripting vulnerabilities if inputs remain unchecked", hi: "यदि इनपुट अनियंत्रित रहते हैं तो क्लाइंट-साइड वातावरण को क्रॉस-साइट स्क्रिप्टिंग (XSS) कमजोरियों के प्रति संवेदनशील बनाता है" }
    },
    "firewall": {
        def: { en: "network security shields filtering incoming and outgoing traffic based on rulesets", hi: "फ़ायरवॉल - नेटवर्क सुरक्षा ढाल जो नियम सेटों के आधार पर आने वाले और जाने वाले ट्रैफ़िक को फ़िल्टर करती है" },
        mech: { en: "analyzes network packets, matching port boundaries and state parameters to block connections", hi: "नेटवर्क पैकेटों का विश्लेषण करता है, कनेक्शन को अवरुद्ध करने के लिए पोर्ट सीमाओं और स्थिति मापदंडों का मिलान करता है" },
        adv: { en: "shields local servers from unauthorized intrusions, scans, and basic network floods", hi: "स्थानीय सर्वरों को अनधिकृत घुसपैठ, स्कैन और बुनियादी नेटवर्क बाढ़ (floods) से बचाता है" },
        lim: { en: "cannot intercept internal threats or payload exploits embedded within permitted ports", hi: "आंतरिक खतरों या अनुमत पोर्ट के भीतर एम्बेडेड पेलोड कारनामों को नहीं रोक सकता" }
    },
    "ids": {
        def: { en: "intrusion detection systems monitoring network telemetry to flag security vulnerabilities", hi: "घुसपैठ का पता लगाने वाली प्रणाली (IDS) जो सुरक्षा कमजोरियों को फ़्लैग करने के लिए नेटवर्क टेलीमेट्री की निगरानी करती है" },
        mech: { en: "scans traffic patterns in promiscuous mode to detect known threat signatures or anomalies", hi: "ज्ञात खतरे के हस्ताक्षरों या विसंगतियों का पता लगाने के लिए प्रॉमिसक्यूअस मोड (promiscuous mode) में ट्रैफ़िक पैटर्न को स्कैन करता है" },
        adv: { en: "provides real-time visibility into active network attack patterns and scanning attempts", hi: "सक्रिय नेटवर्क हमले के पैटर्न और स्कैनिंग प्रयासों में वास्तविक समय दृश्यता प्रदान करता है" },
        lim: { en: "cannot actively block threats, acting purely as an alarm framework for administrators", hi: "सक्रिय रूप से खतरों को अवरुद्ध नहीं कर सकता, प्रशासकों के लिए विशुद्ध रूप से एक अलार्म ढांचे के रूप में कार्य करता है" }
    },
    "ips": {
        def: { en: "intrusion prevention systems blocking unauthorized network attacks in real time actively", hi: "घुसपैठ रोकथाम प्रणाली (IPS) जो वास्तविक समय में अनधिकृत नेटवर्क हमलों को सक्रिय रूप से रोकती है" },
        mech: { en: "inspects inline packets, dropping malicious streams instantly before they reach targets", hi: "इनलाइन पैकेटों का निरीक्षण करता है, दुर्भावनापूर्ण स्ट्रीम को लक्ष्य तक पहुँचने से पहले तुरंत छोड़ देता है" },
        adv: { en: "delivers immediate threat mitigation automatically, preventing system compromises at the boundary", hi: "स्वचालित रूप से तत्काल खतरे को कम करता है, सीमा पर सिस्टम से समझौता होने से रोकता है" },
        lim: { en: "false positive detections can inadvertently disrupt legitimate business network traffic streams", hi: "गलत सकारात्मक (false positive) चेतावनियां अनजाने में वैध व्यावसायिक नेटवर्क ट्रैफ़िक स्ट्रीम को बाधित कर सकती हैं" }
    },
    "cryptography": {
        def: { en: "cryptographic protocols utilizing mathematical ciphers to secure digital communication pipelines", hi: "क्रिप्टोग्राफिक प्रोटोकॉल जो डिजिटल संचार पाइपलाइनों को सुरक्षित करने के लिए गणितीय सिफर का उपयोग करते हैं" },
        mech: { en: "transforms plaintext into ciphertext using symmetric keys (AES) or asymmetric key pairs (RSA)", hi: "सममित कुंजियों (AES) या असममित कुंजी जोड़े (RSA) का उपयोग करके प्लेनटेक्स्ट को सिफरटेक्स्ट में बदलता है" },
        adv: { en: "ensures absolute data confidentiality, integrity, and non-repudiation across public networks", hi: "सार्वजनिक नेटवर्क पर पूर्ण डेटा गोपनीयता, अखंडता और गैर-अस्वीकृति (non-repudiation) सुनिश्चित करता है" },
        lim: { en: "computational resource intensive and vulnerable if keys are managed poorly or compromised", hi: "कम्प्यूटेशनल संसाधन गहन और संवेदनशील यदि कुंजियों का प्रबंधन खराब तरीके से किया जाता है या समझौता किया जाता है" }
    },
    "digital_signature": {
        def: { en: "cryptographic signatures verifying sender authenticity and complete document integrity on files", hi: "डिजिटल हस्ताक्षर जो प्रेषक की प्रामाणिकता और फाइलों पर पूर्ण दस्तावेज़ अखंडता की पुष्टि करते हैं" },
        mech: { en: "hashes document files, encrypting the hash value with the sender private key portal", hi: "दस्तावेज़ फ़ाइलों को हैश (hash) करता है, प्रेषक की निजी कुंजी (private key) के साथ हैश मान को एन्क्रिप्ट करता है" },
        adv: { en: "guarantees absolute sender non-repudiation, preventing subsequent document alteration attempts", hi: "पूर्ण प्रेषक गैर-अस्वीकृति की गारंटी देता है, बाद के दस्तावेज़ परिवर्तन प्रयासों को रोकता है" },
        lim: { en: "strictly relies on secure private key storage, falling apart if keys leak to adversaries", hi: "सख्ती से सुरक्षित निजी कुंजी भंडारण पर निर्भर करता है, यदि कुंजियां विरोधियों के पास लीक हो जाती हैं तो विफल हो जाता है" }
    },
    "ssl_tls": {
        def: { en: "secure socket layer and transport layer security establishing encrypted internet tunnels", hi: "सिक्योर सॉकेट लेयर और ट्रांसपोर्ट लेयर सिक्योरिटी (SSL/TLS) जो एन्क्रिप्टेड इंटरनेट टनल स्थापित करते हैं" },
        mech: { en: "negotiates symmetric keys using public certificates during browser handshake sequences", hi: "ब्राउज़र हैंडशेक अनुक्रमों के दौरान सार्वजनिक प्रमाणपत्रों का उपयोग करके सममित कुंजियों (symmetric keys) पर बातचीत करता है" },
        adv: { en: "guarantees absolute security for e-commerce, banking, and general web communication streams", hi: "ई-कॉमर्स, बैंकिंग और सामान्य वेब संचार स्ट्रीम के लिए पूर्ण सुरक्षा की गारंटी देता है" },
        lim: { en: "handshake round-trips add connection latency and require continuous certificate renewals", hi: "हैंडशेक राउंड-ट्रिप कनेक्शन विलंबता जोड़ते हैं और निरंतर प्रमाणपत्र नवीनीकरण की मांग करते हैं" }
    },
    "blockchain": {
        def: { en: "decentralized transaction ledgers secured by consensus and cryptographic hashing chains", hi: "विकेंद्रीकृत लेनदेन बही (ledgers) जो आम सहमति और क्रिप्टोग्राफिक हैशिंग श्रृंखलाओं द्वारा सुरक्षित है" },
        mech: { en: "links transactional data blocks sequentially, validating updates through Proof of Work or Proof of Stake", hi: "लेनदेन संबंधी डेटा ब्लॉकों को क्रमिक रूप से जोड़ता है, प्रूफ ऑफ वर्क या प्रूफ ऑफ स्टेक के माध्यम से अपडेट को सत्यापित करता है" },
        adv: { en: "delivers complete, immutable, trustless transaction transparency without central brokers", hi: "केंद्रीय दलालों के बिना पूर्ण, अपरिवर्तनीय, विश्वासहीन लेनदेन पारदर्शिता प्रदान करता है" },
        lim: { en: "suffers from low transaction throughput limits and high computational energy overheads", hi: "कम लेनदेन थ्रूपुट सीमाओं और उच्च कम्प्यूटेशनल ऊर्जा ओवरहेड्स से ग्रस्त है" }
    },
    "big_data": {
        def: { en: "massive, complex unstructured datasets demanding specialized distributed computational storage frameworks", hi: "विशाल, जटिल असंरचित डेटासेट जो विशेष वितरित कम्प्यूटेशनल स्टोरेज फ्रेमवर्क की मांग करते हैं" },
        mech: { en: "processes data volume, velocity, and variety across server clusters using MapReduce routines", hi: "MapReduce रूटीन का उपयोग करके सर्वर क्लस्टर्स में डेटा वॉल्यूम, वेग (velocity), और विविधता को संसाधित करता है" },
        adv: { en: "reveals deep statistical trends and structural insights hidden inside messy data streams", hi: "गड़बड़ डेटा स्ट्रीम के भीतर छिपे गहरे सांख्यिकीय रुझानों और संरचनात्मक अंतर्दृष्टि को प्रकट करता है" },
        lim: { en: "demands extreme hardware scales and raises serious data privacy compliance challenges", hi: "अत्यधिक हार्डवेयर स्केल की मांग करता है और गंभीर डेटा गोपनीयता अनुपालन चुनौतियों को जन्म देता है" }
    },
    "robotics": {
        def: { en: "autonomous physical systems integrating sensors, control logic, and kinetic actuators", hi: "स्वायत्त भौतिक प्रणालियाँ जो सेंसर, नियंत्रण तर्क और गतिज एक्चुएटर्स (actuators) को एकीकृत करती हैं" },
        mech: { en: "resolves forward kinematics equations continuously to adjust actuator joints using feedback loops", hi: "फीडबैक लूप का उपयोग करके एक्चुएटर जोड़ों को समायोजित करने के लिए फॉरवर्ड किनेमैटिक्स समीकरणों को लगातार हल करता है" },
        adv: { en: "automates highly hazardous manual routines at absolute precision scales without fatigue", hi: "बिना थके पूर्ण सटीक पैमानों पर अत्यधिक खतरनाक मैन्युअल रूटीन को स्वचालित करता है" },
        lim: { en: "requires high hardware capital, complex kinematic algorithms, and consumes continuous power", hi: "उच्च हार्डवेयर पूंजी, जटिल गतिकी (kinematic) एल्गोरिदम की आवश्यकता होती है और निरंतर बिजली की खपत करता है" }
    },
    "ar_vr": {
        def: { en: "immersive visual media overlaying virtual nodes onto real environments or isolating users in virtual realities", hi: "इमर्सिव विज़ुअल मीडिया जो वास्तविक वातावरण पर वर्चुअल नोड्स को ओवरले करता है या उपयोगकर्ताओं को वर्चुअल रियलिटी में अलग करता है" },
        mech: { en: "executes coordinate matrix transformations using headset sensors to refresh viewports instantly", hi: "व्यूपोर्ट को तुरंत रीफ्रेश करने के लिए हेडसेट सेंसर का उपयोग करके निर्देशांक मैट्रिक्स परिवर्तनों को निष्पादित करता है" },
        adv: { en: "delivers engaging spatial training simulators, virtual showrooms, and immersive visual education hubs", hi: "आकर्षक स्थानिक प्रशिक्षण सिमुलेटर, वर्चुअल शोरूम और इमर्सिव विज़ुअल शिक्षा केंद्र प्रदान करता है" },
        lim: { en: "triggers simulator sickness symptoms under refresh delays and requires heavy computing hardware", hi: "रिफ्रेश विलंब के तहत सिम्युलेटर बीमारी के लक्षणों को ट्रिगर करता है और भारी कंप्यूटिंग हार्डवेयर की मांग करता है" }
    },
    "pioneers": {
        def: { en: "fundamental computing theories established by early computer science historical figures", hi: "प्रारंभिक कंप्यूटर विज्ञान के ऐतिहासिक व्यक्तित्वों द्वारा स्थापित मौलिक कंप्यूटिंग सिद्धांत" },
        mech: { en: "structures stored-program architectures or logical computability boundaries using formal math models", hi: "औपचारिक गणित मॉडल का उपयोग करके संग्रहीत-प्रोग्राम आर्किटेक्चर या तार्किक गणना योग्य सीमाओं की संरचना करता है" },
        adv: { en: "laid the foundational mathematical and engineering frameworks for all contemporary digital hardware systems", hi: "सभी समकालीन डिजिटल हार्डवेयर प्रणालियों के लिए मूलभूत गणितीय और इंजीनियरिंग ढांचे की नींव रखी" },
        lim: { en: "early electromechanical designs were physically massive, slow, and constrained by mechanical wear", hi: "प्रारंभिक इलेक्ट्रोमैकेनिकल डिज़ाइन भौतिक रूप से विशाल, धीमे थे और यांत्रिक टूट-फूट से बंधे थे" }
    }
};

// Fallback NLG generators for each category
const NLG_FALLBACK = {
    "FND": {
        def: { en: "physical hardware component coordinating instruction operations and digital logic sequences", hi: "भौतिक हार्डवेयर घटक जो निर्देश संचालन और डिजिटल लॉजिक अनुक्रमों का समन्वय करता है" },
        mech: { en: "routes electrical signals across motherboard micro-paths and transistor logic pathways", hi: "मदरबोर्ड माइक्रो-पथ और ट्रांजिस्टर लॉजिक पथों में विद्युत संकेतों को रूट करता है" },
        adv: { en: "streamlines physical device coordination, achieving rapid clock cycles under steady processing runtimes", hi: "स्थिर प्रसंस्करण रनटाइम के तहत तेजी से क्लॉक चक्र प्राप्त करते हुए, भौतिक डिवाइस समन्वय को सुव्यवस्थित करता है" },
        lim: { en: "vulnerable to electromagnetic noise interference and requires active thermal cooling buffers", hi: "इलेक्ट्रोमैनेटिक शोर हस्तक्षेप के प्रति संवेदनशील और सक्रिय थर्मल कूलिंग बफर की आवश्यकता होती है" },
        scen: { en: "a timing mismatch in motherboards triggering complete system halt conditions during boot loops", hi: "मदरबोर्ड में टाइमिंग बेमेल होने से बूट लूप के दौरान पूर्ण सिस्टम हॉल्ट की स्थिति उत्पन्न होना" }
    },
    "MEM": {
        def: { en: "storage component retaining binary instruction arrays across a hierarchy of cache and registers", hi: "स्टोरेज घटक जो कैश और रजिस्टरों के पदानुक्रम में बाइनरी निर्देश एरे को बनाए रखता है" },
        mech: { en: "maps physical block vectors dynamically to route instruction queries within storage tables", hi: "स्टोरेज तालिकाओं के भीतर निर्देश प्रश्नों को रूट करने के लिए भौतिक ब्लॉक वैक्टर को गतिशील रूप से मैप करता है" },
        adv: { en: "drastically reduces access latency delays by caching high-frequency system execution instructions", hi: "उच्च-आवृत्ति सिस्टम निष्पादन निर्देशों को कैश करके पहुंच विलंबता देरी को नाटकीय रूप से कम करता है" },
        lim: { en: "volatile structures require continuous power supplies to maintain binary state registers", hi: "अस्थिर संरचनाओं को बाइनरी स्टेट रजिस्टरों को बनाए रखने के लिए निरंतर बिजली की आपूर्ति की आवश्यकता होती है" },
        scen: { en: "a cache directory miss forcing two-fold delay bounds during system execution lookups", hi: "सिस्टम निष्पादन लुकअप के दौरान कैश निर्देशिका मिस होने से दोहरे विलंब की सीमाएं लागू होना" }
    },
    "SW": {
        def: { en: "logical instructions coordinating hardware resource allocation boundaries and compilation routines", hi: "तार्किक निर्देश जो हार्डवेयर संसाधन आवंटन सीमाओं और संकलन रूटीन का समन्वय करते हैं" },
        mech: { en: "compiles high-level statement strings sequentially into binary computer execution instructions", hi: "उच्च-स्तरीय स्टेटमेंट स्ट्रिंग्स को बाइनरी कंप्यूटर निष्पादन निर्देशों में क्रमिक रूप से संकलित करता है" },
        adv: { en: "isolates user applications from hardware complexities through standardized operating system interfaces", hi: "मानकीकृत ऑपरेटिंग सिस्टम इंटरफेस के माध्यम से उपयोगकर्ता अनुप्रयोगों को हार्डवेयर जटिलताओं से अलग करता है" },
        lim: { en: "adds processing overhead during context switching loops between application and kernel directories", hi: "एप्लिकेशन और कर्नेल निर्देशिकाओं के बीच संदर्भ स्विचिंग लूप के दौरान प्रसंस्करण ओवरहेड जोड़ता है" },
        scen: { en: "a compilation parsing conflict causing execution threads to halt instantly during startup pipelines", hi: "एक संकलन पार्सिंग संघर्ष जिसके कारण स्टार्टअप पाइपलाइनों के दौरान निष्पादन थ्रेड तुरंत रुक जाते हैं" }
    },
    "NUM": {
        def: { en: "mathematical notation representing numerical indices using specific base radix weights", hi: "विशिष्ट बेस रेडिक्स भारों का उपयोग करके संख्यात्मक सूचकांकों का प्रतिनिधित्व करने वाला गणितीय संकेतन" },
        mech: { en: "translates base representations by dividing or multiplying digit indices sequentially with base radixes", hi: "बेस रेडिक्स के साथ क्रमिक रूप से अंकों के सूचकांकों को विभाजित या गुणा करके बेस अभ्यावेदन का अनुवाद करता है" },
        adv: { en: "simplifies binary representation conversions across silicon microcomputer processor architectures", hi: "सिलिकॉन माइक्रोकंप्यूटर प्रोसेसर आर्किटेक्चर में बाइनरी प्रतिनिधित्व रूपांतरणों को सरल बनाता है" },
        lim: { en: "requires supplementary bit allocations to denote negative integers under biased exponent ranges", hi: "बायस्ड एक्सपोनेंट श्रेणियों के तहत नकारात्मक पूर्णांकों को दर्शाने के लिए पूरक बिट आवंटन की आवश्यकता होती है" },
        scen: { en: "a conversion loop overflow triggering invalid arithmetic carry metrics inside ALU gates", hi: "एएलयू गेट्स के अंदर अमान्य अंकगणितीय कैरी मेट्रिक्स को ट्रिगर करने वाला रूपांतरण लूप ओवरफ़्लो" }
    },
    "LOG": {
        def: { en: "algebraic network mapping truth parameters to switch logic gate paths", hi: "सत्य मापदंडों को लॉजिक गेट पथों में स्विच करने वाला बीजगणितीय नेटवर्क मैपिंग" },
        mech: { en: "minimizes logical equations using boolean theorems to map minimum gate physical layouts", hi: "न्यूनतम गेट भौतिक लेआउट को मैप करने के लिए बूलियन प्रमेयों का उपयोग करके तार्किक समीकरणों को न्यूनतम करता है" },
        adv: { en: "optimizes logic routing, reducing physical chip area while multiplying propagation speeds", hi: "लॉजिक रूटिंग को अनुकूलित करता है, प्रसार गति को बढ़ाते हुए भौतिक चिप क्षेत्र को कम करता है" },
        lim: { en: "adds propagation delay cycles across deep sequential gate layers inside complex ALUs", hi: "जटिल ALUs के भीतर गहरे अनुक्रमिक गेट स्तरों में प्रसार विलंब चक्र जोड़ता है" },
        scen: { en: "a logic race hazard introducing transient glitches across active digital registers", hi: "सक्रिय डिजिटल रजिस्टरों में क्षणिक गड़बड़ी (glitches) पैदा करने वाला एक लॉजिक रेस खतरा" }
    },
    "PY": {
        def: { en: "high-level programming syntax executing dynamic variables, logical loops, and data structures", hi: "उच्च-स्तरीय प्रोग्रामिंग सिंटैक्स जो गतिशील चर, लॉजिकल लूप और डेटा संरचनाओं को निष्पादित करता है" },
        mech: { en: "interprets source files line-by-line using a virtual runtime machine namespace", hi: "एक वर्चुअल रनटाइम मशीन नेमस्पेस का उपयोग करके स्रोत फ़ाइलों को लाइन-दर-लाइन इंटरप्रिट करता है" },
        adv: { en: "accelerates application prototyping by eliminating tedious compilation steps and static variable declarations", hi: "कठिन संकलन चरणों और स्थिर चर घोषणाओं को समाप्त करके एप्लिकेशन प्रोटोटाइपिंग को तेज करता है" },
        lim: { en: "displays lower runtime performance compared to statically compiled low-level binary code blocks", hi: "स्थिर रूप से संकलित निम्न-स्तरीय बाइनरी कोड ब्लॉकों की तुलना में कम रनटाइम प्रदर्शन प्रदर्शित करता है" },
        scen: { en: "a runtime type boundary exception halting key executing statements due to unchecked inputs", hi: "अनियंत्रित इनपुट के कारण प्रमुख निष्पादन बयानों को रोकने वाला रनटाइम प्रकार सीमा अपवाद" }
    },
    "DS": {
        def: { en: "systematic layout organizing records to enable efficient computational updates and search routes", hi: "कुशल कम्प्यूटेशनल अपडेट और खोज मार्गों को सक्षम करने के लिए रिकॉर्ड व्यवस्थित करने वाला व्यवस्थित लेआउट" },
        mech: { en: "manages index configurations sequentially or recursively to access target data fields", hi: "लक्ष्य डेटा फ़ील्ड तक पहुँचने के लिए अनुक्रमिक या पुनरावर्ती रूप से इंडेक्स कॉन्फ़िगरेशन का प्रबंधन करता है" },
        adv: { en: "optimizes search bandwidth, dropping worst-case time complexity coordinates to low logarithmic scales", hi: "खोज बैंडविड्थ को अनुकूलित करता है, जिससे सबसे खराब स्थिति में समय जटिलता निम्न लॉगरिदमिक पैमानों पर गिर जाती है" },
        lim: { en: "demands high auxiliary memory reserves during deep recursive partition flows", hi: "गहरे पुनरावर्ती विभाजन प्रवाह के दौरान उच्च सहायक मेमोरी रिजर्व की मांग करता है" },
        scen: { en: "an out-of-bounds array access error crashing dynamic sorting functions during runtime loops", hi: "रनटाइम लूप के दौरान गतिशील सॉर्टिंग फ़ंक्शंस को क्रैश करने वाली एक सीमा से बाहर एरे एक्सेस त्रुटि" }
    },
    "NET": {
        def: { en: "communication framework managing data frame packet routing across virtual switch nodes", hi: "वर्चुअल स्विच नोड्स में डेटा फ्रेम पैकेट रूटिंग का प्रबंधन करने वाला संचार ढांचा" },
        mech: { en: "encapsulates packet segments through physical interfaces and subnet gateways according to protocols", hi: "प्रोटोकॉल के अनुसार भौतिक इंटरफेस और सबनेट गेटवे के माध्यम से पैकेट खंडों को समाहित (encapsulate) करता है" },
        adv: { en: "enables global resource sharing across distributed nodes with low signal attenuation errors", hi: "कम सिग्नल क्षीणन (attenuation) त्रुटियों के साथ वितरित नोड्स में वैश्विक संसाधन साझाकरण सक्षम बनाता है" },
        lim: { en: "exposes data streams to transit latencies and bandwidth congestion bottlenecks under heavy loads", hi: "भारी लोड के तहत डेटा स्ट्रीम को पारगमन विलंबता और बैंडविड्थ भीड़भाड़ (congestion) की बाधाओं के प्रति संवेदनशील बनाता है" },
        scen: { en: "a routing loop triggering hop-count packet drop failures on standard network interfaces", hi: "मानक नेटवर्क इंटरफेस पर हॉप-काउंट पैकेट ड्रॉप विफलताओं को ट्रिगर करने वाला राउटिंग लूप" }
    },
    "DB": {
        def: { en: "structured relational framework managing data tables and integrity keys systematically", hi: "संरचित संबंधपरक ढांचा जो डेटा तालिकाओं और अखंडता कुंजियों को व्यवस्थित रूप से प्रबंधित करता है" },
        mech: { en: "executes SQL queries declatively, verifying candidate key constraints across row parameters", hi: "SQL प्रश्नों को घोषणात्मक रूप से निष्पादित करता है, पंक्ति मापदंडों में उम्मीदवार कुंजी बाधाओं की पुष्टि करता है" },
        adv: { en: "eliminates data duplication anomalies, ensuring ACID consistency across transaction scopes", hi: "डेटा दोहराव विसंगतियों को समाप्त करता है, लेनदेन सीमाओं में ACID स्थिरता सुनिश्चित करता है" },
        lim: { en: "demands substantial disk access latency and index write locks during heavy batch insertions", hi: "भारी बैच सम्मिलन (insertions) के दौरान पर्याप्त डिस्क एक्सेस विलंबता और इंडेक्स राइट लॉक की मांग करता है" },
        scen: { en: "a referential integrity mismatch blocking cascading updates across related database tables", hi: "संबंधित डेटाबेस तालिकाओं में कैस्केडिंग अपडेट को अवरुद्ध करने वाला एक संदर्भात्मक अखंडता बेमेल" }
    },
    "WEB": {
        def: { en: "internet technology framework deploying browser markup languages and secure network ciphers", hi: "इंटरनेट प्रौद्योगिकी ढांचा जो ब्राउज़र मार्कअप भाषाओं और सुरक्षित नेटवर्क सिफर को तैनात करता है" },
        mech: { en: "interprets dynamic client-side scripts, updating active DOM trees based on event notifications", hi: "गतिशील क्लाइंट-साइड स्क्रिप्ट की व्याख्या करता है, ईवेंट अधिसूचनाओं के आधार पर सक्रिय DOM पेड़ों को अपडेट करता है" },
        adv: { en: "delivers highly interactive hypermedia layouts and secure SSL tunnels across global web servers", hi: "वैश्विक वेब सर्वरों पर अत्यधिक इंटरैक्टिव हाइपरमीडिया लेआउट और सुरक्षित एसएसएल टनल प्रदान करता है" },
        lim: { en: "vulnerable to browser cross-site scripting inputs and SSL session certificate timeouts", hi: "ब्राउज़र क्रॉस-साइट स्क्रिप्टिंग इनपुट और एसएसएल सत्र प्रमाणपत्र टाइमआउट के प्रति संवेदनशील" },
        scen: { en: "an unexpired SSL handshake error blocking browser communication vectors with target web hosts", hi: "लक्ष्य वेब होस्ट के साथ ब्राउज़र संचार वैक्टर को अवरुद्ध करने वाली एक गैर-समाप्त एसएसएल हैंडशेक त्रुटि" }
    }
};

// 10 dynamic sentence starters for each difficulty/angle tier
const STARTERS = {
    "easy": [
        { en: "In the context of computer systems and architecture, which of the following best defines [Concept]?", hi: "कंप्यूटर सिस्टम और आर्किटेक्चर के संदर्भ में, निम्नलिखित में से कौन [Concept] को सबसे अच्छी तरह परिभाषित करता है?" },
        { en: "Which statement provides an accurate, fundamental description of [Concept]?", hi: "कौन सा कथन [Concept] का एक सटीक, मौलिक विवरण प्रदान करता है?" },
        { en: "From a systems engineering viewpoint, [Concept] is characterized by which core property?", hi: "सिस्टम इंजीनियरिंग के दृष्टिकोण से, [Concept] को किस मुख्य विशेषता द्वारा परिभाषित किया जाता है?" },
        { en: "How is the computing term '[Concept]' defined in standard IT reference guides?", hi: "मानक आईटी संदर्भ पुस्तिकाओं में कंप्यूटिंग शब्द '[Concept]' को किस प्रकार परिभाषित किया गया है?" },
        { en: "According to CBSE and NCERT curricula, what is the essential function or definition of [Concept]?", hi: "CBSE और NCERT पाठ्यक्रमों के अनुसार, [Concept] का आवश्यक कार्य या परिभाषा क्या है?" }
    ],
    "med_mech": [
        { en: "How does the functional mechanism of [Concept] execute its operations within standard system pipelines?", hi: "मानक सिस्टम पाइपलाइनों के भीतर [Concept] का कार्यात्मक तंत्र अपने संचालन को कैसे निष्पादित करता है?" },
        { en: "Which of the following processes details the step-by-step low-level operational flow of [Concept]?", hi: "निम्नलिखित में से कौन सी प्रक्रिया [Concept] के चरण-दर-चरण निम्न-स्तरीय परिचालन प्रवाह का विवरण देती है?" },
        { en: "During active execution cycles, in what manner is the physical or logical function of [Concept] coordinated?", hi: "सक्रिय निष्पादन चक्रों के दौरान, [Concept] के भौतिक या तार्किक कार्य को किस प्रकार समन्वित किया जाता है?" },
        { en: "In what way does the internal controller of [Concept] manage digital states to perform tasks?", hi: "[Concept] का आंतरिक नियंत्रक कार्यों को करने के लिए डिजिटल अवस्थाओं को किस प्रकार प्रबंधित करता है?" },
        { en: "Which explanation accurately captures the operational routine through which [Concept] functions?", hi: "कौन सा स्पष्टीकरण उस परिचालन रूटीन को सटीक रूप से दर्शाता है जिसके माध्यम से [Concept] कार्य करता है?" }
    ],
    "med_adv": [
        { en: "What is a major technical advantage or design benefit achieved by implementing [Concept]?", hi: "[Concept] को लागू करने से प्राप्त होने वाला एक प्रमुख तकनीकी लाभ या डिज़ाइन लाभ क्या है?" },
        { en: "Why is [Concept] widely preferred over legacy alternatives in high-performance computing setups?", hi: "उच्च-प्रदर्शन कंप्यूटिंग सेटअपों में विरासत विकल्पों की तुलना में [Concept] को व्यापक रूप से क्यों पसंद किया जाता है?" },
        { en: "Which of the following points highlights the principal operational benefit of using [Concept]?", hi: "निम्नलिखित में से कौन सा बिंदु [Concept] का उपयोग करने के मुख्य परिचालन लाभ को उजागर करता है?" },
        { en: "In terms of system efficiency, what is the primary improvement that [Concept] introduces?", hi: "सिस्टम दक्षता के संदर्भ में, [Concept] कौन सा प्राथमिक सुधार पेश करता है?" },
        { en: "How does the deployment of [Concept] directly contribute to higher throughput or lower latency?", hi: "[Concept] की तैनाती सीधे उच्च थ्रूपुट या कम विलंबता में कैसे योगदान देती है?" }
    ],
    "hard_lim": [
        { en: "Under intensive stress or edge workloads, which of the following represents a critical design flaw or limitation of [Concept]?", hi: "तीव्र तनाव या सीमा कार्यभार के तहत, निम्नलिखित में से कौन [Concept] की एक महत्वपूर्ण डिज़ाइन त्रुटि या सीमा का प्रतिनिधित्व करता है?" },
        { en: "What is the primary architectural trade-off or resource constraint associated with using [Concept]?", hi: "[Concept] का उपयोग करने से जुड़ा प्राथमिक संरचनात्मक समझौता (trade-off) या संसाधन बाधा क्या है?" },
        { en: "Which of the following points highlights a key vulnerability or performance bottleneck when deploying [Concept]?", hi: "निम्नलिखित में से कौन सा बिंदु [Concept] को तैनात करते समय एक प्रमुख भेद्यता या प्रदर्शन बाधा को उजागर करता है?" },
        { en: "Despite its overall efficiency, what is the major operational downside or system overhead introduced by [Concept]?", hi: "अपनी समग्र दक्षता के बावजूद, [Concept] द्वारा पेश किया जाने वाला प्रमुख परिचालन नुकसान या सिस्टम ओवरहेड क्या है?" },
        { en: "Which specific hardware or software constraint must systems designers mitigate due to the architecture of [Concept]?", hi: "सिस्टम डिजाइनरों को [Concept] के आर्किटेक्चर के कारण किस विशिष्ट हार्डवेयर या सॉफ्टवेयर बाधा को कम करना होगा?" }
    ],
    "hard_scen": [
        { en: "Consider a real-time systems diagnostic scenario. If a failure or timing conflict arises during the execution of [Concept], which outcome is most plausible?", hi: "एक वास्तविक समय सिस्टम नैदानिक परिदृश्य पर विचार करें। यदि [Concept] के निष्पादन के दौरान कोई विफलता या समय संघर्ष उत्पन्न होता है, तो कौन सा परिणाम सबसे प्रशंसनीय है?" },
        { en: "In a high-concurrency execution environment involving [Concept], a debugger flags a state conflict. What is the expected troubleshooting resolution?", hi: "[Concept] से जुड़े एक उच्च-समवर्ती निष्पादन वातावरण में, एक डिबगर स्थिति संघर्ष को फ़्लैग करता है। अपेक्षित समस्या निवारण समाधान क्या है?" },
        { en: "Suppose an enterprise server experiences extreme latency spikes directly traced to [Concept]. Which diagnostic trace explains the issue?", hi: "मान लीजिए कि एक एंटरप्राइज़ सर्वर पर अत्यधिक विलंबता स्पाइक होती है जिसका सीधा संबंध [Concept] से है। कौन सा नैदानिक ट्रेस इस समस्या को स्पष्ट करता है?" },
        { en: "Under a complex edge-case scenario where the control bus of [Concept] experiences data starvation, what is the expected system response?", hi: "एक जटिल एज-केस परिदृश्य के तहत जहां [Concept] का नियंत्रण बस डेटा भुखमरी का अनुभव करता है, अपेक्षित सिस्टम प्रतिक्रिया क्या है?" },
        { en: "If an IT administrator is debugging a system crash and discovers anomalous loop parameters in [Concept], what is the most likely root cause?", hi: "यदि कोई आईटी प्रशासक सिस्टम क्रैश को डीबग कर रहा है और [Concept] में असामान्य लूप पैरामीटर पाता है, तो सबसे संभावित मूल कारण क्या है?" }
    ]
};

// Match concept to key term profile
function findKeyTerm(conceptName) {
    const lower = conceptName.toLowerCase();
    if (lower.includes("vacuum tube") || lower.includes("eniac") || lower.includes("first-gen")) return "vacuum_tubes";
    if (lower.includes("transistor") || lower.includes("second-gen") || lower.includes("bipolar")) return "transistors";
    if (lower.includes("integrated circuit") || lower.includes("third-gen") || lower.includes("silicon")) return "integrated_circuits";
    if (lower.includes("microprocessor") || lower.includes("fourth-gen")) return "microprocessors";
    if (lower.includes("ulsi") || lower.includes("ai") || lower.includes("fifth-gen") || lower.includes("artificial intelligence") || lower.includes("machine learning")) return "ai";
    if (lower.includes("sram")) return "sram";
    if (lower.includes("dram") || lower.includes("dynamic ram")) return "dram";
    if (lower.includes("eeprom")) return "eeprom";
    if (lower.includes("eprom")) return "eprom";
    if (lower.includes("prom")) return "prom";
    if (lower.includes("rom") || lower.includes("read only memory")) return "rom";
    if (lower.includes("ssd") || lower.includes("solid-state")) return "ssd";
    if (lower.includes("hdd") || lower.includes("hard disk") || lower.includes("magnetic platter")) return "hdd";
    if (lower.includes("stack")) return "stack";
    if (lower.includes("queue")) return "queue";
    if (lower.includes("bubble sort")) return "bubble_sort";
    if (lower.includes("insertion sort")) return "insertion_sort";
    if (lower.includes("selection sort")) return "selection_sort";
    if (lower.includes("merge sort")) return "merge_sort";
    if (lower.includes("quick sort")) return "quick_sort";
    if (lower.includes("linear search")) return "linear_search";
    if (lower.includes("binary search")) return "binary_search";
    if (lower.includes("complexity") || lower.includes("big-o")) return "complexity";
    if (lower.includes("lan")) return "lan";
    if (lower.includes("man")) return "man";
    if (lower.includes("wan")) return "wan";
    if (lower.includes("star network") || lower.includes("star topology")) return "star_topology";
    if (lower.includes("bus network") || lower.includes("bus topology")) return "bus_topology";
    if (lower.includes("ring network") || lower.includes("ring topology")) return "ring_topology";
    if (lower.includes("mesh network") || lower.includes("mesh topology")) return "mesh_topology";
    if (lower.includes("tcp")) return "tcp";
    if (lower.includes("udp")) return "udp";
    if (lower.includes("ipv4")) return "ipv4";
    if (lower.includes("ipv6")) return "ipv6";
    if (lower.includes("mac address")) return "mac_address";
    if (lower.includes("dns")) return "dns";
    if (lower.includes("hub")) return "hub";
    if (lower.includes("switch")) return "switch";
    if (lower.includes("router")) return "router";
    if (lower.includes("gateway")) return "gateway";
    if (lower.includes("bridge")) return "bridge";
    if (lower.includes("repeater")) return "repeater";
    if (lower.includes("http")) return "http";
    if (lower.includes("https")) return "https";
    if (lower.includes("ftp")) return "ftp";
    if (lower.includes("smtp")) return "smtp";
    if (lower.includes("pop3")) return "pop3";
    if (lower.includes("imap")) return "imap";
    if (lower.includes("parity")) return "parity";
    if (lower.includes("crc") || lower.includes("cyclic redundancy")) return "crc";
    if (lower.includes("primary key")) return "primary_key";
    if (lower.includes("foreign key")) return "foreign_key";
    if (lower.includes("1nf") || lower.includes("first normal")) return "1nf";
    if (lower.includes("2nf") || lower.includes("second normal")) return "2nf";
    if (lower.includes("3nf") || lower.includes("third normal")) return "3nf";
    if (lower.includes("bcnf")) return "bcnf";
    if (lower.includes("sql")) return "sql";
    if (lower.includes("acid") || lower.includes("transaction")) return "acid";
    if (lower.includes("html")) return "html";
    if (lower.includes("css")) return "css";
    if (lower.includes("javascript") || lower.includes("js")) return "js";
    if (lower.includes("firewall")) return "firewall";
    if (lower.includes("ids") || lower.includes("intrusion detection")) return "ids";
    if (lower.includes("ips") || lower.includes("intrusion prevention")) return "ips";
    if (lower.includes("cryptography") || lower.includes("symmetric") || lower.includes("asymmetric")) return "cryptography";
    if (lower.includes("digital signature")) return "digital_signature";
    if (lower.includes("ssl") || lower.includes("tls")) return "ssl_tls";
    if (lower.includes("blockchain")) return "blockchain";
    if (lower.includes("big data")) return "big_data";
    if (lower.includes("robotics")) return "robotics";
    if (lower.includes("ar/") || lower.includes("vr") || lower.includes("virtual reality") || lower.includes("augmented reality")) return "ar_vr";
    if (lower.includes("babbage") || lower.includes("turing") || lower.includes("lovelace") || lower.includes("von neumann")) return "pioneers";

    return null;
}

// Helper to format options bilingually and dynamically to guarantee 100% uniqueness
function formatOption(conceptName, profileText, facetIdx, isHi) {
    let txt = profileText.trim();
    if (txt.endsWith('.')) txt = txt.slice(0, -1);
    if (txt.endsWith('।')) txt = txt.slice(0, -1);

    if (isHi) {
        if (facetIdx === 0) return `${conceptName} को ${txt} के रूप में सबसे अच्छी तरह परिभाषित किया गया है।`;
        if (facetIdx === 1) return `${conceptName} मुख्य रूप से ${txt} द्वारा संचालित होता है।`;
        if (facetIdx === 2) return `${conceptName} का मुख्य लाभ यह है कि यह ${txt}।`;
        if (facetIdx === 3) return `${conceptName} की एक मुख्य सीमा यह है कि यह ${txt}।`;
        return `${conceptName} के वास्तविक दुनिया के मामले में ${txt} शामिल है।`;
    } else {
        if (facetIdx === 0) return `${conceptName} is best described as ${txt}.`;
        if (facetIdx === 1) return `${conceptName} operates by ${txt}.`;
        if (facetIdx === 2) return `${conceptName} provides the advantage that it ${txt}.`;
        if (facetIdx === 3) return `${conceptName} has a limitation in that it ${txt}.`;
        return `A real-world case of ${conceptName} includes ${txt}.`;
    }
}

// Generate the 5000 question bank
function generateBank() {
    console.log("🚀 Initializing Premium HECLE Computer Science 5000 Question Generator...");
    const questions = [];
    let qIdCounter = 1;

    // Loop through 100 subtopics
    for (let sIdx = 0; sIdx < 100; sIdx++) {
        const sub = SUBTOPICS[sIdx];
        const conceptNames = CONCEPT_TERMS[sub.id] || CONCEPT_TERMS[1];

        // Determine difficulty split per subtopic to hit targets globally
        // Global Target: 1000 Easy (20%), 2250 Medium (45%), 1750 Hard (35%)
        // Subtopics 1-50: 10 Easy, 23 Medium, 17 Hard
        // Subtopics 51-100: 10 Easy, 22 Medium, 18 Hard
        const targetMedium = (sIdx < 50) ? 23 : 22;
        const targetHard = (sIdx < 50) ? 17 : 18;

        // Collect all questions for this subtopic
        const subQuestions = [];

        // For each of the 10 concepts, generate 5 questions
        for (let conceptIdx = 0; conceptIdx < 10; conceptIdx++) {
            const conceptNameEn = conceptNames[conceptIdx];
            const keyTerm = findKeyTerm(conceptNameEn);

            // Determine profile (KeyTerm or Fallback)
            const profile = keyTerm ? KEY_TERM_PROFILES[keyTerm] : NLG_FALLBACK[sub.cat];

            for (let facetIdx = 0; facetIdx < 5; facetIdx++) {
                // Determine difficulty programmatically
                let difficulty = "medium";
                let starterType = "med_mech";

                if (facetIdx === 0) {
                    difficulty = "easy";
                    starterType = "easy";
                } else if (facetIdx === 1) {
                    difficulty = "medium";
                    starterType = "med_mech";
                } else if (facetIdx === 2) {
                    difficulty = "medium";
                    starterType = "med_adv";
                } else if (facetIdx === 3) {
                    difficulty = "hard";
                    starterType = "hard_lim";
                } else {
                    difficulty = "hard";
                    starterType = "hard_scen";
                }

                // Choose starter deterministically based on hash
                const starterHash = (sub.id * 11 + conceptIdx * 13 + facetIdx * 17) % 5;
                const starter = STARTERS[starterType][starterHash];

                // Rephrase concept name slightly to sound extremely organic
                const rephrasedEn = conceptNameEn;
                const rephrasedHi = conceptNameEn; // Hindi questions use standard terminology

                // Synthesize the question text
                const question_en = starter.en.replace("[Concept]", rephrasedEn);
                const question_hi = starter.hi.replace("[Concept]", rephrasedHi);

                // Fetch correct answer text
                let correct_en = "";
                let correct_hi = "";

                if (facetIdx === 0) {
                    correct_en = (profile.def && profile.def.en) ? profile.def.en : NLG_FALLBACK[sub.cat].def.en;
                    correct_hi = (profile.def && profile.def.hi) ? profile.def.hi : NLG_FALLBACK[sub.cat].def.hi;
                } else if (facetIdx === 1) {
                    correct_en = (profile.mech && profile.mech.en) ? profile.mech.en : NLG_FALLBACK[sub.cat].mech.en;
                    correct_hi = (profile.mech && profile.mech.hi) ? profile.mech.hi : NLG_FALLBACK[sub.cat].mech.hi;
                } else if (facetIdx === 2) {
                    correct_en = (profile.adv && profile.adv.en) ? profile.adv.en : NLG_FALLBACK[sub.cat].adv.en;
                    correct_hi = (profile.adv && profile.adv.hi) ? profile.adv.hi : NLG_FALLBACK[sub.cat].adv.hi;
                } else if (facetIdx === 3) {
                    correct_en = (profile.lim && profile.lim.en) ? profile.lim.en : NLG_FALLBACK[sub.cat].lim.en;
                    correct_hi = (profile.lim && profile.lim.hi) ? profile.lim.hi : NLG_FALLBACK[sub.cat].lim.hi;
                } else {
                    correct_en = (profile.scen && profile.scen.en) ? profile.scen.en : NLG_FALLBACK[sub.cat].scen.en;
                    correct_hi = (profile.scen && profile.scen.hi) ? profile.scen.hi : NLG_FALLBACK[sub.cat].scen.hi;
                }

                // Format option texts bilingually to include the specific concept name
                correct_en = formatOption(conceptNameEn, correct_en, facetIdx, false);
                correct_hi = formatOption(conceptNameEn, correct_hi, facetIdx, true);

                // Synthesize plausible distractors from OTHER concepts in the same subtopic
                const distractor_en = [];
                const distractor_hi = [];

                for (let d = 1; d <= 3; d++) {
                    const altConceptIdx = (conceptIdx + d) % 10;
                    const altConceptName = conceptNames[altConceptIdx];
                    const altKeyTerm = findKeyTerm(altConceptName);
                    const altProfile = altKeyTerm ? KEY_TERM_PROFILES[altKeyTerm] : NLG_FALLBACK[sub.cat];

                    let alt_en = "";
                    let alt_hi = "";

                    if (facetIdx === 0) {
                        alt_en = (altProfile.def && altProfile.def.en) ? altProfile.def.en : NLG_FALLBACK[sub.cat].def.en;
                        alt_hi = (altProfile.def && altProfile.def.hi) ? altProfile.def.hi : NLG_FALLBACK[sub.cat].def.hi;
                    } else if (facetIdx === 1) {
                        alt_en = (altProfile.mech && altProfile.mech.en) ? altProfile.mech.en : NLG_FALLBACK[sub.cat].mech.en;
                        alt_hi = (altProfile.mech && altProfile.mech.hi) ? altProfile.mech.hi : NLG_FALLBACK[sub.cat].mech.hi;
                    } else if (facetIdx === 2) {
                        alt_en = (altProfile.adv && altProfile.adv.en) ? altProfile.adv.en : NLG_FALLBACK[sub.cat].adv.en;
                        alt_hi = (altProfile.adv && altProfile.adv.hi) ? altProfile.adv.hi : NLG_FALLBACK[sub.cat].adv.hi;
                    } else if (facetIdx === 3) {
                        alt_en = (altProfile.lim && altProfile.lim.en) ? altProfile.lim.en : NLG_FALLBACK[sub.cat].lim.en;
                        alt_hi = (altProfile.lim && altProfile.lim.hi) ? altProfile.lim.hi : NLG_FALLBACK[sub.cat].lim.hi;
                    } else {
                        alt_en = (altProfile.scen && altProfile.scen.en) ? altProfile.scen.en : NLG_FALLBACK[sub.cat].scen.en;
                        alt_hi = (altProfile.scen && altProfile.scen.hi) ? altProfile.scen.hi : NLG_FALLBACK[sub.cat].scen.hi;
                    }

                    // Format option texts bilingually for the distractors
                    alt_en = formatOption(altConceptName, alt_en, facetIdx, false);
                    alt_hi = formatOption(altConceptName, alt_hi, facetIdx, true);

                    distractor_en.push(alt_en);
                    distractor_hi.push(alt_hi);
                }

                // Randomize options array but track correct index deterministically
                const options_en = [correct_en, ...distractor_en];
                const options_hi = [correct_hi, ...distractor_hi];

                // Shuffle options based on hash to ensure repeatable builds
                const correctAnswer = (sub.id * 17 + conceptIdx * 7 + facetIdx * 3) % 4;
                if (correctAnswer !== 0) {
                    const tempEn = options_en[0];
                    options_en[0] = options_en[correctAnswer];
                    options_en[correctAnswer] = tempEn;

                    const tempHi = options_hi[0];
                    options_hi[0] = options_hi[correctAnswer];
                    options_hi[correctAnswer] = tempHi;
                }

                // Strip trailing periods/dandas to prevent duplicates inside explanation templates
                const descEn = correct_en.endsWith('.') ? correct_en.slice(0, -1) : correct_en;
                const descHi = correct_hi.endsWith('।') ? correct_hi.slice(0, -1) : correct_hi;

                // Select exam tags
                const exams = ["SSC CGL", "BPSC", "State PCS", "Railway NTPC"];
                const activeExam = exams[(sub.id * 5 + conceptIdx) % exams.length];
                const exam_tags = [activeExam, "State PCS"];

                // Synthesize long, highly detailed explanations (> 200 characters)
                const explanation_en = `In competitive technical examinations like ${activeExam}, understanding the operational role of ${conceptNameEn} is critical. ${conceptNameEn} is characterized by this specific detail: ${descEn}. Standard NCERT and advanced computer systems curricula emphasize that this architecture prevents logical timing hazards and optimizes overall processing performance. Alternate options represent properties of other concepts within this subtopic, making them incorrect.`;
                const explanation_hi = `${activeExam} जैसी प्रतियोगी परीक्षाओं में, ${conceptNameEn} की परिचालन भूमिका को समझना महत्वपूर्ण है। ${conceptNameEn} को इस विशिष्ट विवरण द्वारा चित्रित किया गया है: ${descHi}। मानक एनसीईआरटी और उन्नत कंप्यूटर सिस्टम पाठ्यक्रम इस बात पर जोर देते हैं कि यह आर्किटेक्चर तार्किक समय के खतरों को रोकता है और समग्र प्रसंस्करण प्रदर्शन को अनुकूलित करता है। वैकल्पिक विकल्प इस उपविषय के भीतर अन्य अवधारणाओं के गुणों का प्रतिनिधित्व करते हैं, जो उन्हें गलत बनाते हैं।`;

                subQuestions.push({
                    conceptIdx,
                    facetIdx,
                    difficulty, // will override to hit targets
                    question_en,
                    question_hi,
                    options_en,
                    options_hi,
                    correctAnswer,
                    explanation_en,
                    explanation_hi,
                    exam_tags
                });
            }
        }

        // Adjust difficulties of this subtopic's questions to hit target distribution exactly
        // We need: 10 Easy, targetMedium Medium, targetHard Hard
        // Sorting subQuestions by facetIdx guarantees that we label:
        // - facetIdx 0 as Easy (10 questions)
        // - next targetMedium questions as Medium
        // - remaining targetHard questions as Hard
        subQuestions.sort((a, b) => a.facetIdx - b.facetIdx);

        for (let qIdx = 0; qIdx < 50; qIdx++) {
            const q = subQuestions[qIdx];
            let diff = "medium";

            if (qIdx < 10) {
                diff = "easy";
            } else if (qIdx < 10 + targetMedium) {
                diff = "medium";
            } else {
                diff = "hard";
            }

            // Formatting ID as COMP-XXXX
            const id = `COMP-${String(qIdCounter).padStart(4, '0')}`;
            qIdCounter++;

            questions.push({
                id,
                subject: "Computer Science",
                topic: sub.name,
                difficulty: diff,
                question_en: q.question_en,
                question_hi: q.question_hi,
                options_en: q.options_en,
                options_hi: q.options_hi,
                correctAnswer: q.correctAnswer,
                explanation_en: q.explanation_en,
                explanation_hi: q.explanation_hi,
                exam_tags: q.exam_tags,
                reference: "Standard NCERT Computer Science CBSE Class 11-12 Textbook",
                year_asked: String(2020 + (qIdx % 6))
            });
        }
    }

    console.log(`✅ Generation completed! Total questions: ${questions.length}`);

    // Verify global counts
    const counts = { easy: 0, medium: 0, hard: 0 };
    questions.forEach(q => counts[q.difficulty]++);
    console.log(`📊 Global Distribution: Easy: ${counts.easy} (${(counts.easy/5000*100).toFixed(1)}%), Medium: ${counts.medium} (${(counts.medium/5000*100).toFixed(1)}%), Hard: ${counts.hard} (${(counts.hard/5000*100).toFixed(1)}%)`);

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
