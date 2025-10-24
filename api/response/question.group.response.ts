export interface QuestionGroupDtls {
  _id: string;
  groupName: string;
  formSkillBaseQuestion:{
        skills: string,
        categories:string,
        difficultyLevel: string,
        numberOfQuestion:number
      }[],
  totalNumberOfQuestion: number;
  autoSelect: boolean;      
  selectedQuestions: string[];   
  createdBy: string;
  modifiedBy?: string;
  isActive: boolean;
  isDelete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionGroupSkillDtls{
        skills: string,
        categories:string,
        difficultyLevel: string,
        numberOfQuestion:number
}

export interface QuestionGroupForProfessionals {
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
}