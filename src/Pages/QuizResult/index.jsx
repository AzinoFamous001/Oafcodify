import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, Trophy, BookOpen, Home } from 'lucide-react';
import { FaLaptopCode, FaTerminal, FaPython, FaJsSquare } from 'react-icons/fa';
import { SiReact } from 'react-icons/si';

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-60">
      <div className="absolute top-[10%] left-[5%] animate-[spin_20s_linear_infinite] hidden sm:block">
        <FaLaptopCode size={120} className="text-white/60" />
      </div>
      <div className="absolute top-[60%] right-[10%] animate-[spin_25s_linear_infinite_reverse] hidden md:block">
        <FaTerminal size={100} className="text-blue-200/60" />
      </div>
      <div className="absolute bottom-[15%] left-[10%] animate-bounce duration-[5000ms]">
        <FaPython size={80} className="text-white/50" />
      </div>
      <div className="absolute top-[20%] right-[15%] animate-[spin_30s_linear_infinite] hidden lg:block">
        <SiReact size={110} className="text-blue-100/55" />
      </div>
      <div className="absolute top-[35%] left-[35%] animate-pulse hidden sm:block">
        <FaJsSquare size={100} className="text-white/40" />
      </div>
    </div>
  );
};

const QuizResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [courseKey, setCourseKey] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    if (location.state) {
      const { score: quizScore, total: quizTotal, courseKey: ck, lessonId: lid, attemptId } = location.state;
      
      // Check if this specific attempt has already been saved using sessionStorage
      const saveKey = `quiz_saved_${attemptId}`;
      if (sessionStorage.getItem(saveKey)) {
        // This attempt was already saved, skip
        setScore(quizScore);
        setTotal(quizTotal);
        setCourseKey(ck);
        setLessonId(lid);
        const percent = Math.round((quizScore / quizTotal) * 100);
        setPercentage(percent);
        setPassed(percent >= 60);
        return;
      }
      
      // Mark this attempt as saved
      sessionStorage.setItem(saveKey, 'true');
      setScore(quizScore);
      setTotal(quizTotal);
      setCourseKey(ck);
      setLessonId(lid);

      const percent = Math.round((quizScore / quizTotal) * 100);
      setPercentage(percent);
      setPassed(percent >= 60);

      // Save score to localStorage
      const userId = sessionStorage.getItem('currentUserId');
      if (userId) {
        // Save individual quiz result (for quick access)
        const quizResultKey = `${userId}_${ck}_lesson_${lid}_score`;
        localStorage.setItem(quizResultKey, JSON.stringify({
          score: quizScore,
          total: quizTotal,
          percentage: percent,
          passed: percent >= 60,
          timestamp: new Date().toISOString()
        }));

        // Save to quizResults array (tracks all attempts) - user-specific storage
        const quizResultsKey = `quizResults_${userId}`;
        const allQuizResults = JSON.parse(localStorage.getItem(quizResultsKey) || '[]');
        
        // Check if this attemptId already exists (most reliable duplicate check)
        const attemptExists = allQuizResults.some(r => r.attemptId === attemptId);
        
        // Fallback: Check if this exact result (same quiz, same score, same timestamp within 1 second) already exists
        // to prevent duplicate saves from page refreshes
        const exactDuplicateIndex = allQuizResults.findIndex(
          r => r.userId === userId && 
               r.courseKey === ck && 
               r.lessonId === lid && 
               r.score === quizScore && 
               r.percentage === percent &&
               Math.abs(new Date(r.date) - new Date()) < 1000 // Within 1 second
        );
        
        // Only add if no exact duplicate exists (prevents duplicate saves from refresh)
        if (!attemptExists && exactDuplicateIndex === -1) {
          const newQuizResult = {
            userId: userId,
            courseKey: ck,
            lessonId: lid,
            quizTitle: `${ck.toUpperCase()} - Lesson ${lid}`,
            score: quizScore,
            totalQuestions: quizTotal,
            percentage: percent,
            passed: percent >= 60,
            date: new Date().toISOString(),
            attemptNumber: allQuizResults.filter(
              r => r.userId === userId && r.courseKey === ck && r.lessonId === lid
            ).length + 1,
            attemptId: attemptId // Unique identifier for this attempt
          };
          
          // Always add as a new entry to track individual attempts
          allQuizResults.push(newQuizResult);
          localStorage.setItem(quizResultsKey, JSON.stringify(allQuizResults));
          
          // Sync quiz result to backend
          fetch(`http://localhost:5000/api/user/quiz-result/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quizResult: newQuizResult })
          }).catch(err => console.error('Error syncing quiz result to backend:', err));
        }

        // Mark lesson as completed if passed (only if not already completed)
        if (percent >= 60) {
          const lessonKey = `${userId}_${ck}_lesson_${lid}_completed`;
          const alreadyCompleted = localStorage.getItem(lessonKey);

          if (!alreadyCompleted) {
            localStorage.setItem(lessonKey, JSON.stringify([0, 1, 2, 3, 4])); // Mark all subtopics as complete

            // Sync lesson completion to backend
            fetch(`http://localhost:5000/api/user/lesson-progress/${userId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                courseKey: ck,
                lessonId: lid,
                completed: true
              })
            }).catch(err => console.error('Error syncing lesson completion to backend:', err));

            // Unlock next lesson - set the NEXT lesson as unlocked
            const nextLessonId = parseInt(lid) + 1;
            const unlockKey = `${userId}_${ck}_lesson_${nextLessonId}_unlocked`;
            localStorage.setItem(unlockKey, 'true');
            
            // Sync lesson unlock to backend
            fetch(`http://localhost:5000/api/user/lesson-progress/${userId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                courseKey: ck,
                lessonId: nextLessonId,
                unlocked: true
              })
            }).catch(err => console.error('Error syncing lesson unlock to backend:', err));

            // Add notification for unlocked lesson
            if (nextLessonId <= 5) {
              const storageKey = `notifications_${userId}`;
              const savedNotifications = JSON.parse(localStorage.getItem(storageKey) || '[]');

              // Check if notification already exists to avoid duplicates
              const exists = savedNotifications.some(n =>
                n.type === 'achievement' &&
                n.title === `New Lesson Unlocked!` &&
                n.message.includes(`${ck.toUpperCase()} Lesson ${nextLessonId}`)
              );

              if (!exists) {
                const unlockNotification = {
                  id: Date.now(),
                  type: 'achievement',
                  title: `🎓 Level Unlocked: ${ck.toUpperCase()} Lesson ${nextLessonId}!`,
                  message: `Congratulations! You've unlocked ${ck.toUpperCase()} Lesson ${nextLessonId}. Keep up the great work!`,
                  time: 'Just now',
                  isRead: false,
                  iconType: 'achievement',
                  lessonId: nextLessonId,
                  courseKey: ck
                };
                savedNotifications.unshift(unlockNotification);
                localStorage.setItem(storageKey, JSON.stringify(savedNotifications));

                // Sync notification to backend
                const numericUserId = parseInt(userId);
                if (!isNaN(numericUserId)) {
                  fetch(`http://localhost:5000/api/user/notification/${userId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notification: unlockNotification })
                  })
                  .then(response => {
                    if (!response.ok) throw new Error(`Backend returned ${response.status}`);
                    return response.json();
                  })
                  .catch(err => console.error('Error syncing notification to backend:', err));
                }
              }
            }

            // Check if course is completed (all 5 lessons done)
            let completedInCourse = 0;
            for (let i = 1; i <= 5; i++) {
              const checkKey = `${userId}_${ck}_lesson_${i}_completed`;
              if (localStorage.getItem(checkKey)) {
                completedInCourse++;
              }
            }

            if (completedInCourse === 5) {
              const storageKey = `notifications_${userId}`;
              const savedNotifications = JSON.parse(localStorage.getItem(storageKey) || '[]');

              const courseCompletedNotification = {
                id: Date.now() + 1,
                type: 'achievement',
                title: `🏆 Course Completed: ${ck.toUpperCase()}!`,
                message: `Amazing! You've completed all 5 lessons in ${ck.toUpperCase()}. You're making great progress!`,
                time: 'Just now',
                isRead: false,
                iconType: 'achievement',
                courseKey: ck
              };
              savedNotifications.unshift(courseCompletedNotification);
              localStorage.setItem(storageKey, JSON.stringify(savedNotifications));

              // Sync notification to backend
              const numericUserId = parseInt(userId);
              if (!isNaN(numericUserId)) {
                fetch(`http://localhost:5000/api/user/notification/${userId}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ notification: courseCompletedNotification })
                })
                .then(response => {
                  if (!response.ok) throw new Error(`Backend returned ${response.status}`);
                  return response.json();
                })
                .catch(err => console.error('Error syncing notification to backend:', err));
              }

              // Check rank change
              const completedCoursesKey = `completedCourses_${userId}`;
              let completedCourses = parseInt(localStorage.getItem(completedCoursesKey) || '0');
              completedCourses++;
              localStorage.setItem(completedCoursesKey, completedCourses.toString());

              // Sync completedCourses to backend
              fetch(`http://localhost:5000/api/user/progress/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completedCourses })
              }).catch(err => console.error('Error syncing completedCourses to backend:', err));

              let newRank = 'Bronze';
              if (completedCourses >= 2) {
                newRank = 'Gold';
              } else if (completedCourses >= 1) {
                newRank = 'Silver';
              }

              if (newRank !== 'Bronze') {
                const rankNotification = {
                  id: Date.now() + 2,
                  type: 'achievement',
                  title: `🥇 Rank Upgraded to ${newRank}!`,
                  message: `Congratulations! You've earned the ${newRank} rank by completing ${completedCourses} course(s)!`,
                  time: 'Just now',
                  isRead: false,
                  iconType: 'achievement'
                };
                savedNotifications.unshift(rankNotification);
                localStorage.setItem(storageKey, JSON.stringify(savedNotifications));

                // Sync notification to backend
                const numericUserId = parseInt(userId);
                if (!isNaN(numericUserId)) {
                  fetch(`http://localhost:5000/api/user/notification/${userId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notification: rankNotification })
                  })
                  .then(response => {
                    if (!response.ok) throw new Error(`Backend returned ${response.status}`);
                    return response.json();
                  })
                  .catch(err => console.error('Error syncing notification to backend:', err));
                }
              }
            }

            console.log(`Lesson ${lid} completed and unlocked for ${ck}`);
          }
        } else {
          // Add recommendation to retake lesson if score is below 60%
          const storageKey = `notifications_${userId}`;
          const savedNotifications = JSON.parse(localStorage.getItem(storageKey) || '[]');

          // Check if recommendation already exists
          const existingRec = savedNotifications.find(n =>
            n.type === 'recommendation' &&
            n.lessonId === lid &&
            n.courseKey === ck
          );

          if (!existingRec) {
            const recommendation = {
              id: Date.now(),
              type: 'recommendation',
              title: `Retake ${ck.toUpperCase()} Lesson ${lid}`,
              message: `You scored ${percent}% on this lesson. Retaking it will help improve your overall performance record.`,
              time: 'Just now',
              isRead: false,
              iconType: 'recommendation',
              lessonId: lid,
              courseKey: ck,
              percentage: percent
            };
            savedNotifications.unshift(recommendation);
            localStorage.setItem(storageKey, JSON.stringify(savedNotifications));

            // Sync notification to backend
            const numericUserId = parseInt(userId);
            if (!isNaN(numericUserId)) {
              fetch(`http://localhost:5000/api/user/notification/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notification: recommendation })
              })
              .then(response => {
                if (!response.ok) throw new Error(`Backend returned ${response.status}`);
                return response.json();
              })
              .catch(err => console.error('Error syncing notification to backend:', err));
            }
          }
        }
      }
    } else if (!location.state) {
      // If no state, redirect to dashboard
      navigate('/dashboard');
    }

    // Auto-scroll to top on page mount
    window.scrollTo(0, 0);
  }, [location.state, navigate]);

  const handleRetakeQuiz = () => {
    navigate(`/quiz/${courseKey}/${lessonId}`);
  };

  const handleNextLesson = () => {
    const nextLessonId = parseInt(lessonId) + 1;
    navigate(`/lesson/${courseKey}/${nextLessonId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleBackToCourse = () => {
    navigate(`/course/${courseKey}`);
  };

  return (
    <div className="relative min-h-screen  bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 flex items-center justify-center p-4">
      <AnimatedBackground />
      <div className="relative z-10 max-w-2xl w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            {passed ? (
              <div className="flex justify-center mb-4">
                <div className="bg-green-500/20 p-4 rounded-full">
                  <Trophy className="w-16 h-16 text-green-400" />
                </div>
              </div>
            ) : (
              <div className="flex justify-center mb-4">
                <div className="bg-red-500/20 p-4 rounded-full">
                  <XCircle className="w-16 h-16 text-red-400" />
                </div>
              </div>
            )}
            <h1 className="text-4xl font-bold text-white mb-2">
              {passed ? 'Congratulations!' : 'Keep Practicing!'}
            </h1>
            <p className="text-gray-300 text-lg">
              {passed
                ? 'You have passed this lesson and unlocked the next one!'
                : 'You need at least 60% to unlock the next lesson.'}
            </p>
          </div>

          {/* Score Card */}
          <div className="bg-white/5 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-300 text-lg">Your Score</span>
              <span className="text-white text-lg font-semibold">
                {courseKey.toUpperCase()} - Lesson {lessonId}
              </span>
            </div>
            <div className="flex items-center justify-center mb-4">
              <div className="text-6xl font-bold text-white">
                {percentage}%
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold">{score} Correct</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-semibold">{total - score} Incorrect</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Progress</span>
              <span>{score}/{total}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  passed ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={handleRetakeQuiz}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Retake Quiz
            </button>
            {passed && (
              <button
                onClick={handleNextLesson}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                Next Lesson
                <BookOpen className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleBackToCourse}
              className="bg-purple-500/20 hover:bg-purple-500/30 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Back to Course
            </button>
            <button
              onClick={handleBackToDashboard}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
