"""Synthesizes the timer's completion sounds into assets/sounds/.

Run from the repo root: python3 scripts/generate-sounds.py
Output is 16-bit mono WAV, which works on web and as an iOS notification sound.
"""

import math
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


def bell_note(freq, amp, length, decay=3.2):
    # Fundamental plus a quiet inharmonic partial that fades faster.
    return lambda t: 0.0 if t >= length else amp * attack(t, 0.004) * math.exp(-t * decay) * (
        sine(freq, t) + 0.25 * sine(freq * 2.76, t) * math.exp(-t * 6)
    )


def chime():
    # Three soft strikes: E6, C6, then E6 + G6 together.
    return render(2.2, [
        (0.0, bell_note(1318.5, 0.35, 1.2)),
        (0.28, bell_note(1046.5, 0.35, 1.2)),
        (0.56, bell_note(1318.5, 0.25, 1.6)),
        (0.56, bell_note(1568.0, 0.2, 1.6)),
    ])


def bell():
    # A deeper church-style bell struck twice, with rich inharmonic partials.
    def strike(t):
        env = attack(t, 0.003)
        partials = [(1.0, 1.0, 1.1), (2.0, 0.5, 1.8), (2.76, 0.35, 2.6), (5.4, 0.15, 4.5)]
        return env * sum(a * sine(440 * r, t) * math.exp(-t * d) for r, a, d in partials)

    return render(4.0, [(0.0, strike), (1.6, strike)])


def marimba():
    # Quick woody arpeggio: C5 E5 G5 C6, twice.
    def note(freq):
        return lambda t: attack(t, 0.002) * math.exp(-t * 9) * (
            sine(freq, t) + 0.3 * sine(freq * 4, t) * math.exp(-t * 30)
        )

    freqs = [523.25, 659.25, 783.99, 1046.5]
    voices = [(i * 0.12, note(f)) for i, f in enumerate(freqs)]
    voices += [(0.7 + i * 0.12, note(f)) for i, f in enumerate(freqs)]
    return render(1.8, voices)


def beeps():
    # Classic digital alarm: two groups of four short beeps.
    def beep(t):
        if t > 0.09:
            return 0.0
        env = min(1.0, t / 0.005, (0.09 - t) / 0.005)
        # Soft square-ish tone: odd harmonics only.
        return env * (sine(2000, t) + 0.3 * sine(6000, t))

    voices = [(g * 0.9 + i * 0.16, beep) for g in range(2) for i in range(4)]
    return render(1.6, voices)


def soft():
    # Gentle rising pad: two slow-swelling notes (A4, then E5).
    def pad(freq):
        return lambda t: min(1.0, t / 0.35) * math.exp(-max(0.0, t - 0.35) * 1.6) * (
            sine(freq, t) + 0.5 * sine(freq * 2, t) + 0.2 * sine(freq * 3, t)
        )

    return render(3.0, [(0.0, pad(440.0)), (0.6, pad(659.25))])


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, fn in [("chime", chime), ("bell", bell), ("marimba", marimba), ("beeps", beeps), ("soft", soft)]:
        write(name, fn())
        print(f"wrote {name}.wav")
