import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, RefreshCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

const Quiz = () => {
  const { activeTafsir } = useApp();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswer = (idx) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(idx);
    if (idx === activeTafsir.kuis[currentQuestion].jawabanBenar) {
      setScore(score + 1);
      if (currentQuestion === activeTafsir.kuis.length - 1) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#f59e0b', '#ffffff']
        });
      }
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < activeTafsir.kuis.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
  };

  if (!activeTafsir.kuis || !activeTafsir.kuis.length) return null;
  const quizItem = activeTafsir.kuis[currentQuestion];

  if (showResult) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 bg-white rounded-3xl border border-emerald-100 shadow-premium"
      >
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Kuis Selesai!</h3>
        <p className="text-slate-600 mb-6">Skor Anda: <span className="text-emerald-600 font-bold">{score}</span> / {activeTafsir.kuis.length}</p>
        <button 
          onClick={resetQuiz}
          className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors mx-auto"
        >
          <RefreshCcw className="w-5 h-5" />
          <span>Ulangi Kuis</span>
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-slate-900">Uji Pemahaman</h3>
        <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
          Pertanyaan {currentQuestion + 1} of {activeTafsir.kuis.length}
        </span>
      </div>

      <motion.div 
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <p className="text-lg text-slate-800 font-medium leading-relaxed">
          {quizItem.pertanyaan}
        </p>

        <div className="grid gap-3">
          {quizItem.pilihan.map((pilihan, idx) => {
            const isCorrect = idx === quizItem.jawabanBenar;
            const isSelected = selectedAnswer === idx;
            
            let btnClass = "flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left ";
            if (selectedAnswer === null) {
              btnClass += "border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 text-slate-700";
            } else if (isSelected) {
              btnClass += isCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-red-500 bg-red-50 text-red-900";
            } else if (isCorrect) {
              btnClass += "border-emerald-500 bg-emerald-50 text-emerald-900 opacity-60";
            } else {
              btnClass += "border-slate-100 text-slate-400 opacity-40";
            }

            return (
              <button
                key={idx}
                disabled={selectedAnswer !== null}
                onClick={() => handleAnswer(idx)}
                className={btnClass}
              >
                <span>{pilihan}</span>
                {selectedAnswer !== null && (
                  <span>
                    {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                    {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {selectedAnswer !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start space-x-3"
            >
              <div className="mt-1 bg-amber-200 p-1.5 rounded-lg">
                <Info className="w-4 h-4 text-amber-800" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-900 mb-1">Pembahasan:</p>
                <p className="text-sm text-amber-800 leading-relaxed">
                  {quizItem.pembahasan}
                </p>
                <button 
                  onClick={nextQuestion}
                  className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
                >
                  {currentQuestion < activeTafsir.kuis.length - 1 ? 'Pertanyaan Selanjutnya' : 'Lihat Hasil Akhir'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Quiz;
