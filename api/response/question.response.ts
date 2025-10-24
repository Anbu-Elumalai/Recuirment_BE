export interface QuestionDtls {
  _id: string;
  questionText: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  category: string;
  skills: string[]; // Array of skill ObjectIds or names
  difficultyLevel: "easy" | "medium" | "hard";
  timeLimit: number; // in seconds or minutes
  marks: number;
  isActive: boolean;
  createdBy: string;
  modifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
