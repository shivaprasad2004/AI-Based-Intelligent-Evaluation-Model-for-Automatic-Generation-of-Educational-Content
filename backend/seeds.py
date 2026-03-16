import json
from utils.db import db
from models.category import Category, PreviousYearQuestion
from models.topic import Topic
from models.question import Question

def seed_database():
    """Seed categories, topics, and sample PYQs if database is empty."""
    if Category.query.first():
        return  # Already seeded

    categories_data = [
        {
            'name': 'Mathematics',
            'slug': 'mathematics',
            'icon': 'M',
            'description': 'Algebra, Calculus, Geometry, Statistics and more',
            'target_audience': 'all',
            'sort_order': 1,
            'topics': [
                {'name': 'Algebra', 'description': 'Equations, inequalities, polynomials and algebraic structures', 'tags': 'algebra,equations,polynomials'},
                {'name': 'Calculus', 'description': 'Limits, derivatives, integrals and differential equations', 'tags': 'calculus,derivatives,integrals'},
                {'name': 'Geometry', 'description': 'Shapes, angles, theorems and spatial reasoning', 'tags': 'geometry,shapes,angles,theorems'},
                {'name': 'Statistics', 'description': 'Probability, distributions, hypothesis testing and data analysis', 'tags': 'statistics,probability,data'},
                {'name': 'Trigonometry', 'description': 'Trigonometric functions, identities and equations', 'tags': 'trigonometry,sin,cos,tan'},
                {'name': 'Number Theory', 'description': 'Prime numbers, divisibility and modular arithmetic', 'tags': 'numbers,primes,divisibility'},
            ]
        },
        {
            'name': 'Science',
            'slug': 'science',
            'icon': 'S',
            'description': 'Physics, Chemistry, Biology and Environmental Science',
            'target_audience': 'all',
            'sort_order': 2,
            'topics': [
                {'name': 'Physics', 'description': 'Mechanics, thermodynamics, electromagnetism and optics', 'tags': 'physics,mechanics,energy'},
                {'name': 'Chemistry', 'description': 'Organic, inorganic and physical chemistry', 'tags': 'chemistry,elements,reactions'},
                {'name': 'Biology', 'description': 'Cell biology, genetics, ecology and evolution', 'tags': 'biology,cells,genetics'},
                {'name': 'Environmental Science', 'description': 'Ecosystems, climate change and sustainability', 'tags': 'environment,ecology,climate'},
            ]
        },
        {
            'name': 'Programming',
            'slug': 'programming',
            'icon': 'P',
            'description': 'Python, Java, C++, JavaScript, Data Structures and more',
            'target_audience': 'all',
            'sort_order': 3,
            'topics': [
                {'name': 'Python', 'description': 'Python fundamentals, OOP, data structures and libraries', 'tags': 'python,programming,oop'},
                {'name': 'Java', 'description': 'Java basics, OOP concepts, collections and multithreading', 'tags': 'java,oop,collections'},
                {'name': 'C++', 'description': 'C++ fundamentals, STL, pointers and memory management', 'tags': 'cpp,stl,pointers'},
                {'name': 'JavaScript', 'description': 'ES6+, DOM manipulation, async programming and frameworks', 'tags': 'javascript,web,async'},
                {'name': 'Data Structures', 'description': 'Arrays, linked lists, trees, graphs and hash tables', 'tags': 'dsa,arrays,trees,graphs'},
                {'name': 'Algorithms', 'description': 'Sorting, searching, dynamic programming and greedy algorithms', 'tags': 'algorithms,sorting,dp'},
                {'name': 'SQL & Databases', 'description': 'SQL queries, normalization, joins and database design', 'tags': 'sql,database,queries'},
            ]
        },
        {
            'name': 'Computer Science',
            'slug': 'computer-science',
            'icon': 'C',
            'description': 'Operating Systems, Networking, AI/ML and more',
            'target_audience': 'college',
            'sort_order': 4,
            'topics': [
                {'name': 'Operating Systems', 'description': 'Process management, memory, file systems and scheduling', 'tags': 'os,process,memory'},
                {'name': 'Computer Networks', 'description': 'TCP/IP, OSI model, routing and network security', 'tags': 'networking,tcp,protocols'},
                {'name': 'Artificial Intelligence', 'description': 'Search algorithms, knowledge representation and machine learning basics', 'tags': 'ai,ml,search'},
                {'name': 'Database Management', 'description': 'RDBMS, normalization, transactions and indexing', 'tags': 'dbms,normalization,sql'},
            ]
        },
        {
            'name': 'General Knowledge',
            'slug': 'general-knowledge',
            'icon': 'G',
            'description': 'History, Geography, Current Affairs and Aptitude',
            'target_audience': 'all',
            'sort_order': 5,
            'topics': [
                {'name': 'World History', 'description': 'Ancient civilizations, world wars, and modern history', 'tags': 'history,wars,civilizations'},
                {'name': 'Geography', 'description': 'Physical geography, countries, capitals and maps', 'tags': 'geography,countries,maps'},
                {'name': 'Current Affairs', 'description': 'Recent events, politics and global developments', 'tags': 'current,affairs,news'},
                {'name': 'Aptitude & Reasoning', 'description': 'Logical reasoning, quantitative aptitude and verbal ability', 'tags': 'aptitude,reasoning,logic'},
            ]
        },
    ]

    topic_map = {}  # name -> Topic object for PYQ seeding

    for cat_data in categories_data:
        topics_list = cat_data.pop('topics')
        category = Category(**cat_data)
        db.session.add(category)
        db.session.flush()

        for t_data in topics_list:
            topic = Topic(
                name=t_data['name'],
                description=t_data['description'],
                tags=t_data['tags'],
                category_id=category.id,
                is_system=True
            )
            db.session.add(topic)
            db.session.flush()
            topic_map[t_data['name']] = topic

    # Seed sample PYQs
    pyqs_data = [
        {
            'topic': 'Algebra',
            'questions': [
                {'exam_name': 'JEE Main', 'year': 2023, 'question_text': 'If the roots of x^2 - 5x + 6 = 0 are a and b, find a^2 + b^2.', 'options': ['11', '13', '15', '17'], 'correct_answer': '13', 'explanation': 'a+b=5, ab=6. a^2+b^2 = (a+b)^2 - 2ab = 25-12 = 13', 'difficulty': 3},
                {'exam_name': 'JEE Main', 'year': 2022, 'question_text': 'Solve for x: 3x + 7 = 22', 'options': ['3', '5', '7', '9'], 'correct_answer': '5', 'explanation': '3x = 22-7 = 15, x = 5', 'difficulty': 1},
                {'exam_name': 'GATE', 'year': 2023, 'question_text': 'Find the determinant of matrix [[1,2],[3,4]]', 'options': ['-2', '2', '-1', '1'], 'correct_answer': '-2', 'explanation': 'det = (1)(4) - (2)(3) = 4-6 = -2', 'difficulty': 2},
            ]
        },
        {
            'topic': 'Physics',
            'questions': [
                {'exam_name': 'JEE Main', 'year': 2023, 'question_text': 'A body of mass 2 kg is moving with velocity 3 m/s. What is its kinetic energy?', 'options': ['6 J', '9 J', '12 J', '18 J'], 'correct_answer': '9 J', 'explanation': 'KE = 1/2mv^2 = 1/2(2)(3)^2 = 9 J', 'difficulty': 2},
                {'exam_name': 'NEET', 'year': 2023, 'question_text': 'The SI unit of electric current is:', 'options': ['Volt', 'Ampere', 'Ohm', 'Watt'], 'correct_answer': 'Ampere', 'explanation': 'The SI unit of electric current is Ampere (A).', 'difficulty': 1},
            ]
        },
        {
            'topic': 'Python',
            'questions': [
                {'exam_name': 'GATE CS', 'year': 2023, 'question_text': 'What is the output of print(type([]) is list)?', 'options': ['True', 'False', 'Error', 'None'], 'correct_answer': 'True', 'explanation': 'type([]) returns <class \'list\'>, which is the list class itself.', 'difficulty': 2},
                {'exam_name': 'GATE CS', 'year': 2022, 'question_text': 'Which of these is NOT a valid Python data type?', 'options': ['int', 'float', 'char', 'str'], 'correct_answer': 'char', 'explanation': 'Python does not have a char type. Single characters are strings of length 1.', 'difficulty': 1},
            ]
        },
        {
            'topic': 'Java',
            'questions': [
                {'exam_name': 'GATE CS', 'year': 2023, 'question_text': 'Which keyword is used to inherit a class in Java?', 'options': ['implements', 'extends', 'inherits', 'super'], 'correct_answer': 'extends', 'explanation': 'The extends keyword is used for class inheritance in Java.', 'difficulty': 1},
                {'exam_name': 'GATE CS', 'year': 2022, 'question_text': 'What is the default value of an int variable in Java?', 'options': ['0', '1', 'null', 'undefined'], 'correct_answer': '0', 'explanation': 'The default value of int in Java is 0.', 'difficulty': 1},
            ]
        },
        {
            'topic': 'Data Structures',
            'questions': [
                {'exam_name': 'GATE CS', 'year': 2023, 'question_text': 'What is the time complexity of searching in a balanced BST?', 'options': ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], 'correct_answer': 'O(log n)', 'explanation': 'A balanced BST has height O(log n), so search takes O(log n).', 'difficulty': 3},
                {'exam_name': 'GATE CS', 'year': 2022, 'question_text': 'Which data structure uses FIFO order?', 'options': ['Stack', 'Queue', 'Tree', 'Graph'], 'correct_answer': 'Queue', 'explanation': 'Queue follows First-In-First-Out (FIFO) ordering.', 'difficulty': 1},
            ]
        },
        {
            'topic': 'Chemistry',
            'questions': [
                {'exam_name': 'NEET', 'year': 2023, 'question_text': 'What is the atomic number of Carbon?', 'options': ['4', '6', '8', '12'], 'correct_answer': '6', 'explanation': 'Carbon has 6 protons, so its atomic number is 6.', 'difficulty': 1},
                {'exam_name': 'JEE Main', 'year': 2023, 'question_text': 'Which type of bond is formed between Na and Cl in NaCl?', 'options': ['Covalent', 'Ionic', 'Metallic', 'Hydrogen'], 'correct_answer': 'Ionic', 'explanation': 'NaCl is formed by transfer of electrons from Na to Cl, creating an ionic bond.', 'difficulty': 2},
            ]
        },
    ]

    for pyq_group in pyqs_data:
        topic = topic_map.get(pyq_group['topic'])
        if not topic:
            continue
        for q in pyq_group['questions']:
            pyq = PreviousYearQuestion(
                topic_id=topic.id,
                exam_name=q['exam_name'],
                year=q['year'],
                question_text=q['question_text'],
                options_json=json.dumps(q['options']) if q.get('options') else None,
                correct_answer=q['correct_answer'],
                explanation=q.get('explanation'),
                difficulty=q.get('difficulty', 3)
            )
            db.session.add(pyq)

    db.session.commit()
    print("Database seeded successfully!")


