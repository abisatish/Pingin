\set ON_ERROR_STOP on
BEGIN;

/* ───────── reference tables ───────────────────────────────────────── */
INSERT INTO highschool (id, name, city, state, country) VALUES
  (1,'Lincoln High School','Seattle','WA','USA'),
  (2,'Westview Secondary','Austin','TX','USA'),
  (3,'Stuyvesant High School','New York','NY','USA'),
  (4,'Thomas Jefferson High School','Alexandria','VA','USA'),
  (5,'Phillips Academy','Andover','MA','USA');

INSERT INTO college (id, name, common_app_code) VALUES
  (1,'Massachusetts Institute of Technology','MIT'),
  (2,'Stanford University','STAN'),
  (3,'University of Texas at Austin','UTA');

/* ───────── consultants ────────────────────────────────────────────── */
INSERT INTO consultant
        (id,email,name,bio,tags,password_hash) VALUES
        (1,'jane@consults.com','Jane Parker',
           'Former MIT admissions reader with 8 years experience. STEM-application specialist.',
           '["Computer Science","Engineering","Mathematics","Physics","USACO","FIRST Robotics","Science Olympiad"]',
           '$2b$12$cmEwz3dqWDLO7DEE6zcGmuOrtPxWwOT9zlBJgqQcS8xQfSJfHKoEC'),
        (2,'omar@consults.com','Omar Ahmad',
           'Essay specialist and former Stanford GSB officer. Business & entrepreneurship focus.',
           '["Economics","Business / Entrepreneurship","Political Science","DECA","Model UN","Debate or Speech"]',
           '$2b$12$cmEwz3dqWDLO7DEE6zcGmuOrtPxWwOT9zlBJgqQcS8xQfSJfHKoEC'),
        (3,'sarah@consults.com','Sarah Chen',
           'Harvard alum, ex-Yale reader. Humanities & performing-arts expert.',
           '["Literature / English","History","Philosophy","Psychology","Performing Arts","Art / Art History"]',
           '$2b$12$cmEwz3dqWDLO7DEE6zcGmuOrtPxWwOT9zlBJgqQcS8xQfSJfHKoEC'),
        (4,'miguel@consults.com','Miguel Rodriguez',
           'Stanford Med grad; ex-UCSF committee. Biology & health-sciences mentor.',
           '["Biology","Chemistry","Environmental Science","Pre-Medicine","Science Olympiad","Intel STS / Regeneron"]',
           '$2b$12$cmEwz3dqWDLO7DEE6zcGmuOrtPxWwOT9zlBJgqQcS8xQfSJfHKoEC'),
        (5,'priya@consults.com','Priya Patel',
           'Columbia Law grad; ex-Georgetown officer. Law & policy applications specialist.',
           '["Law / Pre-Law","Political Science","International Relations","Economics","Model UN","Debate or Speech"]',
            '$2b$12$cmEwz3dqWDLO7DEE6zcGmuOrtPxWwOT9zlBJgqQcS8xQfSJfHKoEC'),
        (6,'david@consults.com','David Kim',
           'Berkeley Engineering grad; former Google engineer. CS & data-science focus.',
           '["Computer Science","Engineering","Mathematics","Data Science","USACO","FIRST Robotics"]',
            '$2b$12$cmEwz3dqWDLO7DEE6zcGmuOrtPxWwOT9zlBJgqQcS8xQfSJfHKoEC');

/* ───────── students ───────────────────────────────────────────────── */
INSERT INTO student
        (id,registration_id,user_id,highschool_id,photo_url,paid,
         email,password_hash,name,
         gender,family_income_bracket,is_first_generation,citizenship_status,
         is_underrepresented_group,
         quiz_completed,college_selection_completed,matching_completed)
