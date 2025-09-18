# הגדרת שליחת מיילים בצד השרת עם Vercel Functions

המערכת עברה לשליחת מיילים בצד השרת במקום EmailJS לביטחון ויציבות טובים יותר.

## יתרונות השליחה בצד השרת:

✅ **ביטחון** - סיסמאות לא נחשפות בפרונט  
✅ **יציבות** - אין הגבלות גודל קובץ  
✅ **מהירות** - שליחה ישירה עם SMTP  
✅ **מקצועיות** - עיצוב מייל מתקדם  

---

## שלב 1: הגדרת חשבון מייל עסקי

### Gmail (מומלץ):
1. התחבר לחשבון Gmail העסקי שלך
2. עבור ל: [Google Account Security](https://myaccount.google.com/security)
3. הפעל **2-Step Verification**
4. לחץ על **App passwords**
5. בחר **Mail** ו-**Other**
6. תן שם: "אחוזת שטרן CRM"
7. העתק את הסיסמה בת 16 התווים

### אפשרויות אחרות:
- **Outlook/Hotmail**: smtp-mail.outlook.com:587
- **Yahoo**: smtp.mail.yahoo.com:587
- **שרת מייל עסקי**: השתמש בהגדרות SMTP של הספק שלך

---

## שלב 2: הגדרת משתני סביבה ב-Vercel

### א. דרך Vercel Dashboard:
1. התחבר ל-[Vercel Dashboard](https://vercel.com/dashboard)
2. בחר את הפרויקט שלך
3. עבור ל-**Settings** → **Environment Variables**
4. הוסף את המשתנים הבאים:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-business@gmail.com
EMAIL_PASS=your-16-character-app-password
```

### ב. דרך Vercel CLI:
```bash
vercel env add EMAIL_HOST smtp.gmail.com
vercel env add EMAIL_PORT 587
vercel env add EMAIL_USER your-business@gmail.com
vercel env add EMAIL_PASS your-16-character-app-password
```

---

## שלב 3: פריסה מחדש

לאחר הוספת משתני הסביבה:

```bash
vercel --prod
```

או השתמש ב-**Redeploy** בוועראל Dashboard.

---

## בדיקת התקנה

1. פתח את האפליקציה
2. צור הזמנה חדשה
3. חתום על ההזמנה
4. בדוק שהמייל נשלח בהצלחה

---

## פתרון בעיות נפוצות

### ❌ "Email configuration missing"
- בדוק שכל 4 המשתנים מוגדרים ב-Vercel
- ודא שאין רווחים מיותרים

### ❌ "Authentication failed"
- ודא שהפעלת 2-Step Verification ב-Gmail
- השתמש ב-App Password ולא בסיסמה רגילה
- בדוק שכתובת המייל נכונה

### ❌ "Connection timeout"
- ודא ש-EMAIL_PORT הוא 587 (לא 25 או 465)
- בדוק שהשרת שלך לא חוסם יציאה 587

### ❌ המייל לא מגיע
- בדוק תיקיית SPAM של המקבל
- ודא שכתובת המקבל נכונה
- המתן עד 5 דקות (עיכוב אפשרי)

---

## הגדרות מתקדמות

### עיצוב מייל מותאם אישית:
ערוך את הקובץ `api/send-email.ts` לשינוי תוכן המייל.

### הוספת עותק נוסף:
במשתנה BCC בקובץ נוסף מייל נוסף לקבלת עותקים.

### לוגים ומעקב:
בדוק לוגים ב-Vercel Dashboard → Functions → Logs

---

## מעבר מ-EmailJS

אם השתמשת ב-EmailJS בעבר:

1. המערכת תזהה אוטומטית שיש שירות שרת חדש
2. EmailJS כבר לא נדרש
3. אפשר להסיר את משתני EMAILJS מהסביבה
4. המערכת תשתמש בשירות החדש אוטומטית

---

## תמיכה

יש בעיה? צור קשר או פתח issue ב-GitHub עם הפרטים הבאים:
- סוג שגיאה
- צילום מסך מהלוגים
- הגדרות המייל (בלי סיסמאות!)