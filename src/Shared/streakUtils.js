// Helper function to add notification
const addNotification = (userId, notification) => {
  console.log('Notification Debug - userId:', userId);
  console.log('Notification Debug - notification:', notification);
  
  const storageKey = `notifications_${userId}`;
  const savedNotifications = JSON.parse(localStorage.getItem(storageKey) || '[]');
  savedNotifications.unshift(notification);
  localStorage.setItem(storageKey, JSON.stringify(savedNotifications));
  
  // Sync notification to backend
  console.log('Notification Debug - Sending to backend:', `http://localhost:5000/api/user/notification/${userId}`);
  
  // Validate userId is a valid number before sending
  const numericUserId = parseInt(userId);
  if (isNaN(numericUserId)) {
    console.error('Notification Debug - Invalid userId:', userId);
    return;
  }
  
  fetch(`http://localhost:5000/api/user/notification/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notification })
  })
  .then(response => {
    console.log('Notification Debug - Backend response status:', response.status);
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Notification Debug - Backend response data:', data);
  })
  .catch(err => console.error('Error syncing notification to backend:', err));
};

// Shared utility for managing login streaks
export const updateLoginStreak = (userId) => {
  const streakKey = `streak_${userId}`;
  const lastLoginKey = `lastLogin_${userId}`;

  const today = new Date();
  // Use local date format to avoid timezone issues
  const todayStr = today.toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone

  const lastLoginStr = localStorage.getItem(lastLoginKey);

  console.log('Streak Debug - userId:', userId);
  console.log('Streak Debug - todayStr:', todayStr);
  console.log('Streak Debug - lastLoginStr:', lastLoginStr);

  let streak = 0;
  const savedStreak = localStorage.getItem(streakKey);
  if (savedStreak && !isNaN(savedStreak)) {
    streak = Math.max(0, parseInt(savedStreak));
  }
  console.log('Streak Debug - savedStreak:', savedStreak, 'current streak:', streak);

  if (!lastLoginStr) {
    streak = 1;
    localStorage.setItem(lastLoginKey, todayStr);
    localStorage.setItem(streakKey, streak.toString());
    console.log('Streak Debug - First time login, set streak to 1');
    
    // Sync streak to backend
    fetch(`http://localhost:5000/api/user/streak/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        streak: streak,
        lastLogin: todayStr
      })
    }).catch(err => console.error('Error syncing streak to backend:', err));
    
    // Add notification for first streak
    addNotification(userId, {
      id: Date.now(),
      type: 'streak',
      title: '🔥 Streak Started!',
      message: 'You started your first day streak! Keep coming back daily to maintain it.',
      time: 'Just now',
      isRead: false,
      iconType: 'streak'
    });
  } else {
    if (lastLoginStr === todayStr) {
      console.log('Streak Debug - Already logged in today, returning streak:', streak);
      return streak;
    }

    const lastLoginDate = new Date(lastLoginStr);
    // Calculate difference in days using local time
    const diffTime = today - lastLoginDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    console.log('Streak Debug - diffDays:', diffDays);

    if (diffDays === 1) {
      streak += 1;
      localStorage.setItem(lastLoginKey, todayStr);
      localStorage.setItem(streakKey, streak.toString());
      console.log('Streak Debug - Consecutive day, incremented streak to:', streak);
      
      // Sync streak to backend
      fetch(`http://localhost:5000/api/user/streak/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streak: streak,
          lastLogin: todayStr
        })
      }).catch(err => console.error('Error syncing streak to backend:', err));
      
      // Add notification for streak increase
      addNotification(userId, {
        id: Date.now(),
        type: 'streak',
        title: `🔥 ${streak} Day Streak!`,
        message: streak === 3 
          ? 'Amazing! You\'ve earned the Fire Starter achievement!'
          : streak === 7
          ? 'Incredible! A full week streak!'
          : streak === 30
          ? 'Legendary! 30 days of learning!'
          : `Great job! You're on a ${streak}-day streak. Keep it up!`,
        time: 'Just now',
        isRead: false,
        iconType: 'streak'
      });
    } else if (diffDays > 1) {
      streak = 1;
      localStorage.setItem(lastLoginKey, todayStr);
      localStorage.setItem(streakKey, streak.toString());
      console.log('Streak Debug - Missed day, reset streak to 1');
      
      // Sync streak to backend
      fetch(`http://localhost:5000/api/user/streak/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streak: streak,
          lastLogin: todayStr
        })
      }).catch(err => console.error('Error syncing streak to backend:', err));
      
      // Add notification for streak reset
      addNotification(userId, {
        id: Date.now(),
        type: 'streak',
        title: '🔥 Streak Reset',
        message: 'You missed a day, so your streak has been reset. Start fresh today!',
        time: 'Just now',
        isRead: false,
        iconType: 'streak'
      });
    } else if (diffDays < 0) {
      streak = 1;
      localStorage.setItem(lastLoginKey, todayStr);
      localStorage.setItem(streakKey, streak.toString());
      console.log('Streak Debug - Future date, reset streak to 1');
      
      // Sync streak to backend
      fetch(`http://localhost:5000/api/user/streak/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streak: streak,
          lastLogin: todayStr
        })
      }).catch(err => console.error('Error syncing streak to backend:', err));
      
      // Add notification for streak reset (timezone issue)
      addNotification(userId, {
        id: Date.now(),
        type: 'streak',
        title: '🔥 Streak Reset',
        message: 'Your streak has been reset due to a timezone change. Keep learning!',
        time: 'Just now',
        isRead: false,
        iconType: 'streak'
      });
    } else {
      console.log('Streak Debug - Same day (diffDays 0), returning streak:', streak);
      return streak;
    }
  }

  console.log('Streak Debug - Final streak:', streak);
  return Math.max(0, streak);
};