VALUES
        (100,'REG-001',101,1,'https://pics.example/s1.jpg',TRUE,
         'alice@example.com',
         '$2b$12$Sidd2DcTAedIHfwfbaTAueNJgFHYQV.tobveVUUP3Z1xRJBKVm/ee','Alice Smith',
         'Female','HUNDRED_TO_200K'::incomebracket,FALSE,'US_CITIZEN'::citizenshipstatus,
         'NO'::underrepresentedgroup,TRUE,TRUE,TRUE),

        (101,'REG-002',102,2,'https://pics.example/s2.jpg',TRUE,
         'ben@example.com',
         '$2b$12$Sidd2DcTAedIHfwfbaTAueNJgFHYQV.tobveVUUP3Z1xRJBKVm/ee','Ben Tran',
         'Male','FIFTY_TO_100K'::incomebracket,TRUE,'US_CITIZEN'::citizenshipstatus,
         'YES'::underrepresentedgroup,TRUE,TRUE,TRUE),

        (102,'REG-003',103,1,NULL,TRUE,
         'cara@example.com',
         '$2b$12$Sidd2DcTAedIHfwfbaTAueNJgFHYQV.tobveVUUP3Z1xRJBKVm/ee','Cara Patel',
         'Female','OVER_200K'::incomebracket,FALSE,'US_PERMANENT_RESIDENT'::citizenshipstatus,
         'NO'::underrepresentedgroup,TRUE,TRUE,TRUE),

        (103,'REG-004',104,3,NULL,TRUE,
         'james@example.com',
         '$2b$12$Sidd2DcTAedIHfwfbaTAueNJgFHYQV.tobveVUUP3Z1xRJBKVm/ee','James Wilson',
         'Male','HUNDRED_TO_200K'::incomebracket,FALSE,'US_CITIZEN'::citizenshipstatus,
         'NO'::underrepresentedgroup,TRUE,TRUE,TRUE),

        (104,'REG-005',105,4,NULL,TRUE,
         'maria@example.com',
         '$2b$12$Sidd2DcTAedIHfwfbaTAueNJgFHYQV.tobveVUUP3Z1xRJBKVm/ee','Maria Garcia',
         'Female','UNDER_50K'::incomebracket,TRUE,'US_CITIZEN'::citizenshipstatus,
         'YES'::underrepresentedgroup,TRUE,TRUE,TRUE),

        (105,'REG-006',106,5,NULL,TRUE,
         'alex@example.com',
         '$2b$12$Sidd2DcTAedIHfwfbaTAueNJgFHYQV.tobveVUUP3Z1xRJBKVm/ee','Alex Johnson',
         'Non-binary','OVER_200K'::incomebracket,FALSE,'US_CITIZEN'::citizenshipstatus,
         'NO'::underrepresentedgroup,TRUE,TRUE,TRUE);

/* ───────── matching-quiz responses (students) ────────────────────── */
INSERT INTO studentmatchingquizresponse
        (id,student_id,
         passionate_subjects,academic_competitions,has_published_research,
         extracurricular_activities,
         other_subjects,other_activities,
         gender,family_income_bracket,is_first_generation,citizenship_status,is_underrepresented_group,
         created_at,updated_at)
