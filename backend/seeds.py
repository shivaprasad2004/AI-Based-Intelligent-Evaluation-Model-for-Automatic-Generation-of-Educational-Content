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
