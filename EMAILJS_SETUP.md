# מדריך הגדרת EmailJS לשליחת מיילים אוטומטיים

EmailJS מאפשר לשלוח מיילים אוטומטיים ישירות מהאפליקציה עם PDF מצורף של ההסכם החתום.

## שלב 1: יצירת חשבון EmailJS

1. **כנס ל-[EmailJS](https://emailjs.com)** וצור חשבון חדש (חינמי)
2. **אמת את המייל** שלך לאחר ההרשמה

## שלב 2: הגדרת Email Service

1. **בדשבורד של EmailJS**, לחץ על "Email Services"
2. **לחץ "Add Service"** ובחר את ספק המייל שלך:
   - Gmail (מומלץ לקלות השימוש)
   - Outlook/Hotmail
   - Yahoo
   - או כל ספק SMTP אחר
3. **עקוב אחר ההוראות** להתחברות לחשבון המייל שלך
4. **העתק את ה-Service ID** (משהו כמו `service_abc123`)

## שלב 3: יצירת Email Template

1. **בדשבורד**, לחץ על "Email Templates"
2. **לחץ "Create New Template"**
3. **הגדר את התבנית**:

### נושא המייל:
```
הסכם אירוח חתום - אחוזת שטרן - הזמנה {{booking_id}}
```

### תוכן המייל (HTML):
```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>הסכם אירוח חתום - אחוזת שטרן</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f5f5f5; direction: rtl;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 20px 10px;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px 20px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                                🏡 אחוזת שטרן
                            </h1>
                            <p style="margin: 8px 0 0; color: #e1e7ff; font-size: 16px; font-weight: 500;">
                                הסכם אירוח חתום בהצלחה
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 30px 25px;">
                            
                            <!-- Greeting -->
                            <div style="margin-bottom: 25px;">
                                <h2 style="margin: 0 0 15px; color: #1f2937; font-size: 22px; font-weight: 600;">
                                    שלום {{customer_name}} 👋
                                </h2>
                                <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                                    תודה שחתמתם על הסכם האירוח באחוזת שטרן! אנחנו שמחים לארח אתכם.
                                </p>
                            </div>
                            
                            <!-- Booking Details Card -->
                            <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 10px; padding: 25px; margin: 25px 0;">
                                <h3 style="margin: 0 0 20px; color: #2563eb; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                                    📋 פרטי ההזמנה
                                </h3>
                                
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                                            <strong style="color: #374151; font-size: 14px;">מספר הזמנה:</strong>
                                        </td>
                                        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: left;">
                                            <span style="background: #2563eb; color: white; padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 14px;">{{booking_id}}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                                            <strong style="color: #374151; font-size: 14px;">יחידת אירוח:</strong>
                                        </td>
                                        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: left;">
                                            <span style="color: #1f2937; font-weight: 600; font-size: 14px;">{{unit_name}}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                                            <strong style="color: #374151; font-size: 14px;">תאריך כניסה:</strong>
                                        </td>
                                        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: left;">
                                            <span style="color: #059669; font-weight: 600; font-size: 14px;">📅 {{checkin_date}}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                                            <strong style="color: #374151; font-size: 14px;">תאריך יציאה:</strong>
                                        </td>
                                        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: left;">
                                            <span style="color: #dc2626; font-weight: 600; font-size: 14px;">📅 {{checkout_date}}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                                            <strong style="color: #374151; font-size: 14px;">מספר אורחים:</strong>
                                        </td>
                                        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: left;">
                                            <span style="color: #1f2937; font-weight: 600; font-size: 14px;">👥 {{adults}} מבוגרים, {{children}} ילדים</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0 0;">
                                            <strong style="color: #374151; font-size: 16px;">סה"כ תשלום:</strong>
                                        </td>
                                        <td style="padding: 12px 0 0; text-align: left;">
                                            <span style="background: #10b981; color: white; padding: 6px 12px; border-radius: 8px; font-weight: bold; font-size: 16px;">💰 {{total_price}} ₪</span>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Attachment Notice -->
                            <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 25px 0; text-align: center;">
                                <p style="margin: 0; color: #92400e; font-weight: 600; font-size: 15px;">
                                    📎 במצורף תמצאו את ההסכם החתום
                                </p>
                            </div>
                            
                            <!-- Closing Message -->
                            <div style="text-align: center; margin: 30px 0;">
                                <p style="margin: 0 0 10px; color: #1f2937; font-size: 18px; font-weight: 600;">
                                    אנחנו מצפים לראותכם בקרוב! 🎉
                                </p>
                                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                                    נשמח לעזור בכל שאלה או בקשה נוספת
                                </p>
                            </div>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f8fafc; padding: 25px; border-top: 1px solid #e2e8f0;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td style="text-align: center;">
                                        <h4 style="margin: 0 0 15px; color: #2563eb; font-size: 18px; font-weight: bold;">
                                            בברכה, רחל 💙
                                        </h4>
                                        <p style="margin: 0 0 8px; color: #1f2937; font-weight: 600; font-size: 16px;">
                                            צוות אחוזת שטרן
                                        </p>
                                        <div style="margin: 15px 0;">
                                            <a href="mailto:sternkbz@gmail.com" style="display: inline-block; margin: 0 10px; color: #2563eb; text-decoration: none; font-weight: 600; font-size: 14px;">
                                                📧 sternkbz@gmail.com
                                            </a>
                                            <a href="tel:052-4535574" style="display: inline-block; margin: 0 10px; color: #2563eb; text-decoration: none; font-weight: 600; font-size: 14px;">
                                                📞 052-4535574
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>

    <!-- Mobile Responsive Styles -->
    <style>
        @media only screen and (max-width: 600px) {
            .container {
                width: 95% !important;
                margin: 10px auto !important;
            }
            
            .header h1 {
                font-size: 24px !important;
            }
            
            .content {
                padding: 20px 15px !important;
            }
            
            .booking-details {
                padding: 20px 15px !important;
            }
            
            .footer {
                padding: 20px 15px !important;
            }
            
            .contact-links a {
                display: block !important;
                margin: 5px 0 !important;
            }
        }
        
        @media only screen and (max-width: 480px) {
            .header h1 {
                font-size: 20px !important;
            }
            
            .content h2 {
                font-size: 18px !important;
            }
            
            .booking-details h3 {
                font-size: 16px !important;
            }
        }
    </style>
</body>
</html>
```

### הגדרות נוספות:
- **To Email**: `{{to_email}}`
- **From Name**: אחוזת שטרן
- **Reply To**: `{{reply_to}}`

4. **שמור את התבנית** והעתק את ה-Template ID

## שלב 4: הגדרת משתני הסביבה

### פיתוח מקומי:
1. **צור קובץ `.env.local`**:
```bash
cp .env.example .env.local
```

2. **מלא את הערכים**:
```env
VITE_EMAILJS_SERVICE_ID=service_your_service_id
VITE_EMAILJS_TEMPLATE_ID=template_your_template_id
VITE_EMAILJS_PUBLIC_KEY=user_your_public_key
```

### פרודקשיון ב-Vercel:
1. **כנס להגדרות הפרויקט ב-Vercel**
2. **בחר "Environment Variables"**
3. **הוסף את המשתנים**:
   - `VITE_EMAILJS_SERVICE_ID`
   - `VITE_EMAILJS_TEMPLATE_ID`
   - `VITE_EMAILJS_PUBLIC_KEY`

## שלב 5: קבלת Public Key

1. **בדשבורד EmailJS**, כנס ל-"Account"
2. **העתק את ה-Public Key** (User ID)

## שלב 6: בדיקת התקינות

1. **הפעל את האפליקציה** מקומית או בפרודקשיון
2. **צור הזמנה חדשה** ובקש מלקוח לחתום
3. **לאחר החתימה** - בדוק שהמייל נשלח עם PDF מצורף

## הגבלות Tier החינמי

EmailJS נותן בחינם:
- **200 מיילים לחודש**
- **תמיכה בקבצים מצורפים עד 2MB**
- **תמיכה בכל ספקי המייל הפופולריים**

לשימוש מסחרי יותר, שקול שדרוג לתוכנית בתשלום.

## פתרון בעיות נפוצות

### שגיאה: "EmailJS not configured"
- וודא שכל המשתנים מוגדרים נכון
- בדוק שאין רווחים מיותרים

### המייל לא מגיע
- בדוק spam/junk folder
- וודא שכתובת המייל נכונה
- בדוק שה-Service מחובר נכון

### קובץ PDF לא מצורף
- בדוק שהתבנית מגדירה attachment
- וודא שגודל ה-PDF לא עולה על 2MB
- נסה שוב אחרי כמה דקות

### מייל נשלח אבל לא מגיע
1. בדוק ב-EmailJS Dashboard אם המייל נשלח
2. וודא שה-Service מחובר וכו'
3. בדוק הגדרות spam של ספק המייל

## תבנית מתקדמת (אופציונלי)

אם אתה רוצה תבנית מותאמת יותר, אתה יכול להוסיף HTML:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <header style="background: #2563eb; color: white; padding: 20px; text-align: center;">
        <h1>אחוזת שטרן</h1>
        <p>הסכם אירוח חתום</p>
    </header>
    
    <main style="padding: 20px;">
        <h2>שלום {{customer_name}},</h2>
        
        <p>תודה שחתמתם על הסכם האירוח!</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f8f9fa;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>מספר הזמנה:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">{{booking_id}}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>יחידת אירוח:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">{{unit_name}}</td>
            </tr>
            <tr style="background: #f8f9fa;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>תאריכים:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">{{checkin_date}} - {{checkout_date}}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>סה"כ תשלום:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">{{total_price}} ₪</td>
            </tr>
        </table>
        
        <p><strong>במצורף תמצאו את ההסכם החתום.</strong></p>
        
        <p>אנחנו מצפים לראותכם בקרוב!</p>
    </main>
    
    <footer style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #ddd;">
        <p>אחוזת שטרן</p>
        <p>sternkbz@gmail.com | 052-4535574</p>
    </footer>
</div>
```

## תמיכה

אם נתקלת בבעיות:
1. בדוק את [תיעוד EmailJS](https://emailjs.com/docs)
2. בדוק לוגים בקונסול הדפדפן
3. צור Issue בפרויקט ב-GitHub