VALUES
        (1,100,
         '["Computer Science"]',
         '["Science Olympiad","AMC / AIME (Math Olympiad)"]',TRUE,
         '["FIRST Robotics","Student Government"]',
         NULL,NULL,
         'Female','HUNDRED_TO_200K'::incomebracket,FALSE,
         'US_CITIZEN'::citizenshipstatus,'NO'::underrepresentedgroup,
         NOW(),NOW()),

        (2,101,
         '["Economics"]',
         '["DECA","Model UN"]',FALSE,
         '["Student Government","Entrepreneurship / Startup Projects"]',
         NULL,NULL,
         'Male','FIFTY_TO_100K'::incomebracket,TRUE,
         'US_CITIZEN'::citizenshipstatus,'YES'::underrepresentedgroup,
         NOW(),NOW()),

        (3,102,
         '["Biology"]',
         '["Science Olympiad","Intel STS / Regeneron"]',TRUE,
         '["Volunteering / Community Service"]',
         NULL,NULL,
         'Female','OVER_200K'::incomebracket,FALSE,
         'US_PERMANENT_RESIDENT'::citizenshipstatus,'NO'::underrepresentedgroup,
         NOW(),NOW()),

        (4,103,
         '["Literature / English"]',
         '["Debate or Speech"]',FALSE,
         '["Performing Arts (e.g., Band, Theater)"]',
         NULL,NULL,
         'Male','HUNDRED_TO_200K'::incomebracket,FALSE,
         'US_CITIZEN'::citizenshipstatus,'NO'::underrepresentedgroup,
         NOW(),NOW()),

        (5,104,
         '["Political Science"]',
         '["Model UN","Debate or Speech"]',FALSE,
         '["Student Government","Volunteering / Community Service"]',
         NULL,NULL,
         'Female','UNDER_50K'::incomebracket,TRUE,
         'US_CITIZEN'::citizenshipstatus,'YES'::underrepresentedgroup,
         NOW(),NOW()),

        (6,105,
         '["Engineering"]',
         '["Science Olympiad","FIRST Robotics"]',TRUE,
         '["FIRST Robotics","Mathematics"]',
         NULL,NULL,
         'Non-binary','OVER_200K'::incomebracket,FALSE,
         'US_CITIZEN'::citizenshipstatus,'NO'::underrepresentedgroup,
         NOW(),NOW());

/* ───────── addresses ──────────────────────────────────────────────── */
INSERT INTO address
        (id,student_id,line1,city,state,zip_code,country,type) VALUES
        (1,100,'123 Oak Street','San Francisco','CA','94102','USA','home'),
        (2,101,'456 Pine Avenue','Los Angeles','CA','90210','USA','home'),
        (3,102,'789 Elm Drive','New York','NY','10001','USA','home'),
        (4,103,'321 Maple Lane','Chicago','IL','60601','USA','home'),
        (5,104,'654 Birch Road','Miami','FL','33101','USA','home'),
        (6,105,'987 Cedar Court','Seattle','WA','98101','USA','home');

/* ───────── transcripts ───────────────────────────────────────────── */
INSERT INTO transcript
        (id,student_id,gpa,pdf_url,created_at) VALUES
        (1,100,3.8,'https://transcripts.example/s1.pdf',NOW()),
        (2,101,3.9,'https://transcripts.example/s2.pdf',NOW()),
        (3,102,4.0,'https://transcripts.example/s3.pdf',NOW()),
        (4,103,3.7,'https://transcripts.example/s4.pdf',NOW()),
        (5,104,3.6,'https://transcripts.example/s5.pdf',NOW()),
        (6,105,3.9,'https://transcripts.example/s6.pdf',NOW());

/* ───────── legacy quiz Q&A ────────────────────────────────────────── */
INSERT INTO quizquestion (id,text,tag) VALUES
  (1,'Did you compete in USACO?','usaco'),
  (2,'Are you a DECA member?','deca'),
  (3,'Have you published research?','research');

INSERT INTO studentquizanswer (student_id,question_id,answer) VALUES
        (100,1,'yes'),(100,2,'no'), (100,3,'yes'),
        (101,1,'no'), (101,2,'yes'),(101,3,'no'),
        (102,1,'yes'),(102,2,'no'), (102,3,'yes');

/* ───────── college applications ──────────────────────────────────── */
INSERT INTO collegeapplication
        (id,student_id,consultant_id,
         college_name,major,major_category,
         status,match_score,created_at,updated_at)
