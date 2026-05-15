import os

BOT_TOKEN = os.environ.get('BOT_TOKEN', '')
ADMIN_IDS = [int(x) for x in os.environ.get('ADMIN_IDS', '').split(',') if x.strip().isdigit()]
DB_PATH = os.environ.get('DB_PATH', 'vpn_bot.db')
FREE_TRIAL_DAYS = int(os.environ.get('FREE_TRIAL_DAYS', '7'))
BOT_NAME = os.environ.get('BOT_NAME', 'TurboVPN Bot')
SUPPORT_USERNAME = os.environ.get('SUPPORT_USERNAME', '@vpn_support')
