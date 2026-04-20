import telebot
import requests
import schedule
import time
from datetime import datetime

BOT_TOKEN = "8633532786:AAEb58mfr1LbvJWR3VqkscAEwHuKe-vINX8"
CHAT_ID = "8709378912"
GEMINI_KEY = "AIzaSyCRbe2kH3Hm8J8xNBVMF6YnLNthDndN3lI"

bot = telebot.TeleBot(BOT_TOKEN)

def get_jobs():
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_KEY}"
    today = datetime.now().strftime("%d %B %Y")
    payload = {
        "contents": [{
            "parts": [{
                "text": f"Generate 5 realistic Saudi Arabia job listings for today {today}. Format each job exactly like this:\n\nCompany: [name]\nPosition: [title]\nCity: [saudi city]\nSalary: SAR [amount]/month\nRequirements: [2-3 requirements]\n\nSeparate each job with ---"
            }]
        }]
    }
    response = requests.post(url, json=payload)
    data = response.json()
    candidates = data.get('candidates', [])
    if candidates:
        return candidates[0]['content']['parts'][0]['text']
    else:
        return "Jobs fetch karne mein masla hua."

def send_daily_jobs():
    try:
        today = datetime.now().strftime("%d %B %Y")
        jobs_text = get_jobs()
        message = f"SAUDI JOBS - {today}\n\n"
        message += "================\n\n"
        message += jobs_text
        message += "\n\n================"
        message += "\nAaj ki fresh jobs!"
        bot.send_message(CHAT_ID, message)
        print(f"Jobs sent at {datetime.now()}")
    except Exception as e:
        print(f"Error: {e}")

@bot.message_handler(commands=['start'])
def start(message):
    bot.send_message(message.chat.id,
        "Saudi Jobs Bot Active!\n\n"
        "Har subah 8 baje aapko fresh jobs milenge!\n\n"
        "/jobs - Abhi jobs dekhen\n"
        "/start - Bot start karen")

@bot.message_handler(commands=['jobs'])
def jobs_now(message):
    bot.send_message(message.chat.id, "Jobs dhoondh raha hoon...")
    send_daily_jobs()

def run_scheduler():
    schedule.every().day.at("08:00").do(send_daily_jobs)
    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    import threading
    print("Bot starting...")
    scheduler_thread = threading.Thread(target=run_scheduler)
    scheduler_thread.daemon = True
    scheduler_thread.start()
    print("Bot is running!")
    bot.polling(none_stop=True)
