"""Synthesizes the timer's completion sounds into assets/sounds/.

Run from the repo root: python3 scripts/generate-sounds.py
Output is 16-bit mono WAV, which works on web and as an iOS notification sound.
"""

import math
import random
import struct
import wave
from pathlib import Path

RATE = 44100
OUT = Path(__file__).resolve().parent.parent / "assets" / "sounds"


def render(duration, voices):
    """voices: (start_s, fn(t) -> sample) pairs, mixed and normalized."""
    n = int(RATE * duration)
    buf = [0.0] * n
    for start, fn in voices:
        s0 = int(start * RATE)
        for i in range(n - s0):
            buf[s0 + i] += fn(i / RATE)
    peak = max(abs(x) for x in buf) or 1
    return [x / peak * 0.8 for x in buf]


def write(name, samples):
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(b"".join(struct.pack("<h", int(x * 32767)) for x in samples))


def attack(t, seconds):
    return min(1.0, t / seconds)


def sine(freq, t):
    return math.sin(2 * math.pi * freq * t)


def bell():
    # A deeper church-style bell struck twice, with rich inharmonic partials.
    def strike(t):
        env = attack(t, 0.003)
        partials = [(1.0, 1.0, 1.1), (2.0, 0.5, 1.8), (2.76, 0.35, 2.6), (5.4, 0.15, 4.5)]
        return env * sum(a * sine(440 * r, t) * math.exp(-t * d) for r, a, d in partials)

    return render(4.0, [(0.0, strike), (1.6, strike)])


def mix(duration, tracks):
    """tracks: (start_s, [samples]) pairs, mixed and normalized."""
    n = int(RATE * duration)
    buf = [0.0] * n
    for start, samples in tracks:
        s0 = int(start * RATE)
        for i, x in enumerate(samples[: n - s0]):
            buf[s0 + i] += x
    peak = max(abs(x) for x in buf) or 1
    return [x / peak * 0.8 for x in buf]


def sweep(f0, f1, dur, amp=1.0):
    """A sine that glides from f0 to f1 with a smooth rise and fall, like a chirp."""
    n = int(dur * RATE)
    out = []
    for i in range(n):
        t = i / RATE
        phase = 2 * math.pi * (f0 * t + (f1 - f0) * t * t / (2 * dur))
        out.append(amp * math.sin(math.pi * t / dur) ** 2 * math.sin(phase))
    return out


def bird():
    # Two songbirds: quick rising chirps and a falling trill, then an answering call.
    rnd = random.Random(7)
    tracks = []
    t = 0.0
    for _ in range(3):  # three quick "tweet"s
        tracks.append((t, sweep(3000, 4800, 0.07)))
        t += 0.11
    t += 0.12
    for i in range(6):  # falling trill
        f = 5200 - i * 300 + rnd.uniform(-80, 80)
        tracks.append((t, sweep(f, f - 700, 0.05, 0.8)))
        t += 0.07
    t += 0.25
    tracks.append((t, sweep(4600, 3900, 0.16, 0.7)))  # answering "tee-yoo"
    tracks.append((t + 0.22, sweep(3300, 2600, 0.2, 0.7)))
    t += 0.7
    for _ in range(2):  # one more pair of chirps
        tracks.append((t, sweep(3200, 5000, 0.06, 0.9)))
        t += 0.1
    return mix(t + 0.3, tracks)


def pluck(freq, dur, rnd, amp=1.0, decay=0.996):
    # Karplus-Strong plucked string; smoothing the initial noise softens the attack.
    period = int(RATE / freq)
    buf = [rnd.uniform(-1, 1) for _ in range(period)]
    for _ in range(2):
        buf = [(buf[i - 1] + buf[i] + buf[(i + 1) % period]) / 3 for i in range(period)]
    out = []
    for i in range(int(dur * RATE)):
        j = i % period
        x = buf[j]
        buf[j] = decay * 0.5 * (x + buf[(j + 1) % period])
        out.append(amp * x)
    return out


def guitar():
    # Light fingerpicked Cmaj7 arpeggio, then a gentle C major strum left to ring.
    rnd = random.Random(11)
    notes = [130.81, 196.0, 329.63, 493.88, 392.0, 329.63]  # C3 G3 E4 B4 G4 E4
    tracks = [(i * 0.18, pluck(f, 2.4, rnd, 0.7)) for i, f in enumerate(notes)]
    strum_at = len(notes) * 0.18 + 0.15
    chord = [130.81, 196.0, 261.63, 329.63, 392.0]  # C3 G3 C4 E4 G4
    tracks += [(strum_at + i * 0.025, pluck(f, 2.6, rnd, 0.8, 0.9965)) for i, f in enumerate(chord)]
    return mix(strum_at + 2.6, tracks)


def beep(freq, dur):
    """A piezo-buzzer tone: a band-limited square wave with 2 ms ramps against clicks."""
    n = int(dur * RATE)
    ramp = 0.002
    out = []
    for i in range(n):
        t = i / RATE
        env = min(1.0, t / ramp, (dur - t) / ramp)
        out.append(env * sum(sine(freq * h, t) / h for h in (1, 3, 5)))
    return out


def watch():
    # Classic digital-watch alarm: four quick beeps, a pause, three times over.
    tracks = []
    t = 0.0
    for _ in range(3):
        for _ in range(4):
            tracks.append((t, beep(4096, 0.06)))
            t += 0.12
        t += 0.5
    return mix(t, tracks)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, fn in [("bell", bell), ("bird", bird), ("guitar", guitar), ("watch", watch)]:
        write(name, fn())
        print(f"wrote {name}.wav")
