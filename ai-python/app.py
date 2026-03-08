from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
import httpx
import uvicorn

app = FastAPI(title="Cat Matcher AI - New Data")

# 1. Inicjalizacja modelu
model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-mpnet-base-v2')

# 2. Nowa baza kotów (zgodna z Twoim DataInitializer)
BAZA_KOTOW = [
    {
        "imie": "Biszkopt",
        "opis_full": "łagodny, towarzyski, lubi pieszczoty. Biszkopt to kocur, który uwielbia kontakt z człowiekiem. Szuka domu niewychodzącego."
    },
    {
        "imie": "Białek",
        "opis_full": "delikatny, nienachalny, ostrożny. Idealny towarzysz dla spokojnych dorosłych kotów. Z radością nawiązuje kocie przyjaźnie."
    },
    {
        "imie": "Czesio",
        "opis_full": "Towarzyski, Skory do głaskania, Skory do zabawy. Czesio to ewidentnie kot skory do zabawy z innymi kotami, Uwielbia głaskanie."
    },
    {
        "imie": "Kiki",
        "opis_full": "energiczna, ciekawa świata, ruchliwa. Około roczna kotka, pełna energii. Świetnie odnajduje się w kocim towarzystwie i chętnie zaprasza do zabaw."
    }
]

# Ponieważ teraz mamy jeden wspólny opis, upraszczamy wagi
# Model porównuje preferencje użytkownika z całym opisem kota

class UserPreferences(BaseModel):
    charakter: str
    przestrzen: str
    pielegnacja: str

# --- ENDPOINTY ---

@app.get("/api_py/data")
async def process_and_forward(userid: int):
    """
    GET: Pobiera dane (symulacja), liczy match i wysyła POST na /api/user/fit/{userid}
    """
    # 1. Tu symulujemy pobranie preferencji (np. z Twojego frontendu/bazy)
    # W realnym scenariuszu możesz tu dodać: response = await httpx.get(url_do_preferencji)
    pobrane_preferencje = {
        "charakter": "szukam energicznego kota do zabawy",
        "przestrzen": "dom z innymi kotami",
        "pielegnacja": "standardowa"
    }
    
    # Łączymy preferencje w jeden tekst do analizy przez AI
    tekst_usera = f"{pobrane_preferencje['charakter']} {pobrane_preferencje['przestrzen']}"
    wektor_usera = model.encode(tekst_usera)

    # 2. Obliczanie dopasowania
    wyniki_finalne = []
    for kot in BAZA_KOTOW:
        wektor_kota = model.encode(kot["opis_full"])
        similarity = util.cos_sim(wektor_usera, wektor_kota)[0][0].item()
        
        wyniki_finalne.append({
            "imie": kot["imie"],
            "match": round(similarity * 100, 2)
        })

    # Sortowanie od najlepszego
    wyniki_finalne.sort(key=lambda x: x["match"], reverse=True)

    # 3. Wysyłanie wyników POST-em do Spring Boota
    # Podmień localhost:8080 na faktyczny adres Twojej apki w Javie
    url_spring_boot = f"http://localhost:8080/api/user/fit/{userid}"
    
    async with httpx.AsyncClient() as client:
        try:
            # Wysyłamy listę wyników jako JSON
            response = await client.post(url_spring_boot, json=wyniki_finalne)
            return {
                "status": "sent_to_spring",
                "userid": userid,
                "spring_response_code": response.status_code,
                "top_match": wyniki_finalne[0]
            }
        except Exception as e:
            return {"status": "error", "message": str(e), "data": wyniki_finalne}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)