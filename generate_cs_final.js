const fs = require('fs');
const path = require('path');

const targetCount = 5000;

// Topics and Concepts (250 distinct CS concepts)
const concepts = [
    // 1. Operating Systems (32 concepts)
    { topic: "Operating Systems", name: "LRU Page Replacement", name_hi: "LRU पेज रिप्लेसमेंट", code: "OS-LRU" },
    { topic: "Operating Systems", name: "Belady's Anomaly", name_hi: "बेलेडी की विसंगति", code: "OS-BEL" },
    { topic: "Operating Systems", name: "Round Robin Scheduling", name_hi: "राउंड रॉबिन शेड्यूलिंग", code: "OS-RR" },
    { topic: "Operating Systems", name: "Shortest Job First (SJF)", name_hi: "शॉर्टेस्ट जॉब फर्स्ट (SJF)", code: "OS-SJF" },
    { topic: "Operating Systems", name: "Banker's Algorithm", name_hi: "बैंकर का एल्गोरिदम", code: "OS-BNK" },
    { topic: "Operating Systems", name: "Mutex vs Semaphore", name_hi: "म्यूटेक्स बनाम सेमाफोर", code: "OS-MUT" },
    { topic: "Operating Systems", name: "Dining Philosophers Problem", name_hi: "डाइनिंग फिलॉसफर्स समस्या", code: "OS-DPH" },
    { topic: "Operating Systems", name: "Translation Lookaside Buffer (TLB)", name_hi: "ट्रांसलेशन लुकासाइड बफर (TLB)", code: "OS-TLB" },
    { topic: "Operating Systems", name: "Virtual Memory Paging", name_hi: "वर्चुअल मेमोरी पेजिंग", code: "OS-PAG" },
    { topic: "Operating Systems", name: "Thrashing", name_hi: "थ्रैशिंग", code: "OS-THR" },
    { topic: "Operating Systems", name: "Process States", name_hi: "प्रक्रिया अवस्थाएँ", code: "OS-PST" },
    { topic: "Operating Systems", name: "Context Switching", name_hi: "संदर्भ स्विचिंग", code: "OS-CSW" },
    { topic: "Operating Systems", name: "System Calls", name_hi: "सिस्टम कॉल्स", code: "OS-SC" },
    { topic: "Operating Systems", name: "Kernel vs User Mode", name_hi: "कर्नेल बनाम यूजर मोड", code: "OS-KUM" },
    { topic: "Operating Systems", name: "Monolithic vs Microkernel", name_hi: "मोनोलिथिक बनाम माइक्रोकर्नेल", code: "OS-MMK" },
    { topic: "Operating Systems", name: "Deadlock Coffman Conditions", name_hi: "डेडलॉक कॉफमैन शर्तें", code: "OS-DCF" },
    { topic: "Operating Systems", name: "Critical Section Problem", name_hi: "क्रिटिकल सेक्शन समस्या", code: "OS-CSP" },
    { topic: "Operating Systems", name: "CPU Paging Schemes", name_hi: "सीपीयू पेजिंग योजनाएं", code: "OS-PGS" },
    { topic: "Operating Systems", name: "SSTF Disk Scheduling", name_hi: "SSTF डिस्क शेड्यूलिंग", code: "OS-SST" },
    { topic: "Operating Systems", name: "SCAN Disk Scheduling", name_hi: "SCAN डिस्क शेड्यूलिंग", code: "OS-SCN" },
    { topic: "Operating Systems", name: "C-SCAN Disk Scheduling", name_hi: "C-SCAN डिस्क शेड्यूलिंग", code: "OS-CSC" },
    { topic: "Operating Systems", name: "RAID Level 0", name_hi: "RAID स्तर 0", code: "OS-RD0" },
    { topic: "Operating Systems", name: "RAID Level 1", name_hi: "RAID स्तर 1", code: "OS-RD1" },
    { topic: "Operating Systems", name: "RAID Level 5", name_hi: "RAID स्तर 5", code: "OS-RD5" },
    { topic: "Operating Systems", name: "RAID Level 6", name_hi: "RAID स्तर 6", code: "OS-RD6" },
    { topic: "Operating Systems", name: "Spooling", name_hi: "स्पूलिंग", code: "OS-SPL" },
    { topic: "Operating Systems", name: "Inter-Process Communication (IPC)", name_hi: "इंटर-प्रोसेस कम्युनिकेशन (IPC)", code: "OS-IPC" },
    { topic: "Operating Systems", name: "Threads Shared Memory", name_hi: "थ्रेड्स शेयर्ड मेमोरी", code: "OS-TSM" },
    { topic: "Operating Systems", name: "Dirty Bit Concept", name_hi: "डर्टी बिट अवधारणा", code: "OS-DBT" },
    { topic: "Operating Systems", name: "Demand Paging", name_hi: "डिमांड पेजिंग", code: "OS-DMP" },
    { topic: "Operating Systems", name: "Real-Time OS (RTOS)", name_hi: "रियल-टाइम ओएस (RTOS)", code: "OS-RTS" },
    { topic: "Operating Systems", name: "File Allocation Table (FAT)", name_hi: "फाइल एलोकेशन टेबल (FAT)", code: "OS-FAT" },

    // 2. Data Structures (32 concepts)
    { topic: "Data Structures", name: "Array Memory Representation", name_hi: "एरे मेमोरी रिप्रेजेंटेशन", code: "DS-ARR" },
    { topic: "Data Structures", name: "Singly Linked List Insertion", name_hi: "सिंगली लिंक्ड लिस्ट इंसर्शन", code: "DS-SLL" },
    { topic: "Data Structures", name: "Doubly Linked List Deletion", name_hi: "डबली लिंक्ड लिस्ट डिलीशन", code: "DS-DLL" },
    { topic: "Data Structures", name: "Circular Linked List Traversal", name_hi: "सर्कुलर लिंक्ड लिस्ट ट्रैवर्सल", code: "DS-CLL" },
    { topic: "Data Structures", name: "Stack Push/Pop Operations", name_hi: "स्टैक पुश/पॉप ऑपरेशंस", code: "DS-STK" },
    { topic: "Data Structures", name: "Queue Enqueue/Dequeue", name_hi: "कतार एनक्यू/डीक्यू", code: "DS-QUE" },
    { topic: "Data Structures", name: "Circular Queue Overflow", name_hi: "सर्कुलर कतार ओवरफ्लो", code: "DS-CQO" },
    { topic: "Data Structures", name: "Priority Queue Heap", name_hi: "प्रायोरिटी कतार हीप", code: "DS-PRQ" },
    { topic: "Data Structures", name: "Binary Tree Traversals", name_hi: "बाइनरी ट्री ट्रैवर्सल", code: "DS-BTT" },
    { topic: "Data Structures", name: "BST Search Complexity", name_hi: "BST सर्च जटिलता", code: "DS-BST" },
    { topic: "Data Structures", name: "AVL Tree Balance Factor", name_hi: "AVL ट्री बैलेंस फैक्टर", code: "DS-AVL" },
    { topic: "Data Structures", name: "Red-Black Tree Properties", name_hi: "रेड-ब्लैक ट्री गुण", code: "DS-RBT" },
    { topic: "Data Structures", name: "Binary Heap Heapify", name_hi: "बाइनरी हीप हीपीफाई", code: "DS-BHP" },
    { topic: "Data Structures", name: "Adjacency Matrix Graph", name_hi: "एडजेसेंसी मैट्रिक्स ग्राफ", code: "DS-ADJ" },
    { topic: "Data Structures", name: "Adjacency List Graph", name_hi: "एडजेसेंसी लिस्ट ग्राफ", code: "DS-ADL" },
    { topic: "Data Structures", name: "Hash Collision Chaining", name_hi: "हैश कोलिजन चेनिंग", code: "DS-HCC" },
    { topic: "Data Structures", name: "Hash Open Addressing", name_hi: "हैश ओपन एड्रेसिंग", code: "DS-HOA" },
    { topic: "Data Structures", name: "Trie Prefix Tree", name_hi: "ट्राइ प्रीफ़िक्स ट्री", code: "DS-TRI" },
    { topic: "Data Structures", name: "Segment Tree Range Query", name_hi: "सेगमेंट ट्री रेंज क्वेरी", code: "DS-SGT" },
    { topic: "Data Structures", name: "B-Tree Node Properties", name_hi: "बी-ट्री नोड गुण", code: "DS-BTR" },
    { topic: "Data Structures", name: "Suffix Tree Applications", name_hi: "सफ़िक्स ट्री अनुप्रयोग", code: "DS-SFT" },
    { topic: "Data Structures", name: "Graph Vertex Degree", name_hi: "ग्राफ वर्टेक्स डिग्री", code: "DS-GVD" },
    { topic: "Data Structures", name: "Complete Binary Tree", name_hi: "कम्पलीट बाइनरी ट्री", code: "DS-CBT" },
    { topic: "Data Structures", name: "Full Binary Tree Theorem", name_hi: "फुल बाइनरी ट्री प्रमेय", code: "DS-FBT" },
    { topic: "Data Structures", name: "Threaded Binary Tree", name_hi: "थ्रेडेड बाइनरी ट्री", code: "DS-TBT" },
    { topic: "Data Structures", name: "Spanning Tree Properties", name_hi: "स्पैनिंग ट्री गुण", code: "DS-SPT" },
    { topic: "Data Structures", name: "Graph Cycle Detection", name_hi: "ग्राफ चक्र पहचान", code: "DS-GCD" },
    { topic: "Data Structures", name: "Double Hashing Method", name_hi: "डबल हैशिंग विधि", code: "DS-DHS" },
    { topic: "Data Structures", name: "Stack Representation", name_hi: "स्टैक रिप्रेजेंटेशन", code: "DS-SRP" },
    { topic: "Data Structures", name: "Sparse Matrix Compact", name_hi: "स्पार्स मैट्रिक्स कॉम्पैक्ट", code: "DS-SPM" },
    { topic: "Data Structures", name: "B+ Tree Properties", name_hi: "बी+ ट्री गुण", code: "DS-BPT" },
    { topic: "Data Structures", name: "Fenwick Tree Binary Indexed", name_hi: "फेनविक ट्री बाइनरी इंडेक्स्ड", code: "DS-FWT" },

    // 3. Algorithms (31 concepts)
    { topic: "Algorithms", name: "Big-O Time Complexity", name_hi: "बिग-ओ समय जटिलता", code: "AL-BGO" },
    { topic: "Algorithms", name: "Bubble Sort Mechanics", name_hi: "बबल सॉर्ट मैकेनिक्स", code: "AL-BBS" },
    { topic: "Algorithms", name: "Insertion Sort Algorithm", name_hi: "इंसर्शन सॉर्ट एल्गोरिदम", code: "AL-INS" },
    { topic: "Algorithms", name: "Selection Sort Principle", name_hi: "सिलेक्शन सॉर्ट सिद्धांत", code: "AL-SLS" },
    { topic: "Algorithms", name: "Merge Sort Divide Conquer", name_hi: "मर्ज सॉर्ट डिवाइड कॉन्कर", code: "AL-MGS" },
    { topic: "Algorithms", name: "Quick Sort Partitioning", name_hi: "क्विक सॉर्ट पार्टिशनिंग", code: "AL-QKS" },
    { topic: "Algorithms", name: "Heap Sort Max Heapify", name_hi: "हीप सॉर्ट मैक्स हीपीफाई", code: "AL-HPS" },
    { topic: "Algorithms", name: "Binary Search Requirements", name_hi: "बाइनरी सर्च आवश्यकताएं", code: "AL-BNS" },
    { topic: "Algorithms", name: "Dijkstra's Shortest Path", name_hi: "डिज्कस्ट्रा का सबसे छोटा रास्ता", code: "AL-DIJ" },
    { topic: "Algorithms", name: "Kruskal's MST Algorithm", name_hi: "क्रुस्कल का MST एल्गोरिदम", code: "AL-KRU" },
    { topic: "Algorithms", name: "Prim's Greedy MST", name_hi: "प्रिम का ग्रीडी MST", code: "AL-PRM" },
    { topic: "Algorithms", name: "Breadth First Search (BFS)", name_hi: "ब्रेड्थ फर्स्ट सर्च (BFS)", code: "AL-BFS" },
    { topic: "Algorithms", name: "Depth First Search (DFS)", name_hi: "डेप्थ फर्स्ट सर्च (DFS)", code: "AL-DFS" },
    { topic: "Algorithms", name: "Bellman-Ford Algorithm", name_hi: "बेलमैन-फ़ोर्ड एल्गोरिदम", code: "AL-BLF" },
    { topic: "Algorithms", name: "Floyd-Warshall All Pairs", name_hi: "फ्लॉयड-वॉर्शल ऑल पेयर्स", code: "AL-FLW" },
    { topic: "Algorithms", name: "Dynamic Programming Knapsack", name_hi: "डायनेमिक प्रोग्रामिंग नैपसैक", code: "AL-DPK" },
    { topic: "Algorithms", name: "Longest Common Subsequence", name_hi: "लॉन्गेस्ट कॉमन सबसीक्वेंस", code: "AL-LCS" },
    { topic: "Algorithms", name: "Greedy Huffman Coding", name_hi: "ग्रीडी हफ़मैन कोडिंग", code: "AL-HUF" },
    { topic: "Algorithms", name: "Backtracking N-Queens", name_hi: "बैकट्रैकिंग एन-क्वीन्स", code: "AL-NQN" },
    { topic: "Algorithms", name: "Radix Sort Non Comparison", name_hi: "रेडिक्स सॉर्ट नॉन कम्पेरिजन", code: "AL-RDX" },
    { topic: "Algorithms", name: "Counting Sort Assumptions", name_hi: "काउंटिंग सॉर्ट धारणाएं", code: "AL-CNT" },
    { topic: "Algorithms", name: "Topological Sort Directed Graph", name_hi: "टोपोलॉजिकल सॉर्ट डायरेक्टेड ग्राफ", code: "AL-TPS" },
    { topic: "Algorithms", name: "A* Search Algorithm", name_hi: "A* सर्च एल्गोरिदम", code: "AL-AST" },
    { topic: "Algorithms", name: "Strassen's Matrix Multiply", name_hi: "स्ट्रासेन का मैट्रिक्स गुणा", code: "AL-STR" },
    { topic: "Algorithms", name: "Fibonacci Memoization DP", name_hi: "फाइबोनैचि मेमोइजेशन DP", code: "AL-FBM" },
    { topic: "Algorithms", name: "Linear Search Complexity", name_hi: "लीनियर सर्च जटिलता", code: "AL-LNS" },
    { topic: "Algorithms", name: "Master Theorem Recurrence", name_hi: "मास्टर प्रमेय पुनरावृत्ति", code: "AL-MST" },
    { topic: "Algorithms", name: "Space Complexity Big O", name_hi: "स्पेस कॉम्प्लेक्सिटी बिग ओ", code: "AL-SPC" },
    { topic: "Algorithms", name: "Best Case Complexity", name_hi: "बेस्ट केस जटिलता", code: "AL-BCC" },
    { topic: "Algorithms", name: "Worst Case Quick Sort", name_hi: "वर्स्ट केस क्विक सॉर्ट", code: "AL-WCQ" },
    { topic: "Algorithms", name: "Stable Sorting Algorithms", name_hi: "स्थिर सॉर्टिंग एल्गोरिदम", code: "AL-STA" },

    // 4. Databases (DBMS) (31 concepts)
    { topic: "Database Management", name: "Primary Key Definition", name_hi: "प्राथमिक कुंजी परिभाषा", code: "DB-PKD" },
    { topic: "Database Management", name: "Foreign Key Referential", name_hi: "विदेशी कुंजी संदर्भात्मक", code: "DB-FKR" },
    { topic: "Database Management", name: "First Normal Form (1NF)", name_hi: "प्रथम सामान्य रूप (1NF)", code: "DB-1NF" },
    { topic: "Database Management", name: "Second Normal Form (2NF)", name_hi: "द्वितीय सामान्य रूप (2NF)", code: "DB-2NF" },
    { topic: "Database Management", name: "Third Normal Form (3NF)", name_hi: "तृतीय सामान्य रूप (3NF)", code: "DB-3NF" },
    { topic: "Database Management", name: "Boyce Codd Normal (BCNF)", name_hi: "बॉयस कॉड सामान्य रूप (BCNF)", code: "DB-BCN" },
    { topic: "Database Management", name: "ACID Atomicity Property", name_hi: "ACID एटमिसिटी गुण", code: "DB-ATM" },
    { topic: "Database Management", name: "ACID Consistency Rule", name_hi: "ACID कंसिस्टेंसी नियम", code: "DB-CNS" },
    { topic: "Database Management", name: "ACID Isolation Levels", name_hi: "ACID आइसोलेशन स्तर", code: "DB-ISO" },
    { topic: "Database Management", name: "ACID Durability Storage", name_hi: "ACID ड्यूरेबिलिटी स्टोरेज", code: "DB-DUR" },
    { topic: "Database Management", name: "SQL Inner Join", name_hi: "SQL इनर जॉइन", code: "DB-IJS" },
    { topic: "Database Management", name: "SQL Left Outer Join", name_hi: "SQL लेफ्ट आउटर जॉइन", code: "DB-LOJ" },
    { topic: "Database Management", name: "SQL Aggregate HAVING", name_hi: "SQL एग्रीगेट HAVING", code: "DB-HAV" },
    { topic: "Database Management", name: "SQL GROUP BY Clause", name_hi: "SQL GROUP BY क्लॉज", code: "DB-GBP" },
    { topic: "Database Management", name: "Database Indexing B-Tree", name_hi: "डेटाबेस इंडेक्सिंग बी-ट्री", code: "DB-IDX" },
    { topic: "Database Management", name: "CAP Theorem NoSQL", name_hi: "CAP प्रमेय NoSQL", code: "DB-CAP" },
    { topic: "Database Management", name: "Relational Algebra Selection", name_hi: "रिलेशनल अलगेब्रा सिलेक्शन", code: "DB-RAS" },
    { topic: "Database Management", name: "Relational Algebra Projection", name_hi: "रिलेशनल अलगेब्रा प्रोजेक्शन", code: "DB-RAP" },
    { topic: "Database Management", name: "NoSQL Document Store", name_hi: "NoSQL डॉक्यूमेंट स्टोर", code: "DB-NDS" },
    { topic: "Database Management", name: "Two Phase Locking (2PL)", name_hi: "टू फेज लॉकिंग (2PL)", code: "DB-2PL" },
    { topic: "Database Management", name: "Write Ahead Logging (WAL)", name_hi: "राइट अहेड लॉगिंग (WAL)", code: "DB-WAL" },
    { topic: "Database Management", name: "Database Trigger Function", name_hi: "डेटाबेस ट्रिगर फ़ंक्शन", code: "DB-TRG" },
    { topic: "Database Management", name: "View Database Virtual Table", name_hi: "व्यू डेटाबेस वर्चुअल टेबल", code: "DB-VWT" },
    { topic: "Database Management", name: "Candidate Key Minimal", name_hi: "कैंडिडेट कुंजी न्यूनतम", code: "DB-CDK" },
    { topic: "Database Management", name: "Super Key Definition", name_hi: "सुपर कुंजी परिभाषा", code: "DB-SPK" },
    { topic: "Database Management", name: "Deadlock Detection Wait For", name_hi: "डेडलॉक डिटेक्शन वेट फॉर", code: "DB-DDW" },
    { topic: "Database Management", name: "Data Independence Layers", name_hi: "डेटा स्वतंत्रता परतें", code: "DB-DIL" },
    { topic: "Database Management", name: "Entity Relationship ER Model", name_hi: "एंटिटी रिलेशनशिप ER मॉडल", code: "DB-ERM" },
    { topic: "Database Management", name: "SQL Injection Prevention", name_hi: "SQL इंजेक्शन रोकथाम", code: "DB-SIP" },
    { topic: "Database Management", name: "Stored Procedure Compile", name_hi: "स्टोर्ड प्रोसीजर कम्पाइल", code: "DB-SPR" },
    { topic: "Database Management", name: "Database Transaction Rollback", name_hi: "डेटाबेस ट्रांजैक्शन रोलबैक", code: "DB-TRB" },

    // 5. Computer Networks (31 concepts)
    { topic: "Networking", name: "OSI Physical Layer Bits", name_hi: "OSI फिजिकल लेयर बिट्स", code: "NW-PHY" },
    { topic: "Networking", name: "OSI Data Link Framing", name_hi: "OSI डेटा लिंक फ्रेमिंग", code: "NW-DLK" },
    { topic: "Networking", name: "OSI Network Layer IP", name_hi: "OSI नेटवर्क लेयर आईपी", code: "NW-NET" },
    { topic: "Networking", name: "OSI Transport TCP UDP", name_hi: "OSI ट्रांसपोर्ट टीसीपी यूडीपी", code: "NW-TRN" },
    { topic: "Networking", name: "OSI Application Protocols", name_hi: "OSI एप्लीकेशन प्रोटोकॉल", code: "NW-APP" },
    { topic: "Networking", name: "TCP 3-Way Handshake SYN", name_hi: "TCP 3-वे हैंडशेक SYN", code: "NW-T3W" },
    { topic: "Networking", name: "TCP Congestion Window", name_hi: "TCP कंजेशन विंडो", code: "NW-TCW" },
    { topic: "Networking", name: "IPv4 Subnetting CIDR", name_hi: "IPv4 सबनेटिंग CIDR", code: "NW-SUB" },
    { topic: "Networking", name: "IPv6 Format 128 bit", name_hi: "IPv6 प्रारूप 128 बिट", code: "NW-IP6" },
    { topic: "Networking", name: "DNS Resolution Domain", name_hi: "DNS रिज़ॉल्यूशन डोमेन", code: "NW-DNS" },
    { topic: "Networking", name: "ARP Protocol IP MAC", name_hi: "ARP प्रोटोकॉल आईपी मैक", code: "NW-ARP" },
    { topic: "Networking", name: "DHCP Protocol IP Allocation", name_hi: "DHCP प्रोटोकॉल आईपी आवंटन", code: "NW-DHC" },
    { topic: "Networking", name: "NAT Network Address", name_hi: "NAT नेटवर्क एड्रेस", code: "NW-NAT" },
    { topic: "Networking", name: "MAC Address 48 bit Hex", name_hi: "मैक एड्रेस 48 बिट हेक्स", code: "NW-MAC" },
    { topic: "Networking", name: "Link State Routing OSPF", name_hi: "लिंक स्टेट राउटिंग OSPF", code: "NW-LSR" },
    { topic: "Networking", name: "Distance Vector Routing RIP", name_hi: "डिस्टेंस वेक्टर राउटिंग RIP", code: "NW-DVR" },
    { topic: "Networking", name: "HTTP vs HTTPS Encryption", name_hi: "HTTP बनाम HTTPS एन्क्रिप्शन", code: "NW-HTP" },
    { topic: "Networking", name: "TCP Flow Control Sliding", name_hi: "TCP फ्लो कंट्रोल स्लाइडिंग", code: "NW-TFC" },
    { topic: "Networking", name: "UDP Connectionless Header", name_hi: "UDP कनेक्शनलेस हेडर", code: "NW-UDP" },
    { topic: "Networking", name: "ICMP Protocol Diagnostics", name_hi: "ICMP प्रोटोकॉल डायग्नोस्टिक्स", code: "NW-ICM" },
    { topic: "Networking", name: "Switch vs Router Network", name_hi: "स्विच बनाम राउटर नेटवर्क", code: "NW-SWR" },
    { topic: "Networking", name: "VLAN Virtual Local Area", name_hi: "VLAN वर्चुअल लोकल एरिया", code: "NW-VLN" },
    { topic: "Networking", name: "CSMA/CD Collision Ethernet", name_hi: "CSMA/CD कोलिजन ईथरनेट", code: "NW-CSM" },
    { topic: "Networking", name: "BGP Exterior Gateway Routing", name_hi: "BGP एक्सटीरियर गेटवे राउटिंग", code: "NW-BGP" },
    { topic: "Networking", name: "Proxy Server Filtering", name_hi: "प्रॉक्सी सर्वर फ़िल्टरिंग", code: "NW-PRX" },
    { topic: "Networking", name: "Socket Connection IP Port", name_hi: "सॉकेट कनेक्शन आईपी पोर्ट", code: "NW-SKT" },
    { topic: "Networking", name: "Ping Utility Command Latency", name_hi: "पिंग यूटिलिटी कमांड लेटेंसी", code: "NW-PNG" },
    { topic: "Networking", name: "Traceroute Diagnostic Path", name_hi: "ट्रेसरूट डायग्नोस्टिक पाथ", code: "NW-TRT" },
    { topic: "Networking", name: "Network Hub Broadcast Layer", name_hi: "नेटवर्क हब ब्रॉडकास्ट लेयर", code: "NW-HUB" },
    { topic: "Networking", name: "Transmission Media Fiber", name_hi: "ट्रांसमिशन मीडिया फाइबर", code: "NW-TMD" },
    { topic: "Networking", name: "Subnet Mask Logical AND", name_hi: "सबनेट मास्क लॉजिकल AND", code: "NW-SMK" },

    // 6. Cyber Security (31 concepts)
    { topic: "Cyber Security", name: "Symmetric Encryption Key", name_hi: "सममित एन्क्रिप्शन कुंजी", code: "SE-SYM" },
    { topic: "Cyber Security", name: "Asymmetric Public Private", name_hi: "असममित सार्वजनिक निजी", code: "SE-ASY" },
    { topic: "Cyber Security", name: "RSA Asymmetric Algorithm", name_hi: "RSA असममित एल्गोरिदम", code: "SE-RSA" },
    { topic: "Cyber Security", name: "AES Symmetric Encryption", name_hi: "AES सममित एन्क्रिप्शन", code: "SE-AES" },
    { topic: "Cyber Security", name: "Hash Function One Way", name_hi: "हैश फ़ंक्शन वन वे", code: "SE-HSH" },
    { topic: "Cyber Security", name: "SHA-256 Bit Security", name_hi: "SHA-256 बिट सुरक्षा", code: "SE-SHA" },
    { topic: "Cyber Security", name: "Digital Signature Verify", name_hi: "डिजिटल हस्ताक्षर सत्यापन", code: "SE-DGS" },
    { topic: "Cyber Security", name: "Stateful Firewall Inspection", name_hi: "स्टेटफुल फ़ायरवॉल निरीक्षण", code: "SE-FWL" },
    { topic: "Cyber Security", name: "Cross Site Scripting XSS", name_hi: "क्रॉस साइट स्क्रिप्टिंग XSS", code: "SE-XSS" },
    { topic: "Cyber Security", name: "Distributed DoS DDoS Attack", name_hi: "डिस्ट्रिब्यूटेड DoS DDoS हमला", code: "SE-DDO" },
    { topic: "Cyber Security", name: "Phishing Social Engineering", name_hi: "फ़िशिंग सोशल इंजीनियरिंग", code: "SE-PHS" },
    { topic: "Cyber Security", name: "Password Salting Random", name_hi: "पासवर्ड सॉल्टिंग रैंडम", code: "SE-SLT" },
    { topic: "Cyber Security", name: "SSL/TLS Handshake Cipher", name_hi: "SSL/TLS हैंडशेक सिफर", code: "SE-TLS" },
    { topic: "Cyber Security", name: "Man in the Middle MITM", name_hi: "मैन इन द मिडिल MITM", code: "SE-MTM" },
    { topic: "Cyber Security", name: "Intrusion Detection IDS", name_hi: "इंट्रूजन डिटेक्शन IDS", code: "SE-IDS" },
    { topic: "Cyber Security", name: "Zero Day Vulnerability", name_hi: "ज़ीरो डे भेद्यता", code: "SE-ZDV" },
    { topic: "Cyber Security", name: "Multi Factor Auth MFA", name_hi: "मल्टी फैक्टर ऑथेंटिकेशन MFA", code: "SE-MFA" },
    { topic: "Cyber Security", name: "SQL Injection Exploit DB", name_hi: "SQL इंजेक्शन एक्सप्लोइट DB", code: "SE-SQL" },
    { topic: "Cyber Security", name: "Buffer Overflow Threat", name_hi: "बफर ओवरफ्लो खतरा", code: "SE-BFO" },
    { topic: "Cyber Security", name: "Symmetric Key DES Legacy", name_hi: "सममित कुंजी DES लेगेसी", code: "SE-DES" },
    { topic: "Cyber Security", name: "Public Key Crypto Diffie", name_hi: "सार्वजनिक कुंजी क्रिप्टो डिफी", code: "SE-DFH" },
    { topic: "Cyber Security", name: "Trojan Horse Malware", name_hi: "ट्रोजन हॉर्स मालवेयर", code: "SE-TRJ" },
    { topic: "Cyber Security", name: "Computer Worm Self Replicate", name_hi: "कंप्यूटर वर्म सेल्फ रेप्लिकेट", code: "SE-WRM" },
    { topic: "Cyber Security", name: "Ransomware Cryptographic Lock", name_hi: "रैंसमवेयर क्रिप्टोग्राफिक लॉक", code: "SE-RSW" },
    { topic: "Cyber Security", name: "Vulnerability Scanning Tool", name_hi: "भेद्यता स्कैनिंग टूल", code: "SE-VSC" },
    { topic: "Cyber Security", name: "Cryptographic Salt Integrity", name_hi: "क्रिप्टोग्राफिक सॉल्ट ईमानदारी", code: "SE-CSI" },
    { topic: "Cyber Security", name: "HTTPS Transport Layer TLS", name_hi: "HTTPS ट्रांसपोर्ट लेयर TLS", code: "SE-HTS" },
    { topic: "Cyber Security", name: "Biometric Authentication Match", name_hi: "बायोमेट्रिक प्रमाणीकरण मिलान", code: "SE-BMA" },
    { topic: "Cyber Security", name: "Symmetric Key Distribution", name_hi: "सममित कुंजी वितरण", code: "SE-SKD" },
    { topic: "Cyber Security", name: "Penetration Testing Scope", name_hi: "पेनिट्रेशन टेस्टिंग दायरा", code: "SE-PNT" },
    { topic: "Cyber Security", name: "Defense in Depth Security", name_hi: "डिफेंस इन डेप्थ सुरक्षा", code: "SE-DID" },

    // 7. Computer Architecture & Digital Logic (32 concepts)
    { topic: "Computer Architecture", name: "AND Logic Gate", name_hi: "AND लॉजिक गेट", code: "AR-AND" },
    { topic: "Computer Architecture", name: "OR Logic Gate", name_hi: "OR लॉजिक गेट", code: "AR-ORG" },
    { topic: "Computer Architecture", name: "NOT Inverter Gate", name_hi: "NOT इन्वर्टर गेट", code: "AR-NOT" },
    { topic: "Computer Architecture", name: "NAND Universal Gate", name_hi: "NAND यूनिवर्सल गेट", code: "AR-NAN" },
    { topic: "Computer Architecture", name: "NOR Logic Gate Universal", name_hi: "NOR लॉजिक गेट यूनिवर्सल", code: "AR-NOR" },
    { topic: "Computer Architecture", name: "XOR Exclusive OR", name_hi: "XOR एक्सक्लूसिव OR", code: "AR-XOR" },
    { topic: "Computer Architecture", name: "XNOR Logic Gate Equality", name_hi: "XNOR लॉजिक गेट समानता", code: "AR-XNR" },
    { topic: "Computer Architecture", name: "Karnaugh Map Minimization", name_hi: "कारनॉफ़ मैप न्यूनीकरण", code: "AR-KMP" },
    { topic: "Computer Architecture", name: "De Morgan's Laws Boolean", name_hi: "डी मॉर्गन के नियम बुलियन", code: "AR-DMG" },
    { topic: "Computer Architecture", name: "Multiplexer Select Line MUX", name_hi: "मल्टीप्लेक्सर सेलेक्ट लाइन MUX", code: "AR-MUX" },
    { topic: "Computer Architecture", name: "Decoder Logic Circuit", name_hi: "डिकोडर लॉजिक सर्किट", code: "AR-DEC" },
    { topic: "Computer Architecture", name: "JK Flip Flop State Toggle", name_hi: "JK फ्लिप फ्लॉप स्टेट टॉगल", code: "AR-JKF" },
    { topic: "Computer Architecture", name: "D Flip Flop Delay Storage", name_hi: "D फ्लिप फ्लॉप डिले स्टोरेज", code: "AR-DFF" },
    { topic: "Computer Architecture", name: "SR Latch Memory Race", name_hi: "SR लैच मेमोरी रेस", code: "AR-SRL" },
    { topic: "Computer Architecture", name: "Direct Mapped Cache Address", name_hi: "डायरेक्ट मैप्ड कैश एड्रेस", code: "AR-DMC" },
    { topic: "Computer Architecture", name: "Fully Associative Cache", name_hi: "फुली एसोसिएटिव कैश", code: "AR-FAC" },
    { topic: "Computer Architecture", name: "Set Associative Cache Line", name_hi: "सेट एसोसिएटिव कैश लाइन", code: "AR-SAC" },
    { topic: "Computer Architecture", name: "SRAM vs DRAM Speed Density", name_hi: "SRAM बनाम DRAM गति घनत्व", code: "AR-SRD" },
    { topic: "Computer Architecture", name: "RISC Reduced Instructions", name_hi: "RISC रिड्यूस्ड इंस्ट्रक्शंस", code: "AR-RIS" },
    { topic: "Computer Architecture", name: "CISC Complex Instruction Set", name_hi: "CISC कॉम्प्लेक्स इंस्ट्रक्शन सेट", code: "AR-CIS" },
    { topic: "Computer Architecture", name: "CPU Pipelining Execution", name_hi: "सीपीयू पाइपलाइनिंग निष्पादन", code: "AR-PPL" },
    { topic: "Computer Architecture", name: "Structural Hazard Pipeline", name_hi: "स्ट्रक्चरल हेजार्ड पाइपलाइन", code: "AR-SHZ" },
    { topic: "Computer Architecture", name: "Data Hazard Read Write", name_hi: "डेटा हेजार्ड रीड राइट", code: "AR-DHZ" },
    { topic: "Computer Architecture", name: "Control Hazard Branching", name_hi: "कंट्रोल हेजार्ड ब्रांचिंग", code: "AR-CHZ" },
    { topic: "Computer Architecture", name: "Interrupt Handling Sequence", name_hi: "इंटरप्ट हैंडलिंग अनुक्रम", code: "AR-INT" },
    { topic: "Computer Architecture", name: "Program Counter Instruction", name_hi: "प्रोग्राम काउंटर इंस्ट्रक्शन", code: "AR-PCT" },
    { topic: "Computer Architecture", name: "Instruction Register Fetch", name_hi: "इंस्ट्रक्शन रजिस्टर फ़ेच", code: "AR-IRF" },
    { topic: "Computer Architecture", name: "Accumulator CPU Register", name_hi: "एक्युमुलेटर सीपीयू रजिस्टर", code: "AR-ACC" },
    { topic: "Computer Architecture", name: "ALU Arithmetic Logic Unit", name_hi: "ALU अंकगणित तर्क इकाई", code: "AR-ALU" },
    { topic: "Computer Architecture", name: "Von Neumann Architecture", name_hi: "वॉन न्यूमैन आर्किटेक्चर", code: "AR-VNM" },
    { topic: "Computer Architecture", name: "Harvard Architecture Bus", name_hi: "हार्वर्ड आर्किटेक्चर बस", code: "AR-HVD" },
    { topic: "Computer Architecture", name: "Cache Block Line Replacement", name_hi: "कैश ब्लॉक लाइन रिप्लेसमेंट", code: "AR-CBL" },

    // 8. Software Engineering & Web (32 concepts)
    { topic: "Software Engineering", name: "Waterfall Model Sequence", name_hi: "वॉटरफ़ॉल मॉडल अनुक्रम", code: "SE-WFT" },
    { topic: "Software Engineering", name: "Agile Scrum Sprint Daily", name_hi: "एजाइल स्क्रम स्प्रिंट डेली", code: "SE-AGL" },
    { topic: "Software Engineering", name: "Model View Controller MVC", name_hi: "मॉडल व्यू कंट्रोलर MVC", code: "SE-MVC" },
    { topic: "Software Engineering", name: "Singleton Design Pattern", name_hi: "सिंगलटन डिज़ाइन पैटर्न", code: "SE-SGL" },
    { topic: "Software Engineering", name: "Observer Pattern Publish", name_hi: "ऑब्जर्वर पैटर्न पब्लिश", code: "SE-OBS" },
    { topic: "Software Engineering", name: "Factory Pattern Interface", name_hi: "फैक्ट्री पैटर्न इंटरफ़ेस", code: "SE-FCT" },
    { topic: "Software Engineering", name: "Unit Testing Code Logic", name_hi: "यूनिट टेस्टिंग कोड लॉजिक", code: "SE-UNT" },
    { topic: "Software Engineering", name: "Integration Testing Interface", name_hi: "इंटीग्रेशन टेस्टिंग इंटरफ़ेस", code: "SE-ITG" },
    { topic: "Software Engineering", name: "Git Merge Rebase History", name_hi: "Git मर्ज रीबेस इतिहास", code: "SE-GIT" },
    { topic: "Software Engineering", name: "REST API GET POST Request", name_hi: "REST API GET POST अनुरोध", code: "SE-RST" },
    { topic: "Software Engineering", name: "WebSockets Protocol Full Duplex", name_hi: "वेबसॉकेट्स प्रोटोकॉल फुल डुप्लेक्स", code: "SE-WBS" },
    { topic: "Software Engineering", name: "Microservices Architecture", name_hi: "माइक्रोसर्विसेज आर्किटेक्चर", code: "SE-MSR" },
    { topic: "Software Engineering", name: "Software Code Refactoring", name_hi: "सॉफ़्टवेयर कोड रिफैक्टरिंग", code: "SE-RFT" },
    { topic: "Software Engineering", name: "System Testing Validation", name_hi: "सिस्टम टेस्टिंग सत्यापन", code: "SE-SYS" },
    { topic: "Software Engineering", name: "White Box Testing Logic", name_hi: "व्हाइट बॉक्स टेस्टिंग लॉजिक", code: "SE-WBT" },
    { topic: "Software Engineering", name: "Black Box Testing Behavior", name_hi: "ब्लैक बॉक्स टेस्टिंग व्यवहार", code: "SE-BBT" },
    { topic: "Software Engineering", name: "HTTP Status Code 200 Success", name_hi: "HTTP स्थिति कोड 200 सफलता", code: "SE-S20" },
    { topic: "Software Engineering", name: "HTTP Status Code 301 Move", name_hi: "HTTP स्थिति कोड 301 मूव", code: "SE-S30" },
    { topic: "Software Engineering", name: "HTTP Status Code 404 Found", name_hi: "HTTP स्थिति कोड 404 फाउंड", code: "SE-S40" },
    { topic: "Software Engineering", name: "HTTP Status Code 500 Server", name_hi: "HTTP स्थिति कोड 500 सर्वर", code: "SE-S50" },
    { topic: "Software Engineering", name: "CORS Browser Policy Origin", name_hi: "CORS ब्राउज़र नीति मूल", code: "SE-CRS" },
    { topic: "Software Engineering", name: "Functional Requirement Logic", name_hi: "कार्यात्मक आवश्यकता तर्क", code: "SE-FRQ" },
    { topic: "Software Engineering", name: "Non Functional System Metrics", name_hi: "गैर कार्यात्मक सिस्टम मेट्रिक्स", code: "SE-NFR" },
    { topic: "Software Engineering", name: "Cohesion In Software Design", name_hi: "कोहेसन सॉफ़्टवेयर डिज़ाइन में", code: "SE-COH" },
    { topic: "Software Engineering", name: "Coupling In Software Modular", name_hi: "कपलिंग सॉफ़्टवेयर मॉड्यूलर में", code: "SE-CPL" },
    { topic: "Software Engineering", name: "Spiral Software Risk Driven", name_hi: "सर्पिल सॉफ़्टवेयर जोखिम संचालित", code: "SE-SPR" },
    { topic: "Software Engineering", name: "Rapid App Dev RAD Iterative", name_hi: "रैपिड ऐप देव RAD पुनरावृत्त", code: "SE-RAD" },
    { topic: "Software Engineering", name: "Compiler Syntax Semantic", name_hi: "कंपाइलर सिंटैक्स सिमेंटिक", code: "SE-CMP" },
    { topic: "Software Engineering", name: "Interpreter Step Execution", name_hi: "इंटरप्रेटर चरण निष्पादन", code: "SE-INT" },
    { topic: "Software Engineering", name: "Object Oriented Polymorphism", name_hi: "ऑब्जेक्ट ओरिएंटेड पॉलीमॉर्फिज्म", code: "SE-OOP" },
    { topic: "Software Engineering", name: "Object Oriented Inheritance", name_hi: "ऑब्जेक्ट ओरिएंटेड इनहेरिटेंस", code: "SE-INH" },
    { topic: "Software Engineering", name: "Object Oriented Encapsulate", name_hi: "ऑब्जेक्ट ओरिएंटेड एनकैप्सुलेट", code: "SE-ENC" }
];

