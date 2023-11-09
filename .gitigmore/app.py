import configparser
from telethon.sync import TelegramClient, events
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime

config = configparser.ConfigParser()
config.read('config.ini')

# Charger les valeurs à partir de config.ini
API_ID = config.get('default', 'api_id')
API_HASH = config.get('default', 'api_hash')
BOT_TOKEN = config.get('default', 'bot_token')
MONGODB_URI = config.get('default', 'mongodb_uri')

# Initialiser le client Telegram
client = TelegramClient('my_bot', API_ID, API_HASH).start(bot_token=BOT_TOKEN)

# Initialiser la connexion MongoDB
mongo_client = MongoClient(MONGODB_URI)
db = mongo_client.get_database("novo")  # Utilisez votre nom de base de données
collection = db.get_collection('novohub')  # Utilisez le nom de votre collection

# Commande pour insérer un produit
@client.on(events.NewMessage(pattern="(?i)/insert"))
async def insert(event):
    sender = await event.get_sender()
    SENDER = sender.id

    # Votre code d'insertion ici

# Commande pour sélectionner des produits
@client.on(events.NewMessage(pattern="(?i)/select"))
async def select(event):
    sender = await event.get_sender()
    SENDER = sender.id

    # Votre code de sélection ici

# Mettre à jour d'autres commandes (update, delete, etc.) de la même manière.

# Fonction pour créer un message de sélection
def create_message_select_query(results):
    text = ""
    for res in results:
        id = res["_id"]
        name = res["product_name"]
        quantity = res["quantity"]
        status = res["status"]
        creation_date = res["LAST_UPDATE"]
        text += f"<b>{id}</b> | <b>{name}</b> | <b>{quantity}</b> | <b>{status}</b> | <b>{creation_date}</b>\n"

    message = f"<b>Produits reçus 📖</b>\n\n{text}"
    return message

if __name__ == '__main__':
    client.run_until_disconnected()