def seed_expanded_subjects():
    """Add 20 additional education subjects with 15-25 chapters each."""
    # Check if expanded subjects already exist
    if Category.query.filter_by(slug='economics').first():
        return  # Already seeded expanded subjects

    existing_slugs = {c.slug for c in Category.query.all()}

    expanded_categories = [
        {
            'name': 'Economics',
            'slug': 'economics',
            'icon': 'E',
            'description': 'Microeconomics, Macroeconomics, International Trade and more',
            'target_audience': 'all',
            'sort_order': 6,
            'topics': [
                {'name': 'Microeconomics', 'description': 'Supply and demand, market structures and consumer behavior', 'tags': 'micro,supply,demand'},
                {'name': 'Macroeconomics', 'description': 'GDP, inflation, unemployment and fiscal policy', 'tags': 'macro,gdp,inflation'},
                {'name': 'International Trade', 'description': 'Trade theories, tariffs, exchange rates and globalization', 'tags': 'trade,tariffs,globalization'},
                {'name': 'Public Finance', 'description': 'Government budgeting, taxation and public expenditure', 'tags': 'finance,tax,budget'},
                {'name': 'Money and Banking', 'description': 'Monetary policy, central banks and financial markets', 'tags': 'money,banking,monetary'},
                {'name': 'Indian Economy', 'description': 'Five year plans, economic reforms and development challenges', 'tags': 'india,economy,development'},
                {'name': 'Development Economics', 'description': 'Poverty, inequality, human development and growth models', 'tags': 'development,poverty,growth'},
                {'name': 'Econometrics', 'description': 'Statistical methods, regression analysis and economic modeling', 'tags': 'econometrics,regression,statistics'},
                {'name': 'Agricultural Economics', 'description': 'Farm management, rural development and food security', 'tags': 'agriculture,rural,farming'},
                {'name': 'Environmental Economics', 'description': 'Externalities, pollution control and sustainable development', 'tags': 'environment,sustainability,pollution'},
                {'name': 'Labor Economics', 'description': 'Wages, employment, labor markets and trade unions', 'tags': 'labor,wages,employment'},
                {'name': 'Industrial Economics', 'description': 'Industrial organization, market concentration and regulation', 'tags': 'industry,market,regulation'},
                {'name': 'Financial Economics', 'description': 'Capital markets, portfolio theory and risk management', 'tags': 'financial,portfolio,risk'},
                {'name': 'Behavioral Economics', 'description': 'Cognitive biases, decision making and nudge theory', 'tags': 'behavioral,bias,decision'},
                {'name': 'History of Economic Thought', 'description': 'Classical, Keynesian, monetarist and modern economic schools', 'tags': 'history,keynesian,classical'},
            ]
        },
        {
            'name': 'English Literature',
            'slug': 'english-literature',
            'icon': 'E',
            'description': 'Poetry, Prose, Drama, Grammar and Literary Criticism',
            'target_audience': 'all',
            'sort_order': 7,
            'topics': [
                {'name': 'English Grammar', 'description': 'Parts of speech, tenses, clauses and sentence structure', 'tags': 'grammar,tenses,syntax'},
                {'name': 'Shakespearean Literature', 'description': 'Major plays, sonnets and Elizabethan drama', 'tags': 'shakespeare,drama,sonnets'},
                {'name': 'Romantic Poetry', 'description': 'Wordsworth, Keats, Shelley and the Romantic movement', 'tags': 'poetry,romantic,wordsworth'},
                {'name': 'Modern English Poetry', 'description': 'T.S. Eliot, W.B. Yeats, Robert Frost and contemporary poets', 'tags': 'poetry,modern,eliot'},
                {'name': 'English Prose & Fiction', 'description': 'Novels, short stories and narrative techniques', 'tags': 'prose,fiction,novels'},
                {'name': 'Literary Criticism', 'description': 'Critical theories, structuralism, feminism and postcolonialism', 'tags': 'criticism,theory,analysis'},
                {'name': 'Essay Writing', 'description': 'Argumentative, descriptive, narrative and expository essays', 'tags': 'essay,writing,composition'},
                {'name': 'Comprehension & Vocabulary', 'description': 'Reading comprehension, synonyms, antonyms and word usage', 'tags': 'vocabulary,comprehension,reading'},
                {'name': 'Indian English Literature', 'description': 'R.K. Narayan, Arundhati Roy, Salman Rushdie and Indian voices', 'tags': 'indian,literature,narayan'},
                {'name': 'American Literature', 'description': 'Mark Twain, Hemingway, Fitzgerald and the American novel', 'tags': 'american,twain,fitzgerald'},
                {'name': 'Drama & Theatre', 'description': 'Greek tragedy, absurdist drama and modern theatre', 'tags': 'drama,theatre,tragedy'},
                {'name': 'Figures of Speech', 'description': 'Metaphor, simile, irony, alliteration and literary devices', 'tags': 'figures,metaphor,irony'},
                {'name': 'Communication Skills', 'description': 'Public speaking, presentations and professional communication', 'tags': 'communication,speaking,presentation'},
                {'name': 'Creative Writing', 'description': 'Story writing, poetry composition and creative expression', 'tags': 'creative,writing,story'},
                {'name': 'Phonetics & Linguistics', 'description': 'Phonology, morphology, semantics and language structure', 'tags': 'phonetics,linguistics,language'},
                {'name': 'Victorian Literature', 'description': 'Dickens, Bronte sisters, Hardy and Victorian society', 'tags': 'victorian,dickens,hardy'},
            ]
        },
        {
            'name': 'Physics (Advanced)',
            'slug': 'physics-advanced',
            'icon': 'P',
            'description': 'Mechanics, Electrodynamics, Quantum Physics and Relativity',
            'target_audience': 'college',
            'sort_order': 8,
            'topics': [
                {'name': 'Classical Mechanics', 'description': 'Newton\'s laws, Lagrangian and Hamiltonian mechanics', 'tags': 'mechanics,newton,lagrangian'},
                {'name': 'Electrodynamics', 'description': 'Maxwell\'s equations, electromagnetic waves and radiation', 'tags': 'electrodynamics,maxwell,waves'},
                {'name': 'Quantum Mechanics', 'description': 'Wave functions, Schrodinger equation and quantum states', 'tags': 'quantum,schrodinger,wavefunction'},
                {'name': 'Thermodynamics & Statistical Mechanics', 'description': 'Laws of thermodynamics, entropy and statistical distributions', 'tags': 'thermo,entropy,statistical'},
                {'name': 'Optics', 'description': 'Wave optics, interference, diffraction and polarization', 'tags': 'optics,interference,diffraction'},
                {'name': 'Nuclear Physics', 'description': 'Radioactivity, nuclear reactions and particle physics', 'tags': 'nuclear,radioactivity,particles'},
                {'name': 'Solid State Physics', 'description': 'Crystal structures, band theory and semiconductors', 'tags': 'solidstate,crystal,semiconductor'},
                {'name': 'Special Relativity', 'description': 'Lorentz transformations, time dilation and mass-energy equivalence', 'tags': 'relativity,lorentz,einstein'},
                {'name': 'Waves & Oscillations', 'description': 'SHM, damped oscillations, coupled oscillators and wave equations', 'tags': 'waves,oscillations,shm'},
                {'name': 'Fluid Mechanics', 'description': 'Viscosity, turbulence, Bernoulli\'s principle and fluid dynamics', 'tags': 'fluid,viscosity,bernoulli'},
                {'name': 'Mathematical Physics', 'description': 'Complex analysis, Fourier series and differential equations for physics', 'tags': 'mathematical,fourier,complex'},
                {'name': 'Atomic & Molecular Physics', 'description': 'Atomic spectra, molecular bonding and spectroscopy', 'tags': 'atomic,molecular,spectroscopy'},
                {'name': 'Plasma Physics', 'description': 'Plasma behavior, magnetohydrodynamics and fusion', 'tags': 'plasma,mhd,fusion'},
                {'name': 'Astrophysics', 'description': 'Stellar evolution, cosmology and gravitational physics', 'tags': 'astrophysics,cosmology,stars'},
                {'name': 'Electronics & Instrumentation', 'description': 'Semiconductor devices, circuits and measurement techniques', 'tags': 'electronics,circuits,instrumentation'},
                {'name': 'Computational Physics', 'description': 'Numerical methods, simulation and modeling in physics', 'tags': 'computational,simulation,numerical'},
                {'name': 'Laser Physics', 'description': 'Stimulated emission, laser types and applications', 'tags': 'laser,stimulated,emission'},
            ]
        },
        {
            'name': 'Chemistry (Advanced)',
            'slug': 'chemistry-advanced',
            'icon': 'C',
            'description': 'Organic, Inorganic, Physical and Analytical Chemistry',
            'target_audience': 'college',
            'sort_order': 9,
            'topics': [
                {'name': 'Organic Chemistry - Basics', 'description': 'Hydrocarbons, functional groups and nomenclature', 'tags': 'organic,hydrocarbons,functional'},
                {'name': 'Organic Reactions & Mechanisms', 'description': 'SN1, SN2, elimination, addition and rearrangement reactions', 'tags': 'organic,reactions,mechanisms'},
                {'name': 'Stereochemistry', 'description': 'Chirality, optical isomerism and conformational analysis', 'tags': 'stereochemistry,chirality,isomers'},
                {'name': 'Coordination Chemistry', 'description': 'Ligands, crystal field theory and coordination compounds', 'tags': 'coordination,ligands,cft'},
                {'name': 'Chemical Kinetics', 'description': 'Rate laws, reaction order and activation energy', 'tags': 'kinetics,rate,activation'},
                {'name': 'Chemical Thermodynamics', 'description': 'Enthalpy, entropy, Gibbs free energy and equilibrium', 'tags': 'thermodynamics,enthalpy,gibbs'},
                {'name': 'Electrochemistry', 'description': 'Galvanic cells, electrolysis and Nernst equation', 'tags': 'electrochemistry,galvanic,nernst'},
                {'name': 'Quantum Chemistry', 'description': 'Molecular orbital theory, bonding and computational chemistry', 'tags': 'quantum,molecular,orbital'},
                {'name': 'Spectroscopy', 'description': 'IR, NMR, UV-Vis and mass spectrometry techniques', 'tags': 'spectroscopy,nmr,ir'},
                {'name': 'Polymer Chemistry', 'description': 'Polymerization, types of polymers and industrial applications', 'tags': 'polymer,polymerization,plastic'},
                {'name': 'Surface Chemistry', 'description': 'Adsorption, catalysis, colloids and emulsions', 'tags': 'surface,adsorption,catalysis'},
                {'name': 'Nuclear Chemistry', 'description': 'Radioactive decay, nuclear fission and fusion', 'tags': 'nuclear,radioactive,fission'},
                {'name': 'Analytical Chemistry', 'description': 'Titrations, chromatography and instrumental analysis', 'tags': 'analytical,titration,chromatography'},
                {'name': 'Environmental Chemistry', 'description': 'Air and water pollution, green chemistry and waste management', 'tags': 'environmental,pollution,green'},
                {'name': 'Biochemistry Basics', 'description': 'Amino acids, proteins, enzymes and metabolic pathways', 'tags': 'biochemistry,proteins,enzymes'},
                {'name': 'Solid State Chemistry', 'description': 'Crystal systems, defects, band theory and materials', 'tags': 'solidstate,crystal,materials'},
            ]
        },
        {
            'name': 'Biology (Advanced)',
            'slug': 'biology-advanced',
            'icon': 'B',
            'description': 'Cell Biology, Genetics, Ecology, Biotechnology and Human Physiology',
            'target_audience': 'college',
            'sort_order': 10,
            'topics': [
                {'name': 'Cell Biology', 'description': 'Cell structure, organelles, cell cycle and cell signaling', 'tags': 'cell,organelles,cycle'},
                {'name': 'Molecular Biology', 'description': 'DNA replication, transcription, translation and gene regulation', 'tags': 'molecular,dna,replication'},
                {'name': 'Genetics', 'description': 'Mendelian genetics, linkage, mutations and chromosomal disorders', 'tags': 'genetics,mendel,mutations'},
                {'name': 'Human Physiology', 'description': 'Organ systems, homeostasis, nervous and endocrine systems', 'tags': 'physiology,organs,homeostasis'},
                {'name': 'Plant Biology', 'description': 'Photosynthesis, plant anatomy, growth and reproduction', 'tags': 'plant,photosynthesis,botany'},
                {'name': 'Ecology & Environment', 'description': 'Ecosystems, biodiversity, food chains and conservation', 'tags': 'ecology,biodiversity,ecosystem'},
                {'name': 'Evolution', 'description': 'Natural selection, speciation, phylogenetics and evidence', 'tags': 'evolution,selection,speciation'},
                {'name': 'Biotechnology', 'description': 'Genetic engineering, PCR, cloning and bioinformatics', 'tags': 'biotech,genetic,engineering'},
                {'name': 'Microbiology', 'description': 'Bacteria, viruses, fungi and immunology', 'tags': 'microbiology,bacteria,viruses'},
                {'name': 'Immunology', 'description': 'Immune system, antibodies, vaccines and autoimmunity', 'tags': 'immunology,antibodies,vaccines'},
                {'name': 'Biochemistry', 'description': 'Carbohydrates, lipids, proteins, nucleic acids and enzymes', 'tags': 'biochemistry,carbs,lipids'},
                {'name': 'Developmental Biology', 'description': 'Embryogenesis, morphogenesis and stem cells', 'tags': 'developmental,embryo,stem'},
                {'name': 'Anatomy', 'description': 'Skeletal, muscular, circulatory and respiratory systems', 'tags': 'anatomy,skeletal,muscular'},
                {'name': 'Neuroscience Basics', 'description': 'Neurons, synapses, brain structure and neural pathways', 'tags': 'neuroscience,neurons,brain'},
                {'name': 'Bioinformatics', 'description': 'Sequence analysis, genome databases and computational biology', 'tags': 'bioinformatics,genome,sequence'},
                {'name': 'Biostatistics', 'description': 'Statistical methods in biology, clinical trials and epidemiology', 'tags': 'biostatistics,trials,epidemiology'},
                {'name': 'Marine Biology', 'description': 'Ocean ecosystems, marine organisms and coral reefs', 'tags': 'marine,ocean,coral'},
            ]
        },
        {
            'name': 'History',
            'slug': 'history',
            'icon': 'H',
            'description': 'Ancient, Medieval, Modern History and Indian History',
            'target_audience': 'all',
            'sort_order': 11,
            'topics': [
                {'name': 'Ancient Indian History', 'description': 'Indus Valley civilization, Vedic period, Maurya and Gupta empires', 'tags': 'ancient,india,maurya'},
                {'name': 'Medieval Indian History', 'description': 'Delhi Sultanate, Mughal Empire and Vijayanagara', 'tags': 'medieval,mughal,sultanate'},
                {'name': 'Modern Indian History', 'description': 'British rule, freedom struggle, independence and partition', 'tags': 'modern,freedom,independence'},
                {'name': 'Ancient World History', 'description': 'Mesopotamia, Egypt, Greece and Roman civilizations', 'tags': 'ancient,world,civilizations'},
                {'name': 'Medieval World History', 'description': 'Feudalism, Crusades, Renaissance and Reformation', 'tags': 'medieval,renaissance,crusades'},
                {'name': 'World War I', 'description': 'Causes, major battles, treaties and aftermath of WWI', 'tags': 'ww1,war,treaties'},
                {'name': 'World War II', 'description': 'Rise of fascism, major campaigns, Holocaust and aftermath', 'tags': 'ww2,fascism,holocaust'},
                {'name': 'Cold War Era', 'description': 'US-USSR rivalry, proxy wars, space race and détente', 'tags': 'coldwar,ussr,nuclear'},
                {'name': 'Indian National Movement', 'description': 'INC, Gandhi, revolutionary movements and constitutionalism', 'tags': 'independence,gandhi,congress'},
                {'name': 'Post-Independence India', 'description': 'Nation building, five year plans and foreign policy', 'tags': 'postindependence,planning,policy'},
                {'name': 'History of Science & Technology', 'description': 'Scientific revolution, industrial revolution and tech evolution', 'tags': 'science,industrial,revolution'},
                {'name': 'Art & Cultural History', 'description': 'Art movements, architecture, music and cultural evolution', 'tags': 'art,culture,architecture'},
                {'name': 'Constitutional History', 'description': 'Evolution of constitutions, magna carta and democratic movements', 'tags': 'constitution,democracy,magna'},
                {'name': 'Economic History', 'description': 'Trade routes, colonial economies and industrial growth', 'tags': 'economic,trade,colonial'},
                {'name': 'Social Reform Movements', 'description': 'Abolition, women\'s rights, caste reform and civil rights', 'tags': 'reform,rights,social'},
            ]
        },
        {
            'name': 'Political Science',
            'slug': 'political-science',
            'icon': 'P',
            'description': 'Indian Constitution, Political Theory, International Relations',
            'target_audience': 'college',
            'sort_order': 12,
            'topics': [
                {'name': 'Indian Constitution', 'description': 'Preamble, fundamental rights, directive principles and amendments', 'tags': 'constitution,rights,amendments'},
                {'name': 'Political Theory', 'description': 'Liberty, equality, justice, democracy and political ideologies', 'tags': 'theory,liberty,democracy'},
                {'name': 'Indian Government & Politics', 'description': 'Parliament, executive, judiciary and state politics', 'tags': 'government,parliament,judiciary'},
                {'name': 'International Relations', 'description': 'Foreign policy, UN, diplomacy and global governance', 'tags': 'international,un,diplomacy'},
                {'name': 'Comparative Politics', 'description': 'Comparison of political systems across countries', 'tags': 'comparative,systems,countries'},
                {'name': 'Public Administration', 'description': 'Bureaucracy, governance, policy making and civil services', 'tags': 'administration,bureaucracy,governance'},
                {'name': 'Political Ideologies', 'description': 'Liberalism, socialism, communism, fascism and feminism', 'tags': 'ideology,liberalism,socialism'},
                {'name': 'Indian Federalism', 'description': 'Centre-state relations, cooperative federalism and local governance', 'tags': 'federalism,centre,state'},
                {'name': 'Electoral Systems', 'description': 'Election commission, voting systems, FPTP and proportional representation', 'tags': 'elections,voting,commission'},
                {'name': 'Human Rights', 'description': 'Universal declaration, NHRC, civil liberties and social justice', 'tags': 'rights,human,nhrc'},
                {'name': 'Local Self Government', 'description': 'Panchayati Raj, municipalities and decentralization', 'tags': 'panchayat,local,decentralization'},
                {'name': 'Foreign Policy of India', 'description': 'Non-alignment, Look East policy and strategic partnerships', 'tags': 'foreign,nonalignment,strategic'},
                {'name': 'Political Sociology', 'description': 'Caste, religion, ethnicity in politics and social movements', 'tags': 'sociology,caste,movements'},
                {'name': 'Constitutional Law', 'description': 'Judicial review, writs, PIL and landmark judgments', 'tags': 'law,judicial,review'},
                {'name': 'Governance & Ethics', 'description': 'Corruption, transparency, RTI and ethical governance', 'tags': 'governance,ethics,transparency'},
            ]
        },
        {
            'name': 'Psychology',
            'slug': 'psychology',
            'icon': 'Ψ',
            'description': 'Cognitive, Developmental, Social and Clinical Psychology',
            'target_audience': 'college',
            'sort_order': 13,
            'topics': [
                {'name': 'Introduction to Psychology', 'description': 'History, approaches, research methods and schools of thought', 'tags': 'intro,history,approaches'},
                {'name': 'Cognitive Psychology', 'description': 'Perception, memory, attention, language and problem solving', 'tags': 'cognitive,memory,attention'},
                {'name': 'Developmental Psychology', 'description': 'Child development, Piaget, Erikson and lifespan development', 'tags': 'developmental,piaget,child'},
                {'name': 'Social Psychology', 'description': 'Attitudes, conformity, group dynamics and social influence', 'tags': 'social,conformity,group'},
                {'name': 'Abnormal Psychology', 'description': 'Mental disorders, DSM classification and psychopathology', 'tags': 'abnormal,disorders,dsm'},
                {'name': 'Clinical Psychology', 'description': 'Therapy, CBT, psychoanalysis and mental health treatment', 'tags': 'clinical,therapy,cbt'},
                {'name': 'Biological Psychology', 'description': 'Brain structure, neurotransmitters, hormones and behavior', 'tags': 'biological,brain,neurotransmitters'},
                {'name': 'Personality Psychology', 'description': 'Trait theories, Big Five, psychodynamic and humanistic approaches', 'tags': 'personality,bigfive,traits'},
                {'name': 'Learning & Conditioning', 'description': 'Classical conditioning, operant conditioning and observational learning', 'tags': 'learning,conditioning,pavlov'},
                {'name': 'Motivation & Emotion', 'description': 'Maslow\'s hierarchy, drive theory and emotional regulation', 'tags': 'motivation,maslow,emotion'},
                {'name': 'Research Methods in Psychology', 'description': 'Experimental design, surveys, case studies and ethics', 'tags': 'research,methods,experimental'},
                {'name': 'Industrial/Organizational Psychology', 'description': 'Workplace behavior, leadership, motivation and HR psychology', 'tags': 'organizational,workplace,leadership'},
                {'name': 'Health Psychology', 'description': 'Stress, coping, health behaviors and psychosomatic medicine', 'tags': 'health,stress,coping'},
                {'name': 'Educational Psychology', 'description': 'Learning theories, classroom management and student motivation', 'tags': 'educational,learning,classroom'},
                {'name': 'Positive Psychology', 'description': 'Well-being, resilience, flow and character strengths', 'tags': 'positive,wellbeing,resilience'},
            ]
        },
        {
            'name': 'Electrical Engineering',
            'slug': 'electrical-engineering',
            'icon': 'E',
            'description': 'Circuit Theory, Power Systems, Control Systems and Signals',
            'target_audience': 'college',
            'sort_order': 14,
            'topics': [
                {'name': 'Circuit Theory', 'description': 'KVL, KCL, Thevenin, Norton and AC/DC circuit analysis', 'tags': 'circuit,kvl,kcl,thevenin'},
                {'name': 'Electromagnetic Theory', 'description': 'Maxwell\'s equations, wave propagation and transmission lines', 'tags': 'electromagnetic,maxwell,waves'},
                {'name': 'Power Systems', 'description': 'Generation, transmission, distribution and power grid', 'tags': 'power,generation,grid'},
                {'name': 'Control Systems', 'description': 'Transfer functions, stability, Bode plots and PID controllers', 'tags': 'control,stability,pid'},
                {'name': 'Signals & Systems', 'description': 'Fourier transform, Laplace transform and Z-transform', 'tags': 'signals,fourier,laplace'},
                {'name': 'Digital Electronics', 'description': 'Logic gates, flip-flops, counters and combinational circuits', 'tags': 'digital,logic,gates'},
                {'name': 'Analog Electronics', 'description': 'Transistors, amplifiers, oscillators and op-amps', 'tags': 'analog,transistor,amplifier'},
                {'name': 'Electric Machines', 'description': 'DC motors, AC motors, transformers and generators', 'tags': 'machines,motors,transformers'},
                {'name': 'Power Electronics', 'description': 'Rectifiers, inverters, choppers and converters', 'tags': 'power,rectifier,inverter'},
                {'name': 'Microprocessors & Microcontrollers', 'description': '8085, 8086, Arduino and embedded programming', 'tags': 'microprocessor,arduino,embedded'},
                {'name': 'Communication Systems', 'description': 'AM, FM, digital modulation and wireless communication', 'tags': 'communication,modulation,wireless'},
                {'name': 'Electrical Measurements', 'description': 'Bridges, CRO, transducers and measurement techniques', 'tags': 'measurement,bridges,transducers'},
                {'name': 'Renewable Energy Systems', 'description': 'Solar, wind, hydro and energy storage technologies', 'tags': 'renewable,solar,wind'},
                {'name': 'High Voltage Engineering', 'description': 'Insulation, breakdown mechanisms and testing', 'tags': 'highvoltage,insulation,breakdown'},
                {'name': 'VLSI Design', 'description': 'CMOS technology, chip design and fabrication basics', 'tags': 'vlsi,cmos,chip'},
                {'name': 'DSP - Digital Signal Processing', 'description': 'FIR/IIR filters, FFT and digital filter design', 'tags': 'dsp,fir,fft'},
            ]
        },
        {
            'name': 'Mechanical Engineering',
            'slug': 'mechanical-engineering',
            'icon': 'M',
            'description': 'Thermodynamics, Fluid Mechanics, Manufacturing and Machines',
            'target_audience': 'college',
            'sort_order': 15,
            'topics': [
                {'name': 'Engineering Mechanics', 'description': 'Statics, dynamics, free body diagrams and equilibrium', 'tags': 'mechanics,statics,dynamics'},
                {'name': 'Strength of Materials', 'description': 'Stress, strain, bending, torsion and deflection', 'tags': 'strength,stress,strain'},
                {'name': 'Engineering Thermodynamics', 'description': 'Laws of thermodynamics, cycles and heat engines', 'tags': 'thermo,cycles,engines'},
                {'name': 'Fluid Mechanics & Hydraulics', 'description': 'Fluid statics, dynamics, pipe flow and open channels', 'tags': 'fluid,hydraulics,pipe'},
                {'name': 'Heat Transfer', 'description': 'Conduction, convection, radiation and heat exchangers', 'tags': 'heat,conduction,convection'},
                {'name': 'Theory of Machines', 'description': 'Mechanisms, gears, cams, linkages and vibrations', 'tags': 'machines,gears,mechanisms'},
                {'name': 'Machine Design', 'description': 'Shafts, bearings, springs, fasteners and design principles', 'tags': 'design,shafts,bearings'},
                {'name': 'Manufacturing Processes', 'description': 'Casting, welding, machining and forming operations', 'tags': 'manufacturing,casting,machining'},
                {'name': 'Industrial Engineering', 'description': 'Production planning, quality control and operations research', 'tags': 'industrial,production,quality'},
                {'name': 'Refrigeration & Air Conditioning', 'description': 'Vapor compression, absorption systems and psychrometry', 'tags': 'refrigeration,hvac,compression'},
                {'name': 'IC Engines', 'description': 'Petrol and diesel engines, combustion and performance', 'tags': 'engines,combustion,ic'},
                {'name': 'CAD/CAM', 'description': 'Computer-aided design, manufacturing and 3D modeling', 'tags': 'cad,cam,3dmodeling'},
                {'name': 'Robotics', 'description': 'Robot kinematics, actuators, sensors and automation', 'tags': 'robotics,kinematics,automation'},
                {'name': 'Material Science', 'description': 'Crystal structures, phase diagrams, metals and composites', 'tags': 'materials,metals,composites'},
                {'name': 'Automobile Engineering', 'description': 'Vehicle dynamics, transmission, braking and suspension', 'tags': 'automobile,transmission,braking'},
                {'name': 'Power Plant Engineering', 'description': 'Steam, gas, nuclear and hydro power plants', 'tags': 'powerplant,steam,nuclear'},
                {'name': 'Finite Element Analysis', 'description': 'FEM basics, meshing, boundary conditions and simulation', 'tags': 'fea,fem,simulation'},
                {'name': 'Engineering Drawing', 'description': 'Orthographic projection, isometric views and sectional drawings', 'tags': 'drawing,projection,isometric'},
            ]
        },
        {
            'name': 'Civil Engineering',
            'slug': 'civil-engineering',
            'icon': 'C',
            'description': 'Structural Analysis, Geotechnical, Transportation and Surveying',
            'target_audience': 'college',
            'sort_order': 16,
            'topics': [
                {'name': 'Structural Analysis', 'description': 'Beams, trusses, frames, deflection and influence lines', 'tags': 'structural,beams,trusses'},
                {'name': 'RCC Design', 'description': 'Reinforced concrete design, columns, slabs and footings', 'tags': 'rcc,concrete,reinforced'},
                {'name': 'Steel Structures', 'description': 'Connections, tension members, compression members and design', 'tags': 'steel,connections,members'},
                {'name': 'Geotechnical Engineering', 'description': 'Soil mechanics, bearing capacity, foundations and earth pressure', 'tags': 'geotech,soil,foundations'},
                {'name': 'Fluid Mechanics for Civil', 'description': 'Open channel flow, pipe flow and hydraulic structures', 'tags': 'fluid,channel,hydraulic'},
                {'name': 'Surveying', 'description': 'Chain, compass, plane table, leveling and GPS surveying', 'tags': 'surveying,leveling,gps'},
                {'name': 'Transportation Engineering', 'description': 'Highway design, traffic engineering and pavement design', 'tags': 'transportation,highway,traffic'},
                {'name': 'Environmental Engineering', 'description': 'Water treatment, sewage treatment and solid waste management', 'tags': 'environmental,water,sewage'},
                {'name': 'Building Materials', 'description': 'Cement, concrete, timber, bricks and modern materials', 'tags': 'materials,cement,concrete'},
                {'name': 'Construction Management', 'description': 'Project planning, PERT/CPM, estimation and costing', 'tags': 'construction,planning,estimation'},
                {'name': 'Hydrology', 'description': 'Rainfall, runoff, flood analysis and water resources', 'tags': 'hydrology,rainfall,flood'},
                {'name': 'Irrigation Engineering', 'description': 'Canal design, dams, reservoirs and water distribution', 'tags': 'irrigation,canal,dam'},
                {'name': 'Earthquake Engineering', 'description': 'Seismic analysis, earthquake resistant design and retrofitting', 'tags': 'earthquake,seismic,resistant'},
                {'name': 'Concrete Technology', 'description': 'Mix design, admixtures, curing and durability', 'tags': 'concrete,mix,durability'},
                {'name': 'Remote Sensing & GIS', 'description': 'Satellite imagery, GIS applications and spatial analysis', 'tags': 'gis,remote,spatial'},
            ]
        },
        {
            'name': 'Data Science & ML',
            'slug': 'data-science-ml',
            'icon': 'D',
            'description': 'Machine Learning, Deep Learning, Data Analysis and NLP',
            'target_audience': 'college',
            'sort_order': 17,
            'topics': [
                {'name': 'Introduction to Data Science', 'description': 'Data science workflow, tools, Python/R and data types', 'tags': 'datascience,intro,workflow'},
                {'name': 'Probability & Statistics for DS', 'description': 'Distributions, hypothesis testing, Bayesian statistics', 'tags': 'probability,statistics,bayesian'},
                {'name': 'Data Preprocessing', 'description': 'Data cleaning, feature engineering, normalization and encoding', 'tags': 'preprocessing,cleaning,features'},
                {'name': 'Exploratory Data Analysis', 'description': 'Visualization, Pandas, Matplotlib and Seaborn', 'tags': 'eda,visualization,pandas'},
                {'name': 'Supervised Learning', 'description': 'Linear regression, logistic regression, SVM and decision trees', 'tags': 'supervised,regression,svm'},
                {'name': 'Unsupervised Learning', 'description': 'Clustering, K-means, PCA and dimensionality reduction', 'tags': 'unsupervised,clustering,pca'},
                {'name': 'Deep Learning Fundamentals', 'description': 'Neural networks, backpropagation, activation functions', 'tags': 'deeplearning,neural,backprop'},
                {'name': 'Convolutional Neural Networks', 'description': 'Image recognition, CNN architectures and transfer learning', 'tags': 'cnn,image,convolution'},
                {'name': 'Recurrent Neural Networks', 'description': 'Sequence models, LSTM, GRU and time series prediction', 'tags': 'rnn,lstm,sequence'},
                {'name': 'Natural Language Processing', 'description': 'Tokenization, embeddings, sentiment analysis and transformers', 'tags': 'nlp,tokenization,transformers'},
                {'name': 'Ensemble Methods', 'description': 'Random forests, gradient boosting, XGBoost and stacking', 'tags': 'ensemble,randomforest,xgboost'},
                {'name': 'Model Evaluation & Tuning', 'description': 'Cross-validation, hyperparameter tuning and metrics', 'tags': 'evaluation,crossvalidation,tuning'},
                {'name': 'Recommendation Systems', 'description': 'Collaborative filtering, content-based and hybrid systems', 'tags': 'recommendation,collaborative,filtering'},
                {'name': 'Computer Vision', 'description': 'Object detection, image segmentation and GANs', 'tags': 'vision,detection,segmentation'},
                {'name': 'Reinforcement Learning', 'description': 'Q-learning, policy gradient, Markov decision processes', 'tags': 'reinforcement,qlearning,mdp'},
                {'name': 'Big Data Technologies', 'description': 'Hadoop, Spark, MapReduce and distributed computing', 'tags': 'bigdata,hadoop,spark'},
                {'name': 'MLOps & Deployment', 'description': 'Model deployment, Docker, APIs and monitoring', 'tags': 'mlops,deployment,docker'},
                {'name': 'Generative AI', 'description': 'LLMs, GPT, diffusion models and prompt engineering', 'tags': 'generative,llm,gpt'},
            ]
        },
        {
            'name': 'Accountancy & Finance',
            'slug': 'accountancy-finance',
            'icon': 'A',
            'description': 'Financial Accounting, Cost Accounting, Taxation and Corporate Finance',
            'target_audience': 'college',
            'sort_order': 18,
            'topics': [
                {'name': 'Financial Accounting', 'description': 'Journal entries, ledger, trial balance and financial statements', 'tags': 'accounting,journal,ledger'},
                {'name': 'Cost Accounting', 'description': 'Cost classification, job costing, process costing and CVP analysis', 'tags': 'cost,costing,cvp'},
                {'name': 'Management Accounting', 'description': 'Budgeting, variance analysis, ratio analysis and decision making', 'tags': 'management,budgeting,variance'},
                {'name': 'Corporate Finance', 'description': 'Capital structure, dividend policy, WACC and valuation', 'tags': 'corporate,capital,wacc'},
                {'name': 'Income Tax', 'description': 'Tax slabs, deductions, exemptions and ITR filing', 'tags': 'tax,income,deductions'},
                {'name': 'GST', 'description': 'GST structure, input tax credit, returns and compliance', 'tags': 'gst,tax,compliance'},
                {'name': 'Auditing', 'description': 'Audit procedures, internal control, vouching and verification', 'tags': 'auditing,internal,control'},
                {'name': 'Financial Management', 'description': 'Working capital, capital budgeting and financial planning', 'tags': 'financial,capital,budgeting'},
                {'name': 'Banking & Insurance', 'description': 'Banking operations, types of insurance and regulatory framework', 'tags': 'banking,insurance,regulatory'},
                {'name': 'Stock Market & Investments', 'description': 'Equity, mutual funds, derivatives and portfolio management', 'tags': 'stock,mutual,derivatives'},
                {'name': 'Company Law', 'description': 'Companies Act, incorporation, meetings and winding up', 'tags': 'company,law,incorporation'},
                {'name': 'Partnership Accounts', 'description': 'Admission, retirement, dissolution and profit sharing', 'tags': 'partnership,admission,dissolution'},
                {'name': 'Depreciation & Amortization', 'description': 'Methods of depreciation, asset valuation and impairment', 'tags': 'depreciation,asset,valuation'},
                {'name': 'Financial Statements Analysis', 'description': 'Ratio analysis, trend analysis and comparative statements', 'tags': 'analysis,ratios,statements'},
                {'name': 'International Accounting', 'description': 'IFRS, cross-border transactions and foreign currency accounting', 'tags': 'ifrs,international,currency'},
            ]
        },
        {
            'name': 'Business Studies',
            'slug': 'business-studies',
            'icon': 'B',
            'description': 'Management, Marketing, Entrepreneurship and Business Environment',
            'target_audience': 'all',
            'sort_order': 19,
            'topics': [
                {'name': 'Principles of Management', 'description': 'Planning, organizing, staffing, directing and controlling', 'tags': 'management,planning,organizing'},
                {'name': 'Business Environment', 'description': 'Economic, political, legal and technological environment', 'tags': 'environment,economic,legal'},
                {'name': 'Marketing Management', 'description': 'Marketing mix, STP, branding and consumer behavior', 'tags': 'marketing,branding,consumer'},
                {'name': 'Human Resource Management', 'description': 'Recruitment, training, performance appraisal and compensation', 'tags': 'hr,recruitment,training'},
                {'name': 'Entrepreneurship', 'description': 'Startup ecosystem, business plans, funding and innovation', 'tags': 'entrepreneurship,startup,innovation'},
                {'name': 'Financial Markets', 'description': 'Stock exchanges, SEBI, money market and capital market', 'tags': 'financial,stock,sebi'},
                {'name': 'Business Ethics', 'description': 'Corporate governance, CSR, ethical practices and sustainability', 'tags': 'ethics,csr,governance'},
                {'name': 'Operations Management', 'description': 'Production planning, supply chain, inventory and quality', 'tags': 'operations,supply,inventory'},
                {'name': 'Strategic Management', 'description': 'SWOT analysis, competitive strategy and business models', 'tags': 'strategy,swot,competitive'},
                {'name': 'Organizational Behavior', 'description': 'Motivation, leadership, team dynamics and organizational culture', 'tags': 'organizational,motivation,leadership'},
                {'name': 'International Business', 'description': 'Globalization, MNCs, trade barriers and foreign investment', 'tags': 'international,globalization,mnc'},
                {'name': 'E-Commerce', 'description': 'Online business models, digital marketing and e-payments', 'tags': 'ecommerce,digital,online'},
                {'name': 'Consumer Protection', 'description': 'Consumer rights, redressal mechanisms and consumer courts', 'tags': 'consumer,rights,protection'},
                {'name': 'Project Management', 'description': 'Agile, Scrum, risk management and project lifecycle', 'tags': 'project,agile,scrum'},
                {'name': 'Business Communication', 'description': 'Written, verbal, non-verbal communication and presentations', 'tags': 'communication,verbal,written'},
                {'name': 'Business Law', 'description': 'Contract Act, Sale of Goods Act and partnership law', 'tags': 'law,contract,partnership'},
            ]
        },
        {
            'name': 'Sociology',
            'slug': 'sociology',
            'icon': 'S',
            'description': 'Social Institutions, Stratification, Research Methods and Indian Society',
            'target_audience': 'college',
            'sort_order': 20,
            'topics': [
                {'name': 'Introduction to Sociology', 'description': 'Social groups, culture, socialization and social interaction', 'tags': 'intro,groups,culture'},
                {'name': 'Sociological Thinkers', 'description': 'Marx, Weber, Durkheim, Parsons and modern sociologists', 'tags': 'thinkers,marx,weber'},
                {'name': 'Social Stratification', 'description': 'Class, caste, gender inequality and social mobility', 'tags': 'stratification,class,caste'},
                {'name': 'Indian Society', 'description': 'Caste system, tribal communities, religious diversity and kinship', 'tags': 'india,caste,tribal'},
                {'name': 'Family & Marriage', 'description': 'Types of family, marriage systems, divorce and kinship', 'tags': 'family,marriage,kinship'},
                {'name': 'Religion & Society', 'description': 'Secularism, religious movements and religion in modern world', 'tags': 'religion,secularism,movements'},
                {'name': 'Social Change & Development', 'description': 'Modernization, urbanization, globalization and development', 'tags': 'change,modernization,urbanization'},
                {'name': 'Gender & Society', 'description': 'Feminism, gender roles, women\'s movements and patriarchy', 'tags': 'gender,feminism,patriarchy'},
                {'name': 'Education & Society', 'description': 'Social functions of education, equality and educational policy', 'tags': 'education,equality,policy'},
                {'name': 'Social Research Methods', 'description': 'Surveys, interviews, ethnography and statistical analysis', 'tags': 'research,surveys,ethnography'},
                {'name': 'Deviance & Social Control', 'description': 'Crime, punishment, labeling theory and social norms', 'tags': 'deviance,crime,control'},
                {'name': 'Urban Sociology', 'description': 'Urbanization, slums, city planning and urban problems', 'tags': 'urban,city,slums'},
                {'name': 'Rural Sociology', 'description': 'Agrarian structures, land reforms and rural development', 'tags': 'rural,agrarian,land'},
                {'name': 'Population & Demography', 'description': 'Population growth, migration, census and demographic transition', 'tags': 'population,migration,demography'},
                {'name': 'Media & Society', 'description': 'Mass media, social media, propaganda and media effects', 'tags': 'media,social,propaganda'},
            ]
        },
        {
            'name': 'Philosophy',
            'slug': 'philosophy',
            'icon': 'Φ',
            'description': 'Ethics, Logic, Metaphysics and Indian & Western Philosophy',
            'target_audience': 'college',
            'sort_order': 21,
            'topics': [
                {'name': 'Introduction to Philosophy', 'description': 'Nature of philosophy, branches and major questions', 'tags': 'intro,branches,questions'},
                {'name': 'Ethics & Moral Philosophy', 'description': 'Utilitarianism, deontology, virtue ethics and applied ethics', 'tags': 'ethics,moral,utilitarianism'},
                {'name': 'Logic & Critical Thinking', 'description': 'Deductive reasoning, inductive reasoning, fallacies and arguments', 'tags': 'logic,reasoning,fallacies'},
                {'name': 'Epistemology', 'description': 'Knowledge, belief, justification, skepticism and perception', 'tags': 'epistemology,knowledge,belief'},
                {'name': 'Metaphysics', 'description': 'Reality, existence, consciousness, free will and causation', 'tags': 'metaphysics,reality,existence'},
                {'name': 'Indian Philosophy', 'description': 'Vedanta, Buddhism, Jainism, Nyaya and Samkhya systems', 'tags': 'indian,vedanta,buddhism'},
                {'name': 'Western Philosophy', 'description': 'Plato, Aristotle, Descartes, Kant, Hegel and modern thinkers', 'tags': 'western,plato,kant'},
                {'name': 'Philosophy of Mind', 'description': 'Consciousness, mind-body problem, AI and personal identity', 'tags': 'mind,consciousness,identity'},
                {'name': 'Political Philosophy', 'description': 'Justice, rights, liberty, state and social contract theory', 'tags': 'political,justice,liberty'},
                {'name': 'Philosophy of Science', 'description': 'Scientific method, falsifiability, paradigm shifts and realism', 'tags': 'science,method,paradigm'},
                {'name': 'Philosophy of Religion', 'description': 'Arguments for God, problem of evil and religious experience', 'tags': 'religion,god,evil'},
                {'name': 'Existentialism', 'description': 'Kierkegaard, Sartre, Camus, freedom and authenticity', 'tags': 'existentialism,sartre,camus'},
                {'name': 'Aesthetics', 'description': 'Beauty, art, taste and philosophy of art criticism', 'tags': 'aesthetics,beauty,art'},
                {'name': 'Contemporary Philosophy', 'description': 'Postmodernism, feminism, environmental ethics and pragmatism', 'tags': 'contemporary,postmodern,feminism'},
                {'name': 'Buddhist Philosophy', 'description': 'Four Noble Truths, dependent origination, emptiness and mindfulness', 'tags': 'buddhist,truths,emptiness'},
            ]
        },
        {
            'name': 'Geography (Advanced)',
            'slug': 'geography-advanced',
            'icon': 'G',
            'description': 'Physical, Human, Economic Geography and Geomorphology',
            'target_audience': 'all',
            'sort_order': 22,
            'topics': [
                {'name': 'Physical Geography', 'description': 'Lithosphere, atmosphere, hydrosphere and biosphere', 'tags': 'physical,lithosphere,atmosphere'},
                {'name': 'Geomorphology', 'description': 'Landforms, weathering, erosion and tectonic processes', 'tags': 'geomorphology,landforms,erosion'},
                {'name': 'Climatology', 'description': 'Climate classification, weather systems, monsoons and climate change', 'tags': 'climate,weather,monsoon'},
                {'name': 'Oceanography', 'description': 'Ocean currents, tides, marine resources and sea floor spreading', 'tags': 'ocean,currents,tides'},
                {'name': 'Human Geography', 'description': 'Population, migration, settlements and cultural geography', 'tags': 'human,population,migration'},
                {'name': 'Economic Geography', 'description': 'Agriculture, industry, trade routes and resource distribution', 'tags': 'economic,agriculture,industry'},
                {'name': 'Indian Geography', 'description': 'Physical features, climate, drainage and natural vegetation', 'tags': 'india,features,drainage'},
                {'name': 'World Regional Geography', 'description': 'Continents, major countries, resources and development', 'tags': 'world,continents,countries'},
                {'name': 'Environmental Geography', 'description': 'Environmental degradation, conservation and sustainable development', 'tags': 'environment,conservation,sustainable'},
                {'name': 'Map Reading & Cartography', 'description': 'Map projections, scales, contours and topographic maps', 'tags': 'maps,cartography,contours'},
                {'name': 'Biogeography', 'description': 'Distribution of plants and animals, biomes and ecological regions', 'tags': 'biogeography,biomes,distribution'},
                {'name': 'Urban Geography', 'description': 'Urbanization patterns, city models and urban planning', 'tags': 'urban,city,planning'},
                {'name': 'Agricultural Geography', 'description': 'Farming systems, green revolution, irrigation and food security', 'tags': 'agricultural,farming,irrigation'},
                {'name': 'Transport Geography', 'description': 'Road, rail, air and water transport networks and connectivity', 'tags': 'transport,road,rail'},
                {'name': 'Disaster Management', 'description': 'Earthquakes, floods, cyclones, landslides and mitigation', 'tags': 'disaster,earthquake,flood'},
                {'name': 'Population Geography', 'description': 'Demographic transition, population policies and migration patterns', 'tags': 'population,demographic,migration'},
            ]
        },
        {
            'name': 'Web Development',
            'slug': 'web-development',
            'icon': 'W',
            'description': 'HTML, CSS, React, Node.js, APIs and Full-Stack Development',
            'target_audience': 'all',
            'sort_order': 23,
            'topics': [
                {'name': 'HTML5 Fundamentals', 'description': 'Semantic HTML, forms, multimedia and accessibility', 'tags': 'html,html5,semantic'},
                {'name': 'CSS3 & Styling', 'description': 'Selectors, flexbox, grid, animations and responsive design', 'tags': 'css,flexbox,grid'},
                {'name': 'JavaScript ES6+', 'description': 'Arrow functions, promises, async/await, destructuring and modules', 'tags': 'javascript,es6,async'},
                {'name': 'React.js', 'description': 'Components, hooks, state management, routing and context API', 'tags': 'react,hooks,components'},
                {'name': 'Node.js & Express', 'description': 'Server-side JavaScript, REST APIs, middleware and authentication', 'tags': 'node,express,api'},
                {'name': 'TypeScript', 'description': 'Type system, interfaces, generics and TypeScript with React', 'tags': 'typescript,types,interfaces'},
                {'name': 'MongoDB & NoSQL', 'description': 'Document databases, CRUD operations, aggregation and Mongoose', 'tags': 'mongodb,nosql,mongoose'},
                {'name': 'REST API Design', 'description': 'HTTP methods, status codes, authentication and API best practices', 'tags': 'rest,api,http'},
                {'name': 'Git & Version Control', 'description': 'Branching, merging, pull requests, rebasing and Git workflows', 'tags': 'git,version,branching'},
                {'name': 'Tailwind CSS', 'description': 'Utility-first CSS, responsive design and component patterns', 'tags': 'tailwind,utility,responsive'},
                {'name': 'Next.js', 'description': 'SSR, SSG, API routes, file-based routing and deployment', 'tags': 'nextjs,ssr,ssg'},
                {'name': 'Database Design', 'description': 'ER diagrams, normalization, indexing and query optimization', 'tags': 'database,normalization,indexing'},
                {'name': 'Authentication & Security', 'description': 'JWT, OAuth, CORS, XSS prevention and HTTPS', 'tags': 'auth,jwt,oauth'},
                {'name': 'Testing & Debugging', 'description': 'Unit testing, integration testing, Jest, Cypress and debugging', 'tags': 'testing,jest,cypress'},
                {'name': 'DevOps Basics', 'description': 'CI/CD, Docker, deployment, Nginx and cloud hosting', 'tags': 'devops,docker,cicd'},
                {'name': 'GraphQL', 'description': 'Queries, mutations, subscriptions and Apollo Client', 'tags': 'graphql,queries,apollo'},
                {'name': 'Progressive Web Apps', 'description': 'Service workers, caching, offline support and installability', 'tags': 'pwa,serviceworker,offline'},
                {'name': 'Web Performance', 'description': 'Lazy loading, code splitting, caching and Core Web Vitals', 'tags': 'performance,lazy,vitals'},
            ]
        },
        {
            'name': 'Cybersecurity',
            'slug': 'cybersecurity',
            'icon': '🛡',
            'description': 'Network Security, Cryptography, Ethical Hacking and Forensics',
            'target_audience': 'college',
            'sort_order': 24,
            'topics': [
                {'name': 'Introduction to Cybersecurity', 'description': 'CIA triad, threat landscape, security principles and frameworks', 'tags': 'intro,cia,security'},
                {'name': 'Network Security', 'description': 'Firewalls, IDS/IPS, VPN, network monitoring and segmentation', 'tags': 'network,firewall,vpn'},
                {'name': 'Cryptography', 'description': 'Symmetric, asymmetric encryption, hashing and digital signatures', 'tags': 'cryptography,encryption,hashing'},
                {'name': 'Ethical Hacking', 'description': 'Penetration testing methodology, reconnaissance and vulnerability assessment', 'tags': 'ethical,hacking,pentest'},
                {'name': 'Web Application Security', 'description': 'OWASP Top 10, SQL injection, XSS, CSRF and secure coding', 'tags': 'web,owasp,sqli'},
                {'name': 'Operating System Security', 'description': 'Linux hardening, Windows security, access controls and patching', 'tags': 'os,linux,hardening'},
                {'name': 'Malware Analysis', 'description': 'Types of malware, reverse engineering and threat detection', 'tags': 'malware,reverse,detection'},
                {'name': 'Digital Forensics', 'description': 'Evidence collection, disk forensics, memory analysis and reporting', 'tags': 'forensics,evidence,analysis'},
                {'name': 'Cloud Security', 'description': 'AWS/Azure security, shared responsibility model and cloud threats', 'tags': 'cloud,aws,azure'},
                {'name': 'Identity & Access Management', 'description': 'Authentication, authorization, SSO and multi-factor authentication', 'tags': 'iam,authentication,mfa'},
                {'name': 'Incident Response', 'description': 'Incident handling, containment, eradication and recovery', 'tags': 'incident,response,recovery'},
                {'name': 'Security Operations Center', 'description': 'SIEM, log analysis, threat hunting and security monitoring', 'tags': 'soc,siem,monitoring'},
                {'name': 'Wireless Security', 'description': 'Wi-Fi security, Bluetooth attacks, WPA3 and wireless pentesting', 'tags': 'wireless,wifi,wpa'},
                {'name': 'Social Engineering', 'description': 'Phishing, pretexting, baiting and security awareness', 'tags': 'social,phishing,awareness'},
                {'name': 'Compliance & Governance', 'description': 'ISO 27001, GDPR, HIPAA and security policies', 'tags': 'compliance,iso,gdpr'},
            ]
        },
        {
            'name': 'Mathematics (Advanced)',
            'slug': 'mathematics-advanced',
            'icon': '∑',
            'description': 'Linear Algebra, Real Analysis, Differential Equations and Discrete Math',
            'target_audience': 'college',
            'sort_order': 25,
            'topics': [
                {'name': 'Linear Algebra', 'description': 'Matrices, vector spaces, eigenvalues, diagonalization and linear transformations', 'tags': 'linear,matrices,eigenvalues'},
                {'name': 'Real Analysis', 'description': 'Sequences, series, continuity, differentiability and Riemann integration', 'tags': 'analysis,sequences,continuity'},
                {'name': 'Complex Analysis', 'description': 'Analytic functions, Cauchy\'s theorem, residues and conformal mapping', 'tags': 'complex,cauchy,residues'},
                {'name': 'Ordinary Differential Equations', 'description': 'First order, higher order, Laplace transforms and series solutions', 'tags': 'ode,differential,laplace'},
                {'name': 'Partial Differential Equations', 'description': 'Heat equation, wave equation, Laplace equation and separation of variables', 'tags': 'pde,heat,wave'},
                {'name': 'Discrete Mathematics', 'description': 'Sets, relations, functions, combinatorics and graph theory', 'tags': 'discrete,combinatorics,graph'},
                {'name': 'Abstract Algebra', 'description': 'Groups, rings, fields, homomorphisms and isomorphisms', 'tags': 'abstract,groups,rings'},
                {'name': 'Numerical Methods', 'description': 'Root finding, interpolation, numerical integration and error analysis', 'tags': 'numerical,interpolation,rootfinding'},
                {'name': 'Probability Theory', 'description': 'Random variables, distributions, central limit theorem and Markov chains', 'tags': 'probability,distributions,markov'},
                {'name': 'Mathematical Logic', 'description': 'Propositional logic, predicate logic, proof techniques and set theory', 'tags': 'logic,propositional,proof'},
                {'name': 'Optimization', 'description': 'Linear programming, simplex method, duality and convex optimization', 'tags': 'optimization,linear,simplex'},
                {'name': 'Topology Basics', 'description': 'Open/closed sets, continuity, compactness and connectedness', 'tags': 'topology,open,compact'},
                {'name': 'Integral Transforms', 'description': 'Fourier transform, Laplace transform, Z-transform and applications', 'tags': 'transforms,fourier,laplace'},
                {'name': 'Functional Analysis', 'description': 'Banach spaces, Hilbert spaces and bounded linear operators', 'tags': 'functional,banach,hilbert'},
                {'name': 'Number Theory (Advanced)', 'description': 'Congruences, quadratic residues, Diophantine equations and cryptography', 'tags': 'numbertheory,congruences,diophantine'},
                {'name': 'Graph Theory', 'description': 'Trees, coloring, matching, network flows and planar graphs', 'tags': 'graph,trees,coloring'},
            ]
        },
    ]

    added = 0
    for cat_data in expanded_categories:
        topics_list = cat_data.pop('topics')
        if cat_data['slug'] in existing_slugs:
            continue
        category = Category(**cat_data)
        db.session.add(category)
        db.session.flush()

        for t_data in topics_list:
            topic = Topic(
                name=t_data['name'],
                description=t_data['description'],
                tags=t_data['tags'],
                category_id=category.id,
                is_system=True
            )
            db.session.add(topic)
        added += 1

    if added:
        db.session.commit()
        print(f"Expanded subjects seeded successfully! ({added} new subjects)")
    else:
        print("Expanded subjects already exist, skipping.")
