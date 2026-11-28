#!/usr/bin/env python3
"""Озвучивает все кусочки реплик из voice/phrases.json в voice/<id>.mp3.

Нужны: pip install piper-tts, программа ffmpeg и скачанный голос:
    python3 -m piper.download_voices ru_RU-dmitri-medium --data-dir .voices
Запуск из корня проекта:
    python3 tools/make_voice.py --voice ru_RU-dmitri-medium --data-dir .voices
Уже существующие mp3 не перезаписываются (можно положить свои записи с теми же именами).
Чтобы переозвучить всё, добавь --force.
"""
import argparse, json, pathlib, subprocess, sys, tempfile, time, wave

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "voice"


def write_manifest():
    phrases = json.loads((OUT / "phrases.json").read_text(encoding="utf-8"))
    ids = sorted(i for i in phrases if (OUT / f"{i}.mp3").is_file())
    (OUT / "manifest.json").write_text(
        json.dumps({"version": int(time.time()), "ids": ids}), encoding="utf-8")
    print(f"В manifest.json записано {len(ids)} из {len(phrases)} фраз")
    return len(phrases) - len(ids)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", help="имя голоса Piper, например ru_RU-dmitri-medium")
    ap.add_argument("--data-dir", default=".voices", help="папка со скачанным голосом")
    ap.add_argument("--force", action="store_true", help="переозвучить уже готовые")
    ap.add_argument("--manifest-only", action="store_true",
                    help="только обновить список готовых файлов (для своих записей)")
    args = ap.parse_args()
    if args.manifest_only:
        write_manifest()
        return
    if not args.voice:
        ap.error("укажи --voice")
    phrases = json.loads((OUT / "phrases.json").read_text(encoding="utf-8"))
    with tempfile.TemporaryDirectory() as tmp:
        wav = pathlib.Path(tmp) / "a.wav"
        for n, (pid, text) in enumerate(phrases.items(), 1):
            mp3 = OUT / f"{pid}.mp3"
            if mp3.exists() and not args.force:
                continue
            # точка в конце помогает коротким словам звучать законченно
            spoken = text if text[-1] in ".!?:" else text + "."
            subprocess.run(
                [sys.executable, "-m", "piper", "-m", args.voice, "--data-dir", args.data_dir,
                 "-f", str(wav), "--", spoken], check=True)
            subprocess.run(
                ["ffmpeg", "-loglevel", "error", "-y", "-i", str(wav),
                 "-ac", "1", "-ar", "22050", "-b:a", "48k", str(mp3)], check=True)
            if n % 25 == 0:
                print(f"{n}/{len(phrases)}", flush=True)
    if write_manifest():
        sys.exit("Озвучены не все фразы")


if __name__ == "__main__":
    main()
