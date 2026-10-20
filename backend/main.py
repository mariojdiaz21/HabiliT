from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from bson import ObjectId
import os
import re
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Configurar CORS para permitir que tu frontend en React se comunique con Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conexión a MongoDB Atlas
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise RuntimeError("No se encontró la variable MONGO_URI en el archivo .env")

client = AsyncIOMotorClient(MONGO_URI)
db = client.habilit_db  # Base de datos

# ---- Modelos Pydantic ----
class ReporteInput(BaseModel):
    alumno: str
    edad: int
    fecha: str
    correoEncargado: str
    telefonoEncargado: str
    carnet: str
    tutor: str
    cursos: List[str]
    observaciones: str
    comentarios: str
    recomendaciones: str
    criterios: Dict[str, int]

class ReporteCreate(ReporteInput):
    creadoPor: str

class Reporte(ReporteInput):
    id: str
    creadoPor: str
    creadoEn: str

class LoginRequest(BaseModel):
    usuario: str
    password: str

# ---- Rutas de la API ----

@app.get("/")
def inicio():
    return {"mensaje": "El backend de HabiliT con FastAPI y MongoDB Atlas está activo y funcionando correctamente."}

@app.post("/api/login")
async def login(datos: LoginRequest):
    usuario_ingresado = datos.usuario.strip()
    regex_usuario = re.compile(f"^{re.escape(usuario_ingresado)}$", re.IGNORECASE)
    usuario_db = await db.usuarios.find_one({"usuario": regex_usuario})
    
    if not usuario_db:
        print(f"[LOGIN] Usuario no encontrado en BD para: '{usuario_ingresado}'")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )
    
    pass_en_db = str(usuario_db.get("password", "")).strip()
    pass_recibida = str(datos.password).strip()
    
    print(f"🔍 [LOGIN] Usuario encontrado: {usuario_db.get('nombreReal')}")
    print(f"    -> Pass en BD (largo {len(pass_en_db)}): {repr(pass_en_db)}")
    print(f"    -> Pass Recibida (largo {len(pass_recibida)}): {repr(pass_recibida)}")
    
    if pass_en_db != pass_recibida:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Contraseña incorrecta"
        )
        
    return {"ok": True, "usuario": usuario_db.get("nombreReal")}

@app.get("/api/reportes", response_model=List[Reporte])
async def listar_reportes():
    reportes = []
    cursor = db.reportes.find({})
    async for documento in cursor:
        documento["id"] = str(documento["_id"])
        del documento["_id"]
        reportes.append(documento)
    return reportes

@app.post("/api/reportes", response_model=Reporte)
async def crear_reporte(datos: ReporteCreate):
    from datetime import datetime
    nuevo_reporte = datos.dict()
    nuevo_reporte["creadoEn"] = datetime.utcnow().isoformat() + "Z"
    
    resultado = await db.reportes.insert_one(nuevo_reporte)
    nuevo_reporte["id"] = str(resultado.inserted_id)
    
    if "_id" in nuevo_reporte:
        del nuevo_reporte["_id"]
    
    return nuevo_reporte

@app.put("/api/reportes/{reporte_id}", response_model=Reporte)
async def actualizar_reporte(reporte_id: str, datos: ReporteInput):
    if not ObjectId.is_valid(reporte_id):
        raise HTTPException(status_code=400, detail="ID de reporte inválido")
        
    actualizacion = datos.dict()
    resultado = await db.reportes.find_one_and_update(
        {"_id": ObjectId(reporte_id)},
        {"$set": actualizacion},
        return_document=True
    )
    
    if not resultado:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
        
    resultado["id"] = str(resultado["_id"])
    del resultado["_id"]
    return resultado

@app.delete("/api/reportes/{reporte_id}")
async def eliminar_reporte(reporte_id: str):
    if not ObjectId.is_valid(reporte_id):
        raise HTTPException(status_code=400, detail="ID de reporte inválido")
        
    resultado = await db.reportes.delete_one({"_id": ObjectId(reporte_id)})
    if resultado.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
        
    return {"mensaje": "Reporte eliminado con éxito"}