VALUES
        -- Alice
        (1,100,1,'MIT','Computer Science','STEM'::majorcategory,
         'DRAFT',95,NOW(),NOW()),
        (2,100,1,'Stanford University','Computer Science','STEM'::majorcategory,
         'DRAFT',92,NOW(),NOW()),
        (3,100,1,'UC Berkeley','Computer Science','STEM'::majorcategory,
         'DRAFT',88,NOW(),NOW()),

        -- Ben
        (4,101,2,'University of Pennsylvania','Business Administration','BUSINESS'::majorcategory,
         'DRAFT',94,NOW(),NOW()),
        (5,101,2,'NYU Stern','Business Administration','BUSINESS'::majorcategory,
         'DRAFT',91,NOW(),NOW()),
        (6,101,2,'University of Michigan','Business Administration','BUSINESS'::majorcategory,
         'DRAFT',87,NOW(),NOW()),

        -- Cara
        (7,102,4,'Johns Hopkins University','Biology','STEM'::majorcategory,
         'DRAFT',96,NOW(),NOW()),
        (8,102,4,'Duke University','Biology','STEM'::majorcategory,
         'DRAFT',93,NOW(),NOW()),
        (9,102,4,'Vanderbilt University','Biology','STEM'::majorcategory,
         'DRAFT',89,NOW(),NOW()),

        -- James
        (10,103,3,'Yale University','English Literature','HUMANITIES'::majorcategory,
         'DRAFT',95,NOW(),NOW()),
        (11,103,3,'Columbia University','English Literature','HUMANITIES'::majorcategory,
         'DRAFT',92,NOW(),NOW()),
        (12,103,3,'University of Chicago','English Literature','HUMANITIES'::majorcategory,
         'DRAFT',88,NOW(),NOW()),

        -- Maria
        (13,104,5,'Harvard University','Political Science','HUMANITIES'::majorcategory,
         'DRAFT',94,NOW(),NOW()),
        (14,104,5,'Georgetown University','Political Science','HUMANITIES'::majorcategory,
         'DRAFT',91,NOW(),NOW()),
        (15,104,5,'American University','Political Science','HUMANITIES'::majorcategory,
         'DRAFT',87,NOW(),NOW()),

        -- Alex
        (16,105,6,'Caltech','Engineering','STEM'::majorcategory,
         'DRAFT',96,NOW(),NOW()),
        (17,105,6,'Georgia Tech','Engineering','STEM'::majorcategory,
         'DRAFT',93,NOW(),NOW()),
        (18,105,6,'Purdue University','Engineering','STEM'::majorcategory,
         'DRAFT',89,NOW(),NOW());

/* ───────── essay responses ───────────────────────────────────────── */
INSERT INTO essayresponse
        (id,application_id,prompt,response,last_edited) VALUES
        (1,1,'Describe a challenge you faced …','When I first started learning to code, recursion baffled me …',NOW()),
        (2,2,'What motivates you to pursue CS?','My fascination with technology began when I built my first robot …',NOW()),
        (3,3,'Describe a project showing technical skills.','I built a machine-learning model to predict weather patterns …',NOW()),

        (4,4,'Why business?','Growing up in a family business taught me entrepreneurship …',NOW()),
        (5,5,'Describe a leadership experience.','As Entrepreneurship-Club president I led 20 students …',NOW()),
        (6,6,'Career goals?','I want to launch a tech company addressing social issues …',NOW()),

        (7,7,'Why biology?','My interest was sparked by a family member''s illness …',NOW()),
        (8,8,'Describe a research experience.','I studied climate-change effects on local ecosystems …',NOW()),
        (9,9,'Future plans?','I aim to pursue medical research to cure diseases …',NOW()),

        (10,10,'Why literature?','Literature has always been my window into new worlds …',NOW()),
        (11,11,'A book that changed you.','"To Kill a Mockingbird" shaped my sense of justice …',NOW()),
        (12,12,'Your goals in English?','I want to give voice to marginalized communities …',NOW()),

        (13,13,'Why political science?','Growing up in a low-income community showed me policy impact …',NOW()),
        (14,14,'Community service experience.','I organised a voter-registration drive …',NOW()),
        (15,15,'Political aspirations?','I hope to work in public policy for positive change …',NOW()),

        (16,16,'Why engineering?','I love solving problems and building impactful things …',NOW()),
        (17,17,'Describe an engineering project.','I designed a solar-powered water-purification system …',NOW()),
        (18,18,'Engineering goals?','I want to develop sustainable tech to fight climate change …',NOW());

