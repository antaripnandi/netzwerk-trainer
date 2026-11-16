# Netzwerk Trainer

Open `index.html` in a browser or serve the folder as a static site.

The German pronunciation clips in `audio/` use the [Thorsten high-quality German voice](https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE/thorsten/high), trained on CC0 recordings. The clips play directly in the browser. When adding or changing lesson audio, use Node.js, FFmpeg, and Python with `piper-tts` installed:

```sh
python scripts/generate_audio.py path/to/de_DE-thorsten-high.onnx
```

Keep the model's `.onnx.json` beside the model. Use `--force` to rebuild existing clips.
