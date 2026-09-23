# Unit 1 Part B vocabulary score tracker

This site is ready for Junior 3 Unit 1 Part B, questions 11–24.

- Student exercise: https://sharoncheang12-a11y.github.io/junior3-unit1-vocabulary-scores/
- Teacher scores: https://sharoncheang12-a11y.github.io/junior3-unit1-vocabulary-scores/teacher.html
- GitHub source: https://github.com/sharoncheang12-a11y/junior3-unit1-vocabulary-scores
- Firebase project: `junior-3-unit-1-scores` (Spark/free, Firestore in Hong Kong)

Students enter a class and student number. Each time they press **Check Answers**, the page submits one attempt with the score out of 14 and a timestamp. The teacher page requires the configured Google account. Only that account may read attempts under the deployed Firestore rules. The student page signs students in anonymously and does not ask them to create an account.

The pages require an internet connection. The site does not collect names or answer text. Class and student number are self-entered, so this is a practice record rather than a verified assessment. Keep the teacher link for your own use; even if someone has it, they cannot read scores without the authorized Google account.

The Firebase rules are also saved in `firestore.rules` for future maintenance. The public web app settings in `firebase-config.js` are normal client configuration, not private credentials. Never publish a service-account key.

Verified on 2026-09-23: a 14/14 test attempt was saved, appeared in the signed-in teacher panel, and was deleted afterwards. Anonymous student sign-in also connected successfully. The original offline practice file remains at `../unit1-part-b-vocabulary.html`.
