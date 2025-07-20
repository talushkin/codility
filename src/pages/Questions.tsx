import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'https://be-tan-theta.vercel.app';

function Questions() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/ai/react-questionaire`,
        {
          numberOfQuestions: 5,
          numberOfPossibleAnswers: 4
        },
        {
          headers: {
            'Authorization': 'Bearer 1234',
            'Content-Type': 'application/json'
          }
        }
      );
      let raw = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.questions)
        ? res.data.questions
        : [];
      // Map to required format
      const formatted = raw.map((q: any) => ({
        q: q.q || q.question || '',
        answers: Array.isArray(q.answers)
          ? q.answers.map((a: any) => ({
              text: a.text || a.answer || '',
              correct: !!a.correct
            }))
          : [],
        explanation: q.explanation || ''
      }));
      if (formatted.length) {
        setQuestions(formatted);
        setCurrent(0);
        setSelected(null);
        setSubmitted(false);
        // Do NOT reset correctCount/answeredCount here; accumulate totals
      } else {
        setError('No valid questions found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = () => {
    if (selected !== null) {
      setSubmitted(true);
      setAnsweredCount((prev) => prev + 1);
      if (questions[current].answers[selected]?.correct) {
        setCorrectCount((prev) => prev + 1);
      }
    }
  };

  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      fetchQuestions();
    }
  };

  const handleReset = () => {
    setCorrectCount(0);
    setAnsweredCount(0);
    setCurrent(0);
    setSelected(null);
    setSubmitted(false);
    fetchQuestions();
  };

  if (loading) return <div style={{textAlign:'center',marginTop:40}}>טוען שאלות...</div>;
  if (error) return <div style={{color:'red',textAlign:'center',marginTop:40}}>שגיאה: {error}</div>;
  if (!questions.length) return <div style={{textAlign:'center',marginTop:40}}>לא נמצאו שאלות.</div>;

  const questionData = questions[current];

  const percent = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 24, border: '1px solid #ccc', borderRadius: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontWeight: 'bold' }}>Question {current + 1}</span>
        <span style={{ fontSize: 14, color: '#555' }}>נכונות: {correctCount}/{answeredCount} ({percent}%)</span>
      </div>
      <button
        style={{ marginBottom: 12, padding: '6px 16px', borderRadius: 8, background: '#aaa', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
        onClick={handleReset}
      >
        איפוס
      </button>
      <h2 style={{ marginBottom: 16 }}>{questionData.q}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {questionData.answers.map((ans: any, idx: number) => (
          <button
            key={idx}
            onClick={() => !submitted && setSelected(idx)}
            style={{
              padding: 12,
              borderRadius: 8,
              border: selected === idx ? '2px solid #1976d2' : '1px solid #aaa',
              background: submitted
                ? ans.correct
                  ? '#c8e6c9'
                  : selected === idx
                  ? '#ffcdd2'
                  : '#fff'
                : selected === idx
                ? '#e3f2fd'
                : '#fff',
              cursor: submitted ? 'default' : 'pointer',
              fontWeight: selected === idx ? 'bold' : 'normal',
              textAlign: 'left',
            }}
            disabled={submitted}
          >
            {String.fromCharCode(65 + idx) + '. '}{ans.text}
          </button>
        ))}
      </div>
      {!submitted && (
        <button
          style={{ marginTop: 24, padding: '10px 24px', borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 'bold', cursor: selected !== null ? 'pointer' : 'not-allowed' }}
          onClick={handleSend}
          disabled={selected === null}
        >
          שלח
        </button>
      )}
      {submitted && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 'bold', color: questionData.answers[selected!].correct ? 'green' : 'red' }}>
            {questionData.answers[selected!].correct ? 'נכון!' : 'לא נכון.'}
          </div>
          <div style={{ marginTop: 12, background: '#f5f5f5', padding: 12, borderRadius: 8 }}>
            <strong>הסבר:</strong> {questionData.explanation}
          </div>
          <button
            style={{ marginTop: 24, padding: '10px 24px', borderRadius: 8, background: '#388e3c', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
export default Questions;