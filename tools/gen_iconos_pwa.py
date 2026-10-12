"""Genera los íconos de la PWA a partir de img/logo.png (116x107, con transparencia).

El logo es rojo sobre transparente, así que va sobre fondo blanco (la misma "caja"
que usa la cabecera de la app); sobre rojo de marca resultaba ilegible.
El ícono maskable baja el logo al 62% porque Android recorta los bordes.
Se corre desde la raíz del repo:  python3 tools/gen_iconos_pwa.py
"""
from PIL import Image, ImageDraw

BLANCO = (255, 255, 255)     # caja clara, como la cabecera de la app
SRC = 'img/logo.png'


def pegar_logo(canvas, ratio):
    """Pega el logo con el ancho = `ratio` del lienzo, manteniendo su proporción y centrado."""
    size = canvas.size[0]
    original = Image.open(SRC).convert('RGBA')
    ancho = int(size * ratio)
    alto = int(ancho * original.size[1] / original.size[0])
    box = original.resize((ancho, alto), Image.LANCZOS)
    canvas.paste(box, ((size - ancho) // 2, (size - alto) // 2), box)
    return canvas


def sobre_blanco(size, ratio):
    canvas = pegar_logo(Image.new('RGBA', (size, size), (0, 0, 0, 0)), ratio)
    fondo = Image.new('RGBA', (size, size), BLANCO + (255,))
    return Image.alpha_composite(fondo, canvas)


def apple_touch(size, ratio):
    """iOS enmascara solo: se entrega recortado en círculo, fondo blanco opaco."""
    arte = pegar_logo(Image.new('RGBA', (size, size), (0, 0, 0, 0)), ratio)
    circulo = Image.new('L', (size, size), 0)
    ImageDraw.Draw(circulo).ellipse((0, 0, size - 1, size - 1), fill=255)
    fondo = Image.new('RGBA', (size, size), BLANCO + (255,))
    return Image.composite(arte, fondo, circulo)


PARS = [
    ('img/icon-192.png', sobre_blanco(192, 0.84)),
    ('img/icon-512.png', sobre_blanco(512, 0.84)),
    ('img/icon-maskable-512.png', sobre_blanco(512, 0.60)),
    ('img/apple-touch-icon.png', apple_touch(180, 0.74)),
]

for ruta, img in PARS:
    img.save(ruta, 'PNG')
    print(ruta, img.size)
