# מדריך הגדרת Supabase למערכת ניהול אחוזת שטרן

## שלב 1: יצירת פרויקט Supabase

1. **כנס ל-[Supabase](https://supabase.com)** וצור חשבון חדש
2. **צור פרויקט חדש**:
   - לחץ "New Project"
   - בחר שם לפרויקט (למשל: "stern-mansion-crm")
   - בחר סיסמה חזקה למסד הנתונים
   - בחר אזור (מומלץ: Frankfurt - EU Central)
   - לחץ "Create new project"

## שלב 2: הגדרת מסד הנתונים

1. **כנס ל-SQL Editor**:
   - בתפריט השמאלי לחץ על "SQL Editor"
   
2. **הרץ את הסקריפט SQL**:
   - העתק את התוכן של הקובץ `supabase-schema.sql`
   - הדבק בעורך ה-SQL
   - לחץ "RUN" כדי ליצור את הטבלאות

## שלב 3: קבלת ערכי החיבור

1. **כנס להגדרות ה-API**:
   - בתפריט השמאלי לחץ על "Settings"
   - לחץ על "API"

2. **העתק את הערכים**:
   - `Project URL` - זה ה-`VITE_SUPABASE_URL`
   - `anon public` מתחת ל-"Project API keys" - זה ה-`VITE_SUPABASE_ANON_KEY`

## שלב 4: הגדרת משתני הסביבה

### פיתוח מקומי:

1. **צור קובץ `.env.local`** בשורש הפרויקט:
```bash
cp .env.example .env.local
```

2. **מלא את הערכים**:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### פרודקשיון ב-Vercel:

1. **כנס להגדרות הפרויקט ב-Vercel**
2. **לחץ על "Environment Variables"**
3. **הוסף את שני המשתנים**:
   - Name: `VITE_SUPABASE_URL`, Value: ה-URL של הפרויקט
   - Name: `VITE_SUPABASE_ANON_KEY`, Value: המפתח שלך

## שלב 5: בדיקת החיבור

1. **הרץ את הפרויקט מקומית**:
```bash
npm run dev
```

2. **פתח את הדפדפן** ב-`http://localhost:5173`

3. **בדוק שהאפליקציה נטענת** בלי שגיאות

## שלב 6: העלאה לפרודקשיון

1. **עדכן את Vercel**:
   - הוסף את משתני הסביבה כפי שתואר למעלה
   - העלה את השינויים ל-Git
   - Vercel יבנה את האפליקציה מחדש אוטומטית

2. **עדכן את כתובת האפליקציה**:
   - כנס להגדרות באפליקציה
   - עדכן את הכתובת לכתובת האמיתית שלך ב-Vercel

## פתרון בעיות נפוצות

### שגיאה: "Invalid API key"
- וודא שהעתקת נכון את ה-anon key
- וודא שהמשתנים נקראים בדיוק `VITE_SUPABASE_URL` ו-`VITE_SUPABASE_ANON_KEY`

### שגיאה: "Failed to fetch"
- וודא שה-URL נכון (כולל https://)
- בדוק שהפרויקט ב-Supabase פעיל

### שגיאה: "permission denied"
- וודא שהרצת את הסקריפט SQL
- בדוק שה-RLS policies נוצרו כהלכה

### נתונים לא נשמרים
- בדוק ב-Supabase Dashboard אם הטבלאות נוצרו
- בדוק שאין שגיאות בקונסול של הדפדפן

## אבטחה

⚠️ **חשוב**: האפליקציה כרגע מגדירה גישה פומבית לכל הטבלאות. 

**לסביבת פרודקשיון אמיתית מומלץ**:
- הגדרת authentication
- הגבלת ה-RLS policies
- הוספת שכבות הרשאה נוספות

## תמיכה

אם נתקלת בבעיות:
1. בדוק את קונסול הדפדפן לשגיאות
2. בדוק את לוגים ב-Vercel (עבור פרודקשיון)
3. בדוק את Dashboard של Supabase
4. צור Issue בפרויקט ב-GitHub