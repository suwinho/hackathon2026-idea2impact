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

class SurveyPayload(BaseModel):
    user_id: int
    cat_id: int
    odpowiedzi: str

# --- ENDPOINTY ---

@app.post("/api_py/data")
async def process_and_forward(payload: SurveyPayload):
    """
    POST: Pobiera odpowiedzi tak/nie uzytkownika i wysyła POST na /api/user/fit/{user_id}
    """
    print(f"Otrzymano dane od user_id: {payload.user_id} dla cat_id: {payload.cat_id}")
    print(f"Odpowiedzi (tekst): {payload.odpowiedzi}")
    
    # Używamy tekstu odpowiedzi bezpośrednio jako preferencji użytkownika
    tekst_usera = payload.odpowiedzi if payload.odpowiedzi.strip() else "spokojny nienachalny"
    
    # Kodujemy preferencje użytkownika do wektora
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
    url_spring_boot = "http://backend:8080/api/user/fit"
    
    async with httpx.AsyncClient() as client:
        try:
            match_percent = int(wyniki_finalne[0]["match"]) if wyniki_finalne else 0
            spring_payload = {
                "userId": payload.user_id,
                "catId": payload.cat_id,
                "matchPercentage": match_percent
            }
            # Wysyłamy pojedynczy wynik jako JSON dopasowany do klasy UserFit w Springu
            response = await client.post(url_spring_boot, json=spring_payload)
            
            # The requested return format:
            return {
                "cat_id": payload.cat_id,
                "user_id": payload.user_id,
                "match_percentage": match_percent
            }
        except Exception as e:
            return {"status": "error", "message": str(e), "match_percentage": 0}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)