/* ───────── pings ────────────────────────────────────────────────── */
INSERT INTO ping
        (id,application_id,student_id,consultant_id,
         question,status,answer,created_at) VALUES
        -- Alice / Jane
        (1,1,100,1,'Add robotics-competition experience?','answered',
         'Great suggestion! I''ll highlight my FIRST Robotics award.',NOW()),
        (2,2,100,1,'Need more concrete coding examples.','answered',
         'I''ll describe my ML weather-prediction project.',NOW()),
        (3,3,100,1,'Mention future CS goals?','answered',
         'I''ll add a paragraph on AI and accessibility.',NOW()),

        -- Ben / Omar
        (4,4,101,2,'Add metrics to leadership story.','answered',
         'Will include club growth numbers.',NOW()),
        (5,5,101,2,'Describe challenge faced in entrepreneurship.','answered',
         'I''ll tell how we overcame initial funding pushback.',NOW()),
        (6,6,101,2,'Link goals to school resources?','answered',
         'Will cite Wharton leadership program.',NOW()),

        -- Cara / Miguel
        (7,7,102,4,'Need more technical research details.','answered',
         'I''ll include methodology and sample size.',NOW()),
        (8,8,102,4,'Specify medical research interests.','answered',
         'Adding my focus on cancer genomics.',NOW()),
        (9,9,102,4,'Add personal story for motivation.','answered',
         'Telling about grandmother''s illness.',NOW()),

        -- James / Sarah
        (10,10,103,3,'Add favourite authors?','answered',
         'Mentioning Toni Morrison & James Baldwin.',NOW()),
        (11,11,103,3,'Expand To Kill a Mockingbird example.','answered',
         'Adding its influence on my justice perspective.',NOW()),
        (12,12,103,3,'Link social-justice goal to writing samples.','answered',
         'Will reference my community-newsletter series.',NOW()),

        -- Maria / Priya
        (13,13,104,5,'Include concrete policy examples.','answered',
         'Adding local housing policy that shaped my views.',NOW()),
        (14,14,104,5,'Add outcomes of voter drive.','answered',
         'We registered 400+ new voters.',NOW()),
        (15,15,104,5,'Specify key political issues.','answered',
         'Focus on education equity & healthcare access.',NOW()),

        -- Alex / David
        (16,16,105,6,'Add technical specs for project.','answered',
         'Including panel efficiency & filtration rate.',NOW()),
        (17,17,105,6,'Tie sustainability project to global issues.','answered',
         'Explaining link to water scarcity.',NOW()),
        (18,18,105,6,'Cite specific green tech.','answered',
         'Adding carbon-capture & renewable-energy discussion.',NOW());

/* ───────── comments on pings ─────────────────────────────────────── */
INSERT INTO comment
        (id,ping_id,author_id,anchor_start,anchor_end,body,resolved,created_at) VALUES
        -- Alice
        (1,1,1,0,0,'Robotics will really strengthen your spike narrative.',FALSE,NOW()),
        (2,2,1,0,0,'Concrete examples make the essay vivid.',FALSE,NOW()),
        (3,3,1,0,0,'Great—future goals show long-term vision.',FALSE,NOW()),
        -- Ben
        (4,4,2,0,0,'Metrics quantify impact—good call.',FALSE,NOW()),
        (5,5,2,0,0,'Challenge-and-solution arcs read well.',FALSE,NOW()),
        (6,6,2,0,0,'Referencing programs shows fit.',FALSE,NOW()),
        -- Cara
        (7,7,4,0,0,'Methodology details = credibility.',FALSE,NOW()),
        (8,8,4,0,0,'Specific fields convey focus.',FALSE,NOW()),
        (9,9,4,0,0,'Personal story adds heart.',FALSE,NOW()),
        -- James
        (10,10,3,0,0,'Authors show breadth.',FALSE,NOW()),
        (11,11,3,0,0,'More depth on that example will shine.',FALSE,NOW()),
        (12,12,3,0,0,'Social-justice tie-in is powerful.',FALSE,NOW()),
        -- Maria
        (13,13,5,0,0,'Policy examples prove expertise.',FALSE,NOW()),
        (14,14,5,0,0,'Hard numbers impress reviewers.',FALSE,NOW()),
        (15,15,5,0,0,'Focusing issues shows depth.',FALSE,NOW()),
        -- Alex
        (16,16,6,0,0,'Specs highlight technical skill.',FALSE,NOW()),
        (17,17,6,0,0,'Real-world link boosts relevance.',FALSE,NOW()),
        (18,18,6,0,0,'Tech specifics = thought leadership.',FALSE,NOW());

