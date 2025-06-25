\set ON_ERROR_STOP on
BEGIN;

/* ─── reference tables ──────────────────────────────────────────────── */
INSERT INTO highschool (id, name, city, state, country) VALUES
  (1,'Lincoln High School','Seattle','WA','USA'),
  (2,'Westview Secondary','Austin','TX','USA');

INSERT INTO college (id, name, common_app_code) VALUES
  (1,'Massachusetts Institute of Technology','MIT'),
  (2,'Stanford University','STAN'),
  (3,'University of Texas at Austin','UTA');

/* ─── consultants (NEW: password_hash) ─────────────────────────────── */
INSERT INTO consultant
        (id, email,               name,        bio,                                     tags,
         password_hash)
VALUES  (1, 'jane@consults.com',  'Jane Parker',
            'Former MIT admissions reader. Loves robotics.',
            '{"usaco","robotics","first"}',
            '$2b$12$cmEwz3dqWDLO7DEE6zcGmuOrtPxWwOT9zlBJgqQcS8xQfSJfHKoEC'),
        (2, 'omar@consults.com',  'Omar Ahmad',
            'Essay specialist; ex-Stanford GSB.',
            '{"debate","business","startup"}',
            '$2b$12$cmEwz3dqWDLO7DEE6zcGmuOrtPxWwOT9zlBJgqQcS8xQfSJfHKoEC');

/* ─── students (NEW: email, password_hash) ─────────────────────────── */
INSERT INTO student
        (id, registration_id, user_id, highschool_id, photo_url, paid,
         email,              password_hash)
VALUES  (1,'REG-001',101,1,'https://pics.example/s1.jpg',TRUE,
         'alice@example.com','$2b$12$Sidd2DcTAedIHfwfbaTAueNJgFHYQV.tobveVUUP3Z1xRJBKVm/ee'),
        (2,'REG-002',102,2,'https://pics.example/s2.jpg',FALSE,
         'ben@example.com',  '$2b$12$Sidd2DcTAedIHfwfbaTAueNJgFHYQV.tobveVUUP3Z1xRJBKVm/ee'),
        (3,'REG-003',103,1,NULL,                           TRUE,
         'cara@example.com', '$2b$12$Sidd2DcTAedIHfwfbaTAueNJgFHYQV.tobveVUUP3Z1xRJBKVm/ee');

/* ─── addresses ─────────────────────────────────────────────────────── */
INSERT INTO address (id, student_id, line1, city, state, zip_code, country, type) VALUES
  (1,1,'123 Maple Ave','Seattle','WA','98101','USA','home'),
  (2,2,'77 Ranch Rd','Austin','TX','73301','USA','home'),
  (3,3,'890 Sunrise Dr.','Seattle','WA','98109','USA','home');

/* ─── transcripts ──────────────────────────────────────────────────── */
INSERT INTO transcript (id, student_id, gpa, pdf_url, created_at) VALUES
  (1,1,3.92,'https://docs.example/t1.pdf',NOW()),
  (2,2,3.70,'https://docs.example/t2.pdf',NOW()),
  (3,3,4.00,'https://docs.example/t3.pdf',NOW());

/* ─── quiz questions & answers ─────────────────────────────────────── */
INSERT INTO quizquestion (id, text, tag) VALUES
  (1,'Did you compete in USACO?','usaco'),
  (2,'Are you a DECA member?','deca'),
  (3,'Have you published research?','research');

INSERT INTO studentquizanswer (student_id, question_id, answer) VALUES
  (1,1,'yes'),(1,2,'no'), (1,3,'yes'),
  (2,1,'no'), (2,2,'yes'),(2,3,'no'),
  (3,1,'yes'),(3,2,'yes'),(3,3,'no');

/* ─── college applications & essays ────────────────────────────────── */
INSERT INTO collegeapplication (id, student_id, college_id, consultant_id, status) VALUES
  (1,1,1,1,'draft'),
  (2,1,2,1,'submitted'),
  (3,2,3,2,'draft'),
  (4,3,1,NULL,'draft');

INSERT INTO essayresponse (id, application_id, prompt, response, last_edited) VALUES
  (1,1,'MIT short answer #1',
     'I build open-source prosthetics for my local FIRST team.',NOW()),
  (2,2,'Stanford short answer #1',
     'What matters to me is empowering small farmers with drones.',NOW()),
  (3,3,'UT Austin ApplyTexas essay A',
     'Growing up on a ranch taught me resilience.',NOW());

/* ─── pings ─────────────────────────────────────────────────────────── */
INSERT INTO ping (id, application_id, student_id, consultant_id,
                  question, status, answer, created_at) VALUES
  (1,1,1,1,'Could you review my MIT major essay draft?','answered',
     'Great start! tighten paragraph 2 and show quantifiable impact.',NOW()),
  (2,3,2,2,'Do I need another recommendation letter?','open',NULL,NOW());

COMMIT;