// Check if user has taken a lesson today and send reminder if not
export const checkDailyLessonReminder = (userId) => {
  const today = new Date();
  // Use local date format to avoid timezone issues
  const todayStr = today.toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
  
  const reminderKey = `dailyReminder_${userId}`;
  const lastReminderDate = localStorage.getItem(reminderKey);
  
  // Only send reminder once per day
  if (lastReminderDate === todayStr) {
    return;
  }
  
  // Check if user has completed a lesson today
  let hasLessonToday = false;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(`${userId}_`) && key.includes("_lesson_") && key.includes("_completed")) {
      const data = JSON.parse(localStorage.getItem(key));
      if (Array.isArray(data) && data.length > 0) {
        // Check if completed today
        const lessonKey = `${userId}_lesson_completed_date`;
        const completedDate = localStorage.getItem(lessonKey);
        if (completedDate === todayStr) {
          hasLessonToday = true;
          break;
        }
      }
    }
  }
  
  // If no lesson completed today, send reminder
  if (!hasLessonToday) {
    const storageKey = `notifications_${userId}`;
    const savedNotifications = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    // Check if reminder already exists for today
    const existingReminder = savedNotifications.find(n => 
      n.type === 'system' && 
      n.title === '📚 Daily Lesson Reminder' &&
      n.time === 'Just now'
    );
    
    if (!existingReminder) {
      const reminderNotification = {
        id: Date.now(),
        type: 'system',
        title: '📚 Daily Lesson Reminder',
        message: 'Don\'t break your learning streak! Complete a lesson today to keep your progress going.',
        time: 'Just now',
        isRead: false,
        iconType: 'system'
      };
      savedNotifications.unshift(reminderNotification);
      localStorage.setItem(storageKey, JSON.stringify(savedNotifications));
      localStorage.setItem(reminderKey, todayStr);

      // Sync notification to backend
      const numericUserId = parseInt(userId);
      if (!isNaN(numericUserId)) {
        fetch(`http://localhost:5000/api/user/notification/${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notification: reminderNotification })
        })
        .then(response => {
          if (!response.ok) throw new Error(`Backend returned ${response.status}`);
          return response.json();
        })
        .catch(err => console.error('Error syncing notification to backend:', err));
      }
    }
  }
};

export const getCurrentStreak = (userId) => {
  const streakKey = `streak_${userId}`;
  const savedStreak = localStorage.getItem(streakKey);
  return savedStreak && !isNaN(savedStreak) ? Math.max(0, parseInt(savedStreak)) : 0;
};

// Force reset streak to 1 (for new accounts or account recreation)
export const resetStreak = (userId) => {
  const streakKey = `streak_${userId}`;
  const lastLoginKey = `lastLogin_${userId}`;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  localStorage.setItem(lastLoginKey, todayStr);
  localStorage.setItem(streakKey, "1");

  // Sync streak to backend
  fetch(`http://localhost:5000/api/user/streak/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      streak: 1,
      lastLogin: todayStr
    })
  }).catch(err => console.error('Error syncing streak to backend:', err));

  console.log('Streak Debug - Force reset streak to 1 for userId:', userId);
  return 1;
};
