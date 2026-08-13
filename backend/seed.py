import json
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import auth


def seed_data():
    # ============================================================
    # RESET DATABASE
    # ============================================================
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    try:
        # ========================================================
        # 0. ADMIN USER
        # ========================================================
        hashed_password = auth.get_password_hash("admin123")

        admin_user = models.User(
            username="admin",
            email="admin@example.com",
            hashed_password=hashed_password
        )

        db.add(admin_user)
        db.commit()

        # ========================================================
        # 1. CUSTOMER FEEDBACK SURVEY
        # ========================================================
        form1 = models.Form(
            user_id=admin_user.id,
            title="Customer Feedback Survey",
            status="published",
            is_public=True
        )

        db.add(form1)
        db.commit()
        db.refresh(form1)

        q1 = models.Question(
            form_id=form1.id,
            title="What is your name?",
            type="short_text",
            is_required=True,
            order=0
        )

        q2 = models.Question(
            form_id=form1.id,
            title="How satisfied are you with our service?",
            type="multiple_choice",
            is_required=True,
            order=1,
            options=json.dumps([
                "Very Satisfied",
                "Satisfied",
                "Neutral",
                "Dissatisfied",
                "Very Dissatisfied"
            ])
        )

        q3 = models.Question(
            form_id=form1.id,
            title="How would you rate our support team?",
            type="multiple_choice",
            is_required=True,
            order=2,
            options=json.dumps([
                "Excellent",
                "Good",
                "Average",
                "Poor"
            ])
        )

        q4 = models.Question(
            form_id=form1.id,
            title="Which city are you from?",
            type="multiple_choice",
            is_required=True,
            order=3,
            options=json.dumps([
                "Delhi",
                "Mumbai",
                "Bengaluru",
                "Hyderabad",
                "Chandigarh",
                "Pune",
                "Amritsar",
                "Jaipur"
            ])
        )

        q5 = models.Question(
            form_id=form1.id,
            title="Any additional feedback?",
            type="long_text",
            is_required=False,
            order=4
        )

        db.add_all([q1, q2, q3, q4, q5])
        db.commit()

        customer_feedback = [
            {
                "name": "Arjun Sharma",
                "satisfaction": "Very Satisfied",
                "support": "Excellent",
                "city": "Delhi",
                "feedback": "The service was quick and the support team resolved my issue within a few hours."
            },
            {
                "name": "Simran Kaur",
                "satisfaction": "Satisfied",
                "support": "Good",
                "city": "Chandigarh",
                "feedback": "Overall experience was good. The website could be slightly faster on mobile."
            },
            {
                "name": "Rahul Verma",
                "satisfaction": "Neutral",
                "support": "Average",
                "city": "Jaipur",
                "feedback": "The service is useful but I had to wait longer than expected for a response."
            },
            {
                "name": "Priya Nair",
                "satisfaction": "Very Satisfied",
                "support": "Excellent",
                "city": "Bengaluru",
                "feedback": "Very smooth experience. The customer support representative was professional and helpful."
            },
            {
                "name": "Gurpreet Singh",
                "satisfaction": "Satisfied",
                "support": "Good",
                "city": "Amritsar",
                "feedback": "Good overall experience. Adding more payment options would make it even better."
            },
            {
                "name": "Sneha Patil",
                "satisfaction": "Dissatisfied",
                "support": "Poor",
                "city": "Pune",
                "feedback": "I experienced a delay while submitting my request and had to try twice."
            }
        ]

        for data in customer_feedback:
            response = models.Response(form_id=form1.id)
            db.add(response)
            db.commit()
            db.refresh(response)

            answers = [
                models.Answer(
                    response_id=response.id,
                    question_id=q1.id,
                    value=data["name"]
                ),
                models.Answer(
                    response_id=response.id,
                    question_id=q2.id,
                    value=data["satisfaction"]
                ),
                models.Answer(
                    response_id=response.id,
                    question_id=q3.id,
                    value=data["support"]
                ),
                models.Answer(
                    response_id=response.id,
                    question_id=q4.id,
                    value=data["city"]
                ),
                models.Answer(
                    response_id=response.id,
                    question_id=q5.id,
                    value=data["feedback"]
                )
            ]

            db.add_all(answers)

        db.commit()

        # ========================================================
        # 2. EVENT REGISTRATION
        # ========================================================
        form2 = models.Form(
            user_id=admin_user.id,
            title="India Tech Summit 2026 Registration",
            status="published",
            is_public=True
        )

        db.add(form2)
        db.commit()
        db.refresh(form2)

        q6 = models.Question(
            form_id=form2.id,
            title="Full Name",
            type="short_text",
            is_required=True,
            order=0
        )

        q7 = models.Question(
            form_id=form2.id,
            title="Email Address",
            type="email",
            is_required=True,
            order=1
        )

        q8 = models.Question(
            form_id=form2.id,
            title="Phone Number",
            type="short_text",
            is_required=True,
            order=2
        )

        q9 = models.Question(
            form_id=form2.id,
            title="Current City",
            type="multiple_choice",
            is_required=True,
            order=3,
            options=json.dumps([
                "Delhi",
                "Mumbai",
                "Bengaluru",
                "Chennai",
                "Hyderabad",
                "Kolkata",
                "Pune",
                "Mohali"
            ])
        )

        q10 = models.Question(
            form_id=form2.id,
            title="Professional Role",
            type="multiple_choice",
            is_required=True,
            order=4,
            options=json.dumps([
                "Student",
                "Software Developer",
                "Data Analyst",
                "Product Manager",
                "Entrepreneur",
                "Designer"
            ])
        )

        q11 = models.Question(
            form_id=form2.id,
            title="Why do you want to attend the summit?",
            type="long_text",
            is_required=False,
            order=5
        )

        db.add_all([q6, q7, q8, q9, q10, q11])
        db.commit()

        event_attendees = [
            (
                "Aman Kapoor",
                "aman.kapoor.demo@example.com",
                "9876501234",
                "Delhi",
                "Software Developer",
                "Interested in cloud computing and backend architecture."
            ),
            (
                "Neha Bansal",
                "neha.bansal.demo@example.com",
                "9812345670",
                "Mohali",
                "Student",
                "I want to learn about current software engineering trends."
            ),
            (
                "Vikram Reddy",
                "vikram.reddy.demo@example.com",
                "9898765432",
                "Hyderabad",
                "Data Analyst",
                "Interested in AI, analytics and data engineering."
            ),
            (
                "Ishita Mehta",
                "ishita.mehta.demo@example.com",
                "9765432180",
                "Mumbai",
                "Product Manager",
                "Looking forward to networking with technology professionals."
            ),
            (
                "Karan Malhotra",
                "karan.malhotra.demo@example.com",
                "9823456712",
                "Bengaluru",
                "Entrepreneur",
                "Interested in startup technology and scalable architectures."
            ),
            (
                "Divya Krishnan",
                "divya.krishnan.demo@example.com",
                "9958764312",
                "Chennai",
                "Designer",
                "I want to understand how AI is changing product design."
            )
        ]

        for attendee in event_attendees:
            response = models.Response(form_id=form2.id)
            db.add(response)
            db.commit()
            db.refresh(response)

            answers = [
                models.Answer(
                    response_id=response.id,
                    question_id=q6.id,
                    value=attendee[0]
                ),
                models.Answer(
                    response_id=response.id,
                    question_id=q7.id,
                    value=attendee[1]
                ),
                models.Answer(
                    response_id=response.id,
                    question_id=q8.id,
                    value=attendee[2]
                ),
                models.Answer(
                    response_id=response.id,
                    question_id=q9.id,
                    value=attendee[3]
                ),
                models.Answer(
                    response_id=response.id,
                    question_id=q10.id,
                    value=attendee[4]
                ),
                models.Answer(
                    response_id=response.id,
                    question_id=q11.id,
                    value=attendee[5]
                )
            ]

            db.add_all(answers)

        db.commit()

        # ========================================================
        # 3. COLLEGE STUDENT SATISFACTION SURVEY
        # ========================================================
        form3 = models.Form(
            user_id=admin_user.id,
            title="College Student Experience Survey",
            status="published",
            is_public=True
        )

        db.add(form3)
        db.commit()
        db.refresh(form3)

        q12 = models.Question(
            form_id=form3.id,
            title="Student Name",
            type="short_text",
            is_required=True,
            order=0
        )

        q13 = models.Question(
            form_id=form3.id,
            title="How satisfied are you with the teaching quality?",
            type="multiple_choice",
            is_required=True,
            order=1,
            options=json.dumps([
                "Excellent",
                "Good",
                "Average",
                "Below Average",
                "Poor"
            ])
        )

        q14 = models.Question(
            form_id=form3.id,
            title="How would you rate campus facilities?",
            type="multiple_choice",
            is_required=True,
            order=2,
            options=json.dumps([
                "Excellent",
                "Good",
                "Average",
                "Poor"
            ])
        )

        q15 = models.Question(
            form_id=form3.id,
            title="Your degree program",
            type="multiple_choice",
            is_required=True,
            order=3,
            options=json.dumps([
                "B.Tech CSE",
                "B.Tech ECE",
                "BBA",
                "B.Com",
                "MBA",
                "MCA"
            ])
        )

        q16 = models.Question(
            form_id=form3.id,
            title="What should the university improve?",
            type="long_text",
            is_required=False,
            order=4
        )

        db.add_all([q12, q13, q14, q15, q16])
        db.commit()

        students = [
            (
                "Harpreet Kaur",
                "Excellent",
                "Good",
                "B.Tech CSE",
                "More industry-oriented projects and coding workshops would be helpful."
            ),
            (
                "Rohan Gupta",
                "Good",
                "Good",
                "B.Tech CSE",
                "The library should have longer operating hours during examinations."
            ),
            (
                "Muskan Arora",
                "Excellent",
                "Excellent",
                "BBA",
                "More company visits and practical business case studies would be useful."
            ),
            (
                "Aditya Joshi",
                "Average",
                "Good",
                "MCA",
                "Some courses should include more practical assignments instead of only theory."
            ),
            (
                "Navneet Singh",
                "Good",
                "Average",
                "B.Tech ECE",
                "Campus transportation could be improved during peak hours."
            ),
            (
                "Ananya Rao",
                "Below Average",
                "Average",
                "MBA",
                "Some classrooms need better audio-visual equipment."
            )
        ]

        for student in students:
            response = models.Response(form_id=form3.id)
            db.add(response)
            db.commit()
            db.refresh(response)

            answers = [
                models.Answer(
                    response_id=response.id,
                    question_id=q12.id,
                    value=student[0]
                ),
                models.Answer(
                    response_id=response.id,
                    question_id=q13.id,
                    value=student[1]
                ),
                models.Answer(
                    response_id=response.id,
                    question_id=q14.id,
                    value=student[2]
                ),
                models.Answer(
                    response_id=response.id,
                    question_id=q15.id,
                    value=student[3]
                ),
                models.Answer(
                    response_id=response.id,
                    question_id=q16.id,
                    value=student[4]
                )
            ]

            db.add_all(answers)

        db.commit()

        # ========================================================
        # 4. FOOD DELIVERY CUSTOMER SURVEY
        # ========================================================
        form4 = models.Form(
            user_id=admin_user.id,
            title="Food Delivery Customer Survey",
            status="published",
            is_public=True
        )

        db.add(form4)
        db.commit()
        db.refresh(form4)

        q17 = models.Question(
            form_id=form4.id,
            title="Customer Name",
            type="short_text",
            is_required=True,
            order=0
        )

        q18 = models.Question(
            form_id=form4.id,
            title="How was your food quality?",
            type="multiple_choice",
            is_required=True,
            order=1,
            options=json.dumps([
                "Excellent",
                "Good",
                "Average",
                "Poor"
            ])
        )

        q19 = models.Question(
            form_id=form4.id,
            title="How was the delivery speed?",
            type="multiple_choice",
            is_required=True,
            order=2,
            options=json.dumps([
                "Very Fast",
                "Fast",
                "Average",
                "Slow",
                "Very Slow"
            ])
        )

        q20 = models.Question(
            form_id=form4.id,
            title="Preferred payment method",
            type="multiple_choice",
            is_required=True,
            order=3,
            options=json.dumps([
                "UPI",
                "Credit Card",
                "Debit Card",
                "Cash on Delivery",
                "Wallet"
            ])
        )

        q21 = models.Question(
            form_id=form4.id,
            title="Suggestions for improving the service",
            type="long_text",
            is_required=False,
            order=4
        )

        db.add_all([q17, q18, q19, q20, q21])
        db.commit()

        food_customers = [
            (
                "Sahil Chawla",
                "Excellent",
                "Very Fast",
                "UPI",
                "The food arrived hot and the packaging was excellent."
            ),
            (
                "Pooja Sharma",
                "Good",
                "Fast",
                "UPI",
                "Good service overall. More restaurant choices in my area would be useful."
            ),
            (
                "Manav Sethi",
                "Average",
                "Average",
                "Credit Card",
                "The food quality was acceptable but the delivery fee was slightly high."
            ),
            (
                "Ritika Jain",
                "Excellent",
                "Fast",
                "Debit Card",
                "Very good experience. The order tracking was accurate."
            ),
            (
                "Jaspreet Singh",
                "Good",
                "Slow",
                "Cash on Delivery",
                "Food was good but delivery took longer than the estimated time."
            ),
            (
                "Nidhi Verma",
                "Poor",
                "Very Slow",
                "UPI",
                "The order was delayed considerably and the food was not warm when delivered."
            )
        ]

        for customer in food_customers:
            response = models.Response(form_id=form4.id)
            db.add(response)
            db.commit()
            db.refresh(response)

            answers = [
                models.Answer(
                    response_id=response.id,
                    question_id=q17.id,
                    value=customer[0]
                ),
                models.Answer(
                    response_id=response.id,
                    question_id=q18.id,
                    value=customer[1]
                ),
                models.Answer(
                    response_id=response.id,
                    question_id=q19.id,
                    value=customer[2]
                ),
                models.Answer(
                    response_id=response.id,
                    question_id=q20.id,
                    value=customer[3]
                ),
                models.Answer(
                    response_id=response.id,
                    question_id=q21.id,
                    value=customer[4]
                )
            ]

            db.add_all(answers)

        db.commit()

        # ========================================================
        # 5. PRIVATE EMPLOYEE SURVEY
        # ========================================================
        form5 = models.Form(
            user_id=admin_user.id,
            title="Internal Employee Workplace Survey",
            status="published",
            is_public=False
        )

        db.add(form5)
        db.commit()
        db.refresh(form5)

        q22 = models.Question(
            form_id=form5.id,
            title="Employee ID",
            type="short_text",
            is_required=True,
            order=0
        )

        q23 = models.Question(
            form_id=form5.id,
            title="Department",
            type="multiple_choice",
            is_required=True,
            order=1,
            options=json.dumps([
                "Engineering",
                "Human Resources",
                "Sales",
                "Marketing",
                "Finance",
                "Operations"
            ])
        )

        q24 = models.Question(
            form_id=form5.id,
            title="How satisfied are you with your current role?",
            type="multiple_choice",
            is_required=True,
            order=2,
            options=json.dumps([
                "Very Satisfied",
                "Satisfied",
                "Neutral",
                "Dissatisfied",
                "Very Dissatisfied"
            ])
        )

        q25 = models.Question(
            form_id=form5.id,
            title="How would you rate the work environment?",
            type="multiple_choice",
            is_required=True,
            order=3,
            options=json.dumps([
                "Excellent",
                "Good",
                "Average",
                "Poor"
            ])
        )

        q26 = models.Question(
            form_id=form5.id,
            title="What could management improve?",
            type="long_text",
            is_required=False,
            order=4
        )

        db.add_all([q22, q23, q24, q25, q26])
        db.commit()

        employees = [
            (
                "EMP-1001",
                "Engineering",
                "Very Satisfied",
                "Excellent",
                "More technical learning budgets would be valuable."
            ),
            (
                "EMP-1002",
                "Human Resources",
                "Satisfied",
                "Good",
                "Internal communication between departments can be improved."
            ),
            (
                "EMP-1003",
                "Sales",
                "Neutral",
                "Good",
                "Clearer quarterly targets would help the sales team."
            ),
            (
                "EMP-1004",
                "Marketing",
                "Satisfied",
                "Excellent",
                "The flexible working arrangement has been very helpful."
            ),
            (
                "EMP-1005",
                "Finance",
                "Dissatisfied",
                "Average",
                "Workload distribution could be improved during financial closing."
            ),
            (
                "EMP-1006",
                "Operations",
                "Very Satisfied",
                "Good",
                "More cross-functional training would be beneficial."
            )
        ]

        for employee in employees:
            response = models.Response(form_id=form5.id)
            db.add(response)
            db.commit()
            db.refresh(response)

            answers = [
                models.Answer(
                    response_id=response.id,
                    question_id=q22.id,
                    value=employee[0]
                ),
                models.Answer(
                    response_id=response.id,
                    question_id=q23.id,
                    value=employee[1]
                ),
                models.Answer(
                    response_id=response.id,
                    question_id=q24.id,
                    value=employee[2]
                ),
                models.Answer(
                    response_id=response.id,
                    question_id=q25.id,
                    value=employee[3]
                ),
                models.Answer(
                    response_id=response.id,
                    question_id=q26.id,
                    value=employee[4]
                )
            ]

            db.add_all(answers)

        db.commit()

        # ========================================================
        # 6. DRAFT FORM
        # ========================================================
        form6 = models.Form(
            user_id=admin_user.id,
            title="Government Service Experience Survey - Draft",
            status="draft",
            is_public=False
        )

        db.add(form6)
        db.commit()
        db.refresh(form6)

        q27 = models.Question(
            form_id=form6.id,
            title="Which government service did you use?",
            type="short_text",
            is_required=True,
            order=0
        )

        q28 = models.Question(
            form_id=form6.id,
            title="How easy was it to complete the process?",
            type="multiple_choice",
            is_required=True,
            order=1,
            options=json.dumps([
                "Very Easy",
                "Easy",
                "Moderate",
                "Difficult",
                "Very Difficult"
            ])
        )

        q29 = models.Question(
            form_id=form6.id,
            title="Additional suggestions",
            type="long_text",
            is_required=False,
            order=2
        )

        db.add_all([q27, q28, q29])
        db.commit()

                # ========================================================
        # 7. SCALER AI LABS OA - BASIC COMPUTER SCIENCE QUIZ
        # ========================================================
        form7 = models.Form(
            user_id=admin_user.id,
            title="Scaler AI Labs OA",
            status="published",
            is_public=True
        )

        db.add(form7)
        db.commit()
        db.refresh(form7)

        # --------------------------------------------------------
        # Quiz Questions
        # --------------------------------------------------------

        q30 = models.Question(
            form_id=form7.id,
            title="Which data structure follows the LIFO principle?",
            type="multiple_choice",
            is_required=True,
            order=0,
            options=json.dumps([
                "Queue",
                "Stack",
                "Linked List",
                "Array"
            ])
        )

        q31 = models.Question(
            form_id=form7.id,
            title="What is the average time complexity of searching for a key in a HashMap?",
            type="multiple_choice",
            is_required=True,
            order=1,
            options=json.dumps([
                "O(1)",
                "O(log n)",
                "O(n)",
                "O(n log n)"
            ])
        )

        q32 = models.Question(
            form_id=form7.id,
            title="Which OOP concept allows a class to have multiple methods with the same name but different parameters?",
            type="multiple_choice",
            is_required=True,
            order=2,
            options=json.dumps([
                "Inheritance",
                "Encapsulation",
                "Method Overloading",
                "Abstraction"
            ])
        )

        q33 = models.Question(
            form_id=form7.id,
            title="Which SQL command is used to retrieve data from a database?",
            type="multiple_choice",
            is_required=True,
            order=3,
            options=json.dumps([
                "INSERT",
                "UPDATE",
                "SELECT",
                "ALTER"
            ])
        )

        q34 = models.Question(
            form_id=form7.id,
            title="Which normal form eliminates partial dependency in a relational database?",
            type="multiple_choice",
            is_required=True,
            order=4,
            options=json.dumps([
                "First Normal Form (1NF)",
                "Second Normal Form (2NF)",
                "Third Normal Form (3NF)",
                "Boyce-Codd Normal Form (BCNF)"
            ])
        )

        q35 = models.Question(
            form_id=form7.id,
            title="Which protocol is connection-oriented and provides reliable data delivery?",
            type="multiple_choice",
            is_required=True,
            order=5,
            options=json.dumps([
                "UDP",
                "IP",
                "TCP",
                "HTTP"
            ])
        )

        q36 = models.Question(
            form_id=form7.id,
            title="Which scheduling algorithm can cause starvation if priority values are not managed properly?",
            type="multiple_choice",
            is_required=True,
            order=6,
            options=json.dumps([
                "FCFS",
                "Round Robin",
                "Priority Scheduling",
                "FIFO"
            ])
        )

        q37 = models.Question(
            form_id=form7.id,
            title="What is the worst-case time complexity of Binary Search on a sorted array?",
            type="multiple_choice",
            is_required=True,
            order=7,
            options=json.dumps([
                "O(1)",
                "O(log n)",
                "O(n)",
                "O(n²)"
            ])
        )

        q38 = models.Question(
            form_id=form7.id,
            title="Which Java keyword is used to inherit a class?",
            type="multiple_choice",
            is_required=True,
            order=8,
            options=json.dumps([
                "implements",
                "inherits",
                "extends",
                "super"
            ])
        )

        q39 = models.Question(
            form_id=form7.id,
            title="Which of the following is NOT a valid property of a primary key?",
            type="multiple_choice",
            is_required=True,
            order=9,
            options=json.dumps([
                "It uniquely identifies a row",
                "It cannot contain NULL values",
                "A table can have multiple primary keys",
                "It can be used to establish relationships between tables"
            ])
        )

        db.add_all([
            q30,
            q31,
            q32,
            q33,
            q34,
            q35,
            q36,
            q37,
            q38,
            q39
        ])

        db.commit()

        # --------------------------------------------------------
        # Quiz Response 1
        # --------------------------------------------------------

        quiz_response_1 = models.Response(form_id=form7.id)
        db.add(quiz_response_1)
        db.commit()
        db.refresh(quiz_response_1)

        quiz_answers_1 = [
            models.Answer(
                response_id=quiz_response_1.id,
                question_id=q30.id,
                value="Stack"
            ),
            models.Answer(
                response_id=quiz_response_1.id,
                question_id=q31.id,
                value="O(1)"
            ),
            models.Answer(
                response_id=quiz_response_1.id,
                question_id=q32.id,
                value="Method Overloading"
            ),
            models.Answer(
                response_id=quiz_response_1.id,
                question_id=q33.id,
                value="SELECT"
            ),
            models.Answer(
                response_id=quiz_response_1.id,
                question_id=q34.id,
                value="Second Normal Form (2NF)"
            ),
            models.Answer(
                response_id=quiz_response_1.id,
                question_id=q35.id,
                value="TCP"
            ),
            models.Answer(
                response_id=quiz_response_1.id,
                question_id=q36.id,
                value="Priority Scheduling"
            ),
            models.Answer(
                response_id=quiz_response_1.id,
                question_id=q37.id,
                value="O(log n)"
            ),
            models.Answer(
                response_id=quiz_response_1.id,
                question_id=q38.id,
                value="extends"
            ),
            models.Answer(
                response_id=quiz_response_1.id,
                question_id=q39.id,
                value="A table can have multiple primary keys"
            )
        ]

        db.add_all(quiz_answers_1)
        db.commit()

        # --------------------------------------------------------
        # Quiz Response 2
        # --------------------------------------------------------

        quiz_response_2 = models.Response(form_id=form7.id)
        db.add(quiz_response_2)
        db.commit()
        db.refresh(quiz_response_2)

        quiz_answers_2 = [
            models.Answer(
                response_id=quiz_response_2.id,
                question_id=q30.id,
                value="Stack"
            ),
            models.Answer(
                response_id=quiz_response_2.id,
                question_id=q31.id,
                value="O(n)"
            ),
            models.Answer(
                response_id=quiz_response_2.id,
                question_id=q32.id,
                value="Method Overloading"
            ),
            models.Answer(
                response_id=quiz_response_2.id,
                question_id=q33.id,
                value="SELECT"
            ),
            models.Answer(
                response_id=quiz_response_2.id,
                question_id=q34.id,
                value="Third Normal Form (3NF)"
            ),
            models.Answer(
                response_id=quiz_response_2.id,
                question_id=q35.id,
                value="TCP"
            ),
            models.Answer(
                response_id=quiz_response_2.id,
                question_id=q36.id,
                value="Priority Scheduling"
            ),
            models.Answer(
                response_id=quiz_response_2.id,
                question_id=q37.id,
                value="O(log n)"
            ),
            models.Answer(
                response_id=quiz_response_2.id,
                question_id=q38.id,
                value="extends"
            ),
            models.Answer(
                response_id=quiz_response_2.id,
                question_id=q39.id,
                value="A table can have multiple primary keys"
            )
        ]

        db.add_all(quiz_answers_2)
        db.commit()

        # ========================================================
        # FINAL MESSAGE
        # ========================================================
        print("\n==============================================")
        print("DATABASE SEEDED SUCCESSFULLY")
        print("==============================================")
        print("Admin:")
        print("Username: admin")
        print("Password: admin123")
        print("----------------------------------------------")
        print("Forms created: 7")
        print("Published forms: 5")
        print("Draft forms: 2")
        print("Private published forms: 1")
        print("Scaler AI Labs OA quiz: 10 questions")
        print("Responses: 30+")
        print("Answers: 100+")
        print("==============================================\n")

    except Exception as e:
        db.rollback()
        print("Error while seeding database:", e)
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_data()