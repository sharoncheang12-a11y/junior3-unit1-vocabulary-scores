# Unit 1 vocabulary score tracker

This site has three full Junior 3 Unit 1 Part B exercises, a Part C phrase exercise, a Part E word-formation exercise, and a first-letter midtest practice that record every checked attempt, plus a separate three-question spot check that keeps no records.

- Questions 11–24 (student): https://sharoncheang12-a11y.github.io/junior3-unit1-vocabulary-scores/
- Questions 11–24 (teacher): https://sharoncheang12-a11y.github.io/junior3-unit1-vocabulary-scores/teacher.html
- Questions 25–40 (student): https://sharoncheang12-a11y.github.io/junior3-unit1-vocabulary-scores/part-b-25-40.html
- Questions 25–40 (teacher): https://sharoncheang12-a11y.github.io/junior3-unit1-vocabulary-scores/teacher-25-40.html
- Questions 11–40 (student): https://sharoncheang12-a11y.github.io/junior3-unit1-vocabulary-scores/part-b-11-40.html
- Questions 11–40 (teacher): https://sharoncheang12-a11y.github.io/junior3-unit1-vocabulary-scores/teacher-11-40.html

- Part C study tips (student): https://sharoncheang12-a11y.github.io/junior3-unit1-vocabulary-scores/part-c.html
- Part C study tips (teacher): https://sharoncheang12-a11y.github.io/junior3-unit1-vocabulary-scores/teacher-c.html
- Part C student QR code: https://sharoncheang12-a11y.github.io/junior3-unit1-vocabulary-scores/part-c-qr.png

- Part E word formation (student): https://sharoncheang12-a11y.github.io/junior3-unit1-vocabulary-scores/part-e.html
- Part E word formation (teacher): https://sharoncheang12-a11y.github.io/junior3-unit1-vocabulary-scores/teacher-e.html
- Part E student QR code: https://sharoncheang12-a11y.github.io/junior3-unit1-vocabulary-scores/part-e-qr.png

- First-letter midtest (student): https://sharoncheang12-a11y.github.io/junior3-unit1-vocabulary-scores/first-letter-midtest.html
- First-letter midtest (teacher): https://sharoncheang12-a11y.github.io/junior3-unit1-vocabulary-scores/teacher-first-letter.html
- First-letter midtest QR code: https://sharoncheang12-a11y.github.io/junior3-unit1-vocabulary-scores/first-letter-midtest-qr.png
- Questions 25–40 (three-question spot check): https://sharoncheang12-a11y.github.io/junior3-unit1-vocabulary-scores/part-b-25-40-quick-check.html
- GitHub source: https://github.com/sharoncheang12-a11y/junior3-unit1-vocabulary-scores
- Firebase project: `junior-3-unit-1-scores` (Spark/free, Firestore in Hong Kong)

Students enter a class and student number. Each time they press **Check Answers**, the page submits one attempt with its score and timestamp. The teacher pages require the configured Google account. Only that account may read attempts under the deployed Firestore rules. The student pages sign students in anonymously and do not ask them to create an account. Each full exercise uses a separate score collection. Part C is scored out of 8.

The combined 11–40 exercise also stores the numbers of correctly answered questions, without answer text. Its teacher page shows each question's accuracy using only each class-and-student-number pair's first submission, sorted from lowest accuracy upward. All submissions remain visible in the score list. Class and student-number filters apply to both views. Older combined submissions that lack question-level results remain in the score list but are excluded from the accuracy calculation.

Part C uses eight study-tip phrases from the worksheet word bank. Students tap a sentence and then a phrase; each phrase can be used once. Sentences and phrases shuffle on load and Restart. The two phrases requiring changed forms in the complete sentence are graded by phrase choice, with the correct form shown after a correct check. The worksheet key appears to contain the typo `work zout a study plan`; the exercise follows the word bank and sentence meaning with `work out a study plan`. The Part C teacher page lists every attempt and shows each question's first-submission accuracy, separately from Part B.

Part E contains all 12 word-formation questions from the worksheet. Students choose one of the listed forms for each sentence. Questions and answer options shuffle on load and Restart, and all answers are checked together. The teacher page lists every attempt and shows each question's first-submission accuracy, separately from the other parts.

The first-letter midtest practice uses the eight blanks in `First letterMidTest.docx`. Each blank is an independent card, including the two source rows with two blanks. Students type the full word or phrase, the cards shuffle on load and Restart, and marking is delayed until all eight answers are entered. `problem solving` is accepted alongside `problem-solving`, and `organization` alongside `organisation`. The teacher page lists every submission and reports each question's wrong-answer rate using only the first submission for each class-and-student-number pair, sorted from highest wrong rate to lowest. No answer text is stored.

The full exercises require an internet connection. They do not collect names or answer text. Class and student number are self-entered, so this is a practice record rather than a verified assessment. Keep the teacher links for your own use; even if someone has them, they cannot read scores without the authorized Google account.

The spot-check page randomly draws three different questions from 25–40 on load and Restart. It grades only after all three answers are entered and shows Score x/3 to present to the teacher in person. It does not use Firebase or collect class, student number, or scores. The downloaded HTML works offline.

The Firebase rules are also saved in `firestore.rules` for future maintenance. The public web app settings in `firebase-config.js` are normal client configuration, not private credentials. Never publish a service-account key.

The original 11–24 exercise was verified on 2026-09-23: a 14/14 test attempt was saved, appeared in the signed-in teacher panel, and was deleted afterwards. Anonymous student sign-in also connected successfully. The original offline practice file remains at `../unit1-part-b-vocabulary.html`.

The 25–40 exercise was verified on 2026-09-24: the published page connected, a clearly labelled `TEST-25-40` / `00` attempt scored 16/16, and that attempt appeared in the signed-in teacher panel. This test entry remains in the teacher records.

The 11–40 exercise and question-accuracy panel were verified on 2026-10-07: `TEST-11-40` / `00` saved a 29/30 first attempt and a 30/30 retry. Both appear in the signed-in teacher score list, while question 11 remains 0/1 (0%) in the first-attempt accuracy table. These two clearly labelled test entries remain in the teacher records.

Part C was verified on 2026-10-07: `TEST-C` / `00` saved a 6/8 first attempt and an 8/8 retry. Both appeared in the teacher score list, while questions 1 and 7 showed 0/1 (0%) in the first-attempt accuracy table. These two clearly labelled test entries remain in the teacher records.

Part E was verified on 2026-10-07: `TEST-E` / `00` saved an 11/12 first attempt and a 12/12 retry. Both appeared in the teacher score list, while question 1 showed 0/1 (0%) in the first-attempt accuracy table. These two clearly labelled test entries remain in the teacher records.