/* ───────── consultant-matching-quiz responses (only some mentors filled) ─ */
INSERT INTO consultantmatchingquizresponse
        (id, consultant_id,
         passionate_subjects, academic_competitions, has_published_research,
         extracurricular_activities,
         other_subjects, other_activities,
         gender, first_generation,
         created_at, updated_at)
VALUES
        -- Jane (consultant 1)
        (1, 1,
         '["Computer Science","Engineering","Mathematics","Physics"]',
         '["USACO (Informatics Olympiad)","Science Olympiad","FIRST Robotics"]',
         TRUE,
         '["FIRST Robotics"]',
         NULL, NULL,
         'Female', FALSE,
         NOW(), NOW()),

        -- Omar (consultant 2)
        (2, 2,
         '["Economics","Business / Entrepreneurship","Political Science"]',
         '["DECA","Model UN"]',
         FALSE,
         '["Debate or Speech","Student Government"]',
         NULL, NULL,
         'Male', FALSE,
         NOW(), NOW()),

        -- Miguel (consultant 4)
        (3, 4,
         '["Biology","Chemistry","Environmental Science","Pre-Medicine"]',
         '["Science Olympiad","Intel STS / Regeneron"]',
         TRUE,
         '[]',
         NULL, NULL,
         'Male', FALSE,
         NOW(), NOW()),

        -- David (consultant 6)
        (4, 6,
         '["Computer Science","Engineering","Data Science","Mathematics"]',
         '["USACO (Informatics Olympiad)","FIRST Robotics"]',
         TRUE,
         '["FIRST Robotics"]',
         NULL, NULL,
         'Male', FALSE,
         NOW(), NOW());

-- (Consultants 3 and 5 have **no rows** here, so they appear as mentors
--   who haven’t filled out their quiz yet.)

/* ───────── sequence bumps ───────────────────────────────────────── */
SELECT setval('studentmatchingquizresponse_id_seq', (SELECT MAX(id) FROM studentmatchingquizresponse));
SELECT setval('student_id_seq', (SELECT MAX(id) FROM student));
SELECT setval('consultant_id_seq', (SELECT MAX(id) FROM consultant));
SELECT setval('collegeapplication_id_seq', (SELECT MAX(id) FROM collegeapplication));
SELECT setval('ping_id_seq', (SELECT MAX(id) FROM ping));
SELECT setval('comment_id_seq', (SELECT MAX(id) FROM comment));
SELECT setval('essayresponse_id_seq', (SELECT MAX(id) FROM essayresponse));
SELECT setval('address_id_seq', (SELECT MAX(id) FROM address));
SELECT setval('transcript_id_seq', (SELECT MAX(id) FROM transcript));
SELECT setval('quizquestion_id_seq', (SELECT MAX(id) FROM quizquestion));
SELECT setval('studentquizanswer_id_seq', (SELECT MAX(id) FROM studentquizanswer));
SELECT setval('consultantmatchingquizresponse_id_seq', (SELECT MAX(id) FROM consultantmatchingquizresponse));

COMMIT;
