function getLearnerData(course, assignmentGroup, submissions) {
    try {
        
        if (assignmentGroup.course_id !== course.id) {
            throw new Error("Assignment group does not belong to the specified course.");
        } else {
            console.log("Assignment group validated for the course.");
        }

        const validAssignments = assignmentGroup.assignments.filter(assignment => {
            const dueDate = new Date(assignment.due_at);
            if (isNaN(dueDate) || dueDate > new Date()) {
                return false;
            }
            if (typeof assignment.points_possible !== 'number' || assignment.points_possible <= 0) {
                throw new Error(`Invalid points_possible for assignment ${assignment.id}`);
            }

            assignment.name = assignment.name.toUpperCase();
            return true;
        });

        const assignmentMap = {};
        validAssignments.forEach(assignment => {
            assignmentMap[assignment.id] = assignment;
        });


        const learnerDataMap = {};

        submissions.forEach(submission => {
            const { learner_id, assignment_id, submission: submissionDetails } = submission;

            const assignment = assignmentMap[assignment_id];
            if (!assignment) {
                return; 
            }

            const dueDate = new Date(assignment.due_at);
            const submissionDate = new Date(submissionDetails.submitted_at);

            let score = submissionDetails.score;
            if (typeof score !== 'number') {
                throw new Error(`Invalid score value for assignment ${assignment_id}`);
            }
            if (submissionDate > dueDate) {
                score -= 0.1 * assignment.points_possible;
            }

            if (!learnerDataMap[learner_id]) {
                learnerDataMap[learner_id] = {
                    id: learner_id,
                    avg: 0,
                    scores: [],
                    assignmentScores: {}
                };
            }

            learnerDataMap[learner_id].assignmentScores[assignment_id] = score / assignment.points_possible;
            learnerDataMap[learner_id].scores.push({ score, maxPoints: assignment.points_possible });
        });


        function calculateWeightedAverage(scores) {
            let totalScore = 0;
            let totalMaxPoints = 0;
            for (let scoreObj of scores) { 
                totalScore += scoreObj.score;
                totalMaxPoints += scoreObj.maxPoints;
            }
            return totalScore / totalMaxPoints;
        }

        const result = Object.values(learnerDataMap).map(learnerData => {
            const { id, scores, assignmentScores } = learnerData;
            const avg = calculateWeightedAverage(scores);

            delete learnerData.scores;  

            return { id, avg, ...assignmentScores };
        });

        return result;
    } catch (error) {
        console.error("An error occurred while processing the data:", error.message);
        return [];
    }
}

const CourseInfo = {
  id: 451,
  name: "Introduction to JavaScript"
};

const AssignmentGroup = {
  id: 12345,
  name: "Fundamentals of JavaScript",
  course_id: 451,
  group_weight: 25,
  assignments: [
    {
      id: 1,
      name: "Declare a Variable",
      due_at: "2023-01-25",
      points_possible: 50
    },
    {
      id: 2,
      name: "Write a Function",
      due_at: "2023-02-27",
      points_possible: 150
    },
    {
      id: 3,
      name: "Code the World",
      due_at: "3156-11-15",
      points_possible: 500
    }
  ]
};

const LearnerSubmissions = [
  {
    learner_id: 125,
    assignment_id: 1,
    submission: {
      submitted_at: "2023-01-25",
      score: 47
    }
  },
  {
    learner_id: 125,
    assignment_id: 2,
    submission: {
      submitted_at: "2023-02-12",
      score: 150
    }
  },
  {
    learner_id: 125,
    assignment_id: 3,
    submission: {
      submitted_at: "2023-01-25",
      score: 400
    }
  },
  {
    learner_id: 132,
    assignment_id: 1,
    submission: {
      submitted_at: "2023-01-24",
      score: 39
    }
  },
  {
    learner_id: 132,
    assignment_id: 2,
    submission: {
      submitted_at: "2023-03-07",
      score: 140
    }
  }
];


const result = getLearnerData(CourseInfo, AssignmentGroup, LearnerSubmissions);
console.log(result);