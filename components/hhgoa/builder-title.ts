// Generates a playful "builder class / title" for the HH Goa ID card.
// Deterministic from the user's name + stack so it feels personalized.

const PREFIXES = ["the", "chief", "resident", "renegade", "midnight", "first", "terminal", "sand", "monsoon"]
const NOUNS = [
  "builder",
  "hacker",
  "shipper",
  "dreamer",
  "caffeinator",
  "protocol",
  "synthesizer",
  "engineer",
  "architect",
  "pixel-pusher",
  "CLI-whisperer",
  "glitch-wrangler",
]
const STACK_FLAVOR: Record<string, string[]> = {
  dev: ["who ships at 4am", "who fearlessly refactors", "who git-pushes to main"],
  design: ["who colors outside the grid", "who pixel-perfects everything", "who makes the UI sing"],
  product: ["who ships the whole roadmap", "who eats PMF for breakfast", "who prototypes in the shower"],
  founder: ["who pivots weekly", "who raises on vibes", "who builds in public"],
  ai: ["who prompts like a wizard", "who fine-tunes reality", "who ships agents for fun"],
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

// A short, unique-looking builder serial for the ID card / PFP frame.
// Deterministic from name + stack so the same builder always gets the
// same ID (e.g. "HHG-4F7K-2C9M"). Blocks are a Base32-ish alphabet with
// ambiguous chars (0/O, 1/I) removed so it stays legible on the card.
const ID_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"

export function generateBuilderId(name: string, stack: string): string {
  const seed = hashString(`${name.trim().toLowerCase()}|${stack.trim().toLowerCase()}` || "builder")
  let block1 = ""
  let block2 = ""
  for (let i = 0; i < 4; i++) {
    block1 += ID_ALPHABET[(seed >> (i * 5)) % ID_ALPHABET.length]
    block2 += ID_ALPHABET[((seed >> 13) >> (i * 5)) % ID_ALPHABET.length]
  }
  return `HHG-${block1}-${block2}`
}

export function generateBuilderTitle(name: string, stack: string): string {
  const input = `${name.trim().toLowerCase()}|${stack.trim().toLowerCase()}`
  const seed = hashString(input || "builder")
  const prefix = PREFIXES[seed % PREFIXES.length]
  const noun = NOUNS[(seed >> 3) % NOUNS.length]
  let flavor = ""
  const lower = stack.toLowerCase()
  for (const [key, options] of Object.entries(STACK_FLAVOR)) {
    if (lower.includes(key)) {
      flavor = options[seed % options.length]
      break
    }
  }
  if (!flavor) {
    const generic = ["who locks in", "who ships or ships", "who builds through the night", "who finds the signal"]
    flavor = generic[seed % generic.length]
  }
  return `${prefix} ${noun} ${flavor}`
}

// A short "HHG class" tagline
export function generateClassTag(name: string): string {
  const seed = hashString(name.trim().toLowerCase() || "builder")
  const classes = [
    "GENESIS COHORT",
    "LAUNCH COHORT",
    "TRIANGLE COHORT",
    "BUILD DAY COHORT",
    "MIDNIGHT SHIFT",
    "SAND SURFERS",
    "MONSOON MODE",
    "TERMINAL ONE",
  ]
  return classes[seed % classes.length]
}
