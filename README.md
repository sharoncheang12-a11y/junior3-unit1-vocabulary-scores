# Unit 1 Part B vocabulary score tracker

This site has two full Junior 3 Unit 1 Part B exercises that record every checked attempt, plus a separate three-question spot check that keeps no records.

- Questions 11–24 (student): https://sharoncheang12-a11y.github.io/junior3-unit1-vocabulary-scores/
- Questions 11–24 (teacher): https://sharoncheang12-a11y.github.io/junior3-unit1-vocabulary-scores/teacher.html
- Questions 25–40 (student): https://sharoncheang12-a11y.github.io/junior3-unit1-vocabulary-scores/part-b-25-40.html
- Questions 25–40 (teacher): https://sharoncheang12-a11y.github.io/junior3-unit1-vocabulary-scores/teacher-25-40.html
- Questions 25–40 (three-question spot check): https://sharoncheang12-a11y.github.io/junior3-unit1-vocabulary-scores/part-b-25-40-quick-check.html
- GitHub source: https://github.com/sharoncheang12-a11y/junior3-unit1-vocabulary-scores
- Firebase project: `junior-3-unit-1-scores` (Spark/free, Firestore in Hong Kong)

Students enter a class and student number. Each time they press **Check Answers**, the page submits one attempt with its score and timestamp. The teacher pages require the configured Google account. Only that account may read attempts under the deployed Firestore rules. The student pages sign students in anonymously and do not ask them to create an account. The 25–40 exercise is scored out of 16 and uses its own collection, separate from the 11–24 records.

The full exercises require an internet connection. They do not collect names or answer text. Class and student number are self-entered, so this is a practice record rather than a verified assessment. Keep the teacher links for your own use; even if someone has them, they cannot read scores without the authorized Google account.

The spot-check page randomly draws three different questions from 25–40 on load and Restart. It grades only after all three answers are entered and shows Score x/3 to present to the teacher in person. It does not use Firebase or collect class, student number, or scores. The downloaded HTML works offline.

The Firebase rules are also saved in `firestore.rules` for future maintenance. The public web app settings in `firebase-config.js` are normal client configuration, not private credentials. Never publish a service-account key.

The original 11–24 exercise was verified on 2026-09-23: a 14/14 test attempt was saved, appeared in the signed-in teacher panel, and was deleted afterwards. Anonymous student sign-in also connected successfully. The original offline practice file remains at `../unit1-part-b-vocabulary.html`.

The 25–40 exercise was verified on 2026-09-24: the published page connected, a clearly labelled `TEST-25-40` / `00` attempt scored 16/16, and that attempt appeared in the signed-in teacher panel. This test entry remains in the teacher records.
