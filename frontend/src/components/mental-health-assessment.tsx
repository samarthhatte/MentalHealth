import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Target, AlertCircle } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  category: 'anxiety' | 'depression' | 'stress' | 'sleep' | 'social';
}

interface Assessment {
  id: string;
  date: Date;
  scores: {
    anxiety: number;
    depression: number;
    stress: number;
    sleep: number;
    social: number;
    overall: number;
  };
}

const questions: Question[] = [
  { id: '1', text: 'How often have you felt nervous, anxious, or on edge?', category: 'anxiety' },
  { id: '2', text: 'How often have you felt down, depressed, or hopeless?', category: 'depression' },
  { id: '3', text: 'How often have you felt overwhelmed by daily responsibilities?', category: 'stress' },
  { id: '4', text: 'How would you rate your sleep quality recently?', category: 'sleep' },
  { id: '5', text: 'How often have you enjoyed social activities with others?', category: 'social' },
  { id: '6', text: 'How often have you had trouble controlling worrying thoughts?', category: 'anxiety' },
  { id: '7', text: 'How often have you felt little interest in doing things?', category: 'depression' },
  { id: '8', text: 'How often have you felt unable to cope with stress?', category: 'stress' },
  { id: '9', text: 'How often have you had difficulty falling or staying asleep?', category: 'sleep' },
  { id: '10', text: 'How comfortable do you feel in social situations?', category: 'social' },
];

const responseOptions = [
  { value: '0', label: 'Not at all', score: 0 },
  { value: '1', label: 'Several days', score: 1 },
  { value: '2', label: 'More than half the days', score: 2 },
  { value: '3', label: 'Nearly every day', score: 3 },
];

