"""Build the site's German MP3s with Piper (Thorsten) and FFmpeg."""

import argparse
import json
from pathlib import Path
import re
import subprocess
import tempfile
import wave

from piper import PiperVoice, SynthesisConfig


ROOT = Path(__file__).resolve().parents[1]
READ_CLIPS = """
const fs = require('node:fs');
const vm = require('node:vm');
const clips = vm.runInNewContext(fs.readFileSync('lessons.js', 'utf8') + `
  const rows = [...basics, ...chapters.flatMap(chapter => chapter.modules)];
  rows.flatMap(lesson => [
    ...lesson.teaching.flatMap(block => block.examples.map(([word, , spoken = word]) => spoken)),
    ...lesson.sections.flatMap(section => section.kind === 'audio'
      ? section.items.map(([, spoken]) => spoken)
      : section.kind === 'dictation' ? section.questions.map(([spoken]) => spoken) : []),
  ]).map(spoken => [audioFile(spoken), spoken]);
`);
process.stdout.write(JSON.stringify(clips));
"""


def speech_text(text):
    letter = re.fullmatch(r"letter-([a-z])", text)
    if letter:
        return letter[1].upper()
    return re.sub(r"\bät\b", "@", text).replace(" → ", ", ").replace(" / ", ", ").replace(" · ", ", ")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("model", type=Path, help="Path to the Piper ONNX model, beside its .onnx.json file")
    parser.add_argument("--force", action="store_true", help="Regenerate existing MP3 files")
    args = parser.parse_args()
    clips = json.loads(subprocess.check_output(["node", "-e", READ_CLIPS], cwd=ROOT, encoding="utf-8"))
    files = {}
    for relative_path, text in clips:
        if relative_path in files and files[relative_path] != text:
            raise ValueError(f"Two clips use {relative_path}: {files[relative_path]!r}, {text!r}")
        files[relative_path] = text

    (ROOT / "audio").mkdir(exist_ok=True)
    voice = PiperVoice.load(args.model)
    config = SynthesisConfig(length_scale=1.08)
    with tempfile.TemporaryDirectory() as scratch:
        wav = Path(scratch) / "voice.wav"
        for relative_path, text in files.items():
            output = ROOT / relative_path
            if output.exists() and not args.force:
                continue
            with wave.open(str(wav), "wb") as recording:
                voice.synthesize_wav(speech_text(text), recording, config)
            subprocess.run(
                ["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-codec:a", "libmp3lame", "-b:a", "48k", str(output)],
                check=True,
            )
    print(f"{len(files)} German audio clips available.")


if __name__ == "__main__":
    main()
