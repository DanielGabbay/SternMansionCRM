# מערכת שמירת PDF חתום בשרת

המערכת החדשה שומרת PDF חתום בשרת Vercel במקום ליצור אותו בכל פעם.

## יתרונות המערכת החדשה:

✅ **ביצועים משופרים** - הורדה מיידית ללא יצירת PDF מחדש  
✅ **יציבות** - PDF נשמר פעם אחת ונשאר זמין  
✅ **חסכון במשאבים** - לא צריך ליצור PDF בכל הורדה  
✅ **עקביות** - אותו PDF חתום בדיוק בכל פעם  

---

## איך זה עובד?

### 1. תהליך החתימה (SignaturePage):
```
חתימה → יצירת PDF → שמירה בשרת → שמירת URL בהזמנה → שליחת מייל
```

### 2. הורדת PDF (DashboardPage):
```
לחיצה על "הורד PDF" → הורדה ישירה מהשרת → קובץ מגיע למשתמש
```

---

## מבנה הקבצים:

### Vercel Functions:
- `api/save-pdf.ts` - שמירת PDF בשרת
- `api/download-pdf.ts` - הורדת PDF מהשרת

### שינויים בקוד:
- `types.ts` - הוספת שדה `pdfUrl`
- `SignaturePage.tsx` - שמירת PDF לאחר חתימה
- `DashboardPage.tsx` - הורדה מהשרת
- `useSupabaseData.ts` - תמיכה בשדה החדש

---

## מיקום קבצי PDF:

### Development:
```
/tmp/signed-pdfs/
```

### Production (Vercel):
```
/tmp/signed-pdfs/
```

⚠️ **הערה חשובה**: קבצים ב-`/tmp` ב-Vercel נמחקים כאשר הפונקציה לא פעילה. לשימוש רחב יותר מומלץ לעבור לשירות אחסון חיצוני.

---

## URLs למערכת:

### שמירת PDF:
```
POST /api/save-pdf
{
  "bookingId": "123",
  "customerName": "ישראל ישראלי", 
  "pdfData": "data:application/pdf;base64,..."
}
```

### הורדת PDF:
```
GET /api/download-pdf?bookingId=123&customerName=ישראל%20ישראלי
```

---

## נתונים בהזמנה:

### לפני שמירת PDF:
```javascript
{
  id: "123",
  signature: "data:image/png;base64,...",
  pdfUrl: undefined
}
```

### אחרי שמירת PDF:
```javascript
{
  id: "123",
  signature: "data:image/png;base64,...",
  pdfUrl: "/api/download-pdf?bookingId=123&customerName=..."
}
```

---

## Fallback למקרי שגיאה:

### אם שמירת PDF נכשלת:
- התהליך ממשיך רגיל
- שליחת מייל עם PDF עדיין עובדת
- הורדה במנהל תיצור PDF חדש

### אם הורדת PDF נכשלת:
- המערכת תיצור PDF חדש על הזדמנות
- משתמש יקבל הודעה מתאימה

---

## שדרוגים עתידיים:

### אחסון קבוע:
- AWS S3
- Google Cloud Storage  
- Vercel Blob Storage

### אבטחה מתקדמת:
- הצפנת PDF
- הרשאות גישה
- פקיעת לינקים

### ניהול קבצים:
- מחיקה אוטומטית של קבצים ישנים
- דחיסת PDF
- ניהול גרסאות

---

## פתרון בעיות:

### ❌ "PDF file not found"
- הקובץ נמחק מה-`/tmp`
- תלחץ "הורד PDF" שוב ליצירת קובץ חדש

### ❌ "Failed to save PDF"
- בדוק שהשרת פועל
- בדוק שיש מקום ב-`/tmp`
- נסה שוב

### ❌ "Invalid parameters"
- שם הלקוח או מזהה ההזמנה מכילים תווים לא תקינים
- המערכת תנקה אוטומטית

---

## לוגים לפיתוח:

```bash
# הפעלה מקומית
npm run dev

# בדיקת לוגים ב-Vercel
vercel logs [deployment-url]
```

הלוגים יראו:
- "PDF saved successfully: filename (size bytes)"
- "PDF downloaded: filename (size bytes)"
- "File not found: filename"