export function MentalHealthAssessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<{ [key: string]: number }>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Load assessment history from localStorage
    const savedAssessments = localStorage.getItem('mentalHealthAssessments');
    if (savedAssessments) {
      setAssessments(JSON.parse(savedAssessments).map((assessment: any) => ({
        ...assessment,
        date: new Date(assessment.date)
      })));
    }
  }, []);

  const saveAssessment = (assessment: Assessment) => {
    const updatedAssessments = [assessment, ...assessments];
    setAssessments(updatedAssessments);
    localStorage.setItem('mentalHealthAssessments', JSON.stringify(updatedAssessments));
  };

  const handleResponse = (questionId: string, score: number) => {
    setResponses(prev => ({ ...prev, [questionId]: score }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      completeAssessment();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const completeAssessment = () => {
    const scores = calculateScores();
    const assessment: Assessment = {
      id: Date.now().toString(),
      date: new Date(),
      scores
    };
    saveAssessment(assessment);
    setIsCompleted(true);
  };

  const calculateScores = () => {
    const categoryScores = {
      anxiety: 0,
      depression: 0,
      stress: 0,
      sleep: 0,
      social: 0,
    };

    const categoryCounts = {
      anxiety: 0,
      depression: 0,
      stress: 0,
      sleep: 0,
      social: 0,
    };

    questions.forEach(question => {
      const response = responses[question.id] || 0;
      categoryScores[question.category] += response;
      categoryCounts[question.category]++;
    });

    // Calculate average scores (0-3 scale converted to 0-100)
    const normalizedScores = Object.keys(categoryScores).reduce((acc, category) => {
      const key = category as keyof typeof categoryScores;
      acc[key] = Math.round((categoryScores[key] / (categoryCounts[key] * 3)) * 100);
      return acc;
    }, {} as typeof categoryScores);

    const overall = Math.round(Object.values(normalizedScores).reduce((a, b) => a + b, 0) / 5);

    return { ...normalizedScores, overall };
  };

  const getScoreColor = (score: number) => {
    if (score <= 25) return 'text-green-600';
    if (score <= 50) return 'text-yellow-600';
    if (score <= 75) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLevel = (score: number) => {
    if (score <= 25) return 'Low';
    if (score <= 50) return 'Mild';
    if (score <= 75) return 'Moderate';
    return 'High';
  };

  const resetAssessment = () => {
    setCurrentQuestion(0);
    setResponses({});
    setIsCompleted(false);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const currentResponse = responses[currentQ?.id];

  if (showHistory) {
    const chartData = assessments.slice(0, 7).reverse().map((assessment, index) => ({
      date: assessment.date.toLocaleDateString(),
      anxiety: assessment.scores.anxiety,
      depression: assessment.scores.depression,
      stress: assessment.scores.stress,
      sleep: 100 - assessment.scores.sleep, // Invert sleep score for better visualization
      social: 100 - assessment.scores.social, // Invert social score
      overall: assessment.scores.overall
    }));

    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Assessment History
            </h2>
            <Button variant="outline" onClick={() => setShowHistory(false)}>
              New Assessment
            </Button>
          </div>

          {assessments.length > 0 ? (
            <>
              <div className="mb-6">
                <h3 className="mb-4">Score Trends (Last 7 Assessments)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="anxiety" fill="#ef4444" name="Anxiety" />
                    <Bar dataKey="depression" fill="#3b82f6" name="Depression" />
                    <Bar dataKey="stress" fill="#f59e0b" name="Stress" />
                    <Bar dataKey="overall" fill="#8b5cf6" name="Overall" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assessments.slice(0, 6).map((assessment) => (
                  <Card key={assessment.id} className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{assessment.date.toLocaleDateString()}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Overall Score</span>
                        <Badge className={getScoreColor(assessment.scores.overall)}>
                          {assessment.scores.overall}% - {getScoreLevel(assessment.scores.overall)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Anxiety: {assessment.scores.anxiety}%</div>
                        <div>Depression: {assessment.scores.depression}%</div>
                        <div>Stress: {assessment.scores.stress}%</div>
                        <div>Sleep: {assessment.scores.sleep}%</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2">No Assessment History</h3>
              <p className="text-muted-foreground mb-4">
                Take your first mental health assessment to start tracking your wellbeing.
              </p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    const scores = calculateScores();
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <h2 className="text-center mb-6">Assessment Complete</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {Object.entries(scores).map(([category, score]) => (
              <div key={category} className="text-center p-4 border rounded-lg">
                <h4 className="capitalize mb-2">{category === 'overall' ? 'Overall Wellbeing' : category}</h4>
                <div className={`text-2xl mb-1 ${getScoreColor(score)}`}>
                  {score}%
                </div>
                <Badge variant="outline" className={getScoreColor(score)}>
                  {getScoreLevel(score)}
                </Badge>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-blue-800 dark:text-blue-200 mb-2">Understanding Your Results</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  This assessment provides insights into your current mental wellbeing across different areas. 
                  Higher scores in anxiety, depression, and stress indicate areas that may need attention. 
                  Remember, this is not a medical diagnosis - please consult with a healthcare professional 
                  if you have concerns about your mental health.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={resetAssessment}>
              Take Another Assessment
            </Button>
            <Button variant="outline" onClick={() => setShowHistory(true)}>
              View History
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2>Mental Health Assessment</h2>
          <Button variant="outline" onClick={() => setShowHistory(true)}>
            View History
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="mb-8">
          <h3 className="mb-6">{currentQ?.text}</h3>
          
          <RadioGroup
            value={currentResponse?.toString() || ''}
            onValueChange={(value) => handleResponse(currentQ.id, parseInt(value))}
          >
            {responseOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          <Button 
            onClick={nextQuestion}
            disabled={currentResponse === undefined}
          >
            {currentQuestion === questions.length - 1 ? 'Complete Assessment' : 'Next'}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4">About This Assessment</h3>
        <p className="text-sm text-muted-foreground">
          This brief assessment helps you track your mental wellbeing across key areas including anxiety, 
          depression, stress, sleep quality, and social functioning. It's based on validated screening tools 
          but is not a substitute for professional mental health care. Regular self-assessment can help you 
          identify patterns and track your progress over time.
        </p>
      </Card>
    </div>
  );
}