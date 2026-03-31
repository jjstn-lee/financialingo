import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "../db/schema";


const neonConfig = process.env.DATABASE_URL!;
console.log(`neonConfig: ${neonConfig}`);

const sql = neon(neonConfig);
const db = drizzle(sql, { schema });

const main = async () => {
  try {
    console.log("Seeding database");

    // Delete all existing. data
    await Promise.all([
      db.delete(schema.userProgress),
      db.delete(schema.questionProgress),
      db.delete(schema.options),
      db.delete(schema.questions),
      db.delete(schema.lessons),
      db.delete(schema.units),
      db.delete(schema.courses),
    ]);

    // Insert courses
    const courses = await db
      .insert(schema.courses)
      .values([
        { title: "Investing Basics", description: "Learn the basics of making your money work for you" },
      ])
      .returning();

    // For each course, insert units
    for (const course of courses) {
      const units = await db
        .insert(schema.units)
        .values([
          {
            courseId: course.id,
            title: "Fundamentals of Investing",
            description: `Learn the core concepts and vocabulary revolving around investing.`,
            order: 1,
          },
          {
            courseId: course.id,
            title: "Stocks",
            description: `Learn about investing in the stock market, including how stocks work, trading strategies, and portfolio management.`,
            order: 2,
          },
        ])
        .returning();

      // For each unit, insert lessons
      for (const unit of units) {
        const lessons = await db
          .insert(schema.lessons)
          .values([
            { unitId: unit.id, title: "Key Terms", order: 1 },
            { unitId: unit.id, title: "Asset Classes", order: 2 },
            { unitId: unit.id, title: "Risk & Return", order: 3 },
            { unitId: unit.id, title: "Diversification", order: 4 },
            { unitId: unit.id, title: "Building a Portfolio", order: 5 },
          ])
          .returning();

        // For each lesson, insert questions
        for (const lesson of lessons) {
          await db
            .insert(schema.questions)
            .values([
              {
                lessonId: lesson.id,
                question: 'Which of these best describes a "stock"?',
                choices: JSON.stringify(["A share of ownership in a company", "A loan made to a government", "A fixed monthly savings deposit", "A contract to buy assets at a future price"]),
                answer: "A share of ownership in a company",
                order: 1,
              },
              {
                lessonId: lesson.id,
                question: 'Which of these best describes a "bond"?',
                choices: JSON.stringify(["A debt instrument that pays interest", "A share of ownership in a company", "An index tracking the market", "A real estate investment trust"]),
                answer: "A debt instrument that pays interest",
                order: 2,
              },
              {
                lessonId: lesson.id,
                question: 'Which of these best describes "diversification"?',
                choices: JSON.stringify(["Spreading investments to reduce risk", "Putting all money into one stock", "Selling all assets during a downturn", "Borrowing money to invest in the market"]),
                answer: "Spreading investments to reduce risk",
                order: 3,
              },
              {
                lessonId: lesson.id,
                question: 'Which of these best describes a "dividend"?',
                choices: JSON.stringify(["A portion of company profits paid to shareholders", "The total value of a company", "The annual fee charged by a broker", "The interest earned on a savings account"]),
                answer: "A portion of company profits paid to shareholders",
                order: 4,
              },
              {
                lessonId: lesson.id,
                question: 'Which of these best describes an "index fund"?',
                choices: JSON.stringify(["A fund that tracks a market index like the S&P 500", "A savings account with a fixed interest rate", "A government-issued inflation-protected bond", "A fund managed actively by a portfolio manager"]),
                answer: "A fund that tracks a market index like the S&P 500",
                order: 5,
              },
            ]);
        }
      }
    }

    console.log("Database seeded successfully");
  } catch (error) {
    console.error(error);
    throw new Error("Failed to seed database");
  }
};

void main();