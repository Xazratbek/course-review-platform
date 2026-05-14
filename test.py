oylar = {
    "01":"Yanvar","02":"Fevral"
}
def nimadur(sana: str):
    sana = sana.split(".")
    return f"{sana[0]}-{oylar[sana[1]]} {sana[2]}-yil"

print(nimadur("12.02.2026"))