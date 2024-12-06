const { MongoClient } = require("mongodb");


const uri = "mongodb://localhost:27017"; // Replace with your MongoDB connection string
const dbName = "zen-class-programme"; // Replace with your database name

// Function to execute queries
const runQueries = async () => {
  const client = new MongoClient(uri);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);

    // Collections
    const topicsCollection = db.collection("topics");
    const tasksCollection = db.collection("tasks");
    const companyDrivesCollection = db.collection("company_drives");
    const mentorsCollection = db.collection("mentors");
    const usersCollection = db.collection("users");

    // Query - Find all topics and tasks taught in October
    const topicsInOctober = await topicsCollection.find({
      date_taught: {
        $gte: new Date("2023-10-01T00:00:00Z"),
        $lte: new Date("2023-10-31T23:59:59Z"),
      },
    }).toArray();

    const tasksInOctober = await tasksCollection.find({
      date_assigned: {
        $gte: new Date("2023-10-01T00:00:00Z"),
        $lte: new Date("2023-10-31T23:59:59Z"),
      },
    }).toArray();

    console.log("Topics in October:", topicsInOctober);
    console.log("Tasks in October:", tasksInOctober);

    // Query - Find all company drives between 15-Oct-2020 and 31-Oct-2020
    const companyDrives = await companyDrivesCollection.find({
      drive_date: {
        $gte: new Date("2020-10-15T00:00:00Z"),
        $lte: new Date("2020-10-31T23:59:59Z"),
      },
    }).toArray();
    console.log("Company Drives:", companyDrives);

    // Query - Find all company drives and students who appeared for placements
    const drivesWithStudents = await companyDrivesCollection.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "students_attended",
          foreignField: "_id",
          as: "students",
        },
      },
    ]).toArray();
    console.log("Company Drives with Students:", drivesWithStudents);

    // Query - Find the number of problems solved by each user in CodeKata
    const codekataStats = await usersCollection.find({}, { projection: { name: 1, codekata_problems_solved: 1 } }).toArray();
    console.log("CodeKata Stats:", codekataStats);

    // Query - Find all mentors with mentees count more than 15
    const mentorsWithManyMentees = await mentorsCollection.find({
      $where: "this.mentees.length > 15",
    }).toArray();
    console.log("Mentors with more than 15 mentees:", mentorsWithManyMentees);

    // Query - Find users who were absent and didn’t submit tasks between 15-Oct-2020 and 31-Oct-2020
    const absentAndNoTasks = await usersCollection.find({
      $and: [
        {
          attendance: {
            $elemMatch: {
              date: {
                $gte: new Date("2020-10-15T00:00:00Z"),
                $lte: new Date("2020-10-31T23:59:59Z"),
              },
              status: "Absent",
            },
          },
        },
        {
          tasks: {
            $elemMatch: {
              submitted: false,
            },
          },
        },
      ],
    }).toArray();
    console.log("Users Absent and No Task Submission:", absentAndNoTasks);
  } catch (error) {
    console.error("Error executing queries:", error);
  } finally {
    // Close the MongoDB connection
    await client.close();
    console.log("Disconnected from MongoDB");
  }
};

// Run the function
runQueries();