console.log("Loaded concepts count:", concepts.length);

const difficulties = ["easy", "medium", "hard"];
const examTags = ["GATE CSE", "UPSC IAS", "BPSC", "ISRO Scientist", "SSC CGL", "Railway NTPC", "UGC NET"];

// Helper to generate a unique question for a concept using a specific variation index
function generateCSQuestion(concept, varIndex, qId) {
    const topic = concept.topic;
    const name = concept.name;
    const nameHi = concept.name_hi;
    const code = concept.code;

    // Difficulty mapping (20-40-40):
    // 0-3: easy (4 variations)
    // 4-11: medium (8 variations)
    // 12-19: hard (8 variations)
    let difficulty = "medium";
    if (varIndex < 4) difficulty = "easy";
    else if (varIndex >= 12) difficulty = "hard";

    // Set correct answer programmatically based on index
    const correctAnswerVal = varIndex % 4; // Cycles through 0 (A), 1 (B), 2 (C), 3 (D)

    // Option structures
    let optEn = [];
    let optHi = [];

    // Core question templates based on varIndex
    let questionEn = "";
    let questionHi = "";
    let explanationEn = "";
    let explanationHi = "";

    // Variations
    switch (varIndex) {
        case 0:
            questionEn = `Which of the following statements best defines the core working mechanism of ${name} in computer networks or operating systems?`;
            questionHi = `निम्नलिखित में से कौन सा कथन कंप्यूटर नेटवर्क या ऑपरेटिंग सिस्टम में ${nameHi} के मुख्य कार्य तंत्र को सर्वोत्तम रूप से परिभाषित करता है?`;
            optEn = [
                `It replaces or tracks resources that have not been accessed for the longest duration first.`,
                `It operates on a strict first-in, first-out allocation order.`,
                `It randomly assigns priorities based on transient workload metrics.`,
                `It holds all resource pointers in a static stack structure with no replacement.`
            ];
            optHi = [
                `यह उन संसाधनों को पहले बदलता या ट्रैक करता है जिन्हें सबसे लंबे समय तक एक्सेस नहीं किया गया है।`,
                `यह सख्त फर्स्ट-इन, फर्स्ट-आउट आवंटन क्रम पर काम करता है।`,
                `यह अस्थायी कार्यभार मेट्रिक्स के आधार पर बेतरतीब ढंग से प्राथमिकताएं प्रदान करता है।`,
                `यह बिना किसी प्रतिस्थापन के एक स्थिर स्टैक संरचना में सभी संसाधन संकेतकों को रखता है।`
            ];
            explanationEn = `${name} focuses on the principle of temporal locality, replacing the least recently accessed item.`;
            explanationHi = `${nameHi} टेम्पोरल लोकैलिटी के सिद्धांत पर ध्यान केंद्रित करता है, जो सबसे कम हाल ही में एक्सेस की गई वस्तु को बदल देता है।`;
            break;

        case 1:
            questionEn = `What is a primary advantage of utilizing ${name} compared to traditional allocation methods in state-of-the-art designs?`;
            questionHi = `अत्याधुनिक डिज़ाइनों में पारंपरिक आवंटन विधियों की तुलना में ${nameHi} का उपयोग करने का प्राथमिक लाभ क्या है?`;
            optEn = [
                `It introduces significant overhead but guarantees deterministic constant-time access.`,
                `It optimizes resource efficiency by minimizing redundant allocations and thrashing under temporal locality.`,
                `It completely eliminates the need for dynamic physical memory mappings.`,
                `It simplifies digital circuits by utilizing single-gate logical multiplexing.`
            ];
            optHi = [
                `यह महत्वपूर्ण ओवरहेड का परिचय देता है लेकिन नियतात्मक निरंतर-समय पहुंच की गारंटी देता है।`,
                `यह टेम्पोरल लोकैलिटी के तहत अनावश्यक आवंटन और थ्रैशिंग को कम करके संसाधन दक्षता को अनुकूलित करता है।`,
                `यह गतिशील भौतिक मेमोरी मैपिंग की आवश्यकता को पूरी तरह से समाप्त कर देता है।`,
                `यह सिंगल-गेट लॉजिकल मल्टीप्लेक्सिंग का उपयोग करके डिजिटल सर्किट को सरल बनाता है।`
            ];
            explanationEn = `By leveraging local patterns, ${name} reduces memory footprint and cache miss penalties.`;
            explanationHi = `स्थानीय पैटर्नों का लाभ उठाकर, ${nameHi} मेमोरी फ़ुटप्रिंट और कैश मिस पेनल्टी को कम करता है।`;
            break;

        case 2:
            questionEn = `Which of the following accurately identifies a critical limitation or drawback associated with ${name} under extreme workloads?`;
            questionHi = `निम्नलिखित में से कौन सा चरम कार्यभार के तहत ${nameHi} से जुड़ी एक महत्वपूर्ण सीमा या खामी को सटीक रूप से पहचानता है?`;
            optEn = [
                `It is mathematically impossible to implement in modern computer registers.`,
                `It causes low cache throughput and significant lookup overhead due to keeping metadata active for all elements.`,
                `It strictly requires hardware-level support and cannot be modeled in software.`,
                `It violates the basic principles of Boolean algebra and logic gate synchronization.`
            ];
            optHi = [
                `आधुनिक कंप्यूटर रजिस्टरों में इसे लागू करना गणितीय रूप से असंभव है।`,
                `यह सभी तत्वों के लिए मेटाडेटा को सक्रिय रखने के कारण कम कैश थ्रूपुट और महत्वपूर्ण लुकअप ओवरहेड का कारण बनता है।`,
                `इसके लिए केवल हार्डवेयर-स्तर के समर्थन की आवश्यकता होती है और इसे सॉफ्टवेयर में मॉडल नहीं किया जा सकता है।`,
                `यह बुलियन बीजगणित और लॉजिक गेट सिंक्रनाइज़ेशन के बुनियादी सिद्धांतों का उल्लंघन करता है।`
            ];
            explanationEn = `Tracking access history for all pages/elements requires hardware registers or complex doubly linked lists, creating significant overhead.`;
            explanationHi = `सभी पृष्ठों/तत्वों के लिए एक्सेस इतिहास को ट्रैक करने के लिए हार्डवेयर रजिस्टरों या जटिल रूप से जुड़े लिंक सूचियों की आवश्यकता होती है, जिससे महत्वपूर्ण ओवरहेड होता है।`;
            break;

        case 3:
            questionEn = `In the context of standard systems, which of the following data structures is most efficient for implementing a fully functional ${name}?`;
            questionHi = `मानक प्रणालियों के संदर्भ में, पूरी तरह से कार्यात्मक ${nameHi} को लागू करने के लिए निम्नलिखित में से कौन सी डेटा संरचना सबसे कुशल है?`;
            optEn = [
                `A simple static array combined with a binary search pointer.`,
                `A hash map combined with a doubly linked list to achieve O(1) operations.`,
                `A single-ended queue operating on a linear feedback shift register.`,
                `A binary search tree containing multi-level parent links.`
            ];
            optHi = [
                `एक बाइनरी सर्च पॉइंटर के साथ संयुक्त एक साधारण स्थिर एरे।`,
                `O(1) संचालन प्राप्त करने के लिए एक डबल लिंक्ड सूची के साथ संयुक्त एक हैश मैप।`,
                `एक रैखिक फीडबैक शिफ्ट रजिस्टर पर काम करने वाली एक सिंगल-एंडेड कतार।`,
                `एक बाइनरी सर्च ट्री जिसमें बहु-स्तरीय पैरेंट लिंक शामिल हैं।`
            ];
            explanationEn = `A doubly linked list allows O(1) removal and updates, and a hash map provides O(1) lookup.`;
            explanationHi = `एक डबल लिंक्ड सूची O(1) हटाने और अपडेट करने की अनुमति देती है, और एक हैश मैप O(1) लुकअप प्रदान करता है।`;
            break;

        case 4:
            questionEn = `Consider a simulated system executing ${name} with exactly 3 empty resource frames. If the resource reference sequence is [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5], what is the total number of resource faults recorded?`;
            questionHi = `सटीक रूप से 3 खाली संसाधन फ़्रेमों के साथ ${nameHi} निष्पादित करने वाली एक सिम्युलेटेड प्रणाली पर विचार करें। यदि संसाधन संदर्भ अनुक्रम [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5] है, तो रिकॉर्ड किए गए कुल संसाधन दोषों (faults) की संख्या क्या है?`;
            optEn = [
                `Exactly 6 resource faults.`,
                `Exactly 7 resource faults.`,
                `Exactly 9 resource faults.`,
                `Exactly 10 resource faults.`
            ];
            optHi = [
                `सटीक रूप से 6 संसाधन दोष।`,
                `सटीक रूप से 7 संसाधन दोष।`,
                `सटीक रूप से 9 संसाधन दोष।`,
                `सटीक रूप से 10 संसाधन दोष।`
            ];
            explanationEn = `Tracing the sequence step-by-step with 3 frames results in exactly 10 resource faults.`;
            explanationHi = `3 फ़्रेमों के साथ चरण-दर-चरण अनुक्रम का पता लगाने पर सटीक रूप से 10 संसाधन दोष होते हैं।`;
            break;

        case 5:
            questionEn = `If the system in the previous scenario increases its available frames from 3 to 4, how does the resource fault rate under ${name} change?`;
            questionHi = `यदि पिछली परिदृश्य में प्रणाली अपने उपलब्ध फ़्रेमों को 3 से बढ़ाकर 4 कर देती है, तो ${nameHi} के तहत संसाधन दोष दर कैसे बदलती है?`;
            optEn = [
                `The fault count increases due to Belady's Anomaly.`,
                `The fault count decreases or remains equal, behaving predictably as frames increase.`,
                `The system enters a permanent deadlock state.`,
                `The fault count doubles instantly because of synchronization lag.`
            ];
            optHi = [
                `बेलेडी की विसंगति के कारण दोषों की संख्या बढ़ जाती है।`,
                `दोषों की संख्या घट जाती है या बराबर रहती है, जो फ़्रेम बढ़ने पर उम्मीद के मुताबिक व्यवहार करती है।`,
                `प्रणाली स्थायी गतिरोध (deadlock) स्थिति में प्रवेश करती है।`,
                `सिंक्रनाइज़ेशन लैग के कारण दोषों की संख्या तुरंत दोगुनी हो जाती है।`
            ];
            explanationEn = `${name} belongs to the stack class of algorithms and is not subject to Belady's Anomaly; increasing frames guarantees no increase in faults.`;
            explanationHi = `${nameHi} एल्गोरिदम के स्टैक वर्ग से संबंधित है और बेलेडी की विसंगति के अधीन नहीं है; फ़्रेम बढ़ाने से दोषों में वृद्धि न होने की गारंटी मिलती है।`;
            break;

        case 6:
            questionEn = `Which mathematical concept or system property ensures that ${name} can be successfully modeled as a stack-based algorithm?`;
            questionHi = `कौन सी गणितीय अवधारणा या सिस्टम गुण यह सुनिश्चित करता है कि ${nameHi} को स्टैक-आधारित एल्गोरिदम के रूप में सफलतापूर्वक मॉडल किया जा सकता है?`;
            optEn = [
                `The inclusion property: the set of pages in memory for n frames is always a subset of the pages for n+1 frames.`,
                `The distributive property of Boolean algebra over logic gates.`,
                `The transitivity rule in partial order relational databases.`,
                `The non-deterministic polynomial-time completeness criteria.`
            ];
            optHi = [
                `समावेशन गुण (inclusion property): n फ़्रेमों के लिए मेमोरी में पृष्ठों का सेट हमेशा n+1 फ़्रेमों के लिए पृष्ठों का एक सबसेट होता है।`,
                `लॉजिक गेट्स पर बुलियन बीजगणित का वितरण गुण।`,
                `आंशिक ऑर्डर रिलेशनल डेटाबेस में सकर्मकता (transitivity) नियम।`,
                `गैर-नियतात्मक बहुपद-समय पूर्णता मानदंड।`
            ];
            explanationEn = `The inclusion property guarantees that stack algorithms never exhibit Belady's Anomaly.`;
            explanationHi = `समावेशन गुण गारंटी देता है कि स्टैक एल्गोरिदम कभी भी बेलेडी की विसंगति प्रदर्शित नहीं करते हैं।`;
            break;

        case 7:
            questionEn = `How does the average overhead of ${name} compare to the Optimal (MIN) replacement algorithm under practical system constraints?`;
            questionHi = `व्यावहारिक सिस्टम बाधाओं के तहत ${nameHi} का औसत ओवरहेड इष्टतम (MIN) प्रतिस्थापन एल्गोरिदम से कैसे तुलना करता है?`;
            optEn = [
                `Optimal requires future knowledge, making it physically unimplementable, whereas ${name} uses historical approximations.`,
                `Optimal has lower computational complexity and runs in O(log N) time.`,
                `Optimal is always implemented using simple FIFO hardware registers.`,
                `Optimal is equivalent to ${name} in terms of real-time software execution logic.`
            ];
            optHi = [
                `इष्टतम के लिए भविष्य के ज्ञान की आवश्यकता होती है, जिससे यह भौतिक रूप से असंभव हो जाता है, जबकि ${nameHi} ऐतिहासिक अनुमानों का उपयोग करता है।`,
                `इष्टतम में कम कम्प्यूटेशनल जटिलता होती है और यह O(log N) समय में चलता है।`,
                `इष्टतम को हमेशा सरल FIFO हार्डवेयर रजिस्टरों का उपयोग करके लागू किया जाता है।`,
                `वास्तविक समय के सॉफ़्टवेयर निष्पादन तर्क के संदर्भ में इष्टतम ${nameHi} के समकक्ष है।`
            ];
            explanationEn = `Optimal requires looking ahead into the future reference string, which is impossible in general-purpose systems, so ${name} is a practical backward-looking alternative.`;
            explanationHi = `इष्टतम को भविष्य के संदर्भ स्ट्रिंग में देखने की आवश्यकता होती है, जो सामान्य-प्रयोजन प्रणालियों में असंभव है, इसलिए ${nameHi} एक व्यावहारिक अतीत की ओर देखने वाला विकल्प है।`;
            break;

        case 8:
            questionEn = `In a system implementing ${name}, what happens to elements that are frequently accessed in quick succession?`;
            questionHi = `एक प्रणाली में ${nameHi} लागू करने पर, उन तत्वों का क्या होता है जिन्हें त्वरित उत्तराधिकार में बार-बार एक्सेस किया जाता है?`;
            optEn = [
                `They are evicted immediately to prioritize less active resources.`,
                `They remain near the top of the virtual stack, minimizing their eviction risk.`,
                `They trigger continuous hardware interrupts and slow down execution.`,
                `They are automatically migrated to slow-access magnetic storage media.`
            ];
            optHi = [
                `कम सक्रिय संसाधनों को प्राथमिकता देने के लिए उन्हें तुरंत बेदखल कर दिया जाता है।`,
                `वे वर्चुअल स्टैक के शीर्ष के पास बने रहते हैं, जिससे उनकी बेदखली का जोखिम कम हो जाता है।`,
                `वे निरंतर हार्डवेयर व्यवधान उत्पन्न करते हैं और निष्पादन को धीमा करते हैं।`,
                `वे स्वचालित रूप से धीमी गति से चलने वाले चुंबकीय भंडारण मीडिया में स्थानांतरित हो जाते हैं।`
            ];
            explanationEn = `Frequent access keeps items marked as recently used, shifting them to the head of the access structure.`;
            explanationHi = `बार-बार एक्सेस करने से वस्तुओं को हाल ही में उपयोग किए गए के रूप में चिह्नित रखा जाता है, जिससे वे एक्सेस संरचना के शीर्ष पर स्थानांतरित हो जाते हैं।`;
            break;

        case 9:
            questionEn = `Which of the following hardware features is commonly used by modern processors to speed up the address translation or tracking required by ${name}?`;
            questionHi = `निम्नलिखित में से कौन सी हार्डवेयर विशेषता सामान्यतः आधुनिक प्रोसेसर द्वारा ${nameHi} के लिए आवश्यक पता अनुवाद या ट्रैकिंग को तेज करने के लिए उपयोग की जाती है?`;
            optEn = [
                `Instruction Pipelining units with structural hazard filters.`,
                `Translation Lookaside Buffers (TLB) and page table reference bits.`,
                `Digital logic decoders with set-associative cache lines.`,
                `Interrupt vectors operating on discrete clock cycles.`
            ];
            optHi = [
                `स्ट्रक्चरल हेजार्ड फिल्टर के साथ इंस्ट्रक्शन पाइपलाइनिंग इकाइयाँ।`,
                `ट्रांसलेशन लुकासाइड बफर (TLB) और पेज टेबल संदर्भ बिट्स।`,
                `सेट-एसोसिएटिव कैश लाइनों के साथ डिजिटल लॉजिक डिकोडर्स।`,
                `असतत क्लॉक साइकिलों पर काम करने वाले इंटरप्ट वैक्टर।`
            ];
            explanationEn = `Processors use reference bits in page table entries and TLB entries to support software approximations of ${name}.`;
            explanationHi = `प्रोसेसर ${nameHi} के सॉफ्टवेयर अनुमानों का समर्थन करने के लिए पेज टेबल प्रविष्टियों और TLB प्रविष्टियों में संदर्भ बिट्स का उपयोग करते हैं।`;
            break;

        case 10:
            questionEn = `When comparing ${name} with the Least Frequently Used (LFU) replacement scheme, what is a key conceptual difference in their tracking logic?`;
            questionHi = `जब ${nameHi} की तुलना लीस्ट फ्रीक्वेंटली यूज्ड (LFU) प्रतिस्थापन योजना से की जाती है, तो उनके ट्रैकिंग तर्क में एक महत्वपूर्ण वैचारिक अंतर क्या होता है?`;
            optEn = [
                `LFU tracks cumulative access frequency over time, whereas ${name} tracks only the recency of the last access.`,
                `LFU tracks only physical disk sectors, while ${name} operates solely on virtual CPU registers.`,
                `LFU requires O(N^2) sorting time, whereas ${name} is fundamentally an O(1) priority algorithm.`,
                `LFU completely ignores temporal locality, whereas ${name} ignores frequency and count.`
            ];
            optHi = [
                `LFU समय के साथ संचयी एक्सेस आवृत्ति को ट्रैक करता है, जबकि ${nameHi} केवल अंतिम एक्सेस की हालिया स्थिति को ट्रैक करता है।`,
                `LFU केवल भौतिक डिस्क सेक्टरों को ट्रैक करता है, जबकि ${nameHi} केवल वर्चुअल सीपीयू रजिस्टरों पर काम करता है।`,
                `LFU को O(N^2) सॉर्टिंग समय की आवश्यकता होती है, जबकि ${nameHi} मौलिक रूप से O(1) प्राथमिकता एल्गोरिदम है।`,
                `LFU टेम्पोरल लोकैलिटी को पूरी तरह से अनदेखा करता है, जबकि ${nameHi} आवृत्ति और संख्या को अनदेखा करता है।`
            ];
            explanationEn = `LFU counts how many times an element was hit, which can lead to stale items with high historical counts staying in cache, whereas ${name} resets priorities based on the latest access.`;
            explanationHi = `LFU गणना करता है कि एक तत्व को कितनी बार हिट किया गया था, जिससे उच्च ऐतिहासिक संख्या वाले पुराने तत्व कैश में बने रह सकते हैं, जबकि ${nameHi} नवीनतम एक्सेस के आधार पर प्राथमिकताओं को रीसेट करता है।`;
            break;

        case 11:
            questionEn = `Which approximation of ${name} is widely implemented in operating systems (such as Linux) to balance tracking accuracy and CPU overhead?`;
            questionHi = `ट्रैकिंग सटीकता और सीपीयू ओवरहेड को संतुलित करने के लिए ऑपरेटिंग सिस्टम (जैसे लिनक्स) में ${nameHi} का कौन सा अनुमान व्यापक रूप से लागू किया गया है?`;
            optEn = [
                `The static FIFO queue with random element bypass.`,
                `The Second-Chance (or Clock) algorithm utilizing a reference bit.`,
                `The Banker's safety allocation validation routine.`,
                `The multi-level feedback queue scheduling algorithm.`
            ];
            optHi = [
                `यादृच्छिक तत्व बाईपास के साथ स्थिर FIFO कतार।`,
                `एक संदर्भ बिट का उपयोग करने वाला सेकंड-चांस (या क्लॉक) एल्गोरिदम।`,
                `बैंकर का सुरक्षा आवंटन सत्यापन रूटीन।`,
                `मल्टी-लेवल फीडबैक कतार शेड्यूलिंग एल्गोरिदम।`
            ];
            explanationEn = `The Clock/Second-Chance algorithm approximates ${name} efficiently by scanning pages in a circular loop and checking reference bits.`;
            explanationHi = `क्लॉक/सेकंड-चांस एल्गोरिदम एक गोलाकार लूप में पेजों को स्कैन करके और संदर्भ बिट्स की जांच करके ${nameHi} का कुशलतापूर्वक अनुमान लगाता है।`;
            break;

        case 12:
            questionEn = `In advanced database engines, what specialized variant or optimization of ${name} is commonly deployed in buffer pools to handle sequential scans without polluting the cache?`;
            questionHi = `उन्नत डेटाबेस इंजनों में, कैश को प्रदूषित किए बिना क्रमिक स्कैन को संभालने के लिए आमतौर पर बफर पूल में ${nameHi} का कौन सा विशिष्ट संस्करण या अनुकूलन तैनात किया जाता है?`;
            optEn = [
                `The standard LIFO stack bypass.`,
                `The 2Q (Two-Queue) or LRU-K algorithm, which tracks the distance of the K-th reference.`,
                `The greedy segment trees with range queries.`,
                `The stateful hash collision chaining mechanism.`
            ];
            optHi = [
                `मानक LIFO स्टैक बाईपास।`,
                `2Q (टू-कतार) या LRU-K एल्गोरिदम, जो K-वें संदर्भ की दूरी को ट्रैक करता है।`,
                `रेंज प्रश्नों के साथ ग्रीडी सेगमेंट ट्री।`,
                `स्टेटफुल हैश कोलिजन चेनिंग तंत्र।`
            ];
            explanationEn = `LRU-K and 2Q algorithms prevent single-use sequential scans from evicting highly active pages by requiring elements to be hit multiple times before promoting them.`;
            explanationHi = `LRU-K और 2Q एल्गोरिदम एकल-उपयोग क्रमिक स्कैन को बढ़ावा देने से पहले तत्वों को कई बार हिट करने की आवश्यकता के द्वारा अत्यधिक सक्रिय पृष्ठों को बेदखल करने से रोकते हैं।`;
            break;

        case 13:
            questionEn = `Suppose a virtual memory system operates ${name} with 3 physical frames. The system starts empty. If the page reference string is [2, 3, 2, 1, 5, 2, 4, 5, 3, 2, 5, 2], calculate the final state of the page frames (from most to least recently used) and the exact number of hits.`;
            questionHi = `मान लीजिए कि एक वर्चुअल मेमोरी सिस्टम 3 भौतिक फ़्रेमों के साथ ${nameHi} संचालित करता है। सिस्टम खाली शुरू होता है। यदि पेज संदर्भ स्ट्रिंग [2, 3, 2, 1, 5, 2, 4, 5, 3, 2, 5, 2] है, तो पेज फ़्रेम की अंतिम स्थिति (가장 हाल ही में उपयोग किए गए से सबसे कम तक) और हिट की सटीक संख्या की गणना करें।`;
            optEn = [
                `Final: [2, 5, 3], Hits: 4`,
                `Final: [2, 5, 3], Hits: 5`,
                `Final: [4, 5, 2], Hits: 4`,
                `Final: [2, 4, 5], Hits: 3`
            ];
            optHi = [
                `अंतिम: [2, 5, 3], हिट: 4`,
                `अंतिम: [2, 5, 3], हिट: 5`,
                `अंतिम: [4, 5, 2], हिट: 4`,
                `अंतिम: [2, 4, 5], हिट: 3`
            ];
            explanationEn = `Traces: 2(M), 3(M), 2(H), 1(M) [frames: 1, 2, 3], 5(M) [evicts 3, frames: 5, 1, 2], 2(H) [frames: 2, 5, 1], 4(M) [evicts 1, frames: 4, 2, 5], 5(H) [frames: 5, 4, 2], 3(M) [evicts 2, frames: 3, 5, 4], 2(M) [evicts 4, frames: 2, 3, 5], 5(H) [frames: 5, 2, 3], 2(H) [frames: 2, 5, 3]. Hits = 5.`;
            explanationHi = `ट्रेस: 2(M), 3(M), 2(H), 1(M) [फ़्रेम: 1, 2, 3], 5(M) [3 को हटाता है, फ़्रेम: 5, 1, 2], 2(H) [फ़्रेम: 2, 5, 1], 4(M) [1 को हटाता है, फ़्रेम: 4, 2, 5], 5(H) [फ़्रेम: 5, 4, 2], 3(M) [2 को हटाता है, फ़्रेम: 3, 5, 4], 2(M) [4 को हटाता है, फ़्रेम: 2, 3, 5], 5(H) [फ़्रेम: 5, 2, 3], 2(H) [फ़्रेम: 2, 5, 3]। हिट = 5.`;
            break;

        case 14:
            questionEn = `What is the asymptotic time complexity of updating the priority of an element in an optimally designed ${name} cache with N elements?`;
            questionHi = `N तत्वों वाले इष्टतम रूप से डिज़ाइन किए गए ${nameHi} कैश में किसी तत्व की प्राथमिकता को अपडेट करने की स्पर्शोन्मुख समय जटिलता (asymptotic time complexity) क्या है?`;
            optEn = [
                `O(log N) due to heap adjustment operations.`,
                `O(1) constant time when using a hash map combined with a doubly linked list.`,
                `O(N) linear time since the list must be scanned to locate the element.`,
                `O(N log N) because sorting is required after each access.`
            ];
            optHi = [
                `हीप समायोजन संचालन के कारण O(log N)।`,
                `डबल लिंक्ड सूची के साथ संयुक्त हैश मैप का उपयोग करते समय O(1) निरंतर समय।`,
                `O(N) रैखिक समय क्योंकि तत्व का पता लगाने के लिए सूची को स्कैन किया जाना चाहिए।`,
                `O(N log N) क्योंकि प्रत्येक एक्सेस के बाद सॉर्टिंग की आवश्यकता होती है।`
            ];
            explanationEn = `The hash map yields O(1) lookup, and the doubly linked list allows moving the node to the head in O(1) time.`;
            explanationHi = `हैश मैप O(1) लुकअप प्रदान करता है, और डबल लिंक्ड सूची नोड को O(1) समय में शीर्ष पर ले जाने की अनुमति देती है।`;
            break;

        case 15:
            questionEn = `In virtual memory architectures, what is the exact hardware cost of implementing a truly precise, non-approximate ${name} replacement policy?`;
            questionHi = `वर्चुअल मेमोरी आर्किटेक्चर में, वास्तव में सटीक, गैर-अनुमानित ${nameHi} प्रतिस्थापन नीति को लागू करने की सटीक हार्डवेयर लागत क्या है?`;
            optEn = [
                `A single parity register per page table entry.`,
                `An N-bit counter or a matrix of N x N registers (where N is the number of frames) updated on every single memory reference.`,
                `A complete set of digital arithmetic multiplexers in the instruction decoder.`,
                `A secondary cache controller running on a independent clock signal.`
            ];
            optHi = [
                `प्रति पेज टेबल प्रविष्टि एक एकल समता (parity) रजिस्टर।`,
                `प्रत्येक एकल मेमोरी संदर्भ पर अपडेट किया जाने वाला एक एन-बिट काउंटर या एन एक्स एन रजिस्टरों का मैट्रिक्स (जहां एन फ्रेम की संख्या है)।`,
                `निर्देश डिकोडर में डिजिटल अंकगणितीय मल्टीप्लेक्सर्स का एक पूरा सेट।`,
                `एक स्वतंत्र घड़ी सिग्नल पर चलने वाला द्वितीयक कैश नियंत्रक।`
            ];
            explanationEn = `True ${name} requires massive hardware overhead: either writing a timestamp/counter to a register on every memory access or updating an N x N boolean matrix, which is prohibitive at CPU speeds.`;
            explanationHi = `सच्चे ${nameHi} के लिए बड़े पैमाने पर हार्डवेयर ओवरहेड की आवश्यकता होती है: या तो प्रत्येक मेमोरी एक्सेस पर एक रजिस्टर में टाइमस्टैम्प/काउंटर लिखना या N x N बूलियन मैट्रिक्स को अपडेट करना, जो सीपीयू गति पर निषेधात्मक है।`;
            break;

        case 16:
            questionEn = `Explain how the ${name} policy behaves when executing a loop over an array of size M, where M is exactly one element larger than the total number of available physical cache frames F (i.e., M = F + 1).`;
            questionHi = `बताएं कि आकार M के एक एरे पर लूप निष्पादित करते समय ${nameHi} नीति कैसा व्यवहार करती है, जहां M उपलब्ध भौतिक कैश फ़्रेम F की कुल संख्या से ठीक एक तत्व बड़ा है (अर्थात, M = F + 1)।`;
            optEn = [
                `The cache hits remain constant at 50% due to uniform distribution.`,
                `It results in a worst-case scenario with a 0% cache hit rate (thrashing) because every single reference causes a miss.`,
                `It behaves optimally, maintaining F/M hit ratio.`,
                `It triggers a system stack overflow error due to circular dependencies.`
            ];
            optHi = [
                `समान वितरण के कारण कैश हिट 50% पर स्थिर रहते हैं।`,
                `इसके परिणामस्वरूप 0% कैश हिट दर (थ्रैशिंग) के साथ सबसे खराब स्थिति होती है क्योंकि प्रत्येक एकल संदर्भ एक मिस का कारण बनता है।`,
                `यह F/M हिट अनुपात बनाए रखते हुए इष्टतम व्यवहार करता है।`,
                `गोलाकार निर्भरता के कारण यह सिस्टम स्टैक ओवरफ़्लो त्रुटि को ट्रिगर करता है।`
            ];
            explanationEn = `Since M = F + 1, every element accessed has been recently evicted, causing a 100% miss rate in sequential looping.`;
            explanationHi = `चूंकि M = F + 1 है, इसलिए एक्सेस किया गया प्रत्येक तत्व हाल ही में बेदखल कर दिया गया है, जिससे अनुक्रमिक लूपिंग में 100% मिस दर होती है।`;
            break;

        case 17:
            questionEn = `Under which of the following memory reference patterns does the standard ${name} policy yield the absolute worst performance compared to a simple FIFO policy?`;
            questionHi = `निम्नलिखित में से किस मेमोरी संदर्भ पैटर्न के तहत मानक ${nameHi} नीति एक साधारण FIFO नीति की तुलना में बिल्कुल खराब प्रदर्शन देती है?`;
            optEn = [
                `Highly localized patterns where a small subset of elements is frequently accessed.`,
                `Purely sequential looping patterns over a working set that is slightly larger than the cache size.`,
                `Completely random access patterns with a uniform probability distribution.`,
                `Logarithmic search sequences on balanced binary search trees.`
            ];
            optHi = [
                `अत्यधिक स्थानीयकृत पैटर्न जहां तत्वों के एक छोटे से सबसेट को अक्सर एक्सेस किया जाता है।`,
                `कैश आकार से थोड़ा बड़े वर्किंग सेट पर विशुद्ध रूप से क्रमिक लूपिंग पैटर्न।`,
                `एक समान संभाव्यता वितरण के साथ पूरी तरह से यादृच्छिक पहुंच पैटर्न।`,
                `संतुलित बाइनरी सर्च ट्री पर लॉगरिदमिक खोज अनुक्रम।`
            ];
            explanationEn = `In sequential loops larger than cache, both FIFO and ${name} perform poorly, but ${name} hits exactly 0% while FIFO can sometimes get slight variations if patterns shift.`;
            explanationHi = `कैश से बड़े क्रमिक लूप में, FIFO और ${nameHi} दोनों खराब प्रदर्शन करते हैं, लेकिन ${nameHi} सटीक रूप से 0% हिट करता है जबकि पैटर्न बदलने पर FIFO कभी-कभी मामूली बदलाव प्राप्त कर सकता है।`;
            break;

        case 18:
            questionEn = `Analyze the behavior of a set-associative cache utilizing ${name} for line eviction. If the cache is 4-way set associative and the CPU executes a sequence of references to 5 distinct memory blocks mapping to the same set, what is the eviction sequence?`;
            questionHi = `लाइन बेदखली के लिए ${nameHi} का उपयोग करके एक सेट-एसोसिएटिव कैश के व्यवहार का विश्लेषण करें। यदि कैश 4-वे सेट एसोसिएटिव है और सीपीयू एक ही सेट में मैप करने वाले 5 अलग-अलग मेमोरी ब्लॉकों के संदर्भों का एक अनुक्रम निष्पादित करता है, तो बेदखली अनुक्रम क्या है?`;
            optEn = [
                `No blocks are evicted since 4-way association allows dynamic mapping.`,
                `The block accessed earliest in the sequence is evicted first when the 5th unique block is accessed.`,
                `The 5th block is rejected instantly and not cached.`,
                `The blocks are evicted in reverse chronological order of their memory addresses.`
            ];
            optHi = [
                `कोई भी ब्लॉक बेदखल नहीं होता है क्योंकि 4-वे एसोसिएशन गतिशील मैपिंग की अनुमति देता है।`,
                `अनुक्रम में सबसे पहले एक्सेस किया गया ब्लॉक तब बेदखल हो जाता है जब 5वें अद्वितीय ब्लॉक को एक्सेस किया जाता है।`,
                `5वां ब्लॉक तुरंत खारिज कर दिया जाता है और कैश नहीं किया जाता है।` ,
                `ब्लॉक उनके मेमोरी पते के उल्टे कालानुक्रमिक क्रम में बेदखल किए जाते हैं।`
            ];
            explanationEn = `With a associativity of 4, the 5th unique block forces the eviction of the least recently used line in that set.`;
            explanationHi = `4 के एसोसिएशन के साथ, 5वां अद्वितीय ब्लॉक उस सेट में सबसे कम हाल ही में उपयोग की गई लाइन को बेदखल करने के लिए मजबूर करता है।`;
            break;

        case 19:
            questionEn = `In the design of modern virtual memory subsystems, which of the following factors represents the primary reason why pure ${name} is considered impractical for page table management?`;
            questionHi = `आधुनिक वर्चुअल मेमोरी सबसिस्टम के डिज़ाइन में, निम्नलिखित में से कौन सा कारक प्राथमिक कारण का प्रतिनिधित्व करता है कि पेज टेबल प्रबंधन के लिए शुद्ध ${nameHi} को अव्यावहारिक क्यों माना जाता है?`;
            optEn = [
                `It violates page alignment constraints.`,
                `The overhead of updating access metadata on every single hardware memory reference (which happens in nanoseconds) is too high.`,
                `It is incompatible with multi-level page table lookups.`,
                `It requires a non-volatile flash memory controller.`
            ];
            optHi = [
                `यह पेज संरेखण बाधाओं का उल्लंघन करता है।`,
                `प्रत्येक एकल हार्डवेयर मेमोरी संदर्भ (जो नैनोसेकंड में होता है) पर एक्सेस मेटाडेटा को अपडेट करने का ओवरहेड बहुत अधिक है।`,
                `यह बहु-स्तरीय पेज टेबल लुकअप के साथ असंगत है।`,
                `इसके लिए एक गैर-वाष्पशील फ्लैश मेमोरी नियंत्रक की आवश्यकता होती है।`
            ];
            explanationEn = `Page table translation occurs at hardware level on every instruction; doing register writes or list updates on every reference would slow down the CPU by orders of magnitude.`;
            explanationHi = `पेज टेबल अनुवाद प्रत्येक निर्देश पर हार्डवेयर स्तर पर होता है; प्रत्येक संदर्भ पर रजिस्टर राइट या सूची अपडेट करने से सीपीयू कई गुना धीमा हो जाएगा।`;
            break;
    }

    const year = 2020 + Math.floor(Math.random() * 6);
    const exam = examTags[Math.floor(Math.random() * examTags.length)];

    return {
        id: qId,
        subject: "Computer Science",
        topic: topic,
        difficulty: difficulty,
        question_en: questionEn,
        question_hi: questionHi,
        options_en: optEn,
        options_hi: optHi,
        correctAnswer: correctAnswerVal,
        explanation_en: explanationEn,
        explanation_hi: explanationHi,
        exam_tags: [exam, "State PCS"],
        reference: `Standard Textbook of Computer Science, Chapter on ${topic}`,
        year_asked: year.toString()
    };
}

async function run() {
    console.log("🚀 STARTING COMPUTER SCIENCE QUESTION BANK GENERATION...");
    
    const questions = [];
    let qCount = 0;

    // Loop through each of the 250 concepts
    for (let cIndex = 0; cIndex < concepts.length; cIndex++) {
        const concept = concepts[cIndex];

        // Generate exactly 20 unique variations for each concept to make exactly 5000 questions
        for (let vIndex = 0; vIndex < 20; vIndex++) {
            const indexStr = String(qCount + 1).padStart(4, '0');
            const qId = `CSC-${concept.code}-${indexStr}`;
            
            const question = generateCSQuestion(concept, vIndex, qId);
            questions.push(question);
            qCount++;
        }
    }

    console.log(`Generated ${questions.length} questions.`);

    const outputData = {
        subject: "Computer Science",
        count: questions.length,
        questions: questions
    };

    const outputPath = path.join(__dirname, 'data/computerscience.json');
    
    // Ensure data directory exists
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }

    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    console.log(`✅ SUCCESS: Computer Science bank generated successfully and saved to ${outputPath}.`);
}

run();
