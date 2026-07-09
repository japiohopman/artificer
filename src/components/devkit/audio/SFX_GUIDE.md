---
name: sfx-elevenlabs
description: Generate sound effects from text prompts via ElevenLabs Sound Effects API. Outputs MP3 files. Use for video SFX, UI sounds, ambient backgrounds, transition effects.
user-invocable: true
allowed-tools: Bash(curl *) Bash(ffmpeg *) Bash(which *) Bash(mkdir *) Bash(date *) Bash(cat *) Bash(wc *) Read Write Glob Grep
content-pipeline:
  - pipeline:audio
  - platform:agnostic
  - role:primitive
---

# SFX — ElevenLabs Sound Effects

Generate sound effects from text descriptions using the ElevenLabs Sound Effects API. Outputs an MP3 file — anything from a UI click to a thunderstorm to a spaceship engine.

## Usage

```
/sfx-elevenlabs "door creaking open in a haunted house" [--duration <seconds>] [--output <path>] [--loop]
/sfx-elevenlabs "gentle rain on a window" --duration 10 --loop
```

- `--duration` — length in seconds (0.5–30). Default: auto-detected from prompt.
- `--output` — output file path. Default: `/tmp/sfx-elevenlabs-<timestamp>.mp3`.
- `--loop` — generate a seamlessly looping sound effect (v2 model only).
- `--influence` — prompt influence (0–1). Higher = stricter adherence to prompt. Default: 0.3.
- `--format` — output format. Default: `mp3_44100_128`. Options: `mp3_44100_128`, `pcm_16000`, `opus_48000_64`.

## Step 1: API Key Check

```bash
if [ -z "$ELEVENLABS_API_KEY" ]; then
  echo "❌ ELEVENLABS_API_KEY not set."
  echo ""
  echo "Get your key at: https://elevenlabs.io/app/settings/api-keys"
  echo "Then set it:     export ELEVENLABS_API_KEY=sk_..."
  echo "Or add to:       ~/.claude/.env"
  exit 1
fi
```

## Step 2: Build Request

```bash
PROMPT="$1"
DURATION="${DURATION:-null}"          # null = auto-detect
INFLUENCE="${INFLUENCE:-0.3}"
LOOP="${LOOP:-false}"
MODEL="eleven_text_to_sound_v2"
FORMAT="${FORMAT:-mp3_44100_128}"
OUTPUT="${OUTPUT_PATH:-/tmp/sfx-elevenlabs-$(date +%s).mp3}"
```

## Step 3: Call the API

```bash
curl -s -X POST "https://api.elevenlabs.io/v1/sound-generation?output_format=${FORMAT}" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(python3 -c "
import json, sys
data = {
    'text': '''$PROMPT''',
    'model_id': '$MODEL',
    'prompt_influence': $INFLUENCE,
    'loop': $LOOP
}
dur = $DURATION
if dur != 'null' and dur is not None:
    data['duration_seconds'] = float(dur)
print(json.dumps(data))
")" \
  --output "$OUTPUT"
```

## Step 4: Verify Output

```bash
if [ ! -f "$OUTPUT" ] || [ "$(wc -c < "$OUTPUT")" -lt 100 ]; then
  echo "❌ Sound effect generation failed. Response:"
  cat "$OUTPUT" 2>/dev/null
  exit 1
fi

DURATION_ACTUAL=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$OUTPUT" 2>/dev/null | cut -d. -f1)
SIZE=$(wc -c < "$OUTPUT" | tr -d ' ')
```

## Step 5: Report

```
✅ Sound effect generated
   Prompt:    <first 80 chars>...
   Model:     eleven_text_to_sound_v2
   Duration:  <N>s
   Loop:      <true|false>
   Influence: <0-1>
   Size:      <N> KB
   Output:    <output path>
   Play:      open <output path>
```

## Test Command

```bash
# Quick test — generates a 2-second click sound
export $(grep ELEVENLABS_API_KEY ~/.claude/.env)
curl -s -X POST "https://api.elevenlabs.io/v1/sound-generation" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "short UI button click", "duration_seconds": 1, "prompt_influence": 0.5}' \
  --output /tmp/sfx-test.mp3 && \
echo "✅ API key works" && open /tmp/sfx-test.mp3
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ELEVENLABS_API_KEY` | yes | — | API key from elevenlabs.io/app/settings/api-keys |

## Constraints

- **Duration**: 0.5–30 seconds per generation
- **Looping**: only supported on v2 model (`eleven_text_to_sound_v2`)
- **Concurrency**: API caps at **4 concurrent requests** — exceeding returns HTTP 429 `rate_limit_error`. When batch-generating, throttle parallel curls (e.g. `while [[ $(jobs -r | wc -l) -ge 4 ]]; do sleep 0.2; done`).
- **Prompt quality matters**: be specific about the sound, its environment, and character

## Prompt Crafting (video SFX)

A good video SFX prompt has three parts: **texture** + **character** + **duration cue**. Vague prompts ("glitch sound") produce generic noise; specific prompts ("short digital glitch stutter, lo-fi corruption, punchy distortion") produce usable hits.

| Pattern | Template | Example |
|---------|----------|---------|
| **Short hit** | `<texture>, <mood>, short and <quality>` | `magical chime burst, rising shimmer, short and energetic` |
| **Whoosh** | `<material> whoosh and <tail>, <feel>, quick` | `card whoosh and soft thump, tactile, quick` |
| **Ambient pad** | `<instrument>, <mood>, <adjective>` | `warm synth pad swell, psychedelic ambient, dreamy` |
| **Tech/UI** | `<action>, <descriptor>, <pacing cue>` | `digital counter ticking up rapidly then stopping with a soft ding` |
| **Glitch/distortion** | `short <type> <motion>, lo-fi <qualifier>, punchy <descriptor>` | `short digital glitch stutter, lo-fi corruption, punchy distortion` |

Avoid: single-word prompts, overly long narrative descriptions, conflicting adjectives (e.g. "soft aggressive"). When a generation sounds wrong, rewrite the prompt — don't tweak `prompt_influence` hoping for a miracle.

## Per-Effect Volume Tuning

When layering multiple SFX in a video, generated loudness varies wildly across prompts even at the same `prompt_influence`. Budget a second pass to tune per-effect volume rather than fighting the generation. Typical tuning range in Remotion `<Audio volume={N} />`:

- Harsh/distorted (glitch, impact): **0.25–0.35**
- Ambient pads, drones: **0.35–0.45**
- Whoosh, clicks, chimes: **0.5–0.6**
- Gentle/watery/organic: **0.65–0.75**

Listen on headphones at moderate volume — what sounds fine on speakers often clips in earbuds.

## Example Prompts

| Category | Prompt | Duration |
|----------|--------|----------|
| **UI** | "short satisfying button click" | 0.5s |
| **Transition** | "cinematic swoosh transition" | 2s |
| **Ambient** | "gentle rain on a window with distant thunder" | 15s |
| **Impact** | "spacious braam suitable for movie trailer" | 5s |
| **Nature** | "birds chirping in a morning forest" | 10s |
| **Tech** | "futuristic computer startup sequence" | 3s |
| **Notification** | "gentle chime notification sound" | 1s |

## Integration with Other Skills

- `generate-video` — SFX for transitions, intros, outros in Remotion videos
- `music-elevenlabs` — combine SFX with background music for full audio design
- `audio-mix` — layer SFX over voice and music tracks

## See Also

- [ElevenLabs Sound Effects API](https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert)
- [ElevenLabs Sound Effects overview](https://elevenlabs.io/docs/overview/capabilities/sound-effects)
